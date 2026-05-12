# ╔═══════════════════════════════════════════════════════════════╗
# ║  🤖 ROBÔ DE TESTE AUTOMATIZADO - REGISTROS COMERCIAIS         ║
# ╚═══════════════════════════════════════════════════════════════╝

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🤖 ROBÔ AUTOMATIZADO DE TESTES - V2                        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. SOLICITAR SENHA
$password = $env:TEST_PASSWORD
if ([string]::IsNullOrEmpty($password)) {
  Write-Host "🔐 Digite sua senha (será mascarada):" -ForegroundColor Yellow
  Write-Host "   Usuário: renato.consultoria@cidadeviva.org" -ForegroundColor Gray

  $securePassword = Read-Host -AsSecureString
  $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  $password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
  [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

$env:TEST_PASSWORD = $password

# 2. VERIFICAR NODE/NPM
Write-Host ""
Write-Host "📦 Verificando ambiente..." -ForegroundColor Blue
$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if (!$nodeVersion) {
  Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
  Write-Host "   Instale de: https://nodejs.org" -ForegroundColor Yellow
  exit 1
}

Write-Host "✓ Node: $nodeVersion" -ForegroundColor Green
Write-Host "✓ npm: $npmVersion" -ForegroundColor Green

# 3. INSTALAR DEPENDÊNCIAS (se necessário)
Write-Host ""
Write-Host "📥 Garantindo dependências..." -ForegroundColor Blue

$packageFile = Get-Content "package.json" | ConvertFrom-Json
$hasPlaywright = $null -ne $packageFile.devDependencies.playwright

if (!$hasPlaywright) {
  Write-Host "   Instalando Playwright..." -ForegroundColor Gray
  npm install playwright --save-dev --silent
}

Write-Host "✓ Dependências prontas" -ForegroundColor Green

# 4. VERIFICAR DEV SERVER
Write-Host ""
Write-Host "🔍 Verificando dev server..." -ForegroundColor Blue

$devRunning = $false
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
  $devRunning = $response.StatusCode -eq 200
} catch {
  $devRunning = $false
}

if ($devRunning) {
  Write-Host "✓ Dev server rodando em http://localhost:3000" -ForegroundColor Green
} else {
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
      Write-Host "   Se falhar, inicie manualmente: npm run dev" -ForegroundColor Gray
    }
    default {
      Write-Host "❌ Cancelado" -ForegroundColor Red
      exit 1
    }
  }
}

# 5. EXECUTAR ROBÔ
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Iniciando testes..." -ForegroundColor Blue
Write-Host ""

node test-robo-v2.js

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($exitCode -eq 0) {
  Write-Host ""
  Write-Host "🎉 SUCESSO! Todos os testes passaram!" -ForegroundColor Green
  Write-Host ""
  Write-Host "Próximas etapas:" -ForegroundColor Green
  Write-Host "  1. Abra http://localhost:3000/comercial/registros" -ForegroundColor Green
  Write-Host "  2. Procure por '[TESTE]'" -ForegroundColor Green
  Write-Host "  3. Clique para ver detalhes" -ForegroundColor Green
  Write-Host "  4. Navegue para Jornada Visual e Jornada de Relacionamento" -ForegroundColor Green
} else {
  Write-Host ""
  Write-Host "❌ Testes falharam. Verifique os logs acima." -ForegroundColor Red
  Write-Host ""
  Write-Host "Se o erro for RLS relacionado:" -ForegroundColor Yellow
  Write-Host "  1. Execute SQL_FIX_RLS_REGISTROS_CORRIGIDO.sql no Supabase" -ForegroundColor Yellow
  Write-Host "  2. Reinicie o script" -ForegroundColor Yellow
}

Write-Host ""
exit $exitCode
