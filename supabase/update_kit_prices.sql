-- ============================================================
-- Atualizar valores dos kits CVE Education
-- Infantil: R$ 1.046,26 | Fundamental: R$ 1.302,15
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Dropar a view que depende da coluna antes de recriar a coluna
DROP VIEW IF EXISTS escolas_resumo;

-- 2. Recriar a coluna potencial_financeiro com novos valores
ALTER TABLE escolas DROP COLUMN IF EXISTS potencial_financeiro;
ALTER TABLE escolas
  ADD COLUMN potencial_financeiro numeric(12,2) GENERATED ALWAYS AS (
    qtd_infantil * 1046.26 +
    qtd_fund1    * 1302.15 +
    qtd_fund2    * 1302.15 +
    qtd_medio    * 1302.15
  ) STORED;

-- 3. Recriar a view escolas_resumo
CREATE OR REPLACE VIEW escolas_resumo AS
SELECT
  e.*,
  r_last.data_contato    AS ultimo_contato,
  r_last.classificacao   AS classificacao_atual,
  r_last.probabilidade   AS probabilidade_atual,
  p.full_name            AS responsavel_nome
FROM escolas e
LEFT JOIN profiles p ON p.id = e.responsavel_id
LEFT JOIN LATERAL (
  SELECT data_contato, classificacao, probabilidade
  FROM registros
  WHERE escola_id = e.id
  ORDER BY data_contato DESC, created_at DESC
  LIMIT 1
) r_last ON true;

-- 4. Atualizar trigger de cálculo de métricas nos registros
CREATE OR REPLACE FUNCTION calcular_metricas_registro()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  p_interesse   int;
  p_prontidao   int;
  p_abertura    int;
  bonus         int;
  base_prob     numeric;
BEGIN
  new.potencial_financeiro := ROUND(
    new.qtd_infantil * 1046.26 +
    new.qtd_fund1    * 1302.15 +
    new.qtd_fund2    * 1302.15 +
    new.qtd_medio    * 1302.15
  );

  p_interesse := CASE new.interesse
    WHEN 'muito_baixo' THEN 5  WHEN 'baixo' THEN 15
    WHEN 'medio' THEN 35       WHEN 'alto' THEN 65  WHEN 'muito_alto' THEN 85
    ELSE 35 END;
  p_prontidao := CASE new.prontidao
    WHEN 'parada' THEN 0           WHEN 'nova_reuniao' THEN 10
    WHEN 'esperando_retorno' THEN 20 WHEN 'apresentacao' THEN 35
    WHEN 'contrato_enviado' THEN 60  WHEN 'atualizar_contrato' THEN 70
    WHEN 'contrato_assinado' THEN 100 WHEN 'parceiro_ativo' THEN 100
    ELSE 20 END;
  p_abertura := CASE new.abertura
    WHEN 'nenhuma' THEN 0 WHEN 'baixa' THEN 10 WHEN 'media' THEN 30 WHEN 'alta' THEN 60
    ELSE 30 END;
  bonus := LEAST(COALESCE(array_length(new.encaminhamentos, 1), 0) * 5, 20);
  base_prob := p_interesse * 0.35 + p_prontidao * 0.45 + p_abertura * 0.20 + bonus;
  new.probabilidade := LEAST(base_prob::int, 100);

  new.classificacao := CASE
    WHEN new.probabilidade >= 80 AND new.potencial_financeiro >= 26044 THEN 'quente'::classificacao_lead
    WHEN new.probabilidade >= 50 AND new.potencial_financeiro >= 13022 THEN 'morno'::classificacao_lead
    ELSE 'frio'::classificacao_lead
  END;

  RETURN new;
END;
$$;

SELECT 'Kits atualizados + view recriada ✅ Infantil: R$1.046,26 | Fundamental: R$1.302,15' AS resultado;
