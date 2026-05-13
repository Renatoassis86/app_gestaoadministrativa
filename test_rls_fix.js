const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyisdsnocroocxfblvqf.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTg3ODksImV4cCI6MjA5MzU3NDc4OX0.hNuoZ5ZdEHuGh1CoKju1jgJHUFzp-dMA5fXYLHv8cTg';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM';

async function testRLSFix() {
  console.log('🧪 TESTANDO RLS FIX\n');
  console.log('='.repeat(80) + '\n');

  // Teste 1: Com ANON_KEY (o que o frontend usa)
  console.log('1️⃣ Testando com ANON_KEY (Frontend Browser)\n');
  const anonClient = createClient(supabaseUrl, anonKey);
  
  try {
    const { data: registros, error } = await anonClient
      .from('registros')
      .select('id, contato_nome, resumo, data_contato, escola_id')
      .limit(5);
    
    if (error) {
      console.log('❌ ERRO:', error.message);
      console.log('   Código:', error.code);
    } else {
      console.log(`✅ SUCESSO! Registros carregados com ANON_KEY: ${registros.length}`);
      registros.forEach((r, i) => {
        console.log(`\n   Registro ${i+1}:`);
        console.log(`   - ID: ${r.id}`);
        console.log(`   - Contato: ${r.contato_nome}`);
        console.log(`   - Resumo: ${r.resumo?.substring(0, 50) || '(vazio)'}...`);
        console.log(`   - Data: ${r.data_contato}`);
      });
    }
  } catch (err) {
    console.log('❌ ERRO NA CONEXÃO:', err.message);
  }

  console.log('\n' + '='.repeat(80) + '\n');

  // Teste 2: Com SERVICE_ROLE_KEY (backend)
  console.log('2️⃣ Testando com SERVICE_ROLE_KEY (Backend/Server)\n');
  const serviceClient = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    const { data: registros, error } = await serviceClient
      .from('registros')
      .select('id, contato_nome, resumo, data_contato, escola_id')
      .limit(5);
    
    if (error) {
      console.log('❌ ERRO:', error.message);
    } else {
      console.log(`✅ SUCESSO! Registros carregados com SERVICE_ROLE_KEY: ${registros.length}`);
      console.log('   (Esperado: 4 registros)');
    }
  } catch (err) {
    console.log('❌ ERRO NA CONEXÃO:', err.message);
  }

  console.log('\n' + '='.repeat(80));
  console.log('\n✨ RESULTADO FINAL:\n');
  console.log('Se ambos os testes retornarem dados, o RLS fix funcionou!');
  console.log('O frontend agora consegue ler os registros.\n');
}

testRLSFix();
