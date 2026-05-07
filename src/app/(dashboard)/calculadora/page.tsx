'use client'

import { useState, useCallback } from 'react'
import PageHeader from '@/components/layout/PageHeader'

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════════════════ */
const TAXA_PLATAFORMA    = 0.015
const TAXA_FIXA_PARCELA  = 0.30
const VALOR_MIN_PARCELA  = 30.00
const MANUTENCAO_MENSAL  = 70
const MESES_LOJA         = 3
const MANUTENCAO_TOTAL   = MANUTENCAO_MENSAL * MESES_LOJA  // R$ 210

const SEGMENTOS = [
  { id: 'inf2',  label: 'Infantil 2'    },
  { id: 'inf3',  label: 'Infantil 3'    },
  { id: 'inf4',  label: 'Infantil 4'    },
  { id: 'inf5',  label: 'Infantil 5'    },
  { id: 'f1a1',  label: '1º Ano Fund I' },
  { id: 'f1a2',  label: '2º Ano Fund I' },
  { id: 'f1a3',  label: '3º Ano Fund I' },
  { id: 'f1a4',  label: '4º Ano Fund I' },
  { id: 'f1a5',  label: '5º Ano Fund I' },
]

/* ═══════════════════════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════════════════════ */
interface SegmentoCalc {
  id: string
  label: string
  ativo: boolean
  igualPrimeiro: boolean    // "mesmo valor do 1º segmento ativo"
  custo: number             // custo de aquisição do livro pela escola (R$)
  comissao: number          // comissão desejada (%)
  parcelas: number
}

interface Resultado {
  custo: number
  comissao_valor: number
  liquido_desejado: number
  manutencao_por_parcela: number
  taxa_fixa_eskolare: number
  taxa_cartao_pct: number
  preco_final: number
  valor_parcela: number
  liquido_real: number
  diferenca: number
  parcela_valida: boolean
}

/* ═══════════════════════════════════════════════════════════════════
   CÁLCULO
   ═══════════════════════════════════════════════════════════════════ */
function calcular(custo: number, comissao: number, parcelas: number): Resultado {
  const taxa_cartao = parcelas === 1 ? 0.0289 : parcelas <= 6 ? 0.0299 : 0.0369

  const comissao_valor       = custo * (comissao / 100)
  const liquido_desejado     = custo + comissao_valor
  const manutencao_pp        = MANUTENCAO_TOTAL / parcelas
  const taxa_fixa_eskolare   = TAXA_FIXA_PARCELA * parcelas
  const denominador          = 1 - TAXA_PLATAFORMA - taxa_cartao

  const preco_final = Math.ceil(
    ((liquido_desejado + taxa_fixa_eskolare + MANUTENCAO_TOTAL) / denominador) * 100
  ) / 100
  const valor_parcela = Math.round((preco_final / parcelas) * 100) / 100
  const liquido_real  = preco_final * denominador - taxa_fixa_eskolare - MANUTENCAO_TOTAL

  return {
    custo,
    comissao_valor,
    liquido_desejado,
    manutencao_por_parcela: manutencao_pp,
    taxa_fixa_eskolare,
    taxa_cartao_pct: taxa_cartao * 100,
    preco_final,
    valor_parcela,
    liquido_real,
    diferenca: liquido_real - liquido_desejado,
    parcela_valida: valor_parcela >= VALOR_MIN_PARCELA,
  }
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */
const fmt    = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtPct = (v: number) => v.toFixed(2) + '%'

const inpStyle: React.CSSProperties = {
  width: '100%', padding: '.6rem .85rem', fontSize: '.875rem',
  fontFamily: 'var(--font-inter,sans-serif)',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#0f172a', outline: 'none',
  boxSizing: 'border-box',
}
const lblStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat,sans-serif)',
  fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.06em', color: '#64748b', marginBottom: '.35rem',
}

