import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import { FORMULARIOS_BRIEFING } from '@/lib/marketing-briefings'

export default async function GestaoMarketingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  const isGerente = profile?.role === 'gerente'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader
        title="Gestão de Marketing"
        subtitle="Briefing estratégico para construção do planejamento de marketing"
      />

      <div style={{ padding: '2rem 2.5rem' }}>
        {/* ── Explicação ─────────────────────────────────────── */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          borderRadius: 16, padding: '1.5rem 2rem', marginBottom: '2rem',
        }}>
          <div style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', color: '#d97706', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            ✦ Briefing para construção do planejamento de marketing
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.6rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: '.6rem' }}>
            Sua resposta constrói o planejamento de marketing do Education
          </h2>
          <p style={{ fontSize: '.85rem', color: 'rgba(255,255,255,.6)', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.7, maxWidth: 760 }}>
            Cada cargo abaixo responde um formulário próprio, com perguntas específicas para o que você conhece e decide.
            As respostas de todos alimentam o diagnóstico, o posicionamento, o plano de campanhas e o calendário de conteúdo
            elaborados pelo gestor de marketing. Onde não houver uma decisão fechada, escreva "ainda não decidido" ou
            "precisa ser validado" — isso também é informação útil.
          </p>
        </div>

        {isGerente && (
          <div style={{ marginBottom: '1.75rem' }}>
            <Link href="/marketing/respostas" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              padding: '.65rem 1.25rem', borderRadius: 9999,
              background: '#fff', border: '1.5px solid #d97706', color: '#d97706',
              fontWeight: 700, fontSize: '.82rem', textDecoration: 'none',
              fontFamily: 'var(--font-montserrat,sans-serif)',
            }}>
              📊 Ver respostas recebidas (painel de marketing)
            </Link>
          </div>
        )}

        {/* ── Cards dos formulários ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px,1fr))', gap: '1.25rem' }}>
          {FORMULARIOS_BRIEFING.map(f => (
            <div key={f.id} style={{
              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
              overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ background: '#0f172a', padding: '1rem 1.25rem' }}>
                <div style={{ fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Destinado a
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', lineHeight: 1.25 }}>
                  {f.destinatario}
                </div>
              </div>
              <div style={{ padding: '1.1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <p style={{ fontSize: '.78rem', color: '#64748b', lineHeight: 1.6, marginBottom: '1rem', flex: 1 }}>
                  {f.descricaoDestinatario}
                </p>
                <div style={{ fontSize: '.68rem', color: '#94a3b8', marginBottom: '.85rem' }}>
                  ⏱ Tempo estimado: {f.tempoEstimado} · {f.perguntas.length} perguntas
                </div>
                <Link href={`/marketing/briefing/${f.id}`} style={{
                  display: 'block', textAlign: 'center', padding: '.6rem', borderRadius: 9999,
                  background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff',
                  fontWeight: 700, fontSize: '.8rem', textDecoration: 'none',
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                }}>
                  Responder formulário →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
