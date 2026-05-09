'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PipelineKanban } from './PipelineKanban'
import { AdicionarNegociacaoBtn } from './AdicionarNegociacaoBtn'
import { formatCurrency } from '@/lib/utils'

const STAGE_COLORS: Record<string, string> = {
  prospeccao:   '#6366f1',
  qualificacao: '#8b5cf6',
  apresentacao: '#d97706',
  proposta:     '#f59e0b',
  negociacao:   '#0ea5e9',
  fechamento:   '#16a34a',
}

const ACTIVE_STAGES = ['prospeccao','qualificacao','apresentacao','proposta','negociacao','fechamento']

interface Escola {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
}

interface Props {
  escolas: Escola[]
  userId: string
  viewMode: string
  filtroResp: string
}

export function PipelineBoard({ escolas, userId, viewMode, filtroResp }: Props) {
  const [negociacoes, setNegociacoes] = useState<any[]>([])
  const [profiles, setProfiles]       = useState<any[]>([])
  const [loading, setLoading]         = useState(true)
  const supabase = createClient()

  const carregar = useCallback(async () => {
    setLoading(true)
    const [{ data: negs }, { data: profs }] = await Promise.all([
      supabase
        .from('negociacoes')
        .select('*, escola:escolas(id, nome, cidade, estado), responsavel:profiles(id, full_name, role)')
        .eq('ativa', true)
        .order('updated_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, full_name')
        .eq('is_active', true)
        .in('role', ['gerente', 'supervisor', 'consultor'])
        .order('full_name'),
    ])
    setNegociacoes(negs ?? [])
    setProfiles(profs ?? [])
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    carregar()
  }, [carregar])

  const negsFiltradas = filtroResp
    ? negociacoes.filter(n => n.responsavel_id === filtroResp)
    : negociacoes

  const ganhos   = negsFiltradas.filter(n => n.stage === 'ganho')
  const perdidos = negsFiltradas.filter(n => n.stage === 'perdido')
  const totalValor = negsFiltradas.reduce((acc, n) => acc + (n.valor_estimado ?? 0), 0)

  // Agrupamento por consultor
  const byConsultor: Record<string, { profile: any; negs: any[] }> = {}
  negociacoes.forEach(n => {
    const pid  = n.responsavel_id ?? 'sem'
    const nome = n.responsavel?.full_name ?? 'Sem Responsável'
    if (!byConsultor[pid]) byConsultor[pid] = { profile: { id: pid, full_name: nome }, negs: [] }
    byConsultor[pid].negs.push(n)
  })
  const consultorStats = Object.values(byConsultor)
    .map(d => ({
      ...d,
      ativos:    d.negs.filter(n => !['ganho','perdido'].includes(n.stage)).length,
      ganhos:    d.negs.filter(n => n.stage === 'ganho').length,
      potencial: d.negs.reduce((acc, n) => acc + (n.valor_estimado ?? 0), 0),
    }))
    .sort((a, b) => b.potencial - a.potencial)

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320, gap: '.75rem' }}>
        <div style={{ width: 20, height: 20, border: '2.5px solid #e2e8f0', borderTopColor: '#d97706', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <span style={{ fontSize: '.82rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>Carregando pipeline...</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div>
      {/* Barra de filtro + estatísticas */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            Filtrar:
          </span>
          <Link href={`/comercial/pipeline?view=${viewMode}`}
            style={{ padding: '4px 12px', borderRadius: 9999, textDecoration: 'none', fontSize: '.72rem', fontWeight: 700, background: !filtroResp ? '#0f172a' : '#f1f5f9', color: !filtroResp ? '#fff' : '#475569', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            Todos
          </Link>
          {profiles.map(p => (
            <Link key={p.id}
              href={`/comercial/pipeline?view=${viewMode}&responsavel=${p.id}`}
              style={{ padding: '4px 12px', borderRadius: 9999, textDecoration: 'none', fontSize: '.72rem', fontWeight: 700, background: filtroResp === p.id ? '#d97706' : '#f1f5f9', color: filtroResp === p.id ? '#fff' : '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: filtroResp === p.id ? '0 2px 8px rgba(217,119,6,.3)' : 'none' }}>
              {p.full_name.split(' ')[0]}
            </Link>
          ))}
        </div>
        {/* Stats inline */}
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <span style={{ background: '#0f172a', color: '#f59e0b', fontSize: '.65rem', fontWeight: 800, padding: '.2rem .6rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            {negsFiltradas.length} ativas
          </span>
          {totalValor > 0 && (
            <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '.65rem', fontWeight: 800, padding: '.2rem .6rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', border: '1px solid #86efac' }}>
              {formatCurrency(totalValor)}
            </span>
          )}
          <button onClick={carregar} title="Recarregar" style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </button>
        </div>
      </div>

      {/* ── KANBAN VIEW ── */}
      {viewMode === 'kanban' && (
        <>
          {negsFiltradas.length === 0 ? (
            <div style={{
              background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
              border: '2px dashed #e2e8f0', borderRadius: 14,
              padding: '2rem 1.5rem', textAlign: 'center', marginBottom: '1rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.75rem',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#fffbeb', border: '2px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="6" height="18" rx="2"/><rect x="9" y="3" width="6" height="18" rx="2"/><rect x="16" y="3" width="6" height="18" rx="2"/>
                </svg>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '.3rem' }}>Pipeline vazio</h3>
                <p style={{ fontSize: '.8rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', maxWidth: 380, margin: '0 auto', lineHeight: 1.55 }}>
                  Adicione escolas ao pipeline para acompanhar o progresso de cada negociação nos quadros Kanban.
                </p>
              </div>
              <AdicionarNegociacaoBtn escolas={escolas} userId={userId} onSuccess={carregar} />
              <div style={{ display: 'flex', gap: '.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {['Prospecção','Qualificação','Apresentação','Proposta','Negociação','Fechamento'].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.68rem', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: ['#6366f1','#8b5cf6','#d97706','#f59e0b','#0ea5e9','#16a34a'][i] }} />
                    {s}{i < 5 && <span style={{ color: '#cbd5e1' }}>›</span>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <PipelineKanban
              negociacoes={negsFiltradas}
              stages={ACTIVE_STAGES}
              userId={userId}
              onUpdate={carregar}
            />
          )}

          {(ganhos.length > 0 || perdidos.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
              {[
                { label: 'Ganhos',   items: ganhos,   cor: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                { label: 'Perdidos', items: perdidos, cor: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
              ].map(group => (
                <div key={group.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
                  <div style={{ padding: '.65rem 1.25rem', background: group.bg, borderBottom: `1px solid ${group.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: group.cor, fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.78rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {group.label === 'Ganhos' ? '✓ ' : '✗ '}{group.label}
                    </span>
                    <span style={{ background: group.cor, color: '#fff', fontSize: '.6rem', fontWeight: 800, padding: '.1rem .45rem', borderRadius: 99 }}>{group.items.length}</span>
                  </div>
                  <div style={{ padding: '1rem 1.25rem' }}>
                    {group.items.length === 0 ? (
                      <div style={{ fontSize: '.8rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>Nenhum registro</div>
                    ) : group.items.map((n: any) => (
                      <div key={n.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '.4rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '.8rem' }}>
                        <span style={{ fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{n.escola?.nome?.substring(0, 28) ?? '—'}</span>
                        {n.valor_estimado && <span style={{ color: group.cor, fontWeight: 700, fontFamily: 'var(--font-cormorant,serif)', fontSize: '.9rem' }}>{formatCurrency(n.valor_estimado)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── CONSULTOR VIEW ── */}
      {viewMode === 'consultor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {consultorStats.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)', fontSize: '.85rem' }}>
              Nenhuma negociação cadastrada.
            </div>
          )}
          {consultorStats.map(({ profile: prof, negs: negsList, ativos, ganhos: g, potencial }) => (
            <div key={prof.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
              <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.8rem', fontWeight: 800, fontFamily: 'var(--font-montserrat,sans-serif)', flexShrink: 0 }}>
                  {prof.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '.9rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{prof.full_name}</div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                  {[['Ativas', ativos], ['Ganhos', g], ['Potencial', formatCurrency(potencial)]].map(([l, v]) => (
                    <div key={String(l)} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '.58rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{l}</div>
                      <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{String(v)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', overflowX: 'auto' }}>
                {ACTIVE_STAGES.map(stg => {
                  const cor = STAGE_COLORS[stg] ?? '#64748b'
                  const items = negsList.filter((n: any) => n.stage === stg)
                  return (
                    <div key={stg} style={{ minWidth: 160, flex: 1, borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ padding: '.55rem .9rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: cor, fontFamily: 'var(--font-montserrat,sans-serif)' }}>{stg}</span>
                        <span style={{ background: cor + '20', color: cor, fontSize: '.58rem', fontWeight: 800, padding: '.1rem .35rem', borderRadius: 99 }}>{items.length}</span>
                      </div>
                      <div style={{ padding: '.55rem', minHeight: 72, display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                        {items.length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '.75rem .25rem', fontSize: '.65rem', color: '#cbd5e1' }}>—</div>
                        ) : items.map((n: any) => (
                          <Link key={n.id} href={`/comercial/escolas/${n.escola_id}`}
                            style={{ display: 'block', textDecoration: 'none', background: '#fff', border: '1px solid #e2e8f0', borderLeft: `3px solid ${cor}`, borderRadius: 7, padding: '.45rem .6rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '.7rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                              {n.escola?.nome?.substring(0, 20) ?? '—'}
                            </div>
                            {n.valor_estimado && (
                              <div style={{ fontSize: '.65rem', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-cormorant,serif)' }}>{formatCurrency(n.valor_estimado)}</div>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
