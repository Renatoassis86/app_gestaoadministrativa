/**
 * Busca escolas de TODAS as fontes:
 * 1. Tabela `escolas` do CRM (escolas cadastradas com ativa=true)
 * 2. Tabela `leads_universal` — escola_nome únicos dos leads importados
 *    (para permitir criar registros/interações antes do cadastro formal)
 *
 * Retorna lista unificada e deduplicada por nome, priorizando o CRM.
 */

import { SupabaseClient } from '@supabase/supabase-js'

export interface EscolaOpcao {
  id: string           // UUID real (CRM) ou pseudo-id para leads
  nome: string
  cidade: string | null
  estado: string | null
  origem: 'crm' | 'lead'  // indica de onde veio
}

export async function buscarEscolasUnificadas(
  supabase: SupabaseClient,
  opts?: { incluirLeads?: boolean }
): Promise<EscolaOpcao[]> {
  const incluirLeads = opts?.incluirLeads !== false // default: true

  // 1. Escolas do CRM
  const { data: escolasCRM } = await supabase
    .from('escolas')
    .select('id, nome, cidade, estado')
    .eq('ativa', true)
    .order('nome')

  const resultado: EscolaOpcao[] = (escolasCRM ?? []).map((e: any) => ({
    id:     e.id,
    nome:   e.nome,
    cidade: e.cidade,
    estado: e.estado,
    origem: 'crm' as const,
  }))

  if (!incluirLeads) return resultado

  // 2. Leads com escola_nome preenchido (não cadastradas no CRM)
  const nomesCRM = new Set(resultado.map(e => e.nome.trim().toLowerCase()))

  const { data: leadsComEscola } = await supabase
    .from('leads_universal')
    .select('escola_nome, cidade, uf')
    .not('escola_nome', 'is', null)
    .limit(2000)

  // Agrupar por escola_nome único (pegar 1 por nome)
  const vistos = new Map<string, EscolaOpcao>()
  ;(leadsComEscola ?? []).forEach((l: any) => {
    const nome = (l.escola_nome ?? '').trim()
    if (!nome) return
    const key = nome.toLowerCase()
    // Pula se já existe no CRM
    if (nomesCRM.has(key)) return
    if (!vistos.has(key)) {
      vistos.set(key, {
        // Pseudo-id: prefixo 'lead:' + nome para distinguir de UUIDs reais
        id:     `lead:${nome}`,
        nome,
        cidade: l.cidade ?? null,
        estado: l.uf ?? null,
        origem: 'lead' as const,
      })
    }
  })

  // Ordenar leads por nome e concatenar
  const leads = [...vistos.values()].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))

  return [...resultado, ...leads]
}
