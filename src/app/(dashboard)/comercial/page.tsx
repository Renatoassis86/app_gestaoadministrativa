import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, AlertTriangle } from 'lucide-react'
import { LABEL } from '@/types/database'

export default async function ComercialDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const hoje = new Date().toISOString().split('T')[0]
  const trintaDias = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  // KPIs paralelos
  const [
    { count: totalEscolas },
    { count: leadsQuentes },
    { count: leadsMornos },
    { count: registrosMes },
    { data: registrosRecentes },
    { data: tarefasVencidas },
    { data: escolasSemContato },
  ] = await Promise.all([
    supabase.from('escolas').select('*', { count: 'exact', head: true }).eq('ativa', true),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'quente'),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'morno'),
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
  ])

  const kpis = [
    { label: 'Total de Escolas', value: totalEscolas ?? 0, sub: 'parceiros cadastrados', color: '' },
    { label: 'Leads Quentes', value: leadsQuentes ?? 0, sub: 'alta probabilidade', color: 'danger' },
    { label: 'Leads Mornos', value: leadsMornos ?? 0, sub: 'em negociação', color: 'warning' },
    { label: 'Registros (30 dias)', value: registrosMes ?? 0, sub: 'interações recentes', color: 'teal' },
  ]

  return (
    <div>
      <PageHeader
        title="Dashboard Comercial"
        subtitle="Visão geral da operação"
        actions={
          <div className="flex gap-2">
            <Link href="/comercial/registros/novo" className="btn btn-primary btn-sm">
              <Plus size={14} /> Novo Registro
            </Link>
            <Link href="/comercial/escolas/nova" className="btn btn-ghost btn-sm">
              <Plus size={14} /> Cadastrar Escola
            </Link>
          </div>
        }
      />

      <div className="p-6">

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {kpis.map(k => (
            <div key={k.label} className={`kpi-card ${k.color}`}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

          {/* Últimas interações */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Últimas Interações</span>
              <Link href="/comercial/registros" className="btn btn-ghost btn-sm">Ver todas</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              {registrosRecentes && registrosRecentes.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Escola</th>
                      <th>Data</th>
                      <th>Meio</th>
                      <th>Classificação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosRecentes.map((r: any) => (
                      <tr key={r.id}>
                        <td>
                          <Link href={`/comercial/escolas/${r.escola_id}`} style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>
                            {r.escola?.nome?.substring(0, 28) ?? '—'}
                          </Link>
                        </td>
                        <td style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>{formatDate(r.data_contato)}</td>
                        <td style={{ fontSize: '.75rem' }}>{LABEL.meio_contato?.[r.meio_contato] ?? r.meio_contato}</td>
                        <td>
                          <span className={`badge badge-${r.classificacao}`}>
                            {r.classificacao === 'quente' ? 'Quente' : r.classificacao === 'morno' ? 'Morno' : 'Frio'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Nenhum registro ainda.</p>
                  <Link href="/comercial/registros/novo" className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>Novo Registro</Link>
                </div>
              )}
            </div>
          </div>

          {/* Tarefas vencidas */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tarefas Vencidas</span>
              {(tarefasVencidas?.length ?? 0) > 0 && (
                <span className="badge badge-red" style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                  <AlertTriangle size={11} /> {tarefasVencidas!.length} tarefa{tarefasVencidas!.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="card-body">
              {tarefasVencidas && tarefasVencidas.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                  {tarefasVencidas.map((t: any) => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '.6rem', background: '#fff5f5', borderRadius: 8, borderLeft: '3px solid var(--danger)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{t.titulo}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>
                          <Link href={`/comercial/escolas/${t.escola_id}`}>{t.escola?.nome}</Link>
                          {t.vencimento && ` · ${formatDate(t.vencimento)}`}
                        </div>
                      </div>
                      <span className="badge badge-red">{t.prioridade}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p style={{ color: 'var(--success)' }}>✓ Nenhuma tarefa vencida</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Escolas sem contato recente */}
        {escolasSemContato && escolasSemContato.length > 0 && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Escolas Sem Contato Recente</span>
              <Link href="/comercial/escolas" className="btn btn-ghost btn-sm">Ver todas</Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.75rem', padding: '1rem' }}>
              {escolasSemContato.map((e: any) => (
                <Link key={e.id} href={`/comercial/escolas/${e.id}`} className="pipeline-card">
                  <div style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--brand-blue)' }}>{e.nome?.substring(0, 28)}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>{e.cidade}{e.estado ? `, ${e.estado}` : ''}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
