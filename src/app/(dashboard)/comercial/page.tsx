import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDate, formatCurrency, diasDesdeData } from '@/lib/utils'
import { Plus, AlertTriangle, ArrowRight, Clock } from 'lucide-react'
import { LABEL } from '@/types/database'

// ── Estilos reutilizáveis ─────────────────────────────────────────────────────
const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
  overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)',
}

const CLASSIF_STYLE: Record<string, { bg: string; text: string; border: string; dot: string; topBar: string }> = {
  quente: { bg: '#fef2f2', text: '#dc2626', border: '#fca5a5', dot: '#dc2626', topBar: '#dc2626' },
  morno:  { bg: '#fffbeb', text: '#d97706', border: '#fcd34d', dot: '#f59e0b', topBar: '#d97706' },
  frio:   { bg: '#eff6ff', text: '#2563eb', border: '#93c5fd', dot: '#60a5fa', topBar: '#2563eb' },
}

const MEIO_LABEL: Record<string, string> = {
  presencial: 'Presencial', whatsapp: 'WhatsApp', email: 'E-mail',
  telefone: 'Telefone', videoconf: 'Videoconf', outro: 'Outro',
}

export default async function ComercialDashboard() {
  const supabase    = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const hoje        = new Date().toISOString().split('T')[0]
  const trintaDias  = new Date(Date.now() - 30  * 86400000).toISOString().split('T')[0]

  const [
    { count: totalEscolas },
    { count: leadsQuentes },
    { count: leadsMornos },
    { count: registrosMes },
    { data: registrosRecentes },
    { data: tarefasVencidas },
    { data: escolasSemContato },
    { data: tarefasHoje },
    { data: todasEscolas },
    { data: escolasComRegistro },
  ] = await Promise.all([
    supabase.from('escolas').select('*', { count: 'exact', head: true }).eq('ativa', true),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'quente'),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'morno'),
    supabase.from('registros').select('*', { count: 'exact', head: true }).gte('data_contato', trintaDias),
    supabase.from('registros')
      .select('*, escola:escolas(nome,id,cidade,estado)')
      .order('data_contato', { ascending: false })
      .limit(8),
    supabase.from('tarefas')
      .select('*, escola:escolas(nome,id)')
      .eq('status', 'pendente')
      .lt('vencimento', hoje)
      .limit(5),
    supabase.from('escolas')
      .select('id, nome, cidade, estado, updated_at')
      .eq('ativa', true)
      .order('updated_at', { ascending: true })
      .limit(6),
    supabase.from('tarefas')
      .select('*, escola:escolas(nome,id)')
      .eq('status', 'pendente')
      .eq('vencimento', hoje)
      .limit(3),
    // Todas as escolas ativas para calcular quais não têm registro
    supabase.from('escolas')
      .select('id, nome, cidade, estado, created_at, responsavel_id, responsavel:profiles(full_name)')
      .eq('ativa', true)
      .order('created_at', { ascending: false }),
    // Escolas que já têm pelo menos 1 registro
    supabase.from('registros')
      .select('escola_id'),
  ])

  const nVencidas = tarefasVencidas?.length ?? 0
  const nHoje     = tarefasHoje?.length ?? 0

  // Escolas sem nenhum registro de interação (negociação não iniciada)
  const idsComRegistro = new Set(escolasComRegistro?.map(r => r.escola_id) ?? [])
  const escolasSemNegociacao = (todasEscolas ?? []).filter((e: any) => !idsComRegistro.has(e.id))

  const kpis = [
    { label: 'Total de Escolas',   value: totalEscolas ?? 0, sub: 'parceiros ativos',     cor: '#2563eb', bg: '#eff6ff', border: '#93c5fd', href: '/comercial/escolas' },
    { label: 'Leads Quentes',      value: leadsQuentes ?? 0, sub: 'alta probabilidade',    cor: '#dc2626', bg: '#fef2f2', border: '#fca5a5', href: '/comercial/leads' },
    { label: 'Leads Mornos',       value: leadsMornos  ?? 0, sub: 'em negociação ativa',   cor: '#d97706', bg: '#fffbeb', border: '#fcd34d', href: '/comercial/leads' },
    { label: 'Registros (30 dias)',value: registrosMes ?? 0, sub: 'interações recentes',   cor: '#0d9488', bg: '#f0fdfa', border: '#99f6e4', href: '/comercial/registros' },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard Comercial"
        subtitle={`Atualizado hoje, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`}
        badge={
          nVencidas > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.2rem .65rem', borderRadius: 9999, fontSize: '.65rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              <AlertTriangle size={10} /> {nVencidas} vencida{nVencidas > 1 ? 's' : ''}
            </span>
          ) : undefined
        }
        actions={
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <Link href="/comercial/registros/novo" style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.45rem 1rem', borderRadius: 9999, background: '#d97706', color: '#fff', textDecoration: 'none', fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: '0 4px 12px rgba(217,119,6,.3)' }}>
              <Plus size={13} /> Novo Registro
            </Link>
            <Link href="/comercial/escolas/nova" style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.45rem 1rem', borderRadius: 9999, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', textDecoration: 'none', fontSize: '.78rem', fontWeight: 600, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              <Plus size={13} /> Escola
            </Link>
          </div>
        }
      />

      <div style={{ padding: '1.75rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {kpis.map(k => (
            <Link key={k.label} href={k.href} style={{ textDecoration: 'none', display: 'block', background: k.bg, border: `1.5px solid ${k.border}`, borderTop: `3px solid ${k.cor}`, borderRadius: 14, padding: '1.1rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,.04)', transition: 'box-shadow .2s, transform .2s' }}
            >
              <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: k.cor, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.4rem' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '.3rem' }}>{k.value}</div>
              <div style={{ fontSize: '.72rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>{k.sub}</div>
            </Link>
          ))}
        </div>

        {/* ── Alertas ───────────────────────────────────────────── */}
        {nVencidas > 0 && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderLeft: '4px solid #dc2626', borderRadius: 14, padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.85rem' }}>
              <AlertTriangle size={16} style={{ color: '#64748b', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '.875rem', color: '#991b1b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                {nVencidas} tarefa{nVencidas > 1 ? 's' : ''} vencida{nVencidas > 1 ? 's' : ''}
              </span>
              <Link href="/comercial/jornada" style={{ marginLeft: 'auto', fontSize: '.72rem', color: '#dc2626', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                Ver todas <ArrowRight size={11} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
              {tarefasVencidas!.map((t: any) => (
                <Link key={t.id} href={`/comercial/escolas/${t.escola_id}`} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', background: '#fff', border: '1px solid #fca5a5', borderRadius: 10, padding: '.65rem 1rem', textDecoration: 'none', transition: 'box-shadow .15s' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{t.titulo}</div>
                    <div style={{ fontSize: '.7rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      {(t.escola as any)?.nome}
                      {t.vencimento && <span style={{ color: '#dc2626', marginLeft: '.35rem' }}>· {formatDate(t.vencimento)}</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: '.62rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '.15rem .55rem', borderRadius: 99, textTransform: 'uppercase', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                    {t.prioridade}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {nHoje > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderLeft: '4px solid #d97706', borderRadius: 14, padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '.85rem' }}>
              <Clock size={15} style={{ color: '#64748b', flexShrink: 0 }} />
              <span style={{ fontWeight: 700, fontSize: '.875rem', color: '#92400e', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                {nHoje} tarefa{nHoje > 1 ? 's' : ''} para hoje
              </span>
            </div>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {tarefasHoje!.map((t: any) => (
                <Link key={t.id} href={`/comercial/escolas/${t.escola_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.5rem 1rem', background: '#fff', border: '1px solid #fcd34d', borderRadius: 10, fontSize: '.78rem', color: '#0f172a', textDecoration: 'none', fontFamily: 'var(--font-inter,sans-serif)', fontWeight: 500 }}>
                  {t.titulo}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Conteúdo principal: 2 colunas ─────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Últimas Interações */}
          <div style={card}>
            <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Últimas Interações</div>
              <Link href="/comercial/registros" style={{ fontSize: '.72rem', color: '#d97706', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.25rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Ver todas <ArrowRight size={11} />
              </Link>
            </div>

            {registrosRecentes && registrosRecentes.length > 0 ? (
              <div style={{ padding: '.75rem' }}>
                {registrosRecentes.map((r: any, idx: number) => {
                  const cs      = CLASSIF_STYLE[r.classificacao ?? 'frio'] ?? CLASSIF_STYLE.frio
                  const escola  = (r.escola as any)
                  return (
                    <Link key={r.id} href={`/comercial/escolas/${r.escola_id}`}
                      style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.65rem .85rem', borderRadius: 10, textDecoration: 'none', marginBottom: idx < registrosRecentes.length - 1 ? '.3rem' : 0, background: idx % 2 === 0 ? '#fafafa' : '#fff', border: '1px solid transparent', transition: 'border-color .15s' }}
                    >
                      {/* Dot classificação */}
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: cs.dot, flexShrink: 0 }} />
                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          {escola?.nome ?? '—'}
                        </div>
                        <div style={{ fontSize: '.68rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {r.resumo?.substring(0, 50) ?? '—'}
                        </div>
                      </div>
                      {/* Meta */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '.68rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>{formatDate(r.data_contato)}</div>
                        <div style={{ fontSize: '.62rem', fontWeight: 700, color: cs.text, background: cs.bg, border: `1px solid ${cs.border}`, padding: '.05rem .4rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', marginTop: '.15rem' }}>
                          {MEIO_LABEL[r.meio_contato] ?? r.meio_contato}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto .75rem' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', color: '#0f172a', marginBottom: '.35rem' }}>Sem registros ainda</div>
                <Link href="/comercial/registros/novo" style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', background: '#d97706', color: '#fff', padding: '.45rem 1rem', borderRadius: 9999, textDecoration: 'none', fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', marginTop: '.35rem' }}>
                  <Plus size={13} /> Criar primeiro registro
                </Link>
              </div>
            )}
          </div>

          {/* Escolas sem contato recente */}
          <div style={card}>
            <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Precisam de Atenção</div>
              <span style={{ fontSize: '.68rem', fontWeight: 700, background: 'rgba(217,119,6,.2)', color: '#d97706', border: '1px solid rgba(217,119,6,.3)', padding: '.15rem .6rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                {escolasSemContato?.length ?? 0} escolas
              </span>
            </div>

            {escolasSemContato && escolasSemContato.length > 0 ? (
              <div style={{ padding: '.75rem' }}>
                {escolasSemContato.map((e: any, idx: number) => {
                  const dias = diasDesdeData(e.updated_at)
                  return (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '.85rem', padding: '.65rem .85rem', borderRadius: 10, marginBottom: idx < escolasSemContato.length - 1 ? '.3rem' : 0, background: idx % 2 === 0 ? '#fafafa' : '#fff', border: '1px solid transparent', transition: 'all .15s', cursor: 'pointer' }}
                      onMouseEnter={(el) => { el.currentTarget.style.background = '#f1f5f9'; el.currentTarget.style.borderColor = '#e2e8f0' }}
                      onMouseLeave={(el) => { el.currentTarget.style.background = idx % 2 === 0 ? '#fafafa' : '#fff'; el.currentTarget.style.borderColor = 'transparent' }}
                      onClick={() => window.location.href = `/comercial/escolas/${e.id}`}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{e.nome}</div>
                        <div style={{ fontSize: '.68rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          {e.cidade}{e.estado ? `, ${e.estado}` : ''}
                        </div>
                      </div>
                      {dias != null && (
                        <span style={{ fontSize: '.65rem', fontWeight: 700, background: dias > 30 ? '#fef2f2' : '#fffbeb', color: dias > 30 ? '#dc2626' : '#d97706', border: `1px solid ${dias > 30 ? '#fca5a5' : '#fcd34d'}`, padding: '.15rem .55rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                          {dias}d sem contato
                        </span>
                      )}
                      <a href={`/comercial/registros/novo?escola=${e.id}`} onClick={(evt) => evt.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 7, background: '#d97706', color: '#fff', textDecoration: 'none', fontSize: '1rem', fontWeight: 700, flexShrink: 0 }} title="Registrar contato">
                        +
                      </a>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto .75rem' }}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', color: '#16a34a', marginBottom: '.2rem' }}>Tudo em dia!</div>
                <div style={{ fontSize: '.78rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>Todas as escolas foram contatadas recentemente.</div>
              </div>
            )}
          </div>

        </div>

        {/* ── Escolas aguardando início de negociação ───────────── */}
        {escolasSemNegociacao.length > 0 && (
          <div style={card}>
            <div style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                    Aguardando Início de Negociação
                  </div>
                  <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.6)', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>
                    Escolas cadastradas que ainda não receberam nenhum contato registrado
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '.68rem', fontWeight: 700, background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', padding: '.2rem .65rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                {escolasSemNegociacao.length} escola{escolasSemNegociacao.length > 1 ? 's' : ''}
              </span>
            </div>

            <div style={{ padding: '.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.5rem' }}>
              {escolasSemNegociacao.slice(0, 12).map((e: any) => {
                const diasCadastro = Math.floor((Date.now() - new Date(e.created_at).getTime()) / 86400000)
                return (
                  <div key={e.id} style={{
                    display: 'flex', alignItems: 'center', gap: '.75rem',
                    padding: '.7rem .9rem', background: '#faf5ff',
                    border: '1px solid #e9d5ff', borderLeft: '3px solid #7c3aed',
                    borderRadius: 10, transition: 'box-shadow .15s',
                  }}>
                    {/* Avatar inicial */}
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.75rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', flexShrink: 0 }}>
                      {e.nome[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {e.nome}
                      </div>
                      <div style={{ fontSize: '.65rem', color: '#7c3aed', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>
                        {e.cidade}{e.estado ? `, ${e.estado}` : ''}
                        {e.responsavel?.full_name && (
                          <span style={{ color: '#94a3b8', marginLeft: '.3rem' }}>· {e.responsavel.full_name}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '.3rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '.58rem', fontWeight: 700, background: '#ede9fe', color: '#7c3aed', padding: '.1rem .4rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                        {diasCadastro === 0 ? 'Hoje' : `${diasCadastro}d cadastrada`}
                      </span>
                      <Link href={`/comercial/registros/novo?escola=${e.id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem', fontSize: '.65rem', fontWeight: 700, color: '#fff', background: '#7c3aed', padding: '.2rem .55rem', borderRadius: 99, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Iniciar contato
                      </Link>
                    </div>
                  </div>
                )
              })}
              {escolasSemNegociacao.length > 12 && (
                <Link href="/comercial/escolas" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '.7rem', background: '#f5f3ff', border: '1px dashed #c4b5fd', borderRadius: 10, textDecoration: 'none', fontSize: '.75rem', fontWeight: 600, color: '#7c3aed', fontFamily: 'var(--font-montserrat,sans-serif)', gap: '.3rem' }}>
                  <ArrowRight size={13} /> Ver mais {escolasSemNegociacao.length - 12} escolas
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ── Acesso rápido aos módulos ─────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {[
            { label: 'Nova Escola',       href: '/comercial/escolas/nova',    cor: '#d97706', desc: 'Cadastrar parceiro' },
            { label: 'Novo Registro',     href: '/comercial/registros/novo',  cor: '#0d9488', desc: 'Registrar interação' },
            { label: 'Ver Pipeline',      href: '/comercial/pipeline',        cor: '#7c3aed', desc: 'Kanban de negociações' },
            { label: 'Jornada Visual',    href: '/comercial/jornada-visual',  cor: '#2563eb', desc: 'Infográfico do processo' },
          ].map(item => (
            <Link key={item.label} href={item.href} style={{
              display: 'block', background: '#fff', border: '1px solid #e2e8f0',
              borderLeft: `4px solid ${item.cor}`, borderRadius: 12,
              padding: '.85rem 1.1rem', textDecoration: 'none',
              boxShadow: '0 1px 4px rgba(15,23,42,.04)', transition: 'box-shadow .2s, transform .2s',
            }}
            >
              <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.15rem' }}>{item.label}</div>
              <div style={{ fontSize: '.72rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>{item.desc}</div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
