-- ============================================================
-- CVE Gestão Comercial — PATCH para banco já iniciado
-- Execute este arquivo se o schema.sql já foi rodado antes
-- e você recebeu o erro "type already exists"
-- ============================================================

-- ============================================================
-- EXTENSÕES (seguro repetir)
-- ============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- ENUMS — criar apenas se não existirem
-- ============================================================
do $$ begin
  create type user_role as enum ('gerente','supervisor','consultor','assistente','readonly');
exception when duplicate_object then null; end $$;

do $$ begin
  create type perfil_pedagogico as enum ('crista_catolica','evangelica','por_principio','crista_classica','convencional','outro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type origem_lead as enum ('feira','instagram','network','envio_material','opening_company','abeka','acsi','congresso_ecc','indicacao_escola','outros');
exception when duplicate_object then null; end $$;

do $$ begin
  create type meio_contato as enum ('presencial','whatsapp','email','telefone','videoconf','outro');
exception when duplicate_object then null; end $$;

do $$ begin
  create type nivel_interesse as enum ('muito_baixo','baixo','medio','alto','muito_alto');
exception when duplicate_object then null; end $$;

do $$ begin
  create type prontidao_negociacao as enum ('parada','nova_reuniao','esperando_retorno','apresentacao','contrato_enviado','atualizar_contrato','contrato_assinado','parceiro_ativo');
exception when duplicate_object then null; end $$;

do $$ begin
  create type abertura_propostal as enum ('nenhuma','baixa','media','alta');
exception when duplicate_object then null; end $$;

do $$ begin
  create type classificacao_lead as enum ('quente','morno','frio');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stage_negociacao as enum ('prospeccao','qualificacao','apresentacao','proposta','negociacao','fechamento','ganho','perdido');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tarefa_prioridade as enum ('baixa','media','alta','urgente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tarefa_status as enum ('pendente','concluida','cancelada');
exception when duplicate_object then null; end $$;

-- ============================================================
-- FUNÇÕES AUXILIARES
-- ============================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function my_role()
returns user_role language sql security definer stable as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_supervisor()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role in ('gerente','supervisor') from profiles where id = auth.uid()),
    false
  )
$$;

create or replace function calcular_metricas_registro()
returns trigger language plpgsql as $$
declare
  p_interesse   int;
  p_prontidao   int;
  p_abertura    int;
  bonus         int;
  base_prob     numeric;
begin
  new.potencial_financeiro := new.qtd_infantil * 500 + new.qtd_fund1 * 600 +
                               new.qtd_fund2 * 700 + new.qtd_medio * 800;
  p_interesse := case new.interesse
    when 'muito_baixo' then 5  when 'baixo' then 15
    when 'medio' then 35       when 'alto' then 65  when 'muito_alto' then 85
    else 35 end;
  p_prontidao := case new.prontidao
    when 'parada' then 0           when 'nova_reuniao' then 10
    when 'esperando_retorno' then 20 when 'apresentacao' then 35
    when 'contrato_enviado' then 60  when 'atualizar_contrato' then 70
    when 'contrato_assinado' then 100 when 'parceiro_ativo' then 100
    else 20 end;
  p_abertura := case new.abertura
    when 'nenhuma' then 0 when 'baixa' then 10 when 'media' then 30 when 'alta' then 60
    else 30 end;
  bonus := least(coalesce(array_length(new.encaminhamentos, 1), 0) * 5, 20);
  base_prob := p_interesse * 0.35 + p_prontidao * 0.45 + p_abertura * 0.20 + bonus;
  new.probabilidade := least(base_prob::int, 100);
  new.classificacao := case
    when new.probabilidade >= 80 and new.potencial_financeiro >= 20000 then 'quente'::classificacao_lead
    when new.probabilidade >= 50 and new.potencial_financeiro >= 10000 then 'morno'::classificacao_lead
    else 'frio'::classificacao_lead
  end;
  return new;
end;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  full_name   text not null default '',
  role        user_role not null default 'consultor',
  phone       text,
  region      text,
  avatar_url  text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
  before update on profiles for each row execute procedure set_updated_at();

alter table profiles enable row level security;

drop policy if exists "Usuário vê próprio perfil" on profiles;
drop policy if exists "Gerente vê todos os perfis" on profiles;
drop policy if exists "Usuário atualiza próprio perfil" on profiles;
drop policy if exists "Gerente atualiza qualquer perfil" on profiles;

create policy "Usuário vê próprio perfil"     on profiles for select using (id = auth.uid());
create policy "Gerente vê todos os perfis"    on profiles for select using (is_supervisor());
create policy "Usuário atualiza próprio perfil" on profiles for update using (id = auth.uid());
create policy "Gerente atualiza qualquer perfil" on profiles for update using (
  (select role from profiles where id = auth.uid()) = 'gerente'
);

