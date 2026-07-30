'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import type { FormularioBriefingConfig, Pergunta } from '@/lib/marketing-briefings'
import { salvarRespostaBriefing } from './marketing-actions'

type Resposta = string | string[] | Record<string, string> | undefined

interface Props {
  config: FormularioBriefingConfig
}

const OUTRO_VALOR = 'Outro'

const lbl: React.CSSProperties = {
  display: 'block', fontSize: '.78rem', fontWeight: 700, color: '#0f172a',
  marginBottom: '.5rem', lineHeight: 1.5, fontFamily: 'var(--font-inter,sans-serif)',
}
const objetivoStyle: React.CSSProperties = {
  fontSize: '.72rem', color: '#94a3b8', marginBottom: '.5rem', fontStyle: 'italic',
}
const inp: React.CSSProperties = {
  width: '100%', padding: '.6rem .85rem', fontSize: '.85rem',
  fontFamily: 'var(--font-inter,sans-serif)', border: '1.5px solid #e2e8f0',
  borderRadius: 8, background: '#f8fafc', color: '#0f172a', outline: 'none',
  boxSizing: 'border-box' as const,
}

function agruparPorBloco(perguntas: Pergunta[]) {
  const blocos: { bloco: string; perguntas: Pergunta[] }[] = []
  for (const p of perguntas) {
    let grupo = blocos.find(b => b.bloco === p.bloco)
    if (!grupo) { grupo = { bloco: p.bloco, perguntas: [] }; blocos.push(grupo) }
    grupo.perguntas.push(p)
  }
  return blocos
}

export function FormularioBriefing({ config }: Props) {
  const router = useRouter()
  const [respostas, setRespostas] = useState<Record<string, Resposta>>({})
  const [outros, setOutros] = useState<Record<string, string>>({})
  const [naoSei, setNaoSei] = useState<Record<string, boolean>>({})
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)

  const blocos = useMemo(() => agruparPorBloco(config.perguntas), [config.perguntas])

  const set = (id: string, valor: Resposta) => setRespostas(prev => ({ ...prev, [id]: valor }))

  function faltamObrigatorias(): string[] {
    const faltando: string[] = []
    for (const p of config.perguntas) {
      if (!p.obrigatoria) continue
      const v = respostas[p.id]
      const vazio =
        v === undefined ||
        (typeof v === 'string' && v.trim() === '') ||
        (Array.isArray(v) && v.length === 0) ||
        (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
      if (vazio) faltando.push(p.texto)
    }
    return faltando
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const faltando = faltamObrigatorias()
    if (faltando.length > 0) {
      setErro(`Faltam ${faltando.length} pergunta(s) obrigatória(s) para responder.`)
      return
    }
    setErro('')
    setEnviando(true)

    // Junta o texto do "Outro" no valor final, para ficar legível no painel admin
    const respostasFinais: Record<string, Resposta> = { ...respostas }
    for (const [id, texto] of Object.entries(outros)) {
      if (!texto) continue
      const v = respostasFinais[id]
      if (Array.isArray(v)) {
        respostasFinais[id] = v.map(x => x === OUTRO_VALOR ? `Outro: ${texto}` : x)
      } else if (v === OUTRO_VALOR) {
        respostasFinais[id] = `Outro: ${texto}`
      }
    }
    for (const [id, marcado] of Object.entries(naoSei)) {
      if (marcado) respostasFinais[id] = 'Não sei informar / não medimos'
    }

    const result = await salvarRespostaBriefing({
      formularioId: config.id,
      nome: String(respostas.nome ?? ''),
      funcao: String(respostas.funcao ?? ''),
      tempoAtuacao: String(respostas.tempo_atuacao ?? ''),
      areasParticipacao: respostas.areas_participacao ?? {},
      prioridadesPercebidas: respostas.prioridades_percebidas ?? [],
      respostas: respostasFinais,
    })

    if (!result.success) {
      setErro(result.error ?? 'Erro ao salvar. Tente novamente.')
      setEnviando(false)
      return
    }
    setEnviado(true)
    setEnviando(false)
  }

  if (enviado) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '3rem 2.5rem', textAlign: 'center', boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.6rem', color: '#0f172a', marginBottom: '.5rem' }}>
          Briefing enviado com sucesso!
        </h2>
        <p style={{ color: '#64748b', fontSize: '.9rem', marginBottom: '1.5rem' }}>
          Obrigado por responder. Suas respostas já estão disponíveis no painel de marketing.
        </p>
        <button onClick={() => router.push('/marketing')} style={{
          padding: '.7rem 1.5rem', borderRadius: 9999, border: 'none',
          background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff',
          fontWeight: 700, fontSize: '.85rem', cursor: 'pointer',
          fontFamily: 'var(--font-montserrat,sans-serif)',
        }}>
          Voltar para Gestão de Marketing
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {blocos.map((grupo, idxBloco) => (
        <div key={grupo.bloco} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.75rem 2rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
          <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#d97706', borderBottom: '2px solid #fde68a', paddingBottom: '.5rem', marginBottom: '1.25rem' }}>
            {idxBloco + 1}. {grupo.bloco}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {grupo.perguntas.map(p => (
              <PerguntaCampo
                key={p.id}
                pergunta={p}
                valor={respostas[p.id]}
                outro={outros[p.id] ?? ''}
                naoSei={naoSei[p.id] ?? false}
                onChange={v => set(p.id, v)}
                onOutroChange={t => setOutros(prev => ({ ...prev, [p.id]: t }))}
                onNaoSeiChange={v => setNaoSei(prev => ({ ...prev, [p.id]: v }))}
              />
            ))}
          </div>
        </div>
      ))}

      {erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '.85rem 1.1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '.82rem', fontWeight: 600 }}>
          ⚠ {erro}
        </div>
      )}

      <button type="submit" disabled={enviando} style={{
        width: '100%', padding: '.9rem', borderRadius: 9999, border: 'none',
        background: enviando ? '#e2e8f0' : 'linear-gradient(135deg, #d97706, #b45309)',
        color: enviando ? '#94a3b8' : '#fff', fontWeight: 800, fontSize: '.95rem',
        cursor: enviando ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)',
        boxShadow: enviando ? 'none' : '0 6px 20px rgba(217,119,6,.35)', letterSpacing: '.02em',
      }}>
        {enviando ? 'Enviando...' : 'Enviar Briefing'}
      </button>
    </form>
  )
}

