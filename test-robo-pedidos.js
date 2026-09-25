#!/usr/bin/env node

/**
 * 🤖 ROBÔ AUTOMATIZADO DE TESTE - PREVISÃO DE PEDIDOS (formulário público)
 *
 * Simula uma escola parceira preenchendo /formulario-pedidos sem login e
 * confirma que o dado chegou no Supabase (redirecionamento para /obrigado
 * só acontece se o insert em `previsoes_pedidos` não lançar erro).
 */

const chromium = require('playwright').chromium;

const CONFIG = {
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  HEADLESS: process.env.TEST_HEADLESS === 'true' ? true : false,
  SLOW_MO: parseInt(process.env.TEST_SLOW_MO || '200'),
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
};

const colors = { reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', blue: '\x1b[36m', bold: '\x1b[1m' };
function log(msg, color = 'reset') { console.log(`${colors[color]}${msg}${colors.reset}`); }

const NOME_ESCOLA_TESTE = `Escola Teste Robô ${Date.now()}`;

async function main() {
  log('🚀 Iniciando Robô de Teste — Previsão de Pedidos...', 'blue');
  log(`   BASE_URL: ${CONFIG.BASE_URL}`, 'blue');

  const browser = await chromium.launch({ headless: CONFIG.HEADLESS, slowMo: CONFIG.SLOW_MO });
  const page = await browser.newPage();
  page.setDefaultTimeout(CONFIG.TIMEOUT);
  page.setDefaultNavigationTimeout(CONFIG.TIMEOUT);

  let ok = true;

  try {
    log('\n📝 ETAPA 1: Abrir formulário público...', 'bold');
    await page.goto(`${CONFIG.BASE_URL}/formulario-pedidos`);
    await page.waitForSelector('text=Previsão de Pedidos', { timeout: 10000 });
    log('✓ Formulário carregado', 'green');

    log('\n📋 ETAPA 2: Preencher dados da instituição...', 'bold');
    await page.fill('input[name="nome_instituicao"]', NOME_ESCOLA_TESTE);
    await page.fill('input[name="cnpj"]', '00.000.000/0001-00');
    await page.fill('input[name="endereco"]', 'Rua de Teste, 123, Bairro Teste, João Pessoa - PB, CEP 58000-000');
    await page.fill('input[name="representante_legal"]', 'Representante Teste Robô');
    log('✓ Dados da instituição preenchidos', 'green');

    log('\n👤 ETAPA 3: Preencher responsável pelo preenchimento...', 'bold');
    await page.fill('input[name="responsavel_nome"]', 'Robô de Teste Automatizado');
    await page.fill('input[name="responsavel_telefone"]', '(83) 90000-0000');
    log('✓ Responsável preenchido', 'green');

    log('\n🏫 ETAPA 4: Marcar séries adotadas...', 'bold');
    const series = ['Infantil II', 'Infantil III', '1º ano - Fund I'];
    for (const s of series) {
      await page.check(`input[name="series_adotadas"][value="${s}"]`);
    }
    log(`✓ Séries marcadas: ${series.join(', ')}`, 'green');

    log('\n📅 ETAPA 5: Preencher calendário letivo...', 'bold');
    await page.fill('input[name="data_inicio_letivo"]', '2027-02-01');
    await page.fill('input[name="data_fim_letivo"]', '2027-12-10');
    await page.check('input[name="formato_calendario"][value="Bimestral"]');
    log('✓ Calendário preenchido', 'green');

    log('\n🔢 ETAPA 6: Preencher previsão de alunos por série...', 'bold');
    await page.fill('input[name="infantil2_qtd"]', '12');
    await page.fill('input[name="infantil3_qtd"]', '15');
    await page.fill('input[name="fund1_ano1_qtd"]', '20');
    log('✓ Quantitativos preenchidos', 'green');

    log('\n📦 ETAPA 7: Preencher observações do material...', 'bold');
    await page.fill('textarea[name="observacoes_material"]', 'Teste automatizado do robô: kit individual por aluno, separado por série.');
    log('✓ Observações preenchidas', 'green');

    log('\n📤 ETAPA 8: Enviar formulário...', 'bold');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/formulario-pedidos\/obrigado/, { timeout: 15000 });
    log('✅ Redirecionado para página de confirmação — o insert no Supabase não lançou erro', 'green');

    log('\n🎉 ETAPA 9: Validar mensagem de confirmação...', 'bold');
    await page.waitForSelector('text=Previsão de pedidos enviada!', { timeout: 10000 });
    log('✓ Mensagem de confirmação exibida', 'green');

    log(`\n🏫 Escola de teste inserida: "${NOME_ESCOLA_TESTE}"`, 'blue');
    log('   (pode ser localizada em previsoes_pedidos pelo nome_instituicao acima)', 'blue');

  } catch (error) {
    ok = false;
    log(`\n❌ ERRO: ${error.message}`, 'red');
  } finally {
    await browser.close();
  }

  if (ok) {
    log('\n🎉 TODOS OS TESTES PASSARAM — dado chegou no Supabase com sucesso!', 'green');
  } else {
    log('\n⚠️  Teste falhou — ver erro acima.', 'red');
  }
  process.exit(ok ? 0 : 1);
}

main();
