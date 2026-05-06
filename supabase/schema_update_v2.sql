-- ============================================================
-- CVE Gestão Comercial — Update v2
-- Expansão para atender até 5º Ano Fundamental I
-- Execute no Editor SQL do Supabase
-- ============================================================

-- ============================================================
-- 1. FORMULÁRIOS — adicionar campos até 5º Ano Fund I
-- ============================================================

-- Adicionar anos 2, 3, 4, 5 do Fundamental I (que ainda não existem)
do $$ begin
  alter table formularios add column fund1_ano2_qtd int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table formularios add column fund1_ano3_qtd int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table formularios add column fund1_ano4_qtd int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table formularios add column fund1_ano5_qtd int not null default 0;
exception when duplicate_column then null; end $$;

-- ============================================================
-- 2. CONTRATOS — expandir para até 5º Ano Fund I
-- ============================================================

do $$ begin
  alter table contratos add column fund1_ano2_qtd   int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table contratos add column fund1_ano2_valor  numeric(10,2) not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table contratos add column fund1_ano3_qtd   int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table contratos add column fund1_ano3_valor  numeric(10,2) not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table contratos add column fund1_ano4_qtd   int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table contratos add column fund1_ano4_valor  numeric(10,2) not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table contratos add column fund1_ano5_qtd   int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table contratos add column fund1_ano5_valor  numeric(10,2) not null default 0;
exception when duplicate_column then null; end $$;

-- Recriar valor_total incluindo os novos anos (drop e recriar a generated column)
-- NOTA: Não é possível alterar generated columns diretamente no PG — usar trigger

create or replace function calcular_valor_total_contrato()
returns trigger language plpgsql as $$
begin
  new.valor_total_calculado :=
    coalesce(new.infantil2_qtd,0) * coalesce(new.infantil2_valor,0) +
    coalesce(new.infantil3_qtd,0) * coalesce(new.infantil3_valor,0) +
    coalesce(new.infantil4_qtd,0) * coalesce(new.infantil4_valor,0) +
    coalesce(new.infantil5_qtd,0) * coalesce(new.infantil5_valor,0) +
    coalesce(new.fund1_ano1_qtd,0) * coalesce(new.fund1_ano1_valor,0) +
    coalesce(new.fund1_ano2_qtd,0) * coalesce(new.fund1_ano2_valor,0) +
    coalesce(new.fund1_ano3_qtd,0) * coalesce(new.fund1_ano3_valor,0) +
    coalesce(new.fund1_ano4_qtd,0) * coalesce(new.fund1_ano4_valor,0) +
    coalesce(new.fund1_ano5_qtd,0) * coalesce(new.fund1_ano5_valor,0);
  return new;
end;
$$;

-- Adicionar coluna calculada por trigger (não generated, mais flexível)
do $$ begin
  alter table contratos add column valor_total_calculado numeric(12,2) default 0;
exception when duplicate_column then null; end $$;

drop trigger if exists before_contrato_valor on contratos;
create trigger before_contrato_valor
  before insert or update on contratos
  for each row execute procedure calcular_valor_total_contrato();

-- ============================================================
-- 3. ESCOLAS — adicionar campos de série mais detalhados
-- ============================================================

-- Detalhar por série (compatível com contrato)
do $$ begin
  alter table escolas add column qtd_infantil2 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_infantil3 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_infantil4 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_infantil5 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_fund1_ano1 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_fund1_ano2 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_fund1_ano3 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_fund1_ano4 int not null default 0;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column qtd_fund1_ano5 int not null default 0;
exception when duplicate_column then null; end $$;

-- ============================================================
-- 4. AUDIT LOG — rastreabilidade completa de ações
-- ============================================================

create table if not exists audit_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete set null,
  user_email  text,
  action      text not null,      -- 'INSERT' | 'UPDATE' | 'DELETE'
  table_name  text not null,
  record_id   uuid,
  old_data    jsonb,
  new_data    jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_audit_log_user_id    on audit_log(user_id);
create index if not exists idx_audit_log_table_name on audit_log(table_name);
create index if not exists idx_audit_log_created_at on audit_log(created_at desc);

alter table audit_log enable row level security;
create policy "Gerente lê audit log" on audit_log for select using (
  (select role from profiles where id = auth.uid()) = 'gerente'
);
create policy "Sistema insere audit log" on audit_log for insert with check (true);

-- ============================================================
-- 5. NOTIFICAÇÕES — alertas internos da plataforma
-- ============================================================

create table if not exists notificacoes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  titulo      text not null,
  mensagem    text,
  tipo        text not null default 'info',  -- 'info' | 'warning' | 'success' | 'danger'
  lida        boolean not null default false,
  link        text,                          -- URL opcional para navegar
  created_at  timestamptz not null default now()
);

create index if not exists idx_notificacoes_user_id on notificacoes(user_id);
create index if not exists idx_notificacoes_lida    on notificacoes(lida);

alter table notificacoes enable row level security;
create policy "Usuário vê próprias notificações" on notificacoes for select using (user_id = auth.uid());
create policy "Usuário atualiza próprias notificações" on notificacoes for update using (user_id = auth.uid());
create policy "Sistema insere notificações" on notificacoes for insert with check (true);

-- ============================================================
-- 6. RECRIAR VIEW escolas_resumo (DROP + CREATE para evitar erro de coluna)
-- ============================================================

-- DROP necessário pois CREATE OR REPLACE não permite mudar nomes de colunas
drop view if exists escolas_resumo;

create view escolas_resumo as
select
  e.*,
  r_last.data_contato    as ultimo_contato,
  r_last.classificacao   as classificacao_atual,
  r_last.probabilidade   as probabilidade_atual,
  p.full_name            as responsavel_nome
from escolas e
left join profiles p on p.id = e.responsavel_id
left join lateral (
  select data_contato, classificacao, probabilidade
  from registros
  where escola_id = e.id
  order by data_contato desc, created_at desc
  limit 1
) r_last on true;

-- ============================================================
-- 7. ÍNDICES ADICIONAIS para performance
-- ============================================================

create index if not exists idx_registros_created_at     on registros(created_at desc);
create index if not exists idx_tarefas_escola_status     on tarefas(escola_id, status);
create index if not exists idx_negociacoes_escola_ativa  on negociacoes(escola_id, ativa);
create index if not exists idx_contratos_escola_id       on contratos(escola_id);
create index if not exists idx_formularios_created_at    on formularios(data_envio desc);

-- ============================================================
-- FIM
-- ============================================================
select 'Schema v2 aplicado com sucesso! Campos até 5º Ano adicionados. ✅' as resultado;
