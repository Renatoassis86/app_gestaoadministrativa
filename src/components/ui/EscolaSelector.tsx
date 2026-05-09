'use client'

import { useRouter } from 'next/navigation'

interface Escola {
  id: string
  nome: string
  estado?: string | null
  cidade?: string | null
  origem?: 'crm' | 'lead'
}

interface EscolaSelectorProps {
  escolas: Escola[]
  escolaId: string
  basePath: string
  placeholder?: string
  extraButton?: React.ReactNode
}

export function EscolaSelector({ escolas, escolaId, basePath, placeholder, extraButton }: EscolaSelectorProps) {
  const router = useRouter()

  // Separa CRM e leads do banco para agrupamento visual
  const escolasCRM  = escolas.filter(e => e.origem !== 'lead' || !e.id.startsWith('lead:'))
  const escolasLead = escolas.filter(e => e.origem === 'lead' || e.id.startsWith('lead:'))

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
      <label style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--text-m)', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        Selecionar Escola:
      </label>
      <select
        className="form-control"
        style={{ maxWidth: 480, minWidth: 280 }}
        value={escolaId}
        onChange={e => {
          const val = e.target.value
          if (val) router.push(`${basePath}?escola=${encodeURIComponent(val)}`)
        }}
      >
        <option value="">{placeholder ?? '— Escolha uma escola —'}</option>

        {/* Escolas cadastradas no CRM */}
        {escolasCRM.length > 0 && (
          <optgroup label={`✓ Escolas no CRM (${escolasCRM.length})`}>
            {escolasCRM.map(e => (
              <option key={e.id} value={e.id}>
                {e.nome}{e.cidade ? ` — ${e.cidade}` : ''}{e.estado ? `/${e.estado}` : ''}
              </option>
            ))}
          </optgroup>
        )}

        {/* Leads do banco (não cadastrados formalmente) */}
        {escolasLead.length > 0 && (
          <optgroup label={`◈ Banco de Leads (${escolasLead.length})`}>
            {escolasLead.map(e => (
              <option key={e.id} value={e.id}>
                {e.nome}{e.cidade ? ` — ${e.cidade}` : ''}{e.estado ? `/${e.estado}` : ''}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      {extraButton}
    </div>
  )
}
