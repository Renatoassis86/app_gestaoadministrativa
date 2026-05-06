'use client'

import { ReactNode } from 'react'

/* ── FormPage: wrapper externo da página de formulário ─────────── */
export function FormPage({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: 860, margin: '0 auto' }}>
      {children}
    </div>
  )
}

/* ── FormSection: card de seção ─────────────────────────────────── */
export function FormSection({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: string
  children: ReactNode
}) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 16,
      marginBottom: '1.5rem',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(15,23,42,.06)',
    }}>
      {/* Header da seção */}
      <div style={{
        padding: '1.1rem 1.75rem',
        borderBottom: '1px solid #f1f5f9',
        background: '#fafafa',
        display: 'flex', alignItems: 'center', gap: '.75rem',
      }}>
        {icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #d97706, #b45309)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.95rem',
          }}>
            {icon}
          </div>
        )}
        <div>
          <div style={{
            fontFamily: 'var(--font-montserrat,sans-serif)',
            fontSize: '.82rem', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '.07em',
            color: '#0f172a',
          }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '.72rem', color: '#94a3b8', marginTop: '.1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Corpo da seção */}
      <div style={{ padding: '1.5rem 1.75rem' }}>
        {children}
      </div>
    </div>
  )
}

/* ── FormGrid: grid responsivo de campos ────────────────────────── */
export function FormGrid({ cols = 2, children }: { cols?: 1 | 2 | 3 | 4; children: ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '1.25rem 1.5rem',
    }}>
      {children}
    </div>
  )
}

/* ── FormField: label + input container ─────────────────────────── */
export function FormField({
  label,
  required,
  hint,
  span,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  span?: number
  children: ReactNode
}) {
  return (
    <div style={{ gridColumn: span ? `span ${span}` : undefined }}>
      <label style={{
        display: 'block',
        fontFamily: 'var(--font-montserrat,sans-serif)',
        fontSize: '.72rem', fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '.06em',
        color: '#475569', marginBottom: '.45rem',
      }}>
        {label}
        {required && <span style={{ color: '#d97706', marginLeft: '.2rem' }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.3rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

/* ── inputStyle: estilo padrão para todos inputs ────────────────── */
export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '.65rem .9rem',
  fontSize: '.875rem', fontFamily: 'var(--font-inter,sans-serif)',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#0f172a',
  outline: 'none', transition: 'border-color .15s, box-shadow .15s',
  boxSizing: 'border-box' as const,
}

/* ── FormDivider: linha separadora leve ─────────────────────────── */
export function FormDivider() {
  return <div style={{ height: 1, background: '#f1f5f9', margin: '1.25rem 0' }} />
}

/* ── FormActions: barra de ações no rodapé ──────────────────────── */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1.25rem 1.75rem',
      background: '#f8fafc', border: '1px solid #e2e8f0',
      borderRadius: 16, marginTop: '.25rem',
    }}>
      {children}
    </div>
  )
}
