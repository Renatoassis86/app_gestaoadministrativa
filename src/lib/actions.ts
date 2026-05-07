'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calcPotencial, calcProbabilidade, calcClassificacao } from '@/types/database'
import type { StageNegociacao } from '@/types/database'

// ─── Tipos de retorno das actions (para uso em Client Components) ─────────────

export interface ActionResult {
  success: boolean
  error?: string
  id?: string
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Escola ────────────────────────────────────────────────────────────────────

export async function upsertEscola(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = formData.get('id') as string | null

  const payload = {
    nome:               formData.get('nome') as string,
    cnpj:               formData.get('cnpj') as string || null,
    perfil_pedagogico:  formData.get('perfil_pedagogico') as string || 'convencional',
    escola_paideia:     formData.get('escola_paideia') === 'true',
    rua:                formData.get('rua') as string || null,
    numero:             formData.get('numero') as string || null,
    complemento:        formData.get('complemento') as string || null,
    bairro:             formData.get('bairro') as string || null,
    cidade:             formData.get('cidade') as string || null,
    estado:             (formData.get('estado') as string || '').toUpperCase() || null,
    cep:                formData.get('cep') as string || null,
    telefone:           formData.get('telefone') as string || null,
    email:              formData.get('email') as string || null,
    site:               formData.get('site') as string || null,
    contato_nome:       formData.get('contato_nome') as string || null,
    contato_cargo:      formData.get('contato_cargo') as string || null,
    diretor_nome:       formData.get('diretor_nome') as string || null,
    // Totais por segmento (calculados a partir das turmas)
    qtd_infantil: parseInt(formData.get('qtd_infantil') as string) || 0,

    // Fund I — turmas individuais (1º ao 5º ano)
    qtd_fund1_ano1: parseInt(formData.get('qtd_fund1_ano1') as string) || 0,
    qtd_fund1_ano2: parseInt(formData.get('qtd_fund1_ano2') as string) || 0,
    qtd_fund1_ano3: parseInt(formData.get('qtd_fund1_ano3') as string) || 0,
    qtd_fund1_ano4: parseInt(formData.get('qtd_fund1_ano4') as string) || 0,
    qtd_fund1_ano5: parseInt(formData.get('qtd_fund1_ano5') as string) || 0,

    // Fund II — turmas individuais (6º ao 9º ano)
    qtd_fund2_ano6: parseInt(formData.get('qtd_fund2_ano6') as string) || 0,
    qtd_fund2_ano7: parseInt(formData.get('qtd_fund2_ano7') as string) || 0,
    qtd_fund2_ano8: parseInt(formData.get('qtd_fund2_ano8') as string) || 0,
    qtd_fund2_ano9: parseInt(formData.get('qtd_fund2_ano9') as string) || 0,

    // Ensino Médio — turmas individuais (1ª à 3ª série)
    qtd_medio_1s: parseInt(formData.get('qtd_medio_1s') as string) || 0,
    qtd_medio_2s: parseInt(formData.get('qtd_medio_2s') as string) || 0,
    qtd_medio_3s: parseInt(formData.get('qtd_medio_3s') as string) || 0,

    // Totais legado (soma automática para compatibilidade com queries existentes)
    get qtd_fund1() {
      return (parseInt(formData.get('qtd_fund1_ano1') as string) || 0)
           + (parseInt(formData.get('qtd_fund1_ano2') as string) || 0)
           + (parseInt(formData.get('qtd_fund1_ano3') as string) || 0)
           + (parseInt(formData.get('qtd_fund1_ano4') as string) || 0)
           + (parseInt(formData.get('qtd_fund1_ano5') as string) || 0)
    },
    get qtd_fund2() {
      return (parseInt(formData.get('qtd_fund2_ano6') as string) || 0)
           + (parseInt(formData.get('qtd_fund2_ano7') as string) || 0)
           + (parseInt(formData.get('qtd_fund2_ano8') as string) || 0)
           + (parseInt(formData.get('qtd_fund2_ano9') as string) || 0)
    },
    get qtd_medio() {
      return (parseInt(formData.get('qtd_medio_1s') as string) || 0)
           + (parseInt(formData.get('qtd_medio_2s') as string) || 0)
           + (parseInt(formData.get('qtd_medio_3s') as string) || 0)
    },
    origem_lead:        formData.get('origem_lead') as string || null,
    responsavel_id:     formData.get('responsavel_id') as string || null,
    observacoes:        formData.get('observacoes') as string || null,
    updated_by:         user.id,
  }

  if (id) {
    const { error } = await supabase.from('escolas').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
    revalidatePath(`/comercial/escolas/${id}`)
    redirect(`/comercial/escolas/${id}`)
  } else {
    const { data, error } = await supabase
      .from('escolas')
      .insert({ ...payload, created_by: user.id })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    revalidatePath('/comercial/escolas')
    redirect(`/comercial/escolas/${data.id}`)
  }
}

// ─── Deletar Escola ────────────────────────────────────────────────────────────

export async function deletarEscola(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (!['gerente', 'supervisor'].includes(profile?.role ?? '')) {
    return { success: false, error: 'Sem permissão para excluir escolas' }
  }

  // Soft delete: marca como inativa em vez de deletar
  const { error } = await supabase.from('escolas').update({ ativa: false, updated_by: user.id }).eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/escolas')
  revalidatePath('/comercial/leads')
  revalidatePath('/comercial')
  return { success: true, id }
}

// ─── Registro ──────────────────────────────────────────────────────────────────

export async function upsertRegistro(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id         = formData.get('id') as string | null
  const escola_id  = formData.get('escola_id') as string
  const enc        = formData.getAll('encaminhamentos') as string[]
  const qtd_inf    = parseInt(formData.get('qtd_infantil') as string) || 0
  const qtd_f1     = parseInt(formData.get('qtd_fund1') as string) || 0
  const qtd_f2     = parseInt(formData.get('qtd_fund2') as string) || 0
  const qtd_med    = parseInt(formData.get('qtd_medio') as string) || 0
  const interesse  = formData.get('interesse') as string || 'medio'
  const prontidao  = formData.get('prontidao') as string || 'esperando_retorno'
  const abertura   = formData.get('abertura') as string || 'media'

  const pot  = calcPotencial(qtd_inf, qtd_f1, qtd_f2, qtd_med)
  const prob = calcProbabilidade(interesse, prontidao, abertura, enc)
  const cls  = calcClassificacao(prob, pot)

  const payload = {
    escola_id,
    negociacao_id:        formData.get('negociacao_id') as string || null,
    data_contato:         formData.get('data_contato') as string,
    hora_contato:         formData.get('hora_contato') as string || null,
    meio_contato:         formData.get('meio_contato') as string || 'whatsapp',
    resumo:               formData.get('resumo') as string,
    responsavel_id:       formData.get('responsavel_id') as string || user.id,
    contato_nome:         formData.get('contato_nome') as string || null,
    contato_cargo:        formData.get('contato_cargo') as string || null,
    interesse,
    prontidao,
    abertura,
    encaminhamentos:      enc,
    qtd_infantil:         qtd_inf,
    qtd_fund1:            qtd_f1,
    qtd_fund2:            qtd_f2,
    qtd_medio:            qtd_med,
    potencial_financeiro: pot,
    probabilidade:        prob,
    classificacao:        cls,
    proximo_contato:      formData.get('proximo_contato') as string || null,
    notas_internas:       formData.get('notas_internas') as string || null,
  }

  if (id) {
    const { error } = await supabase.from('registros').update(payload).eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('registros')
      .insert({ ...payload, created_by: user.id })
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/comercial/escolas/${escola_id}`)
  revalidatePath('/comercial')
  redirect(`/comercial/escolas/${escola_id}`)
}

/**
 * Deleta um registro individual.
 * Apenas o criador ou supervisores podem deletar (verificado via RLS).
 * Retorna ActionResult para uso em Client Components (sem redirect).
 */
export async function deleteRegistro(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  // Busca o escola_id antes de deletar para revalidar o path correto
  const { data: registro, error: fetchError } = await supabase
    .from('registros')
    .select('id, escola_id, created_by, responsavel_id')
    .eq('id', id)
    .single()

  if (fetchError || !registro) {
    return { success: false, error: 'Registro não encontrado' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSupervisor = profile?.role === 'gerente' || profile?.role === 'supervisor'
  const isOwner      = registro.created_by === user.id || registro.responsavel_id === user.id

  if (!isSupervisor && !isOwner) {
    return { success: false, error: 'Sem permissão para deletar este registro' }
  }

  const { error } = await supabase.from('registros').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/comercial/escolas/${registro.escola_id}`)
  revalidatePath('/comercial')
  revalidatePath('/comercial/registros')

  return { success: true, id }
}

// ─── Negociação ────────────────────────────────────────────────────────────────

/**
 * Cria ou edita uma negociação (upsert).
 *
 * Se `formData` contém `id`, faz UPDATE; caso contrário, INSERT.
 * Após salvar, redireciona para a escola vinculada.
 */
export async function upsertNegociacao(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id        = formData.get('id') as string | null
  const escola_id = formData.get('escola_id') as string

  if (!escola_id) throw new Error('escola_id é obrigatório')

  const valorRaw = parseFloat(formData.get('valor_estimado') as string)
  const probRaw  = parseInt(formData.get('probabilidade') as string)

  const payload = {
    escola_id,
    titulo:              formData.get('titulo') as string || null,
    stage:               (formData.get('stage') as StageNegociacao) || 'prospeccao',
    responsavel_id:      formData.get('responsavel_id') as string || user.id,
    valor_estimado:      isNaN(valorRaw) ? null : valorRaw,
    probabilidade:       isNaN(probRaw) ? 0 : Math.min(100, Math.max(0, probRaw)),
    previsao_fechamento: formData.get('previsao_fechamento') as string || null,
    motivo_perda:        formData.get('motivo_perda') as string || null,
    ativa:               formData.get('ativa') !== 'false',
    observacoes:         formData.get('observacoes') as string || null,
  }

  if (id) {
    const { error } = await supabase
      .from('negociacoes')
      .update(payload)
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('negociacoes')
      .insert({ ...payload, created_by: user.id })
    if (error) throw new Error(error.message)
  }

  revalidatePath(`/comercial/escolas/${escola_id}`)
  revalidatePath('/comercial/pipeline')
  revalidatePath('/comercial')
  redirect(`/comercial/escolas/${escola_id}`)
}

/**
 * Atualiza o stage de uma negociação.
 * Pensado para drag-and-drop no Kanban ou botões de stage rápidos.
 * Não redireciona — retorna ActionResult.
 */
export async function updateStageNegociacao(
  id: string,
  stage: StageNegociacao,
  options?: { motivo_perda?: string }
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const updatePayload: Record<string, unknown> = { stage }

  // Se fechando como perdido, registra o motivo
  if (stage === 'perdido' && options?.motivo_perda) {
    updatePayload.motivo_perda = options.motivo_perda
  }

  // Ao marcar ganho ou perdido, desativa a negociação do pipeline ativo
  if (stage === 'ganho' || stage === 'perdido') {
    updatePayload.ativa = false
  }

  const { data: negociacao, error: fetchError } = await supabase
    .from('negociacoes')
    .select('id, escola_id')
    .eq('id', id)
    .single()

  if (fetchError || !negociacao) {
    return { success: false, error: 'Negociação não encontrada' }
  }

  const { error } = await supabase
    .from('negociacoes')
    .update(updatePayload)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/comercial/escolas/${negociacao.escola_id}`)
  revalidatePath('/comercial/pipeline')
  revalidatePath('/comercial')

  return { success: true, id }
}

/**
 * Deleta uma negociação (apenas gerente/supervisor ou dono).
 * Retorna ActionResult.
 */
export async function deleteNegociacao(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: negociacao, error: fetchError } = await supabase
    .from('negociacoes')
    .select('id, escola_id, created_by, responsavel_id')
    .eq('id', id)
    .single()

  if (fetchError || !negociacao) {
    return { success: false, error: 'Negociação não encontrada' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isSupervisor = profile?.role === 'gerente' || profile?.role === 'supervisor'
  const isOwner      = negociacao.created_by === user.id || negociacao.responsavel_id === user.id

  if (!isSupervisor && !isOwner) {
    return { success: false, error: 'Sem permissão para deletar esta negociação' }
  }

  const { error } = await supabase.from('negociacoes').delete().eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/comercial/escolas/${negociacao.escola_id}`)
  revalidatePath('/comercial/pipeline')
  revalidatePath('/comercial')

