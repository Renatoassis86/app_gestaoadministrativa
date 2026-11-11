import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'

const ABAS = [
  { href: '/contratos',             label: 'Visão geral' },
  { href: '/contratos/escolas',     label: 'Escolas' },
  { href: '/contratos/novo',        label: 'Novo contrato' },
  { href: '/contratos/repositorio', label: 'Repositório' },
]

export default function ContratosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="Contratos Education" subtitle="Modelos Boleto e Eskolare · ciclo 2027–2030" />
      <div style={{ padding: '1.25rem 1.75rem 3rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '.75rem' }}>
          {ABAS.map(a => (
            <Link key={a.href} href={a.href}
              style={{ padding: '.4rem .9rem', borderRadius: 9999, fontSize: '.82rem', fontWeight: 600, color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', textDecoration: 'none' }}>
              {a.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </>
  )
}
