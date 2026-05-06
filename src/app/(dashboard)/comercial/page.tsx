import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import {
  Plus, AlertTriangle, School, Flame, TrendingUp, Activity,
  CheckCircle2, ArrowRight, Clock
} from 'lucide-react'
import { LABEL } from '@/types/database'
import StatCard from '@/components/ui/StatCard'
import Badge, { ClassificacaoBadge, PrioridadeBadge } from '@/components/ui/Badge'
import EscolaCard from '@/components/ui/EscolaCard'
import {
  RegistrosAreaChart,
  ClassificacaoPieChart,
  MeioContatoBarChart,
} from '@/components/dashboard/DashboardCharts'

export default async function ComercialDashboard() {
  const supabase = await createClient()

  const hoje      = new Date().toISOString().split('T')[0]
  const trintaDias = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
  const seissMeses = new Date(Date.now() - 180 * 86400000).toISOString().split('T')[0]

  const [
    { count: totalEscolas },
    { count: leadsQuentes },
    { count: leadsMornos },
    { count: leadsFrios },
    { count: registrosMes },
    { data: registrosRecentes },
    { data: tarefasVencidas },
    { data: escolasSemContato },
    { data: registros6meses },
    { data: tarefasHoje },
  ] = await Promise.all([
    supabase.from('escolas').select('*', { count: 'exact', head: true }).eq('ativa', true),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'quente'),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'morno'),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'frio'),
    supabase.from('registros').select('*', { count: 'exact', head: true }).gte('data_contato', trintaDias),
    supabase.from('registros')
      .select('*, escola:escolas(nome,id)')
      .order('data_contato', { ascending: false })
      .limit(8),
    supabase.from('tarefas')
      .select('*, escola:escolas(nome,id)')
      .eq('status', 'pendente')
      .lt('vencimento', hoje)
      .limit(5),
    supabase.from('escolas')
      .select('id, nome, cidade, estado, updated_at')
      .eq('ativa', true)
      .order('updated_at', { ascending: true })
      .limit(6),
    supabase.from('registros')
      .select('data_contato, meio_contato, classificacao')
      .gte('data_contato', seissMeses)
      .order('data_contato', { ascending: true }),
    supabase.from('tarefas')
      .select('*, escola:escolas(nome,id)')
      .eq('status', 'pendente')
      .eq('vencimento', hoje)
      .limit(3),
  ])

  // ── Preparar dados para os gráficos ─────────────────────────────────────────

  // Registros por mês (últimos 6 meses)
  const registrosPorMes: Record<string, { total: number; quentes: number; mornos: number }> = {}
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
  ;(registros6meses ?? []).forEach((r: any) => {
    const [, m] = r.data_contato.split('-')
    const key = meses[parseInt(m, 10) - 1]
    if (!registrosPorMes[key]) registrosPorMes[key] = { total: 0, quentes: 0, mornos: 0 }
    registrosPorMes[key].total++
    if (r.classificacao === 'quente') registrosPorMes[key].quentes++
    if (r.classificacao === 'morno')  registrosPorMes[key].mornos++
  })
  const areaData = Object.entries(registrosPorMes).map(([mes, v]) => ({ mes, ...v }))

  // Distribuição de classificação
  const pieData = [
    { name: 'Quentes', value: leadsQuentes ?? 0, color: '#ef4444' },
    { name: 'Mornos',  value: leadsMornos  ?? 0, color: '#f59e0b' },
    { name: 'Frios',   value: leadsFrios   ?? 0, color: '#3b82f6' },
  ].filter(d => d.value > 0)
  const totalLeads = (leadsQuentes ?? 0) + (leadsMornos ?? 0) + (leadsFrios ?? 0)

  // Distribuição de meios de contato
  const meioCount: Record<string, number> = {}
  ;(registros6meses ?? []).forEach((r: any) => {
    meioCount[r.meio_contato] = (meioCount[r.meio_contato] ?? 0) + 1
  })
  const meioData = Object.entries(meioCount).map(([meio, count]) => ({ meio, count }))
    .sort((a, b) => b.count - a.count)

  const kpis = [
    {
      label: 'Total de Escolas',
      value: totalEscolas ?? 0,
      sub: 'parceiros ativos',
      icon: School,
      variant: 'blue' as const,
      href: '/comercial/escolas',
    },
    {
      label: 'Leads Quentes',
      value: leadsQuentes ?? 0,
      sub: 'alta probabilidade',
      icon: Flame,
      variant: 'danger' as const,
      href: '/comercial/leads',
    },
    {
      label: 'Leads Mornos',
      value: leadsMornos ?? 0,
      sub: 'em negociação ativa',
      icon: TrendingUp,
      variant: 'warning' as const,
    },
    {
      label: 'Registros (30 dias)',
      value: registrosMes ?? 0,
      sub: 'interações recentes',
      icon: Activity,
      variant: 'teal' as const,
      href: '/comercial/registros',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard Comercial"
        subtitle={`Atualizado hoje, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`}
        badge={
          (tarefasVencidas?.length ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-red-50 text-red-700 border border-red-200">
              <AlertTriangle size={11} />
              {tarefasVencidas!.length} vencida{tarefasVencidas!.length > 1 ? 's' : ''}
            </span>
          ) : undefined
        }
        actions={
          <div className="flex gap-2">
            <Link href="/comercial/registros/novo" className="btn btn-primary btn-sm">
              <Plus size={14} /> Novo Registro
            </Link>
            <Link href="/comercial/escolas/nova" className="btn btn-ghost btn-sm">
              <Plus size={14} /> Escola
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-6">

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map(k => (
            <StatCard
              key={k.label}
              label={k.label}
              value={k.value}
              sub={k.sub}
              icon={k.icon}
              variant={k.variant}
              href={k.href}
            />
          ))}
        </div>

        {/* ── Alertas urgentes ──────────────────────────────────── */}
        {(tarefasVencidas?.length ?? 0) > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
              <h3 className="text-sm font-bold text-red-800">
                {tarefasVencidas!.length} tarefa{tarefasVencidas!.length > 1 ? 's' : ''} vencida{tarefasVencidas!.length > 1 ? 's' : ''}
              </h3>
              <Link href="/comercial/jornada" className="ml-auto text-xs text-red-600 font-semibold hover:underline flex items-center gap-1">
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid gap-2">
              {tarefasVencidas!.map((t: any) => (
                <Link
                  key={t.id}
                  href={`/comercial/escolas/${t.escola_id}`}
                  className="flex items-center gap-3 bg-white border border-red-200 rounded-lg px-3 py-2 hover:border-red-300 hover:shadow-sm transition-all no-underline"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{t.titulo}</div>
                    <div className="text-xs text-slate-500">
                      {t.escola?.nome}
                      {t.vencimento && <span className="text-red-500"> · {formatDate(t.vencimento)}</span>}
                    </div>
                  </div>
                  <PrioridadeBadge value={t.prioridade} />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Tarefas de hoje ───────────────────────────────────── */}
        {(tarefasHoje?.length ?? 0) > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} className="text-amber-600 flex-shrink-0" />
              <h3 className="text-sm font-bold text-amber-900">
                {tarefasHoje!.length} tarefa{tarefasHoje!.length > 1 ? 's' : ''} para hoje
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {tarefasHoje!.map((t: any) => (
                <Link
                  key={t.id}
                  href={`/comercial/escolas/${t.escola_id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-amber-200 rounded-lg text-xs font-medium text-slate-700 hover:border-amber-400 transition-all no-underline"
                >
                  <CheckCircle2 size={12} className="text-amber-500" />
                  {t.titulo}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Gráficos ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {areaData.length > 0 && <RegistrosAreaChart data={areaData} />}
          {pieData.length > 0  && <ClassificacaoPieChart data={pieData} total={totalLeads} />}
          {meioData.length > 0 && <MeioContatoBarChart data={meioData} />}
        </div>

        {/* ── Grid principal ────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Últimas interações */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Últimas Interações</span>
              <Link href="/comercial/registros" className="btn btn-ghost btn-sm">
                Ver todas <ArrowRight size={12} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              {registrosRecentes && registrosRecentes.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Escola</th>
                      <th>Data</th>
                      <th>Canal</th>
                      <th>Lead</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosRecentes.map((r: any) => (
                      <tr key={r.id}>
                        <td>
                          <Link
                            href={`/comercial/escolas/${r.escola_id}`}
                            className="font-semibold text-blue-800 hover:text-amber-700 transition-colors text-sm no-underline"
                          >
                            {r.escola?.nome?.substring(0, 26) ?? '—'}
                          </Link>
                        </td>
                        <td>
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(r.data_contato)}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-slate-600">
                            {LABEL.meio_contato?.[r.meio_contato] ?? r.meio_contato}
                          </span>
                        </td>
                        <td>
                          <ClassificacaoBadge value={r.classificacao} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <Activity size={36} />
                  <h3>Sem registros ainda</h3>
                  <Link href="/comercial/registros/novo" className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>
                    Criar primeiro registro
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Escolas sem contato recente */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Precisam de Atenção</span>
              <span className="badge badge-orange text-xs">{escolasSemContato?.length ?? 0} escolas</span>
            </div>
            <div className="card-body">
              {escolasSemContato && escolasSemContato.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {escolasSemContato.map((e: any) => (
                    <EscolaCard
                      key={e.id}
                      id={e.id}
                      nome={e.nome}
                      cidade={e.cidade}
                      estado={e.estado}
                      href={`/comercial/escolas/${e.id}`}
                      variant="compact"
                    />
                  ))}
                  <Link
                    href="/comercial/escolas"
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 py-2 border border-dashed border-amber-200 rounded-lg hover:border-amber-300 transition-all no-underline mt-1"
                  >
                    Ver todas as escolas <ArrowRight size={12} />
                  </Link>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                  <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm text-emerald-700 font-semibold">Tudo em dia!</p>
                  <p className="text-xs text-slate-400 mt-1">Todas as escolas foram contatadas recentemente.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
