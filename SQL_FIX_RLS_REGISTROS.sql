-- ============================================================
-- FIX: RLS POLICIES PARA REGISTROS - PERMITIR LEITURA AUTENTICADA
-- ============================================================
-- Problema: Página de sucesso falha ao ler registro com ANON_KEY
-- Solução: Usar RLS que permite authenticated users, não anon key bloqueado
-- ============================================================

-- 1. REMOVER POLÍTICAS ANTIGAS QUE BLOQUEIAM
DROP POLICY IF EXISTS "registros_allow_all" ON registros;
DROP POLICY IF EXISTS "registros_insert_all" ON registros;
DROP POLICY IF EXISTS "registros_update_all" ON registros;
DROP POLICY IF EXISTS "registros_delete_all" ON registros;

-- 2. CRIAR NOVAS POLÍTICAS BASEADAS EM AUTENTICAÇÃO
-- SELECT: Qualquer usuário autenticado pode ver registros
CREATE POLICY "registros_select_auth" ON registros
FOR SELECT USING (
  auth.role() = 'authenticated' OR auth.role() = 'service_role'
);

-- INSERT: Usuários autenticados podem inserir
CREATE POLICY "registros_insert_auth" ON registros
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' OR auth.role() = 'service_role'
);

-- UPDATE: Apenas o criador ou admin pode atualizar
CREATE POLICY "registros_update_own" ON registros
FOR UPDATE USING (
  created_by = auth.uid() OR auth.role() = 'service_role'
);

-- DELETE: Apenas o criador ou admin pode deletar
CREATE POLICY "registros_delete_own" ON registros
FOR DELETE USING (
  created_by = auth.uid() OR auth.role() = 'service_role'
);

-- 3. GARANTIR QUE RLS ESTÁ ATIVADO
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RESULTADO ESPERADO:
-- ✅ Usuários autenticados conseguem ver registros
-- ✅ Página de sucesso consegue ler dados após inserção
-- ✅ Admin (service_role) tem acesso total
-- ============================================================