  return { success: true, id }
}

// ─── Tarefa ────────────────────────────────────────────────────────────────────

export async function criarTarefa(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const escola_id = formData.get('escola_id') as string

  const { error } = await supabase.from('tarefas').insert({
    escola_id,
    negociacao_id:  formData.get('negociacao_id') as string || null,
    titulo:         formData.get('titulo') as string,
    descricao:      formData.get('descricao') as string || null,
    responsavel_id: formData.get('responsavel_id') as string || user.id,
    vencimento:     formData.get('vencimento') as string || null,
    prioridade:     formData.get('prioridade') as string || 'media',
    created_by:     user.id,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/comercial/escolas/${escola_id}`)
  revalidatePath('/comercial')
}

/**
 * Conclui uma tarefa pendente.
 * Já existia — mantida com tratamento de erro melhorado.
 */
export async function concluirTarefa(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  // Busca escola_id para revalidar o path correto
  const { data: tarefa } = await supabase
    .from('tarefas')
    .select('id, escola_id, status')
    .eq('id', id)
    .single()

  if (!tarefa) return { success: false, error: 'Tarefa não encontrada' }
  if (tarefa.status === 'concluida') return { success: true, id } // idempotente

  const { error } = await supabase
    .from('tarefas')
    .update({ status: 'concluida', concluida_em: new Date().toISOString() })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/comercial/escolas/${tarefa.escola_id}`)
  revalidatePath('/comercial')

  return { success: true, id }
}

/**
 * Cancela uma tarefa (sem excluir — mantém histórico).
 */
export async function cancelarTarefa(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: tarefa } = await supabase
    .from('tarefas')
    .select('id, escola_id')
    .eq('id', id)
    .single()

  if (!tarefa) return { success: false, error: 'Tarefa não encontrada' }

  const { error } = await supabase
    .from('tarefas')
    .update({ status: 'cancelada' })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/comercial/escolas/${tarefa.escola_id}`)
  revalidatePath('/comercial')

  return { success: true, id }
}

// ─── Nota ──────────────────────────────────────────────────────────────────────

export async function criarNota(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const escola_id = formData.get('escola_id') as string

  const { error } = await supabase.from('notas_escola').insert({
    escola_id,
    texto:      formData.get('texto') as string,
    fixada:     formData.get('fixada') === 'true',
    created_by: user.id,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/comercial/escolas/${escola_id}`)
}

