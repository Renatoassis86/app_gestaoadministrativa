'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArquivosEscola, type ArquivoContrato } from '@/components/contratos/ArquivosEscola'
import { MODALIDADES, STATUS_CONTRATO, SERIES_CONTRATO, brl, fmtCnpj, fmtCpf, fmtData, fmtTel, type Modalidade } from '@/lib/contratos'

export interface CardData {
  escolaId: string
  nome: string
  razao: string | null
  cnpj: string | null
  cidadeUf: string
  modalidade: Modalidade
  status: string
  kits: number
  valor: number
  vigenciaInicio: string | null
  vigenciaFim: string | null
  legal: { nome: string | null; cpf: string | null; rg: string | null; email: string | null; tel: string | null }
  financeiro: { nome: string | null; email: string | null; tel: string | null }
  pagamento: string
  series: Array<{ serie: string; tipo_kit: string; quantidade: number; valor_unitario: number | null }>
  aditivos: Array<{ id: string; titulo: string; assinado: boolean; data_assinatura: string | null }>
  arquivos: ArquivoContrato[]
  driveUrl: string | null
  pendencias: string[]
}

const L = (k: string, v: React.ReactNode) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', fontSize: '.76rem', padding: '.18rem 0', borderBottom: '1px dashed #eef2f6' }}>
    <span style={{ color: '#64748b' }}>{k}</span><span style={{ fontWeight: 600, textAlign: 'right', color: '#0f172a' }}>{v || '—'}</span>
  </div>
)

