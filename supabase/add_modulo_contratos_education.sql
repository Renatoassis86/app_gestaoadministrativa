-- ============================================================
-- Módulo de Contratos Education (modelos Boleto e Eskolare)
-- Roda no PRÓPRIO banco da gestão administrativa. Somente ACRESCENTA:
-- não apaga colunas, não altera dados e não mexe nas políticas existentes
-- de escolas/contratos. Seguro para rodar mais de uma vez.
--
-- Onde rodar: Supabase > SQL Editor > New query > colar tudo > Run.
-- Rodar ANTES de publicar o código novo do módulo.
-- ============================================================

-- ------------------------------------------------------------
-- 1) escolas: campos de qualificação da CONTRATANTE
--    (rua, numero, complemento, bairro, cidade, estado, cep, site, cnpj já existem)
--    Não há UNIQUE no CNPJ: o banco já tem CNPJs repetidos (ex.: Verum x5).
--    A checagem de duplicidade é feita como aviso na tela.
-- ------------------------------------------------------------
alter table escolas
  add column if not exists razao_social  text,
  add column if not exists nome_fantasia text,
  add column if not exists cnae          text,
  add column if not exists registro_mec  text,
  add column if not exists veterana      boolean not null default false;

create index if not exists idx_escolas_cnpj_digitos
  on escolas ((regexp_replace(coalesce(cnpj,''), '\D', '', 'g')));

-- ------------------------------------------------------------
-- 2) contratos: já existe (1 por escola, funil + quantidades por série).
--    Acrescenta modelo de cobrança, representante legal, vigência, pagamento etc.
-- ------------------------------------------------------------
create unique index if not exists uq_contratos_escola on contratos (escola_id);

alter table contratos
  add column if not exists modalidade                 text check (modalidade in ('boleto','eskolare')),
  add column if not exists status                     text not null default 'rascunho'
        check (status in ('rascunho','minuta_enviada','em_revisao','enviado','assinado','arquivado','declinou')),
  add column if not exists marcado_veterana           boolean not null default false,

  -- Representante legal
  add column if not exists legal_nome                 text,
  add column if not exists legal_cpf                  text,
  add column if not exists legal_rg                   text,
  add column if not exists legal_cargo                text,
  add column if not exists legal_email                text,
  add column if not exists legal_telefone             text,
  add column if not exists legal_cep                  text,
  add column if not exists legal_endereco_texto       text,
  add column if not exists poderes_documento          text,

  -- Contatos operacionais
  add column if not exists pedagogico_nome            text,
  add column if not exists pedagogico_cargo           text,
  add column if not exists pedagogico_email           text,
  add column if not exists pedagogico_telefone        text,
  add column if not exists financeiro_nome            text,
  add column if not exists financeiro_cargo           text,
  add column if not exists financeiro_email           text,
  add column if not exists financeiro_telefone        text,

  -- Ano letivo e porte
  add column if not exists ano_letivo_inicial         int,
  add column if not exists ano_letivo_final           int,
  add column if not exists letivo_inicio              date,
  add column if not exists letivo_fim                 date,
  add column if not exists formato_calendario         text check (formato_calendario in ('bimestral','trimestral','semestral')),
  add column if not exists qtd_responsaveis           int,
  add column if not exists qtd_alunos_estimado        int,
  add column if not exists qtd_professores            int,
  add column if not exists qtd_coordenadores          int,

  -- Vigência (modelo: anos letivos 2027–2030, renovação automática, aviso de 90 dias)
  add column if not exists vigencia_inicio            date,
  add column if not exists vigencia_fim               date,
  add column if not exists renovacao_automatica       boolean not null default true,
  add column if not exists aviso_nao_renovacao_dias   int not null default 90,

  -- Condições comuns aos dois modelos
  add column if not exists pedido_minimo_pct          numeric(5,2) not null default 80,
  add column if not exists devolucao_max_pct          numeric(5,2) not null default 10,
  add column if not exists reajuste_indice            text not null default 'IPCA',
  add column if not exists multa_descumprimento_pct   numeric(5,2) not null default 10,
  add column if not exists multa_rescisao_pct         numeric(5,2) not null default 30,
  add column if not exists valor_anos_seguintes_texto text,
  add column if not exists desconto_bonificacao       text,

  -- Boleto
  add column if not exists forma_pagamento            text,
  add column if not exists num_parcelas               int,
  add column if not exists valor_parcela              numeric(14,2),
  add column if not exists primeiro_vencimento        date,
  add column if not exists primeiro_vencimento_texto  text,
  add column if not exists dia_vencimento             int check (dia_vencimento between 1 and 31),

  -- Eskolare (loja virtual)
  add column if not exists parcelas_max_cartao        int,
  add column if not exists repasse_tipo               text check (repasse_tipo in ('fixo','variavel')),
  add column if not exists repasse_valor              numeric(14,2),
  add column if not exists repasse_pct                numeric(6,3),
  add column if not exists nota_fiscal_repasse        boolean,

  -- Dados bancários (Anexo III)
  add column if not exists banco                      text,
  add column if not exists agencia                    text,
  add column if not exists conta                      text,
  add column if not exists tipo_conta                 text,
  add column if not exists titular                    text,
  add column if not exists titular_documento          text,
  add column if not exists chave_pix                  text,

  -- Assinatura
  add column if not exists assinatura_email           text,
  add column if not exists testemunha1_nome           text,
  add column if not exists testemunha1_cpf            text,
  add column if not exists testemunha2_nome           text,
  add column if not exists testemunha2_cpf            text,
  add column if not exists data_assinatura            date,

  add column if not exists drive_contrato_url         text,
  add column if not exists clausulas_especiais        text,
  add column if not exists observacoes                text;

