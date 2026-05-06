import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, School, LayoutGrid, List } from 'lucide-react'
import { ClassificacaoBadge } from '@/components/ui/Badge'
import EscolaCard from '@/components/ui/EscolaCard'
import Progress from '@/components/ui/Progress'

interface Props { searchParams: Promise<{ q?: string; estado?: string; page?: string; view?: string }> }

export default async function EscolasPage({ searchParams }: Props) {
  const params  = await searchParams
  const q       = params.q       ?? ''
  const estado  = params.estado  ?? ''
  const page    = parseInt(params.page ?? '1')
  const view    = params.view    ?? 'table'   // 'table' | 'grid'
  const perPage = 25
  const from    = (page - 1) * perPage
  const to      = from + perPage - 1

  const supabase = await createClient()

  let query = supabase
    .from('escolas_resumo')
    .select('*', { count: 'exact' })
    .eq('ativa', true)
    .range(from, to)
    .order('nome')

  if (q)      query = query.ilike('nome', `%${q}%`)
  if (estado) query = query.eq('estado', estado)

  const { data: escolas, count } = await query

  const { data: estadosRaw } = await supabase
    .from('escolas')
    .select('estado')
    .eq('ativa', true)
    .not('estado', 'is', null)

  const listaEstados = [...new Set(estadosRaw?.map((e: any) => e.estado).filter(Boolean))].sort() as string[]
  const totalPages   = Math.ceil((count ?? 0) / perPage)

  // KPIs rápidos
  const [
    { count: totalQ },
    { count: totalM },
    { count: totalF },
  ] = await Promise.all([
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'quente'),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'morno'),
    supabase.from('registros').select('escola_id', { count: 'exact', head: true }).eq('classificacao', 'frio'),
  ])
  const totalLeads = (totalQ ?? 0) + (totalM ?? 0) + (totalF ?? 0) || 1

  return (
    <div>
      <PageHeader
        title="Escolas / Parceiros"
        subtitle={`${count ?? 0} escola${(count ?? 0) !== 1 ? 's' : ''} cadastrada${(count ?? 0) !== 1 ? 's' : ''}`}
        breadcrumbs={[{ label: 'Escolas' }]}
        actions={
          <Link href="/comercial/escolas/nova" className="btn btn-primary btn-sm">
            <Plus size={14} /> Nova Escola
          </Link>
        }
      />

      <div className="p-6 space-y-5">

        {/* ── Mini KPIs de classificação ─────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Quentes', count: totalQ ?? 0, variant: 'quente' as const, color: 'bg-red-500' },
            { label: 'Mornos',  count: totalM ?? 0, variant: 'morno'  as const, color: 'bg-amber-500' },
            { label: 'Frios',   count: totalF ?? 0, variant: 'frio'   as const, color: 'bg-blue-400' },
          ].map(item => (
            <div key={item.label} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                <ClassificacaoBadge value={item.variant} />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums mb-2">{item.count}</div>
              <Progress
                value={item.count}
                max={totalLeads}
                size="xs"
                variant={item.variant === 'quente' ? 'danger' : item.variant === 'morno' ? 'warning' : 'blue'}
              />
            </div>
          ))}
        </div>

        {/* ── Toolbar de filtros ─────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
          <form className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <School size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar escola, cidade…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
              />
            </div>

            {/* Estado */}
            <select
              name="estado"
              defaultValue={estado}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-amber-400 transition-all"
            >
              <option value="">Todos os estados</option>
              {listaEstados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>

            {/* View mode */}
            <input type="hidden" name="view" value={view} />

            <button type="submit" className="btn btn-secondary btn-sm">Filtrar</button>
            {(q || estado) && (
              <Link href={`/comercial/escolas?view=${view}`} className="btn btn-ghost btn-sm">Limpar</Link>
            )}

            {/* View toggle */}
            <div className="ml-auto flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <Link
                href={`/comercial/escolas?q=${q}&estado=${estado}&page=${page}&view=table`}
                className={`p-1.5 rounded-md transition-all ${view === 'table' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={15} />
              </Link>
              <Link
                href={`/comercial/escolas?q=${q}&estado=${estado}&page=${page}&view=grid`}
                className={`p-1.5 rounded-md transition-all ${view === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={15} />
              </Link>
            </div>
          </form>
        </div>

        {/* ── Conteúdo ──────────────────────────────────────── */}
        {escolas && escolas.length > 0 ? (

          view === 'grid' ? (
            /* Grid de cards */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {escolas.map((e: any) => (
                <EscolaCard
                  key={e.id}
                  id={e.id}
                  nome={e.nome}
                  cidade={e.cidade}
                  estado={e.estado}
                  perfil_pedagogico={e.perfil_pedagogico}
                  total_alunos={e.total_alunos}
                  potencial_financeiro={e.potencial_financeiro}
                  classificacao={e.classificacao_atual}
                  probabilidade={e.probabilidade_atual}
                  ultimo_contato={e.ultimo_contato}
                  responsavel_nome={e.responsavel_nome}
                  href={`/comercial/escolas/${e.id}`}
                  variant="grid"
                />
              ))}
            </div>
          ) : (
            /* Tabela */
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Escola</th>
                      <th>Localidade</th>
                      <th>Contato</th>
                      <th style={{ textAlign: 'right' }}>Alunos</th>
                      <th style={{ textAlign: 'right' }}>Potencial</th>
                      <th>Lead</th>
                      <th>Último contato</th>
                      <th style={{ width: 100 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {escolas.map((e: any) => (
                      <tr key={e.id}>
                        <td>
                          <div className="flex flex-col">
                            <Link
                              href={`/comercial/escolas/${e.id}`}
                              className="font-semibold text-blue-900 hover:text-amber-700 transition-colors text-sm no-underline"
                            >
                              {e.nome}
                            </Link>
                            {e.escola_paideia && (
                              <span className="badge badge-teal" style={{ fontSize: '.58rem', width: 'fit-content', marginTop: 2 }}>Paideia</span>
                            )}
                          </div>
                        </td>
                        <td className="text-sm text-slate-600">
                          {e.cidade}{e.estado ? `, ${e.estado}` : ''}
                        </td>
                        <td>
                          {e.contato_nome ? (
                            <div>
                              <div className="text-sm font-medium text-slate-800">{e.contato_nome}</div>
                              <div className="text-xs text-slate-400">{e.contato_cargo}</div>
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="text-sm text-right font-medium text-slate-700">
                          {e.total_alunos ?? 0}
                        </td>
                        <td className="text-sm text-right font-semibold text-emerald-700">
                          {formatCurrency(e.potencial_financeiro ?? 0)}
                        </td>
                        <td>
                          <ClassificacaoBadge value={e.classificacao_atual ?? 'frio'} />
                        </td>
                        <td className="text-xs text-slate-500">
                          {formatDate(e.ultimo_contato)}
                        </td>
                        <td>
                          <div className="flex gap-1.5">
                            <Link href={`/comercial/registros/novo?escola=${e.id}`} className="btn btn-outline btn-sm" title="Novo registro">
                              +
                            </Link>
                            <Link href={`/comercial/escolas/${e.id}/editar`} className="btn btn-ghost btn-sm">
                              Editar
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="card-footer flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Página <strong>{page}</strong> de <strong>{totalPages}</strong> — <strong>{count}</strong> escolas
                  </span>
                  <div className="flex gap-1.5">
                    {page > 1 && (
                      <Link href={`?page=${page - 1}&q=${q}&estado=${estado}&view=${view}`} className="btn btn-ghost btn-sm">
                        ← Anterior
                      </Link>
                    )}
                    {page < totalPages && (
                      <Link href={`?page=${page + 1}&q=${q}&estado=${estado}&view=${view}`} className="btn btn-primary btn-sm">
                        Próxima →
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          )

        ) : (
          <div className="card">
            <div className="empty-state py-20">
              <School size={48} />
              <h3>Nenhuma escola encontrada</h3>
              <p className="text-sm mt-1">{q ? `Nenhum resultado para "${q}"` : 'Cadastre a primeira escola para começar.'}</p>
              <Link href="/comercial/escolas/nova" className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>
                <Plus size={14} /> Nova Escola
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
