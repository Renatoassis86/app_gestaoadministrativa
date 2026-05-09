'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { moverNegociacao } from './pipeline-actions'

const STAGE_COLORS: Record<string, string> = {
  prospeccao:   '#6366f1',
  qualificacao: '#8b5cf6',
  apresentacao: '#d97706',
  proposta:     '#f59e0b',
  negociacao:   '#0ea5e9',
  fechamento:   '#16a34a',
}

const STAGE_LABELS: Record<string, string> = {
  prospeccao:   'Prospecção',
  qualificacao: 'Qualificação',
  apresentacao: 'Apresentação',
  proposta:     'Proposta',
  negociacao:   'Negociação',
  fechamento:   'Fechamento',
}

interface Neg {
  id: string
  stage: string
  escola_id: string
  titulo: string | null
  valor_estimado: number | null
  probabilidade: number
  responsavel_id: string | null
  escola: { id: string; nome: string; cidade?: string | null; estado: string | null } | null
  responsavel: { id: string; full_name: string } | null
}

interface Props {
  negociacoes: Neg[]
  stages: string[]
  userId: string
}

function fmtCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function nameColor(name: string) {
  const colors = ['#6366f1','#8b5cf6','#d97706','#0ea5e9','#16a34a','#dc2626','#7c3aed','#db2777']
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff
  return colors[Math.abs(h) % colors.length]
}

