import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/lib/utils'

async function deletarEscola(formData: FormData) {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const escola_id = formData.get('escola_id') as string
  if (!escola_id) return
  await supabase.from('registros').delete().eq('escola_id', escola_id)
  await supabase.from('tarefas').delete().eq('escola_id', escola_id)
  await supabase.from('notas_escola').delete().eq('escola_id', escola_id)
  await supabase.from('contratos').delete().eq('escola_id', escola_id)
  await supabase.from('negociacoes').delete().eq('escola_id', escola_id)
  await supabase.from('escolas').delete().eq('id', escola_id)
  redirect('/comercial/tabela')
}

export default async function TabelaPage() {
  const supabase = await createClient()

  // Join escolas + registros (agrupado no lado JS pois Supabase não faz GROUP BY nativo)
  const [{ data: escolas }, { data: registros }] = await Promise.all([
    supabase.from('escolas').select('*').eq('ativa', true).order('nome'),
    supabase.from('registros').select('escola_id, data_contato, meio_contato, encaminhamentos, prontidao, classificacao, resumo').order('data_contato'),
  ])

  // Agrupar registros por escola
  const regMap: Record<string, any[]> = {}
  registros?.forEach((r: any) => {
    if (!regMap[r.escola_id]) regMap[r.escola_id] = []
    regMap[r.escola_id].push(r)
  })

  const rows = escolas?.map((e: any) => {
    const regs = regMap[e.id] ?? []
    return {
      ...e,
      datas: [...new Set(regs.map((r: any) => formatDate(r.data_contato)))].join('; '),
      meios: [...new Set(regs.map((r: any) => r.meio_contato))].join('; '),
      encaminhamentos: [...new Set(regs.flatMap((r: any) => r.encaminhamentos ?? []))].join('; '),
      prontidoes: [...new Set(regs.map((r: any) => r.prontidao))].join('; '),
      classificacoes: [...new Set(regs.map((r: any) => r.classificacao))].join('; '),
      resumos: regs.map((r: any) => r.resumo).join(' / '),
    }
  }) ?? []

  return (
    <div>
      <PageHeader
        title="Tabela Geral de Escolas"
        subtitle={`${rows.length} escola${rows.length !== 1 ? 's' : ''} cadastrada${rows.length !== 1 ? 's' : ''}`}
        actions={
          <a href="/api/export/escolas" className="btn btn-secondary btn-sm">
            📥 Baixar Excel
          </a>
        }
      />

      <div className="p-6">
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            {rows.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Escola</th>
                    <th>Estado</th>
                    <th>Telefone</th>
                    <th>Email</th>
                    <th>CNPJ</th>
                    <th>Inf.</th>
                    <th>F1</th>
                    <th>F2</th>
                    <th>Méd.</th>
                    <th>Potencial</th>
                    <th>Datas Contato</th>
                    <th>Meios</th>
                    <th>Prontidão</th>
                    <th>Classificação</th>
                    <th>Resumos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r: any) => (
                    <tr key={r.id}>
                      <td>
                        <Link href={`/comercial/escolas/${r.id}`}
                          style={{ fontWeight: 700, color: 'var(--brand-blue)', whiteSpace: 'nowrap' }}>
                          {r.nome}
                        </Link>
                      </td>
                      <td style={{ fontSize: '.82rem' }}>{r.estado ?? '—'}</td>
                      <td style={{ fontSize: '.82rem' }}>{r.telefone ?? '—'}</td>
                      <td style={{ fontSize: '.82rem' }}>{r.email ?? '—'}</td>
                      <td style={{ fontSize: '.82rem' }}>{r.cnpj ?? '—'}</td>
                      <td style={{ textAlign: 'center' }}>{r.qtd_infantil}</td>
                      <td style={{ textAlign: 'center' }}>{r.qtd_fund1}</td>
                      <td style={{ textAlign: 'center' }}>{r.qtd_fund2}</td>
                      <td style={{ textAlign: 'center' }}>{r.qtd_medio}</td>
                      <td style={{ fontWeight: 600, color: 'var(--brand-orange)', whiteSpace: 'nowrap', fontSize: '.82rem' }}>
                        {formatCurrency(r.potencial_financeiro ?? 0)}
                      </td>
                      <td style={{ fontSize: '.75rem', color: 'var(--text-s)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.datas || '—'}</td>
                      <td style={{ fontSize: '.75rem', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.meios || '—'}</td>
                      <td style={{ fontSize: '.75rem', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.prontidoes || '—'}</td>
                      <td style={{ fontSize: '.75rem' }}>{r.classificacoes || '—'}</td>
                      <td style={{ fontSize: '.75rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.resumos || '—'}</td>
                      <td>
                        <form action={deletarEscola}>
                          <input type="hidden" name="escola_id" value={r.id} />
                          <button type="submit" className="btn btn-danger btn-sm"
                            onClick={() => confirm(`Excluir "${r.nome}" e todos os seus dados?`)}
                            title="Excluir escola">
                            🗑
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <h3>Nenhuma escola cadastrada</h3>
                <Link href="/comercial/escolas/nova" className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>
                  Cadastrar Escola
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
