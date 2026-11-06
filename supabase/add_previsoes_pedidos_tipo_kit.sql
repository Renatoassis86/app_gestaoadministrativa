-- ============================================================
-- Gestão de Pedidos — tipos de kit por série
-- Cada série passa a ter 3 quantidades:
--   <serie>_qtd             = Kit completo (coluna já existente — previsões antigas continuam valendo como kit completo)
--   <serie>_sem_ingles_qtd  = Kit sem Inglês
--   <serie>_so_ingles_qtd   = Só livro de Inglês
--
-- Seguro para rodar mais de uma vez (add column if not exists) e não altera dados nem políticas RLS.
-- RODAR ANTES de publicar o código novo: o formulário público passa a gravar estas colunas.
-- ============================================================

alter table previsoes_pedidos
  add column if not exists infantil2_sem_ingles_qtd   int not null default 0,
  add column if not exists infantil3_sem_ingles_qtd   int not null default 0,
  add column if not exists infantil4_sem_ingles_qtd   int not null default 0,
  add column if not exists infantil5_sem_ingles_qtd   int not null default 0,
  add column if not exists fund1_ano1_sem_ingles_qtd  int not null default 0,
  add column if not exists fund1_ano2_sem_ingles_qtd  int not null default 0,
  add column if not exists fund1_ano3_sem_ingles_qtd  int not null default 0,
  add column if not exists fund1_ano4_sem_ingles_qtd  int not null default 0,
  add column if not exists fund1_ano5_sem_ingles_qtd  int not null default 0,

  add column if not exists infantil2_so_ingles_qtd    int not null default 0,
  add column if not exists infantil3_so_ingles_qtd    int not null default 0,
  add column if not exists infantil4_so_ingles_qtd    int not null default 0,
  add column if not exists infantil5_so_ingles_qtd    int not null default 0,
  add column if not exists fund1_ano1_so_ingles_qtd   int not null default 0,
  add column if not exists fund1_ano2_so_ingles_qtd   int not null default 0,
  add column if not exists fund1_ano3_so_ingles_qtd   int not null default 0,
  add column if not exists fund1_ano4_so_ingles_qtd   int not null default 0,
  add column if not exists fund1_ano5_so_ingles_qtd   int not null default 0;

-- Faz a API do Supabase (PostgREST) enxergar as colunas novas imediatamente
notify pgrst, 'reload schema';

select 'Colunas de tipo de kit adicionadas em previsoes_pedidos ✅' as resultado;
