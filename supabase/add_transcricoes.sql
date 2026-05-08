-- ============================================================
-- Módulo de Transcrições de Reuniões
-- Execute no SQL Editor do Supabase
-- ============================================================

create table if not exists transcricoes_reunioes (
  id              uuid primary key default uuid_generate_v4(),
  escola_id       uuid not null references escolas(id) on delete cascade,
  data_reuniao    date not null,
  titulo          text,                        -- título opcional da reunião
  participantes   text,                        -- nomes dos participantes
  plataforma      text default 'meet',         -- meet | zoom | teams | presencial | outro

  -- Transcrição em texto
  transcricao     text,                        -- texto copiado/colado da transcrição
  resumo_ia       text,                        -- resumo gerado (futuro — ALMA)

  -- Arquivos
  arquivo_transcricao_path  text,             -- path no storage (PDF, DOCX, TXT)
  arquivo_transcricao_nome  text,
  arquivo_transcricao_size  int,

  arquivo_midia_path        text,             -- path do audio/video
  arquivo_midia_nome        text,
  arquivo_midia_size        int,
  arquivo_midia_tipo        text,             -- audio | video

  -- Metadados
  created_by      uuid references profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_transcricoes_escola    on transcricoes_reunioes(escola_id);
create index if not exists idx_transcricoes_data      on transcricoes_reunioes(data_reuniao desc);
create index if not exists idx_transcricoes_criador   on transcricoes_reunioes(created_by);

alter table transcricoes_reunioes enable row level security;

drop policy if exists "Ver transcrições" on transcricoes_reunioes;
create policy "Ver transcrições" on transcricoes_reunioes
  for select using (can_view_all());

drop policy if exists "Criar transcrições" on transcricoes_reunioes;
create policy "Criar transcrições" on transcricoes_reunioes
  for insert with check (auth.uid() is not null);

drop policy if exists "Editar transcrições" on transcricoes_reunioes;
create policy "Editar transcrições" on transcricoes_reunioes
  for update using (created_by = auth.uid() or is_supervisor());

drop policy if exists "Deletar transcrições" on transcricoes_reunioes;
create policy "Deletar transcrições" on transcricoes_reunioes
  for delete using (created_by = auth.uid() or is_supervisor());

drop trigger if exists set_transcricoes_updated_at on transcricoes_reunioes;
create trigger set_transcricoes_updated_at
  before update on transcricoes_reunioes
  for each row execute procedure set_updated_at();

select 'Módulo de Transcrições criado ✅' as resultado;
