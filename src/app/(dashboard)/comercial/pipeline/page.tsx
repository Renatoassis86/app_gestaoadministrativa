import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { STAGE_OPTIONS, LABEL } from '@/types/database'

const ACTIVE_STAGES = STAGE_OPTIONS.filter(s => !['ganho','perdido'].includes(s.value))

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data: negociacoes } = await supabase
    .from('negociacoes')
    .select('*, escola:escolas(id, nome, cidade, estado), responsavel:profiles(full_name)')
    .eq('ativa', true)
    .order('updated_at', { ascending: false })

  const byStage = (stage: string) => negociacoes?.filter((n: any) => n.stage === stage) ?? []
  const ganhos  = byStage('ganho')
  const perdidos = byStage('perdido')

  return (
    <div>
      <PageHeader title="Pipeline Comercial" subtitle="Kanban de negociações" />
      <div className="p-6">

        {/* Kanban */}
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '.5rem', marginBottom: '1.5rem' }}>
          {ACTIVE_STAGES.map(stage => {
            const cards = byStage(stage.value)
            return (
              <div key={stage.value} style={{ minWidth: 220, flexShrink: 0 }}>
                <div className="stage-header">
                  <span>{stage.label}</span>
                  <span style={{ background: 'rgba(255,255,255,.2)', padding: '.1rem .4rem', borderRadius: 10, fontSize: '.7rem' }}>
                    {cards.length}
                  </span>
                </div>
                <div className="stage-body">
                  {cards.map((n: any) => (
                    <Link key={n.id} href={`/comercial/escolas/${n.escola_id}`} className="pipeline-card">
                      <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--brand-blue)', marginBottom: '.2rem' }}>
                        {n.escola?.nome?.substring(0, 26) ?? '—'}
                      </div>
                      {n.valor_estimado && (
                        <div style={{ fontWeight: 800, color: 'var(--brand-orange)', fontSize: '.85rem', marginBottom: '.2rem' }}>
                          {formatCurrency(n.valor_estimado)}
                        </div>
                      )}
                      <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>
                        {n.probabilidade}% · {n.escola?.cidade ?? ''}
                      </div>
                      {n.previsao_fechamento && (
                        <div style={{ fontSize: '.72rem', color: 'var(--brand-teal)', marginTop: '.2rem' }}>
                          📅 {new Date(n.previsao_fechamento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      <div style={{ fontSize: '.72rem', color: 'var(--text-s)', marginTop: '.3rem' }}>
                        {(n.responsavel as any)?.full_name ?? 'Sem responsável'}
                      </div>
                    </Link>
                  ))}
                  {cards.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-s)', fontSize: '.75rem' }}>
                      Nenhuma negociação
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Ganhos e Perdidos */}
        {(ganhos.length > 0 || perdidos.length > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="card">
              <div className="card-header" style={{ background: 'var(--success)', borderRadius: '10px 10px 0 0' }}>
                <span className="card-title" style={{ color: '#fff' }}>✓ Ganhos ({ganhos.length})</span>
              </div>
              <div className="card-body" style={{ padding: '1rem' }}>
                {ganhos.map((n: any) => (
                  <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                    <span style={{ fontWeight: 600 }}>{n.escola?.nome?.substring(0, 30)}</span>
                    {n.valor_estimado && <span style={{ color: 'var(--success)', fontWeight: 700 }}>{formatCurrency(n.valor_estimado)}</span>}
                  </div>
                ))}
                {ganhos.length === 0 && <div style={{ color: 'var(--text-s)', fontSize: '.85rem' }}>Nenhum ganho registrado</div>}
              </div>
            </div>
            <div className="card">
              <div className="card-header" style={{ background: 'var(--danger)', borderRadius: '10px 10px 0 0' }}>
                <span className="card-title" style={{ color: '#fff' }}>✗ Perdidos ({perdidos.length})</span>
              </div>
              <div className="card-body" style={{ padding: '1rem' }}>
                {perdidos.map((n: any) => (
                  <div key={n.id} style={{ padding: '.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{n.escola?.nome?.substring(0, 30)}</div>
                    {n.motivo_perda && <div style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>{n.motivo_perda.substring(0, 60)}</div>}
                  </div>
                ))}
                {perdidos.length === 0 && <div style={{ color: 'var(--text-s)', fontSize: '.85rem' }}>Nenhum perdido</div>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
