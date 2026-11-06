import { SERIES_PEDIDOS, TIPOS_KIT, colunaQtd } from '@/lib/pedidos'

const inputStyle = {
  width: '100%', minWidth: 0, padding: '.45rem .2rem', fontSize: '.9rem', textAlign: 'center' as const,
  border: '1px solid #CBD5E1', borderRadius: 8, outline: 'none', background: '#fff',
}

// Grade série × tipo de kit. Cada célula é um campo `<serie><sufixo>` já no nome da coluna da tabela.
export function QuantidadesKitGrid({ valores }: { valores?: Record<string, any> }) {
  return (
    <div>
      <p style={{ fontSize: '.82rem', color: '#718096', marginBottom: '.75rem', lineHeight: 1.5 }}>
        Informe a quantidade de alunos por série em cada tipo de kit. Use "0" onde não houver pedido.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem .9rem', marginBottom: '1rem' }}>
        {TIPOS_KIT.map(t => (
          <div key={t.id} style={{ fontSize: '.75rem', color: '#475569' }}>
            <strong style={{ color: '#0369a1' }}>{t.label}</strong> — {t.desc}
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 12 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 0 }}>
          <thead>
            <tr style={{ background: '#F0F9FF' }}>
              <th style={{ padding: '.6rem .5rem', whiteSpace: 'nowrap', textAlign: 'left', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#0369a1' }}>Série</th>
              {TIPOS_KIT.map(t => (
                <th key={t.id} style={{ padding: '.55rem .15rem', textAlign: 'center', fontSize: '.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0, whiteSpace: 'nowrap', color: '#0369a1' }}>
                  {t.curto}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SERIES_PEDIDOS.map((s, i) => (
              <tr key={s.id} style={{ borderTop: '1px solid #F1F5F9', background: i % 2 ? '#FAFCFF' : '#fff' }}>
                <td style={{ padding: '.4rem .5rem', fontSize: '.8rem', fontWeight: 600, color: '#2d3748', whiteSpace: 'nowrap' }}>{s.label}</td>
                {TIPOS_KIT.map(t => {
                  const col = colunaQtd(s.id, t)
                  return (
                    <td key={t.id} style={{ padding: '.3rem .2rem' }}>
                      <input
                        name={col} type="number" min={0} inputMode="numeric" required
                        defaultValue={String(valores?.[col] ?? 0)}
                        aria-label={`${s.label} — ${t.label}`}
                        style={inputStyle}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
