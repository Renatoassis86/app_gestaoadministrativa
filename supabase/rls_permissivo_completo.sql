-- ============================================================
-- RLS PERMISSIVO COMPLETO — Todos os usuários autenticados
-- podem fazer CRUD em registros comerciais
-- ============================================================

-- ══════════════════════════════════════════════════════════════
-- 1. REGISTROS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Ver registros" on registros;
create policy "Ver registros" on registros
for select using (auth.uid() is not null);

drop policy if exists "Criar registros" on registros;
create policy "Criar registros" on registros
for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar registros" on registros;
create policy "Atualizar registros" on registros
for update using (auth.uid() is not null);

drop policy if exists "Deletar registros" on registros;
create policy "Deletar registros" on registros
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 2. NEGOCIAÇÕES — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Ver negociações" on negociacoes;
create policy "Ver negociações" on negociacoes
for select using (auth.uid() is not null);

drop policy if exists "Criar negociações" on negociacoes;
create policy "Criar negociações" on negociacoes
for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes
for update using (auth.uid() is not null);

drop policy if exists "Deletar negociações" on negociacoes;
create policy "Deletar negociações" on negociacoes
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 3. ESCOLAS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Ver escolas" on escolas;
create policy "Ver escolas" on escolas
for select using (auth.uid() is not null);

drop policy if exists "Criar escolas" on escolas;
create policy "Criar escolas" on escolas
for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas
for update using (auth.uid() is not null);

drop policy if exists "Deletar escolas (apenas supervisor)" on escolas;
create policy "Deletar escolas" on escolas
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 4. TAREFAS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Ver tarefas" on tarefas;
create policy "Ver tarefas" on tarefas
for select using (auth.uid() is not null);

drop policy if exists "Criar tarefas" on tarefas;
create policy "Criar tarefas" on tarefas
for insert with check (auth.uid() is not null);

drop policy if exists "Atualizar tarefas" on tarefas;
create policy "Atualizar tarefas" on tarefas
for update using (auth.uid() is not null);

drop policy if exists "Deletar tarefas" on tarefas;
create policy "Deletar tarefas" on tarefas
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 5. CONTRATOS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Gerenciar contratos" on contratos;
create policy "Gerenciar contratos" on contratos
for all using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 6. NOTAS_ESCOLA — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Ver notas" on notas_escola;
create policy "Ver notas" on notas_escola
for select using (auth.uid() is not null);

drop policy if exists "Criar notas" on notas_escola;
create policy "Criar notas" on notas_escola
for insert with check (auth.uid() is not null);

drop policy if exists "Editar notas" on notas_escola;
create policy "Editar notas" on notas_escola
for update using (auth.uid() is not null);

drop policy if exists "Deletar notas" on notas_escola;
create policy "Deletar notas" on notas_escola
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 7. CONTATOS_ESCOLA — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

drop policy if exists "Ver contatos" on contatos_escola;
create policy "Ver contatos" on contatos_escola
for select using (auth.uid() is not null);

drop policy if exists "Criar contatos" on contatos_escola;
create policy "Criar contatos" on contatos_escola
for insert with check (auth.uid() is not null);

drop policy if exists "Editar contatos" on contatos_escola;
create policy "Editar contatos" on contatos_escola
for update using (auth.uid() is not null);

drop policy if exists "Deletar contatos" on contatos_escola;
create policy "Deletar contatos" on contatos_escola
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- RESULTADO:
-- ✅ Qualquer usuário autenticado pode ver, criar, editar, deletar
-- ✅ Nenhuma restrição por role
-- ✅ RLS como única fonte de verdade de autorização
-- ══════════════════════════════════════════════════════════════
