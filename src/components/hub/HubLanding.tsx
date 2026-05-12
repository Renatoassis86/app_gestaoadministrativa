'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'

const MODULES = [
  {
    id: 'comercial',
    label: 'Gestão Comercial',
    tagline: 'CRM completo para parcerias com escolas',
    description:
      'Cadastro de escolas, pipeline Kanban, registros de negociação, contratos, dashboard e indicadores em tempo real.',
    href: '/hub/comercial/login',
    color: '#d97706',
    bg: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v4H3z" /><path d="M3 11h18v10H3z" /><path d="M8 7v14" /><path d="M16 7v14" />
      </svg>
    ),
    features: ['Pipeline Kanban', '+282 escolas', 'Dashboard em tempo real', 'Jornada do parceiro'],
    status: 'ativo',
  },
  {
    id: 'pedidos',
    label: 'Gestão de Pedidos',
    tagline: 'Controle de pedidos e fluxo logístico',
    description:
      'Acompanhe pedidos das escolas parceiras, status de envio, separação de materiais e integração com o time comercial.',
    href: '/hub/pedidos/login',
    color: '#0ea5e9',
    bg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 16h6l-2 4h-4z" /><path d="M2 16h14v4H2z" /><path d="M2 4h14v8H2z" /><circle cx="6" cy="20" r="2" /><circle cx="18" cy="20" r="2" />
      </svg>
    ),
    features: ['Pedidos por escola', 'Tracking logístico', 'Separação e envio', 'Histórico unificado'],
    status: 'em breve',
  },
  {
    id: 'contratos',
    label: 'Gestão de Contratos',
    tagline: 'Plataforma acadêmica e contratual',
    description:
      'Gestão de cursos, alunos, professores, contratos e indicadores acadêmicos da Cidade Viva Education.',
    href: '/hub/contratos/login',
    color: '#16a34a',
    bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" />
      </svg>
    ),
    features: ['Contratos digitais', 'Cursos e turmas', 'Acompanhamento acadêmico', 'Indicadores institucionais'],
    status: 'ativo',
  },
]