-- ------------------------------------------------------------
-- 3) contratos_series — Anexo I/IV: série × ano letivo × tipo de kit
--    (as colunas <serie>_qtd/_valor antigas de contratos continuam existindo, só não são usadas pelo módulo novo)
-- ------------------------------------------------------------
create table if not exists contratos_series (
  id                 uuid primary key default gen_random_uuid(),
  contrato_id        uuid not null references contratos(id) on delete cascade,
  ano_letivo         int  not null,
  serie              text not null check (serie in (
                        'infantil2','infantil3','infantil4','infantil5',
                        'fund1_ano1','fund1_ano2','fund1_ano3','fund1_ano4','fund1_ano5')),
  tipo_kit           text not null default 'completo' check (tipo_kit in ('completo','sem_ingles','so_ingles')),
  curriculo          text,
  quantidade         int  not null default 0 check (quantidade >= 0),
  valor_unitario     numeric(12,2),
  desconto           numeric(12,2) not null default 0,
  cronograma_entrega text,
  observacoes        text,
  unique (contrato_id, ano_letivo, serie, tipo_kit)
);
create index if not exists idx_contratos_series_contrato on contratos_series(contrato_id);

-- ------------------------------------------------------------
-- 4) contratos_aditivos — termos aditivos vinculados à escola
-- ------------------------------------------------------------
create table if not exists contratos_aditivos (
  id               uuid primary key default gen_random_uuid(),
  escola_id        uuid not null references escolas(id) on delete cascade,
  contrato_id      uuid references contratos(id) on delete set null,
  titulo           text not null,
  resumo           text,
  data_assinatura  date,
  assinado         boolean not null default false,
  drive_url        text,
  created_by       uuid references profiles(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index if not exists idx_contratos_aditivos_escola on contratos_aditivos(escola_id);

-- ------------------------------------------------------------
-- 5) contratos_arquivos — já existe (vazia); acrescenta categoria e vínculo com aditivo
-- ------------------------------------------------------------
alter table contratos_arquivos
  add column if not exists categoria  text not null default 'contrato',
  add column if not exists aditivo_id uuid references contratos_aditivos(id) on delete set null;

-- ------------------------------------------------------------
-- 6) RLS das tabelas NOVAS (contêm CPF/RG/dados bancários)
--    Leitura: gerente, supervisor e consultor (can_view_all). Escrita: gerente e supervisor.
-- ------------------------------------------------------------
alter table contratos_series   enable row level security;
alter table contratos_aditivos enable row level security;

drop policy if exists "contratos_series: ler"      on contratos_series;
drop policy if exists "contratos_series: escrever" on contratos_series;
create policy "contratos_series: ler"      on contratos_series for select using (can_view_all());
create policy "contratos_series: escrever" on contratos_series for all    using (is_supervisor()) with check (is_supervisor());

drop policy if exists "contratos_aditivos: ler"      on contratos_aditivos;
drop policy if exists "contratos_aditivos: escrever" on contratos_aditivos;
create policy "contratos_aditivos: ler"      on contratos_aditivos for select using (can_view_all());
create policy "contratos_aditivos: escrever" on contratos_aditivos for all    using (is_supervisor()) with check (is_supervisor());

-- ------------------------------------------------------------
-- 7) Storage: bucket PRIVADO para os PDFs (leitura por link assinado)
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('contratos-education', 'contratos-education', false, 20971520,
        array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg'])
on conflict (id) do nothing;

drop policy if exists "contratos-education: ler"      on storage.objects;
drop policy if exists "contratos-education: escrever" on storage.objects;
create policy "contratos-education: ler" on storage.objects
  for select using (bucket_id = 'contratos-education' and can_view_all());
create policy "contratos-education: escrever" on storage.objects
  for all using (bucket_id = 'contratos-education' and is_supervisor())
  with check (bucket_id = 'contratos-education' and is_supervisor());

-- ------------------------------------------------------------
-- 8) View de conferência: valor calculado pelas séries x valor informado
-- ------------------------------------------------------------
create or replace view contratos_resumo with (security_invoker = true) as
select
  c.id as contrato_id, c.escola_id, c.modalidade, c.status,
  coalesce(sum(s.quantidade) filter (where s.ano_letivo = c.ano_letivo_inicial), 0) as kits_ano1,
  coalesce(sum(s.quantidade * coalesce(s.valor_unitario,0) - s.desconto) filter (where s.ano_letivo = c.ano_letivo_inicial), 0) as valor_calculado_ano1,
  c.valor_total as valor_informado_ano1
from contratos c left join contratos_series s on s.contrato_id = c.id
group by c.id;

notify pgrst, 'reload schema';
select 'Módulo de contratos Education instalado ✅' as resultado;
