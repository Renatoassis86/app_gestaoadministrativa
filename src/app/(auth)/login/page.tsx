'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, ClipboardList, Phone, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }
    window.location.href = '/comercial'
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      fontFamily: 'var(--font-inter, var(--font-montserrat), system-ui, sans-serif)',
      background: '#0f172a',
    }}>

      {/* ══════════════════════════════════════════════════════════
          HEADER — Logo + link formulário
          ══════════════════════════════════════════════════════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '1rem 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, rgba(15,23,42,.9) 0%, transparent 100%)',
      }}>
        <Image
          src="/images/logo-education.png"
          alt="Cidade Viva Education"
          width={160} height={44}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: .92 }}
          priority
        />
        <a href="/formulario" style={{
          display: 'inline-flex', alignItems: 'center', gap: '.4rem',
          background: '#d97706', color: '#fff',
          padding: '.45rem 1.1rem', borderRadius: 9999,
          fontSize: '.78rem', fontWeight: 700, textDecoration: 'none',
          letterSpacing: '.03em', boxShadow: '0 4px 14px rgba(217,119,6,.4)',
          transition: 'all .2s',
          fontFamily: 'var(--font-montserrat, sans-serif)',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#b45309'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <ClipboardList size={14} />
          Formulário da Escola
        </a>
      </header>

      {/* ══════════════════════════════════════════════════════════
          HERO — Vídeo de fundo + conteúdo + formulário de login
          ══════════════════════════════════════════════════════════ */}
      <section style={{
        flex: 1, position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>

        {/* Vídeo de fundo */}
        <video
          autoPlay muted loop playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            zIndex: 0,
          }}
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
          <source src="/videos/bg.mp4" type="video/mp4" />
        </video>

        {/* Overlay gradiente profundo */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(110deg, rgba(15,23,42,.95) 0%, rgba(15,23,42,.8) 45%, rgba(15,23,42,.6) 100%)',
        }} />

        {/* Conteúdo principal */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 1200,
          margin: '0 auto',
          padding: '7rem 2rem 4rem',
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: '4rem',
          alignItems: 'center',
        }}>

          {/* Coluna esquerda — Texto hero */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: 'rgba(15,23,42,.7)',
              border: '1px solid rgba(217,119,6,.4)',
              backdropFilter: 'blur(8px)',
              borderRadius: 9999, padding: '.3rem .9rem',
              marginBottom: '1.5rem',
              fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', color: '#f59e0b',
              fontFamily: 'var(--font-montserrat, sans-serif)',
              boxShadow: '0 4px 16px rgba(0,0,0,.3)',
            }}>
              ✦ Plataforma Interna — Equipe Comercial
            </div>

            {/* Título Cormorant */}
            <h1 style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 700, lineHeight: 1.1, color: '#fff',
              marginBottom: '1rem',
              textShadow: '0 2px 20px rgba(0,0,0,.5)',
              textWrap: 'balance' as any,
            }}>
              Gestão comercial<br />
              <span style={{ color: '#f59e0b' }}>inteligente e integrada</span>
            </h1>

            <p style={{
              fontSize: '1rem', color: 'rgba(255,255,255,.7)',
              lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 480,
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              Ferramenta exclusiva para a equipe interna da Cidade Viva Education. Gerencie escolas parceiras, registre interações, acompanhe negociações e monitore indicadores comerciais em tempo real.
            </p>

            {/* Bloco para escolas parceiras */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(217,119,6,.18) 0%, rgba(217,119,6,.08) 100%)',
              border: '1px solid rgba(217,119,6,.35)',
              borderLeft: '4px solid #d97706',
              borderRadius: 14, padding: '1.35rem 1.5rem',
              backdropFilter: 'blur(8px)',
              maxWidth: 500,
              boxShadow: '0 8px 32px rgba(217,119,6,.12)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Ícone */}
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217,119,6,.4)',
                }}>
                  <ClipboardList size={21} color="#fff" />
                </div>

                <div style={{ flex: 1 }}>
                  {/* Eyebrow label */}
                  <div style={{
                    fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: '#fbbf24',
                    marginBottom: '.3rem',
                    fontFamily: 'var(--font-montserrat, sans-serif)',
                  }}>
                    ✦ Sua escola quer ser parceira CVE?
                  </div>

                  {/* Título */}
                  <div style={{
                    fontFamily: 'var(--font-cormorant, serif)',
                    fontSize: '1.1rem', fontWeight: 700, color: '#fff',
                    lineHeight: 1.2, marginBottom: '.5rem',
                  }}>
                    Conheça o Currículo Paideia
                  </div>

                  {/* Descrição */}
                  <p style={{
                    fontSize: '.78rem', color: 'rgba(255,255,255,.7)',
                    lineHeight: 1.6, marginBottom: '.9rem',
                    fontFamily: 'var(--font-inter, sans-serif)',
                  }}>
                    Preencha o formulário de pré-cadastro e nossa equipe comercial entrará em contato com uma proposta personalizada para a sua escola.
                  </p>

                  {/* CTA */}
                  <a href="/formulario" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.45rem',
                    background: '#d97706', color: '#fff',
                    padding: '.55rem 1.25rem', borderRadius: 9999,
                    fontSize: '.8rem', fontWeight: 700, textDecoration: 'none',
                    boxShadow: '0 4px 16px rgba(217,119,6,.45)',
                    fontFamily: 'var(--font-montserrat, sans-serif)',
                    letterSpacing: '.01em',
                  }}>
                    Acessar Formulário de Pré-Cadastro <ArrowRight size={13} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita — Card de Login */}
          <div style={{
            background: 'rgba(15,23,42,.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 20,
            padding: '2.5rem',
            boxShadow: '0 24px 64px rgba(0,0,0,.5)',
          }}>

            {/* Header do card */}
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em',
                textTransform: 'uppercase', color: '#d97706', marginBottom: '.65rem',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                ✦ Acesso Restrito — Equipe Interna
              </div>
              <h2 style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1.6rem', fontWeight: 700, color: '#fff', lineHeight: 1.2,
              }}>
                Entre na plataforma
              </h2>
              <p style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.45)', marginTop: '.3rem', fontFamily: 'var(--font-inter, sans-serif)' }}>
                Use as credenciais fornecidas pelo seu gestor
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div style={{
                background: 'rgba(220,38,38,.15)', border: '1px solid rgba(220,38,38,.3)',
                borderRadius: 8, padding: '.7rem 1rem', marginBottom: '1.25rem',
                color: '#fca5a5', fontSize: '.82rem',
                fontFamily: 'var(--font-inter, sans-serif)',
              }}>
                ⚠ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{
                  display: 'block', fontSize: '.68rem', fontWeight: 700,
                  color: 'rgba(255,255,255,.45)', marginBottom: '.4rem',
                  textTransform: 'uppercase', letterSpacing: '.08em',
                  fontFamily: 'var(--font-montserrat, sans-serif)',
                }}>E-mail</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  required autoFocus placeholder="seu@cidadeviva.org"
                  style={{
                    width: '100%', padding: '.75rem 1rem',
                    background: 'rgba(255,255,255,.06)',
                    border: '1.5px solid rgba(255,255,255,.1)',
                    borderRadius: 10, outline: 'none',
                    color: '#fff', fontSize: '.875rem',
                    transition: 'border-color .15s, box-shadow .15s',
                    fontFamily: 'var(--font-inter, sans-serif)',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#d97706'; e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block', fontSize: '.68rem', fontWeight: 700,
                  color: 'rgba(255,255,255,.45)', marginBottom: '.4rem',
                  textTransform: 'uppercase', letterSpacing: '.08em',
                  fontFamily: 'var(--font-montserrat, sans-serif)',
                }}>Senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    required placeholder="••••••••"
                    style={{
                      width: '100%', padding: '.75rem 2.75rem .75rem 1rem',
                      background: 'rgba(255,255,255,.06)',
                      border: '1.5px solid rgba(255,255,255,.1)',
                      borderRadius: 10, outline: 'none',
                      color: '#fff', fontSize: '.875rem',
                      transition: 'border-color .15s, box-shadow .15s',
                      fontFamily: 'var(--font-inter, sans-serif)',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#d97706'; e.target.style.boxShadow = '0 0 0 3px rgba(217,119,6,.15)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.1)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{
                    position: 'absolute', right: '.85rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,.35)', padding: 0,
                  }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{
                marginTop: '.25rem', width: '100%', padding: '.85rem',
                background: loading ? 'rgba(217,119,6,.4)' : '#d97706',
                color: '#fff', fontWeight: 700, fontSize: '.9rem',
                border: '1px solid rgba(217,119,6,.5)',
                borderRadius: 9999, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all .2s',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(217,119,6,.4)',
                fontFamily: 'var(--font-montserrat, sans-serif)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#b45309'; e.currentTarget.style.transform = 'translateY(-1px)' }}}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = '#d97706'; e.currentTarget.style.transform = 'translateY(0)' }}}
              >
                {loading ? 'Entrando...' : <><span>Entrar na Plataforma</span> <ArrowRight size={16} /></>}
              </button>
            </form>

            {/* Divisor */}
            <div style={{
              margin: '1.5rem 0',
              borderTop: '1px solid rgba(255,255,255,.07)',
              display: 'flex', alignItems: 'center', gap: '.75rem',
            }}>
              <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-inter, sans-serif)' }}>
                Este acesso é exclusivo para a equipe interna
              </span>
            </div>

            {/* Link formulário dentro do card */}
            <a href="/formulario" style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              padding: '.7rem 1rem', borderRadius: 10,
              border: '1px solid rgba(217,119,6,.25)',
              background: 'rgba(217,119,6,.08)',
              color: '#fbbf24', textDecoration: 'none',
              fontSize: '.78rem', fontWeight: 600,
              transition: 'all .2s',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,119,6,.15)'; e.currentTarget.style.borderColor = 'rgba(217,119,6,.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,119,6,.08)'; e.currentTarget.style.borderColor = 'rgba(217,119,6,.25)' }}
            >
              <ClipboardList size={15} style={{ flexShrink: 0 }} />
              <span>Quero ser escola parceira — Pré-Cadastro →</span>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FOOTER — Contatos CVE + Logo + Links
          ══════════════════════════════════════════════════════════ */}
      <footer style={{
        background: '#030712',
        borderTop: '1px solid rgba(255,255,255,.06)',
        padding: '3rem 2rem 2rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>

            {/* Coluna 1 — Logo + frase + contatos */}
            <div>
              <Image
                src="/images/logo-education.png"
                alt="Cidade Viva Education"
                width={160} height={44}
                style={{ objectFit: 'contain', objectPosition: 'left', filter: 'brightness(0) invert(1)', opacity: .85, marginBottom: '1rem' }}
              />
              {/* Frase institucional */}
              <p style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1rem', fontStyle: 'italic',
                color: 'rgba(255,255,255,.5)', lineHeight: 1.6,
                marginBottom: '1.25rem', maxWidth: 320,
              }}>
                "Conduzir pessoas ao deslumbramento a partir de uma educação cristã de excelência."
              </p>

              {/* Contatos */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {[
                  { icon: <Mail size={14} />, label: 'comercial.education@cidadeviva.org', href: 'mailto:comercial.education@cidadeviva.org' },
                  { icon: <Phone size={14} />, label: '+55 (11) 97391-6735', href: 'tel:+5511973916735' },
                  { icon: <MessageCircle size={14} />, label: 'WhatsApp Comercial', href: 'https://wa.me/5511973916735' },
                  { icon: <span style={{fontSize:'14px'}}>📷</span>, label: '@cidadeeducation', href: 'https://instagram.com/cidadeeducation' },
                ].map(item => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    color: 'rgba(255,255,255,.45)', fontSize: '.78rem',
                    textDecoration: 'none', transition: 'color .15s',
                    fontFamily: 'var(--font-inter, sans-serif)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}
                  >
                    <span style={{ color: '#d97706', flexShrink: 0 }}>{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Coluna 2 — Módulos da plataforma */}
            <div>
              <div style={{
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: '#d97706', marginBottom: '1rem',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                Módulos da Plataforma
              </div>
              {[
                'Dashboard Comercial',
                'Gestão de Escolas',
                'Registros de Interações',
                'Jornada de Relacionamento',
                'Jornada Contratual',
                'Pipeline Kanban',
                'Tabela Geral',
                'Calculadora Eskolare',
                'Downloads e Relatórios',
              ].map(item => (
                <div key={item} style={{
                  color: 'rgba(255,255,255,.35)', fontSize: '.75rem',
                  padding: '.2rem 0', fontFamily: 'var(--font-inter, sans-serif)',
                }}>{item}</div>
              ))}
            </div>

            {/* Coluna 3 — Links úteis */}
            <div>
              <div style={{
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: '#d97706', marginBottom: '1rem',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                Links Úteis
              </div>
              {[
                { label: 'Cidade Viva Education', href: 'https://cidadeviva.org/' },
                { label: 'Plataforma Educacional', href: 'https://hub.cidadeviva.education/hub/login.php?curso_id=0' },
                { label: 'FICV — Faculdade Internacional', href: 'https://ficv.edu.br/' },
                { label: 'Formulário de Pré-Cadastro', href: '/formulario' },
              ].map(item => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{
                  display: 'block', color: 'rgba(255,255,255,.4)', fontSize: '.78rem',
                  padding: '.25rem 0', textDecoration: 'none', transition: 'color .15s',
                  fontFamily: 'var(--font-inter, sans-serif)',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.4)'}
                >
                  {item.label}
                </a>
              ))}

              {/* Destaque formulário no footer */}
              <div style={{ marginTop: '1.25rem' }}>
                <a href="/formulario" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                  background: '#d97706', color: '#fff',
                  padding: '.45rem 1rem', borderRadius: 9999,
                  fontSize: '.75rem', fontWeight: 700, textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(217,119,6,.3)',
                  fontFamily: 'var(--font-montserrat, sans-serif)',
                }}>
                  <ClipboardList size={13} />
                  Formulário para Escolas
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid rgba(255,255,255,.05)',
            paddingTop: '1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem',
          }}>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-montserrat, sans-serif)', letterSpacing: '.03em' }}>
              © {new Date().getFullYear()} Cidade Viva Education · Central de Inteligência Analítica
            </p>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.15)', fontFamily: 'var(--font-inter, sans-serif)' }}>
              Plataforma de uso exclusivo da equipe interna
            </p>
          </div>
        </div>
      </footer>

      {/* Placeholder CSS para responsivo */}
      <style>{`
        input::placeholder { color: rgba(255,255,255,.22) !important; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
