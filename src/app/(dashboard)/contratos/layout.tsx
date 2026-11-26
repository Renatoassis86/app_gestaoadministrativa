import PageHeader from '@/components/layout/PageHeader'
import { ContratosNav } from '@/components/contratos/ContratosNav'
import { MODULO_CONTRATOS as M } from '@/lib/contratos-modulo'

export default function ContratosLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title={M.nome} subtitle={M.deck} />
      <div style={{ padding: '1.25rem 1.75rem 3rem' }}>
        <p style={{ fontSize: '.84rem', color: '#475569', maxWidth: 820, margin: '0 0 1rem' }}><strong>Sobre esta área.</strong> {M.descricao}</p>
        <ContratosNav />
        {children}
      </div>
    </>
  )
}
