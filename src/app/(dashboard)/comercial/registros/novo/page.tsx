import { createClient } from '@/lib/supabase/server'
import { upsertRegistro } from '@/lib/actions'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import {
  MEIO_OPTIONS, INTERESSE_OPTIONS, PRONTIDAO_OPTIONS,
  ABERTURA_OPTIONS, ENCAMINHAMENTOS_OPTIONS, CARGO_CONTATO_OPTIONS
} from '@/types/database'

interface Props { searchParams: Promise<{ escola?: string }> }

export default async function RegistroNovo({ searchParams }: Props) {
  const params = await searchParams
  const escolaId = params.escola ?? ''
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: escolas }, { data: profiles }, { data: negociacoes }] = await Promise.all([
    supabase.from('escolas').select('id, nome').eq('ativa', true).order('nome'),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
    escolaId ? supabase.from('negociacoes').select('id, titulo, stage').eq('escola_id', escolaId).eq('ativa', true) : { data: [] },
  ])

  const hoje = new Date().toISOString().split('T')[0]

  return (
    <div>
      <PageHeader title="Registrar Interação Comercial" />
      <div className="p-6 max-w-4xl">
        <form action={upsertRegistro}>

          {/* Dados do Contato */}
          <div className="card mb-4">
            <div className="card-header">
              <span className="card-title">Dados do Contato</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Escola *</label>
                  <select name="escola_id" className="form-control" required>
                    <option value="">Selecione a escola...</option>
                    {escolas?.map((e: any) => (
                      <option key={e.id} value={e.id} selected={e.id === escolaId}>{e.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Negociação Vinculada</label>
                  <select name="negociacao_id" className="form-control">
                    <option value="">Nenhuma</option>
                    {negociacoes?.map((n: any) => (
                      <option key={n.id} value={n.id}>{n.titulo ?? n.stage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Data do Contato *</label>
                  <input name="data_contato" type="date" className="form-control" defaultValue={hoje} required />
                </div>
                <div>
                  <label className="form-label">Horário</label>
                  <input name="hora_contato" type="time" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Meio do Contato</label>
                  <select name="meio_contato" className="form-control">
                    {MEIO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Nome do Contato na Escola</label>
                  <input name="contato_nome" className="form-control" placeholder="Nome" />
                </div>
                <div>
                  <label className="form-label">Cargo do Contato</label>
                  <select name="contato_cargo" className="form-control">
                    <option value="">Selecione...</option>
                    {CARGO_CONTATO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Responsável pelo Contato</label>
                  <select name="responsavel_id" className="form-control">
                    {profiles?.map((p: any) => (
                      <option key={p.id} value={p.id} selected={p.id === user?.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Resumo do Contato *</label>
                <textarea name="resumo" className="form-control" rows={4}
                  placeholder="Resumo da conversa e pontos discutidos..." required />
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Diagnóstico de Interesse</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="form-label">Interesse (nível percebido)</label>
                  <select name="interesse" className="form-control">
                    {INTERESSE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Prontidão (fase da negociação)</label>
                  <select name="prontidao" className="form-control">
                    {PRONTIDAO_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Abertura para Proposta</label>
                  <select name="abertura" className="form-control">
                    {ABERTURA_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Encaminhamento Atual (próximo passo previsto)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.35rem', marginTop: '.4rem' }}>
                  {ENCAMINHAMENTOS_OPTIONS.map(o => (
                    <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.5rem .75rem', background: 'var(--surface-2)', borderRadius: 8, cursor: 'pointer', fontSize: '.85rem' }}>
                      <input type="checkbox" name="encaminhamentos" value={o.value} />
                      {o.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quantitativos */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Informações Quantitativas</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
                {[['qtd_infantil','Qtd Infantil'],['qtd_fund1','Qtd Fund. I'],['qtd_fund2','Qtd Fund. II'],['qtd_medio','Qtd Médio']].map(([name,label]) => (
                  <div key={name}>
                    <label className="form-label">{label}</label>
                    <input name={name} type="number" min="0" defaultValue="0" className="form-control" />
                  </div>
                ))}
              </div>
              <div className="form-hint" style={{ marginTop: '.5rem' }}>
                Potencial e probabilidade são calculados automaticamente ao salvar.
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="card mb-6">
            <div className="card-header"><span className="card-title">Follow-up</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Próximo Contato Previsto</label>
                  <input name="proximo_contato" type="date" className="form-control" />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Notas Internas (não visíveis ao parceiro)</label>
                <textarea name="notas_internas" className="form-control" rows={2} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button type="submit" className="btn btn-primary">Salvar Registro</button>
            {escolaId
              ? <Link href={`/comercial/escolas/${escolaId}`} className="btn btn-ghost">Cancelar</Link>
              : <Link href="/comercial/registros" className="btn btn-ghost">Cancelar</Link>
            }
          </div>
        </form>
      </div>
    </div>
  )
}
