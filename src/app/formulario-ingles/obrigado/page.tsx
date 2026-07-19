import Link from 'next/link'

export default function ObrigadoBilinguismoPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: 'var(--font-inter, sans-serif)',
    }}>
      <div style={{
        maxWidth: 560,
        width: '100%',
        background: '#fff',
        borderRadius: 24,
        padding: '3rem 2.5rem',
        textAlign: 'center',
        boxShadow: '0 10px 25px rgba(2,132,199,.08)',
        border: '1px solid #e0f2fe',
      }}>
        {/* Check Icon */}
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: '#e0f2fe',
          color: '#0284c7',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          marginBottom: '1.5rem',
        }}>
          ✓
        </div>

        <div style={{
          fontSize: '.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '.1em',
          color: '#0284c7',
          fontFamily: 'var(--font-montserrat, sans-serif)',
          marginBottom: '.5rem',
        }}>
          Proposta Solicitada com Sucesso
        </div>

        <h1 style={{
          fontFamily: 'var(--font-cormorant, serif)',
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#0f172a',
          lineHeight: 1.2,
          marginBottom: '1rem',
        }}>
          Obrigado por iniciar sua parceria com a Cidade Viva Education!
        </h1>

        <p style={{
          color: '#475569',
          fontSize: '.95rem',
          lineHeight: 1.6,
          marginBottom: '2rem',
        }}>
          Recebemos as informações da sua escola com sucesso. Nossa equipe pedagógica e comercial já está analisando sua solicitação do <strong>Programa de Bilinguismo</strong> e entrará em contato em breve para apresentar os próximos passos.
        </p>

        <div style={{
          padding: '1.25rem',
          background: '#f8fafc',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          marginBottom: '2rem',
          textAlign: 'left',
          fontSize: '.83rem',
          color: '#334155',
          lineHeight: 1.5,
        }}>
          <strong style={{ color: '#0f172a', display: 'block', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat, sans-serif)' }}>
            ✦ Próximas etapas:
          </strong>
          1. Envio da minuta contratual para o e-mail cadastrado.<br />
          2. Agendamento da reunião de alinhamento com a coordenação.<br />
          3. Apresentação do cronograma de implantação.
        </div>

        <Link
          href="/formulario-ingles"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.5rem',
            padding: '.75rem 1.75rem',
            borderRadius: 9999,
            background: '#0284c7',
            color: '#fff',
            textDecoration: 'none',
            fontSize: '.875rem',
            fontWeight: 700,
            fontFamily: 'var(--font-montserrat, sans-serif)',
            boxShadow: '0 4px 12px rgba(2,132,199,.25)',
          }}
        >
          ← Voltar ao Formulário
        </Link>
      </div>
    </div>
  )
}
