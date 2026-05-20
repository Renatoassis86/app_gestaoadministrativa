'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { moverAmostra, atualizarLogistica, registrarDevolutiva, excluirAmostra, type AmostraStage } from './amostras-actions'
import { Package, Truck, MapPin, MessageSquare, ExternalLink, X, Trash2, Phone, Mail, AlertTriangle, Plus } from 'lucide-react'

const STAGES: { key: AmostraStage; label: string; color: string }[] = [
  { key: 'solicitada', label: 'Solicitação Recebida', color: '#6366f1' },
  { key: 'separacao',  label: 'Em Separação',         color: '#d97706' },
  { key: 'postada',    label: 'Postada',              color: '#0ea5e9' },
  { key: 'entregue',   label: 'Entregue',             color: '#16a34a' },
  { key: 'devolutiva', label: 'Devolutiva da Escola', color: '#7c3aed' },
]

const CORREIOS_URL = 'https://rastreamento.correios.com.br/app/index.php'

export interface Amostra {
  id: string
  stage: AmostraStage
  prioridade: 'normal' | 'urgente'
  material: string
  quantidade: number
  observacoes_material: string | null
  destinatario_nome: string
  cep: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  uf: string | null
  cpf_cnpj: string | null
  celular: string | null
  telefone: string | null
  email: string | null
  transportadora: string | null
  codigo_rastreio: string | null
  link_rastreio: string | null
  devolutiva: string | null
  devolutiva_data: string | null
  solicitada_em: string
  separada_em: string | null
  postada_em: string | null
  entregue_em: string | null
  devolutiva_em: string | null
  escola_id: string | null
  escola: { id: string; nome: string; cidade: string | null; estado: string | null } | null
  solicitante: { id: string; full_name: string } | null
  assistente: { id: string; full_name: string } | null
}

interface Props { initial: Amostra[] }

