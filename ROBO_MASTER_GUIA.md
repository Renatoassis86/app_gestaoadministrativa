# 🤖 ROBÔ MASTER - GUIA COMPLETO

## O QUE É

Um sistema de teste automatizado que valida **TODOS** os formulários da plataforma comercial em uma única execução.

O robô:
1. **Loga** com seu usuário
2. **Cria uma nova escola** com dados fictícios
3. **Cria um novo registro** (interação comercial)
4. **Edita o registro** criado
5. **Edita uma escola** existente
6. **Valida todas as abas** para garantir que os dados aparecem corretamente

---

## 📋 FORMULÁRIOS TESTADOS

### 1. Login
- Entra com: `renato.consultoria@cidadeviva.org`
- Senha: `admin123` (você configura)

### 2. Criar Escola (`/comercial/escolas/nova`)
Preenche:
- Nome da escola (fictício com timestamp)
- CNPJ: `12345678901234`
- Cidade: `São Paulo`
- Estado
- Perfil
- Email, Telefone
- Quantitativos de alunos

### 3. Criar Registro (`/comercial/registros/novo`)
Preenche:
- Escola (primeira disponível)
- Data do contato (hoje)
- Meio de contato
- Nome do contato
- Resumo da conversa
- Interesse, Prontidão
- Quantitativos de alunos

### 4. Editar Registro (`/comercial/registros/[id]/editar`)
Adiciona notas internas e salva

### 5. Editar Escola (`/comercial/escolas/[id]/editar`)
Adiciona informações adicionais e salva

### 6. Validar Abas
Verifica se carregam sem erro:
- `/comercial/registros` - Lista de registros
- `/comercial/escolas` - Lista de escolas
- `/comercial/jornada-visual` - Visualização da jornada
- `/comercial/jornada` - Jornada de relacionamento
- `/comercial/tabela` - Tabela de dados
- `/comercial/pipeline` - Pipeline de vendas

---

## 🚀 COMO EXECUTAR

### Opção 1: PowerShell (RECOMENDADO)
```powershell
cd D:\repositorio_geral\app_comercial_education_django\comercial_nextjs
.\run-master-test.ps1
```

### Opção 2: Direto com Node
```bash
export TEST_PASSWORD="admin123"
node test-robo-master.js
```

### Opção 3: Com variáveis de ambiente
```powershell
$env:TEST_PASSWORD = "admin123"
$env:TEST_EMAIL = "seu-email@exemplo.com"
$env:TEST_BASE_URL = "http://localhost:3000"
$env:TEST_HEADLESS = "false"  # Mostrar Chrome
.\run-master-test.ps1
```

---

## 📊 RESULTADO ESPERADO

### ✅ Sucesso
```
🎉 TESTE COMPLETO COM SUCESSO!

Resumo:
  • Login: ✅
  • Criar Escola: ✅
  • Criar Registro: ✅
  • Editar Registro: ✅
  • Editar Escola: ✅
  • Validar Abas: ✅

A plataforma está funcionando corretamente! 🚀
```

### ❌ Falha
```
❌ TESTE FALHOU
Verifique os erros acima

ERROS (1):
  ❌ Criar Registro: Timeout na página de sucesso
```

Se falhar, a mensagem dirá exatamente qual etapa falhou.

---

## 🔧 CONFIGURAÇÃO AVANÇADA

### Variáveis de Ambiente Disponíveis

```javascript
TEST_EMAIL              // Email padrão: renato.consultoria@cidadeviva.org
TEST_PASSWORD           // Sua senha (OBRIGATÓRIO)
TEST_BASE_URL           // URL da app: http://localhost:3000
TEST_HEADLESS           // true = sem ver Chrome, false = ver Chrome
TEST_SLOW_MO            // ms entre ações: 300 (padrão)
TEST_TIMEOUT            // timeout: 30000ms (padrão)
```