-- ============================================================
-- ESCOLAS
-- ============================================================
create table if not exists escolas (
  id                  uuid primary key default uuid_generate_v4(),
  nome                text not null,
  cnpj                text,
  perfil_pedagogico   perfil_pedagogico not null default 'convencional',
  escola_paideia      boolean not null default false,
  rua                 text,
  numero              text,
  complemento         text,
  bairro              text,
  cidade              text,
  estado              char(2),
  cep                 text,
  telefone            text,
  email               text,
  site                text,
  contato_nome        text,
  contato_cargo       text,
  diretor_nome        text,
  qtd_infantil        int not null default 0,
  qtd_fund1           int not null default 0,
  qtd_fund2           int not null default 0,
  qtd_medio           int not null default 0,
  origem_lead         origem_lead,
  responsavel_id      uuid references profiles(id) on delete set null,
  observacoes         text,
  ativa               boolean not null default true,
  created_by          uuid references profiles(id) on delete set null,
  updated_by          uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Colunas geradas (ignora se já existirem)
do $$ begin
  alter table escolas add column total_alunos int generated always as
    (qtd_infantil + qtd_fund1 + qtd_fund2 + qtd_medio) stored;
exception when duplicate_column then null; end $$;

do $$ begin
  alter table escolas add column potencial_financeiro int generated always as
    (qtd_infantil * 500 + qtd_fund1 * 600 + qtd_fund2 * 700 + qtd_medio * 800) stored;
exception when duplicate_column then null; end $$;

create index if not exists idx_escolas_nome        on escolas using gin(nome gin_trgm_ops);
create index if not exists idx_escolas_estado      on escolas(estado);
create index if not exists idx_escolas_responsavel on escolas(responsavel_id);
create index if not exists idx_escolas_ativa       on escolas(ativa);

drop trigger if exists set_escolas_updated_at on escolas;
create trigger set_escolas_updated_at before update on escolas for each row execute procedure set_updated_at();

alter table escolas enable row level security;

drop policy if exists "Selecionar escolas" on escolas;
drop policy if exists "Inserir escolas"    on escolas;
drop policy if exists "Atualizar escolas"  on escolas;
drop policy if exists "Deletar escolas (apenas gerente)" on escolas;

create policy "Selecionar escolas" on escolas for select using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);
create policy "Inserir escolas" on escolas for insert with check (auth.uid() is not null);
create policy "Atualizar escolas" on escolas for update using (
  is_supervisor() or responsavel_id = auth.uid()
);
create policy "Deletar escolas (apenas gerente)" on escolas for delete using (
  (select role from profiles where id = auth.uid()) = 'gerente'
);