// ═══════════════════════════════════════════════════════════════════════
// Campo por tipo de pergunta
// ═══════════════════════════════════════════════════════════════════════
function PerguntaCampo({ pergunta, valor, outro, naoSei, onChange, onOutroChange, onNaoSeiChange }: {
  pergunta: Pergunta
  valor: Resposta
  outro: string
  naoSei: boolean
  onChange: (v: Resposta) => void
  onOutroChange: (t: string) => void
  onNaoSeiChange: (v: boolean) => void
}) {
  return (
    <div>
      <label style={lbl}>{pergunta.texto}{pergunta.obrigatoria && <span style={{ color: '#dc2626' }}> *</span>}</label>
      {pergunta.objetivo && <div style={objetivoStyle}>{pergunta.objetivo}</div>}

      {pergunta.tipo === 'texto_curto' && (
        <input type="text" style={inp} value={(valor as string) ?? ''} onChange={e => onChange(e.target.value)} />
      )}

      {pergunta.tipo === 'texto_longo' && (
        <textarea rows={4} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} value={(valor as string) ?? ''} onChange={e => onChange(e.target.value)} />
      )}

      {pergunta.tipo === 'escolha_unica' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
          {pergunta.opcoes.map(op => (
            <OpcaoRadio key={op} label={op} checked={valor === op} onClick={() => onChange(op)} />
          ))}
          {pergunta.permiteOutro && (
            <OpcaoRadio label={OUTRO_VALOR} checked={valor === OUTRO_VALOR} onClick={() => onChange(OUTRO_VALOR)}>
              {valor === OUTRO_VALOR && (
                <input type="text" style={{ ...inp, marginTop: '.4rem' }} placeholder="Especifique..." value={outro} onChange={e => onOutroChange(e.target.value)} />
              )}
            </OpcaoRadio>
          )}
        </div>
      )}

      {pergunta.tipo === 'caixas_selecao' && (
        <CaixasSelecao pergunta={pergunta} valor={(valor as string[]) ?? []} outro={outro} onChange={onChange} onOutroChange={onOutroChange} />
      )}

      {pergunta.tipo === 'escala' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {pergunta.escala.map(op => (
            <button key={op} type="button" onClick={() => onChange(op)} style={{
              padding: '.5rem .9rem', borderRadius: 9999, cursor: 'pointer', fontSize: '.75rem', fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              background: valor === op ? '#d97706' : '#f1f5f9',
              color: valor === op ? '#fff' : '#475569',
              border: `1.5px solid ${valor === op ? '#d97706' : '#e2e8f0'}`,
            }}>
              {op}
            </button>
          ))}
        </div>
      )}

      {pergunta.tipo === 'grade' && (
        <GradeCampo pergunta={pergunta} valor={(valor as Record<string, string>) ?? {}} onChange={onChange} />
      )}

      {pergunta.tipo === 'ranking' && (
        <RankingCampo pergunta={pergunta} valor={(valor as string[]) ?? []} onChange={onChange} />
      )}

      {pergunta.tipo === 'estruturado' && (
        <EstruturadoCampo pergunta={pergunta} valor={(valor as Record<string, string>) ?? {}} naoSei={naoSei} onChange={onChange} onNaoSeiChange={onNaoSeiChange} />
      )}

      {pergunta.observacao && (
        <div style={{ fontSize: '.68rem', color: '#94a3b8', marginTop: '.4rem', lineHeight: 1.5 }}>{pergunta.observacao}</div>
      )}
    </div>
  )
}

