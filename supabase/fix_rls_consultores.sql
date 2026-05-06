-- ============================================================
-- Fix RLS: consultores têm acesso a visualizar tudo
-- mas só editam o que é deles (ou sem responsável)
-- ============================================================

-- Helper: consultor ou acima pode VER tudo
create or replace function can_view_all()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role in ('gerente','supervisor','consultor') from profiles where id = auth.uid()),
    false
  )
$$;

-- ESCOLAS: consultores veem todas as escolas ativas
drop policy if exists "Selecionar escolas" on escolas;
create policy "Selecionar escolas" on escolas for select using (
  can_view_all()
);
drop policy if exists "Inserir escolas" on escolas;
create policy "Inserir escolas" on escolas for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas for update using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);

-- REGISTROS: consultores veem todos os registros
drop policy if exists "Selecionar registros" on registros;
create policy "Selecionar registros" on registros for select using (
  can_view_all()
);

-- NEGOCIAÇÕES: consultores veem todas
drop policy if exists "Selecionar negociações" on negociacoes;
create policy "Selecionar negociações" on negociacoes for select using (
  can_view_all()
);

-- TAREFAS: consultores veem todas
drop policy if exists "Selecionar tarefas" on tarefas;
create policy "Selecionar tarefas" on tarefas for select using (
  can_view_all()
);

-- CONTRATOS: consultores veem todos
drop policy if exists "Selecionar contratos" on contratos;
create policy "Selecionar contratos" on contratos for select using (
  can_view_all()
);

-- NOTAS: consultores veem todas
drop policy if exists "Selecionar notas" on notas_escola;
create policy "Selecionar notas" on notas_escola for select using (
  can_view_all()
);

-- CONTATOS: consultores veem todos
drop policy if exists "Selecionar contatos" on contatos_escola;
create policy "Selecionar contatos" on contatos_escola for select using (
  can_view_all()
);

select 'RLS consultores corrigido — acesso a Dashboard e Jornada liberado ✅' as resultado;
