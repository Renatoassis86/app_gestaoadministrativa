'use server'

import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'

export const dynamic = 'force-dynamic'

interface Props { searchParams: Promise<{ escola?: string }> }

export default async function DiagnosticoPage({ searchParams }: Props) {
  const params = await searchParams
  const escolaId = params.escola ?? 'fe9059d1-600c-44f1-8237-742b216bf60d'
  const supabase = await createClient()

  // Busca todos os dados relacionados à escola
  const [
    { data: escola },
    { data: registros },
    { data: negociacoes },
    { data: contratos },
  ] = await Promise.all([
    supabase.from('escolas').select('*').eq('id', escolaId).single(),
    supabase.from('registros').select('*').eq('escola_id', escolaId).order('created_at'),
    supabase.from('negociacoes').select('*').eq('escola_id', escolaId).order('created_at'),
    supabase.from('contratos').select('*').eq('escola_id', escolaId).single(),
  ])

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <PageHeader title="🔍 Diagnóstico de Dados" subtitle="Debug da escola selecionada" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {/* ESCOLA */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            📌 ESCOLA
          </h3>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: 8, overflow: 'auto', fontSize: '.75rem', fontFamily: 'monospace' }}>
            {JSON.stringify(escola, null, 2)}
          </pre>
        </div>

        {/* REGISTROS */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            📝 REGISTROS ({registros?.length ?? 0})
          </h3>
          {registros && registros.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {registros.map((r: any) => (
                <div key={r.id} style={{ background: '#fff', padding: '.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '.75rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>{r.meio_contato} - {new Date(r.data_contato).toLocaleDateString('pt-BR')}</div>
                  <div style={{ color: '#64748b', marginBottom: '.25rem' }}>Classificação: {r.classificacao}</div>
                  <div style={{ color: '#64748b', marginBottom: '.25rem' }}>Prontidão: {r.prontidao}</div>
                  <div style={{ color: '#94a3b8', fontSize: '.65rem' }}>ID: {r.id.substring(0, 8)}...</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhum registro encontrado</div>
          )}
        </div>

        {/* NEGOCIAÇÕES */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            💼 NEGOCIAÇÕES ({negociacoes?.length ?? 0})
          </h3>
          {negociacoes && negociacoes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              {negociacoes.map((n: any) => (
                <div key={n.id} style={{ background: '#fff', padding: '.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '.75rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '.25rem' }}>{n.titulo}</div>
                  <div style={{ color: '#64748b', marginBottom: '.25rem' }}>Stage: <strong>{n.stage}</strong></div>
                  <div style={{ color: '#64748b', marginBottom: '.25rem' }}>Ativa: {n.ativa ? '✅ Sim' : '❌ Não'}</div>
                  <div style={{ color: '#94a3b8', fontSize: '.65rem' }}>ID: {n.id.substring(0, 8)}...</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Nenhuma negociação encontrada</div>
          )}
        </div>

        {/* CONTRATO */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
            📋 CONTRATO
          </h3>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: 8, overflow: 'auto', fontSize: '.75rem', fontFamily: 'monospace' }}>
            {JSON.stringify(contratos, null, 2)}
          </pre>
        </div>
      </div>

      {/* RAW JSON */}
      <div style={{ marginTop: '2rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#0f172a' }}>
          🔬 DADOS BRUTOS (JSON)
        </h3>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#0f172a', userSelect: 'none' }}>
            Clique para expandir
          </summary>
          <pre style={{ background: '#fff', padding: '1rem', borderRadius: 8, overflow: 'auto', fontSize: '.65rem', fontFamily: 'monospace', marginTop: '1rem' }}>
            {JSON.stringify({ escola, registros, negociacoes, contratos }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