function OpcaoRadio({ label, checked, onClick, children }: { label: string; checked: boolean; onClick: () => void; children?: React.ReactNode }) {
  return (
    <div>
      <div onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer',
        padding: '.5rem .7rem', borderRadius: 8,
        background: checked ? '#fffbeb' : 'transparent',
        border: `1.5px solid ${checked ? '#fde68a' : 'transparent'}`,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${checked ? '#d97706' : '#cbd5e1'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {checked && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d97706' }} />}
        </div>
        <span style={{ fontSize: '.82rem', color: '#334155' }}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function CaixasSelecao({ pergunta, valor, outro, onChange, onOutroChange }: {
  pergunta: Extract<Pergunta, { tipo: 'caixas_selecao' }>
  valor: string[]
  outro: string
  onChange: (v: string[]) => void
  onOutroChange: (t: string) => void
}) {
  const limiteAtingido = !!pergunta.limite && valor.length >= pergunta.limite

  function toggle(op: string) {
    const marcado = valor.includes(op)
    if (marcado) { onChange(valor.filter(v => v !== op)); return }
    if (limiteAtingido) return
    onChange([...valor, op])
  }

  return (
    <div>
      {pergunta.limite && (
        <div style={{ fontSize: '.68rem', color: '#94a3b8', marginBottom: '.5rem' }}>
          Selecione até {pergunta.limite}. ({valor.length}/{pergunta.limite})
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
        {pergunta.opcoes.map(op => {
          const marcado = valor.includes(op)
          const desabilitado = !marcado && limiteAtingido
          return (
            <div key={op} onClick={() => !desabilitado && toggle(op)} style={{
              display: 'flex', alignItems: 'center', gap: '.6rem',
              cursor: desabilitado ? 'not-allowed' : 'pointer', opacity: desabilitado ? .4 : 1,
              padding: '.45rem .7rem', borderRadius: 8,
              background: marcado ? '#fffbeb' : 'transparent',
              border: `1.5px solid ${marcado ? '#fde68a' : 'transparent'}`,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${marcado ? '#d97706' : '#cbd5e1'}`,
                background: marcado ? '#d97706' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.6rem',
              }}>
                {marcado && '✓'}
              </div>
              <span style={{ fontSize: '.82rem', color: '#334155' }}>{op}</span>
            </div>
          )
        })}
        {pergunta.permiteOutro && (
          <div>
            <div onClick={() => !( !valor.includes(OUTRO_VALOR) && limiteAtingido) && toggle(OUTRO_VALOR)} style={{
              display: 'flex', alignItems: 'center', gap: '.6rem', cursor: 'pointer',
              padding: '.45rem .7rem', borderRadius: 8,
              background: valor.includes(OUTRO_VALOR) ? '#fffbeb' : 'transparent',
              border: `1.5px solid ${valor.includes(OUTRO_VALOR) ? '#fde68a' : 'transparent'}`,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                border: `2px solid ${valor.includes(OUTRO_VALOR) ? '#d97706' : '#cbd5e1'}`,
                background: valor.includes(OUTRO_VALOR) ? '#d97706' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '.6rem',
              }}>
                {valor.includes(OUTRO_VALOR) && '✓'}
              </div>
              <span style={{ fontSize: '.82rem', color: '#334155' }}>{OUTRO_VALOR}</span>
            </div>
            {valor.includes(OUTRO_VALOR) && (
              <input type="text" style={{ ...inp, marginTop: '.4rem' }} placeholder="Especifique..." value={outro} onChange={e => onOutroChange(e.target.value)} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function GradeCampo({ pergunta, valor, onChange }: {
  pergunta: Extract<Pergunta, { tipo: 'grade' }>
  valor: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '.4rem .5rem', fontSize: '.65rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}></th>
            {pergunta.colunas.map(col => (
              <th key={col} style={{ padding: '.4rem .5rem', fontSize: '.65rem', color: '#64748b', fontWeight: 700, textAlign: 'center', minWidth: 90 }}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pergunta.linhas.map(linha => (
            <tr key={linha} style={{ borderTop: '1px solid #f1f5f9' }}>
              <td style={{ padding: '.5rem', fontSize: '.78rem', color: '#334155', fontWeight: 600 }}>{linha}</td>
              {pergunta.colunas.map(col => (
                <td key={col} style={{ textAlign: 'center', padding: '.4rem' }}>
                  <div
                    onClick={() => onChange({ ...valor, [linha]: col })}
                    style={{
                      width: 18, height: 18, borderRadius: '50%', margin: '0 auto', cursor: 'pointer',
                      border: `2px solid ${valor[linha] === col ? '#d97706' : '#cbd5e1'}`,
                      background: valor[linha] === col ? '#d97706' : '#fff',
                    }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RankingCampo({ pergunta, valor, onChange }: {
  pergunta: Extract<Pergunta, { tipo: 'ranking' }>
  valor: string[]
  onChange: (v: string[]) => void
}) {
  function toggle(op: string) {
    const idx = valor.indexOf(op)
    if (idx >= 0) { onChange(valor.filter(v => v !== op)); return }
    if (valor.length >= pergunta.limite) return
    onChange([...valor, op])
  }

  return (
    <div>
      <div style={{ fontSize: '.68rem', color: '#94a3b8', marginBottom: '.5rem' }}>
        Clique na ordem de prioridade — até {pergunta.limite} itens. ({valor.length}/{pergunta.limite})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
        {pergunta.opcoes.map(op => {
          const posicao = valor.indexOf(op)
          const marcado = posicao >= 0
          const desabilitado = !marcado && valor.length >= pergunta.limite
          return (
            <div key={op} onClick={() => !desabilitado && toggle(op)} style={{
              display: 'flex', alignItems: 'center', gap: '.6rem',
              cursor: desabilitado ? 'not-allowed' : 'pointer', opacity: desabilitado ? .4 : 1,
              padding: '.45rem .7rem', borderRadius: 8,
              background: marcado ? '#fffbeb' : 'transparent',
              border: `1.5px solid ${marcado ? '#fde68a' : 'transparent'}`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                background: marcado ? '#d97706' : '#f1f5f9',
                color: marcado ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '.68rem', fontWeight: 800,
              }}>
                {marcado ? posicao + 1 : ''}
              </div>
              <span style={{ fontSize: '.82rem', color: '#334155' }}>{op}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EstruturadoCampo({ pergunta, valor, naoSei, onChange, onNaoSeiChange }: {
  pergunta: Extract<Pergunta, { tipo: 'estruturado' }>
  valor: Record<string, string>
  naoSei: boolean
  onChange: (v: Record<string, string>) => void
  onNaoSeiChange: (v: boolean) => void
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(pergunta.campos.length, 3)}, 1fr)`, gap: '.85rem', opacity: naoSei ? .4 : 1, pointerEvents: naoSei ? 'none' : 'auto' }}>
        {pergunta.campos.map(campo => (
          <div key={campo.id}>
            <label style={{ display: 'block', fontSize: '.68rem', fontWeight: 700, color: '#64748b', marginBottom: '.3rem', textTransform: 'uppercase', letterSpacing: '.04em' }}>{campo.label}</label>
            <div style={{ position: 'relative' }}>
              {campo.tipo === 'moeda' && (
                <span style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', fontSize: '.78rem', color: '#94a3b8', fontWeight: 700 }}>R$</span>
              )}
              <input
                type={campo.tipo === 'numero' || campo.tipo === 'moeda' ? 'number' : 'text'}
                step={campo.tipo === 'moeda' ? '0.01' : undefined}
                min={campo.tipo === 'numero' || campo.tipo === 'moeda' ? '0' : undefined}
                onWheel={e => (e.target as HTMLInputElement).blur()}
                style={{ ...inp, paddingLeft: campo.tipo === 'moeda' ? '2.1rem' : undefined }}
                value={valor[campo.id] ?? ''}
                onChange={e => onChange({ ...valor, [campo.id]: e.target.value })}
              />
            </div>
          </div>
        ))}
      </div>
      {pergunta.naoSeiLabel && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginTop: '.6rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={naoSei} onChange={e => onNaoSeiChange(e.target.checked)} />
          <span style={{ fontSize: '.75rem', color: '#64748b' }}>{pergunta.naoSeiLabel}</span>
        </label>
      )}
    </div>
  )
}
