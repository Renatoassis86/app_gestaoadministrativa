-- ============================================================
-- Cadastro Eskolare 2027 — fichas por escola, acesso por link + PIN
-- Somente ACRESCENTA tabelas/bucket. Seguro para rodar mais de uma vez.
--
-- Segurança: as tabelas têm RLS ligado e NENHUMA policy. Ninguém acessa pela API pública
-- (anon/authenticated). Todo acesso é feito pelo servidor do app, que valida a sessão do
-- comercial ou o PIN da escola antes de ler/gravar (cliente admin).
-- Onde rodar: Supabase > SQL Editor > New query > colar tudo > Run.
-- ============================================================

create table if not exists eskolare_fichas (
  id                  uuid primary key default gen_random_uuid(),
  escola_id           uuid not null references escolas(id) on delete cascade,
  ciclo               int  not null default 2027,
  status              text not null default 'rascunho'
        check (status in ('rascunho','enviada','em_preenchimento','respondida','validada','cadastrada')),
  responsavel_comercial text check (responsavel_comercial in ('Raissa','Jesse')),
  obs_comercial       text,

  -- Valores: pré-preenchido pelo comercial, valor atual e situação de cada campo (chave -> ...)
  pre                 jsonb not null default '{}'::jsonb,
  dados               jsonb not null default '{}'::jsonb,
  situacao            jsonb not null default '{}'::jsonb,
  pct_preenchido      int   not null default 0,

  -- Acesso da escola (link + PIN)
  token               text unique,                 -- aleatório, 256 bits (base64url)
  pin_hash            text,                        -- scrypt com salt; o PIN nunca é guardado
  tentativas          int  not null default 0,
  bloqueado_ate       timestamptz,
  link_revogado       boolean not null default false,
  sessao_hash         text,                        -- hash da sessão aberta após o PIN
  sessao_expira       timestamptz,                 -- 2h sem uso
  ultimo_acesso_em    timestamptz,
  ultima_resposta_por text check (ultima_resposta_por in ('comercial','escola')),

  enviada_em          timestamptz,
  respondida_em       timestamptz,
  validada_em         timestamptz,
  cadastrada_em       timestamptz,
  created_by          uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (escola_id, ciclo)                        -- uma ficha por escola por ciclo
);

create table if not exists eskolare_eventos (
  id          uuid primary key default gen_random_uuid(),
  ficha_id    uuid not null references eskolare_fichas(id) on delete cascade,
  tipo        text not null,   -- criada, enviada, aberta, pin_errado, bloqueada, campo, respondida, validada, cadastrada, reaberta, revogada, importada
  autor       text not null default 'sistema' check (autor in ('comercial','escola','sistema')),
  detalhe     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_eskolare_fichas_status on eskolare_fichas(status);
create index if not exists idx_eskolare_eventos_ficha on eskolare_eventos(ficha_id, created_at desc);

alter table eskolare_fichas  enable row level security;
alter table eskolare_eventos enable row level security;
-- (sem policies: acesso apenas pelo servidor com a chave de serviço)

-- Bucket PRIVADO para a logo (PNG até 5 MB). Sem policies: só o servidor lê/grava.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('eskolare-logos', 'eskolare-logos', false, 5242880, array['image/png'])
on conflict (id) do nothing;

create or replace function eskolare_touch() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists trg_eskolare_fichas_updated on eskolare_fichas;
create trigger trg_eskolare_fichas_updated before update on eskolare_fichas
  for each row execute function eskolare_touch();

notify pgrst, 'reload schema';
select 'Cadastro Eskolare instalado ✅' as resultado;
