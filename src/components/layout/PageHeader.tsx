import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header style={{
      height: 'var(--topbar-h)',
      background: '#ffffff',
      borderBottom: '1px solid var(--border)',
      boxShadow: '0 1px 3px rgba(15,23,42,.06)',
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0 1.75rem',
      position: 'sticky', top: 0, zIndex: 40,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: '1.2rem', fontWeight: 700,
            color: '#0f172a', lineHeight: 1, letterSpacing: '-.01em',
          }}>
            {title}
          </h1>
          {subtitle && (
            <span style={{
              fontSize: '.78rem', color: 'var(--text-s)',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
          {actions}
        </div>
      )}
    </header>
  )
}