export async function deletarNota(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: nota } = await supabase
    .from('notas_escola')
    .select('id, escola_id, created_by')
    .eq('id', id)
    .single()

  if (!nota) return { success: false, error: 'Nota não encontrada' }

  // Apenas o criador pode deletar notas
  if (nota.created_by !== user.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'gerente') {
      return { success: false, error: 'Sem permissão para deletar esta nota' }
    }
  }

  const { error } = await supabase.from('notas_escola').delete().eq('id', id)
  if (error) return { success: false, error: error.message }

  revalidatePath(`/comercial/escolas/${nota.escola_id}`)
  return { success: true, id }
}

// ─── Contrato ──────────────────────────────────────────────────────────────────

export async function upsertContrato(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const escola_id = formData.get('escola_id') as string

  const toNum = (k: string) => parseFloat(formData.get(k) as string) || 0

  const payload = {
    escola_id,
    formulario_enviado:   formData.get('formulario_enviado') === 'true',
    formulario_recebido:  formData.get('formulario_recebido') === 'true',
    minuta_enviada:       formData.get('minuta_enviada') === 'true',
    retorno_minuta:       formData.get('retorno_minuta') === 'true',
    observacao_minuta:    formData.get('observacao_minuta') as string || null,
    minuta_atualizada:    formData.get('minuta_atualizada') === 'true',
    contrato_enviado:     formData.get('contrato_enviado') === 'true',
    contrato_assinado:    formData.get('contrato_assinado') === 'true',
    contrato_arquivado:   formData.get('contrato_arquivado') === 'true',
    encaminhamento_final: formData.get('encaminhamento_final') as string || null,
    infantil2_qtd:    toNum('infantil2_qtd'),
    infantil2_valor:  toNum('infantil2_valor'),
    infantil3_qtd:    toNum('infantil3_qtd'),
    infantil3_valor:  toNum('infantil3_valor'),
    infantil4_qtd:    toNum('infantil4_qtd'),
    infantil4_valor:  toNum('infantil4_valor'),
    infantil5_qtd:    toNum('infantil5_qtd'),
    infantil5_valor:  toNum('infantil5_valor'),
    fund1_ano1_qtd:   toNum('fund1_ano1_qtd'),
    fund1_ano1_valor: toNum('fund1_ano1_valor'),
    fund1_ano2_qtd:   toNum('fund1_ano2_qtd'),
    fund1_ano2_valor: toNum('fund1_ano2_valor'),
    fund1_ano3_qtd:   toNum('fund1_ano3_qtd'),
    fund1_ano3_valor: toNum('fund1_ano3_valor'),
    fund1_ano4_qtd:   toNum('fund1_ano4_qtd'),
    fund1_ano4_valor: toNum('fund1_ano4_valor'),
    fund1_ano5_qtd:   toNum('fund1_ano5_qtd'),
    fund1_ano5_valor: toNum('fund1_ano5_valor'),
    tempo_contrato:   parseInt(formData.get('tempo_contrato') as string) || 1,
    created_by: user.id,
  }

  // UPSERT por escola_id
  const { data: existing } = await supabase
    .from('contratos')
    .select('id')
    .eq('escola_id', escola_id)
    .single()

  const { error } = existing
    ? await supabase.from('contratos').update(payload).eq('id', existing.id)
    : await supabase.from('contratos').insert(payload)

  if (error) throw new Error(error.message)

  revalidatePath('/comercial/contratos')
  redirect(`/comercial/contratos?escola=${escola_id}`)
}

