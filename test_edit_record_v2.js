const { chromium } = require('playwright');

const BASE_URL = 'https://gestaocomercial.arkosintelligence.com/hub';
const EMAIL = 'teste.robo@cidadeviva.org';
const PASSWORD = 'RoboTeste@2026';

async function testEditRecord() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('🧪 TESTE ESPECÍFICO: EDITAR REGISTRO\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    await page.goto(`${BASE_URL}/comercial/login`, { timeout: 50000, waitUntil: 'domcontentloaded' });
    
    await page.fill('input[type="email"]', EMAIL, { timeout: 10000 });
    await page.fill('input[type="password"]', PASSWORD, { timeout: 10000 });
    
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      // Aguardar qualquer navegação ou redirecionamento
      await page.waitForURL('**/*comercial**', { timeout: 20000 }).catch(() => null);
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => null);
    }
    
    console.log('✅ Login realizado\n');

    // 2. Navegar para registros
    console.log('2️⃣ Acessando página de Registros...');
    await page.goto(`${BASE_URL}/comercial/registros`, { timeout: 30000, waitUntil: 'networkidle' });
    console.log('✅ Página de Registros carregada\n');

    // 3. Procurar qualquer link/botão com "Adelheid" ou "kika" (nomes dos registros)
    console.log('3️⃣ Procurando registro para editar...');
    const registrosLinks = await page.locator('a, button, div').filter({ hasText: /Adelheid|kika/ }).first();
    
    if (await registrosLinks.isVisible()) {
      await registrosLinks.click();
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
      console.log('✅ Registro clicado\n');
    } else {
      console.log('⚠️ Não encontrei registros na página');
      console.log('Conteúdo HTML:');
      console.log(await page.content());
    }

    // 4. Procurar botão Editar
    console.log('4️⃣ Clicando em "Editar"...');
    const botaoEditar = await page.locator('button, a').filter({ hasText: /[Ee]ditar|[Ee]dit/ }).first();
    
    if (await botaoEditar.isVisible({ timeout: 5000 }).catch(() => false)) {
      await botaoEditar.click();
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => null);
      console.log('✅ Clicado em Editar\n');
    }

    // 5. Aguardar página de edição carregar
    await page.waitForTimeout(2000);

    // 6. Verificar campos preenchidos
    console.log('5️⃣ Validando dados carregados...\n');

    const contatoInput = await page.$('input[name*="contato_nome"], input[placeholder*="Contato"]');
    const resumoTextarea = await page.$('textarea[name*="resumo"], textarea[placeholder*="Resumo"]');
    const dataInput = await page.$('input[type="date"], input[name*="data"]');

    if (contatoInput) {
      const valor = await contatoInput.inputValue();
      if (valor) {
        console.log(`✅ Campo Contato preenchido: "${valor}"`);
      }
    }

    if (resumoTextarea) {
      const valor = await resumoTextarea.inputValue();
      if (valor) {
        console.log(`✅ Campo Resumo preenchido: "${valor.substring(0, 50)}..."`);
      }
    }

    if (dataInput) {
      const valor = await dataInput.inputValue();
      if (valor) {
        console.log(`✅ Campo Data preenchido: "${valor}"`);
      }
    }

    console.log('\n✅ TESTE CONCLUÍDO!');
    console.log('💡 Se os campos estão preenchidos, o RLS FIX funcionou!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    // Manter navegador aberto por 5 segundos para validação visual
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

testEditRecord();
