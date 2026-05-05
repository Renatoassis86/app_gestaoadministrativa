import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header
      className="flex items-center gap-4 px-6 sticky top-0 z-40 bg-white border-b"
      style={{ height: 'var(--topbar-h)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
    >
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <h1 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-blue)' }}>{title}</h1>
          {subtitle && <span style={{ fontSize: '.8rem', color: 'var(--text-s)' }}>{subtitle}</span>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
