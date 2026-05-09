-- ============================================================
-- Pipeline: tags e escolas favoritas por usuário
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Tags livres numa negociação (lembrete rápido)
alter table negociacoes
  add column if not exists tags text[] not null default '{}';

create index if not exists idx_negociacoes_tags on negociacoes using gin(tags);

-- Escolas favoritas / em prospecção por usuário
create table if not exists usuario_escolas_pipeline (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  escola_id   uuid not null references escolas(id) on delete cascade,
  stage       text not null default 'prospeccao',
  tags        text[] not null default '{}',
  nota        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(user_id, escola_id)
);

create index if not exists idx_uep_user   on usuario_escolas_pipeline(user_id);
create index if not exists idx_uep_escola on usuario_escolas_pipeline(escola_id);

alter table usuario_escolas_pipeline enable row level security;

drop policy if exists "Ver minhas escolas pipeline" on usuario_escolas_pipeline;
create policy "Ver minhas escolas pipeline" on usuario_escolas_pipeline
  for select using (user_id = auth.uid() or can_view_all());

drop policy if exists "Gerenciar minhas escolas pipeline" on usuario_escolas_pipeline;
create policy "Gerenciar minhas escolas pipeline" on usuario_escolas_pipeline
  for all using (user_id = auth.uid());

drop trigger if exists set_uep_updated_at on usuario_escolas_pipeline;
create trigger set_uep_updated_at
  before update on usuario_escolas_pipeline
  for each row execute procedure set_updated_at();

select 'Pipeline tags e escolas criado ✅' as resultado;
