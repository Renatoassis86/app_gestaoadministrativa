'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_FICHA } from '@/lib/eskolare-campos'
import { criarFicha, importarPlanilha } from '@/lib/eskolare-actions'

export interface LinhaFicha {
  id: string; escola: string; cnpj: string; responsavel: string | null; status: string; pct: number
  ultimaPor: string | null; atualizado: string
}
export interface OpcaoEscola { id: string; nome: string; cnpj: string | null }

const stInfo = (id: string) => STATUS_FICHA.find(s => s.id === id) ?? STATUS_FICHA[0]
const dt = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const inp: React.CSSProperties = { padding: '.5rem .75rem', border: '1px solid #cbd5e1', borderRadius: 9999, fontSize: '.85rem', background: '#fff' }

export function ListaFichasClient({ linhas, escolas }: { linhas: LinhaFicha[]; escolas: OpcaoEscola[] }) {
  const router = useRouter()
  const [status, setStatus] = useState('todos')
  const [resp, setResp] = useState('todos')
  const [busca, setBusca] = useState('')
  const [novo, setNovo] = useState(false)
  const [escolaId, setEscolaId] = useState('')
  const [buscaEscola, setBuscaEscola] = useState('')
  const [responsavel, setResponsavel] = useState('Raissa')
  const [ciclo, setCiclo] = useState(2027)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [pendente, start] = useTransition()
  const arq = useRef<HTMLInputElement>(null)

  const cont = (s: string) => linhas.filter(l => l.status === s).length
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase(); const qd = q.replace(/\D/g, '')
    return linhas.filter(l => (status === 'todos' || l.status === status) && (resp === 'todos' || l.responsavel === resp)
      && (!q || l.escola.toLowerCase().includes(q) || (qd && l.cnpj.replace(/\D/g, '').includes(qd))))
  }, [linhas, status, resp, busca])
  const escolasFiltradas = useMemo(() => {
    const q = buscaEscola.trim().toLowerCase()
    const jaTem = new Set(linhas.map(l => l.escola))
    return escolas.filter(e => !q || e.nome.toLowerCase().includes(q) || (e.cnpj ?? '').includes(q)).slice(0, 60).map(e => ({ ...e, jaTem: jaTem.has(e.nome) }))
  }, [escolas, buscaEscola, linhas])

  function criar() {
    setErro('')
    start(async () => {
      const r = await criarFicha(escolaId, ciclo, responsavel)
      if (!r.ok) { setErro(r.error ?? 'Erro'); if (r.id) router.push(`/comercial/cadastro-eskolare/${r.id}`); return }
      router.push(`/comercial/cadastro-eskolare/${r.id}`)
    })
  }
  function importar(ev: React.ChangeEvent<HTMLInputElement>) {
    const f = ev.target.files?.[0]; if (!f) return
    setAviso('')
    const fd = new FormData(); fd.set('arquivo', f); fd.set('ciclo', String(ciclo))
    start(async () => {
      const r = await importarPlanilha(fd)
      setAviso(r.ok ? `${r.importadas} ficha(s) importada(s)/atualizada(s).${r.error ? ' Avisos: ' + r.error : ''}` : (r.error ?? 'Erro ao importar.'))
      if (arq.current) arq.current.value = ''
      router.refresh()
    })
  }

  const cards = [
    { r: 'Total de fichas', v: linhas.length, cor: '#0ea5e9' },
    { r: 'Enviadas', v: cont('enviada') + cont('em_preenchimento'), cor: '#f59e0b' },
    { r: 'Respondidas', v: cont('respondida'), cor: '#7c3aed' },
    { r: 'Validadas', v: cont('validada'), cor: '#059669' },
    { r: 'Cadastradas na Eskolare', v: cont('cadastrada'), cor: '#065f46' },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '.8rem', marginBottom: '1.2rem' }}>
        {cards.map(c => (
          <div key={c.r} style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: `4px solid ${c.cor}`, borderRadius: 12, padding: '.8rem 1rem' }}>
            <div style={{ fontSize: '.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', color: '#64748b' }}>{c.r}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800 }}>{c.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por escola ou CNPJ" style={{ ...inp, flex: '1 1 220px' }} />
        <select value={status} onChange={e => setStatus(e.target.value)} style={inp}>
          <option value="todos">Todos os status</option>
          {STATUS_FICHA.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <select value={resp} onChange={e => setResp(e.target.value)} style={inp}>
          <option value="todos">Todos os responsáveis</option><option>Raissa</option><option>Jesse</option>
        </select>
        <button onClick={() => setNovo(true)} style={{ ...inp, background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>+ Nova ficha</button>
        <a href="/comercial/cadastro-eskolare/exportar" style={{ ...inp, textDecoration: 'none', color: '#0369a1', fontWeight: 700 }}>⬇ Exportar Excel</a>
        <label style={{ ...inp, color: '#0369a1', fontWeight: 700, cursor: 'pointer' }}>⬆ Importar planilha
          <input ref={arq} type="file" accept=".xlsx" hidden onChange={importar} />
        </label>
      </div>
      {aviso && <p style={{ fontSize: '.82rem', color: '#0369a1', marginBottom: '.8rem' }}>{aviso}</p>}

      <div style={{ overflowX: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.82rem', minWidth: 760 }}>
          <thead>
            <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#475569' }}>
              {['Escola', 'Responsável', 'Status', '% preenchido', 'Última resposta', 'Atualizada', ''].map(h => <th key={h} style={{ padding: '.65rem .8rem', fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtradas.map(l => {
              const s = stInfo(l.status)
              return (
                <tr key={l.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '.6rem .8rem' }}><strong>{l.escola}</strong><div style={{ color: '#94a3b8', fontSize: '.72rem' }}>{l.cnpj}</div></td>
                  <td style={{ padding: '.6rem .8rem' }}>{l.responsavel ?? '—'}</td>
                  <td style={{ padding: '.6rem .8rem' }}><span style={{ background: s.bg, color: s.cor, borderRadius: 9999, padding: '.15rem .6rem', fontWeight: 700, fontSize: '.72rem', whiteSpace: 'nowrap' }}>{s.label}</span></td>
                  <td style={{ padding: '.6rem .8rem', minWidth: 120 }}>
                    <div style={{ height: 7, background: '#e2e8f0', borderRadius: 9999 }}><div style={{ width: `${l.pct}%`, height: '100%', background: l.pct === 100 ? '#059669' : '#0ea5e9', borderRadius: 9999 }} /></div>
                    <span style={{ fontSize: '.7rem', color: '#64748b' }}>{l.pct}%</span>
                  </td>
                  <td style={{ padding: '.6rem .8rem' }}>{l.ultimaPor === 'escola' ? 'Escola' : l.ultimaPor === 'comercial' ? 'Comercial' : '—'}</td>
                  <td style={{ padding: '.6rem .8rem', whiteSpace: 'nowrap' }}>{dt(l.atualizado)}</td>
                  <td style={{ padding: '.6rem .8rem' }}><Link href={`/comercial/cadastro-eskolare/${l.id}`} style={{ color: '#0ea5e9', fontWeight: 800, textDecoration: 'none' }}>Abrir →</Link></td>
                </tr>
              )
            })}
            {filtradas.length === 0 && <tr><td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>Nenhuma ficha encontrada.</td></tr>}
          </tbody>
        </table>
      </div>

      {novo && (
        <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '1.3rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflow: 'auto' }}>
            <h2 style={{ fontFamily: 'var(--font-cormorant, Georgia, serif)', fontSize: '1.5rem', margin: '0 0 .8rem' }}>Nova ficha de cadastro Eskolare</h2>
            <input value={buscaEscola} onChange={e => setBuscaEscola(e.target.value)} placeholder="Buscar escola do CRM por nome ou CNPJ" style={{ ...inp, width: '100%', borderRadius: 10, marginBottom: '.5rem' }} />
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 10, maxHeight: 220, overflow: 'auto', marginBottom: '.8rem' }}>
              {escolasFiltradas.map(e => (
                <button key={e.id} type="button" disabled={e.jaTem} onClick={() => setEscolaId(e.id)}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '.5rem .7rem', border: 'none', borderBottom: '1px solid #f1f5f9', background: escolaId === e.id ? '#e0f2fe' : '#fff', cursor: e.jaTem ? 'not-allowed' : 'pointer', opacity: e.jaTem ? .5 : 1, fontSize: '.82rem' }}>
                  {e.nome} <span style={{ color: '#94a3b8' }}>{e.cnpj ?? ''}</span>{e.jaTem && ' · já tem ficha'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '.6rem', marginBottom: '.8rem' }}>
              <label style={{ flex: 1, fontSize: '.78rem', fontWeight: 700 }}>Responsável comercial
                <select value={responsavel} onChange={e => setResponsavel(e.target.value)} style={{ ...inp, width: '100%', borderRadius: 10, marginTop: '.2rem' }}><option>Raissa</option><option>Jesse</option></select>
              </label>
              <label style={{ width: 110, fontSize: '.78rem', fontWeight: 700 }}>Ciclo
                <input type="number" value={ciclo} onChange={e => setCiclo(Number(e.target.value))} style={{ ...inp, width: '100%', borderRadius: 10, marginTop: '.2rem' }} />
              </label>
            </div>
            {erro && <p role="alert" style={{ color: '#b91c1c', fontSize: '.82rem' }}>{erro}</p>}
            <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setNovo(false); setErro('') }} style={{ ...inp, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={criar} disabled={!escolaId || pendente} style={{ ...inp, background: !escolaId ? '#94a3b8' : '#f59e0b', color: '#fff', border: 'none', fontWeight: 800, cursor: !escolaId ? 'not-allowed' : 'pointer' }}>{pendente ? 'Criando…' : 'Criar ficha'}</button>
            </div>
            <p style={{ fontSize: '.72rem', color: '#64748b', marginTop: '.7rem' }}>Os dados que já existem no CRM (escola, contrato e previsão de pedidos) entram pré-preenchidos.</p>
          </div>
        </div>
      )}
    </div>
  )
}
