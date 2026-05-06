import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { upsertEscola } from '@/lib/actions'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { PERFIL_OPTIONS, ORIGEM_OPTIONS, CARGO_CONTATO_OPTIONS } from '@/types/database'

interface Props { params: Promise<{ id: string }> }

export default async function EscolaEditar({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: escola }, { data: profiles }] = await Promise.all([
    supabase.from('escolas').select('*').eq('id', id).single(),
    supabase.from('profiles').select('id, full_name').eq('is_active', true).order('full_name'),
  ])

  if (!escola) notFound()
  const e = escola as any

  return (
    <div>
      <PageHeader title={`Editar: ${e.nome}`} />
      <div className="p-6 max-w-4xl">
        <div className="breadcrumb mb-4">
          <Link href="/comercial/escolas">Escolas</Link>
          <span className="breadcrumb-sep">/</span>
          <Link href={`/comercial/escolas/${id}`}>{e.nome}</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Editar</span>
        </div>

        <form action={upsertEscola}>
          <input type="hidden" name="id" value={id} />

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Identificação</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Nome da Escola *</label>
                  <input name="nome" className="form-control" defaultValue={e.nome} required />
                </div>
                <div>
                  <label className="form-label">CNPJ</label>
                  <input name="cnpj" className="form-control" defaultValue={e.cnpj ?? ''} />
                </div>
                <div>
                  <label className="form-label">Perfil Pedagógico</label>
                  <select name="perfil_pedagogico" className="form-control" defaultValue={e.perfil_pedagogico}>
                    {PERFIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', paddingTop: '1.5rem' }}>
                  <input type="hidden" name="escola_paideia" id="paideia_hidden" value={e.escola_paideia ? 'true' : 'false'} />
                  <input type="checkbox" id="paideia_cb" defaultChecked={e.escola_paideia}
                    onChange={() => {
                      const h = document.getElementById('paideia_hidden') as HTMLInputElement
                      const cb = document.getElementById('paideia_cb') as HTMLInputElement
                      if (h && cb) h.value = cb.checked ? 'true' : 'false'
                    }} />
                  <label htmlFor="paideia_cb" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>A escola é Paideia?</label>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Endereço</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Rua</label>
                  <input name="rua" className="form-control" defaultValue={e.rua ?? ''} />
                </div>
                <div>
                  <label className="form-label">Número</label>
                  <input name="numero" className="form-control" defaultValue={e.numero ?? ''} />
                </div>
                <div>
                  <label className="form-label">Complemento</label>
                  <input name="complemento" className="form-control" defaultValue={e.complemento ?? ''} />
                </div>
                <div>
                  <label className="form-label">Bairro</label>
                  <input name="bairro" className="form-control" defaultValue={e.bairro ?? ''} />
                </div>
                <div>
                  <label className="form-label">CEP</label>
                  <input name="cep" className="form-control" defaultValue={e.cep ?? ''} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Cidade</label>
                  <input name="cidade" className="form-control" defaultValue={e.cidade ?? ''} />
                </div>
                <div>
                  <label className="form-label">Estado (UF)</label>
                  <input name="estado" className="form-control" maxLength={2} defaultValue={e.estado ?? ''} style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Contato</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div><label className="form-label">Telefone</label><input name="telefone" className="form-control" defaultValue={e.telefone ?? ''} /></div>
                <div><label className="form-label">E-mail</label><input name="email" type="email" className="form-control" defaultValue={e.email ?? ''} /></div>
                <div><label className="form-label">Site</label><input name="site" className="form-control" defaultValue={e.site ?? ''} /></div>
                <div><label className="form-label">Nome do Contato</label><input name="contato_nome" className="form-control" defaultValue={e.contato_nome ?? ''} /></div>
                <div>
                  <label className="form-label">Cargo do Contato</label>
                  <select name="contato_cargo" className="form-control" defaultValue={e.contato_cargo ?? ''}>
                    <option value="">Selecione...</option>
                    {CARGO_CONTATO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Nome do Diretor</label><input name="diretor_nome" className="form-control" defaultValue={e.diretor_nome ?? ''} /></div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Quantidade Estimada de Alunos</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[['qtd_infantil','Infantil'],['qtd_fund1','Fundamental 1'],['qtd_fund2','Fundamental 2'],['qtd_medio','Ensino Médio']].map(([name, label]) => (
                  <div key={name}>
                    <label className="form-label">{label}</label>
                    <input name={name} type="number" min="0" className="form-control" defaultValue={(e as any)[name] ?? 0} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card mb-6">
            <div className="card-header"><span className="card-title">Gestão Comercial</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Origem do Lead</label>
                  <select name="origem_lead" className="form-control" defaultValue={e.origem_lead ?? ''}>
                    <option value="">Selecione...</option>
                    {ORIGEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Responsável Comercial</label>
                  <select name="responsavel_id" className="form-control" defaultValue={e.responsavel_id ?? ''}>
                    <option value="">Selecione...</option>
                    {profiles?.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Observações</label>
                <textarea name="observacoes" className="form-control" rows={3} defaultValue={e.observacoes ?? ''} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            <Link href={`/comercial/escolas/${id}`} className="btn btn-ghost">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
