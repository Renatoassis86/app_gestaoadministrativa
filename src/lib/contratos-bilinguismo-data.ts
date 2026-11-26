import { createClient } from '@/lib/supabase/server'
import type { Parceira } from '@/components/contratos/ParceirasCards'

export async function carregarBilingue(): Promise<{ parceiras: Parceira[]; erro?: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_bilingue_escolas').select('*').order('ordem')
  if (error) return { parceiras: [], erro: error.message }
  const ids = (data ?? []).map(r => r.escola_id).filter(Boolean) as string[]
  const { data: arqs } = ids.length
    ? await supabase.from('contratos_arquivos').select('*').in('escola_id', ids).eq('linha', 'bilinguismo').order('created_at', { ascending: false })
    : { data: [] as any[] }
  return {
    parceiras: (data ?? []).map(r => ({
      id: r.id, nome: r.nome, categoria: null, modelo: null, kits: 0, escolaId: r.escola_id,
      arquivos: (arqs ?? []).filter(a => a.escola_id === r.escola_id).map(a => ({ ...a, categoria: a.categoria ?? 'contrato' })),
    })),
  }
}
