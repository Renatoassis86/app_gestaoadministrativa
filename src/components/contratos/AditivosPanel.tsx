'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { criarAditivo, removerAditivo } from '@/lib/contratos-actions'
import { fmtData } from '@/lib/contratos'

interface Aditivo { id: string; titulo: string; resumo: string | null; data_assinatura: string | null; assinado: boolean; drive_url: string | null }

const inp: React.CSSProperties = { width: '100%', padding: '.45rem .65rem', fontSize: '.82rem', border: '1px solid #cbd5e1', borderRadius: 8 }

export function AditivosPanel({ escolaId, aditivos }: { escolaId: string; aditivos: Aditivo[] }) {
  const router = useRouter()
  const [pendente, start] = useTransition()
  const [erro, setErro] = useState('')

  function criar(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const form = ev.currentTarget
    const fd = new FormData(form)
    start(async () => {
      const r = await criarAditivo(fd)
      if (!r.ok) { setErro(r.error ?? 'Erro'); return }
      setErro(''); form.reset(); router.refresh()
    })
  }
  function remover(id: string) {
    if (!confirm('Remover este termo aditivo?')) return
    start(async () => { const r = await removerAditivo(id); if (!r.ok) setErro(r.error ?? 'Erro'); router.refresh() })
  }

  return (
    <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.1rem 1.2rem', maxWidth: 980, marginTop: '1.5rem' }}>
      <h2 style={{ fontSize: '.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: '#0ea5e9', borderBottom: '2px solid #0ea5e9', paddingBottom: '.35rem', marginBottom: '.9rem' }}>Termos aditivos</h2>
      {erro && <p style={{ color: '#991b1b', fontSize: '.82rem' }}>{erro}</p>}
      {aditivos.length === 0 && <p style={{ fontSize: '.82rem', color: '#64748b' }}>Nenhum aditivo registrado. Alterações de valor ou serviço exigem aditivo por escrito (cláusulas 10.4 e 13.9).</p>}
      <div style={{ display: 'grid', gap: '.5rem', marginBottom: '1rem' }}>
        {aditivos.map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', border: '1px solid #e2e8f0', borderRadius: 10, padding: '.55rem .8rem', fontSize: '.82rem' }}>
            <div>
              <strong>{a.titulo}</strong> <span style={{ color: a.assinado ? '#047857' : '#b45309', fontWeight: 700 }}>· {a.assinado ? `assinado ${fmtData(a.data_assinatura)}` : 'pendente'}</span>
              {a.resumo && <div style={{ color: '#475569' }}>{a.resumo}</div>}
              {a.drive_url && <a href={a.drive_url} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', fontWeight: 700 }}>Abrir documento</a>}
            </div>
            <button onClick={() => remover(a.id)} disabled={pendente} style={{ border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer', fontWeight: 700 }}>Remover</button>
          </div>
        ))}
      </div>
      <form onSubmit={criar} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '.6rem', alignItems: 'end' }}>
        <input type="hidden" name="escola_id" value={escolaId} />
        <div><label style={{ fontSize: '.74rem', fontWeight: 600 }}>Título *</label><input name="titulo" required style={inp} placeholder="Ex.: 1º Termo Aditivo — ajuste de quantidades" /></div>
        <div><label style={{ fontSize: '.74rem', fontWeight: 600 }}>Data de assinatura</label><input name="data_assinatura" type="date" style={inp} /></div>
        <div><label style={{ fontSize: '.74rem', fontWeight: 600 }}>Link (Drive)</label><input name="drive_url" style={inp} placeholder="https://" /></div>
        <div style={{ gridColumn: '1 / -1' }}><label style={{ fontSize: '.74rem', fontWeight: 600 }}>Resumo</label><input name="resumo" style={inp} /></div>
        <label style={{ fontSize: '.8rem', display: 'flex', gap: '.4rem', alignItems: 'center' }}><input type="checkbox" name="assinado" /> Já assinado</label>
        <button type="submit" disabled={pendente} style={{ padding: '.5rem 1rem', borderRadius: 9999, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Adicionar aditivo</button>
      </form>
    </section>
  )
}
