-- ============================================================
-- EXECUTE AGORA NO SUPABASE SQL EDITOR
-- Resolve RLS bloqueando SELECT na tabela negociacoes
-- ============================================================

-- 1. Remove TODAS as políticas existentes na tabela
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies WHERE tablename = 'negociacoes'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON negociacoes', pol.policyname);
    RAISE NOTICE 'Removida política: %', pol.policyname;
  END LOOP;
END;
$$;

-- 2. Cria política única e simples: acesso total para autenticados
ALTER TABLE negociacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acesso_total_autenticados" ON negociacoes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Verifica resultado
SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'negociacoes';

-- 4. Teste direto: deve retornar os registros
SELECT id, stage, titulo, ativa, escola_id FROM negociacoes ORDER BY created_at DESC LIMIT 10;

SELECT count(*) as total_negociacoes FROM negociacoes;
