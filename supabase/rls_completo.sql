-- ============================================================
-- CVE Gestão Comercial — RLS Completo e Seguro
-- Executar no SQL Editor do Supabase
-- ============================================================

-- ══════════════════════════════════════
-- 1. FUNÇÕES HELPER
-- ══════════════════════════════════════

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

create or replace function my_role()
returns text language sql security definer stable as $$
  select coalesce(
    (select role::text from profiles where id = auth.uid()),
    'readonly'
  )
$$;

-- ══════════════════════════════════════
-- 2. PROFILES
-- ══════════════════════════════════════

alter table profiles enable row level security;

drop policy if exists "Visualizar perfis" on profiles;
create policy "Visualizar perfis" on profiles for select using (
  can_view_all() or id = auth.uid()
);

drop policy if exists "Usuário atualiza próprio perfil" on profiles;
create policy "Usuário atualiza próprio perfil" on profiles for update using (
  id = auth.uid()
);

drop policy if exists "Gerente atualiza qualquer perfil" on profiles;
create policy "Gerente atualiza qualquer perfil" on profiles for update using (
  (select role from profiles where id = auth.uid()) = 'gerente'
);

-- ══════════════════════════════════════
-- 3. ESCOLAS
-- ══════════════════════════════════════

alter table escolas enable row level security;

drop policy if exists "Selecionar escolas" on escolas;
create policy "Selecionar escolas" on escolas for select using (
  can_view_all()
);

drop policy if exists "Inserir escolas" on escolas;
create policy "Inserir escolas" on escolas for insert with check (
  auth.uid() is not null
);

drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas for update using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);

drop policy if exists "Deletar escolas (apenas gerente)" on escolas;
create policy "Deletar escolas (apenas gerente)" on escolas for delete using (
  (select role from profiles where id = auth.uid()) = 'gerente'
);

-- ══════════════════════════════════════
-- 4. REGISTROS
-- ══════════════════════════════════════

alter table registros enable row level security;

drop policy if exists "Selecionar registros" on registros;
create policy "Selecionar registros" on registros for select using (
  can_view_all()
);

drop policy if exists "Inserir registros" on registros;
create policy "Inserir registros" on registros for insert with check (
  auth.uid() is not null
);

drop policy if exists "Atualizar registros" on registros;
create policy "Atualizar registros" on registros for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Deletar registros" on registros;
create policy "Deletar registros" on registros for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- 5. NEGOCIAÇÕES
-- ══════════════════════════════════════

alter table negociacoes enable row level security;

drop policy if exists "Selecionar negociações" on negociacoes;
create policy "Selecionar negociações" on negociacoes for select using (
  can_view_all()
);

drop policy if exists "Inserir negociações" on negociacoes;
create policy "Inserir negociações" on negociacoes for insert with check (
  auth.uid() is not null
);

drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- 6. TAREFAS
-- ══════════════════════════════════════

alter table tarefas enable row level security;

drop policy if exists "Selecionar tarefas" on tarefas;
create policy "Selecionar tarefas" on tarefas for select using (
  can_view_all()
);

drop policy if exists "Inserir tarefas" on tarefas;
create policy "Inserir tarefas" on tarefas for insert with check (
  auth.uid() is not null
);

drop policy if exists "Atualizar tarefas" on tarefas;
create policy "Atualizar tarefas" on tarefas for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Deletar tarefas" on tarefas;
create policy "Deletar tarefas" on tarefas for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- 7. NOTAS DA ESCOLA
-- ══════════════════════════════════════

alter table notas_escola enable row level security;

drop policy if exists "Selecionar notas" on notas_escola;
create policy "Selecionar notas" on notas_escola for select using (
  can_view_all()
);

drop policy if exists "Inserir notas" on notas_escola;
create policy "Inserir notas" on notas_escola for insert with check (
  auth.uid() is not null
);

drop policy if exists "Atualizar notas" on notas_escola;
create policy "Atualizar notas" on notas_escola for update using (
  is_supervisor() or created_by = auth.uid()
);

drop policy if exists "Deletar notas" on notas_escola;
create policy "Deletar notas" on notas_escola for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════
-- 8. CONTATOS DA ESCOLA
-- ══════════════════════════════════════

alter table contatos_escola enable row level security;

drop policy if exists "Selecionar contatos" on contatos_escola;
create policy "Selecionar contatos" on contatos_escola for select using (
  can_view_all()
);

drop policy if exists "Inserir/Atualizar contatos" on contatos_escola;
drop policy if exists "Gerenciar contatos" on contatos_escola;
create policy "Gerenciar contatos" on contatos_escola for all using (
  auth.uid() is not null
);

-- ══════════════════════════════════════
-- 9. CONTRATOS
-- ══════════════════════════════════════

alter table contratos enable row level security;

drop policy if exists "Selecionar contratos" on contratos;
create policy "Selecionar contratos" on contratos for select using (
  can_view_all()
);

drop policy if exists "Inserir/Atualizar contratos" on contratos;
drop policy if exists "Gerenciar contratos" on contratos;
create policy "Gerenciar contratos" on contratos for all using (
  auth.uid() is not null
);

-- ══════════════════════════════════════
-- 10. FORMULÁRIOS (público — escolas não autenticadas)
-- ══════════════════════════════════════

alter table formularios enable row level security;

drop policy if exists "Inserir formulário público" on formularios;
create policy "Inserir formulário público" on formularios for insert with check (true);

drop policy if exists "Visualizar formulários" on formularios;
create policy "Visualizar formulários" on formularios for select using (
  can_view_all()
);

-- ══════════════════════════════════════
-- 11. NOTIFICAÇÕES
-- ══════════════════════════════════════

alter table notificacoes enable row level security;

drop policy if exists "Ver próprias notificações" on notificacoes;
create policy "Ver próprias notificações" on notificacoes for select using (
  user_id = auth.uid() or can_view_all()
);

drop policy if exists "Atualizar próprias notificações" on notificacoes;
create policy "Atualizar próprias notificações" on notificacoes for update using (
  user_id = auth.uid()
);

-- ══════════════════════════════════════
-- 12. DOCUMENTOS OFICIAIS
-- ══════════════════════════════════════

alter table documentos_oficiais enable row level security;

drop policy if exists "Selecionar documentos" on documentos_oficiais;
create policy "Selecionar documentos" on documentos_oficiais for select using (
  can_view_all()
);

drop policy if exists "Gerenciar documentos" on documentos_oficiais;
create policy "Gerenciar documentos" on documentos_oficiais for all using (
  auth.uid() is not null
);

-- ══════════════════════════════════════
-- 13. AUDIT LOG (somente leitura para supervisores)
-- ══════════════════════════════════════

alter table audit_log enable row level security;

drop policy if exists "Ver audit log" on audit_log;
create policy "Ver audit log" on audit_log for select using (
  is_supervisor()
);

-- ══════════════════════════════════════
-- 14. TRIGGER: atualizar updated_at automaticamente
-- ══════════════════════════════════════

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Garante triggers de updated_at nas tabelas principais
do $$
declare
  t text;
begin
  foreach t in array array['escolas','registros','negociacoes','tarefas','notas_escola','contratos'] loop
    execute format('
      drop trigger if exists set_%s_updated_at on %s;
      create trigger set_%s_updated_at
        before update on %s
        for each row execute procedure set_updated_at();
    ', t, t, t, t);
  end loop;
end;
$$;

select 'RLS completo configurado com sucesso ✅' as resultado;
