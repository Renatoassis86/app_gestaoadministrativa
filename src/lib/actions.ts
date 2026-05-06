'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { calcPotencial, calcProbabilidade, calcClassificacao } from '@/types/database'

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
    qtd_infantil:       parseInt(formData.get('qtd_infantil') as string) || 0,
    qtd_fund1:          parseInt(formData.get('qtd_fund1') as string) || 0,
    qtd_fund2:          parseInt(formData.get('qtd_fund2') as string) || 0,
    qtd_medio:          parseInt(formData.get('qtd_medio') as string) || 0,
    origem_lead:        formData.get('origem_lead') as string || null,
    responsavel_id:     formData.get('responsavel_id') as string || null,
    observacoes:        formData.get('observacoes') as string || null,
    updated_by:         user.id,
  }

  if (id) {
    await supabase.from('escolas').update(payload).eq('id', id)
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
    negociacao_id:   formData.get('negociacao_id') as string || null,
    data_contato:    formData.get('data_contato') as string,
    hora_contato:    formData.get('hora_contato') as string || null,
    meio_contato:    formData.get('meio_contato') as string || 'whatsapp',
    resumo:          formData.get('resumo') as string,
    responsavel_id:  formData.get('responsavel_id') as string || user.id,
    contato_nome:    formData.get('contato_nome') as string || null,
    contato_cargo:   formData.get('contato_cargo') as string || null,
    interesse,
    prontidao,
    abertura,
    encaminhamentos: enc,
    qtd_infantil:    qtd_inf,
    qtd_fund1:       qtd_f1,
    qtd_fund2:       qtd_f2,
    qtd_medio:       qtd_med,
    potencial_financeiro: pot,
    probabilidade:   prob,
    classificacao:   cls,
    proximo_contato: formData.get('proximo_contato') as string || null,
    notas_internas:  formData.get('notas_internas') as string || null,
  }

  if (id) {
    await supabase.from('registros').update(payload).eq('id', id)
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

// ─── Tarefa ────────────────────────────────────────────────────────────────────
export async function criarTarefa(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const escola_id = formData.get('escola_id') as string
  await supabase.from('tarefas').insert({
    escola_id,
    titulo:         formData.get('titulo') as string,
    descricao:      formData.get('descricao') as string || null,
    responsavel_id: user.id,
    vencimento:     formData.get('vencimento') as string || null,
    prioridade:     formData.get('prioridade') as string || 'media',
    created_by:     user.id,
  })
  revalidatePath(`/comercial/escolas/${escola_id}`)
}

export async function concluirTarefa(id: string) {
  const supabase = await createClient()
  await supabase.from('tarefas').update({
    status: 'concluida',
    concluida_em: new Date().toISOString(),
  }).eq('id', id)
  revalidatePath('/comercial')
}

// ─── Nota ──────────────────────────────────────────────────────────────────────
export async function criarNota(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const escola_id = formData.get('escola_id') as string
  await supabase.from('notas_escola').insert({
    escola_id,
    texto:      formData.get('texto') as string,
    fixada:     formData.get('fixada') === 'true',
    created_by: user.id,
  })
  revalidatePath(`/comercial/escolas/${escola_id}`)
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
    infantil2_qtd:   toNum('infantil2_qtd'),
    infantil2_valor: toNum('infantil2_valor'),
    infantil3_qtd:   toNum('infantil3_qtd'),
    infantil3_valor: toNum('infantil3_valor'),
    infantil4_qtd:   toNum('infantil4_qtd'),
    infantil4_valor: toNum('infantil4_valor'),
    infantil5_qtd:   toNum('infantil5_qtd'),
    infantil5_valor: toNum('infantil5_valor'),
    fund1_ano1_qtd:   toNum('fund1_ano1_qtd'),
    fund1_ano1_valor: toNum('fund1_ano1_valor'),
    tempo_contrato:   parseInt(formData.get('tempo_contrato') as string) || 1,
    created_by: user.id,
  }

  // UPSERT por escola_id
  const { data: existing } = await supabase
    .from('contratos').select('id').eq('escola_id', escola_id).single()

  if (existing) {
    await supabase.from('contratos').update(payload).eq('id', existing.id)
  } else {
    await supabase.from('contratos').insert(payload)
  }

  revalidatePath('/comercial/contratos')
  redirect(`/comercial/contratos?escola=${escola_id}`)
}

// ─── Formulário público (sem auth) ────────────────────────────────────────────
export async function enviarFormularioPublico(formData: FormData) {
  const supabase = await createClient()

  const toNum = (k: string) => parseInt(formData.get(k) as string) || 0

  const payload = {
    email_responsavel: formData.get('email_responsavel') as string,
    nome_escola:       formData.get('nome_escola') as string,
    cnpj:              formData.get('cnpj') as string || null,
    rua:               formData.get('rua') as string || null,
    numero:            formData.get('numero') as string || null,
    complemento:       formData.get('complemento') as string || null,
    bairro:            formData.get('bairro') as string || null,
    cidade:            formData.get('cidade') as string || null,
    estado:            formData.get('estado') as string || null,
    cep:               formData.get('cep') as string || null,
    infantil2_qtd:     toNum('infantil2_qtd'),
    infantil3_qtd:     toNum('infantil3_qtd'),
    infantil4_qtd:     toNum('infantil4_qtd'),
    infantil5_qtd:     toNum('infantil5_qtd'),
    fund1_ano1_qtd:    toNum('fund1_ano1_qtd'),
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

// ─── Usuários (gerente only) ────────────────────────────────────────────────
export async function upsertProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'gerente') throw new Error('Sem permissão')

  const email    = formData.get('email') as string
  const fullName = formData.get('full_name') as string
  const role     = formData.get('role') as string
  const isActive = formData.get('is_active') === 'true'
  const phone    = formData.get('phone') as string || null

  // Atualiza o perfil se já existe
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, role, is_active: isActive, phone })
    .eq('email', email)

  if (error) throw new Error(error.message)
  revalidatePath('/adminpanel')
}
