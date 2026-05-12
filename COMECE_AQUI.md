# 🤖 ROBÔ DE TESTES - COMECE AQUI

## ⚡ 3 Passos para Rodar

### 1️⃣ Abra PowerShell
```powershell
cd D:\repositorio_geral\app_comercial_education_django\comercial_nextjs
```

### 2️⃣ Execute
```powershell
.\run-robo.ps1
```

### 3️⃣ Digite Sua Senha
- Quando pedir, digite a senha (será mascarada)
- Pressione Enter
- Pronto! O robô vai rodar

---

## 🎬 O Que Vai Acontecer

1. ✅ Chrome abre automaticamente
2. ✅ Robô faz login com seu usuário
3. ✅ Cria um registro fictício chamado "[TESTE]"
4. ✅ Valida a página de sucesso
5. ✅ Verifica em todas as abas
6. ✅ Mostra resultado

Tudo automático - você só observa! 👀

---

## ✅ Resultado Esperado

```
🎉 ✅ TODOS OS TESTES PASSARAM!
Próximas etapas:
  1. Abra http://localhost:3000/comercial/registros
  2. Procure por '[TESTE]'
  3. Clique para ver detalhes
  4. Navegue para Jornada Visual e Jornada de Relacionamento
```

---

## ❌ Se Algo der Errado

### "RLS bloqueou acesso"
Execute este SQL no Supabase:
- Arquivo: `SQL_FIX_RLS_REGISTROS_CORRIGIDO.sql`
- Dashboard: https://app.supabase.com → SQL Editor
- Depois rode o robô novamente

### "Dev server não respondeu"
Você pode:
- Deixar o script iniciar (opção 1)
- Ou iniciar manualmente: `npm run dev`

### "Campo não encontrado"
- Página pode ter mudado
- Eu vou corrigir o script
- Rode novamente

---

## 💡 Dicas

- **Rodou de novo?** Execute o script novamente: `.\run-robo.ps1`
- **Quer ver mais lentamente?** Edite `test-robo-v2.js` e aumente `SLOW_MO`
- **Registros se acumulando?** Pode deletar os "[TESTE]" depois
- **Ver screenshots dos erros?** Estão em `test-screenshots/`

---

## 📋 O Que o Robô Testa

- ✅ Login funciona
- ✅ Criar registro com dados automáticos
- ✅ Página de sucesso exibe
- ✅ Registro aparece em "Registros"
- ✅ Jornada Visual carrega
- ✅ Jornada Relacionamento carrega

---

## 🚀 Vamos Lá!

```powershell
.\run-robo.ps1
```

Qualquer dúvida durante a execução, leia os logs - eles dirão exatamente o que aconteceu! 📋
