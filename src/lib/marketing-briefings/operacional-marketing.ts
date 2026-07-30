import type { FormularioBriefingConfig } from './types'
import { perguntasComuns } from './types'

const PRIORIDADES_GERAIS = [
  'Estruturar o calendário editorial', 'Aumentar a capacidade de produção de vídeo',
  'Organizar o armazenamento e acesso a arquivos', 'Reduzir o prazo de aprovação',
  'Estruturar a operação de tráfego pago', 'Padronizar fornecedores externos',
]

export const operacionalMarketing: FormularioBriefingConfig = {
  id: 'operacional-marketing',
  titulo: 'Briefing para construção do planejamento de marketing',
  destinatario: 'Responsável Operacional por Marketing e Comunicação',
  descricaoDestinatario:
    'Este formulário se destina ao responsável operacional por marketing e comunicação. As perguntas tratam apenas ' +
    'de rotina, ferramentas, capacidade de produção e prazos — não é necessário responder sobre posicionamento ' +
    'institucional, produtos ou identidade pedagógica, isso já é coletado em outros formulários.',
  tempoEstimado: '10–15 min',
  perguntas: [
    ...perguntasComuns(PRIORIDADES_GERAIS),

    {
      id: 'canal_dia_a_dia', bloco: 'Ferramentas e rotina',
      texto: 'Qual o melhor canal para o dia a dia operacional do marketing?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['WhatsApp', 'Trello', 'E-mail', 'Calendário editorial compartilhado'],
    },
    {
      id: 'ferramenta_gestao', bloco: 'Ferramentas e rotina',
      texto: 'Qual ferramenta é usada para gerenciar tarefas e produção de conteúdo?',
      tipo: 'escolha_unica', obrigatoria: true, permiteOutro: true,
      opcoes: ['Trello', 'Notion', 'Planilha', 'Nenhuma ferramenta estruturada'],
    },
    {
      id: 'armazenamento_arquivos', bloco: 'Ferramentas e rotina',
      texto: 'Onde os arquivos e materiais de marketing são armazenados hoje?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Google Drive', 'Canva', 'Servidor/computador local', 'Não há local centralizado'],
    },
    {
      id: 'acesso_arquivos', bloco: 'Ferramentas e rotina',
      texto: 'Quem tem acesso a esses arquivos hoje?',
      tipo: 'texto_curto', obrigatoria: true,
    },

    {
      id: 'antecedencia_calendario', bloco: 'Produção e capacidade',
      texto: 'Com que antecedência o calendário editorial costuma estar pronto?',
      tipo: 'escolha_unica', obrigatoria: true,
      opcoes: ['Mês anterior inteiro', 'Quinze dias antes', 'Semana anterior', 'Não temos rotina definida'],
    },
    {
      id: 'capacidade_design', bloco: 'Produção e capacidade',
      texto: 'Qual a capacidade de produção de peças de design por mês?',
      tipo: 'estruturado', obrigatoria: true,
      campos: [{ id: 'pecas_mes', label: 'Peças de design por mês (aprox.)', tipo: 'numero' }],
      naoSeiLabel: 'Não medimos',
    },
    {
      id: 'frequencia_gravacao', bloco: 'Produção e capacidade',
      texto: 'Com que frequência é possível gravar conteúdo em vídeo?',
      tipo: 'escolha_unica', obrigatoria: true,
      opcoes: ['Quinzenalmente', 'Uma vez por mês, em bloco', 'Esporadicamente', 'Não temos rotina de gravação'],
    },
    {
      id: 'volume_publicacoes', bloco: 'Produção e capacidade',
      texto: 'Qual o volume médio de conteúdos publicados por mês (posts, vídeos e afins, somados)?',
      tipo: 'estruturado', obrigatoria: true,
      campos: [{ id: 'publicacoes_mes', label: 'Publicações por mês (aprox.)', tipo: 'numero' }],
      naoSeiLabel: 'Não medimos',
    },

    {
      id: 'prazo_aprovacao', bloco: 'Aprovação e mídia',
      texto: 'Qual o prazo máximo de aprovação que a operação consegue cumprir na prática?',
      tipo: 'escolha_unica', obrigatoria: true,
      opcoes: ['Mesmo dia', 'Até 24h', 'Até 3 dias', 'Até 5 dias', 'Não temos processo definido'],
    },
    {
      id: 'verba_trafego_execucao', bloco: 'Aprovação e mídia',
      texto: 'Existe verba de tráfego pago em execução hoje? Quanto por mês, aproximadamente?',
      tipo: 'estruturado', obrigatoria: true,
      campos: [{ id: 'valor_mensal', label: 'Valor mensal aproximado', tipo: 'moeda' }],
      naoSeiLabel: 'Não há verba em execução',
    },
    {
      id: 'fornecedores_externos', bloco: 'Aprovação e mídia',
      texto: 'Quais fornecedores ou agências externas apoiam a operação hoje (design, vídeo, tráfego)?',
      tipo: 'texto_curto',
    },
    {
      id: 'eventos_calendario_operacional', bloco: 'Aprovação e mídia',
      texto: 'Quais eventos já estão previstos no calendário operacional para os próximos 12 meses?',
      tipo: 'texto_longo',
    },
    {
      id: 'gargalos_operacionais', bloco: 'Aprovação e mídia',
      texto: 'Quais são os três maiores gargalos operacionais da produção de marketing hoje?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: ['Falta de tempo/equipe', 'Demora na aprovação', 'Falta de material bruto (fotos/vídeos)', 'Falta de verba', 'Falta de fornecedor confiável', 'Falta de rotina definida'],
    },
    {
      id: 'observacoes_finais', bloco: 'Aprovação e mídia',
      texto: 'Observações finais — algo importante que não foi perguntado?',
      tipo: 'texto_longo',
    },
  ],
}
