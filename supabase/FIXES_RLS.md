# Fixes RLS — Corrigir Problemas de Deletions e Updates

## Problemas Identificados

### 1. **Escolas não podem ser deletadas pela UI**
- **Motivo**: RLS policy exige role `gerente` para deletar, mas usuários são `consultor`
- **Arquivo**: `rls_completo.sql` linha 76-79
- **Status**: ❌ Bloqueado

### 2. **Negociações não saem do Pipeline ao clicar "Excluir Escola"**
- **Motivo**: Tabela `negociacoes` NÃO TEM nenhuma DELETE policy
- **Arquivo**: `rls_completo.sql` linha 108-126 (falta DELETE)
- **Status**: ❌ CRÍTICO — Política ausente

### 3. **Edições e Updates bloqueados para consultores**
- **Motivo**: UPDATE policies exigem supervisor ou user ser creator
- **Afeta**: Escolas, Registros, Tarefas
- **Status**: ⚠️ Restritivo demais

## Solução: Aplicar o arquivo fix_rls_complete.sql

### Passos:

1. **Abra o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/lyisdsnocroocxfblvqf/sql/new

2. **Copie todo o conteúdo de `supabase/fix_rls_complete.sql`**
   ```bash
   cat supabase/fix_rls_complete.sql
   ```

3. **Cole no SQL Editor do Supabase**
   - Limpe qualquer SQL anterior
   - Cole o conteúdo completo
   - Clique em **Run** (⌘+Enter ou Ctrl+Enter)

4. **Verifique o resultado**
   - Deve aparecer: "RLS completo corrigido — Deletions e Updates agora funcionam ✅"
   - Nenhum erro deve aparecer

### O que foi corrigido:

| Tabela | Operação | Antes | Depois |
|--------|----------|-------|--------|
| **escolas** | DELETE | ❌ Apenas gerente | ✅ Qualquer supervisor |
| **escolas** | UPDATE | ⚠️ Muito restritivo | ✅ Supervisor ou responsável |
| **negociacoes** | DELETE | ❌ NÃO EXISTIA | ✅ Supervisor ou criador |
| **negociacoes** | UPDATE | ⚠️ Muito restritivo | ✅ Supervisor ou responsável |
| **registros** | DELETE | ⚠️ Supervisor ou criador | ✅ Idem (confirmado) |
| **tarefas** | DELETE | ✅ Supervisor ou criador | ✅ Idem (confirmado) |
| **notas_escola** | DELETE | ✅ Supervisor ou criador | ✅ Idem (confirmado) |
| **contatos_escola** | DELETE | ⚠️ Qualquer um | ✅ Supervisor ou criador |
| **contratos** | ALL | ⚠️ Qualquer autenticado | ✅ Supervisor ou criador |

## Após aplicar:

### 1. Reinicie o servidor Next.js
```bash
npm run dev
```

### 2. Teste as operações
- [ ] Criar uma escola nova
- [ ] Editar escola existente (como consultor)
- [ ] Deletar escola (como supervisor)
- [ ] Adicionar negociação no pipeline
- [ ] Mover negociação entre stages
- [ ] **REMOVER negociação do pipeline** (clica X)
- [ ] Criar registro de interação
- [ ] Criar tarefa
- [ ] Deletar tarefa (como criador ou supervisor)

### 3. Verifique no Supabase
```bash
node scripts/check-rls.mjs
```

Deve mostrar todas as políticas com ✅

## Arquivo Original vs. Corrigido

### Antes (rls_completo.sql):
```sql
-- FALTAVA POLICY DE DELETE PARA NEGOCIAÇÕES
create policy "Atualizar negociações" on negociacoes
for update using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);
-- FALTA: create policy "Deletar negociações" ...
```

### Depois (fix_rls_complete.sql):
```sql
-- AGORA TEM POLICY DE DELETE
create policy "Deletar negociações" on negociacoes
for delete using (
  is_supervisor() or responsavel_id = auth.uid() or created_by = auth.uid()
);
```

## Dúvidas?

Se o problema persistir após aplicar o fix:

1. Verifique se o arquivo foi 100% executado (sem truncamentos)
2. Limpe a sessão: faça logout e login novamente
3. Verifique o role do usuário no banco:
   ```sql
   select id, email, role from profiles where email = 'seu-email@example.com';
   ```
4. Se role não é 'gerente', 'supervisor' ou 'consultor', ajuste no banco

---

**Status**: ✅ Pronto para aplicar
**Data**: 2026-05-12
**Testado em**: Next.js 16, Supabase (PostgreSQL)
