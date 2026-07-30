import type { FormularioBriefingConfig } from './types'
import { perguntasComuns, ESCALA_CLAREZA_AMPLIADA, ESCALA_PRONTIDAO_AMPLIADA } from './types'

const PRIORIDADES_GERAIS = [
  'Fortalecer o reconhecimento da marca Cidade Viva Education',
  'Gerar mais leads qualificados para o comercial',
  'Produzir mais conteúdo pedagógico (bastidores, resultados, depoimentos)',
  'Esclarecer melhor a proposta para famílias e igrejas',
  'Apoiar o lançamento de novas frentes (Inglês, Bíblos, Oikos)',
  'Fortalecer a comunidade de escolas parceiras',
  'Produzir material de formação de professores',
]

export const diretorPedagogico: FormularioBriefingConfig = {
  id: 'diretor-pedagogico',
  titulo: 'Briefing para construção do planejamento de marketing',
  destinatario: 'Direção Pedagógica',
  descricaoDestinatario:
    'Este formulário se destina à Direção Pedagógica. As perguntas abaixo tratam de identidade educacional, ' +
    'princípios pedagógicos, autores, limites teológicos e governança de conteúdo — temas sobre os quais você ' +
    'tem a autoridade e o conhecimento para decidir. Não há perguntas sobre ticket, verba ou metas comerciais.',
  tempoEstimado: '15–20 min',
  perguntas: [
    ...perguntasComuns(PRIORIDADES_GERAIS),

    // Bloco 1 — Identidade e posicionamento pedagógico
    {
      id: 'definicao_proposta', bloco: 'Identidade e posicionamento pedagógico',
      texto: 'Qual definição representa melhor a proposta educacional do Cidade Viva Education hoje?',
      objetivo: 'Verificar se existe uma definição institucional única e compartilhada.',
      tipo: 'escolha_unica', obrigatoria: true, permiteOutro: true,
      opcoes: [
        'Um currículo de materiais didáticos para escolas cristãs',
        'Um sistema de ensino cristão clássico que integra currículo, formação de professores e acompanhamento pedagógico',
        'Um ecossistema educacional cristão que conecta escola, família e igreja',
        'Uma consultoria de implantação pedagógica para instituições cristãs',
        'Ainda não temos uma definição institucional consolidada',
      ],
    },
    {
      id: 'clareza_principios', bloco: 'Identidade e posicionamento pedagógico',
      texto: 'Qual é o nível de clareza institucional sobre os princípios pedagógicos que sustentam a proposta?',
      objetivo: 'Avaliar o grau de consolidação da proposta na percepção da Direção Pedagógica.',
      tipo: 'escala', obrigatoria: true, escala: ESCALA_CLAREZA_AMPLIADA,
    },
    {
      id: 'principios_comunicacao', bloco: 'Identidade e posicionamento pedagógico',
      texto: 'Selecione até cinco princípios que devem aparecer constantemente na comunicação institucional.',
      tipo: 'caixas_selecao', obrigatoria: true, limite: 5, permiteOutro: true,
      opcoes: [
        'Excelência acadêmica', 'Formação do caráter', 'Desenvolvimento das virtudes',
        'Cosmovisão cristã', 'Educação Clássica e o Trivium', 'Parceria entre escola, família e igreja',
        'Beleza, arte e contemplação', 'Grandes livros e leituras', 'Alfabetização robusta',
        'Formação continuada de professores', 'Comunidade e pertencimento',
      ],
    },

    // Bloco 2 — Produtos e comunicação pedagógica
    {
      id: 'prontidao_frentes', bloco: 'Produtos e comunicação pedagógica',
      texto: 'Avalie o nível de prontidão pedagógica de cada frente para ser divulgada.',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Paideia', 'Oikos', 'Bíblos', 'Formação de professores', 'Inglês / Cambridge', 'Plataforma digital', 'Consultoria de implantação'],
      colunas: ESCALA_PRONTIDAO_AMPLIADA,
    },
    {
      id: 'diferenciais_pedagogicos', bloco: 'Produtos e comunicação pedagógica',
      texto: 'Quais são os três diferenciais pedagógicos mais importantes do Cidade Viva Education?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: [
        'Cosmovisão cristã integrada ao currículo', 'Formação continuada de professores',
        'Acompanhamento pedagógico próximo', 'Método clássico com Trivium',
        'Parceria estruturada com a família', 'Material desenvolvido internamente',
        'Comunidade de escolas parceiras', 'Base em grandes autores e obras clássicas',
      ],
    },
    {
      id: 'promessas_proibidas', bloco: 'Produtos e comunicação pedagógica',
      texto: 'Que promessas pedagógicas o marketing NÃO deve fazer sobre os produtos?',
      tipo: 'texto_curto', obrigatoria: true,
    },

    // Bloco 3 — Limites, autores e temas
    {
      id: 'identidade_publica', bloco: 'Limites, autores e temas',
      texto: 'Existe uma decisão institucional sobre a identidade pública cristã, clássica, confessional ou reformada?',
      tipo: 'escolha_unica', obrigatoria: true,
      opcoes: ['Sim, explicitamente', 'Cristãos clássicos, sem rótulo denominacional', 'Depende do canal', 'Precisa conversar', 'Ainda não decidido'],
    },
    {
      id: 'autores_livres', bloco: 'Limites, autores e temas',
      texto: 'Quais autores podem ser citados livremente em conteúdo, como referência de autoridade?',
      objetivo: 'Se algum autor exigir cuidado especial ou for proibido, informe no campo "Outro" com o motivo.',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Douglas Wilson', 'Dorothy Sayers', 'C. S. Lewis', 'Christopher Perrin', 'David Hicks', 'Susan Wise Bauer', 'Charlotte Mason', 'Werner Jaeger', 'Agostinho', 'Comenius', 'Josef Pieper'],
    },
    {
      id: 'temas_revisao', bloco: 'Limites, autores e temas',
      texto: 'Quais temas exigem revisão obrigatória da Direção Pedagógica antes de qualquer publicação?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Ideologia de gênero', 'Situação jurídica do homeschooling', 'Política partidária', 'Crítica nominal a outras escolas cristãs', 'Uso do termo "reformado"', 'Ensino de latim e grego', 'Bibliografia e autores'],
    },
    {
      id: 'bibliografia_formativa', bloco: 'Limites, autores e temas',
      texto: 'Existe uma bibliografia oficial que a casa considera formativa — o que um professor precisa ter lido?',
      observacao: 'Se existir, isso pode virar um conteúdo imediato ("os livros que todo educador cristão clássico deveria ler").',
      tipo: 'texto_longo',
    },

    // Bloco 4 — Governança pedagógica
    {
      id: 'aprovacao_conteudo', bloco: 'Governança pedagógica',
      texto: 'Quem tem autoridade de aprovação final para cada tipo de conteúdo?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Posts de redes sociais', 'Materiais comerciais/institucionais', 'Conteúdo sobre identidade cristã/teologia', 'Conteúdo sobre autores e bibliografia', 'Vídeos institucionais'],
      colunas: ['Chanceler', 'Pastor / liderança', 'Coordenação pedagógica', 'Diretor administrativo', 'Ainda não definido'],
    },
    {
      id: 'porta_vozes_pedagogicos', bloco: 'Governança pedagógica',
      texto: 'Quem pode representar pedagogicamente a instituição em vídeos e eventos?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Chanceler', 'Pastor / liderança', 'Coordenação pedagógica', 'Autores do material', 'Professores', 'Alunos, com autorização', 'Pais de alunos'],
    },
    {
      id: 'prioridades_comunicacao_pedagogica', bloco: 'Governança pedagógica',
      texto: 'Quais são as três prioridades de comunicação pedagógica para os próximos 12 meses?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: ['O que é educação clássica e o Trivium', 'Cosmovisão cristã aplicada às matérias', 'Depoimentos de escolas parceiras', 'Formação de professores', 'Bastidores de sala de aula', 'Grandes livros e leituras', 'Devocional', 'Crítica à educação moderna'],
    },
    {
      id: 'observacoes_finais', bloco: 'Governança pedagógica',
      texto: 'Observações finais — algo importante que não foi perguntado?',
      tipo: 'texto_longo',
    },
  ],
}
