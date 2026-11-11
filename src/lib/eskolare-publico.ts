'use server'

import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { campoPorChave, calcularPreenchimento } from '@/lib/eskolare-campos'
import { validarValor } from '@/lib/eskolare-validacao'
import { BLOQUEIO_MINUTOS, MAX_TENTATIVAS, SESSAO_HORAS, hashSessao, novaSessao, tokenPlausivel, verificarPin } from '@/lib/eskolare-seguranca'
import { registrarEvento, statusEditavelPelaEscola } from '@/lib/eskolare-servidor'
import { fichaDaSessao, montarFichaPublica, nomeCookieSessao, renovarSessao, type FichaPublica } from '@/lib/eskolare-sessao'

export interface PublicoResultado {
  ok: boolean; error?: string; sessaoExpirada?: boolean
  valor?: string; situacao?: string; pct?: number; ficha?: FichaPublica
}

const LINK_INVALIDO = 'Link inválido ou desativado. Peça um novo link ao seu contato na Cidade Viva Education.'
const SESSAO_EXPIRADA = 'Sua sessão expirou. Entre novamente com o PIN.'

export async function entrarComPin(token: string, pin: string): Promise<PublicoResultado> {
  if (!tokenPlausivel(token)) return { ok: false, error: LINK_INVALIDO }
  const admin = createAdminClient()
  const { data: f } = await admin.from('eskolare_fichas').select('*').eq('token', token).maybeSingle()
  if (!f || f.link_revogado || !f.pin_hash) return { ok: false, error: LINK_INVALIDO }

  if (f.bloqueado_ate && new Date(f.bloqueado_ate).getTime() > Date.now()) {
    const min = Math.ceil((new Date(f.bloqueado_ate).getTime() - Date.now()) / 60000)
    return { ok: false, error: `Muitas tentativas. Tente novamente em ${min} minuto(s).` }
  }

  if (!verificarPin(String(pin).trim(), f.pin_hash)) {
    const tentativas = (f.tentativas ?? 0) + 1
    if (tentativas >= MAX_TENTATIVAS) {
      await admin.from('eskolare_fichas').update({ tentativas: 0, bloqueado_ate: new Date(Date.now() + BLOQUEIO_MINUTOS * 60000).toISOString() }).eq('id', f.id)
      await registrarEvento(admin, f, 'bloqueada', 'escola', { minutos: BLOQUEIO_MINUTOS })
      return { ok: false, error: `PIN incorreto. Acesso bloqueado por ${BLOQUEIO_MINUTOS} minutos.` }
    }
    await admin.from('eskolare_fichas').update({ tentativas }).eq('id', f.id)
    await registrarEvento(admin, f, 'pin_errado', 'escola', { tentativas })
    return { ok: false, error: `PIN incorreto. Restam ${MAX_TENTATIVAS - tentativas} tentativa(s).` }
  }

  const sessao = novaSessao()
  const primeiroAcesso = !f.ultimo_acesso_em
  await admin.from('eskolare_fichas').update({
    tentativas: 0, bloqueado_ate: null, sessao_hash: hashSessao(sessao),
    sessao_expira: new Date(Date.now() + SESSAO_HORAS * 3600_000).toISOString(), ultimo_acesso_em: new Date().toISOString(),
  }).eq('id', f.id)
  const jar = await cookies()
  jar.set(nomeCookieSessao(token), sessao, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/formulario-eskolare', maxAge: SESSAO_HORAS * 3600,
  })
  await registrarEvento(admin, f, 'aberta', 'escola', {}, primeiroAcesso ? { resumo: 'A escola abriu a ficha pela primeira vez.' } : undefined)
  return { ok: true }
}

export async function sairDaFicha(token: string) {
  const jar = await cookies()
  jar.delete({ name: nomeCookieSessao(token), path: '/formulario-eskolare' })
}

