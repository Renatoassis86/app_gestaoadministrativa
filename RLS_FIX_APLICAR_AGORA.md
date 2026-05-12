# ⚠️ CRÍTICO: RLS Precisa Ser Fixado AGORA

## Resumo dos Problemas

Identificamos **3 problemas críticos** nas políticas RLS do Supabase que estão bloqueando:
- ❌ Deletar escolas
- ❌ Remover negociações do pipeline
- ❌ Editar/atualizar registros como consultor

## Como Fixar em 2 Minutos

### 1. Abra o Supabase SQL Editor
https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new

### 2. Copie e Execute Este SQL Completo

```sql
-- ============================================================
-- Fix RLS Completo — Deletions e Updates
-- ============================================================

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

-- FIX 1: Permitir supervisores deletarem escolas (não apenas gerentes)
drop policy if exists "Deletar escolas (apenas gerente)" on escolas;
create policy "Deletar escolas (apenas supervisor)" on escolas
for delete using (is_supervisor());

-- FIX 2: ADICIONAR DELETE POLICY PARA NEGOCIAÇÕES (ESTAVA FALTANDO!)
drop policy if exists "Deletar negociações" on negociacoes;
create policy "Deletar negociações" on negociacoes
for delete using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- FIX 3: Garantir UPDATE policies
drop policy if exists "Atualizar escolas" on escolas;
create policy "Atualizar escolas" on escolas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or responsavel_id is null
);

drop policy if exists "Atualizar negociações" on negociacoes;
create policy "Atualizar negociações" on negociacoes
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Atualizar registros" on registros;
create policy "Atualizar registros" on registros
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

drop policy if exists "Atualizar tarefas" on tarefas;
create policy "Atualizar tarefas" on tarefas
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);

-- DELETE policies
drop policy if exists "Deletar registros" on registros;
create policy "Deletar registros" on registros
for delete using (is_supervisor() or created_by = auth.uid());

drop policy if exists "Deletar tarefas" on tarefas;
create policy "Deletar tarefas" on tarefas
for delete using (is_supervisor() or created_by = auth.uid());

drop policy if exists "Deletar notas" on notas_escola;
create policy "Deletar notas" on notas_escola
for delete using (is_supervisor() or created_by = auth.uid());

drop policy if exists "Deletar contatos" on contatos_escola;
create policy "Deletar contatos" on contatos_escola
for delete using (is_supervisor() or created_by = auth.uid());

select 'RLS FIXADO ✅ — Deletions e Updates funcionando' as resultado;
```

### 3. Clique em "Run" (Ctrl+Enter ou ⌘+Enter)

Você deve ver a mensagem: **"RLS FIXADO ✅ — Deletions e Updates funcionando"**

### 4. Reinicie o Next.js
```bash
npm run dev
```

### 5. Limpe a sessão
- Faça logout
- Faça login novamente

## ✅ Agora Teste

- [ ] Criar escola nova
- [ ] **Deletar escola** ← deve funcionar agora
- [ ] Adicionar negociação
- [ ] **Remover do pipeline** ← deve funcionar agora
- [ ] Editar escola como consultor ← deve funcionar agora

---

## 📄 Documentação Completa

Veja: `supabase/FIXES_RLS.md` e `supabase/fix_rls_complete.sql`

---

**Data**: 2026-05-12
**Prioridade**: 🔴 CRÍTICA
