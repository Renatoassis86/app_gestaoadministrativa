-- Padroniza soft-delete: `escolas` e `negociacoes` já usam a coluna
-- `ativa boolean` para esconder registros "apagados" sem perder o
-- histórico; `registros`, `notas_escola` e `contatos_escola` ainda faziam
-- DELETE físico. Este arquivo estende o mesmo padrão a essas 3 tabelas.
--
-- `tarefas` foi deixada de fora de propósito: já tem um mecanismo
-- equivalente e em uso (`status = 'cancelada'`/'concluida'`), e todas as
-- 8 consultas de leitura já filtram por `status`. Adicionar `ativa`
-- também ali criaria dois mecanismos sobrepostos para a mesma coisa.
--
-- Aplicar manualmente no SQL Editor do Supabase. Depois de aplicar,
-- fazer deploy do código atualizado (src/lib/actions.ts e as páginas que
-- passaram a filtrar `ativa = true`) na mesma janela — a coluna sozinha
-- é inofensiva (default true, nada muda), mas o DELETE físico só vira
-- soft-delete de fato depois do deploy do código.

ALTER TABLE registros ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;
ALTER TABLE notas_escola ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;
ALTER TABLE contatos_escola ADD COLUMN IF NOT EXISTS ativa boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_registros_ativa ON registros(ativa);
CREATE INDEX IF NOT EXISTS idx_notas_escola_ativa ON notas_escola(ativa);
CREATE INDEX IF NOT EXISTS idx_contatos_escola_ativa ON contatos_escola(ativa);

select 'Colunas ativa adicionadas a registros/notas_escola/contatos_escola ✅' as resultado;
