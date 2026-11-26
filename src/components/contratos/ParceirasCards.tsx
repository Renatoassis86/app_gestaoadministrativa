'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArquivosEscola, type ArquivoContrato } from '@/components/contratos/ArquivosEscola'
import { vincularEscolaReajuste } from '@/lib/contratos-reajustes'

export interface Parceira {
  id: string; nome: string; categoria: string | null; modelo: string | null; kits: number
  escolaId: string | null; arquivos: ArquivoContrato[]
}
export interface OpcaoEscola { id: string; nome: string; cidade: string | null }

function Vinculo({ p, opcoes }: { p: Parceira; opcoes: OpcaoEscola[] }) {
  const router = useRouter()
  const [pend, start] = useTransition()
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const lista = opcoes.filter(o => !busca || o.nome.toLowerCase().includes(busca.toLowerCase())).slice(0, 60)
  return (
    <div style={{ borderTop: '1px solid #eef2f6', paddingTop: '.6rem', display: 'grid', gap: '.4rem' }}>
      <span style={{ fontSize: '.76rem', color: '#b45309', fontWeight: 700 }}>Vincule ao cadastro da escola para anexar contratos</span>
      <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar no cadastro…" style={{ padding: '.38rem .5rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.78rem' }} />
      <select disabled={pend} defaultValue="" onChange={e => start(async () => { const r = await vincularEscolaReajuste(p.id, e.target.value); if (!r.ok) setErro(r.error ?? 'Erro'); router.refresh() })}
        style={{ padding: '.38rem .5rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.78rem' }}>
        <option value="">Selecione a escola…</option>
        {lista.map(o => <option key={o.id} value={o.id}>{o.nome}{o.cidade ? ` — ${o.cidade}` : ''}</option>)}
      </select>
      {erro && <span style={{ color: '#b91c1c', fontSize: '.74rem' }}>{erro}</span>}
    </div>
  )
}

export function ParceirasCards({ parceiras, opcoes }: { parceiras: Parceira[]; opcoes: OpcaoEscola[] }) {
  const [filtro, setFiltro] = useState('')
  const vis = parceiras.filter(p => !filtro || p.nome.toLowerCase().includes(filtro.toLowerCase()))
  const comContrato = parceiras.filter(p => p.arquivos.some(a => a.categoria === 'contrato')).length
  return (
    <section>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', alignItems: 'center', marginBottom: '.9rem' }}>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Escolas parceiras</h2>
          <p style={{ fontSize: '.78rem', color: '#64748b', margin: '.15rem 0 0' }}>{parceiras.length} escolas · {comContrato} com contrato anexado. Escolha o tipo e anexe o arquivo no cartão da escola.</p>
        </div>
        <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="Buscar escola…" style={{ marginLeft: 'auto', padding: '.45rem .7rem', border: '1px solid #cbd5e1', borderRadius: 8, fontSize: '.82rem', width: 200 }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '.9rem' }}>
        {vis.map(p => {
          const tem = p.arquivos.some(a => a.categoria === 'contrato')
          return (
            <article key={p.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', alignItems: 'flex-start' }}>
                <h3 style={{ fontSize: '.92rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{p.nome}</h3>
                <span style={{ fontSize: '.66rem', fontWeight: 800, padding: '.15rem .55rem', borderRadius: 9999, whiteSpace: 'nowrap', color: tem ? '#047857' : '#b45309', background: tem ? '#ecfdf5' : '#fffbeb', border: `1px solid ${tem ? '#a7f3d0' : '#fde68a'}` }}>{tem ? 'Contrato anexado' : 'Sem contrato'}</span>
              </div>
              <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', fontSize: '.7rem', fontWeight: 700 }}>
                {p.categoria && <span style={{ color: '#0369a1', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 9999, padding: '.1rem .55rem' }}>{p.categoria === 'nova' ? 'Nova' : 'Veterana'}</span>}
                {p.modelo && <span style={{ color: '#475569', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9999, padding: '.1rem .55rem' }}>{p.modelo}</span>}
                <span style={{ color: '#475569' }}>{p.kits} kits Infantil</span>
              </div>
              <div style={{ marginTop: 'auto' }}>
                {p.escolaId ? <ArquivosEscola escolaId={p.escolaId} inicial={p.arquivos} compacto /> : <Vinculo p={p} opcoes={opcoes} />}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
