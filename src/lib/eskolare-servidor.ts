import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { CAMPOS, calcularPreenchimento, type StatusFicha } from '@/lib/eskolare-campos'
import { formatarCnpj } from '@/lib/eskolare-validacao'

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
