import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContratoForm } from '@/components/contratos/ContratoForm'
import { AditivosPanel } from '@/components/contratos/AditivosPanel'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Editar contrato · Contratos Education' }

export default async function EditarContrato({ params }: { params: Promise<{ escolaId: string }> }) {
  const { escolaId } = await params
  const supabase = await createClient()

  const { data: escola } = await supabase.from('escolas').select('*').eq('id', escolaId).maybeSingle()
  if (!escola) notFound()
  const { data: contrato } = await supabase.from('contratos').select('*').eq('escola_id', escolaId).maybeSingle()
  const [{ data: series }, { data: aditivos }] = await Promise.all([
    contrato ? supabase.from('contratos_series').select('*').eq('contrato_id', contrato.id).eq('ano_letivo', contrato.ano_letivo_inicial ?? 2027) : Promise.resolve({ data: [] as any[] }),
    supabase.from('contratos_aditivos').select('*').eq('escola_id', escolaId).order('data_assinatura', { ascending: false }),
  ])

  return (
    <>
      <Link href="/contratos/escolas" style={{ fontSize: '.8rem', color: '#0ea5e9', fontWeight: 700 }}>← Voltar para as escolas</Link>
      <p style={{ fontSize: '.9rem', margin: '.6rem 0 1rem' }}>Editando o contrato de <strong>{escola.nome}</strong>.</p>
      <ContratoForm
        modo="editar"
        escolas={[]}
        inicial={{
          escolaId: escola.id,
          escola,
          contrato: contrato ?? {},
          series: (series ?? []).map((s: any) => ({ serie: s.serie, tipo_kit: s.tipo_kit, quantidade: s.quantidade, valor_unitario: s.valor_unitario, curriculo: s.curriculo })),
        }}
      />
      <AditivosPanel escolaId={escola.id} aditivos={aditivos ?? []} />
    </>
  )
}
