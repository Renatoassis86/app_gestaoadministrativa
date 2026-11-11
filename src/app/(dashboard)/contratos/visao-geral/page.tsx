import Link from 'next/link'
import { carregarContratos } from '@/lib/contratos-data'
import { MODALIDADES, STATUS_CONTRATO, brl, fmtData, pendencias, progressoVigencia, totalKits, totalValor, type Modalidade } from '@/lib/contratos'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Contratos Education' }

function Kpi({ rotulo, valor, sub }: { rotulo: string; valor: string; sub?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.1rem' }}>
      <div style={{ fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b' }}>{rotulo}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginTop: '.2rem' }}>{valor}</div>
      {sub && <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: '.15rem' }}>{sub}</div>}
    </div>
  )
}

export default async function ContratosVisaoGeral() {
  const { itens, erro } = await carregarContratos()

  if (erro) {
    return (
      <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1rem', color: '#991b1b', fontSize: '.9rem' }}>
        Não foi possível carregar os contratos: {erro}<br />
        <span style={{ fontSize: '.8rem' }}>Se este é o primeiro acesso ao módulo, confirme que o SQL <code>add_modulo_contratos_education.sql</code> foi executado no Supabase.</span>
      </div>
    )
  }

  const linhas = itens.map(i => {
    const ano = i.c.ano_letivo_inicial as number | null
    const calc = totalValor(i.series, ano)
    return { ...i, kits: totalKits(i.series, ano), calc, valor: (i.c.valor_total as number | null) ?? calc,
             diverge: i.c.valor_total != null && i.series.length > 0 && Math.abs(i.c.valor_total - calc) > 0.005 }
  })
  const total = linhas.reduce((a, l) => a + l.valor, 0)
  const kits = linhas.reduce((a, l) => a + l.kits, 0)
  const assinados = linhas.filter(l => l.c.contrato_assinado).length
  const porModelo = (m: Modalidade) => linhas.filter(l => l.c.modalidade === m)
  const ranking = [...linhas].sort((a, b) => b.valor - a.valor).slice(0, 8)
  const maior = ranking[0]?.valor || 1
  const divergentes = linhas.filter(l => l.diverge)
  const comPendencia = linhas.filter(l => pendencias(l.c).length > 0)

  if (!linhas.length) {
    return (
      <div style={{ background: '#fff', border: '1px dashed #cbd5e1', borderRadius: 14, padding: '2.5rem', textAlign: 'center', color: '#475569' }}>
        Nenhum contrato Education cadastrado ainda.<br />
        <Link href="/contratos/novo" style={{ color: '#0ea5e9', fontWeight: 700 }}>Cadastrar o primeiro contrato →</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '.9rem' }}>
        <Kpi rotulo="Contratos" valor={String(linhas.length)} sub={`${assinados} assinado(s)`} />
        <Kpi rotulo="Valor do 1º ano" valor={brl(total)} sub="soma dos contratos" />
        <Kpi rotulo="Kits previstos" valor={kits.toLocaleString('pt-BR')} sub="ano letivo inicial" />
        <Kpi rotulo="Boleto" valor={String(porModelo('boleto').length)} sub={brl(porModelo('boleto').reduce((a, l) => a + l.valor, 0))} />
        <Kpi rotulo="Eskolare" valor={String(porModelo('eskolare').length)} sub={brl(porModelo('eskolare').reduce((a, l) => a + l.valor, 0))} />
      </div>

      {divergentes.length > 0 && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12, padding: '.85rem 1rem', fontSize: '.85rem', color: '#92400e' }}>
          <strong>Valor informado diferente do cálculo por série:</strong>{' '}
          {divergentes.map(d => `${d.escola.razao_social ?? d.escola.nome} (informado ${brl(d.c.valor_total)} × calculado ${brl(d.calc)})`).join(' · ')}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem' }}>
          <h2 style={{ fontSize: '.95rem', fontWeight: 800, marginBottom: '.8rem' }}>Ranking por valor (1º ano)</h2>
          <div style={{ display: 'grid', gap: '.6rem' }}>
            {ranking.map(l => (
              <div key={l.c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: '.2rem' }}>
                  <span style={{ fontWeight: 600 }}>{l.escola.nome}</span><span>{brl(l.valor)}</span>
                </div>
                <div style={{ height: 8, background: '#f1f5f9', borderRadius: 9999 }}>
                  <div style={{ width: `${(l.valor / maior) * 100}%`, height: '100%', borderRadius: 9999, background: MODALIDADES[l.c.modalidade as Modalidade].cor }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '.9rem', fontSize: '.72rem', color: '#64748b' }}>
            {(Object.keys(MODALIDADES) as Modalidade[]).map(m => (
              <span key={m}><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 9999, background: MODALIDADES[m].cor, marginRight: 4 }} />{MODALIDADES[m].label}</span>
            ))}
          </div>
        </section>

        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem' }}>
          <h2 style={{ fontSize: '.95rem', fontWeight: 800, marginBottom: '.8rem' }}>Vigência e situação</h2>
          <div style={{ display: 'grid', gap: '.75rem' }}>
            {linhas.map(l => {
              const p = progressoVigencia(l.c.vigencia_inicio, l.c.vigencia_fim)
              const st = STATUS_CONTRATO[l.c.status] ?? STATUS_CONTRATO.rascunho
              return (
                <div key={l.c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', fontSize: '.8rem' }}>
                    <span style={{ fontWeight: 600 }}>{l.escola.nome}</span>
                    <span style={{ background: st.bg, color: st.cor, borderRadius: 9999, padding: '.1rem .55rem', fontSize: '.68rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{st.label}</span>
                  </div>
                  {p != null ? (
                    <div style={{ marginTop: '.3rem' }}>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 9999 }}><div style={{ width: `${p}%`, height: '100%', background: '#0ea5e9', borderRadius: 9999 }} /></div>
                      <div style={{ fontSize: '.68rem', color: '#64748b', marginTop: '.15rem' }}>{fmtData(l.c.vigencia_inicio)} → {fmtData(l.c.vigencia_fim)} ({p}%)</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '.7rem', color: '#94a3b8', marginTop: '.2rem' }}>Vigência ainda não definida (assinatura pendente)</div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {comPendencia.length > 0 && (
        <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem' }}>
          <h2 style={{ fontSize: '.95rem', fontWeight: 800, marginBottom: '.6rem' }}>Dados que ainda faltam para fechar o contrato</h2>
          <div style={{ display: 'grid', gap: '.5rem' }}>
            {comPendencia.map(l => (
              <div key={l.c.id} style={{ fontSize: '.82rem' }}>
                <Link href={`/contratos/${l.escola.id}/editar`} style={{ fontWeight: 700, color: '#0369a1' }}>{l.escola.nome}</Link>
                <span style={{ color: '#64748b' }}> — {pendencias(l.c).join(', ')}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
