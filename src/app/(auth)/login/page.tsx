'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, BookOpen } from 'lucide-react'
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
      setError('E-mail ou senha inválidos. Verifique suas credenciais.')
      setLoading(false)
      return
    }
    router.push('/comercial')
    router.refresh()
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: 'var(--font-inter, var(--font-montserrat), system-ui, sans-serif)',
    }}>

      {/* ══════════════════════════════════════════════════════
          PAINEL ESQUERDO — Formulário de Login
          Padrão visual: fundo slate-900 escuro como recrutamento
          ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: '0 0 460px',
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2.5rem',
        position: 'relative',
        zIndex: 2,
      }}>

        {/* Logo topo */}
        <div>
          <Image
            src="/images/logo-education.png"
            alt="Cidade Viva Education"
            width={200}
            height={54}
            style={{ objectFit: 'contain', objectPosition: 'left', filter: 'brightness(0) invert(1)' }}
            priority
          />
        </div>

        {/* Formulário central */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '2rem', paddingBottom: '2rem' }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            background: 'rgba(15,23,42,.8)', border: '1px solid rgba(217,119,6,.3)',
            backdropFilter: 'blur(4px)', borderRadius: 9999,
            padding: '.3rem .85rem', marginBottom: '1.5rem', width: 'fit-content',
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em',
            textTransform: 'uppercase', color: '#f59e0b',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}>
            ✦ Plataforma Comercial
          </div>

          {/* Título estilo Cormorant como recrutamento */}
          <h1 style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(2rem, 3vw, 2.6rem)',
            fontWeight: 700, lineHeight: 1.15, color: '#fff',
            marginBottom: '.6rem',
            textShadow: '0 2px 12px rgba(0,0,0,.4)',
          }}>
            Bem-vindo à<br />
            <span style={{ color: '#f59e0b' }}>Gestão Comercial</span>
          </h1>

          <p style={{
            fontSize: '.875rem', color: 'rgba(255,255,255,.6)',
            lineHeight: 1.6, marginBottom: '2rem', maxWidth: 340,
            fontFamily: 'var(--font-inter, sans-serif)',
          }}>
            Acesse sua conta para gerenciar escolas, registrar negociações e acompanhar a jornada comercial.
          </p>

          {/* Alerta de erro */}
          {error && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '.5rem',
              padding: '.75rem 1rem', borderRadius: 8, marginBottom: '1rem',
              background: 'rgba(220,38,38,.15)', border: '1px solid rgba(220,38,38,.3)',
              color: '#fca5a5', fontSize: '.82rem',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              ⚠ {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* E-mail */}
            <div>
              <label style={{
                display: 'block', fontSize: '.72rem', fontWeight: 700,
                color: 'rgba(255,255,255,.5)', marginBottom: '.4rem',
                textTransform: 'uppercase', letterSpacing: '.08em',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>E-mail</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                required autoFocus placeholder="seu@email.com"
                style={{
                  width: '100%', padding: '.75rem 1rem',
                  fontSize: '.875rem',
                  background: 'rgba(255,255,255,.06)',
                  border: '1.5px solid rgba(255,255,255,.12)',
                  borderRadius: 8, outline: 'none',
                  color: '#fff', transition: 'border-color .15s, box-shadow .15s',
                  fontFamily: 'var(--font-inter, sans-serif)',
                }}
                onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.15)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Senha */}
            <div>
              <label style={{
                display: 'block', fontSize: '.72rem', fontWeight: 700,
                color: 'rgba(255,255,255,.5)', marginBottom: '.4rem',
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
                    fontSize: '.875rem',
                    background: 'rgba(255,255,255,.06)',
                    border: '1.5px solid rgba(255,255,255,.12)',
                    borderRadius: 8, outline: 'none',
                    color: '#fff', transition: 'border-color .15s, box-shadow .15s',
                    fontFamily: 'var(--font-inter, sans-serif)',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#f59e0b'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,.12)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '.85rem', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,.4)', padding: 0,
                  }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Botão primário — estilo recrutamento */}
            <button type="submit" disabled={loading}
              style={{
                marginTop: '.5rem', width: '100%', padding: '.85rem',
                background: loading ? 'rgba(217,119,6,.4)' : '#d97706',
                color: '#fff', fontWeight: 700, fontSize: '.9rem',
                border: '1px solid rgba(217,119,6,.5)',
                borderRadius: 9999, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all .2s', letterSpacing: '.01em',
                boxShadow: '0 4px 14px rgba(217,119,6,.35)',
                fontFamily: 'var(--font-montserrat, sans-serif)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget).style.background = '#b45309'; (e.currentTarget).style.transform = 'translateY(-1px)' } }}
              onMouseLeave={e => { if (!loading) { (e.currentTarget).style.background = '#d97706'; (e.currentTarget).style.transform = 'translateY(0)' } }}
            >
              {loading ? 'Entrando...' : <>Entrar na Plataforma <ArrowRight size={16} /></>}
            </button>

          </form>

          {/* Acesso público — formulário escola */}
          <div style={{
            marginTop: '1.75rem', paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255,255,255,.08)',
          }}>
            <p style={{ fontSize: '.75rem', color: 'rgba(255,255,255,.4)', marginBottom: '.5rem', fontFamily: 'var(--font-inter, sans-serif)' }}>
              É uma escola parceira?
            </p>
            <a href="/formulario" style={{
              display: 'inline-flex', alignItems: 'center', gap: '.35rem',
              fontSize: '.8rem', fontWeight: 600, color: '#f59e0b',
              textDecoration: 'none', transition: 'opacity .15s',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <BookOpen size={14} />
              Preencher Formulário de Pré-Cadastro →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: '1rem' }}>
          <p style={{
            fontSize: '.7rem', color: 'rgba(255,255,255,.25)',
            fontFamily: 'var(--font-montserrat, sans-serif)', letterSpacing: '.03em',
          }}>
            Cidade Viva Education © {new Date().getFullYear()} · Central de Inteligência Analítica
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          PAINEL DIREITO — Hero Image + conteúdo da marca
          Igual ao estilo do recrutamento: imagem + overlay escuro
          ══════════════════════════════════════════════════════ */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0f172a', minHeight: '100vh' }}>

        {/* Imagem de fundo — aperto de mão / parceria comercial */}
        <Image
          src="/images/img2.png"
          alt="Parceria Comercial Cidade Viva Education"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
          priority
        />

        {/* Overlay gradiente estilo recrutamento */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(15,23,42,.9) 0%, rgba(15,23,42,.5) 50%, rgba(15,23,42,.8) 100%)',
        }} />

        {/* Grid de imagens dos livros Paideia — decoração lateral */}
        <div style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem',
          opacity: .75,
        }}>
          {['/images/paideia-2.png', '/images/paideia-3.png'].map((src, i) => (
            <div key={i} style={{
              width: 80, height: 100, borderRadius: 6, overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,.4)',
              transition: 'transform .3s',
            }}>
              <Image src={src} alt="Paideia" fill style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {/* Conteúdo principal sobre a imagem */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: '3rem',
        }}>

          {/* Badge flutuante */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
            background: 'rgba(217,119,6,.9)', color: '#fff',
            padding: '.4rem .9rem', borderRadius: 9999,
            fontSize: '.68rem', fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase', width: 'fit-content', marginBottom: '1.25rem',
            boxShadow: '0 4px 14px rgba(217,119,6,.4)',
            fontFamily: 'var(--font-montserrat, sans-serif)',
          }}>
            ✦ Gestão Inteligente
          </div>

          {/* Título hero estilo Cormorant */}
          <h2 style={{
            fontFamily: 'var(--font-cormorant, serif)',
            fontSize: 'clamp(1.75rem, 3vw, 2.75rem)',
            fontWeight: 700, color: '#fff', lineHeight: 1.15,
            marginBottom: '.75rem',
            textShadow: '0 2px 16px rgba(0,0,0,.5)',
          }}>
            Transformando relações<br />
            <span style={{ color: '#f59e0b' }}>em parcerias duradouras</span>
          </h2>

          <p style={{
            fontSize: '.9rem', color: 'rgba(255,255,255,.7)',
            lineHeight: 1.65, marginBottom: '2.25rem', maxWidth: 420,
            fontFamily: 'var(--font-inter, sans-serif)',
          }}>
            Plataforma completa para gerenciar o ciclo comercial das escolas parceiras, do primeiro contato até o fechamento e acompanhamento do contrato.
          </p>

          {/* Stats — igual ao recrutamento */}
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            {[
              ['11', 'módulos integrados'],
              ['360°', 'visão do parceiro'],
              ['Real-time', 'analytics e KPIs'],
            ].map(([val, sub]) => (
              <div key={val}>
                <div style={{
                  fontFamily: 'var(--font-cormorant, serif)',
                  fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1,
                }}>{val}</div>
                <div style={{ fontSize: '.7rem', color: 'rgba(255,255,255,.5)', marginTop: '.2rem', fontFamily: 'var(--font-montserrat, sans-serif)' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Livros banner — linha de imagens dos materiais didáticos */}
          <div style={{
            display: 'flex', gap: '.75rem', overflow: 'hidden',
            marginBottom: '2rem',
          }}>
            {[1, 2, 3, 4, 5].map(n => (
              <div key={n} style={{
                width: 52, height: 68, borderRadius: 6, overflow: 'hidden',
                flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,.4)',
                transform: `rotate(${n % 2 === 0 ? -1.5 : 1.5}deg)`,
                transition: 'transform .3s',
              }}>
                <Image
                  src={n === 1 ? '/images/paideia-1-ano.png' : `/images/paideia-${n}.png`}
                  alt={`Paideia ${n}`}
                  width={52} height={68}
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
            ))}
          </div>

          {/* Divider + Logo */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,.12)', paddingTop: '1.5rem' }}>
            <Image
              src="/images/logo-education.png"
              alt="Cidade Viva Education"
              width={160}
              height={44}
              style={{ objectFit: 'contain', objectPosition: 'left', filter: 'brightness(0) invert(1)', opacity: .85 }}
            />
          </div>
        </div>
      </div>

      {/* Responsivo: ocultar painel direito em mobile */}
      <style>{`
        @media (max-width: 900px) {
          div[style*="flex: 0 0 460px"] { flex: 1 !important; }
          div[style*="flex: 1"][style*="minHeight: 100vh"] { display: none !important; }
        }
        input::placeholder { color: rgba(255,255,255,.25); }
      `}</style>
    </div>
  )
}
