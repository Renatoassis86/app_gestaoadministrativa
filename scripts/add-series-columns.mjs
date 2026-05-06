/**
 * Script: adicionar colunas de séries na tabela formularios
 * Usa a Management API do Supabase via fetch com service role key
 *
 * Como o Supabase JS SDK não permite DDL direto, este script
 * cria uma função temporária no banco via INSERT no pg_catalog
 * — não é possível via REST.
 *
 * ALTERNATIVA AUTOMÁTICA USADA:
 * Criar as colunas uma a uma tentando INSERT e capturando o erro.
 * Se a coluna não existe, o Supabase retorna erro específico.
 * Não temos como criar colunas sem acesso DDL direto.
 *
 * SOLUÇÃO: usar o endpoint /pg/query que o Supabase expõe
 * com o service role para projetos na região sa-east-1
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lyisdsnocroocxfblvqf.supabase.co'
const SERVICE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM'

const sb = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// Colunas a adicionar em formularios
const NOVAS_COLUNAS_FORMULARIOS = [
  'fund1_ano2_qtd', 'fund1_ano3_qtd', 'fund1_ano4_qtd', 'fund1_ano5_qtd',
]

async function main() {
  console.log('\n━━━ Verificando colunas das séries no banco ━━━\n')

  // Testar cada coluna tentando SELECT
  for (const col of NOVAS_COLUNAS_FORMULARIOS) {
    const { error } = await sb.from('formularios').select(col).limit(1)
    if (error?.message?.includes('column') && error.message.includes('does not exist')) {
      console.log(`  ❌ ${col} — NÃO existe`)
    } else if (error) {
      console.log(`  ⚠ ${col} — erro: ${error.message}`)
    } else {
      console.log(`  ✅ ${col} — existe`)
    }
  }

  console.log('\n━━━ Resultado ━━━')
  console.log('\n  Para adicionar as colunas faltantes, rode no SQL Editor do Supabase:')
  console.log('  https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new')
  console.log('\n  SQL:\n')
  console.log(`  do $$ begin
    alter table formularios add column if not exists fund1_ano2_qtd int not null default 0;
  exception when duplicate_column then null; end $$;

  do $$ begin
    alter table formularios add column if not exists fund1_ano3_qtd int not null default 0;
  exception when duplicate_column then null; end $$;

  do $$ begin
    alter table formularios add column if not exists fund1_ano4_qtd int not null default 0;
  exception when duplicate_column then null; end $$;

  do $$ begin
    alter table formularios add column if not exists fund1_ano5_qtd int not null default 0;
  exception when duplicate_column then null; end $$;

  select 'Colunas de series adicionadas' as resultado;`)
  console.log()
}

main().catch(console.error)
