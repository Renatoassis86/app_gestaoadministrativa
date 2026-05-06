import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { LABEL } from '@/types/database'
import { EscolaSelector } from '@/components/ui/EscolaSelector'

interface Props { searchParams: Promise<{ escola?: string }> }

// ── Definição das etapas do funil comercial ──────────────────────────────────
const ETAPAS = [
  { id: 'cadastro',     label: 'Cadastro',          icon: '🏫', desc: 'Escola registrada no sistema',           cor: '#6366f1' },
  { id: 'prospeccao',   label: 'Prospecção',         icon: '🔍', desc: 'Primeiro contato comercial',             cor: '#8b5cf6' },
  { id: 'qualificacao', label: 'Qualificação',       icon: '📋', desc: 'Diagnóstico de interesse e perfil',      cor: '#d97706' },
  { id: 'apresentacao', label: 'Apresentação',       icon: '🎯', desc: 'Apresentação do Currículo Paideia',      cor: '#f59e0b' },
  { id: 'proposta',     label: 'Proposta',           icon: '📄', desc: 'Proposta comercial enviada',             cor: '#10b981' },
  { id: 'negociacao',   label: 'Negociação',         icon: '🤝', desc: 'Ajustes e alinhamentos contratuais',     cor: '#14b8a6' },
  { id: 'formulario',   label: 'Formulário',         icon: '📝', desc: 'Formulário de pré-cadastro enviado',     cor: '#0ea5e9' },
  { id: 'minuta',       label: 'Minuta',             icon: '📃', desc: 'Minuta do contrato enviada e revisada',  cor: '#2563eb' },
  { id: 'assinatura',   label: 'Assinatura',         icon: '✍️', desc: 'Contrato assinado por ambas as partes', cor: '#16a34a' },
  { id: 'arquivado',    label: 'Parceria Ativa',     icon: '🎉', desc: 'Contrato arquivado — parceria iniciada', cor: '#15803d' },
]

// Mapeamento de prontidão para etapas
const PRONTIDAO_STAGE: Record<string, string> = {
  parada:              'prospeccao',
  nova_reuniao:        'qualificacao',
  esperando_retorno:   'qualificacao',
  apresentacao:        'apresentacao',
  contrato_enviado:    'proposta',
  atualizar_contrato:  'negociacao',
  contrato_assinado:   'assinatura',
  parceiro_ativo:      'arquivado',
}

const MEIO_ICONE: Record<string, string> = {
  presencial: '👥', whatsapp: '💬', email: '✉️', telefone: '📞', videoconf: '🎥', outro: '📌',
}

const INTERESSE_COR: Record<string, string> = {
  muito_baixo: '#94a3b8', baixo: '#64748b', medio: '#f59e0b', alto: '#f97316', muito_alto: '#ef4444',
}

