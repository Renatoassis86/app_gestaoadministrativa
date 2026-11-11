import { createClient } from '@/lib/supabase/server'
import { ContratoForm } from '@/components/contratos/ContratoForm'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Novo contrato · Contratos Education' }

export default async function NovoContrato() {
  const supabase = await createClient()
  const { data: escolas } = await supabase.from('escolas').select('id, nome, cnpj').order('nome')
  return (
    <>
      <p style={{ fontSize: '.85rem', color: '#64748b', marginBottom: '1rem', maxWidth: 760 }}>
        Escolha uma escola já cadastrada no CRM ou cadastre uma nova. O sistema avisa se o CNPJ já existir.
      </p>
      <ContratoForm modo="novo" escolas={escolas ?? []} inicial={{ escolaId: null, escola: {}, contrato: {}, series: [] }} />
    </>
  )
}
