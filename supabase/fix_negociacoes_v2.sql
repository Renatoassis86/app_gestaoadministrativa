-- ============================================================
-- FIX v2: Corrige tabela negociacoes — execute no Supabase SQL Editor
-- ============================================================

-- PASSO 1: Verifica o que existe no banco
select
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_name = 'negociacoes'
order by ordinal_position;

-- PASSO 2: Verifica registros existentes
select id, escola_id, stage, titulo, ativa, created_at
from negociacoes
order by created_at desc
limit 20;

-- PASSO 3: Garante que a coluna stage aceita os valores corretos
-- Se stage for enum, converte para text
DO $$
DECLARE
  col_type text;
BEGIN
  SELECT udt_name INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'negociacoes' AND column_name = 'stage';

  IF col_type = 'stage_negociacao' THEN
    -- Converte enum para text mantendo os dados
    ALTER TABLE negociacoes
      ALTER COLUMN stage TYPE text USING stage::text;
    RAISE NOTICE 'Coluna stage convertida de enum para text';
  ELSE
    RAISE NOTICE 'Coluna stage já é do tipo: %', col_type;
  END IF;
END;
$$;

-- PASSO 4: Garante coluna ativa com default true
ALTER TABLE negociacoes
  ALTER COLUMN ativa SET DEFAULT true,
  ALTER COLUMN ativa SET NOT NULL;

-- Corrige registros onde ativa é NULL
UPDATE negociacoes SET ativa = true WHERE ativa IS NULL;

-- PASSO 5: Remove constraints que possam estar bloqueando
-- (verifica se há unique constraint em escola_id)
DO $$
DECLARE
  rec record;
BEGIN
  FOR rec IN
    SELECT constraint_name
    FROM information_schema.table_constraints
    WHERE table_name = 'negociacoes'
      AND constraint_type = 'UNIQUE'
  LOOP
    RAISE NOTICE 'Unique constraint encontrada: %', rec.constraint_name;
  END LOOP;
END;
$$;

-- PASSO 6: RLS permissivo para usuários autenticados
ALTER TABLE negociacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Selecionar negociações" ON negociacoes;
DROP POLICY IF EXISTS "Inserir negociações" ON negociacoes;
DROP POLICY IF EXISTS "Atualizar negociações" ON negociacoes;
DROP POLICY IF EXISTS "Deletar negociações" ON negociacoes;

-- Política única: qualquer usuário autenticado tem acesso total
CREATE POLICY "negociacoes_auth_all" ON negociacoes
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- PASSO 7: Teste de inserção manual
-- Substitua o escola_id por um UUID válido da tabela escolas
-- INSERT INTO negociacoes (escola_id, stage, titulo, ativa, created_by)
-- SELECT id, 'prospeccao', 'Teste manual', true, auth.uid()
-- FROM escolas LIMIT 1;

-- PASSO 8: Resultado final
SELECT
  'negociacoes' as tabela,
  count(*) as total,
  count(*) FILTER (WHERE ativa = true) as ativas,
  count(*) FILTER (WHERE ativa = false) as inativas
FROM negociacoes;

SELECT 'Fix v2 concluído ✅' as status;