export default async function JornadaVisualPage({ searchParams }: Props) {
  const params = await searchParams
  const escolaId = params.escola ?? ''
  const supabase = await createClient()

  const { data: escolas } = await supabase
    .from('escolas').select('id, nome, estado, cidade').eq('ativa', true).order('nome')

  let escola: any = null
  let registros: any[] = []
  let contrato: any = null
  let negociacoes: any[] = []

  if (escolaId) {
    const [{ data: e }, { data: r }, { data: c }, { data: n }] = await Promise.all([
      supabase.from('escolas_resumo').select('*').eq('id', escolaId).single(),
      supabase.from('registros').select('*, responsavel:profiles(full_name)').eq('escola_id', escolaId).order('data_contato'),
      supabase.from('contratos').select('*').eq('escola_id', escolaId).single(),
      supabase.from('negociacoes').select('*').eq('escola_id', escolaId).order('created_at'),
    ])
    escola = e; registros = r ?? []; contrato = c; negociacoes = n ?? []
  }

  // Calcular etapa atual
  const ultimaInteracao = registros[registros.length - 1]
  const etapaAtual = contrato?.contrato_arquivado ? 'arquivado'
    : contrato?.contrato_assinado ? 'assinatura'
    : contrato?.formulario_enviado ? 'formulario'
    : ultimaInteracao ? (PRONTIDAO_STAGE[ultimaInteracao.prontidao] ?? 'qualificacao')
    : escolaId ? 'cadastro'
    : ''

  const idxAtual = ETAPAS.findIndex(e => e.id === etapaAtual)

  return (
    <div>
      <PageHeader
        title="Jornada Comercial"
        subtitle="Infográfico visual do processo completo"
        actions={
          escolaId && escola ? (
            <Link href={`/comercial/escolas/${escolaId}`} className="btn btn-ghost btn-sm">
              Ver Ficha Completa →
            </Link>
          ) : undefined
        }
      />

      <div style={{ padding: '1.5rem' }}>

        {/* Seletor de escola */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-body" style={{ padding: '.85rem 1.25rem' }}>
            <EscolaSelector
              escolas={escolas ?? []}
              escolaId={escolaId}
              basePath="/comercial/jornada-visual"
              placeholder="— Escolha uma escola para visualizar sua jornada —"
              extraButton={escolaId ? (
                <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary btn-sm">
                  + Nova Interação
                </Link>
              ) : undefined}
            />
          </div>
        </div>

        {escola ? (
          <>
            {/* ── Cabeçalho da escola ──────────────────────────────────── */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              borderRadius: 16, padding: '1.75rem 2rem',
              marginBottom: '2rem', color: '#fff',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              flexWrap: 'wrap', gap: '1rem',
            }}>
              <div>
                <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.1em', color: '#d97706', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)', textTransform: 'uppercase' }}>
                  ✦ Jornada Comercial
                </div>
                <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '.3rem' }}>
                  {escola.nome}
                </h2>
                <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.55)' }}>
                  {escola.cidade}{escola.estado ? `, ${escola.estado}` : ''} · {LABEL.perfil_pedagogico?.[escola.perfil_pedagogico] ?? ''}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  ['Interações', registros.length],
                  ['Potencial', formatCurrency(escola.potencial_financeiro ?? 0)],
                  ['Alunos', escola.total_alunos ?? 0],
                ].map(([label, val]) => (
                  <div key={String(label)} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', lineHeight: 1 }}>{String(val)}</div>
                  </div>
                ))}
                {escola.classificacao_atual && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.2rem' }}>Status</div>
                    <span className={`badge badge-${escola.classificacao_atual}`} style={{ fontSize: '.75rem' }}>
                      {escola.classificacao_atual === 'quente' ? '🔥 Quente' : escola.classificacao_atual === 'morno' ? '🌤 Morno' : '❄️ Frio'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* ── INFOGRÁFICO: Funil de Etapas ─────────────────────────── */}
            <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
              <div className="card-header">
                <span className="card-title">Funil de Progresso Comercial</span>
                <span style={{ fontSize: '.78rem', color: 'var(--text-s)', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  {idxAtual >= 0 ? `Etapa ${idxAtual + 1} de ${ETAPAS.length}: ${ETAPAS[idxAtual]?.label}` : 'Início da jornada'}
                </span>
              </div>
              <div className="card-body">
                {/* Barra de progresso geral */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                    <span style={{ fontSize: '.75rem', color: 'var(--text-s)', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>Progresso da Jornada</span>
                    <span style={{ fontSize: '.75rem', fontWeight: 700, color: idxAtual >= ETAPAS.length - 1 ? '#16a34a' : '#d97706', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                      {idxAtual >= 0 ? `${Math.round(((idxAtual + 1) / ETAPAS.length) * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div style={{ height: 10, background: '#e2e8f0', borderRadius: 5, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', borderRadius: 5,
                      background: idxAtual >= ETAPAS.length - 1
                        ? 'linear-gradient(90deg, #16a34a, #15803d)'
                        : 'linear-gradient(90deg, #d97706, #f59e0b)',
                      width: idxAtual >= 0 ? `${((idxAtual + 1) / ETAPAS.length) * 100}%` : '0%',
                      transition: 'width 1s ease',
                    }} />
                  </div>
                </div>

                {/* Etapas em grid visual */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '.5rem',
                  position: 'relative',
                }}>
                  {/* Linha conectora de fundo */}
                  <div style={{
                    position: 'absolute', top: 28, left: '10%', right: '10%',
                    height: 2, background: '#e2e8f0', zIndex: 0,
                  }} />

                  {ETAPAS.map((etapa, idx) => {
                    const concluida = idxAtual >= idx
                    const atual = etapaAtual === etapa.id
                    return (
                      <div key={etapa.id} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        position: 'relative', zIndex: 1,
                      }}>
                        {/* Círculo da etapa */}
                        <div style={{
                          width: 56, height: 56, borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.4rem',
                          background: concluida ? etapa.cor : '#f1f5f9',
                          border: atual ? `3px solid ${etapa.cor}` : concluida ? `2px solid ${etapa.cor}` : '2px solid #e2e8f0',
                          boxShadow: atual ? `0 0 0 4px ${etapa.cor}25, 0 8px 24px ${etapa.cor}30` : concluida ? `0 4px 12px ${etapa.cor}30` : 'none',
                          transition: 'all .3s',
                          position: 'relative',
                          transform: atual ? 'scale(1.12)' : 'scale(1)',
                        }}>
                          {etapa.icon}
                          {/* Check se concluída mas não atual */}
                          {concluida && !atual && (
                            <div style={{
                              position: 'absolute', bottom: -2, right: -2,
                              width: 18, height: 18, borderRadius: '50%',
                              background: '#16a34a', border: '2px solid white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '.6rem', color: '#fff',
                            }}>✓</div>
                          )}
                          {/* Pulse se atual */}
                          {atual && (
                            <div style={{
                              position: 'absolute', inset: -6,
                              borderRadius: '50%',
                              border: `2px solid ${etapa.cor}`,
                              animation: 'pulse 2s infinite',
                              opacity: .5,
                            }} />
                          )}
                        </div>

                        {/* Label */}
                        <div style={{
                          marginTop: '.6rem', textAlign: 'center',
                          fontSize: '.7rem', fontWeight: atual ? 800 : concluida ? 700 : 500,
                          color: concluida ? '#0f172a' : '#94a3b8',
                          fontFamily: 'var(--font-montserrat,sans-serif)',
                          lineHeight: 1.3,
                        }}>
                          {etapa.label}
                        </div>
                        <div style={{
                          fontSize: '.6rem', color: '#94a3b8', textAlign: 'center',
                          marginTop: '.2rem', lineHeight: 1.3, maxWidth: 90,
                          fontFamily: 'var(--font-inter,sans-serif)',
                          opacity: concluida ? 1 : .6,
                        }}>
                          {etapa.desc}
                        </div>

                        {/* Data se concluída */}
                        {concluida && idx === 0 && escola.created_at && (
                          <div style={{ marginTop: '.3rem', fontSize: '.6rem', color: etapa.cor, fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                            {formatDate(escola.created_at)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── TIMELINE DETALHADA de Interações ─────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem', alignItems: 'start' }}>

              {/* Timeline principal */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                    Histórico de Interações
                    <span style={{ fontSize: '.8rem', fontWeight: 400, color: 'var(--text-s)', marginLeft: '.5rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      ({registros.length} registro{registros.length !== 1 ? 's' : ''}, ordem cronológica)
                    </span>
                  </h3>
                  <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary btn-sm">
                    + Nova Interação
                  </Link>
                </div>

                {registros.length > 0 ? (
                  <div style={{ position: 'relative' }}>
                    {/* Linha vertical */}
                    <div style={{
                      position: 'absolute', left: 19, top: 0, bottom: 0,
                      width: 2, background: 'linear-gradient(to bottom, #e2e8f0, #f1f5f9)',
                      zIndex: 0,
                    }} />

                    {registros.map((r: any, idx: number) => {
                      const isLast = idx === registros.length - 1
                      const corInteresse = INTERESSE_COR[r.interesse] ?? '#94a3b8'
                      const meioIcon = MEIO_ICONE[r.meio_contato] ?? '📌'
                      const meioLabel = LABEL.meio_contato?.[r.meio_contato] ?? r.meio_contato

                      return (
                        <div key={r.id} style={{ display: 'flex', gap: '1rem', marginBottom: isLast ? 0 : '1.25rem', position: 'relative', zIndex: 1 }}>

                          {/* Marcador na timeline */}
                          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '.25rem' }}>
                            <div style={{
                              width: 40, height: 40, borderRadius: '50%',
                              background: `linear-gradient(135deg, ${corInteresse}22, ${corInteresse}44)`,
                              border: `2px solid ${corInteresse}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '1.1rem',
                              boxShadow: `0 4px 12px ${corInteresse}30`,
                            }}>
                              {meioIcon}
                            </div>
                            {/* Número da interação */}
                            <div style={{
                              marginTop: '.3rem', fontSize: '.55rem', fontWeight: 800,
                              color: 'var(--text-s)', fontFamily: 'var(--font-montserrat,sans-serif)',
                              background: '#f1f5f9', borderRadius: 99, padding: '.05rem .3rem',
                            }}>#{idx + 1}</div>
                          </div>

                          {/* Card da interação */}
                          <div style={{
                            flex: 1,
                            background: '#fff',
                            border: '1px solid #e2e8f0',
                            borderLeft: `4px solid ${corInteresse}`,
                            borderRadius: 12,
                            padding: '1rem 1.25rem',
                            boxShadow: '0 2px 8px rgba(15,23,42,.06)',
                            transition: 'box-shadow .2s',
                          }}>
                            {/* Header do card */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.75rem', flexWrap: 'wrap', gap: '.5rem' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                    {meioLabel}
                                  </span>
                                  {r.contato_nome && (
                                    <span style={{ fontSize: '.78rem', color: 'var(--text-s)' }}>
                                      com <strong>{r.contato_nome}</strong>{r.contato_cargo ? ` (${r.contato_cargo})` : ''}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '.72rem', color: 'var(--text-s)', marginTop: '.2rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                  {new Date(r.data_contato + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                                  {r.responsavel?.full_name && <span> · Por <strong>{r.responsavel.full_name}</strong></span>}
                                </div>
                              </div>

                              {/* Métricas do canto */}
                              <div style={{ display: 'flex', gap: '.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <span className={`badge badge-${r.classificacao}`} style={{ fontSize: '.65rem' }}>
                                  {r.classificacao === 'quente' ? '🔥 Quente' : r.classificacao === 'morno' ? '🌤 Morno' : '❄️ Frio'}
                                </span>
                                <span style={{
                                  fontSize: '.68rem', fontWeight: 800, fontFamily: 'var(--font-montserrat,sans-serif)',
                                  background: `${corInteresse}15`, color: corInteresse,
                                  border: `1px solid ${corInteresse}30`,
                                  padding: '.15rem .5rem', borderRadius: 99,
                                }}>
                                  {r.probabilidade}%
                                </span>
                                {r.potencial_financeiro > 0 && (
                                  <span className="badge badge-amber" style={{ fontSize: '.65rem' }}>
                                    {formatCurrency(r.potencial_financeiro)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Resumo */}
                            <p style={{
                              fontSize: '.875rem', color: '#334155', lineHeight: 1.65,
                              marginBottom: '.85rem', fontFamily: 'var(--font-inter,sans-serif)',
                              background: '#f8fafc', borderRadius: 8, padding: '.75rem',
                              borderLeft: '3px solid #e2e8f0',
                            }}>
                              {r.resumo}
                            </p>

                            {/* Chips de diagnóstico */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.35rem', marginBottom: '.6rem' }}>
                              <span style={{ fontSize: '.68rem', background: '#f1f5f9', color: '#475569', padding: '.2rem .6rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                                Interesse: {LABEL.interesse?.[r.interesse] ?? r.interesse}
                              </span>
                              <span style={{ fontSize: '.68rem', background: '#dbeafe', color: '#1e3a8a', padding: '.2rem .6rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                                {LABEL.prontidao?.[r.prontidao] ?? r.prontidao}
                              </span>
                              <span style={{ fontSize: '.68rem', background: '#ccfbf1', color: '#134e4a', padding: '.2rem .6rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600 }}>
                                Abertura: {LABEL.abertura?.[r.abertura] ?? r.abertura}
                              </span>
                            </div>

                            {/* Encaminhamentos */}
                            {r.encaminhamentos?.length > 0 && (
                              <div style={{ marginTop: '.5rem' }}>
                                <div style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--text-s)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '.35rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                  Encaminhamentos
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.25rem' }}>
                                  {r.encaminhamentos.map((enc: string) => (
                                    <span key={enc} style={{
                                      fontSize: '.65rem', background: '#fef3c7', color: '#92400e',
                                      border: '1px solid #fcd34d', padding: '.15rem .5rem', borderRadius: 99,
                                      fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600,
                                    }}>
                                      ✓ {enc.replace(/_/g, ' ')}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Próximo contato */}
                            {r.proximo_contato && (
                              <div style={{ marginTop: '.6rem', fontSize: '.72rem', color: '#0ea5e9', fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                📅 Próximo contato: {formatDate(r.proximo_contato)}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Marcador final — status atual */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', position: 'relative', zIndex: 1 }}>
                      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '.25rem' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: '50%',
                          background: etapaAtual === 'arquivado' ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #d97706, #b45309)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(0,0,0,.15)',
                        }}>
                          {etapaAtual === 'arquivado' ? '🎉' : '⏳'}
                        </div>
                      </div>
                      <div style={{
                        flex: 1, background: etapaAtual === 'arquivado' ? '#f0fdf4' : '#fffbeb',
                        border: `1px solid ${etapaAtual === 'arquivado' ? '#86efac' : '#fcd34d'}`,
                        borderRadius: 12, padding: '1rem 1.25rem',
                      }}>
                        <div style={{ fontWeight: 700, fontSize: '.85rem', color: etapaAtual === 'arquivado' ? '#15803d' : '#92400e', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          {etapaAtual === 'arquivado' ? '🎉 Parceria Ativa — Contrato Arquivado' : `Status atual: ${ETAPAS.find(e => e.id === etapaAtual)?.label ?? 'Em andamento'}`}
                        </div>
                        <div style={{ fontSize: '.78rem', color: 'var(--text-s)', marginTop: '.2rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          {etapaAtual === 'arquivado' ? 'A escola é uma parceira ativa do Currículo Paideia.' : 'A jornada comercial está em andamento.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>Nenhuma interação registrada ainda</h3>
                    <p>Registre o primeiro contato com esta escola para iniciar a jornada comercial.</p>
                    <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>
                      Registrar Primeiro Contato
                    </Link>
                  </div>
                )}
              </div>

              {/* ── Painel lateral ───────────────────────────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Status contratual */}
                <div className="card">
                  <div className="card-header"><span className="card-title">Status Contratual</span></div>
                  <div className="card-body">
                    {[
                      { label: 'Formulário enviado', done: !!contrato?.formulario_enviado },
                      { label: 'Formulário recebido', done: !!contrato?.formulario_recebido },
                      { label: 'Minuta enviada', done: !!contrato?.minuta_enviada },
                      { label: 'Retorno da minuta', done: !!contrato?.retorno_minuta },
                      { label: 'Minuta atualizada', done: !!contrato?.minuta_atualizada },
                      { label: 'Contrato enviado', done: !!contrato?.contrato_enviado },
                      { label: 'Contrato assinado', done: !!contrato?.contrato_assinado },
                      { label: 'Contrato arquivado', done: !!contrato?.contrato_arquivado },
                    ].map((item, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '.65rem',
                        padding: '.5rem 0',
                        borderBottom: i < 7 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                          background: item.done ? '#16a34a' : '#f1f5f9',
                          border: `2px solid ${item.done ? '#16a34a' : '#e2e8f0'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.65rem', color: item.done ? '#fff' : 'transparent',
                          fontWeight: 800,
                        }}>
                          {item.done ? '✓' : ''}
                        </div>
                        <span style={{
                          fontSize: '.78rem', fontFamily: 'var(--font-inter,sans-serif)',
                          color: item.done ? '#15803d' : '#94a3b8',
                          fontWeight: item.done ? 600 : 400,
                          textDecoration: item.done ? 'none' : 'none',
                        }}>
                          {item.label}
                        </span>
                      </div>
                    ))}

                    {contrato?.valor_total_calculado > 0 && (
                      <div style={{ marginTop: '1rem', padding: '.85rem', background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '.65rem', color: '#15803d', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.2rem' }}>
                          Valor Total do Contrato
                        </div>
                        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.4rem', fontWeight: 700, color: '#15803d' }}>
                          {formatCurrency(contrato.valor_total_calculado)}
                        </div>
                      </div>
                    )}

                    <Link href={`/comercial/contratos?escola=${escolaId}`} className="btn btn-outline btn-sm" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                      Editar Jornada Contratual
                    </Link>
                  </div>
                </div>

                {/* Resumo de dados */}
                <div className="card">
                  <div className="card-header"><span className="card-title">Dados da Escola</span></div>
                  <div className="card-body">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                      {[
                        ['Infantil', escola.qtd_infantil],
                        ['Fund. I', escola.qtd_fund1],
                        ['Fund. II', escola.qtd_fund2],
                        ['Médio', escola.qtd_medio],
                        ['Total', escola.total_alunos ?? 0],
                        ['Potencial', formatCurrency(escola.potencial_financeiro ?? 0)],
                      ].map(([l, v]) => (
                        <div key={String(l)} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.82rem', padding: '.3rem 0', borderBottom: '1px solid var(--border)' }}>
                          <span style={{ color: 'var(--text-s)', fontFamily: 'var(--font-inter,sans-serif)' }}>{l}</span>
                          <span style={{ fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>{String(v)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                      <Link href={`/comercial/escolas/${escolaId}`} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Ver Ficha</Link>
                      <Link href={`/comercial/escolas/${escolaId}/editar`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Editar</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Estado vazio — sem escola selecionada */
          <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🗺️</div>
            <h2 style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.5rem', color: '#0f172a', marginBottom: '.5rem' }}>
              Selecione uma escola
            </h2>
            <p style={{ color: 'var(--text-s)', maxWidth: 400, margin: '0 auto', fontFamily: 'var(--font-inter,sans-serif)' }}>
              Escolha uma escola acima para visualizar sua jornada comercial completa, do primeiro contato até a parceria ativa.
            </p>
          </div>
        )}
      </div>

      {/* Animação pulse */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: .5; }
          50% { transform: scale(1.15); opacity: .2; }
        }
        select[name="escola"] { cursor: pointer; }
        select[name="escola"]:focus { border-color: #d97706; box-shadow: 0 0 0 3px rgba(217,119,6,.12); outline: none; }
      `}</style>

    </div>
  )
}
