import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getFilaPriorizacao, PRESCRICAO_LABEL, PRESCRICAO_COR, type Prescricao } from '@/lib/priorizacao'
import { LABEL } from '@/types/database'
import { PriorizacaoCharts } from '@/components/comercial/PriorizacaoCharts'
import { Download } from 'lucide-react'

const card: React.CSSProperties = {
  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16,
  overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)',
}

interface Props {
  searchParams: Promise<{ uf?: string; perfil?: string; prescricao?: string }>
}

export default async function PriorizacaoPage({ searchParams }: Props) {
  const params = await searchParams
  const uf = params.uf ?? ''
  const perfil = params.perfil ?? ''
  const prescricaoFiltro = (params.prescricao ?? '') as Prescricao | ''

  const fila = await getFilaPriorizacao()

  let linhas = fila.filaAbordagem
  if (uf) linhas = linhas.filter(e => e.estado === uf)
  if (perfil) linhas = linhas.filter(e => e.perfil_pedagogico === perfil)
  if (prescricaoFiltro) linhas = linhas.filter(e => e.prescricao === prescricaoFiltro)

  const ufsDisponiveis = [...new Set(fila.filaAbordagem.map(e => e.estado).filter(Boolean))].sort() as string[]

  const kpis = [
    { label: 'Fila de Abordagem', value: fila.resumo.totalFila, sub: 'escolas priorizadas', cor: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
    { label: 'Ação Urgente', value: fila.resumo.acaoUrgente, sub: 'fechamento pendente', cor: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
    { label: 'Aguardando Cadastro', value: fila.resumo.aguardandoCadastro, sub: 'sem porte/potencial', cor: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
    { label: 'Parceiras Ativas', value: fila.resumo.clientesAtivos, sub: 'contrato assinado', cor: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
  ]

  return (
    <div>
      <PageHeader
        title="Priorização Comercial"
        subtitle="Segmentação de escolas por potencial e prontidão"
        actions={
          <a href="/api/priorizacao-export" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', padding: '.45rem 1rem', borderRadius: 9999, background: '#d97706', color: '#fff', textDecoration: 'none', fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: '0 4px 12px rgba(217,119,6,.3)' }}>
            <Download size={13} /> Baixar planilha
          </a>
        }
      />

      <div style={{ padding: '1.75rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
          {kpis.map(k => (
            <div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderTop: `3px solid ${k.cor}`, borderRadius: 14, padding: '1.1rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,.04)' }}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: k.cor, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.4rem' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: '.3rem' }}>{k.value}</div>
              <div style={{ fontSize: '.72rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Painel analítico ───────────────────────────────────── */}
        <PriorizacaoCharts
          porEstado={fila.distribuicaoPorEstado}
          porPerfil={fila.distribuicaoPorPerfil}
          porEstagio={fila.distribuicaoPorEstagio}
        />

        {/* ── Metodologia (curto) ────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16, padding: '1.1rem 1.5rem' }}>
          <div style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', color: '#d97706', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            Como o score é calculado
          </div>
          <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.65)', lineHeight: 1.6, fontFamily: 'var(--font-inter,sans-serif)', margin: 0 }}>
            Potencial financeiro (35%) + afinidade de perfil pedagógico (20%) + PIB per capita da UF (15%) + estágio no funil / prontidão (20%) + recência do último contato (10%).
            Escolas já parceiras (contrato assinado) saem da fila; escolas sem potencial/porte cadastrado vão para a fila de completar cadastro.
          </p>
        </div>

        {/* ── Filtros ────────────────────────────────────────────── */}
        <form style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,.04)' }}>
          <select name="uf" defaultValue={uf} style={{ padding: '.5rem .75rem', fontSize: '.8rem', border: '1.5px solid #e2e8f0', borderRadius: 8, color: '#0f172a', background: '#f8fafc', fontFamily: 'var(--font-inter,sans-serif)' }}>
            <option value="">Todos os estados</option>
            {ufsDisponiveis.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select name="perfil" defaultValue={perfil} style={{ padding: '.5rem .75rem', fontSize: '.8rem', border: '1.5px solid #e2e8f0', borderRadius: 8, color: '#0f172a', background: '#f8fafc', fontFamily: 'var(--font-inter,sans-serif)' }}>
            <option value="">Todos os perfis</option>
            {Object.entries(LABEL.perfil_pedagogico).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select name="prescricao" defaultValue={prescricaoFiltro} style={{ padding: '.5rem .75rem', fontSize: '.8rem', border: '1.5px solid #e2e8f0', borderRadius: 8, color: '#0f172a', background: '#f8fafc', fontFamily: 'var(--font-inter,sans-serif)' }}>
            <option value="">Todas as prescrições</option>
            {Object.entries(PRESCRICAO_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button type="submit" style={{ background: '#0f172a', color: '#fff', padding: '9px 18px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '.82rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            Filtrar
          </button>
          {(uf || perfil || prescricaoFiltro) && <Link href="/comercial/priorizacao" style={{ fontSize: '.78rem', color: '#475569', textDecoration: 'none' }}>Limpar</Link>}
        </form>

        {/* ── Fila de abordagem ──────────────────────────────────── */}
        <div style={card}>
          <div style={{ background: '#0f172a', padding: '1rem 1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
              Fila de Abordagem Priorizada
            </div>
            <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>
              {linhas.length} escola{linhas.length !== 1 ? 's' : ''} — ordenada por score, do maior para o menor
            </div>
          </div>

          {linhas.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Escola', 'Cidade/UF', 'Perfil', 'Potencial', 'Estágio', 'Último contato', 'Score', 'Prescrição', ''].map(col => (
                      <th key={col} style={{ padding: '.65rem 1rem', textAlign: 'left', fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((e, idx) => {
                    const cor = PRESCRICAO_COR[e.prescricao]
                    return (
                      <tr key={e.id} style={{ borderTop: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding: '.75rem 1rem', maxWidth: 200 }}>
                          <Link href={`/comercial/escolas/${e.id}`} style={{ fontWeight: 700, fontSize: '.8rem', color: '#0f172a', textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {e.nome}
                          </Link>
                          {e.responsavel_nome && <div style={{ fontSize: '.65rem', color: '#94a3b8' }}>{e.responsavel_nome}</div>}
                        </td>
                        <td style={{ padding: '.75rem 1rem', fontSize: '.78rem', color: '#475569', whiteSpace: 'nowrap' }}>
                          {e.cidade ? `${e.cidade}/${e.estado}` : (e.estado ?? '—')}
                        </td>
                        <td style={{ padding: '.75rem 1rem', fontSize: '.75rem', color: '#475569', whiteSpace: 'nowrap' }}>
                          {LABEL.perfil_pedagogico[e.perfil_pedagogico] ?? e.perfil_pedagogico}
                        </td>
                        <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-cormorant,serif)', whiteSpace: 'nowrap' }}>
                          {formatCurrency(e.potencial_financeiro)}
                        </td>
                        <td style={{ padding: '.75rem 1rem', fontSize: '.72rem', color: '#475569', whiteSpace: 'nowrap' }}>
                          {e.estagioLabel}
                        </td>
                        <td style={{ padding: '.75rem 1rem', fontSize: '.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {formatDate(e.ultimo_contato)}
                        </td>
                        <td style={{ padding: '.75rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                            <div style={{ width: 34, height: 6, borderRadius: 99, background: '#f1f5f9', overflow: 'hidden' }}>
                              <div style={{ width: `${e.score}%`, height: '100%', background: '#d97706' }} />
                            </div>
                            <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{e.score}</span>
                          </div>
                        </td>
                        <td style={{ padding: '.75rem 1rem' }}>
                          <span style={{ fontSize: '.65rem', fontWeight: 700, background: cor.bg, color: cor.text, border: `1px solid ${cor.border}`, padding: '.2rem .55rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                            {PRESCRICAO_LABEL[e.prescricao]}
                          </span>
                        </td>
                        <td style={{ padding: '.75rem 1rem' }}>
                          <Link href={`/comercial/registros/novo?escola=${e.id}`} style={{ fontSize: '.7rem', fontWeight: 700, color: '#d97706', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                            Registrar →
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 2rem', color: '#94a3b8', fontSize: '.85rem' }}>
              Nenhuma escola encontrada com esses filtros.
            </div>
          )}
        </div>

        {/* ── Fila: completar cadastro ───────────────────────────── */}
        {fila.filaCompletarCadastro.length > 0 && (
          <div style={card}>
            <div style={{ background: '#475569', padding: '1rem 1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                Completar Cadastro
              </div>
              <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.6)', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>
                {fila.filaCompletarCadastro.length} escolas sem porte/potencial financeiro preenchido — fora do ranking até o cadastro ser completado
              </div>
            </div>
            <div style={{ padding: '.75rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.5rem' }}>
              {fila.filaCompletarCadastro.slice(0, 24).map(e => (
                <Link key={e.id} href={`/comercial/escolas/${e.id}`} style={{
                  display: 'flex', alignItems: 'center', gap: '.7rem', padding: '.6rem .8rem',
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, textDecoration: 'none',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.78rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      {e.nome}
                    </div>
                    <div style={{ fontSize: '.65rem', color: '#94a3b8' }}>{e.cidade}{e.estado ? `, ${e.estado}` : ''}</div>
                  </div>
                </Link>
              ))}
              {fila.filaCompletarCadastro.length > 24 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '.6rem', fontSize: '.75rem', color: '#64748b' }}>
                  + {fila.filaCompletarCadastro.length - 24} escolas
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
