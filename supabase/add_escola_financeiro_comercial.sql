-- Novos campos da dimensão financeiro/comercial em escolas, preenchidos
-- progressivamente pelos consultores (e, quando disponível, pré-preenchidos
-- a partir da pesquisa CIECC — ver scripts/backfill-escolas-porte.mjs).

alter table escolas add column if not exists mensalidade_media numeric(10,2);
alter table escolas add column if not exists sistema_ensino_atual text;
alter table escolas add column if not exists satisfacao_sistema_atual text;

select 'Campos financeiro/comercial adicionados a escolas ✅' as resultado;
