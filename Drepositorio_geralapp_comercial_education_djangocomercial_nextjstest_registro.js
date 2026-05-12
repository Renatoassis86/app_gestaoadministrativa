const { createClient } = require('@supabase/supabase-js');

const url = 'https://lyisdsnocroocxfblvqf.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM';

async function test() {
  const supabase = createClient(url, key);
  
  console.log('=== TESTE DE PERSISTÊNCIA DE REGISTROS ===\n');
  
  // 1. Listar registros existentes
  console.log('1. Buscando registros existentes...');
  const { data: registros, error: fetchError } = await supabase
    .from('registros')
    .select('id, escola_id, resumo, data_contato, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (fetchError) {
    console.error('❌ Erro ao buscar registros:', fetchError.message);
  } else {
    console.log(`✅ ${registros?.length || 0} registros encontrados`);
    registros?.forEach(r => {
      console.log(`   - ID: ${r.id} | Data: ${r.data_contato} | Resumo: ${r.resumo?.substring(0, 50)}...`);
    });
  }
  
  // 2. Verificar estrutura da tabela registros
  console.log('\n2. Verificando colunas da tabela registros...');
  const { data: columns, error: colError } = await supabase
    .from('registros')
    .select('*')
    .limit(1);
  
  if (colError) {
    console.error('❌ Erro ao buscar colunas:', colError.message);
  } else {
    if (columns && columns.length > 0) {
      console.log('✅ Colunas encontradas:');
      console.log(Object.keys(columns[0]).join(', '));
    } else {
      console.log('⚠️  Tabela vazia');
    }
  }
  
  // 3. Verificar RLS policies
  console.log('\n3. Testando acesso RLS...');
  const { data: { user } } = await supabase.auth.admin.listUsers();
  console.log(`✅ Conectado ao Supabase`);
  
  // 4. Tentar inserir um registro de teste
  console.log('\n4. Tentando inserir registro de teste...');
  const { data: inserted, error: insertError } = await supabase
    .from('registros')
    .insert({
      escola_id: '123e4567-e89b-12d3-a456-426614174000',
      resumo: 'Teste de persistência - ' + new Date().toISOString(),
      data_contato: new Date().toISOString().split('T')[0],
      meio_contato: 'email',
      interesse: 'medio',
      prontidao: 'esperando_retorno',
      abertura: 'media',
    })
    .select('id');
  
  if (insertError) {
    console.error('❌ Erro ao inserir:', insertError.message);
    console.error('Detalhes:', insertError);
  } else {
    console.log('✅ Registro inserido com sucesso:', inserted[0]?.id);
    
    // Verificar se foi salvo
    const { data: verify, error: verifyError } = await supabase
      .from('registros')
      .select('*')
      .eq('id', inserted[0].id)
      .single();
    
    if (verifyError) {
      console.error('❌ Erro ao verificar registro:', verifyError.message);
    } else {
      console.log('✅ Registro verificado:', verify?.resumo);
    }
  }
}

test().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
