'use client'

import { useMemo, useState } from 'react'
import { Search, Mail, Phone, Building2, MapPin, X, Calendar, Users, FileText, ExternalLink } from 'lucide-react'

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

export function PropostasList({ formularios }: { formularios: FormularioProposta[] }) {
  const [busca, setBusca] = useState('')
  const [selecionado, setSelecionado] = useState<FormularioProposta | null>(null)

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
            return (
              <button
                key={f.id}
                onClick={() => setSelecionado(f)}
                style={{
                  textAlign: 'left', background: '#fff', border: '1.5px solid #cbd5e1',
                  borderLeft: '4px solid #d97706', borderRadius: 12, padding: '1rem 1.1rem',
                  cursor: 'pointer', transition: 'box-shadow .15s, transform .1s',
                  fontFamily: 'var(--font-inter,sans-serif)', boxShadow: '0 1px 4px rgba(15,23,42,.05)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,42,.13)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(15,23,42,.05)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Data badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem' }}>
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
              </button>
            )
          })}
        </div>
      )}

      {selecionado && (
        <DetalhesModal formulario={selecionado} onClose={() => setSelecionado(null)} />
      )}
    </>
  )
}

// ─── Modal de Detalhes ────────────────────────────────────────────────────────

function DetalhesModal({ formulario: f, onClose }: { formulario: FormularioProposta; onClose: () => void }) {
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
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,.1)', color: '#fff', border: '1px solid rgba(255,255,255,.2)',
            borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
          }}>
            <X size={16} />
          </button>
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
