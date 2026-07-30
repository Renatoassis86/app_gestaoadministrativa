'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { getInitials } from '@/lib/utils'
import Image from 'next/image'
import { LayoutDashboard, BarChart2, LogOut, ArrowLeft } from 'lucide-react'

interface MarketingSidebarProps { profile: Profile | null }

function NavItem({ href, label, icon: Icon, active }: {
  href: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  active: boolean
}) {
  const baseStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '.6rem',
    padding: '.5rem .9rem', margin: '1px 6px',
    color: active ? '#ffffff' : 'rgba(255,255,255,.6)',
    fontSize: '.8rem', fontWeight: active ? 600 : 500,
    borderRadius: 7, textDecoration: 'none', transition: 'all .15s',
    fontFamily: 'var(--font-montserrat, sans-serif)',
    letterSpacing: '.005em',
    background: active
      ? 'linear-gradient(135deg, rgba(168,85,247,.9), rgba(126,34,206,.85))'
      : 'transparent',
    boxShadow: active ? '0 2px 10px rgba(168,85,247,.3)' : 'none',
  }
  return (
    <Link href={href} style={baseStyle}
      onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = 'rgba(255,255,255,.9)' } }}
      onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.6)' } }}
    >
      <span style={{
        width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 6, flexShrink: 0,
        background: active ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.04)',
      }}>
        <Icon size={14} />
      </span>
      <span style={{ flex: 1, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </span>
    </Link>
  )
}

export default function MarketingSidebar({ profile }: MarketingSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    (window as any).__toggleSidebar = () => setMobileOpen(p => !p)
    return () => { delete (window as any).__toggleSidebar }
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')
  const isGerente = profile?.role === 'gerente'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="mobile-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 99, backdropFilter: 'blur(2px)' }}
        />
      )}

      <aside
        id="main-sidebar"
        className={mobileOpen ? 'mobile-open' : ''}
        style={{
          width: 'var(--sidebar-w)', minHeight: '100vh',
          background: 'linear-gradient(180deg, #1e1033 0%, #17091f 100%)',
          position: 'fixed', top: 0, left: 0, bottom: 0,
          zIndex: 100, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid rgba(255,255,255,.05)',
          transition: 'transform .28s cubic-bezier(.4,0,.2,1)',
        }}>

        <button
          onClick={() => setMobileOpen(false)}
          className="mobile-close-btn"
          aria-label="Fechar menu"
          style={{
            position: 'absolute', top: '1rem', right: '-3rem',
            width: 40, height: 40, borderRadius: '50%',
            background: '#1e1033', border: '1px solid rgba(255,255,255,.2)',
            color: '#fff', cursor: 'pointer',
            alignItems: 'center', justifyContent: 'center', zIndex: 101,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        {/* Brand */}
        <Link href="/marketing" style={{ display: 'block', padding: '1.1rem 1.1rem .9rem', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
          <Image
            src="/images/logo-education.png"
            alt="Cidade Viva Education"
            width={144} height={36}
            style={{ objectFit: 'contain', objectPosition: 'left', filter: 'brightness(0) invert(1)', opacity: .88 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginTop: '.55rem' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#a855f7', flexShrink: 0 }} />
            <span style={{
              fontSize: '.6rem', fontWeight: 700, letterSpacing: '.1em',
              textTransform: 'uppercase', color: 'rgba(192,132,252,.9)',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}>
              Gestão de Marketing
            </span>
          </div>
        </Link>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '.5rem 0 1rem' }}>
          <NavItem href="/marketing" label="Visão Geral" icon={LayoutDashboard} active={pathname === '/marketing'} />
          {isGerente && (
            <NavItem href="/marketing/respostas" label="Respostas dos Briefings" icon={BarChart2} active={isActive('/marketing/respostas')} />
          )}
          <div style={{ height: '1px', background: 'rgba(255,255,255,.05)', margin: '.4rem .75rem' }} />
          <NavItem href="/" label="Voltar ao Hub" icon={ArrowLeft} active={false} />
        </nav>

        {/* Footer */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,.05)', padding: '.9rem 1rem', background: 'rgba(0,0,0,.2)' }}>
          {profile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '.72rem', fontWeight: 700,
                overflow: 'hidden', boxShadow: '0 0 0 2px rgba(168,85,247,.25)',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : getInitials(profile.full_name || profile.email)
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  color: 'rgba(255,255,255,.9)', fontSize: '.78rem', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-montserrat, sans-serif)',
                }}>
                  {profile.full_name?.split(' ').slice(0, 2).join(' ') || profile.email}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,.3)', fontSize: '.62rem', textTransform: 'capitalize',
                  fontFamily: 'var(--font-montserrat, sans-serif)',
                  display: 'flex', alignItems: 'center', gap: '.3rem',
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  {profile.role}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sair"
                style={{
                  color: 'rgba(255,255,255,.25)', background: 'rgba(255,255,255,.05)',
                  border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer',
                  padding: '5px', borderRadius: 7, transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#dc2626'
                  e.currentTarget.style.background = 'rgba(220,38,38,.12)'
                  e.currentTarget.style.borderColor = 'rgba(220,38,38,.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(255,255,255,.25)'
                  e.currentTarget.style.background = 'rgba(255,255,255,.05)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'
                }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: 'rgba(255,255,255,.07)', borderRadius: 4, marginBottom: 5, width: '70%' }} />
                <div style={{ height: 6, background: 'rgba(255,255,255,.04)', borderRadius: 4, width: '40%' }} />
              </div>
            </div>
          )}
        </div>
      </aside>

      <style>{`
        .mobile-close-btn {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
        }
        @media (max-width: 768px) {
          #main-sidebar {
            transform: translateX(-100%);
          }
          #main-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .mobile-close-btn {
            display: flex !important;
            visibility: visible !important;
            pointer-events: auto !important;
          }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </>
  )
}
