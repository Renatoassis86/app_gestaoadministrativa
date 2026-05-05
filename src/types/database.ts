export type UserRole = 'gerente' | 'supervisor' | 'consultor' | 'assistente' | 'readonly'

export type PerfilPedagogico =
  | 'crista_catolica'
  | 'evangelica'
  | 'por_principio'
  | 'crista_classica'
  | 'convencional'
  | 'outro'

export type OrigemLead =
  | 'feira' | 'instagram' | 'network' | 'site' | 'whatsapp'
  | 'email' | 'telefone' | 'visita' | 'evento' | 'parceiro' | 'outro'

export type MeioContato =
  | 'presencial' | 'whatsapp' | 'email' | 'telefone' | 'videoconf' | 'outro'

export type NivelInteresse = 'muito_baixo' | 'baixo' | 'medio' | 'alto' | 'muito_alto'

export type ProntidaoNegociacao =
  | 'parada' | 'nova_reuniao' | 'esperando_retorno' | 'apresentacao'
  | 'contrato_enviado' | 'atualizar_contrato' | 'contrato_assinado' | 'parceiro_ativo'

export type AberturaPropostal = 'nenhuma' | 'baixa' | 'media' | 'alta'

export type ClassificacaoLead = 'quente' | 'morno' | 'frio'

export type StageNegociacao =
  | 'prospeccao' | 'qualificacao' | 'apresentacao' | 'proposta'
  | 'negociacao' | 'fechamento' | 'ganho' | 'perdido'

export type TarefaPrioridade = 'baixa' | 'media' | 'alta' | 'urgente'
export type TarefaStatus = 'pendente' | 'concluida' | 'cancelada'

// ─── Database Tables ──────────────────────────────────────────────────────────

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone: string | null
  region: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Escola {
  id: string
  nome: string
  cnpj: string | null
  perfil_pedagogico: PerfilPedagogico
  escola_paideia: boolean
  rua: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  telefone: string | null
  email: string | null
  site: string | null
  contato_nome: string | null
  contato_cargo: string | null
  diretor_nome: string | null
  qtd_infantil: number
  qtd_fund1: number
  qtd_fund2: number
  qtd_medio: number
  origem_lead: OrigemLead | null
  responsavel_id: string | null
  observacoes: string | null
  ativa: boolean
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  // Computed (from queries)
  responsavel?: Profile
  ultimo_contato?: string | null
  classificacao_atual?: ClassificacaoLead
  total_alunos?: number
  potencial_financeiro?: number
}

export interface ContatoEscola {
  id: string
  escola_id: string
  nome: string
  cargo: string | null
  email: string | null
  phone: string | null
  whatsapp: string | null
  principal: boolean
  observacoes: string | null
  created_at: string
}

export interface Negociacao {
  id: string
  escola_id: string
  titulo: string | null
  stage: StageNegociacao
  responsavel_id: string | null
  valor_estimado: number | null
  probabilidade: number
  previsao_fechamento: string | null
  motivo_perda: string | null
  ativa: boolean
  observacoes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  escola?: Escola
  responsavel?: Profile
}

export interface Registro {
  id: string
  escola_id: string
  negociacao_id: string | null
  data_contato: string
  hora_contato: string | null
  meio_contato: MeioContato
  resumo: string
  responsavel_id: string | null
  contato_nome: string | null
  contato_cargo: string | null
  interesse: NivelInteresse
  prontidao: ProntidaoNegociacao
  abertura: AberturaPropostal
  encaminhamentos: string[]
  qtd_infantil: number
  qtd_fund1: number
  qtd_fund2: number
  qtd_medio: number
  potencial_financeiro: number
  probabilidade: number
  classificacao: ClassificacaoLead
  proximo_contato: string | null
  notas_internas: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  escola?: Escola
  responsavel?: Profile
}

export interface Tarefa {
  id: string
  escola_id: string
  negociacao_id: string | null
  titulo: string
  descricao: string | null
  responsavel_id: string | null
  vencimento: string | null
  prioridade: TarefaPrioridade
  status: TarefaStatus
  concluida_em: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Joined
  escola?: Escola
  responsavel?: Profile
}

export interface NotaEscola {
  id: string
  escola_id: string
  texto: string
  fixada: boolean
  created_by: string | null
  created_at: string
}

// ─── Helpers / Labels ─────────────────────────────────────────────────────────

export const STAGE_LABELS: Record<StageNegociacao, string> = {
  prospeccao: 'Prospecção',
  qualificacao: 'Qualificação',
  apresentacao: 'Apresentação',
  proposta: 'Proposta Enviada',
  negociacao: 'Em Negociação',
  fechamento: 'Fechamento',
  ganho: 'Ganho ✓',
  perdido: 'Perdido ✗',
}

export const INTERESSE_LABELS: Record<NivelInteresse, string> = {
  muito_baixo: 'Muito Baixo',
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  muito_alto: 'Muito Alto',
}

export const PRONTIDAO_LABELS: Record<ProntidaoNegociacao, string> = {
  parada: 'Negociação Parada',
  nova_reuniao: 'Nova Reunião Necessária',
  esperando_retorno: 'Esperando Retorno',
  apresentacao: 'Apresentação em Andamento',
  contrato_enviado: 'Contrato Enviado',
  atualizar_contrato: 'Atualizar Contrato',
  contrato_assinado: 'Contrato Assinado',
  parceiro_ativo: 'Parceiro Ativo',
}

export const MEIO_LABELS: Record<MeioContato, string> = {
  presencial: 'Presencial',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  telefone: 'Telefone',
  videoconf: 'Videoconferência',
  outro: 'Outro',
}

export const ABERTURA_LABELS: Record<AberturaPropostal, string> = {
  nenhuma: 'Nenhuma',
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
}

export const ENCAMINHAMENTOS_OPTIONS = [
  { value: 'agendamento', label: 'Agendamento' },
  { value: 'apresentacao_curriculo', label: 'Apresentação do Currículo' },
  { value: 'envio_material', label: 'Envio de Material' },
  { value: 'nova_visita', label: 'Nova Visita' },
  { value: 'contato_futuro', label: 'Contato Futuro' },
  { value: 'elaboracao_contrato', label: 'Elaboração de Contrato' },
  { value: 'contrato_enviado', label: 'Contrato Enviado' },
  { value: 'contrato_assinado', label: 'Contrato Assinado' },
]

export const ROLE_LABELS: Record<UserRole, string> = {
  gerente: 'Gerente',
  supervisor: 'Supervisor',
  consultor: 'Consultor Comercial',
  assistente: 'Assistente',
  readonly: 'Somente Leitura',
}
