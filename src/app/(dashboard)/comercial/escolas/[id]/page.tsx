import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LABEL } from '@/types/database'
import { EscolaDetailClient } from '@/components/comercial/EscolaDetailClient'

interface Props { params: Promise<{ id: string }> }

export default async function EscolaDetalhe({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [
    { data: escola },
    { data: registros },
    { data: negociacoes },
    { data: tarefas },
    { data: notas },
    { data: contrato },
  ] = await Promise.all([
    supabase.from('escolas_resumo').select('*').eq('id', id).single(),
    supabase.from('registros').select('*, responsavel:profiles(full_name)').eq('escola_id', id).order('data_contato', { ascending: false }),
    supabase.from('negociacoes').select('*, responsavel:profiles(full_name)').eq('escola_id', id).order('updated_at', { ascending: false }),
    supabase.from('tarefas').select('*').eq('escola_id', id).eq('status', 'pendente').order('vencimento'),
    supabase.from('notas_escola').select('*').eq('escola_id', id).order('fixada', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('contratos').select('*').eq('escola_id', id).single(),
  ])

  if (!escola) notFound()

  const e = escola as any
  const pot = e.potencial_financeiro ?? 0

  return (
    <div>
      <PageHeader
        title={e.nome}
        subtitle={`${e.cidade ?? ''}${e.estado ? `, ${e.estado}` : ''}`}
        actions={
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <Link href={`/comercial/registros/novo?escola=${id}`} className="btn btn-primary btn-sm">
              + Novo Registro
            </Link>
            <Link href={`/comercial/escolas/${id}/editar`} className="btn btn-ghost btn-sm">
              Editar
            </Link>
          </div>
        }
      />

      <div className="p-6">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--text-s)', marginBottom: '1rem', alignItems: 'center' }}>
          <Link href="/comercial/escolas" style={{ color: 'var(--text-s)' }}>Escolas</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-m)', fontWeight: 600 }}>{e.nome}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Coluna principal */}
          <div>
            {/* Dados da escola */}
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <div className="card-header">
                <span className="card-title">{e.nome}</span>
                <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap' }}>
                  {e.escola_paideia && <span className="badge badge-teal">Paideia</span>}
                  <span className="badge badge-gray">{LABEL.perfil_pedagogico?.[e.perfil_pedagogico] ?? e.perfil_pedagogico}</span>
                  {e.classificacao_atual && (
                    <span className={`badge badge-${e.classificacao_atual}`}>
                      {e.classificacao_atual === 'quente' ? '🔥 Quente' : e.classificacao_atual === 'morno' ? '🌤 Morno' : '❄️ Frio'}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-s)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Endereço</div>
                    <div style={{ fontSize: '.85rem', lineHeight: 1.6 }}>
                      {e.rua ? `${e.rua}, ${e.numero ?? ''}` : '—'}<br />
                      {e.bairro && `${e.bairro} — `}{e.cidade}/{e.estado}<br />
                      {e.cep && `CEP: ${e.cep}`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-s)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Contato</div>
                    <div style={{ fontSize: '.85rem', lineHeight: 1.6 }}>
                      {e.telefone && <div>📞 {e.telefone}</div>}
                      {e.email && <div>✉ {e.email}</div>}
                      {e.site && <div><a href={e.site} target="_blank" style={{ color: 'var(--amber)' }}>🌐 Site</a></div>}
                      {!e.telefone && !e.email && '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-s)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.4rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Responsável</div>
                    <div style={{ fontSize: '.85rem' }}>{e.responsavel_nome ?? '—'}</div>
                    {e.origem_lead && (
                      <>
                        <div style={{ fontSize: '.68rem', color: 'var(--text-s)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginTop: '.6rem', marginBottom: '.2rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Origem</div>
                        <div style={{ fontSize: '.85rem' }}>{LABEL.origem_lead?.[e.origem_lead] ?? e.origem_lead}</div>
                      </>
                    )}
                  </div>
                </div>

                {e.contato_nome && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '.68rem', color: 'var(--text-s)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.35rem', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Contato Principal</div>
                    <div style={{ fontSize: '.875rem', fontWeight: 600 }}>{e.contato_nome}</div>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-s)' }}>
                      {e.contato_cargo}{e.diretor_nome ? ` · Diretor: ${e.diretor_nome}` : ''}
                    </div>
                  </div>
                )}

                {/* Alunos e potencial */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '.5rem' }}>
                  {[['Infantil', e.qtd_infantil],['Fund. I', e.qtd_fund1],['Fund. II', e.qtd_fund2],['Médio', e.qtd_medio],['Total', e.total_alunos ?? 0]].map(([label, val]) => (
                    <div key={String(label)} style={{ textAlign: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: '.5rem .25rem' }}>
                      <div style={{ fontSize: '.65rem', color: 'var(--text-s)', fontFamily: 'var(--font-montserrat,sans-serif)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--brand-blue)', fontFamily: 'var(--font-cormorant,serif)', lineHeight: 1.2 }}>{val}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '.5rem', textAlign: 'center', background: '#fffbeb', borderRadius: 8, padding: '.6rem', border: '1px solid #fcd34d' }}>
                  <div style={{ fontSize: '.65rem', color: '#92400e', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: 'var(--font-montserrat,sans-serif)' }}>Potencial Financeiro</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-cormorant,serif)', lineHeight: 1 }}>{formatCurrency(pot)}</div>
                </div>
              </div>
            </div>

            {/* Client Component para tabs, tarefas, notas interativas */}
            <EscolaDetailClient
              escolaId={id}
              registros={registros ?? []}
              negociacoes={negociacoes ?? []}
              tarefas={tarefas ?? []}
              notas={notas ?? []}
              contrato={contrato}
            />
          </div>

          {/* Sidebar direita */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Resumo KPIs */}
            <div className="card">
              <div className="card-header"><span className="card-title">Resumo</span></div>
              <div className="card-body">
                {[
                  ['Interações', registros?.length ?? 0],
                  ['Potencial', formatCurrency(pot)],
                  ['Total Alunos', e.total_alunos ?? 0],
                  ['Porte', pot < 100000 ? 'Pequena' : pot < 300000 ? 'Média' : 'Grande'],
                  ['Último Contato', formatDate(e.ultimo_contato)],
                  ['Stage', e.classificacao_atual ?? 'Frio'],
                ].map(([label, val]) => (
                  <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '.82rem' }}>
                    <span style={{ color: 'var(--text-s)', fontFamily: 'var(--font-inter,sans-serif)' }}>{label}</span>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-montserrat,sans-serif)' }}>{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="card">
              <div className="card-header"><span className="card-title">Ações</span></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                <Link href={`/comercial/registros/novo?escola=${id}`} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  + Registrar Interação
                </Link>
                <Link href={`/comercial/jornada-visual?escola=${id}`} className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                  Ver Jornada Visual
                </Link>
                <Link href={`/comercial/contratos?escola=${id}`} className="btn btn-outline" style={{ justifyContent: 'center' }}>
                  Jornada Contratual
                </Link>
                <Link href={`/comercial/escolas/${id}/editar`} className="btn btn-ghost" style={{ justifyContent: 'center' }}>
                  Editar Dados
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
