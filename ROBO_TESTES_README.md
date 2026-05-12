# 🤖 ROBÔ AUTOMATIZADO DE TESTES - GUIA RÁPIDO

## ⚡ Como Usar (3 passos)

### Passo 1: Abra o PowerShell
```powershell
cd D:\repositorio_geral\app_comercial_education_django\comercial_nextjs
```

### Passo 2: Execute o script
```powershell
.\run-test-robo.ps1
```

### Passo 3: Digite sua senha
- Quando solicitado, digite a senha de seu usuário (renato.consultoria@cidadeviva.org)
- A senha será mascarada
- Pressione Enter

---

## 📊 O que o robô testa

✅ **Login** - Entra no sistema com seu usuário  
✅ **Criar Registro** - Preenche formulário automaticamente  
✅ **Validar Sucesso** - Verifica se página de sucesso aparece  
✅ **Lista de Registros** - Valida se registro aparece na lista  
✅ **Jornada Visual** - Verifica se aparece no painel visual  
✅ **Jornada Relacionamento** - Verifica se aparece na jornada  

---

## 🎯 Comportamento Esperado

O Chrome abrirá automaticamente e você verá:
1. Página de login carregando
2. Formulário sendo preenchido automaticamente
3. Registro sendo salvo
4. Página de sucesso exibindo os dados
5. Navegação pelas abas para validação

Tudo é **automático e em tempo real** - você apenas observa!

---

## ✅ Sucesso (Esperado)
```
✓ Email preenchido
✓ Senha preenchida
✅ Login realizado com sucesso!
✓ Página de novo registro carregada
...
🎉 TODOS OS TESTES PASSARAM COM SUCESSO!
```

## ❌ Erro (Precisa correção)
```
❌ Erro ao criar registro: Campo não encontrado
❌ ERRO CRÍTICO: Timeout na página de sucesso
```

Se ocorrer erro:
1. Leia a mensagem (ela dirá exatamente onde falhou)
2. Eu vou corrigir e rodar de novo
3. Continuamos até tudo funcionar ✅

---

## 🔧 Se Algo Der Errado

### "Dev server não respondeu"
- Dev server vai iniciar automaticamente
- Se não iniciar, execute em outro terminal: `npm run dev`

### "Falha no login"
- Verifique se a senha está correta
- Tente novamente

### "Campo não encontrado"
- A página pode ter mudado de estrutura
- Eu vou corrigir o script automaticamente

### "RLS bloqueou acesso"
- Você precisa executar o SQL de correção
- SQL_FIX_RLS_REGISTROS_CORRIGIDO.sql
- Execute no Supabase Dashboard → SQL Editor

---

## 💡 Dicas

- **Quer rodar várias vezes?** Execute o script novamente
- **Quer ver mais lentamente?** Edite `test-robo-registros.js` e aumente `SLOW_MO`
- **Chrome fechar sozinho?** É normal - o robô fecha depois de terminar
- **Registros acumulando?** Você pode deletar os testes depois em "Registros"

---

## 🔄 Loop Automático (Opcional)

Se quer rodar continuamente (útil para CI/CD):

```powershell
while ($true) {
  .\run-test-robo.ps1
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Teste passou! Aguardando 60 segundos antes de próxima rodada..."
    Start-Sleep -Seconds 60
  } else {
    Write-Host "❌ Teste falhou! Encerrando..."
    break
  }
}
```

---

## 📁 Arquivos Criados

- `test-robo-registros.js` - Lógica do robô (não mexa!)
- `run-test-robo.ps1` - Script que inicia tudo (execute este)
- `TEST_ROBO_GUIDE.md` - Documentação completa
- `ROBO_TESTES_README.md` - Este arquivo

---

## 🚀 Próximas Verificações

Quando o robô passar com ✅:

1. Abra `/comercial/registros` e procure por "Diretor Test Robot"
2. Clique no registro para ver os detalhes
3. Navegue para Jornada Visual e Jornada Relacionamento
4. Verifique se tudo está consistente

Se tudo OK, o sistema está pronto! 🎉

---

**Pronto? Execute agora:**
```powershell
.\run-test-robo.ps1
```

Você verá o robô em ação! 🤖✨
