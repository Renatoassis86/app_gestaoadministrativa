'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { getInitials } from '@/lib/utils'
import {
  LayoutDashboard, School, Users, FileText, Activity,
  Kanban, Calculator, LogOut, Settings, ChevronRight,
  FileEdit, Package, FlaskConical, ClipboardList,
  BarChart2, Download, Bot, DollarSign
} from 'lucide-react'

interface SidebarProps { profile: Profile | null }

const NAV_ACTIVE = [
  { href: '/comercial', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/comercial/escolas', label: 'Escolas / Parceiros', icon: School },
  { href: '/comercial/leads', label: 'Leads', icon: Users },
  { href: '/comercial/registros', label: 'Registros', icon: FileText },
  { href: '/comercial/jornada', label: 'Jornadas', icon: Activity },
  { href: '/comercial/pipeline', label: 'Pipeline', icon: Kanban },
  { href: '/calculadora', label: 'Calculadora Eskolare', icon: Calculator },
]

const NAV_WIP = [
  { href: '/contratos', label: 'Contratos', icon: FileEdit },
  { href: '/estoque', label: 'Estoque', icon: Package },
  { href: '/amostras', label: 'Amostras', icon: FlaskConical },
  { href: '/formularios', label: 'Formulários', icon: ClipboardList },
  { href: '/dashboards', label: 'Dashboards / BI', icon: BarChart2 },
  { href: '/exports', label: 'Relatórios', icon: Download },
  { href: '/ai-bob', label: 'BOB — IA', icon: Bot },
  { href: '/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/adminpanel', label: 'Administrativo', icon: Settings },
]

export default function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isActive = (href: string) => {
    if (href === '/comercial') return pathname === '/comercial'
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      id="sidebar"
      style={{ width: 'var(--sidebar-w)', minHeight: '100vh', background: 'var(--brand-blue)' }}
      className="fixed top-0 left-0 bottom-0 z-50 flex flex-col"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-orange)' }}>
          <School size={18} color="#fff" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">CVE Comercial</div>
          <div className="text-white/40 text-xs">Cidade Viva Education</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="nav-section-label">Gestão Comercial</div>
        {NAV_ACTIVE.map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className={`nav-item ${isActive(item.href) ? 'active' : ''}`}>
              <Icon size={17} />
              {item.label}
            </Link>
          )
        })}

        <div className="nav-section-label" style={{ marginTop: '.75rem' }}>Outros Módulos</div>
        {NAV_WIP.map(item => {
          const Icon = item.icon
          return (
            <div key={item.href} className="nav-item wip">
              <Icon size={17} />
              {item.label}
              <span className="nav-wip-tag">Em breve</span>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-6 py-4">
        {profile ? (
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ background: 'var(--brand-orange)' }}
            >
              {profile.avatar_url
                ? <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full rounded-full object-cover" />
                : getInitials(profile.full_name || profile.email)
              }
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm font-semibold truncate">{profile.full_name || profile.email}</div>
              <div className="text-white/40 text-xs capitalize">{profile.role}</div>
            </div>
            <button onClick={handleLogout} title="Sair" className="text-white/40 hover:text-red-400 transition-colors p-1">
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <div className="text-white/40 text-xs">Carregando...</div>
        )}
      </div>
    </aside>
  )
}
