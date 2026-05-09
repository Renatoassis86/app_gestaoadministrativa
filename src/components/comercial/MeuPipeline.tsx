'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const STAGES = [
  { id: 'prospeccao',   label: 'Prospecção',     cor: '#6366f1' },
  { id: 'qualificacao', label: 'Qualificação',    cor: '#8b5cf6' },
  { id: 'apresentacao', label: 'Apresentação',    cor: '#d97706' },
  { id: 'proposta',     label: 'Proposta',        cor: '#f59e0b' },
  { id: 'negociacao',   label: 'Em Negociação',   cor: '#0ea5e9' },
  { id: 'fechamento',   label: 'Fechamento',      cor: '#16a34a' },
]

interface EscolaItem {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  total_alunos?: number | null
  classificacao_atual?: string | null
}

interface PipelineItem {
  id: string
  escola_id: string
  stage: string
  tags: string[]
  nota: string | null
  escola: EscolaItem | null
}

interface Props {
  escolas: EscolaItem[]
  userId: string
}

// Cores de classificação
const COR_CLASSIF: Record<string, string> = {
  quente: '#dc2626', morno: '#d97706', frio: '#2563eb',
}

export function MeuPipeline({ escolas, userId }: Props) {
  const [items, setItems]         = useState<PipelineItem[]>([])
  const [loading, setLoading]     = useState(true)
  const [buscaEscola, setBusca]   = useState('')
  const [sugestoes, setSugestoes] = useState<EscolaItem[]>([])
  const [adicionando, setAdicionando] = useState(false)
  const [tagEditId, setTagEditId]     = useState<string | null>(null)
  const [novaTag, setNovaTag]         = useState('')
  const [notaEditId, setNotaEditId]   = useState<string | null>(null)
  const [notaTexto, setNotaTexto]     = useState('')
  const [draggingId, setDraggingId]   = useState<string | null>(null)
  const [overStage, setOverStage]     = useState<string | null>(null)
  const buscaRef = useRef<HTMLInputElement>(null)

  // Carregar pipeline do usuário
  useEffect(() => {
    fetch('/api/pipeline-escola')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Autocomplete de escolas
  useEffect(() => {
    const v = buscaEscola.trim().toLowerCase()
    if (v.length < 2) { setSugestoes([]); return }
    const jaNosPipeline = new Set(items.map(i => i.escola_id))
    setSugestoes(
      escolas.filter(e =>
        !jaNosPipeline.has(e.id) &&
        (e.nome.toLowerCase().includes(v) || (e.cidade ?? '').toLowerCase().includes(v))
      ).slice(0, 6)
    )
  }, [buscaEscola, escolas, items])

  async function adicionarEscola(escola: EscolaItem) {
    setAdicionando(true)
    const res = await fetch('/api/pipeline-escola', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ escola_id: escola.id, stage: 'prospeccao' }),
    })
    const novo = await res.json()
    if (res.ok) setItems(prev => [{ ...novo, escola }, ...prev])
    setBusca(''); setSugestoes([]); setAdicionando(false)
  }

  async function moverStage(itemId: string, novoStage: string) {
    const item = items.find(i => i.id === itemId)
    if (!item || item.stage === novoStage) return
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, stage: novoStage } : i))
    await fetch('/api/pipeline-escola', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, stage: novoStage }),
    })
  }

  async function adicionarTag(itemId: string) {
    const tag = novaTag.trim()
    if (!tag) return
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const novasTags = [...item.tags, tag]
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, tags: novasTags } : i))
    setNovaTag(''); setTagEditId(null)
    await fetch('/api/pipeline-escola', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, tags: novasTags }),
    })
  }

  async function removerTag(itemId: string, tag: string) {
    const item = items.find(i => i.id === itemId)
    if (!item) return
    const novasTags = item.tags.filter(t => t !== tag)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, tags: novasTags } : i))
    await fetch('/api/pipeline-escola', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, tags: novasTags }),
    })
  }

  async function salvarNota(itemId: string) {
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, nota: notaTexto } : i))
    setNotaEditId(null)
    await fetch('/api/pipeline-escola', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: itemId, nota: notaTexto }),
    })
  }

  async function removerDosPipeline(itemId: string) {
    if (!confirm('Remover esta escola do seu pipeline?')) return
    setItems(prev => prev.filter(i => i.id !== itemId))
    await fetch(`/api/pipeline-escola?id=${itemId}`, { method: 'DELETE' })
  }

  // Drag and drop
  function handleDragStart(e: React.DragEvent, itemId: string, fromStage: string) {
    setDraggingId(itemId)
    e.dataTransfer.setData('text/plain', itemId)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => {
      const el = document.getElementById(`pipe-${itemId}`)
      if (el) el.style.opacity = '0.4'
    }, 0)
  }

  function handleDragEnd(e: React.DragEvent, itemId: string) {
    setDraggingId(null); setOverStage(null)
    const el = document.getElementById(`pipe-${itemId}`)
    if (el) el.style.opacity = '1'
  }

  async function handleDrop(e: React.DragEvent, toStage: string) {
    e.preventDefault()
    const itemId = e.dataTransfer.getData('text/plain')
    setOverStage(null); setDraggingId(null)
    if (itemId) await moverStage(itemId, toStage)
  }

  const itemsByStage = (stage: string) => items.filter(i => i.stage === stage)

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
      Carregando seu pipeline...
    </div>
  )

  return (
    <div>
      {/* ── Adicionar escola ao pipeline ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(15,23,42,.04)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
          Adicionar ao meu pipeline:
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <input
            ref={buscaRef}
            value={buscaEscola}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar escola pelo nome..."
            style={{ width: '100%', padding: '.6rem .85rem .6rem 2.1rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.82rem', fontFamily: 'var(--font-inter,sans-serif)', outline: 'none', background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box' as const }}
            onFocus={() => {}}
            onBlur={() => setTimeout(() => setSugestoes([]), 200)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>

          {sugestoes.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', zIndex: 50, overflow: 'hidden' }}>
              {sugestoes.map(e => (
                <div key={e.id} onMouseDown={() => adicionarEscola(e)}
                  style={{ padding: '.6rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '.6rem', borderBottom: '1px solid #f8fafc' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={ev => ev.currentTarget.style.background = '#fff'}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#6366f120', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.nome}</div>
                    {(e.cidade || e.estado) && <div style={{ fontSize: '.65rem', color: '#94a3b8' }}>{e.cidade}{e.estado ? `/${e.estado}` : ''}</div>}
                  </div>
                  <span style={{ fontSize: '.62rem', color: '#6366f1', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>+ Adicionar</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: '.68rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
          {items.length} escola{items.length !== 1 ? 's' : ''} no pipeline
        </div>
      </div>

      {/* ── Kanban com drag-and-drop ── */}
      <div style={{ display: 'flex', gap: '.85rem', overflowX: 'auto', paddingBottom: '1rem', alignItems: 'flex-start' }}>
        {STAGES.map(stage => {
          const cards = itemsByStage(stage.id)
          const isOver = overStage === stage.id
          return (
            <div key={stage.id} style={{ minWidth: 240, width: 240, flexShrink: 0 }}
              onDragOver={e => { e.preventDefault(); setOverStage(stage.id) }}
              onDragLeave={() => setOverStage(null)}
              onDrop={e => handleDrop(e, stage.id)}
            >
              {/* Header coluna */}
              <div style={{ padding: '.65rem .9rem', borderRadius: '10px 10px 0 0', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `2px solid ${stage.cor}` }}>
                <span style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#fff', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{stage.label}</span>
                <span style={{ background: stage.cor, color: '#fff', fontSize: '.6rem', fontWeight: 800, padding: '.1rem .45rem', borderRadius: 99 }}>{cards.length}</span>
              </div>

              {/* Drop zone */}
              <div style={{
                background: isOver ? `${stage.cor}12` : '#f8fafc',
                border: `1px solid ${isOver ? stage.cor : '#e2e8f0'}`,
                borderTop: 'none', borderRadius: '0 0 10px 10px',
                padding: '.65rem', minHeight: 120,
                display: 'flex', flexDirection: 'column', gap: '.5rem',
                boxShadow: isOver ? `inset 0 0 0 2px ${stage.cor}40` : 'none',
                transition: 'all .15s',
              }}>
                {isOver && draggingId && (
                  <div style={{ border: `2px dashed ${stage.cor}`, borderRadius: 8, padding: '.5rem', textAlign: 'center', fontSize: '.68rem', color: stage.cor, fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 700 }}>
                    Soltar aqui
                  </div>
                )}

                {cards.length === 0 && !isOver && (
                  <div style={{ textAlign: 'center', padding: '1.5rem .5rem', fontSize: '.72rem', color: '#cbd5e1', fontFamily: 'var(--font-inter,sans-serif)' }}>Nenhuma escola</div>
                )}

                {cards.map(item => (
                  <div key={item.id} id={`pipe-${item.id}`}
                    draggable
                    onDragStart={e => handleDragStart(e, item.id, item.stage)}
                    onDragEnd={e => handleDragEnd(e, item.id)}
                    style={{ background: '#fff', border: `1px solid #e2e8f0`, borderLeft: `3px solid ${stage.cor}`, borderRadius: 8, padding: '.65rem .75rem', cursor: 'grab', boxShadow: '0 1px 3px rgba(0,0,0,.05)', userSelect: 'none' as const, transition: 'box-shadow .15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.05)'}
                  >
                    {/* Nome + ações */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.4rem', marginBottom: '.35rem' }}>
                      <Link href={`/comercial/escolas/${item.escola_id}`} style={{ fontWeight: 700, fontSize: '.78rem', color: '#0f172a', textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.escola?.nome ?? '—'}
                      </Link>
                      <button onClick={() => removerDosPipeline(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: 0, flexShrink: 0, display: 'flex' }}
                        title="Remover do pipeline">
                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {/* Cidade + classificação */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.5rem' }}>
                      {item.escola?.cidade && (
                        <span style={{ fontSize: '.62rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          {item.escola.cidade}{item.escola.estado ? `/${item.escola.estado}` : ''}
                        </span>
                      )}
                      {item.escola?.classificacao_atual && (
                        <span style={{ fontSize: '.58rem', fontWeight: 700, background: `${COR_CLASSIF[item.escola.classificacao_atual] ?? '#64748b'}18`, color: COR_CLASSIF[item.escola.classificacao_atual] ?? '#64748b', padding: '.1rem .35rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          {item.escola.classificacao_atual}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem', marginBottom: '.4rem' }}>
                      {item.tags.map(tag => (
                        <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '.2rem', fontSize: '.6rem', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '.15rem .4rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          #{tag}
                          <button onClick={() => removerTag(item.id, tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, display: 'flex', lineHeight: 1 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          </button>
                        </span>
                      ))}

                      {/* Adicionar tag */}
                      {tagEditId === item.id ? (
                        <input autoFocus value={novaTag} onChange={e => setNovaTag(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') adicionarTag(item.id); if (e.key === 'Escape') { setTagEditId(null); setNovaTag('') } }}
                          onBlur={() => { if (novaTag) adicionarTag(item.id); else setTagEditId(null) }}
                          placeholder="tag..."
                          style={{ width: 70, fontSize: '.6rem', padding: '.15rem .35rem', border: '1px solid #d97706', borderRadius: 99, outline: 'none', fontFamily: 'var(--font-inter,sans-serif)', color: '#0f172a' }}
                        />
                      ) : (
                        <button onClick={() => { setTagEditId(item.id); setNovaTag('') }}
                          style={{ fontSize: '.6rem', color: '#d97706', background: '#fffbeb', border: '1px dashed #fcd34d', padding: '.15rem .4rem', borderRadius: 99, cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 700 }}>
                          + tag
                        </button>
                      )}
                    </div>

                    {/* Nota */}
                    {notaEditId === item.id ? (
                      <div>
                        <textarea autoFocus value={notaTexto} onChange={e => setNotaTexto(e.target.value)}
                          rows={2} placeholder="Lembrete sobre esta escola..."
                          style={{ width: '100%', fontSize: '.68rem', padding: '.35rem .5rem', border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none', resize: 'none', fontFamily: 'var(--font-inter,sans-serif)', boxSizing: 'border-box' as const, color: '#0f172a' }}
                        />
                        <div style={{ display: 'flex', gap: '.3rem', marginTop: '.3rem' }}>
                          <button onClick={() => salvarNota(item.id)} style={{ flex: 1, background: '#0f172a', color: '#fff', border: 'none', borderRadius: 5, padding: '.25rem', cursor: 'pointer', fontSize: '.62rem', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 700 }}>Salvar</button>
                          <button onClick={() => setNotaEditId(null)} style={{ background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: 5, padding: '.25rem .5rem', cursor: 'pointer', fontSize: '.62rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>✕</button>
                        </div>
                      </div>
                    ) : (
                      <div onClick={() => { setNotaEditId(item.id); setNotaTexto(item.nota ?? '') }}
                        style={{ fontSize: '.65rem', color: item.nota ? '#334155' : '#cbd5e1', fontFamily: 'var(--font-inter,sans-serif)', cursor: 'text', background: item.nota ? '#f8fafc' : 'transparent', borderRadius: 5, padding: item.nota ? '.25rem .4rem' : '0', borderLeft: item.nota ? '2px solid #e2e8f0' : 'none', lineHeight: 1.5 }}>
                        {item.nota ?? '+ lembrete'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <style>{`[draggable]:active{cursor:grabbing!important}`}</style>
    </div>
  )
}
