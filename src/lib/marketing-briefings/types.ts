// Motor de formulários dos Briefings Estratégicos de Marketing — Cidade Viva Education
// Cada formulário é customizado por cargo/área (ver src/lib/marketing-briefings/*.ts).
// A resposta de cada pergunta é guardada em transcricoes... não, em
// marketing_briefing_respostas.respostas (jsonb), indexada pelo id da pergunta.

export type PerguntaTipo =
  | 'texto_curto'
  | 'texto_longo'
  | 'escolha_unica'
  | 'caixas_selecao'
  | 'escala'
  | 'grade'
  | 'ranking'
  | 'estruturado'

interface PerguntaBase {
  id: string
  bloco: string
  texto: string
  objetivo?: string
  observacao?: string
  obrigatoria?: boolean
}

export interface PerguntaTextoCurto extends PerguntaBase { tipo: 'texto_curto' }
export interface PerguntaTextoLongo extends PerguntaBase { tipo: 'texto_longo' }

export interface PerguntaEscolhaUnica extends PerguntaBase {
  tipo: 'escolha_unica'
  opcoes: string[]
  permiteOutro?: boolean
}

export interface PerguntaCaixasSelecao extends PerguntaBase {
  tipo: 'caixas_selecao'
  opcoes: string[]
  permiteOutro?: boolean
  limite?: number   // ex: "selecione até 3"
}

export interface PerguntaEscala extends PerguntaBase {
  tipo: 'escala'
  escala: string[]
}

export interface PerguntaGrade extends PerguntaBase {
  tipo: 'grade'
  linhas: string[]
  colunas: string[]
}

export interface PerguntaRanking extends PerguntaBase {
  tipo: 'ranking'
  opcoes: string[]
  limite: number   // quantos itens ordenar, ex: top 3
}

export interface CampoEstruturado {
  id: string
  label: string
  tipo: 'moeda' | 'numero' | 'texto'
}

export interface PerguntaEstruturado extends PerguntaBase {
  tipo: 'estruturado'
  campos: CampoEstruturado[]
  naoSeiLabel?: string   // ex: "Não medimos / dado não consolidado"
}

export type Pergunta =
  | PerguntaTextoCurto
  | PerguntaTextoLongo
  | PerguntaEscolhaUnica
  | PerguntaCaixasSelecao
  | PerguntaEscala
  | PerguntaGrade
  | PerguntaRanking
  | PerguntaEstruturado

export interface FormularioBriefingConfig {
  id: string          // slug, ex: 'diretor-pedagogico'
  titulo: string
  destinatario: string       // "Direção Pedagógica"
  descricaoDestinatario: string  // texto explicando pra quem é e por quê
  tempoEstimado: string       // "12–18 min"
  perguntas: Pergunta[]
}

// ── Escalas padronizadas (seção 8 do prompt mestre) ────────────────────────
export const ESCALA_PRIORIDADE = [
  'Sem prioridade', 'Baixa prioridade', 'Prioridade moderada', 'Alta prioridade', 'Prioridade máxima',
]
export const ESCALA_MATURIDADE = [
  'Inexistente', 'Inicial', 'Parcialmente estruturado', 'Estruturado', 'Consolidado',
]
export const ESCALA_CLAREZA = [
  'Nada clara', 'Pouco clara', 'Parcialmente clara', 'Clara', 'Muito clara',
]
export const ESCALA_PRONTIDAO = [
  'Não iniciado', 'Em desenvolvimento inicial', 'Parcialmente pronto', 'Pronto para implantação ou divulgação', 'Consolidado e em operação',
]
export const ESCALA_DIFICULDADE = [
  'Nenhuma dificuldade', 'Baixa dificuldade', 'Dificuldade moderada', 'Alta dificuldade', 'Dificuldade crítica',
]
export const ESCALA_FREQUENCIA = [
  'Nunca', 'Raramente', 'Algumas vezes', 'Frequentemente', 'Muito frequentemente',
]

export const NAO_SEI_RESPONDER = 'Não sei responder'
export const NAO_SE_APLICA = 'Não se aplica à minha área'

function comScalaAmpliada(escala: string[]) {
  return [...escala, NAO_SEI_RESPONDER, NAO_SE_APLICA]
}
export const ESCALA_PRIORIDADE_AMPLIADA  = comScalaAmpliada(ESCALA_PRIORIDADE)
export const ESCALA_MATURIDADE_AMPLIADA  = comScalaAmpliada(ESCALA_MATURIDADE)
export const ESCALA_CLAREZA_AMPLIADA     = comScalaAmpliada(ESCALA_CLAREZA)
export const ESCALA_PRONTIDAO_AMPLIADA   = comScalaAmpliada(ESCALA_PRONTIDAO)

// ── Bloco comum a todos os formulários (seção 7 do prompt mestre) ─────────
export const AREAS_PARTICIPACAO = [
  'Estratégia institucional', 'Pedagógico', 'Currículo', 'Materiais', 'Formação',
  'Comercial', 'Marketing', 'Administrativo', 'Financeiro', 'Eventos',
  'Parcerias', 'Dados', 'Atendimento', 'Relacionamento com escolas',
  'Relacionamento com famílias', 'Relacionamento com igrejas',
]
export const NIVEL_PARTICIPACAO = [
  'Decide', 'Recomenda', 'É consultado', 'Executa', 'Apenas acompanha', 'Não participa',
]

export function perguntasComuns(prioridadesOpcoes: string[]): Pergunta[] {
  return [
    { id: 'nome', bloco: 'Identificação', texto: 'Nome', tipo: 'texto_curto', obrigatoria: true },
    { id: 'funcao', bloco: 'Identificação', texto: 'Função', tipo: 'texto_curto', obrigatoria: true },
    {
      id: 'tempo_atuacao', bloco: 'Identificação',
      texto: 'Tempo de atuação ou relacionamento com o Cidade Viva Education',
      tipo: 'escolha_unica', obrigatoria: true,
      opcoes: ['Menos de 6 meses', 'De 6 meses a 1 ano', 'De 1 a 3 anos', 'Mais de 3 anos', 'Não se aplica'],
    },
    {
      id: 'areas_participacao', bloco: 'Identificação',
      texto: 'Em quais áreas você participa, e com que nível de participação em cada uma?',
      objetivo: 'Mapear autoridade e proximidade real com cada frente institucional.',
      tipo: 'grade', obrigatoria: true,
      linhas: AREAS_PARTICIPACAO, colunas: NIVEL_PARTICIPACAO,
    },
    {
      id: 'prioridades_percebidas', bloco: 'Identificação',
      texto: 'Considerando apenas sua área de atuação, selecione as três prioridades que o marketing deveria apoiar nos próximos 12 meses.',
      tipo: 'ranking', obrigatoria: true, limite: 3,
      opcoes: prioridadesOpcoes,
    },
  ]
}
