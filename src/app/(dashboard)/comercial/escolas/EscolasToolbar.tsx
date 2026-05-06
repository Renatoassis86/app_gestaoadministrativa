'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'

interface Props {
  q: string
  estado: string
  classif: string
  view: string
  page: number
  estados: string[]
}

export function EscolasToolbar({ q: initialQ, estado: initialEstado, classif, view, page, estados }: Props) {
  const router = useRouter()
  const [focusSearch, setFocusSearch] = useState(false)

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams({
      q: initialQ, estado: initialEstado, classif, view,
      page: String(page), ...overrides,
    })
    // limpar params vazios
    params.forEach((v, k) => { if (!v) params.delete(k) })
    return `/comercial/escolas?${params.toString()}`
  }

  return (
    <form
      style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
        padding: '.85rem 1.1rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap',
      }}
    >
      <input type="hidden" name="view" value={view} />
      {classif && <input type="hidden" name="classif" value={classif} />}

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, minWidth: 220, maxWidth: 360 }}>
        <Search size={14} style={{
          position: 'absolute', left: 10, top: '50%',
          transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none',
        }} />
        <input
          name="q"
          defaultValue={initialQ}
          placeholder="Buscar escola, cidade, contato…"
          onFocus={() => setFocusSearch(true)}
          onBlur={() => setFocusSearch(false)}
          style={{
            width: '100%', paddingLeft: 32, paddingRight: 12,
            paddingTop: 8, paddingBottom: 8,
            fontSize: '.82rem',
            border: `1.5px solid ${focusSearch ? '#d97706' : '#e2e8f0'}`,
            borderRadius: 8, outline: 'none', color: '#0f172a',
            background: '#f8fafc',
            fontFamily: 'var(--font-inter,sans-serif)',
            boxShadow: focusSearch ? '0 0 0 3px rgba(217,119,6,.12)' : 'none',
            transition: 'border-color .15s, box-shadow .15s',
          }}
        />
      </div>

      {/* Estado */}
      <select
        name="estado"
        defaultValue={initialEstado}
        style={{
          padding: '8px 12px', fontSize: '.82rem',
          border: '1.5px solid #e2e8f0', borderRadius: 8,
          background: '#f8fafc', color: '#0f172a', outline: 'none',
          fontFamily: 'var(--font-inter,sans-serif)', cursor: 'pointer',
        }}
      >
        <option value="">Todos os estados</option>
        {estados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
      </select>

      <button
        type="submit"
        style={{
          background: '#0f172a', color: '#fff', padding: '8px 16px',
          borderRadius: 8, border: 'none', cursor: 'pointer',
          fontSize: '.82rem', fontWeight: 700,
          fontFamily: 'var(--font-montserrat,sans-serif)',
          transition: 'background .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
        onMouseLeave={e => (e.currentTarget.style.background = '#0f172a')}
      >
        Filtrar
      </button>

      {(initialQ || initialEstado || classif) && (
        <Link href="/comercial/escolas" style={{
          fontSize: '.78rem', color: '#94a3b8', textDecoration: 'none',
          fontFamily: 'var(--font-inter,sans-serif)',
        }}>
          Limpar filtros
        </Link>
      )}

      {/* View toggle */}
      <div style={{
        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 2,
        background: '#f1f5f9', borderRadius: 8, padding: 3,
      }}>
        {[
          { v: 'table', icon: '☰', label: 'Lista' },
          { v: 'grid',  icon: '⊞', label: 'Cards' },
        ].map(t => (
          <Link key={t.v}
            href={buildHref({ view: t.v })}
            title={t.label}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 28, borderRadius: 6,
              fontSize: '.85rem', textDecoration: 'none',
              background: view === t.v ? '#fff' : 'transparent',
              color: view === t.v ? '#0f172a' : '#94a3b8',
              boxShadow: view === t.v ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
              transition: 'all .15s',
            }}
          >
            {t.icon}
          </Link>
        ))}
      </div>
    </form>
  )
}
