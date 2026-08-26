'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PACOTE_PRECOS } from '@/lib/bilinguismo-constants'

export interface ActionResult {
  success: boolean
  error?: string
  id?: string
}

/**
 * Server Action para envio público do formulário de Parceria de Bilinguismo
 */
export async function enviarFormularioBilinguismo(formData: FormData) {
  const supabase = await createClient()

  const email_responsavel          = (formData.get('email_responsavel') as string || '').trim()
  const nome_escola                = (formData.get('nome_escola') as string || '').trim()
  const nome_fantasia              = (formData.get('nome_fantasia') as string || '').trim() || null
  const cnpj                       = (formData.get('cnpj') as string || '').trim()
  const rua                        = (formData.get('rua') as string || '').trim() || null
  const numero                     = (formData.get('numero') as string || '').trim() || null
  const complemento                = (formData.get('complemento') as string || '').trim() || null
  const bairro                     = (formData.get('bairro') as string || '').trim() || null
  const cidade                     = (formData.get('cidade') as string || '').trim() || null
  const estado                     = (formData.get('estado') as string || '').trim().toUpperCase() || null
  const cep                        = (formData.get('cep') as string || '').trim() || null
  const nome_representante         = (formData.get('nome_representante_legal') as string || '').trim() || null
  const legal_cpf                  = (formData.get('legal_cpf') as string || '').trim() || null
  const legal_rg                   = (formData.get('legal_rg') as string || '').trim() || null
  const legal_orgao                = (formData.get('legal_orgao') as string || '').trim() || null
  const legal_email                = (formData.get('legal_email') as string || '').trim() || null
  const legal_celular              = (formData.get('legal_celular') as string || '').trim() || null
  const legal_cargo                = (formData.get('legal_cargo') as string || '').trim() || null
  const pacote_interesse           = (formData.get('pacote_interesse') as string || 'silver').trim().toLowerCase()
  const vencimento_primeira_parcela = (formData.get('vencimento_primeira_parcela') as string || '').trim() || null
  const numero_parcelas            = parseInt(formData.get('numero_parcelas') as string) || 12

  if (!email_responsavel || !nome_escola || !cnpj || !nome_representante) {
    throw new Error('Por favor, preencha todos os campos obrigatórios (*).')
  }

  // 1. Tentar encontrar ou criar a escola no CRM (tabela `escolas`)
  let escolaId: string | null = null

  if (nome_escola) {
    let { data: escolaExistente } = cnpj
      ? await supabase.from('escolas').select('id').eq('cnpj', cnpj).maybeSingle()
      : await supabase.from('escolas').select('id')
          .ilike('nome', nome_escola)
          .eq('ativa', true)
          .limit(1)
          .maybeSingle()

    if (escolaExistente?.id) {
      escolaId = escolaExistente.id
      // Atualiza escola com os dados recebidos
      await supabase.from('escolas').update({
        cnpj: cnpj || undefined,
        cidade: cidade || undefined,
        estado: estado || undefined,
        rua: rua || undefined,
        numero: numero || undefined,
        bairro: bairro || undefined,
        cep: cep || undefined,
        contato_nome: nome_representante || undefined,
        email: email_responsavel || undefined,
      }).eq('id', escolaId)
    } else {
      // Cria nova escola no CRM
      const { data: novaEscola, error: errEscola } = await supabase.from('escolas').insert({
        nome: nome_escola,
        cnpj: cnpj || null,
        cidade: cidade || null,
        estado: estado || null,
        rua: rua || null,
        numero: numero || null,
        bairro: bairro || null,
        cep: cep || null,
        email: email_responsavel || null,
        contato_nome: nome_representante || null,
        origem_lead: 'site',
        ativa: true,
      }).select('id').single()

      if (!errEscola && novaEscola) {
        escolaId = novaEscola.id
      }
    }
  }

  // 2. Insere a proposta na tabela `formularios_bilinguismo`
  const payload = {
    email_responsavel,
    nome_escola,
    nome_fantasia,
    cnpj,
    rua,
    numero,
    complemento,
    bairro,
    cidade,
    estado,
    cep,
    nome_representante_legal: nome_representante,
    legal_cpf,
    legal_rg,
    legal_orgao,
    legal_email,
    legal_celular,
    legal_cargo,
    pacote_interesse,
    vencimento_primeira_parcela,
    numero_parcelas,
    escola_id: escolaId,
  }

  let { error } = await supabase.from('formularios_bilinguismo').insert(payload)

  // Fallback de resiliência: se as colunas adicionais ainda não tiverem sido executadas no SQL Editor do Supabase
  if (error && (error.message.includes('legal_') || error.message.includes('column') || error.message.includes('vencimento_'))) {
    console.warn('⚠️ Tentando salvar payload simplificado devido a colunas pendentes no banco Supabase:', error.message)
    const payloadBasico = {
      email_responsavel,
      nome_escola,
      nome_fantasia,
      cnpj,
      rua,
      numero,
      complemento,
      bairro,
      cidade,
      estado,
      cep,
      nome_representante_legal: nome_representante,
      pacote_interesse,
      vencimento_primeira_parcela,
      numero_parcelas,
      escola_id: escolaId,
    }
    const res2 = await supabase.from('formularios_bilinguismo').insert(payloadBasico)
    error = res2.error
  }

  if (error) {
    console.error('❌ Erro ao salvar formulário de bilinguismo:', error.message)
    throw new Error(`Erro ao salvar formulário: ${error.message}`)
  }

  // Revalida caches do CRM
  revalidatePath('/comercial/proposta', 'layout')
  revalidatePath('/comercial/escolas', 'layout')
  revalidatePath('/comercial/contratos-ingles', 'layout')

  redirect('/formulario-ingles/obrigado')
}

