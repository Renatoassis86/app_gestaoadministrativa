# ============================================================
# SCRIPT PARA EXECUTAR ROBÔ DE TESTE AUTOMATIZADO
# ============================================================
# Este script:
# 1. Verifica se npm/node estão instalados
# 2. Solicita senha de forma segura
# 3. Instala dependências do Playwright
# 4. Inicia o dev server (se não estiver rodando)
# 5. Executa o robô de teste
# ============================================================

$ErrorActionPreference = "Stop"
$PSDefaultParameterValues['Out-Host:OutBuffer'] = 1

Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🤖 ROBÔ AUTOMATIZADO DE TESTE - REGISTROS COMERCIAIS     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# 1. VERIFICAR NODE/NPM
Write-Host ""
Write-Host "📦 Verificando Node.js e npm..." -ForegroundColor Blue

$node = node --version
$npm = npm --version

Write-Host "✓ Node: $node" -ForegroundColor Green
Write-Host "✓ npm: $npm" -ForegroundColor Green

# 1.5 SOLICITAR SENHA
Write-Host ""
Write-Host "🔐 Configurando credenciais..." -ForegroundColor Blue

if ([string]::IsNullOrEmpty($env:TEST_PASSWORD)) {
  Write-Host "Senha não encontrada. Digite a senha do seu usuário (renato.consultoria@cidadeviva.org):" -ForegroundColor Yellow
  Write-Host "(Será mascarada enquanto digita)" -ForegroundColor Gray

  # Ler senha de forma segura
  $securePassword = Read-Host -AsSecureString "Senha"
  $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
  $plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
  [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

  $env:TEST_PASSWORD = $plainPassword
  Write-Host "✓ Senha configurada" -ForegroundColor Green
} else {
  Write-Host "✓ Usando senha da variável de ambiente" -ForegroundColor Green
}

# 2. INSTALAR DEPENDÊNCIAS
Write-Host ""
Write-Host "📥 Instalando dependências..." -ForegroundColor Blue

npm install

Write-Host "✓ Dependências instaladas" -ForegroundColor Green

# 3. VERIFICAR DEV SERVER
Write-Host ""
Write-Host "🔍 Verificando se dev server está rodando..." -ForegroundColor Blue

$devRunning = $false
try {
  $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
  $devRunning = $response.StatusCode -eq 200
} catch {
  $devRunning = $false
}

if ($devRunning) {
  Write-Host "✓ Dev server já está rodando em http://localhost:3000" -ForegroundColor Green
} else {
  Write-Host "⚠️  Dev server não está rodando. Iniciando..." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "IMPORTANTE: O dev server será iniciado em uma nova janela!" -ForegroundColor Yellow
  Write-Host "Deixe a janela aberta enquanto o robô estiver executando." -ForegroundColor Yellow
  Write-Host ""

  # Iniciar dev server em nova janela PowerShell
  Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev" -WindowStyle Normal

  Write-Host "⏳ Aguardando dev server iniciar (30 segundos)..." -ForegroundColor Yellow

  $timeout = 30
  $elapsed = 0
  while (-not $devRunning -and $elapsed -lt $timeout) {
    Start-Sleep -Seconds 1
    $elapsed++
    Write-Host "  [$elapsed/$timeout]" -ForegroundColor Gray -NoNewline

    try {
      $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction SilentlyContinue
      $devRunning = $response.StatusCode -eq 200
    } catch {
      $devRunning = $false
    }
  }

  if ($devRunning) {
    Write-Host ""
    Write-Host "✓ Dev server iniciado com sucesso!" -ForegroundColor Green
  } else {
    Write-Host ""
    Write-Host "❌ Dev server não respondeu após 30 segundos" -ForegroundColor Red
    Write-Host "Tente reiniciar manualmente com: npm run dev" -ForegroundColor Yellow
    exit 1
  }
}

# 4. EXECUTAR ROBÔ
Write-Host ""
Write-Host "🚀 Iniciando robô de teste..." -ForegroundColor Blue
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan

node test-robo-registros.js

$exitCode = $LASTEXITCODE

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($exitCode -eq 0) {
  Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
  Write-Host "║  ✅ SUCESSO! Todos os testes passaram!                   ║" -ForegroundColor Green
  Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
} else {
  Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Red
  Write-Host "║  ❌ ERRO encontrado. Verifique os logs acima.            ║" -ForegroundColor Red
  Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Red
}

exit $exitCode
