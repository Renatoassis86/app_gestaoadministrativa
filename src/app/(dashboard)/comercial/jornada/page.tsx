import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { LABEL } from '@/types/database'
import { Plus } from 'lucide-react'
import { EscolaSelector } from '@/components/ui/EscolaSelector'

interface Props { searchParams: Promise<{ escola?: string }> }

export default async function JornadaPage({ searchParams }: Props) {
  const params = await searchParams
  const escolaId = params.escola ?? ''
  const supabase = await createClient()

  const { data: escolas } = await supabase
    .from('escolas').select('id, nome, estado').eq('ativa', true).order('nome')

  let escola = null, registros = null, tarefas = null, negociacoes = null

  if (escolaId) {
    ;[{ data: escola }, { data: registros }, { data: tarefas }, { data: negociacoes }] = await Promise.all([
      supabase.from('escolas_resumo').select('*').eq('id', escolaId).single(),
      supabase.from('registros').select('*, responsavel:profiles(full_name)').eq('escola_id', escolaId).order('data_contato'),
      supabase.from('tarefas').select('*').eq('escola_id', escolaId).eq('status', 'pendente').order('vencimento'),
      supabase.from('negociacoes').select('*').eq('escola_id', escolaId).eq('ativa', true),
    ])
  }

  return (
    <div>
      <PageHeader
        title="Jornada de Relacionamento"
        subtitle="Linha do tempo da relação comercial com cada escola"
        actions={escolaId ? (
          <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary btn-sm">
            <Plus size={14} /> Nova Interação
          </Link>
        ) : undefined}
      />

      <div className="p-6">
        {/* Seletor */}
        <div className="card mb-6">
          <div className="card-body" style={{ padding: '.85rem 1.25rem' }}>
            <EscolaSelector
              escolas={escolas ?? []}
              escolaId={escolaId}
              basePath="/comercial/jornada"
              extraButton={escola ? (
                <Link href={`/comercial/escolas/${escolaId}`} className="btn btn-ghost btn-sm">Ver Ficha</Link>
              ) : undefined}
            />
          </div>
        </div>

        {escola ? (
          <>
            {/* Resumo da escola */}
            <div className="card mb-6">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{(escola as any).nome}</div>
                    <div style={{ fontSize: '.85rem', color: 'var(--text-s)' }}>
                      {(escola as any).cidade}{(escola as any).estado ? `, ${(escola as any).estado}` : ''} · {LABEL.perfil_pedagogico?.[(escola as any).perfil_pedagogico] ?? ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap' }}>
                    {[
                      ['Interações', registros?.length ?? 0, ''],
                      ['Potencial', formatCurrency((escola as any).potencial_financeiro ?? 0), 'var(--brand-orange)'],
                      ['Alunos', (escola as any).total_alunos ?? 0, ''],
                    ].map(([l, v, c]) => (
                      <div key={String(l)} style={{ textAlign: 'center', padding: '.5rem 1rem', background: 'var(--surface-2)', borderRadius: 8 }}>
                        <div style={{ fontSize: '.7rem', color: 'var(--text-s)' }}>{l}</div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: c as string || 'var(--brand-blue)' }}>{String(v)}</div>
                      </div>
                    ))}
                    {(escola as any).classificacao_atual && (
                      <span className={`badge badge-${(escola as any).classificacao_atual}`} style={{ alignSelf: 'center', fontSize: '.85rem', padding: '.4rem .85rem' }}>
                        {(escola as any).classificacao_atual === 'quente' ? '🔥 Quente' : (escola as any).classificacao_atual === 'morno' ? '🌤 Morno' : '❄️ Frio'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Timeline */}
              <div>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--brand-blue)', marginBottom: '1rem' }}>
                  Linha do Tempo ({registros?.length ?? 0} interações, ordem cronológica)
                </h3>
                {registros && registros.length > 0 ? (
                  <div className="timeline">
                    {registros.map((r: any) => {
                      const cor = r.classificacao === 'quente' ? 'var(--danger)' : r.classificacao === 'morno' ? 'var(--warning)' : 'var(--brand-blue)'
                      return (
                        <div key={r.id} className="timeline-item">
                          <div className="timeline-dot" style={{ background: cor, boxShadow: `0 0 0 2px ${cor}` }} />
                          <div className="timeline-card" style={{ borderLeftColor: cor }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', flexWrap: 'wrap', gap: '.5rem' }}>
                              <div>
                                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>
                                  {LABEL.meio_contato?.[r.meio_contato] ?? r.meio_contato}
                                </div>
                                <div style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>
                                  {new Date(r.data_contato + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                  {r.responsavel?.full_name && ` · ${r.responsavel.full_name}`}
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
                                <span className={`badge badge-${r.classificacao}`}>{r.classificacao === 'quente' ? 'Quente' : r.classificacao === 'morno' ? 'Morno' : 'Frio'}</span>
                                <span className="badge badge-gray">{r.probabilidade}%</span>
                                {r.potencial_financeiro > 0 && <span className="badge badge-orange">{formatCurrency(r.potencial_financeiro)}</span>}
                              </div>
                            </div>
                            <p style={{ fontSize: '.875rem', color: 'var(--text-m)', margin: '0 0 .75rem' }}>{r.resumo}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                              {r.contato_nome && <span className="badge badge-gray">Contato: {r.contato_nome}{r.contato_cargo ? ` (${r.contato_cargo})` : ''}</span>}
                              <span className="badge badge-gray">Interesse: {LABEL.interesse?.[r.interesse]}</span>
                              <span className="badge badge-blue">{LABEL.prontidao?.[r.prontidao]}</span>
                              <span className="badge badge-teal">Abertura: {LABEL.abertura?.[r.abertura]}</span>
                            </div>
                            {r.encaminhamentos?.length > 0 && (
                              <div style={{ marginTop: '.5rem', fontSize: '.72rem', color: 'var(--text-s)' }}>
                                Encaminhamentos: {r.encaminhamentos.join(', ')}
                              </div>
                            )}
                            {r.proximo_contato && (
                              <div style={{ marginTop: '.4rem', fontSize: '.78rem', color: 'var(--brand-teal)', fontWeight: 600 }}>
                                📅 Próximo contato: {formatDate(r.proximo_contato)}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>Nenhuma interação registrada</h3>
                    <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>
                      Registrar Primeira Interação
                    </Link>
                  </div>
                )}
              </div>

              {/* Painel lateral */}
              <div>
                {negociacoes && negociacoes.length > 0 && (
                  <div className="card mb-4">
                    <div className="card-header"><span className="card-title">Negociações</span></div>
                    <div className="card-body">
                      {negociacoes.map((n: any) => (
                        <div key={n.id} style={{ padding: '.6rem', background: 'var(--surface-2)', borderRadius: 8, marginBottom: '.5rem' }}>
                          <div style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--brand-blue)' }}>{LABEL.stage?.[n.stage] ?? n.stage}</div>
                          {n.valor_estimado && <div style={{ fontWeight: 800, color: 'var(--brand-orange)', fontSize: '.9rem' }}>{formatCurrency(n.valor_estimado)}</div>}
                          <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>{n.probabilidade}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tarefas && tarefas.length > 0 && (
                  <div className="card">
                    <div className="card-header"><span className="card-title">Tarefas Pendentes</span></div>
                    <div className="card-body">
                      {tarefas.map((t: any) => {
                        const vencida = t.vencimento && new Date(t.vencimento) < new Date()
                        return (
                          <div key={t.id} style={{ padding: '.5rem', background: vencida ? '#fff5f5' : 'var(--surface-2)', borderRadius: 6, marginBottom: '.4rem', borderLeft: `3px solid ${vencida ? 'var(--danger)' : 'var(--brand-teal)'}` }}>
                            <div style={{ fontSize: '.82rem', fontWeight: 600 }}>{t.titulo}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>{formatDate(t.vencimento)} · {t.prioridade}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-s)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-m)', marginBottom: '.4rem' }}>Selecione uma escola</h3>
            <p>Escolha uma escola acima para visualizar sua jornada completa de relacionamento.</p>
          </div>
        )}
      </div>

    </div>
  )
}
