'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { soDigitos } from '@/lib/contratos'

export interface ContratoResult { ok: boolean; error?: string; escolaId?: string }

const txt = (f: FormData, k: string) => {
  const v = (f.get(k) as string | null)?.trim()
  return v ? v : null
}
const num = (f: FormData, k: string) => {
  const v = (f.get(k) as string | null)?.replace(/\./g, '').replace(',', '.').trim()
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}
const int = (f: FormData, k: string) => { const n = num(f, k); return n == null ? null : Math.round(n) }
const dat = (f: FormData, k: string) => txt(f, k)

export async function salvarContrato(formData: FormData): Promise<ContratoResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sessão expirada. Entre novamente.' }

  // ── 1. Escola (existente ou nova) ──────────────────────────────────────────
  let escolaId = txt(formData, 'escola_id')
  const razao = txt(formData, 'razao_social')
  const cnpjDigitos = soDigitos(txt(formData, 'cnpj'))

  const escolaCampos = {
    razao_social: razao,
    nome_fantasia: txt(formData, 'nome_fantasia'),
    cnae: txt(formData, 'cnae'),
    registro_mec: txt(formData, 'registro_mec'),
    rua: txt(formData, 'rua'), numero: txt(formData, 'numero'), complemento: txt(formData, 'complemento'),
    bairro: txt(formData, 'bairro'), cidade: txt(formData, 'cidade'),
    estado: txt(formData, 'estado')?.toUpperCase().slice(0, 2) ?? null,
    cep: txt(formData, 'cep') ? soDigitos(txt(formData, 'cep')) : null,
    veterana: formData.get('veterana') === 'on',
  }

  if (!escolaId) {
    if (!razao) return { ok: false, error: 'Informe a razão social da nova escola.' }
    if (cnpjDigitos.length !== 14) return { ok: false, error: 'CNPJ inválido: informe os 14 dígitos.' }
    const { data: dup } = await supabase.from('escolas').select('id, nome, cnpj')
    const repetida = (dup ?? []).find(e => soDigitos(e.cnpj) === cnpjDigitos)
    if (repetida) {
      return { ok: false, error: `Já existe escola com este CNPJ: "${repetida.nome}". Selecione-a na lista em vez de criar outra.` }
    }
    const { data: nova, error } = await supabase.from('escolas')
      .insert({ nome: txt(formData, 'nome_fantasia') ?? razao, cnpj: cnpjDigitos, ...escolaCampos, created_by: user.id })
      .select('id').single()
    if (error || !nova) return { ok: false, error: `Não foi possível criar a escola: ${error?.message}` }
    escolaId = nova.id
  } else {
    const upd: Record<string, any> = { ...escolaCampos }
    for (const k of Object.keys(upd)) if (upd[k] === null) delete upd[k]   // não apaga o que já existe no CRM
    if (cnpjDigitos.length === 14) upd.cnpj = cnpjDigitos
    if (Object.keys(upd).length) {
      const { error } = await supabase.from('escolas').update(upd).eq('id', escolaId)
      if (error) return { ok: false, error: `Não foi possível atualizar a escola: ${error.message}` }
    }
  }

  // ── 2. Contrato ────────────────────────────────────────────────────────────
  const modalidade = txt(formData, 'modalidade')
  if (modalidade !== 'boleto' && modalidade !== 'eskolare') return { ok: false, error: 'Escolha o modelo: Boleto ou Eskolare.' }
  const status = txt(formData, 'status') ?? 'rascunho'

  const contrato: Record<string, any> = {
    escola_id: escolaId, modalidade, status,
    marcado_veterana: formData.get('veterana') === 'on',
    // Só liga as etapas do funil existente (Jornada Contratual); nunca desliga o que já foi marcado lá.
    ...(['enviado', 'assinado', 'arquivado'].includes(status) ? { contrato_enviado: true } : {}),
    ...(['assinado', 'arquivado'].includes(status) ? { contrato_assinado: true } : {}),
    ...(status === 'arquivado' ? { contrato_arquivado: true } : {}),
    ...(['minuta_enviada', 'em_revisao', 'enviado', 'assinado', 'arquivado'].includes(status) ? { minuta_enviada: true } : {}),

    legal_nome: txt(formData, 'legal_nome'), legal_cpf: soDigitos(txt(formData, 'legal_cpf')) || null,
    legal_rg: txt(formData, 'legal_rg'), legal_cargo: txt(formData, 'legal_cargo'),
    legal_email: txt(formData, 'legal_email'), legal_telefone: soDigitos(txt(formData, 'legal_telefone')) || null,
    legal_cep: soDigitos(txt(formData, 'legal_cep')) || null, legal_endereco_texto: txt(formData, 'legal_endereco_texto'),
    poderes_documento: txt(formData, 'poderes_documento'),

    pedagogico_nome: txt(formData, 'pedagogico_nome'), pedagogico_cargo: txt(formData, 'pedagogico_cargo'),
    pedagogico_email: txt(formData, 'pedagogico_email'), pedagogico_telefone: soDigitos(txt(formData, 'pedagogico_telefone')) || null,
    financeiro_nome: txt(formData, 'financeiro_nome'), financeiro_cargo: txt(formData, 'financeiro_cargo'),
    financeiro_email: txt(formData, 'financeiro_email'), financeiro_telefone: soDigitos(txt(formData, 'financeiro_telefone')) || null,

    ano_letivo_inicial: int(formData, 'ano_letivo_inicial'), ano_letivo_final: int(formData, 'ano_letivo_final'),
    letivo_inicio: dat(formData, 'letivo_inicio'), letivo_fim: dat(formData, 'letivo_fim'),
    formato_calendario: txt(formData, 'formato_calendario'),
    qtd_responsaveis: int(formData, 'qtd_responsaveis'), qtd_alunos_estimado: int(formData, 'qtd_alunos_estimado'),
    qtd_professores: int(formData, 'qtd_professores'), qtd_coordenadores: int(formData, 'qtd_coordenadores'),

    vigencia_inicio: dat(formData, 'vigencia_inicio'), vigencia_fim: dat(formData, 'vigencia_fim'),
    data_assinatura: dat(formData, 'data_assinatura'),
    valor_total: num(formData, 'valor_total'),
    valor_anos_seguintes_texto: txt(formData, 'valor_anos_seguintes_texto'),
    desconto_bonificacao: txt(formData, 'desconto_bonificacao'),

    forma_pagamento: txt(formData, 'forma_pagamento'),
    num_parcelas: modalidade === 'boleto' ? int(formData, 'num_parcelas') : null,
    valor_parcela: modalidade === 'boleto' ? num(formData, 'valor_parcela') : null,
    primeiro_vencimento: modalidade === 'boleto' ? dat(formData, 'primeiro_vencimento') : null,
    primeiro_vencimento_texto: txt(formData, 'primeiro_vencimento_texto'),
    dia_vencimento: modalidade === 'boleto' ? int(formData, 'dia_vencimento') : null,

    parcelas_max_cartao: modalidade === 'eskolare' ? int(formData, 'parcelas_max_cartao') : null,
    repasse_tipo: modalidade === 'eskolare' ? txt(formData, 'repasse_tipo') : null,
    repasse_valor: modalidade === 'eskolare' ? num(formData, 'repasse_valor') : null,
    repasse_pct: modalidade === 'eskolare' ? num(formData, 'repasse_pct') : null,
    nota_fiscal_repasse: modalidade === 'eskolare' ? formData.get('nota_fiscal_repasse') === 'on' : null,

    banco: txt(formData, 'banco'), agencia: txt(formData, 'agencia'), conta: txt(formData, 'conta'),
    tipo_conta: txt(formData, 'tipo_conta'), titular: txt(formData, 'titular'),
    titular_documento: txt(formData, 'titular_documento'), chave_pix: txt(formData, 'chave_pix'),

    assinatura_email: txt(formData, 'assinatura_email'),
    testemunha1_nome: txt(formData, 'testemunha1_nome'), testemunha1_cpf: soDigitos(txt(formData, 'testemunha1_cpf')) || null,
    testemunha2_nome: txt(formData, 'testemunha2_nome'), testemunha2_cpf: soDigitos(txt(formData, 'testemunha2_cpf')) || null,

    drive_contrato_url: txt(formData, 'drive_contrato_url'),
    clausulas_especiais: txt(formData, 'clausulas_especiais'), observacoes: txt(formData, 'observacoes'),
  }

  const { data: salvo, error: errC } = await supabase.from('contratos')
    .upsert(contrato, { onConflict: 'escola_id' }).select('id').single()
  if (errC || !salvo) return { ok: false, error: `Não foi possível salvar o contrato: ${errC?.message}` }

  // ── 3. Quantidades e preços por série (ano letivo inicial) ─────────────────
  try {
    const linhas = JSON.parse((formData.get('series_json') as string) || '[]') as Array<{
      ano_letivo: number; serie: string; tipo_kit: string; quantidade: number; valor_unitario: number | null; curriculo?: string
    }>
    const ano = contrato.ano_letivo_inicial
    if (ano) {
      const { error: delErr } = await supabase.from('contratos_series').delete().eq('contrato_id', salvo.id).eq('ano_letivo', ano)
      if (delErr) return { ok: false, error: `Erro ao atualizar séries: ${delErr.message}` }
      const novas = linhas.filter(l => l.quantidade > 0).map(l => ({
        contrato_id: salvo.id, ano_letivo: ano, serie: l.serie, tipo_kit: l.tipo_kit || 'completo',
        quantidade: Math.round(l.quantidade), valor_unitario: l.valor_unitario, curriculo: l.curriculo ?? null,
      }))
      if (novas.length) {
        const { error: insErr } = await supabase.from('contratos_series').insert(novas)
        if (insErr) return { ok: false, error: `Erro ao gravar séries: ${insErr.message}` }
      }
    }
  } catch {
    return { ok: false, error: 'Quantidades por série em formato inválido.' }
  }

  revalidatePath('/contratos', 'layout')
  return { ok: true, escolaId: escolaId! }
}

export async function criarAditivo(formData: FormData): Promise<ContratoResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Sessão expirada.' }
  const escolaId = txt(formData, 'escola_id'); const titulo = txt(formData, 'titulo')
  if (!escolaId || !titulo) return { ok: false, error: 'Informe o título do aditivo.' }
  const { data: c } = await supabase.from('contratos').select('id').eq('escola_id', escolaId).maybeSingle()
  const { error } = await supabase.from('contratos_aditivos').insert({
    escola_id: escolaId, contrato_id: c?.id ?? null, titulo, resumo: txt(formData, 'resumo'),
    data_assinatura: dat(formData, 'data_assinatura'), assinado: formData.get('assinado') === 'on',
    drive_url: txt(formData, 'drive_url'), created_by: user.id,
  })
  if (error) return { ok: false, error: error.message }
  revalidatePath('/contratos', 'layout')
  return { ok: true, escolaId }
}

export async function removerAditivo(id: string): Promise<ContratoResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('contratos_aditivos').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/contratos', 'layout')
  return { ok: true }
}
