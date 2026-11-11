import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CAMPOS, calcularPreenchimento, campoPorChave, type StatusFicha } from '@/lib/eskolare-campos'
import { soDigitos, validarValor, formatarCnpj } from '@/lib/eskolare-validacao'

export type Admin = ReturnType<typeof createAdminClient>

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://education.arkosintelligence.com'
export const linkFicha = (token: string) => `${SITE_URL}/formulario-eskolare/${token}`

// Usuário logado do Hub com papel que enxerga o CRM (gerente, supervisor ou consultor).
export async function exigirComercial() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: perfil } = await supabase.from('profiles').select('role, full_name, is_active').eq('id', user.id).maybeSingle()
  if (!perfil || perfil.is_active === false || !['gerente', 'supervisor', 'consultor'].includes(perfil.role)) return null
  return { user, role: perfil.role as string, nome: (perfil.full_name as string | null) ?? '' }
}

export type EventoTipo =
  | 'criada' | 'enviada' | 'aberta' | 'pin_errado' | 'bloqueada' | 'campo' | 'enviada_pela_escola'
  | 'respondida' | 'validada' | 'cadastrada' | 'reaberta' | 'revogada' | 'importada' | 'pin_regenerado'

// Grava o evento na ficha e, quando `crm` é informado, também no histórico de interações da escola (Registros).
export async function registrarEvento(
  admin: Admin,
  ficha: { id: string; escola_id: string; ciclo: number },
  tipo: EventoTipo,
  autor: 'comercial' | 'escola' | 'sistema',
  detalhe: Record<string, unknown> = {},
  crm?: { resumo: string; responsavelId?: string | null },
) {
  await admin.from('eskolare_eventos').insert({ ficha_id: ficha.id, tipo, autor, detalhe })
  if (crm) {
    await admin.from('registros').insert({
      escola_id: ficha.escola_id,
      meio_contato: 'outro',
      resumo: `[Cadastro Eskolare ${ficha.ciclo}] ${crm.resumo}`,
      responsavel_id: crm.responsavelId ?? null,
    })
  }
}

// Pré-preenchimento: junta o que já existe no CRM (escola, contrato Education e previsão de pedidos).
export async function montarPrefill(admin: Admin, escolaId: string, ciclo: number): Promise<Record<string, string>> {
  const out: Record<string, string> = {}
  const por = (chave: string, bruto: unknown) => {
    const c = campoPorChave(chave)
    if (!c || bruto == null || String(bruto).trim() === '') return
    const r = validarValor(c.tipo, bruto, c.opcoes)
    if (r.valor) out[chave] = r.valor            // valores inválidos do CRM são ignorados (a escola preenche)
  }

  const { data: e } = await admin.from('escolas').select('*').eq('id', escolaId).maybeSingle()
  if (!e) return out
  por('cnpj', e.cnpj)
  por('razao_social', e.razao_social ?? e.nome)
  por('nome_loja', e.nome_fantasia ?? e.nome)
  por('cep', e.cep)
  por('rua_numero', [e.rua, e.numero].filter(Boolean).join(', '))
  por('bairro', e.bairro)
  por('cidade_uf', e.cidade && e.estado ? `${String(e.cidade).trim()} / ${e.estado}` : e.cidade)
  por('complemento', e.complemento)
  por('parc_nome', e.contato_nome); por('parc_cargo', e.contato_cargo)
  por('parc_email', e.email); por('parc_whatsapp', e.telefone)
  const mapaEscola: Record<string, string> = {
    al_inf2: 'qtd_infantil2', al_inf3: 'qtd_infantil3', al_inf4: 'qtd_infantil4', al_inf5: 'qtd_infantil5',
    al_ano1: 'qtd_fund1_ano1', al_ano2: 'qtd_fund1_ano2', al_ano3: 'qtd_fund1_ano3', al_ano4: 'qtd_fund1_ano4', al_ano5: 'qtd_fund1_ano5',
  }
  for (const [k, col] of Object.entries(mapaEscola)) if (Number(e[col]) > 0) por(k, e[col])

  // Contrato Education (módulo Contratos)
  const { data: c } = await admin.from('contratos').select('*').eq('escola_id', escolaId).maybeSingle()
  if (c?.modalidade) {
    por('ctr_assinado', c.contrato_assinado ? 'Sim' : c.contrato_enviado ? 'Em assinatura' : null)
    por('ctr_valor', c.valor_total)
    if (c.vigencia_inicio && c.vigencia_fim) por('ctr_vigencia', `${c.vigencia_inicio.split('-').reverse().join('/')} a ${c.vigencia_fim.split('-').reverse().join('/')}`)
    if (!out.parc_nome && c.legal_nome) por('parc_nome', c.legal_nome)
    if (!out.parc_email && c.legal_email) por('parc_email', c.legal_email)
    if (!out.parc_whatsapp && c.legal_telefone) por('parc_whatsapp', c.legal_telefone)
    por('fin_nome', c.financeiro_nome); por('fin_email', c.financeiro_email); por('fin_whatsapp', c.financeiro_telefone)
    por('coord_nome', c.pedagogico_nome); por('coord_email', c.pedagogico_email); por('coord_whatsapp', c.pedagogico_telefone)
    const { data: series } = await admin.from('contratos_series').select('quantidade, ano_letivo').eq('contrato_id', c.id).eq('ano_letivo', c.ano_letivo_inicial ?? ciclo)
    const kits = (series ?? []).reduce((a: number, s: any) => a + (s.quantidade || 0), 0)
    if (kits > 0) por('ctr_kits', kits)
  }

  // Previsão de pedidos enviada pela própria escola (mais recente que o cadastro do CRM)
  const digitos = soDigitos(e.cnpj)
  if (digitos.length === 14) {
    const { data: previsoes } = await admin.from('previsoes_pedidos').select('*').eq('ano_letivo', ciclo).order('created_at', { ascending: false })
    const p = (previsoes ?? []).find((x: any) => x.escola_id === escolaId || soDigitos(x.cnpj) === digitos)
    if (p) {
      const series: Record<string, string> = {
        al_inf2: 'infantil2', al_inf3: 'infantil3', al_inf4: 'infantil4', al_inf5: 'infantil5',
        al_ano1: 'fund1_ano1', al_ano2: 'fund1_ano2', al_ano3: 'fund1_ano3', al_ano4: 'fund1_ano4', al_ano5: 'fund1_ano5',
      }
      for (const [k, s] of Object.entries(series)) {
        const alunos = (p[`${s}_qtd`] || 0) + (p[`${s}_sem_ingles_qtd`] || 0)   // kit completo + sem Inglês = alunos
        if (alunos > 0) out[k] = String(alunos)
      }
      if (!out.rua_numero && p.endereco) por('rua_numero', p.endereco)
      if (!out.parc_nome && p.representante_legal) por('parc_nome', p.representante_legal)
    }
  }
  return out
}

export function situacaoInicial(pre: Record<string, string>): Record<string, string> {
  const s: Record<string, string> = {}
  for (const c of CAMPOS) if (c.tipo !== 'calculado') s[c.chave] = pre[c.chave] ? 'pre' : 'branco'
  return s
}

export const statusEditavelPelaEscola = (s: StatusFicha) => s === 'rascunho' || s === 'enviada' || s === 'em_preenchimento'

export function pctDe(dados: Record<string, any>) {
  return calcularPreenchimento(dados).pct
}

export { formatarCnpj }
