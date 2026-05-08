'use client'

import { useState, useCallback } from 'react'

interface Lead {
  id: string
  fonte: string
  nome: string | null
  email: string | null
  tel_celular: string | null
  cidade: string | null
  uf: string | null
  tipo_inscricao: string | null
  cargo: string | null
  escola_nome: string | null
  escola_cnpj: string | null
  lote: string | null
  data_inscricao: string | null
  dados_extras: Record<string, any> | null
}

interface Props {
  leads: Lead[]
  total: number
  pagina: number
  totalPaginas: number
  q: string
  fonte: string
  tipo: string
  uf: string
}

// ── Helpers ──────────────────────────────────────────────────
const FONTE_COR: Record<string, { label: string; cor: string; bg: string; border: string }> = {
  ciecc_2025: { label: '1º CIECC 2025', cor: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  ciecc_2026: { label: '2º CIECC 2026', cor: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  crm:        { label: 'CRM Education', cor: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  oikos:      { label: 'Oikos Live',    cor: '#0d9488', bg: '#f0fdfa', border: '#99f6e4' },
  outro:      { label: 'Outro',         cor: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
}

const TIPO_DECISOR = (t: string | null) => {
  if (!t) return false
  const v = t.toLowerCase()
  return v.includes('gestor') || v.includes('diretor') || v.includes('mantenedor') || v.includes('coordenador')
}

const TIPO_COR = (t: string | null) => {
  if (!t) return '#64748b'
  const v = t.toLowerCase()
  if (v.includes('gestor'))      return '#7c3aed'
  if (v.includes('diretor'))     return '#2563eb'
  if (v.includes('mantenedor'))  return '#d97706'
  if (v.includes('coordenador')) return '#0d9488'
  return '#64748b'
}

// ── Modal de edição ───────────────────────────────────────────
function ModalEditar({ lead, onClose, onSaved }: { lead: Lead; onClose: () => void; onSaved: (lead: Lead) => void }) {
  const [form, setForm] = useState({ ...lead })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const set = (k: keyof Lead, v: string) => setForm(prev => ({ ...prev, [k]: v || null }))

  async function handleSave() {
    setSaving(true); setErro('')
    const { id, dados_extras, fonte, ...updates } = form
    const res = await fetch('/api/leads-universal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    })
    const data = await res.json()
    if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setSaving(false); return }
    onSaved(form)
    onClose()
  }

  const lbl: React.CSSProperties = { display: 'block', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }
  const inp: React.CSSProperties = { width: '100%', padding: '.6rem .85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: '.82rem', fontFamily: 'var(--font-inter,sans-serif)', outline: 'none', background: '#f8fafc', color: '#0f172a', boxSizing: 'border-box' as const }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.18)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '1.1rem 1.5rem', borderRadius: '18px 18px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '.58rem', fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#d97706', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.2rem' }}>Editar Lead</div>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{lead.nome ?? 'Sem nome'}</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.08)', color: '#fff', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lbl}>Nome completo</label>
              <input value={form.nome ?? ''} onChange={e => set('nome', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>E-mail</label>
              <input type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Telefone / WhatsApp</label>
              <input value={form.tel_celular ?? ''} onChange={e => set('tel_celular', e.target.value)} style={inp} placeholder="DDD + número" />
            </div>
            <div>
              <label style={lbl}>Tipo / Cargo</label>
              <input value={form.tipo_inscricao ?? ''} onChange={e => set('tipo_inscricao', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Escola / Instituição</label>
              <input value={form.escola_nome ?? ''} onChange={e => set('escola_nome', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>Cidade</label>
              <input value={form.cidade ?? ''} onChange={e => set('cidade', e.target.value)} style={inp} />
            </div>
            <div>
              <label style={lbl}>UF</label>
              <input value={form.uf ?? ''} onChange={e => set('uf', e.target.value)} maxLength={2} style={inp} placeholder="Ex: SP" />
            </div>
          </div>

          {erro && <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '.6rem .9rem', fontSize: '.78rem', color: '#dc2626', fontFamily: 'var(--font-inter,sans-serif)' }}>{erro}</div>}

          <div style={{ display: 'flex', gap: '.75rem', paddingTop: '.25rem' }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '.7rem', borderRadius: 9999, border: 'none', background: saving ? '#e2e8f0' : 'linear-gradient(135deg, #d97706, #b45309)', color: saving ? '#94a3b8' : '#fff', fontWeight: 700, fontSize: '.875rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: saving ? 'none' : '0 4px 14px rgba(217,119,6,.35)' }}>
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
            <button onClick={onClose} style={{ padding: '.7rem 1.5rem', borderRadius: 9999, border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export function LeadsTable({ leads: initialLeads, total, pagina, totalPaginas, q, fonte, tipo, uf }: Props) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [editando, setEditando] = useState<Lead | null>(null)
  const [deletando, setDeletando] = useState<string | null>(null)

  const fonteInfo = (f: string) => FONTE_COR[f] ?? FONTE_COR.outro

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir o lead "${nome}"? Esta ação não pode ser desfeita.`)) return
    setDeletando(id)
    const res = await fetch(`/api/leads-universal?id=${id}`, { method: 'DELETE' })
    if (res.ok) setLeads(prev => prev.filter(l => l.id !== id))
    setDeletando(null)
  }

  function buildUrl(params: Record<string, string>) {
    const p = new URLSearchParams({ q, fonte, tipo, uf, pagina: String(pagina), ...params })
    return `/leads-banco?${p.toString()}`
  }

  const fmtTel = (t: string | null) => t ? t.replace(/\D/g, '') : ''

  return (
    <div>
      {/* ── Tabela ──────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
        {/* Header da tabela */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['#', 'Nome', 'Tipo / Cargo', 'Escola', 'Contato', 'Cidade/UF', 'Fonte', 'Ações'].map((col, i) => (
                  <th key={col} style={{
                    padding: '.65rem .9rem', textAlign: i === 0 ? 'center' : 'left',
                    fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '.07em', color: 'rgba(255,255,255,.6)',
                    whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)',
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)', fontSize: '.875rem' }}>
                    Nenhum lead encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : leads.map((lead, idx) => {
                const fi   = fonteInfo(lead.fonte)
                const tc   = TIPO_COR(lead.tipo_inscricao)
                const isD  = TIPO_DECISOR(lead.tipo_inscricao)
                const tel  = fmtTel(lead.tel_celular)
                const isDel = deletando === lead.id

                return (
                  <tr key={lead.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#fff' : '#fafafa', opacity: isDel ? 0.4 : 1, transition: 'opacity .2s' }}>

                    {/* Nº */}
                    <td style={{ padding: '.7rem .9rem', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '.65rem', fontWeight: 700, color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {(pagina - 1) * 50 + idx + 1}
                      </div>
                    </td>

                    {/* Nome */}
                    <td style={{ padding: '.7rem .9rem', verticalAlign: 'middle', maxWidth: 180 }}>
                      <div style={{ fontWeight: 700, fontSize: '.82rem', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {lead.nome ?? <span style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 400 }}>Sem nome</span>}
                      </div>
                    </td>

                    {/* Tipo */}
                    <td style={{ padding: '.7rem .9rem', verticalAlign: 'middle', maxWidth: 160 }}>
                      {lead.tipo_inscricao ? (
                        <span style={{ fontSize: '.62rem', fontWeight: isD ? 700 : 500, background: isD ? tc + '12' : '#f8fafc', color: tc, border: `1px solid ${tc}30`, padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isD && <span style={{ marginRight: '.2rem' }}>★</span>}
                          {lead.tipo_inscricao.length > 28 ? lead.tipo_inscricao.slice(0, 28) + '…' : lead.tipo_inscricao}
                        </span>
                      ) : <span style={{ color: '#cbd5e1', fontSize: '.72rem' }}>—</span>}
                    </td>

                    {/* Escola */}
                    <td style={{ padding: '.7rem .9rem', verticalAlign: 'middle', maxWidth: 160 }}>
                      <div style={{ fontSize: '.75rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        {lead.escola_nome ?? <span style={{ color: '#cbd5e1' }}>—</span>}
                      </div>
                    </td>

                    {/* Contato */}
                    <td style={{ padding: '.7rem .9rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} style={{ fontSize: '.68rem', color: '#2563eb', textDecoration: 'none', fontFamily: 'var(--font-inter,sans-serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160, display: 'block' }}>
                            {lead.email}
                          </a>
                        )}
                        {lead.tel_celular && (
                          <span style={{ fontSize: '.68rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                            {lead.tel_celular}
                          </span>
                        )}
                        {!lead.email && !lead.tel_celular && <span style={{ color: '#cbd5e1', fontSize: '.72rem' }}>—</span>}
                      </div>
                    </td>

                    {/* Cidade/UF */}
                    <td style={{ padding: '.7rem .9rem', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '.75rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        {lead.cidade ?? ''}{lead.cidade && lead.uf ? '/' : ''}{lead.uf ?? ''}
                        {!lead.cidade && !lead.uf && <span style={{ color: '#cbd5e1' }}>—</span>}
                      </span>
                    </td>

                    {/* Fonte */}
                    <td style={{ padding: '.7rem .9rem', verticalAlign: 'middle' }}>
                      <span style={{ fontSize: '.6rem', fontWeight: 700, background: fi.bg, color: fi.cor, border: `1px solid ${fi.border}`, padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap' }}>
                        {fi.label}
                      </span>
                    </td>

                    {/* Ações */}
                    <td style={{ padding: '.7rem .9rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center' }}>

                        {/* Editar */}
                        <button onClick={() => setEditando(lead)} title="Editar lead" style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>

                        {/* Email */}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} title={`Enviar e-mail para ${lead.email}`} style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #bfdbfe', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          </a>
                        )}

                        {/* WhatsApp */}
                        {tel.length >= 10 && (
                          <a href={`https://wa.me/55${tel}`} target="_blank" rel="noopener noreferrer" title={`WhatsApp: ${lead.tel_celular}`} style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #86efac', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0 }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          </a>
                        )}

                        {/* Excluir */}
                        <button onClick={() => handleDelete(lead.id, lead.nome ?? 'este lead')} disabled={isDel} title="Excluir lead" style={{ width: 28, height: 28, borderRadius: 7, border: '1.5px solid #fca5a5', background: '#fef2f2', color: '#dc2626', cursor: isDel ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: isDel ? 0.5 : 1 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>

                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer com paginação, total e exportação */}
        <div style={{ padding: '.85rem 1.25rem', background: '#fafafa', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '.72rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
              Mostrando <strong style={{ color: '#0f172a' }}>{leads.length}</strong> de <strong style={{ color: '#0f172a' }}>{total.toLocaleString('pt-BR')}</strong> leads
              {pagina > 1 && <> · Página {pagina} de {totalPaginas}</>}
            </div>
            {/* Botão download inline */}
            <a
              href={`/api/leads-export?q=${encodeURIComponent(q)}&fonte=${fonte}&tipo=${tipo}&uf=${uf}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                padding: '.3rem .75rem', borderRadius: 7,
                border: '1.5px solid #86efac', background: '#f0fdf4',
                color: '#16a34a', textDecoration: 'none',
                fontSize: '.68rem', fontWeight: 700,
                fontFamily: 'var(--font-montserrat,sans-serif)', whiteSpace: 'nowrap',
              }}
              title={`Exportar ${total.toLocaleString('pt-BR')} registros para Excel`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Baixar {total.toLocaleString('pt-BR')} registros (.xlsx)
            </a>
          </div>
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
              {pagina > 1 && (
                <a href={buildUrl({ pagina: String(pagina - 1) })} style={{ padding: '.35rem .75rem', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '.72rem', color: '#475569', textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                  ← Anterior
                </a>
              )}
              {/* Números de páginas */}
              {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                const p = Math.max(1, Math.min(pagina - 2, totalPaginas - 4)) + i
                if (p < 1 || p > totalPaginas) return null
                return (
                  <a key={p} href={buildUrl({ pagina: String(p) })} style={{ width: 30, height: 30, borderRadius: 7, border: `1.5px solid ${pagina === p ? '#d97706' : '#e2e8f0'}`, background: pagina === p ? '#d97706' : '#fff', color: pagina === p ? '#fff' : '#475569', fontSize: '.72rem', fontWeight: pagina === p ? 700 : 400, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p}
                  </a>
                )
              })}
              {pagina < totalPaginas && (
                <a href={buildUrl({ pagina: String(pagina + 1) })} style={{ padding: '.35rem .75rem', borderRadius: 7, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: '.72rem', color: '#475569', textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                  Próxima →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de edição */}
      {editando && (
        <ModalEditar
          lead={editando}
          onClose={() => setEditando(null)}
          onSaved={updated => setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
