/**
 * priorizacao.ts — Motor de priorização comercial (segmentação de escolas).
 *
 * Combina potencial financeiro, afinidade de perfil pedagógico, PIB per capita
 * da UF, estágio no funil/prontidão e recência do último contato num score
 * único (0–100), e deriva uma prescrição de ação por escola.
 *
 * Segue as convenções de src/lib/queries.ts: async, nunca lança exceção,
 * cria seu próprio client, loga com console.error('[fn]', ...) em falha.
 */

import { createClient } from '@/lib/supabase/server'
import { PIB_PER_CAPITA_UF } from '@/lib/pib-per-capita-uf'
import pibMunicipioData from '@/lib/data/pib-per-capita-municipio.json'
import type { EscolaResumo, PerfilPedagogico, StageNegociacao } from '@/types/database'
import { STAGE_OPTIONS, PERFIL_OPTIONS } from '@/types/database'

function normCidade(s: string | null | undefined): string {
  return (s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
}
const PIB_MUNICIPIO_MAP = new Map<string, number>(
  (pibMunicipioData as { municipio: string; uf: string; pibPerCapita: number }[])
    .map(m => [`${normCidade(m.municipio)}|${m.uf}`, m.pibPerCapita])
)

const STAGE_LABEL: Record<string, string> = Object.fromEntries(STAGE_OPTIONS.map(o => [o.value, o.label]))
const PERFIL_LABEL: Record<string, string> = Object.fromEntries(PERFIL_OPTIONS.map(o => [o.value, o.label]))

// ─── Pesos e tabelas de pontuação ──────────────────────────────────────────

const PESOS = {
  potencial: 0.30,
  perfil: 0.15,
  pib: 0.15,
  prontidao: 0.20,
  recencia: 0.10,
  financeiroComercial: 0.10,
}

const PERFIL_SCORE: Record<PerfilPedagogico, number> = {
  crista_classica: 100,
  por_principio: 100,
  evangelica: 75,
  crista_catolica: 75,
  convencional: 40,
  outro: 40,
}

const STAGE_SCORE: Record<StageNegociacao, number> = {
  prospeccao: 20,
  qualificacao: 35,
  apresentacao: 50,
  proposta: 65,
  negociacao: 80,
  fechamento: 100,
  ganho: 100,
  perdido: 10,
}

export type Prescricao =
  | 'acelerar_fechamento'
  | 'prospeccao_fria_prioritaria'
  | 'dar_continuidade'
  | 'abordar_agora'
  | 'reavaliar_pausar'
  | 'monitorar'

export const PRESCRICAO_LABEL: Record<Prescricao, string> = {
  acelerar_fechamento: 'Acelerar fechamento',
  prospeccao_fria_prioritaria: 'Prospecção fria prioritária',
  dar_continuidade: 'Dar continuidade',
  abordar_agora: 'Abordar agora',
  reavaliar_pausar: 'Reavaliar / pausar',
  monitorar: 'Monitorar',
}

export const PRESCRICAO_COR: Record<Prescricao, { bg: string; text: string; border: string }> = {
  acelerar_fechamento:          { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' },
  prospeccao_fria_prioritaria:  { bg: '#eff6ff', text: '#2563eb', border: '#93c5fd' },
  dar_continuidade:             { bg: '#f0fdf4', text: '#16a34a', border: '#86efac' },
  abordar_agora:                { bg: '#fffbeb', text: '#d97706', border: '#fcd34d' },
  reavaliar_pausar:             { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
  monitorar:                    { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' },
}

export interface EscolaPriorizada {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  perfil_pedagogico: PerfilPedagogico
  potencial_financeiro: number
  total_alunos: number
  ultimo_contato: string | null
  responsavel_nome: string | null
  estagioAtivo: StageNegociacao | null
  estagioLabel: string
  score: number
  prescricao: Prescricao
  temDadosCiecc: boolean
}

export interface EscolaResumoLite {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  perfil_pedagogico: PerfilPedagogico
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
}

function diasDesde(dataIso: string | null): number | null {
  if (!dataIso) return null
  const ms = Date.now() - new Date(dataIso).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function scoreRecencia(dataIso: string | null): number {
  const dias = diasDesde(dataIso)
  if (dias === null) return 40
  if (dias <= 7) return 100
  if (dias <= 15) return 80
  if (dias <= 30) return 60
  if (dias <= 60) return 40
  if (dias <= 90) return 20
  return 5
}

/** Percentil (0–100) de `value` dentro de `todos` — quanto maior o valor, maior o percentil. */
function percentil(value: number, todos: number[]): number {
  if (todos.length === 0) return 50
  const abaixoOuIgual = todos.filter(v => v <= value).length
  return Math.round((abaixoOuIgual / todos.length) * 100)
}

// ─── Sinais da pesquisa CIECC (leads_perfil_escola) ────────────────────────
// Insatisfação com o sistema atual = oportunidade de troca → pontua alto.

const CSI_SCORE: Record<string, number> = {
  'muito insatisfeito': 90, 'insatisfeito': 70, 'neutro': 50,
  'satisfeito': 25, 'muito satisfeito': 10,
}

function scoreCsi(csi: string | null): number | null {
  if (!csi) return null
  return CSI_SCORE[csi.toLowerCase().trim()] ?? null
}

function scoreNps(nps: number | null): number | null {
  if (nps === null || nps === undefined) return null
  return Math.round((10 - nps) * 10) // NPS baixo no sistema atual = maior oportunidade
}

function scoreInvestimento(v: string | null): number | null {
  if (!v) return null
  const s = v.toLowerCase()
  if (s.includes('prefiro não') || s.includes('não sei')) return null
  if (s.includes('mais de')) return 90
  const m = s.match(/(\d[\d.]*)/)
  if (m) {
    const n = parseInt(m[1].replace(/\./g, ''), 10)
    if (n <= 300) return 20
    if (n <= 700) return 50
    return 70
  }
  return null
}

interface PerfilCiecc {
  csi: string | null
  nps: number | null
  investimentoAtual: string | null
}

/** Combina os sinais disponíveis da pesquisa CIECC num único score 0–100 (null = sem dado). */
function scoreFinanceiroComercial(perfil: PerfilCiecc | undefined): number {
  if (!perfil) return 50
  const partes = [scoreCsi(perfil.csi), scoreNps(perfil.nps), scoreInvestimento(perfil.investimentoAtual)]
    .filter((v): v is number => v !== null)
  if (partes.length === 0) return 50
  return Math.round(partes.reduce((a, b) => a + b, 0) / partes.length)
}

export async function getFilaPriorizacao(): Promise<FilaPriorizacao> {
  const supabase = await createClient()

  const [escolasRes, negociacoesRes, contratosRes, registrosRes, ciecPerfilRes] = await Promise.all([
    supabase.from('escolas_resumo').select('*').eq('ativa', true),
    supabase.from('negociacoes').select('escola_id, stage').eq('ativa', true),
    supabase.from('contratos').select('escola_id, contrato_enviado, contrato_assinado'),
    supabase.from('registros').select('escola_id').eq('ativa', true),
    supabase.from('leads_escola').select('escola_crm_id, leads_perfil_escola(csi, nps, investimento_atual)').not('escola_crm_id', 'is', null),
  ])

  if (escolasRes.error) {
    console.error('[getFilaPriorizacao]', escolasRes.error.message)
    return {
      filaAbordagem: [], filaCompletarCadastro: [], clientesAtivos: [],
      resumo: { totalFila: 0, acaoUrgente: 0, aguardandoCadastro: 0, clientesAtivos: 0 },
      distribuicaoPorEstado: [], distribuicaoPorPerfil: [], distribuicaoPorEstagio: [],
    }
  }

  const escolas = (escolasRes.data ?? []) as EscolaResumo[]

  // Perfil da pesquisa CIECC por escola do CRM (quando existe leads_perfil_escola vinculado)
  const perfilCieccPorEscola = new Map<string, PerfilCiecc>()
  for (const le of (ciecPerfilRes.data as any[]) ?? []) {
    const perfil = Array.isArray(le.leads_perfil_escola) ? le.leads_perfil_escola[0] : le.leads_perfil_escola
    if (le.escola_crm_id && perfil) {
      perfilCieccPorEscola.set(le.escola_crm_id, {
        csi: perfil.csi ?? null, nps: perfil.nps ?? null, investimentoAtual: perfil.investimento_atual ?? null,
      })
    }
  }

  // Estágio ativo mais avançado por escola
  const stageOrdem = STAGE_SCORE
  const estagioPorEscola = new Map<string, StageNegociacao>()
  for (const n of negociacoesRes.data ?? []) {
    const atual = estagioPorEscola.get(n.escola_id)
    if (!atual || stageOrdem[n.stage as StageNegociacao] > stageOrdem[atual]) {
      estagioPorEscola.set(n.escola_id, n.stage as StageNegociacao)
    }
  }

  // Status de contrato por escola
  const contratoPorEscola = new Map<string, { enviado: boolean; assinado: boolean }>()
  for (const c of contratosRes.data ?? []) {
    contratoPorEscola.set(c.escola_id, { enviado: !!c.contrato_enviado, assinado: !!c.contrato_assinado })
  }

  // Contagem de registros por escola
  const registrosPorEscola = new Map<string, number>()
  for (const r of registrosRes.data ?? []) {
    registrosPorEscola.set(r.escola_id, (registrosPorEscola.get(r.escola_id) ?? 0) + 1)
  }

  // ── Separação prévia: clientes ativos / sem dado de potencial / elegíveis ──
  const clientesAtivos: EscolaResumoLite[] = []
  const filaCompletarCadastro: EscolaResumoLite[] = []
  const elegiveis: EscolaResumo[] = []

  for (const e of escolas) {
    const contrato = contratoPorEscola.get(e.id)
    const estagio = estagioPorEscola.get(e.id) ?? null
    const jaCliente = !!contrato?.assinado || estagio === 'ganho'

    if (jaCliente) {
      clientesAtivos.push({
        id: e.id, nome: e.nome, cidade: e.cidade, estado: e.estado,
        perfil_pedagogico: e.perfil_pedagogico, ultimo_contato: e.ultimo_contato,
        responsavel_nome: e.responsavel_nome,
      })
      continue
    }

    if (!e.potencial_financeiro || e.potencial_financeiro <= 0) {
      filaCompletarCadastro.push({
        id: e.id, nome: e.nome, cidade: e.cidade, estado: e.estado,
        perfil_pedagogico: e.perfil_pedagogico, ultimo_contato: e.ultimo_contato,
        responsavel_nome: e.responsavel_nome,
      })
      continue
    }

    elegiveis.push(e)
  }

  // ── Normalizações (percentil dentro do conjunto elegível) ─────────────────
  const potenciais = elegiveis.map(e => e.potencial_financeiro)

  const pibValor = (cidade: string | null, uf: string | null): number | null => {
    if (cidade && uf) {
      const doMunicipio = PIB_MUNICIPIO_MAP.get(`${normCidade(cidade)}|${uf}`)
      if (doMunicipio) return doMunicipio
    }
    return uf ? PIB_PER_CAPITA_UF[uf] ?? null : null
  }
  const pibsPresentesMunicipioOuUf = elegiveis
    .map(e => pibValor(e.cidade, e.estado))
    .filter((v): v is number => v !== null)

  const scorePib = (cidade: string | null, uf: string | null): number => {
    const valor = pibValor(cidade, uf)
    if (valor === null) return 50
    return percentil(valor, pibsPresentesMunicipioOuUf)
  }

  // ── Score + prescrição por escola elegível ─────────────────────────────────
  const filaAbordagem: EscolaPriorizada[] = elegiveis.map(e => {
    const contrato = contratoPorEscola.get(e.id)
    const estagio = estagioPorEscola.get(e.id) ?? null
    const qtdRegistros = registrosPorEscola.get(e.id) ?? 0

    const perfilCiecc = perfilCieccPorEscola.get(e.id)

    const potencialScore = percentil(e.potencial_financeiro, potenciais)
    const perfilScore = PERFIL_SCORE[e.perfil_pedagogico] ?? 40
    const pibScore = scorePib(e.cidade, e.estado)
    const prontidaoScore = estagio ? STAGE_SCORE[estagio] : (e.probabilidade_atual ?? 0)
    const recenciaScore = scoreRecencia(e.ultimo_contato)
    const financeiroComercialScore = scoreFinanceiroComercial(perfilCiecc)

    const score = Math.round(
      potencialScore * PESOS.potencial +
      perfilScore * PESOS.perfil +
      pibScore * PESOS.pib +
      prontidaoScore * PESOS.prontidao +
      recenciaScore * PESOS.recencia +
      financeiroComercialScore * PESOS.financeiroComercial
    )

    const dias = diasDesde(e.ultimo_contato)
    const scoreAlto = score >= 65 // aproximação do quartil superior (score 0-100, pesos somam já normalizados)

    let prescricao: Prescricao = 'monitorar'
    if (estagio === 'fechamento' || (contrato?.enviado && !contrato?.assinado)) {
      prescricao = 'acelerar_fechamento'
    } else if (!e.ultimo_contato && scoreAlto) {
      prescricao = 'prospeccao_fria_prioritaria'
    } else if (estagio && scoreAlto) {
      prescricao = 'dar_continuidade'
    } else if (scoreAlto && dias !== null && dias > 30) {
      prescricao = 'abordar_agora'
    } else if (qtdRegistros >= 3 && !estagio) {
      prescricao = 'reavaliar_pausar'
    }

    return {
      id: e.id, nome: e.nome, cidade: e.cidade, estado: e.estado,
      perfil_pedagogico: e.perfil_pedagogico,
      potencial_financeiro: e.potencial_financeiro,
      total_alunos: e.total_alunos,
      ultimo_contato: e.ultimo_contato,
      responsavel_nome: e.responsavel_nome,
      estagioAtivo: estagio,
      estagioLabel: estagio
        ? STAGE_LABEL[estagio]
        : (e.classificacao_atual ? `Classificado: ${e.classificacao_atual}` : 'Nunca contatada'),
      score,
      prescricao,
      temDadosCiecc: !!perfilCiecc,
    }
  }).sort((a, b) => b.score - a.score)

  // ── Distribuições para o painel analítico ──────────────────────────────────
  const porEstadoMap = new Map<string, number>()
  const porPerfilMap = new Map<string, number>()
  for (const e of escolas) {
    const uf = e.estado ?? 'Sem estado'
    porEstadoMap.set(uf, (porEstadoMap.get(uf) ?? 0) + 1)
    porPerfilMap.set(e.perfil_pedagogico, (porPerfilMap.get(e.perfil_pedagogico) ?? 0) + 1)
  }
  const distribuicaoPorEstado = [...porEstadoMap.entries()]
    .map(([estado, quantidade]) => ({ estado, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10)

  const distribuicaoPorPerfil = [...porPerfilMap.entries()]
    .map(([perfil, quantidade]) => ({ perfil, label: PERFIL_LABEL[perfil] ?? perfil, quantidade }))
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
      acaoUrgente: filaAbordagem.filter(e => e.prescricao === 'acelerar_fechamento').length,
      aguardandoCadastro: filaCompletarCadastro.length,
      clientesAtivos: clientesAtivos.length,
    },
    distribuicaoPorEstado,
    distribuicaoPorPerfil,
    distribuicaoPorEstagio,
  }
}
