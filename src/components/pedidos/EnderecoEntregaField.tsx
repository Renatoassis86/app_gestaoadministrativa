'use client'

import { useState } from 'react'

export function EnderecoEntregaField({ defaultChecked = true, defaultValue = '' }: {
  defaultChecked?: boolean
  defaultValue?: string
}) {
  const [mesmoEndereco, setMesmoEndereco] = useState(defaultChecked)

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', color: '#2d3748', cursor: 'pointer' }}>
        <input
          type="checkbox"
          name="mesmo_endereco_entrega"
          checked={mesmoEndereco}
          onChange={e => setMesmoEndereco(e.target.checked)}
        />
        O material deve ser entregue no mesmo endereço da instituição
      </label>

      {!mesmoEndereco && (
        <div style={{ marginTop: '.75rem' }}>
          <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#4A5568', marginBottom: '.4rem' }}>
            Endereço de entrega do material
          </label>
          <input
            name="endereco_entrega_material"
            type="text"
            required
            defaultValue={defaultValue}
            style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.875rem', border: '1px solid #CBD5E1', borderRadius: 8, outline: 'none' }}
          />
        </div>
      )}
    </div>
  )
}
