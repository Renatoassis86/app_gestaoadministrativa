import { campoPorChave } from '@/lib/eskolare-campos'
import { soDigitos, validarValor } from '@/lib/eskolare-validacao'
import type { Admin } from '@/lib/eskolare-servidor'

export interface Prefill { valores: Record<string, string>; fontes: Record<string, string> }

const F = {
  escola: 'Cadastro da escola (CRM)',
  contatos: 'Contatos da escola',
  contrato: 'Contrato Education',
  paideia: 'Formulário Paideia',
  bilingue: 'Formulário Bilinguismo',
  pedidos: 'Previsão de pedidos',
  ciecc: 'Base CIECC',
  leads: 'Banco de leads',
}

const SERIES: Array<[string, string]> = [   // [chave da ficha, id da série]
  ['al_inf2', 'infantil2'], ['al_inf3', 'infantil3'], ['al_inf4', 'infantil4'], ['al_inf5', 'infantil5'],
  ['al_ano1', 'fund1_ano1'], ['al_ano2', 'fund1_ano2'], ['al_ano3', 'fund1_ano3'], ['al_ano4', 'fund1_ano4'], ['al_ano5', 'fund1_ano5'],
]
const COL_ESCOLA: Record<string, string> = {
  infantil2: 'qtd_infantil2', infantil3: 'qtd_infantil3', infantil4: 'qtd_infantil4', infantil5: 'qtd_infantil5',
  fund1_ano1: 'qtd_fund1_ano1', fund1_ano2: 'qtd_fund1_ano2', fund1_ano3: 'qtd_fund1_ano3', fund1_ano4: 'qtd_fund1_ano4', fund1_ano5: 'qtd_fund1_ano5',
}

