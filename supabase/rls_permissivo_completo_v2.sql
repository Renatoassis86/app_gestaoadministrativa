-- ============================================================
-- RLS PERMISSIVO - VERSÃO 2
-- Remove explicitamente CADA política RLS antes de criar
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- REMOVER TODAS AS POLÍTICAS EXISTENTES (DROP POLICY)
-- ──────────────────────────────────────────────────────────

-- REGISTROS
DROP POLICY IF EXISTS "Ver registros" ON registros;
DROP POLICY IF EXISTS "Criar registros" ON registros;
DROP POLICY IF EXISTS "Atualizar registros" ON registros;
DROP POLICY IF EXISTS "Deletar registros" ON registros;

-- NEGOCIAÇÕES
DROP POLICY IF EXISTS "Ver negociações" ON negociacoes;
DROP POLICY IF EXISTS "Criar negociações" ON negociacoes;
DROP POLICY IF EXISTS "Atualizar negociações" ON negociacoes;
DROP POLICY IF EXISTS "Deletar negociações" ON negociacoes;

-- ESCOLAS
DROP POLICY IF EXISTS "Ver escolas" ON escolas;
DROP POLICY IF EXISTS "Criar escolas" ON escolas;
DROP POLICY IF EXISTS "Atualizar escolas" ON escolas;
DROP POLICY IF EXISTS "Deletar escolas" ON escolas;

-- TAREFAS
DROP POLICY IF EXISTS "Ver tarefas" ON tarefas;
DROP POLICY IF EXISTS "Criar tarefas" ON tarefas;
DROP POLICY IF EXISTS "Atualizar tarefas" ON tarefas;
DROP POLICY IF EXISTS "Deletar tarefas" ON tarefas;

-- CONTRATOS
DROP POLICY IF EXISTS "Gerenciar contratos" ON contratos;

-- NOTAS_ESCOLA
DROP POLICY IF EXISTS "Ver notas" ON notas_escola;
DROP POLICY IF EXISTS "Criar notas" ON notas_escola;
DROP POLICY IF EXISTS "Editar notas" ON notas_escola;
DROP POLICY IF EXISTS "Deletar notas" ON notas_escola;

-- CONTATOS_ESCOLA
DROP POLICY IF EXISTS "Ver contatos" ON contatos_escola;
DROP POLICY IF EXISTS "Criar contatos" ON contatos_escola;
DROP POLICY IF EXISTS "Editar contatos" ON contatos_escola;
DROP POLICY IF EXISTS "Deletar contatos" ON contatos_escola;

-- ══════════════════════════════════════════════════════════════
-- 1. REGISTROS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

create policy "Ver registros" on registros
for select using (auth.uid() is not null);

create policy "Criar registros" on registros
for insert with check (auth.uid() is not null);

create policy "Atualizar registros" on registros
for update using (auth.uid() is not null);

create policy "Deletar registros" on registros
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 2. NEGOCIAÇÕES — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

create policy "Ver negociações" on negociacoes
for select using (auth.uid() is not null);

create policy "Criar negociações" on negociacoes
for insert with check (auth.uid() is not null);

create policy "Atualizar negociações" on negociacoes
for update using (auth.uid() is not null);

create policy "Deletar negociações" on negociacoes
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 3. ESCOLAS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

create policy "Ver escolas" on escolas
for select using (auth.uid() is not null);

create policy "Criar escolas" on escolas
for insert with check (auth.uid() is not null);

create policy "Atualizar escolas" on escolas
for update using (auth.uid() is not null);

create policy "Deletar escolas" on escolas
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 4. TAREFAS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

create policy "Ver tarefas" on tarefas
for select using (auth.uid() is not null);

create policy "Criar tarefas" on tarefas
for insert with check (auth.uid() is not null);

create policy "Atualizar tarefas" on tarefas
for update using (auth.uid() is not null);

create policy "Deletar tarefas" on tarefas
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 5. CONTRATOS — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

create policy "Gerenciar contratos" on contratos
for all using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 6. NOTAS_ESCOLA — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

create policy "Ver notas" on notas_escola
for select using (auth.uid() is not null);

create policy "Criar notas" on notas_escola
for insert with check (auth.uid() is not null);

create policy "Editar notas" on notas_escola
for update using (auth.uid() is not null);

create policy "Deletar notas" on notas_escola
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- 7. CONTATOS_ESCOLA — Permitir qualquer usuário autenticado
-- ══════════════════════════════════════════════════════════════

create policy "Ver contatos" on contatos_escola
for select using (auth.uid() is not null);

create policy "Criar contatos" on contatos_escola
for insert with check (auth.uid() is not null);

create policy "Editar contatos" on contatos_escola
for update using (auth.uid() is not null);

create policy "Deletar contatos" on contatos_escola
for delete using (auth.uid() is not null);

-- ══════════════════════════════════════════════════════════════
-- RESULTADO:
-- ✅ Todas as políticas antigas foram removidas (DROP POLICY)
-- ✅ Novas políticas criadas
-- ✅ Qualquer usuário autenticado pode fazer CRUD completo
-- ══════════════════════════════════════════════════════════════
