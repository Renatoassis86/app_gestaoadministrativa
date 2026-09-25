-- ============================================================
-- Módulo de Gestão de Pedidos — Previsão de Pedidos das Escolas Parceiras
-- Formulário público (schools parceiras informam, por série, a previsão
-- de pedidos para o próximo ano letivo + observações sobre o material)
-- ============================================================

create table if not exists previsoes_pedidos (
  id                    uuid primary key default uuid_generate_v4(),

  -- Vínculo com a escola do CRM (resolvido por CNPJ/nome na server action, igual ao /formulario)
  escola_id             uuid references escolas(id) on delete set null,

  -- Ano letivo ao qual a previsão se refere
  ano_letivo            int  not null,

  -- Identificação da instituição (conforme preenchido no formulário)
  nome_instituicao      text not null,
  cnpj                  text,
  endereco              text,

  -- Representante legal
  representante_legal   text,

  -- Responsável pelo preenchimento do formulário
  responsavel_nome      text not null,
  responsavel_telefone  text not null,

  -- Calendário letivo do ano previsto
  data_inicio_letivo    date,
  data_fim_letivo       date,
  formato_calendario    text, -- 'Bimestral' | 'Trimestral' | 'Semestral'

  -- Séries que a instituição vai adotar (checkboxes)
  series_adotadas       text[] not null default '{}',

  -- Previsão de alunos por série — mesma nomenclatura já usada em
  -- escolas / contratos / formularios, para casar com o resto do sistema
  infantil2_qtd         int not null default 0,
  infantil3_qtd         int not null default 0,
  infantil4_qtd         int not null default 0,
  infantil5_qtd         int not null default 0,
  fund1_ano1_qtd        int not null default 0,
  fund1_ano2_qtd        int not null default 0,
  fund1_ano3_qtd        int not null default 0,
  fund1_ano4_qtd        int not null default 0,
  fund1_ano5_qtd        int not null default 0,

  -- Como a escola quer receber o material (kit por aluno, por série, embalagem etc.)
  observacoes_material  text,

  -- Triagem interna da equipe de pedidos
  status                text not null default 'recebido', -- 'recebido' | 'em_analise' | 'confirmado'

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_previsoes_pedidos_escola on previsoes_pedidos(escola_id);
create index if not exists idx_previsoes_pedidos_ano    on previsoes_pedidos(ano_letivo);
create index if not exists idx_previsoes_pedidos_status on previsoes_pedidos(status);

-- Reusa a função set_updated_at() já criada em schema.sql (não redefinir aqui)
drop trigger if exists set_previsoes_pedidos_updated_at on previsoes_pedidos;
create trigger set_previsoes_pedidos_updated_at
  before update on previsoes_pedidos
  for each row execute procedure set_updated_at();

-- RLS — mesmo padrão do formulário público (/formulario): qualquer um pode
-- inserir (a escola preenche sem login), só a equipe autenticada lê/edita.
alter table previsoes_pedidos enable row level security;

drop policy if exists "Inserir previsão de pedidos (público)" on previsoes_pedidos;
drop policy if exists "Ver previsões de pedidos"               on previsoes_pedidos;
drop policy if exists "Atualizar previsões de pedidos"         on previsoes_pedidos;
drop policy if exists "Deletar previsões de pedidos"           on previsoes_pedidos;

create policy "Inserir previsão de pedidos (público)" on previsoes_pedidos for insert with check (true);
create policy "Ver previsões de pedidos"       on previsoes_pedidos for select using (auth.uid() is not null);
create policy "Atualizar previsões de pedidos" on previsoes_pedidos for update using (auth.uid() is not null);
create policy "Deletar previsões de pedidos"   on previsoes_pedidos for delete using (auth.uid() is not null);

select 'Tabela previsoes_pedidos criada com sucesso ✅' as resultado;
