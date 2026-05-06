-- ============================================================
-- Adicionar colunas de turmas detalhadas na tabela escolas
-- Execute no Editor SQL do Supabase
-- ============================================================

-- Fundamental I (ano a ano)
do $$ begin alter table escolas add column qtd_fund1_ano1 int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_fund1_ano2 int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_fund1_ano3 int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_fund1_ano4 int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_fund1_ano5 int not null default 0; exception when duplicate_column then null; end $$;

-- Fundamental II (ano a ano)
do $$ begin alter table escolas add column qtd_fund2_ano6 int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_fund2_ano7 int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_fund2_ano8 int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_fund2_ano9 int not null default 0; exception when duplicate_column then null; end $$;

-- Ensino Médio (série a série)
do $$ begin alter table escolas add column qtd_medio_1s int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_medio_2s int not null default 0; exception when duplicate_column then null; end $$;
do $$ begin alter table escolas add column qtd_medio_3s int not null default 0; exception when duplicate_column then null; end $$;

select 'Colunas de turmas adicionadas com sucesso ✅' as resultado;
