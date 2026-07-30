import type { FormularioBriefingConfig } from './types'
import { perguntasComuns, ESCALA_PRONTIDAO_AMPLIADA } from './types'

const PRIORIDADES_GERAIS = [
  'Aumentar geração de leads qualificados', 'Reduzir o ciclo de venda',
  'Fortalecer o reconhecimento de marca', 'Apoiar metas de crescimento por produto',
  'Estruturar o funil comercial e os indicadores', 'Apoiar lançamentos e expansão de frentes',
  'Melhorar a conversão em eventos e congressos',
]

const PRODUTOS = ['Paideia (escolas)', 'Bíblos (igrejas)', 'Oikos (famílias)', 'Consultoria de implantação', 'Pós-graduação', 'Inglês / Cambridge', 'Formação e eventos']

export const diretorAdministrativo: FormularioBriefingConfig = {
  id: 'diretor-administrativo',
  titulo: 'Briefing para construção do planejamento de marketing',
  destinatario: 'Direção Administrativa',
  descricaoDestinatario:
    'Este formulário se destina à Direção Administrativa. As perguntas tratam de portfólio, metas, ciclo comercial, ' +
    'orçamento, aprovação e riscos — dados que sustentam o plano de marketing e de mídia. Não é necessário detalhar ' +
    'metodologia pedagógica, autores ou posicionamento teológico.',
  tempoEstimado: '18–25 min',
  perguntas: [
    ...perguntasComuns(PRIORIDADES_GERAIS),

    // Bloco 1 — Portfólio e prioridades
    {
      id: 'produtos_disponiveis', bloco: 'Portfólio e prioridades',
      texto: 'Quais produtos estão efetivamente disponíveis para venda hoje?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true, opcoes: PRODUTOS,
    },
    {
      id: 'produtos_prioritarios', bloco: 'Portfólio e prioridades',
      texto: 'Quais são os três produtos prioritários para os próximos 12 meses?',
      tipo: 'ranking', obrigatoria: true, limite: 3, opcoes: PRODUTOS,
    },
    {
      id: 'prontidao_comercial', bloco: 'Portfólio e prioridades',
      texto: 'Qual é o estágio de prontidão comercial de cada produto?',
      tipo: 'grade', obrigatoria: true, linhas: PRODUTOS, colunas: ESCALA_PRONTIDAO_AMPLIADA,
    },

    // Bloco 2 — Mercado, metas e capacidade
    {
      id: 'clientes_ticket_meta', bloco: 'Mercado, metas e capacidade',
      texto: 'Informe, quando disponível, clientes ativos, ticket médio e meta de crescimento para o produto que você considera mais prioritário (o carro-chefe).',
      observacao: 'Valores em reais no padrão brasileiro (ex: R$ 1.000,00). Se não houver dado consolidado, deixe em branco e sinalize isso no campo de observações.',
      tipo: 'estruturado', obrigatoria: true,
      campos: [
        { id: 'produto_referencia', label: 'Produto de referência', tipo: 'texto' },
        { id: 'clientes_ativos', label: 'Clientes/escolas ativos hoje', tipo: 'numero' },
        { id: 'ticket_medio', label: 'Ticket médio', tipo: 'moeda' },
        { id: 'meta_crescimento', label: 'Meta de crescimento em 12 meses (nº de clientes)', tipo: 'numero' },
      ],
      naoSeiLabel: 'Não medimos / dado não consolidado',
    },
    {
      id: 'metas_marketing_apoiar', bloco: 'Mercado, metas e capacidade',
      texto: 'Quais metas o marketing deverá apoiar diretamente?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Novos clientes/escolas', 'Renovação de contratos', 'Ticket médio maior', 'Expansão geográfica', 'Lançamento de novas frentes', 'Presença em eventos e congressos'],
    },
    {
      id: 'ciclo_venda', bloco: 'Mercado, metas e capacidade',
      texto: 'Qual é o ciclo médio de venda (do primeiro contato até o fechamento) por frente?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Paideia', 'Bíblos', 'Oikos', 'Consultoria/Formação'],
      colunas: ['Até 30 dias', '1 a 3 meses', '3 a 6 meses', '6 a 12 meses', 'Não medimos'],
    },
    {
      id: 'origem_clientes', bloco: 'Mercado, metas e capacidade',
      texto: 'De onde vêm atualmente os clientes e oportunidades?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Indicação', 'Rede de relacionamento da igreja', 'Egressos da pós-graduação', 'Eventos e congressos', 'Instagram', 'Google / busca', 'Prospecção ativa do comercial', 'Não sabemos'],
    },
    {
      id: 'capacidade_demanda', bloco: 'Mercado, metas e capacidade',
      texto: 'Qual é a capacidade real da instituição para atender um aumento repentino de demanda?',
      tipo: 'escala', obrigatoria: true,
      escala: ['Nenhuma capacidade', 'Capacidade baixa', 'Capacidade moderada', 'Boa capacidade', 'Capacidade total'],
    },
    {
      id: 'gargalos_campanhas', bloco: 'Mercado, metas e capacidade',
      texto: 'Quais gargalos podem limitar o resultado de campanhas de marketing?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Capacidade de atendimento comercial', 'Capacidade de implantação pedagógica', 'Produção de material', 'Disponibilidade de equipe', 'Aprovação lenta de conteúdo', 'Orçamento de mídia'],
    },

    // Bloco 3 — Orçamento e operação
    {
      id: 'orcamento_marketing', bloco: 'Orçamento e operação',
      texto: 'Existe orçamento definido para marketing (mídia paga, produção, eventos)?',
      tipo: 'estruturado', obrigatoria: true,
      campos: [
        { id: 'existe', label: 'Existe orçamento? (sim / não / a definir)', tipo: 'texto' },
        { id: 'valor_mensal', label: 'Valor mensal aproximado, se houver', tipo: 'moeda' },
        { id: 'condicao_aumento', label: 'Em que condição o orçamento pode aumentar?', tipo: 'texto' },
      ],
      naoSeiLabel: 'Ainda não decidido',
    },
    {
      id: 'aprovacao_orcamento', bloco: 'Orçamento e operação',
      texto: 'Quem aprova orçamento, campanhas e contratações relacionadas a marketing?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Orçamento de mídia', 'Campanhas novas', 'Contratação de fornecedores/agência', 'Eventos e congressos'],
      colunas: ['Diretor Administrativo', 'Chanceler', 'Conselho/mantenedores', 'Ainda não definido'],
    },
    {
      id: 'eventos_calendario', bloco: 'Orçamento e operação',
      texto: 'Quais eventos e lançamentos já confirmados devem integrar obrigatoriamente o calendário anual?',
      tipo: 'texto_longo', obrigatoria: true,
    },

    // Bloco 4 — Aprovação, riscos e calendário
    {
      id: 'riscos_administrativos', bloco: 'Aprovação, riscos e calendário',
      texto: 'Quais são os três maiores riscos administrativos para o planejamento de marketing?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: ['Capacidade de atendimento insuficiente', 'Orçamento insuficiente', 'Dependência de poucas pessoas-chave', 'Falta de material pronto', 'Sazonalidade muito concentrada', 'Concorrência de preço'],
    },
    {
      id: 'indicadores_efetividade', bloco: 'Aprovação, riscos e calendário',
      texto: 'Qual resultado o marketing precisa gerar para ser considerado efetivo pela direção administrativa?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Número de leads gerados', 'Número de novos contratos', 'Redução do ciclo de venda', 'Custo por lead/aquisição', 'Reconhecimento de marca', 'Presença e engajamento em redes sociais'],
    },
    {
      id: 'observacoes_finais', bloco: 'Aprovação, riscos e calendário',
      texto: 'Observações finais — algo importante que não foi perguntado?',
      tipo: 'texto_longo',
    },
  ],
}
