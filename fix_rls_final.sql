-- REMOVER TODAS AS POLICIES EXISTENTES
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

-- CRIAR POLICIES PERMISSIVAS
CREATE POLICY "registros_select" ON registros FOR SELECT USING (true);
CREATE POLICY "registros_insert" ON registros FOR INSERT WITH CHECK (true);
CREATE POLICY "registros_update" ON registros FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "registros_delete" ON registros FOR DELETE USING (true);

-- VERIFICAR
SELECT policyname, permissive, qual, with_check FROM pg_policies WHERE tablename = 'registros' ORDER BY policyname;
