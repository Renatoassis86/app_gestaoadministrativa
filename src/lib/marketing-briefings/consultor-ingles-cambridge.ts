import type { FormularioBriefingConfig } from './types'
import { perguntasComuns, ESCALA_PRONTIDAO_AMPLIADA } from './types'

const PRIORIDADES_GERAIS = [
  'Definir e validar o escopo da parceria', 'Lançar a solução de Inglês para escolas parceiras',
  'Produzir material comercial e institucional', 'Esclarecer o que pode e não pode ser afirmado sobre Cambridge',
  'Integrar a comunicação com o Paideia', 'Capacitar o comercial para vender a nova frente',
]

export const consultorInglesCambridge: FormularioBriefingConfig = {
  id: 'consultor-ingles-cambridge',
  titulo: 'Briefing para construção do planejamento de marketing',
  destinatario: 'Consultoria de Inglês e Parcerias Cambridge',
  descricaoDestinatario:
    'Este formulário se destina ao Consultor de Inglês e parcerias Cambridge. O objetivo é levantar o que já está ' +
    'definido, o que ainda está em negociação e o que precisa ser validado sobre essa frente — não invente ' +
    'informações sobre a parceria; onde não houver decisão fechada, escreva "ainda não decidido" ou "precisa ser validado".',
  tempoEstimado: '18–25 min',
  perguntas: [
    ...perguntasComuns(PRIORIDADES_GERAIS),

    // Bloco 1 — Escopo e proposta
    {
      id: 'escopo_parceria', bloco: 'Escopo e proposta',
      texto: 'Qual é o escopo efetivo da parceria com Cambridge hoje?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Materiais didáticos', 'Metodologia de ensino', 'Formação de professores', 'Certificação/exames', 'Plataforma digital', 'Consultoria de implantação', 'Ainda em negociação'],
    },
    {
      id: 'segmentos_oferta', bloco: 'Escopo e proposta',
      texto: 'Em quais segmentos a solução de Inglês será oferecida?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II', 'Ainda não definido'],
    },
    {
      id: 'prontidao_por_segmento', bloco: 'Escopo e proposta',
      texto: 'Qual é o estágio de prontidão da solução em cada segmento?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Educação Infantil', 'Ensino Fundamental I', 'Ensino Fundamental II'],
      colunas: ESCALA_PRONTIDAO_AMPLIADA,
    },
    {
      id: 'relacao_com_paideia', bloco: 'Escopo e proposta',
      texto: 'Como a solução de Inglês se relaciona com o Paideia?',
      tipo: 'escolha_unica', obrigatoria: true, permiteOutro: true,
      opcoes: ['É um módulo integrado ao Paideia', 'É um produto complementar e independente', 'É vendida apenas junto com o Paideia', 'Ainda não decidido'],
    },

    // Bloco 2 — Público e diferenciais
    {
      id: 'diferenciais_ingles', bloco: 'Público e diferenciais',
      texto: 'Quais são os três principais diferenciais da solução de Inglês/Cambridge?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: ['Metodologia reconhecida internacionalmente', 'Certificação Cambridge', 'Integração com a cosmovisão cristã', 'Formação de professores incluída', 'Suporte de implantação', 'Preço competitivo'],
    },
    {
      id: 'problemas_resolvidos', bloco: 'Público e diferenciais',
      texto: 'Que problemas das escolas essa solução resolve?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Falta de método estruturado de Inglês', 'Falta de certificação reconhecida', 'Falta de professores capacitados', 'Falta de material didático de qualidade', 'Concorrência com escolas bilíngues'],
    },
    {
      id: 'decisao_ingles', bloco: 'Público e diferenciais',
      texto: 'Quem influencia, decide, aprova e contrata a solução de Inglês nas escolas?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Influencia', 'Decide', 'Aprova', 'Contrata'],
      colunas: ['Mantenedor', 'Diretor', 'Coordenador pedagógico', 'Pastor/liderança', 'Varia muito'],
    },
    {
      id: 'objecoes_ingles', bloco: 'Público e diferenciais',
      texto: 'Quais objeções devem aparecer com mais frequência na venda dessa solução?',
      tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
      opcoes: ['Preço', 'Já têm outro programa de Inglês', 'Dúvida sobre a qualidade da certificação', 'Necessidade de professores especializados', 'Tempo de implantação'],
    },

    // Bloco 3 — Comunicação e uso da marca
    {
      id: 'afirmacoes_permitidas_cambridge', bloco: 'Comunicação e uso da marca',
      texto: 'O que pode ser afirmado publicamente sobre a parceria com a Cambridge hoje?',
      tipo: 'texto_longo', obrigatoria: true,
    },
    {
      id: 'afirmacoes_proibidas_cambridge', bloco: 'Comunicação e uso da marca',
      texto: 'O que NÃO pode ser afirmado sobre a parceria com a Cambridge?',
      tipo: 'texto_curto', obrigatoria: true,
    },
    {
      id: 'manual_marca_cambridge', bloco: 'Comunicação e uso da marca',
      texto: 'Existe manual de marca e diretrizes de comunicação da Cambridge que precisamos seguir?',
      tipo: 'escolha_unica', obrigatoria: true,
      opcoes: ['Sim, e já está com o marketing', 'Sim, mas ainda não repassado ao marketing', 'Não existe', 'Não sei informar'],
    },

    // Bloco 4 — Prontidão e materiais necessários
    {
      id: 'pecas_necessarias', bloco: 'Prontidão e materiais necessários',
      texto: 'Quais peças de comunicação precisam ser produzidas primeiro para o lançamento ou expansão?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: ['Apresentação comercial', 'Página/landing page', 'Material para redes sociais', 'Vídeo institucional', 'Material impresso para eventos', 'FAQ de objeções'],
    },
    {
      id: 'aprovacao_conteudo_ingles', bloco: 'Prontidão e materiais necessários',
      texto: 'Quem revisa e aprova conteúdos técnicos e comerciais sobre essa frente?',
      tipo: 'grade', obrigatoria: true,
      linhas: ['Conteúdo técnico/metodológico', 'Conteúdo comercial', 'Uso da marca Cambridge'],
      colunas: ['Consultor de Inglês', 'Direção Pedagógica', 'Direção Administrativa', 'Ainda não definido'],
    },
    {
      id: 'informacoes_nao_definidas', bloco: 'Prontidão e materiais necessários',
      texto: 'Quais informações sobre essa parceria ainda não foram definidas e precisam de decisão institucional?',
      tipo: 'texto_longo',
    },
    {
      id: 'prioridades_lancamento', bloco: 'Prontidão e materiais necessários',
      texto: 'Quais são as três prioridades de marketing para o lançamento ou expansão dessa frente?',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: ['Validar o que pode ser comunicado', 'Produzir material comercial', 'Capacitar o time comercial', 'Divulgar para a base de escolas parceiras', 'Criar campanha de lançamento'],
    },
    {
      id: 'observacoes_finais', bloco: 'Prontidão e materiais necessários',
      texto: 'Observações finais — algo importante que não foi perguntado?',
      tipo: 'texto_longo',
    },
  ],
}
