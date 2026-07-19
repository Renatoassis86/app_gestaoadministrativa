import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import { formatCurrency } from '@/lib/utils'
import { ContadorRegressivo } from '@/components/metas/ContadorRegressivo'

// ══════════════════════════════════════════════════
// METAS 2027 — Plano Estratégico CVE
// ══════════════════════════════════════════════════
const METAS = {
  // Prospecção
  reunioes_meta:      80,    // reuniões com escolas únicas até agosto/2027
  reunioes_prazo:     'agosto/2027',

  // Escolas
  escolas_atuais:     25,    // escolas hoje
  escolas_novas_meta: 26,    // novas parcerias a conquistar
  escolas_total_meta: 51,    // 25 + 26

  // Alunos — detalhamento
  alunos_atuais:      2000,  // alunos nas escolas atuais hoje
  alunos_fund1_meta:  1000,  // crescimento Fund I nas escolas atuais (adesão material)
  alunos_novas_meta:  2000,  // alunos vindos das 26 novas escolas
  alunos_total_meta:  5000,  // 2000 + 1000 + 2000

  // Data
  ano: 2027,
}

function BarraMeta({ pct, cor, height = 10 }: { pct: number; cor: string; height?: number }) {
  const p = Math.min(100, Math.max(0, pct))
  return (
    <div style={{ height, background: 'rgba(255,255,255,.06)', borderRadius: height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${p}%`, borderRadius: height,
        background: p >= 100 ? '#16a34a' : cor,
        transition: 'width .8s ease',
        boxShadow: p > 0 ? `0 0 12px ${cor}66` : 'none',
      }} />
    </div>
  )
}

function BarraMetaClara({ pct, cor, height = 10 }: { pct: number; cor: string; height?: number }) {
  const p = Math.min(100, Math.max(0, pct))
  return (
    <div style={{ height, background: '#f1f5f9', borderRadius: height, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${p}%`, borderRadius: height,
        background: p >= 100 ? '#16a34a' : cor,
        transition: 'width .8s ease',
      }} />
    </div>
  )
}

/**
 * Donut SVG de progresso (anel circular). Renderiza % no centro.
 */
