-- ============================================================
-- Módulo de Solicitação e Acompanhamento de Envio de Amostras
-- ============================================================

-- Enum de estágios do Kanban
do $$ begin
  create type amostra_stage as enum (
    'solicitada',   -- comercial pediu, aguardando separação
    'separacao',    -- assistente admin separando material
    'postada',      -- enviada (com código de rastreio)
    'entregue',     -- confirmada entrega
    'devolutiva'    -- devolutiva da escola registrada (final)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type amostra_prioridade as enum ('normal','urgente');
exception when duplicate_object then null; end $$;

create table if not exists solicitacoes_amostras (
  id                  uuid primary key default uuid_generate_v4(),

  -- Vínculo opcional com a escola do CRM
  escola_id           uuid references escolas(id) on delete set null,

  -- Workflow
  stage               amostra_stage not null default 'solicitada',
  prioridade          amostra_prioridade not null default 'normal',

  -- Solicitante (comercial) e separador (assistente)
  solicitante_id      uuid references profiles(id) on delete set null,
  assistente_id       uuid references profiles(id) on delete set null,

  -- Material
  material            text not null,           -- livro / amostra solicitado
  quantidade          int  not null default 1,
  observacoes_material text,

  -- Destinatário e endereço de envio
  destinatario_nome   text not null,
  cep                 text,
  logradouro          text,
  numero              text,
  complemento         text,
  bairro              text,
  cidade              text,
  uf                  char(2),
  cpf_cnpj            text,
  celular             text,
  telefone            text,
  email               text,

  -- Acompanhamento logístico (preenchido pelo assistente)
  transportadora      text,
  codigo_rastreio     text,
  link_rastreio       text,

  -- Devolutiva da escola (preenchida pelo comercial após retorno)
  devolutiva          text,
  devolutiva_data     date,

  -- Timestamps por estágio (medir tempo em cada fase)
  solicitada_em       timestamptz not null default now(),
  separada_em         timestamptz,
  postada_em          timestamptz,
  entregue_em         timestamptz,
  devolutiva_em       timestamptz,

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_amostras_stage     on solicitacoes_amostras(stage);
create index if not exists idx_amostras_escola    on solicitacoes_amostras(escola_id);
create index if not exists idx_amostras_solic     on solicitacoes_amostras(solicitante_id);

-- Trigger: atualiza updated_at e timestamps por estágio
create or replace function tg_solicitacoes_amostras_updated()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  -- Marca o timestamp do estágio quando ele muda
  if tg_op = 'UPDATE' and new.stage is distinct from old.stage then
    if new.stage = 'separacao' and new.separada_em is null then
      new.separada_em := now();
    elsif new.stage = 'postada' and new.postada_em is null then
      new.postada_em := now();
    elsif new.stage = 'entregue' and new.entregue_em is null then
      new.entregue_em := now();
    elsif new.stage = 'devolutiva' and new.devolutiva_em is null then
      new.devolutiva_em := now();
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_amostras_updated on solicitacoes_amostras;
create trigger trg_amostras_updated
  before update on solicitacoes_amostras
  for each row execute function tg_solicitacoes_amostras_updated();

-- RLS — segue o padrão permissivo das demais tabelas (usuário autenticado)
alter table solicitacoes_amostras enable row level security;

drop policy if exists "Ver amostras"      on solicitacoes_amostras;
drop policy if exists "Criar amostras"    on solicitacoes_amostras;
drop policy if exists "Atualizar amostras" on solicitacoes_amostras;
drop policy if exists "Deletar amostras"  on solicitacoes_amostras;

create policy "Ver amostras"       on solicitacoes_amostras for select using (auth.uid() is not null);
create policy "Criar amostras"     on solicitacoes_amostras for insert with check (auth.uid() is not null);
create policy "Atualizar amostras" on solicitacoes_amostras for update using (auth.uid() is not null);
create policy "Deletar amostras"   on solicitacoes_amostras for delete using (auth.uid() is not null);
