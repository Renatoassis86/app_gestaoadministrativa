import { createClient } from '@/lib/supabase/server'
import { carregarContratos } from '@/lib/contratos-data'
import { RepositorioClient, type EscolaRepo } from '@/components/contratos/RepositorioClient'
import type { Modalidade } from '@/lib/contratos'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Repositório · Contratos Education' }

export default async function Repositorio() {
  const { itens, erro } = await carregarContratos()
  if (erro) return <p style={{ color: '#991b1b' }}>Erro ao carregar: {erro}</p>

  const supabase = await createClient()
  const { data: arqs } = await supabase.from('contratos_arquivos')
    .select('id, escola_id, nome, path, tamanho, categoria, created_at')
    .in('escola_id', itens.map(i => i.escola.id)).order('created_at', { ascending: false })

  const escolas: EscolaRepo[] = itens.map(i => ({
    id: i.escola.id, nome: i.escola.nome, cnpj: i.escola.cnpj, modalidade: i.c.modalidade as Modalidade,
    arquivos: (arqs ?? []).filter(a => a.escola_id === i.escola.id).map(a => ({
      id: a.id, nome: a.nome, path: a.path, tamanho: a.tamanho, categoria: a.categoria ?? 'contrato', created_at: a.created_at,
    })),
  }))

  return (
    <>
      <p style={{ fontSize: '.85rem', color: '#64748b', marginBottom: '1rem', maxWidth: 760 }}>
        Anexe aqui o contrato assinado, minutas, aditivos e fichas de cada escola. Os arquivos ficam em armazenamento privado e abrem por link temporário.
      </p>
      {escolas.length === 0
        ? <p style={{ color: '#64748b' }}>Nenhum contrato cadastrado ainda.</p>
        : <RepositorioClient escolas={escolas} />}
    </>
  )
}