function Card({ d }: { d: CardData }) {
  const [verso, setVerso] = useState(false)
  const m = MODALIDADES[d.modalidade]
  const st = STATUS_CONTRATO[d.status] ?? STATUS_CONTRATO.rascunho
  const nomeSerie = (id: string) => SERIES_CONTRATO.find(s => s.id === id)?.label ?? id

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '.6rem', minHeight: 330 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '.95rem', color: '#0f172a', lineHeight: 1.25 }}>{d.nome}</div>
          <div style={{ fontSize: '.72rem', color: '#64748b' }}>{fmtCnpj(d.cnpj)} · {d.cidadeUf}</div>
        </div>
        <span style={{ background: m.bg, color: m.cor, borderRadius: 9999, padding: '.15rem .6rem', fontSize: '.68rem', fontWeight: 800, whiteSpace: 'nowrap' }}>{m.label}</span>
      </div>
      <span style={{ alignSelf: 'flex-start', background: st.bg, color: st.cor, borderRadius: 9999, padding: '.12rem .55rem', fontSize: '.68rem', fontWeight: 700 }}>{st.label}</span>

      {!verso ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '.55rem .7rem' }}>
              <div style={{ fontSize: '.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Kits</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{d.kits}</div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '.55rem .7rem' }}>
              <div style={{ fontSize: '.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Valor 1º ano</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>{brl(d.valor)}</div>
            </div>
          </div>
          <div>
            {L('Pagamento', d.pagamento)}
            {L('Vigência', d.vigenciaInicio || d.vigenciaFim ? `${fmtData(d.vigenciaInicio)} → ${fmtData(d.vigenciaFim)}` : 'a definir')}
            {L('Aditivos', d.aditivos.length ? `${d.aditivos.length}` : 'nenhum')}
            {L('Arquivos anexados', String(d.arquivos.length))}
          </div>
          {d.pendencias.length > 0 && (
            <div style={{ fontSize: '.7rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '.4rem .55rem' }}>
              Falta: {d.pendencias.slice(0, 4).join(', ')}{d.pendencias.length > 4 ? ` +${d.pendencias.length - 4}` : ''}
            </div>
          )}
        </>
      ) : (
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', margin: '.2rem 0' }}>Representante legal</div>
          {L('Nome', d.legal.nome)}{L('CPF', fmtCpf(d.legal.cpf))}{L('RG', d.legal.rg)}{L('E-mail', d.legal.email)}{L('Telefone', fmtTel(d.legal.tel))}
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', margin: '.5rem 0 .2rem' }}>Financeiro</div>
          {L('Nome', d.financeiro.nome)}{L('E-mail', d.financeiro.email)}{L('Telefone', fmtTel(d.financeiro.tel))}
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', margin: '.5rem 0 .2rem' }}>Kits por série</div>
          {d.series.length === 0 ? <div style={{ fontSize: '.75rem', color: '#94a3b8' }}>Sem quantidades cadastradas.</div> :
            d.series.map(s => L(`${nomeSerie(s.serie)}${s.tipo_kit !== 'completo' ? ` (${s.tipo_kit === 'sem_ingles' ? 'sem Inglês' : 'só Inglês'})` : ''}`,
              `${s.quantidade} × ${brl(s.valor_unitario)}`))}
          {d.aditivos.length > 0 && (<>
            <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', margin: '.5rem 0 .2rem' }}>Aditivos</div>
            {d.aditivos.map(a => L(a.titulo, a.assinado ? `assinado ${fmtData(a.data_assinatura)}` : 'pendente'))}
          </>)}
          {d.driveUrl && <a href={d.driveUrl} target="_blank" rel="noreferrer" style={{ fontSize: '.75rem', color: '#0ea5e9', fontWeight: 700 }}>Abrir documento →</a>}
        </div>
      )}

      <div style={{ marginTop: 'auto' }}><ArquivosEscola escolaId={d.escolaId} inicial={d.arquivos} compacto /></div>

      <div style={{ display: 'flex', gap: '.5rem' }}>
        <button onClick={() => setVerso(v => !v)}
          style={{ flex: 1, padding: '.45rem', borderRadius: 9999, border: '1px solid #bae6fd', background: '#f0f9ff', color: '#0369a1', fontWeight: 700, fontSize: '.75rem', cursor: 'pointer' }}>
          {verso ? '← Resumo' : 'Ver dados completos'}
        </button>
        <Link href={`/contratos/${d.escolaId}/editar`}
          style={{ padding: '.45rem .9rem', borderRadius: 9999, background: '#0ea5e9', color: '#fff', fontWeight: 700, fontSize: '.75rem', textDecoration: 'none' }}>Editar</Link>
      </div>
    </div>
  )
}

export function ContratoCardsClient({ dados }: { dados: CardData[] }) {
  const [busca, setBusca] = useState('')
  const [modelo, setModelo] = useState<'todos' | Modalidade>('todos')
  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return dados.filter(d => (modelo === 'todos' || d.modalidade === modelo) &&
      (!q || `${d.nome} ${d.razao ?? ''} ${d.cnpj ?? ''} ${d.cidadeUf}`.toLowerCase().includes(q)))
  }, [dados, busca, modelo])

  return (
    <div>
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por escola, CNPJ ou cidade"
          style={{ flex: '1 1 240px', padding: '.5rem .8rem', border: '1px solid #cbd5e1', borderRadius: 9999, fontSize: '.85rem' }} />
        {(['todos', 'boleto', 'eskolare'] as const).map(m => (
          <button key={m} onClick={() => setModelo(m)}
            style={{ padding: '.45rem .9rem', borderRadius: 9999, fontSize: '.8rem', fontWeight: 700, cursor: 'pointer',
                     border: '1px solid #bae6fd', background: modelo === m ? '#0ea5e9' : '#f0f9ff', color: modelo === m ? '#fff' : '#0369a1' }}>
            {m === 'todos' ? 'Todos' : MODALIDADES[m].label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
        {filtrados.map(d => <Card key={d.escolaId} d={d} />)}
      </div>
      {filtrados.length === 0 && <p style={{ color: '#64748b', fontSize: '.9rem', marginTop: '1rem' }}>Nenhum contrato encontrado.</p>}
    </div>
  )
}
