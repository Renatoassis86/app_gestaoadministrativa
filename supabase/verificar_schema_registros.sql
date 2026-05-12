-- ============================================================
-- VERIFICAR SCHEMA DA TABELA REGISTROS
-- ============================================================

-- QUERY 1: Ver todas as colunas da tabela registros
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'registros'
ORDER BY ordinal_position;

-- ============================================================
-- QUERY 2: Ver constraints da tabela registros
-- ============================================================
SELECT
  constraint_name,
  constraint_type,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'registros'
ORDER BY constraint_name;

-- ============================================================
-- QUERY 3: Contar registros total
-- ============================================================
SELECT COUNT(*) as total_registros FROM registros;

-- ============================================================
-- QUERY 4: Ver um registro de exemplo (primeiros 5 campos)
-- ============================================================
SELECT
  id,
  escola_id,
  data_contato,
  resumo,
  created_at
FROM registros
LIMIT 1;

-- ============================================================
-- QUERY 5: Verificar se há registros com escola_id NULL
-- ============================================================
SELECT COUNT(*) as registros_sem_escola
FROM registros
WHERE escola_id IS NULL;

-- ============================================================
-- QUERY 6: Listar todos os profiles (para encontrar Jesse)
-- ============================================================
SELECT
  id,
  email,
  full_name,
  role
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================
-- QUERY 7: Listar últimos 10 registros criados
-- ============================================================
SELECT
  r.id,
  r.escola_id,
  e.nome as escola_nome,
  r.resumo,
  r.data_contato,
  r.created_at,
  p.email as criado_por
FROM registros r
LEFT JOIN escolas e ON r.escola_id = e.id
LEFT JOIN profiles p ON r.created_by = p.id
ORDER BY r.created_at DESC
LIMIT 10;