/**
 * Server Action para criar ou atualizar contrato de Bilinguismo no CRM
 */
export async function upsertContratoBilinguismo(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const escola_id = formData.get('escola_id') as string
  if (!escola_id) throw new Error('Selecione uma escola para gerenciar o contrato.')

  const pacote_contratado = (formData.get('pacote_contratado') as string || 'bronze').toLowerCase()
  const rawValor = parseFloat(formData.get('valor_anual') as string)
  const valor_anual = !isNaN(rawValor) && rawValor > 0 ? rawValor : (PACOTE_PRECOS[pacote_contratado] ?? 29900)
  const nome_fantasia = (formData.get('nome_fantasia') as string || '').trim() || null
  const vencimento_primeira_parcela = (formData.get('vencimento_primeira_parcela') as string || '').trim() || null
  const numero_parcelas = parseInt(formData.get('numero_parcelas') as string) || 12

  const payload = {
    escola_id,
    formulario_bilinguismo_id: formData.get('formulario_bilinguismo_id') as string || null,
    formulario_enviado:  formData.get('formulario_enviado') === 'true',
    formulario_recebido: formData.get('formulario_recebido') === 'true',
    minuta_enviada:      formData.get('minuta_enviada') === 'true',
    retorno_minuta:      formData.get('retorno_minuta') === 'true',
    minuta_atualizada:   formData.get('minuta_atualizada') === 'true',
    contrato_enviado:    formData.get('contrato_enviado') === 'true',
    contrato_assinado:   formData.get('contrato_assinado') === 'true',
    contrato_arquivado:  formData.get('contrato_arquivado') === 'true',
    observacao_minuta:   formData.get('observacao_minuta') as string || null,
    encaminhamento_final: formData.get('encaminhamento_final') as string || null,
    tempo_contrato:      parseInt(formData.get('tempo_contrato') as string) || 12,
    pacote_contratado,
    valor_anual,
    nome_fantasia,
    vencimento_primeira_parcela,
    numero_parcelas,
    updated_at: new Date().toISOString(),
  }

  // Verifica se já existe um contrato de bilinguismo para a escola
  const { data: existente } = await supabase
    .from('contratos_bilinguismo')
    .select('id')
    .eq('escola_id', escola_id)
    .maybeSingle()

  const { error } = existente
    ? await supabase.from('contratos_bilinguismo').update(payload).eq('id', existente.id)
    : await supabase.from('contratos_bilinguismo').insert({ ...payload, created_at: new Date().toISOString() })

  if (error) {
    console.error('❌ Erro ao salvar contrato de bilinguismo:', error.message)
    throw new Error(`Erro ao salvar contrato: ${error.message}`)
  }

  revalidatePath('/comercial/contratos-ingles', 'layout')
  revalidatePath(`/comercial/escolas/${escola_id}`, 'layout')
  redirect(`/comercial/contratos-ingles?escola=${escola_id}`)
}

/**
 * Server Action para excluir proposta de Bilinguismo
 */
export async function excluirPropostaBilinguismo(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { error } = await supabase
    .from('formularios_bilinguismo')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/proposta', 'layout')
  return { success: true, id }
}
