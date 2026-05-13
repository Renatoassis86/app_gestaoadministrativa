const { chromium } = require('playwright');

const BASE_URL = 'https://gestaocomercial.arkosintelligence.com/hub';
const EMAIL = 'teste.robo@cidadeviva.org';
const PASSWORD = 'RoboTeste@2026';

async function testEditRecord() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🧪 TESTE ESPECÍFICO: EDITAR REGISTRO\n');
    console.log('='.repeat(80) + '\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    await page.goto(`${BASE_URL}/comercial/login`, { timeout: 50000 });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ timeout: 30000 });
    console.log('✅ Login realizado\n');

    // 2. Navegar para registros
    console.log('2️⃣ Acessando página de Registros...');
    await page.goto(`${BASE_URL}/comercial/registros`, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    console.log('✅ Página de Registros carregada\n');

    // 3. Clicar no primeiro registro
    console.log('3️⃣ Procurando primeiro registro...');
    const primeiroRegistro = await page.$('div[data-testid*="registro"], tr:nth-child(1), [class*="registro"]');
    
    if (!primeiroRegistro) {
      console.log('⚠️ Não encontrei selector específico, tentando genérico...');
      const linhas = await page.locator('a, button').filter({ hasText: /Editar|Edit|Adelheid|kika/i }).first();
      if (await linhas.isVisible()) {
        await linhas.click();
      } else {
        console.log('❌ Não consegui encontrar registro');
        await browser.close();
        return;
      }
    } else {
      await primeiroRegistro.click();
    }

    await page.waitForLoadState('networkidle');
    console.log('✅ Primeiro registro encontrado\n');

    // 4. Clicar em editar
    console.log('4️⃣ Clicando em "Editar"...');
    const botaoEditar = await page.locator('button, a').filter({ hasText: /Editar|Edit/i }).first();
    
    if (await botaoEditar.isVisible()) {
      await botaoEditar.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ Botão Editar clicado\n');
    } else {
      console.log('⚠️ Botão Editar não encontrado');
    }

    // 5. Validar que dados carregaram
    console.log('5️⃣ Verificando se dados carregaram...\n');
    
    const campos = {
      'Contato Nome': 'input[name*="contato_nome"], input[placeholder*="Contato"], input[placeholder*="Nome"]',
      'Resumo': 'textarea[name*="resumo"], textarea[placeholder*="Resumo"]',
      'Data Contato': 'input[type="date"], input[name*="data_contato"]',
      'Interesse': 'select[name*="interesse"], input[name*="interesse"]',
      'Prontidão': 'select[name*="prontidao"], input[name*="prontidao"]',
    };

    let camposPreenchidos = 0;
    for (const [label, selector] of Object.entries(campos)) {
      const elemento = await page.$(selector);
      if (elemento) {
        const valor = await elemento.inputValue();
        if (valor && valor.trim()) {
          console.log(`✅ ${label}: "${valor.substring(0, 50)}..."`);
          camposPreenchidos++;
        } else {
          console.log(`⚠️ ${label}: VAZIO`);
        }
      } else {
        console.log(`❓ ${label}: não encontrado (selector: ${selector})`);
      }
    }

    console.log(`\n${camposPreenchidos}/5 campos preenchidos`);

    if (camposPreenchidos >= 3) {
      console.log('\n✅ DADOS CARREGARAM COM SUCESSO!');
      console.log('🎉 O problema de "dados não carregam ao editar" foi RESOLVIDO!');
    } else {
      console.log('\n❌ Dados não carregaram corretamente');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

testEditRecord();
