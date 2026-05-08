-- ============================================================
-- CVE Agenda — Schema completo
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ── Eventos ─────────────────────────────────────────────────
create table if not exists agenda_eventos (
  id              uuid primary key default uuid_generate_v4(),
  titulo          text not null,
  descricao       text,
  local           text,           -- endereço físico ou link meet
  tipo            text not null default 'reuniao',  -- reuniao | ligacao | visita | interno | outro
  cor             text not null default '#2563eb',  -- hex para cor no calendário

  data_inicio     timestamptz not null,
  data_fim        timestamptz not null,
  dia_inteiro     boolean not null default false,

  escola_id       uuid references escolas(id) on delete set null,
  recorrencia     text,           -- null | 'diario' | 'semanal' | 'mensal'

  criado_por      uuid not null references profiles(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint agenda_eventos_datas_check check (data_fim >= data_inicio)
);

create index if not exists idx_agenda_eventos_inicio   on agenda_eventos(data_inicio);
create index if not exists idx_agenda_eventos_criador  on agenda_eventos(criado_por);
create index if not exists idx_agenda_eventos_escola   on agenda_eventos(escola_id);

-- ── Participantes ────────────────────────────────────────────
create table if not exists agenda_participantes (
  id          uuid primary key default uuid_generate_v4(),
  evento_id   uuid not null references agenda_eventos(id) on delete cascade,
  profile_id  uuid references profiles(id) on delete set null,
  email       text not null,
  nome        text,
  status      text not null default 'pendente',  -- pendente | aceito | recusado | talvez
  notificado  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_agenda_part_evento   on agenda_participantes(evento_id);
create index if not exists idx_agenda_part_profile  on agenda_participantes(profile_id);
create index if not exists idx_agenda_part_email    on agenda_participantes(email);

-- unique: um profile/email por evento
create unique index if not exists idx_agenda_part_unico
  on agenda_participantes(evento_id, email);

-- ── RLS ──────────────────────────────────────────────────────
alter table agenda_eventos      enable row level security;
alter table agenda_participantes enable row level security;

-- Eventos: ver todos os eventos se autenticado
drop policy if exists "Ver eventos"    on agenda_eventos;
create policy "Ver eventos" on agenda_eventos
  for select using (auth.uid() is not null);

drop policy if exists "Criar eventos"  on agenda_eventos;
create policy "Criar eventos" on agenda_eventos
  for insert with check (auth.uid() is not null);

drop policy if exists "Editar eventos" on agenda_eventos;
create policy "Editar eventos" on agenda_eventos
  for update using (
    criado_por = auth.uid() or is_supervisor()
  );

drop policy if exists "Deletar eventos" on agenda_eventos;
create policy "Deletar eventos" on agenda_eventos
  for delete using (
    criado_por = auth.uid() or is_supervisor()
  );

-- Participantes
drop policy if exists "Ver participantes"    on agenda_participantes;
create policy "Ver participantes" on agenda_participantes
  for select using (auth.uid() is not null);

drop policy if exists "Gerenciar participantes" on agenda_participantes;
create policy "Gerenciar participantes" on agenda_participantes
  for all using (auth.uid() is not null);

-- ── Trigger updated_at ───────────────────────────────────────
drop trigger if exists set_agenda_eventos_updated_at on agenda_eventos;
create trigger set_agenda_eventos_updated_at
  before update on agenda_eventos
  for each row execute procedure set_updated_at();

select 'Agenda CVE criada com sucesso ✅' as resultado;
