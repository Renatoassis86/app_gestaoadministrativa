// Arquitetura do módulo Contratos (mesma estrutura do módulo de contratos da We Make).
export interface PaginaContratos {
  nome: string
  descricao: string
  href: string
  status: 'disponível' | 'em estruturação'
}

export const MODULO_CONTRATOS = {
  nome: 'Gestão de Contratos',
  deck: 'Da minuta à assinatura, todos os contratos num só lugar.',
  descricao: 'Acompanha a documentação contratual de cada escola: minutas, assinaturas, arquivos e prazos.',
  paginas: [
    { nome: 'Visão geral', descricao: 'Indicadores: receita contratada, modelo de contratação, renovações e pendências.', href: '/contratos/visao-geral', status: 'disponível' },
    { nome: 'Dados dos contratos', descricao: 'Cartão de cada escola com os dados do contrato e o documento original.', href: '/contratos/escolas', status: 'disponível' },
    { nome: 'Novo contrato', descricao: 'Cadastro dos dados de um novo contrato.', href: '/contratos/novo', status: 'disponível' },
    { nome: 'Repositório', descricao: 'Contratos assinados, minutas, aditivos e fichas de cada escola.', href: '/contratos/repositorio', status: 'disponível' },
    { nome: 'Reajustes 2027', descricao: 'Tabela de reajustes e novas adesões por escola (Raissa e Isa).', href: '/contratos/reajustes', status: 'disponível' },
    { nome: 'Modelos e minutas', descricao: 'Modelos de contrato reutilizáveis.', href: '/contratos/modelos', status: 'em estruturação' },
    { nome: 'Assinatura eletrônica', descricao: 'Envio e acompanhamento de assinaturas.', href: '/contratos/assinatura', status: 'em estruturação' },
    { nome: 'Certidões e documentos', descricao: 'Certidões e documentos jurídicos da empresa e das escolas.', href: '/contratos/certidoes', status: 'em estruturação' },
  ] as PaginaContratos[],
}
