# 🤖 TESTE COMPLETO - PLATAFORMA COMERCIAL
# Executa todas as validações possíveis

Write-Host ""
Write-Host "╔═════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🤖 TESTE COMPLETO - PLATAFORMA COMERCIAL                         ║" -ForegroundColor Cyan
Write-Host "║                                                                 ║" -ForegroundColor Cyan
Write-Host "║  Testa:                                                         ║" -ForegroundColor Cyan
Write-Host "║  1. Login                                                       ║" -ForegroundColor Cyan
Write-Host "║  2. Criar Novo Registro                                         ║" -ForegroundColor Cyan
Write-Host "║  3. Validar Registro                                            ║" -ForegroundColor Cyan
Write-Host "║  4. Editar Registro                                             ║" -ForegroundColor Cyan
Write-Host "║  5. Validar Edição                                              ║" -ForegroundColor Cyan
Write-Host "║  6. Testar Navegação (8 abas)                                   ║" -ForegroundColor Cyan
Write-Host "║  7. Validação Final                                             ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configurar ambiente com credenciais de teste
$env:TEST_EMAIL = "teste.robo@cidadeviva.org"
$env:TEST_PASSWORD = "RoboTeste@2026"
$env:TEST_BASE_URL = "https://gestaocomercial.arkosintelligence.com/hub"
$env:TEST_HEADLESS = "false"
$env:TEST_SLOW_MO = "200"

Write-Host ""
Write-Host "⚙️  Configuração:" -ForegroundColor Blue
Write-Host "  URL: $($env:TEST_BASE_URL)" -ForegroundColor Gray
Write-Host "  Usuário: teste.robo@cidadeviva.org" -ForegroundColor Gray
Write-Host "  Chrome: Visível (SLOW_MO: 200ms)" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Iniciando testes..." -ForegroundColor Blue
Write-Host ""
Write-Host "═════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Executar robô completo
node test-robo-completo.js

$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "═════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($exitCode -eq 0) {
  Write-Host "✅ TODOS OS TESTES PASSARAM!" -ForegroundColor Green
  Write-Host ""
  Write-Host "Funcionalidades validadas:" -ForegroundColor Green
  Write-Host "  ✅ Login com autenticação" -ForegroundColor Green
  Write-Host "  ✅ Criar novo registro comercial" -ForegroundColor Green
  Write-Host "  ✅ Validar registro criado" -ForegroundColor Green
  Write-Host "  ✅ Editar registro" -ForegroundColor Green
  Write-Host "  ✅ Validar edição" -ForegroundColor Green
  Write-Host "  ✅ Navegação em 8 abas" -ForegroundColor Green
  Write-Host "  ✅ Validação final do sistema" -ForegroundColor Green
  Write-Host ""
  Write-Host "Sistema está 100% operacional! 🚀" -ForegroundColor Green
} else {
  Write-Host "⚠️  ALGUNS TESTES FALHARAM" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Verifique os logs acima para detalhes de cada teste" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

exit $exitCode
