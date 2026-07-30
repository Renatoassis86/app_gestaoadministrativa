import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import { FORMULARIOS_BRIEFING } from '@/lib/marketing-briefings'
import { RespostasMarketing, type RespostaBriefingRow } from '@/components/marketing/RespostasMarketing'

export default async function RespostasMarketingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()

  if (profile?.role !== 'gerente') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <PageHeader title="Gestão de Marketing" subtitle="Respostas dos briefings" />
        <div style={{ padding: '3rem 2.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '.9rem' }}>Este painel é restrito à gerência.</p>
          <Link href="/marketing" style={{ color: '#d97706', fontSize: '.85rem', fontWeight: 600 }}>← Voltar</Link>
        </div>
      </div>
    )
  }

  const { data: respostas, error } = await supabase
    .from('marketing_briefing_respostas')
    .select('id, formulario_id, nome, funcao, tempo_atuacao, respostas, created_at')
    .order('created_at', { ascending: false })

  const tabelaInexistente = error?.code === '42P01'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <PageHeader title="Gestão de Marketing" subtitle="Respostas dos briefings estratégicos" />

      <div style={{ padding: '2rem 2.5rem' }}>
        <Link href="/marketing" style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', fontSize: '.78rem', color: '#64748b', textDecoration: 'none', marginBottom: '1.25rem' }}>
          ← Voltar para Gestão de Marketing
        </Link>

        {tabelaInexistente ? (
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '3rem 2.5rem', textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', color: '#0f172a', marginBottom: '.5rem' }}>
              Configure o banco de dados
            </h3>
            <p style={{ fontSize: '.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Execute <code>supabase/add_marketing_briefing_respostas.sql</code> no SQL Editor do Supabase para ativar este painel.
            </p>
          </div>
        ) : (
          <RespostasMarketing respostas={(respostas ?? []) as RespostaBriefingRow[]} configs={FORMULARIOS_BRIEFING} />
        )}
      </div>
    </div>
  )
}
