/**
 * Preenche porte (quantidade de alunos) e satisfação com sistema atual em
 * `escolas` a partir de `formularios` (pré-cadastro) e `leads_escola`/
 * `leads_perfil_escola` (pesquisa CIECC já importada por import-ciecc.mjs).
 * Nunca sobrescreve dado já preenchido — só completa o que está vazio.
 *
 * Uso:
 *   node scripts/backfill-escolas-porte.mjs          -> preview
 *   node scripts/backfill-escolas-porte.mjs --write  -> grava
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const WRITE = process.argv.includes('--write')

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=')
  if (idx === -1) continue
  env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

function normCnpj(s) { return (s || '').toString().replace(/\D/g, '') }

const { data: escolas } = await sb.from('escolas').select('*').eq('ativa', true)
const { data: formularios } = await sb.from('formularios').select('*')
const { data: leadsEscola } = await sb.from('leads_escola').select('escola_crm_id, qtd_alunos, alunos_infantil, alunos_fund1, alunos_fund2, alunos_ens_medio, leads_perfil_escola(csi)')

const formPorCnpj = new Map()
for (const f of formularios ?? []) {
  const c = normCnpj(f.cnpj)
  if (c) formPorCnpj.set(c, f)
}
const leadEscolaPorCrmId = new Map()
for (const le of leadsEscola ?? []) {
  if (le.escola_crm_id) leadEscolaPorCrmId.set(le.escola_crm_id, le)
}

const escolasPorCnpj = new Set((escolas ?? []).map(e => normCnpj(e.cnpj)).filter(Boolean))

let sincronizarFormulario = [], sincronizarLeadsEscola = [], criarNovas = [], sincronizarSatisfacao = []

for (const e of escolas ?? []) {
  const semPorte = !e.total_alunos || e.total_alunos <= 0
  const cnpj = normCnpj(e.cnpj)

  if (semPorte) {
    const form = cnpj ? formPorCnpj.get(cnpj) : null
    if (form) {
      const temQtd = (form.infantil2_qtd||0)+(form.infantil3_qtd||0)+(form.infantil4_qtd||0)+(form.infantil5_qtd||0)
        + (form.fund1_ano1_qtd||0)+(form.fund1_ano2_qtd||0)+(form.fund1_ano3_qtd||0)+(form.fund1_ano4_qtd||0)+(form.fund1_ano5_qtd||0)
      if (temQtd > 0) sincronizarFormulario.push({ escola: e, form })
    } else {
      const le = leadEscolaPorCrmId.get(e.id)
      if (le && (le.qtd_alunos || 0) > 0) sincronizarLeadsEscola.push({ escola: e, le })
    }
  }

  if (!e.satisfacao_sistema_atual) {
    const le = leadEscolaPorCrmId.get(e.id)
    const perfil = Array.isArray(le?.leads_perfil_escola) ? le.leads_perfil_escola[0] : le?.leads_perfil_escola
    if (perfil?.csi) sincronizarSatisfacao.push({ escola: e, csi: perfil.csi })
  }
}

for (const f of formularios ?? []) {
  const c = normCnpj(f.cnpj)
  if (c && !escolasPorCnpj.has(c)) {
    const temQtd = (f.infantil2_qtd||0)+(f.infantil3_qtd||0)+(f.infantil4_qtd||0)+(f.infantil5_qtd||0)
      + (f.fund1_ano1_qtd||0)+(f.fund1_ano2_qtd||0)+(f.fund1_ano3_qtd||0)+(f.fund1_ano4_qtd||0)+(f.fund1_ano5_qtd||0)
    if (temQtd > 0) criarNovas.push(f)
  }
}

console.log('\n━━━ PREVIEW ━━━')
console.log('Escolas a sincronizar com dado de formulários (porte):', sincronizarFormulario.length)
console.log('Escolas a sincronizar com dado da pesquisa CIECC (porte):', sincronizarLeadsEscola.length)
console.log('Escolas a sincronizar satisfação com sistema atual (CIECC):', sincronizarSatisfacao.length)
console.log('Novas escolas a criar (de formulários sem match):', criarNovas.length)
if (criarNovas.length) console.log('  ->', criarNovas.map(f => f.nome_escola))

if (!WRITE) {
  console.log('\n(modo preview — nada foi gravado. Rode com --write para gravar.)')
  process.exit(0)
}

console.log('\n━━━ GRAVANDO ━━━')
let ok = 0, erros = 0

for (const { escola, form } of sincronizarFormulario) {
  const { error } = await sb.from('escolas').update({
    qtd_infantil2: form.infantil2_qtd || 0, qtd_infantil3: form.infantil3_qtd || 0,
    qtd_infantil4: form.infantil4_qtd || 0, qtd_infantil5: form.infantil5_qtd || 0,
    qtd_fund1_ano1: form.fund1_ano1_qtd || 0, qtd_fund1_ano2: form.fund1_ano2_qtd || 0,
    qtd_fund1_ano3: form.fund1_ano3_qtd || 0, qtd_fund1_ano4: form.fund1_ano4_qtd || 0, qtd_fund1_ano5: form.fund1_ano5_qtd || 0,
  }).eq('id', escola.id)
  if (error) { console.error('  erro (form)', escola.nome, error.message); erros++ } else ok++
}

for (const { escola, le } of sincronizarLeadsEscola) {
  const { error } = await sb.from('escolas').update({
    qtd_infantil: le.alunos_infantil || 0, qtd_fund1: le.alunos_fund1 || 0,
    qtd_fund2: le.alunos_fund2 || 0, qtd_medio: le.alunos_ens_medio || 0,
  }).eq('id', escola.id)
  if (error) { console.error('  erro (leads_escola)', escola.nome, error.message); erros++ } else ok++
}

for (const { escola, csi } of sincronizarSatisfacao) {
  const { error } = await sb.from('escolas').update({ satisfacao_sistema_atual: csi }).eq('id', escola.id)
  if (!error) ok++
}

let criadas = 0
for (const f of criarNovas) {
  const { error } = await sb.from('escolas').insert({
    nome: f.nome_escola, cnpj: f.cnpj || null,
    cidade: f.cidade || null, estado: f.estado || null,
    rua: f.rua || null, numero: f.numero || null, complemento: f.complemento || null, bairro: f.bairro || null, cep: f.cep || null,
    email: f.email_responsavel || null,
    perfil_pedagogico: 'convencional',
    qtd_infantil2: f.infantil2_qtd || 0, qtd_infantil3: f.infantil3_qtd || 0,
    qtd_infantil4: f.infantil4_qtd || 0, qtd_infantil5: f.infantil5_qtd || 0,
    qtd_fund1_ano1: f.fund1_ano1_qtd || 0, qtd_fund1_ano2: f.fund1_ano2_qtd || 0,
    qtd_fund1_ano3: f.fund1_ano3_qtd || 0, qtd_fund1_ano4: f.fund1_ano4_qtd || 0, qtd_fund1_ano5: f.fund1_ano5_qtd || 0,
    origem_lead: 'site', ativa: true,
  })
  if (error) { console.error('  erro (nova escola)', f.nome_escola, error.message); erros++ } else criadas++
}

console.log('Gravado:', { ok, criadas, erros })
