'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { getInitials } from '@/lib/utils'
import Image from 'next/image'
import {
  LayoutDashboard, School, Users, FileText, Activity,
  Kanban, Calculator, LogOut, Settings,
  Package, FlaskConical, BarChart2, Download,
  Bot, DollarSign, Table2, Info, FileSignature, ClipboardList
} from 'lucide-react'

interface SidebarProps { profile: Profile | null }

const NAV_MAIN = [
  { href: '/comercial',           label: 'Dashboard',              icon: LayoutDashboard },
  { href: '/comercial/escolas',   label: 'Escolas / Parceiros',    icon: School },
  { href: '/comercial/leads',     label: 'Leads',                  icon: Users },
  { href: '/comercial/registros', label: 'Registros',              icon: FileText },
  { href: '/comercial/jornada',   label: 'Jornada Relacionamento', icon: Activity },
  { href: '/comercial/contratos', label: 'Jornada Contratual',     icon: FileSignature },
  { href: '/comercial/pipeline',  label: 'Pipeline',               icon: Kanban },
  { href: '/comercial/tabela',    label: 'Tabela Geral',           icon: Table2 },
  { href: '/calculadora',         label: 'Calculadora Eskolare',   icon: Calculator },
  { href: '/exports',             label: 'Downloads',              icon: Download },
  { href: '/sobre',               label: 'Sobre',                  icon: Info },
]

const NAV_WIP = [
  { href: '/estoque',    label: 'Estoque',         icon: Package },
  { href: '/amostras',   label: 'Amostras',        icon: FlaskConical },
  { href: '/dashboards', label: 'Dashboards / BI', icon: BarChart2 },
  { href: '/ai-bob',     label: 'BOB — IA',        icon: Bot },
  { href: '/financeiro', label: 'Financeiro',      icon: DollarSign },
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const isActive = (href: string) =>
    href === '/comercial' ? pathname === '/comercial' : pathname.startsWith(href)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isGerente = profile?.role === 'gerente'

  return (
    <aside style={{
      width: 'var(--sidebar-w)', minHeight: '100vh',
      background: '#0f172a',                        /* slate-900 igual recrutamento */
      position: 'fixed', top: 0, left: 0, bottom: 0,
      zIndex: 100, display: 'flex', flexDirection: 'column',
      borderRight: '1px solid rgba(255,255,255,.06)',
    }}>

      {/* ── Brand ──────────────────────────────────────────── */}
      <div style={{
        padding: '1.25rem 1.25rem 1rem',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <Image
          src="/images/logo-education.png"
          alt="Cidade Viva Education"
          width={150}
          height={40}
          style={{ objectFit: 'contain', objectPosition: 'left', filter: 'brightness(0) invert(1)', opacity: .9 }}
        />
        <div style={{
          marginTop: '.65rem',
          fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em',
          textTransform: 'uppercase', color: '#d97706',
          fontFamily: 'var(--font-montserrat, sans-serif)',
        }}>
          ✦ Gestão Comercial
        </div>
      </div>

      {/* ── Nav principal ──────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '.75rem', paddingBottom: '.75rem' }}>

        <div className="nav-section-label">Comercial</div>
        {NAV_MAIN.map(item => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`nav-item ${active ? 'active' : ''}`}>
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '.8rem', lineHeight: 1.2 }}>{item.label}</span>
            </Link>
          )
        })}

        {/* Formulário público */}
        <div style={{ margin: '.5rem 8px 0', borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: '.5rem' }}>
          <a href="/formulario" target="_blank"
            style={{
              display: 'flex', alignItems: 'center', gap: '.75rem',
              padding: '.6rem 1rem', color: 'rgba(255,255,255,.55)',
              fontSize: '.8rem', fontWeight: 500, textDecoration: 'none',
              borderRadius: 6, transition: 'all .15s',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.07)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.55)' }}
          >
            <ClipboardList size={16} style={{ flexShrink: 0 }} />
            <span>Formulário Escola</span>
            <span style={{
              marginLeft: 'auto', fontSize: '.55rem', fontWeight: 700,
              color: '#d97706', background: 'rgba(217,119,6,.15)',
              border: '1px solid rgba(217,119,6,.3)', padding: '.05rem .35rem',
              borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.04em',
            }}>Público</span>
          </a>
        </div>

        {/* Gestão de usuários (só gerente) */}
        {isGerente && (
          <div style={{ margin: '0 8px' }}>
            <Link href="/adminpanel"
              className={`nav-item ${isActive('/adminpanel') ? 'active' : ''}`}>
              <Settings size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '.8rem' }}>Gestão de Usuários</span>
            </Link>
          </div>
        )}

        {/* Em desenvolvimento */}
        <div className="nav-section-label" style={{ marginTop: '1rem' }}>Em Desenvolvimento</div>
        {NAV_WIP.map(item => {
          const Icon = item.icon
          return (
            <div key={item.href} className="nav-item wip">
              <Icon size={16} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '.8rem' }}>{item.label}</span>
              <span className="nav-wip-tag">Em breve</span>
            </div>
          )
        })}
      </nav>

      {/* ── Footer — perfil do usuário ──────────────────────── */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,.06)',
        padding: '1rem 1.25rem',
      }}>
        {profile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            {/* Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '.78rem', fontWeight: 700,
              overflow: 'hidden',
              boxShadow: '0 0 0 2px rgba(217,119,6,.3)',
              fontFamily: 'var(--font-montserrat, sans-serif)',
            }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : getInitials(profile.full_name || profile.email)
              }
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: '#fff', fontSize: '.8rem', fontWeight: 600,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                {profile.full_name || profile.email}
              </div>
              <div style={{
                color: 'rgba(255,255,255,.35)', fontSize: '.65rem',
                textTransform: 'capitalize',
                fontFamily: 'var(--font-montserrat, sans-serif)',
              }}>
                {profile.role}
              </div>
            </div>

            <button onClick={handleLogout} title="Sair" style={{
              color: 'rgba(255,255,255,.3)', background: 'none', border: 'none',
              cursor: 'pointer', padding: '4px', borderRadius: 6,
              transition: 'color .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.3)'}
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div style={{ color: 'rgba(255,255,255,.25)', fontSize: '.72rem' }}>Carregando...</div>
        )}
      </div>
    </aside>
  )
}
