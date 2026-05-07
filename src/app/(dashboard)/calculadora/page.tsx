'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'

/* ── Lógica de cálculo ──────────────────────────────────────────── */
interface Resultado {
  preco_final: number; valor_parcela: number; liquido_desejado: number
  liquido_real: number; taxa_cartao_pct: number; taxa_total_pct: number
  taxa_fixa: number; taxa_fixa_eskolare: number
  manutencao_total: number; manutencao_por_parcela: number
  diferenca: number; parcela_valida: boolean
}

const MANUTENCAO_MENSAL = 70   // R$ 70,00 por mês de loja ativa
const MESES_LOJA        = 3    // 3 meses de manutenção

function calcular(valor: number, comissao: number, parcelas: number): Resultado {
  const taxa_plataforma    = 0.015
  const taxa_fixa_parcela  = 0.30
  const valor_min_parcela  = 30.00
  const taxa_cartao        = parcelas === 1 ? 0.0289 : parcelas <= 6 ? 0.0299 : 0.0369

  // Manutenção mensal: R$70 × 3 meses, diluída nas parcelas
  const manutencao_total       = MANUTENCAO_MENSAL * MESES_LOJA          // R$ 210,00
  const manutencao_por_parcela = manutencao_total / parcelas              // por parcela

  const liquido_desejado   = valor * (1 + comissao / 100)
  const taxa_fixa_eskolare = taxa_fixa_parcela * parcelas                 // taxa fixa Eskolare

  // Preço final inclui: líquido desejado + taxas Eskolare + manutenção
  const denominador = 1 - taxa_plataforma - taxa_cartao
  const preco_final = Math.ceil(
    ((liquido_desejado + taxa_fixa_eskolare + manutencao_total) / denominador) * 100
  ) / 100
  const valor_parcela = Math.round((preco_final / parcelas) * 100) / 100
  const liquido_real  = preco_final * denominador - taxa_fixa_eskolare - manutencao_total

  return {
    preco_final, valor_parcela, liquido_desejado, liquido_real,
    taxa_cartao_pct: taxa_cartao * 100,
    taxa_total_pct: (taxa_plataforma + taxa_cartao) * 100,
    taxa_fixa: taxa_fixa_eskolare + manutencao_total,
    taxa_fixa_eskolare,
    manutencao_total,
    manutencao_por_parcela,
    diferenca: liquido_real - liquido_desejado,
    parcela_valida: valor_parcela >= valor_min_parcela,
  }
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtPct = (v: number) => v.toFixed(2) + '%'

/* ── Ilustração SVG monocromática ─────────────────────────────── */
function CalcIllustration() {
  return (
    <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 320, display: 'block', margin: '0 auto' }}>
      {/* Calculadora */}
      <rect x="80" y="20" width="160" height="220" rx="16" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="2"/>
      <rect x="95" y="35" width="130" height="55" rx="8" fill="#0f172a"/>
      {/* Display */}
      <text x="215" y="68" textAnchor="end" fill="#d97706" fontSize="20" fontWeight="800" fontFamily="monospace">R$ 1.247</text>
      <text x="215" y="82" textAnchor="end" fill="rgba(255,255,255,.4)" fontSize="10" fontFamily="monospace">12x de R$ 103,92</text>
      {/* Botões linha 1 */}
      {[0,1,2,3].map(i => (
        <rect key={i} x={95+i*34} y={102} width={26} height={22} rx={5} fill={i === 3 ? '#d97706' : '#e2e8f0'} />
      ))}
      {/* Botões linha 2 */}
      {[0,1,2,3].map(i => (
        <rect key={i} x={95+i*34} y={132} width={26} height={22} rx={5} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      ))}
      {/* Botões linha 3 */}
      {[0,1,2,3].map(i => (
        <rect key={i} x={95+i*34} y={162} width={26} height={22} rx={5} fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      ))}
      {/* Botão 0 grande + ponto */}
      <rect x="95" y="192" width="60" height="22" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="163" y="192" width="26" height="22" rx="5" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
      <rect x="197" y="192" width="26" height="22" rx="5" fill="#0f172a"/>
      {/* Ícones nos botões */}
      <text x="108" y="117" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">%</text>
      <text x="142" y="117" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">÷</text>
      <text x="176" y="117" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">×</text>
      <text x="210" y="117" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700">⌫</text>
      <text x="108" y="147" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">7</text>
      <text x="142" y="147" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">8</text>
      <text x="176" y="147" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">9</text>
      <text x="210" y="147" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">−</text>
      <text x="108" y="177" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">4</text>
      <text x="142" y="177" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">5</text>
      <text x="176" y="177" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">6</text>
      <text x="210" y="177" textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="700">+</text>
      <text x="125" y="207" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">0</text>
      <text x="176" y="207" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="600">.</text>
      <text x="210" y="207" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">=</text>
      {/* Moedas decorativas */}
      <circle cx="40" cy="80" r="18" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2"/>
      <text x="40" y="85" textAnchor="middle" fill="#d97706" fontSize="14" fontWeight="800">R$</text>
      <circle cx="280" cy="160" r="14" fill="#f0fdf4" stroke="#86efac" strokeWidth="2"/>
      <text x="280" y="165" textAnchor="middle" fill="#16a34a" fontSize="10" fontWeight="800">%</text>
      {/* Seta de lucro */}
      <path d="M 40 120 Q 55 105 70 115" stroke="#d97706" strokeWidth="2" strokeDasharray="4 2" fill="none"/>
      <circle cx="40" cy="120" r="4" fill="#d97706"/>
    </svg>
  )
}

