-- ============================================================
-- Fix RLS Completo — Corrige políticas de DELETE e UPDATE
-- Garante que consultores podem editar e deletar seus próprios registros
-- e que supervisores têm acesso irrestrito a operações CRUD
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. FUNÇÕES HELPER
-- ══════════════════════════════════════════════════════════════

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

-- ══════════════════════════════════════════════════════════════
-- 2. ESCOLAS — FIX: Permitir supervisores (não apenas gerentes) deletarem
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Deletar escolas (apenas gerente)" on escolas;
create policy "Deletar escolas (apenas supervisor)" on escolas
for delete using (
  is_supervisor()
);

-- Garantir UPDATE policy para consultores atribuídos
drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);

-- ══════════════════════════════════════════════════════════════
-- 3. NEGOCIAÇÕES — ADD: Política DELETE que estava faltando
-- ══════════════════════════════════════════════════════════════

-- DELETE policy — CRITICAL: estava faltando completamente
drop policy if exists "Deletar negociações" on negociacoes;
create policy "Deletar negociações" on negociacoes
for delete using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- Garantir UPDATE policy
drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ══════════════════════════════════════════════════════════════
-- 4. REGISTROS — Adicionar DELETE policy se necessário
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Deletar registros" on registros;
create policy "Deletar registros" on registros
for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- Garantir UPDATE policy
drop policy if exists "Atualizar registros" on registros;
create policy "Atualizar registros" on registros
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ══════════════════════════════════════════════════════════════
-- 5. TAREFAS — Garantir DELETE e UPDATE políticas
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Deletar tarefas" on tarefas;
create policy "Deletar tarefas" on tarefas
for delete using (
  is_supervisor() or created_by = auth.uid()
);

drop policy if exists "Atualizar tarefas" on tarefas;
create policy "Atualizar tarefas" on tarefas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ══════════════════════════════════════════════════════════════
-- 6. NOTAS_ESCOLA — Garantir DELETE e UPDATE políticas
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Deletar notas" on notas_escola;
create policy "Deletar notas" on notas_escola
for delete using (
  is_supervisor() or created_by = auth.uid()
);

drop policy if exists "Atualizar notas" on notas_escola;
create policy "Atualizar notas" on notas_escola
for update using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════════════════════════════
-- 7. CONTRATOS — Relaxar para permitir supervisores
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Gerenciar contratos" on contratos;
create policy "Gerenciar contratos" on contratos
for all using (
  is_supervisor() or auth.uid() is not null
);

-- ══════════════════════════════════════════════════════════════
-- 8. CONTATOS_ESCOLA — Permitir consultores criarem mas apenas
--    supervisores deletarem
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Gerenciar contatos" on contatos_escola;

-- Separar por operação para melhor controle
drop policy if exists "Ver contatos" on contatos_escola;
create policy "Ver contatos" on contatos_escola
for select using (
  can_view_all()
);

drop policy if exists "Criar contatos" on contatos_escola;
create policy "Criar contatos" on contatos_escola
for insert with check (auth.uid() is not null);

drop policy if exists "Editar contatos" on contatos_escola;
create policy "Editar contatos" on contatos_escola
for update using (
  is_supervisor() or created_by = auth.uid()
);

drop policy if exists "Deletar contatos" on contatos_escola;
create policy "Deletar contatos" on contatos_escola
for delete using (
  is_supervisor() or created_by = auth.uid()
);

-- ══════════════════════════════════════════════════════════════
-- 9. DOCUMENTOS_OFICIAIS — Relaxar para supervisores
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Gerenciar documentos" on documentos_oficiais;
create policy "Gerenciar documentos" on documentos_oficiais
for all using (
  is_supervisor() or auth.uid() is not null
);

-- ══════════════════════════════════════════════════════════════
-- Resultado
-- ══════════════════════════════════════════════════════════════

select 'RLS completo corrigido — Deletions e Updates agora funcionam ✅' as resultado;
