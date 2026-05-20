'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, X, Package } from 'lucide-react'
import { criarSolicitacaoAmostra } from './amostras-actions'

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

interface Escola {
  id: string
  nome: string
  cidade: string | null
  estado: string | null
  cep?: string | null
  rua?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  cnpj?: string | null
  contato_nome?: string | null
  telefone?: string | null
  email?: string | null
}

export function SolicitarAmostraBtn({ escolas }: { escolas: Escola[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [selectedEscola, setSelectedEscola] = useState<Escola | null>(null)

  function handleEscolaSelect(escolaId: string) {
    const e = escolas.find(x => x.id === escolaId) ?? null
    setSelectedEscola(e)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null); setSaving(true)
    const fd = new FormData(e.currentTarget)
    const r = await criarSolicitacaoAmostra(fd)
    setSaving(false)
    if (!r.success) { setErr(r.error ?? 'Erro ao criar'); return }
    setOpen(false); setSelectedEscola(null); router.refresh()
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', padding: '.45rem 1rem', borderRadius: 9999, background: '#d97706', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '.78rem', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: '0 4px 12px rgba(217,119,6,.3)' }}>
        <Plus size={13} /> Nova Solicitação
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(3px)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto',
        }}>
          <form onClick={e => e.stopPropagation()} onSubmit={handleSubmit}
            style={{ background: '#fff', borderRadius: 14, maxWidth: 760, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.4)' }}>

            {/* Header */}
            <div style={{
              padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#0f172a', color: '#fff', borderRadius: '14px 14px 0 0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <Package size={20} color="#d97706" />
                <div>
                  <div style={{ fontSize: '.62rem', color: '#d97706', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                    Nova Solicitação
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.2 }}>
                    Envio de Amostra / Material
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} style={{
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

              <Section label="📚 Material">
                <Grid cols={3}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <Input name="material" label="Livro / Material" required />
                  </div>
                  <Input name="quantidade" label="Quantidade" type="number" defaultValue="1" min="1" required />
                </Grid>
                <Input name="observacoes_material" label="Observações sobre o material (opcional)" />
              </Section>

              <Section label="🏫 Escola do CRM (opcional — auto-preenche endereço)">
                <Select name="escola_id" label="Selecione uma escola cadastrada" onChange={handleEscolaSelect}>
                  <option value="">— Avulso (não vincular) —</option>
                  {escolas.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.nome} {e.cidade ? ` · ${e.cidade}/${e.estado ?? ''}` : ''}
                    </option>
                  ))}
                </Select>
              </Section>

              <Section label="📍 Dados de Envio">
                <Input name="destinatario_nome" label="Nome do Destinatário" required defaultValue={selectedEscola?.contato_nome ?? ''} key={`dn-${selectedEscola?.id ?? ''}`} />
                <Grid cols={3}>
                  <Input name="cep" label="CEP" defaultValue={selectedEscola?.cep ?? ''} key={`cep-${selectedEscola?.id ?? ''}`} />
                  <div style={{ gridColumn: 'span 2' }}>
                    <Input name="logradouro" label="Logradouro" defaultValue={selectedEscola?.rua ?? ''} key={`rua-${selectedEscola?.id ?? ''}`} />
                  </div>
                </Grid>
                <Grid cols={3}>
                  <Input name="numero" label="Número" defaultValue={selectedEscola?.numero ?? ''} key={`num-${selectedEscola?.id ?? ''}`} />
                  <Input name="complemento" label="Complemento" defaultValue={selectedEscola?.complemento ?? ''} key={`cpl-${selectedEscola?.id ?? ''}`} />
                  <Input name="bairro" label="Bairro" defaultValue={selectedEscola?.bairro ?? ''} key={`bai-${selectedEscola?.id ?? ''}`} />
                </Grid>
                <Grid cols={3}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <Input name="cidade" label="Cidade" defaultValue={selectedEscola?.cidade ?? ''} key={`cid-${selectedEscola?.id ?? ''}`} />
                  </div>
                  <SelectStatic name="uf" label="UF" defaultValue={selectedEscola?.estado ?? ''} key={`uf-${selectedEscola?.id ?? ''}`}>
                    <option value="">—</option>
                    {UF_LIST.map(u => <option key={u} value={u}>{u}</option>)}
                  </SelectStatic>
                </Grid>
                <Grid cols={2}>
                  <Input name="cpf_cnpj" label="CPF / CNPJ" defaultValue={selectedEscola?.cnpj ?? ''} key={`doc-${selectedEscola?.id ?? ''}`} />
                  <Input name="celular" label="Celular" />
                </Grid>
                <Grid cols={2}>
                  <Input name="telefone" label="Telefone" defaultValue={selectedEscola?.telefone ?? ''} key={`tel-${selectedEscola?.id ?? ''}`} />
                  <Input name="email" label="E-mail" type="email" defaultValue={selectedEscola?.email ?? ''} key={`em-${selectedEscola?.id ?? ''}`} />
                </Grid>
              </Section>

              <Section label="⚙️ Configuração">
                <SelectStatic name="prioridade" label="Prioridade" defaultValue="normal">
                  <option value="normal">Normal</option>
                  <option value="urgente">🔴 Urgente</option>
                </SelectStatic>
              </Section>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setOpen(false)}
                  style={{ padding: '.6rem 1.2rem', borderRadius: 8, background: '#fff', color: '#64748b', border: '1.5px solid #e2e8f0', fontWeight: 600, fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '.6rem 1.4rem', borderRadius: 8, background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: '0 4px 12px rgba(217,119,6,.3)' }}>
                  {saving ? 'Criando...' : 'Criar Solicitação'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

// ─── Subcomponentes ────────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#0f172a', borderBottom: '2px solid #d97706', paddingBottom: '.35rem', marginBottom: '.75rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>{children}</div>
    </div>
  )
}

function Grid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '.75rem' }}>
      {children}
    </div>
  )
}

function Input({ name, label, type = 'text', required, defaultValue, min }: {
  name: string; label: string; type?: string; required?: boolean; defaultValue?: string; min?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>}
      </label>
      <input name={name} type={type} required={required} defaultValue={defaultValue} min={min}
        style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', fontFamily: 'var(--font-inter,sans-serif)' }}
      />
    </div>
  )
}

function Select({ name, label, children, onChange }: {
  name: string; label: string; children: React.ReactNode; onChange?: (v: string) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </label>
      <select name={name} onChange={e => onChange?.(e.target.value)}
        style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', fontFamily: 'var(--font-inter,sans-serif)' }}>
        {children}
      </select>
    </div>
  )
}

function SelectStatic({ name, label, defaultValue, children }: {
  name: string; label: string; defaultValue?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </label>
      <select name={name} defaultValue={defaultValue}
        style={{ width: '100%', padding: '.55rem .85rem', fontSize: '.85rem', border: '1.5px solid #e2e8f0', borderRadius: 8, outline: 'none', background: '#fff', fontFamily: 'var(--font-inter,sans-serif)' }}>
        {children}
      </select>
    </div>
  )
}
