'use client'

import { useState } from 'react'
import PageHeader from '@/components/layout/PageHeader'

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTES — taxas Eskolare
   ═══════════════════════════════════════════════════════════════════ */
const TAXA_PLATAFORMA   = 0.015
const TAXA_FIXA_PARCELA = 0.30
const VALOR_MIN_PARCELA = 30.00
const CUSTO_NOTA_FISCAL = 1.00    // R$1,00 por nota fiscal emitida — uma nota por venda/kit
// Despesas financeiras do parcelamento (taxa de cartão + taxa fixa por parcela) são sempre
// calculadas com base em 12x, independente de quantas parcelas a família escolher no pagamento —
// o preço final não pode variar conforme a forma de pagamento selecionada pelo cliente.
const PARCELAS_BASE_PRECO   = 12
const TAXA_CARTAO_PARCELADO = 0.0369
const CUSTO_LOJA_BASE    = 73.02   // valor unitário mensal da loja, sem ISS (fatura Eskolare: "Lojas Ativas")
const ISS_LOJA           = 0.02
const CUSTO_SUPORTE_LOJA = 50.00   // suporte da loja — valor fixo, sem ISS
// Custo de manutenção da plataforma: NÃO é mais rateado entre os alunos nem multiplicado pelos
// meses de loja aberta — entra integralmente 1x em cada kit vendido, igual à nota fiscal.
// Composto pelo valor da loja Eskolare (com ISS "por dentro") + suporte da loja, e pode receber
// também custos de mão de obra/operação no futuro.
const CUSTO_MANUTENCAO_PLATAFORMA = (CUSTO_LOJA_BASE / (1 - ISS_LOJA)) + CUSTO_SUPORTE_LOJA   // ≈ R$124,51 por kit

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
  id: string; label: string; ativo: boolean; igualPrimeiro: boolean
  custo: number
  // Comissão pode ser em % ou em R$ fixo
  comissaoTipo: 'pct' | 'abs'   // 'pct' = percentual | 'abs' = valor absoluto
  comissaoPct: number            // percentual (%)
  comissaoAbs: number            // valor absoluto (R$)
  qtdAlunos: number              // quantidade de alunos neste segmento
  parcelas: number
}

interface Resultado {
  custo: number
  comissao_valor: number
  liquido_desejado: number
  custo_manutencao: number   // manutenção da plataforma — integral por kit, não rateada
  taxa_fixa_eskolare: number
  taxa_cartao_pct: number
  taxa_plataforma_valor: number   // R$ — 1,5% do preço final
  taxa_cartao_valor: number       // R$ — taxa de cartão (sempre 12x) do preço final
  total_taxas_parcelamento: number // R$ — plataforma + cartão + taxa fixa
  custo_nota_fiscal: number
  preco_final: number
  valor_parcela: number
  liquido_real: number
  diferenca: number
  parcela_valida: boolean
  qtd_alunos: number
}

/* ═══════════════════════════════════════════════════════════════════
   CÁLCULO
   - Manutenção da plataforma e nota fiscal entram integralmente em CADA kit
   ═══════════════════════════════════════════════════════════════════ */
