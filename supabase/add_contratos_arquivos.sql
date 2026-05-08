-- ============================================================
-- Tabela para arquivos de contratos por escola
-- Execute no SQL Editor do Supabase
-- ============================================================

create table if not exists contratos_arquivos (
  id          uuid primary key default uuid_generate_v4(),
  escola_id   uuid not null references escolas(id) on delete cascade,
  nome        text not null,
  path        text not null,
  tamanho     int,
  tipo        text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_contratos_arquivos_escola on contratos_arquivos(escola_id);

alter table contratos_arquivos enable row level security;

-- Todos autenticados com can_view_all() podem ver
create policy "Ver arquivos contratos" on contratos_arquivos
  for select using (can_view_all());

-- Qualquer autenticado pode inserir
create policy "Inserir arquivos contratos" on contratos_arquivos
  for insert with check (auth.uid() is not null);

-- Apenas o criador ou supervisor pode deletar
create policy "Deletar arquivos contratos" on contratos_arquivos
  for delete using (
    is_supervisor() or created_by = auth.uid()
  );

select 'Tabela contratos_arquivos criada ✅' as resultado;
