'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AmostraStage = 'solicitada' | 'separacao' | 'postada' | 'entregue' | 'devolutiva'
export type AmostraPrioridade = 'normal' | 'urgente'

type Result = { success: boolean; error?: string; id?: string }

function s(v: FormDataEntryValue | null): string | null {
  if (v == null) return null
  const t = String(v).trim()
  return t === '' ? null : t
}

export async function criarSolicitacaoAmostra(formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const payload: Record<string, any> = {
    solicitante_id:    user.id,
    escola_id:         s(formData.get('escola_id')),
    prioridade:        (s(formData.get('prioridade')) ?? 'normal') as AmostraPrioridade,
    material:          s(formData.get('material')) ?? '',
    quantidade:        Math.max(1, parseInt(String(formData.get('quantidade') ?? '1'), 10) || 1),
    observacoes_material: s(formData.get('observacoes_material')),
    destinatario_nome: s(formData.get('destinatario_nome')) ?? '',
    cep:               s(formData.get('cep')),
    logradouro:        s(formData.get('logradouro')),
    numero:            s(formData.get('numero')),
    complemento:       s(formData.get('complemento')),
    bairro:            s(formData.get('bairro')),
    cidade:            s(formData.get('cidade')),
    uf:                s(formData.get('uf')),
    cpf_cnpj:          s(formData.get('cpf_cnpj')),
    celular:           s(formData.get('celular')),
    telefone:          s(formData.get('telefone')),
    email:             s(formData.get('email')),
  }

  if (!payload.material)          return { success: false, error: 'Material é obrigatório' }
  if (!payload.destinatario_nome) return { success: false, error: 'Nome do destinatário é obrigatório' }

  const { data, error } = await supabase
    .from('solicitacoes_amostras')
    .insert(payload)
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  revalidatePath('/comercial/amostras')
  return { success: true, id: data?.id }
}

export async function moverAmostra(id: string, novoStage: AmostraStage): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const patch: Record<string, any> = { stage: novoStage }
  if (novoStage === 'separacao') patch.assistente_id = user.id

  const { error } = await supabase
    .from('solicitacoes_amostras')
    .update(patch)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/comercial/amostras')
  return { success: true }
}

export async function atualizarLogistica(
  id: string,
  data: { transportadora?: string | null; codigo_rastreio?: string | null; link_rastreio?: string | null },
): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { error } = await supabase
    .from('solicitacoes_amostras')
    .update({
      transportadora:  data.transportadora ?? null,
      codigo_rastreio: data.codigo_rastreio ?? null,
      link_rastreio:   data.link_rastreio ?? null,
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/comercial/amostras')
  return { success: true }
}

export async function registrarDevolutiva(
  id: string,
  data: { devolutiva: string; devolutiva_data?: string | null },
): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { error } = await supabase
    .from('solicitacoes_amostras')
    .update({
      devolutiva:      data.devolutiva,
      devolutiva_data: data.devolutiva_data ?? new Date().toISOString().slice(0, 10),
      stage:           'devolutiva',
    })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/comercial/amostras')
  return { success: true }
}

export async function excluirAmostra(id: string): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { error } = await supabase
    .from('solicitacoes_amostras')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/comercial/amostras')
  return { success: true }
}
