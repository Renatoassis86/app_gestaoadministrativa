'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STATUS_FICHA } from '@/lib/eskolare-campos'
import { Pencil, Trash2 } from 'lucide-react'
import { criarFicha, excluirFicha, importarPlanilha, previaPrefill } from '@/lib/eskolare-actions'

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
  const [avisoErro, setAvisoErro] = useState(false)
  const [pendente, start] = useTransition()
  const arq = useRef<HTMLInputElement>(null)
  const [previa, setPrevia] = useState<{ itens: Array<{ chave: string; rotulo: string; valor: string; fonte: string }>; faltam: string[] } | null>(null)
  const [carregandoPrevia, setCarregandoPrevia] = useState(false)

  // Ao escolher a escola, mostra o que a plataforma já sabe dela e de onde veio cada dado.
  useEffect(() => {
    if (!escolaId) { setPrevia(null); return }
    let ativo = true
    setCarregandoPrevia(true)
    previaPrefill(escolaId, ciclo).then(r => { if (ativo) { setPrevia(r.ok ? { itens: r.itens ?? [], faltam: r.faltam ?? [] } : null); setCarregandoPrevia(false) } })
    return () => { ativo = false }
  }, [escolaId, ciclo])
  const porFonte = useMemo(() => {
    const m = new Map<string, number>()
    for (const i of previa?.itens ?? []) m.set(i.fonte, (m.get(i.fonte) ?? 0) + 1)
    return [...m.entries()]
  }, [previa])

  const cont = (s: string) => linhas.filter(l => l.status === s).length
  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase(); const qd = q.replace(/\D/g, '')
    return linhas.filter(l => (status === 'todos' || l.status === status) && (resp === 'todos' || l.responsavel === resp)
      && (!q || l.escola.toLowerCase().includes(q) || (qd && l.cnpj.replace(/\D/g, '').includes(qd))))
  }, [linhas, status, resp, busca])
  const escolasFiltradas = useMemo(() => {
    const q = buscaEscola.trim().toLowerCase()
    const jaTem = new Set(linhas.map(l => l.escola))
    const qd = q.replace(/\D/g, '')
    const vistos = new Set<string>()
    const lista = escolas
      .filter(e => !q || e.nome.toLowerCase().includes(q) || (qd && (e.cnpj ?? '').replace(/\D/g, '').includes(qd)))
      .sort((a, b) => Number(!!(b.cnpj ?? '').replace(/\D/g, '')) - Number(!!(a.cnpj ?? '').replace(/\D/g, '')))
      .filter(e => { const c = (e.cnpj ?? '').replace(/\D/g, ''); if (!c) return true; if (vistos.has(c)) return false; vistos.add(c); return true })
    return lista.slice(0, 60).map(e => ({ ...e, jaTem: jaTem.has(e.nome) }))
  }, [escolas, buscaEscola, linhas])

  function criar() {
    setErro('')
    start(async () => {
      const r = await criarFicha(escolaId, ciclo, responsavel)
      if (!r.ok) { setErro(r.error ?? 'Erro'); if (r.id) router.push(`/comercial/cadastro-eskolare/${r.id}`); return }
      router.push(`/comercial/cadastro-eskolare/${r.id}`)
    })
  }
  function excluir(l: LinhaFicha) {
    const aviso = ['respondida', 'validada', 'cadastrada'].includes(l.status) ? ' ATENÇÃO: esta ficha já foi respondida pela escola e as respostas serão perdidas.' : ''
    if (!confirm('Excluir a ficha de "' + l.escola + '"?' + aviso + ' O link e o PIN deixam de funcionar. Esta ação não pode ser desfeita.')) return
    setAviso(''); setAvisoErro(false)
    start(async () => {
      const r = await excluirFicha(l.id)
      setAvisoErro(!r.ok)
      setAviso(r.ok ? `Ficha de "${l.escola}" excluída.` : (r.error ?? 'Não foi possível excluir.'))
      router.refresh()
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
        <button onClick={() => setNovo(true)} style={{ ...inp, background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>+ Nova ficha (escolher escola)</button>
        <a href="/comercial/cadastro-eskolare/exportar" style={{ ...inp, textDecoration: 'none', color: '#0369a1', fontWeight: 700 }}>⬇ Exportar Excel</a>
        <label style={{ ...inp, color: '#0369a1', fontWeight: 700, cursor: 'pointer' }}>⬆ Importar planilha
          <input ref={arq} type="file" accept=".xlsx" hidden onChange={importar} />
        </label>
      </div>
      {aviso && <p role={avisoErro ? 'alert' : 'status'} style={{ fontSize: '.85rem', fontWeight: 700, color: avisoErro ? '#b91c1c' : '#0369a1', background: avisoErro ? '#fef2f2' : '#f0f9ff', border: `1px solid ${avisoErro ? '#fecaca' : '#bae6fd'}`, borderRadius: 10, padding: '.5rem .8rem', marginBottom: '.8rem' }}>{aviso}</p>}

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
                  <td style={{ padding: '.6rem .8rem', whiteSpace: 'nowrap' }}>
                    <Link href={`/comercial/cadastro-eskolare/${l.id}`} title="Editar / abrir ficha" aria-label={`Editar a ficha de ${l.escola}`}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9999, color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', marginRight: '.4rem' }}>
                      <Pencil size={16} />
                    </Link>
                    <button type="button" onClick={() => excluir(l)} disabled={pendente} title="Excluir ficha" aria-label={`Excluir a ficha de ${l.escola}`}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 9999, color: '#b91c1c', background: '#fef2f2', border: '1px solid #fecaca', cursor: pendente ? 'wait' : 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                  </td>
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
                  {e.nome} <span style={{ color: (e.cnpj ?? '').trim() ? '#94a3b8' : '#d97706' }}>{(e.cnpj ?? '').trim() || 'sem CNPJ'}</span>{e.jaTem && ' · já tem ficha'}
                </button>
              ))}
            </div>
            {escolaId && (
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: '.7rem .8rem', marginBottom: '.8rem', fontSize: '.8rem' }}>
                {carregandoPrevia ? 'Buscando dados da escola na plataforma…' : previa ? (
                  <>
                    <strong>{previa.itens.length} campo(s) já preenchidos</strong> com dados da plataforma
                    {porFonte.length > 0 && <span style={{ color: '#475569' }}> — {porFonte.map(([f, n]) => `${f}: ${n}`).join(' · ')}</span>}
                    <details style={{ marginTop: '.4rem' }}>
                      <summary style={{ cursor: 'pointer', color: '#0369a1', fontWeight: 700 }}>Ver o que foi encontrado</summary>
                      <div style={{ maxHeight: 160, overflow: 'auto', marginTop: '.4rem' }}>
                        {previa.itens.map(i => <div key={i.chave} style={{ display: 'flex', justifyContent: 'space-between', gap: '.6rem', padding: '.15rem 0', borderBottom: '1px dashed #dbeafe' }}><span>{i.rotulo}: <strong>{i.valor}</strong></span><span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{i.fonte}</span></div>)}
                      </div>
                    </details>
                    {previa.faltam.length > 0 && <div style={{ color: '#92400e', marginTop: '.5rem' }}><strong>A escola ainda vai informar:</strong> {previa.faltam.join(' · ')}</div>}
                  </>
                ) : 'Não foi possível buscar os dados.'}
              </div>
            )}
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
            <p style={{ fontSize: '.72rem', color: '#64748b', marginTop: '.7rem' }}>Entram pré-preenchidos os dados que já existem na plataforma: cadastro da escola, contatos, contrato, formulários e previsão de pedidos.</p>
          </div>
        </div>
      )}
    </div>
  )
}