export default function HubLanding() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToModulos() {
    document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#0f172a' }}>

      {/* ══════════ TOPBAR ══════════ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(15,23,42,.92)' : 'rgba(15,23,42,.4)',
        backdropFilter: 'blur(14px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,.08)' : '1px solid transparent',
        transition: 'all .3s',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '.85rem 1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image
              src="/images/logo-education.png"
              alt="Cidade Viva Education"
              width={160}
              height={44}
              priority
              style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.95 }}
            />
          </Link>

          {/* Menu de módulos */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }} className="hub-nav">
            {MODULES.map(m => (
              <Link key={m.id} href={m.href}
                style={{
                  padding: '.5rem .95rem', borderRadius: 8,
                  fontSize: '.78rem', fontWeight: 600,
                  color: 'rgba(255,255,255,.85)', textDecoration: 'none',
                  fontFamily: 'var(--font-montserrat,sans-serif)',
                  transition: 'background .15s, color .15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.08)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,.85)'
                }}
              >
                {m.label}
              </Link>
            ))}
            <Link href="/login" style={{
              marginLeft: '.5rem', padding: '.5rem 1.1rem', borderRadius: 9999,
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '.78rem',
              fontFamily: 'var(--font-montserrat,sans-serif)',
              boxShadow: '0 4px 14px rgba(217,119,6,.4)',
            }}>
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* ══════════ HERO COM VÍDEO ══════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {/* Vídeo de fundo */}
        <video
          autoPlay muted loop playsInline
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', zIndex: 0,
          }}
        >
          <source src="/videos/institucional.mp4" type="video/mp4" />
        </video>

        {/* Overlay escuro */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(180deg, rgba(15,23,42,.88) 0%, rgba(15,23,42,.7) 50%, rgba(15,23,42,.95) 100%)',
        }} />

        {/* Conteúdo do hero */}
        <div style={{
          position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto',
          padding: '7rem 1.75rem 4rem', width: '100%',
        }}>
          <div style={{ maxWidth: 780 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.45rem',
              background: 'rgba(217,119,6,.15)', border: '1px solid rgba(217,119,6,.4)',
              borderRadius: 9999, padding: '.4rem 1rem', marginBottom: '1.75rem',
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#d97706' }} />
              <span style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#fbbf24', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Hub Integrado de Plataformas
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-cormorant,serif)',
              fontSize: 'clamp(2.2rem, 5vw, 4rem)',
              fontWeight: 700, color: '#fff', lineHeight: 1.05,
              letterSpacing: '-.02em', marginBottom: '1.5rem',
            }}>
              A excelência da<br />
              <span style={{
                background: 'linear-gradient(135deg, #fbbf24, #d97706)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                Cidade Viva Education
              </span>{' '}em uma plataforma
            </h1>

            <p style={{
              fontFamily: 'var(--font-inter,sans-serif)',
              fontSize: 'clamp(1rem, 1.4vw, 1.2rem)',
              color: 'rgba(255,255,255,.78)', lineHeight: 1.65,
              maxWidth: 640, marginBottom: '2.5rem',
            }}>
              Tudo que sua equipe precisa para gerir parcerias, pedidos e contratos da
              Cidade Viva Education em um único hub seguro, ágil e centralizado.
            </p>

            <div style={{ display: 'flex', gap: '.85rem', flexWrap: 'wrap' }}>
              <button onClick={scrollToModulos} style={{
                padding: '.95rem 2rem', borderRadius: 9999, border: 'none',
                background: 'linear-gradient(135deg, #d97706, #b45309)',
                color: '#fff', fontWeight: 700, fontSize: '.88rem',
                fontFamily: 'var(--font-montserrat,sans-serif)',
                cursor: 'pointer', boxShadow: '0 8px 28px rgba(217,119,6,.45)',
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                letterSpacing: '.02em',
              }}>
                Conhecer os módulos
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>
              </button>
              <Link href="/login" style={{
                padding: '.95rem 2rem', borderRadius: 9999,
                background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,.15)',
                color: '#fff', fontWeight: 700, fontSize: '.88rem',
                fontFamily: 'var(--font-montserrat,sans-serif)',
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
              }}>
                Entrar na plataforma
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
              </Link>
            </div>
          </div>

          {/* Estatísticas no hero */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem', marginTop: '4rem', maxWidth: 720,
          }}>
            {[
              ['+282', 'Escolas parceiras'],
              ['3', 'Módulos integrados'],
              ['Real-time', 'Indicadores'],
              ['100%', 'Centralizado'],
            ].map(([val, sub]) => (
              <div key={val} style={{ borderLeft: '2px solid rgba(217,119,6,.5)', paddingLeft: '.85rem' }}>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.85rem', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-montserrat,sans-serif)', marginTop: '.3rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Indicador de scroll */}
          <div style={{
            position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.4rem',
            color: 'rgba(255,255,255,.4)', fontSize: '.65rem',
            fontFamily: 'var(--font-montserrat,sans-serif)', letterSpacing: '.15em',
            textTransform: 'uppercase', animation: 'bounce 2s infinite',
          }}>
            Role para baixo
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </div>
        </div>
      </section>

      {/* ══════════ SEÇÃO MÓDULOS ══════════ */}
      <section id="modulos" style={{ padding: '6rem 1.75rem', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          {/* Título da seção */}
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '.4rem',
              background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9999,
              padding: '.35rem .9rem', marginBottom: '1.25rem',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706' }} />
              <span style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#b45309', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Plataformas Integradas
              </span>
            </div>
            <h2 style={{
              fontFamily: 'var(--font-cormorant,serif)', fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)',
              fontWeight: 700, color: '#0f172a', lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-.01em',
            }}>
              Três módulos, <span style={{ color: '#d97706' }}>um só ecossistema</span>
            </h2>
            <p style={{
              fontFamily: 'var(--font-inter,sans-serif)', fontSize: '1rem',
              color: '#64748b', lineHeight: 1.7, maxWidth: 640, margin: '0 auto',
            }}>
              Cada módulo foi desenhado para resolver um problema específico da operação,
              mantendo a fluidez de quem precisa transitar entre eles.
            </p>
          </div>

          {/* Grid de módulos */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}>
            {MODULES.map(m => (
              <Link key={m.id} href={m.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                <article style={{
                  position: 'relative', overflow: 'hidden',
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20,
                  padding: '2rem 1.85rem', height: '100%',
                  boxShadow: '0 2px 8px rgba(15,23,42,.04)',
                  transition: 'transform .25s, box-shadow .25s, border-color .25s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(15,23,42,.12)'
                  e.currentTarget.style.borderColor = m.color
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15,23,42,.04)'
                  e.currentTarget.style.borderColor = '#e2e8f0'
                }}
                >
                  {/* Status */}
                  <div style={{ position: 'absolute', top: 16, right: 16 }}>
                    <span style={{
                      fontSize: '.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em',
                      padding: '.18rem .55rem', borderRadius: 99,
                      background: m.status === 'ativo' ? '#f0fdf4' : '#f8fafc',
                      color: m.status === 'ativo' ? '#16a34a' : '#94a3b8',
                      border: `1px solid ${m.status === 'ativo' ? '#86efac' : '#e2e8f0'}`,
                      fontFamily: 'var(--font-montserrat,sans-serif)',
                    }}>
                      {m.status === 'ativo' ? '● Ativo' : 'Em breve'}
                    </span>
                  </div>

                  {/* Ícone */}
                  <div style={{
                    width: 60, height: 60, borderRadius: 14,
                    background: m.bg, color: m.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    {m.icon}
                  </div>

                  {/* Tagline */}
                  <div style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: m.color, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.55rem' }}>
                    {m.tagline}
                  </div>

                  {/* Título */}
                  <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.6rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, marginBottom: '.85rem' }}>
                    {m.label}
                  </h3>

                  {/* Descrição */}
                  <p style={{ fontFamily: 'var(--font-inter,sans-serif)', fontSize: '.88rem', color: '#475569', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                    {m.description}
                  </p>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0', display: 'grid', gap: '.45rem' }}>
                    {m.features.map(f => (
                      <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '.55rem', fontSize: '.78rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={m.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                    fontSize: '.78rem', fontWeight: 700, color: m.color,
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                    paddingTop: '1rem', borderTop: '1px solid #f1f5f9', width: '100%',
                  }}>
                    Acessar módulo
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ SEÇÃO IDENTIDADE ══════════ */}
      <section style={{ padding: '6rem 1.75rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <Image src="/images/logo-education.png" alt="Cidade Viva Education" width={72} height={72} style={{ objectFit: 'contain', margin: '0 auto', filter: 'brightness(0) invert(1)' }} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, marginBottom: '1.25rem' }}>
            Conduzir pessoas ao deslumbramento<br />
            <span style={{ color: '#d97706' }}>a partir de uma educação cristã de excelência</span>
          </h2>
          <p style={{ fontFamily: 'var(--font-inter,sans-serif)', fontSize: '1rem', color: 'rgba(255,255,255,.65)', lineHeight: 1.75, maxWidth: 720, margin: '0 auto' }}>
            Esta plataforma foi construída para servir nossa missão de formar pessoas íntegras, virtuosas e
            preparadas para a Grande Conversa — começando pela equipe que cuida das parcerias com cada escola.
          </p>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ padding: '4rem 1.75rem 2.5rem', background: '#0a0f1c', color: 'rgba(255,255,255,.5)', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.7rem' }}>
              <Image src="/images/logo-education.png" alt="Logo" width={28} height={28} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: .5 }} />
              <div style={{ fontSize: '.75rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                Cidade Viva Education © {new Date().getFullYear()} · Hub de Plataformas Internas
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '.75rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              {MODULES.map(m => (
                <Link key={m.id} href={m.href} style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
                  {m.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Arkos Attribution */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', padding: '1.5rem', background: 'rgba(255,255,255,.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,.04)' }}>
            <svg width="100" height="18" viewBox="0 0 560 100" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.6 }}>
              <line x1="50" y1="10" x2="10" y2="90" stroke="rgba(255,255,255,.6)" strokeWidth="11" strokeLinecap="round"/>
              <line x1="50" y1="10" x2="90" y2="90" stroke="rgba(255,255,255,.6)" strokeWidth="11" strokeLinecap="round"/>
              <line x1="24" y1="58" x2="76" y2="58" stroke="#7FAA10" strokeWidth="8" strokeLinecap="round"/>
              <circle cx="50" cy="10" r="7" fill="#7FAA10"/>
              <line x1="118" y1="22" x2="118" y2="78" stroke="rgba(255,255,255,.1)" strokeWidth="1"/>
              <text x="136" y="63" fontFamily="'DM Mono', 'Courier New', monospace" fontWeight="500" fontSize="42" letterSpacing="14" fill="rgba(255,255,255,.6)">ARKOS</text>
            </svg>
            <span style={{ fontSize: '.85rem', fontFamily: 'var(--font-montserrat,sans-serif)', color: 'rgba(255,255,255,.4)', fontWeight: 500 }}>
              Página criada pela Arkos Intelligence
            </span>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, 8px); }
        }
        @media (max-width: 900px) {
          .hub-nav a:not(:last-child) {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
