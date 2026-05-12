# 🔐 Criar Usuário de Teste para Robô

## 🎯 Objetivo
Criar um usuário de teste que o robô possa usar para acessar a plataforma sem problemas de permissão.

## 📋 Dados do Usuário de Teste

**Email:** `teste.robo@cidadeviva.org`
**Senha:** `RoboTeste@2026`
**Role:** `gerente` (acesso total)

---

## ✅ Passo 1: Acessar Supabase Auth

1. Vá para: https://app.supabase.com
2. Selecione seu projeto
3. Vá para: **Authentication → Users**

---

## ✅ Passo 2: Criar Novo Usuário

1. Clique em **"Create a new user"** (botão verde)
2. Preencha:
   - **Email:** `teste.robo@cidadeviva.org`
   - **Password:** `RoboTeste@2026`
   - **Auto Confirm User:** ✅ (marque esta opção)
3. Clique em **"Create User"**

---

## ✅ Passo 3: Criar Perfil no Banco

Execute este SQL no **SQL Editor** do Supabase:

```sql
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  is_active,
  phone
)
SELECT
  u.id,
  u.email,
  'Robô de Testes',
  'gerente',
  true,
  NULL
FROM auth.users u
WHERE u.email = 'teste.robo@cidadeviva.org'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Robô de Testes',
  role = 'gerente',
  is_active = true;
```

---

## ✅ Passo 4: Configurar no Robô

Atualize o arquivo `EXECUTE_TESTE.ps1` e `TESTE_COMPLETO.ps1`:

Procure por:
```powershell
$env:TEST_EMAIL = "renato.consultoria@cidadeviva.org"
$env:TEST_PASSWORD = "admin123"
```

Substitua por:
```powershell
$env:TEST_EMAIL = "teste.robo@cidadeviva.org"
$env:TEST_PASSWORD = "RoboTeste@2026"
```

---

## ✅ Passo 5: Testar

Rode o robô:
```powershell
.\EXECUTE_TESTE.ps1
```

Você deve ver: ✅ **Login bem-sucedido!**

---

## 🔍 Verificação

Depois que o usuário estiver criado, você pode testar manualmente:

1. Vá para: https://gestaocomercial.arkosintelligence.com/hub/comercial/login
2. Use:
   - Email: `teste.robo@cidadeviva.org`
   - Senha: `RoboTeste@2026`
3. Você deve conseguir acessar normalmente

---

## ⚠️ Importante

- Este usuário é apenas para testes/robô
- Tem role `gerente` (acesso total)
- Use-o **apenas para automação**, não para usuário final
- Você pode gerar novos testes sempre que quiser

---

## 🆘 Se der Erro

### Erro: "Email already exists"
→ Significa que o usuário já foi criado (verifique a lista de usuários)

### Erro: "Connection refused"
→ Verifique se você tem conexão com internet e acesso ao Supabase

### Erro: "Invalid password"
→ A senha deve ter pelo menos 6 caracteres (a nossa tem 16)

---

## ✨ Próxima Etapa

Depois que criar o usuário, o robô conseguirá:
1. ✅ Fazer login automaticamente
2. ✅ Criar registros
3. ✅ Editar registros
4. ✅ Validar dados em todas as abas
5. ✅ Testar o sistema completo

Tudo funcionando! 🚀
