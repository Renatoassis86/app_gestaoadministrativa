'use server'

import { revalidatePath } from 'next/cache'
import * as XLSX from 'xlsx'
import { createAdminClient } from '@/lib/supabase/admin'
import { CAMPOS, calcularPreenchimento, campoPorChave } from '@/lib/eskolare-campos'
import { validarValor, soDigitos } from '@/lib/eskolare-validacao'
import { gerarPin, gerarToken, hashPin } from '@/lib/eskolare-seguranca'
import { exigirComercial, linkFicha, registrarEvento, situacaoInicial } from '@/lib/eskolare-servidor'
import { montarPrefill } from '@/lib/eskolare-prefill'

export interface Resultado { ok: boolean; error?: string; id?: string; link?: string; pin?: string; erros?: Record<string, string>; importadas?: number }

const NEGADO: Resultado = { ok: false, error: 'Sessão expirada ou sem permissão. Entre novamente.' }
const RESPONSAVEIS = ['Raissa', 'Jesse']

async function carregar(admin: ReturnType<typeof createAdminClient>, id: string) {
  const { data } = await admin.from('eskolare_fichas').select('*').eq('id', id).maybeSingle()
  return data
}

// Exclui a ficha (e seu histórico). A logo enviada pela escola também é removida do armazenamento.
export async function excluirFicha(id: string): Promise<Resultado> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const admin = createAdminClient()
  const f = await carregar(admin, id)
  if (!f) return { ok: false, error: 'Ficha não encontrada.' }
  // rascunhos (ainda não respondidos pela escola) qualquer pessoa do comercial exclui; respostas já enviadas só gerente/supervisor
  if (['respondida', 'validada', 'cadastrada'].includes(f.status) && u.role !== 'gerente' && u.role !== 'supervisor')
    return { ok: false, error: 'Esta ficha já foi respondida pela escola. Só gerente ou supervisor pode excluí-la.' }
  const { data: e } = await admin.from('escolas').select('nome').eq('id', f.escola_id).maybeSingle()
  if (f.dados?.logo) await admin.storage.from('eskolare-logos').remove([f.dados.logo])
  const { error } = await admin.from('eskolare_fichas').delete().eq('id', id)
  if (error) return { ok: false, error: `Não foi possível excluir: ${error.message}` }
  // o histórico da própria ficha some junto; o CRM guarda o registro da exclusão
  await admin.from('registros').insert({ escola_id: f.escola_id, meio_contato: 'outro', responsavel_id: u.user.id,
    resumo: `[Cadastro Eskolare ${f.ciclo}] Ficha excluída por ${u.nome || 'usuário do comercial'} (status: ${f.status}, ${f.pct_preenchido}% preenchido).` })
  revalidatePath('/comercial/cadastro-eskolare')
  return { ok: true, id, error: e?.nome }
}

// Prévia: o que a plataforma já sabe da escola, e de onde veio cada dado, antes de criar a ficha.
export async function previaPrefill(escolaId: string, ciclo: number): Promise<{ ok: boolean; error?: string; itens?: Array<{ chave: string; rotulo: string; valor: string; fonte: string }>; faltam?: string[] }> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const admin = createAdminClient()
  const { valores, fontes } = await montarPrefill(admin, escolaId, ciclo)
  const itens = CAMPOS.filter(c => valores[c.chave]).map(c => ({ chave: c.chave, rotulo: c.rotulo, valor: c.tipo === 'cpf' && u.role !== 'gerente' ? '•••' : valores[c.chave], fonte: fontes[c.chave] }))
  return { ok: true, itens, faltam: calcularPreenchimento(valores).faltando }
}

// Busca de novo nas fontes da plataforma e preenche só o que está em branco (nunca sobrescreve nada).
export async function atualizarDaPlataforma(id: string): Promise<Resultado & { preenchidos?: number }> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const admin = createAdminClient()
  const f = await carregar(admin, id); if (!f) return { ok: false, error: 'Ficha não encontrada.' }
  if (['respondida', 'validada', 'cadastrada'].includes(f.status)) return { ok: false, error: 'Esta ficha já foi respondida. Reabra a ficha antes de buscar dados novos.' }
  const { valores, fontes } = await montarPrefill(admin, f.escola_id, f.ciclo)
  const pre = { ...(f.pre ?? {}) }, dados = { ...(f.dados ?? {}) }, sit = { ...(f.situacao ?? {}) }, fon = { ...(f.fontes ?? {}) }
  let preenchidos = 0
  for (const [k, v] of Object.entries(valores)) {
    if ((dados[k] ?? '').toString().trim() !== '') continue
    pre[k] = v; dados[k] = v; sit[k] = 'pre'; fon[k] = fontes[k]; preenchidos++
  }
  if (preenchidos) {
    await admin.from('eskolare_fichas').update({ pre, dados, situacao: sit, fontes: fon, pct_preenchido: calcularPreenchimento(dados).pct }).eq('id', id)
    await registrarEvento(admin, f, 'campo', 'comercial', { atualizados_da_plataforma: preenchidos })
  }
  revalidatePath(`/comercial/cadastro-eskolare/${id}`)
  return { ok: true, preenchidos }
}

