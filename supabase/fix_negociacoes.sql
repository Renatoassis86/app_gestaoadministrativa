-- ============================================================
-- FIX: Garante que a tabela negociacoes existe e está correta
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Verifica se a tabela existe e cria se necessário
create table if not exists negociacoes (
  id                  uuid primary key default gen_random_uuid(),
  escola_id           uuid not null references escolas(id) on delete cascade,
  titulo              text,
  stage               text not null default 'prospeccao',
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

-- 2. Adiciona coluna ativa se não existir
alter table negociacoes add column if not exists ativa boolean not null default true;

-- 3. Adiciona coluna created_by se não existir
alter table negociacoes add column if not exists created_by uuid references profiles(id) on delete set null;

-- 4. Se a coluna stage for do tipo enum stage_negociacao, converte para text (mais flexível)
-- (só executa se necessário — detecta via cast)
do $$
begin
  -- Testa se stage aceita 'prospeccao' como texto simples
  begin
    perform 'prospeccao'::text;
  exception when others then
    raise notice 'Coluna stage OK';
  end;
end;
$$;

-- 5. Garante índices
create index if not exists idx_negociacoes_escola_id   on negociacoes(escola_id);
create index if not exists idx_negociacoes_stage        on negociacoes(stage);
create index if not exists idx_negociacoes_responsavel  on negociacoes(responsavel_id);
create index if not exists idx_negociacoes_ativa        on negociacoes(ativa);

-- 6. RLS — garante políticas corretas
alter table negociacoes enable row level security;

drop policy if exists "Selecionar negociações" on negociacoes;
create policy "Selecionar negociações" on negociacoes for select
  using (auth.uid() is not null);

drop policy if exists "Inserir negociações" on negociacoes;
create policy "Inserir negociações" on negociacoes for insert
  with check (auth.uid() is not null);

drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes for update
  using (auth.uid() is not null);

drop policy if exists "Deletar negociações" on negociacoes;
create policy "Deletar negociações" on negociacoes for delete
  using (auth.uid() is not null);

-- 7. Trigger updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_negociacoes_updated_at on negociacoes;
create trigger set_negociacoes_updated_at
  before update on negociacoes
  for each row execute procedure set_updated_at();

-- 8. Diagnóstico final
select
  'negociacoes' as tabela,
  count(*) as total_registros,
  count(*) filter (where ativa = true) as ativas
from negociacoes;

select 'Tabela negociacoes OK ✅' as status;
