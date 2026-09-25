import Link from 'next/link'

export default function ObrigadoPedidosPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#F0F2F5', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', maxWidth: 480, boxShadow: '0 10px 30px rgba(0,51,102,.12)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '.5rem' }}>
          Previsão de pedidos enviada!
        </h1>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Obrigado por enviar a previsão de pedidos da sua escola. Nossa equipe vai analisar as quantidades e entrar em contato sobre a separação e o envio do material.
        </p>
        <Link href="/formulario-pedidos" style={{ display: 'inline-block', padding: '.65rem 1.5rem', background: '#0ea5e9', color: '#fff', borderRadius: 8, fontWeight: 600, textDecoration: 'none' }}>
          Enviar outra previsão
        </Link>
        <p style={{ marginTop: '1.5rem', fontSize: '.75rem', color: '#a0aec0' }}>
          Cidade Viva Education © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
