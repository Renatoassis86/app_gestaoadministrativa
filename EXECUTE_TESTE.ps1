# 🤖 EXECUTAR ROBÔ DE TESTES
# Simplesmente execute este arquivo para começar

Write-Host ""
Write-Host "╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║  🤖 ROBÔ DE TESTES - PLATAFORMA COMERCIAL                 ║" -ForegroundColor Magenta
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Configurar ambiente com credenciais de teste
$env:TEST_EMAIL = "teste.robo@cidadeviva.org"
$env:TEST_PASSWORD = "RoboTeste@2026"
$env:TEST_BASE_URL = "https://gestaocomercial.arkosintelligence.com/hub"
$env:TEST_HEADLESS = "false"

Write-Host ""
Write-Host "✓ Configuração:" -ForegroundColor Green
Write-Host "  - URL: $($env:TEST_BASE_URL)" -ForegroundColor Gray
Write-Host "  - Usuário: teste.robo@cidadeviva.org" -ForegroundColor Gray
Write-Host "  - Chrome: Visível" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Iniciando robô..." -ForegroundColor Blue
Write-Host ""

# Executar robô
node test-robo-master.js

# Capturar resultado
$exitCode = $LASTEXITCODE

Write-Host ""

if ($exitCode -eq 0) {
  Write-Host "✅ TESTE PASSOU!" -ForegroundColor Green
  Write-Host ""
  Write-Host "A plataforma está funcionando normalmente:" -ForegroundColor Green
  Write-Host "  ✅ Login" -ForegroundColor Green
  Write-Host "  ✅ Registros" -ForegroundColor Green
  Write-Host "  ✅ Escolas" -ForegroundColor Green
  Write-Host "  ✅ Jornada Visual" -ForegroundColor Green
  Write-Host "  ✅ Jornada Relacionamento" -ForegroundColor Green
  Write-Host "  ✅ Tabela" -ForegroundColor Green
  Write-Host "  ✅ Pipeline" -ForegroundColor Green
} else {
  Write-Host "❌ TESTE FALHOU" -ForegroundColor Red
  Write-Host ""
  Write-Host "Verifique os logs acima para detalhes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═════════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

exit $exitCode
