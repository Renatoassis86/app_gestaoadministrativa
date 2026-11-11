import Link from 'next/link'
import { notFound } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { createAdminClient } from '@/lib/supabase/admin'
import { exigirComercial } from '@/lib/eskolare-servidor'
import { CAMPOS } from '@/lib/eskolare-campos'
import { mascararCpf } from '@/lib/eskolare-validacao'
import { FichaInternaClient, type FichaInterna } from '@/components/eskolare/FichaInternaClient'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Ficha Eskolare' }

export default async function FichaEskolare({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const u = await exigirComercial()
  if (!u) return <div style={{ padding: '2rem' }}>Sem permissão para ver esta ficha.</div>
  const admin = createAdminClient()

  // Colunas explícitas: pin_hash e sessão nunca saem do servidor; o token só indica se há link.
  const { data: f } = await admin.from('eskolare_fichas')
    .select('id, escola_id, ciclo, status, responsavel_comercial, obs_comercial, pre, dados, situacao, fontes, pct_preenchido, token, link_revogado, bloqueado_ate, ultimo_acesso_em, enviada_em, respondida_em, validada_em, cadastrada_em')
    .eq('id', id).maybeSingle()
  if (!f) notFound()

  const [{ data: escola }, { data: eventos }] = await Promise.all([
    admin.from('escolas').select('nome').eq('id', f.escola_id).maybeSingle(),
    admin.from('eskolare_eventos').select('id, tipo, autor, detalhe, created_at').eq('ficha_id', id).order('created_at', { ascending: false }).limit(60),
  ])
  let logoUrl: string | null = null
  if (f.dados?.logo) logoUrl = (await admin.storage.from('eskolare-logos').createSignedUrl(f.dados.logo, 3600)).data?.signedUrl ?? null

  // CPF completo só para gerente: para os demais, o valor é mascarado aqui no servidor (não apenas escondido na tela).
  const camposCpf = CAMPOS.filter(c => c.tipo === 'cpf').map(c => c.chave)
  const mascarar = (o: Record<string, string>) => u.role === 'gerente' ? o : Object.fromEntries(Object.entries(o).map(([k, v]) => [k, camposCpf.includes(k) && v ? mascararCpf(v) : v]))

  const ficha: FichaInterna = {
    id: f.id, escolaNome: escola?.nome ?? '—', ciclo: f.ciclo, status: f.status, responsavel: f.responsavel_comercial, obs: f.obs_comercial ?? '',
    pre: mascarar(f.pre ?? {}), dados: mascarar(f.dados ?? {}), situacao: f.situacao ?? {}, fontes: f.fontes ?? {}, pct: f.pct_preenchido,
    temAcesso: !!f.token, revogado: f.link_revogado, bloqueadoAte: f.bloqueado_ate, ultimoAcesso: f.ultimo_acesso_em,
    enviadaEm: f.enviada_em, respondidaEm: f.respondida_em, validadaEm: f.validada_em, cadastradaEm: f.cadastrada_em,
    logoUrl, ehGerente: u.role === 'gerente', eventos: eventos ?? [],
  }

  return (
    <>
      <PageHeader title="Ficha Eskolare" subtitle={ficha.escolaNome} />
      <div style={{ padding: '1.25rem 1.75rem 3rem' }}>
        <Link href="/comercial/cadastro-eskolare" style={{ fontSize: '.8rem', color: '#0ea5e9', fontWeight: 700, display: 'inline-block', marginBottom: '.8rem' }}>← Voltar para a lista</Link>
        <FichaInternaClient key={JSON.stringify(ficha.dados) + ficha.status} f={ficha} />
      </div>
    </>
  )
}