// Junta tudo o que a plataforma já sabe da escola. A ordem das chamadas `por` define a prioridade:
// a primeira fonte com valor válido vence; as demais só preenchem o que ficou em branco.
export async function montarPrefill(admin: Admin, escolaId: string, ciclo: number): Promise<Prefill> {
  const valores: Record<string, string> = {}, fontes: Record<string, string> = {}
  const por = (chave: string, bruto: unknown, fonte: string) => {
    if (valores[chave]) return
    const c = campoPorChave(chave)
    if (!c || bruto == null || String(bruto).trim() === '') return
    const r = validarValor(c.tipo, bruto, c.opcoes)
    if (r.valor) { valores[chave] = r.valor; fontes[chave] = fonte }     // valor inválido no CRM é ignorado: a escola informa
  }

  const { data: e } = await admin.from('escolas').select('*').eq('id', escolaId).maybeSingle()
  if (!e) return { valores, fontes }
  const dig = soDigitos(e.cnpj)
  const mesma = (cnpj: unknown) => dig.length === 14 && soDigitos(cnpj) === dig

  const [contrato, contatos, bil, forms, pedidos, ciecc, leads] = await Promise.all([
    admin.from('contratos').select('*').eq('escola_id', escolaId).maybeSingle(),
    admin.from('contatos_escola').select('*').eq('escola_id', escolaId).eq('ativa', true).order('principal', { ascending: false }),
    admin.from('formularios_bilinguismo').select('*').eq('escola_id', escolaId).order('data_envio', { ascending: false }).limit(1),
    admin.from('formularios').select('*').order('data_envio', { ascending: false }).limit(2000),
    admin.from('previsoes_pedidos').select('*').eq('ano_letivo', ciclo).order('created_at', { ascending: false }).limit(2000),
    admin.from('ciecc_escolas').select('*').or(`escola_id.eq.${escolaId}`).limit(1),
    admin.from('leads_escola').select('*').eq('escola_crm_id', escolaId).limit(1),
  ])
  const c = contrato.data
  const ct = contatos.data?.[0]
  const b = bil.data?.[0]
  const p = (forms.data ?? []).find((x: any) => mesma(x.cnpj))                       // pré-cadastro Paideia (sem escola_id: casa por CNPJ)
  const pr = (pedidos.data ?? []).find((x: any) => x.escola_id === escolaId || mesma(x.cnpj))
  const ci = ciecc.data?.[0], ld = leads.data?.[0]
  // leads_contato_escola aponta para leads_escola(id), não para escolas(id)
  const lc = ld?.id ? (await admin.from('leads_contato_escola').select('*').eq('escola_id', ld.id).order('ordem').limit(1)).data?.[0] : undefined

  let series: any[] = []
  if (c?.id) series = (await admin.from('contratos_series').select('serie, quantidade, tipo_kit').eq('contrato_id', c.id).eq('ano_letivo', c.ano_letivo_inicial ?? ciclo)).data ?? []

  // 1. Identificação
  por('cnpj', e.cnpj, F.escola); por('cnpj', p?.cnpj, F.paideia); por('cnpj', pr?.cnpj, F.pedidos); por('cnpj', ci?.cnpj, F.ciecc); por('cnpj', ld?.cnpj, F.leads)
  por('razao_social', e.razao_social, F.escola); por('razao_social', pr?.nome_instituicao, F.pedidos); por('razao_social', p?.nome_escola, F.paideia)
  por('razao_social', b?.nome_escola, F.bilingue); por('razao_social', e.nome, F.escola)
  por('nome_loja', e.nome_fantasia, F.escola); por('nome_loja', b?.nome_fantasia, F.bilingue); por('nome_loja', e.nome, F.escola)
  for (const [org, fonte] of [[e, F.escola], [p, F.paideia], [b, F.bilingue]] as const) {
    if (!org) continue
    por('cep', org.cep, fonte)
    por('rua_numero', [org.rua, org.numero].filter(Boolean).join(', '), fonte)
    por('bairro', org.bairro, fonte)
    por('cidade_uf', org.cidade && (org.estado) ? `${String(org.cidade).trim()} / ${org.estado}` : null, fonte)
    por('complemento', org.complemento, fonte)
  }
  if (ci) { por('cep', ci.cep, F.ciecc); por('bairro', ci.bairro, F.ciecc); por('rua_numero', ci.endereco, F.ciecc); por('cidade_uf', ci.cidade && ci.uf ? `${ci.cidade} / ${ci.uf}` : null, F.ciecc) }
  if (ld) { por('cep', ld.cep, F.leads); por('bairro', ld.bairro, F.leads); por('rua_numero', ld.endereco, F.leads); por('cidade_uf', ld.cidade && ld.uf ? `${ld.cidade} / ${ld.uf}` : null, F.leads) }
  if (pr) por('rua_numero', pr.endereco, F.pedidos)

  // 2. Responsável pela parceria
  por('parc_nome', e.contato_nome, F.escola); por('parc_cargo', e.contato_cargo, F.escola); por('parc_email', e.email, F.escola); por('parc_whatsapp', e.telefone, F.escola)
  if (ct) { por('parc_nome', ct.nome, F.contatos); por('parc_cargo', ct.cargo, F.contatos); por('parc_email', ct.email, F.contatos); por('parc_whatsapp', ct.whatsapp || ct.phone, F.contatos) }
  if (c) { por('parc_nome', c.legal_nome, F.contrato); por('parc_cargo', c.legal_cargo, F.contrato); por('parc_email', c.legal_email, F.contrato); por('parc_whatsapp', c.legal_telefone, F.contrato) }
  if (p) { por('parc_nome', p.legal_nome, F.paideia); por('parc_email', p.legal_email, F.paideia); por('parc_whatsapp', p.legal_celular, F.paideia) }
  if (b) { por('parc_nome', b.nome_representante_legal, F.bilingue); por('parc_cargo', b.legal_cargo, F.bilingue); por('parc_email', b.legal_email, F.bilingue); por('parc_whatsapp', b.legal_celular, F.bilingue) }
  if (pr) por('parc_nome', pr.representante_legal, F.pedidos)
  if (ci) { por('parc_nome', ci.representante_legal, F.ciecc); por('parc_email', ci.email_representante, F.ciecc); por('parc_whatsapp', ci.telefone_representante, F.ciecc) }
  if (lc) { por('parc_nome', lc.nome, F.contatos); por('parc_cargo', lc.cargo, F.contatos); por('parc_email', lc.email, F.contatos); por('parc_whatsapp', lc.telefone, F.contatos) }
  if (ld) { por('parc_nome', ld.rep_legal_nome, F.leads); por('parc_email', ld.rep_legal_email, F.leads); por('parc_whatsapp', ld.rep_legal_tel, F.leads) }

  // 4. Treinamento (quem preencheu a previsão de pedidos / o pré-cadastro costuma ser o contato do dia a dia)
  if (pr) { por('trein_nome', pr.responsavel_nome, F.pedidos); por('trein_whatsapp', pr.responsavel_telefone, F.pedidos) }
  if (p) { por('trein_nome', p.ped_nome, F.paideia); por('trein_email', p.ped_email, F.paideia); por('trein_whatsapp', p.ped_celular, F.paideia); por('trein_email', p.email_responsavel, F.paideia) }

  // 5. Financeiro / 6. Pedagógico
  if (c) { por('fin_nome', c.financeiro_nome, F.contrato); por('fin_email', c.financeiro_email, F.contrato); por('fin_whatsapp', c.financeiro_telefone, F.contrato) }
  if (p) { por('fin_nome', p.fin_nome, F.paideia); por('fin_email', p.fin_email, F.paideia); por('fin_whatsapp', p.fin_celular, F.paideia) }
  if (c) { por('coord_nome', c.pedagogico_nome, F.contrato); por('coord_email', c.pedagogico_email, F.contrato); por('coord_whatsapp', c.pedagogico_telefone, F.contrato) }
  if (p) { por('coord_nome', p.ped_nome, F.paideia); por('coord_email', p.ped_email, F.paideia); por('coord_whatsapp', p.ped_celular, F.paideia) }

  // 7. Alunos por série: previsão de pedidos (kit completo + sem Inglês) > contrato > pré-cadastro > CRM
  for (const [chave, serie] of SERIES) {
    if (pr) { const n = (pr[`${serie}_qtd`] || 0) + (pr[`${serie}_sem_ingles_qtd`] || 0); if (n > 0) por(chave, n, F.pedidos) }
    const doContrato = series.filter(s => s.serie === serie && s.tipo_kit !== 'so_ingles').reduce((a, s) => a + (s.quantidade || 0), 0)
    if (doContrato > 0) por(chave, doContrato, F.contrato)
    if (p && Number(p[`${serie}_qtd`]) > 0) por(chave, p[`${serie}_qtd`], F.paideia)
    if (Number(e[COL_ESCOLA[serie]]) > 0) por(chave, e[COL_ESCOLA[serie]], F.escola)
  }

  // 9. Entrega
  if (pr && pr.mesmo_endereco_entrega === false) por('ent_endereco', pr.endereco_entrega_material, F.pedidos)

  // 10. Contrato
  if (c?.modalidade) {
    por('ctr_assinado', c.contrato_assinado ? 'Sim' : c.contrato_enviado ? 'Em assinatura' : null, F.contrato)
    por('ctr_valor', c.valor_total, F.contrato)
    const kits = series.reduce((a, s) => a + (s.quantidade || 0), 0)
    if (kits > 0) por('ctr_kits', kits, F.contrato)
    if (c.vigencia_inicio && c.vigencia_fim) por('ctr_vigencia', `${String(c.vigencia_inicio).split('-').reverse().join('/')} a ${String(c.vigencia_fim).split('-').reverse().join('/')}`, F.contrato)
  }
  return { valores, fontes }
}