### Exemplo: Executar visível e lento para debug
```powershell
$env:TEST_SLOW_MO = "1000"  # 1 segundo entre ações
$env:TEST_HEADLESS = "false" # Ver Chrome aberto
.\run-master-test.ps1
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Erro: "Chrome não encontrado"
```
Solução:
npx playwright install
```

### Erro: "Falha no login"
```
Solução:
1. Verifique a senha: admin123
2. Verifique conectividade: http://localhost:3000
3. Verifique se dev server está rodando: npm run dev
```

### Erro: "RLS bloqueou acesso"
```
Solução:
1. Abra Supabase Dashboard
2. Execute SQL: SQL_FIX_RLS_REGISTROS_CORRIGIDO.sql
3. Rode o teste novamente
```

### Erro: "Campo não encontrado"
```
Solução:
1. Formulário pode ter mudado
2. Edite test-robo-master.js
3. Procure pelo novo seletor CSS
4. Use DevTools (F12) para inspecionar
```

### Dev server não respondendo
```
Solução:
1. Reinicie: Ctrl+C (se rodando)
2. Execute: npm run dev
3. Aguarde até ver "ready - started server on"
4. Execute o teste
```

---

## 💾 ARQUIVOS CRIADOS

```
test-robo-master.js           ← Lógica do robô (não mexa!)
run-master-test.ps1           ← Script para executar (execute este)
ROBO_MASTER_GUIA.md          ← Este documento
test-screenshots/             ← Screenshots de erros (auto-criado)
  └─ erro-1234567890.png     ← Captura quando algo falha
```

---

## 🔄 EXECUTAR MÚLTIPLAS VEZES (Loop)

Se você quer rodar continuamente e parar apenas quando falhar:

```powershell
$tentativa = 1
while ($true) {
  Write-Host ""
  Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host "TENTATIVA $tentativa" -ForegroundColor Blue
  Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
  Write-Host ""

  .\run-master-test.ps1

  if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Passou! Aguardando 60 segundos antes de próxima rodada..." -ForegroundColor Green
    Start-Sleep -Seconds 60
    $tentativa++
  } else {
    Write-Host ""
    Write-Host "❌ Falhou na tentativa $tentativa" -ForegroundColor Red
    break
  }
}
```

---

## 📈 MÉTRICAS CAPTURADAS

O robô registra:
- ✅ Sucessos: Login, Criar Escola, Criar Registro, Editar, Validações
- ❌ Erros: Qual etapa falhou e por quê
- 🖼️ Screenshots: De qualquer erro encontrado
- ⏱️ Timing: Quanto tempo levou cada operação

---

## 🎯 PRÓXIMOS PASSOS

Depois que o teste passar:

1. **Verificar dados criados:**
   - Vá em `/comercial/escolas` - procure por `[TESTE]`
   - Vá em `/comercial/registros` - procure por `[TESTE]`

2. **Deletar dados de teste (opcional):**
   - Os dados fictícios começam com `[TESTE]`
   - Você pode deletar depois se quiser manter o banco limpo

3. **Executar novamente:**
   - Para garantir consistência, rode múltiplas vezes
   - Use o loop PowerShell acima

4. **Integrar com CI/CD (avançado):**
   - Use o script em pipeline de testes
   - Configure alertas se falhar

---

## 💡 DICAS PROFISSIONAIS

- **Ver Chrome em câmera lenta:**
  ```powershell
  $env:TEST_SLOW_MO = "2000"  # 2 segundos entre ações
  .\run-master-test.ps1
  ```

- **Debug detalhado:**
  ```powershell
  $env:TEST_HEADLESS = "false"
  $env:TEST_SLOW_MO = "1000"
  .\run-master-test.ps1
  # Chrome vai aparecer e você verá cada ação em slow-motion
  ```

- **Testar sem mostrar Chrome:**
  ```powershell
  $env:TEST_HEADLESS = "true"
  .\run-master-test.ps1
  # Chrome não abre, executa em background
  ```

---

## 📞 SUPORTE

Se algo não funciona:

1. **Primeiro:** Verifique os logs - eles dirão exatamente o que falhou
2. **Segundo:** Verifique se dev server está rodando: `http://localhost:3000`
3. **Terceiro:** Tente manualmente - faça os mesmos passos que o robô
4. **Quarto:** Verifique screenshots em `test-screenshots/`

---

## ✨ COMANDOS RÁPIDOS

```powershell
# Executar robô
.\run-master-test.ps1

# Executar com senha configurada
$env:TEST_PASSWORD = "admin123"
.\run-master-test.ps1

# Instalar browsers Playwright
npx playwright install

# Ver logs em detalhes
node test-robo-master.js | Tee-Object -FilePath test-output.log

# Dev server em background
npm run dev &
```

---

**Pronto? Vamos lá:**
```powershell
.\run-master-test.ps1
```

O Chrome vai abrir e o robô vai fazer todo o trabalho! 🤖✨
