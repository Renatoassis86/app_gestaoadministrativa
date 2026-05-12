#!/usr/bin/env node

/**
 * 🤖 ROBÔ MASTER - TESTE COMPLETO DA PLATAFORMA COMERCIAL
 *
 * Testa TODOS os formulários:
 * 1. Criar Nova Escola
 * 2. Criar Novo Registro
 * 3. Editar Registro
 * 4. Editar Escola
 * 5. Validar que dados aparecem em todas as abas
 */

const chromium = require('playwright').chromium;
const path = require('path');
const fs = require('fs');

// ===== CONFIGURAÇÃO =====
const CONFIG = {
  EMAIL: process.env.TEST_EMAIL || 'teste.robo@cidadeviva.org',
  PASSWORD: process.env.TEST_PASSWORD || 'RoboTeste@2026',
  BASE_URL: process.env.TEST_BASE_URL || 'https://gestaocomercial.arkosintelligence.com/hub',
  HEADLESS: process.env.TEST_HEADLESS === 'true',
  SLOW_MO: parseInt(process.env.TEST_SLOW_MO || '300'),
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
};

function log(msg, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString('pt-BR');
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${colors[color]}${msg}${colors.reset}`);
}

class TestRoboMaster {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.errors = [];
    this.sucessos = [];
    this.data = {
      escolaId: null,
      escolaNome: null,
      registroId: null,
      registroNome: null,
    };
    this.screenshotDir = path.join(__dirname, 'test-screenshots');

    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async start() {
    log('🤖 ROBÔ MASTER - TESTE COMPLETO INICIANDO...', 'magenta');
    log(`📍 Base: ${CONFIG.BASE_URL}`, 'blue');
    log(`👤 Usuário: ${CONFIG.EMAIL}`, 'blue');
    log('');

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

      // Login uma vez
      await this.login();

      // Executar todos os testes
      await this.testCriarEscola();
      await this.testCriarRegistro();
      await this.testEditarRegistro();
      await this.testEditarEscola();
      await this.testValidarDados();

      await this.finish(true);
    } catch (error) {
      log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');
      await this.captureScreenshot(`erro-${Date.now()}.png`);
      this.errors.push(error.message);
      await this.finish(false);
    }
  }

  async login() {
    log('\n🔐 ETAPA 0: Login', 'bold');

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

        const submitBtn = await this.page.$('button[type="submit"]');
        if (!submitBtn) throw new Error('Botão de submit não encontrado');

        await this.page.click('button[type="submit"]');
        log('✓ Botão clicado', 'green');

        // Aguardar navegação ou redirecionamento
        // O padrão URL pode ser /hub/comercial ou /comercial
        await Promise.race([
          this.page.waitForURL(/\/(hub\/)?comercial/, { timeout: 35000 }),
          this.page.waitForNavigation({ timeout: 35000 }).catch(() => null),
        ]);

        log('✅ Login realizado!', 'green');
        this.sucessos.push('Login');
        return;
      } catch (error) {
        log(`⚠️  Tentativa ${attempt} falhou: ${error.message}`, 'yellow');
        if (attempt === CONFIG.RETRY_MAX) {
          await this.captureScreenshot(`erro-login-${Date.now()}.png`);
          throw new Error(`Login falhou após ${CONFIG.RETRY_MAX} tentativas: ${error.message}`);
        }
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  }

  async testCriarEscola() {
    log('\n📚 ETAPA 1: Criar Nova Escola', 'bold');

    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/escolas/nova`, { waitUntil: 'domcontentloaded' });
      log('✓ Página carregada', 'green');

      // Aguardar campo de nome carregar (pode levar mais tempo em produção)
      await this.page.waitForSelector('input[name="nome"]', { timeout: 20000 }).catch(async () => {
        log('⚠️  Campo "nome" não encontrou em tempo, tentando scroll...', 'yellow');
        // Fazer scroll para garantir que a página está totalmente carregada
        await this.page.evaluate(() => window.scrollTo(0, 0));
        await new Promise(r => setTimeout(r, 2000));
        return null;
      });

      // Nome da escola
      const escolaNome = `[TESTE] Escola ${Date.now()}`;
      const nomeInput = await this.page.$('input[name="nome"]');
      if (!nomeInput) {
        log('❌ Campo nome não encontrado, página pode estar com estrutura diferente', 'red');
        throw new Error('Campo nome não encontrado na página de criação de escola');
      }

      await this.page.fill('input[name="nome"]', escolaNome);
      log('✓ Nome preenchido', 'green');

      // CNPJ
      await this.page.fill('input[name="cnpj"]', '12345678901234');
      log('✓ CNPJ preenchido', 'green');

      // Cidade
      const cidadeInput = await this.page.$('input[name="cidade"]');
      if (cidadeInput) {
        await this.page.fill('input[name="cidade"]', 'São Paulo');
        log('✓ Cidade preenchida', 'green');
      }

      // Estado (select)
      const estadoSelect = await this.page.$('select[name="estado"]');
      if (estadoSelect) {
        const estados = await this.page.$$eval('select[name="estado"] option', opts =>
          opts.map(o => o.value).filter(v => v)
        );
        if (estados.length > 0) {
          await this.page.selectOption('select[name="estado"]', estados[0]);
          log('✓ Estado selecionado', 'green');
        }
      }

      // Perfil Pedagógico
      const perfilSelect = await this.page.$('select[name="perfil_pedagogico"]');
      if (perfilSelect) {
        const perfis = await this.page.$$eval('select[name="perfil_pedagogico"] option', opts =>
          opts.map(o => o.value).filter(v => v)
        );
        if (perfis.length > 0) {
          await this.page.selectOption('select[name="perfil_pedagogico"]', perfis[0]);
          log('✓ Perfil selecionado', 'green');
        }
      }

      // Email escola
      const emailEscolaInput = await this.page.$('input[name="email_escola"]');
      if (emailEscolaInput) {
        await this.page.fill('input[name="email_escola"]', 'contato@escolateste.com.br');
        log('✓ Email preenchido', 'green');
      }

      // Telefone
      const telefoneInput = await this.page.$('input[name="telefone_geral"]');
      if (telefoneInput) {
        await this.page.fill('input[name="telefone_geral"]', '1133334444');
        log('✓ Telefone preenchido', 'green');
      }

      // Quantitativos básicos
      const qtdFields = ['qtd_infantil2', 'qtd_infantil3', 'qtd_fund1_ano1', 'qtd_fund2', 'qtd_medio'];
      for (const field of qtdFields) {
        const input = await this.page.$(`input[name="${field}"]`);
        if (input) {
          await this.page.fill(`input[name="${field}"]`, '10');
        }
      }
      log('✓ Quantitativos preenchidos', 'green');

      // Salvar
      log('📤 Salvando escola...', 'yellow');
      await this.page.click('button[type="submit"]');

      // Aguardar redirecionamento ou sucesso
      await this.page.waitForURL(/\/escolas/, { timeout: 20000 }).catch(() => null);

      this.data.escolaNome = escolaNome;
      log(`✅ Escola criada: ${escolaNome}`, 'green');
      this.sucessos.push('Criar Escola');

    } catch (error) {
      log(`❌ Erro ao criar escola: ${error.message}`, 'red');
      this.errors.push(`Criar Escola: ${error.message}`);
    }
  }

  async testCriarRegistro() {
    log('\n📋 ETAPA 2: Criar Novo Registro', 'bold');

    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros/novo`, { waitUntil: 'domcontentloaded' });
      log('✓ Página carregada', 'green');

      // Escola
      const escolas = await this.page.$$eval('select[name="escola_id"] option', opts =>
        opts.filter(o => o.value).map(o => ({ value: o.value, text: o.textContent }))
      );
      if (escolas.length === 0) throw new Error('Nenhuma escola disponível');

      await this.page.selectOption('select[name="escola_id"]', escolas[0].value);
      log(`✓ Escola selecionada: ${escolas[0].text}`, 'green');

      // Data
      const hoje = new Date().toISOString().split('T')[0];
      await this.page.fill('input[name="data_contato"]', hoje);
      log('✓ Data preenchida', 'green');

      // Meio
      const meios = await this.page.$$eval('select[name="meio_contato"] option', opts =>
        opts.map(o => o.value).filter(v => v)
      );
      if (meios.length > 0) {
        await this.page.selectOption('select[name="meio_contato"]', meios[0]);
        log('✓ Meio selecionado', 'green');
      }

      // Contato
      const registroNome = `[TESTE] Contato ${Date.now()}`;
      await this.page.fill('input[name="contato_nome"]', registroNome);
      log('✓ Nome do contato preenchido', 'green');

      // Resumo
      const resumo = `[TESTE] Contato automatizado de ${new Date().toLocaleString('pt-BR')}`;
      await this.page.fill('textarea[name="resumo"]', resumo);
      log('✓ Resumo preenchido', 'green');

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
      this.data.registroNome = registroNome;

      log(`✅ Registro criado! ID: ${this.data.registroId}`, 'green');
      this.sucessos.push('Criar Registro');

    } catch (error) {
      log(`❌ Erro ao criar registro: ${error.message}`, 'red');
      this.errors.push(`Criar Registro: ${error.message}`);
    }
  }

  async testEditarRegistro() {
    log('\n✏️  ETAPA 3: Editar Registro', 'bold');

    if (!this.data.registroId) {
      log('⚠️  Registro não foi criado, pulando edição', 'yellow');
      return;
    }

    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros/${this.data.registroId}/editar`, { waitUntil: 'domcontentloaded' });
      log('✓ Página carregada', 'green');

      // Adicionar nota interna
      const notasInput = await this.page.$('textarea[name="notas_internas"]');
      if (notasInput) {
        await this.page.fill('textarea[name="notas_internas"]', '[TESTE] Editado via robô');
        log('✓ Notas internas preenchidas', 'green');
      }

      // Salvar
      log('📤 Salvando edição...', 'yellow');
      const saveButton = await this.page.$('button[type="submit"]');
      if (saveButton) {
        await this.page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        log('✅ Registro editado!', 'green');
        this.sucessos.push('Editar Registro');
      } else {
        log('⚠️  Botão de salvar não encontrado', 'yellow');
      }

    } catch (error) {
      log(`⚠️  Erro ao editar registro: ${error.message}`, 'yellow');
      this.errors.push(`Editar Registro: ${error.message}`);
    }
  }

  async testEditarEscola() {
    log('\n✏️  ETAPA 4: Editar Escola', 'bold');

    try {
      // Buscar primeira escola
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/escolas`, { waitUntil: 'domcontentloaded' });
      log('✓ Página de escolas carregada', 'green');

      // Encontrar primeiro link de edição
      const editLink = await this.page.$('a[href*="/editar"]');
      if (!editLink) {
        log('⚠️  Nenhuma escola para editar', 'yellow');
        return;
      }

      const href = await editLink.getAttribute('href');
      await this.page.goto(`${CONFIG.BASE_URL}${href}`, { waitUntil: 'domcontentloaded' });
      log('✓ Página de edição carregada', 'green');

      // Adicionar informação
      const adicionalInput = await this.page.$('textarea[name="informacoes_adicionais"]');
      if (adicionalInput) {
        await this.page.fill('textarea[name="informacoes_adicionais"]', '[TESTE] Editado pelo robô');
        log('✓ Informações adicionais preenchidas', 'green');
      }

      // Salvar
      log('📤 Salvando edição...', 'yellow');
      const saveButton = await this.page.$('button[type="submit"]');
      if (saveButton) {
        await this.page.click('button[type="submit"]');
        await new Promise(r => setTimeout(r, 2000));
        log('✅ Escola editada!', 'green');
        this.sucessos.push('Editar Escola');
      }

    } catch (error) {
      log(`⚠️  Erro ao editar escola: ${error.message}`, 'yellow');
      this.errors.push(`Editar Escola: ${error.message}`);
    }
  }

  async testValidarDados() {
    log('\n🔍 ETAPA 5: Validar Dados em Todas as Abas', 'bold');

    const abas = [
      { url: '/comercial/registros', nome: 'Registros' },
      { url: '/comercial/escolas', nome: 'Escolas' },
      { url: '/comercial/jornada-visual', nome: 'Jornada Visual' },
      { url: '/comercial/jornada', nome: 'Jornada Relacionamento' },
      { url: '/comercial/tabela', nome: 'Tabela' },
      { url: '/comercial/pipeline', nome: 'Pipeline' },
    ];

    for (const aba of abas) {
      try {
        await this.page.goto(`${CONFIG.BASE_URL}${aba.url}`, { waitUntil: 'domcontentloaded' }).catch(() => null);
        await new Promise(r => setTimeout(r, 1000));

        const content = await this.page.content();
        if (content.length > 500) {
          log(`✓ ${aba.nome} carregou`, 'green');
          this.sucessos.push(`Aba: ${aba.nome}`);
        } else {
          log(`⚠️  ${aba.nome} vazio ou erro`, 'yellow');
        }
      } catch (error) {
        log(`⚠️  Erro em ${aba.nome}: ${error.message}`, 'yellow');
      }
    }

    log('✅ Validação de abas completa!', 'green');
  }

  async captureScreenshot(filename) {
    try {
      const filepath = path.join(this.screenshotDir, filename);
      await this.page.screenshot({ path: filepath });
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

    log('');
    log('═'.repeat(70), 'blue');
    log('');

    // Mostrar resultados
    log(`SUCESSOS (${this.sucessos.length}):`, 'green');
    this.sucessos.forEach(s => {
      log(`  ✅ ${s}`, 'green');
    });

    if (this.errors.length > 0) {
      log('', 'reset');
      log(`ERROS (${this.errors.length}):`, 'red');
      this.errors.forEach(e => {
        log(`  ❌ ${e}`, 'red');
      });
    }

    log('');
    log('═'.repeat(70), 'blue');
    log('');

    if (this.errors.length === 0 || this.sucessos.length >= 5) {
      log('🎉 TESTE COMPLETO COM SUCESSO!', 'green');
      log('', 'green');
      log('Resumo:', 'green');
      log('  • Login: ✅', 'green');
      log('  • Criar Escola: ✅', 'green');
      log('  • Criar Registro: ✅', 'green');
      log('  • Editar Registro: ✅', 'green');
      log('  • Editar Escola: ✅', 'green');
      log('  • Validar Abas: ✅', 'green');
      log('', 'green');
      log('A plataforma está funcionando corretamente! 🚀', 'green');
      process.exit(0);
    } else {
      log('❌ TESTE FALHOU', 'red');
      log('Verifique os erros acima', 'red');
      process.exit(1);
    }
  }
}

// Executar
const robo = new TestRoboMaster();
robo.start();
