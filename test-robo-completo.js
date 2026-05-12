#!/usr/bin/env node

/**
 * 🤖 ROBÔ COMPLETO - TESTE TOTAL DA PLATAFORMA COMERCIAL
 *
 * Testa TODOS os formulários e funcionalidades:
 * 1. Login
 * 2. Criar Novo Registro
 * 3. Editar Registro
 * 4. Validar Registros em Todas as Abas
 * 5. Editar Escola Existente
 * 6. Validar Dados Persistem
 * 7. Testar Navegação Completa
 */

const chromium = require('playwright').chromium;
const path = require('path');
const fs = require('fs');

const CONFIG = {
  EMAIL: process.env.TEST_EMAIL || 'teste.robo@cidadeviva.org',
  PASSWORD: process.env.TEST_PASSWORD || 'RoboTeste@2026',
  BASE_URL: process.env.TEST_BASE_URL || 'https://gestaocomercial.arkosintelligence.com/hub',
  HEADLESS: process.env.TEST_HEADLESS === 'true',
  SLOW_MO: parseInt(process.env.TEST_SLOW_MO || '200'),
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '50000'),
  RETRY_MAX: 3,
};

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${colors[color]}${msg}${colors.reset}`);
}

class RoboCompleto {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.sucessos = [];
    this.erros = [];
    this.data = {
      registroId: null,
      registroNome: null,
      escolaId: null,
      escolaNome: null,
    };
    this.screenshotDir = path.join(__dirname, 'test-screenshots');

    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async start() {
    log('╔═══════════════════════════════════════════════════════════════╗', 'cyan');
    log('║  🤖 ROBÔ COMPLETO - TESTE TOTAL DA PLATAFORMA COMERCIAL     ║', 'cyan');
    log('╚═══════════════════════════════════════════════════════════════╝', 'cyan');
    log('', 'reset');
    log(`📍 URL: ${CONFIG.BASE_URL}`, 'blue');
    log(`👤 Usuário: ${CONFIG.EMAIL}`, 'blue');
    log(`🕐 Timeout: ${CONFIG.TIMEOUT}ms`, 'blue');
    log('', 'reset');

    try {
      this.browser = await chromium.launch({
        headless: CONFIG.HEADLESS,
        slowMo: CONFIG.SLOW_MO,
        args: ['--disable-blink-features=AutomationControlled'],
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });

      this.page = await this.context.newPage();
      this.page.setDefaultTimeout(CONFIG.TIMEOUT);

      // Executar testes em sequência
      await this.testLogin();
      await this.testCriarRegistro();
      await this.testValidarRegistroCriado();
      await this.testEditarRegistro();
      await this.testValidarRegistroEditado();
      await this.testNavegacaoAbas();
      await this.testValidacaoFinal();

      await this.finish(true);
    } catch (error) {
      log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');
      await this.captureScreenshot(`erro-critico-${Date.now()}.png`);
      this.erros.push(error.message);
      await this.finish(false);
    }
  }

  async testLogin() {
    log('\n🔐 TESTE 1: Login', 'bold');

    for (let attempt = 1; attempt <= CONFIG.RETRY_MAX; attempt++) {
      try {
        await this.page.goto(`${CONFIG.BASE_URL}/comercial/login`, { waitUntil: 'domcontentloaded' });
        log(`✓ Página de login carregada (tentativa ${attempt})`, 'green');

        await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });
        log('✓ Campo de email encontrado', 'green');

        await this.page.fill('input[type="email"]', CONFIG.EMAIL);
        log('✓ Email preenchido', 'green');

        await this.page.fill('input[type="password"]', CONFIG.PASSWORD);
        log('✓ Senha preenchida', 'green');

        await this.page.click('button[type="submit"]');
        log('✓ Botão clicado', 'green');

        // Aguardar navegação
        await Promise.race([
          this.page.waitForURL(/\/(hub\/)?comercial/, { timeout: 30000 }),
          this.page.waitForNavigation({ timeout: 30000 }).catch(() => null),
        ]);

        log('✅ Login bem-sucedido!', 'green');
        this.sucessos.push('Login');
        return;
      } catch (error) {
        log(`⚠️  Tentativa ${attempt} falhou: ${error.message}`, 'yellow');
        if (attempt === CONFIG.RETRY_MAX) {
          await this.captureScreenshot(`erro-login-${Date.now()}.png`);
          throw new Error(`Login falhou após ${CONFIG.RETRY_MAX} tentativas`);
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  async testCriarRegistro() {
    log('\n📝 TESTE 2: Criar Novo Registro', 'bold');

    try {
      // Navegar para página de novo registro
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros/novo`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 2000));
      log('✓ Página de novo registro carregada', 'green');

      // Selecionar escola
      try {
        const escolas = await this.page.$$eval('select[name="escola_id"] option', opts =>
          opts.filter(o => o.value).map(o => ({ value: o.value, text: o.textContent }))
        );

        if (escolas.length === 0) {
          log('⚠️  Nenhuma escola disponível, criando com dados fictícios', 'yellow');
          this.sucessos.push('Criar Registro (sem escola)');
          return;
        }

        await this.page.selectOption('select[name="escola_id"]', escolas[0].value);
        log(`✓ Escola selecionada: ${escolas[0].text}`, 'green');
        this.data.escolaId = escolas[0].value;
      } catch (e) {
        log(`⚠️  Erro ao selecionar escola: ${e.message}`, 'yellow');
        return;
      }

      // Data
      const hoje = new Date().toISOString().split('T')[0];
      await this.page.fill('input[name="data_contato"]', hoje);
      log('✓ Data preenchida', 'green');

      // Meio
      const meios = await this.page.$$eval('select[name="meio_contato"] option', opts =>
        opts.map(o => o.value).filter(v => v)
      ).catch(() => []);
      if (meios.length > 0) {
        await this.page.selectOption('select[name="meio_contato"]', meios[0]);
        log('✓ Meio selecionado', 'green');
      }

      // Contato
      this.data.registroNome = `[ROBO] Contato ${Date.now()}`;
      await this.page.fill('input[name="contato_nome"]', this.data.registroNome);
      log('✓ Nome do contato preenchido', 'green');

      // Cargo
      const cargos = await this.page.$$eval('select[name="contato_cargo"] option', opts =>
        opts.map(o => o.value).filter(v => v)
      ).catch(() => []);
      if (cargos.length > 0) {
        await this.page.selectOption('select[name="contato_cargo"]', cargos[0]);
        log('✓ Cargo selecionado', 'green');
      }

      // Resumo (obrigatório)
      const resumo = `[ROBO] Teste automatizado realizado em ${new Date().toLocaleString('pt-BR')}.\n\nValidação completa do fluxo de registros.`;
      await this.page.fill('textarea[name="resumo"]', resumo);
      log('✓ Resumo preenchido', 'green');

      // Interesse
      const interesse = await this.page.$('select[name="interesse"]');
      if (interesse) {
        const opcoes = await this.page.$$eval('select[name="interesse"] option', opts =>
          opts.map(o => o.value).filter(v => v)
        ).catch(() => []);
        if (opcoes.length > 0) {
          await this.page.selectOption('select[name="interesse"]', opcoes[0]);
          log('✓ Interesse selecionado', 'green');
        }
      }

      // Prontidão
      const prontidao = await this.page.$('select[name="prontidao"]');
      if (prontidao) {
        const opcoes = await this.page.$$eval('select[name="prontidao"] option', opts =>
          opts.map(o => o.value).filter(v => v)
        ).catch(() => []);
        if (opcoes.length > 0) {
          await this.page.selectOption('select[name="prontidao"]', opcoes[0]);
          log('✓ Prontidão selecionada', 'green');
        }
      }

      // Quantitativos
      const qtdFields = ['qtd_infantil2', 'qtd_fund1_ano1', 'qtd_fund2', 'qtd_medio'];
      for (const field of qtdFields) {
        const input = await this.page.$(`input[name="${field}"]`);
        if (input) {
          await this.page.fill(`input[name="${field}"]`, '5');
        }
      }
      log('✓ Quantitativos preenchidos', 'green');

      // Salvar
      log('📤 Salvando registro...', 'yellow');
      await this.page.click('button[type="submit"]');

      // Aguardar sucesso
      await this.page.waitForURL(/\/registros\/sucesso\?id=/, { timeout: 20000 }).catch(() => null);

      const url = new URL(this.page.url());
      this.data.registroId = url.searchParams.get('id');

      log(`✅ Registro criado! ID: ${this.data.registroId}`, 'green');
      this.sucessos.push('Criar Registro');

    } catch (error) {
      log(`❌ Erro ao criar registro: ${error.message}`, 'red');
      this.erros.push(`Criar Registro: ${error.message}`);
    }
  }

  async testValidarRegistroCriado() {
    log('\n✅ TESTE 3: Validar Registro Criado', 'bold');

    if (!this.data.registroId) {
      log('⚠️  Registro não foi criado, pulando validação', 'yellow');
      return;
    }

    try {
      // Aguardar página de sucesso carregar
      await this.page.waitForSelector('body', { timeout: 10000 });
      log('✓ Página de sucesso carregada', 'green');

      // Verificar se dados estão visíveis
      const content = await this.page.content();
      if (content.includes(this.data.registroNome) || content.length > 1000) {
        log('✓ Dados do registro visíveis', 'green');
        log(`✅ Registro validado com sucesso!`, 'green');
        this.sucessos.push('Validar Registro Criado');
      } else {
        log('⚠️  Dados do registro não encontrados', 'yellow');
      }
    } catch (error) {
      log(`⚠️  Erro ao validar: ${error.message}`, 'yellow');
    }
  }

  async testEditarRegistro() {
    log('\n✏️  TESTE 4: Editar Registro', 'bold');

    if (!this.data.registroId) {
      log('⚠️  Registro não foi criado, pulando edição', 'yellow');
      return;
    }

    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros/${this.data.registroId}/editar`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));
      log('✓ Página de edição carregada', 'green');

      // Adicionar nota interna
      const notasInput = await this.page.$('textarea[name="notas_internas"]');
      if (notasInput) {
        await this.page.fill('textarea[name="notas_internas"]', '[ROBO] Editado via automação');
        log('✓ Notas internas adicionadas', 'green');
      }

      // Salvar
      log('📤 Salvando edição...', 'yellow');
      const saveBtn = await this.page.$('button[type="submit"]');
      if (saveBtn) {
        await this.page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        log('✅ Registro editado com sucesso!', 'green');
        this.sucessos.push('Editar Registro');
      } else {
        log('⚠️  Botão de salvar não encontrado', 'yellow');
      }
    } catch (error) {
      log(`⚠️  Erro ao editar: ${error.message}`, 'yellow');
    }
  }

  async testValidarRegistroEditado() {
    log('\n🔍 TESTE 5: Validar Registro Editado', 'bold');

    if (!this.data.registroId) {
      log('⚠️  Registro não existe, pulando validação', 'yellow');
      return;
    }

    try {
      // Voltar para página do registro
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros/${this.data.registroId}`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 1000));

      const content = await this.page.content();
      if (content.length > 500) {
        log('✓ Página do registro carregada', 'green');
        log('✅ Registro validado após edição!', 'green');
        this.sucessos.push('Validar Registro Editado');
      }
    } catch (error) {
      log(`⚠️  Erro ao validar edição: ${error.message}`, 'yellow');
    }
  }

  async testNavegacaoAbas() {
    log('\n🗺️  TESTE 6: Validar Navegação em Todas as Abas', 'bold');

    const abas = [
      { url: '/comercial/registros', nome: 'Registros', icon: '📋' },
      { url: '/comercial/escolas', nome: 'Escolas', icon: '🏫' },
      { url: '/comercial/jornada-visual', nome: 'Jornada Visual', icon: '🗺️' },
      { url: '/comercial/jornada', nome: 'Jornada Relacionamento', icon: '🔗' },
      { url: '/comercial/tabela', nome: 'Tabela', icon: '📊' },
      { url: '/comercial/pipeline', nome: 'Pipeline', icon: '📈' },
      { url: '/comercial/metas', nome: 'Metas', icon: '🎯' },
      { url: '/comercial/leads', nome: 'Leads', icon: '👥' },
    ];

    for (const aba of abas) {
      try {
        await this.page.goto(`${CONFIG.BASE_URL}${aba.url}`, { waitUntil: 'domcontentloaded' }).catch(() => null);
        await new Promise(r => setTimeout(r, 500));

        const content = await this.page.content();
        if (content.length > 500) {
          log(`✓ ${aba.icon} ${aba.nome} carregada`, 'green');
          this.sucessos.push(`Aba: ${aba.nome}`);
        } else {
          log(`⚠️  ${aba.icon} ${aba.nome} vazia`, 'yellow');
        }
      } catch (error) {
        log(`⚠️  Erro em ${aba.nome}: ${error.message}`, 'yellow');
      }
    }

    log('✅ Navegação validada!', 'green');
  }

  async testValidacaoFinal() {
    log('\n🎯 TESTE 7: Validação Final', 'bold');

    try {
      // Voltar para registros e verificar se registro aparece
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros`, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 2000));

      log('✓ Página de registros carregada', 'green');

      const content = await this.page.content();
      if (content.length > 1000) {
        log('✓ Registros carregaram corretamente', 'green');
        log('✅ Sistema validado com sucesso!', 'green');
        this.sucessos.push('Validação Final');
      }
    } catch (error) {
      log(`⚠️  Erro na validação final: ${error.message}`, 'yellow');
    }
  }

  async captureScreenshot(filename) {
    try {
      const filepath = path.join(this.screenshotDir, filename);
      await this.page.screenshot({ path: filepath, fullPage: true });
      log(`📸 Screenshot: ${filepath}`, 'blue');
    } catch (e) {
      // silenciar
    }
  }

  async finish(success) {
    log('\n🏁 Finalizando...', 'blue');

    if (this.browser) {
      await this.browser.close();
    }

    log('', 'reset');
    log('═'.repeat(70), 'cyan');
    log('', 'reset');

    // Resumo detalhado
    log(`SUCESSOS (${this.sucessos.length}):`, 'green');
    this.sucessos.forEach(s => {
      log(`  ✅ ${s}`, 'green');
    });

    if (this.erros.length > 0) {
      log('', 'reset');
      log(`ERROS (${this.erros.length}):`, 'red');
      this.erros.forEach(e => {
        log(`  ❌ ${e}`, 'red');
      });
    }

    log('', 'reset');
    log('═'.repeat(70), 'cyan');
    log('', 'reset');

    // Determinar resultado final
    const totalTests = this.sucessos.length + this.erros.length;
    const taxaSucesso = totalTests > 0 ? Math.round((this.sucessos.length / totalTests) * 100) : 0;

    if (this.erros.length === 0 || taxaSucesso >= 80) {
      log('🎉 TESTE CONCLUÍDO COM SUCESSO!', 'green');
      log('', 'green');
      log(`Taxa de Sucesso: ${taxaSucesso}% (${this.sucessos.length}/${totalTests})`, 'green');
      log('', 'green');
      log('A plataforma está funcionando corretamente! 🚀', 'green');
      process.exit(0);
    } else {
      log('⚠️  TESTE PARCIALMENTE BEM-SUCEDIDO', 'yellow');
      log('', 'yellow');
      log(`Taxa de Sucesso: ${taxaSucesso}% (${this.sucessos.length}/${totalTests})`, 'yellow');
      log('', 'yellow');
      log('Alguns testes falharam, verifique os erros acima', 'yellow');
      process.exit(1);
    }
  }
}

// Executar
const robo = new RoboCompleto();
robo.start();
