'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteRegistro, deletarEscola, deleteNegociacao } from '@/lib/actions'

/* ── Botão de excluir com confirmação ──────────────────────────── */
interface DeleteButtonProps {
  label: string
  confirmText: string
  onDelete: () => Promise<{ success: boolean; error?: string }>
  onSuccess?: () => void
  size?: 'sm' | 'xs'
  variant?: 'danger' | 'ghost'
}

export function DeleteButton({ label, confirmText, onDelete, onSuccess, size = 'sm', variant = 'ghost' }: DeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const router = useRouter()

  const handle = async () => {
    if (!confirm(confirmText)) return
    setLoading(true)
    setError('')
    const result = await onDelete()
    if (!result.success) {
      setError(result.error ?? 'Erro ao excluir')
      setLoading(false)
      return
    }
    if (onSuccess) onSuccess()
    else router.refresh()
    setLoading(false)
  }

  const pad = size === 'xs' ? '4px 10px' : '6px 14px'
  const fnt = size === 'xs' ? '.65rem' : '.72rem'

  return (
    <>
      <button
        onClick={handle}
        disabled={loading}
        title={label}
        style={{
          padding: pad, borderRadius: 8, border: '1.5px solid',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: fnt, fontWeight: 700,
          fontFamily: 'var(--font-montserrat,sans-serif)',
          background: variant === 'danger' ? '#fef2f2' : 'transparent',
          color: '#dc2626', borderColor: '#fca5a5',
          opacity: loading ? .5 : 1,
          transition: 'all .15s',
          display: 'inline-flex', alignItems: 'center', gap: '.3rem',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = variant === 'danger' ? '#fef2f2' : 'transparent'; e.currentTarget.style.color = '#dc2626' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
        {loading ? '...' : label}
      </button>
      {error && <span style={{ fontSize: '.65rem', color: '#dc2626', marginLeft: '.35rem' }}>{error}</span>}
    </>
  )
}

/* ── Botão de editar (link simples) ────────────────────────────── */
interface EditButtonProps {
  href: string
  label?: string
  size?: 'sm' | 'xs'
}

export function EditButton({ href, label = 'Editar', size = 'sm' }: EditButtonProps) {
  const pad = size === 'xs' ? '4px 10px' : '6px 14px'
  const fnt = size === 'xs' ? '.65rem' : '.72rem'
  return (
    <Link href={href} style={{
      padding: pad, borderRadius: 8,
      border: '1.5px solid #e2e8f0', background: '#fff',
      color: '#475569', textDecoration: 'none',
      fontSize: fnt, fontWeight: 700,
      fontFamily: 'var(--font-montserrat,sans-serif)',
      display: 'inline-flex', alignItems: 'center', gap: '.3rem',
      transition: 'all .15s',
    }}
      onMouseEnter={(e: any) => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0f172a' }}
      onMouseLeave={(e: any) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#e2e8f0' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      {label}
    </Link>
  )
}

/* ── Conjunto Editar + Excluir para Registros ──────────────────── */
export function RegistroActions({ id, escolaId }: { id: string; escolaId: string }) {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
      <EditButton href={`/comercial/registros/${id}/editar`} size="xs" />
      <DeleteButton
        label="Excluir"
        size="xs"
        confirmText="Excluir este registro? Esta ação não pode ser desfeita."
        onDelete={() => deleteRegistro(id)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}

/* ── Conjunto Editar + Excluir para Escolas ────────────────────── */
export function EscolaActions({ id }: { id: string }) {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
      <EditButton href={`/comercial/escolas/${id}/editar`} size="xs" />
      <DeleteButton
        label="Inativar"
        size="xs"
        confirmText="Inativar esta escola? Ela ficará oculta nas listagens mas os dados serão preservados."
        onDelete={() => deletarEscola(id)}
        onSuccess={() => router.push('/comercial/escolas')}
      />
    </div>
  )
}

/* ── Conjunto Editar + Excluir para Negociações ─────────────────── */
export function NegociacaoActions({ id }: { id: string }) {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
      <DeleteButton
        label="Excluir"
        size="xs"
        confirmText="Excluir esta negociação? Esta ação não pode ser desfeita."
        onDelete={() => deleteNegociacao(id)}
        onSuccess={() => router.refresh()}
      />
    </div>
  )
}