// ─── Formulário público (sem auth) ────────────────────────────────────────────

export async function enviarFormularioPublico(formData: FormData) {
  const supabase = await createClient()

  const toNum = (k: string) => parseInt(formData.get(k) as string) || 0

  const payload = {
    email_responsavel:  formData.get('email_responsavel') as string,
    nome_escola:        formData.get('nome_escola') as string,
    cnpj:               formData.get('cnpj') as string || null,
    rua:                formData.get('rua') as string || null,
    numero:             formData.get('numero') as string || null,
    complemento:        formData.get('complemento') as string || null,
    bairro:             formData.get('bairro') as string || null,
    cidade:             formData.get('cidade') as string || null,
    estado:             formData.get('estado') as string || null,
    cep:                formData.get('cep') as string || null,
    infantil2_qtd:      toNum('infantil2_qtd'),
    infantil3_qtd:      toNum('infantil3_qtd'),
    infantil4_qtd:      toNum('infantil4_qtd'),
    infantil5_qtd:      toNum('infantil5_qtd'),
    fund1_ano1_qtd:     toNum('fund1_ano1_qtd'),
    fund1_ano2_qtd:     toNum('fund1_ano2_qtd'),
    fund1_ano3_qtd:     toNum('fund1_ano3_qtd'),
    fund1_ano4_qtd:     toNum('fund1_ano4_qtd'),
    fund1_ano5_qtd:     toNum('fund1_ano5_qtd'),
    data_inicio_letivo: formData.get('data_inicio_letivo') as string || null,
    data_fim_letivo:    formData.get('data_fim_letivo') as string || null,
    formato_ano_letivo: formData.get('formato_ano_letivo') as string || null,
    observacoes:        formData.get('observacoes') as string || null,
    legal_nome:         formData.get('legal_nome') as string || null,
    legal_cpf:          formData.get('legal_cpf') as string || null,
    legal_rg:           formData.get('legal_rg') as string || null,
    legal_orgao:        formData.get('legal_orgao') as string || null,
    legal_rua:          formData.get('legal_rua') as string || null,
    legal_numero:       formData.get('legal_numero') as string || null,
    legal_complemento:  formData.get('legal_complemento') as string || null,
    legal_bairro:       formData.get('legal_bairro') as string || null,
    legal_cidade:       formData.get('legal_cidade') as string || null,
    legal_estado:       formData.get('legal_estado') as string || null,
    legal_cep:          formData.get('legal_cep') as string || null,
    legal_email:        formData.get('legal_email') as string || null,
    legal_celular:      formData.get('legal_celular') as string || null,
    fin_nome:           formData.get('fin_nome') as string || null,
    fin_cpf:            formData.get('fin_cpf') as string || null,
    fin_rg:             formData.get('fin_rg') as string || null,
    fin_orgao:          formData.get('fin_orgao') as string || null,
    fin_email:          formData.get('fin_email') as string || null,
    fin_celular:        formData.get('fin_celular') as string || null,
    ped_nome:           formData.get('ped_nome') as string || null,
    ped_cpf:            formData.get('ped_cpf') as string || null,
    ped_rg:             formData.get('ped_rg') as string || null,
    ped_orgao:          formData.get('ped_orgao') as string || null,
    ped_email:          formData.get('ped_email') as string || null,
    ped_celular:        formData.get('ped_celular') as string || null,
  }

  const { error } = await supabase.from('formularios').insert(payload)
  if (error) throw new Error(error.message)

  redirect('/formulario/obrigado')
}

