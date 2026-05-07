'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarUsuario, upsertProfile } from '@/lib/actions'

interface Props { roleOptions: { value: string; label: string }[] }

const inp: React.CSSProperties = {
  width: '100%', padding: '.7rem .9rem', fontSize: '.875rem',
  fontFamily: 'var(--font-inter,sans-serif)',
  border: '1.5px solid #e2e8f0', borderRadius: 8,
  background: '#f8fafc', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  display: 'block', fontFamily: 'var(--font-montserrat,sans-serif)',
  fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.06em', color: '#64748b', marginBottom: '.4rem',
}

export function AdminActions({ roleOptions }: Props) {
  const router = useRouter()
  const [tab,     setTab]     = useState<'criar' | 'editar'>('criar')
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const fd = new FormData(e.currentTarget)
    const action = tab === 'criar' ? criarUsuario : upsertProfile
    const result = await action(fd)

    setLoading(false)

    if (result.success) {
      setMsg({ tipo: 'ok', texto: tab === 'criar' ? 'Usuário criado com sucesso! Senha temporária: Senha@2026' : 'Perfil atualizado com sucesso.' })
      ;(e.target as HTMLFormElement).reset()
      router.refresh()
    } else {
      setMsg({ tipo: 'erro', texto: result.error ?? 'Erro desconhecido' })
    }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(15,23,42,.06)' }}>
      {/* Header */}
      <div style={{ background: '#0f172a', padding: '1.1rem 1.5rem' }}>
        <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', color: '#d97706', marginBottom: '.25rem' }}>
          ✦ Gerenciar Usuários
        </div>
        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>
          Equipe Comercial
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #f1f5f9' }}>
        {[
          { id: 'criar',  label: '+ Criar Novo Usuário' },
          { id: 'editar', label: 'Editar Existente' },
        ].map(t => (
          <button key={t.id} type="button"
            onClick={() => { setTab(t.id as 'criar' | 'editar'); setMsg(null) }}
            style={{
              flex: 1, padding: '.75rem 1rem', border: 'none', cursor: 'pointer',
              fontSize: '.78rem', fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              background: tab === t.id ? '#fff' : '#fafafa',
              color: tab === t.id ? '#d97706' : '#64748b',
              borderBottom: `2px solid ${tab === t.id ? '#d97706' : 'transparent'}`,
              marginBottom: -2, transition: 'all .15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

          <div>
            <label style={lbl}>Nome Completo</label>
            <input name="full_name" style={inp} required placeholder="Nome completo do usuário" />
          </div>

          <div>
            <label style={lbl}>E-mail {tab === 'editar' ? '(identifica o usuário)' : ''}</label>
            <input name="email" type="email" style={inp} required placeholder="email@cidadeviva.org" />
          </div>

          {tab === 'criar' && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '.75rem 1rem' }}>
              <div style={{ fontSize: '.72rem', color: '#92400e', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.55 }}>
                <strong>Senha temporária:</strong> <code style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: 4 }}>Senha@2026</code>
                <br />O usuário deve alterar no primeiro acesso.
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={lbl}>Cargo / Perfil</label>
              <select name="role" style={inp} defaultValue="consultor">
                {roleOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select name="is_active" style={inp} defaultValue="true">
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>Telefone</label>
            <input name="phone" placeholder="(00) 00000-0000" style={inp} />
          </div>

          {/* Feedback */}
          {msg && (
            <div style={{
              padding: '.75rem 1rem', borderRadius: 8,
              background: msg.tipo === 'ok' ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${msg.tipo === 'ok' ? '#86efac' : '#fca5a5'}`,
              color: msg.tipo === 'ok' ? '#15803d' : '#dc2626',
              fontSize: '.82rem', fontFamily: 'var(--font-inter,sans-serif)',
              lineHeight: 1.5,
            }}>
              {msg.tipo === 'ok' ? '✓ ' : '⚠ '}{msg.texto}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '.8rem',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #d97706, #b45309)',
            color: '#fff', fontWeight: 700, fontSize: '.875rem',
            border: 'none', borderRadius: 9999, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-montserrat,sans-serif)',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(217,119,6,.3)',
            transition: 'all .2s',
          }}>
            {loading ? 'Processando...' : tab === 'criar' ? 'Criar Usuário' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Nota informativa */}
      <div style={{ margin: '0 1.5rem 1.5rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '.85rem 1rem' }}>
        <div style={{ fontSize: '.72rem', color: '#1e40af', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.55 }}>
          <strong>Criar:</strong> Cria conta no Supabase Auth + perfil no banco. Senha temporária enviada por e-mail.<br />
          <strong>Editar:</strong> Atualiza apenas o perfil (nome, cargo, status, telefone) de um usuário já existente.
        </div>
      </div>
    </div>
  )
}
