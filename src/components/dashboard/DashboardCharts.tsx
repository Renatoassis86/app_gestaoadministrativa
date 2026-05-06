'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadialBarChart, RadialBar
} from 'recharts'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ChartCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  action?: React.ReactNode
  height?: number
}

// ── Chart Card wrapper ────────────────────────────────────────────────────────

export function ChartCard({ title, subtitle, children, action, height = 220 }: ChartCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 style={{ fontFamily: 'var(--font-cormorant, serif)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--brand-blue)', letterSpacing: '-.01em' }}>
            {title}
          </h3>
          {subtitle && <p className="text-[0.72rem] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="p-4" style={{ height }}>
        {children}
      </div>
    </div>
  )
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#0f172a', border: '1px solid rgba(255,255,255,.1)',
      borderRadius: 8, padding: '8px 12px', fontSize: '.78rem',
      boxShadow: '0 10px 30px rgba(0,0,0,.3)',
    }}>
      {label && <div style={{ color: 'rgba(255,255,255,.5)', marginBottom: 4, fontSize: '.7rem' }}>{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {formatter ? formatter(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

// ── Gráfico 1: Registros por mês (área) ──────────────────────────────────────

interface RegistrosMesData {
  mes: string
  total: number
  quentes: number
  mornos: number
}

interface RegistrosAreaChartProps {
  data: RegistrosMesData[]
}

export function RegistrosAreaChart({ data }: RegistrosAreaChartProps) {
  return (
    <ChartCard
      title="Registros por Mês"
      subtitle="Volume de interações nos últimos 6 meses"
      height={240}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#003366" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#003366" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradQuentes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#d97706" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="total" name="Total" stroke="#003366" strokeWidth={2}
            fill="url(#gradTotal)" dot={false} activeDot={{ r: 5, fill: '#003366' }} />
          <Area type="monotone" dataKey="quentes" name="Quentes" stroke="#d97706" strokeWidth={2}
            fill="url(#gradQuentes)" dot={false} activeDot={{ r: 5, fill: '#d97706' }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Gráfico 2: Classificação de leads (pizza) ─────────────────────────────────

interface ClassificacaoData {
  name: string
  value: number
  color: string
}

interface ClassificacaoPieChartProps {
  data: ClassificacaoData[]
  total?: number
}

const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  if (percent < 0.07) return null
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function ClassificacaoPieChart({ data, total }: ClassificacaoPieChartProps) {
  return (
    <ChartCard
      title="Distribuição de Leads"
      subtitle="Quente · Morno · Frio"
      height={240}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={88}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '8px 12px', fontSize: '.78rem' }}>
                  <div style={{ color: d.color, fontWeight: 700 }}>{d.name}</div>
                  <div style={{ color: '#fff' }}>{d.value} escolas</div>
                  {total && <div style={{ color: 'rgba(255,255,255,.5)' }}>{((d.value / total) * 100).toFixed(1)}% do total</div>}
                </div>
              )
            }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '0.75rem', paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Gráfico 3: Pipeline por stage (barras horizontais) ────────────────────────

interface PipelineStageData {
  stage: string
  count: number
  valor: number
}

interface PipelineBarChartProps {
  data: PipelineStageData[]
}

function formatK(v: number) {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
  if (v >= 1000)    return `${(v / 1000).toFixed(0)}k`
  return `${v}`
}

export function PipelineBarChart({ data }: PipelineBarChartProps) {
  return (
    <ChartCard
      title="Pipeline por Stage"
      subtitle="Quantidade de negociações em cada etapa"
      height={240}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
          <Tooltip
            content={<CustomTooltip formatter={(v: number) => `${v} negoc.`} />}
          />
          <Bar dataKey="count" name="Negociações" fill="#003366" radius={[0, 4, 4, 0] as any} barSize={14}
            background={{ fill: '#f8fafc', radius: [0, 4, 4, 0] as any }}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Gráfico 4: Atividade por meio de contato (barras verticais) ───────────────

interface MeioContatoData {
  meio: string
  count: number
}

interface MeioContatoBarChartProps {
  data: MeioContatoData[]
}

const MEIO_COLORS: Record<string, string> = {
  presencial: '#10b981',
  whatsapp:   '#22c55e',
  email:      '#3b82f6',
  telefone:   '#6366f1',
  videoconf:  '#8b5cf6',
  outro:      '#94a3b8',
}

export function MeioContatoBarChart({ data }: MeioContatoBarChartProps) {
  return (
    <ChartCard
      title="Canal de Contato"
      subtitle="Distribuição por meio nos últimos 30 dias"
      height={220}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="meio" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Registros" radius={[4, 4, 0, 0]} barSize={28}>
            {data.map((entry, index) => (
              <Cell key={index} fill={MEIO_COLORS[entry.meio] ?? '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Gráfico 5: Probabilidade média por responsável (radial) ───────────────────

interface ResponsavelData {
  nome: string
  media_prob: number
  total: number
}

interface ResponsavelRadialChartProps {
  data: ResponsavelData[]
}

export function ResponsavelRadialChart({ data }: ResponsavelRadialChartProps) {
  const chartData = data.map((d, i) => ({
    name: d.nome.split(' ')[0],
    value: d.media_prob,
    fill: ['#d97706', '#003366', '#10b981', '#6366f1', '#f43f5e'][i % 5],
  }))

  return (
    <ChartCard
      title="Probabilidade Média"
      subtitle="Por responsável (escala 0–100)"
      height={220}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="25%" outerRadius="90%"
          data={chartData}
          startAngle={180} endAngle={0}
        >
          <RadialBar dataKey="value" background label={{ fill: '#64748b', fontSize: 11 }} />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0]
              return (
                <div style={{ background: '#0f172a', borderRadius: 8, padding: '8px 12px', fontSize: '.78rem' }}>
                  <div style={{ color: d.payload.fill, fontWeight: 700 }}>{d.payload.name}</div>
                  <div style={{ color: '#fff' }}>{d.value}% média</div>
                </div>
              )
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
