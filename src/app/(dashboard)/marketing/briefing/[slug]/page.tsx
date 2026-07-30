import { notFound } from 'next/navigation'
import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import { getFormularioBriefing } from '@/lib/marketing-briefings'
import { FormularioBriefing } from '@/components/marketing/FormularioBriefing'

export default async function BriefingFormularioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const config = getFormularioBriefing(slug)
  if (!config) notFound()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader title={config.titulo} subtitle={`Destinado a: ${config.destinatario}`} />

      <div style={{ padding: '2rem 2.5rem', maxWidth: 880, margin: '0 auto' }}>
        <Link href="/marketing" style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.78rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Voltar para Gestão de Marketing
        </Link>

        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16,
          padding: '1.5rem 1.75rem', marginBottom: '1.75rem',
        }}>
          <div style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#d97706', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            ✦ Destinado a: {config.destinatario}
          </div>
          <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.65)', lineHeight: 1.7, fontFamily: 'var(--font-inter,sans-serif)' }}>
            {config.descricaoDestinatario}
          </p>
          <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.4)', marginTop: '.75rem' }}>
            ⏱ Tempo estimado: {config.tempoEstimado} · {config.perguntas.length} perguntas · Onde não houver decisão fechada, escreva "ainda não decidido" ou "precisa ser validado".
          </div>
        </div>

        <FormularioBriefing config={config} />
      </div>
    </div>
  )
}
