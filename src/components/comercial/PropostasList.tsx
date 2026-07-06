'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Mail, Phone, Building2, MapPin, X, Calendar, Users, FileText, Pencil, Trash2, Save } from 'lucide-react'
import { editarProposta, excluirProposta } from './propostas-actions'

export interface FormularioProposta {
  id: string
  data_envio: string
  email_responsavel: string
  nome_escola: string
  cnpj: string | null
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  infantil2_qtd: number
  infantil3_qtd: number
  infantil4_qtd: number
  infantil5_qtd: number
  fund1_ano1_qtd: number
  fund1_ano2_qtd: number
  fund1_ano3_qtd: number
  fund1_ano4_qtd: number
  fund1_ano5_qtd: number
  data_inicio_letivo: string | null
  data_fim_letivo: string | null
  formato_ano_letivo: string | null
  observacoes: string | null
  ticket_medio_mensalidade: number | null
  investimento_sistema_atual: number | null
  legal_nome: string | null
  legal_cpf: string | null
  legal_rg: string | null
  legal_orgao: string | null
  legal_rua: string | null
  legal_numero: string | null
  legal_complemento: string | null
  legal_bairro: string | null
  legal_cidade: string | null
  legal_estado: string | null
  legal_cep: string | null
  legal_email: string | null
  legal_celular: string | null
  fin_nome: string | null
  fin_cpf: string | null
  fin_rg: string | null
  fin_orgao: string | null
  fin_email: string | null
  fin_celular: string | null
  ped_nome: string | null
  ped_cpf: string | null
  ped_rg: string | null
  ped_orgao: string | null
  ped_email: string | null
  ped_celular: string | null
}

