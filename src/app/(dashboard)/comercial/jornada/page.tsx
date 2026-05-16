import { createClient } from '@/lib/supabase/server'
import { buscarEscolasUnificadas } from '@/lib/escolas-unificadas'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'
import { LABEL } from '@/types/database'
import { EscolaSelector } from '@/components/ui/EscolaSelector'

export const dynamic = 'force-dynamic'
export const revalidate = 5

interface Props { searchParams: Promise<{ escola?: string }> }

// ── Helpers de cor por classificação ────────────────────────────────────────
function corClassificacao(c: string | null | undefined) {
  if (c === 'quente') return '#ef4444'
  if (c === 'morno')  return '#d97706'
  return '#3b82f6'
}

function bgClassificacao(c: string | null | undefined) {
  if (c === 'quente') return 'rgba(239,68,68,0.10)'
  if (c === 'morno')  return 'rgba(217,119,6,0.10)'
  return 'rgba(59,130,246,0.10)'
}

function labelClassificacao(c: string | null | undefined) {
  if (c === 'quente') return 'Quente'
  if (c === 'morno')  return 'Morno'
  return 'Frio'
}

// ── Frase narrativa ──────────────────────────────────────────────────────────
function fraseNarrativa(total: number, parceiro: boolean) {
  if (parceiro) return 'Parceria consolidada. Um novo capítulo começa.'
  if (total === 0) return 'A história ainda vai começar.'
  if (total <= 2)  return 'Os primeiros capítulos foram escritos.'
  if (total <= 5)  return 'A relação está tomando forma.'
  return 'Uma jornada rica de relacionamento.'
}

// ── Título narrativo da interação ────────────────────────────────────────────
function tituloInteracao(r: any, index: number) {
  const meio = LABEL.meio_contato?.[r.meio_contato] ?? r.meio_contato
  if (index === 0) return `Primeiro contato via ${meio}`
  if (r.classificacao === 'quente') return `Aproximação decisiva — ${meio}`
  if (r.prontidao === 'contrato_enviado') return `Proposta enviada via ${meio}`
  if (r.prontidao === 'contrato_assinado') return `Contrato assinado — ${meio}`
  if (r.prontidao === 'apresentacao') return `Apresentação realizada via ${meio}`
  if (r.meio_contato === 'presencial') return `Visita presencial — capítulo ${index + 1}`
  return `Interação via ${meio} — capítulo ${index + 1}`
}

