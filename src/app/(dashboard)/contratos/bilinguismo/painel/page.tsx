import Link from 'next/link'
import { carregarBilingue } from '@/lib/contratos-bilinguismo-data'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Painel do Bilinguismo · Contratos Education' }

function Kpi({ rotulo, valor, sub }: { rotulo: string; valor: string; sub?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.1rem' }}>
      <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b' }}>{rotulo}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '.2rem' }}>{valor}</div>
      {sub && <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: '.15rem' }}>{sub}</div>}
    </div>
  )
}

export default async function PainelBilinguismo() {
  const { parceiras, erro } = await carregarBilingue()
  if (erro) {
    return <p style={{ color: '#991b1b', fontSize: '.88rem' }}>Não foi possível carregar: {erro}. Se é o primeiro acesso, rode <strong>supabase/add_contratos_bilinguismo.sql</strong> no SQL Editor do Supabase.</p>
  }
  const com = parceiras.filter(p => p.arquivos.some(a => a.categoria === 'contrato')).length
  const adit = parceiras.reduce((s, p) => s + p.arquivos.filter(a => a.categoria === 'aditivo').length, 0)
  return (
    <section>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 .2rem' }}>Painel · Contratos Bilinguismo</h2>
      <p style={{ fontSize: '.8rem', color: '#64748b', margin: '0 0 1rem' }}>Contratos assinados e em vigência do modelo de negócio Bilinguismo, separados do Paideia.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '.8rem', marginBottom: '1.2rem' }}>
        <Kpi rotulo="Escolas" valor={String(parceiras.length)} />
        <Kpi rotulo="Com contrato anexado" valor={String(com)} />
        <Kpi rotulo="Sem contrato" valor={String(parceiras.length - com)} />
        <Kpi rotulo="Termos aditivos" valor={String(adit)} />
      </div>
      <Link href="/contratos/bilinguismo/escolas" style={{ display: 'inline-block', padding: '.5rem 1.1rem', borderRadius: 9999, background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: '.82rem', textDecoration: 'none' }}>Abrir cartões das escolas</Link>
    </section>
  )
}