export function AmostrasKanban({ initial }: Props) {
  const [items, setItems] = useState<Amostra[]>(initial)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [overStage, setOverStage] = useState<AmostraStage | null>(null)
  const dragStageRef = useRef<AmostraStage | null>(null)
  const [selected, setSelected] = useState<Amostra | null>(null)

  // Refresh otimista — refaz fetch do banco para sincronizar estado
  async function refresh() {
    const supabase = createClient()
    const { data } = await supabase
      .from('solicitacoes_amostras')
      .select(`
        *,
        escola:escolas(id, nome, cidade, estado),
        solicitante:profiles!solicitante_id(id, full_name),
        assistente:profiles!assistente_id(id, full_name)
      `)
      .order('solicitada_em', { ascending: false })
    if (data) setItems(data as any)
  }

  function byStage(stage: AmostraStage) { return items.filter(a => a.stage === stage) }

  function handleDragStart(e: React.DragEvent, id: string, from: AmostraStage) {
    setDraggingId(id)
    dragStageRef.current = from
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }
  function handleDragEnd() {
    setDraggingId(null); setOverStage(null); dragStageRef.current = null
  }
  function handleDragOver(e: React.DragEvent, to: AmostraStage) {
    e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOverStage(to)
  }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage(null)
  }
  async function handleDrop(e: React.DragEvent, to: AmostraStage) {
    e.preventDefault(); setOverStage(null)
    const id = e.dataTransfer.getData('text/plain')
    const from = dragStageRef.current
    if (!id || !from || from === to) return
    // Optimistic
    setItems(prev => prev.map(a => a.id === id ? { ...a, stage: to } : a))
    const r = await moverAmostra(id, to)
    if (!r.success) {
      setItems(prev => prev.map(a => a.id === id ? { ...a, stage: from } : a))
      alert(r.error ?? 'Falha ao mover')
    } else {
      refresh()
    }
    setDraggingId(null)
  }

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STAGES.length}, minmax(0, 1fr))`,
        gap: '.75rem', alignItems: 'flex-start',
      }}>
        {STAGES.map(stage => {
          const cards = byStage(stage.key)
          const isOver = overStage === stage.key
          return (
            <div key={stage.key}
              onDragOver={e => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, stage.key)}
              style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}
            >
              {/* Header da coluna */}
              <div style={{
                padding: '.6rem .9rem', borderRadius: '10px 10px 0 0',
                background: '#0f172a',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: `3px solid ${stage.color}`, gap: '.5rem',
              }}>
                <div style={{ fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', fontFamily: 'var(--font-montserrat,sans-serif)', color: stage.color, lineHeight: 1.2 }}>
                  {stage.label}
                </div>
                <span style={{ background: stage.color, color: '#fff', fontSize: '.6rem', fontWeight: 800, padding: '.15rem .45rem', borderRadius: 99, flexShrink: 0, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  {cards.length}
                </span>
              </div>

              {/* Drop area */}
              <div style={{
                background: isOver ? `${stage.color}10` : '#f8fafc',
                border: `1.5px solid ${isOver ? stage.color : '#e2e8f0'}`,
                borderTop: 'none', borderRadius: '0 0 10px 10px',
                padding: '.6rem', minHeight: 140,
                display: 'flex', flexDirection: 'column', gap: '.5rem',
                transition: 'all .15s',
                boxShadow: isOver ? `inset 0 0 0 2px ${stage.color}30` : 'none',
              }}>
                {isOver && draggingId && (
                  <div style={{ border: `2px dashed ${stage.color}`, borderRadius: 8, padding: '.6rem', textAlign: 'center', fontSize: '.68rem', color: stage.color, fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', background: `${stage.color}08` }}>
                    Soltar aqui
                  </div>
                )}
                {cards.length === 0 && !isOver && (
                  <div style={{ textAlign: 'center', padding: '1.25rem .5rem', fontSize: '.7rem', color: '#cbd5e1', fontFamily: 'var(--font-inter,sans-serif)' }}>
                    Vazio
                  </div>
                )}

                {cards.map(a => (
                  <AmostraCard key={a.id} amostra={a} color={stage.color}
                    onDragStart={e => handleDragStart(e, a.id, stage.key)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSelected(a)}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <AmostraDetailModal
          amostra={selected}
          onClose={() => setSelected(null)}
          onChange={refresh}
        />
      )}

      <style>{`
        [draggable] { -webkit-user-drag: element; }
        [draggable]:active { cursor: grabbing !important; }
      `}</style>
    </>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function AmostraCard({
  amostra: a, color, onClick, onDragStart, onDragEnd,
}: {
  amostra: Amostra; color: string; onClick: () => void
  onDragStart: (e: React.DragEvent) => void; onDragEnd: (e: React.DragEvent) => void
}) {
  const urgente = a.prioridade === 'urgente'
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      style={{
        background: '#fff',
        border: `1px solid ${urgente ? '#fca5a5' : '#e8edf3'}`,
        borderLeft: `3px solid ${color}`,
        borderRadius: 9, padding: '.65rem .75rem',
        boxShadow: '0 1px 4px rgba(15,23,42,.07)',
        cursor: 'grab', userSelect: 'none',
        transition: 'box-shadow .15s, transform .1s', position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(15,23,42,.13)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,.07)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {urgente && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          display: 'inline-flex', alignItems: 'center', gap: 3,
          background: '#fee2e2', border: '1px solid #fca5a5',
          color: '#dc2626', fontSize: '.55rem', fontWeight: 800,
          padding: '.1rem .35rem', borderRadius: 99,
          textTransform: 'uppercase', letterSpacing: '.05em',
          fontFamily: 'var(--font-montserrat,sans-serif)',
        }}>
          <AlertTriangle size={9} /> Urgente
        </div>
      )}

      {/* Destinatário/Escola */}
      <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 800, fontSize: '.8rem', color: '#0f172a', lineHeight: 1.3, marginBottom: '.25rem', wordBreak: 'break-word', paddingRight: urgente ? '4rem' : 0 }}>
        {a.escola?.nome ?? a.destinatario_nome}
      </div>

      {/* Material + qty */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.7rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)', marginBottom: '.3rem' }}>
        <Package size={11} color="#94a3b8" />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {a.material} <strong>×{a.quantidade}</strong>
        </span>
      </div>

      {/* Cidade/UF */}
      {(a.cidade || a.uf) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem', fontSize: '.62rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)', marginBottom: '.3rem' }}>
          <MapPin size={9} />
          {[a.cidade, a.uf].filter(Boolean).join(' / ')}
        </div>
      )}

      {/* Código de rastreio */}
      {a.codigo_rastreio && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.3rem',
          background: '#eff6ff', border: '1px solid #bfdbfe',
          padding: '.25rem .5rem', borderRadius: 6, marginTop: '.3rem',
        }}>
          <Truck size={11} color="#2563eb" />
          <span style={{ fontSize: '.62rem', fontWeight: 700, color: '#1d4ed8', fontFamily: 'var(--font-montserrat,sans-serif)', letterSpacing: '.02em' }}>
            {a.codigo_rastreio}
          </span>
        </div>
      )}

      {/* Devolutiva preview */}
      {a.stage === 'devolutiva' && a.devolutiva && (
        <div style={{
          marginTop: '.35rem', display: 'flex', alignItems: 'flex-start', gap: '.3rem',
          background: '#faf5ff', border: '1px solid #e9d5ff',
          padding: '.3rem .5rem', borderRadius: 6,
        }}>
          <MessageSquare size={10} color="#7c3aed" style={{ marginTop: 2 }} />
          <span style={{ fontSize: '.6rem', color: '#6d28d9', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {a.devolutiva}
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '.35rem', marginTop: '.35rem',
        borderTop: '1px solid #f1f5f9',
        fontSize: '.58rem', color: '#94a3b8',
        fontFamily: 'var(--font-montserrat,sans-serif)',
      }}>
        <span>{a.solicitante?.full_name?.split(' ')[0] ?? '—'}</span>
        <span>{new Date(a.solicitada_em).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  )
}

// ─── Modal de Detalhes ────────────────────────────────────────────────────────

function AmostraDetailModal({
  amostra, onClose, onChange,
}: {
  amostra: Amostra; onClose: () => void; onChange: () => void
}) {
  const [transp, setTransp]   = useState(amostra.transportadora ?? '')
  const [codigo, setCodigo]   = useState(amostra.codigo_rastreio ?? '')
  const [link, setLink]       = useState(amostra.link_rastreio ?? '')
  const [devolutiva, setDev]  = useState(amostra.devolutiva ?? '')
  const [devDate, setDevDate] = useState(amostra.devolutiva_data ?? new Date().toISOString().slice(0, 10))
  const [saving, setSaving]   = useState<string | null>(null)
  const [err, setErr]         = useState<string | null>(null)

  async function salvarLogistica() {
    setSaving('logistica'); setErr(null)
    const r = await atualizarLogistica(amostra.id, {
      transportadora: transp || null, codigo_rastreio: codigo || null, link_rastreio: link || null,
    })
    setSaving(null)
    if (!r.success) { setErr(r.error ?? 'Erro'); return }
    onChange()
  }

  async function salvarDevolutiva() {
    if (!devolutiva.trim()) { setErr('Escreva a devolutiva antes de salvar'); return }
    setSaving('devolutiva'); setErr(null)
    const r = await registrarDevolutiva(amostra.id, { devolutiva, devolutiva_data: devDate })
    setSaving(null)
    if (!r.success) { setErr(r.error ?? 'Erro'); return }
    onChange(); onClose()
  }

  async function excluir() {
    if (!confirm('Excluir permanentemente esta solicitação de amostra?')) return
    setSaving('delete')
    const r = await excluirAmostra(amostra.id)
    setSaving(null)
    if (!r.success) { setErr(r.error ?? 'Erro'); return }
    onChange(); onClose()
  }

  const correiosLink = codigo
    ? `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(codigo)}`
    : CORREIOS_URL

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)',
      backdropFilter: 'blur(3px)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, maxWidth: 720, width: '100%',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          background: '#0f172a', color: '#fff', borderRadius: '14px 14px 0 0',
        }}>
          <div>
            <div style={{ fontSize: '.62rem', color: '#d97706', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              Solicitação de Amostra
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.2 }}>
              {amostra.escola?.nome ?? amostra.destinatario_nome}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {err && (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '.6rem 1rem', borderRadius: 8, marginBottom: '1rem', fontSize: '.78rem' }}>
              ⚠ {err}
            </div>
          )}

          {/* Seção: Material */}
          <Section label="📦 Material">
            <ReadGrid items={[
              ['Material', amostra.material],
              ['Quantidade', String(amostra.quantidade)],
              ['Prioridade', amostra.prioridade === 'urgente' ? '🔴 Urgente' : 'Normal'],
              ['Solicitante', amostra.solicitante?.full_name ?? '—'],
            ]} />
            {amostra.observacoes_material && (
              <div style={{ marginTop: '.5rem', padding: '.5rem .75rem', background: '#f8fafc', borderRadius: 6, fontSize: '.78rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                {amostra.observacoes_material}
              </div>
            )}
          </Section>

          {/* Seção: Endereço */}
          <Section label="📍 Endereço de Envio">
            <ReadGrid items={[
              ['Destinatário', amostra.destinatario_nome],
              ['CPF/CNPJ',    amostra.cpf_cnpj ?? '—'],
              ['CEP',         amostra.cep ?? '—'],
              ['Logradouro',  [amostra.logradouro, amostra.numero, amostra.complemento].filter(Boolean).join(', ') || '—'],
              ['Bairro',      amostra.bairro ?? '—'],
              ['Cidade/UF',   [amostra.cidade, amostra.uf].filter(Boolean).join(' / ') || '—'],
              ['Celular',     amostra.celular ?? '—'],
              ['Telefone',    amostra.telefone ?? '—'],
              ['E-mail',      amostra.email ?? '—'],
            ]} />
          </Section>

          {/* Seção: Logística */}
          <Section label="🚚 Acompanhamento Logístico">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '.75rem' }}>
              <Input label="Transportadora" value={transp} onChange={setTransp} placeholder="Ex.: Correios PAC" />
              <Input label="Código de Rastreio" value={codigo} onChange={setCodigo} placeholder="Ex.: BR123456789BR" mono />
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Link de Rastreio (opcional, sobrescreve o link padrão dos Correios)" value={link} onChange={setLink} placeholder="https://..." />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem', flexWrap: 'wrap' }}>
              <button onClick={salvarLogistica} disabled={saving === 'logistica'}
                style={{ padding: '.55rem 1.1rem', borderRadius: 8, background: '#0f172a', color: '#fff', border: 'none', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                {saving === 'logistica' ? 'Salvando...' : 'Salvar Logística'}
              </button>
              <a href={link || correiosLink} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.55rem 1.1rem', borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 700, fontSize: '.78rem', textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                <ExternalLink size={13} /> Abrir Rastreio Correios
              </a>
            </div>
          </Section>

          {/* Seção: Devolutiva */}
          <Section label="💬 Devolutiva da Escola">
            <textarea value={devolutiva} onChange={e => setDev(e.target.value)} rows={4}
              placeholder="Retorno da escola sobre o material recebido (avaliação pedagógica, intenção de adoção, próximos passos)..."
              style={{ width: '100%', padding: '.65rem .85rem', fontSize: '.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, resize: 'vertical', fontFamily: 'var(--font-inter,sans-serif)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginTop: '.5rem' }}>
              <label style={{ fontSize: '.72rem', fontWeight: 600, color: '#475569', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Data do retorno:</label>
              <input type="date" value={devDate} onChange={e => setDevDate(e.target.value)}
                style={{ padding: '.4rem .6rem', fontSize: '.8rem', border: '1.5px solid #e2e8f0', borderRadius: 6 }}
              />
            </div>
            <button onClick={salvarDevolutiva} disabled={saving === 'devolutiva'}
              style={{ marginTop: '.75rem', padding: '.55rem 1.1rem', borderRadius: 8, background: '#7c3aed', color: '#fff', border: 'none', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              {saving === 'devolutiva' ? 'Salvando...' : 'Registrar Devolutiva e Finalizar'}
            </button>
          </Section>

          {/* Footer ações */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', gap: '.5rem' }}>
            <button onClick={excluir} disabled={saving === 'delete'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.45rem .9rem', borderRadius: 8, background: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5', fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              <Trash2 size={12} /> Excluir solicitação
            </button>

            <div style={{ display: 'flex', gap: '.4rem' }}>
              {amostra.celular && (
                <a href={`https://wa.me/55${amostra.celular.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.45rem .9rem', borderRadius: 8, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: '.72rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  <Phone size={12} /> WhatsApp
                </a>
              )}
              {amostra.email && (
                <a href={`mailto:${amostra.email}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.45rem .9rem', borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '.72rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  <Mail size={12} /> E-mail
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponents do modal ───────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#0f172a', borderBottom: '2px solid #d97706', paddingBottom: '.35rem', marginBottom: '.75rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ReadGrid({ items }: { items: [string, string][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '.6rem .9rem' }}>
      {items.map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#94a3b8', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{k}</div>
          <div style={{ fontSize: '.82rem', color: '#0f172a', fontFamily: 'var(--font-inter,sans-serif)' }}>{v}</div>
        </div>
      ))}
    </div>
  )
}

function Input({ label, value, onChange, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          width: '100%', padding: '.55rem .85rem', fontSize: '.85rem',
          border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none',
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'var(--font-inter,sans-serif)',
          letterSpacing: mono ? '.03em' : 'normal',
        }}
      />
    </div>
  )
}
