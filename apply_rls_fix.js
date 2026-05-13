const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lyisdsnocroocxfblvqf.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5aXNkc25vY3Jvb2N4ZmJsdnFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzk5ODc4OSwiZXhwIjoyMDkzNTc0Nzg5fQ.hdamjVF-9MfZuFZj24Jh1w2W_eKDBSfj7P3WJnqSzbM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const dropPolicies = `
DROP POLICY IF EXISTS "registros_select" ON registros;
DROP POLICY IF EXISTS "registros_insert" ON registros;
DROP POLICY IF EXISTS "registros_update" ON registros;
DROP POLICY IF EXISTS "registros_delete" ON registros;
DROP POLICY IF EXISTS "registros_read_all_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_write_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_update_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_delete_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_read_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_insert_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_update_own_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_delete_own_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_select_all_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_select_auth" ON registros;
DROP POLICY IF EXISTS "registros_insert_all" ON registros;
DROP POLICY IF EXISTS "registros_update_all" ON registros;
DROP POLICY IF EXISTS "registros_delete_all" ON registros;
DROP POLICY IF EXISTS "registros_allow_all" ON registros;
`;

const createPolicies = `
CREATE POLICY "registros_select" ON registros FOR SELECT USING (true);
CREATE POLICY "registros_insert" ON registros FOR INSERT WITH CHECK (true);
CREATE POLICY "registros_update" ON registros FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "registros_delete" ON registros FOR DELETE USING (true);
`;

const verifySql = `
SELECT policyname, permissive, qual, with_check FROM pg_policies WHERE tablename = 'registros' ORDER BY policyname;
`;

async function applyFix() {
  try {
    console.log('🔄 Removendo policies antigas...');
    const dropResult = await supabase.rpc('exec_sql', { query: dropPolicies });
    if (dropResult.error) {
      console.log('⚠️ Alguns DROP POLICY podem ter falhado (esperado):', dropResult.error.message);
    } else {
      console.log('✅ Policies antigas removidas');
    }

    console.log('\n🔄 Criando policies permissivas...');
    const createResult = await supabase.rpc('exec_sql', { query: createPolicies });
    if (createResult.error) {
      console.error('❌ Erro ao criar policies:', createResult.error.message);
      return;
    }
    console.log('✅ Policies permissivas criadas');

    console.log('\n🔍 Verificando policies...');
    const verifyResult = await supabase.rpc('exec_sql', { query: verifySql });
    if (verifyResult.error) {
      console.error('❌ Erro ao verificar:', verifyResult.error.message);
    } else {
      console.log('✅ Verificação completa:');
      console.log(JSON.stringify(verifyResult.data, null, 2));
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

applyFix();
