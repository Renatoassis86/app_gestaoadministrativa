'use client'

use client'

import { useState } from 'react'
import Link from 'next/link'
import { criarTarefa, criarNota, concluirTarefa } from '@/lib/actions'
import { formatDate, formatCurrency } from '@/lib/utils'
import { LABEL } from '@/types/database'
import { RegistroActions, EditButton } from '@/components/ui/ActionButtons'

interface Props {
  escolaId: string
  registros: any[]
  negociacoes: any[]
  tarefas: any[]
  notas: any[]
  contrato: any
}

const TABS = [
  { id: 'registros',   label: 'Registros' },
  { id: 'negociacoes', label: 'Negociações' },
  { id: 'tarefas',     label: 'Tarefas' },
  { id: 'notas',       label: 'Notas' },
]

// Ícones SVG monocromáticos por meio de contato
const MEIO_SVG: Record<string, React.ReactNode> = {
  presencial:  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  whatsapp:    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  email:       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  telefone:    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l1.62-1.34a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  videoconf:   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
  outro:       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
}

export function EscolaDetailClient({ escolaId, registros, negociacoes, tarefas, notas, contrato }: Props) {
  const [active, setActive] = useState('registros')

  return (
    <div>
      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            style={{
              padding: '.65rem 1.1rem', fontSize: '.82rem',
              fontWeight: active === tab.id ? 700 : 500,
              color: active === tab.id ? '#d97706' : 'var(--text-s)',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: `2px solid ${active === tab.id ? '#d97706' : 'transparent'}`,
              marginBottom: -2, transition: 'all .15s',
              fontFamily: 'var(--font-montserrat,sans-serif)',
              display: 'flex', alignItems: 'center', gap: '.35rem',
            }}>
            {tab.label}
            <span style={{
              fontSize: '.62rem', fontWeight: 700, padding: '.1rem .35rem', borderRadius: 99,
              background: active === tab.id ? '#fef3c7' : 'var(--surface-2)',
              color: active === tab.id ? '#92400e' : 'var(--text-s)',
            }}>
              {tab.id === 'registros' ? registros.length
                : tab.id === 'negociacoes' ? negociacoes.length
                : tab.id === 'tarefas' ? tarefas.length
                : notas.length}
            </span>
          </button>
        ))}
      </div>

      {/* Registros — Timeline */}
      {active === 'registros' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
              Jornada de Relacionamento
            </h3>
            <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary btn-sm">
              + Nova Interação
            </Link>
          </div>
          {registros.length > 0 ? (
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #e2e8f0, #f1f5f9)' }} />
              {registros.map((r: any, idx: number) => {
                const cor = r.classificacao === 'quente' ? '#ef4444' : r.classificacao === 'morno' ? '#d97706' : '#6366f1'
                return (
                  <div key={r.id} style={{ display: 'flex', gap: '1rem', marginBottom: idx < registros.length - 1 ? '1.25rem' : 0, position: 'relative', zIndex: 1 }}>
                    <div style={{ flexShrink: 0, paddingTop: '.2rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '50%', fontSize: '1rem',
                        background: '#f8fafc', border: `1.5px solid ${cor}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#64748b',
                      }}>
                        {MEIO_SVG[r.meio_contato] ?? MEIO_SVG.outro}
                      </div>
                    </div>
                    <div style={{
                      flex: 1, background: '#fff', border: '1px solid #e2e8f0',
                      borderLeft: `4px solid ${cor}`, borderRadius: 12,
                      padding: '1rem 1.25rem', boxShadow: '0 2px 8px rgba(15,23,42,.05)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.6rem', flexWrap: 'wrap', gap: '.4rem' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '.875rem', color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                            {LABEL.meio_contato?.[r.meio_contato] ?? r.meio_contato}
                            {r.contato_nome && <span style={{ fontWeight: 400, color: 'var(--text-s)', fontSize: '.82rem' }}> — {r.contato_nome}{r.contato_cargo ? ` (${r.contato_cargo})` : ''}</span>}
                          </div>
                          <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>
                            {formatDate(r.data_contato)}{r.responsavel?.full_name ? ` · ${r.responsavel.full_name}` : ''}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`badge badge-${r.classificacao}`} style={{ fontSize: '.62rem' }}>
                            {r.classificacao === 'quente' ? 'Quente' : r.classificacao === 'morno' ? 'Morno' : 'Frio'}
                          </span>
                          <span style={{ fontSize: '.65rem', fontWeight: 800, background: `${cor}12`, color: cor, border: `1px solid ${cor}30`, padding: '.12rem .45rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                            {r.probabilidade}%
                          </span>
                          {r.potencial_financeiro > 0 && <span className="badge badge-amber" style={{ fontSize: '.62rem' }}>{formatCurrency(r.potencial_financeiro)}</span>}
                          <Link href={`/comercial/registros/${r.id}/editar`} className="btn btn-ghost btn-sm">Editar</Link>
                        </div>
                      </div>
                      <p style={{ fontSize: '.875rem', color: '#334155', lineHeight: 1.6, background: '#f8fafc', borderRadius: 8, padding: '.6rem .85rem', marginBottom: '.6rem', borderLeft: '3px solid #e2e8f0' }}>
                        {r.resumo}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem' }}>
                        <span style={{ fontSize: '.65rem', background: '#f1f5f9', color: '#475569', padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                          {LABEL.interesse?.[r.interesse] ?? r.interesse}
                        </span>
                        <span style={{ fontSize: '.65rem', background: '#dbeafe', color: '#1e3a8a', padding: '.15rem .5rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                          {LABEL.prontidao?.[r.prontidao] ?? r.prontidao}
                        </span>
                      </div>
                      {r.proximo_contato && (
                        <div style={{ marginTop: '.5rem', fontSize: '.72rem', color: '#0ea5e9', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          Próximo: {formatDate(r.proximo_contato)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Nenhuma interação registrada</h3>
              <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>
                Registrar Primeira Interação
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Negociações */}
      {active === 'negociacoes' && (
        <div>
          {negociacoes.length > 0 ? negociacoes.map((n: any) => (
            <div key={n.id} className="card" style={{ marginBottom: '.75rem' }}>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>{LABEL.stage?.[n.stage] ?? n.stage}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>{n.responsavel?.full_name ?? '—'} · {formatDate(n.updated_at)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {n.valor_estimado && <div style={{ fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem' }}>{formatCurrency(n.valor_estimado)}</div>}
                    <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>{n.probabilidade}% probabilidade</div>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="empty-state"><h3>Nenhuma negociação</h3></div>
          )}
        </div>
      )}

      {/* Tarefas */}
      {active === 'tarefas' && (
        <div>
          <form action={criarTarefa} style={{ marginBottom: '1.5rem' }}>
            <input type="hidden" name="escola_id" value={escolaId} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '.75rem', alignItems: 'end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Título da Tarefa
                </label>
                <input name="titulo" className="form-control" required placeholder="Descreva a tarefa..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Vencimento
                </label>
                <input name="vencimento" type="date" className="form-control" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#64748b', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Prioridade
                </label>
                <select name="prioridade" className="form-control">
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">Criar</button>
            </div>
          </form>

          {tarefas.length > 0 ? tarefas.map((t: any) => {
            const vencida = t.vencimento && new Date(t.vencimento) < new Date()
            return (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: '.75rem',
                padding: '.75rem 1rem', marginBottom: '.5rem',
                background: vencida ? '#fef2f2' : '#fff',
                border: `1px solid ${vencida ? '#fca5a5' : '#e2e8f0'}`,
                borderLeft: `4px solid ${vencida ? '#dc2626' : '#d97706'}`,
                borderRadius: 10,
              }}>
                <form action={async () => { 'use server'; await concluirTarefa(t.id) }}>
                  <button type="submit" style={{
                    width: 22, height: 22, borderRadius: '50%', cursor: 'pointer',
                    border: '2px solid #94a3b8', background: 'none', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }} title="Concluir" />
                </form>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '.875rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{t.titulo}</div>
                  {t.vencimento && <div style={{ fontSize: '.72rem', color: vencida ? '#dc2626' : 'var(--text-s)' }}>{vencida ? 'Vencida: ' : ''}{formatDate(t.vencimento)}</div>}
                </div>
                <span className="badge badge-gray" style={{ textTransform: 'capitalize', fontSize: '.62rem' }}>{t.prioridade}</span>
              </div>
            )
          }) : (
            <div className="empty-state"><h3>Nenhuma tarefa pendente</h3></div>
          )}
        </div>
      )}

      {/* Notas */}
      {active === 'notas' && (
        <div>
          <form action={criarNota} style={{ marginBottom: '1.5rem' }}>
            <input type="hidden" name="escola_id" value={escolaId} />
            <textarea name="texto" className="form-control" rows={3} required placeholder="Escreva uma nota interna..." style={{ marginBottom: '.75rem' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', cursor: 'pointer', fontFamily: 'var(--font-inter,sans-serif)' }}>
                <input type="checkbox" name="fixada_cb" onChange={e => {
                  const h = document.querySelector('input[name="fixada"]') as HTMLInputElement
                  if (h) h.value = e.target.checked ? 'true' : 'false'
                }} />
                <input type="hidden" name="fixada" defaultValue="false" />
                Fixar nota
              </label>
              <button type="submit" className="btn btn-primary btn-sm">Salvar Nota</button>
            </div>
          </form>

          {notas.length > 0 ? notas.map((n: any) => (
            <div key={n.id} style={{
              padding: '.85rem 1rem', marginBottom: '.5rem',
              background: '#fff', border: '1px solid #e2e8f0',
              borderLeft: n.fixada ? '4px solid #d97706' : '4px solid #e2e8f0',
              borderRadius: 10,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '.875rem', lineHeight: 1.6, color: '#334155' }}>{n.texto}</div>
                {n.fixada && <span className="badge badge-amber" style={{ marginLeft: '.75rem', flexShrink: 0, fontSize: '.6rem' }}>Fixada</span>}
              </div>
              <div style={{ fontSize: '.68rem', color: 'var(--text-s)', marginTop: '.4rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                {formatDate(n.created_at)}
              </div>
            </div>
          )) : (
            <div className="empty-state"><h3>Nenhuma nota</h3></div>
          )}
        </div>
      )}
    </div>
  )
}
