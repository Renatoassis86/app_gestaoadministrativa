'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Mail, Building2, MapPin, X, Calendar, Users, FileText, Pencil, Trash2, Globe, CheckCircle2 } from 'lucide-react'
import { editarProposta, excluirProposta } from './propostas-actions'
import { excluirPropostaBilinguismo } from '@/lib/bilinguismo-actions'
import { PACOTE_NOMES, PACOTE_PRECOS } from '@/lib/bilinguismo-constants'

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

export interface FormularioBilinguismo {
  id: string
  data_envio: string
  email_responsavel: string
  nome_escola: string
  cnpj: string
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  nome_representante_legal: string
  legal_cpf?: string | null
  legal_rg?: string | null
  legal_orgao?: string | null
  legal_email?: string | null
  legal_celular?: string | null
  legal_cargo?: string | null
  pacote_interesse: string
  escola_id: string | null
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

export function PropostasList({
  formularios = [],
  formulariosBilinguismo = [],
}: {
  formularios: FormularioProposta[]
  formulariosBilinguismo?: FormularioBilinguismo[]
}) {
  const router = useRouter()
  const [tipoForm, setTipoForm] = useState<'paideia' | 'bilinguismo'>('paideia')
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<FormularioProposta | null>(null)
  const [selecionadoBilinguismo, setSelecionadoBilinguismo] = useState<FormularioBilinguismo | null>(null)
  const [editando, setEditando]       = useState<FormularioProposta | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  async function handleExcluirPaideia(f: FormularioProposta) {
    if (!confirm(`Excluir permanentemente a proposta de "${f.nome_escola}"?\nEssa ação não pode ser desfeita.`)) return
    setExcluindoId(f.id)
    const r = await excluirProposta(f.id)
    setExcluindoId(null)
    if (!r.success) { alert(`Não foi possível excluir: ${r.error}`); return }
    router.refresh()
  }

  async function handleExcluirBilinguismo(f: FormularioBilinguismo) {
    if (!confirm(`Excluir permanentemente a proposta de bilinguismo de "${f.nome_escola}"?\nEssa ação não pode ser desfeita.`)) return
    setExcluindoId(f.id)
    const r = await excluirPropostaBilinguismo(f.id)
    setExcluindoId(null)
    if (!r.success) { alert(`Não foi possível excluir: ${r.error}`); return }
    router.refresh()
  }

  const filtradosPaideia = useMemo(() => {
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

  const filtradosBilinguismo = useMemo(() => {
    const q = busca.trim().toLowerCase()
    if (!q) return formulariosBilinguismo
    return formulariosBilinguismo.filter(f =>
      f.nome_escola?.toLowerCase().includes(q) ||
      f.cidade?.toLowerCase().includes(q) ||
      f.cnpj?.toLowerCase().includes(q) ||
      f.email_responsavel?.toLowerCase().includes(q) ||
      f.nome_representante_legal?.toLowerCase().includes(q) ||
      f.pacote_interesse?.toLowerCase().includes(q)
    )
  }, [busca, formulariosBilinguismo])

  return (
    <>
      {/* Selector de Abas: Paideia vs Bilinguismo */}
      <div style={{ display: 'flex', gap: '.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '.1rem' }}>
        <button
          onClick={() => setTipoForm('paideia')}
          style={{
            padding: '.65rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: tipoForm === 'paideia' ? '#fff' : 'transparent',
            borderBottom: tipoForm === 'paideia' ? '3px solid #d97706' : '3px solid transparent',
            color: tipoForm === 'paideia' ? '#d97706' : '#64748b',
            fontWeight: 700,
            fontSize: '.85rem',
            fontFamily: 'var(--font-montserrat, sans-serif)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.45rem',
            transition: 'all .15s',
          }}
        >
          <FileText size={16} />
          Currículo Paideia
          <span style={{
            background: tipoForm === 'paideia' ? '#fff7ed' : '#f1f5f9',
            color: tipoForm === 'paideia' ? '#c2410c' : '#64748b',
            padding: '.15rem .5rem', borderRadius: 99, fontSize: '.7rem', fontWeight: 800,
          }}>
            {formularios.length}
          </span>
        </button>

        <button
          onClick={() => setTipoForm('bilinguismo')}
          style={{
            padding: '.65rem 1.25rem',
            borderRadius: '10px 10px 0 0',
            border: 'none',
            background: tipoForm === 'bilinguismo' ? '#fff' : 'transparent',
            borderBottom: tipoForm === 'bilinguismo' ? '3px solid #0284c7' : '3px solid transparent',
            color: tipoForm === 'bilinguismo' ? '#0284c7' : '#64748b',
            fontWeight: 700,
            fontSize: '.85rem',
            fontFamily: 'var(--font-montserrat, sans-serif)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '.45rem',
            transition: 'all .15s',
          }}
        >
          <Globe size={16} />
          Parceria de Bilinguismo
          <span style={{
            background: tipoForm === 'bilinguismo' ? '#e0f2fe' : '#f1f5f9',
            color: tipoForm === 'bilinguismo' ? '#0369a1' : '#64748b',
            padding: '.15rem .5rem', borderRadius: 99, fontSize: '.7rem', fontWeight: 800,
          }}>
            {formulariosBilinguismo.length}
          </span>
        </button>
      </div>

      {/* Campo de Busca */}
      <div style={{
        background: '#fff', border: '1.5px solid #94a3b8', borderRadius: 12,
        padding: '.6rem .9rem', display: 'flex', alignItems: 'center', gap: '.6rem',
      }}>
        <Search size={16} color="#64748b" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder={tipoForm === 'paideia'
            ? "Buscar por escola, CNPJ, cidade, e-mail ou nome do responsável..."
            : "Buscar por escola, CNPJ, pacote de interesse, cidade ou representante..."
          }
          style={{
            flex: 1, border: 'none', outline: 'none', fontSize: '.88rem',
            fontFamily: 'var(--font-inter,sans-serif)', background: 'transparent',
          }}
        />
        <span style={{ fontSize: '.7rem', color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
          {tipoForm === 'paideia' ? `${filtradosPaideia.length} de ${formularios.length}` : `${filtradosBilinguismo.length} de ${formulariosBilinguismo.length}`}
        </span>
      </div>

      {/* ABA PAIDEIA */}
      {tipoForm === 'paideia' && (
        filtradosPaideia.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #94a3b8', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center' }}>
            <FileText size={40} color="#94a3b8" style={{ marginBottom: '.75rem' }} />
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '.3rem' }}>
              {formularios.length === 0 ? 'Nenhuma proposta do Paideia recebida ainda' : 'Nenhum resultado para sua busca'}
            </div>
            <p style={{ fontSize: '.85rem', color: '#64748b', maxWidth: 480, margin: '0 auto', fontFamily: 'var(--font-inter,sans-serif)' }}>
              {formularios.length === 0
                ? 'As escolas que preencherem o formulário público em /formulario aparecerão aqui.'
                : 'Tente outro termo de busca.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '.85rem' }}>
            {filtradosPaideia.map(f => {
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
                    position: 'relative', textAlign: 'left', background: '#fff', border: '1.5px solid #cbd5e1',
                    borderLeft: '4px solid #d97706', borderRadius: 12, padding: '1rem 1.1rem',
                    cursor: 'pointer', transition: 'box-shadow .15s, transform .1s',
                    fontFamily: 'var(--font-inter,sans-serif)', boxShadow: '0 1px 4px rgba(15,23,42,.05)',
                    opacity: isExcluindo ? .5 : 1, pointerEvents: isExcluindo ? 'none' : 'auto',
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
                  <div className="card-actions" style={{
                    position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4,
                    opacity: 0, transition: 'opacity .15s', zIndex: 2,
                  }}>
                    <button type="button" title="Editar cadastro" onClick={e => { e.stopPropagation(); setEditando(f) }}
                      style={{ width: 26, height: 26, borderRadius: 6, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      <Pencil size={12} />
                    </button>
                    <button type="button" title="Excluir cadastro" onClick={e => { e.stopPropagation(); handleExcluirPaideia(f) }}
                      style={{ width: 26, height: 26, borderRadius: 6, background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem', paddingRight: '4rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', fontSize: '.62rem', fontWeight: 700, color: '#d97706', background: '#fffbeb', border: '1px solid #fcd34d', padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      <Calendar size={10} /> {fmtData(f.data_envio)}
                    </span>
                    {alunos > 0 && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', fontSize: '.62rem', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', border: '1px solid #99f6e4', padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        <Users size={10} /> {alunos} alunos
                      </span>
                    )}
                  </div>

                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginBottom: '.35rem' }}>
                    {f.nome_escola}
                  </div>

                  {(f.cidade || f.estado) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.72rem', color: '#475569', marginBottom: '.5rem' }}>
                      <MapPin size={11} color="#94a3b8" />
                      {[f.cidade, f.estado].filter(Boolean).join(' / ')}
                    </div>
                  )}

                  {f.cnpj && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.7rem', color: '#64748b', marginBottom: '.5rem' }}>
                      <Building2 size={11} color="#94a3b8" />
                      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{f.cnpj}</span>
                    </div>
                  )}

                  <div style={{ paddingTop: '.5rem', marginTop: '.5rem', borderTop: '1px solid #f1f5f9', fontSize: '.7rem', color: '#475569' }}>
                    {f.legal_nome && (
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', color: '#0f172a', marginBottom: '.15rem' }}>
                        {f.legal_nome}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', overflow: 'hidden' }}>
                      <Mail size={10} color="#94a3b8" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email_responsavel}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* ABA BILINGUISMO */}
      {tipoForm === 'bilinguismo' && (
        filtradosBilinguismo.length === 0 ? (
          <div style={{ background: '#fff', border: '1px dashed #94a3b8', borderRadius: 12, padding: '3rem 2rem', textAlign: 'center' }}>
            <Globe size={40} color="#94a3b8" style={{ marginBottom: '.75rem' }} />
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '.3rem' }}>
              {formulariosBilinguismo.length === 0 ? 'Nenhuma proposta de Bilinguismo recebida ainda' : 'Nenhum resultado para sua busca'}
            </div>
            <p style={{ fontSize: '.85rem', color: '#64748b', maxWidth: 480, margin: '0 auto', fontFamily: 'var(--font-inter,sans-serif)' }}>
              {formulariosBilinguismo.length === 0
                ? 'As escolas que preencherem o formulário público em /formulario-ingles aparecerão aqui.'
                : 'Tente outro termo de busca.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '.85rem' }}>
            {filtradosBilinguismo.map(f => {
              const isExcluindo = excluindoId === f.id
              const pNome = PACOTE_NOMES[f.pacote_interesse] ?? f.pacote_interesse
              const pPreco = PACOTE_PRECOS[f.pacote_interesse]
              const pCor = f.pacote_interesse === 'gold' ? '#4f46e5' : f.pacote_interesse === 'silver' ? '#0d9488' : '#0284c7'
              const pBg = f.pacote_interesse === 'gold' ? '#f5f3ff' : f.pacote_interesse === 'silver' ? '#f0fdfa' : '#f0f9ff'
              const pBorder = f.pacote_interesse === 'gold' ? '#c4b5fd' : f.pacote_interesse === 'silver' ? '#99f6e4' : '#bae6fd'

              return (
                <div
                  key={f.id}
                  onClick={() => setSelecionadoBilinguismo(f)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelecionadoBilinguismo(f) } }}
                  style={{
                    position: 'relative', textAlign: 'left', background: '#fff', border: '1.5px solid #cbd5e1',
                    borderLeft: `4px solid ${pCor}`, borderRadius: 12, padding: '1rem 1.1rem',
                    cursor: 'pointer', transition: 'box-shadow .15s, transform .1s',
                    fontFamily: 'var(--font-inter,sans-serif)', boxShadow: '0 1px 4px rgba(15,23,42,.05)',
                    opacity: isExcluindo ? .5 : 1, pointerEvents: isExcluindo ? 'none' : 'auto',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.13)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    const actions = e.currentTarget.querySelector('.card-actions-bil') as HTMLElement | null
                    if (actions) actions.style.opacity = '1'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,.05)'
                    e.currentTarget.style.transform = 'translateY(0)'
                    const actions = e.currentTarget.querySelector('.card-actions-bil') as HTMLElement | null
                    if (actions) actions.style.opacity = '0'
                  }}
                >
                  <div className="card-actions-bil" style={{
                    position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4,
                    opacity: 0, transition: 'opacity .15s', zIndex: 2,
                  }}>
                    <button type="button" title="Excluir cadastro" onClick={e => { e.stopPropagation(); handleExcluirBilinguismo(f) }}
                      style={{ width: 26, height: 26, borderRadius: 6, background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem', paddingRight: '2rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem', fontSize: '.62rem', fontWeight: 700, color: pCor, background: pBg, border: `1px solid ${pBorder}`, padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      <Globe size={10} /> {pNome} {pPreco ? `(${fmtMoeda(pPreco)}/ano)` : ''}
                    </span>
                    <span style={{ fontSize: '.62rem', fontWeight: 600, color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      {fmtData(f.data_envio)}
                    </span>
                  </div>

                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginBottom: '.35rem' }}>
                    {f.nome_escola}
                  </div>

                  {(f.cidade || f.estado) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.72rem', color: '#475569', marginBottom: '.5rem' }}>
                      <MapPin size={11} color="#94a3b8" />
                      {[f.cidade, f.estado].filter(Boolean).join(' / ')}
                    </div>
                  )}

                  {f.cnpj && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontSize: '.7rem', color: '#64748b', marginBottom: '.5rem' }}>
                      <Building2 size={11} color="#94a3b8" />
                      <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{f.cnpj}</span>
                    </div>
                  )}

                  <div style={{ paddingTop: '.5rem', marginTop: '.5rem', borderTop: '1px solid #f1f5f9', fontSize: '.7rem', color: '#475569' }}>
                    {f.nome_representante_legal && (
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)', color: '#0f172a', marginBottom: '.15rem' }}>
                        Rep. Legal: {f.nome_representante_legal}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem', overflow: 'hidden' }}>
                      <Mail size={10} color="#94a3b8" />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.email_responsavel}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Modal Detalhes Paideia */}
      {selecionado && (
        <DetalhesModal
          formulario={selecionado}
          onClose={() => setSelecionado(null)}
          onEditar={() => { setEditando(selecionado); setSelecionado(null) }}
        />
      )}

      {/* Modal Edição Paideia */}
      {editando && (
        <EditarPropostaModal
          formulario={editando}
          onClose={() => setEditando(null)}
          onSaved={() => { setEditando(null); router.refresh() }}
        />
      )}

      {/* Modal Detalhes Bilinguismo */}
      {selecionadoBilinguismo && (
        <DetalhesBilinguismoModal
          formulario={selecionadoBilinguismo}
          onClose={() => setSelecionadoBilinguismo(null)}
        />
      )}
    </>
  )
}

// ─── Modal de Detalhes Paideia ────────────────────────────────────────────────

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
                background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fcd34d', borderRadius: 8,
                padding: '.5rem .6rem', textAlign: 'center',
              }}>
                <div style={{ fontSize: '.58rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Total Alunos
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 800, color: '#d97706', lineHeight: 1 }}>
                  {totalAlunos(f)}
                </div>
              </div>
            </div>
            <Grid items={[
              ['Início do Ano Letivo', fmtDateOnly(f.data_inicio_letivo)],
              ['Fim do Ano Letivo', fmtDateOnly(f.data_fim_letivo)],
              ['Formato', f.formato_ano_letivo],
            ]} />
            {f.observacoes && (
              <div style={{ marginTop: '.6rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '.6rem .8rem' }}>
                <div style={{ fontSize: '.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.2rem' }}>
                  Observações
                </div>
                <div style={{ fontSize: '.83rem', color: '#334155', lineHeight: 1.5, fontFamily: 'var(--font-inter,sans-serif)' }}>
                  {f.observacoes}
                </div>
              </div>
            )}
          </Section>

          {/* Informações financeiras */}
          <Section label="💰 Informações Financeiras">
            <Grid items={[
              ['Ticket Médio da Mensalidade', fmtMoeda(f.ticket_medio_mensalidade)],
              ['Investimento no Sistema Atual', fmtMoeda(f.investimento_sistema_atual)],
            ]} />
          </Section>

          {/* Representantes */}
          <Section label="👤 Representantes">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '.75rem' }}>
              <RepBox titulo="Representante Legal" nome={f.legal_nome} cpf={f.legal_cpf} rg={f.legal_rg} orgao={f.legal_orgao} email={f.legal_email} cel={f.legal_celular}
                end={[f.legal_rua, f.legal_numero, f.legal_complemento, f.legal_bairro, f.legal_cidade, f.legal_estado, f.legal_cep].filter(Boolean).join(', ')} />
              <RepBox titulo="Representante Financeiro" nome={f.fin_nome} cpf={f.fin_cpf} rg={f.fin_rg} orgao={f.fin_orgao} email={f.fin_email} cel={f.fin_celular} />
              <RepBox titulo="Representante Pedagógico" nome={f.ped_nome} cpf={f.ped_cpf} rg={f.ped_rg} orgao={f.ped_orgao} email={f.ped_email} cel={f.ped_celular} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function RepBox({ titulo, nome, cpf, rg, orgao, email, cel, end }: {
  titulo: string; nome?: string | null; cpf?: string | null; rg?: string | null; orgao?: string | null
  email?: string | null; cel?: string | null; end?: string | null
}) {
  if (!nome && !cpf && !email && !cel) return null
  return (
    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '.65rem .85rem' }}>
      <div style={{ fontSize: '.62rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.3rem' }}>
        {titulo}
      </div>
      {nome && <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#0f172a' }}>{nome}</div>}
      <div style={{ fontSize: '.75rem', color: '#64748b', marginTop: '.2rem', display: 'flex', flexDirection: 'column', gap: '.1rem' }}>
        {cpf && <div>CPF: {cpf}</div>}
        {rg && <div>RG: {rg} {orgao ? `(${orgao})` : ''}</div>}
        {email && <div>E-mail: {email}</div>}
        {cel && <div>Celular: {cel}</div>}
        {end && <div style={{ marginTop: '.2rem', fontSize: '.7rem', color: '#94a3b8' }}>{end}</div>}
      </div>
    </div>
  )
}

// ─── Modal Detalhes Bilinguismo ───────────────────────────────────────────────

function DetalhesBilinguismoModal({ formulario: f, onClose }: {
  formulario: FormularioBilinguismo; onClose: () => void
}) {
  const pNome = PACOTE_NOMES[f.pacote_interesse] ?? f.pacote_interesse
  const pPreco = PACOTE_PRECOS[f.pacote_interesse]

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(3px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 16, maxWidth: 720, width: '100%',
        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: '.62rem', color: '#38bdf8', fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              Proposta Bilinguismo · Enviado em {fmtData(f.data_envio)}
            </div>
            <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2, marginTop: '.15rem' }}>
              {f.nome_escola}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Banner Pacote */}
          <div style={{
            background: '#f0f9ff', border: '1.5px solid #bae6fd', borderRadius: 12, padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#0369a1', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Pacote Selecionado
              </div>
              <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>
                {pNome}
              </div>
            </div>
            {pPreco && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '.65rem', fontWeight: 700, textTransform: 'uppercase', color: '#0369a1', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Valor Anual Fixado
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {fmtMoeda(pPreco)}
                </div>
              </div>
            )}
          </div>

          {/* Dados Gerais */}
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

          {/* Dados Representante Legal */}
          <Section label="👤 Representante Legal para Contrato">
            <Grid items={[
              ['Nome Completo', f.nome_representante_legal],
              ['Cargo / Função', f.legal_cargo],
              ['CPF', f.legal_cpf],
              ['RG', f.legal_rg ? [f.legal_rg, f.legal_orgao].filter(Boolean).join(' ') : null],
              ['E-mail do Representante', f.legal_email],
              ['Celular / WhatsApp', f.legal_celular],
            ]} />
          </Section>
        </div>
      </div>
    </div>
  )
}

// ─── Componentes utilitários internos ───────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: '.75rem', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.6rem' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Grid({ items }: { items: [string, any][] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.6rem .9rem' }}>
      {items.map(([l, v]) => (
        <div key={l} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '.45rem .7rem' }}>
          <div style={{ fontSize: '.6rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
            {l}
          </div>
          <div style={{ fontSize: '.83rem', fontWeight: 600, color: '#0f172a', wordBreak: 'break-word', fontFamily: 'var(--font-inter,sans-serif)' }}>
            {v || '—'}
          </div>
        </div>
      ))}
    </div>
  )
}

function EditarPropostaModal({ formulario: f, onClose, onSaved }: {
  formulario: FormularioProposta; onClose: () => void; onSaved: () => void
}) {
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSalvando(true)
    const formData = new FormData(e.currentTarget)
    const res = await editarProposta(f.id, formData)
    setSalvando(false)
    if (res.success) {
      onSaved()
    } else {
      alert(`Erro ao salvar: ${res.error}`)
    }
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,.65)', backdropFilter: 'blur(3px)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflowY: 'auto',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 14, maxWidth: 880, width: '100%',
        maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.4)',
      }}>
        <div style={{
          padding: '1.1rem 1.5rem', background: '#0f172a', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderRadius: '14px 14px 0 0',
        }}>
          <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 700 }}>
            Editar Cadastro · {f.nome_escola}
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#475569', marginBottom: '.3rem' }}>Nome da Escola</label>
              <input name="nome_escola" defaultValue={f.nome_escola} required style={{ width: '100%', padding: '.5rem .75rem', borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#475569', marginBottom: '.3rem' }}>CNPJ</label>
              <input name="cnpj" defaultValue={f.cnpj ?? ''} style={{ width: '100%', padding: '.5rem .75rem', borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#475569', marginBottom: '.3rem' }}>E-mail Responsável</label>
              <input name="email_responsavel" defaultValue={f.email_responsavel ?? ''} style={{ width: '100%', padding: '.5rem .75rem', borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#475569', marginBottom: '.3rem' }}>Cidade</label>
              <input name="cidade" defaultValue={f.cidade ?? ''} style={{ width: '100%', padding: '.5rem .75rem', borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#475569', marginBottom: '.3rem' }}>Estado</label>
              <input name="estado" defaultValue={f.estado ?? ''} style={{ width: '100%', padding: '.5rem .75rem', borderRadius: 8, border: '1px solid #cbd5e1' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '.5rem 1.2rem', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={salvando} style={{ padding: '.5rem 1.5rem', borderRadius: 8, border: 'none', background: '#d97706', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
              {salvando ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
