-- Diagnóstico: mostra todos os stages distintos na tabela
SELECT stage, count(*) as total
FROM negociacoes
GROUP BY stage
ORDER BY total DESC;

-- Corrige stages que não batem com os valores esperados
UPDATE negociacoes
SET stage = 'prospeccao'
WHERE stage NOT IN ('prospeccao','qualificacao','apresentacao','proposta','negociacao','fechamento','ganho','perdido');

-- Confirma resultado
SELECT stage, count(*) FROM negociacoes GROUP BY stage ORDER BY stage;
