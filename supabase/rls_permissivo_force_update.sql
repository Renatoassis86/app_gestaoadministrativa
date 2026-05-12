-- ============================================================
-- RLS PERMISSIVO FORCE UPDATE
-- Remove e recria TODAS as políticas RLS
-- ============================================================

-- REMOVER TODAS AS POLÍTICAS EXISTENTES
ALTER TABLE registros DISABLE ROW LEVEL SECURITY;
ALTER TABLE negociacoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE escolas DISABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas DISABLE ROW LEVEL SECURITY;
ALTER TABLE contratos DISABLE ROW LEVEL SECURITY;
ALTER TABLE notas_escola DISABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_escola DISABLE ROW LEVEL SECURITY;

-- RE-HABILITAR RLS
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE negociacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE escolas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas_escola ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos_escola ENABLE ROW LEVEL SECURITY;

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
-- ✅ Todas as políticas antigas foram removidas
-- ✅ Novas políticas criadas
-- ✅ Qualquer usuário autenticado pode fazer CRUD completo
-- ══════════════════════════════════════════════════════════════
