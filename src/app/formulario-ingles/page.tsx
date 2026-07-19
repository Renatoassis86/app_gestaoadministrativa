'use client'

import { useState } from 'react'
import { enviarFormularioBilinguismo } from '@/lib/bilinguismo-actions'

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

const PACOTES = [
  {
    id: 'bronze',
    nome: 'Bronze',
    badge: 'Essencial',
    preco: 'R$ 29.900',
    periodo: '/ano',
    cor: '#0284c7',
    corBg: '#f0f9ff',
    corBorder: '#bae6fd',
    destaque: false,
    recursos: [
      'Consultoria básica de implantação do departamento de inglês',
      'Treinamento e capacitação inicial da equipe docente',
      'Acompanhamento pedagógico bimestral de evolução',
      'Suporte comercial e suporte via e-mail',
    ],
  },
  {
    id: 'silver',
    nome: 'Silver',
    badge: 'Mais Popular',
    preco: 'R$ 57.900',
    periodo: '/ano',
    cor: '#0d9488',
    corBg: '#f0fdfa',
    corBorder: '#99f6e4',
    destaque: true,
    recursos: [
      'Consultoria intermediária e estrutura pedagógica completa',
      'Treinamentos contínuos e materiais de apoio exclusivos',
      'Acompanhamento pedagógico mensal dedicado',
      'Avaliações de desempenho e diretrizes curriculares',
    ],
  },
  {
    id: 'gold',
    nome: 'Gold',
    badge: 'Full Bilinguismo',
    preco: 'R$ 84.900',
    periodo: '/ano',
    cor: '#4f46e5',
    corBg: '#f5f3ff',
    corBorder: '#c4b5fd',
    destaque: false,
    recursos: [
      'Implantação VIP / Full Bilinguismo na instituição',
      'Assessoria pedagógica dedicada com gestão de qualidade',
      'Encontros quinzenais, workshops e treinamentos avançados',
      'Certificação e acompanhamento estratégico contínuo',
    ],
  },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        fontSize: '.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em',
        color: '#0284c7', borderBottom: '2px solid #0284c7', paddingBottom: '.4rem', marginBottom: '1.2rem',
        fontFamily: 'var(--font-montserrat, sans-serif)',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem',
    }}>
      {children}
    </div>
  )
}

function Field({ label, name, type = 'text', required, options, placeholder, value, onChange }: {
  label: string; name: string; type?: string; required?: boolean; options?: string[]; placeholder?: string
  value?: string; onChange?: (e: React.ChangeEvent<any>) => void
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '.82rem', fontWeight: 600, color: '#334155', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat, sans-serif)' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {options ? (
        <select name={name} required={required} value={value} onChange={onChange} style={{
          width: '100%', padding: '.65rem .85rem', fontSize: '.875rem', border: '1.5px solid #CBD5E1',
          borderRadius: 10, background: '#fff', outline: 'none', fontFamily: 'var(--font-inter, sans-serif)',
        }}>
          <option value="">Selecione...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input name={name} type={type} required={required} placeholder={placeholder} value={value} onChange={onChange}
          style={{
            width: '100%', padding: '.65rem .85rem', fontSize: '.875rem', border: '1.5px solid #CBD5E1',
            borderRadius: 10, outline: 'none', fontFamily: 'var(--font-inter, sans-serif)',
          }} />
      )}
    </div>
  )
}

