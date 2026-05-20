import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://lyisdsnocroocxfblvqf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const sqlPath = join(__dirname, '..', 'supabase', 'add_solicitacoes_amostras.sql')
const sql = readFileSync(sqlPath, 'utf8')

console.log('▶ Aplicando migration: add_solicitacoes_amostras.sql')
console.log(`   tamanho: ${sql.length} chars\n`)

const { data, error } = await sb.rpc('exec_sql', { query: sql })

if (error) {
  console.error('✗ Falhou:', error.message)
  process.exit(1)
}

console.log('✅ Migration aplicada com sucesso')

// Verificação — tabela existe e está vazia?
const { count, error: errCount } = await sb
  .from('solicitacoes_amostras')
  .select('*', { count: 'exact', head: true })

if (errCount) {
  console.error('⚠ Tabela criada mas verificação falhou:', errCount.message)
  process.exit(1)
}

console.log(`✅ Tabela "solicitacoes_amostras" acessível (${count ?? 0} registros)`)
