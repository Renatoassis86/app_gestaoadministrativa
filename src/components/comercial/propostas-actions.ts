'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Result = { success: boolean; error?: string }

function s(v: FormDataEntryValue | null): string | null {
  if (v == null) return null
  const t = String(v).trim()
  return t === '' ? null : t
}

function n(v: FormDataEntryValue | null): number {
  const x = parseInt(String(v ?? '0'), 10)
  return Number.isFinite(x) && x >= 0 ? x : 0
}

export async function editarProposta(id: string, formData: FormData): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const payload: Record<string, any> = {
    email_responsavel:  s(formData.get('email_responsavel')) ?? '',
    nome_escola:        s(formData.get('nome_escola')) ?? '',
    cnpj:               s(formData.get('cnpj')),
    rua:                s(formData.get('rua')),
    numero:             s(formData.get('numero')),
    complemento:        s(formData.get('complemento')),
    bairro:             s(formData.get('bairro')),
    cidade:             s(formData.get('cidade')),
    estado:             s(formData.get('estado')),
    cep:                s(formData.get('cep')),
    infantil2_qtd:      n(formData.get('infantil2_qtd')),
    infantil3_qtd:      n(formData.get('infantil3_qtd')),
    infantil4_qtd:      n(formData.get('infantil4_qtd')),
    infantil5_qtd:      n(formData.get('infantil5_qtd')),
    fund1_ano1_qtd:     n(formData.get('fund1_ano1_qtd')),
    fund1_ano2_qtd:     n(formData.get('fund1_ano2_qtd')),
    fund1_ano3_qtd:     n(formData.get('fund1_ano3_qtd')),
    fund1_ano4_qtd:     n(formData.get('fund1_ano4_qtd')),
    fund1_ano5_qtd:     n(formData.get('fund1_ano5_qtd')),
    data_inicio_letivo: s(formData.get('data_inicio_letivo')),
    data_fim_letivo:    s(formData.get('data_fim_letivo')),
    formato_ano_letivo: s(formData.get('formato_ano_letivo')),
    observacoes:        s(formData.get('observacoes')),
    legal_nome:         s(formData.get('legal_nome')),
    legal_cpf:          s(formData.get('legal_cpf')),
    legal_rg:           s(formData.get('legal_rg')),
    legal_orgao:        s(formData.get('legal_orgao')),
    legal_rua:          s(formData.get('legal_rua')),
    legal_numero:       s(formData.get('legal_numero')),
    legal_complemento:  s(formData.get('legal_complemento')),
    legal_bairro:       s(formData.get('legal_bairro')),
    legal_cidade:       s(formData.get('legal_cidade')),
    legal_estado:       s(formData.get('legal_estado')),
    legal_cep:          s(formData.get('legal_cep')),
    legal_email:        s(formData.get('legal_email')),
    legal_celular:      s(formData.get('legal_celular')),
    fin_nome:           s(formData.get('fin_nome')),
    fin_cpf:            s(formData.get('fin_cpf')),
    fin_rg:             s(formData.get('fin_rg')),
    fin_orgao:          s(formData.get('fin_orgao')),
    fin_email:          s(formData.get('fin_email')),
    fin_celular:        s(formData.get('fin_celular')),
    ped_nome:           s(formData.get('ped_nome')),
    ped_cpf:            s(formData.get('ped_cpf')),
    ped_rg:             s(formData.get('ped_rg')),
    ped_orgao:          s(formData.get('ped_orgao')),
    ped_email:          s(formData.get('ped_email')),
    ped_celular:        s(formData.get('ped_celular')),
  }

  if (!payload.nome_escola)       return { success: false, error: 'Nome da escola é obrigatório' }
  if (!payload.email_responsavel) return { success: false, error: 'E-mail do responsável é obrigatório' }

  const { error } = await supabase.from('formularios').update(payload).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/proposta')
  return { success: true }
}

export async function excluirProposta(id: string): Promise<Result> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { error } = await supabase.from('formularios').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/proposta')
  return { success: true }
}
