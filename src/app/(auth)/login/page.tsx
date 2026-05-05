'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { School, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

    router.push('/comercial')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--brand-blue)' }}
    >
      <div className="w-full max-w-md">
        <div className="card" style={{ borderRadius: 16, overflow: 'hidden' }}>
          {/* Header */}
          <div className="p-8 pb-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'var(--brand-orange)' }}
            >
              <School size={30} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-blue)' }}>
              CVE Gestão Comercial
            </h1>
            <p style={{ fontSize: '.82rem', color: 'var(--text-s)', marginTop: '.2rem' }}>
              Cidade Viva Education — Plataforma Comercial
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="form-label">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-s)' }} />
                  <input
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-s)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-s)' }}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full justify-center"
                style={{ marginTop: '1rem', padding: '.75rem 1rem', fontSize: '.95rem' }}
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="text-center text-xs mt-4" style={{ color: 'var(--text-s)' }}>
              Primeira vez?{' '}
              <a href="/signup" style={{ color: 'var(--brand-orange)', fontWeight: 600 }}>Criar conta</a>
            </p>
            <p className="text-center text-xs mt-2" style={{ color: 'var(--text-s)' }}>
              Cidade Viva Education © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
