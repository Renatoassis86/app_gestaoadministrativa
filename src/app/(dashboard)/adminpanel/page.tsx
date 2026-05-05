import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { upsertProfile } from '@/lib/actions'
import { ROLE_OPTIONS } from '@/types/database'

export default async function AdminpanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'gerente') {
    return (
      <div>
        <PageHeader title="Painel Administrativo" />
        <div className="p-6">
          <div className="alert alert-error">Acesso restrito ao gerente.</div>
        </div>
      </div>
    )
  }

  const { data: profiles } = await supabase
    .from('profiles').select('*').order('full_name')

  return (
    <div>
      <PageHeader title="Gestão de Usuários" subtitle="Apenas gerentes" />
      <div className="p-6">

        <div className="card mb-6">
          <div className="card-header"><span className="card-title">Editar Perfil de Usuário</span></div>
          <form action={upsertProfile} className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="form-label">Nome Completo</label>
                <input name="full_name" className="form-control" required />
              </div>
              <div>
                <label className="form-label">E-mail (para identificar o usuário)</label>
                <input name="email" type="email" className="form-control" required />
              </div>
              <div>
                <label className="form-label">Cargo</label>
                <select name="role" className="form-control">
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select name="is_active" className="form-control">
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
              <div>
                <label className="form-label">Telefone</label>
                <input name="phone" className="form-control" />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Salvar</button>
            <p className="form-hint" style={{ marginTop: '.5rem' }}>
              Para criar novos usuários, acesse o painel do Supabase → Authentication → Invite User.
              Aqui você edita perfis de usuários já existentes.
            </p>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Usuários Cadastrados ({profiles?.length ?? 0})</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr><th>Nome</th><th>E-mail</th><th>Cargo</th><th>Status</th></tr>
              </thead>
              <tbody>
                {profiles?.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.full_name || '(sem nome)'}</td>
                    <td style={{ fontSize: '.85rem' }}>{p.email}</td>
                    <td><span className="badge badge-blue">{p.role}</span></td>
                    <td>
                      <span className={`badge ${p.is_active ? 'badge-green' : 'badge-red'}`}>
                        {p.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
