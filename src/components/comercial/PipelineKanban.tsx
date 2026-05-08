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
  proposta:     'Proposta Enviada',
  negociacao:   'Em Negociação',
  fechamento:   'Fechamento',
}

interface Neg {
  id: string
  stage: string
  escola_id: string
  valor_estimado: number | null
  probabilidade: number
  responsavel_id: string | null
  escola: { id: string; nome: string; estado: string | null } | null
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

// Gera cor determinística por nome
function nameColor(name: string) {
  const colors = ['#6366f1','#8b5cf6','#d97706','#0ea5e9','#16a34a','#dc2626','#0f172a','#db2777']
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
    // Efeito visual no elemento arrastado
    setTimeout(() => {
      const el = document.getElementById(`neg-${negId}`)
      if (el) el.style.opacity = '0.4'
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

  function handleDragLeave() {
    setOverStage(null)
  }

  async function handleDrop(e: React.DragEvent, toStage: string) {
    e.preventDefault()
    setOverStage(null)
    const negId = e.dataTransfer.getData('text/plain')
    const fromStage = dragStageRef.current
    if (!negId || !fromStage || fromStage === toStage) return

    setMoving(negId)
    // Optimistic update
    setNegs(prev => prev.map(n => n.id === negId ? { ...n, stage: toStage } : n))

    try {
      const result = await moverNegociacao(negId, toStage)
      if (!result.success) {
        // Rollback
        setNegs(prev => prev.map(n => n.id === negId ? { ...n, stage: fromStage! } : n))
      }
    } catch {
      setNegs(prev => prev.map(n => n.id === negId ? { ...n, stage: fromStage! } : n))
    }
    setMoving(null)
    setDraggingId(null)
  }

  return (
    <div style={{ display: 'flex', gap: '.85rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
      {stages.map(stage => {
        const cards  = byStage(stage)
        const cor    = STAGE_COLORS[stage] ?? '#64748b'
        const isOver = overStage === stage
        const label  = STAGE_LABELS[stage] ?? stage

        return (
          <div key={stage}
            style={{ minWidth: 230, width: 230, flexShrink: 0, display: 'flex', flexDirection: 'column' }}
            onDragOver={e => handleDragOver(e, stage)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, stage)}
          >
            {/* Header da coluna */}
            <div style={{
              padding: '.65rem .9rem',
              borderRadius: '10px 10px 0 0',
              background: '#0f172a',
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderBottom: `2px solid ${cor}`,
            }}>
              <span style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                {label}
              </span>
              <span style={{ background: cor, color: '#fff', fontSize: '.6rem', fontWeight: 800, padding: '.1rem .45rem', borderRadius: 99 }}>
                {cards.length}
              </span>
            </div>

            {/* Drop zone */}
            <div style={{
              background: isOver ? `${cor}12` : '#f8fafc',
              border: `1px solid ${isOver ? cor : '#e2e8f0'}`,
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              padding: '.65rem',
              minHeight: 140,
              display: 'flex',
              flexDirection: 'column',
              gap: '.45rem',
              transition: 'background .15s, border-color .15s',
              boxShadow: isOver ? `inset 0 0 0 2px ${cor}40` : 'none',
            }}>
              {/* Indicador de drop */}
              {isOver && draggingId && (
                <div style={{
                  border: `2px dashed ${cor}`,
                  borderRadius: 8,
                  padding: '.65rem',
                  textAlign: 'center',
                  fontSize: '.7rem',
                  color: cor,
                  fontWeight: 700,
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                  background: `${cor}08`,
                  marginBottom: '.25rem',
                }}>
                  Soltar aqui →
                </div>
              )}

              {cards.length === 0 && !isOver ? (
                <div style={{ textAlign: 'center', padding: '1.5rem .5rem', fontSize: '.72rem', color: '#cbd5e1', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  Nenhuma negociação
                </div>
              ) : cards.map(n => {
                const respNome  = n.responsavel?.full_name ?? ''
                const respColor = respNome ? nameColor(respNome) : '#94a3b8'
                const isMoving  = moving === n.id

                return (
                  <div
                    key={n.id}
                    id={`neg-${n.id}`}
                    draggable
                    onDragStart={e => handleDragStart(e, n.id, stage)}
                    onDragEnd={e => handleDragEnd(e, n.id)}
                    style={{
                      background: isMoving ? '#f8fafc' : '#fff',
                      border: `1px solid ${isMoving ? cor : '#e2e8f0'}`,
                      borderLeft: `3px solid ${cor}`,
                      borderRadius: 8,
                      padding: '.7rem .8rem',
                      boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                      cursor: 'grab',
                      userSelect: 'none',
                      transition: 'box-shadow .15s, transform .15s',
                      opacity: isMoving ? 0.6 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!draggingId) {
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.12)'
                        e.currentTarget.style.transform = 'translateY(-1px)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Nome da escola */}
                    <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.3rem' }}>
                      {n.escola?.nome?.substring(0, 26) ?? '—'}
                    </div>

                    {/* Valor estimado */}
                    {n.valor_estimado != null && n.valor_estimado > 0 && (
                      <div style={{ fontWeight: 800, color: '#d97706', fontSize: '.85rem', fontFamily: 'var(--font-cormorant,serif)', marginBottom: '.3rem', lineHeight: 1 }}>
                        {fmtCurrency(n.valor_estimado)}
                      </div>
                    )}

                    {/* Footer: responsável + probabilidade */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.4rem', marginTop: '.35rem' }}>
                      {/* Tag do responsável */}
                      {respNome ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', minWidth: 0 }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                            background: respColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontSize: '.5rem', fontWeight: 800,
                            fontFamily: 'var(--font-montserrat,sans-serif)',
                          }}>
                            {getInitials(respNome)}
                          </div>
                          <span style={{
                            fontSize: '.6rem', fontWeight: 700, color: respColor,
                            fontFamily: 'var(--font-montserrat,sans-serif)',
                            background: `${respColor}15`,
                            padding: '.1rem .4rem', borderRadius: 99,
                            border: `1px solid ${respColor}30`,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            maxWidth: 100,
                          }}>
                            {respNome.split(' ')[0]}
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '.6rem', color: '#cbd5e1', fontFamily: 'var(--font-inter,sans-serif)' }}>Sem responsável</span>
                      )}

                      {/* Probabilidade */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', flexShrink: 0 }}>
                        <div style={{ width: 28, height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: cor, width: `${n.probabilidade}%`, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: '.6rem', fontWeight: 700, color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          {n.probabilidade}%
                        </span>
                      </div>
                    </div>

                    {/* Link para ficha — clique normal */}
                    <Link
                      href={`/comercial/escolas/${n.escola_id}`}
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'block', marginTop: '.45rem', fontSize: '.62rem', color: '#94a3b8', textDecoration: 'none', fontFamily: 'var(--font-inter,sans-serif)', paddingTop: '.35rem', borderTop: '1px solid #f1f5f9' }}
                    >
                      Ver ficha →
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      <style>{`
        [draggable] { -webkit-user-drag: element; }
        [draggable]:active { cursor: grabbing !important; }
      `}</style>
    </div>
  )
}
