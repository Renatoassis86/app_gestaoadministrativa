-- Adiciona ao formulário público de pré-cadastro (tabela `formularios`)
-- duas perguntas novas sobre o perfil financeiro da escola:
--   - ticket médio da mensalidade paga pelos alunos
--   - valor médio investido atualmente no sistema de ensino em uso
--
-- Aplicar manualmente no SQL Editor do Supabase (projeto do comercial_nextjs,
-- lyisdsnocroocxfblvqf.supabase.co). Depois de aplicar, fazer deploy do
-- código atualizado (formulario/page.tsx, lib/actions.ts, PropostasList.tsx,
-- propostas-actions.ts) — os campos são opcionais (nullable), então a coluna
-- sozinha é inofensiva antes do deploy.

ALTER TABLE formularios ADD COLUMN IF NOT EXISTS ticket_medio_mensalidade numeric(10,2);
ALTER TABLE formularios ADD COLUMN IF NOT EXISTS investimento_sistema_atual numeric(10,2);

select 'Colunas financeiras adicionadas a formularios ✅' as resultado;