export default function FormularioBilinguismoPublico() {
  const [pacoteSelecionado, setPacoteSelecionado] = useState<string>('silver')
  const [cnpj, setCnpj] = useState<string>('')
  const [legalCpf, setLegalCpf] = useState<string>('')
  const [legalCelular, setLegalCelular] = useState<string>('')

  // Máscara de CNPJ (00.000.000/0000-00)
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 14) v = v.substring(0, 14)
    if (v.length > 12) {
      v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})$/, '$1.$2.$3/$4-$5')
    } else if (v.length > 8) {
      v = v.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})$/, '$1.$2.$3/$4')
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{3})(\d{1,3})$/, '$1.$2.$3')
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{1,3})$/, '$1.$2')
    }
    setCnpj(v)
  }

  const handleCpfChange = (e: React.ChangeEvent<any>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 11) v = v.substring(0, 11)
    if (v.length > 9) v = v.replace(/^(\d{3})(\d{3})(\d{3})(\d{1,2})$/, '$1.$2.$3-$4')
    else if (v.length > 6) v = v.replace(/^(\d{3})(\d{3})(\d{1,3})$/, '$1.$2.$3')
    else if (v.length > 3) v = v.replace(/^(\d{3})(\d{1,3})$/, '$1.$2')
    setLegalCpf(v)
  }

  const handleCelularChange = (e: React.ChangeEvent<any>) => {
    let v = e.target.value.replace(/\D/g, '')
    if (v.length > 11) v = v.substring(0, 11)
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4,5})$/, '($1) $2')
    else if (v.length > 2) v = v.replace(/^(\d{2})$/, '($1)')
    setLegalCelular(v)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)', padding: '2.5rem 1rem' }}>
      <div style={{ maxWidth: 840, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <img
            src="/images/logo_azul.png"
            alt="Cidade Viva Education"
            style={{ height: 56, objectFit: 'contain', marginBottom: '1.5rem' }}
          />
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            background: '#e0f2fe', border: '1px solid #7dd3fc',
            borderRadius: 9999, padding: '.35rem 1.1rem', marginBottom: '1.1rem',
            fontSize: '.72rem', fontWeight: 700, color: '#0369a1',
            textTransform: 'uppercase', letterSpacing: '.08em',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}>
            ✦ Programa de Bilinguismo & Parceria de Inglês
          </div>
          <h1 style={{
            fontFamily: 'var(--font-cormorant, "Georgia", serif)',
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: 700, color: '#0f172a', lineHeight: 1.15,
            marginBottom: '.85rem',
          }}>
            Inicie a Parceria de Inglês com a<br />
            <span style={{ color: '#0284c7' }}>Cidade Viva Education</span>
          </h1>
          <p style={{
            color: '#475569', fontSize: '.95rem', lineHeight: 1.6,
            maxWidth: 580, margin: '0 auto',
            fontFamily: 'var(--font-inter, sans-serif)',
          }}>
            Preencha os dados da sua instituição abaixo para gerar a proposta comercial e dar o primeiro passo na implantação do programa de bilinguismo.
          </p>
        </div>

        <form action={enviarFormularioBilinguismo}>
          {/* Campo oculto para o pacote selecionado */}
          <input type="hidden" name="pacote_interesse" value={pacoteSelecionado} />

          {/* 1. SELEÇÃO DE PACOTES DE INTERESSE */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Escolha o Pacote de Interesse
              </h2>
              <p style={{ fontSize: '.83rem', color: '#64748b', fontFamily: 'var(--font-inter, sans-serif)', marginTop: '.2rem' }}>
                Clique no pacote que melhor atende à realidade e planejamento da sua escola
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              {PACOTES.map((p) => {
                const isSelected = pacoteSelecionado === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => setPacoteSelecionado(p.id)}
                    style={{
                      background: isSelected ? p.corBg : '#fff',
                      border: `2px solid ${isSelected ? p.cor : '#e2e8f0'}`,
                      borderRadius: 16,
                      padding: '1.35rem 1.1rem',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all .2s ease',
                      boxShadow: isSelected ? `0 6px 20px ${p.cor}25` : '0 2px 8px rgba(0,0,0,.04)',
                    }}
                  >
                    {p.badge && (
                      <div style={{
                        position: 'absolute', top: -12, right: 16,
                        background: isSelected ? p.cor : '#64748b', color: '#fff',
                        fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase',
                        letterSpacing: '.08em', padding: '.2rem .65rem', borderRadius: 9999,
                        fontFamily: 'var(--font-montserrat, sans-serif)',
                      }}>
                        {p.badge}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: `2px solid ${isSelected ? p.cor : '#cbd5e1'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {isSelected && (
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.cor }} />
                        )}
                      </div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-montserrat, sans-serif)' }}>
                        {p.nome}
                      </span>
                    </div>

                    <div style={{ marginBottom: '.85rem' }} />

                    <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '.8rem', color: '#334155', lineHeight: 1.5, fontFamily: 'var(--font-inter, sans-serif)' }}>
                      {p.recursos.map((r, i) => (
                        <li key={i} style={{ marginBottom: '.4rem' }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 2. DADOS DO FORMULÁRIO */}
          <div style={{ background: '#fff', borderRadius: 18, padding: '2rem', boxShadow: '0 4px 16px rgba(15,23,42,.06)', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>

            <Section title="Responsável pelo Preenchimento">
              <Field
                label="Seu E-mail para contato"
                name="email_responsavel"
                type="email"
                required
                placeholder="exemplo@escola.com.br"
              />
            </Section>

            <Section title="Dados da Instituição de Ensino">
              <Row>
                <Field label="Nome da Escola / Razão Social" name="nome_escola" required placeholder="Nome oficial da escola" />
                <Field label="CNPJ" name="cnpj" required placeholder="00.000.000/0000-00" value={cnpj} onChange={handleCnpjChange} />
              </Row>
              <Row>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Rua / Logradouro" name="rua" placeholder="Ex: Av. Principal" />
                </div>
                <Field label="Número" name="numero" placeholder="123" />
              </Row>
              <Row>
                <Field label="Complemento" name="complemento" placeholder="Bloco A, Sala 2" />
                <Field label="Bairro" name="bairro" placeholder="Bairro" />
                <Field label="CEP" name="cep" placeholder="00000-000" />
              </Row>
              <Row>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="Cidade" name="cidade" placeholder="Nome da cidade" />
                </div>
                <Field label="Estado (UF)" name="estado" options={ESTADOS_BR} />
              </Row>
            </Section>

            <Section title="Representante Legal para Assinatura do Contrato">
              <Row>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field
                    label="Nome Completo do Representante Legal"
                    name="nome_representante_legal"
                    required
                    placeholder="Nome da pessoa responsável por assinar o contrato"
                  />
                </div>
                <Field label="Cargo / Função" name="legal_cargo" placeholder="Ex: Diretor General / Mantenedor" />
              </Row>
              <Row>
                <Field label="CPF do Representante" name="legal_cpf" placeholder="000.000.000-00" value={legalCpf} onChange={handleCpfChange} />
                <Field label="RG" name="legal_rg" placeholder="0.000.000" />
                <Field label="Órgão Emissor / UF" name="legal_orgao" placeholder="Ex: SSP/PB" />
              </Row>
              <Row>
                <div style={{ gridColumn: 'span 2' }}>
                  <Field label="E-mail do Representante" name="legal_email" type="email" placeholder="representante@escola.com.br" />
                </div>
                <Field label="Celular / WhatsApp" name="legal_celular" placeholder="(00) 00000-0000" value={legalCelular} onChange={handleCelularChange} />
              </Row>
            </Section>

            <button
              type="submit"
              style={{
                width: '100%', padding: '1rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                color: '#fff', fontWeight: 700, fontSize: '1.05rem',
                border: 'none', borderRadius: 9999, cursor: 'pointer',
                fontFamily: 'var(--font-montserrat, sans-serif)',
                letterSpacing: '.02em',
                boxShadow: '0 4px 14px rgba(2,132,199,.35)',
                transition: 'transform .15s, opacity .15s',
              }}
            >
              Enviar Formulário e Gerar Proposta →
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', fontSize: '.75rem', color: '#64748b', fontFamily: 'var(--font-inter, sans-serif)' }}>
          Cidade Viva Education © {new Date().getFullYear()} · Programa de Bilinguismo e Parceria de Inglês.
        </p>
      </div>
    </div>
  )
}
