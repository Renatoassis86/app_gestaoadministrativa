-- ============================================================
-- FIX DEFINITIVO: GARANTIR QUE REGISTROS APARECEM NAS JORNADAS
-- ============================================================
-- Problema: Registros salvam mas não aparecem em jornada-visual e jornada
-- Causa: RLS policies podem estar bloqueando SELECT com filtros
-- Solução: Políticas mais permissivas para leitura autenticada
-- ============================================================

-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "registros_allow_all" ON registros;
DROP POLICY IF EXISTS "registros_insert_all" ON registros;
DROP POLICY IF EXISTS "registros_update_all" ON registros;
DROP POLICY IF EXISTS "registros_delete_all" ON registros;
DROP POLICY IF EXISTS "registros_select_auth" ON registros;
DROP POLICY IF EXISTS "registros_insert_auth" ON registros;
DROP POLICY IF EXISTS "registros_update_own" ON registros;
DROP POLICY IF EXISTS "registros_delete_own" ON registros;

-- 2. CRIAR NOVAS POLÍTICAS - MAIS PERMISSIVAS PARA LEITURA
-- SELECT: Qualquer usuário autenticado pode ler TODOS os registros
-- (Importante para que as jornadas visualem os registros)
CREATE POLICY "registros_select_all_authenticated" ON registros
FOR SELECT USING (
  auth.role() = 'authenticated' OR auth.role() = 'service_role'
);

-- INSERT: Usuários autenticados podem criar registros
CREATE POLICY "registros_insert_authenticated" ON registros
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' OR auth.role() = 'service_role'
);

-- UPDATE: Apenas o criador ou admin pode atualizar
CREATE POLICY "registros_update_own_or_admin" ON registros
FOR UPDATE USING (
  created_by = auth.uid() OR auth.role() = 'service_role'
);

-- DELETE: Apenas o criador ou admin pode deletar
CREATE POLICY "registros_delete_own_or_admin" ON registros
FOR DELETE USING (
  created_by = auth.uid() OR auth.role() = 'service_role'
);

-- 3. GARANTIR RLS ATIVADO
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- VERIFICAÇÕES
-- ============================================================

-- Verificar se RLS está ativado
SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'registros';

-- Verificar políticas criadas
SELECT tablename, policyname, qual, with_check
FROM pg_policies
WHERE tablename = 'registros'
ORDER BY policyname;

-- ============================================================
-- RESULTADO ESPERADO:
-- ✅ Usuários autenticados conseguem ler TODOS os registros (para jornadas)
-- ✅ Usuários autenticados conseguem criar novos registros
-- ✅ Apenas criador pode editar/deletar
-- ✅ Admin (service_role) tem acesso total
-- ============================================================

-- Testes de validação (copie e execute um de cada vez):
-- 1. Ver quantos registros existem:
--    SELECT COUNT(*) FROM registros;

-- 2. Ver registros de uma escola específica:
--    SELECT id, escola_id, contato_nome, data_contato FROM registros WHERE escola_id = 'seu-uuid-aqui';

-- 3. Ver últimos registros:
--    SELECT id, escola_id, contato_nome, data_contato FROM registros ORDER BY created_at DESC LIMIT 5;