export async function criarFicha(escolaId: string, ciclo: number, responsavel: string): Promise<Resultado> {
  const u = await exigirComercial(); if (!u) return NEGADO
  if (!escolaId) return { ok: false, error: 'Escolha a escola.' }
  if (!RESPONSAVEIS.includes(responsavel)) return { ok: false, error: 'Escolha o responsável comercial (Raissa ou Jesse).' }
  const admin = createAdminClient()

  const { data: existente } = await admin.from('eskolare_fichas').select('id').eq('escola_id', escolaId).eq('ciclo', ciclo).maybeSingle()
  if (existente) return { ok: false, error: `Esta escola já tem ficha de ${ciclo}.`, id: existente.id }

  const { valores: pre, fontes } = await montarPrefill(admin, escolaId, ciclo)
  const dados = { ...pre }
  const { data: ficha, error } = await admin.from('eskolare_fichas').insert({
    escola_id: escolaId, ciclo, responsavel_comercial: responsavel, pre, dados, fontes, situacao: situacaoInicial(pre),
    pct_preenchido: calcularPreenchimento(dados).pct, created_by: u.user.id,
  }).select('id, escola_id, ciclo').single()
  if (error || !ficha) return { ok: false, error: `Não foi possível criar a ficha: ${error?.message}` }

  await registrarEvento(admin, ficha, 'criada', 'comercial', { campos_pre_preenchidos: Object.keys(pre).length },
    { resumo: `Ficha criada (${Object.keys(pre).length} campos pré-preenchidos).`, responsavelId: u.user.id })
  revalidatePath('/comercial/cadastro-eskolare')
  return { ok: true, id: ficha.id }
}

// Edição interna. Se a escola ainda não mexeu no campo, atualiza o pré-preenchido; senão, só o valor atual.
export async function salvarCamposInternos(id: string, patch: Record<string, string>, extras?: { responsavel?: string; obs?: string }): Promise<Resultado> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const admin = createAdminClient()
  const f = await carregar(admin, id)
  if (!f) return { ok: false, error: 'Ficha não encontrada.' }

  const pre = { ...(f.pre ?? {}) }, dados = { ...(f.dados ?? {}) }, sit = { ...(f.situacao ?? {}) }
  const erros: Record<string, string> = {}
  const mudou: Record<string, { de: string; para: string }> = {}

  for (const [chave, bruto] of Object.entries(patch)) {
    const c = campoPorChave(chave)
    if (!c || c.tipo === 'calculado' || c.tipo === 'logo') continue
    if (c.tipo === 'cpf' && u.role !== 'gerente') continue            // CPF completo só é visto/editado por gerente
    const r = validarValor(c.tipo, bruto, c.opcoes)
    if (r.erro) { erros[chave] = r.erro; continue }
    const novo = r.valor ?? ''
    if ((dados[chave] ?? '') === novo) continue
    mudou[chave] = { de: dados[chave] ?? '', para: novo }
    dados[chave] = novo
    const tocadaPelaEscola = ['confirmado', 'corrigido', 'preenchido_escola'].includes(sit[chave])
    if (!tocadaPelaEscola) { pre[chave] = novo; sit[chave] = novo ? 'pre' : 'branco' }
  }
  if (Object.keys(erros).length) return { ok: false, error: 'Corrija os campos destacados.', erros }

  const upd: Record<string, any> = { pre, dados, situacao: sit, pct_preenchido: calcularPreenchimento(dados).pct, ultima_resposta_por: 'comercial' }
  if (extras?.responsavel && RESPONSAVEIS.includes(extras.responsavel)) upd.responsavel_comercial = extras.responsavel
  if (extras?.obs !== undefined) upd.obs_comercial = extras.obs || null
  const { error } = await admin.from('eskolare_fichas').update(upd).eq('id', id)
  if (error) return { ok: false, error: error.message }
  if (Object.keys(mudou).length) await registrarEvento(admin, f, 'campo', 'comercial', { campos: mudou })
  revalidatePath(`/comercial/cadastro-eskolare/${id}`)
  return { ok: true }
}

