// Módulo de Contratos Education — constantes e helpers compartilhados (server + client).
import { SERIES_PEDIDOS } from '@/lib/pedidos'

export const SERIES_CONTRATO = SERIES_PEDIDOS.map(s => ({ id: s.id as string, label: s.label as string }))

export const MODALIDADES = {
  boleto:   { label: 'Boleto',   desc: 'A escola compra o material e paga a Associação Cidade Viva por boleto, em parcelas.',   cor: '#0369a1', bg: '#e0f2fe' },
  eskolare: { label: 'Eskolare', desc: 'Os pais compram na loja virtual (Pix ou cartão até 10x) e a escola recebe um valor líquido por compra.', cor: '#7c3aed', bg: '#ede9fe' },
} as const
export type Modalidade = keyof typeof MODALIDADES

export const STATUS_CONTRATO: Record<string, { label: string; cor: string; bg: string }> = {
  rascunho:       { label: 'Rascunho',          cor: '#475569', bg: '#f1f5f9' },
  minuta_enviada: { label: 'Minuta enviada',    cor: '#b45309', bg: '#fef3c7' },
  em_revisao:     { label: 'Em revisão',        cor: '#b45309', bg: '#fef3c7' },
  enviado:        { label: 'Aguardando assinatura', cor: '#0369a1', bg: '#e0f2fe' },
  assinado:       { label: 'Assinado',          cor: '#047857', bg: '#d1fae5' },
  arquivado:      { label: 'Arquivado',         cor: '#047857', bg: '#d1fae5' },
  declinou:       { label: 'Declinou',          cor: '#b91c1c', bg: '#fee2e2' },
}

export const CATEGORIAS_ARQUIVO = [
  { id: 'contrato', label: 'Contrato assinado' },
  { id: 'minuta',   label: 'Minuta' },
  { id: 'aditivo',  label: 'Termo aditivo' },
  { id: 'proposta', label: 'Proposta comercial' },
  { id: 'ficha',    label: 'Ficha de coleta de dados' },
  { id: 'outro',    label: 'Outro' },
] as const

export const BUCKET_CONTRATOS = 'contratos-education'

// ── formatação ────────────────────────────────────────────────────────────────
export const soDigitos = (v?: string | null) => (v ?? '').replace(/\D/g, '')

export function fmtCnpj(v?: string | null) {
  const d = soDigitos(v)
  return d.length === 14 ? d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5') : (v ?? '')
}
export function fmtCpf(v?: string | null) {
  const d = soDigitos(v)
  return d.length === 11 ? d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : (v ?? '')
}
export function fmtCep(v?: string | null) {
  const d = soDigitos(v)
  return d.length === 8 ? d.replace(/^(\d{5})(\d{3})$/, '$1-$2') : (v ?? '')
}
export function fmtTel(v?: string | null) {
  const d = soDigitos(v)
  if (d.length === 11) return d.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  if (d.length === 10) return d.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  return v ?? ''
}
export const brl = (n?: number | null) =>
  n == null ? '—' : n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const fmtData = (iso?: string | null) =>
  iso ? new Date(iso + (iso.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('pt-BR') : '—'

// ── cálculo ───────────────────────────────────────────────────────────────────
export interface LinhaSerie {
  ano_letivo: number
  serie: string
  tipo_kit: string
  quantidade: number
  valor_unitario: number | null
  desconto?: number | null
}

export const totalKits = (linhas: LinhaSerie[], ano?: number | null) =>
  linhas.filter(l => ano == null || l.ano_letivo === ano).reduce((a, l) => a + (l.quantidade || 0), 0)

export const totalValor = (linhas: LinhaSerie[], ano?: number | null) =>
  linhas.filter(l => ano == null || l.ano_letivo === ano)
    .reduce((a, l) => a + (l.quantidade || 0) * (l.valor_unitario || 0) - (l.desconto || 0), 0)

export function progressoVigencia(inicio?: string | null, fim?: string | null): number | null {
  if (!inicio || !fim) return null
  const i = new Date(inicio).getTime(), f = new Date(fim).getTime(), h = Date.now()
  if (!(f > i)) return null
  return Math.max(0, Math.min(100, Math.round(((h - i) / (f - i)) * 100)))
}

// Etiquetas de pendência (campos que a ficha e o contrato exigem e ainda faltam)
export function pendencias(c: any): string[] {
  const falta: string[] = []
  const req: Array<[string, string]> = [
    ['legal_nome', 'representante legal'], ['legal_cpf', 'CPF do representante'], ['legal_rg', 'RG do representante'],
    ['financeiro_email', 'e-mail financeiro'], ['letivo_inicio', 'início do ano letivo'], ['letivo_fim', 'fim do ano letivo'],
    ['testemunha1_nome', 'testemunhas'], ['poderes_documento', 'poderes de assinatura'],
  ]
  for (const [k, rotulo] of req) if (!c[k]) falta.push(rotulo)
  if (c.modalidade === 'eskolare' && !c.repasse_tipo) falta.push('repasse à escola')
  if (c.modalidade === 'boleto' && !c.num_parcelas) falta.push('parcelas')
  return falta
}
