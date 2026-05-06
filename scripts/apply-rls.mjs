import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lyisdsnocroocxfblvqf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── Cada statement separado (Supabase REST não suporta multi-statement) ───────
const STATEMENTS = [

  // 1. Função helper can_view_all
  `create or replace function can_view_all()
   returns boolean language sql security definer stable as $$
     select coalesce(
       (select role in ('gerente','supervisor','consultor')
        from profiles where id = auth.uid()),
       false
     )
   $$`,

  // 2. Escolas — drop + recriar
  `drop policy if exists "Selecionar escolas" on escolas`,
  `create policy "Selecionar escolas" on escolas
   for select using (can_view_all())`,

  // 3. Registros
  `drop policy if exists "Selecionar registros" on registros`,
  `create policy "Selecionar registros" on registros
   for select using (can_view_all())`,

  // 4. Negociações
  `drop policy if exists "Selecionar negociações" on negociacoes`,
  `create policy "Selecionar negociações" on negociacoes
   for select using (can_view_all())`,

  // 5. Tarefas
  `drop policy if exists "Selecionar tarefas" on tarefas`,
  `create policy "Selecionar tarefas" on tarefas
   for select using (can_view_all())`,

  // 6. Contratos
  `drop policy if exists "Selecionar contratos" on contratos`,
  `create policy "Selecionar contratos" on contratos
   for select using (can_view_all())`,

  // 7. Notas
  `drop policy if exists "Selecionar notas" on notas_escola`,
  `create policy "Selecionar notas" on notas_escola
   for select using (can_view_all())`,

  // 8. Contatos
  `drop policy if exists "Selecionar contatos" on contatos_escola`,
  `create policy "Selecionar contatos" on contatos_escola
   for select using (can_view_all())`,

  // 9. Formulários — leitura para consultores também
  `drop policy if exists "Ler formulários (apenas autenticados)" on formularios`,
  `create policy "Ler formulários (apenas autenticados)" on formularios
   for select using (can_view_all())`,
]

async function runSQL(sql) {
  // Usa a Management API via fetch direto
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql }),
  })

  if (res.ok) return { ok: true }

  // Fallback: usar pg via supabase-js query (apenas disponível em projetos com edge functions)
  // Se não funcionar, retornar o erro para relatório
  const body = await res.json()
  return { ok: false, error: body }
}

async function main() {
  console.log('\n━━━ Aplicando RLS — Acesso Consultores ━━━\n')

  let success = 0
  let failed  = 0

  for (const stmt of STATEMENTS) {
    const preview = stmt.trim().split('\n')[0].substring(0, 70)
    process.stdout.write(`  → ${preview}... `)

    const result = await runSQL(stmt)

    if (result.ok) {
      console.log('✅')
      success++
    } else {
      // Se RPC não existe, tentar via supabase-js diretamente
      // O Supabase não expõe exec_sql por padrão — precisamos da Postgres API
      console.log('⚠ RPC não disponível')
      failed++
    }
  }

  if (failed > 0) {
    console.log('\n⚠ A Management API via REST não está habilitada neste projeto.')
    console.log('  Aplicando via queries alternativas...\n')
    await applyViaAlternative()
  } else {
    console.log(`\n✅ ${success} políticas aplicadas com sucesso!\n`)
  }
}

// Método alternativo: usar o cliente Supabase para verificar e aplicar o que for possível
async function applyViaAlternative() {
  console.log('  Verificando conectividade com o banco...')

  // Testar leitura como service role (bypassa RLS)
  const { data: escolas, error } = await sb.from('escolas').select('id').limit(1)
  if (error) {
    console.log('  ✗ Erro de conexão:', error.message)
    return
  }

  console.log('  ✓ Conexão OK — banco acessível')
  console.log('\n  Para aplicar as políticas RLS automaticamente, execute o arquivo:')
  console.log('  📄 supabase/fix_rls_consultores.sql')
  console.log('\n  No painel Supabase:')
  console.log('  https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new')
  console.log('\n  Cole o conteúdo do arquivo e clique em "Run"\n')

  // Tentar via pg-meta API (disponível em projetos com acesso à database)
  console.log('  Tentando via Database API...')

  // Supabase expõe a API de query via endpoint /pg
  const queries = STATEMENTS.map(s => s.trim())

  for (const q of queries) {
    try {
      const res = await fetch(`${SUPABASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: q }),
      })

      const label = q.split('\n')[0].substring(0, 50)
      if (res.ok) {
        console.log(`  ✅ ${label}`)
      } else {
        const err = await res.json()
        console.log(`  ✗  ${label} → ${err.message ?? res.status}`)
      }
    } catch (e) {
      console.log(`  ✗  Erro de rede: ${e.message}`)
      break
    }
  }
}

main().catch(console.error)
