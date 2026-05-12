-- ============================================================
-- DIAGNÓSTICO DE RLS NA TABELA REGISTROS
-- ============================================================

-- 1. Verificar se RLS está ATIVADO
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'registros';

-- 2. Listar TODAS as políticas existentes
SELECT
  policyname,
  schemaname,
  tablename,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'registros'
ORDER BY policyname;

-- 3. Contar registros na tabela (com acesso service_role)
-- Execute como admin: SELECT COUNT(*) FROM registros;

-- 4. Teste: Ver se um registro específico pode ser lido
-- Substitua 'ID_DO_REGISTRO' pelo ID real de um registro criado
-- SELECT * FROM registros WHERE id = 'ID_DO_REGISTRO' LIMIT 1;

-- 5. Ver os created_by dos registros (para entender se há bloqueio)
SELECT
  id,
  escola_id,
  contato_nome,
  created_by,
  created_at
FROM registros
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================
-- SE NÃO FUNCIONAR, EXECUTE ESTE FIX DEFINITIVO:
-- ============================================================

-- DROP ALL POLICIES
DROP POLICY IF EXISTS "registros_select_all_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_insert_authenticated" ON registros;
DROP POLICY IF EXISTS "registros_update_own_or_admin" ON registros;
DROP POLICY IF EXISTS "registros_delete_own_or_admin" ON registros;

-- CREATE NEW POLICIES - SUPER PERMISSIVE FOR AUTHENTICATED USERS
CREATE POLICY "registros_read_authenticated" ON registros
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "registros_insert_authenticated" ON registros
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "registros_update_authenticated" ON registros
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "registros_delete_authenticated" ON registros
FOR DELETE
TO authenticated
USING (true);

-- VERIFY
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

SELECT tablename, policyname FROM pg_policies WHERE tablename = 'registros' ORDER BY policyname;
