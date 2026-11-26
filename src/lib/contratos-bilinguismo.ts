'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type R = Promise<{ ok: boolean; error?: string }>
const volta = () => revalidatePath('/contratos/bilinguismo', 'layout')

export async function adicionarBilingue(nome?: string): R {
  const supabase = await createClient()
  const { data: ult } = await supabase.from('contratos_bilingue_escolas').select('ordem').order('ordem', { ascending: false }).limit(1)
  const { error } = await supabase.from('contratos_bilingue_escolas').insert({ nome: nome?.trim() || 'Nova escola', ordem: (ult?.[0]?.ordem ?? 0) + 1 })
  if (error) return { ok: false, error: error.message }
  volta(); return { ok: true }
}

export async function renomearBilingue(id: string, nome: string): R {
  if (!nome.trim()) return { ok: false, error: 'Informe o nome' }
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_bilingue_escolas').update({ nome: nome.trim() }).eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para editar.' }
  volta(); return { ok: true }
}

export async function removerBilingue(id: string): R {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_bilingue_escolas').delete().eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para remover.' }
  volta(); return { ok: true }
}

export async function vincularBilingue(id: string, escolaId: string | null): R {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_bilingue_escolas').update({ escola_id: escolaId || null }).eq('id', id).select('id')
  if (error) return { ok: false, error: error.message }
  if (!data?.length) return { ok: false, error: 'Sem permissão para vincular.' }
  volta(); return { ok: true }
}