function totalAlunos(f: FormularioProposta) {
  return (f.infantil2_qtd ?? 0) + (f.infantil3_qtd ?? 0) + (f.infantil4_qtd ?? 0) + (f.infantil5_qtd ?? 0)
       + (f.fund1_ano1_qtd ?? 0) + (f.fund1_ano2_qtd ?? 0) + (f.fund1_ano3_qtd ?? 0) + (f.fund1_ano4_qtd ?? 0) + (f.fund1_ano5_qtd ?? 0)
}

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtDateOnly(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function fmtMoeda(v: number | null | undefined) {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function PropostasList({ formularios }: { formularios: FormularioProposta[] }) {
  const router = useRouter()
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<FormularioProposta | null>(null)
  const [editando, setEditando]       = useState<FormularioProposta | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  async function handleExcluir(f: FormularioProposta) {
    if (!confirm(`Excluir permanentemente a proposta de "${f.nome_escola}"?\nEssa ação não pode ser desfeita.`)) return
    setExcluindoId(f.id)
    const r = await excluirProposta(f.id)
    setExcluindoId(null)
    if (!r.success) { alert(`Não foi possível excluir: ${r.error}`); return }
    router.refresh()
  }

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return formularios
    return formularios.filter(f =>
      f.nome_escola?.toLowerCase().includes(q) ||
      f.cidade?.toLowerCase().includes(q) ||
      f.cnpj?.toLowerCase().includes(q) ||
      f.email_responsavel?.toLowerCase().includes(q) ||
      f.legal_nome?.toLowerCase().includes(q)
    )
  }, [busca, formularios])

  return (
    <>
      {/* Busca */}
      <div style={{
        background: '#fff', border: '1.5px solid #94a3b8', borderRadius: 12,
        padding: '.6rem .9rem', display: 'flex', alignItems: 'center', gap: '.6rem',
      }}>
        <Search size={16} color="#64748b" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por escola, CNPJ, cidade, e-mail ou nome do responsável..."
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: '.88rem',
            fontFamily: 'var(--font-inter,sans-serif)', background: 'transparent',
          }}
        />
        <span style={{ fontSize: '.7rem', color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
          {filtrados.length} de {formularios.length}
        </span>
      </div>

      {/* Lista */}
      {filtrados.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px dashed #94a3b8', borderRadius: 12,
          padding: '3rem 2rem', textAlign: 'center',
        }}>
          <FileText size={40} color="#94a3b8" style={{ marginBottom: '.75rem' }} />
          <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '.3rem' }}>
            {formularios.length === 0 ? 'Nenhuma proposta recebida ainda' : 'Nenhum resultado para sua busca'}
          </div>
          <p style={{ fontSize: '.85rem', color: '#64748b', maxWidth: 480, margin: '0 auto', fontFamily: 'var(--font-inter,sans-serif)' }}>
            {formularios.length === 0
              ? 'As escolas que preencherem o formulário público em /formulario aparecerão aqui.'
              : 'Tente outro termo de busca.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '.85rem' }}>
          {filtrados.map(f => {
            const alunos = totalAlunos(f)
            const isExcluindo = excluindoId === f.id
            return (
              <div
                key={f.id}
                onClick={() => setSelecionado(f)}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelecionado(f) } }}
                style={{
                  position: 'relative',
                  textAlign: 'left', background: '#fff', border: '1.5px solid #cbd5e1',
                  borderLeft: '4px solid #d97706', borderRadius: 12, padding: '1rem 1.1rem',
                  cursor: 'pointer', transition: 'box-shadow .15s, transform .1s',
                  fontFamily: 'var(--font-inter,sans-serif)', boxShadow: '0 1px 4px rgba(15,23,42,.05)',
                  opacity: isExcluindo ? .5 : 1,
                  pointerEvents: isExcluindo ? 'none' : 'auto',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.13)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  const actions = e.currentTarget.querySelector('.card-actions') as HTMLElement | null
                  if (actions) actions.style.opacity = '1'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  const actions = e.currentTarget.querySelector('.card-actions') as HTMLElement | null
                  if (actions) actions.style.opacity = '0'
                }}
              >
                {/* Botões de ação (aparecem no hover) */}
                <div className="card-actions" style={{
                  position: 'absolute', top: 8, right: 8,
                  display: 'flex', gap: 4,
                  opacity: 0, transition: 'opacity .15s', zIndex: 2,
                }}>
                  <button
                    type="button"
                    title="Editar cadastro"
                    onClick={e => { e.stopPropagation(); setEditando(f) }}
                    style={{
                      width: 26, height: 26, borderRadius: 6,
                      background: '#eff6ff', border: '1px solid #bfdbfe',
                      color: '#1d4ed8', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    title="Excluir cadastro"
                    onClick={e => { e.stopPropagation(); handleExcluir(f) }}
                    style={{
                      width: 26, height: 26, borderRadius: 6,
                      background: '#fef2f2', border: '1px solid #fca5a5',
                      color: '#dc2626', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>

                {/* Data badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem', paddingRight: '4rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                    fontSize: '.62rem', fontWeight: 700, color: '#d97706',
                    background: '#fffbeb', border: '1px solid #fcd34d',
                    padding: '.15rem .5rem', borderRadius: 99,
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                  }}>
                    <Calendar size={10} /> {fmtData(f.data_envio)}
                  </span>
                  {alunos > 0 && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                      fontSize: '.62rem', fontWeight: 700, color: '#0d9488',
                      background: '#f0fdfa', border: '1px solid #99f6e4',
                      padding: '.15rem .5rem', borderRadius: 99,
                      fontFamily: 'var(--font-montserrat,sans-serif)',
                    }}>
                      <Users size={10} /> {alunos} alunos
                    </span>
                  )}
                </div>

                {/* Nome da escola */}
                <div style={{
                  fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700,
                  color: '#0f172a', lineHeight: 1.2, marginBottom: '.35rem',
                }}>
                  {f.nome_escola}
                </div>

                {/* Localização */}
                {(f.cidade || f.estado) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.72rem', color: '#475569', marginBottom: '.5rem' }}>
                    <MapPin size={11} color="#94a3b8" />
                    {[f.cidade, f.estado].filter(Boolean).join(' / ')}
                  </div>
                )}

                {/* CNPJ */}
                {f.cnpj && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.7rem', color: '#64748b', marginBottom: '.5rem' }}>
                    <Building2 size={11} color="#94a3b8" />
                    <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{f.cnpj}</span>
                  </div>
                )}

                {/* Footer: contato */}
                <div style={{
                  paddingTop: '.5rem', marginTop: '.5rem',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '.7rem', color: '#475569',
                }}>
                  {f.legal_nome && (
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', color: '#0f172a', marginBottom: '.15rem' }}>
                      {f.legal_nome}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', overflow: 'hidden' }}>
                    <Mail size={10} color="#94a3b8" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.email_responsavel}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selecionado && (
        <DetalhesModal
          formulario={selecionado}
          onClose={() => setSelecionado(null)}
          onEditar={() => { setEditando(selecionado); setSelecionado(null) }}
        />
      )}

      {editando && (
        <EditarPropostaModal
          formulario={editando}
          onClose={() => setEditando(null)}
          onSaved={() => { setEditando(null); router.refresh() }}
        />
      )}
    </>
  )
}

// ─── Modal de Detalhes ────────────────────────────────────────────────────────

function DetalhesModal({ formulario: f, onClose, onEditar }: {
  formulario: FormularioProposta; onClose: () => void; onEditar: () => void
}) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(3px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, maxWidth: 880, width: '100%',
        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.5rem', background: '#0f172a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          borderRadius: '14px 14px 0 0',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.62rem', color: '#d97706', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              Dados da Proposta · Enviado em {fmtData(f.data_envio)}
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.45rem', fontWeight: 700, lineHeight: 1.2, marginTop: '.15rem' }}>
              {f.nome_escola}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '.4rem', flexShrink: 0 }}>
            <button onClick={onEditar}
              title="Editar"
              style={{
                background: '#d97706', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
                borderRadius: 8, padding: '0 .8rem', height: 32,
                display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                fontSize: '.72rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-montserrat,sans-serif)',
              }}>
              <Pencil size={13} /> Editar
            </button>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
              borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Dados da escola */}
          <Section label="🏫 Dados da Escola">
            <Grid items={[
              ['CNPJ', f.cnpj],
              ['E-mail do responsável', f.email_responsavel],
              ['Logradouro', [f.rua, f.numero, f.complemento].filter(Boolean).join(', ')],
              ['Bairro', f.bairro],
              ['Cidade/UF', [f.cidade, f.estado].filter(Boolean).join(' / ')],
              ['CEP', f.cep],
            ]} />
          </Section>

          {/* Informações acadêmicas */}
          <Section label="📚 Informações Acadêmicas">
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '.5rem', marginBottom: '.75rem',
            }}>
              {[
                ['Infantil 2', f.infantil2_qtd],
                ['Infantil 3', f.infantil3_qtd],
                ['Infantil 4', f.infantil4_qtd],
                ['Infantil 5', f.infantil5_qtd],
                ['1º Fund I', f.fund1_ano1_qtd],
                ['2º Fund I', f.fund1_ano2_qtd],
                ['3º Fund I', f.fund1_ano3_qtd],
                ['4º Fund I', f.fund1_ano4_qtd],
                ['5º Fund I', f.fund1_ano5_qtd],
              ].map(([l, v]) => (
                <div key={String(l)} style={{
                  background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 8,
                  padding: '.5rem .6rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '.58rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                    {l}
                  </div>
                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    {v ?? 0}
                  </div>
                </div>
              ))}
              <div style={{
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                border: '1.5px solid #fcd34d', borderRadius: 8,
                padding: '.5rem .6rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '.58rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Total
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 800, color: '#b45309', lineHeight: 1 }}>
                  {totalAlunos(f)}
                </div>
              </div>
            </div>
            <Grid items={[
              ['Início do ano letivo 2026', fmtDateOnly(f.data_inicio_letivo)],
              ['Fim do ano letivo 2026',    fmtDateOnly(f.data_fim_letivo)],
              ['Formato',                   f.formato_ano_letivo],
            ]} />
            {f.observacoes && (
              <div style={{ marginTop: '.75rem', padding: '.65rem .85rem', background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, fontSize: '.82rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                <strong style={{ color: '#b45309', fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.05em', display: 'block', marginBottom: '.2rem' }}>Observações</strong>
                {f.observacoes}
              </div>
            )}
          </Section>

          {/* Informações financeiras */}
          <Section label="💰 Informações Financeiras">
            <Grid items={[
              ['Ticket médio da mensalidade', fmtMoeda(f.ticket_medio_mensalidade)],
              ['Investimento no sistema de ensino atual', fmtMoeda(f.investimento_sistema_atual)],
            ]} />
          </Section>

          {/* Representante Legal */}
          <Representante label="🪪 Representante Legal" tipo="legal" formulario={f} />
          <Representante label="💰 Representante Financeiro" tipo="fin" formulario={f} />
          <Representante label="🎓 Representante Pedagógico" tipo="ped" formulario={f} />

          {/* Footer com atalhos */}
          <div style={{
            marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1',
            display: 'flex', flexWrap: 'wrap', gap: '.4rem', justifyContent: 'flex-end',
          }}>
            <a href={`mailto:${f.email_responsavel}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.45rem .9rem', borderRadius: 8, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontSize: '.74rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              <Mail size={12} /> {f.email_responsavel}
            </a>
            {f.legal_celular && (
              <a href={`https://wa.me/55${f.legal_celular.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.45rem .9rem', borderRadius: 8, background: '#dcfce7', color: '#15803d', border: '1px solid #86efac', fontSize: '.74rem', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                <Phone size={12} /> WhatsApp Legal
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#0f172a', borderBottom: '2px solid #d97706', paddingBottom: '.4rem', marginBottom: '.85rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Grid({ items }: { items: [string, string | number | null | undefined][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.6rem .9rem' }}>
      {items.map(([k, v]) => (
        <div key={k}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{k}</div>
          <div style={{ fontSize: '.84rem', color: '#0f172a', fontFamily: 'var(--font-inter,sans-serif)' }}>
            {v == null || v === '' ? <span style={{ color: '#cbd5e1' }}>—</span> : v}
          </div>
        </div>
      ))}
    </div>
  )
}

function Representante({ label, tipo, formulario: f }: {
  label: string; tipo: 'legal' | 'fin' | 'ped'; formulario: FormularioProposta
}) {
  const nome     = f[`${tipo}_nome` as keyof FormularioProposta]     as string | null
  const cpf      = f[`${tipo}_cpf` as keyof FormularioProposta]      as string | null
  const rg       = f[`${tipo}_rg` as keyof FormularioProposta]       as string | null
  const orgao    = f[`${tipo}_orgao` as keyof FormularioProposta]    as string | null
  const email    = f[`${tipo}_email` as keyof FormularioProposta]    as string | null
  const celular  = f[`${tipo}_celular` as keyof FormularioProposta]  as string | null

  // Campos de endereço só existem para o legal
  const showEndereco = tipo === 'legal'
  const items: [string, string | number | null | undefined][] = [
    ['Nome', nome],
    ['CPF', cpf],
    ['RG', rg],
    ['Órgão Emissor', orgao],
    ['E-mail', email],
    ['Celular', celular],
  ]

  if (showEndereco) {
    items.push(
      ['Logradouro', [f.legal_rua, f.legal_numero, f.legal_complemento].filter(Boolean).join(', ')],
      ['Bairro',     f.legal_bairro],
      ['Cidade/UF',  [f.legal_cidade, f.legal_estado].filter(Boolean).join(' / ')],
      ['CEP',        f.legal_cep],
    )
  }

  // Se tudo for vazio, mostra nota
  const todosVazios = items.every(([, v]) => v == null || v === '')

  return (
    <Section label={label}>
      {todosVazios
        ? <div style={{ fontSize: '.78rem', color: '#cbd5e1', fontStyle: 'italic', fontFamily: 'var(--font-inter,sans-serif)' }}>Não preenchido</div>
        : <Grid items={items} />}
    </Section>
  )
}

// ─── Modal de Edição ──────────────────────────────────────────────────────────

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

function EditarPropostaModal({ formulario: f, onClose, onSaved }: {
  formulario: FormularioProposta; onClose: () => void; onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [err, setErr]       = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErr(null); setSaving(true)
    const fd = new FormData(e.currentTarget)
    const r = await editarProposta(f.id, fd)
    setSaving(false)
    if (!r.success) { setErr(r.error ?? 'Erro ao salvar'); return }
    onSaved()
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(3px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto',
    }}>
      <form onClick={e => e.stopPropagation()} onSubmit={handleSubmit}
        style={{ background: '#fff', borderRadius: 14, maxWidth: 880, width: '100%', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.4)' }}>
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.5rem', background: '#0f172a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          borderRadius: '14px 14px 0 0',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.62rem', color: '#d97706', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              Editar Proposta
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.2, marginTop: '.15rem' }}>
              {f.nome_escola}
            </div>
          </div>
          <button type="button" onClick={onClose} style={{
            background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
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

          <FormSection label="🏫 Dados da Escola">
            <FormGrid cols={2}>
              <FormInput name="nome_escola" label="Nome da Escola" defaultValue={f.nome_escola} required />
              <FormInput name="cnpj" label="CNPJ" defaultValue={f.cnpj ?? ''} />
            </FormGrid>
            <FormInput name="email_responsavel" label="E-mail do responsável" type="email" defaultValue={f.email_responsavel ?? ''} required />
            <FormGrid cols={3}>
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput name="rua" label="Logradouro" defaultValue={f.rua ?? ''} />
              </div>
              <FormInput name="numero" label="Número" defaultValue={f.numero ?? ''} />
            </FormGrid>
            <FormGrid cols={3}>
              <FormInput name="complemento" label="Complemento" defaultValue={f.complemento ?? ''} />
              <FormInput name="bairro" label="Bairro" defaultValue={f.bairro ?? ''} />
              <FormInput name="cep" label="CEP" defaultValue={f.cep ?? ''} />
            </FormGrid>
            <FormGrid cols={3}>
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput name="cidade" label="Cidade" defaultValue={f.cidade ?? ''} />
              </div>
              <FormSelect name="estado" label="UF" defaultValue={f.estado ?? ''}>
                <option value="">—</option>
                {UF_LIST.map(u => <option key={u} value={u}>{u}</option>)}
              </FormSelect>
            </FormGrid>
          </FormSection>

          <FormSection label="📚 Informações Acadêmicas">
            <FormGrid cols={5}>
              <FormInput name="infantil2_qtd" label="Infantil 2" type="number" min="0" defaultValue={String(f.infantil2_qtd ?? 0)} />
              <FormInput name="infantil3_qtd" label="Infantil 3" type="number" min="0" defaultValue={String(f.infantil3_qtd ?? 0)} />
              <FormInput name="infantil4_qtd" label="Infantil 4" type="number" min="0" defaultValue={String(f.infantil4_qtd ?? 0)} />
              <FormInput name="infantil5_qtd" label="Infantil 5" type="number" min="0" defaultValue={String(f.infantil5_qtd ?? 0)} />
              <FormInput name="fund1_ano1_qtd" label="1º Fund I" type="number" min="0" defaultValue={String(f.fund1_ano1_qtd ?? 0)} />
            </FormGrid>
            <FormGrid cols={5}>
              <FormInput name="fund1_ano2_qtd" label="2º Fund I" type="number" min="0" defaultValue={String(f.fund1_ano2_qtd ?? 0)} />
              <FormInput name="fund1_ano3_qtd" label="3º Fund I" type="number" min="0" defaultValue={String(f.fund1_ano3_qtd ?? 0)} />
              <FormInput name="fund1_ano4_qtd" label="4º Fund I" type="number" min="0" defaultValue={String(f.fund1_ano4_qtd ?? 0)} />
              <FormInput name="fund1_ano5_qtd" label="5º Fund I" type="number" min="0" defaultValue={String(f.fund1_ano5_qtd ?? 0)} />
              <div />
            </FormGrid>
            <FormGrid cols={3}>
              <FormInput name="data_inicio_letivo" label="Início ano letivo" type="date" defaultValue={f.data_inicio_letivo ?? ''} />
              <FormInput name="data_fim_letivo"    label="Fim ano letivo"    type="date" defaultValue={f.data_fim_letivo ?? ''} />
              <FormSelect name="formato_ano_letivo" label="Formato" defaultValue={f.formato_ano_letivo ?? ''}>
                <option value="">—</option>
                <option value="Bimestre">Bimestre</option>
                <option value="Trimestre">Trimestre</option>
              </FormSelect>
            </FormGrid>
            <FormTextarea name="observacoes" label="Observações" defaultValue={f.observacoes ?? ''} />
          </FormSection>

          <FormSection label="💰 Informações Financeiras">
            <FormGrid cols={2}>
              <FormInput name="ticket_medio_mensalidade" label="Ticket médio da mensalidade (R$)" type="number" min="0" step="0.01"
                defaultValue={f.ticket_medio_mensalidade != null ? String(f.ticket_medio_mensalidade) : ''} />
              <FormInput name="investimento_sistema_atual" label="Investimento no sistema de ensino atual (R$)" type="number" min="0" step="0.01"
                defaultValue={f.investimento_sistema_atual != null ? String(f.investimento_sistema_atual) : ''} />
            </FormGrid>
          </FormSection>

          <FormSection label="🪪 Representante Legal">
            <FormGrid cols={2}>
              <FormInput name="legal_nome" label="Nome" defaultValue={f.legal_nome ?? ''} />
              <FormInput name="legal_cpf"  label="CPF"  defaultValue={f.legal_cpf ?? ''} />
            </FormGrid>
            <FormGrid cols={2}>
              <FormInput name="legal_rg"    label="RG"    defaultValue={f.legal_rg ?? ''} />
              <FormInput name="legal_orgao" label="Órgão Emissor" defaultValue={f.legal_orgao ?? ''} />
            </FormGrid>
            <FormGrid cols={3}>
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput name="legal_rua" label="Logradouro" defaultValue={f.legal_rua ?? ''} />
              </div>
              <FormInput name="legal_numero" label="Número" defaultValue={f.legal_numero ?? ''} />
            </FormGrid>
            <FormGrid cols={3}>
              <FormInput name="legal_complemento" label="Complemento" defaultValue={f.legal_complemento ?? ''} />
              <FormInput name="legal_bairro"      label="Bairro"      defaultValue={f.legal_bairro ?? ''} />
              <FormInput name="legal_cep"         label="CEP"         defaultValue={f.legal_cep ?? ''} />
            </FormGrid>
            <FormGrid cols={3}>
              <div style={{ gridColumn: 'span 2' }}>
                <FormInput name="legal_cidade" label="Cidade" defaultValue={f.legal_cidade ?? ''} />
              </div>
              <FormSelect name="legal_estado" label="UF" defaultValue={f.legal_estado ?? ''}>
                <option value="">—</option>
                {UF_LIST.map(u => <option key={u} value={u}>{u}</option>)}
              </FormSelect>
            </FormGrid>
            <FormGrid cols={2}>
              <FormInput name="legal_email"   label="E-mail"  type="email" defaultValue={f.legal_email ?? ''} />
              <FormInput name="legal_celular" label="Celular" defaultValue={f.legal_celular ?? ''} />
            </FormGrid>
          </FormSection>

          <FormSection label="💰 Representante Financeiro">
            <FormGrid cols={2}>
              <FormInput name="fin_nome" label="Nome" defaultValue={f.fin_nome ?? ''} />
              <FormInput name="fin_cpf"  label="CPF"  defaultValue={f.fin_cpf ?? ''} />
            </FormGrid>
            <FormGrid cols={2}>
              <FormInput name="fin_rg"    label="RG"    defaultValue={f.fin_rg ?? ''} />
              <FormInput name="fin_orgao" label="Órgão Emissor" defaultValue={f.fin_orgao ?? ''} />
            </FormGrid>
            <FormGrid cols={2}>
              <FormInput name="fin_email"   label="E-mail"  type="email" defaultValue={f.fin_email ?? ''} />
              <FormInput name="fin_celular" label="Celular" defaultValue={f.fin_celular ?? ''} />
            </FormGrid>
          </FormSection>

          <FormSection label="🎓 Representante Pedagógico">
            <FormGrid cols={2}>
              <FormInput name="ped_nome" label="Nome" defaultValue={f.ped_nome ?? ''} />
              <FormInput name="ped_cpf"  label="CPF"  defaultValue={f.ped_cpf ?? ''} />
            </FormGrid>
            <FormGrid cols={2}>
              <FormInput name="ped_rg"    label="RG"    defaultValue={f.ped_rg ?? ''} />
              <FormInput name="ped_orgao" label="Órgão Emissor" defaultValue={f.ped_orgao ?? ''} />
            </FormGrid>
            <FormGrid cols={2}>
              <FormInput name="ped_email"   label="E-mail"  type="email" defaultValue={f.ped_email ?? ''} />
              <FormInput name="ped_celular" label="Celular" defaultValue={f.ped_celular ?? ''} />
            </FormGrid>
          </FormSection>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1' }}>
            <button type="button" onClick={onClose}
              style={{ padding: '.6rem 1.2rem', borderRadius: 8, background: '#fff', color: '#64748b', border: '1.5px solid #cbd5e1', fontWeight: 600, fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', padding: '.6rem 1.4rem', borderRadius: 8, background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, fontSize: '.78rem', cursor: 'pointer', fontFamily: 'var(--font-montserrat,sans-serif)', boxShadow: '0 4px 12px rgba(217,119,6,.3)' }}>
              <Save size={13} /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ─── Subcomponentes do form ───────────────────────────────────────────────────

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ fontSize: '.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#0f172a', borderBottom: '2px solid #d97706', paddingBottom: '.4rem', marginBottom: '.85rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>{children}</div>
    </div>
  )
}

function FormGrid({ cols, children }: { cols: number; children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '.75rem' }}>{children}</div>
  )
}

function FormInput({ name, label, type = 'text', defaultValue, required, min, step }: {
  name: string; label: string; type?: string; defaultValue?: string; required?: boolean; min?: string; step?: string
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>}
      </label>
      <input name={name} type={type} defaultValue={defaultValue} required={required} min={min} step={step}
        style={{ width: '100%', padding: '.5rem .8rem', fontSize: '.85rem', border: '1.5px solid #94a3b8', borderRadius: 8, outline: 'none', fontFamily: 'var(--font-inter,sans-serif)' }}
      />
    </div>
  )
}

function FormSelect({ name, label, defaultValue, children }: {
  name: string; label: string; defaultValue?: string; children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </label>
      <select name={name} defaultValue={defaultValue}
        style={{ width: '100%', padding: '.5rem .8rem', fontSize: '.85rem', border: '1.5px solid #94a3b8', borderRadius: 8, outline: 'none', background: '#fff', fontFamily: 'var(--font-inter,sans-serif)' }}>
        {children}
      </select>
    </div>
  )
}

function FormTextarea({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b', marginBottom: '.3rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
        {label}
      </label>
      <textarea name={name} defaultValue={defaultValue} rows={3}
        style={{ width: '100%', padding: '.5rem .8rem', fontSize: '.85rem', border: '1.5px solid #94a3b8', borderRadius: 8, outline: 'none', resize: 'vertical', fontFamily: 'var(--font-inter,sans-serif)' }}
      />
    </div>
  )
}
