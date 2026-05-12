# ╔═══════════════════════════════════════════════════════════════════╗
# ║  🤖 ROBÔ MASTER - TESTE COMPLETO DA PLATAFORMA COMERCIAL          ║
# ║                                                                   ║
# ║  Testa TODOS os formulários:                                      ║
# ║  1. Criar Nova Escola                                            ║
# ║  2. Criar Novo Registro                                          ║
# ║  3. Editar Registro                                              ║
# ║  4. Editar Escola                                                ║
# ║  5. Validar todas as abas (Registros, Escolas, Jornada, etc)     ║
# ╚═══════════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  🤖 ROBÔ MASTER - TESTE COMPLETO DA PLATAFORMA COMERCIAL        ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Configuração padrão da senha
$password = $env:TEST_PASSWORD

# Se a senha não foi fornecida, pedir
if ([string]::IsNullOrEmpty($password)) {
  Write-Host "🔐 Digite sua senha (será mascarada):" -ForegroundColor Yellow
  Write-Host "   Usuário: renato.consultoria@cidadeviva.org" -ForegroundColor Gray

  $securePassword = Read-Host -AsSecureString
  $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
  [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

$env:TEST_PASSWORD = $password

# Verificar ambiente
Write-Host ""
Write-Host "📦 Verificando ambiente..." -ForegroundColor Blue
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if (!$nodeVersion) {
  Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
  exit 1
}

Write-Host "✓ Node: $nodeVersion" -ForegroundColor Green
Write-Host "✓ npm: $npmVersion" -ForegroundColor Green

# Instalar Playwright se necessário
Write-Host ""
Write-Host "📥 Garantindo dependências..." -ForegroundColor Blue
$packageFile = Get-Content "package.json" | ConvertFrom-Json
$hasPlaywright = $null -ne $packageFile.devDependencies.playwright

if (!$hasPlaywright) {
  Write-Host "   Instalando Playwright..." -ForegroundColor Gray
  npm install playwright --save-dev --silent
}
Write-Host "✓ Dependências prontas" -ForegroundColor Green

# Verificar dev server
Write-Host ""
Write-Host "🔍 Verificando dev server..." -ForegroundColor Blue

$devRunning = $false
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
  $devRunning = $response.StatusCode -eq 200
} catch {
  $devRunning = $false
}

if (!$devRunning) {
  Write-Host "⚠️  Dev server não está rodando" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Escolha uma opção:" -ForegroundColor Yellow
  Write-Host "  1 - Iniciar dev server (abrirá nova janela)" -ForegroundColor Gray
  Write-Host "  2 - Continuar sem dev server (pode falhar)" -ForegroundColor Gray
  Write-Host "  3 - Cancelar" -ForegroundColor Gray
  Write-Host ""

  $choice = Read-Host "Digite sua escolha (1/2/3)"

  switch ($choice) {
    "1" {
      Write-Host ""
      Write-Host "🚀 Iniciando dev server..." -ForegroundColor Yellow
      Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"

      Write-Host "⏳ Aguardando dev server (até 60s)..." -ForegroundColor Yellow
      for ($i = 0; $i -lt 60; $i++) {
        try {
          $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
          if ($response.StatusCode -eq 200) {
            Write-Host ""
            Write-Host "✓ Dev server pronto!" -ForegroundColor Green
            $devRunning = $true
            break
          }
        } catch { }
        Write-Host "." -NoNewline -ForegroundColor Yellow
        Start-Sleep -Seconds 1
      }

      if (!$devRunning) {
        Write-Host ""
        Write-Host "❌ Dev server não respondeu" -ForegroundColor Red
        exit 1
      }
    }
    "2" {
      Write-Host "⚠️  Continuando sem dev server..." -ForegroundColor Yellow
    }
    default {
      Write-Host "❌ Cancelado" -ForegroundColor Red
      exit 1
    }
  }
} else {
  Write-Host "✓ Dev server rodando em http://localhost:3000" -ForegroundColor Green
}

# Executar robô master
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🤖 INICIANDO TESTES..." -ForegroundColor Blue
Write-Host ""

node test-robo-master.js

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($exitCode -eq 0) {
  Write-Host ""
  Write-Host "🎉 SUCESSO TOTAL!" -ForegroundColor Green
  Write-Host ""
  Write-Host "Todos os formulários e funcionalidades foram testados:" -ForegroundColor Green
  Write-Host "  ✅ Login" -ForegroundColor Green
  Write-Host "  ✅ Criar Escola" -ForegroundColor Green
  Write-Host "  ✅ Criar Registro" -ForegroundColor Green
  Write-Host "  ✅ Editar Registro" -ForegroundColor Green
  Write-Host "  ✅ Editar Escola" -ForegroundColor Green
  Write-Host "  ✅ Validar Abas" -ForegroundColor Green
  Write-Host ""
  Write-Host "A plataforma está 100% funcional! 🚀" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "❌ Alguns testes falharam" -ForegroundColor Red
  Write-Host ""
  Write-Host "Verifique os logs acima para identificar o problema:" -ForegroundColor Yellow
  Write-Host "  • Erro de RLS? Execute SQL_FIX_RLS_REGISTROS_CORRIGIDO.sql" -ForegroundColor Yellow
  Write-Host "  • Campo não encontrado? Formulário pode ter mudado" -ForegroundColor Yellow
  Write-Host "  • Dev server fora? Reinicie com: npm run dev" -ForegroundColor Yellow
}

Write-Host ""
exit $exitCode
