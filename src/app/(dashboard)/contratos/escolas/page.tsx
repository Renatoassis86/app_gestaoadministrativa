import { carregarContratos } from '@/lib/contratos-data'
import { ContratoCardsClient, type CardData } from '@/components/contratos/ContratoCardsClient'
import { pendencias, totalKits, totalValor, type Modalidade } from '@/lib/contratos'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Escolas · Contratos Education' }

export default async function EscolasContratos() {
  const { itens, erro } = await carregarContratos()
  if (erro) return <p style={{ color: '#991b1b' }}>Erro ao carregar: {erro}</p>

  const dados: CardData[] = itens.map(({ c, escola, series, aditivos, arquivos }) => {
    const ano = c.ano_letivo_inicial as number | null
    const calc = totalValor(series, ano)
    const pagamento = c.modalidade === 'boleto'
      ? (c.num_parcelas ? `Boleto · ${c.num_parcelas}x de ${c.valor_parcela ? c.valor_parcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}` : 'Boleto')
      : `Loja virtual · até ${c.parcelas_max_cartao ?? 10}x${c.repasse_tipo ? ` · repasse ${c.repasse_tipo}` : ''}`
    return {
      escolaId: escola.id, nome: escola.nome, razao: escola.razao_social, cnpj: escola.cnpj,
      cidadeUf: [escola.cidade?.trim(), escola.estado].filter(Boolean).join('/'),
      modalidade: c.modalidade as Modalidade, status: c.status ?? 'rascunho',
      kits: totalKits(series, ano), valor: c.valor_total ?? calc,
      vigenciaInicio: c.vigencia_inicio, vigenciaFim: c.vigencia_fim,
      legal: { nome: c.legal_nome, cpf: c.legal_cpf, rg: c.legal_rg, email: c.legal_email, tel: c.legal_telefone },
      financeiro: { nome: c.financeiro_nome, email: c.financeiro_email, tel: c.financeiro_telefone },
      pagamento,
      series: series.map(s => ({ serie: s.serie, tipo_kit: s.tipo_kit, quantidade: s.quantidade, valor_unitario: s.valor_unitario })),
      aditivos: aditivos.map(a => ({ id: a.id, titulo: a.titulo, assinado: a.assinado, data_assinatura: a.data_assinatura })),
      arquivos, driveUrl: c.drive_contrato_url, pendencias: pendencias(c),
    }
  })
  return <ContratoCardsClient dados={dados} />
}
