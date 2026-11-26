'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const CAMPOS_TEXTO = ['categoria', 'modelo', 'escola', 'valor_kit', 'reaj_infantil', 'reaj_1ano', 'reaj_incompleto', 'valor_contrato', 'valor_parcela',
  'vencimento', 'adesao_1ano', 'adesao_2ano', 'adesao_3ano', 'adesao_4ano', 'adesao_5ano', 'parcelamentos', 'data_primeira_parcela', 'email_aditivo', 'aditivo_enviado', 'observacoes'] as const
const CAMPOS_NUM = ['inf2', 'inf3', 'inf4', 'inf5'] as const

export async function salvarCampoReajuste(id: string, campo: string, valor: string | null): Promise<{ ok: boolean; error?: string }> {
  const ehNum = (CAMPOS_NUM as readonly string[]).includes(campo)
  if (!ehNum && !(CAMPOS_TEXTO as readonly string[]).includes(campo)) return { ok: false, error: 'Campo inválido' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sessão expirada. Entre novamente.' }
  let v: string | number | null = valor?.trim() ? valor.trim() : null
  if (ehNum && v !== null) { const n = Math.round(Number(v)); if (!Number.isFinite(n) || n < 0) return { ok: false, error: 'Informe um número' }; v = n }
  if (campo === 'escola' && v === null) return { ok: false, error: 'A escola não pode ficar em branco' }
  const { data, error } = await supabase.from('contratos_reajustes').update({ [campo]: v, updated_at: new Date().toISOString() }).eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para editar esta tabela (o banco não gravou a alteração).' }
  return { ok: true }
}

export async function adicionarReajuste(nome?: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: ult } = await supabase.from('contratos_reajustes').select('ordem').order('ordem', { ascending: false }).limit(1)
  const { error } = await supabase.from('contratos_reajustes').insert({ escola: nome?.trim() || 'Nova escola', ordem: (ult?.[0]?.ordem ?? 0) + 1 })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/contratos/reajustes'); revalidatePath('/contratos/escolas')
  return { ok: true }
}

export async function removerReajuste(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_reajustes').delete().eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para remover (o banco não apagou a linha).' }
  revalidatePath('/contratos/reajustes'); revalidatePath('/contratos/escolas')
  return { ok: true }
}

export async function vincularEscolaReajuste(id: string, escolaId: string | null): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_reajustes').update({ escola_id: escolaId || null }).eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para vincular.' }
  revalidatePath('/contratos/escolas')
  return { ok: true }
}

type R = Promise<{ ok: boolean; error?: string }>
const TIPOS = ['texto', 'numero', 'data', 'lista']

export async function adicionarColunaReajuste(rotulo: string, tipo: string, opcoes: string[]): R {
  if (!rotulo.trim()) return { ok: false, error: 'Informe o nome da coluna' }
  if (!TIPOS.includes(tipo)) return { ok: false, error: 'Tipo inválido' }
  const supabase = await createClient()
  const { data: ult } = await supabase.from('contratos_reajustes_colunas').select('ordem').order('ordem', { ascending: false }).limit(1)
  const { error } = await supabase.from('contratos_reajustes_colunas').insert({
    rotulo: rotulo.trim(), tipo, opcoes: tipo === 'lista' ? opcoes.map(o => o.trim()).filter(Boolean) : [], ordem: (ult?.[0]?.ordem ?? 0) + 1,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/contratos/reajustes')
  return { ok: true }
}

export async function editarColunaReajuste(id: string, rotulo: string, opcoes: string[] | null): R {
  if (!rotulo.trim()) return { ok: false, error: 'Informe o nome da coluna' }
  const supabase = await createClient()
  const upd: Record<string, unknown> = { rotulo: rotulo.trim() }
  if (opcoes) upd.opcoes = opcoes.map(o => o.trim()).filter(Boolean)
  const { data, error } = await supabase.from('contratos_reajustes_colunas').update(upd).eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para editar a coluna.' }
  revalidatePath('/contratos/reajustes')
  return { ok: true }
}

export async function removerColunaReajuste(id: string): R {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_reajustes_colunas').delete().eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para remover a coluna.' }
  revalidatePath('/contratos/reajustes')
  return { ok: true }
}

export async function salvarExtraReajuste(id: string, colunaId: string, valor: string | null): R {
  const supabase = await createClient()
  const { data: atual, error: e1 } = await supabase.from('contratos_reajustes').select('extras').eq('id', id).single()
  if (e1) return { ok: false, error: e1.message }
  const extras = { ...((atual?.extras as Record<string, string>) ?? {}) }
  if (valor && valor.trim()) extras[colunaId] = valor.trim(); else delete extras[colunaId]
  const { data, error } = await supabase.from('contratos_reajustes').update({ extras, updated_at: new Date().toISOString() }).eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para editar esta tabela (o banco não gravou a alteração).' }
  return { ok: true }
}
