-- ============================================================
-- Banco de Leads CIECC — Schema Relacional Completo
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ── Extensões ────────────────────────────────────────────────
create extension if not exists "pg_trgm";

-- ══════════════════════════════════════════════════════════════
-- 1. ESCOLA (entidade comercial central)
-- ══════════════════════════════════════════════════════════════
create table if not exists leads_escola (
  id                    uuid primary key default uuid_generate_v4(),
  nome                  text not null,
  cnpj                  text,
  endereco              text,
  bairro                text,
  cidade                text,
  uf                    char(2),
  cep                   text,
  qtd_alunos            int,
  alunos_infantil       int,
  alunos_fund1          int,
  alunos_fund2          int,
  alunos_ens_medio      int,
  tempo_funcionamento   text,
  status_lead           text,
  status_ciecc1         text,
  status_ciecc2         text,
  origem                text,
  observacoes           text,
  rep_legal_nome        text,
  rep_legal_email       text,
  rep_legal_tel         text,
  -- Vínculo com escola do CRM principal (quando convertida em parceira)
  escola_crm_id         uuid references escolas(id) on delete set null,
  importado_em          timestamptz not null default now(),
  importado_por         uuid references profiles(id) on delete set null,
  created_at            timestamptz not null default now()
);

create index if not exists idx_leads_escola_nome on leads_escola using gin(nome gin_trgm_ops);
create index if not exists idx_leads_escola_uf   on leads_escola(uf);
create index if not exists idx_leads_escola_cnpj on leads_escola(cnpj);

-- ══════════════════════════════════════════════════════════════
-- 2. PESSOA (lead individual — inscrito no congresso)
-- ══════════════════════════════════════════════════════════════
create table if not exists leads_pessoa (
  id                uuid primary key default uuid_generate_v4(),
  nome_completo     text,
  cpf               text,
  rg                text,
  email             text,
  tel_celular       text,
  tel_fixo          text,
  tel_comercial     text,
  sexo              char(1),
  data_nascimento   date,
  endereco          text,
  bairro            text,
  cidade            text,
  uf                char(2),
  cep               text,
  tipo_inscricao    text,   -- Gestor, Diretor, Mantenedor, Professor, etc.
  cargo             text,
  escola_id         uuid references leads_escola(id) on delete set null,
  -- Vínculo com perfil do CRM quando já for usuário
  profile_id        uuid references profiles(id) on delete set null,
  importado_em      timestamptz not null default now(),
  importado_por     uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now()
);

create index if not exists idx_leads_pessoa_email on leads_pessoa(email);
create index if not exists idx_leads_pessoa_cpf   on leads_pessoa(cpf);
create index if not exists idx_leads_pessoa_nome  on leads_pessoa using gin(nome_completo gin_trgm_ops);
create index if not exists idx_leads_pessoa_uf    on leads_pessoa(uf);
create index if not exists idx_leads_pessoa_tipo  on leads_pessoa(tipo_inscricao);
create index if not exists idx_leads_pessoa_escola on leads_pessoa(escola_id);

-- ══════════════════════════════════════════════════════════════
-- 3. CONTATOS DA ESCOLA (múltiplos contatos por escola — aba CRM)
-- ══════════════════════════════════════════════════════════════
create table if not exists leads_contato_escola (
  id          uuid primary key default uuid_generate_v4(),
  escola_id   uuid not null references leads_escola(id) on delete cascade,
  pessoa_id   uuid references leads_pessoa(id) on delete set null,
  nome        text,
  cargo       text,
  telefone    text,
  email       text,
  ordem       smallint,   -- 1-8 (posição no CRM)
  created_at  timestamptz not null default now()
);

create index if not exists idx_leads_contato_escola  on leads_contato_escola(escola_id);
create index if not exists idx_leads_contato_email   on leads_contato_escola(email);

-- ══════════════════════════════════════════════════════════════
-- 4. PARTICIPAÇÃO EM EVENTO (1 linha por pessoa por congresso)
-- ══════════════════════════════════════════════════════════════
create table if not exists leads_participacao (
  id                  uuid primary key default uuid_generate_v4(),
  pessoa_id           uuid not null references leads_pessoa(id) on delete cascade,
  escola_id           uuid references leads_escola(id) on delete set null,
  evento              text not null,  -- '1_CIECC_2025' | '2_CIECC_2026' | 'oikos_live'
  lote                text,
  modalidade          text,           -- 'presencial' | 'online'
  valor_lote          numeric(10,2),
  valor_desconto      numeric(10,2),
  valor_taxa          numeric(10,2),
  valor_total         numeric(10,2),
  forma_pagamento     text,
  status_financeiro   text,
  parcelas_pagas      smallint,
  total_parcelas      smallint,
  regra_desconto      text,
  data_inscricao      date,
  check_in            boolean default false,
  fonte               text,           -- 'Prover' | 'Fórum'
  participou_evento_anterior boolean default false,
  created_at          timestamptz not null default now()
);

create index if not exists idx_leads_part_pessoa  on leads_participacao(pessoa_id);
create index if not exists idx_leads_part_evento  on leads_participacao(evento);
create index if not exists idx_leads_part_escola  on leads_participacao(escola_id);

-- ══════════════════════════════════════════════════════════════
-- 5. PERFIL COMERCIAL DA ESCOLA (dados de pesquisa CRM — separados)
-- ══════════════════════════════════════════════════════════════
create table if not exists leads_perfil_escola (
  id                      uuid primary key default uuid_generate_v4(),
  escola_id               uuid not null references leads_escola(id) on delete cascade,
  evento_ref              text,  -- qual evento gerou esses dados
  confessionalidade       text,
  formacao_docentes       text,
  cosmovisao              text,
  desafios_ecc            text,
  importancia_bilingue    smallint,  -- 0-10
  fatores_escolha         text,
  investimento_atual      text,
  disposicao_investimento text,
  nps                     smallint,  -- 0-10
  csi                     text,
  interesse_solucao       text,
  decisores               text,
  prazo_decisao           text,
  data_formulario         date,
  created_at              timestamptz not null default now()
);

create index if not exists idx_leads_perfil_escola on leads_perfil_escola(escola_id);

-- ══════════════════════════════════════════════════════════════
-- 6. LEADS OIKOS LIVE (captados via RD Station)
-- ══════════════════════════════════════════════════════════════
create table if not exists leads_oikos_live (
  id              uuid primary key default uuid_generate_v4(),
  pessoa_id       uuid references leads_pessoa(id) on delete set null,
  nome            text,
  email           text,
  telefone        text,
  data_captacao   timestamptz,
  qualificado     boolean default false,
  importado_em    timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index if not exists idx_leads_oikos_email on leads_oikos_live(email);

-- ══════════════════════════════════════════════════════════════
-- RLS — todos os usuários autenticados com can_view_all() podem ver
-- ══════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'leads_escola','leads_pessoa','leads_contato_escola',
    'leads_participacao','leads_perfil_escola','leads_oikos_live'
  ] loop
    execute format('alter table %s enable row level security', t);
    execute format('drop policy if exists "Ver %s" on %s', t, t);
    execute format('create policy "Ver %s" on %s for select using (can_view_all())', t, t);
    execute format('drop policy if exists "Gerenciar %s" on %s', t, t);
    execute format('create policy "Gerenciar %s" on %s for all using (auth.uid() is not null)', t, t);
  end loop;
end;
$$;

select 'Banco de Leads CIECC criado ✅' as resultado;
