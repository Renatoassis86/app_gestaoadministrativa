-- ============================================================
-- DIAGNÓSTICO: Por que o registro de Jesse não aparece?
-- ============================================================
-- Execute estas queries no Supabase SQL Editor para diagnosticar

-- 1. Verificar se registro existe
SELECT
  r.id,
  r.escola_id,
  e.nome as escola_nome,
  r.resumo,
  r.data_contato,
  r.created_by,
  p.email as created_by_email,
  r.created_at,
  r.updated_at
FROM registros r
LEFT JOIN escolas e ON r.escola_id = e.id
LEFT JOIN profiles p ON r.created_by = p.id
WHERE p.email LIKE '%jesse%'
   OR e.nome LIKE '%Batista%'
ORDER BY r.created_at DESC
LIMIT 20;

-- 2. Verificar RLS - Pode o usuário LOGADO ver seus próprios registros?
-- (Execute COMO Jesse - adicionar auth.uid() do usuário)
SELECT
  r.id,
  r.escola_id,
  r.resumo,
  r.created_by,
  auth.uid() as "Seu UID",
  CASE WHEN r.created_by = auth.uid() THEN 'SIM' ELSE 'NÃO' END as "É seu registro?"
FROM registros r
WHERE r.created_by = auth.uid()
LIMIT 5;

-- 3. Verificar ESCOLAS - Colégio Batista de Itaboraí existe?
SELECT
  id,
  nome,
  ativa,
  created_at
FROM escolas
WHERE nome LIKE '%Batista%' OR nome LIKE '%Itaboraí%'
LIMIT 10;

-- 4. Contar registros por escola
SELECT
  e.id,
  e.nome,
  COUNT(r.id) as total_registros,
  MAX(r.created_at) as ultimo_registro
FROM escolas e
LEFT JOIN registros r ON e.id = r.escola_id
WHERE e.ativa = true
GROUP BY e.id, e.nome
ORDER BY COUNT(r.id) DESC
LIMIT 10;

-- 5. Verificar se há registros com escola_id NULL (problema!)
SELECT
  r.id,
  r.resumo,
  r.escola_id,
  r.created_by,
  p.email,
  r.created_at
FROM registros r
LEFT JOIN profiles p ON r.created_by = p.id
WHERE r.escola_id IS NULL
LIMIT 10;

-- 6. Verificar se há registros com ativa = false (soft delete)
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN ativa = true THEN 1 END) as ativos,
  COUNT(CASE WHEN ativa = false THEN 1 END) as inativos
FROM registros;

-- 7. Verificar políticas RLS ativas
SELECT * FROM pg_policies WHERE tablename = 'registros';

-- ============================================================
-- INTERPRETAÇÃO DOS RESULTADOS:
-- ============================================================
-- Query 1: Se vazio → registro não foi inserido no banco
-- Query 1: Se tem dados → verifique escola_id e data_contato
-- Query 2: Se vazio com seu UID → problema RLS
-- Query 3: Se vazio → escola não existe, talvez nome diferente
-- Query 4: Mostra distribuição de registros
-- Query 5: Se tem dados → problema crítico (escola_id NULL)
-- Query 6: Se inativos > 0 → há soft deletes

-- ============================================================
-- AÇÃO RECOMENDADA:
-- ============================================================
-- 1. Execute query 1 primeiro
-- 2. Se vazio: o formulário não salvou, verificar logs do front
-- 3. Se tem dados: execute query 2 e 3 para validar
-- 4. Se RLS está bloqueando: aplicar rls_permissivo_completo.sql
