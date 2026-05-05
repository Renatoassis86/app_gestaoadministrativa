export default function Page() {
  return (
    <div className="p-6">
      <div className="wip-banner">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
        <span className="wip-tag">Em Desenvolvimento</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '1rem', marginBottom: '.5rem' }}>Relatórios e Downloads</h2>
        <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.95rem' }}>Geração de Excel, PDF e Word.</p>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: '.8rem', marginTop: '.5rem' }}>
          Este módulo está em desenvolvimento e estará disponível em breve.
        </p>
      </div>
    </div>
  )
}