// ─── Usuários (gerente only) ─────────────────────────────────────────────────

/**
 * Cria um novo usuário no Supabase Auth + perfil no banco.
 * Usa a service role (admin client) para criar a conta.
 */
export async function criarUsuario(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'gerente') return { success: false, error: 'Apenas gerentes podem criar usuários' }

  const email    = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const role     = formData.get('role') as string || 'consultor'
  const isActive = formData.get('is_active') !== 'false'
  const phone    = formData.get('phone') as string || null
  const password = formData.get('password') as string || 'Senha@2026'   // senha temporária

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const admin = createAdminClient()

  // 1. Verificar se já existe no Auth
  const { data: lista } = await admin.auth.admin.listUsers()
  const jaExiste = lista?.users?.find(u => u.email === email)

  let userId: string

  if (jaExiste) {
    userId = jaExiste.id
    // Atualizar metadata se necessário
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: fullName },
    })
  } else {
    // Criar novo usuário no Auth
    const { data: authData, error: authErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    })
    if (authErr) return { success: false, error: authErr.message }
    userId = authData.user.id
  }

  // 2. Criar/atualizar perfil
  const { error: profileErr } = await admin.from('profiles').upsert({
    id:        userId,
    email,
    full_name: fullName,
    role,
    is_active: isActive,
    phone,
  }, { onConflict: 'id' })

  if (profileErr) return { success: false, error: profileErr.message }

  revalidatePath('/adminpanel')
  return { success: true, id: userId }
}

/**
 * Atualiza perfil de usuário existente.
 */
export async function upsertProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'gerente') return { success: false, error: 'Sem permissão' }

  const email    = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const role     = formData.get('role') as string
  const isActive = formData.get('is_active') === 'true'
  const phone    = formData.get('phone') as string || null

  // Verificar se o profile existe
  const { data: existing } = await supabase.from('profiles').select('id').eq('email', email).single()

  if (!existing) {
    // Profile não existe — redirecionar para criarUsuario
    return { success: false, error: `Usuário com e-mail "${email}" não existe. Use "Criar Novo Usuário".` }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, role, is_active: isActive, phone })
    .eq('email', email)

  if (error) return { success: false, error: error.message }
  revalidatePath('/adminpanel')
  return { success: true }
}
