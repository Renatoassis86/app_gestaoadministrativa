import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'

interface Props { searchParams: Promise<{ q?: string; estado?: string; page?: string }> }

export default async function EscolasPage({ searchParams }: Props) {
  const params = await searchParams
  const q = params.q ?? ''
  const estado = params.estado ?? ''
  const page = parseInt(params.page ?? '1')
  const perPage = 25
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  const supabase = await createClient()

  let query = supabase
    .from('escolas_resumo')
    .select('*', { count: 'exact' })
    .eq('ativa', true)
    .range(from, to)
    .order('nome')

  if (q) query = query.ilike('nome', `%${q}%`)
  if (estado) query = query.eq('estado', estado)

  const { data: escolas, count } = await query

  const { data: estados } = await supabase
    .from('escolas')
    .select('estado')
    .eq('ativa', true)
    .not('estado', 'is', null)

  const listaEstados = [...new Set(estados?.map((e: any) => e.estado).filter(Boolean))].sort()
  const totalPages = Math.ceil((count ?? 0) / perPage)

  return (
    <div>
      <PageHeader
        title="Escolas / Parceiros"
        subtitle={`${count ?? 0} escola${(count ?? 0) !== 1 ? 's' : ''} cadastrada${(count ?? 0) !== 1 ? 's' : ''}`}
        actions={
          <Link href="/comercial/escolas/nova" className="btn btn-primary btn-sm">
            <Plus size={14} /> Nova Escola
          </Link>
        }
      />

      <div className="p-6">
        {/* Filtros */}
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="card-body" style={{ padding: '.85rem 1.25rem' }}>
            <form className="flex items-center gap-3 flex-wrap">
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: 'var(--surface)', border: '1px solid var(--border-d)', borderRadius: 8, padding: '.4rem .75rem', flex: 1, maxWidth: 320 }}>
                <Search size={15} style={{ color: 'var(--text-s)' }} />
                <input name="q" defaultValue={q} placeholder="Buscar escola, cidade..." style={{ border: 'none', outline: 'none', fontSize: '.875rem', background: 'transparent', width: '100%' }} />
              </div>
              <select name="estado" defaultValue={estado} className="form-control" style={{ width: 'auto' }}>
                <option value="">Todos os estados</option>
                {listaEstados.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
              <button type="submit" className="btn btn-secondary btn-sm">Filtrar</button>
              {(q || estado) && <Link href="/comercial/escolas" className="btn btn-ghost btn-sm">Limpar</Link>}
            </form>
          </div>
        </div>

        {/* Tabela */}
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            {escolas && escolas.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Escola</th>
                    <th>Localidade</th>
                    <th>Contato</th>
                    <th>Alunos</th>
                    <th>Potencial</th>
                    <th>Classificação</th>
                    <th>Último Contato</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {escolas.map((e: any) => (
                    <tr key={e.id}>
                      <td>
                        <Link href={`/comercial/escolas/${e.id}`} style={{ fontWeight: 700, color: 'var(--brand-blue)' }}>
                          {e.nome}
                        </Link>
                        {e.escola_paideia && <span className="badge badge-teal" style={{ marginLeft: '.25rem', fontSize: '.6rem' }}>Paideia</span>}
                      </td>
                      <td style={{ fontSize: '.85rem' }}>{e.cidade}{e.estado ? `, ${e.estado}` : ''}</td>
                      <td style={{ fontSize: '.85rem' }}>
                        {e.contato_nome ? (
                          <div>
                            <div>{e.contato_nome}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>{e.contato_cargo}</div>
                          </div>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: '.85rem' }}>{e.total_alunos ?? 0}</td>
                      <td style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--brand-orange)' }}>
                        {formatCurrency(e.potencial_financeiro ?? 0)}
                      </td>
                      <td>
                        {e.classificacao_atual ? (
                          <span className={`badge badge-${e.classificacao_atual}`}>
                            {e.classificacao_atual === 'quente' ? 'Quente' : e.classificacao_atual === 'morno' ? 'Morno' : 'Frio'}
                          </span>
                        ) : <span className="badge badge-gray">Frio</span>}
                      </td>
                      <td style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>{formatDate(e.ultimo_contato)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '.35rem' }}>
                          <Link href={`/comercial/registros/novo?escola=${e.id}`} className="btn btn-outline btn-sm">+</Link>
                          <Link href={`/comercial/escolas/${e.id}/editar`} className="btn btn-ghost btn-sm">Editar</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <h3>Nenhuma escola encontrada</h3>
                <Link href="/comercial/escolas/nova" className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>Nova Escola</Link>
              </div>
            )}
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>Página {page} de {totalPages}</span>
              <div style={{ display: 'flex', gap: '.35rem' }}>
                {page > 1 && <Link href={`?page=${page - 1}&q=${q}&estado=${estado}`} className="btn btn-ghost btn-sm">← Anterior</Link>}
                {page < totalPages && <Link href={`?page=${page + 1}&q=${q}&estado=${estado}`} className="btn btn-ghost btn-sm">Próxima →</Link>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
