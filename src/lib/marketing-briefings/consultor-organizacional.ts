import type { FormularioBriefingConfig } from './types'
import { perguntasComuns, ESCALA_MATURIDADE_AMPLIADA } from './types'

const PRIORIDADES_GERAIS = [
  'Estruturar CRM e funil comercial', 'Confiabilizar os dados de origem de leads',
  'Criar painel de indicadores de marketing', 'Integrar marketing e comercial',
  'Padronizar processos manuais', 'Medir retorno de campanhas e mídia paga',
]

export const consultorOrganizacional: FormularioBriefingConfig = {
  id: 'consultor-organizacional-dados',
  titulo: 'Briefing para construção do planejamento de marketing',
  destinatario: 'Consultoria Organizacional e de Dados',
  descricaoDestinatario:
    'Este formulário se destina ao Consultor Organizacional e de Dados. As perguntas tratam de processos, governança, ' +
    'sistemas, funil e indicadores — a base que permite ao marketing medir resultado e tomar decisão orientada por dado.',
  tempoEstimado: '15–20 min',
  perguntas: [
    ...perguntasComuns(PRIORIDADES_GERAIS),

    // Bloco 1 — Maturidade organizacional
    {
      id: 'maturidade_marketing', bloco: 'Maturidade organizacional',
      texto: 'Qual é o nível de maturidade atual das práticas de marketing na instituição?',
      tipo: 'escala', obrigatoria: true, escala: ESCALA_MATURIDADE_AMPLIADA,
    },
    {
      id: 'integracao_areas', bloco: 'Maturidade organizacional',
      texto: 'Qual é o nível de integração entre marketing e as demais áreas?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Marketing e comercial', 'Marketing e pedagógico', 'Marketing e administrativo', 'Marketing e dados', 'Marketing e atendimento'],
      colunas: ESCALA_MATURIDADE_AMPLIADA,
    },

    // Bloco 2 — Dados e sistemas
    {
      id: 'dados_disponiveis', bloco: 'Dados e sistemas',
      texto: 'Quais dados estão disponíveis hoje, em qualquer sistema ou planilha?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Cadastro de escolas/clientes', 'Histórico de negociações', 'Origem do lead', 'Ticket e faturamento por cliente', 'Funil comercial por etapa', 'Dados de tráfego/redes sociais', 'Pesquisas de satisfação'],
    },
    {
      id: 'onde_armazenados', bloco: 'Dados e sistemas',
      texto: 'Onde esses dados estão armazenados, e qual a confiabilidade de cada fonte?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Cadastro de escolas/clientes', 'Histórico de negociações', 'Origem do lead', 'Ticket e faturamento', 'Funil comercial'],
      colunas: ['Não existe', 'Planilha manual', 'Sistema/CRM confiável', 'Não sei informar'],
    },
    {
      id: 'existe_crm', bloco: 'Dados e sistemas',
      texto: 'Existe CRM ou sistema estruturado de acompanhamento comercial em uso?',
      tipo: 'escolha_unica', obrigatoria: true, permiteOutro: true,
      opcoes: ['Sim, usado consistentemente por todos', 'Sim, mas uso parcial/inconsistente', 'Não, apenas planilhas', 'Não existe nenhum controle estruturado'],
    },
    {
      id: 'etapas_funil_registradas', bloco: 'Dados e sistemas',
      texto: 'Quais etapas do funil comercial são efetivamente registradas em algum sistema?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Lead captado', 'Primeiro contato', 'Proposta enviada', 'Negociação', 'Contrato fechado', 'Pós-venda/renovação', 'Nenhuma etapa é registrada'],
    },
    {
      id: 'atribuicao_origem', bloco: 'Dados e sistemas',
      texto: 'Hoje é possível associar a origem de um lead (ex: Instagram, indicação) ao contrato fechado e à receita gerada?',
      tipo: 'escolha_unica', obrigatoria: true,
      opcoes: ['Sim, de forma confiável', 'Parcialmente, com esforço manual', 'Não é possível hoje', 'Não sei informar'],
    },

    // Bloco 3 — Funil e indicadores
    {
      id: 'indicadores_painel', bloco: 'Funil e indicadores',
      texto: 'Quais indicadores deveriam compor o painel mensal de marketing? Selecione até cinco.',
      tipo: 'ranking', obrigatoria: true, limite: 5,
      opcoes: ['Leads gerados', 'Custo por lead', 'Taxa de conversão do funil', 'Ciclo médio de venda', 'Origem dos leads', 'Ticket médio', 'Taxa de renovação', 'Alcance e engajamento em redes'],
    },
    {
      id: 'responsaveis_dados', bloco: 'Funil e indicadores',
      texto: 'Quem registra, valida e analisa cada dado hoje?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Cadastro de leads/clientes', 'Registro do funil comercial', 'Faturamento e ticket', 'Indicadores de marketing/mídia'],
      colunas: ['Comercial', 'Administrativo', 'Marketing', 'Consultoria de dados', 'Ninguém hoje'],
    },

    // Bloco 4 — Governança e melhorias
    {
      id: 'processos_manuais', bloco: 'Governança e melhorias',
      texto: 'Quais processos ainda são manuais ou fragmentados e prejudicam a visibilidade de marketing?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Cadastro de leads', 'Atualização do funil', 'Registro de origem de campanha', 'Relatórios de resultado', 'Aprovação de conteúdo', 'Comunicação entre comercial e marketing'],
    },
    {
      id: 'gargalos_processo', bloco: 'Governança e melhorias',
      texto: 'Quais são os três principais gargalos de processo que afetam o marketing hoje?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: ['Falta de CRM confiável', 'Dados espalhados em planilhas', 'Falta de padrão de registro', 'Demora na aprovação de conteúdo', 'Falta de retorno do comercial sobre leads', 'Falta de indicadores definidos'],
    },
    {
      id: 'melhorias_90_dias', bloco: 'Governança e melhorias',
      texto: 'Quais melhorias de dados/processo deveriam ser implantadas nos próximos 90 dias?',
      tipo: 'texto_longo', obrigatoria: true,
    },
    {
      id: 'dados_ausentes', bloco: 'Governança e melhorias',
      texto: 'Que dados ainda não existem, mas são necessários para o planejamento de marketing?',
      tipo: 'texto_curto',
    },
    {
      id: 'barreira_crescimento_estrutural', bloco: 'Governança e melhorias',
      texto: 'Do ponto de vista de processos e dados: qual é o principal fator estrutural que limita o crescimento comercial hoje, mesmo que o marketing funcione perfeitamente?',
      tipo: 'texto_longo', obrigatoria: true,
    },
    {
      id: 'metrica_prioritaria_conteudo_organico', bloco: 'Governança e melhorias',
      texto: 'Dado o que é hoje efetivamente mensurável, qual métrica de conteúdo orgânico (redes sociais/blog) deveria ser o principal indicador de sucesso?',
      tipo: 'escolha_unica', obrigatoria: true, permiteOutro: true,
      opcoes: ['Alcance/impressões', 'Engajamento (curtidas, comentários, compartilhamentos)', 'Leads gerados a partir do conteúdo', 'Crescimento de seguidores', 'Não temos como medir isso hoje'],
    },
    {
      id: 'observacoes_finais', bloco: 'Governança e melhorias',
      texto: 'Observações finais — algo importante que não foi perguntado?',
      tipo: 'texto_longo',
    },
  ],
}
