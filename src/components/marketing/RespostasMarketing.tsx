'use client'

import { useMemo, useState } from 'react'
import type { FormularioBriefingConfig, Pergunta } from '@/lib/marketing-briefings'

export interface RespostaBriefingRow {
  id: string
  formulario_id: string
  nome: string
  funcao: string
  tempo_atuacao: string | null
  respostas: Record<string, unknown>
  created_at: string
}

interface Props {
  respostas: RespostaBriefingRow[]
  configs: FormularioBriefingConfig[]
}

function fmtData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatarValor(pergunta: Pergunta | undefined, valor: unknown): string {
  if (valor === undefined || valor === null || valor === '') return '—'
  if (!pergunta) return typeof valor === 'string' ? valor : JSON.stringify(valor)

  if (pergunta.tipo === 'grade' && typeof valor === 'object') {
    const obj = valor as Record<string, string>
    return Object.entries(obj).map(([linha, coluna]) => `${linha}: ${coluna}`).join(' · ') || '—'
  }
  if (pergunta.tipo === 'estruturado' && typeof valor === 'object') {
    const obj = valor as Record<string, string>
    return pergunta.campos.map(c => `${c.label}: ${obj[c.id] || '—'}`).join(' · ')
  }
  if (Array.isArray(valor)) {
    if (pergunta.tipo === 'ranking') return valor.map((v, i) => `${i + 1}º ${v}`).join(' · ')
    return valor.join(', ') || '—'
  }
  return String(valor)
}

export function RespostasMarketing({ respostas, configs }: Props) {
  const [filtro, setFiltro] = useState<string>('todos')
  const [expandido, setExpandido] = useState<string | null>(null)

  const configPorId = useMemo(() => {
    const map: Record<string, FormularioBriefingConfig> = {}
    for (const c of configs) map[c.id] = c
    return map
  }, [configs])

  const perguntaPorId = (config: FormularioBriefingConfig | undefined, id: string) =>
    config?.perguntas.find(p => p.id === id)

  const filtradas = filtro === 'todos' ? respostas : respostas.filter(r => r.formulario_id === filtro)

  return (
    <div>
      {/* Filtro por formulário */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginBottom: '1.5rem' }}>
        <button onClick={() => setFiltro('todos')} style={{
          padding: '.4rem 1rem', borderRadius: 9999, cursor: 'pointer', fontSize: '.75rem', fontWeight: 700,
          fontFamily: 'var(--font-montserrat,sans-serif)',
          background: filtro === 'todos' ? '#0f172a' : '#f1f5f9',
          color: filtro === 'todos' ? '#fff' : '#64748b',
          border: `1.5px solid ${filtro === 'todos' ? '#0f172a' : '#e2e8f0'}`,
        }}>
          Todos ({respostas.length})
        </button>
        {configs.map(c => {
          const qtd = respostas.filter(r => r.formulario_id === c.id).length
          return (
            <button key={c.id} onClick={() => setFiltro(c.id)} style={{
              padding: '.4rem 1rem', borderRadius: 9999, cursor: 'pointer', fontSize: '.75rem', fontWeight: 700,
              fontFamily: 'var(--font-montserrat,sans-serif)',
              background: filtro === c.id ? '#0f172a' : '#f1f5f9',
              color: filtro === c.id ? '#fff' : '#64748b',
              border: `1.5px solid ${filtro === c.id ? '#0f172a' : '#e2e8f0'}`,
            }}>
              {c.destinatario} ({qtd})
            </button>
          )
        })}
      </div>

      {filtradas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, color: '#94a3b8' }}>
          Nenhuma resposta recebida ainda para este filtro.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {filtradas.map(r => {
            const config = configPorId[r.formulario_id]
            const aberto = expandido === r.id
            return (
              <div key={r.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,.05)' }}>
                <div onClick={() => setExpandido(aberto ? null : r.id)} style={{
                  padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                  borderLeft: '4px solid #d97706',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      {r.nome} <span style={{ color: '#94a3b8', fontWeight: 500 }}>— {r.funcao}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginTop: '.25rem' }}>
                      <span style={{ fontSize: '.68rem', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '.1rem .5rem', borderRadius: 99, fontWeight: 600 }}>
                        {config?.destinatario ?? r.formulario_id}
                      </span>
                      <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>{fmtData(r.created_at)}</span>
                      {r.tempo_atuacao && <span style={{ fontSize: '.72rem', color: '#94a3b8' }}>· {r.tempo_atuacao}</span>}
                    </div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: aberto ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>

                {aberto && (
                  <div style={{ padding: '1.25rem', borderTop: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                    {Object.entries(r.respostas).map(([perguntaId, valor]) => {
                      const pergunta = perguntaPorId(config, perguntaId)
                      if (!pergunta) return null
                      return (
                        <div key={perguntaId} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '.75rem 1rem' }}>
                          <div style={{ fontSize: '.68rem', fontWeight: 700, color: '#64748b', marginBottom: '.3rem' }}>{pergunta.texto}</div>
                          <div style={{ fontSize: '.82rem', color: '#0f172a', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{formatarValor(pergunta, valor)}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
