'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArquivosEscola, type ArquivoContrato } from '@/components/contratos/ArquivosEscola'
import { adicionarReajuste, removerReajuste, salvarCampoReajuste, vincularEscolaReajuste } from '@/lib/contratos-reajustes'
import { adicionarBilingue, removerBilingue, renomearBilingue, vincularBilingue } from '@/lib/contratos-bilinguismo'

type Linha = 'paideia' | 'bilinguismo'

export interface Parceira {
  id: string; nome: string; categoria: string | null; modelo: string | null; kits: number
  escolaId: string | null; arquivos: ArquivoContrato[]
}
export interface OpcaoEscola { id: string; nome: string; cidade: string | null }

function Vinculo({ p, opcoes, linha }: { p: Parceira; opcoes: OpcaoEscola[]; linha: Linha }) {
  const router = useRouter()
  const [pend, start] = useTransition()
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const lista = opcoes.filter(o => !busca || o.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 60)
  return (
    <div style={{ display: 'grid', gap: '.45rem', minWidth: 0 }}>
      <span style={{ fontSize: '.76rem', color: '#b45309', fontWeight: 700 }}>Vincule ao cadastro da escola para anexar contratos</span>
      <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar no cadastro…" style={{ boxSizing: 'border-box', width: '100%', minWidth: 0, padding: '.45rem .6rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.78rem', background: '#fff' }} />
      <select disabled={pend} defaultValue="" onChange={e => start(async () => { const r = await (linha === 'bilinguismo' ? vincularBilingue : vincularEscolaReajuste)(p.id, e.target.value); if (!r.ok) setErro(r.error ?? 'Erro'); router.refresh() })}
        style={{ boxSizing: 'border-box', width: '100%', minWidth: 0, padding: '.45rem .6rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.78rem', background: '#fff' }}>
        <option value="">Selecione a escola…</option>
        {lista.map(o => <option key={o.id} value={o.id}>{o.nome}{o.cidade ? ` — ${o.cidade}` : ''}</option>)}
      </select>
      {erro && <span style={{ color: '#b91c1c', fontSize: '.74rem' }}>{erro}</span>}
    </div>
  )
}

export function ParceirasCards({ parceiras, opcoes, linha = 'paideia' }: { parceiras: Parceira[]; opcoes: OpcaoEscola[]; linha?: Linha }) {
  const bi = linha === 'bilinguismo'
  const [filtro, setFiltro] = useState('')
  const vis = parceiras.filter(p => !filtro || p.nome.toLowerCase().includes(filtro.toLowerCase()))
  const router = useRouter()
  const [pend, start] = useTransition()
  const [erro, setErro] = useState('')
  const exec = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => { const r = await fn(); setErro(r.ok ? '' : r.error ?? 'Erro'); router.refresh() })
  const novo = () => { const n = prompt('Nome da nova escola parceira:'); if (n && n.trim()) exec(() => bi ? adicionarBilingue(n) : adicionarReajuste(n)) }
  const renomear = (p: Parceira) => { const n = prompt('Novo nome do cartão:', p.nome); if (n && n.trim() && n !== p.nome) exec(() => bi ? renomearBilingue(p.id, n) : salvarCampoReajuste(p.id, 'escola', n)) }
  const remover = (p: Parceira) => {
    if (!confirm(`Remover o cartão "${p.nome}"? Os arquivos já anexados continuam guardados no cadastro da escola.`)) return
    exec(() => bi ? removerBilingue(p.id) : removerReajuste(p.id))
  }
  const comContrato = parceiras.filter(p => p.arquivos.some(a => a.categoria === 'contrato')).length
  return (
    <section>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center', marginBottom: '.9rem' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{bi ? 'Escolas do Bilinguismo' : 'Escolas parceiras (Paideia)'}</h2>
          <p style={{ fontSize: '.78rem', color: '#64748b', margin: '.15rem 0 0' }}>{parceiras.length} escolas · {comContrato} com contrato anexado. Escolha o tipo e anexe o arquivo no cartão da escola.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar escola…" style={{ boxSizing: 'border-box', padding: '.45rem .7rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.82rem', width: 200 }} />
          <button onClick={novo} disabled={pend} style={{ padding: '.45rem 1rem', borderRadius: 9999, border: 'none', background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '.8rem', cursor: 'pointer' }}>+ Novo cartão</button>
        </div>
      </div>
      {erro && <p style={{ color: '#991b1b', fontSize: '.82rem' }}>{erro}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
        {vis.map(p => {
          const tem = p.arquivos.some(a => a.categoria === 'contrato')
          const nAdit = p.arquivos.filter(a => a.categoria === 'aditivo').length
          return (
            <article key={p.id} style={{ boxSizing: 'border-box', minWidth: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.25rem 1.4rem', boxShadow: '0 1px 4px rgba(15,23,42,.06)', display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, margin: 0, minWidth: 0, overflowWrap: 'anywhere' }}>{p.nome}</h3>
                <span style={{ flexShrink: 0, fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', borderRadius: 999, padding: '.2rem .6rem',
                  color: tem ? '#15803d' : '#92400e', background: tem ? '#f0fdf4' : '#fffbeb', border: `1px solid ${tem ? '#86efac' : '#fde68a'}` }}>
                  {tem ? 'Contrato anexado' : 'Sem contrato'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem', paddingTop: '.7rem', borderTop: '1px solid #f1f5f9' }}>
                {!bi && <Dado rotulo="Categoria" valor={p.categoria === 'nova' ? 'Nova' : p.categoria === 'veterana' ? 'Veterana' : '—'} />}
                {!bi && <Dado rotulo="Modelo" valor={p.modelo ?? '—'} />}
                {!bi && <Dado rotulo="Kits Infantil" valor={p.kits > 0 ? String(p.kits) : '—'} forte />}
                <Dado rotulo="Contratos" valor={String(p.arquivos.filter(a => a.categoria === 'contrato').length || '—')} forte />
                <Dado rotulo="Aditivos" valor={String(nAdit || '—')} forte />
                <Dado rotulo="Cadastro" valor={p.escolaId ? 'Vinculado' : 'A vincular'} />
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '.8rem', minWidth: 0 }}>
                {p.escolaId ? <ArquivosEscola escolaId={p.escolaId} inicial={p.arquivos} compacto linha={linha} /> : <Vinculo p={p} opcoes={opcoes} linha={linha} />}
              </div>

              <div style={{ display: 'flex', gap: '1rem', fontSize: '.72rem', fontWeight: 700 }}>
                <button onClick={() => renomear(p)} disabled={pend} style={{ border: 'none', background: 'transparent', color: '#0369a1', cursor: 'pointer', padding: 0 }}>Renomear</button>
                <button onClick={() => remover(p)} disabled={pend} style={{ border: 'none', background: 'transparent', color: '#b91c1c', cursor: 'pointer', padding: 0 }}>Remover cartão</button>
              </div>
            </article>
          )
        })}
        {vis.length === 0 && <p style={{ color: '#94a3b8', fontSize: '.85rem', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>Nenhuma escola encontrada.</p>}
      </div>
    </section>
  )
}

function Dado({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#94a3b8' }}>{rotulo}</div>
      <div style={{ fontSize: forte ? '1rem' : '.85rem', fontWeight: forte ? 700 : 600, color: '#334155' }}>{valor}</div>
    </div>
  )
}
