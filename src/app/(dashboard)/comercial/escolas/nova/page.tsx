import { createClient } from '@/lib/supabase/server'
import { upsertEscola } from '@/lib/actions'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import {
  PERFIL_OPTIONS, ORIGEM_OPTIONS, CARGO_CONTATO_OPTIONS
} from '@/types/database'
import { CheckboxPaideia } from '@/components/ui/CheckboxPaideia'

export default async function EscolaNova() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles').select('id, full_name').eq('is_active', true).order('full_name')

  return (
    <div>
      <PageHeader title="Cadastrar Nova Escola" />
      <div className="p-6 max-w-4xl">
        <form action={upsertEscola}>

          {/* Identificação */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Identificação</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Nome da Escola *</label>
                  <input name="nome" className="form-control" required placeholder="Nome completo da escola" />
                </div>
                <div>
                  <label className="form-label">CNPJ</label>
                  <input name="cnpj" className="form-control" placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label className="form-label">Perfil Pedagógico</label>
                  <select name="perfil_pedagogico" className="form-control">
                    {PERFIL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <CheckboxPaideia defaultChecked={false} />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Endereço</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Rua</label>
                  <input name="rua" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Número</label>
                  <input name="numero" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Complemento</label>
                  <input name="complemento" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Bairro</label>
                  <input name="bairro" className="form-control" />
                </div>
                <div>
                  <label className="form-label">CEP</label>
                  <input name="cep" className="form-control" placeholder="00000-000" />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Cidade</label>
                  <input name="cidade" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Estado (UF)</label>
                  <input name="estado" className="form-control" maxLength={2} placeholder="UF" style={{ textTransform: 'uppercase' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Contato</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Telefone</label>
                  <input name="telefone" className="form-control" />
                </div>
                <div>
                  <label className="form-label">E-mail</label>
                  <input name="email" type="email" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Site</label>
                  <input name="site" type="url" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Nome do Contato</label>
                  <input name="contato_nome" className="form-control" />
                </div>
                <div>
                  <label className="form-label">Cargo do Contato</label>
                  <select name="contato_cargo" className="form-control">
                    <option value="">Selecione...</option>
                    {CARGO_CONTATO_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Nome do Diretor</label>
                  <input name="diretor_nome" className="form-control" />
                </div>
              </div>
            </div>
          </div>

          {/* Alunos */}
          <div className="card mb-4">
            <div className="card-header"><span className="card-title">Quantidade Estimada de Alunos</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[['qtd_infantil','Infantil'],['qtd_fund1','Fundamental 1'],['qtd_fund2','Fundamental 2'],['qtd_medio','Ensino Médio']].map(([name, label]) => (
                  <div key={name}>
                    <label className="form-label">{label}</label>
                    <input name={name} type="number" min="0" defaultValue="0" className="form-control" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gestão */}
          <div className="card mb-6">
            <div className="card-header"><span className="card-title">Gestão Comercial</span></div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Origem do Lead</label>
                  <select name="origem_lead" className="form-control">
                    <option value="">Selecione...</option>
                    {ORIGEM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Responsável pelo Cadastro</label>
                  <select name="responsavel_id" className="form-control">
                    <option value="">Selecione...</option>
                    {profiles?.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label">Observações</label>
                <textarea name="observacoes" className="form-control" rows={3} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '.75rem' }}>
            <button type="submit" className="btn btn-primary">Cadastrar Escola</button>
            <Link href="/comercial/escolas" className="btn btn-ghost">Cancelar</Link>
          </div>
        </form>
      </div>

    </div>
  )
}
