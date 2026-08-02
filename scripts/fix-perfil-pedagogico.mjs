/**
 * Corrige escolas.perfil_pedagogico: o valor 'convencional' era, na maioria
 * dos casos, o DEFAULT da coluna do Postgres, não uma resposta real — nem a
 * pesquisa CIECC (2025/2026) nem `formularios` perguntam sobre linha
 * pedagógica (a pergunta do CIECC é sobre confessionalidade cristã, um eixo
 * diferente: "situação atual da escola em relação à confessionalidade
 * cristã" — ver leads_perfil_escola.confessionalidade). Sem fonte real, não
 * há como distinguir "convencional confirmado" de "campo nunca preenchido".
 *
 * Pré-requisito: rodar supabase/fix_perfil_pedagogico_nullable.sql no
 * Supabase (torna a coluna opcional) antes de gravar.
 *
 * Ação: toda escola ativa com perfil_pedagogico = 'convencional' vira NULL.
 * Os demais valores (crista_classica, crista_catolica, evangelica,
 * por_principio, outro) nunca são o default — só existem se alguém
 * selecionou deliberadamente no formulário — e são preservados.
 *
 * Uso:
 *   node scripts/fix-perfil-pedagogico.mjs          -> preview
 *   node scripts/fix-perfil-pedagogico.mjs --write  -> grava
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

const { data: escolas, error } = await sb
  .from('escolas')
  .select('id, nome, perfil_pedagogico')
  .eq('ativa', true)

if (error) {
  console.error('Erro ao ler escolas:', error.message)
  process.exit(1)
}

const distribuicaoAntes = {}
for (const e of escolas) {
  const k = e.perfil_pedagogico ?? '(null)'
  distribuicaoAntes[k] = (distribuicaoAntes[k] ?? 0) + 1
}
console.log('Distribuição atual de perfil_pedagogico:', distribuicaoAntes)

const paraCorrigir = escolas.filter(e => e.perfil_pedagogico === 'convencional')
console.log(`\nEscolas com 'convencional' sem fonte confirmada: ${paraCorrigir.length}`)
console.log('Exemplos (até 15):')
for (const e of paraCorrigir.slice(0, 15)) console.log(`  - ${e.nome}`)

if (!WRITE) {
  console.log('\n[preview] Nenhuma escrita realizada. Rode com --write para aplicar.')
  process.exit(0)
}

console.log(`\nGravando: ${paraCorrigir.length} escolas -> perfil_pedagogico = NULL ...`)
let ok = 0, falhas = 0
for (const e of paraCorrigir) {
  const { error: updErr } = await sb.from('escolas').update({ perfil_pedagogico: null }).eq('id', e.id)
  if (updErr) { console.error(`  erro (${e.nome}):`, updErr.message); falhas++ } else ok++
}
console.log('Gravado:', { ok, falhas })
