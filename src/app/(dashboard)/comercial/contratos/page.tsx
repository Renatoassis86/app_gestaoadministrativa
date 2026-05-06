import { createClient } from '@/lib/supabase/server'
import { upsertContrato } from '@/lib/actions'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

interface Props { searchParams: Promise<{ escola?: string }> }

const META_ALUNOS = 3000
const META_RECEITA = 3000000

export default async function ContratosPage({ searchParams }: Props) {
  const params = await searchParams
  const escolaId = params.escola ?? ''
  const supabase = await createClient()

  const [{ data: escolas }, { data: contratos_geral }] = await Promise.all([
    supabase.from('escolas').select('id, nome, estado').eq('ativa', true).order('nome'),
    supabase.from('contratos').select('*, escola:escolas(nome, estado)')
      .eq('formulario_enviado', true).order('created_at', { ascending: false }),
  ])

  let escola = null, contrato = null, ultimo_enc = null

  if (escolaId) {
    const [{ data: e }, { data: c }, { data: reg }] = await Promise.all([
      supabase.from('escolas').select('*').eq('id', escolaId).single(),
      supabase.from('contratos').select('*').eq('escola_id', escolaId).single(),
      supabase.from('registros').select('encaminhamentos').eq('escola_id', escolaId)
        .order('data_contato', { ascending: false }).limit(1).single(),
    ])
    escola = e
    contrato = c
    ultimo_enc = reg?.encaminhamentos?.join(', ') ?? ''
  }

  // Metas
  const total_alunos_contratos = contratos_geral?.reduce((acc: number, c: any) =>
    acc + (c.infantil2_qtd + c.infantil3_qtd + c.infantil4_qtd + c.infantil5_qtd + c.fund1_ano1_qtd), 0) ?? 0
  const total_receita_contratos = contratos_geral?.reduce((acc: number, c: any) => acc + (c.valor_total ?? 0), 0) ?? 0
  const pct_alunos = Math.min(100, Math.round((total_alunos_contratos / META_ALUNOS) * 100))
  const pct_receita = Math.min(100, Math.round((total_receita_contratos / META_RECEITA) * 100))

  const bool_val = (v: boolean) => v ? 'true' : 'false'
  const c = contrato as any

  return (
    <div>
      <PageHeader title="Jornada Contratual" subtitle="Gestão de contratos e fechamentos" />
      <div className="p-6">

        {/* Seletor */}
        <div className="card mb-4">
          <div className="card-body" style={{ padding: '.85rem 1.25rem' }}>
            <form style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <label className="form-label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Selecionar Escola:</label>
              <select name="escola" className="form-control" style={{ maxWidth: 400 }} defaultValue={escolaId}>
                <option value="">— Selecione —</option>
                {escolas?.map((e: any) => <option key={e.id} value={e.id}>{e.nome}{e.estado ? ` (${e.estado})` : ''}</option>)}
              </select>
              <button type="submit" className="btn btn-secondary btn-sm">Carregar</button>
            </form>
          </div>
        </div>

        {escola && (
          <form action={upsertContrato}>
            <input type="hidden" name="escola_id" value={escolaId} />

            {/* Status checklist */}
            <div className="card mb-4">
              <div className="card-header">
                <span className="card-title">Status e Encaminhamentos — {(escola as any).nome}</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    ['formulario_enviado', 'Formulário enviado?'],
                    ['formulario_recebido', 'Formulário recebido?'],
                    ['minuta_enviada', 'Minuta enviada?'],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label className="form-label">{label}</label>
                      <select name={name} className="form-control" defaultValue={c?.[name] ? 'true' : 'false'}>
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    ['retorno_minuta', 'Retorno sobre minuta?'],
                    ['minuta_atualizada', 'Atualização da minuta?'],
                    ['contrato_enviado', 'Contrato enviado para assinatura?'],
                    ['contrato_assinado', 'Contrato assinado?'],
                    ['contrato_arquivado', 'Contrato arquivado?'],
                  ].map(([name, label]) => (
                    <div key={name}>
                      <label className="form-label">{label}</label>
                      <select name={name} className="form-control" defaultValue={c?.[name] ? 'true' : 'false'}>
                        <option value="false">Não</option>
                        <option value="true">Sim</option>
                      </select>
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Observações ou principais pontos levantados pela escola sobre a minuta:</label>
                  <textarea name="observacao_minuta" className="form-control" rows={3} defaultValue={c?.observacao_minuta ?? ''} />
                </div>

                <div>
                  <label className="form-label">Encaminhamento final</label>
                  <input name="encaminhamento_final" className="form-control"
                    defaultValue={c?.encaminhamento_final ?? ultimo_enc ?? ''}
                    placeholder="Próximo passo ou encaminhamento..." />
                </div>
              </div>
            </div>

            {/* Alunos e Valores */}
            <div className="card mb-4">
              <div className="card-header"><span className="card-title">Detalhes dos Alunos e Valores</span></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Quantidades */}
                  <div>
                    <div className="form-section-title">Quantidades</div>
                    {[
                      ['infantil2_qtd', 'Qtd Infantil 2'],
                      ['infantil3_qtd', 'Qtd Infantil 3'],
                      ['infantil4_qtd', 'Qtd Infantil 4'],
                      ['infantil5_qtd', 'Qtd Infantil 5'],
                      ['fund1_ano1_qtd', 'Qtd 1º Ano Fund I'],
                    ].map(([name, label]) => (
                      <div key={name} className="form-group">
                        <label className="form-label">{label}</label>
                        <input name={name} type="number" min="0" className="form-control"
                          defaultValue={c?.[name] ?? 0} />
                      </div>
                    ))}
                  </div>
                  {/* Valores */}
                  <div>
                    <div className="form-section-title">Valores (R$)</div>
                    {[
                      ['infantil2_valor', 'Valor Infantil 2'],
                      ['infantil3_valor', 'Valor Infantil 3'],
                      ['infantil4_valor', 'Valor Infantil 4'],
                      ['infantil5_valor', 'Valor Infantil 5'],
                      ['fund1_ano1_valor', 'Valor 1º Ano Fund I'],
                    ].map(([name, label]) => (
                      <div key={name} className="form-group">
                        <label className="form-label">{label}</label>
                        <input name={name} type="number" min="0" step="0.01" className="form-control"
                          defaultValue={c?.[name] ?? 0} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '200px 1fr', gap: '1rem', alignItems: 'end' }}>
                  <div>
                    <label className="form-label">Tempo de Contrato (anos)</label>
                    <input name="tempo_contrato" type="number" min="1" className="form-control"
                      defaultValue={c?.tempo_contrato ?? 1} />
                  </div>
                  {c?.valor_total > 0 && (
                    <div style={{ padding: '1rem', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '.75rem', color: 'var(--text-s)', marginBottom: '.2rem' }}>VALOR TOTAL ESTIMADO 2026</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-orange)' }}>
                        {formatCurrency(c.valor_total)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary">Salvar Contrato</button>
          </form>
        )}

        {/* Acompanhamento Geral */}
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-header"><span className="card-title">Acompanhamento Geral</span></div>
          <div className="card-body">

            {/* Metas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--brand-blue)' }}>Meta de Alunos</span>
                  <span style={{ fontSize: '.82rem', color: 'var(--text-s)' }}>{total_alunos_contratos} / {META_ALUNOS} ({pct_alunos}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct_alunos}%`, background: 'var(--success)' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--brand-blue)' }}>Meta de Receita</span>
                  <span style={{ fontSize: '.82rem', color: 'var(--text-s)' }}>{formatCurrency(total_receita_contratos)} / {formatCurrency(META_RECEITA)} ({pct_receita}%)</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct_receita}%`, background: 'var(--brand-blue)' }} />
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div style={{ overflowX: 'auto' }}>
              {contratos_geral && contratos_geral.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Escola</th><th>Estado</th><th>Encaminhamento Final</th>
                      <th>Form.</th><th>Minuta</th><th>Assinado</th><th>Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contratos_geral.map((c: any) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600 }}>{c.escola?.nome}</td>
                        <td style={{ fontSize: '.82rem' }}>{c.escola?.estado ?? '—'}</td>
                        <td style={{ fontSize: '.82rem' }}>{c.encaminhamento_final ?? '—'}</td>
                        <td><span className={`badge ${c.formulario_recebido ? 'badge-green' : 'badge-gray'}`}>{c.formulario_recebido ? 'Sim' : 'Não'}</span></td>
                        <td><span className={`badge ${c.minuta_enviada ? 'badge-green' : 'badge-gray'}`}>{c.minuta_enviada ? 'Sim' : 'Não'}</span></td>
                        <td><span className={`badge ${c.contrato_assinado ? 'badge-green' : 'badge-red'}`}>{c.contrato_assinado ? 'Sim' : 'Não'}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--brand-orange)' }}>{c.valor_total ? formatCurrency(c.valor_total) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state"><h3>Nenhum contrato com formulário enviado ainda</h3></div>
              )}
            </div>
          </div>
        </div>

      </div>

      <script dangerouslySetInnerHTML={{ __html: `
        const sel = document.querySelector('select[name="escola"]');
        if (sel) sel.addEventListener('change', function() {
          if (this.value) window.location.href = '?escola=' + this.value;
        });
      ` }} />
    </div>
  )
}
