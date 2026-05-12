-- ============================================================
-- ENCONTRAR REGISTRO DE JESSE - DIRETO AO PONTO
-- ============================================================

-- QUERY 1: Encontrar Jesse no banco
SELECT
  id,
  email,
  full_name,
  role
FROM profiles
WHERE email ILIKE '%jesse%'
   OR full_name ILIKE '%jesse%';

-- ============================================================
-- Copie o ID de Jesse acima e substitua em JESSE_ID abaixo
-- ============================================================

-- QUERY 2: Encontrar TODOS os registros criados por Jesse
SELECT
  r.id,
  r.escola_id,
  e.nome as escola,
  r.resumo,
  r.data_contato,
  r.created_at,
  r.classificacao,
  r.ativa
FROM registros r
LEFT JOIN escolas e ON r.escola_id = e.id
WHERE r.created_by = 'SUBSTITUA_COM_JESSE_ID_ACIMA'
ORDER BY r.created_at DESC;

-- ============================================================
-- QUERY 3: Se não achar, procure por registros recentes em geral
-- ============================================================
SELECT
  r.id,
  r.escola_id,
  e.nome as escola,
  r.resumo,
  r.data_contato,
  r.created_at,
  p.email as criado_por,
  r.classificacao
FROM registros r
LEFT JOIN escolas e ON r.escola_id = e.id
LEFT JOIN profiles p ON r.created_by = p.id
ORDER BY r.created_at DESC
LIMIT 20;

-- ============================================================
-- QUERY 4: Procure especificamente por "Colégio Batista de Itaboraí"
-- ============================================================
SELECT
  r.id,
  r.escola_id,
  r.resumo,
  r.data_contato,
  r.created_at,
  p.email as criado_por,
  r.ativa
FROM registros r
LEFT JOIN escolas e ON r.escola_id = e.id
LEFT JOIN profiles p ON r.created_by = p.id
WHERE e.nome ILIKE '%Batista%'
   OR e.nome ILIKE '%Itaboraí%'
ORDER BY r.created_at DESC;

-- ============================================================
-- QUERY 5: Verificar integridade dos dados
-- ============================================================
SELECT
  COUNT(*) as total_registros,
  COUNT(CASE WHEN escola_id IS NOT NULL THEN 1 END) as com_escola_valida,
  COUNT(CASE WHEN escola_id IS NULL THEN 1 END) as com_escola_null,
  COUNT(CASE WHEN ativa = true THEN 1 END) as ativos,
  COUNT(CASE WHEN ativa = false THEN 1 END) as inativos
FROM registros;

-- ============================================================
-- QUERY 6: Se encontrou o registro, verifique a escola
-- ============================================================
-- Após executar QUERY 2 ou 4, pegue um escola_id e execute:
SELECT
  id,
  nome,
  ativa,
  created_at
FROM escolas
WHERE id = 'SUBSTITUA_COM_ESCOLA_ID_DO_REGISTRO_ACIMA';

-- ============================================================
-- QUERY 7: Verifique RLS - pode acessar o registro?
-- ============================================================
SELECT
  r.id,
  r.resumo,
  CASE WHEN r.created_by = auth.uid() THEN 'SIM - é seu'
       ELSE 'NÃO - é de outro'
  END as pode_ver
FROM registros r
WHERE r.id = 'SUBSTITUA_COM_ID_DO_REGISTRO_ENCONTRADO'
LIMIT 1;
