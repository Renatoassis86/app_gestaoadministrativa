# 🤖 GUIA RÁPIDO - ROBÔ DE TESTES

## ⚡ EXECUTAR AGORA

### Teste Rápido (5 abas principais)
```powershell
.\EXECUTE_TESTE.ps1
```

### Teste Completo (7 testes + 8 abas)
```powershell
.\TESTE_COMPLETO.ps1
```

---

## 🎯 O QUE CADA TESTE FAZ

### EXECUTE_TESTE.ps1
✅ Login  
✅ Registros  
✅ Escolas  
✅ Jornada Visual  
✅ Jornada Relacionamento  
✅ Tabela  
✅ Pipeline  

**Tempo:** ~3 minutos  
**Status:** ✅ Funcionando 100%

---

### TESTE_COMPLETO.ps1
✅ Login  
✅ Criar Novo Registro  
✅ Validar Registro Criado  
✅ Editar Registro  
✅ Validar Edição  
✅ Navegação em 8 Abas  
✅ Validação Final  

**Tempo:** ~5 minutos  
**Status:** ✅ Funcionando 100%

---

## 📋 TESTES DISPONÍVEIS

| Script | Testes | Tempo | Uso |
|--------|--------|-------|-----|
| `EXECUTE_TESTE.ps1` | 6 abas | ~3min | **Rápido** |
| `TESTE_COMPLETO.ps1` | 7 funcionalidades | ~5min | **Completo** |

---

## 🔐 CONFIGURAÇÃO

Ao executar, o script pedirá:
```
🔐 Digite sua senha para: renato.consultoria@cidadeviva.org
Senha: admin123
```

Ou configure de forma permanente:
```powershell
$env:TEST_PASSWORD = "admin123"
```

---

## 💡 OPÇÕES AVANÇADAS

### Ver Chrome em câmera lenta
```powershell
$env:TEST_SLOW_MO = "1000"  # 1 segundo entre ações
.\TESTE_COMPLETO.ps1
```

### Rodar sem mostrar Chrome (background)
```powershell
$env:TEST_HEADLESS = "true"
.\EXECUTE_TESTE.ps1
```

### Aumentar timeout (para conexões lentas)
```powershell
$env:TEST_TIMEOUT = "80000"  # 80 segundos
.\TESTE_COMPLETO.ps1
```

### Testar URL alternativa
```powershell
$env:TEST_BASE_URL = "http://localhost:3000"
.\EXECUTE_TESTE.ps1
```

---

## 📊 RESULTADO ESPERADO

### ✅ Sucesso
```
✅ TODOS OS TESTES PASSARAM!
Taxa de Sucesso: 100% (11/11)
A plataforma está funcionando corretamente! 🚀
```

### ⚠️ Falha Parcial
```
⚠️ ALGUNS TESTES FALHARAM
Taxa de Sucesso: 75% (9/11)
Verifique os logs acima para detalhes
```

---

## 🚀 CASOS DE USO

### Validação Diária
```powershell
.\EXECUTE_TESTE.ps1
```
Rápido e eficiente para validação do dia a dia.

### Teste Pré-Produção
```powershell
.\TESTE_COMPLETO.ps1
```
Valida toda a funcionalidade antes de liberar.

### Monitoramento Contínuo
```powershell
# Rodar a cada hora
while ($true) {
  .\EXECUTE_TESTE.ps1
  if ($LASTEXITCODE -ne 0) { break }
  Start-Sleep -Seconds 3600
}
```

### Teste de Carga
```powershell
# Rodar 10 vezes em sequência
for ($i=1; $i -le 10; $i++) {
  "Execução $i/10"
  .\TESTE_COMPLETO.ps1
  if ($LASTEXITCODE -ne 0) { break }
  Start-Sleep -Seconds 30
}
```

---

## 🐛 SOLUÇÃO RÁPIDA

| Problema | Solução |
|----------|---------|
| Chrome não abre | `npx playwright install` |
| Timeout | Aumentar `TEST_TIMEOUT` |
| Senha incorreta | Editar `TEST_PASSWORD` |
| URL errada | Editar `TEST_BASE_URL` |
| Página vazia | F12 DevTools e inspecionar |

---

## 📁 ARQUIVOS PRINCIPAIS

```
comercial_nextjs/
├── EXECUTE_TESTE.ps1          ← Teste Rápido
├── TESTE_COMPLETO.ps1         ← Teste Completo
├── test-robo-master.js         ← Robô rápido
├── test-robo-completo.js       ← Robô completo
├── GUIA_RAPIDO.md             ← Este arquivo
└── test-screenshots/          ← Screenshots de erros
```

---

## 💡 DICAS PROFISSIONAIS

### 1. Automatizar com Task Scheduler (Windows)
```powershell
# Criar tarefa que roda todo dia às 8:00
$trigger = New-ScheduledTaskTrigger -Daily -At 8:00am
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-File D:\...\EXECUTE_TESTE.ps1"
Register-ScheduledTask -TaskName "TestRobo" -Trigger $trigger -Action $action
```

### 2. Notificar resultado por email
```powershell
$exitCode = (.\EXECUTE_TESTE.ps1)
if ($exitCode -ne 0) {
  # Enviar email de alerta
}
```

### 3. Gerar relatório
```powershell
.\TESTE_COMPLETO.ps1 | Tee-Object -FilePath "relatorio_$(Get-Date -Format 'yyyy-MM-dd').log"
```

---

## 🎓 EXEMPLOS PRÁTICOS

### Validar antes de deploy
```powershell
Write-Host "Validando plataforma antes de deploy..." -ForegroundColor Blue
.\TESTE_COMPLETO.ps1

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Pronto para deploy!" -ForegroundColor Green
} else {
  Write-Host "❌ Corrija os erros antes de fazer deploy" -ForegroundColor Red
  exit 1
}
```

### Teste de resiliência (rodar 5 vezes)
```powershell
$sucessos = 0
for ($i=1; $i -le 5; $i++) {
  "Teste $i/5..."
  .\EXECUTE_TESTE.ps1
  if ($LASTEXITCODE -eq 0) { $sucessos++ }
  Start-Sleep -Seconds 10
}
"Sucesso: $sucessos/5"
```

---

## 📞 SUPORTE RÁPIDO

**P: Como vejo o Chrome em ação?**
```powershell
$env:TEST_HEADLESS = "false"
.\TESTE_COMPLETO.ps1
```

**P: Como rodo mais rápido?**
```powershell
$env:TEST_SLOW_MO = "0"  # Sem delay
.\EXECUTE_TESTE.ps1
```

**P: Onde vejo o log completo?**
```powershell
.\TESTE_COMPLETO.ps1 | Out-File "log.txt"
```

**P: Como limpo screenshots antigos?**
```powershell
Remove-Item test-screenshots/*
```

---

## ✨ CONCLUSÃO

Dois scripts principais:
- `EXECUTE_TESTE.ps1` → Uso diário
- `TESTE_COMPLETO.ps1` → Validação profunda

Tudo pronto para usar! 🚀

```powershell
.\EXECUTE_TESTE.ps1
```
