import type { FormularioBriefingConfig, Pergunta } from './types'
import { perguntasComuns, ESCALA_PRONTIDAO_AMPLIADA } from './types'

const PRIORIDADES_GERAIS = [
  'Explicar melhor a proposta pedagógica para famílias', 'Produzir conteúdo de bastidores de sala de aula',
  'Divulgar resultados e evidências de aprendizagem', 'Apoiar a formação de professores com conteúdo',
  'Responder dúvidas frequentes das famílias', 'Fortalecer depoimentos de escolas parceiras',
]

interface CoordenacaoParams {
  id: string
  destinatario: string
  segmentoLabel: string
  dificuldadesProfessores: string[]
  duvidasFamilias: string[]
  materiaisExistentes: string[]
  perguntaEspecifica: Pergunta
}

export function construirFormularioCoordenacao(p: CoordenacaoParams): FormularioBriefingConfig {
  return {
    id: p.id,
    titulo: 'Briefing para construção do planejamento de marketing',
    destinatario: p.destinatario,
    descricaoDestinatario:
      `Este formulário se destina à Coordenação Pedagógica de ${p.segmentoLabel}. As perguntas tratam da realidade ` +
      'de professores, famílias e materiais do seu segmento — não use "cliente" de forma genérica, responda sempre ' +
      'pensando em professores, famílias e escolas parceiras deste segmento específico.',
    tempoEstimado: '12–18 min',
    perguntas: [
      ...perguntasComuns(PRIORIDADES_GERAIS),

      {
        id: 'diferenciais_segmento', bloco: `Diferenciais — ${p.segmentoLabel}`,
        texto: `Quais são os três principais diferenciais da proposta do Cidade Viva Education para ${p.segmentoLabel}?`,
        tipo: 'ranking', obrigatoria: true, limite: 3,
        opcoes: ['Cosmovisão cristã aplicada ao dia a dia', 'Qualidade dos materiais didáticos', 'Formação e suporte ao professor', 'Acompanhamento pedagógico próximo', 'Participação estruturada da família', 'Resultados de aprendizagem'],
      },
      {
        id: 'prontidao_elementos', bloco: `Diferenciais — ${p.segmentoLabel}`,
        texto: 'Avalie a prontidão de cada elemento deste segmento hoje.',
        tipo: 'grade', obrigatoria: true,
        linhas: ['Materiais', 'Orientações pedagógicas', 'Formação de professores', 'Plataforma digital', 'Suporte à escola', 'Comunicação com famílias', 'Registros de resultados'],
        colunas: ESCALA_PRONTIDAO_AMPLIADA,
      },

      {
        id: 'dificuldades_professores', bloco: 'Professores e famílias',
        texto: 'Quais dificuldades os professores deste segmento mais apresentam?',
        tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true, opcoes: p.dificuldadesProfessores,
      },
      {
        id: 'duvidas_familias', bloco: 'Professores e famílias',
        texto: 'Quais dúvidas as famílias deste segmento mais apresentam?',
        tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true, opcoes: p.duvidasFamilias,
      },
      {
        id: 'conteudos_professores', bloco: 'Professores e famílias',
        texto: 'Quais conteúdos ajudariam mais os professores deste segmento? Ordene os três mais importantes.',
        tipo: 'ranking', obrigatoria: true, limite: 3,
        opcoes: ['Dicas práticas de aplicação em sala', 'Formação continuada gravada', 'Exemplos de planejamento de aula', 'Respostas às dúvidas mais comuns', 'Bastidores de outras turmas/escolas'],
      },
      {
        id: 'conteudos_familias', bloco: 'Professores e famílias',
        texto: 'Quais conteúdos ajudariam mais as famílias deste segmento? Ordene os três mais importantes.',
        tipo: 'ranking', obrigatoria: true, limite: 3,
        opcoes: ['O que a criança está aprendendo e por quê', 'Como apoiar em casa', 'Depoimentos de outras famílias', 'Explicação da proposta pedagógica', 'Resultados e evidências de aprendizagem'],
      },

      p.perguntaEspecifica,

      {
        id: 'evidencias_divulgaveis', bloco: 'Conteúdo e materiais',
        texto: 'Quais experiências, resultados ou evidências deste segmento podem ser divulgados publicamente?',
        tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
        opcoes: ['Fotos de atividades em sala', 'Trabalhos e produções dos alunos', 'Depoimentos de professores', 'Depoimentos de famílias', 'Dados de avaliação/progresso', 'Nenhum ainda — precisa de autorização'],
      },
      {
        id: 'conteudos_nao_divulgar', bloco: 'Conteúdo e materiais',
        texto: 'Quais conteúdos deste segmento ainda NÃO devem ser divulgados?',
        tipo: 'texto_curto',
      },
      {
        id: 'quem_participa_video', bloco: 'Conteúdo e materiais',
        texto: 'Quem pode participar de vídeos representando este segmento?',
        tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true,
        opcoes: ['Coordenação pedagógica', 'Professores', 'Alunos, com autorização', 'Pais de alunos'],
      },
      {
        id: 'materiais_existentes', bloco: 'Conteúdo e materiais',
        texto: 'Quais materiais deste segmento já existem prontos e podem ser aproveitados?',
        tipo: 'caixas_selecao', obrigatoria: true, permiteOutro: true, opcoes: p.materiaisExistentes,
      },
      {
        id: 'prioridades_conteudo_segmento', bloco: 'Conteúdo e materiais',
        texto: `Quais são as três prioridades de conteúdo para ${p.segmentoLabel} nos próximos 12 meses?`,
        tipo: 'ranking', obrigatoria: true, limite: 3,
        opcoes: ['Explicar a proposta pedagógica', 'Mostrar resultados de aprendizagem', 'Bastidores de sala de aula', 'Depoimentos de famílias e professores', 'Formação de professores', 'Dúvidas frequentes respondidas'],
      },
      {
        id: 'maior_risco_comunicacao', bloco: 'Conteúdo e materiais',
        texto: 'Qual é o maior risco de comunicação deste segmento hoje (algo que, se comunicado errado, gera problema)?',
        tipo: 'texto_curto',
      },
      {
        id: 'observacoes_finais', bloco: 'Conteúdo e materiais',
        texto: 'Observações finais — algo importante que não foi perguntado?',
        tipo: 'texto_longo',
      },
    ],
  }
}
