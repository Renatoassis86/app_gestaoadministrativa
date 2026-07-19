'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, BarChart3, ClipboardList, Phone, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'

export default function ComercialLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const videoRef = React.useRef<HTMLVideoElement>(null)
  React.useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.playsInline = true
    const attempt = () => v.play().catch(() => {})
    attempt()
    const t = setTimeout(attempt, 500)
    return () => clearTimeout(t)
  }, [])

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', flexWrap: 'wrap' }}>
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
            Formulário Paideia
          </a>
          <a href="/formulario-ingles" style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            background: 'linear-gradient(135deg, #0284c7, #0f766e)', color: '#fff',
            padding: '.45rem 1.1rem', borderRadius: 9999,
            fontSize: '.78rem', fontWeight: 700, textDecoration: 'none',
            letterSpacing: '.03em', boxShadow: '0 4px 14px rgba(2,132,199,.4)',
            transition: 'all .2s',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <ClipboardList size={14} />
            Formulário Bilinguismo
          </a>
          <a href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            background: 'rgba(255,255,255,.08)', color: '#fff',
            padding: '.45rem 1.1rem', borderRadius: 9999,
            fontSize: '.78rem', fontWeight: 700, textDecoration: 'none',
            letterSpacing: '.03em', border: '1px solid rgba(255,255,255,.15)',
            transition: 'all .2s',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.08)' }}
          >
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            Voltar ao Hub
          </a>
        </div>
      </header>

      <section style={{
        flex: 1, position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center',
        overflow: 'hidden',
      }}>

        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            zIndex: 0,
          }}
        >
          <source src="/videos/institucional.mp4" type="video/mp4" />
        </video>

        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(110deg, rgba(15,23,42,.95) 0%, rgba(15,23,42,.8) 45%, rgba(15,23,42,.6) 100%)',
        }} />

        <div className="hero-grid" style={{
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 1200,
          margin: '0 auto',
          padding: '7rem 2rem 4rem',
          display: 'grid',
          gridTemplateColumns: '1fr 420px',
          gap: '4rem',
          alignItems: 'center',
        }}>

          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: 'rgba(15,23,42,.7)',
              border: '1px solid rgba(217,119,6,.4)',
              backdropFilter: 'blur(8px)',
              borderRadius: 9999, padding: '.3rem .9rem',
              marginBottom: '1.5rem',
              fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', color: '#fbbf24',
              fontFamily: 'var(--font-montserrat, sans-serif)',
              boxShadow: '0 4px 16px rgba(0,0,0,.3)',
            }}>
              ✦ Plataforma de Gestão Comercial
            </div>

            <h1 style={{
              fontFamily: 'var(--font-cormorant, serif)',
              fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
              fontWeight: 700, lineHeight: 1.1, color: '#fff',
              marginBottom: '1rem',
              textShadow: '0 2px 20px rgba(0,0,0,.5)',
              textWrap: 'balance' as any,
            }}>
              Gestão de Parcerias<br />
              <span style={{ color: '#fbbf24' }}>com Escolas</span>
            </h1>

            <p style={{
              fontSize: '1rem', color: 'rgba(255,255,255,.7)',
              lineHeight: 1.7, marginBottom: '1.5rem', maxWidth: 480,
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              Plataforma integrada para gerenciar escolas parceiras, pipeline de vendas, registros de negociação e acompanhamento em tempo real.
            </p>

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
                <div style={{
                  width: 46, height: 46, borderRadius: 12, flexShrink: 0,
                  background: 'linear-gradient(135deg, #d97706, #b45309)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(217,119,6,.4)',
                }}>
                  <ClipboardList size={21} color="#fff" />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '.6rem', fontWeight: 800, letterSpacing: '.1em',
                    textTransform: 'uppercase', color: '#fcd34d',
                    marginBottom: '.3rem',
                    fontFamily: 'var(--font-montserrat, sans-serif)',
                  }}>
                    ✦ Sua escola quer ser parceira CVE?
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-cormorant, serif)',
                    fontSize: '1.1rem', fontWeight: 700, color: '#fff',
                    lineHeight: 1.2, marginBottom: '.5rem',
                  }}>
                    Conheça o Currículo Paideia
                  </div>

                  <p style={{
                    fontSize: '.78rem', color: 'rgba(255,255,255,.7)',
                    lineHeight: 1.6, marginBottom: '.9rem',
                    fontFamily: 'var(--font-inter, sans-serif)',
                  }}>
                    Preencha o formulário de pré-cadastro e nossa equipe comercial entrará em contato com uma proposta personalizada para a sua escola. Não é necessário login.
                  </p>

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

          <div style={{
            background: 'rgba(15,23,42,.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,.08)',
            borderRadius: 20,
            padding: '2.5rem',
            boxShadow: '0 24px 64px rgba(0,0,0,.5)',
          }}>

            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <div style={{
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em',
                textTransform: 'uppercase', color: '#d97706', marginBottom: '.65rem',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                ✦ Acesso Restrito Equipe Interna
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

            <div style={{
              margin: '1.5rem 0',
              borderTop: '1px solid rgba(255,255,255,.07)',
              display: 'flex', alignItems: 'center', gap: '.75rem',
            }}>
              <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.3)', fontFamily: 'var(--font-inter, sans-serif)' }}>
                Este acesso é exclusivo para a equipe interna
              </span>
            </div>

            <a href="/formulario" style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              padding: '.7rem 1rem', borderRadius: 10,
              border: '1px solid rgba(217,119,6,.25)',
              background: 'rgba(217,119,6,.08)',
              color: '#fcd34d', textDecoration: 'none',
              fontSize: '.78rem', fontWeight: 600,
              transition: 'all .2s',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(217,119,6,.15)'; e.currentTarget.style.borderColor = 'rgba(217,119,6,.5)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(217,119,6,.08)'; e.currentTarget.style.borderColor = 'rgba(217,119,6,.25)' }}
            >
              <ClipboardList size={15} style={{ flexShrink: 0 }} />
              <span>Formulário Paideia — Pré-Cadastro →</span>
            </a>
            <a href="/formulario-ingles" style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              marginTop: '.5rem',
              padding: '.7rem 1rem', borderRadius: 10,
              border: '1px solid rgba(2,132,199,.3)',
              background: 'rgba(2,132,199,.1)',
              color: '#38bdf8', textDecoration: 'none',
              fontSize: '.78rem', fontWeight: 600,
              transition: 'all .2s',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(2,132,199,.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(2,132,199,.1)' }}
            >
              <Globe size={15} style={{ flexShrink: 0 }} />
              <span>Formulário Bilinguismo — Parceria de Inglês →</span>
            </a>
            <a href="/" style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              marginTop: '.6rem',
              padding: '.7rem 1rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,.08)',
              background: 'rgba(255,255,255,.03)',
              color: 'rgba(255,255,255,.55)', textDecoration: 'none',
              fontSize: '.75rem', fontWeight: 600,
              transition: 'all .2s',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}
            >
              <ArrowRight size={14} style={{ flexShrink: 0, transform: 'rotate(180deg)' }} />
              <span>Voltar ao Hub Principal</span>
            </a>
          </div>
        </div>
      </section>

      <footer style={{
        background: '#030712',
        borderTop: '1px solid rgba(255,255,255,.06)',
        padding: '3rem 2rem 2rem',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '3rem', marginBottom: '2.5rem' }}>

            <div>
              <Image
                src="/images/logo-education.png"
                alt="Cidade Viva Education"
                width={160} height={44}
                style={{ objectFit: 'contain', objectPosition: 'left', filter: 'brightness(0) invert(1)', opacity: .85, marginBottom: '1rem' }}
              />
              <p style={{
                fontFamily: 'var(--font-cormorant, serif)',
                fontSize: '1rem', fontStyle: 'italic',
                color: 'rgba(255,255,255,.5)', lineHeight: 1.6,
                marginBottom: '1.25rem', maxWidth: 320,
              }}>
                "Conduzir pessoas ao deslumbramento a partir de uma educação cristã de excelência."
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                {[
                  { icon: <Mail size={14} />, label: 'comercial.education@cidadeviva.org', href: 'mailto:comercial.education@cidadeviva.org' },
                  { icon: <Phone size={14} />, label: '(83) 98604-8784', href: 'tel:+5583986048784' },
                  { icon: <MessageCircle size={14} />, label: 'WhatsApp', href: 'https://wa.me/5583986048784' },
                  { icon: <span style={{fontSize:'14px'}}>📷</span>, label: '@cidadeviva.education', href: 'https://instagram.com/cidadeviva.education' },
                ].map(item => (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: '.5rem',
                    color: 'rgba(255,255,255,.45)', fontSize: '.78rem',
                    textDecoration: 'none', transition: 'color .15s',
                    fontFamily: 'var(--font-inter, sans-serif)',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.45)'}
                  >
                    <span style={{ color: '#d97706', flexShrink: 0 }}>{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div style={{
                fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em',
                textTransform: 'uppercase', color: '#d97706', marginBottom: '1rem',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                Módulos da Plataforma
              </div>
              {[
                'Pipeline Kanban',
                'Gestão de Escolas',
                'Registros de Negociação',
                'Dashboard Comercial',
                'Jornada do Parceiro',
                'Contratos e Pedidos',
                'Indicadores em Tempo Real',
                'Relatórios Comerciais',
              ].map(item => (
                <div key={item} style={{
                  color: 'rgba(255,255,255,.35)', fontSize: '.75rem',
                  padding: '.2rem 0', fontFamily: 'var(--font-inter, sans-serif)',
                }}>{item}</div>
              ))}
            </div>

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
                { label: 'Hub de Plataformas', href: '/' },
                { label: 'Gestão de Contratos', href: '/hub/contratos/login' },
                { label: 'Formulário de Pré-Cadastro', href: '/formulario' },
                { label: 'FICV Faculdade', href: 'https://ficv.edu.br/' },
              ].map(item => (
                <a key={item.label} href={item.href} style={{
                  display: 'block', color: 'rgba(255,255,255,.4)', fontSize: '.78rem',
                  padding: '.25rem 0', textDecoration: 'none', transition: 'color .15s',
                  fontFamily: 'var(--font-inter, sans-serif)',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fbbf24'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.4)'}
                >
                  {item.label}
                </a>
              ))}

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

          <div style={{
            borderTop: '1px solid rgba(255,255,255,.05)',
            paddingTop: '1.25rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '.5rem',
          }}>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.2)', fontFamily: 'var(--font-montserrat, sans-serif)', letterSpacing: '.03em' }}>
              © {new Date().getFullYear()} Cidade Viva Education · Plataforma de Gestão Comercial
            </p>
            <p style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.15)', fontFamily: 'var(--font-inter, sans-serif)' }}>
              Plataforma de uso exclusivo da equipe interna
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        input::placeholder { color: rgba(255,255,255,.22) !important; }

        @media (max-width: 768px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
            padding: 5rem 1rem 2rem !important;
            gap: 2rem !important;
          }
          .hero-grid > div:first-child {
            display: none;
          }
        }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  )
}
