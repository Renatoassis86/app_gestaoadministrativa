/**
 * priorizacao.ts — Fila de abordagem comercial (segmentação de escolas).
 *
 * Ordena escolas por porte (quantidade de alunos) — sem score/ranking
 * artificial. Mostra porte, PIB per capita do município (ou da UF quando o
 * município não é encontrado), localização e situação real da jornada
 * comercial (negociação ativa, ou "nunca contatada").
 *
 * Segue as convenções de src/lib/queries.ts: async, nunca lança exceção,
 * cria seu próprio client, loga com console.error('[fn]', ...) em falha.
 */

import { createClient } from '@/lib/supabase/server'
import { PIB_PER_CAPITA_UF } from '@/lib/pib-per-capita-uf'
import pibMunicipioData from '@/lib/data/pib-per-capita-municipio.json'
import type { EscolaResumo, PerfilPedagogico, StageNegociacao } from '@/types/database'
import { STAGE_OPTIONS, PERFIL_OPTIONS, PERFIL_NAO_INFORMADO, CONFESSIONALIDADE_LABEL } from '@/types/database'

function normCidade(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}
const PIB_MUNICIPIO_MAP = new Map<string, number>(
  (pibMunicipioData as { municipio: string; uf: string; pibPerCapita: number }[])
    .map(m => [`${normCidade(m.municipio)}|${m.uf}`, m.pibPerCapita])
)

const STAGE_LABEL: Record<string, string> = Object.fromEntries(STAGE_OPTIONS.map(o => [o.value, o.label]))
const PERFIL_LABEL: Record<string, string> = Object.fromEntries(PERFIL_OPTIONS.map(o => [o.value, o.label]))

// Precedência de estágio para achar a negociação ativa mais avançada de cada escola
// (quando há mais de uma negociação ativa simultânea).
const STAGE_PRECEDENCIA: Record<StageNegociacao, number> = {
  prospeccao: 1, qualificacao: 2, apresentacao: 3, proposta: 4,
  negociacao: 5, fechamento: 6, ganho: 7, perdido: 0,
}

export interface EscolaPriorizada {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  perfil_pedagogico: PerfilPedagogico | null
  total_alunos: number
  pibPerCapita: number | null
  telefone: string | null
  contato_nome: string | null
  ultimo_contato: string | null
  responsavel_nome: string | null
  estagioAtivo: StageNegociacao | null
  estagioLabel: string
  temDadosCiecc: boolean
}

export interface EscolaResumoLite {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  perfil_pedagogico: PerfilPedagogico | null
  ultimo_contato: string | null
  responsavel_nome: string | null
}

export interface FilaPriorizacao {
  filaAbordagem: EscolaPriorizada[]
  filaCompletarCadastro: EscolaResumoLite[]
  clientesAtivos: EscolaResumoLite[]
  resumo: {
    totalFila: number
    acaoUrgente: number
    aguardandoCadastro: number
    clientesAtivos: number
  }
  distribuicaoPorEstado: { estado: string; quantidade: number }[]
  distribuicaoPorPerfil: { perfil: string; label: string; quantidade: number }[]
  distribuicaoPorEstagio: { estagio: string; quantidade: number }[]
  /** Resposta real da pesquisa CIECC (confessionalidade) — eixo distinto de perfil_pedagogico. */
  distribuicaoPorConfessionalidade: { confessionalidade: string; label: string; quantidade: number }[]
}

interface PerfilCiecc {
  confessionalidade: string | null
}

