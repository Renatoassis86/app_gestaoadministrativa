import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Plus, Globe, FileText, ClipboardList } from 'lucide-react'
import { LABEL } from '@/types/database'
import { PACOTE_NOMES } from '@/lib/bilinguismo-constants'

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
    { data: todasEscolas },
    { data: escolasComRegistro },
    { data: propostasPaideia },
    { data: propostasBilinguismo },
  ] = await Promise.all([
    supabase.from('escolas').select('*', { count: 'exact', head: true }).eq('ativa', true),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'quente').eq('ativa', true),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'morno').eq('ativa', true),
    supabase.from('registros').select('*', { count: 'exact', head: true }).eq('ativa', true),
    supabase.from('registros')
      .select('*, escola:escolas(nome,id,cidade,estado)')
      .eq('ativa', true)
      .order('data_contato', { ascending: false })
      .limit(8),
    supabase.from('escolas')
      .select('id, nome, cidade, estado, created_at, responsavel_id, responsavel:profiles!responsavel_id(full_name)')
      .eq('ativa', true)
      .order('created_at', { ascending: false }),
    supabase.from('registros')
      .select('escola_id')
      .eq('ativa', true),
    supabase.from('formularios')
      .select('id, nome_escola, email_responsavel, cnpj, data_envio, cidade, estado')
      .order('data_envio', { ascending: false })
      .limit(5),
    supabase.from('formularios_bilinguismo')
      .select('id, nome_escola, email_responsavel, cnpj, data_envio, pacote_interesse, nome_representante_legal, cidade, estado')
      .order('data_envio', { ascending: false })
      .limit(5),
  ])

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

        {/* ── SEÇÃO PROPOSTAS COMERCIAIS (PAIDEIA & BILINGUISMO) ────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          
          {/* Card Propostas Paideia */}
          <div style={card}>
            <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <FileText size={16} color="#d97706" /> Propostas Paideia Recebidas
                </div>
                <div style={{ fontSize: '.68rem', color: '#d97706', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600, marginTop: '.1rem' }}>
                  Formulário Currículo Paideia
                </div>
              </div>
              <Link href="/comercial/proposta?tipo=paideia" style={{ fontSize: '.72rem', color: '#fbbf24', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Ver todas →
              </Link>
            </div>

            {propostasPaideia && propostasPaideia.length > 0 ? (
              <div style={{ padding: '.75rem' }}>
                {propostasPaideia.map((p: any, idx: number) => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.85rem',
                    padding: '.65rem .85rem', borderRadius: 10,
                    marginBottom: idx < propostasPaideia.length - 1 ? '.3rem' : 0,
                    background: idx % 2 === 0 ? '#fafafa' : '#fff', border: '1px solid #f1f5f9',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {p.nome_escola}
                      </div>
                      <div style={{ fontSize: '.68rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        {p.email_responsavel} · {p.cidade ? `${p.cidade}/${p.estado || ''}` : p.cnpj || '—'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '.68rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        {formatDate(p.data_envio)}
                      </div>
                      <span style={{ fontSize: '.6rem', fontWeight: 800, background: '#fffbeb', color: '#d97706', border: '1px solid #fcd34d', padding: '.05rem .45rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', marginTop: '.15rem', display: 'inline-block' }}>
                        Paideia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '.82rem' }}>
                Nenhuma proposta do Currículo Paideia recebida ainda.
              </div>
            )}
          </div>

          {/* Card Propostas Bilinguismo */}
          <div style={card}>
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                  <Globe size={16} color="#38bdf8" /> Propostas Bilinguismo Recebidas
                </div>
                <div style={{ fontSize: '.68rem', color: '#38bdf8', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600, marginTop: '.1rem' }}>
                  Formulário Parceria de Inglês
                </div>
              </div>
              <Link href="/comercial/proposta?tipo=bilinguismo" style={{ fontSize: '.72rem', color: '#7dd3fc', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Ver todas →
              </Link>
            </div>

            {propostasBilinguismo && propostasBilinguismo.length > 0 ? (
              <div style={{ padding: '.75rem' }}>
                {propostasBilinguismo.map((p: any, idx: number) => {
                  const badgeColor = p.pacote_interesse === 'gold' ? { bg: '#f5f3ff', text: '#4f46e5', border: '#c4b5fd' }
                    : p.pacote_interesse === 'silver' ? { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' }
                    : { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' }
                  const pacoteNome = PACOTE_NOMES[p.pacote_interesse] || p.pacote_interesse

                  return (
                    <div key={p.id} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.85rem',
                      padding: '.65rem .85rem', borderRadius: 10,
                      marginBottom: idx < propostasBilinguismo.length - 1 ? '.3rem' : 0,
                      background: idx % 2 === 0 ? '#f8fafc' : '#fff', border: '1px solid #f1f5f9',
                    }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          {p.nome_escola}
                        </div>
                        <div style={{ fontSize: '.68rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          Rep: {p.nome_representante_legal || '—'} · {p.email_responsavel}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '.68rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          {formatDate(p.data_envio)}
                        </div>
                        <span style={{ fontSize: '.6rem', fontWeight: 800, background: badgeColor.bg, color: badgeColor.text, border: `1px solid ${badgeColor.border}`, padding: '.05rem .45rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', marginTop: '.15rem', display: 'inline-block' }}>
                          {pacoteNome}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8', fontSize: '.82rem' }}>
                Nenhuma proposta de Bilinguismo recebida ainda.
              </div>
            )}
          </div>

        </div>

        {/* ── Conteúdo secundário: 2 colunas ─────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          {/* Últimas Interações */}
          <div style={card}>
            <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Últimas Interações</div>
              <Link href="/comercial/registros" style={{ fontSize: '.72rem', color: '#d97706', fontWeight: 600, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Ver todas →
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
                  → Ver mais {escolasSemNegociacao.length - 12} escolas
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
