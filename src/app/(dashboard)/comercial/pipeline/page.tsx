import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { STAGE_OPTIONS, LABEL } from '@/types/database'
import { PipelineKanban } from '@/components/comercial/PipelineKanban'
import { AdicionarNegociacaoBtn } from '@/components/comercial/AdicionarNegociacaoBtn'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

interface Props { searchParams: Promise<{ view?: string; responsavel?: string; t?: string }> }

const ACTIVE_STAGES = STAGE_OPTIONS.filter(s => !['ganho', 'perdido'].includes(s.value))

const STAGE_COLORS: Record<string, string> = {
  prospeccao:   '#6366f1',
  qualificacao: '#8b5cf6',
  apresentacao: '#d97706',
  proposta:     '#f59e0b',
  negociacao:   '#0ea5e9',
  fechamento:   '#16a34a',
}

export default async function PipelinePage({ searchParams }: Props) {
  const params      = await searchParams
  const viewMode    = params.view        ?? 'kanban'    // 'kanban' | 'consultor'
  const filtroResp  = params.responsavel ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile }  = await supabase.from('profiles').select('role').eq('id', user?.id ?? '').single()

  // Buscar escolas para o seletor de "adicionar ao pipeline"
  const { data: escolas } = await supabase
    .from('escolas').select('id, nome, cidade, estado').eq('ativa', true).order('nome')

  const [{ data: negociacoes }, { data: profiles }] = await Promise.all([
    supabase.from('negociacoes')
      .select('*, escola:escolas(id, nome, cidade, estado), responsavel:profiles(id, full_name, role)')
      .eq('ativa', true)
      .order('updated_at', { ascending: false }),
    supabase.from('profiles').select('id, full_name').eq('is_active', true)
      .in('role', ['gerente', 'supervisor', 'consultor']).order('full_name'),
  ])

  const negs = negociacoes ?? []

  // Filtro por responsável
  const negsFiltradas = filtroResp
    ? negs.filter((n: any) => n.responsavel_id === filtroResp)
    : negs

  const byStage = (stage: string) => negsFiltradas.filter((n: any) => n.stage === stage)
  const ganhos   = negsFiltradas.filter((n: any) => n.stage === 'ganho')
  const perdidos = negsFiltradas.filter((n: any) => n.stage === 'perdido')

  // Agrupar por consultor
  const byConsultor: Record<string, { profile: any; negs: any[] }> = {}
  negs.forEach((n: any) => {
    const pid  = n.responsavel_id ?? 'sem_responsavel'
    const nome = (n.responsavel as any)?.full_name ?? 'Sem Responsável'
    if (!byConsultor[pid]) byConsultor[pid] = { profile: { id: pid, full_name: nome }, negs: [] }
    byConsultor[pid].negs.push(n)
  })

  // Estatísticas por consultor
  const consultorStats = Object.entries(byConsultor).map(([pid, data]) => ({
    ...data,
    total: data.negs.length,
    ganhos: data.negs.filter((n: any) => n.stage === 'ganho').length,
    potencial: data.negs.reduce((acc: number, n: any) => acc + (n.valor_estimado ?? 0), 0),
    ativos: data.negs.filter((n: any) => !['ganho','perdido'].includes(n.stage)).length,
  })).sort((a, b) => b.potencial - a.potencial)

  const totalValorAtivo = negsFiltradas.reduce((acc: number, n: any) => acc + (n.valor_estimado ?? 0), 0)

  return (
    <div>
      <PageHeader
        title="Pipeline Comercial"
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexShrink: 0 }}>
            <span style={{ background: '#0f172a', color: '#f59e0b', fontSize: '.65rem', fontWeight: 800, padding: '.2rem .55rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', letterSpacing: '.04em' }}>
              {negsFiltradas.length} ativos
            </span>
            {totalValorAtivo > 0 && (
              <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '.65rem', fontWeight: 800, padding: '.2rem .55rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', border: '1px solid #86efac' }}>
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalValorAtivo)}
              </span>
            )}
          </div>
        }
        actions={
          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
            <AdicionarNegociacaoBtn escolas={escolas ?? []} userId={user?.id ?? ''} />
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
              {[
                { v: 'kanban',    label: 'Kanban' },
                { v: 'consultor', label: 'Consultores' },
              ].map(t => (
                <Link key={t.v}
                  href={`/comercial/pipeline?view=${t.v}${filtroResp ? `&responsavel=${filtroResp}` : ''}`}
                  style={{
                    padding: '5px 11px', borderRadius: 6, textDecoration: 'none',
                    fontSize: '.72rem', fontWeight: 700,
                    background: viewMode === t.v ? '#fff' : 'transparent',
                    color: viewMode === t.v ? '#0f172a' : '#64748b',
                    boxShadow: viewMode === t.v ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                    transition: 'all .15s', whiteSpace: 'nowrap',
                  }}>
                  {t.label}
                </Link>
              ))}
            </div>
          </div>
        }
      />

      <div style={{ padding: '1rem 1.25rem' }}>

        {/* ── Filtro por responsável ──────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            Filtrar:
          </span>
          <Link href={`/comercial/pipeline?view=${viewMode}`}
            style={{ padding: '5px 14px', borderRadius: 9999, textDecoration: 'none', fontSize: '.75rem', fontWeight: 700, background: !filtroResp ? '#0f172a' : '#f1f5f9', color: !filtroResp ? '#fff' : '#475569', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            Todos
          </Link>
          {profiles?.map((p: any) => (
            <Link key={p.id}
              href={`/comercial/pipeline?view=${viewMode}&responsavel=${p.id}`}
              style={{ padding: '5px 14px', borderRadius: 9999, textDecoration: 'none', fontSize: '.75rem', fontWeight: 700, background: filtroResp === p.id ? '#d97706' : '#f1f5f9', color: filtroResp === p.id ? '#fff' : '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: filtroResp === p.id ? '0 2px 8px rgba(217,119,6,.3)' : 'none' }}>
              {p.full_name.split(' ')[0]}
            </Link>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            VIEW: POR CONSULTOR
            ══════════════════════════════════════════════════════ */}
        {viewMode === 'consultor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {consultorStats.map(({ profile: prof, negs: negsList, total, ganhos: g, potencial, ativos }) => {
              const cor = '#' + Math.abs(prof.full_name.split('').reduce((h: number, c: string) => h * 31 + c.charCodeAt(0), 0) % 16777215).toString(16).padStart(6, '0').slice(0, 6)
              const safeColor = ['gerente', 'supervisor'].includes(
                negs.find((n: any) => n.responsavel_id === prof.id)?.responsavel?.role ?? ''
              ) ? '#0f172a' : '#475569'

              return (
                <div key={prof.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
                  {/* Header do consultor */}
                  <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '.8rem', fontWeight: 800, fontFamily: 'var(--font-montserrat,sans-serif)',
                    }}>
                      {prof.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 700, color: '#fff', fontSize: '.9rem' }}>{prof.full_name}</div>
                      <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.45)', marginTop: '.1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>Consultor Comercial</div>
                    </div>
                    {/* Mini stats */}
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      {[
                        ['Negociações', ativos],
                        ['Ganhos', g],
                        ['Potencial', formatCurrency(potencial)],
                      ].map(([l, v]) => (
                        <div key={String(l)} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{l}</div>
                          <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini kanban do consultor */}
                  <div style={{ display: 'flex', overflowX: 'auto', gap: 0 }}>
                    {ACTIVE_STAGES.map(stage => {
                      const stagenegs = negsList.filter((n: any) => n.stage === stage.value)
                      const cor = STAGE_COLORS[stage.value] ?? '#64748b'
                      return (
                        <div key={stage.value} style={{ minWidth: 180, flex: 1, borderRight: '1px solid #f1f5f9' }}>
                          <div style={{ padding: '.6rem 1rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: cor, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                              {stage.label}
                            </span>
                            <span style={{ background: cor + '20', color: cor, fontSize: '.6rem', fontWeight: 800, padding: '.1rem .4rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                              {stagenegs.length}
                            </span>
                          </div>
                          <div style={{ padding: '.65rem', minHeight: 80, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                            {stagenegs.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '1rem .5rem', fontSize: '.68rem', color: '#cbd5e1', fontFamily: 'var(--font-inter,sans-serif)' }}>—</div>
                            ) : stagenegs.map((n: any) => (
                              <Link key={n.id} href={`/comercial/escolas/${n.escola_id}`}
                                style={{ display: 'block', textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', borderLeft: `3px solid ${cor}`, borderRadius: 8, padding: '.5rem .65rem', boxShadow: '0 1px 3px rgba(0,0,0,.04)', transition: 'box-shadow .15s' }}>
                                <div style={{ fontWeight: 700, fontSize: '.72rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.15rem' }}>
                                  {(n.escola as any)?.nome?.substring(0, 22) ?? '—'}
                                </div>
                                {n.valor_estimado && (
                                  <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-cormorant,serif)' }}>
                                    {formatCurrency(n.valor_estimado)}
                                  </div>
                                )}
                                <div style={{ fontSize: '.62rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                  {n.probabilidade}% · {(n.escola as any)?.estado ?? ''}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {consultorStats.length === 0 && (
              <div style={{ textAlign: 'center', padding: '4rem', color: '#475569' }}>
                <div style={{ fontSize: '1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>Nenhuma negociação cadastrada ainda.</div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            VIEW: KANBAN GERAL — drag-and-drop
            ══════════════════════════════════════════════════════ */}
        {viewMode === 'kanban' && (
          <>
            {/* Estado vazio — orientação visual */}
            {negsFiltradas.length === 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                border: '2px dashed #e2e8f0', borderRadius: 14,
                padding: '2rem 1.5rem', textAlign: 'center',
                marginBottom: '1rem',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem',
              }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fffbeb', border: '2px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="6" height="18" rx="2"/><rect x="9" y="3" width="6" height="18" rx="2"/><rect x="16" y="3" width="6" height="18" rx="2"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '.3rem' }}>
                    Pipeline vazio
                  </h3>
                  <p style={{ fontSize: '.8rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>
                    Adicione escolas ao pipeline para acompanhar o progresso de cada negociação nos quadros Kanban.
                  </p>
                </div>
                <AdicionarNegociacaoBtn escolas={escolas ?? []} userId={user?.id ?? ''} />
                <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['Prospecção','Qualificação','Apresentação','Proposta','Negociação','Fechamento'].map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.68rem', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: ['#6366f1','#8b5cf6','#d97706','#f59e0b','#0ea5e9','#16a34a'][i] }} />
                      {s}
                      {i < 5 && <span style={{ color: '#cbd5e1' }}>›</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <PipelineKanban
              negociacoes={negsFiltradas as any}
              stages={ACTIVE_STAGES.map(s => s.value)}
              userId={user?.id ?? ''}
            />

            {/* Ganhos e Perdidos */}
            {(ganhos.length > 0 || perdidos.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { label: 'Ganhos', items: ganhos, cor: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                  { label: 'Perdidos', items: perdidos, cor: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
                ].map(group => (
                  <div key={group.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
                    <div style={{ padding: '.75rem 1.25rem', background: group.bg, borderBottom: `1px solid ${group.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: group.cor, fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.82rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        {group.label === 'Ganhos' ? '✓ ' : '✗ '}{group.label}
                      </span>
                      <span style={{ background: group.cor, color: '#fff', fontSize: '.65rem', fontWeight: 800, padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {group.items.length}
                      </span>
                    </div>
                    <div style={{ padding: '1rem 1.25rem' }}>
                      {group.items.length > 0 ? group.items.map((n: any) => (
                        <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '.45rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '.82rem' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{(n.escola as any)?.nome?.substring(0, 28) ?? '—'}</span>
                          {n.valor_estimado && <span style={{ color: group.cor, fontWeight: 700, fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>{formatCurrency(n.valor_estimado)}</span>}
                        </div>
                      )) : (
                        <div style={{ fontSize: '.82rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>Nenhum registro</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}
