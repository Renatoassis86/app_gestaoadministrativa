'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'

interface Resultado {
  preco_final: number
  valor_parcela: number
  liquido_desejado: number
  liquido_real: number
  taxa_cartao_pct: number
  taxa_total_pct: number
  taxa_fixa: number
  diferenca: number
  parcela_valida: boolean
}

function calcular(valor: number, comissao: number, parcelas: number): Resultado {
  const taxa_plataforma = 0.015
  const taxa_fixa_parcela = 0.30
  const valor_min_parcela = 30.00
  const taxa_cartao = parcelas === 1 ? 0.0289 : parcelas <= 6 ? 0.0299 : 0.0369

  const liquido_desejado = valor * (1 + comissao / 100)
  const taxa_fixa = taxa_fixa_parcela * parcelas
  const denominador = 1 - taxa_plataforma - taxa_cartao
  const preco_final = Math.ceil(((liquido_desejado + taxa_fixa) / denominador) * 100) / 100
  const valor_parcela = Math.round((preco_final / parcelas) * 100) / 100
  const liquido_real = preco_final * denominador - taxa_fixa

  return {
    preco_final,
    valor_parcela,
    liquido_desejado,
    liquido_real,
    taxa_cartao_pct: taxa_cartao * 100,
    taxa_total_pct: (taxa_plataforma + taxa_cartao) * 100,
    taxa_fixa,
    diferenca: liquido_real - liquido_desejado,
    parcela_valida: valor_parcela >= valor_min_parcela,
  }
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function CalculadoraPage() {
  const [valor, setValor] = useState(1000)
  const [comissao, setComissao] = useState(20)
  const [parcelas, setParcelas] = useState(1)
  const [calculado, setCalculado] = useState(false)

  const resultado = calculado ? calcular(valor, comissao, parcelas) : null
  const tabela = calculado ? Array.from({ length: 12 }, (_, i) => ({ p: i + 1, ...calcular(valor, comissao, i + 1) })) : []

  return (
    <div>
      <PageHeader title="Calculadora Eskolare" subtitle="Simulação de preços e parcelamentos" />
      <div className="p-6">
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* Form */}
          <div className="card">
            <div className="card-header"><span className="card-title">Parâmetros</span></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Valor do Produto (R$)</label>
                <input type="number" className="form-control" value={valor} min={0.01} step={0.01}
                  onChange={e => setValor(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="form-label">Comissão Desejada (%)</label>
                <input type="number" className="form-control" value={comissao} min={0} max={100} step={0.1}
                  onChange={e => setComissao(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <label className="form-label">Número de Parcelas</label>
                <select className="form-control" value={parcelas} onChange={e => setParcelas(parseInt(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n === 1 ? 'À vista (1x)' : `${n}x`}</option>
                  ))}
                </select>
              </div>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }}
                onClick={() => setCalculado(true)}>
                Calcular
              </button>

              {/* Tabela de taxas */}
              <div style={{ marginTop: '.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <div className="form-section-title">Taxas Eskolare</div>
                {[
                  ['Taxa da plataforma', '1,5%'],
                  ['Taxa cartão 1x', '2,89%'],
                  ['Taxa cartão 2x–6x', '2,99%'],
                  ['Taxa cartão 7x–12x', '3,69%'],
                  ['Taxa fixa por parcela', 'R$ 0,30'],
                  ['Mínimo por parcela', 'R$ 30,00'],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', padding: '.2rem 0' }}>
                    <span style={{ color: 'var(--text-s)' }}>{l}</span>
                    <strong>{v}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div>
            {resultado ? (
              <>
                {!resultado.parcela_valida && (
                  <div className="alert alert-warning mb-4">
                    ⚠️ Valor por parcela ({fmt(resultado.valor_parcela)}) abaixo do mínimo de R$ 30,00. Reduza o número de parcelas.
                  </div>
                )}

                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="kpi-card">
                    <div className="kpi-label">Preço Final</div>
                    <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--brand-orange)' }}>{fmt(resultado.preco_final)}</div>
                    <div className="kpi-sub">ao aluno</div>
                  </div>
                  <div className="kpi-card teal">
                    <div className="kpi-label">Por Parcela</div>
                    <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--brand-teal)' }}>{fmt(resultado.valor_parcela)}</div>
                    <div className="kpi-sub">em {parcelas}x</div>
                  </div>
                  <div className="kpi-card success">
                    <div className="kpi-label">Líquido Real</div>
                    <div className="kpi-value" style={{ fontSize: '1.4rem', color: 'var(--success)' }}>{fmt(resultado.liquido_real)}</div>
                    <div className="kpi-sub">após taxas</div>
                  </div>
                  <div className={`kpi-card ${resultado.diferenca < 0 ? 'danger' : 'success'}`}>
                    <div className="kpi-label">Diferença</div>
                    <div className="kpi-value" style={{ fontSize: '1.4rem', color: resultado.diferenca < 0 ? 'var(--danger)' : 'var(--success)' }}>
                      {fmt(resultado.diferenca)}
                    </div>
                    <div className="kpi-sub">vs. líquido desejado</div>
                  </div>
                </div>

                {/* Detalhamento */}
                <div className="card mb-4">
                  <div className="card-header"><span className="card-title">Detalhamento do Cálculo</span></div>
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <div className="form-section-title">Valores Base</div>
                        {[['Produto', fmt(valor)], ['Comissão', `${comissao}%`], ['Líquido Desejado', fmt(resultado.liquido_desejado)]].map(([l,v]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '.2rem 0' }}>
                            <span style={{ color: 'var(--text-s)' }}>{l}</span><strong>{v}</strong>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="form-section-title">Taxas Aplicadas</div>
                        {[['Plataforma', '1,5%'], ['Cartão', `${resultado.taxa_cartao_pct.toFixed(2)}%`], ['Taxa fixa', fmt(resultado.taxa_fixa)], ['Total taxas', `${resultado.taxa_total_pct.toFixed(2)}%`]].map(([l,v]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '.2rem 0' }}>
                            <span style={{ color: 'var(--danger)' }}>{l}</span><strong style={{ color: 'var(--danger)' }}>–{v}</strong>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div className="form-section-title">Verificação</div>
                        {[['Líquido real', fmt(resultado.liquido_real)], ['Líquido desejado', fmt(resultado.liquido_desejado)]].map(([l,v]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '.2rem 0' }}>
                            <span style={{ color: 'var(--text-s)' }}>{l}</span><strong>{v}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabela comparativa */}
                <div className="card">
                  <div className="card-header"><span className="card-title">Comparativo de Parcelamentos</span></div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr><th>Parcelas</th><th>Taxa Cartão</th><th>Preço Final</th><th>Valor Parcela</th><th>Líquido Real</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {tabela.map(row => (
                          <tr key={row.p} style={row.p === parcelas ? { background: 'rgba(245,130,32,.08)', fontWeight: 600 } : {}}>
                            <td>{row.p === 1 ? 'À vista' : `${row.p}x`}</td>
                            <td>{row.taxa_cartao_pct.toFixed(2)}%</td>
                            <td>{fmt(row.preco_final)}</td>
                            <td>{fmt(row.valor_parcela)}</td>
                            <td>{fmt(row.liquido_real)}</td>
                            <td>{row.parcela_valida ? <span className="badge badge-green">OK</span> : <span className="badge badge-red">Abaixo mín.</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '4rem 1rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧮</div>
                <h3>Informe os dados e clique em Calcular</h3>
                <p>A calculadora simula o preço final e a margem líquida após todas as taxas da plataforma Eskolare.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
