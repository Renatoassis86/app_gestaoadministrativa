-- ============================================================
-- CIECC — Dados dos Congressos e Pesquisa de Mercado
-- Execute no SQL Editor do Supabase
-- ============================================================

-- ── 1. Inscritos dos congressos (granularidade: pessoa) ─────
create table if not exists ciecc_inscritos (
  id              uuid primary key default uuid_generate_v4(),
  fonte           text not null,          -- 'ciecc_2025' | 'ciecc_2026'

  -- Pessoa
  nome            text,
  tipo_pessoa     text,                   -- CONGREGADO | Visitante
  tipo_inscricao  text,                   -- Gestor | Diretor | Mantenedor | Professor | Pai/Mãe | Colaborador CVE | etc
  cargo_original  text,

  -- Contato
  email           text,
  telefone        text,
  telefone_fixo   text,

  -- Localização
  cidade          text,
  uf              text,

  -- Escola declarada
  nome_escola     text,
  cnpj_escola     text,

  -- Financeiro
  lote            text,
  forma_pagamento text,
  status_financeiro text,
  valor_total     numeric(10,2),

  -- Dados pedagógicos / pesquisa
  tempo_funcionamento     text,
  confessionalidade       text,
  formacao_docentes       text,
  cosmovisao_curriculo    text,
  desafios_ecc            text,
  interesse_bilingue      int,            -- 0-10
  fatores_decisao         text,
  investimento_atual      text,
  disponibilidade_invest  text,
  csi                     numeric(3,1),
  nps                     int,            -- 0-10
  interesse_solucao_cve   text,
  decisores               text,
  prazo_decisao           text,

  -- Alunos por segmento
  qtd_alunos_total  int,
  qtd_infantil      int,
  qtd_fund1         int,
  qtd_fund2         int,
  qtd_medio         int,

  -- Presença no congresso anterior
  participou_congresso_anterior boolean,

  -- Metadados
  importado_em    timestamptz not null default now(),
  importado_por   uuid references profiles(id) on delete set null,

  -- Vínculo com escola do CRM (quando identificada)
  escola_id       uuid references escolas(id) on delete set null
);

create index if not exists idx_ciecc_inscritos_fonte   on ciecc_inscritos(fonte);
create index if not exists idx_ciecc_inscritos_email   on ciecc_inscritos(email);
create index if not exists idx_ciecc_inscritos_escola  on ciecc_inscritos(nome_escola);
create index if not exists idx_ciecc_inscritos_uf      on ciecc_inscritos(uf);

-- ── 2. Leads sem escola identificada ────────────────────────
create table if not exists ciecc_leads_sem_escola (
  id              uuid primary key default uuid_generate_v4(),
  fonte           text not null,          -- 'ciecc_2025' | 'ciecc_2026' | 'oikos_live'
  nome            text,
  tipo_inscricao  text,
  instituicao     text,                   -- campo livre declarado pelo inscrito
  email           text,
  telefone        text,
  cidade          text,
  uf              text,
  data_inscricao  date,
  lote            text,
  valor           numeric(10,2),
  forma_pagamento text,
  status_financeiro text,
  importado_em    timestamptz not null default now(),
  importado_por   uuid references profiles(id) on delete set null
);

create index if not exists idx_ciecc_leads_email  on ciecc_leads_sem_escola(email);
create index if not exists idx_ciecc_leads_fonte  on ciecc_leads_sem_escola(fonte);

-- ── 3. Escolas identificadas dos congressos (CRM enriched) ──
create table if not exists ciecc_escolas (
  id              uuid primary key default uuid_generate_v4(),
  nome            text not null,
  cnpj            text,
  cidade          text,
  uf              text,
  endereco        text,
  bairro          text,
  cep             text,

  -- Status nos congressos
  status_ciecc_2025  text,
  status_ciecc_2026  text,
  participou_2025    boolean default false,
  participou_2026    boolean default false,

  -- Dados pedagógicos / pesquisa
  tempo_funcionamento     text,
  confessionalidade       text,
  formacao_docentes       text,
  cosmovisao_curriculo    text,
  desafios_ecc            text,
  interesse_bilingue      int,
  fatores_decisao         text,
  investimento_atual      text,
  disponibilidade_invest  text,

  -- Indicadores comerciais
  csi                     numeric(3,1),
  nps                     int,
  interesse_solucao_cve   text,
  decisores               text,
  prazo_decisao           text,
  qtd_alunos              int,

  -- Processo comercial
  data_formulario         date,
  representante_legal     text,
  email_representante     text,
  telefone_representante  text,
  observacoes             text,
  fontes                  text,
  status_forum            text,

  -- Contatos (até 8)
  contatos                jsonb default '[]',
  -- formato: [{ nome, cargo, tel, email }, ...]

  -- Vínculo com escola do CRM principal
  escola_id               uuid references escolas(id) on delete set null,

  importado_em            timestamptz not null default now(),
  importado_por           uuid references profiles(id) on delete set null
);

create index if not exists idx_ciecc_escolas_nome   on ciecc_escolas(nome);
create index if not exists idx_ciecc_escolas_uf     on ciecc_escolas(uf);

-- ── 4. Leads Oikos Live ─────────────────────────────────────
-- (usa mesma tabela ciecc_leads_sem_escola com fonte='oikos_live')

-- ── RLS ─────────────────────────────────────────────────────
alter table ciecc_inscritos          enable row level security;
alter table ciecc_leads_sem_escola   enable row level security;
alter table ciecc_escolas            enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ciecc_inscritos','ciecc_leads_sem_escola','ciecc_escolas'] loop
    execute format('drop policy if exists "Ver %s" on %s', t, t);
    execute format('create policy "Ver %s" on %s for select using (can_view_all())', t, t);
    execute format('drop policy if exists "Gerenciar %s" on %s', t, t);
    execute format('create policy "Gerenciar %s" on %s for all using (auth.uid() is not null)', t, t);
  end loop;
end;
$$;

select 'Tabelas CIECC criadas ✅' as resultado;
