import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/lib/actions'
import { ClipboardList, School, Users2, CalendarRange, ExternalLink, LogOut, Inbox } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SERIES = [
  ['Infantil II', 'infantil2_qtd'],
  ['Infantil III', 'infantil3_qtd'],
  ['Infantil IV', 'infantil4_qtd'],
  ['Infantil V', 'infantil5_qtd'],
  ['1º ano Fund I', 'fund1_ano1_qtd'],
  ['2º ano Fund I', 'fund1_ano2_qtd'],
  ['3º ano Fund I', 'fund1_ano3_qtd'],
  ['4º ano Fund I', 'fund1_ano4_qtd'],
  ['5º ano Fund I', 'fund1_ano5_qtd'],
] as const

const STATUS: Record<string, { label: string; cor: string; bg: string; border: string }> = {
  recebido:   { label: 'Recebido',   cor: '#0ea5e9', bg: '#eff6ff', border: '#bfdbfe' },
  em_analise: { label: 'Em análise', cor: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  confirmado: { label: 'Confirmado', cor: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
}

function totalAlunosDaLinha(p: Record<string, any>) {
  return SERIES.reduce((soma, [, key]) => soma + (Number(p[key]) || 0), 0)
}

export default async function PedidosDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/hub/pedidos/login')

  const { data } = await supabase
    .from('previsoes_pedidos')
    .select('*')
    .order('created_at', { ascending: false })

  const previsoes = data ?? []

  const totalPrevisoes = previsoes.length
  const totalEscolas = new Set(previsoes.map(p => (p.cnpj || p.nome_instituicao || '').toLowerCase())).size
  const totalAlunos = previsoes.reduce((soma, p) => soma + totalAlunosDaLinha(p), 0)
  const anoLetivoFoco = previsoes[0]?.ano_letivo ?? new Date().getFullYear() + 1

  const totalPorSerie = SERIES.map(([label, key]) => ({
    label,
    total: previsoes.reduce((soma, p) => soma + (Number(p[key]) || 0), 0),
  }))
  const maiorSerie = Math.max(1, ...totalPorSerie.map(s => s.total))

  const kpis = [
    { label: 'Previsões recebidas', value: totalPrevisoes, icon: Inbox,        cor: '#0ea5e9', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Escolas parceiras',   value: totalEscolas,   icon: School,       cor: '#7c3aed', bg: '#faf5ff', border: '#d8b4fe' },
    { label: 'Alunos previstos',    value: totalAlunos,    icon: Users2,       cor: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
    { label: 'Ano letivo em foco',  value: anoLetivoFoco,  icon: CalendarRange, cor: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#F7FAFC' }}>

      <header style={{
        height: 68, background: '#fff', borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 1px 0 rgba(15,23,42,.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem', position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ClipboardList size={19} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>
              Gestão de Pedidos
            </h1>
            <span style={{ fontSize: '.78rem', color: '#64748b', fontFamily: 'var(--font-inter, sans-serif)' }}>
              Previsões enviadas pelas escolas parceiras
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
          <Link href="/formulario-pedidos" target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            border: '1px solid #bae6fd', color: '#0369a1', background: '#f0f9ff',
            padding: '.5rem 1rem', borderRadius: 9999,
            fontSize: '.78rem', fontWeight: 700, textDecoration: 'none',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}>
            Ver formulário público <ExternalLink size={13} />
          </Link>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            color: '#475569', fontSize: '.78rem', fontWeight: 700,
            textDecoration: 'none', fontFamily: 'var(--font-montserrat, sans-serif)',
            padding: '.5rem .75rem',
          }}>
            Voltar ao Hub
          </Link>
          <form action={signOut}>
            <button type="submit" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              border: '1px solid #E2E8F0', background: '#fff', color: '#475569',
              padding: '.5rem 1rem', borderRadius: 9999, cursor: 'pointer',
              fontSize: '.78rem', fontWeight: 700,
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}>
              <LogOut size={13} /> Sair
            </button>
          </form>
        </div>
      </header>

      <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.85rem' }}>
          {kpis.map(k => {
            const Icon = k.icon
            return (
              <div key={k.label} style={{
                background: k.bg, border: `1.5px solid ${k.border}`, borderTop: `3px solid ${k.cor}`,
                borderRadius: 12, padding: '.9rem 1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.35rem' }}>
                  <Icon size={14} color={k.cor} />
                  <div style={{ fontSize: '.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: k.cor, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                    {k.label}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                  {k.value}
                </div>
              </div>
            )
          })}
        </div>

        {totalPrevisoes === 0 ? (
          <div style={{
            background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 12,
            padding: '3rem 2rem', textAlign: 'center',
          }}>
            <Inbox size={40} color="#cbd5e1" style={{ marginBottom: '.75rem' }} />
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '.4rem' }}>
              Nenhuma previsão recebida ainda
            </div>
            <p style={{ fontSize: '.85rem', color: '#64748b', maxWidth: 480, margin: '0 auto 1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
              Compartilhe o formulário público com as escolas parceiras. Assim que a primeira previsão for enviada, ela aparece aqui automaticamente.
            </p>
            <Link href="/formulario-pedidos" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: '#0ea5e9', color: '#fff', padding: '.6rem 1.35rem', borderRadius: 9999,
              fontSize: '.82rem', fontWeight: 700, textDecoration: 'none',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}>
              Abrir formulário público <ExternalLink size={14} />
            </Link>
          </div>
        ) : (
          <>
            {/* Previsão por série */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '1.25rem 1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
                Previsão de alunos por série — {anoLetivoFoco}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {totalPorSerie.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                    <div style={{ width: 110, flexShrink: 0, fontSize: '.78rem', color: '#334155', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      {s.label}
                    </div>
                    <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 6, height: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${(s.total / maiorSerie) * 100}%`, background: '#0ea5e9', height: '100%', borderRadius: 6 }} />
                    </div>
                    <div style={{ width: 40, textAlign: 'right', fontSize: '.8rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      {s.total}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabela de previsões */}
            <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid #E2E8F0', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                Previsões enviadas
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                      {['Instituição', 'CNPJ', 'Responsável', 'Telefone', 'Ano letivo', 'Alunos previstos', 'Status', 'Enviado em'].map(h => (
                        <th key={h} style={{ padding: '.7rem 1rem', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previsoes.map(p => {
                      const st = STATUS[p.status] ?? STATUS.recebido
                      return (
                        <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '.7rem 1rem', fontWeight: 600, color: '#0f172a' }}>{p.nome_instituicao}</td>
                          <td style={{ padding: '.7rem 1rem', color: '#475569' }}>{p.cnpj || '—'}</td>
                          <td style={{ padding: '.7rem 1rem', color: '#475569' }}>{p.responsavel_nome}</td>
                          <td style={{ padding: '.7rem 1rem', color: '#475569', whiteSpace: 'nowrap' }}>{p.responsavel_telefone}</td>
                          <td style={{ padding: '.7rem 1rem', color: '#475569' }}>{p.ano_letivo}</td>
                          <td style={{ padding: '.7rem 1rem', fontWeight: 700, color: '#0f172a' }}>{totalAlunosDaLinha(p)}</td>
                          <td style={{ padding: '.7rem 1rem' }}>
                            <span style={{
                              display: 'inline-block', padding: '.2rem .6rem', borderRadius: 9999,
                              fontSize: '.7rem', fontWeight: 700,
                              background: st.bg, color: st.cor, border: `1px solid ${st.border}`,
                            }}>
                              {st.label}
                            </span>
                          </td>
                          <td style={{ padding: '.7rem 1rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                            {new Date(p.created_at).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