// Gera (ou renova) o acesso. O PIN só é devolvido aqui, uma única vez.
export async function gerarAcesso(id: string, novoLink = false): Promise<Resultado> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const admin = createAdminClient()
  const f = await carregar(admin, id)
  if (!f) return { ok: false, error: 'Ficha não encontrada.' }
  if (['validada', 'cadastrada'].includes(f.status)) return { ok: false, error: 'Ficha já validada: reabra antes de gerar novo acesso.' }

  const token = novoLink || !f.token || f.link_revogado ? gerarToken() : f.token
  const pin = gerarPin()
  const upd: Record<string, any> = {
    token, pin_hash: hashPin(pin), tentativas: 0, bloqueado_ate: null, link_revogado: false,
    sessao_hash: null, sessao_expira: null,        // invalida qualquer sessão aberta com o PIN anterior
  }
  const primeira = !f.enviada_em
  if (f.status === 'rascunho') { upd.status = 'enviada'; upd.enviada_em = new Date().toISOString() }
  const { error } = await admin.from('eskolare_fichas').update(upd).eq('id', id)
  if (error) return { ok: false, error: error.message }

  await registrarEvento(admin, f, primeira ? 'enviada' : 'pin_regenerado', 'comercial', { novoLink },
    primeira ? { resumo: 'Link e PIN gerados e enviados à escola.', responsavelId: u.user.id } : undefined)
  revalidatePath(`/comercial/cadastro-eskolare/${id}`); revalidatePath('/comercial/cadastro-eskolare')
  return { ok: true, link: linkFicha(token), pin }
}

export async function revogarAcesso(id: string): Promise<Resultado> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const admin = createAdminClient()
  const f = await carregar(admin, id); if (!f) return { ok: false, error: 'Ficha não encontrada.' }
  const { error } = await admin.from('eskolare_fichas').update({ link_revogado: true, sessao_hash: null, sessao_expira: null }).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await registrarEvento(admin, f, 'revogada', 'comercial')
  revalidatePath(`/comercial/cadastro-eskolare/${id}`)
  return { ok: true }
}

async function mudarStatus(id: string, para: 'validada' | 'cadastrada' | 'em_preenchimento', tipo: 'validada' | 'cadastrada' | 'reaberta', texto: string, deDe: string[]): Promise<Resultado> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const admin = createAdminClient()
  const f = await carregar(admin, id); if (!f) return { ok: false, error: 'Ficha não encontrada.' }
  if (!deDe.includes(f.status)) return { ok: false, error: 'Esta ação não está disponível no status atual da ficha.' }
  const upd: Record<string, any> = { status: para }
  const agora = new Date().toISOString()
  if (para === 'validada') upd.validada_em = agora
  if (para === 'cadastrada') upd.cadastrada_em = agora
  if (para === 'em_preenchimento') { upd.respondida_em = null; upd.validada_em = null; upd.cadastrada_em = null }
  const { error } = await admin.from('eskolare_fichas').update(upd).eq('id', id)
  if (error) return { ok: false, error: error.message }
  await registrarEvento(admin, f, tipo, 'comercial', {}, { resumo: texto, responsavelId: u.user.id })
  revalidatePath(`/comercial/cadastro-eskolare/${id}`); revalidatePath('/comercial/cadastro-eskolare')
  return { ok: true }
}
export async function validarFicha(id: string) { return mudarStatus(id, 'validada', 'validada', 'Ficha validada pelo comercial.', ['respondida']) }
export async function marcarCadastrada(id: string) { return mudarStatus(id, 'cadastrada', 'cadastrada', 'Escola cadastrada na Eskolare.', ['validada']) }
export async function reabrirFicha(id: string) { return mudarStatus(id, 'em_preenchimento', 'reaberta', 'Ficha reaberta para a escola corrigir.', ['respondida', 'validada', 'cadastrada']) }

