import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { criarTarefa, criarNota, concluirTarefa } from '@/lib/actions'
import { formatCurrency, formatDate } from '@/lib/utils'
import { LABEL, MEIO_OPTIONS } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

export default async function EscolaDetalhe({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: escola }, { data: registros }, { data: negociacoes }, { data: tarefas }, { data: notas }, { data: contrato }] = await Promise.all([
    supabase.from('escolas_resumo').select('*').eq('id', id).single(),
    supabase.from('registros').select('*, responsavel:profiles(full_name)').eq('escola_id', id).order('data_contato', { ascending: false }),
    supabase.from('negociacoes').select('*, responsavel:profiles(full_name)').eq('escola_id', id).order('updated_at', { ascending: false }),
    supabase.from('tarefas').select('*').eq('escola_id', id).eq('status', 'pendente').order('vencimento'),
    supabase.from('notas_escola').select('*, criado_por:profiles(full_name)').eq('escola_id', id).order('fixada', { ascending: false }).order('created_at', { ascending: false }),
    supabase.from('contratos').select('*').eq('escola_id', id).single(),
  ])

  if (!escola) notFound()

  const pot = escola.potencial_financeiro ?? 0

  return (
    <div>
      <PageHeader
        title={escola.nome}
        subtitle={`${escola.cidade ?? ''}${escola.estado ? `, ${escola.estado}` : ''}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/comercial/registros/novo?escola=${id}`} className="btn btn-primary btn-sm">+ Novo Registro</Link>
            <Link href={`/comercial/escolas/${id}/editar`} className="btn btn-ghost btn-sm">Editar</Link>
          </div>
        }
      />

      <div className="p-6">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '.4rem', fontSize: '.78rem', color: 'var(--text-s)', marginBottom: '1rem', alignItems: 'center' }}>
          <Link href="/comercial/escolas" style={{ color: 'var(--text-s)' }}>Escolas</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-m)', fontWeight: 600 }}>{escola.nome}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>

          {/* Coluna principal */}
          <div>
            {/* Dados */}
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title">Dados da Escola</span>
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                  {escola.escola_paideia && <span className="badge badge-teal">Paideia</span>}
                  <span className="badge badge-gray">{LABEL.perfil_pedagogico[escola.perfil_pedagogico] ?? escola.perfil_pedagogico}</span>
                  {escola.classificacao_atual && (
                    <span className={`badge badge-${escola.classificacao_atual}`}>
                      {escola.classificacao_atual === 'quente' ? '🔥 Quente' : escola.classificacao_atual === 'morno' ? '🌤 Morno' : '❄️ Frio'}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-s)', fontWeight: 700, marginBottom: '.3rem' }}>ENDEREÇO</div>
                    <div style={{ fontSize: '.85rem' }}>
                      {escola.rua ? `${escola.rua}, ${escola.numero ?? ''}` : '—'}<br />
                      {escola.bairro && `${escola.bairro} — `}{escola.cidade}/{escola.estado}<br />
                      {escola.cep && `CEP: ${escola.cep}`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-s)', fontWeight: 700, marginBottom: '.3rem' }}>CONTATO</div>
                    <div style={{ fontSize: '.85rem' }}>
                      {escola.telefone && <div>📞 {escola.telefone}</div>}
                      {escola.email && <div>✉ {escola.email}</div>}
                      {escola.site && <div><a href={escola.site} target="_blank">🌐 Site</a></div>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-s)', fontWeight: 700, marginBottom: '.3rem' }}>RESPONSÁVEL</div>
                    <div style={{ fontSize: '.85rem' }}>{escola.responsavel_nome ?? '—'}</div>
                    {escola.origem_lead && (
                      <>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-s)', fontWeight: 700, marginTop: '.5rem', marginBottom: '.3rem' }}>ORIGEM</div>
                        <div style={{ fontSize: '.85rem' }}>{LABEL.origem_lead[escola.origem_lead] ?? escola.origem_lead}</div>
                      </>
                    )}
                  </div>
                </div>

                {escola.contato_nome && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '.72rem', color: 'var(--text-s)', fontWeight: 700, marginBottom: '.3rem' }}>CONTATO PRINCIPAL</div>
                    <div style={{ fontSize: '.85rem' }}>
                      {escola.contato_nome} — {escola.contato_cargo ?? ''}
                      {escola.diretor_nome && <span style={{ color: 'var(--text-s)', marginLeft: '.5rem' }}>| Diretor: {escola.diretor_nome}</span>}
                    </div>
                  </div>
                )}

                {/* Alunos & Potencial */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '.5rem' }}>
                  {[['Infantil', escola.qtd_infantil],['Fund. I', escola.qtd_fund1],['Fund. II', escola.qtd_fund2],['Médio', escola.qtd_medio],['Total', escola.total_alunos ?? 0]].map(([label, val]) => (
                    <div key={String(label)} style={{ textAlign: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: '.5rem' }}>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-s)' }}>{label}</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--brand-blue)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: '1.5rem', gap: 0 }} id="tabs">
              {[['registros','Registros'],['negociacoes','Negociações'],['tarefas','Tarefas'],['notas','Notas'],['contrato','Jornada Contratual']].map(([k,l]) => (
                <button key={k} data-tab={k} onClick={() => {}} className="tab-btn"
                  style={{ padding: '.65rem 1rem', fontSize: '.85rem', fontWeight: 600, color: 'var(--text-s)', background: 'none', border: 'none', borderBottom: '2px solid transparent', marginBottom: '-2px', cursor: 'pointer' }}>
                  {l}
                </button>
              ))}
            </div>

            {/* Timeline de Registros */}
            <div id="tab-registros">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                  Jornada de Relacionamento ({registros?.length ?? 0} interações)
                </h3>
                <Link href={`/comercial/registros/novo?escola=${id}`} className="btn btn-primary btn-sm">+ Nova Interação</Link>
              </div>

              {registros && registros.length > 0 ? (
                <div className="timeline">
                  {registros.map((r: any) => {
                    const cor = r.classificacao === 'quente' ? 'var(--danger)' : r.classificacao === 'morno' ? 'var(--warning)' : 'var(--brand-blue)'
                    return (
                      <div key={r.id} className="timeline-item">
                        <div className="timeline-dot" style={{ background: cor, boxShadow: `0 0 0 2px ${cor}` }} />
                        <div className="timeline-card" style={{ borderLeftColor: cor }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '.5rem', flexWrap: 'wrap', gap: '.5rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '.9rem' }}>
                                {LABEL.meio_contato?.[r.meio_contato] ?? r.meio_contato}
                                {r.contato_nome && <span style={{ fontWeight: 400, color: 'var(--text-s)' }}> — {r.contato_nome}{r.contato_cargo ? ` (${r.contato_cargo})` : ''}</span>}
                              </div>
                              <div style={{ fontSize: '.75rem', color: 'var(--text-s)' }}>
                                {formatDate(r.data_contato)} · {(r.responsavel as any)?.full_name ?? '—'}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                              <span className={`badge badge-${r.classificacao}`}>{r.classificacao === 'quente' ? 'Quente' : r.classificacao === 'morno' ? 'Morno' : 'Frio'}</span>
                              <span className="badge badge-gray">{r.probabilidade}%</span>
                              {r.potencial_financeiro > 0 && <span className="badge badge-orange">{formatCurrency(r.potencial_financeiro)}</span>}
                              <Link href={`/comercial/registros/${r.id}/editar`} className="btn btn-ghost btn-sm">Editar</Link>
                            </div>
                          </div>
                          <div style={{ fontSize: '.875rem', color: 'var(--text-m)', marginBottom: '.75rem' }}>{r.resumo}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem' }}>
                            <span className="badge badge-gray">Interesse: {LABEL.interesse?.[r.interesse] ?? r.interesse}</span>
                            <span className="badge badge-blue">{LABEL.prontidao?.[r.prontidao] ?? r.prontidao}</span>
                            <span className="badge badge-teal">Abertura: {LABEL.abertura?.[r.abertura] ?? r.abertura}</span>
                          </div>
                          {r.encaminhamentos?.length > 0 && (
                            <div style={{ marginTop: '.5rem', fontSize: '.72rem', color: 'var(--text-s)' }}>
                              Encaminhamentos: {r.encaminhamentos.join(', ')}
                            </div>
                          )}
                          {r.proximo_contato && (
                            <div style={{ marginTop: '.4rem', fontSize: '.78rem', color: 'var(--brand-teal)', fontWeight: 600 }}>
                              📅 Próximo contato: {formatDate(r.proximo_contato)}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="empty-state">
                  <h3>Nenhuma interação registrada</h3>
                  <Link href={`/comercial/registros/novo?escola=${id}`} className="btn btn-primary btn-sm" style={{ marginTop: '.75rem' }}>Registrar Primeira Interação</Link>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar direita */}
          <div>
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Resumo</span></div>
              <div className="card-body">
                {[
                  ['Interações', registros?.length ?? 0],
                  ['Potencial', formatCurrency(pot)],
                  ['Total Alunos', escola.total_alunos ?? 0],
                  ['Porte', pot < 100000 ? 'Pequena' : pot < 300000 ? 'Média' : 'Grande'],
                  ['Último Contato', formatDate(escola.ultimo_contato)],
                ].map(([label, val]) => (
                  <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '.85rem' }}>
                    <span style={{ color: 'var(--text-s)' }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nova Tarefa */}
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Nova Tarefa</span></div>
              <form action={criarTarefa} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <input type="hidden" name="escola_id" value={id} />
                <input name="titulo" className="form-control" placeholder="Título da tarefa" required />
                <input name="vencimento" type="date" className="form-control" />
                <select name="prioridade" className="form-control">
                  {[['baixa','Baixa'],['media','Média'],['alta','Alta'],['urgente','Urgente']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button type="submit" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>Criar Tarefa</button>
              </form>
            </div>

            {/* Tarefas Pendentes */}
            {tarefas && tarefas.length > 0 && (
              <div className="card mb-4">
                <div className="card-header"><span className="card-title">Tarefas Pendentes</span></div>
                <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                  {tarefas.map((t: any) => {
                    const vencida = t.vencimento && new Date(t.vencimento) < new Date()
                    return (
                      <div key={t.id} style={{ padding: '.5rem', background: vencida ? '#fff5f5' : 'var(--surface-2)', borderRadius: 8, borderLeft: `3px solid ${vencida ? 'var(--danger)' : 'var(--brand-teal)'}` }}>
                        <div style={{ fontWeight: 600, fontSize: '.82rem' }}>{t.titulo}</div>
                        <div style={{ fontSize: '.72rem', color: 'var(--text-s)' }}>{formatDate(t.vencimento)} · {t.prioridade}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Nota rápida */}
            <div className="card">
              <div className="card-header"><span className="card-title">Adicionar Nota</span></div>
              <form action={criarNota} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                <input type="hidden" name="escola_id" value={id} />
                <textarea name="texto" className="form-control" rows={3} placeholder="Escreva uma nota..." required />
                <label style={{ display: 'flex', alignItems: 'center', gap: '.35rem', fontSize: '.82rem', cursor: 'pointer' }}>
                  <input type="checkbox" onChange={e => {}} name="fixada_cb" />
                  <input type="hidden" name="fixada" value="false" />
                  Fixar nota
                </label>
                <button type="submit" className="btn btn-primary btn-sm" style={{ justifyContent: 'center' }}>Salvar Nota</button>
              </form>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
              <Link href={`/comercial/jornada?escola=${id}`} className="btn btn-ghost" style={{ justifyContent: 'center', textAlign: 'center' }}>Ver Jornada Completa</Link>
              <Link href={`/comercial/escolas/${id}/editar`} className="btn btn-outline" style={{ justifyContent: 'center' }}>Editar Dados</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher script */}
      <script dangerouslySetInnerHTML={{ __html: `
        (function() {
          const tabs = ['registros','negociacoes','tarefas','notas','contrato'];
          const btns = document.querySelectorAll('.tab-btn');
          function activate(k) {
            tabs.forEach(t => {
              const el = document.getElementById('tab-' + t);
              if (el) el.style.display = t === k ? '' : 'none';
            });
            btns.forEach(b => {
              const active = b.dataset.tab === k;
              b.style.color = active ? 'var(--brand-orange)' : 'var(--text-s)';
              b.style.borderBottomColor = active ? 'var(--brand-orange)' : 'transparent';
            });
          }
          btns.forEach(b => b.addEventListener('click', () => activate(b.dataset.tab)));
          // Ocultar tabs inicialmente exceto registros
          tabs.slice(1).forEach(t => {
            const el = document.getElementById('tab-' + t);
            if (el) el.style.display = 'none';
          });
          btns[0].style.color = 'var(--brand-orange)';
          btns[0].style.borderBottomColor = 'var(--brand-orange)';
          // Ativar tab da URL
          const hash = location.search.includes('tab=') ? new URLSearchParams(location.search).get('tab') : null;
          if (hash && tabs.includes(hash)) activate(hash);
        })();
      `}} />
    </div>
  )
}
