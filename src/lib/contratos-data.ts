import { createClient } from '@/lib/supabase/server'
import type { LinhaSerie } from '@/lib/contratos'

export interface ContratoCompleto {
  c: Record<string, any>
  escola: { id: string; nome: string; razao_social: string | null; nome_fantasia: string | null; cnpj: string | null;
            cidade: string | null; estado: string | null; rua: string | null; numero: string | null; bairro: string | null;
            cep: string | null; veterana: boolean | null }
  series: LinhaSerie[]
  aditivos: Array<{ id: string; titulo: string; resumo: string | null; data_assinatura: string | null; assinado: boolean; drive_url: string | null }>
  arquivos: Array<{ id: string; nome: string; path: string; tamanho: number | null; categoria: string; created_at: string }>
}

// Contratos do módulo = os que já têm modelo (boleto/eskolare) definido.
export async function carregarContratos(): Promise<{ itens: ContratoCompleto[]; erro?: string }> {
  const supabase = await createClient()
  const { data: contratos, error } = await supabase.from('contratos').select('*').not('modalidade', 'is', null)
  if (error) return { itens: [], erro: error.message }
  if (!contratos?.length) return { itens: [] }

  const escolaIds = contratos.map(c => c.escola_id)
  const contratoIds = contratos.map(c => c.id)
  const [esc, ser, adi, arq] = await Promise.all([
    supabase.from('escolas').select('id, nome, razao_social, nome_fantasia, cnpj, cidade, estado, rua, numero, bairro, cep, veterana').in('id', escolaIds),
    supabase.from('contratos_series').select('*').in('contrato_id', contratoIds),
    supabase.from('contratos_aditivos').select('*').in('escola_id', escolaIds).order('data_assinatura', { ascending: false }),
    supabase.from('contratos_arquivos').select('id, escola_id, nome, path, tamanho, categoria, created_at').in('escola_id', escolaIds).order('created_at', { ascending: false }),
  ])

  const escolas = new Map((esc.data ?? []).map(e => [e.id, e]))
  const itens: ContratoCompleto[] = []
  for (const c of contratos) {
    const escola = escolas.get(c.escola_id)
    if (!escola) continue
    itens.push({
      c, escola: escola as ContratoCompleto['escola'],
      series: (ser.data ?? []).filter(s => s.contrato_id === c.id) as LinhaSerie[],
      aditivos: (adi.data ?? []).filter(a => a.escola_id === c.escola_id),
      arquivos: (arq.data ?? []).filter(a => a.escola_id === c.escola_id).map(a => ({ ...a, categoria: a.categoria ?? 'contrato' })),
    })
  }
  itens.sort((a, b) => (a.escola.razao_social ?? a.escola.nome).localeCompare(b.escola.razao_social ?? b.escola.nome, 'pt-BR'))
  return { itens }
}
