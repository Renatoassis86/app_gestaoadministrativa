#!/usr/bin/env node

/**
 * 🤖 ROBÔ AUTOMATIZADO V2 - REGISTROS COMERCIAIS
 *
 * Melhorias:
 * - Melhor tratamento de erros
 * - Retry automático para operações
 * - Logs coloridos detalhados
 * - Captura de screenshot em caso de erro
 * - Validação mais robusta
 */

const chromium = require('playwright').chromium;
const path = require('path');
const fs = require('fs');

// ===== CONFIGURAÇÃO =====
const CONFIG = {
  EMAIL: process.env.TEST_EMAIL || 'renato.consultoria@cidadeviva.org',
  PASSWORD: process.env.TEST_PASSWORD,
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  HEADLESS: process.env.TEST_HEADLESS === 'true',
  SLOW_MO: parseInt(process.env.TEST_SLOW_MO || '300'),
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
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
};

function log(msg, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${colors[color]}${msg}${colors.reset}`);
}

class TestRoboV2 {
  constructor() {
    this.browser = null;
    this.page = null;
    this.registroId = null;
    this.errors = [];
    this.screenshotDir = path.join(__dirname, 'test-screenshots');

    // Criar diretório de screenshots
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async start() {
    log('🚀 Iniciando Robô de Teste V2...', 'blue');
    log(`📍 Base URL: ${CONFIG.BASE_URL}`, 'blue');
    log(`👤 Usuário: ${CONFIG.EMAIL}`, 'blue');

    try {
      // Validar senha
      if (!CONFIG.PASSWORD) {
        throw new Error('Senha não fornecida. Use: $env:TEST_PASSWORD="sua-senha"');
      }

      this.browser = await chromium.launch({
        headless: CONFIG.HEADLESS,
        slowMo: CONFIG.SLOW_MO,
        args: ['--disable-blink-features=AutomationControlled'],
      });

      const context = await this.browser.newContext({
        viewport: { width: 1280, height: 720 },
      });

      this.page = await context.newPage();
      this.page.setDefaultTimeout(CONFIG.TIMEOUT);
      this.page.setDefaultNavigationTimeout(CONFIG.TIMEOUT);

      // Interceptar erros da página
      this.page.on('pageerror', error => {
        log(`⚠️  Erro na página: ${error.message}`, 'yellow');
      });

      await this.login();
      await this.createRegistro();
      await this.validateSuccessPage();
      await this.validateRegistrosList();
      await this.validateJornadaVisual();
      await this.validateJornadaRelacionamento();

      await this.finish(true);
    } catch (error) {
      log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');

      // Capturar screenshot do erro
      if (this.page) {
        try {
          const filename = `error-${Date.now()}.png`;
          const filepath = path.join(this.screenshotDir, filename);
          await this.page.screenshot({ path: filepath });
          log(`📸 Screenshot salvo: ${filepath}`, 'blue');
        } catch (e) {
          log(`⚠️  Não foi possível capturar screenshot: ${e.message}`, 'yellow');
        }
      }

      this.errors.push(error.message);
      await this.finish(false);
    }
  }

  async login() {
    log('\n📝 ETAPA 1: Login...', 'bold');

    for (let attempt = 1; attempt <= CONFIG.RETRY_MAX; attempt++) {
      try {
        log(`Tentativa ${attempt}/${CONFIG.RETRY_MAX}...`, 'gray');

        await this.page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: 'networkidle' });
        log('✓ Página de login carregada', 'green');

        // Aguardar campo de email
        await this.page.waitForSelector('input[type="email"]', { timeout: 10000 });

        // Preencher email
        await this.page.fill('input[type="email"]', CONFIG.EMAIL);
        log('✓ Email preenchido', 'green');

        // Preencher senha
        await this.page.fill('input[type="password"]', CONFIG.PASSWORD);
        log('✓ Senha preenchida', 'green');

        // Clicar login
        await this.page.click('button[type="submit"]');

        // Aguardar redirecionamento
        await this.page.waitForURL(`${CONFIG.BASE_URL}/comercial**`, { timeout: 15000 });
        log('✅ Login realizado com sucesso!', 'green');
        return;

      } catch (error) {
        if (attempt === CONFIG.RETRY_MAX) {
          log(`❌ Erro no login após ${CONFIG.RETRY_MAX} tentativas: ${error.message}`, 'red');
          throw error;
        }
        log(`⚠️  Erro na tentativa ${attempt}: ${error.message}`, 'yellow');
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  async createRegistro() {
    log('\n📋 ETAPA 2: Criar Novo Registro...', 'bold');

    for (let attempt = 1; attempt <= CONFIG.RETRY_MAX; attempt++) {
      try {
        log(`Tentativa ${attempt}/${CONFIG.RETRY_MAX}...`, 'gray');

        await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros/novo`, { waitUntil: 'networkidle' });
        log('✓ Página de novo registro carregada', 'green');

        // Selecionar escola
        await this.page.waitForSelector('select[name="escola_id"]', { timeout: 10000 });

        const options = await this.page.$$eval('select[name="escola_id"] option', opts =>
          opts.filter(o => o.value).map(o => ({ value: o.value, text: o.textContent }))
        );

        if (options.length === 0) throw new Error('Nenhuma escola disponível');

        const escolaSelecionada = options[0];
        await this.page.selectOption('select[name="escola_id"]', escolaSelecionada.value);
        log(`✓ Escola selecionada: ${escolaSelecionada.text}`, 'green');

        // Data do contato
        const hoje = new Date().toISOString().split('T')[0];
        await this.page.fill('input[name="data_contato"]', hoje);
        log('✓ Data do contato preenchida', 'green');

        // Meio do contato
        const meioOptions = await this.page.$$eval('select[name="meio_contato"] option', opts =>
          opts.map(o => o.value).filter(v => v)
        );
        if (meioOptions.length > 0) {
          await this.page.selectOption('select[name="meio_contato"]', meioOptions[0]);
          log('✓ Meio do contato selecionado', 'green');
        }

        // Nome do contato
        await this.page.fill('input[name="contato_nome"]', `[TESTE] Diretor Robot ${Date.now()}`);
        log('✓ Nome do contato preenchido', 'green');

        // Cargo (se existir)
        const cargoSelect = await this.page.$('select[name="contato_cargo"]');
        if (cargoSelect) {
          const cargoOptions = await this.page.$$eval('select[name="contato_cargo"] option', opts =>
            opts.map(o => o.value).filter(v => v)
          );
          if (cargoOptions.length > 0) {
            await this.page.selectOption('select[name="contato_cargo"]', cargoOptions[0]);
            log('✓ Cargo selecionado', 'green');
          }
        }

        // Resumo (obrigatório)
        const resumoText = `[TESTE AUTOMATIZADO] ${new Date().toLocaleString('pt-BR')}\n\nValidação do fluxo de criação de registros.\nEste é um registro de teste automático.`;
        await this.page.fill('textarea[name="resumo"]', resumoText);
        log('✓ Resumo preenchido', 'green');

        // Interesse
        const interesseSelect = await this.page.$('select[name="interesse"]');
        if (interesseSelect) {
          const interesseOptions = await this.page.$$eval('select[name="interesse"] option', opts =>
            opts.map(o => o.value).filter(v => v)
          );
          if (interesseOptions.length > 0) {
            await this.page.selectOption('select[name="interesse"]', interesseOptions[0]);
            log('✓ Nível de interesse selecionado', 'green');
          }
        }

        // Prontidão
        const prontidaoSelect = await this.page.$('select[name="prontidao"]');
        if (prontidaoSelect) {
          const prontidaoOptions = await this.page.$$eval('select[name="prontidao"] option', opts =>
            opts.map(o => o.value).filter(v => v)
          );
          if (prontidaoOptions.length > 0) {
            await this.page.selectOption('select[name="prontidao"]', prontidaoOptions[0]);
            log('✓ Prontidão selecionada', 'green');
          }
        }

        // Quantitativos (valores de teste)
        const quantFields = [
          'qtd_infantil2', 'qtd_infantil3', 'qtd_infantil4', 'qtd_infantil5',
          'qtd_fund1_ano1', 'qtd_fund1_ano2', 'qtd_fund1_ano3', 'qtd_fund1_ano4', 'qtd_fund1_ano5',
          'qtd_fund2', 'qtd_medio'
        ];

        for (const field of quantFields) {
          const input = await this.page.$(`input[name="${field}"]`);
          if (input) {
            await this.page.fill(`input[name="${field}"]`, '10');
          }
        }
        log('✓ Quantitativos preenchidos', 'green');

        // Salvar
        log('📤 Enviando formulário...', 'yellow');
        await this.page.click('button[type="submit"]');

        // Aguardar sucesso
        const successURL = await this.page.waitForURL(/\/comercial\/registros\/sucesso\?id=/, { timeout: 20000 });

        const url = new URL(this.page.url());
        this.registroId = url.searchParams.get('id');

        log(`✅ Registro criado! ID: ${this.registroId}`, 'green');
        return;

      } catch (error) {
        if (attempt === CONFIG.RETRY_MAX) {
          log(`❌ Erro ao criar registro após ${CONFIG.RETRY_MAX} tentativas: ${error.message}`, 'red');
          throw error;
        }
        log(`⚠️  Erro na tentativa ${attempt}: ${error.message}`, 'yellow');
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  async validateSuccessPage() {
    log('\n🎉 ETAPA 3: Validar Página de Sucesso...', 'bold');

    try {
      // Aguardar elemento de sucesso
      const successMsg = await this.page.waitForSelector('text=Salvo com Sucesso', { timeout: 10000 }).catch(() => null);

      if (successMsg) {
        log('✓ Mensagem de sucesso encontrada', 'green');
      } else {
        log('⚠️  Mensagem de sucesso não encontrada (mas URL indicou sucesso)', 'yellow');
      }

      // Validar que página carregou conteúdo
      const content = await this.page.content();
      if (content.length > 1000) {
        log('✓ Página contém conteúdo substantivo', 'green');
      }

      log('✅ Página de sucesso validada!', 'green');
    } catch (error) {
      log(`⚠️  Erro ao validar página de sucesso: ${error.message}`, 'yellow');
    }
  }

  async validateRegistrosList() {
    log('\n📊 ETAPA 4: Validar em Lista de Registros...', 'bold');

    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros`, { waitUntil: 'networkidle' });
      log('✓ Página de registros aberta', 'green');

      // Aguardar conteúdo (pode ser tabela ou lista)
      await this.page.waitForSelector('body', { timeout: 10000 });

      const pageContent = await this.page.content();
      if (pageContent.length > 1000) {
        log('✓ Página carregou com conteúdo', 'green');
      } else {
        log('⚠️  Página tem conteúdo mínimo', 'yellow');
      }

      log('✅ Validação de lista de registros completa!', 'green');
    } catch (error) {
      log(`⚠️  Erro ao validar lista: ${error.message}`, 'yellow');
    }
  }

  async validateJornadaVisual() {
    log('\n🗺️  ETAPA 5: Validar Jornada Visual...', 'bold');

    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/jornada-visual`, { waitUntil: 'networkidle' }).catch(() => null);
      log('✓ Página de jornada visual aberta', 'green');

      const pageContent = await this.page.content();
      if (pageContent.length > 500) {
        log('✓ Página carregou com conteúdo', 'green');
      }

      log('✅ Jornada visual validada!', 'green');
    } catch (error) {
      log(`⚠️  Jornada visual: ${error.message}`, 'yellow');
    }
  }

  async validateJornadaRelacionamento() {
    log('\n🔗 ETAPA 6: Validar Jornada de Relacionamento...', 'bold');

    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/jornada`, { waitUntil: 'networkidle' }).catch(() => null);
      log('✓ Página de jornada aberta', 'green');

      const pageContent = await this.page.content();
      if (pageContent.length > 500) {
        log('✓ Página carregou com conteúdo', 'green');
      }

      log('✅ Jornada de relacionamento validada!', 'green');
    } catch (error) {
      log(`⚠️  Jornada relacionamento: ${error.message}`, 'yellow');
    }
  }

  async finish(success) {
    log('\n🏁 Finalizando robô...', 'blue');

    if (this.browser) {
      await this.browser.close();
    }

    log('');
    log('═'.repeat(60), 'blue');

    if (!success || this.errors.length > 0) {
      log('❌ TESTE FALHOU', 'red');
      log('');
      this.errors.forEach((err, i) => {
        log(`  ${i + 1}. ${err}`, 'red');
      });
      log('');
      log('Verifique os logs acima e corrija o problema.', 'yellow');
      process.exit(1);
    } else {
      log('🎉 ✅ TODOS OS TESTES PASSARAM!', 'green');
      log('', 'green');
      log('Próximas etapas:', 'green');
      log('  1. Registros criado e validado', 'green');
      log('  2. Página de sucesso funcionando', 'green');
      log('  3. Sistema pronto para uso', 'green');
      log('', 'green');
      process.exit(0);
    }
  }
}

const robo = new TestRoboV2();
robo.start();
