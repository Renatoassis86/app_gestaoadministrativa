-- ============================================================
-- RLS v3 — Restaura checagem de dono/role (reverte rls_permissivo_completo_v2.sql)
-- ============================================================
-- Contexto: em 12/05, rls_permissivo_completo_v2.sql substituiu as políticas
-- de registros/negociacoes/escolas/tarefas/contratos/notas_escola/
-- contatos_escola por `auth.uid() is not null` — ou seja, qualquer usuário
-- autenticado (independente de ser dono/responsável/supervisor) passou a
-- poder ler, editar e apagar dados de qualquer consultor. Este arquivo
-- restaura o modelo anterior (rls_completo.sql + fix_rls_complete.sql,
-- que já convivem em produção sem conflito - só os 7 tabelas abaixo foram
-- afetadas pela v2; profiles/formularios/notificacoes/documentos_oficiais/
-- audit_log não foram tocados e continuam com suas políticas atuais).
--
-- Aplicar manualmente no SQL Editor do Supabase. Depois de aplicar, rodar
-- o checklist de regressão: consultor edita/deleta o próprio registro (deve
-- funcionar), consultor tenta deletar registro de outro consultor (deve
-- falhar), supervisor consegue tudo.
--
-- Verificação: select policyname, cmd, qual from pg_policies
-- where schemaname = 'public' and tablename in
-- ('registros','negociacoes','escolas','tarefas','notas_escola','contratos','contatos_escola')
-- order by tablename, cmd;

-- As funções helper já existem no schema (schema.sql:333-345) — recriadas
-- aqui via CREATE OR REPLACE por segurança/idempotência.
create or replace function is_supervisor()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role in ('gerente','supervisor') from profiles where id = auth.uid()),
    false
  )
$$;

create or replace function can_view_all()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role in ('gerente','supervisor','consultor') from profiles where id = auth.uid()),
    false
  )
$$;

-- ══════════════════════════════════════
-- ESCOLAS
-- ══════════════════════════════════════
drop policy if exists "Ver escolas" on escolas;
drop policy if exists "Selecionar escolas" on escolas;
create policy "Selecionar escolas" on escolas for select using (can_view_all());

drop policy if exists "Criar escolas" on escolas;
drop policy if exists "Inserir escolas" on escolas;
create policy "Inserir escolas" on escolas for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas for update using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);

drop policy if exists "Deletar escolas" on escolas;
drop policy if exists "Deletar escolas (apenas gerente)" on escolas;
drop policy if exists "Deletar escolas (apenas supervisor)" on escolas;
create policy "Deletar escolas (apenas supervisor)" on escolas for delete using (is_supervisor());

-- ══════════════════════════════════════
-- REGISTROS
-- ══════════════════════════════════════
drop policy if exists "Ver registros" on registros;
drop policy if exists "Selecionar registros" on registros;
create policy "Selecionar registros" on registros for select using (can_view_all());

drop policy if exists "Criar registros" on registros;
drop policy if exists "Inserir registros" on registros;
create policy "Inserir registros" on registros for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar registros" on registros;
create policy "Atualizar registros" on registros for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Deletar registros" on registros;
create policy "Deletar registros" on registros for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- NEGOCIAÇÕES
-- ══════════════════════════════════════
drop policy if exists "Ver negociações" on negociacoes;
drop policy if exists "Selecionar negociações" on negociacoes;
create policy "Selecionar negociações" on negociacoes for select using (can_view_all());

drop policy if exists "Criar negociações" on negociacoes;
drop policy if exists "Inserir negociações" on negociacoes;
create policy "Inserir negociações" on negociacoes for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Deletar negociações" on negociacoes;
create policy "Deletar negociações" on negociacoes for delete using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- TAREFAS
-- ══════════════════════════════════════
drop policy if exists "Ver tarefas" on tarefas;
drop policy if exists "Selecionar tarefas" on tarefas;
create policy "Selecionar tarefas" on tarefas for select using (can_view_all());

drop policy if exists "Criar tarefas" on tarefas;
drop policy if exists "Inserir tarefas" on tarefas;
create policy "Inserir tarefas" on tarefas for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar tarefas" on tarefas;
create policy "Atualizar tarefas" on tarefas for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Deletar tarefas" on tarefas;
create policy "Deletar tarefas" on tarefas for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- NOTAS_ESCOLA
-- ══════════════════════════════════════
drop policy if exists "Ver notas" on notas_escola;
drop policy if exists "Selecionar notas" on notas_escola;
create policy "Selecionar notas" on notas_escola for select using (can_view_all());

drop policy if exists "Criar notas" on notas_escola;
drop policy if exists "Inserir notas" on notas_escola;
create policy "Inserir notas" on notas_escola for insert with check (auth.uid() is not null);

drop policy if exists "Editar notas" on notas_escola;
drop policy if exists "Atualizar notas" on notas_escola;
create policy "Atualizar notas" on notas_escola for update using (
  is_supervisor() or created_by = auth.uid()
);

drop policy if exists "Deletar notas" on notas_escola;
create policy "Deletar notas" on notas_escola for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- CONTATOS_ESCOLA
-- ══════════════════════════════════════
drop policy if exists "Gerenciar contatos" on contatos_escola;

drop policy if exists "Ver contatos" on contatos_escola;
create policy "Ver contatos" on contatos_escola for select using (can_view_all());

drop policy if exists "Criar contatos" on contatos_escola;
create policy "Criar contatos" on contatos_escola for insert with check (auth.uid() is not null);

drop policy if exists "Editar contatos" on contatos_escola;
create policy "Editar contatos" on contatos_escola for update using (
  is_supervisor() or created_by = auth.uid()
);

drop policy if exists "Deletar contatos" on contatos_escola;
create policy "Deletar contatos" on contatos_escola for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- CONTRATOS
-- ══════════════════════════════════════
-- Nota: contratos é um checklist da jornada de matrícula por escola (não
-- tem coluna created_by/responsavel_id própria em nenhuma versão anterior
-- das policies) — mesmo na versão "restritiva" original, o acesso já era
-- "qualquer autenticado". Mantido assim deliberadamente, sem inventar uma
-- restrição de dono que a aplicação/schema não modela.
drop policy if exists "Gerenciar contratos" on contratos;
create policy "Gerenciar contratos" on contratos for all using (auth.uid() is not null);

-- ══════════════════════════════════════
-- ÍNDICES — usados nas policies acima mas ausentes hoje
-- ══════════════════════════════════════
create index if not exists idx_registros_created_by on registros(created_by);
create index if not exists idx_negociacoes_created_by on negociacoes(created_by);
create index if not exists idx_tarefas_created_by on tarefas(created_by);
create index if not exists idx_notas_escola_created_by on notas_escola(created_by);
create index if not exists idx_contatos_escola_created_by on contatos_escola(created_by);

select 'RLS v3 aplicado — dono/supervisor restaurado em registros, negociações, escolas, tarefas, notas_escola, contatos_escola ✅' as resultado;
