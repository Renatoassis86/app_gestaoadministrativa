'use client'

import { useRouter } from 'next/navigation'

interface Escola { id: string; nome: string; estado?: string | null }

interface EscolaSelectorProps {
  escolas: Escola[]
  escolaId: string
  basePath: string        // ex: '/comercial/jornada-visual'
  placeholder?: string
  extraButton?: React.ReactNode
}

export function EscolaSelector({ escolas, escolaId, basePath, placeholder, extraButton }: EscolaSelectorProps) {
  const router = useRouter()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
      <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-m)', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        Selecionar Escola:
      </label>
      <select
        className="form-control"
        style={{ maxWidth: 420 }}
        value={escolaId}
        onChange={e => {
          if (e.target.value) router.push(`${basePath}?escola=${e.target.value}`)
        }}
      >
        <option value="">{placeholder ?? '— Escolha uma escola —'}</option>
        {escolas.map(e => (
          <option key={e.id} value={e.id}>
            {e.nome}{e.estado ? ` (${e.estado})` : ''}
          </option>
        ))}
      </select>
      {extraButton}
    </div>
  )
}
