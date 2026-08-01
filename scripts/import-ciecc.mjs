/**
 * Importa as planilhas do CIECC 2025/2026 para o schema leads_* já migrado
 * (supabase/add_leads_banco.sql), vinculando escolas ao CRM por CNPJ/nome.
 *
 * Uso:
 *   node scripts/import-ciecc.mjs              -> modo preview (não grava nada)
 *   node scripts/import-ciecc.mjs --write       -> grava de fato
 *
 * Arquivos-fonte (fora do repo, não versionados):
 *   D:\repositorio_geral\projetos_education\app_comercial_education_django\CIEEC_2025.xlsx
 *   D:\repositorio_geral\projetos_education\app_comercial_education_django\CIEEC_2026.xlsx
 */
import { createClient } from '@supabase/supabase-js'
import XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'

const WRITE = process.argv.includes('--write')

const envContent = fs.readFileSync('.env.local', 'utf8')
const env = {}
for (const line of envContent.split('\n')) {
  const idx = line.indexOf('=')
  if (idx === -1) continue
  env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
}
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } })

const BASE_DIR = 'D:/repositorio_geral/projetos_education/app_comercial_education_django'
const FILE_2025 = path.join(BASE_DIR, 'CIEEC_2025.xlsx')
const FILE_2026 = path.join(BASE_DIR, 'CIEEC_2026.xlsx')

