-- ============================================================
-- Tabela para documentos oficiais com upload pelo admin
-- Execute no Editor SQL do Supabase
-- ============================================================

create table if not exists documentos_oficiais (
  id            uuid primary key default uuid_generate_v4(),
  tipo          text not null unique,   -- 'ficha_cadastral' | 'minuta_contrato'
  nome_arquivo  text not null,
  url           text not null,
  storage_path  text not null,
  tamanho       int,
  mime_type     text,
  atualizado_por uuid references profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_documentos_tipo on documentos_oficiais(tipo);

alter table documentos_oficiais enable row level security;

-- Todos autenticados podem VER os documentos
create policy "Ler documentos" on documentos_oficiais
  for select using (auth.uid() is not null);

-- Apenas gerentes podem inserir/atualizar
create policy "Gerente gerencia documentos" on documentos_oficiais
  for all using (
    (select role from profiles where id = auth.uid()) = 'gerente'
  );

-- Bucket de storage (criar via painel ou via script)
-- O bucket 'documentos-oficiais' deve ser criado no Supabase Storage
-- com acesso público para download

select 'Tabela documentos_oficiais criada ✅' as resultado;