function DonutMeta({ pct, cor, size = 160, stroke = 14, label, sublabel }: {
  pct: number; cor: string; size?: number; stroke?: number; label: string; sublabel?: string
}) {
  const p = Math.min(100, Math.max(0, pct))
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (p / 100) * c
  const center = size / 2
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        <circle
          cx={center} cy={center} r={r} fill="none"
          stroke={p >= 100 ? '#16a34a' : cor} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${cor}88)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
        <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: size * 0.30, fontWeight: 800, color: '#fff' }}>
          {p}<span style={{ fontSize: size * 0.14, color: 'rgba(255,255,255,.6)' }}>%</span>
        </div>
        <div style={{ fontSize: '.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-montserrat,sans-serif)', marginTop: 4, textAlign: 'center', padding: '0 .5rem' }}>
          {label}
        </div>
        {sublabel && (
          <div style={{ fontSize: '.62rem', color: 'rgba(255,255,255,.45)', fontFamily: 'var(--font-inter,sans-serif)', marginTop: 2 }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Card de "Big Number" estilo dashboard executivo (fundo escuro/premium).
 */
function BigNumberCard({ label, valor, sub, cor, icon, pct, meta }: {
  label: string; valor: string | number; sub?: string; cor: string; icon: React.ReactNode
  pct: number; meta: string
}) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(155deg, rgba(255,255,255,.04) 0%, rgba(255,255,255,.01) 100%)',
      border: '1px solid rgba(255,255,255,.10)',
      borderRadius: 20,
      padding: '1.5rem 1.6rem',
      overflow: 'hidden',
      backdropFilter: 'blur(8px)',
    }}>
      {/* Glow decorativo */}
      <div style={{
        position: 'absolute', top: -40, right: -40, width: 160, height: 160,
        background: `radial-gradient(circle, ${cor}33 0%, transparent 70%)`,
        pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: `${cor}22`, border: `1px solid ${cor}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {icon}
            </div>
            <span style={{ fontSize: '.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
              {label}
            </span>
          </div>
          <span style={{
            fontSize: '.65rem', fontWeight: 800,
            color: pct >= 100 ? '#16a34a' : cor,
            background: pct >= 100 ? 'rgba(22,163,74,.15)' : `${cor}22`,
            border: `1px solid ${pct >= 100 ? '#16a34a' : cor}55`,
            padding: '.2rem .55rem', borderRadius: 999,
            fontFamily: 'var(--font-montserrat,sans-serif)',
          }}>
            {Math.min(100, pct)}%
          </span>
        </div>

        <div style={{
          fontFamily: 'var(--font-cormorant,serif)',
          fontSize: '3.2rem', fontWeight: 800, lineHeight: 1,
          color: '#fff', marginBottom: '.4rem',
          letterSpacing: '-.01em',
        }}>
          {valor}
        </div>

        <div style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.65)', marginBottom: '.15rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
          de <strong style={{ color: '#fff', fontWeight: 700 }}>{meta}</strong>
        </div>
        {sub && (
          <div style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.4)', marginBottom: '.85rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
            {sub}
          </div>
        )}

        <BarraMeta pct={pct} cor={cor} height={6} />
      </div>
    </div>
  )
}

export default async function MetasPage() {
  const supabase = await createClient()

  const [
    { data: escolas },
    { data: registros },
    { data: contratosAssinados },
    { data: contratosMinuta },
  ] = await Promise.all([
    supabase.from('escolas')
      .select('id, nome, cidade, estado, total_alunos, qtd_fund1, responsavel_id, created_at')
      .eq('ativa', true)
      .order('created_at', { ascending: false }),

    supabase.from('registros')
      .select('escola_id, data_contato, classificacao, responsavel:profiles!responsavel_id(full_name), escola:escolas(nome)')
      .eq('ativa', true)
      .order('data_contato', { ascending: false }),

    // ✅ NOVAS ESCOLAS PARCEIRAS = contrato assinado por ambas as partes
    // Cresce conforme "Contrato assinado por ambas as partes" = Sim na Jornada Contratual
    supabase.from('contratos')
      .select(`
        escola_id, contrato_assinado,
        infantil2_qtd, infantil3_qtd, infantil4_qtd, infantil5_qtd,
        fund1_ano1_qtd, fund1_ano2_qtd, fund1_ano3_qtd, fund1_ano4_qtd, fund1_ano5_qtd,
        escola:escolas(id, nome, cidade, estado, total_alunos, created_at)
      `)
      .eq('contrato_assinado', true),

    // ℹ️ Escolas que enviaram minuta (estágio avançado, próximas de assinar)
    supabase.from('contratos')
      .select('escola_id, escola:escolas(nome, cidade, estado, total_alunos)')
      .eq('minuta_enviada', true)
      .eq('contrato_assinado', false),
  ])

  // ── Cálculos ──────────────────────────────────────────────────

  // Reuniões únicas = escolas distintas que tiveram ao menos 1 registro
  const escolasComContato = new Set(registros?.map(r => r.escola_id) ?? [])
  const totalReunioes = escolasComContato.size

  // ✅ NOVAS ESCOLAS PARCEIRAS = contratos assinados (métrica principal)
  const qtdEscolasNovas = contratosAssinados?.length ?? 0

  // Escolas em minuta (pipeline avançado — próximas de virar parceiras)
  const qtdEscolasMinuta = contratosMinuta?.length ?? 0

  // ✅ ALUNOS DAS NOVAS PARCERIAS
  // Prioridade: se tem alunos no contrato (formulário preenchido), usa esses dados
  // Senão, usa total_alunos da escola cadastrada
  const alunosNovasEscolas = (contratosAssinados ?? []).reduce((acc: number, c: any) => {
    const alunosContrato = (c.infantil2_qtd ?? 0) + (c.infantil3_qtd ?? 0) +
      (c.infantil4_qtd ?? 0) + (c.infantil5_qtd ?? 0) + (c.fund1_ano1_qtd ?? 0) +
      (c.fund1_ano2_qtd ?? 0) + (c.fund1_ano3_qtd ?? 0) + (c.fund1_ano4_qtd ?? 0) +
      (c.fund1_ano5_qtd ?? 0)
    const alunosEscola = (c.escola as any)?.total_alunos ?? 0
    return acc + (alunosContrato > 0 ? alunosContrato : alunosEscola)
  }, 0)

  // Escolas anteriores ao sistema (base histórica — 25 escolas parceiras pré-existentes)
  const corteData = new Date('2026-01-01')
  const escolasAnteriores = escolas?.filter((e: any) => new Date(e.created_at) < corteData) ?? []
  const qtdEscolasAnteriores = escolasAnteriores.length

  // BASE ATUAL: 2.000 fixos — baseline confirmada das 25 escolas parceiras históricas
  const BASELINE_ALUNOS = 2000

  // CRESCIMENTO FUND. I: alunos de Fund. I nas escolas já parceiras que aderirem ao material
  const alunosFund1Anteriores = escolasAnteriores.reduce((acc: number, e: any) =>
    acc + (e.qtd_fund1 ?? 0), 0)

  // Total projetado = base + Fund.I das escolas antigas + alunos das novas (contratos assinados)
  const totalProjetado = BASELINE_ALUNOS + alunosFund1Anteriores + alunosNovasEscolas

  // Percentuais
  const pctReunioes = Math.round((totalReunioes    / METAS.reunioes_meta)      * 100)
  const pctEscolas  = Math.round((qtdEscolasNovas  / METAS.escolas_novas_meta) * 100)
  const pctAlunos   = Math.round((totalProjetado   / METAS.alunos_total_meta)  * 100)

  // Registros recentes para timeline
  const registrosRecentes = registros?.slice(0, 8) ?? []

  // Escolas novas recentes = as que assinaram contrato mais recentemente
  const escolasNovasRecentes = (contratosAssinados ?? []).slice(0, 8)

  // Progresso global ponderado (média simples dos 3 KPIs principais)
  const pctGlobal = Math.round((pctReunioes + pctEscolas + pctAlunos) / 3)
  const totalProjetadoAlunos = METAS.alunos_atuais + alunosFund1Anteriores + alunosNovasEscolas

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
      <PageHeader
        title="Metas 2027"
        subtitle="Plano estratégico de crescimento CVE Education"
      />

      {/* ════════════════ HERO PREMIUM ESCURO ════════════════ */}
      <div style={{
        background: 'radial-gradient(ellipse at top left, #1e3a5f 0%, #0f172a 40%, #020617 100%)',
        padding: '3rem 2.5rem 4.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Padrão de grid sutil no fundo */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0, opacity: .04,
          backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          pointerEvents: 'none',
        }}/>
        {/* Glow âmbar canto superior direito */}
        <div aria-hidden style={{
          position: 'absolute', top: -120, right: -80, width: 420, height: 420,
          background: 'radial-gradient(circle, rgba(217,119,6,.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}/>

        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto' }}>

          {/* Cabeçalho do hero: título + contador */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                background: 'rgba(217,119,6,.10)', border: '1px solid rgba(217,119,6,.4)',
                padding: '.35rem .85rem', borderRadius: 999, marginBottom: '1rem',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fbbf24', boxShadow: '0 0 8px #fbbf24' }}/>
                <span style={{ fontSize: '.62rem', fontWeight: 800, letterSpacing: '.18em', textTransform: 'uppercase', color: '#fbbf24', fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                  Planejamento Estratégico CVE
                </span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-cormorant,serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 700,
                color: '#fff', lineHeight: 1.05, marginBottom: '.75rem',
                letterSpacing: '-.015em',
              }}>
                Crescimento <span style={{ color: '#fbbf24' }}>2027</span> — Currículo Paideia
              </h1>
              <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-inter,sans-serif)', maxWidth: 620, lineHeight: 1.6 }}>
                Acompanhamento em tempo real das metas de prospecção, parcerias e expansão de alunos.
                Cada operação registrada move os indicadores abaixo.
              </p>
            </div>

            {/* Donut de progresso global + contador regressivo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
              <DonutMeta
                pct={pctGlobal}
                cor="#fbbf24"
                size={160}
                stroke={12}
                label="Progresso Global"
                sublabel="média dos 3 pilares"
              />
              <div style={{ minWidth: 180 }}>
                <ContadorRegressivo />
              </div>
            </div>
          </div>

          {/* ════ 3 BIG NUMBERS no estilo dashboard executivo ════ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
            <BigNumberCard
              label="Reuniões com Escolas Únicas"
              valor={totalReunioes}
              meta={`${METAS.reunioes_meta} até ${METAS.reunioes_prazo}`}
              pct={pctReunioes}
              sub="escolas com ao menos 1 contato registrado"
              cor="#3b82f6"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            />
            <BigNumberCard
              label="Novas Escolas Parceiras"
              valor={qtdEscolasNovas}
              meta={`${METAS.escolas_novas_meta} novas (${METAS.escolas_total_meta} total)`}
              pct={pctEscolas}
              sub={qtdEscolasMinuta > 0 ? `${qtdEscolasMinuta} em minuta no pipeline` : 'nenhuma em minuta ainda'}
              cor="#f59e0b"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
            />
            <BigNumberCard
              label="Total de Alunos (Projetado)"
              valor={totalProjetadoAlunos.toLocaleString('pt-BR')}
              meta={`${METAS.alunos_total_meta.toLocaleString('pt-BR')} alunos`}
              pct={pctAlunos}
              sub={`2.000 base + ${alunosFund1Anteriores} Fund.I + ${alunosNovasEscolas} de novos contratos`}
              cor="#a855f7"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>}
            />
          </div>
        </div>
      </div>

      {/* ════════════════ CORPO CLARO ════════════════ */}
      <div style={{ padding: '2.5rem 2.5rem 3rem', maxWidth: 1280, margin: '0 auto', marginTop: '-2rem', position: 'relative' }}>

        {/* ── Detalhamento das metas de alunos ─────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, marginBottom: '2rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,.06)' }}>
          <div style={{ padding: '1rem 1.75rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '.65rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a' }}>
              Composição da Meta de 5.000 Alunos
            </div>
          </div>
          <div style={{ padding: '1.5rem 1.75rem' }}>
            {/* Equação visual 2.000 + 1.000 + 2.000 = 5.000 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem', padding: '1rem 1.25rem', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              {[
                { n: '2.000', label: 'Base atual\n(25 escolas parceiras)', cor: '#64748b', bg: '#f1f5f9' },
                { n: '+1.000', label: 'Crescimento Fund. I\n(escolas já parceiras)', cor: '#d97706', bg: '#fffbeb' },
                { n: '+2.000', label: 'Novas parcerias\n(infantil + fundamental)', cor: '#7c3aed', bg: '#f5f3ff' },
                { n: '= 5.000', label: 'Meta total\nalunos 2027', cor: '#16a34a', bg: '#f0fdf4' },
              ].map((item, i) => (
                <div key={i} style={{ flex: 1, background: item.bg, borderRadius: 10, padding: '.8rem 1rem', textAlign: 'center', border: `1px solid ${item.cor}30` }}>
                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.5rem', fontWeight: 800, color: item.cor, lineHeight: 1, marginBottom: '.3rem' }}>{item.n}</div>
                  <div style={{ fontSize: '.62rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{item.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                {
                  label: 'Base Atual — 25 Escolas',
                  atual: METAS.alunos_atuais,   // 2.000 fixos — declarado pelo usuário
                  meta:  METAS.alunos_atuais,
                  progAtual: METAS.alunos_atuais, // 100% — já temos esses alunos
                  desc: 'Alunos confirmados nas 25 escolas parceiras atuais',
                  cor: '#64748b',
                  bg: '#f8fafc',
                  nota: 'Base consolidada — não faz parte da meta de captação',
                  badge: 'Confirmado',
                  badgeCor: '#16a34a',
                },
                {
                  label: 'Crescimento Fund. I',
                  atual: alunosFund1Anteriores,  // alunos fund1 que as escolas antigas já registraram
                  meta:  METAS.alunos_fund1_meta, // meta: +1.000
                  progAtual: alunosFund1Anteriores,
                  desc: '+1.000 alunos do 1º ao 5º Ano nas escolas já parceiras',
                  cor: '#d97706',
                  bg: '#fffbeb',
                  nota: 'Adesão ao material Fund. I (1º ao 5º ano) pelas escolas atuais',
                  badge: null,
                  badgeCor: '',
                },
                {
                  label: 'Novas Parcerias — 26 Escolas',
                  atual: alunosNovasEscolas,      // alunos (infantil + fund) das escolas novas captadas
                  meta:  METAS.alunos_novas_meta, // meta: +2.000
                  progAtual: alunosNovasEscolas,
                  desc: `+2.000 alunos das 26 novas escolas — ${alunosNovasEscolas} confirmados via contrato assinado`,
                  cor: '#7c3aed',
                  bg: '#f5f3ff',
                  nota: `${qtdEscolasNovas} contratos assinados · ${qtdEscolasMinuta} em minuta`,
                  badge: null,
                  badgeCor: '',
                },
              ].map(m => {
                const p = m.meta > 0 ? Math.min(100, Math.round((m.progAtual / m.meta) * 100)) : 100
                return (
                  <div key={m.label} style={{ background: m.bg, border: `1px solid ${m.cor}30`, borderRadius: 12, padding: '1.1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.5rem' }}>
                      <div style={{ fontSize: '.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: m.cor, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                        {m.label}
                      </div>
                      {m.badge && (
                        <span style={{ fontSize: '.58rem', fontWeight: 700, background: '#f0fdf4', color: m.badgeCor, border: `1px solid ${m.badgeCor}40`, padding: '.1rem .4rem', borderRadius: 99, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '.35rem', marginBottom: '.25rem' }}>
                      <span style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        {m.atual.toLocaleString('pt-BR')}
                      </span>
                      <span style={{ fontSize: '.78rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                        {m.label.startsWith('Base') ? 'alunos confirmados' : `/ ${m.meta.toLocaleString('pt-BR')} meta`}
                      </span>
                    </div>
                    <div style={{ fontSize: '.7rem', color: '#64748b', marginBottom: '.65rem', fontFamily: 'var(--font-inter,sans-serif)' }}>{m.desc}</div>
                    <BarraMetaClara pct={p} cor={m.cor} height={7} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.35rem' }}>
                      <span style={{ fontSize: '.62rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>{m.nota}</span>
                      <span style={{ fontSize: '.68rem', fontWeight: 700, color: p >= 100 ? '#16a34a' : m.cor, fontFamily: 'var(--font-montserrat,sans-serif)' }}>{p}%</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Barra total consolidada */}
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #f8fafc)', border: '1px solid #86efac', borderRadius: 12, padding: '1.1rem 1.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.65rem' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.75rem', fontWeight: 700, color: '#0f172a' }}>Progresso Rumo à Meta de 5.000 Alunos</div>
                  <div style={{ fontSize: '.7rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)', marginTop: '.15rem' }}>
                    Base confirmada: <strong style={{ color: '#16a34a' }}>2.000</strong> +
                    Fund.I crescimento: <strong style={{ color: '#d97706' }}>{alunosFund1Anteriores}</strong> +
                    Novas parcerias: <strong style={{ color: '#7c3aed' }}>{alunosNovasEscolas}</strong> =
                    <strong style={{ color: '#0f172a' }}> {(METAS.alunos_atuais + alunosFund1Anteriores + alunosNovasEscolas).toLocaleString('pt-BR')}</strong> alunos
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.6rem', fontWeight: 800, color: pctAlunos >= 100 ? '#16a34a' : '#16a34a', lineHeight: 1 }}>
                    {pctAlunos}%
                  </div>
                  <div style={{ fontSize: '.62rem', color: '#64748b', fontFamily: 'var(--font-inter,sans-serif)' }}>da meta</div>
                </div>
              </div>
              <BarraMetaClara pct={pctAlunos} cor="#16a34a" height={14} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.5rem' }}>
                <span style={{ fontSize: '.65rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  Faltam <strong style={{ color: '#d97706' }}>{Math.max(0, METAS.alunos_total_meta - (METAS.alunos_atuais + alunosFund1Anteriores + alunosNovasEscolas)).toLocaleString('pt-BR')}</strong> alunos novos para atingir a meta
                </span>
                <span style={{ fontSize: '.65rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>Meta: {METAS.alunos_total_meta.toLocaleString('pt-BR')} alunos</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Linha do tempo + novas escolas ──────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

          {/* Prospecção — últimas reuniões */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,.06)' }}>
            <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a' }}>Últimas Reuniões Registradas</span>
              </div>
              <span style={{ fontSize: '.65rem', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '.15rem .55rem', borderRadius: 99, fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                {totalReunioes} / {METAS.reunioes_meta}
              </span>
            </div>
            <div style={{ padding: '1rem 1.4rem' }}>
              {registrosRecentes.length > 0 ? registrosRecentes.map((r: any, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.55rem 0', borderBottom: i < registrosRecentes.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: r.classificacao === 'quente' ? '#ef4444' : r.classificacao === 'morno' ? '#d97706' : '#6366f1',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-inter,sans-serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(r as any).escola?.nome ?? r.escola_id.slice(0, 8)}
                    </div>
                    <div style={{ fontSize: '.65rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      {r.responsavel?.full_name ?? '—'} · {new Date(r.data_contato + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '.6rem', fontWeight: 700, padding: '.1rem .4rem', borderRadius: 99, flexShrink: 0,
                    background: r.classificacao === 'quente' ? '#fef2f2' : r.classificacao === 'morno' ? '#fffbeb' : '#eef2ff',
                    color: r.classificacao === 'quente' ? '#dc2626' : r.classificacao === 'morno' ? '#d97706' : '#6366f1',
                    fontFamily: 'var(--font-montserrat,sans-serif)',
                  }}>
                    {r.classificacao}
                  </span>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '.82rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  Nenhum registro ainda
                </div>
              )}
            </div>
          </div>

          {/* Novas escolas */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,23,42,.06)' }}>
            <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid #f1f5f9', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a' }}>Novas Escolas Captadas</span>
              </div>
              <span style={{ fontSize: '.65rem', background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '.15rem .55rem', borderRadius: 99, fontWeight: 700, fontFamily: 'var(--font-montserrat,sans-serif)' }}>
                {qtdEscolasNovas} / {METAS.escolas_novas_meta}
              </span>
            </div>
            <div style={{ padding: '1rem 1.4rem' }}>
              {escolasNovasRecentes.length > 0 ? escolasNovasRecentes.map((e: any, i) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.55rem 0', borderBottom: i < escolasNovasRecentes.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-cormorant,serif)', fontSize: '.9rem', fontWeight: 700, color: '#d97706' }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#0f172a', fontFamily: 'var(--font-inter,sans-serif)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.nome}
                    </div>
                    <div style={{ fontSize: '.65rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>
                      {e.cidade}{e.estado ? `, ${e.estado}` : ''} · {e.total_alunos ?? 0} alunos
                    </div>
                  </div>
                  <span style={{ fontSize: '.65rem', fontWeight: 700, color: '#64748b', fontFamily: 'var(--font-montserrat,sans-serif)', background: '#f1f5f9', padding: '.1rem .4rem', borderRadius: 99 }}>
                    {new Date(e.created_at).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                  </span>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '.82rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                  Nenhuma escola nova cadastrada ainda neste ciclo
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Resumo de progresso geral ────────────────────── */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: '1.5rem 1.75rem', boxShadow: '0 1px 4px rgba(15,23,42,.06)' }}>
          <div style={{ fontFamily: 'var(--font-montserrat,sans-serif)', fontSize: '.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.07em', color: '#0f172a', marginBottom: '1.25rem' }}>
            Painel de Progresso Consolidado — Plano 2027
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
            {[
              { label: 'Reuniões Únicas',         atual: totalReunioes,         meta: METAS.reunioes_meta,        cor: '#2563eb', unidade: 'reuniões',  sub: '' },
              { label: 'Contratos Assinados',     atual: qtdEscolasNovas,       meta: METAS.escolas_novas_meta,   cor: '#d97706', unidade: 'escolas',   sub: `${qtdEscolasMinuta} em minuta` },
              { label: 'Crescimento Fund.I',       atual: alunosFund1Anteriores, meta: METAS.alunos_fund1_meta,    cor: '#0d9488', unidade: 'alunos',    sub: 'escolas parceiras atuais' },
              { label: 'Alunos via Contratos',    atual: alunosNovasEscolas,    meta: METAS.alunos_novas_meta,    cor: '#7c3aed', unidade: 'alunos',    sub: `${qtdEscolasNovas} contratos` },
            ].map(m => {
              const p = Math.min(100, Math.round((m.atual / m.meta) * 100))
              const falta = Math.max(0, m.meta - m.atual)
              return (
                <div key={m.label} style={{ padding: '.85rem 1rem', background: '#f8fafc', border: `1px solid ${m.cor}20`, borderTop: `3px solid ${m.cor}`, borderRadius: 10 }}>
                  <div style={{ fontSize: '.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: m.cor, fontFamily: 'var(--font-montserrat,sans-serif)', marginBottom: '.4rem' }}>{m.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '.3rem', marginBottom: '.5rem' }}>
                    <span style={{ fontFamily: 'var(--font-cormorant,serif)', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{m.atual.toLocaleString('pt-BR')}</span>
                    <span style={{ fontSize: '.7rem', color: '#94a3b8', fontFamily: 'var(--font-inter,sans-serif)' }}>/ {m.meta.toLocaleString('pt-BR')}</span>
                  </div>
                  <BarraMetaClara pct={p} cor={m.cor} height={5} />
                  <div style={{ fontSize: '.62rem', color: '#475569', marginTop: '.3rem', fontFamily: 'var(--font-inter,sans-serif)' }}>
                    Faltam {falta.toLocaleString('pt-BR')} {m.unidade} · <strong style={{ color: m.cor }}>{p}%</strong>
                    {(m as any).sub && <span style={{ color: '#94a3b8', marginLeft: '.3rem' }}>· {(m as any).sub}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