// ── Ícone SVG para meio de contato ──────────────────────────────────────────
function IconMeio({ tipo, size = 16, cor = '#64748b' }: { tipo: string; size?: number; cor?: string }) {
  const s = { width: size, height: size, display: 'block' as const, flexShrink: 0 as const }
  const base = { fill: 'none', stroke: cor, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (tipo === 'presencial') return (
    <svg viewBox="0 0 24 24" style={s} {...base}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
  if (tipo === 'whatsapp') return (
    <svg viewBox="0 0 24 24" style={s} {...base}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
  if (tipo === 'email') return (
    <svg viewBox="0 0 24 24" style={s} {...base}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  )
  if (tipo === 'telefone') return (
    <svg viewBox="0 0 24 24" style={s} {...base}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.73a16 16 0 0 0 6.29 6.29l1.62-1.34a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
  if (tipo === 'videoconf') return (
    <svg viewBox="0 0 24 24" style={s} {...base}>
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" style={s} {...base}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

// ── Ícones utilitários ───────────────────────────────────────────────────────
function IconMessage({ size = 16, cor = '#64748b' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function IconTrend({ size = 16, cor = '#64748b' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  )
}

function IconCurrency({ size = 16, cor = '#64748b' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}

function IconStar({ size = 18, cor = '#64748b' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

function IconClock({ size = 14, cor = '#64748b' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function IconArrowUp({ size = 14, cor = '#10b981' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  )
}

function IconArrowDown({ size = 14, cor = '#ef4444' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <polyline points="19 12 12 19 5 12"/>
    </svg>
  )
}

function IconCalendar({ size = 14, cor = '#3b82f6' }: { size?: number; cor?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={cor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

// ── Formatação de data ────────────────────────────────────────────────────────
function dataFormatada(d: string) {
  const dt = new Date(d + 'T12:00:00')
  return {
    dia: dt.toLocaleDateString('pt-BR', { day: '2-digit' }),
    mesAno: dt.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', ''),
    semana: dt.toLocaleDateString('pt-BR', { weekday: 'long' }),
  }
}

// ── Gráfico SVG de curva de engajamento ──────────────────────────────────────
function CurvaEngajamento({ registros }: { registros: any[] }) {
  if (!registros || registros.length === 0) {
    return (
      <div style={{
        height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.03)', borderRadius: 12,
        border: '1px dashed rgba(255,255,255,0.12)',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '.8rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
          Nenhuma interação registrada ainda
        </span>
      </div>
    )
  }

  const W = 800
  const H = 120
  const padX = 32
  const padY = 16
  const innerW = W - padX * 2
  const innerH = H - padY * 2

  const pts = registros.map((r: any, i: number) => {
    const x = registros.length === 1 ? padX + innerW / 2 : padX + (i / (registros.length - 1)) * innerW
    const y = padY + innerH - (r.probabilidade / 100) * innerH
    return { x, y, prob: r.probabilidade, cls: r.classificacao }
  })

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = `M${pts[0].x},${H - padY} ` +
    pts.map(p => `L${p.x},${p.y}`).join(' ') +
    ` L${pts[pts.length - 1].x},${H - padY} Z`

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height={H}
      preserveAspectRatio="none"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.30"/>
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.02"/>
        </linearGradient>
      </defs>
      {/* Grade horizontal */}
      {[0, 25, 50, 75, 100].map(pct => {
        const yg = padY + innerH - (pct / 100) * innerH
        return (
          <g key={pct}>
            <line x1={padX} y1={yg} x2={W - padX} y2={yg} stroke="rgba(255,255,255,0.06)" strokeWidth={1}/>
            <text x={padX - 6} y={yg + 4} fill="rgba(255,255,255,0.25)" fontSize={9} textAnchor="end"
              fontFamily="var(--font-inter,sans-serif)">{pct}%</text>
          </g>
        )
      })}
      {/* Área preenchida */}
      <path d={areaPath} fill="url(#areaGrad)"/>
      {/* Linha de tendência */}
      <polyline points={polyline} fill="none" stroke="#d97706" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"/>
      {/* Pontos */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={6} fill={corClassificacao(p.cls)} stroke="rgba(15,23,42,0.8)" strokeWidth={2}/>
          <text x={p.x} y={H - 2} fill="rgba(255,255,255,0.35)" fontSize={9} textAnchor="middle"
            fontFamily="var(--font-inter,sans-serif)">{i + 1}</text>
        </g>
      ))}
    </svg>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export default async function JornadaPage({ searchParams }: Props) {
  const params = await searchParams
  const escolaId = params.escola ?? ''
  const supabase = await createClient()

  const escolas = await buscarEscolasUnificadas(supabase)

  let escola: any = null
  let registros: any[] = []
  let tarefas: any[] = []
  let negociacoes: any[] = []
  let contrato: any = null

  if (escolaId) {
    const [r0, r1, r2, r3, r4] = await Promise.all([
      supabase.from('escolas_resumo').select('*').eq('id', escolaId).single(),
      supabase.from('registros').select('*, responsavel:profiles!responsavel_id(full_name)').eq('escola_id', escolaId).order('data_contato'),
      supabase.from('tarefas').select('*').eq('escola_id', escolaId).eq('status', 'pendente').order('vencimento'),
      supabase.from('negociacoes').select('*').eq('escola_id', escolaId).eq('ativa', true),
      supabase.from('contratos').select('contrato_assinado, contrato_arquivado').eq('escola_id', escolaId).single(),
    ])
    escola      = r0.data
    registros   = r1.data ?? []
    tarefas     = r2.data ?? []
    negociacoes = r3.data ?? []
    contrato    = r4.data
  }

  const parceiro = contrato?.contrato_arquivado === true
  const assinado = contrato?.contrato_assinado === true
  const totalRegistros = registros.length
  const hoje = new Date()
  const tarefasVencidas = tarefas.filter((t: any) => t.vencimento && new Date(t.vencimento + 'T00:00:00') < hoje)

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <style>{`
        @keyframes pulseRing {
          0%,100% { transform: scale(1); opacity: .6 }
          50%      { transform: scale(1.25); opacity: .15 }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px) }
          to   { opacity: 1; transform: translateY(0) }
        }
        @keyframes fadeIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        .jornada-chapter { animation: fadeInUp .4s ease both }
        .jornada-chapter:nth-child(1) { animation-delay: .05s }
        .jornada-chapter:nth-child(2) { animation-delay: .10s }
        .jornada-chapter:nth-child(3) { animation-delay: .15s }
        .jornada-chapter:nth-child(4) { animation-delay: .20s }
        .jornada-chapter:nth-child(5) { animation-delay: .25s }
        .jornada-chapter:nth-child(6) { animation-delay: .30s }
        .jornada-chapter:nth-child(n+7) { animation-delay: .35s }
        .pulse-ring {
          position: absolute; inset: -5px; border-radius: 50%;
          border: 2px solid currentColor; opacity: .5;
          animation: pulseRing 2s ease-in-out infinite;
          pointer-events: none;
        }

        /* ============ TIMELINE INFOGRÁFICA — JORNADA DE RELACIONAMENTO ============ */
        /* Mobile-first: linha à esquerda, card único à direita */
        .jornada-timeline { position: relative }
        .jornada-rail {
          position: absolute;
          top: 0; bottom: 0;
          left: 24px;
          width: 2px;
          background: linear-gradient(to bottom, transparent 0%, #e2e8f0 6%, #cbd5e1 50%, #e2e8f0 94%, transparent 100%);
          z-index: 0;
        }
        .jornada-row {
          display: grid;
          grid-template-columns: 48px 1fr;
          align-items: start;
          gap: 0;
          animation: fadeInUp .45s ease both;
        }
        .jornada-row:nth-child(1) { animation-delay: .05s }
        .jornada-row:nth-child(2) { animation-delay: .10s }
        .jornada-row:nth-child(3) { animation-delay: .15s }
        .jornada-row:nth-child(4) { animation-delay: .20s }
        .jornada-row:nth-child(5) { animation-delay: .25s }
        .jornada-row:nth-child(6) { animation-delay: .30s }
        .jornada-row:nth-child(n+7) { animation-delay: .35s }

        .jornada-marker-slot {
          grid-column: 1 / 2;
          grid-row: 1 / 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 14px;
          position: relative;
          z-index: 2;
        }
        .jornada-marker {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border-style: solid;
          border-width: 3px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-montserrat, sans-serif);
          font-weight: 800;
          font-size: .9rem;
          transition: transform .2s ease;
        }
        .jornada-marker--last { animation: pulseRing 2s ease-in-out infinite }
        .jornada-progress-badge {
          margin-top: 8px;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #ffffff;
          border-style: solid;
          border-width: 1px;
          border-radius: 999px;
          padding: 2px 7px;
          font-size: .62rem;
          font-weight: 800;
          font-family: var(--font-montserrat, sans-serif);
          white-space: nowrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }

        .jornada-card-slot {
          grid-column: 2 / 3;
          grid-row: 1 / 2;
          padding-left: 16px;
          min-width: 0;
        }
        .jornada-card {
          background: #ffffff;
          border-radius: 14px;
          border-style: solid;
          border-width: 1px;
          overflow: hidden;
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .jornada-card:hover {
          transform: translateY(-2px);
        }
        .jornada-card-stripe { height: 4px }
        .jornada-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 1rem 1.25rem .65rem;
        }

        /* Desktop (≥ 900px): timeline com cards alternados esq/dir, linha central */
        @media (min-width: 900px) {
          .jornada-rail {
            left: 50%;
            transform: translateX(-50%);
          }
          .jornada-row {
            grid-template-columns: 1fr 80px 1fr;
          }
          .jornada-marker-slot {
            grid-column: 2 / 3;
          }
          .jornada-row--esquerda .jornada-card-slot {
            grid-column: 1 / 2;
            justify-self: end;
            padding-left: 0;
            padding-right: 24px;
            max-width: 100%;
          }
          .jornada-row--direita .jornada-card-slot {
            grid-column: 3 / 4;
            justify-self: start;
            padding-left: 24px;
            padding-right: 0;
            max-width: 100%;
          }
        }
      `}</style>

      <PageHeader
        title="Jornada de Relacionamento"
        subtitle="Infográfico narrativo da relação comercial com cada escola"
        actions={escolaId ? (
          <Link
            href={`/comercial/registros/novo?escola=${escolaId}`}
            className="btn btn-primary"
            style={{ fontSize: '.8rem', gap: '.4rem', display: 'flex', alignItems: 'center' }}
          >
            <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova Interação
          </Link>
        ) : undefined}
      />

      {/* ── BARRA DE SELEÇÃO ─────────────────────────────────────────────── */}
      <div style={{
        background: '#1e293b',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '.85rem 1.75rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
      }}>
        <EscolaSelector
          escolas={escolas ?? []}
          escolaId={escolaId}
          basePath="/comercial/jornada"
          extraButton={escola ? (
            <Link href={`/comercial/escolas/${escolaId}`} className="btn btn-ghost" style={{ fontSize: '.78rem' }}>
              Ver Ficha
            </Link>
          ) : undefined}
        />
        {escolaId && (
          <Link
            href={`/comercial/registros/novo?escola=${escolaId}`}
            className="btn btn-primary"
            style={{ fontSize: '.78rem', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '.35rem' }}
          >
            <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova Interação
          </Link>
        )}
      </div>

      {/* ── ESTADO: SEM ESCOLA SELECIONADA ───────────────────────────────── */}
      {!escola && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '6rem 1rem', textAlign: 'center',
          animation: 'fadeIn .5s ease',
        }}>
          <svg viewBox="0 0 80 80" width={80} height={80} fill="none" style={{ marginBottom: '1.5rem', opacity: .35 }}>
            <circle cx="40" cy="40" r="36" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 4"/>
            <path d="M28 40h24M40 28v24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h2 style={{
            fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.5rem', fontWeight: 700,
            color: '#0f172a', marginBottom: '.5rem',
          }}>
            Selecione uma escola para começar
          </h2>
          <p style={{ color: '#64748b', fontSize: '.9rem', fontFamily: 'var(--font-inter,sans-serif)', maxWidth: 380 }}>
            Escolha uma escola no seletor acima para visualizar o infográfico completo da sua jornada de relacionamento.
          </p>
        </div>
      )}

      {/* ── CONTEÚDO COM ESCOLA SELECIONADA ─────────────────────────────── */}
      {escola && (
        <>
          {/* ── HERO NARRATIVO ─────────────────────────────────────────── */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)',
            padding: '2.5rem 1.75rem 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '2rem',
                alignItems: 'start',
              }}>
                {/* Lado esquerdo — identidade */}
                <div style={{ animation: 'fadeInUp .4s ease' }}>
                  <div style={{
                    fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em',
                    color: '#d97706', textTransform: 'uppercase',
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                    marginBottom: '.75rem',
                    display: 'flex', alignItems: 'center', gap: '.4rem',
                  }}>
                    <svg viewBox="0 0 8 8" width={8} height={8} fill="#d97706"><polygon points="4,0 5.4,2.6 8,3.1 6,5 6.5,7.6 4,6.3 1.5,7.6 2,5 0,3.1 2.6,2.6"/></svg>
                    Jornada de Relacionamento
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-cormorant,serif)',
                    fontSize: '2rem', fontWeight: 700, color: '#ffffff',
                    lineHeight: 1.1, marginBottom: '.5rem',
                  }}>
                    {escola.nome}
                  </h2>
                  <div style={{
                    fontSize: '.85rem', color: 'rgba(255,255,255,0.5)',
                    fontFamily: 'var(--font-inter,sans-serif)',
                    marginBottom: '1.25rem',
                  }}>
                    {escola.cidade ?? ''}{escola.estado ? `, ${escola.estado}` : ''}
                    {escola.perfil_pedagogico
                      ? `  ·  ${LABEL.perfil_pedagogico?.[escola.perfil_pedagogico] ?? ''}`
                      : ''}
                    {escola.total_alunos ? `  ·  ${escola.total_alunos} alunos` : ''}
                  </div>
                  <p style={{
                    fontFamily: 'var(--font-cormorant,serif)',
                    fontSize: '1.1rem', fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.7)',
                    borderLeft: '3px solid #d97706',
                    paddingLeft: '.85rem',
                    lineHeight: 1.5,
                  }}>
                    {fraseNarrativa(totalRegistros, parceiro)}
                  </p>
                </div>

                {/* Lado direito — métricas */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '.75rem',
                  animation: 'fadeInUp .4s .1s ease both',
                }}>
                  {/* Interações */}
                  <div style={{
                    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 12, padding: '1rem 1.15rem',
                    display: 'flex', flexDirection: 'column', gap: '.4rem',
                    minWidth: 120,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <IconMessage size={14} cor="#94a3b8"/>
                      <span style={{ fontSize: '.7rem', color: '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Interações
                      </span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'var(--font-cormorant,serif)', lineHeight: 1 }}>
                      {totalRegistros}
                    </div>
                  </div>

                  {/* Probabilidade */}
                  <div style={{
                    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 12, padding: '1rem 1.15rem',
                    display: 'flex', flexDirection: 'column', gap: '.4rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <IconTrend size={14} cor="#94a3b8"/>
                      <span style={{ fontSize: '.7rem', color: '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Probabilidade
                      </span>
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-cormorant,serif)', lineHeight: 1 }}>
                      {escola.probabilidade_atual ?? 0}%
                    </div>
                  </div>

                  {/* Potencial */}
                  <div style={{
                    background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: 12, padding: '1rem 1.15rem',
                    display: 'flex', flexDirection: 'column', gap: '.4rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                      <IconCurrency size={14} cor="#94a3b8"/>
                      <span style={{ fontSize: '.7rem', color: '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        Potencial
                      </span>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-cormorant,serif)', lineHeight: 1 }}>
                      {formatCurrency(escola.potencial_financeiro ?? 0)}
                    </div>
                  </div>

                  {/* Classificação */}
                  <div style={{
                    background: `linear-gradient(135deg, ${bgClassificacao(escola.classificacao_atual)}, rgba(255,255,255,0.04))`,
                    backdropFilter: 'blur(8px)',
                    border: `1px solid ${corClassificacao(escola.classificacao_atual)}40`,
                    borderRadius: 12, padding: '1rem 1.15rem',
                    display: 'flex', flexDirection: 'column', gap: '.4rem',
                  }}>
                    <span style={{ fontSize: '.7rem', color: '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Classificação
                    </span>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      background: `${corClassificacao(escola.classificacao_atual)}20`,
                      border: `1px solid ${corClassificacao(escola.classificacao_atual)}50`,
                      borderRadius: 20, padding: '.3rem .85rem',
                      fontSize: '.85rem', fontWeight: 700,
                      color: corClassificacao(escola.classificacao_atual),
                      fontFamily: 'var(--font-montserrat,sans-serif)',
                      width: 'fit-content',
                    }}>
                      {labelClassificacao(escola.classificacao_atual)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Curva de engajamento */}
              <div style={{ marginTop: '2rem', animation: 'fadeInUp .4s .2s ease both' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '.6rem',
                }}>
                  <span style={{
                    fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em',
                    color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                  }}>
                    Curva de Engajamento — Evolução da Probabilidade
                  </span>
                  <span style={{ fontSize: '.7rem', color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-inter,sans-serif)' }}>
                    {totalRegistros} {totalRegistros === 1 ? 'ponto' : 'pontos'}
                  </span>
                </div>
                <div style={{ borderRadius: 12, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', padding: '1rem 0 .5rem' }}>
                  <CurvaEngajamento registros={registros}/>
                </div>
              </div>
            </div>
          </div>

          {/* ── CORPO: TIMELINE + SIDEBAR ───────────────────────────────── */}
          <div style={{
            maxWidth: 1200, margin: '0 auto',
            padding: '2rem 1.75rem',
            display: 'grid',
            gridTemplateColumns: '1fr 240px',
            gap: '2rem',
            alignItems: 'start',
          }}>

            {/* ── TIMELINE PRINCIPAL ─────────────────────────────────────── */}
            <div>

              {/* Sem registros */}
              {totalRegistros === 0 && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '3.5rem 1rem', textAlign: 'center',
                  background: '#ffffff', borderRadius: 16,
                  border: '2px dashed #e2e8f0',
                  animation: 'fadeIn .4s ease',
                }}>
                  <svg viewBox="0 0 48 48" width={48} height={48} fill="none" style={{ marginBottom: '1rem', opacity: .4 }}>
                    <circle cx="24" cy="24" r="20" stroke="#94a3b8" strokeWidth="1.5"/>
                    <line x1="24" y1="16" x2="24" y2="32" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                    <line x1="16" y1="24" x2="32" y2="24" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <h3 style={{
                    fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.3rem', fontWeight: 700,
                    color: '#0f172a', marginBottom: '.4rem',
                  }}>
                    Nenhuma interação registrada
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '.875rem', fontFamily: 'var(--font-inter,sans-serif)', maxWidth: 340, marginBottom: '1.25rem' }}>
                    Registre o primeiro contato com esta escola para começar a construir a jornada de relacionamento.
                  </p>
                  <Link href={`/comercial/registros/novo?escola=${escolaId}`} className="btn btn-primary">
                    Registrar Primeiro Contato
                  </Link>
                </div>
              )}

              {/* Linha do tempo com registros — INFOGRÁFICO VERTICAL SEM SOBREPOSIÇÃO */}
              {totalRegistros > 0 && (
                <div className="jornada-timeline" style={{ position: 'relative', paddingTop: 8, paddingBottom: 8 }}>

                  {/* Linha vertical contínua (único elemento absolute do container) */}
                  <div className="jornada-rail" aria-hidden="true" />

                  {/* Lista de capítulos em fluxo natural (flex column + gap) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', position: 'relative', zIndex: 1 }}>
                    {registros.map((r: any, idx: number) => {
                      const prev = idx > 0 ? registros[idx - 1] : null
                      const corAtual = corClassificacao(r.classificacao)
                      const bgAtual = bgClassificacao(r.classificacao)
                      const isLast = idx === registros.length - 1
                      const lado: 'esquerda' | 'direita' = idx % 2 === 0 ? 'esquerda' : 'direita'
                      const dt = dataFormatada(r.data_contato)

                      // Progressão da probabilidade vs registro anterior
                      let progressao: 'subiu' | 'caiu' | 'igual' = 'igual'
                      let delta = 0
                      if (prev && typeof r.probabilidade === 'number' && typeof prev.probabilidade === 'number') {
                        delta = r.probabilidade - prev.probabilidade
                        if (delta > 0) progressao = 'subiu'
                        else if (delta < 0) progressao = 'caiu'
                      }

                      return (
                        <div
                          key={r.id}
                          className={`jornada-row jornada-row--${lado}`}
                        >
                          {/* ============ MARCADOR CENTRAL (numero do capitulo) ============ */}
                          <div className="jornada-marker-slot">
                            <div
                              className={isLast ? 'jornada-marker jornada-marker--last' : 'jornada-marker'}
                              style={{
                                borderColor: corAtual,
                                color: corAtual,
                                boxShadow: isLast
                                  ? `0 0 0 4px ${bgAtual}, 0 0 0 8px ${corAtual}33, 0 8px 20px ${corAtual}33`
                                  : `0 2px 6px rgba(15,23,42,0.10)`,
                              }}
                            >
                              {idx + 1}
                            </div>

                            {/* Badge de progressão (logo abaixo do marcador) */}
                            {prev && progressao !== 'igual' && (
                              <div
                                className="jornada-progress-badge"
                                style={{
                                  borderColor: progressao === 'subiu' ? '#10b981' : '#ef4444',
                                  color: progressao === 'subiu' ? '#10b981' : '#ef4444',
                                }}
                              >
                                {progressao === 'subiu' ? <IconArrowUp size={10} cor="#10b981"/> : <IconArrowDown size={10} cor="#ef4444"/>}
                                {delta > 0 ? '+' : ''}{delta}%
                              </div>
                            )}
                          </div>

                          {/* ============ CARD DO CAPÍTULO ============ */}
                          <div className="jornada-card-slot">
                            <article
                              className="jornada-card"
                              style={{
                                border: `1px solid ${corAtual}33`,
                                boxShadow: `0 1px 3px rgba(0,0,0,0.04), 0 12px 30px -10px ${corAtual}24`,
                              }}
                            >
                              {/* Faixa colorida superior */}
                              <div
                                className="jornada-card-stripe"
                                style={{ background: `linear-gradient(90deg, ${corAtual} 0%, ${corAtual}88 100%)` }}
                              />

                              {/* CABEÇALHO: data + meio + responsável + badge classificação */}
                              <div className="jornada-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap', flex: 1 }}>
                                  {/* Data em destaque */}
                                  <div style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    background: bgAtual,
                                    border: `1px solid ${corAtual}30`,
                                    borderRadius: 10, padding: '.4rem .65rem',
                                    minWidth: 52, lineHeight: 1,
                                  }}>
                                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: corAtual, fontFamily: 'var(--font-cormorant,serif)' }}>
                                      {dt.dia}
                                    </span>
                                    <span style={{ fontSize: '.58rem', color: '#475569', fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 700, textTransform: 'uppercase', marginTop: 2, letterSpacing: '.04em' }}>
                                      {dt.mesAno}
                                    </span>
                                  </div>

                                  {/* Meio + dia da semana + responsável */}
                                  <div style={{ minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.15rem' }}>
                                      <IconMeio tipo={r.meio_contato} size={14} cor={corAtual}/>
                                      <span style={{ fontSize: '.78rem', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-montserrat,sans-serif)', textTransform: 'capitalize' }}>
                                        {r.meio_contato}
                                      </span>
                                      <span style={{ color: '#cbd5e1' }}>·</span>
                                      <span style={{ fontSize: '.72rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', textTransform: 'capitalize' }}>
                                        {dt.semana}
                                      </span>
                                    </div>
                                    {r.responsavel?.full_name && (
                                      <span style={{ fontSize: '.72rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                        por <span style={{ color: '#334155', fontWeight: 600 }}>{r.responsavel.full_name}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Badge classificação */}
                                <div style={{
                                  background: bgAtual,
                                  border: `1px solid ${corAtual}44`,
                                  borderRadius: 999, padding: '.25rem .7rem',
                                  fontSize: '.68rem', fontWeight: 800,
                                  color: corAtual,
                                  fontFamily: 'var(--font-montserrat,sans-serif)',
                                  whiteSpace: 'nowrap',
                                  textTransform: 'uppercase', letterSpacing: '.06em',
                                  flexShrink: 0,
                                }}>
                                  {labelClassificacao(r.classificacao)}
                                </div>
                              </div>

                              {/* Título narrativo */}
                              <h4 style={{
                                fontFamily: 'var(--font-cormorant,serif)',
                                fontSize: '1.15rem', fontWeight: 700,
                                color: '#0f172a', lineHeight: 1.3,
                                padding: '0 1.25rem',
                                margin: '0 0 .25rem 0',
                              }}>
                                {tituloInteracao(r, idx)}
                              </h4>

                              {/* BARRA DE PROBABILIDADE */}
                              {typeof r.probabilidade === 'number' && (
                                <div style={{ padding: '0 1.25rem .75rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: '.64rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                      Probabilidade de fechamento
                                    </span>
                                    <span style={{ fontSize: '1rem', fontWeight: 800, color: corAtual, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                      {r.probabilidade}%
                                    </span>
                                  </div>
                                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                                    <div style={{
                                      height: '100%',
                                      width: `${r.probabilidade}%`,
                                      background: `linear-gradient(90deg, ${corAtual}aa 0%, ${corAtual} 100%)`,
                                      borderRadius: 999,
                                    }}/>
                                  </div>
                                </div>
                              )}

                              {/* RESUMO em destaque */}
                              {r.resumo && (
                                <div style={{
                                  padding: '.85rem 1.25rem',
                                  background: '#fafbfc',
                                  borderTop: '1px solid #f1f5f9',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontSize: '.85rem',
                                  color: '#475569',
                                  lineHeight: 1.6,
                                  fontFamily: 'var(--font-inter,sans-serif)',
                                  whiteSpace: 'pre-wrap',
                                }}>
                                  <span style={{ color: corAtual, fontWeight: 800, marginRight: 4, fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem' }}>“</span>
                                  {r.resumo}
                                  <span style={{ color: corAtual, fontWeight: 800, marginLeft: 4, fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem' }}>”</span>
                                </div>
                              )}

                              {/* GRID DE MÉTRICAS: interesse + prontidão */}
                              {(r.interesse || r.prontidao) && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#f1f5f9' }}>
                                  {r.interesse && (
                                    <div style={{ background: '#fff', padding: '.7rem 1.25rem' }}>
                                      <div style={{ fontSize: '.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                        Interesse
                                      </div>
                                      <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                        {LABEL.interesse?.[r.interesse] ?? r.interesse}
                                      </div>
                                    </div>
                                  )}
                                  {r.prontidao && (
                                    <div style={{ background: '#fff', padding: '.7rem 1.25rem' }}>
                                      <div style={{ fontSize: '.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                        Prontidão
                                      </div>
                                      <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#0f172a', textTransform: 'capitalize', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                        {LABEL.prontidao?.[r.prontidao] ?? r.prontidao}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* CONTATO (avatar com inicial + nome + cargo) */}
                              {(r.contato_nome || r.contato_cargo) && (
                                <div style={{
                                  padding: '.75rem 1.25rem',
                                  borderTop: '1px solid #f1f5f9',
                                  display: 'flex', alignItems: 'center', gap: '.7rem',
                                }}>
                                  <div style={{
                                    width: 34, height: 34, borderRadius: '50%',
                                    background: `${corAtual}1a`, color: corAtual,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: '.85rem',
                                    fontFamily: 'var(--font-montserrat,sans-serif)',
                                    flexShrink: 0,
                                  }}>
                                    {(r.contato_nome || '?').charAt(0).toUpperCase()}
                                  </div>
                                  <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                      {r.contato_nome || '—'}
                                    </div>
                                    {r.contato_cargo && (
                                      <div style={{ fontSize: '.7rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                        {r.contato_cargo}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* ENCAMINHAMENTOS (lista com bullets) */}
                              {r.encaminhamentos?.length > 0 && (
                                <div style={{ padding: '.75rem 1.25rem', borderTop: '1px solid #f1f5f9' }}>
                                  <div style={{ fontSize: '.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.5rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                    Encaminhamentos
                                  </div>
                                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                                    {r.encaminhamentos.map((enc: string, ei: number) => (
                                      <li key={ei} style={{ display: 'flex', alignItems: 'flex-start', gap: '.5rem', fontSize: '.78rem', color: '#334155', lineHeight: 1.5, fontFamily: 'var(--font-inter,sans-serif)' }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: corAtual, marginTop: 7, flexShrink: 0 }}/>
                                        <span style={{ flex: 1 }}>{enc}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* PRÓXIMO CONTATO (footer destacado) */}
                              {r.proximo_contato && (
                                <div style={{
                                  padding: '.65rem 1.25rem',
                                  background: `${corAtual}0d`,
                                  borderTop: `1px dashed ${corAtual}55`,
                                  display: 'flex', alignItems: 'center', gap: '.5rem',
                                  fontSize: '.78rem', fontFamily: 'var(--font-inter,sans-serif)',
                                }}>
                                  <IconCalendar size={13} cor={corAtual}/>
                                  <span style={{ color: '#64748b' }}>Próximo contato:</span>
                                  <span style={{ fontWeight: 700, color: corAtual, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                                    {formatDate(r.proximo_contato)}
                                  </span>
                                </div>
                              )}
                            </article>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* ── MARCADOR DE STATUS ATUAL ────────────────────────────── */}
              {totalRegistros > 0 && (
                <div style={{ marginTop: '1rem', animation: 'fadeInUp .4s .3s ease both' }}>
                  {parceiro && (
                    <div style={{
                      background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
                      border: '2px solid #16a34a',
                      borderRadius: 16, padding: '1.5rem',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <IconStar size={22} cor="#ffffff"/>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#14532d' }}>
                          Parceria Ativa
                        </div>
                        <div style={{ fontSize: '.82rem', color: '#166534', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          A jornada culminou em parceria. Um novo capítulo começa.
                        </div>
                      </div>
                    </div>
                  )}
                  {!parceiro && assinado && (
                    <div style={{
                      background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                      border: '2px solid #2563eb',
                      borderRadius: 16, padding: '1.5rem',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <polyline points="9 15 11 17 15 13"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#1e3a8a' }}>
                          Contrato Assinado
                        </div>
                        <div style={{ fontSize: '.82rem', color: '#1d4ed8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          Contrato assinado. Aguardando arquivamento e ativação da parceria.
                        </div>
                      </div>
                    </div>
                  )}
                  {!parceiro && !assinado && (
                    <div style={{
                      background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
                      border: '2px solid #d97706',
                      borderRadius: 16, padding: '1.5rem',
                      display: 'flex', alignItems: 'center', gap: '1rem',
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <IconTrend size={22} cor="#ffffff"/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.2rem', fontWeight: 700, color: '#78350f' }}>
                          Em Negociação — Continue a Jornada
                        </div>
                        <div style={{ fontSize: '.82rem', color: '#92400e', fontFamily: 'var(--font-inter,sans-serif)' }}>
                          A história ainda está sendo escrita. Cada interação aproxima da parceria.
                        </div>
                      </div>
                      <Link
                        href={`/comercial/registros/novo?escola=${escolaId}`}
                        className="btn btn-primary"
                        style={{ fontSize: '.78rem', flexShrink: 0 }}
                      >
                        Registrar Interação
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Status sem registros */}
              {totalRegistros === 0 && (
                <div style={{
                  marginTop: '1.5rem',
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  borderRadius: 16, padding: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  animation: 'fadeIn .4s ease',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconClock size={18} cor="#94a3b8"/>
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.1rem', fontWeight: 700, color: '#475569' }}>
                      Aguardando Primeiro Contato
                    </div>
                    <div style={{ fontSize: '.8rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      Nenhuma interação foi registrada ainda com esta escola.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: 80 }}>

              {/* Próximos passos / Tarefas */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
              }}>
                <div style={{
                  padding: '.85rem 1rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                    fontSize: '.75rem', fontWeight: 700,
                    color: '#0f172a', textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>
                    Proximos Passos
                  </span>
                  {tarefas.length > 0 && (
                    <span style={{
                      background: tarefasVencidas.length > 0 ? '#fef2f2' : '#f0fdf4',
                      color: tarefasVencidas.length > 0 ? '#ef4444' : '#16a34a',
                      border: `1px solid ${tarefasVencidas.length > 0 ? '#fecaca' : '#bbf7d0'}`,
                      borderRadius: 20, padding: '.1rem .5rem',
                      fontSize: '.65rem', fontWeight: 700,
                      fontFamily: 'var(--font-montserrat,sans-serif)',
                    }}>
                      {tarefas.length}
                    </span>
                  )}
                </div>
                <div style={{ padding: '.75rem' }}>
                  {tarefas.length === 0 ? (
                    <p style={{ fontSize: '.78rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)', textAlign: 'center', padding: '.5rem 0' }}>
                      Sem tarefas pendentes
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                      {tarefas.slice(0, 5).map((t: any) => {
                        const vencida = t.vencimento && new Date(t.vencimento + 'T00:00:00') < hoje
                        const corPrio = t.prioridade === 'urgente' ? '#ef4444' : t.prioridade === 'alta' ? '#f97316' : t.prioridade === 'media' ? '#d97706' : '#64748b'
                        return (
                          <div key={t.id} style={{
                            padding: '.55rem .65rem',
                            background: vencida ? '#fff1f2' : '#f8fafc',
                            border: `1px solid ${vencida ? '#fecaca' : '#e2e8f0'}`,
                            borderLeft: `3px solid ${vencida ? '#ef4444' : corPrio}`,
                            borderRadius: 8,
                          }}>
                            <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.3, marginBottom: '.2rem' }}>
                              {t.titulo}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.3rem' }}>
                              <IconClock size={11} cor={vencida ? '#ef4444' : '#94a3b8'}/>
                              <span style={{ fontSize: '.67rem', color: vencida ? '#ef4444' : '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                                {formatDate(t.vencimento)}
                              </span>
                              <span style={{
                                marginLeft: 'auto',
                                fontSize: '.62rem', color: corPrio,
                                fontFamily: 'var(--font-montserrat,sans-serif)', fontWeight: 700,
                                textTransform: 'uppercase',
                              }}>
                                {t.prioridade}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                      {tarefas.length > 5 && (
                        <Link href={`/comercial/escolas/${escolaId}?tab=tarefas`} style={{
                          fontSize: '.72rem', color: '#3b82f6', textAlign: 'center', padding: '.3rem',
                          fontFamily: 'var(--font-inter,sans-serif)', textDecoration: 'none',
                        }}>
                          Ver todas ({tarefas.length} tarefas)
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Negociações ativas */}
              {negociacoes.length > 0 && (
                <div style={{
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  borderRadius: 12, overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                }}>
                  <div style={{
                    padding: '.85rem 1rem',
                    borderBottom: '1px solid #f1f5f9',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-montserrat,sans-serif)',
                      fontSize: '.75rem', fontWeight: 700,
                      color: '#0f172a', textTransform: 'uppercase', letterSpacing: '.06em',
                    }}>
                      Negociacoes Ativas
                    </span>
                  </div>
                  <div style={{ padding: '.75rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {negociacoes.map((n: any) => (
                      <div key={n.id} style={{
                        background: '#f8fafc', border: '1px solid #e2e8f0',
                        borderRadius: 8, padding: '.65rem .75rem',
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          background: '#1e293b', color: '#475569',
                          borderRadius: 20, padding: '.15rem .55rem',
                          fontSize: '.65rem', fontWeight: 700,
                          fontFamily: 'var(--font-montserrat,sans-serif)',
                          textTransform: 'uppercase', letterSpacing: '.04em',
                          marginBottom: '.4rem',
                        }}>
                          {LABEL.stage?.[n.stage] ?? n.stage}
                        </div>
                        {n.valor_estimado && (
                          <div style={{
                            fontSize: '1rem', fontWeight: 800,
                            color: '#d97706', fontFamily: 'var(--font-cormorant,serif)',
                            lineHeight: 1,
                          }}>
                            {formatCurrency(n.valor_estimado)}
                          </div>
                        )}
                        {/* Barra mini de probabilidade */}
                        <div style={{ marginTop: '.45rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.2rem' }}>
                            <span style={{ fontSize: '.62rem', color: '#475569', fontFamily: 'var(--font-inter,sans-serif)' }}>Probabilidade</span>
                            <span style={{ fontSize: '.62rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', fontWeight: 700 }}>{n.probabilidade}%</span>
                          </div>
                          <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 2,
                              width: `${n.probabilidade}%`,
                              background: n.probabilidade >= 70 ? '#10b981' : n.probabilidade >= 40 ? '#d97706' : '#94a3b8',
                            }}/>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações rápidas */}
              <div style={{
                background: '#ffffff', border: '1px solid #e2e8f0',
                borderRadius: 12, overflow: 'hidden',
                boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
              }}>
                <div style={{
                  padding: '.85rem 1rem',
                  borderBottom: '1px solid #f1f5f9',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                    fontSize: '.75rem', fontWeight: 700,
                    color: '#0f172a', textTransform: 'uppercase', letterSpacing: '.06em',
                  }}>
                    Acoes Rapidas
                  </span>
                </div>
                <div style={{ padding: '.75rem', display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
                  <Link
                    href={`/comercial/registros/novo?escola=${escolaId}`}
                    className="btn btn-primary"
                    style={{ fontSize: '.78rem', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '.4rem' }}
                  >
                    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nova Interacao
                  </Link>
                  <Link
                    href={`/comercial/escolas/${escolaId}`}
                    className="btn btn-outline"
                    style={{ fontSize: '.78rem', justifyContent: 'center' }}
                  >
                    Ver Ficha
                  </Link>
                  <Link
                    href={`/comercial/jornada-visual?escola=${escolaId}`}
                    className="btn btn-ghost"
                    style={{ fontSize: '.78rem', justifyContent: 'center' }}
                  >
                    Jornada Visual
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