/* ── Componente de resultado da calculadora ───────────────────── */
export default function CalculadoraPage() {
  const [valor,    setValor]    = useState(1000)
  const [comissao, setComissao] = useState(20)
  const [parcelas, setParcelas] = useState(1)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [tabela,   setTabela]   = useState<any[]>([])

  const handleCalc = () => {
    setResultado(calcular(valor, comissao, parcelas))
    setTabela(Array.from({ length: 12 }, (_, i) => ({ p: i + 1, ...calcular(valor, comissao, i + 1) })))
  }

  const manutencaoTotal = MANUTENCAO_MENSAL * MESES_LOJA  // R$ 210

  return (
    <div>
      <PageHeader title="Calculadora Eskolare" subtitle="Simulação de preços e parcelamentos" />
      <div style={{ padding: '2rem 2.5rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem', alignItems: 'start' }}>

          {/* ── Painel de entrada ──────────────────────────────── */}
          <div>
            {/* Card formulário */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.06)', marginBottom: '1.25rem' }}>
              <div style={{ background: '#0f172a', padding: '1.1rem 1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.3rem' }}>
                  ✦ Parâmetros
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                  Simule seu preço final
                </div>
              </div>
              <div style={{ padding: '1.5rem' }}>
                {/* Ilustração */}
                <div style={{ marginBottom: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
                  <CalcIllustration />
                </div>

                {/* Campos */}
                {[
                  { label: 'Valor do Produto (R$)', type: 'number', value: valor, onChange: (v: number) => setValor(v), min: 0.01, step: 0.01, placeholder: '0,00' },
                  { label: 'Comissão Desejada (%)', type: 'number', value: comissao, onChange: (v: number) => setComissao(v), min: 0, max: 100, step: 0.1, placeholder: '0' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: '1.1rem' }}>
                    <label style={{ display: 'block', fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', marginBottom: '.45rem' }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type} value={f.value} min={f.min} max={f.max} step={f.step}
                      placeholder={f.placeholder}
                      onChange={e => f.onChange(parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', padding: '.7rem .9rem', fontSize: '.875rem', fontFamily: 'var(--font-inter,sans-serif)', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', marginBottom: '.45rem' }}>
                    Número de Parcelas
                  </label>
                  <select value={parcelas} onChange={e => setParcelas(parseInt(e.target.value))}
                    style={{ width: '100%', padding: '.7rem .9rem', fontSize: '.875rem', fontFamily: 'var(--font-inter,sans-serif)', border: '1.5px solid #e2e8f0', borderRadius: 8, background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>{n === 1 ? 'À vista (1x)' : `${n}x`}</option>
                    ))}
                  </select>
                </div>

                {/* Info manutenção */}
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 10, padding: '.85rem 1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#15803d', marginBottom: '.4rem' }}>
                    Manutenção da Loja Eskolare
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', fontFamily: 'var(--font-inter,sans-serif)', color: '#166534' }}>
                    <span>R$ {MANUTENCAO_MENSAL}/mês × {MESES_LOJA} meses</span>
                    <span style={{ fontWeight: 800, fontFamily: 'var(--font-cormorant,sans-serif)', fontSize: '.95rem' }}>= {fmt(manutencaoTotal)}</span>
                  </div>
                  <div style={{ fontSize: '.68rem', color: '#4ade80', marginTop: '.2rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                    Diluído em {parcelas}x → {fmt(manutencaoTotal / parcelas)}/parcela
                  </div>
                </div>

                <button onClick={handleCalc} style={{ width: '100%', padding: '.85rem', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', fontWeight: 700, fontSize: '.9rem', border: 'none', borderRadius: 9999, cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: '0 4px 14px rgba(217,119,6,.35)', letterSpacing: '.01em' }}>
                  Calcular
                </button>
              </div>
            </div>

            {/* Tabela de taxas */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
              <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#d97706', marginBottom: '.85rem' }}>
                Taxas Eskolare
              </div>
              {[
                ['Taxa da plataforma',    '1,5%'],
                ['Taxa cartão 1x',        '2,89%'],
                ['Taxa cartão 2x–6x',     '2,99%'],
                ['Taxa cartão 7x–12x',    '3,69%'],
                ['Taxa fixa/parcela',     'R$ 0,30'],
                ['Mínimo/parcela',        'R$ 30,00'],
                ['Manutenção/mês',        `R$ ${MANUTENCAO_MENSAL},00`],
                ['Meses de loja ativa',   `${MESES_LOJA} meses`],
                ['Total manutenção',      `R$ ${MANUTENCAO_MENSAL * MESES_LOJA},00`],
              ].map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.4rem 0', borderBottom: '1px solid #f8fafc', fontSize: '.78rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  <span style={{ color: '#64748b' }}>{l}</span>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Painel de resultados ────────────────────────────── */}
          <div>
            {resultado ? (
              <>
                {/* Aviso parcela mínima */}
                {!resultado.parcela_valida && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 12, padding: '.85rem 1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    <span style={{ fontSize: '.82rem', color: '#92400e', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      Valor por parcela ({fmt(resultado.valor_parcela)}) abaixo do mínimo de R$ 30,00. Reduza o número de parcelas.
                    </span>
                  </div>
                )}

                {/* KPI Cards de resultado */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Preço Final ao Aluno', value: fmt(resultado.preco_final), sub: 'valor cobrado', color: '#d97706', bg: '#fffbeb', border: '#fcd34d', big: true },
                    { label: `Valor da Parcela`, value: fmt(resultado.valor_parcela), sub: `em ${parcelas}x`, color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd' },
                    { label: 'Líquido Recebido', value: fmt(resultado.liquido_real), sub: 'após todas as taxas', color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
                    { label: 'Diferença da Comissão', value: fmt(resultado.diferenca), sub: 'vs. líquido desejado', color: resultado.diferenca < 0 ? '#dc2626' : '#16a34a', bg: resultado.diferenca < 0 ? '#fef2f2' : '#f0fdf4', border: resultado.diferenca < 0 ? '#fca5a5' : '#86efac' },
                  ].map(k => (
                    <div key={k.label} style={{ background: k.bg, border: `1.5px solid ${k.border}`, borderRadius: 14, padding: '1.1rem 1.25rem', borderTop: `3px solid ${k.color}` }}>
                      <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: k.color, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.35rem' }}>{k.label}</div>
                      <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: k.big ? '1.75rem' : '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{k.value}</div>
                      <div style={{ fontSize: '.7rem', color: '#64748b', marginTop: '.25rem', fontFamily: 'var(--font-inter,sans-serif)' }}>{k.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Detalhamento */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)', marginBottom: '1.5rem' }}>
                  <div style={{ background: '#0f172a', padding: '1rem 1.5rem' }}>
                    <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706' }}>
                      Detalhamento do Cálculo
                    </div>
                  </div>
                  <div style={{ padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                    {[
                      { title: 'Valores Base', rows: [
                        ['Produto', fmt(valor)],
                        [`Comissão (${comissao}%)`, fmt(resultado.liquido_desejado - valor)],
                        ['Líquido Desejado', fmt(resultado.liquido_desejado)],
                      ]},
                      { title: 'Taxas e Custos', rows: [
                        ['Plataforma (1,5%)', `−${fmtPct(1.5)}`],
                        [`Cartão (${fmtPct(resultado.taxa_cartao_pct)})`, `−${fmtPct(resultado.taxa_cartao_pct)}`],
                        [`Taxa fixa Eskolare`, `−${fmt(resultado.taxa_fixa_eskolare)}`],
                        [`Manutenção loja (${MESES_LOJA}×R$${MANUTENCAO_MENSAL})`, `−${fmt(resultado.manutencao_total)}`],
                      ]},
                      { title: 'Verificação', rows: [
                        ['Preço Final', fmt(resultado.preco_final)],
                        ['Líquido Real', fmt(resultado.liquido_real)],
                        ['Líquido Desejado', fmt(resultado.liquido_desejado)],
                        ['Diferença', fmt(resultado.diferenca)],
                      ]},
                    ].map(sec => (
                      <div key={sec.title}>
                        <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#d97706', marginBottom: '.6rem', borderBottom: '2px solid #d97706', paddingBottom: '.3rem' }}>
                          {sec.title}
                        </div>
                        {sec.rows.map(([l, v]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.3rem 0', fontSize: '.78rem', fontFamily: 'var(--font-inter,sans-serif)', borderBottom: '1px solid #f8fafc' }}>
                            <span style={{ color: '#64748b' }}>{l}</span>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tabela comparativa de parcelamentos */}
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
                  <div style={{ background: '#0f172a', padding: '1rem 1.5rem' }}>
                    <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706' }}>
                      Comparativo de Parcelamentos
                    </div>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {['Parcelas', 'Taxa Cartão', 'Preço Final', 'Valor Parcela', 'Líquido Real', 'Status'].map(col => (
                            <th key={col} style={{ padding: '.65rem 1rem', textAlign: 'left', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tabela.map(row => (
                          <tr key={row.p} style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: row.p === parcelas ? 'rgba(217,119,6,.06)' : row.p % 2 === 0 ? '#fafafa' : '#fff',
                          }}>
                            <td style={{ padding: '.75rem 1rem', fontWeight: row.p === parcelas ? 800 : 600, fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.82rem', color: row.p === parcelas ? '#d97706' : '#0f172a' }}>
                              {row.p === 1 ? 'À vista' : `${row.p}x`}
                              {row.p === parcelas && <span style={{ marginLeft: '.4rem', fontSize: '.6rem', background: '#d97706', color: '#fff', padding: '.05rem .35rem', borderRadius: 99 }}>atual</span>}
                            </td>
                            <td style={{ padding: '.75rem 1rem', fontSize: '.78rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmtPct(row.taxa_cartao_pct)}</td>
                            <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>{fmt(row.preco_final)}</td>
                            <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: '#0ea5e9', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>{fmt(row.valor_parcela)}</td>
                            <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>{fmt(row.liquido_real)}</td>
                            <td style={{ padding: '.75rem 1rem' }}>
                              {row.parcela_valida
                                ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '.15rem .6rem', borderRadius: 99, fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>✓ OK</span>
                                : <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem', background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '.15rem .6rem', borderRadius: 99, fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>Abaixo mín.</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              /* Estado inicial elegante */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420 }}>
                {/* Ilustração estado vazio */}
                <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 280, marginBottom: '1.5rem' }}>
                  <rect x="60" y="40" width="160" height="120" rx="12" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2"/>
                  <rect x="75" y="55" width="60" height="35" rx="6" fill="#f1f5f9" stroke="#e2e8f0"/>
                  <text x="105" y="77" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">R$ ?</text>
                  <rect x="145" y="55" width="60" height="35" rx="6" fill="#fef3c7" stroke="#fcd34d"/>
                  <text x="175" y="77" textAnchor="middle" fill="#d97706" fontSize="11" fontFamily="monospace">%</text>
                  <line x1="75" y1="105" x2="205" y2="105" stroke="#e2e8f0" strokeWidth="1.5"/>
                  <rect x="75" y="115" width="130" height="30" rx="6" fill="#0f172a"/>
                  <text x="140" y="135" textAnchor="middle" fill="#d97706" fontSize="12" fontWeight="700" fontFamily="sans-serif">CALCULAR</text>
                  {/* Seta animada */}
                  <path d="M 140 175 L 140 165" stroke="#d97706" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M 135 170 L 140 175 L 145 170" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="60" cy="30" r="20" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.5"/>
                  <text x="60" y="35" textAnchor="middle" fill="#d97706" fontSize="16">R$</text>
                  <circle cx="220" cy="170" r="16" fill="#f0fdf4" stroke="#86efac" strokeWidth="1.5"/>
                  <path d="M 212 170 L 217 175 L 228 164" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '.4rem' }}>
                  Pronto para simular
                </div>
                <p style={{ fontSize: '.85rem', color: '#94a3b8', textAlign: 'center', maxWidth: 320, fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.6 }}>
                  Informe o valor do produto, a comissão desejada e o número de parcelas. Clique em <strong style={{ color: '#d97706' }}>Calcular</strong> para ver o preço final e a margem líquida após todas as taxas da plataforma Eskolare.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
