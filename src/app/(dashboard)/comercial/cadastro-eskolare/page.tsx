import PageHeader from '@/components/layout/PageHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirComercial } from '@/lib/eskolare-servidor'
import { ListaFichasClient, type LinhaFicha } from '@/components/eskolare/ListaFichasClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Cadastro Eskolare 2027' }

export default async function CadastroEskolareLista() {
  const u = await exigirComercial()
  if (!u) return <div style={{ padding: '2rem' }}>Sem permissão para ver esta seção.</div>
  const admin = createAdminClient()

  // Nunca seleciona pin_hash, token nem sessão.
  const [{ data: fichas, error }, { data: escolas }] = await Promise.all([
    admin.from('eskolare_fichas').select('id, escola_id, status, responsavel_comercial, pct_preenchido, ultima_resposta_por, updated_at').order('updated_at', { ascending: false }),
    admin.from('escolas').select('id, nome, cnpj').order('nome'),
  ])
  const porId = new Map((escolas ?? []).map(e => [e.id, e]))
  const linhas: LinhaFicha[] = (fichas ?? []).map(f => ({
    id: f.id, escola: porId.get(f.escola_id)?.nome ?? '—', cnpj: porId.get(f.escola_id)?.cnpj ?? '',
    responsavel: f.responsavel_comercial, status: f.status, pct: f.pct_preenchido, ultimaPor: f.ultima_resposta_por, atualizado: f.updated_at,
  }))

  return (
    <>
      <PageHeader title="Cadastro Eskolare 2027" subtitle="Dados das escolas para montar as lojas na Eskolare" />
      <div style={{ padding: '1.25rem 1.75rem 3rem' }}>
        {error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1rem', color: '#991b1b', fontSize: '.88rem' }}>
            Não foi possível carregar as fichas: {error.message}<br />
            <span style={{ fontSize: '.8rem' }}>Se este é o primeiro acesso, rode o SQL <code>add_cadastro_eskolare.sql</code> no Supabase.</span>
          </div>
        ) : <ListaFichasClient linhas={linhas} escolas={(escolas ?? []).map(e => ({ id: e.id, nome: e.nome, cnpj: e.cnpj }))} />}
      </div>
    </>
  )
}
