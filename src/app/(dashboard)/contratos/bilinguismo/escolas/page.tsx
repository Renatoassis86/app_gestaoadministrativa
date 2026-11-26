import { createClient } from '@/lib/supabase/server'
import { ParceirasCards, type Parceira } from '@/components/contratos/ParceirasCards'
import { carregarBilingue } from '@/lib/contratos-bilinguismo-data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Escolas do Bilinguismo · Contratos Education' }

export default async function BilinguismoEscolas() {
  const { parceiras, erro } = await carregarBilingue()
  const supabase = await createClient()
  const { data: todas } = await supabase.from('escolas').select('id, nome, cidade').order('nome')
  if (erro) {
    return <p style={{ color: '#991b1b', fontSize: '.88rem' }}>
      Não foi possível carregar: {erro}. Se é o primeiro acesso, rode <strong>supabase/add_contratos_bilinguismo.sql</strong> no SQL Editor do Supabase.
    </p>
  }
  return <ParceirasCards parceiras={parceiras} opcoes={(todas ?? []) as any} linha="bilinguismo" />
}
