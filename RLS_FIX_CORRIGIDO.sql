-- FIX RLS CORRIGIDO — Habilitar DELETE e UPDATE para todas as tabelas

-- Função helper 1: Verifica se é supervisor (gerente ou supervisor)
create or replace function is_supervisor()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role in ('gerente','supervisor') from profiles where id = auth.uid()),
    false
  )
$$;

-- Função helper 2: Verifica se pode ver tudo
create or replace function can_view_all()
returns boolean language sql security definer stable as $$
  select coalesce(
    (select role in ('gerente','supervisor','consultor') from profiles where id = auth.uid()),
    false
  )
$$;

-- ========== ESCOLAS ==========
drop policy if exists "Deletar escolas (apenas gerente)" on escolas;
create policy "Deletar escolas" on escolas
for delete using (is_supervisor());

drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);

-- ========== NEGOCIAÇÕES ==========
drop policy if exists "Deletar negociações" on negociacoes;
create policy "Deletar negociações" on negociacoes
for delete using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ========== REGISTROS ==========
drop policy if exists "Deletar registros" on registros;
create policy "Deletar registros" on registros
for delete using (is_supervisor() or created_by = auth.uid());

drop policy if exists "Atualizar registros" on registros;
create policy "Atualizar registros" on registros
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ========== TAREFAS ==========
drop policy if exists "Deletar tarefas" on tarefas;
create policy "Deletar tarefas" on tarefas
for delete using (is_supervisor() or created_by = auth.uid());

drop policy if exists "Atualizar tarefas" on tarefas;
create policy "Atualizar tarefas" on tarefas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ========== NOTAS ==========
drop policy if exists "Deletar notas" on notas_escola;
create policy "Deletar notas" on notas_escola
for delete using (is_supervisor() or created_by = auth.uid());

-- ========== CONTATOS (CORRIGIDO - sem created_by) ==========
drop policy if exists "Deletar contatos" on contatos_escola;
create policy "Deletar contatos" on contatos_escola
for delete using (auth.uid() is not null);

drop policy if exists "Editar contatos" on contatos_escola;
create policy "Editar contatos" on contatos_escola
for update using (auth.uid() is not null);

select 'RLS FIXADO ✅ — Todas as políticas aplicadas com sucesso' as resultado;