function calcular(
  custo: number,
  comissaoTipo: 'pct' | 'abs',
  comissaoPct: number,
  comissaoAbs: number,
  parcelas: number,
  qtdAlunos: number,
): Resultado {
  // Taxa de cartão e taxa fixa por parcela sempre calculadas com base em 12x — ver nota acima.
  const taxa_cartao = TAXA_CARTAO_PARCELADO

  // Comissão: percentual OU valor absoluto
  const comissao_valor = comissaoTipo === 'pct'
    ? custo * (comissaoPct / 100)
    : comissaoAbs

  const liquido_desejado = custo + comissao_valor

  const taxa_fixa_eskolare = TAXA_FIXA_PARCELA * PARCELAS_BASE_PRECO
  const denominador        = 1 - TAXA_PLATAFORMA - taxa_cartao

  // Preço final por kit = (líquido + taxa fixa + manutenção da plataforma + nota fiscal) / denominador
  const preco_final = Math.ceil(
    ((liquido_desejado + taxa_fixa_eskolare + CUSTO_MANUTENCAO_PLATAFORMA + CUSTO_NOTA_FISCAL) / denominador) * 100
  ) / 100
  // Valor da parcela usa a forma de pagamento REAL escolhida pela família — o preço já está fixado acima
  const valor_parcela = Math.round((preco_final / parcelas) * 100) / 100
  const liquido_real  = preco_final * denominador - taxa_fixa_eskolare - CUSTO_MANUTENCAO_PLATAFORMA - CUSTO_NOTA_FISCAL

  // Despesas do parcelamento em R$ (informativo — derivadas do preço final já calculado acima)
  const taxa_plataforma_valor    = preco_final * TAXA_PLATAFORMA
  const taxa_cartao_valor        = preco_final * taxa_cartao
  const total_taxas_parcelamento = taxa_plataforma_valor + taxa_cartao_valor + taxa_fixa_eskolare

  return {
    custo, comissao_valor, liquido_desejado,
    custo_manutencao: CUSTO_MANUTENCAO_PLATAFORMA,
    taxa_fixa_eskolare, taxa_cartao_pct: taxa_cartao * 100,
    taxa_plataforma_valor, taxa_cartao_valor, total_taxas_parcelamento,
    custo_nota_fiscal: CUSTO_NOTA_FISCAL,
    preco_final, valor_parcela, liquido_real,
    diferenca: liquido_real - liquido_desejado,
    parcela_valida: valor_parcela >= VALOR_MIN_PARCELA,
    qtd_alunos: qtdAlunos,
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
  background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
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
      ativo: i < 2,
      igualPrimeiro: i > 0,
      custo: s.id.startsWith('inf') ? 1150 : 1450,   // padrão: Infantil R$1.150 · Fundamental R$1.450
      comissaoTipo: 'pct' as const,
      comissaoPct: 20,
      comissaoAbs: 0,
      qtdAlunos: 0,
      parcelas: 12,
    }))
  )
  const [calculados, setCalculados] = useState<Record<string, Resultado>>({})
  const [calculou,   setCalculou]   = useState(false)
  const [memoriaSeg, setMemoriaSeg] = useState<string | null>(null)

  const primeiroAtivo = segmentos.find(s => s.ativo)

  const update = (id: string, field: keyof SegmentoCalc, value: any) => {
    setSegmentos(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
    setCalculou(false)
  }

  // Total de alunos em todos os segmentos ATIVOS — apenas informativo, não influencia mais o preço
  // Custo e Qtd. Alunos são sempre próprios de cada turma — nunca herdados
  const totalAlunos = segmentos.filter(s => s.ativo).reduce((acc, s) => acc + s.qtdAlunos, 0)

  const handleCalcular = () => {
    const res: Record<string, Resultado> = {}
    segmentos.filter(s => s.ativo).forEach(s => {
      // "Mesmo valor" só se aplica a comissão e parcelas — custo e qtd. de alunos são sempre da própria turma
      const ref = (s.igualPrimeiro && primeiroAtivo && s.id !== primeiroAtivo.id) ? primeiroAtivo : s
      res[s.id] = calcular(
        s.custo, ref.comissaoTipo, ref.comissaoPct, ref.comissaoAbs,
        ref.parcelas, s.qtdAlunos,
      )
    })
    setCalculados(res)
    setCalculou(true)
  }

  const ativos = segmentos.filter(s => s.ativo)

  // Resumo financeiro da proposta inteira — soma de todos os segmentos ativos já calculados
  const faturamentoEducation = ativos.reduce((acc, s) => {
    const r = calculados[s.id]
    return r ? acc + r.custo * r.qtd_alunos : acc
  }, 0)
  const comissaoTotalProposta = ativos.reduce((acc, s) => {
    const r = calculados[s.id]
    return r ? acc + r.comissao_valor * r.qtd_alunos : acc
  }, 0)
  const faturamentoTotalVenda = ativos.reduce((acc, s) => {
    const r = calculados[s.id]
    return r ? acc + r.preco_final * r.qtd_alunos : acc
  }, 0)

  // Segmento exibido na memória de cálculo: o selecionado (se ainda válido) ou o primeiro ativo
  const segMemoriaId = (memoriaSeg && calculados[memoriaSeg]) ? memoriaSeg : ativos[0]?.id
  const segMemoria    = ativos.find(s => s.id === segMemoriaId)
  const resMemoria    = segMemoriaId ? calculados[segMemoriaId] : undefined
  const refMemoria    = segMemoria && segMemoria.igualPrimeiro && primeiroAtivo ? primeiroAtivo : segMemoria

  return (
    <div>
      <PageHeader title="Calculadora Eskolare" subtitle="Precificação por segmento e turma" />
      <div style={{ padding: '1.75rem 2.5rem' }}>

        {/* ── Explicação ──────────────────────────────────────── */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16, padding: '1.25rem 1.75rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.35rem' }}>
              ✦ Lógica de cálculo
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '.5rem' }}>
              Preço final = custo + comissão + nota fiscal + manutenção da plataforma + taxas Eskolare
            </div>
            <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.65, fontFamily: 'var(--font-inter,sans-serif)' }}>
              A manutenção da plataforma (<strong style={{ color: '#d97706' }}>{fmt(CUSTO_MANUTENCAO_PLATAFORMA)}</strong>, R$73,02 + 2% ISS por dentro + {fmt(CUSTO_SUPORTE_LOJA)} de suporte da loja) e a nota fiscal
              (<strong style={{ color: '#d97706' }}>{fmt(CUSTO_NOTA_FISCAL)}</strong>) entram integralmente em <strong>cada kit vendido</strong>.
              A taxa de cartão e a taxa fixa por parcela são sempre calculadas com base em 12x (<strong style={{ color: '#d97706' }}>{(TAXA_CARTAO_PARCELADO * 100).toFixed(2)}%</strong>),
              independente da forma de pagamento que a família escolher — o preço final não muda conforme o parcelamento selecionado.
            </div>
          </div>
          <div style={{ background: 'rgba(217,119,6,.12)', border: '1px solid rgba(217,119,6,.25)', borderRadius: 10, padding: '1rem 1.25rem', minWidth: 220, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#d97706', marginBottom: '.6rem' }}>
              Manutenção da plataforma
            </div>
            {[
              ['Valor base da loja (sem ISS)', fmt(CUSTO_LOJA_BASE)],
              ['ISS (2%, por dentro)', fmt(CUSTO_LOJA_BASE / (1 - ISS_LOJA) - CUSTO_LOJA_BASE)],
              ['Suporte da loja', fmt(CUSTO_SUPORTE_LOJA)],
              ['Por kit vendido', fmt(CUSTO_MANUTENCAO_PLATAFORMA)],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '.25rem 0', borderBottom: '1px solid rgba(255,255,255,.06)', fontSize: '.75rem' }}>
                <span style={{ color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-inter,sans-serif)' }}>{l}</span>
                <span style={{ fontWeight: 700, color: '#fff', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 1. Selecionar segmentos ──────────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
          <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a', marginBottom: '1rem' }}>
            1. Selecione os segmentos ativos da escola
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {segmentos.map(s => (
              <button key={s.id} onClick={() => update(s.id, 'ativo', !s.ativo)}
                style={{
                  padding: '6px 16px', borderRadius: 9999, cursor: 'pointer',
                  fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)',
                  background: s.ativo ? '#0f172a' : '#f1f5f9',
                  color: s.ativo ? '#fff' : '#64748b',
                  border: `1.5px solid ${s.ativo ? '#0f172a' : '#e2e8f0'}`,
                  transition: 'all .15s',
                }}>
                {s.ativo ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>
          {totalAlunos > 0 && (
            <div style={{ marginTop: '.85rem', fontSize: '.75rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>
              Total de alunos nos segmentos ativos: <strong style={{ color: '#0f172a' }}>{totalAlunos}</strong>
            </div>
          )}
        </div>

        {/* ── 2. Parâmetros por segmento ───────────────────────── */}
        {ativos.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a', marginBottom: '1rem' }}>
              2. Configure os parâmetros por segmento
            </div>

            {ativos.map((s, idx) => {
              const isPrimeiro = idx === 0
              const herdando   = !isPrimeiro && s.igualPrimeiro
              const ref        = herdando && primeiroAtivo ? primeiroAtivo : s

              return (
                <div key={s.id} style={{
                  background: '#fff', border: '1.5px solid #d97706',
                  borderRadius: 14, marginBottom: '1rem', overflow: 'hidden',
                  boxShadow: '0 4px 16px rgba(217,119,6,.12)',
                }}>
                  {/* Header */}
                  <div style={{ background: '#0f172a', padding: '.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.72rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {idx + 1}
                      </div>
                      <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.82rem', fontWeight: 800, color: '#fff' }}>{s.label}</span>
                      {herdando && <span style={{ fontSize: '.65rem', background: '#dbeafe', color: '#1d4ed8', padding: '.15rem .5rem', borderRadius: 99, fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        Comissão/parcelas = {primeiroAtivo?.label}
                      </span>}
                    </div>
                    {!isPrimeiro && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                        <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.6)', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Comissão/parcelas iguais</span>
                        <div onClick={() => update(s.id, 'igualPrimeiro', !s.igualPrimeiro)}
                          style={{ width: 36, height: 20, borderRadius: 10, cursor: 'pointer', background: s.igualPrimeiro ? '#d97706' : '#cbd5e1', position: 'relative', transition: 'background .2s' }}>
                          <div style={{ position: 'absolute', top: 2, left: s.igualPrimeiro ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.2)', transition: 'left .2s' }} />
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Campos — Custo e Qtd. Alunos são sempre da própria turma; Comissão/Parcelas seguem o toggle acima */}
                  <div style={{ padding: '1.1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
                    {/* Custo — sempre editável, mesmo que igual a outra turma */}
                    <div>
                      <label style={lblStyle}>Custo do Kit (R$)</label>
                      <input type="number" min="0" step="0.01" value={s.custo}
                        onChange={e => update(s.id, 'custo', parseFloat(e.target.value) || 0)}
                        onWheel={e => (e.target as HTMLInputElement).blur()}
                        style={inpStyle} placeholder="Ex: 600,00" />
                      <div style={{ fontSize: '.62rem', color: '#94a3b8', marginTop: '.25rem', fontFamily: 'var(--font-inter,sans-serif)' }}>Valor pago pela escola</div>
                    </div>

                    {/* Comissão — editável, ou igual ao primeiro segmento quando o toggle está ligado */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                        <label style={{ ...lblStyle, marginBottom: 0 }}>Comissão</label>
                        {!herdando && (
                          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 7, padding: 2, gap: 1 }}>
                            {[
                              { v: 'pct', l: '%' },
                              { v: 'abs', l: 'R$' },
                            ].map(t => (
                              <button key={t.v} type="button"
                                onClick={() => update(s.id, 'comissaoTipo', t.v as 'pct' | 'abs')}
                                style={{
                                  padding: '3px 9px', borderRadius: 5, border: 'none', cursor: 'pointer',
                                  fontSize: '.68rem', fontWeight: 800, transition: 'all .15s',
                                  fontFamily: 'var(--font-montserrat,sans-serif)',
                                  background: s.comissaoTipo === t.v ? '#d97706' : 'transparent',
                                  color: s.comissaoTipo === t.v ? '#fff' : '#64748b',
                                }}>
                                {t.l}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      {herdando ? (
                        <div style={{ ...inpStyle, background: '#f8fafc', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                          {ref.comissaoTipo === 'pct' ? `${ref.comissaoPct}%` : fmt(ref.comissaoAbs)}
                        </div>
                      ) : s.comissaoTipo === 'pct' ? (
                        <div style={{ position: 'relative' }}>
                          <input type="number" min="0" max="100" step="0.1" value={s.comissaoPct}
                            onChange={e => update(s.id, 'comissaoPct', parseFloat(e.target.value) || 0)}
                            onWheel={e => (e.target as HTMLInputElement).blur()}
                            style={{ ...inpStyle, paddingRight: '2.5rem' }} />
                          <span style={{ position: 'absolute', right: '.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.85rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', pointerEvents: 'none' }}>%</span>
                        </div>
                      ) : (
                        <div style={{ position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '.85rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.78rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', pointerEvents: 'none' }}>R$</span>
                          <input type="number" min="0" step="0.01" value={s.comissaoAbs}
                            onChange={e => update(s.id, 'comissaoAbs', parseFloat(e.target.value) || 0)}
                            onWheel={e => (e.target as HTMLInputElement).blur()}
                            style={{ ...inpStyle, paddingLeft: '2.25rem' }} />
                        </div>
                      )}
                      <div style={{ fontSize: '.62rem', color: '#94a3b8', marginTop: '.25rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        {herdando ? `Igual à ${primeiroAtivo?.label}` : (s.comissaoTipo === 'pct' ? 'Margem sobre o custo' : 'Valor fixo por kit')}
                      </div>
                    </div>

                    {/* Qtd alunos — sempre editável e própria da turma */}
                    <div>
                      <label style={lblStyle}>Qtd. Alunos</label>
                      <input type="number" min="0" value={s.qtdAlunos}
                        onChange={e => update(s.id, 'qtdAlunos', parseInt(e.target.value) || 0)}
                        onWheel={e => (e.target as HTMLInputElement).blur()}
                        style={{ ...inpStyle, textAlign: 'center', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1rem', fontWeight: 700 }} />
                      <div style={{ fontSize: '.62rem', color: '#94a3b8', marginTop: '.25rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        Manutenção: {fmt(CUSTO_MANUTENCAO_PLATAFORMA)}/kit
                      </div>
                    </div>

                    {/* Parcelas — editável, ou igual ao primeiro segmento quando o toggle está ligado */}
                    <div>
                      <label style={lblStyle}>Parcelas</label>
                      {herdando ? (
                        <div style={{ ...inpStyle, background: '#f8fafc', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                          {ref.parcelas === 1 ? 'À vista' : `${ref.parcelas}x`}
                        </div>
                      ) : (
                        <select value={s.parcelas} onChange={e => update(s.id, 'parcelas', parseInt(e.target.value))} style={inpStyle}>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(n => (
                            <option key={n} value={n}>{n === 1 ? 'À vista' : `${n}x`}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Botão calcular ───────────────────────────────────── */}
        {ativos.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <button onClick={handleCalcular} style={{
              width: '100%', maxWidth: 400, padding: '.9rem 2rem',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', fontWeight: 800, fontSize: '1rem',
              border: 'none', borderRadius: 9999, cursor: 'pointer',
              fontFamily: 'var(--font-montserrat,sans-serif)',
              boxShadow: '0 6px 20px rgba(217,119,6,.4)', letterSpacing: '.02em', display: 'block',
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
              3. Resultados por segmento
            </div>

            {/* Cartões */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: '1.1rem', marginBottom: '2rem' }}>
              {ativos.map(s => {
                const r = calculados[s.id]
                if (!r) return null
                const ref = s.igualPrimeiro && primeiroAtivo ? primeiroAtivo : s
                return (
                  <div key={s.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: '4px solid #d97706', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 16px rgba(15,23,42,.08)' }}>
                    <div style={{ background: '#0f172a', padding: '1rem 1.25rem' }}>
                      <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.2rem' }}>Segmento</div>
                      <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{s.label}</div>
                      <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)', marginTop: '.15rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        {r.qtd_alunos} aluno{r.qtd_alunos !== 1 ? 's' : ''} · manutenção: {fmt(r.custo_manutencao)}/kit
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #f1f5f9' }}>
                      {[
                        { label: 'Custo de Aquisição', value: fmt(r.custo), sub: 'escola paga', bg: '#f8fafc' },
                        { label: 'Comissão', value: fmt(r.comissao_valor), sub: ref.comissaoTipo === 'pct' ? `${ref.comissaoPct}% sobre custo` : 'valor fixo', bg: '#f5f3ff' },
                        { label: 'Nota Fiscal', value: fmt(r.custo_nota_fiscal), sub: 'por venda', bg: '#fdf4ff' },
                        { label: 'Manutenção da Plataforma', value: fmt(r.custo_manutencao), sub: 'por kit, integral', bg: '#eff6ff' },
                        { label: 'Despesas de Parcelamento', value: fmt(r.total_taxas_parcelamento), sub: `plataforma + cartão (${r.taxa_cartao_pct.toFixed(2)}%) + taxa fixa`, bg: '#fef2f2' },
                        { label: 'Valor Final ao Pai', value: fmt(r.preco_final), sub: ref.parcelas === 1 ? 'à vista' : `${ref.parcelas}x de ${fmt(r.valor_parcela)}`, bg: '#fffbeb', big: true, full: true },
                      ].map(m => (
                        <div key={m.label} style={{ gridColumn: (m as any).full ? '1 / -1' : undefined, background: m.bg, padding: '.85rem 1rem', borderRight: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
                          <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.2rem' }}>{m.label}</div>
                          <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: (m as any).big ? '1.3rem' : '1.1rem', fontWeight: 800, color: (m as any).big ? '#d97706' : '#0f172a', lineHeight: 1 }}>{m.value}</div>
                          <div style={{ fontSize: '.62rem', color: '#94a3b8', marginTop: '.2rem', fontFamily: 'var(--font-inter,sans-serif)' }}>{m.sub}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ padding: '.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.15rem' }}>Líquido Real</div>
                        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1rem', fontWeight: 800, color: '#16a34a' }}>{fmt(r.liquido_real)}</div>
                      </div>
                      {r.parcela_valida
                        ? <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>✓ Válido</span>
                        : <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', padding: '.25rem .75rem', borderRadius: 99, fontSize: '.65rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>⚠ Parcela abaixo de R$30</span>
                      }
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tabela comparativa */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)', marginBottom: '1.5rem' }}>
              <div style={{ background: '#0f172a', padding: '1rem 1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706' }}>
                  Resumo comparativo por segmento
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Segmento','Alunos','Custo Kit','Comissão','Nota Fiscal','Taxas Eskolare','Manutenção','Preço Final','Parcela','Líquido Real','Status'].map(col => (
                        <th key={col} style={{ padding: '.65rem 1rem', textAlign: 'left', fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', borderBottom: '1px solid #e2e8f0', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ativos.map((s, idx) => {
                      const r = calculados[s.id]
                      if (!r) return null
                      const ref = s.igualPrimeiro && primeiroAtivo ? primeiroAtivo : s
                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 700, fontSize: '.82rem', color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                            {s.label}
                          </td>
                          <td style={{ padding: '.75rem 1rem', textAlign: 'center', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem', fontWeight: 700, color: '#0f172a' }}>{r.qtd_alunos}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmt(r.custo)}</td>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: '#7c3aed', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>
                            {fmt(r.comissao_valor)}
                            <span style={{ display: 'block', fontSize: '.62rem', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                              {ref.comissaoTipo === 'pct' ? `${ref.comissaoPct}%` : 'valor fixo'}
                            </span>
                          </td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#a855f7', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmt(r.custo_nota_fiscal)}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#dc2626', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmt(r.total_taxas_parcelamento)}</td>
                          <td style={{ padding: '.75rem 1rem', fontSize: '.82rem', color: '#0ea5e9', fontFamily: 'var(--font-inter,sans-serif)' }}>{fmt(r.custo_manutencao)}</td>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1rem' }}>{fmt(r.preco_final)}</td>
                          <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem', whiteSpace: 'nowrap' }}>
                            {ref.parcelas === 1 ? 'À vista' : `${ref.parcelas}x ${fmt(r.valor_parcela)}`}
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
                    {/* Linha de totais */}
                    <tr style={{ background: '#0f172a' }}>
                      <td style={{ padding: '.75rem 1rem', fontWeight: 700, fontSize: '.78rem', color: '#d97706', fontFamily: 'var(--font-montserrat,sans-serif)' }}>TOTAL</td>
                      <td style={{ padding: '.75rem 1rem', textAlign: 'center', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-cormorant,serif)', fontSize: '.95rem' }}>{totalAlunos}</td>
                      <td colSpan={5} style={{ padding: '.75rem 1rem', fontSize: '.72rem', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        Manutenção da plataforma: {fmt(CUSTO_MANUTENCAO_PLATAFORMA)}/kit × {totalAlunos} kits = {fmt(CUSTO_MANUTENCAO_PLATAFORMA * totalAlunos)}
                      </td>
                      <td colSpan={4} style={{ padding: '.75rem 1rem', fontSize: '.72rem', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        Nota fiscal: {fmt(CUSTO_NOTA_FISCAL)}/kit × {totalAlunos} kits = {fmt(CUSTO_NOTA_FISCAL * totalAlunos)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resumo financeiro da proposta — soma de todos os segmentos ativos */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 16, padding: '1.5rem 1.75rem', marginBottom: '1.5rem' }}>
              <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.25rem' }}>
                💰 Resumo financeiro da proposta
              </div>
              <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.45)', marginBottom: '1.1rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                Soma de todos os segmentos ativos ({totalAlunos} aluno{totalAlunos !== 1 ? 's' : ''})
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1.25rem' }}>
                {[
                  { label: 'Faturamento Cidade Viva Education', sub: 'custo de aquisição × alunos', valor: faturamentoEducation, cor: '#38bdf8' },
                  { label: 'Comissão Total', sub: 'comissão × alunos', valor: comissaoTotalProposta, cor: '#c084fc' },
                  { label: 'Faturamento Total da Venda', sub: 'preço final × alunos', valor: faturamentoTotalVenda, cor: '#d97706' },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'rgba(255,255,255,.5)', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.3rem' }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.6rem', fontWeight: 800, color: item.cor, lineHeight: 1 }}>
                      {fmt(item.valor)}
                    </div>
                    <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.35)', marginTop: '.25rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      {item.sub}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Memória de cálculo — uso comercial */}
            {segMemoria && resMemoria && refMemoria && (
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)', marginBottom: '1.5rem' }}>
                <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706' }}>
                      📋 Memória de cálculo — para uso comercial
                    </div>
                    <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.45)', marginTop: '.15rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      Explicação passo a passo de como o preço final é formado, para apresentar à escola
                    </div>
                  </div>
                  {ativos.length > 1 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem' }}>
                      {ativos.map(s => (
                        <button key={s.id} onClick={() => setMemoriaSeg(s.id)}
                          style={{
                            padding: '4px 12px', borderRadius: 9999, cursor: 'pointer',
                            fontSize: '.68rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)',
                            background: s.id === segMemoriaId ? '#d97706' : 'rgba(255,255,255,.08)',
                            color: s.id === segMemoriaId ? '#fff' : 'rgba(255,255,255,.6)',
                            border: `1px solid ${s.id === segMemoriaId ? '#d97706' : 'rgba(255,255,255,.15)'}`,
                          }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <ol style={{ padding: '1.25rem 1.75rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
                  {[
                    {
                      texto: <>Custo de aquisição do kit <span style={{ color: '#94a3b8' }}>(valor pago pela escola ao fornecedor)</span></>,
                      valor: fmt(resMemoria.custo),
                    },
                    {
                      texto: <>Comissão do consultor comercial <span style={{ color: '#94a3b8' }}>({refMemoria.comissaoTipo === 'pct' ? `${refMemoria.comissaoPct}% sobre o custo` : 'valor fixo por kit'})</span></>,
                      valor: `+ ${fmt(resMemoria.comissao_valor)}`,
                    },
                    {
                      texto: <strong>Líquido desejado (custo + comissão)</strong>,
                      valor: fmt(resMemoria.liquido_desejado), destaque: true,
                    },
                    {
                      texto: <>Nota fiscal <span style={{ color: '#94a3b8' }}>(uma nota por venda/kit)</span></>,
                      valor: `+ ${fmt(resMemoria.custo_nota_fiscal)}`,
                    },
                    {
                      texto: <>Taxa fixa Eskolare por parcela <span style={{ color: '#94a3b8' }}>(R$ 0,30 × {PARCELAS_BASE_PRECO} parcelas — sempre calculada em 12x, independente da forma de pagamento escolhida)</span></>,
                      valor: `+ ${fmt(resMemoria.taxa_fixa_eskolare)}`,
                    },
                    {
                      texto: <>Manutenção da plataforma <span style={{ color: '#94a3b8' }}>(R$73,02 + 2% ISS por dentro + {fmt(CUSTO_SUPORTE_LOJA)} de suporte da loja = {fmt(CUSTO_MANUTENCAO_PLATAFORMA)})</span></>,
                      valor: `+ ${fmt(resMemoria.custo_manutencao)}`,
                    },
                    {
                      texto: <strong>Soma dos custos e taxas fixas</strong>,
                      valor: fmt(resMemoria.liquido_desejado + resMemoria.custo_nota_fiscal + resMemoria.taxa_fixa_eskolare + resMemoria.custo_manutencao), destaque: true,
                    },
                    {
                      texto: <>Taxas percentuais Eskolare descontadas no repasse <span style={{ color: '#94a3b8' }}>(plataforma 1,5% + cartão {resMemoria.taxa_cartao_pct.toFixed(2)}% — sempre calculada em 12x, independente da forma de pagamento escolhida)</span></>,
                      valor: `${(1.5 + resMemoria.taxa_cartao_pct).toFixed(2)}%`,
                    },
                    {
                      texto: <strong>Preço final ao pai = soma dos custos fixos ÷ (1 − taxas percentuais)</strong>,
                      valor: fmt(resMemoria.preco_final), destaque: true, cor: '#d97706',
                    },
                    {
                      texto: <>↳ Taxa da plataforma Eskolare <span style={{ color: '#94a3b8' }}>(1,5% do preço final acima)</span></>,
                      valor: fmt(resMemoria.taxa_plataforma_valor),
                    },
                    {
                      texto: <>↳ Taxa de cartão <span style={{ color: '#94a3b8' }}>({resMemoria.taxa_cartao_pct.toFixed(2)}% do preço final, sempre calculada em 12x)</span></>,
                      valor: fmt(resMemoria.taxa_cartao_valor),
                    },
                    {
                      texto: <strong>Total de despesas do parcelamento (plataforma + cartão + taxa fixa)</strong>,
                      valor: fmt(resMemoria.total_taxas_parcelamento), destaque: true,
                    },
                    {
                      texto: <>Forma de pagamento <span style={{ color: '#94a3b8' }}>(escolhida pela família — não altera o preço final acima)</span></>,
                      valor: refMemoria.parcelas === 1 ? 'À vista' : `${refMemoria.parcelas}x de ${fmt(resMemoria.valor_parcela)}`,
                    },
                    {
                      texto: <>Conferência — líquido real recebido pela Cidade Viva <span style={{ color: '#94a3b8' }}>(deve bater com o líquido desejado no passo 3)</span></>,
                      valor: fmt(resMemoria.liquido_real), cor: '#16a34a',
                    },
                  ].map((item, i) => (
                    <li key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem',
                      padding: (item as any).destaque ? '.6rem .9rem' : '0', borderRadius: 8,
                      background: (item as any).destaque ? '#fffbeb' : 'transparent',
                    }}>
                      <span style={{ fontSize: '.82rem', color: '#334155', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.5 }}>
                        <strong style={{ color: '#94a3b8', marginRight: '.5rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{i + 1}.</strong>
                        {item.texto}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-cormorant,serif)', fontSize: (item as any).destaque ? '1.15rem' : '1rem', fontWeight: 800,
                        color: (item as any).cor ?? ((item as any).destaque ? '#d97706' : '#0f172a'),
                        whiteSpace: 'nowrap',
                      }}>
                        {item.valor}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Tabela de taxas */}
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.5rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
              <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#d97706', marginBottom: '.75rem' }}>
                Taxas Eskolare aplicadas
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
                {[
                  ['Taxa da plataforma', '1,5%'],
                  ['Taxa cartão aplicada (sempre 12x)', `${(TAXA_CARTAO_PARCELADO * 100).toFixed(2)}%`],
                  ['Taxa cartão 1x (referência)', '2,89%'],
                  ['Taxa cartão 2x–6x (referência)', '2,99%'],
                  ['Taxa cartão 7x–12x (referência)', '3,69%'],
                  ['Taxa fixa por parcela (sempre 12x)', `R$ 0,30 × 12 = ${fmt(TAXA_FIXA_PARCELA * PARCELAS_BASE_PRECO)}`],
                  ['Mínimo por parcela', 'R$ 30,00'],
                  ['Nota fiscal (por kit)', fmt(CUSTO_NOTA_FISCAL)],
                  ['Manutenção — Valor base (sem ISS)', fmt(CUSTO_LOJA_BASE)],
                  ['Manutenção — ISS (2%, por dentro)', fmt(CUSTO_LOJA_BASE / (1 - ISS_LOJA) - CUSTO_LOJA_BASE)],
                  ['Manutenção — Suporte da loja', fmt(CUSTO_SUPORTE_LOJA)],
                  ['Manutenção — Total (por kit, integral)', fmt(CUSTO_MANUTENCAO_PLATAFORMA)],
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

        {ativos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto .75rem' }}>
              <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
            </svg>
            <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', color: '#0f172a', marginBottom: '.4rem' }}>Selecione pelo menos um segmento</h3>
            <p style={{ fontSize: '.85rem', fontFamily: 'var(--font-inter,sans-serif)' }}>Clique nos botões acima para ativar os segmentos da escola.</p>
          </div>
        )}

      </div>
    </div>
  )
}
