-- Contratos Bilinguismo: seção própria (modelo de negócio diferente do Paideia). Seguro para rodar mais de uma vez.
-- 1) cada arquivo anexado passa a saber a que linha pertence (Paideia é o padrão do que já existe)
alter table contratos_arquivos add column if not exists linha text not null default 'paideia';  -- paideia | bilinguismo

-- 2) cartões das escolas do Bilinguismo
create table if not exists contratos_bilingue_escolas (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null,
  escola_id  uuid references escolas(id) on delete set null,
  extras     jsonb not null default '{}'::jsonb,
  ordem      int  not null default 0,
  created_at timestamptz not null default now()
);
alter table contratos_bilingue_escolas enable row level security;
drop policy if exists "contratos_bilingue_escolas: ler" on contratos_bilingue_escolas;
drop policy if exists "contratos_bilingue_escolas: escrever" on contratos_bilingue_escolas;
create policy "contratos_bilingue_escolas: ler"      on contratos_bilingue_escolas for select using (can_view_all());
create policy "contratos_bilingue_escolas: escrever" on contratos_bilingue_escolas for all using (can_view_all()) with check (can_view_all());