export function PipelineKanban({ negociacoes: initialNegs, stages, userId }: Props) {
  const [negs, setNegs] = useState<Neg[]>(initialNegs)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<string | null>(null)
  const [moving, setMoving] = useState<string | null>(null)
  const dragStageRef = useRef<string | null>(null)

  const byStage = (stage: string) => negs.filter(n => n.stage === stage)

  function handleDragStart(e: React.DragEvent, negId: string, fromStage: string) {
    setDraggingId(negId)
    dragStageRef.current = fromStage
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', negId)
    setTimeout(() => {
      const el = document.getElementById(`neg-${negId}`)
      if (el) el.style.opacity = '0.35'
    }, 0)
  }

  function handleDragEnd(e: React.DragEvent, negId: string) {
    setDraggingId(null)
    setOverStage(null)
    dragStageRef.current = null
    const el = document.getElementById(`neg-${negId}`)
    if (el) el.style.opacity = '1'
  }

  function handleDragOver(e: React.DragEvent, toStage: string) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setOverStage(toStage)
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setOverStage(null)
    }
  }

  async function handleDrop(e: React.DragEvent, toStage: string) {
    e.preventDefault()
    setOverStage(null)
    const negId = e.dataTransfer.getData('text/plain')
    const fromStage = dragStageRef.current
    if (!negId || !fromStage || fromStage === toStage) return

    setMoving(negId)
    setNegs(prev => prev.map(n => n.id === negId ? { ...n, stage: toStage } : n))

    try {
      const result = await moverNegociacao(negId, toStage)
      if (!result.success) {
        setNegs(prev => prev.map(n => n.id === negId ? { ...n, stage: fromStage! } : n))
      }
    } catch {
      setNegs(prev => prev.map(n => n.id === negId ? { ...n, stage: fromStage! } : n))
    }
    setMoving(null)
    setDraggingId(null)
  }

  const totalValue = negs.reduce((acc, n) => acc + (n.valor_estimado ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>

      {/* Barra de progresso do funil */}
      {negs.length > 0 && (
        <div style={{ display: 'flex', gap: 3, height: 6, borderRadius: 6, overflow: 'hidden' }}>
          {stages.map(stage => {
            const count = byStage(stage).length
            const pct = negs.length > 0 ? (count / negs.length) * 100 : 0
            return pct > 0 ? (
              <div key={stage} title={STAGE_LABELS[stage]} style={{
                width: `${pct}%`, background: STAGE_COLORS[stage] ?? '#cbd5e1',
                transition: 'width .3s',
              }} />
            ) : null
          })}
        </div>
      )}

      {/* Board Kanban */}
      <div className="pipeline-board" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
        gap: '.75rem',
        alignItems: 'flex-start',
      }}>
        {stages.map(stage => {
          const cards  = byStage(stage)
          const cor    = STAGE_COLORS[stage] ?? '#64748b'
          const isOver = overStage === stage
          const label  = STAGE_LABELS[stage] ?? stage
          const stageValue = cards.reduce((acc, n) => acc + (n.valor_estimado ?? 0), 0)

          return (
            <div key={stage}
              style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
              onDragOver={e => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, stage)}
            >
              {/* Header da coluna */}
              <div style={{
                padding: '.6rem .9rem',
                borderRadius: '10px 10px 0 0',
                background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: `3px solid ${cor}`,
                gap: '.5rem',
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--font-montserrat,sans-serif)', color: cor, lineHeight: 1 }}>
                    {label}
                  </div>
                  {stageValue > 0 && (
                    <div style={{ fontSize: '.6rem', color: 'rgba(255,255,255,.4)', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {fmtCurrency(stageValue)}
                    </div>
                  )}
                </div>
                <span style={{
                  background: cor, color: '#fff', fontSize: '.6rem', fontWeight: 800,
                  padding: '.15rem .45rem', borderRadius: 99, flexShrink: 0,
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                }}>
                  {cards.length}
                </span>
              </div>

              {/* Drop zone */}
              <div style={{
                background: isOver ? `${cor}10` : '#f8fafc',
                border: `1.5px solid ${isOver ? cor : '#e2e8f0'}`,
                borderTop: 'none',
                borderRadius: '0 0 10px 10px',
                padding: '.6rem',
                minHeight: 120,
                display: 'flex',
                flexDirection: 'column',
                gap: '.5rem',
                transition: 'all .15s',
                boxShadow: isOver ? `inset 0 0 0 2px ${cor}30` : 'none',
              }}>

                {isOver && draggingId && (
                  <div style={{
                    border: `2px dashed ${cor}`, borderRadius: 8,
                    padding: '.6rem', textAlign: 'center', fontSize: '.68rem',
                    color: cor, fontWeight: 700,
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                    background: `${cor}08`,
                  }}>
                    Soltar aqui
                  </div>
                )}

                {cards.length === 0 && !isOver ? (
                  <div style={{ textAlign: 'center', padding: '1.25rem .5rem', fontSize: '.7rem', color: '#cbd5e1', fontFamily: 'var(--font-inter,sans-serif)' }}>
                    Vazio
                  </div>
                ) : cards.map(n => {
                  const respNome  = n.responsavel?.full_name ?? ''
                  const respColor = respNome ? nameColor(respNome) : '#94a3b8'
                  const isMoving  = moving === n.id
                  const escolaNome = n.escola?.nome ?? '—'
                  const primeiroNome = respNome ? respNome.split(' ')[0] : ''

                  return (
                    <div
                      key={n.id}
                      id={`neg-${n.id}`}
                      draggable
                      onDragStart={e => handleDragStart(e, n.id, stage)}
                      onDragEnd={e => handleDragEnd(e, n.id)}
                      style={{
                        background: isMoving ? '#f8fafc' : '#fff',
                        border: `1px solid ${isMoving ? cor : '#e8edf3'}`,
                        borderLeft: `3px solid ${cor}`,
                        borderRadius: 9,
                        padding: '.65rem .75rem',
                        boxShadow: '0 1px 4px rgba(15,23,42,.07)',
                        cursor: 'grab',
                        userSelect: 'none',
                        transition: 'box-shadow .15s, transform .1s',
                        opacity: isMoving ? 0.55 : 1,
                      }}
                      onMouseEnter={e => {
                        if (!draggingId) {
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,.13)'
                          e.currentTarget.style.transform = 'translateY(-2px)'
                        }
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,.07)'
                        e.currentTarget.style.transform = 'translateY(0)'
                      }}
                    >
                      {/* Nome da escola — destaque principal */}
                      <div style={{
                        fontFamily: 'var(--font-montserrat,sans-serif)',
                        fontWeight: 800,
                        fontSize: '.8rem',
                        color: '#0f172a',
                        lineHeight: 1.3,
                        marginBottom: '.4rem',
                        wordBreak: 'break-word',
                      }}>
                        {escolaNome}
                      </div>

                      {/* Estado */}
                      {n.escola?.estado && (
                        <div style={{ fontSize: '.6rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)', marginBottom: '.35rem' }}>
                          {n.escola.cidade ? `${n.escola.cidade} / ` : ''}{n.escola.estado}
                        </div>
                      )}

                      {/* Valor estimado */}
                      {n.valor_estimado != null && n.valor_estimado > 0 && (
                        <div style={{
                          fontFamily: 'var(--font-cormorant,serif)',
                          fontWeight: 800, color: '#16a34a', fontSize: '.95rem',
                          letterSpacing: '.01em', lineHeight: 1, marginBottom: '.4rem',
                        }}>
                          {fmtCurrency(n.valor_estimado)}
                        </div>
                      )}

                      {/* Tag do responsável */}
                      {respNome && (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', gap: '.28rem',
                          background: `${respColor}15`,
                          border: `1px solid ${respColor}35`,
                          borderRadius: 99, padding: '.18rem .5rem .18rem .22rem',
                          marginBottom: '.35rem',
                        }}>
                          <div style={{
                            width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                            background: respColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '.45rem', fontWeight: 800,
                            fontFamily: 'var(--font-montserrat,sans-serif)',
                          }}>
                            {getInitials(respNome)}
                          </div>
                          <span style={{
                            fontSize: '.6rem', fontWeight: 700, color: respColor,
                            fontFamily: 'var(--font-montserrat,sans-serif)',
                          }}>
                            {primeiroNome}
                          </span>
                        </div>
                      )}

                      {/* Footer: probabilidade + link */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: '.35rem', borderTop: '1px solid #f1f5f9', marginTop: '.1rem', gap: '.4rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                          <div style={{ width: 32, height: 3, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: cor, width: `${n.probabilidade}%`, borderRadius: 2 }} />
                          </div>
                          <span style={{ fontSize: '.58rem', fontWeight: 700, color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                            {n.probabilidade}%
                          </span>
                        </div>
                        <Link
                          href={`/comercial/escolas/${n.escola_id}`}
                          onClick={e => e.stopPropagation()}
                          style={{ fontSize: '.6rem', color: cor, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 700, flexShrink: 0 }}
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        [draggable] { -webkit-user-drag: element; }
        [draggable]:active { cursor: grabbing !important; }
        @media (max-width: 1024px) {
          .pipeline-board { grid-template-columns: repeat(3, minmax(0,1fr)) !important; }
        }
        @media (max-width: 640px) {
          .pipeline-board { grid-template-columns: repeat(2, minmax(0,1fr)) !important; }
        }
      `}</style>
    </div>
  )
}
