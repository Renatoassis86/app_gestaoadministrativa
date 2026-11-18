import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import { exigirComercial } from '@/lib/eskolare-servidor'
import { PreviaFormularioEskolare } from '@/components/eskolare/PreviaFormularioEskolare'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Formulário da escola (modelo)' }

export default async function FormularioEscolaModelo() {
  const u = await exigirComercial()
  if (!u) return <div style={{ padding: '2rem' }}>Sem permissão para ver esta seção.</div>
  return (
    <>
      <PageHeader title="Formulário da escola" subtitle="Modelo de preenchimento: o layout e as perguntas que a escola vê" />
      <div style={{ padding: '1.25rem 1.75rem 3rem' }}>
        <Link href="/comercial/cadastro-eskolare" style={{ fontSize: '.85rem', color: '#0369a1', fontWeight: 700, textDecoration: 'none' }}>← Voltar para as fichas</Link>
        <div style={{ height: '.9rem' }} />
        <PreviaFormularioEskolare />
      </div>
    </>
  )
}
