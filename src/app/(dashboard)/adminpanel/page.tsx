import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { upsertProfile } from '@/lib/actions'
import { ROLE_OPTIONS } from '@/types/database'

const inp: React.CSSProperties = {
  width: '100%', padding: '.7rem .9rem', fontSize: '.875rem',
  fontFamily: 'var(--font-inter,sans-serif)',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#0f172a', outline: 'none',
  boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat,sans-serif)',
  fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.06em', color: '#64748b', marginBottom: '.4rem',
}

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  gerente:    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  supervisor: { bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  consultor:  { bg: '#dbeafe', text: '#1e3a8a', border: '#93c5fd' },
  assistente: { bg: '#dcfce7', text: '#14532d', border: '#86efac' },
  readonly:   { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default async function AdminpanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const { data: profiles } = await supabase.from('profiles').select('*').order('full_name')

  const isGerente = me?.role === 'gerente'

  const ativos   = profiles?.filter((p: any) => p.is_active)?.length ?? 0
  const inativos = profiles?.filter((p: any) => !p.is_active)?.length ?? 0
  const gerentes  = profiles?.filter((p: any) => p.role === 'gerente')?.length ?? 0

  return (
    <div>
      <PageHeader
        title="Gestão de Usuários"
        subtitle={isGerente ? 'Acesso exclusivo para gerentes' : 'Visualização — edição restrita ao gerente'}
      />

      <div style={{ padding: '2rem 2.5rem' }}>

        {!isGerente ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '.85rem', marginBottom: '1.5rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: '.85rem', color: '#991b1b', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Acesso restrito</div>
              <div style={{ fontSize: '.78rem', color: '#dc2626', fontFamily: 'var(--font-inter,sans-serif)' }}>Somente gerentes podem editar usuários. Você pode visualizar a lista abaixo.</div>
            </div>
          </div>
        ) : null}

        {/* ── KPIs ──────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total de Usuários', value: profiles?.length ?? 0, color: '#d97706', bg: '#fffbeb', border: '#fcd34d' },
            { label: 'Usuários Ativos',   value: ativos,   color: '#16a34a', bg: '#f0fdf4', border: '#86efac' },
            { label: 'Inativos',          value: inativos, color: '#dc2626', bg: '#fef2f2', border: '#fca5a5' },
            { label: 'Gerentes',          value: gerentes, color: '#7c3aed', bg: '#f5f3ff', border: '#c4b5fd' },
          ].map(k => (
            <div key={k.label} style={{
              background: k.bg, border: `1.5px solid ${k.border}`,
              borderTop: `3px solid ${k.color}`,
              borderRadius: 14, padding: '1.1rem 1.25rem',
              boxShadow: '0 1px 4px rgba(15,23,42,.04)',
            }}>
              <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: k.color, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.35rem' }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{k.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isGerente ? '380px 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

          {/* ── Formulário de edição (só gerente) ──────────── */}
          {isGerente && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
              {/* Header */}
              <div style={{ background: '#0f172a', padding: '1.1rem 1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.25rem' }}>
                  ✦ Editar Perfil
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
                  Atualizar usuário existente
                </div>
              </div>

              <form action={upsertProfile} style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div>
                    <label style={lbl}>Nome Completo</label>
                    <input name="full_name" className="form-control" required placeholder="Nome completo do usuário" style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>E-mail (identifica o usuário)</label>
                    <input name="email" type="email" className="form-control" required placeholder="email@cidadeviva.org" style={inp} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={lbl}>Cargo / Perfil</label>
                      <select name="role" style={inp}>
                        {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={lbl}>Status</label>
                      <select name="is_active" style={inp}>
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Telefone</label>
                    <input name="phone" placeholder="(00) 00000-0000" style={inp} />
                  </div>

                  <button type="submit" style={{
                    width: '100%', padding: '.8rem',
                    background: 'linear-gradient(135deg, #d97706, #b45309)',
                    color: '#fff', fontWeight: 700, fontSize: '.875rem',
                    border: 'none', borderRadius: 9999, cursor: 'pointer',
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                    boxShadow: '0 4px 14px rgba(217,119,6,.3)',
                  }}>
                    Salvar Alterações
                  </button>
                </div>
              </form>

              {/* Nota informativa */}
              <div style={{ margin: '0 1.5rem 1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '.85rem 1rem' }}>
                <div style={{ fontSize: '.72rem', color: '#1e40af', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.55 }}>
                  <strong>Para criar novos usuários:</strong> acesse o painel do Supabase → Authentication → Users → Invite User.<br />
                  Aqui você edita perfis de usuários já cadastrados no sistema.
                </div>
              </div>
            </div>
          )}

          {/* ── Lista de Usuários ────────────────────────────── */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.05)' }}>
            {/* Header */}
            <div style={{ background: '#0f172a', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.2rem' }}>
                  Equipe Comercial
                </div>
                <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  {profiles?.length ?? 0} usuários cadastrados
                </div>
              </div>
            </div>

            {/* Cards de usuário */}
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {profiles?.map((p: any) => {
                const roleStyle = ROLE_COLORS[p.role] ?? ROLE_COLORS.readonly
                const initials  = getInitials(p.full_name || p.email)
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1rem 1.25rem',
                    background: p.is_active ? '#fff' : '#fafafa',
                    border: `1px solid ${p.is_active ? '#e2e8f0' : '#f1f5f9'}`,
                    borderLeft: `4px solid ${p.is_active ? (ROLE_COLORS[p.role]?.border ?? '#e2e8f0') : '#f1f5f9'}`,
                    borderRadius: 12,
                    opacity: p.is_active ? 1 : .6,
                    transition: 'box-shadow .15s',
                    boxShadow: '0 1px 3px rgba(15,23,42,.04)',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, #d97706, #b45309)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: '.85rem', fontWeight: 800,
                      fontFamily: 'var(--font-montserrat,sans-serif)',
                      opacity: p.is_active ? 1 : .5,
                    }}>
                      {initials}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.full_name || '(sem nome)'}
                      </div>
                      <div style={{ fontSize: '.72rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.1rem' }}>
                        {p.email}
                        {p.phone && <span style={{ marginLeft: '.5rem', color: '#94a3b8' }}>· {p.phone}</span>}
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{
                        background: roleStyle.bg, color: roleStyle.text, border: `1px solid ${roleStyle.border}`,
                        padding: '.22rem .7rem', borderRadius: 9999,
                        fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em',
                        fontFamily: 'var(--font-montserrat,sans-serif)',
                      }}>
                        {p.role}
                      </span>
                      <span style={{
                        background: p.is_active ? '#f0fdf4' : '#fef2f2',
                        color: p.is_active ? '#16a34a' : '#dc2626',
                        border: `1px solid ${p.is_active ? '#86efac' : '#fca5a5'}`,
                        padding: '.22rem .7rem', borderRadius: 9999,
                        fontSize: '.62rem', fontWeight: 700,
                        fontFamily: 'var(--font-montserrat,sans-serif)',
                      }}>
                        {p.is_active ? '● Ativo' : '○ Inativo'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
