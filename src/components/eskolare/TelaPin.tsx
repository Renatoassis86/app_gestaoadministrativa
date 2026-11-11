'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { entrarComPin } from '@/lib/eskolare-publico'

export function TelaPin({ token, escolaNome }: { token: string; escolaNome: string }) {
  const router = useRouter()
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState('')
  const [pendente, start] = useTransition()

  function entrar(ev: React.FormEvent) {
    ev.preventDefault()
    setErro('')
    start(async () => {
      const r = await entrarComPin(token, pin)
      if (!r.ok) { setErro(r.error ?? 'Não foi possível entrar.'); setPin(''); return }
      router.refresh()
    })
  }

  return (
    <form onSubmit={entrar}>
      <p style={{ fontSize: '.78rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#0369a1', margin: 0 }}>Cadastro da loja 2027</p>
      <h1 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.9rem', lineHeight: 1.15, margin: '.35rem 0 .7rem', color: '#0f172a' }}>{escolaNome}</h1>
      <p style={{ fontSize: '.95rem', color: '#475569', lineHeight: 1.55, margin: '0 0 1.2rem' }}>
        Para montar a loja da sua escola na Eskolare, precisamos confirmar alguns dados. Digite o PIN de 6 dígitos que enviamos junto com este link.
      </p>
      <label htmlFor="pin" style={{ display: 'block', fontSize: '.8rem', fontWeight: 700, color: '#334155', marginBottom: '.35rem' }}>PIN de acesso</label>
      <input id="pin" value={pin} onChange={ev => setPin(ev.target.value.replace(/\D/g, '').slice(0, 6))}
        inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="••••••" autoFocus
        style={{ width: '100%', fontSize: '1.7rem', letterSpacing: '.5em', textAlign: 'center', padding: '.7rem', border: '2px solid #cbd5e1', borderRadius: 12, outline: 'none' }} />
      {erro && <p role="alert" style={{ color: '#b91c1c', fontSize: '.88rem', margin: '.7rem 0 0' }}>{erro}</p>}
      <button type="submit" disabled={pin.length !== 6 || pendente}
        style={{ width: '100%', marginTop: '1rem', padding: '.9rem', border: 'none', borderRadius: 9999, background: pin.length === 6 ? '#0ea5e9' : '#94a3b8', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: pin.length === 6 && !pendente ? 'pointer' : 'not-allowed' }}>
        {pendente ? 'Verificando…' : 'Entrar'}
      </button>
      <p style={{ fontSize: '.72rem', color: '#64748b', lineHeight: 1.5, marginTop: '1.1rem' }}>
        🔒 Seus dados são usados apenas para criar a loja da escola na Eskolare e para o treinamento, conforme a LGPD.
      </p>
    </form>
  )
}
