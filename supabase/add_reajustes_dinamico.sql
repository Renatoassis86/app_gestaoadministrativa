-- Reajustes dinâmicos: colunas criadas pelo usuário + valores extras por linha. Seguro para rodar mais de uma vez.
alter table contratos_reajustes add column if not exists extras jsonb not null default '{}'::jsonb;

create table if not exists contratos_reajustes_colunas (
  id         uuid primary key default gen_random_uuid(),
  rotulo     text not null,
  tipo       text not null default 'texto',   -- texto | numero | data | lista
  opcoes     text[] not null default '{}',    -- itens da lista suspensa (tipo = lista)
  ordem      int  not null default 0,
  created_at timestamptz not null default now()
);
alter table contratos_reajustes_colunas enable row level security;
drop policy if exists "contratos_reajustes_colunas: ler" on contratos_reajustes_colunas;
drop policy if exists "contratos_reajustes_colunas: escrever" on contratos_reajustes_colunas;
create policy "contratos_reajustes_colunas: ler"      on contratos_reajustes_colunas for select using (can_view_all());
create policy "contratos_reajustes_colunas: escrever" on contratos_reajustes_colunas for all using (can_view_all()) with check (can_view_all());
