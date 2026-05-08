-- ============================================================
-- Banco Universal de Leads — aceita qualquer coluna das planilhas
-- Execute no SQL Editor do Supabase
-- ============================================================

-- Tabela principal: cada linha é um inscrito/lead de qualquer fonte
-- Colunas fixas = as mais universais; colunas extras em JSONB
create table if not exists leads_universal (
  id uuid primary key default uuid_generate_v4(),

  -- Identificação
  fonte           text not null,  -- 'ciecc_2025' | 'ciecc_2026' | 'crm' | 'oikos' | 'outro'
  nome            text,
  cpf             text,
  rg              text,
  sexo            text,
  data_nascimento text,

  -- Contato
  email           text,
  tel_celular     text,
  tel_fixo        text,
  tel_comercial   text,

  -- Localização
  cidade          text,
  uf              char(2),
  endereco        text,
  bairro          text,
  cep             text,

  -- Escola / Instituição
  escola_nome     text,
  escola_cnpj     text,

  -- Perfil comercial
  tipo_inscricao  text,
  cargo           text,

  -- Evento
  lote            text,
  modalidade      text,
  data_inscricao  text,
  forma_pagamento text,
  status_financeiro text,
  valor_total     numeric(10,2),

  -- Alunos por segmento (quando informado)
  qtd_alunos_total  int,
  qtd_infantil      int,
  qtd_fund1         int,
  qtd_fund2         int,
  qtd_medio         int,

  -- TODAS as demais colunas escolhidas pelo usuário ficam aqui
  -- Permite importar qualquer variável sem alterar o schema
  dados_extras    jsonb default '{}',

  -- Controle
  importado_em    timestamptz not null default now(),
  importado_por   uuid references profiles(id) on delete set null
);

-- Índices para busca rápida
create index if not exists idx_lu_email   on leads_universal(email);
create index if not exists idx_lu_fonte   on leads_universal(fonte);
create index if not exists idx_lu_uf      on leads_universal(uf);
create index if not exists idx_lu_tipo    on leads_universal(tipo_inscricao);
create index if not exists idx_lu_escola  on leads_universal(escola_nome);
create index if not exists idx_lu_extras  on leads_universal using gin(dados_extras);

-- RLS
alter table leads_universal enable row level security;
drop policy if exists "Ver leads_universal"      on leads_universal;
create policy "Ver leads_universal" on leads_universal
  for select using (can_view_all());
drop policy if exists "Gerenciar leads_universal" on leads_universal;
create policy "Gerenciar leads_universal" on leads_universal
  for all using (auth.uid() is not null);

select 'Banco Universal de Leads criado ✅' as resultado;
