// Arquitetura do módulo Contratos (mesma estrutura do módulo de contratos da We Make).
export interface PaginaContratos {
  nome: string
  descricao: string
  href: string
  status: 'disponível' | 'em estruturação'
  secao: string
}

export const MODULO_CONTRATOS = {
  nome: 'Gestão de Contratos',
  deck: 'Os contratos assinados e em vigência de cada escola, num só lugar.',
  descricao: 'Acompanha a documentação contratual de cada escola: contratos assinados, termos aditivos, arquivos, vigência e valores.',
  paginas: [
    { nome: 'Visão geral', descricao: 'Indicadores: receita contratada, modelo de contratação, renovações e pendências.', href: '/contratos/visao-geral', secao: 'Geral', status: 'disponível' },
    { nome: 'Escolas e contratos Paideia', descricao: 'Cartão de cada escola com os dados do contrato e o documento original.', href: '/contratos/escolas', secao: 'Contratos Paideia', status: 'disponível' },
    { nome: 'Novo contrato Paideia', descricao: 'Cadastro dos dados de um novo contrato.', href: '/contratos/novo', secao: 'Contratos Paideia', status: 'disponível' },
    { nome: 'Repositório Paideia', descricao: 'Contratos assinados e termos aditivos de cada escola.', href: '/contratos/repositorio', secao: 'Contratos Paideia', status: 'disponível' },
    { nome: 'Reajustes 2027 (Paideia)', descricao: 'Tabela de reajustes e novas adesões por escola (Raissa e Isa).', href: '/contratos/reajustes', secao: 'Contratos Paideia', status: 'disponível' },
    { nome: 'Painel do Bilinguismo', descricao: 'Indicadores dos contratos do Bilinguismo.', href: '/contratos/bilinguismo/painel', status: 'disponível', secao: 'Contratos Bilinguismo' },
    { nome: 'Escolas do Bilinguismo', descricao: 'Cartão de cada escola do Bilinguismo, com upload dos contratos.', href: '/contratos/bilinguismo/escolas', status: 'disponível', secao: 'Contratos Bilinguismo' },
  ] as PaginaContratos[],
}
