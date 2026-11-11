// Sessão pública da escola (cookie httpOnly + hash no banco, expira em 2h sem uso) e dados que a escola pode ver.
import { cookies } from 'next/headers'
import { CAMPOS, calcularPreenchimento, type StatusFicha } from '@/lib/eskolare-campos'
import { hashSessao, SESSAO_HORAS, tokenPlausivel } from '@/lib/eskolare-seguranca'
import { statusEditavelPelaEscola, type Admin } from '@/lib/eskolare-servidor'

export const nomeCookieSessao = (token: string) => `esk_${token.slice(0, 16)}`

// Devolve a ficha só se: token existe, link não revogado e sessão válida (cookie confere com o hash e não expirou).
export async function fichaDaSessao(admin: Admin, token: string) {
  if (!tokenPlausivel(token)) return null
  const { data: f } = await admin.from('eskolare_fichas').select('*').eq('token', token).maybeSingle()
  if (!f || f.link_revogado) return null
  const cookie = (await cookies()).get(nomeCookieSessao(token))?.value
  if (!cookie || !f.sessao_hash || !f.sessao_expira) return null
  if (hashSessao(cookie) !== f.sessao_hash) return null
  if (new Date(f.sessao_expira).getTime() < Date.now()) return null
  return f
}

export async function renovarSessao(admin: Admin, id: string) {
  await admin.from('eskolare_fichas').update({
    sessao_expira: new Date(Date.now() + SESSAO_HORAS * 3600_000).toISOString(),
    ultimo_acesso_em: new Date().toISOString(),
  }).eq('id', id)
}

export interface FichaPublica {
  escolaNome: string
  status: StatusFicha
  somenteLeitura: boolean
  pct: number
  faltando: string[]
  campos: Record<string, { valor: string; situacao: string }>
  logoUrl: string | null
}

// Só campos públicos: nunca expõe responsável comercial, observações, pré-preenchimento ou status interno.
export async function montarFichaPublica(admin: Admin, f: any): Promise<FichaPublica> {
  const campos: Record<string, { valor: string; situacao: string }> = {}
  for (const c of CAMPOS) {
    if (c.interno || c.tipo === 'calculado') continue
    campos[c.chave] = { valor: f.dados?.[c.chave] ?? '', situacao: f.situacao?.[c.chave] ?? 'branco' }
  }
  const { data: e } = await admin.from('escolas').select('nome').eq('id', f.escola_id).maybeSingle()
  let logoUrl: string | null = null
  if (f.dados?.logo) {
    const { data } = await admin.storage.from('eskolare-logos').createSignedUrl(f.dados.logo, 3600)
    logoUrl = data?.signedUrl ?? null
  }
  const calc = calcularPreenchimento(f.dados ?? {})
  return {
    escolaNome: f.dados?.nome_loja || e?.nome || 'sua escola',
    status: f.status, somenteLeitura: !statusEditavelPelaEscola(f.status),
    pct: calc.pct, faltando: calc.faltando, campos, logoUrl,
  }
}