-- ============================================================
-- CONTATOS DA ESCOLA
-- ============================================================
create table if not exists contatos_escola (
  id          uuid primary key default uuid_generate_v4(),
  escola_id   uuid not null references escolas(id) on delete cascade,
  nome        text not null,
  cargo       text,
  email       text,
  phone       text,
  whatsapp    text,
  principal   boolean not null default false,
  observacoes text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_contatos_escola_id on contatos_escola(escola_id);

alter table contatos_escola enable row level security;

drop policy if exists "Selecionar contatos" on contatos_escola;
drop policy if exists "Inserir/Atualizar contatos" on contatos_escola;

create policy "Selecionar contatos" on contatos_escola for select using (
  is_supervisor() or
  escola_id in (select id from escolas where responsavel_id = auth.uid() or responsavel_id is null)
);
create policy "Inserir/Atualizar contatos" on contatos_escola for all using (auth.uid() is not null);

-- ============================================================
-- NEGOCIAÇÕES
-- ============================================================
create table if not exists negociacoes (
  id                  uuid primary key default uuid_generate_v4(),
  escola_id           uuid not null references escolas(id) on delete cascade,
  titulo              text,
  stage               stage_negociacao not null default 'prospeccao',
  responsavel_id      uuid references profiles(id) on delete set null,
  valor_estimado      numeric(12,2),
  probabilidade       smallint not null default 0 check (probabilidade between 0 and 100),
  previsao_fechamento date,
  motivo_perda        text,
  ativa               boolean not null default true,
  observacoes         text,
  created_by          uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_negociacoes_escola_id  on negociacoes(escola_id);
create index if not exists idx_negociacoes_stage       on negociacoes(stage);
create index if not exists idx_negociacoes_responsavel on negociacoes(responsavel_id);

drop trigger if exists set_negociacoes_updated_at on negociacoes;
create trigger set_negociacoes_updated_at before update on negociacoes for each row execute procedure set_updated_at();

alter table negociacoes enable row level security;

drop policy if exists "Selecionar negociações" on negociacoes;
drop policy if exists "Inserir negociações"    on negociacoes;
drop policy if exists "Atualizar negociações"  on negociacoes;

create policy "Selecionar negociações" on negociacoes for select using (
  is_supervisor() or responsavel_id = auth.uid()
);
create policy "Inserir negociações" on negociacoes for insert with check (auth.uid() is not null);
create policy "Atualizar negociações" on negociacoes for update using (
  is_supervisor() or responsavel_id = auth.uid()
);

-- ============================================================
-- REGISTROS DE INTERAÇÃO
-- ============================================================
create table if not exists registros (
  id                    uuid primary key default uuid_generate_v4(),
  escola_id             uuid not null references escolas(id) on delete cascade,
  negociacao_id         uuid references negociacoes(id) on delete set null,
  data_contato          date not null default current_date,
  hora_contato          time,
  meio_contato          meio_contato not null default 'whatsapp',
  resumo                text not null,
  responsavel_id        uuid references profiles(id) on delete set null,
  contato_nome          text,
  contato_cargo         text,
  interesse             nivel_interesse not null default 'medio',
  prontidao             prontidao_negociacao not null default 'esperando_retorno',
  abertura              abertura_propostal not null default 'media',
  encaminhamentos       text[] not null default '{}',
  qtd_infantil          int not null default 0,
  qtd_fund1             int not null default 0,
  qtd_fund2             int not null default 0,
  qtd_medio             int not null default 0,
  potencial_financeiro  int not null default 0,
  probabilidade         smallint not null default 0,
  classificacao         classificacao_lead not null default 'frio',
  proximo_contato       date,
  notas_internas        text,
  created_by            uuid references profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

drop trigger if exists before_registro_save on registros;
create trigger before_registro_save
  before insert or update on registros
  for each row execute procedure calcular_metricas_registro();

create index if not exists idx_registros_escola_id    on registros(escola_id);
create index if not exists idx_registros_data_contato on registros(data_contato desc);
create index if not exists idx_registros_responsavel  on registros(responsavel_id);
create index if not exists idx_registros_classificacao on registros(classificacao);

drop trigger if exists set_registros_updated_at on registros;
create trigger set_registros_updated_at before update on registros for each row execute procedure set_updated_at();

alter table registros enable row level security;

drop policy if exists "Selecionar registros" on registros;
drop policy if exists "Inserir registros"    on registros;
drop policy if exists "Atualizar registros"  on registros;

create policy "Selecionar registros" on registros for select using (
  is_supervisor() or
  responsavel_id = auth.uid() or
  escola_id in (select id from escolas where responsavel_id = auth.uid() or responsavel_id is null)
);
create policy "Inserir registros" on registros for insert with check (auth.uid() is not null);
create policy "Atualizar registros" on registros for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ============================================================
-- TAREFAS
-- ============================================================
create table if not exists tarefas (
  id              uuid primary key default uuid_generate_v4(),
  escola_id       uuid not null references escolas(id) on delete cascade,
  negociacao_id   uuid references negociacoes(id) on delete set null,
  titulo          text not null,
  descricao       text,
  responsavel_id  uuid references profiles(id) on delete set null,
  vencimento      date,
  prioridade      tarefa_prioridade not null default 'media',
  status          tarefa_status not null default 'pendente',
  concluida_em    timestamptz,
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_tarefas_escola_id   on tarefas(escola_id);
create index if not exists idx_tarefas_responsavel on tarefas(responsavel_id);
create index if not exists idx_tarefas_status      on tarefas(status);
create index if not exists idx_tarefas_vencimento  on tarefas(vencimento);

drop trigger if exists set_tarefas_updated_at on tarefas;
create trigger set_tarefas_updated_at before update on tarefas for each row execute procedure set_updated_at();

alter table tarefas enable row level security;

drop policy if exists "Selecionar tarefas" on tarefas;
drop policy if exists "Inserir tarefas"    on tarefas;
drop policy if exists "Atualizar tarefas"  on tarefas;

create policy "Selecionar tarefas" on tarefas for select using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);
create policy "Inserir tarefas" on tarefas for insert with check (auth.uid() is not null);
create policy "Atualizar tarefas" on tarefas for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ============================================================
-- NOTAS
-- ============================================================
create table if not exists notas_escola (
  id          uuid primary key default uuid_generate_v4(),
  escola_id   uuid not null references escolas(id) on delete cascade,
  texto       text not null,
  fixada      boolean not null default false,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notas_escola_id on notas_escola(escola_id);

alter table notas_escola enable row level security;

drop policy if exists "Selecionar notas" on notas_escola;
drop policy if exists "Inserir notas"    on notas_escola;

create policy "Selecionar notas" on notas_escola for select using (
  is_supervisor() or
  escola_id in (select id from escolas where responsavel_id = auth.uid())
);
create policy "Inserir notas" on notas_escola for insert with check (auth.uid() is not null);

-- ============================================================
-- VIEW: escolas_resumo
-- ============================================================
create or replace view escolas_resumo as
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
-- CONTRATOS
-- ============================================================
create table if not exists contratos (
  id                    uuid primary key default uuid_generate_v4(),
  escola_id             uuid not null references escolas(id) on delete cascade,
  formulario_enviado    boolean not null default false,
  formulario_recebido   boolean not null default false,
  minuta_enviada        boolean not null default false,
  retorno_minuta        boolean not null default false,
  observacao_minuta     text,
  minuta_atualizada     boolean not null default false,
  contrato_enviado      boolean not null default false,
  contrato_assinado     boolean not null default false,
  contrato_arquivado    boolean not null default false,
  encaminhamento_final  text,
  infantil2_qtd         int not null default 0,
  infantil2_valor       numeric(10,2) not null default 0,
  infantil3_qtd         int not null default 0,
  infantil3_valor       numeric(10,2) not null default 0,
  infantil4_qtd         int not null default 0,
  infantil4_valor       numeric(10,2) not null default 0,
  infantil5_qtd         int not null default 0,
  infantil5_valor       numeric(10,2) not null default 0,
  fund1_ano1_qtd        int not null default 0,
  fund1_ano1_valor      numeric(10,2) not null default 0,
  tempo_contrato        int not null default 1,
  valor_total           numeric(12,2) generated always as (
    infantil2_qtd * infantil2_valor + infantil3_qtd * infantil3_valor +
    infantil4_qtd * infantil4_valor + infantil5_qtd * infantil5_valor +
    fund1_ano1_qtd * fund1_ano1_valor
  ) stored,
  created_by            uuid references profiles(id) on delete set null,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_contratos_escola_id on contratos(escola_id);

drop trigger if exists set_contratos_updated_at on contratos;
create trigger set_contratos_updated_at before update on contratos for each row execute procedure set_updated_at();

alter table contratos enable row level security;

drop policy if exists "Selecionar contratos"        on contratos;
drop policy if exists "Inserir/Atualizar contratos" on contratos;

create policy "Selecionar contratos" on contratos for select using (
  is_supervisor() or
  escola_id in (select id from escolas where responsavel_id = auth.uid() or responsavel_id is null)
);
create policy "Inserir/Atualizar contratos" on contratos for all using (auth.uid() is not null);

-- ============================================================
-- FORMULÁRIOS (público)
-- ============================================================
create table if not exists formularios (
  id                  uuid primary key default uuid_generate_v4(),
  data_envio          timestamptz not null default now(),
  email_responsavel   text not null,
  nome_escola         text not null,
  cnpj                text,
  rua                 text,
  numero              text,
  complemento         text,
  bairro              text,
  cidade              text,
  estado              char(2),
  cep                 text,
  infantil2_qtd       int not null default 0,
  infantil3_qtd       int not null default 0,
  infantil4_qtd       int not null default 0,
  infantil5_qtd       int not null default 0,
  fund1_ano1_qtd      int not null default 0,
  data_inicio_letivo  date,
  data_fim_letivo     date,
  formato_ano_letivo  text,
  observacoes         text,
  legal_nome          text, legal_cpf  text, legal_rg    text, legal_orgao text,
  legal_rua           text, legal_numero text, legal_complemento text,
  legal_bairro        text, legal_cidade text, legal_estado char(2), legal_cep text,
  legal_email         text, legal_celular text,
  fin_nome            text, fin_cpf  text, fin_rg    text, fin_orgao text,
  fin_email           text, fin_celular text,
  ped_nome            text, ped_cpf  text, ped_rg    text, ped_orgao text,
  ped_email           text, ped_celular text
);

create index if not exists idx_formularios_data_envio  on formularios(data_envio desc);
create index if not exists idx_formularios_nome_escola on formularios(nome_escola);

alter table formularios enable row level security;

drop policy if exists "Inserir formulário público"           on formularios;
drop policy if exists "Ler formulários (apenas autenticados)" on formularios;

create policy "Inserir formulário público"            on formularios for insert with check (true);
create policy "Ler formulários (apenas autenticados)" on formularios for select using (auth.uid() is not null);

-- ============================================================
-- FIM — Schema aplicado com sucesso
-- ============================================================
select 'Schema CVE Gestão Comercial aplicado com sucesso! ✅' as resultado;
