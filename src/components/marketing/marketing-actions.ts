'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface SalvarBriefingInput {
  formularioId: string
  nome: string
  funcao: string
  tempoAtuacao: string
  areasParticipacao: unknown
  prioridadesPercebidas: unknown
  respostas: Record<string, unknown>
}

export interface SalvarBriefingResult {
  success: boolean
  error?: string
}

export async function salvarRespostaBriefing(input: SalvarBriefingInput): Promise<SalvarBriefingResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  if (!input.nome.trim())   return { success: false, error: 'Nome é obrigatório' }
  if (!input.funcao.trim()) return { success: false, error: 'Função é obrigatória' }

  const { error } = await supabase.from('marketing_briefing_respostas').insert({
    formulario_id: input.formularioId,
    nome: input.nome,
    funcao: input.funcao,
    tempo_atuacao: input.tempoAtuacao || null,
    areas_participacao: input.areasParticipacao,
    prioridades_percebidas: input.prioridadesPercebidas,
    respostas: input.respostas,
    created_by: user.id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/marketing')
  revalidatePath('/marketing/respostas')
  return { success: true }
}
