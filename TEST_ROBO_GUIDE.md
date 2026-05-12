# 🤖 GUIA DE EXECUÇÃO - ROBÔ AUTOMATIZADO DE TESTES

## ⚡ Quick Start (3 passos)

### 1️⃣ Abrir Terminal PowerShell
```powershell
cd D:\repositorio_geral\app_comercial_education_django\comercial_nextjs
```

### 2️⃣ Executar o script
```powershell
.\run-test-robo.ps1
```

### 3️⃣ Ver o navegador (Chrome aberto automaticamente)
- O robô abrirá automaticamente o Chrome
- Você verá o processo em tempo real
- Deixe o script rodar até o final

---

## 🎯 O QUE O ROBÔ FAZ

1. **Login** - Entra com seu usuário (renato.consultoria@cidadeviva.org)
2. **Criar Registro** - Preenche formulário com dados fictícios
3. **Validar Sucesso** - Verifica se a página de sucesso aparece
4. **Checklist de Abas:**
   - ✓ Aparece em "Registros"
   - ✓ Aparece em "Jornada Visual"
   - ✓ Aparece em "Jornada de Relacionamento"

---

## 📋 DETALHES DO TESTE

### Dados Fictícios Usados
- **Escola**: Primeira escola da lista (automático)
- **Nome do Contato**: "Diretor Test Robot"
- **Cargo**: Diretor
- **Meio**: Reunião presencial
- **Interesse**: Alto
- **Prontidão**: Proposta
- **Alunos**:
  - Infantil 2: 15
  - Fund. I: 20
  - Fund. II: 45
  - Ensino Médio: 30

### URLs Validadas
- `/comercial/registros/novo` - Criação
- `/comercial/registros/sucesso?id=XXX` - Sucesso
- `/comercial/registros` - Lista
- `/comercial/jornada-visual` - Jornada Visual
- `/comercial/jornada` - Jornada Relacionamento

---

## 🔧 CONFIGURAÇÃO (Opcional)

Se precisar mudar configurações, edite `test-robo-registros.js`:

```javascript
const CONFIG = {
  EMAIL: 'seu-email@example.com',  // Seu usuário
  PASSWORD: 'sua-senha',            // Sua senha
  BASE_URL: 'http://localhost:3000', // URL da app
  HEADLESS: false,                   // true = sem visualizar Chrome
  SLOW_MO: 500,                      // ms entre ações (útil para debug)
};
```

---

## 🐛 SE ALGO DER ERRO

### Erro 1: "Dev server não respondeu"
```
Solução:
- Inicie manualmente com: npm run dev
- Deixe rodando antes de executar o robô
```

### Erro 2: "Falha no login"
```
Solução:
- Verifique se a senha está correta em `test-robo-registros.js`
- Use a variável de ambiente: $env:SUPABASE_PASSWORD="sua-senha"
```

### Erro 3: "Campo não encontrado"
```
Solução:
- Pode ser que a página tenha mudado de estrutura
- Edite `test-robo-registros.js` para corrigir os seletores
- Procure pelo novo nome do campo com F12 (DevTools)
```

### Erro 4: "RLS bloqueou acesso"
```
Solução:
- Você ainda não executou o SQL de correção do RLS
- Abra Supabase Dashboard
- Execute o SQL em: SQL_FIX_RLS_REGISTROS_CORRIGIDO.sql
```

---

## 🔄 LOOPING CONTÍNUO (Se quer rodar várias vezes)

Edite `test-robo-registros.js` e na função `finish()` mude:

```javascript
async finish() {
  // Aguardar 5 segundos antes de fechar
  await new Promise(r => setTimeout(r, 5000));

  if (this.browser) {
    await this.browser.close();
  }

  // Reiniciar automaticamente
  setTimeout(() => {
    process.exit(0);
  }, 2000);
}
```

---

## 📊 INTERPRETAR OS RESULTADOS

### ✅ SUCESSO (Esperado)
```
✓ Email preenchido
✓ Senha preenchida
✅ Login realizado com sucesso!
✓ Página de novo registro carregada
✓ Escola selecionada: [uuid]
...
🎉 TODOS OS TESTES PASSARAM COM SUCESSO!
✅ Registro criado e validado em todas as abas!
```

### ❌ FALHA (Precisa correção)
```
❌ Erro ao criar registro: Campo 'resumo' não encontrado
❌ ERRO CRÍTICO: Timeout na página de sucesso
```

Se falhar:
1. Leia a mensagem de erro
2. Faça a correção no código ou na aplicação
3. Execute novamente: `.\run-test-robo.ps1`

---

## 💡 DICAS

- **Robo parou no meio?** Verifique o Chrome aberto - pode estar esperando interação
- **Quer ver mais lentamente?** Aumente `SLOW_MO: 2000` em `test-robo-registros.js`
- **Quer debug visual?** Mude `HEADLESS: false` (já está)
- **Rodou múltiplas vezes?** Verifique se não criou registros duplicados em "Registros"

---

## 🚀 PRÓXIMOS PASSOS APÓS SUCESSO

Quando o robô passar em todos os testes:

1. **Teste manual** - Crie um registro manualmente você mesmo
2. **Verifique dados** - Vá em "Registros" e procure pelo registro
3. **Check das abas** - Abra Jornada Visual e Jornada de Relacionamento
4. **Deletar teste** - Se quiser, delete o registro do "Diretor Test Robot"

---

## 📞 PRECISA DE AJUDA?

Se o robô falhar:
1. Copie a mensagem de erro
2. Verifique a página em http://localhost:3000/comercial/registros
3. Teste manualmente os mesmos passos
4. Compartilhe o erro comigo

---

**Última atualização**: 2026-05-12  
**Status**: 🟢 Pronto para usar
