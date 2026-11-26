'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MODULO_CONTRATOS } from '@/lib/contratos-modulo'

export function ContratosNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Páginas do módulo" style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '.75rem' }}>
      {MODULO_CONTRATOS.paginas.map(p => {
        const ativa = pathname === p.href || pathname.startsWith(p.href + '/')
        const off = p.status !== 'disponível'
        return (
          <Link key={p.href} href={p.href} aria-current={ativa ? 'page' : undefined}
            style={{ padding: '.4rem .9rem', borderRadius: 9999, fontSize: '.82rem', fontWeight: 600, textDecoration: 'none',
              color: ativa ? '#fff' : off ? '#64748b' : '#0369a1', background: ativa ? '#0ea5e9' : off ? '#f8fafc' : '#f0f9ff',
              border: `1px solid ${ativa ? '#0ea5e9' : off ? '#e2e8f0' : '#bae6fd'}` }}>
            {p.nome}
          </Link>
        )
      })}
    </nav>
  )
}
