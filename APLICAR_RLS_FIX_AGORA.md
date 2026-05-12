# 🔴 URGENTE — Aplicar RLS Fix AGORA para Deletions e Edições Funcionarem

## O Problema
❌ Não consegue deletar escolas  
❌ Não consegue editar escolas  
❌ Não remove do pipeline  
❌ Não consegue deletar registros  

## A Solução (5 minutos)

### PASSO 1: Abrir Supabase
Acesse: https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new

### PASSO 2: Copiar Este SQL Inteiro

```sql
-- FIX RLS — Habilitar DELETE e UPDATE

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
-- Permitir DELETE para supervisores (não apenas gerente)
drop policy if exists "Deletar escolas (apenas gerente)" on escolas;
create policy "Deletar escolas" on escolas
for delete using (is_supervisor());

-- Permitir UPDATE para supervisores ou responsável
drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);

-- ========== NEGOCIAÇÕES ==========
-- ADICIONAR DELETE (estava faltando!)
drop policy if exists "Deletar negociações" on negociacoes;
create policy "Deletar negociações" on negociacoes
for delete using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- Permitir UPDATE
drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ========== REGISTROS ==========
-- Permitir DELETE
drop policy if exists "Deletar registros" on registros;
create policy "Deletar registros" on registros
for delete using (is_supervisor() or created_by = auth.uid());

-- Permitir UPDATE
drop policy if exists "Atualizar registros" on registros;
create policy "Atualizar registros" on registros
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ========== TAREFAS ==========
-- Permitir DELETE
drop policy if exists "Deletar tarefas" on tarefas;
create policy "Deletar tarefas" on tarefas
for delete using (is_supervisor() or created_by = auth.uid());

-- Permitir UPDATE
drop policy if exists "Atualizar tarefas" on tarefas;
create policy "Atualizar tarefas" on tarefas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- ========== NOTAS ==========
-- Permitir DELETE
drop policy if exists "Deletar notas" on notas_escola;
create policy "Deletar notas" on notas_escola
for delete using (is_supervisor() or created_by = auth.uid());

-- ========== CONTATOS ==========
-- Permitir DELETE
drop policy if exists "Deletar contatos" on contatos_escola;
create policy "Deletar contatos" on contatos_escola
for delete using (is_supervisor() or created_by = auth.uid());

-- ========== RESULTADO ==========
select 'RLS FIXADO ✅ — Delete e Update habilitados para todos os módulos' as resultado;
```

### PASSO 3: Colar no SQL Editor
1. Limpe qualquer SQL anterior
2. Cole TODO o SQL acima
3. Clique em **RUN** (ou Ctrl+Enter / Cmd+Enter)

### PASSO 4: Confirmar
Você deve ver a mensagem verde:
```
RLS FIXADO ✅ — Delete e Update habilitados para todos os módulos
```

### PASSO 5: Reiniciar Next.js
No terminal:
```bash
npm run dev
```

### PASSO 6: Fazer Logout e Login novamente
- Faça logout da plataforma
- Feche o navegador (limpe cache)
- Faça login novamente

### PASSO 7: Testar AGORA

Teste cada um:
- [ ] **Deletar escola**: Abra escolas, clique "Excluir Escola" — deve desaparecer
- [ ] **Editar escola**: Abra escolas, clique "Editar" — deve deixar salvar
- [ ] **Remover do pipeline**: Pipeline, clique X na escola — deve remover
- [ ] **Deletar registro**: Abra registro, clique deletar — deve remover

## ⚠️ Importante

Se ainda não funcionar após fazer estes 7 passos:

1. Confirme que você é `supervisor` ou `gerente` (não `consultor`)
   - Vá para Account Settings (canto superior direito)
   - Clique em seu nome
   - Verifique se seu role é supervisor/gerente

2. Se for `consultor` e não conseguir deletar:
   - Mude seu role para `supervisor` no Supabase
   - Vá para: SQL Editor → `select * from profiles where email = 'seu-email@cidadeviva.org'`
   - Veja qual é seu role
   - Faça: `update profiles set role = 'supervisor' where email = 'seu-email@cidadeviva.org'`

3. Limpe cache completo:
   - Ctrl+Shift+Delete (DevTools → Limpar tudo)
   - Logout
   - Feche navegador
   - Login novamente

---

## 📊 O que cada policy permite agora

| Tabela | Operação | Quem pode | Antes |
|--------|----------|----------|-------|
| escolas | DELETE | Supervisor+ | ❌ Apenas gerente |
| escolas | UPDATE | Supervisor+ ou responsável | ⚠️ Muito restritivo |
| negociacoes | DELETE | Supervisor+ ou criador | ❌ NÃO EXISTIA |
| negociacoes | UPDATE | Supervisor+ ou criador | ⚠️ Muito restritivo |
| registros | DELETE | Supervisor+ ou criador | ⚠️ Bloqueado |
| registros | UPDATE | Supervisor+ ou criador | ⚠️ Bloqueado |

---

## 🚀 Após funcionar

Confirme comigo que:
- Deletar escolas → ✅ Funciona
- Editar escolas → ✅ Funciona
- Remover do pipeline → ✅ Funciona
- Editar registros → ✅ Funciona

---

**Tempo total: 5 minutos**  
**Data**: 2026-05-12  
**Status**: CRÍTICO — APLICAR AGORA