export async function getFilaPriorizacao(): Promise<FilaPriorizacao> {
  const supabase = await createClient()

  const [escolasRes, negociacoesRes, contratosRes, ciecPerfilRes] = await Promise.all([
    supabase.from('escolas_resumo').select('*').eq('ativa', true),
    supabase.from('negociacoes').select('escola_id, stage').eq('ativa', true),
    supabase.from('contratos').select('escola_id, contrato_enviado, contrato_assinado'),
    supabase.from('leads_escola').select('escola_crm_id, leads_perfil_escola(confessionalidade)').not('escola_crm_id', 'is', null),
  ])

  if (escolasRes.error) {
    console.error('[getFilaPriorizacao]', escolasRes.error.message)
    return {
      filaAbordagem: [], filaCompletarCadastro: [], clientesAtivos: [],
      resumo: { totalFila: 0, acaoUrgente: 0, aguardandoCadastro: 0, clientesAtivos: 0 },
      distribuicaoPorEstado: [], distribuicaoPorPerfil: [], distribuicaoPorEstagio: [],
      distribuicaoPorConfessionalidade: [],
    }
  }

  const escolas = (escolasRes.data ?? []) as EscolaResumo[]

  // Perfil da pesquisa CIECC por escola do CRM (quando existe leads_perfil_escola vinculado)
  const perfilCieccPorEscola = new Map<string, PerfilCiecc>()
  for (const le of (ciecPerfilRes.data as any[]) ?? []) {
    const perfil = Array.isArray(le.leads_perfil_escola) ? le.leads_perfil_escola[0] : le.leads_perfil_escola
    if (le.escola_crm_id && perfil) {
      perfilCieccPorEscola.set(le.escola_crm_id, { confessionalidade: perfil.confessionalidade ?? null })
    }
  }

  // Estágio ativo mais avançado por escola
  const estagioPorEscola = new Map<string, StageNegociacao>()
  for (const n of negociacoesRes.data ?? []) {
    const atual = estagioPorEscola.get(n.escola_id)
    if (!atual || STAGE_PRECEDENCIA[n.stage as StageNegociacao] > STAGE_PRECEDENCIA[atual]) {
      estagioPorEscola.set(n.escola_id, n.stage as StageNegociacao)
    }
  }

  // Status de contrato por escola
  const contratoPorEscola = new Map<string, { enviado: boolean; assinado: boolean }>()
  for (const c of contratosRes.data ?? []) {
    contratoPorEscola.set(c.escola_id, { enviado: !!c.contrato_enviado, assinado: !!c.contrato_assinado })
  }

  const pibValor = (cidade: string | null, uf: string | null): number | null => {
    if (cidade && uf) {
      const doMunicipio = PIB_MUNICIPIO_MAP.get(`${normCidade(cidade)}|${uf}`)
      if (doMunicipio) return doMunicipio
    }
    return uf ? PIB_PER_CAPITA_UF[uf] ?? null : null
  }

  // ── Separação: clientes ativos / sem porte cadastrado / elegíveis ──────────
  const clientesAtivos: EscolaResumoLite[] = []
  const filaCompletarCadastro: EscolaResumoLite[] = []
  const elegiveis: EscolaResumo[] = []
  let acaoUrgente = 0

  for (const e of escolas) {
    const contrato = contratoPorEscola.get(e.id)
    const estagio = estagioPorEscola.get(e.id) ?? null
    const jaCliente = !!contrato?.assinado || estagio === 'ganho'

    if (estagio === 'fechamento' || (contrato?.enviado && !contrato?.assinado)) acaoUrgente++

    if (jaCliente) {
      clientesAtivos.push({
        id: e.id, nome: e.nome, cidade: e.cidade, estado: e.estado,
        perfil_pedagogico: e.perfil_pedagogico, ultimo_contato: e.ultimo_contato,
        responsavel_nome: e.responsavel_nome,
      })
      continue
    }

    if (!e.total_alunos || e.total_alunos <= 0) {
      filaCompletarCadastro.push({
        id: e.id, nome: e.nome, cidade: e.cidade, estado: e.estado,
        perfil_pedagogico: e.perfil_pedagogico, ultimo_contato: e.ultimo_contato,
        responsavel_nome: e.responsavel_nome,
      })
      continue
    }

    elegiveis.push(e)
  }

  // ── Fila de abordagem, ordenada por porte (maior para o menor) ────────────
  const filaAbordagem: EscolaPriorizada[] = elegiveis.map(e => {
    const estagio = estagioPorEscola.get(e.id) ?? null
    const perfilCiecc = perfilCieccPorEscola.get(e.id)

    return {
      id: e.id, nome: e.nome, cidade: e.cidade, estado: e.estado,
      perfil_pedagogico: e.perfil_pedagogico,
      total_alunos: e.total_alunos,
      pibPerCapita: pibValor(e.cidade, e.estado),
      telefone: e.telefone ?? null,
      contato_nome: e.contato_nome ?? null,
      ultimo_contato: e.ultimo_contato,
      responsavel_nome: e.responsavel_nome,
      estagioAtivo: estagio,
      estagioLabel: estagio
        ? STAGE_LABEL[estagio]
        : (e.classificacao_atual ? `Classificado: ${e.classificacao_atual}` : 'Nunca contatada'),
      temDadosCiecc: !!perfilCiecc,
    }
  }).sort((a, b) => b.total_alunos - a.total_alunos)

  // ── Distribuições para o painel analítico ──────────────────────────────────
  const porEstadoMap = new Map<string, number>()
  const porPerfilMap = new Map<string, number>()
  for (const e of escolas) {
    const uf = e.estado ?? 'Sem estado'
    porEstadoMap.set(uf, (porEstadoMap.get(uf) ?? 0) + 1)
    const perfilKey = e.perfil_pedagogico ?? PERFIL_NAO_INFORMADO
    porPerfilMap.set(perfilKey, (porPerfilMap.get(perfilKey) ?? 0) + 1)
  }
  const distribuicaoPorEstado = [...porEstadoMap.entries()]
    .map(([estado, quantidade]) => ({ estado, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)

  const distribuicaoPorPerfil = [...porPerfilMap.entries()]
    .map(([perfil, quantidade]) => ({ perfil, label: PERFIL_LABEL[perfil] ?? perfil, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  // Confessionalidade real da pesquisa CIECC (eixo distinto de perfil_pedagogico) —
  // só contabiliza escolas com resposta vinculada via leads_perfil_escola.
  const porConfessionalidadeMap = new Map<string, number>()
  for (const e of escolas) {
    const confessionalidade = perfilCieccPorEscola.get(e.id)?.confessionalidade
    if (confessionalidade) {
      porConfessionalidadeMap.set(confessionalidade, (porConfessionalidadeMap.get(confessionalidade) ?? 0) + 1)
    }
  }
  const distribuicaoPorConfessionalidade = [...porConfessionalidadeMap.entries()]
    .map(([confessionalidade, quantidade]) => ({
      confessionalidade, label: CONFESSIONALIDADE_LABEL[confessionalidade] ?? confessionalidade, quantidade,
    }))
    .sort((a, b) => b.quantidade - a.quantidade)

  const porEstagioMap = new Map<string, number>()
  for (const e of escolas) {
    const estagio = estagioPorEscola.get(e.id)
    const label = estagio ? STAGE_LABEL[estagio] : 'Sem negociação ativa'
    porEstagioMap.set(label, (porEstagioMap.get(label) ?? 0) + 1)
  }
  const distribuicaoPorEstagio = [...porEstagioMap.entries()]
    .map(([estagio, quantidade]) => ({ estagio, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  return {
    filaAbordagem,
    filaCompletarCadastro,
    clientesAtivos,
    resumo: {
      totalFila: filaAbordagem.length,
      acaoUrgente,
      aguardandoCadastro: filaCompletarCadastro.length,
      clientesAtivos: clientesAtivos.length,
    },
    distribuicaoPorEstado,
    distribuicaoPorPerfil,
    distribuicaoPorEstagio,
    distribuicaoPorConfessionalidade,
  }
}