// Importa a aba "Cadastro" da planilha oficial: cria/atualiza fichas pelo CNPJ (ignora a linha de exemplo).
export async function importarPlanilha(formData: FormData): Promise<Resultado> {
  const u = await exigirComercial(); if (!u) return NEGADO
  const arquivo = formData.get('arquivo') as File | null
  if (!arquivo || arquivo.size === 0) return { ok: false, error: 'Escolha o arquivo .xlsx.' }
  if (arquivo.size > 5 * 1024 * 1024) return { ok: false, error: 'Arquivo acima de 5 MB.' }
  const ciclo = Number(formData.get('ciclo')) || 2027

  let linhas: any[][]
  try {
    const wb = XLSX.read(Buffer.from(await arquivo.arrayBuffer()), { type: 'buffer' })
    const ws = wb.Sheets['Cadastro']
    if (!ws) return { ok: false, error: 'A planilha precisa ter a aba "Cadastro".' }
    linhas = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][]
  } catch { return { ok: false, error: 'Não foi possível ler a planilha.' } }

  // Colunas: Nº, Status, %, Responsável, depois os campos na ordem de CAMPOS (logo e total são ignorados no import)
  const chaves = CAMPOS.filter(c => !c.interno).map(c => c.chave)
  const admin = createAdminClient()
  const escolas: { id: string; cnpj: string | null }[] = []
  for (let de = 0; ; de += 1000) {                    // PostgREST limita a 1000 linhas por consulta
    const { data: pg } = await admin.from('escolas').select('id, cnpj').order('id').range(de, de + 999)
    escolas.push(...(pg ?? []))
    if (!pg || pg.length < 1000) break
  }
  let importadas = 0
  const avisos: string[] = []

  for (let i = 4; i < linhas.length; i++) {          // linhas 1-4 são título/grupos/cabeçalho
    const l = linhas[i]
    if (String(l[0]).trim().toLowerCase() === 'ex.') continue
    let cnpj = soDigitos(l[4])
    if (cnpj.length >= 11 && cnpj.length < 14) cnpj = cnpj.padStart(14, '0')   // Excel remove zeros à esquerda
    if (cnpj.length !== 14) { if (String(l[4] ?? '').trim()) avisos.push(`Linha ${i + 1}: CNPJ "${l[4]}" inválido, linha ignorada`); continue }
    const escola = escolas.find(e => soDigitos(e.cnpj) === cnpj)
    if (!escola) { avisos.push(`CNPJ ${l[4]}: escola não encontrada no CRM`); continue }

    const valores: Record<string, string> = {}
    chaves.forEach((k, idx) => {
      const c = campoPorChave(k)!
      if (c.tipo === 'calculado' || c.tipo === 'logo') return
      let bruto = l[4 + idx]
      if (bruto === '' || bruto == null) return
      if (c.tipo === 'cep' && typeof bruto === 'number') bruto = String(bruto).padStart(8, '0')
      const r = validarValor(c.tipo, bruto, c.opcoes)
      if (r.valor) valores[k] = r.valor
    })
    const resp = RESPONSAVEIS.includes(String(l[3])) ? String(l[3]) : null

    let f = (await admin.from('eskolare_fichas').select('*').eq('escola_id', escola.id).eq('ciclo', ciclo).maybeSingle()).data
    if (!f) {
      const auto = await montarPrefill(admin, escola.id, ciclo)
      const pre = { ...auto.valores, ...valores }
      const { data: nova } = await admin.from('eskolare_fichas').insert({
        escola_id: escola.id, ciclo, responsavel_comercial: resp, pre, dados: pre, fontes: auto.fontes, situacao: situacaoInicial(pre),
        pct_preenchido: calcularPreenchimento(pre).pct, created_by: u.user.id,
      }).select('*').single()
      f = nova
    } else if (['respondida', 'validada', 'cadastrada'].includes(f.status)) {
      avisos.push(`${escola.cnpj}: ficha já ${f.status}, não sobrescrita (reabra a ficha para importar)`)
      continue
    } else {
      const pre = { ...f.pre, ...valores }, dados = { ...f.dados, ...valores }, sit = { ...f.situacao }
      for (const k of Object.keys(valores)) if (!['confirmado', 'corrigido', 'preenchido_escola'].includes(sit[k])) sit[k] = 'pre'
      await admin.from('eskolare_fichas').update({ pre, dados, situacao: sit, pct_preenchido: calcularPreenchimento(dados).pct, ...(resp ? { responsavel_comercial: resp } : {}) }).eq('id', f.id)
    }
    if (f) { await registrarEvento(admin, f, 'importada', 'comercial', { campos: Object.keys(valores).length }); importadas++ }
  }
  revalidatePath('/comercial/cadastro-eskolare')
  return { ok: true, importadas, error: avisos.length ? avisos.join('; ') : undefined }
}