function normNome(s) { return (s || '').toString().toLowerCase().trim().replace(/\s+/g, ' ') }
function normCnpj(s) { return (s || '').toString().replace(/\D/g, '') }
function normData(v) {
  if (!v) return null
  if (v instanceof Date) return v.toISOString().slice(0, 10)
  const s = String(v).trim()
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`
  return null
}

const CARGO_PRECEDENCIA = { mantenedor: 4, diretor: 3, gestor: 2, coordenador: 1 }
function precedenciaCargo(cargo) {
  const c = normNome(cargo)
  for (const [k, v] of Object.entries(CARGO_PRECEDENCIA)) if (c.includes(k)) return v
  return 0
}

function lerPlanilha(caminho) {
  const wb = XLSX.readFile(caminho)
  const ws = wb.Sheets[wb.SheetNames[0]]
  return XLSX.utils.sheet_to_json(ws, { defval: null })
}

// ── 1. Ler as duas planilhas ────────────────────────────────────────────────
console.log(`Lendo ${FILE_2025} ...`)
const linhas2025 = lerPlanilha(FILE_2025)
console.log(`  ${linhas2025.length} linhas`)

console.log(`Lendo ${FILE_2026} ...`)
const linhas2026 = lerPlanilha(FILE_2026)
console.log(`  ${linhas2026.length} linhas`)

// ── 2. Escolas do CRM, para vínculo ──────────────────────────────────────────
const { data: escolasCRM } = await sb.from('escolas').select('id, nome, cnpj').eq('ativa', true)
const nomeParaEscolaCRM = new Map()
const cnpjParaEscolaCRM = new Map()
for (const e of escolasCRM ?? []) {
  nomeParaEscolaCRM.set(normNome(e.nome), e.id)
  if (e.cnpj) cnpjParaEscolaCRM.set(normCnpj(e.cnpj), e.id)
}
function encontrarEscolaCRM(cnpj, nome) {
  const c = normCnpj(cnpj)
  if (c && cnpjParaEscolaCRM.has(c)) return cnpjParaEscolaCRM.get(c)
  const n = normNome(nome)
  if (n && nomeParaEscolaCRM.has(n)) return nomeParaEscolaCRM.get(n)
  return null
}

// ── 3. Processar 2026 (fonte rica) ──────────────────────────────────────────
const pessoas2026 = []
const gruposEscola2026 = new Map() // key -> { rows: [], cnpj, nome, cidade, uf }

for (const r of linhas2026) {
  const nome = r['Inscrito']
  const email = r['Email']
  const cnpj = r['CNPJ (Fórum)']
  const nomeEscola = r['Qual é o nome da sua instituição de ensino?']
  const key = normCnpj(cnpj) || (nomeEscola ? `nome:${normNome(nomeEscola)}` : null)

  pessoas2026.push({
    nome, email,
    telefone: r['Tel. Celular'],
    cidade: r['Cidade Projeto'] || r['Cidade'],
    uf: r['UF Projeto'] || r['UF'],
    tipo_inscricao: r['Qual é o tipo de sua inscrição?'],
    cargo: r['Cargo Original'],
    escolaKey: key,
    // participação
    lote: r['Lote'], valor_lote: r['Valor Lote'], forma_pagamento: r['Forma de Pagamento'],
    status_financeiro: r['Status Financeiro'], check_in: r['Check-in'] === 'Sim',
    fonte: r['Fonte (Prover/Fórum)'], participou_anterior: r['Participou I Congresso?'] === 'Sim',
    data_inscricao: r['Data Inscrição'],
    raw: r,
  })

  if (key) {
    if (!gruposEscola2026.has(key)) {
      gruposEscola2026.set(key, {
        cnpj: cnpj || null, nome: nomeEscola || null,
        cidade: r['Cidade Projeto'] || r['Cidade'] || null,
        uf: r['UF Projeto'] || r['UF'] || null,
        rows: [],
      })
    }
    gruposEscola2026.get(key).rows.push(r)
  }
}

// ── 4. Processar 2025 (best-effort) ─────────────────────────────────────────
const pessoas2025 = []
const gruposEscola2025 = new Map()

for (const r of linhas2025) {
  const nomeEscola = r['Qual é o nome da sua instituição de ensino?']
  const key = nomeEscola ? `nome:${normNome(nomeEscola)}` : null

  pessoas2025.push({
    nome: r['Inscrito'], email: r['Email'],
    telefone: r['Tel. Celular'],
    cidade: r['Cidade Projeto'] || r['Cidade'],
    uf: r['UF Projeto'] || r['UF'],
    tipo_inscricao: r['Qual é o tipo de sua inscrição?'],
    escolaKey: key,
    lote: r['Lote'], valor_lote: r['Valor Lote'], forma_pagamento: r['Forma de Pagamento'],
    status_financeiro: r['Status Financeiro'],
    data_inscricao: r['Data Inscrição'],
  })

  if (key && !gruposEscola2025.has(key)) {
    gruposEscola2025.set(key, { cnpj: null, nome: nomeEscola, cidade: r['Cidade Projeto'] || r['Cidade'] || null, uf: r['UF Projeto'] || r['UF'] || null })
  }
}

// ── 5. Preview ───────────────────────────────────────────────────────────────
const escolasComCnpj2026 = [...gruposEscola2026.values()].filter(g => g.cnpj).length
const escolasSemCnpj2026 = gruposEscola2026.size - escolasComCnpj2026
let vinculadasCRM2026 = 0
for (const g of gruposEscola2026.values()) if (encontrarEscolaCRM(g.cnpj, g.nome)) vinculadasCRM2026++

let vinculadasCRM2025 = 0
for (const g of gruposEscola2025.values()) if (encontrarEscolaCRM(g.cnpj, g.nome)) vinculadasCRM2025++

const escolasComPerfil2026 = [...gruposEscola2026.values()].filter(g => g.rows.some(r => r['Cargo Original'])).length

console.log('\n━━━ PREVIEW ━━━')
console.log('2026:')
console.log('  pessoas/participações a criar:', pessoas2026.length)
console.log('  escolas únicas identificadas:', gruposEscola2026.size, `(${escolasComCnpj2026} com CNPJ, ${escolasSemCnpj2026} só por nome)`)
console.log('  dessas, já existem no CRM (escola_crm_id vinculado):', vinculadasCRM2026)
console.log('  escolas com perfil de pesquisa (leads_perfil_escola) a criar:', escolasComPerfil2026)

console.log('2025:')
console.log('  pessoas/participações a criar:', pessoas2025.length)
console.log('  escolas únicas identificadas (só por nome):', gruposEscola2025.size)
console.log('  dessas, já existem no CRM:', vinculadasCRM2025)

if (!WRITE) {
  console.log('\n(modo preview — nada foi gravado. Rode com --write para gravar.)')
  process.exit(0)
}

// ── 6. Gravação ──────────────────────────────────────────────────────────────
console.log('\n━━━ GRAVANDO ━━━')

const { count: jaTem2026 } = await sb.from('leads_participacao').select('*', { count: 'exact', head: true }).eq('evento', '2_CIECC_2026')
const PULAR_2026 = (jaTem2026 ?? 0) > 0
if (PULAR_2026) console.log(`2026 já tem ${jaTem2026} participações gravadas — pulando (script idempotente, só roda 2025).`)

async function upsertPessoa(p, pessoaPorEmail) {
  const emailKey = normNome(p.email)
  if (emailKey && pessoaPorEmail.has(emailKey)) return pessoaPorEmail.get(emailKey)
  const { data, error } = await sb.from('leads_pessoa').insert({
    nome_completo: p.nome, email: p.email || null, tel_celular: p.telefone || null,
    cidade: p.cidade || null, uf: p.uf || null,
    tipo_inscricao: p.tipo_inscricao || null, cargo: p.cargo || null,
  }).select('id').single()
  if (error) { console.error('  erro leads_pessoa:', error.message); return null }
  if (emailKey) pessoaPorEmail.set(emailKey, data.id)
  return data.id
}

async function upsertEscolaLead(key, grupo, escolaLeadPorKey) {
  if (escolaLeadPorKey.has(key)) return escolaLeadPorKey.get(key)
  const escolaCrmId = encontrarEscolaCRM(grupo.cnpj, grupo.nome)
  const { data, error } = await sb.from('leads_escola').insert({
    nome: grupo.nome || 'Sem nome', cnpj: grupo.cnpj || null,
    cidade: grupo.cidade || null, uf: grupo.uf || null,
    qtd_alunos: grupo.qtd_alunos ?? null,
    alunos_infantil: grupo.alunos_infantil ?? null, alunos_fund1: grupo.alunos_fund1 ?? null,
    alunos_fund2: grupo.alunos_fund2 ?? null, alunos_ens_medio: grupo.alunos_ens_medio ?? null,
    status_ciecc2: grupo.status_ciecc2 ?? null, status_ciecc1: grupo.status_ciecc1 ?? null,
    origem: grupo.origem ?? null,
    escola_crm_id: escolaCrmId,
  }).select('id').single()
  if (error) { console.error('  erro leads_escola:', error.message); return null }
  escolaLeadPorKey.set(key, data.id)
  return data.id
}

// -- 2026 --
const pessoaPorEmail2026 = new Map()
const escolaLeadPorKey2026 = new Map()
let pessoasCriadas2026 = 0, participacoesCriadas2026 = 0, escolasCriadas2026 = 0, perfisCriados2026 = 0, contatosCriados2026 = 0

if (!PULAR_2026) {
for (const p of pessoas2026) {
  const pessoaId = await upsertPessoa(p, pessoaPorEmail2026)
  if (!pessoaId) continue
  pessoasCriadas2026++

  let escolaLeadId = null
  if (p.escolaKey) {
    const grupo = gruposEscola2026.get(p.escolaKey)
    // agrega quantidades de alunos (usa a primeira linha do grupo que tiver valor > 0)
    if (grupo.qtd_alunos === undefined) {
      const comQtd = grupo.rows.find(r => (r['Qtd Alunos'] ?? 0) > 0)
      if (comQtd) {
        grupo.qtd_alunos = comQtd['Qtd Alunos']
        grupo.alunos_infantil = comQtd['Alunos Infantil']
        grupo.alunos_fund1 = comQtd['Alunos Fund. I']
        grupo.alunos_fund2 = comQtd['Alunos Fund. II']
        grupo.alunos_ens_medio = comQtd['Alunos Ens. Médio']
      }
      grupo.status_ciecc2 = 'participou'
      grupo.origem = 'CIECC 2026'
    }
    escolaLeadId = await upsertEscolaLead(p.escolaKey, grupo, escolaLeadPorKey2026)
    if (escolaLeadId && !escolaLeadPorKey2026.has('_criada_' + p.escolaKey)) {
      escolaLeadPorKey2026.set('_criada_' + p.escolaKey, true)
      escolasCriadas2026++
    }
  }

  const { error: errPart } = await sb.from('leads_participacao').insert({
    pessoa_id: pessoaId, escola_id: escolaLeadId, evento: '2_CIECC_2026',
    lote: p.lote || null, valor_lote: p.valor_lote || null, forma_pagamento: p.forma_pagamento || null,
    status_financeiro: p.status_financeiro || null, check_in: p.check_in,
    fonte: p.fonte || null, participou_evento_anterior: p.participou_anterior,
    data_inscricao: normData(p.data_inscricao),
  })
  if (errPart) console.error('  erro leads_participacao:', errPart.message)
  else participacoesCriadas2026++

  // contato_escola — só para quem tem escola vinculada
  if (escolaLeadId) {
    const { error: errContato } = await sb.from('leads_contato_escola').insert({
      escola_id: escolaLeadId, pessoa_id: pessoaId, nome: p.nome, cargo: p.cargo || p.tipo_inscricao, telefone: p.telefone, email: p.email,
    })
    if (!errContato) contatosCriados2026++
  }
}

// perfil_escola — uma linha por escola, pega a linha de maior precedência de cargo
for (const [key, grupo] of gruposEscola2026) {
  const escolaLeadId = escolaLeadPorKey2026.get(key)
  if (!escolaLeadId) continue
  const linhasComCargo = grupo.rows.filter(r => r['Cargo Original'])
  if (linhasComCargo.length === 0) continue
  const melhor = linhasComCargo.reduce((a, b) => precedenciaCargo(b['Cargo Original']) > precedenciaCargo(a['Cargo Original']) ? b : a)

  const pega = (campoEnriq, campoRaw) => melhor[campoEnriq] ?? melhor[campoRaw] ?? null

  const { error } = await sb.from('leads_perfil_escola').insert({
    escola_id: escolaLeadId, evento_ref: '2_CIECC_2026',
    confessionalidade: melhor['Qual é a situação atual da sua escola em relação à confessionalidade cristã?'] ?? null,
    formacao_docentes: melhor['Sua escola oferece formação continuada para os docentes?'] ?? null,
    cosmovisao: melhor['Avalie se há clareza e alinhamento institucional da cosmovisão cristã no currículo escolar'] ?? null,
    desafios_ecc: melhor['Quais desafios sua escola enfrenta para consolidar ou adotar a Educação Cristã Clássica?'] ?? null,
    importancia_bilingue: melhor['Em uma escala de 0 a 10, quão importante é o ensino bilíngue para sua escola?'] ?? null,
    fatores_escolha: [melhor['Fator Decisão #1'], melhor['Fator Decisão #2'], melhor['Fator Decisão #3']].filter(Boolean).join('; ') || null,
    investimento_atual: pega('Investimento Atual (Enriq.)', 'Investimento Atual (R$/aluno/ano)'),
    disposicao_investimento: pega('Disp. Investimento (Enriq.)', 'Disp. Investimento (R$/aluno/ano)'),
    nps: pega('NPS Sistema (Enriq.)', 'NPS Sistema Atual (0–10)'),
    csi: pega('Satisfação Sistema (Enriq.)', 'Satisfação Sistema Atual (CSI)'),
    interesse_solucao: pega('Interesse CVE (Enriq.)', 'Interesse Solução CVE'),
    decisores: pega('Decisores (Enriq.)', 'Decisores na Escola'),
    prazo_decisao: pega('Prazo Decisão (Enriq.)', 'Prazo de Decisão'),
  })
  if (error) console.error('  erro leads_perfil_escola:', error.message)
  else perfisCriados2026++
}

console.log('2026 gravado:', { pessoasCriadas2026, participacoesCriadas2026, escolasCriadas2026, perfisCriados2026, contatosCriados2026 })
} // fim if (!PULAR_2026)

// -- 2025 (best-effort) --
const { count: jaTem2025 } = await sb.from('leads_participacao').select('*', { count: 'exact', head: true }).eq('evento', '1_CIECC_2025')
const PULAR_2025 = (jaTem2025 ?? 0) > 0
if (PULAR_2025) console.log(`2025 já tem ${jaTem2025} participações gravadas — pulando.`)

const pessoaPorEmail2025 = new Map()
const escolaLeadPorKey2025 = new Map()
let pessoasCriadas2025 = 0, participacoesCriadas2025 = 0, escolasCriadas2025 = 0

if (!PULAR_2025) {
for (const p of pessoas2025) {
  const pessoaId = await upsertPessoa(p, pessoaPorEmail2025)
  if (!pessoaId) continue
  pessoasCriadas2025++

  let escolaLeadId = null
  if (p.escolaKey) {
    const grupo = gruposEscola2025.get(p.escolaKey)
    escolaLeadId = await upsertEscolaLead(p.escolaKey, { ...grupo, origem: 'CIECC 2025', status_ciecc1: 'participou' }, escolaLeadPorKey2025)
    if (escolaLeadId && !escolaLeadPorKey2025.has('_criada_' + p.escolaKey)) {
      escolaLeadPorKey2025.set('_criada_' + p.escolaKey, true)
      escolasCriadas2025++
    }
  }

  const { error: errPart } = await sb.from('leads_participacao').insert({
    pessoa_id: pessoaId, escola_id: escolaLeadId, evento: '1_CIECC_2025',
    lote: p.lote || null, valor_lote: p.valor_lote || null, forma_pagamento: p.forma_pagamento || null,
    status_financeiro: p.status_financeiro || null,
    data_inscricao: normData(p.data_inscricao),
  })
  if (!errPart) participacoesCriadas2025++
}
console.log('2025 gravado:', { pessoasCriadas2025, participacoesCriadas2025, escolasCriadas2025 })
} // fim if (!PULAR_2025)

console.log('\n✅ Importação concluída.')
