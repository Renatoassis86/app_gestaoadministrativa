import { createClient } from '@/lib/supabase/server'
import { ReajustesClient, type LinhaReajuste } from '@/components/contratos/ReajustesClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Reajustes 2027 · Contratos Education' }

export default async function ReajustesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('contratos_reajustes').select('*').order('ordem')
  if (error) {
    return <p style={{ color: '#991b1b', fontSize: '.88rem' }}>
      Não foi possível carregar a tabela: {error.message}. Se a tabela ainda não existe, rode o arquivo <strong>supabase/add_contratos_reajustes.sql</strong> no SQL Editor do Supabase.
    </p>
  }
  return <ReajustesClient linhas={(data ?? []) as LinhaReajuste[]} />
}