/* ═══════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════════════ */
export default function CalculadoraPage() {
  const [segmentos, setSegmentos] = useState<SegmentoCalc[]>(
    SEGMENTOS.map((s, i) => ({
      ...s,
      ativo: i < 2,          // começa com Infantil 2 e 3 ativos
      igualPrimeiro: i > 0,  // do 2º em diante, herda do primeiro por padrão
      custo: 600,
      comissao: 20,
      parcelas: 12,
    }))
  )
  const [calculados, setCalculados] = useState<Record<string, Resultado>>({})
  const [calculou,   setCalculou]   = useState(false)

  // Primeiro segmento ativo (referência)
  const primeiroAtivo = segmentos.find(s => s.ativo)

  const update = (id: string, field: keyof SegmentoCalc, value: any) => {
    setSegmentos(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
    setCalculou(false)
  }

  const handleCalcular = () => {
    const res: Record<string, Resultado> = {}
    segmentos.filter(s => s.ativo).forEach(s => {
      if (s.igualPrimeiro && primeiroAtivo && s.id !== primeiroAtivo.id) {
        res[s.id] = calcular(primeiroAtivo.custo, primeiroAtivo.comissao, primeiroAtivo.parcelas)
      } else {
        res[s.id] = calcular(s.custo, s.comissao, s.parcelas)
      }
    })
    setCalculados(res)
    setCalculou(true)
  }

  const ativos = segmentos.filter(s => s.ativo)

  return (
    <div>
      <PageHeader title="Calculadora Eskolare" subtitle="Precificação por segmento / turma" />
      <div style={{ padding: '1.75rem 2.5rem' }}>

        {/* ── EXPLICAÇÃO ──────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16, padding: '1.25rem 1.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.35rem' }}>
              ✦ Como usar
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '.3rem' }}>
              Calcule o valor final por segmento
            </div>
            <p style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.6)', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.6 }}>
              Ative os segmentos que a escola possui. Se o valor for igual para todos, marque "Mesmo valor". Caso contrário, abra uma calculadora individual por turma. Ao calcular, cada segmento gera um cartão com o preço final ao pai.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem', flexShrink: 0 }}>
            {[
              ['Custo livro', 'R$ X'],
              ['+ Comissão', '+ X%'],
              ['+ Taxas Eskolare', '+ R$ Y'],
              ['+ Manutenção loja', `+ R$ ${MANUTENCAO_TOTAL}`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: 'rgba(255,255,255,.07)', borderRadius: 8, padding: '.4rem .65rem', textAlign: 'center' }}>
                <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-montserrat,sans-serif)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{l}</div>
                <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#d97706', fontFamily: 'var(--font-cormorant,sans-serif)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SELETOR DE SEGMENTOS ─────────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
          <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a', marginBottom: '1rem' }}>
            1. Selecione os segmentos da escola
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {segmentos.map(s => (
              <button
                key={s.id}
                onClick={() => update(s.id, 'ativo', !s.ativo)}
                style={{
                  padding: '6px 16px', borderRadius: 9999, cursor: 'pointer',
                  fontSize: '.78rem', fontWeight: 700,
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                  background: s.ativo ? '#0f172a' : '#f1f5f9',
                  color: s.ativo ? '#fff' : '#64748b',
                  border: `1.5px solid ${s.ativo ? '#0f172a' : '#e2e8f0'}`,
                  transition: 'all .15s',
                }}
              >
                {s.ativo ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── CALCULADORAS POR SEGMENTO ────────────────────────── */}
        {ativos.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a', marginBottom: '1rem' }}>
              2. Configure os parâmetros por segmento
            </div>

            {ativos.map((s, idx) => {
              const isPrimeiro = idx === 0
              const herdando   = !isPrimeiro && s.igualPrimeiro

              return (
                <div key={s.id} style={{
                  background: '#fff', border: `1.5px solid ${herdando ? '#e2e8f0' : '#d97706'}`,
                  borderRadius: 14, marginBottom: '1rem', overflow: 'hidden',
                  boxShadow: herdando ? '0 1px 4px rgba(15,23,42,.04)' : '0 4px 16px rgba(217,119,6,.12)',
                  opacity: herdando ? .75 : 1,
                }}>
                  {/* Header */}
                  <div style={{
                    background: herdando ? '#fafafa' : '#0f172a',
                    padding: '.85rem 1.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: herdando ? '#e2e8f0' : '#d97706',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '.72rem', fontWeight: 800, color: '#fff',
                        fontFamily: 'var(--font-montserrat,sans-serif)',
                      }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.82rem', fontWeight: 800, color: herdando ? '#475569' : '#fff' }}>
                        {s.label}
                      </span>
                      {herdando && <span style={{ fontSize: '.65rem', background: '#dbeafe', color: '#1d4ed8', padding: '.15rem .5rem', borderRadius: 99, fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        Mesmo valor do {primeiroAtivo?.label}
                      </span>}
                    </div>

                    {/* Toggle "mesmo valor" para os que não são o primeiro */}
                    {!isPrimeiro && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                        <span style={{ fontSize: '.72rem', color: herdando ? '#475569' : 'rgba(255,255,255,.6)', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          Mesmo valor
                        </span>
                        <div
                          onClick={() => update(s.id, 'igualPrimeiro', !s.igualPrimeiro)}
                          style={{
                            width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                            background: s.igualPrimeiro ? '#d97706' : '#cbd5e1',
                            position: 'relative', transition: 'background .2s',
                          }}
                        >
                          <div style={{
                            position: 'absolute', top: 2, left: s.igualPrimeiro ? 18 : 2,
                            width: 16, height: 16, borderRadius: '50%', background: '#fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s',
                          }} />
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Campos — só exibe se não estiver herdando */}
                  {!herdando && (
                    <div style={{ padding: '1.1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={lblStyle}>Custo de Aquisição do Livro (R$)</label>
                        <input
                          type="number" min="0" step="0.01" value={s.custo}
                          onChange={e => update(s.id, 'custo', parseFloat(e.target.value) || 0)}
                          style={inpStyle}
                          placeholder="Ex: 600,00"
                        />
                        <div style={{ fontSize: '.65rem', color: '#94a3b8', marginTop: '.3rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          Valor que a escola paga pelo livro
                        </div>
                      </div>
                      <div>
                        <label style={lblStyle}>Comissão Desejada (%)</label>
                        <input
                          type="number" min="0" max="100" step="0.1" value={s.comissao}
                          onChange={e => update(s.id, 'comissao', parseFloat(e.target.value) || 0)}
                          style={inpStyle}
                          placeholder="Ex: 20"
                        />
                        <div style={{ fontSize: '.65rem', color: '#94a3b8', marginTop: '.3rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          Margem comercial da escola
                        </div>
                      </div>
                      <div>
                        <label style={lblStyle}>Parcelas no Eskolare</label>
                        <select value={s.parcelas} onChange={e => update(s.id, 'parcelas', parseInt(e.target.value))} style={inpStyle}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n === 1 ? 'À vista' : `${n}x`}</option>
                          ))}
                        </select>
                        <div style={{ fontSize: '.65rem', color: '#94a3b8', marginTop: '.3rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          Manutenção: {fmt(MANUTENCAO_TOTAL / s.parcelas)}/parcela
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── BOTÃO CALCULAR ───────────────────────────────────── */}
        {ativos.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <button onClick={handleCalcular} style={{
              width: '100%', maxWidth: 400, padding: '.9rem 2rem',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', fontWeight: 800, fontSize: '1rem',
              border: 'none', borderRadius: 9999, cursor: 'pointer',
              fontFamily: 'var(--font-montserrat,sans-serif)',
              boxShadow: '0 6px 20px rgba(217,119,6,.4)', letterSpacing: '.02em',
              display: 'block',
            }}>
              Calcular Preços por Segmento →
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════
            RESULTADOS
            ═══════════════════════════════════════════════════════ */}
        {calculou && Object.keys(calculados).length > 0 && (
          <div>
            <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a', marginBottom: '1.25rem' }}>
              3. Resultados por Segmento
            </div>

            {/* ── Cartões por segmento ───────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
              {ativos.map(s => {
                const r = calculados[s.id]
                if (!r) return null
                const seg = s.igualPrimeiro && primeiroAtivo ? { ...primeiroAtivo, label: s.label } : s

                return (
                  <div key={s.id} style={{
                    background: '#fff', border: '1px solid #e2e8f0',
                    borderTop: `4px solid #d97706`,
                    borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(15,23,42,.08)',
                  }}>
                    {/* Header do segmento */}
                    <div style={{ background: '#0f172a', padding: '1rem 1.25rem' }}>
                      <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.2rem' }}>
                        Segmento
                      </div>
                      <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                        {s.label}
                      </div>
                      {s.igualPrimeiro && s.id !== primeiroAtivo?.id && (
                        <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.45)', marginTop: '.2rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          Mesmo parâmetro do {primeiroAtivo?.label}
                        </div>
                      )}
                    </div>

                    {/* Métricas em grid 2×2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f1f5f9' }}>
                      {[
                        { label: 'Custo de Aquisição', value: fmt(r.custo), sub: 'escola paga', color: '#0f172a', bg: '#f8fafc' },
                        { label: 'Comissão', value: fmt(r.comissao_valor), sub: `${seg.comissao}% sobre custo`, color: '#7c3aed', bg: '#f5f3ff' },
                        { label: 'Despesas Eskolare', value: fmt(r.taxa_fixa_eskolare + r.preco_final * (TAXA_PLATAFORMA + r.taxa_cartao_pct / 100) + MANUTENCAO_TOTAL), sub: 'taxas + manutenção', color: '#dc2626', bg: '#fef2f2' },
                        { label: 'Valor Final ao Pai', value: fmt(r.preco_final), sub: `${seg.parcelas === 1 ? 'à vista' : `${seg.parcelas}x de ${fmt(r.valor_parcela)}`}`, color: '#d97706', bg: '#fffbeb', big: true },
                      ].map(m => (
                        <div key={m.label} style={{ background: m.bg, padding: '.85rem 1rem', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.2rem' }}>{m.label}</div>
                          <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: (m as any).big ? '1.3rem' : '1.1rem', fontWeight: 800, color: m.color, lineHeight: 1 }}>{m.value}</div>
                          <div style={{ fontSize: '.62rem', color: '#94a3b8', marginTop: '.2rem', fontFamily: 'var(--font-inter,sans-serif)' }}>{m.sub}</div>
                        </div>
                      ))}
                    </div>

                    {/* Linha inferior: líquido + status */}
                    <div style={{ padding: '.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.15rem' }}>Líquido Real</div>
                        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>{fmt(r.liquido_real)}</div>
                      </div>
                      <div>
                        {!r.parcela_valida && (
                          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                            ⚠ Parcela abaixo de R$30
                          </span>
                        )}
                        {r.parcela_valida && (
                          <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                            ✓ Válido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── Tabela comparativa detalhada ────────────────────── */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)', marginBottom: '1.5rem' }}>
              <div style={{ background: '#0f172a', padding: '1rem 1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706' }}>
                  Resumo Comparativo por Segmento
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Segmento', 'Custo Livro', 'Comissão', 'Taxas Eskolare', 'Manutenção', 'Preço Final', 'Parcela', 'Líquido Real', 'Status'].map(col => (
                        <th key={col} style={{ padding: '.65rem 1rem', textAlign: 'left', fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ativos.map((s, idx) => {
                      const r = calculados[s.id]
                      if (!r) return null
                      const seg = s.igualPrimeiro && primeiroAtivo ? primeiroAtivo : s
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 700, fontSize: '.82rem', color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                            {s.label}
                            {s.igualPrimeiro && s.id !== primeiroAtivo?.id && (
                              <span style={{ marginLeft: '.4rem', fontSize: '.58rem', background: '#dbeafe', color: '#1d4ed8', padding: '.08rem .35rem', borderRadius: 99, fontWeight: 700 }}>=1º</span>
                            )}
                          </td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmt(r.custo)}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#7c3aed', fontWeight: 700, fontFamily: 'var(--font-cormorant,serif)' }}>{fmt(r.comissao_valor)}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#dc2626', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmt(r.taxa_fixa_eskolare)}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#0ea5e9', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmt(MANUTENCAO_TOTAL)}</td>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1rem' }}>{fmt(r.preco_final)}</td>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>
                            {seg.parcelas === 1 ? 'À vista' : `${seg.parcelas}x ${fmt(r.valor_parcela)}`}
                          </td>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>{fmt(r.liquido_real)}</td>
                          <td style={{ padding: '.75rem 1rem' }}>
                            {r.parcela_valida
                              ? <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '.15rem .55rem', borderRadius: 99, fontSize: '.62rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>✓</span>
                              : <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '.15rem .55rem', borderRadius: 99, fontSize: '.62rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>⚠</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Tabela de taxas Eskolare ─────────────────────────── */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
              <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#d97706', marginBottom: '.75rem' }}>
                Taxas Eskolare aplicadas
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  ['Taxa da plataforma', '1,5%'],
                  ['Taxa cartão 1x', '2,89%'],
                  ['Taxa cartão 2x–6x', '2,99%'],
                  ['Taxa cartão 7x–12x', '3,69%'],
                  ['Taxa fixa por parcela', 'R$ 0,30'],
                  ['Mínimo por parcela', 'R$ 30,00'],
                  [`Manutenção/mês`, `R$ ${MANUTENCAO_MENSAL},00`],
                  [`Meses de loja ativa`, `${MESES_LOJA} meses`],
                  [`Total manutenção`, `R$ ${MANUTENCAO_TOTAL},00`],
                ].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.35rem 0', borderBottom: '1px solid #f8fafc', fontSize: '.78rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                    <span style={{ color: '#64748b' }}>{l}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {ativos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto .75rem' }}>
                <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
              </svg>
            </div>
            <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', color: '#0f172a', marginBottom: '.4rem' }}>Selecione pelo menos um segmento</h3>
            <p style={{ fontSize: '.85rem', fontFamily: 'var(--font-inter,sans-serif)' }}>Clique nos botões acima para ativar os segmentos da escola.</p>
          </div>
        )}

      </div>
    </div>
  )
}