// Salva (ou confirma) um campo. O autosave chama isto a cada alteração.
export async function salvarCampoPublico(token: string, chave: string, valor: string, acao: 'salvar' | 'confirmar' = 'salvar'): Promise<PublicoResultado> {
  const admin = createAdminClient()
  const f = await fichaDaSessao(admin, token)
  if (!f) return { ok: false, sessaoExpirada: true, error: SESSAO_EXPIRADA }
  if (!statusEditavelPelaEscola(f.status)) return { ok: false, error: 'Esta ficha já foi enviada e está somente para leitura.' }

  const c = campoPorChave(chave)
  if (!c || c.interno || c.tipo === 'calculado' || c.tipo === 'logo') return { ok: false, error: 'Campo inválido.' }

  const dados = { ...(f.dados ?? {}) }, sit = { ...(f.situacao ?? {}) }
  let novo: string = dados[chave] ?? ''
  if (acao === 'salvar') {
    const r = validarValor(c.tipo, valor, c.opcoes)
    if (r.erro) return { ok: false, error: r.erro }
    novo = r.valor ?? ''
  }
  const pre: string = f.pre?.[chave] ?? ''
  const situacao = acao === 'confirmar' ? 'confirmado'
    : !pre ? (novo ? 'preenchido_escola' : 'branco')
    : novo === pre ? 'confirmado' : 'corrigido'
  dados[chave] = novo; sit[chave] = situacao

  const primeiraResposta = f.status === 'enviada'
  const pct = calcularPreenchimento(dados).pct
  const upd: Record<string, any> = { dados, situacao: sit, pct_preenchido: pct, ultima_resposta_por: 'escola' }
  if (primeiraResposta) upd.status = 'em_preenchimento'
  await admin.from('eskolare_fichas').update(upd).eq('id', f.id)
  await renovarSessao(admin, f.id)
  if (acao === 'salvar' && (f.dados?.[chave] ?? '') !== novo) {
    await registrarEvento(admin, f, 'campo', 'escola', { campo: chave, de: f.dados?.[chave] ?? '', para: novo, situacao })
  }
  if (primeiraResposta) await registrarEvento(admin, f, 'campo', 'escola', {}, { resumo: 'A escola começou a preencher a ficha.' })
  return { ok: true, valor: novo, situacao, pct }
}

export async function enviarLogo(formData: FormData): Promise<PublicoResultado> {
  const token = String(formData.get('token') ?? '')
  const arquivo = formData.get('arquivo') as File | null
  const admin = createAdminClient()
  const f = await fichaDaSessao(admin, token)
  if (!f) return { ok: false, sessaoExpirada: true, error: SESSAO_EXPIRADA }
  if (!statusEditavelPelaEscola(f.status)) return { ok: false, error: 'Esta ficha já foi enviada.' }
  if (!arquivo || arquivo.size === 0) return { ok: false, error: 'Escolha o arquivo PNG.' }
  if (arquivo.size > 5 * 1024 * 1024) return { ok: false, error: 'A logo deve ter até 5 MB.' }
  const bytes = Buffer.from(await arquivo.arrayBuffer())
  const ehPng = bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  if (!ehPng) return { ok: false, error: 'Envie um arquivo PNG.' }

  const path = `${f.id}/logo.png`
  const up = await admin.storage.from('eskolare-logos').upload(path, bytes, { contentType: 'image/png', upsert: true })
  if (up.error) return { ok: false, error: 'Não foi possível enviar a logo. Tente novamente.' }

  const dados = { ...(f.dados ?? {}), logo: path }, sit = { ...(f.situacao ?? {}), logo: 'preenchido_escola' }
  const upd: Record<string, any> = { dados, situacao: sit, pct_preenchido: calcularPreenchimento(dados).pct, ultima_resposta_por: 'escola' }
  if (f.status === 'enviada') upd.status = 'em_preenchimento'
  await admin.from('eskolare_fichas').update(upd).eq('id', f.id)
  await renovarSessao(admin, f.id)
  await registrarEvento(admin, f, 'campo', 'escola', { campo: 'logo' })
  return { ok: true, pct: upd.pct_preenchido, ficha: await montarFichaPublica(admin, { ...f, ...upd }) }
}

export async function enviarRespostas(token: string): Promise<PublicoResultado> {
  const admin = createAdminClient()
  const f = await fichaDaSessao(admin, token)
  if (!f) return { ok: false, sessaoExpirada: true, error: SESSAO_EXPIRADA }
  if (!statusEditavelPelaEscola(f.status)) return { ok: true }
  const calc = calcularPreenchimento(f.dados ?? {})
  if (calc.pct < 100) return { ok: false, error: `Ainda falta preencher: ${calc.faltando.join('; ')}.` }
  await admin.from('eskolare_fichas').update({ status: 'respondida', respondida_em: new Date().toISOString(), ultima_resposta_por: 'escola', pct_preenchido: 100 }).eq('id', f.id)
  await registrarEvento(admin, f, 'respondida', 'escola', {}, { resumo: 'A escola enviou as respostas. Aguardando validação do comercial.' })
  return { ok: true }
}
