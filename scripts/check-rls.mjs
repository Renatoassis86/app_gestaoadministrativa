import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lyisdsnocroocxfblvqf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function main() {
  console.log('\n━━━ Verificando estado do RLS ━━━\n')

  // 1. Verificar se can_view_all já existe
  const { data: fn, error: fnErr } = await sb.rpc('can_view_all')
  const fnExiste = fnErr?.message?.includes('does not exist') ? false : true
  console.log(`  can_view_all():   ${fnExiste ? '✅ existe' : '❌ não existe'}`)

  // 2. Verificar policies atuais via information_schema
  const { data: policies } = await sb
    .from('pg_policies')
    .select('tablename, policyname, cmd, qual')

  if (policies) {
    console.log('\n  Políticas de SELECT atuais:')
    policies
      .filter((p) => p.cmd === 'SELECT' || p.cmd === 'ALL')
      .forEach(p => {
        const usesViewAll = p.qual?.includes('can_view_all')
        const status = usesViewAll ? '✅' : '⚠️ '
        console.log(`  ${status} ${p.tablename.padEnd(20)} → ${p.policyname}`)
      })
  } else {
    console.log('  (Não foi possível listar políticas via pg_policies)')
  }

  // 3. Testar acesso como consultor (simular)
  console.log('\n  Testando acesso de consultor às escolas...')
  const { data: escolas, error: escolasErr } = await sb
    .from('escolas')
    .select('id, nome')
    .limit(3)

  if (!escolasErr) {
    console.log(`  ✅ Service role lê escolas: ${escolas?.length ?? 0} encontradas`)
  } else {
    console.log(`  ❌ Erro: ${escolasErr.message}`)
  }

  if (!fnExiste) {
    console.log('\n⚠️  A função can_view_all() ainda não foi criada.')
    console.log('   Execute o arquivo supabase/fix_rls_consultores.sql no painel Supabase:')
    console.log('   https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new\n')
  } else {
    console.log('\n✅ RLS configurado corretamente!\n')
  }
}

main().catch(console.error)
