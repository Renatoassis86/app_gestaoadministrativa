const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://lyisdsnocroocxfblvqf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function main() {
  console.log('🚀 APLICANDO FIX RLS PERMANENTE\n');
  
  // 1. Ler o SQL file
  const sqlContent = fs.readFileSync('fix_rls_final.sql', 'utf-8');
  console.log('📄 SQL carregado:');
  console.log(sqlContent);
  console.log('\n' + '='.repeat(80) + '\n');

  // 2. Tentar executar via fetch direto (admin API)
  try {
    console.log('🔄 Executando via Admin API...\n');
    
    // Usando fetch para POST direto na API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });

    const result = await response.json();
    console.log('Status:', response.status);
    console.log('Resultado:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }

  // 3. Alternativa: Listar policies existentes
  console.log('\n' + '='.repeat(80));
  console.log('\n🔍 VERIFICANDO POLICIES EXISTENTES:\n');
  
  try {
    const { data, error } = await supabase
      .from('pg_policies')
      .select('policyname, tablename, permissive')
      .eq('tablename', 'registros');
    
    if (error) {
      console.log('⚠️ Não consigo ler pg_policies diretamente');
    } else {
      console.log('✅ Policies atuais:');
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.log('⚠️ Erro ao listar policies:', err.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n⚠️ CONCLUSÃO:');
  console.log('Para aplicar o fix de forma definitiva, você precisa:');
  console.log('');
  console.log('1. Ir para: https://app.supabase.com/project/lyisdsnocroocxfblvqf');
  console.log('2. Clicar em: SQL Editor → New Query');
  console.log('3. Copiar TUDO do arquivo: fix_rls_final.sql');
  console.log('4. Colar no editor Supabase');
  console.log('5. Clicar em: Run');
  console.log('');
  console.log('O SQL está pronto em: fix_rls_final.sql');
}

main();
