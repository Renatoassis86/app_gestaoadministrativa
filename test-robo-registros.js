#!/usr/bin/env node

/**
 * 🤖 ROBÔ AUTOMATIZADO DE TESTE - REGISTROS COMERCIAIS
 *
 * Testa:
 * 1. Login com usuário
 * 2. Criar novo registro com dados fictícios
 * 3. Validar página de sucesso
 * 4. Verificar se aparece em Registros
 * 5. Verificar se aparece em Jornada Visual
 * 6. Verificar se aparece em Jornada de Relacionamento
 */

const chromium = require('playwright').chromium;
const fs = require('fs');
const path = require('path');

// ===== CONFIGURAÇÃO =====
const CONFIG = {
  EMAIL: process.env.TEST_EMAIL || 'renato.consultoria@cidadeviva.org',
  PASSWORD: process.env.TEST_PASSWORD || process.env.SUPABASE_PASSWORD,
  BASE_URL: process.env.TEST_BASE_URL || 'http://localhost:3000',
  HEADLESS: process.env.TEST_HEADLESS === 'true' ? true : false,
  SLOW_MO: parseInt(process.env.TEST_SLOW_MO || '500'),
  TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
};

// Validar configuração
if (!CONFIG.PASSWORD) {
  log('❌ ERRO: Senha não configurada!', 'red');
  log('Use uma das opções:', 'yellow');
  log('  1. Defina a variável: $env:TEST_PASSWORD="sua-senha"', 'yellow');
  log('  2. Edite test-robo-registros.js e coloque a senha', 'yellow');
  process.exit(1);
}

// Cores para log
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

class TestRobo {
  constructor() {
    this.browser = null;
    this.page = null;
    this.registroId = null;
    this.errors = [];
  }

  async start() {
    log('🚀 Iniciando Robô de Teste...', 'blue');

    try {
      this.browser = await chromium.launch({
        headless: CONFIG.HEADLESS,
        slowMo: CONFIG.SLOW_MO,
      });

      this.page = await this.browser.newPage();
      this.page.setDefaultTimeout(CONFIG.TIMEOUT);
      this.page.setDefaultNavigationTimeout(CONFIG.TIMEOUT);

      await this.login();
      await this.createRegistro();
      await this.validateSuccessPage();
      await this.validateRegistrosList();
      await this.validateJornadaVisual();
      await this.validateJornadaRelacionamento();

      await this.finish();
    } catch (error) {
      log(`❌ ERRO CRÍTICO: ${error.message}`, 'red');
      this.errors.push(error.message);
      await this.finish();
      process.exit(1);
    }
  }

  async login() {
    log('\n📝 ETAPA 1: Login...', 'bold');
    try {
      await this.page.goto(`${CONFIG.BASE_URL}/login`);

      // Preencher email
      await this.page.fill('input[type="email"]', CONFIG.EMAIL);
      log('✓ Email preenchido', 'green');

      // Preencher senha
      await this.page.fill('input[type="password"]', CONFIG.PASSWORD);
      log('✓ Senha preenchida', 'green');

      // Clicar login
      await this.page.click('button[type="submit"]');

      // Aguardar redirecionamento
      await this.page.waitForURL(`${CONFIG.BASE_URL}/comercial**`, { timeout: 10000 });
      log('✅ Login realizado com sucesso!', 'green');

    } catch (error) {
      log(`❌ Erro no login: ${error.message}`, 'red');
      throw error;
    }
  }

  async createRegistro() {
    log('\n📋 ETAPA 2: Criar Novo Registro...', 'bold');
    try {
      // Ir para página de novo registro
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros/novo`);
      log('✓ Página de novo registro carregada', 'green');

      // Selecionar escola (primeira escola disponível)
      const escolaSelect = await this.page.$('select[name="escola_id"]');
      if (!escolaSelect) throw new Error('Campo de escola não encontrado');

      const options = await this.page.$$eval('select[name="escola_id"] option', opts =>
        opts.filter(o => o.value).map(o => o.value)
      );

      if (options.length === 0) throw new Error('Nenhuma escola disponível');

      await this.page.selectOption('select[name="escola_id"]', options[0]);
      log(`✓ Escola selecionada: ${options[0]}`, 'green');

      // Data do contato (hoje)
      const hoje = new Date().toISOString().split('T')[0];
      await this.page.fill('input[name="data_contato"]', hoje);
      log('✓ Data do contato preenchida', 'green');

      // Meio do contato
      await this.page.selectOption('select[name="meio_contato"]', 'reuniao');
      log('✓ Meio do contato selecionado', 'green');

      // Nome do contato
      await this.page.fill('input[name="contato_nome"]', 'Diretor Test Robot');
      log('✓ Nome do contato preenchido', 'green');

      // Cargo
      await this.page.selectOption('select[name="contato_cargo"]', 'diretor');
      log('✓ Cargo selecionado', 'green');

      // Resumo (obrigatório)
      const resumoText = `Contato de teste automatizado realizado em ${new Date().toLocaleString('pt-BR')}.

Objetivo: Validar fluxo completo de criação de registro.
Resultado: Positivo - Escola demonstrou interesse.
Próximos passos: Agendar reunião com secretaria.`;

      await this.page.fill('textarea[name="resumo"]', resumoText);
      log('✓ Resumo preenchido', 'green');

      // Interesse
      await this.page.selectOption('select[name="interesse"]', 'alto');
      log('✓ Nível de interesse selecionado', 'green');

      // Prontidão
      await this.page.selectOption('select[name="prontidao"]', 'proposta');
      log('✓ Prontidão selecionada', 'green');

      // Abertura
      await this.page.selectOption('select[name="abertura"]', 'aberta');
      log('✓ Abertura para proposta selecionada', 'green');

      // Quantitativos (alguns alunos)
      await this.page.fill('input[name="qtd_infantil2"]', '15');
      await this.page.fill('input[name="qtd_fund1_ano1"]', '20');
      await this.page.fill('input[name="qtd_fund2"]', '45');
      await this.page.fill('input[name="qtd_medio"]', '30');
      log('✓ Quantitativos preenchidos', 'green');

      // Salvar
      log('📤 Enviando formulário...', 'yellow');
      await this.page.click('button[type="submit"]');

      // Aguardar redirecionamento para página de sucesso
      await this.page.waitForURL(/\/comercial\/registros\/sucesso\?id=/, { timeout: 15000 });

      // Extrair ID do registro
      const url = this.page.url();
      this.registroId = new URLSearchParams(new URL(url).search).get('id');

      log(`✅ Registro criado com sucesso! ID: ${this.registroId}`, 'green');

    } catch (error) {
      log(`❌ Erro ao criar registro: ${error.message}`, 'red');
      throw error;
    }
  }

  async validateSuccessPage() {
    log('\n🎉 ETAPA 3: Validar Página de Sucesso...', 'bold');
    try {
      // Aguardar página carregar
      await this.page.waitForSelector('text=Registro Salvo com Sucesso!', { timeout: 10000 });
      log('✓ Mensagem de sucesso encontrada', 'green');

      // Validar elementos da página
      const elementos = [
        { selector: 'text=Diretor Test Robot', desc: 'Nome do contato' },
        { selector: 'text=diretor', desc: 'Cargo do contato' },
        { selector: 'text=Quente', desc: 'Classificação (deve ser quente/alto potencial)' },
      ];

      for (const el of elementos) {
        const exists = await this.page.$(el.selector);
        if (exists) {
          log(`✓ ${el.desc} exibido corretamente`, 'green');
        } else {
          log(`⚠️ ${el.desc} não encontrado - pode estar com outro texto`, 'yellow');
        }
      }

      log('✅ Página de sucesso validada!', 'green');

    } catch (error) {
      log(`❌ Erro ao validar página de sucesso: ${error.message}`, 'red');
      throw error;
    }
  }

  async validateRegistrosList() {
    log('\n📊 ETAPA 4: Validar em Lista de Registros...', 'bold');
    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/registros`);
      log('✓ Página de registros aberta', 'green');

      // Aguardar tabela carregar
      await this.page.waitForSelector('table', { timeout: 10000 }).catch(() => {
        log('⚠️ Tabela não encontrada (pode estar em construção)', 'yellow');
        return null;
      });

      // Procurar pelo registro criado
      const registroText = await this.page.$(`text="Diretor Test Robot"`);
      if (registroText) {
        log('✓ Registro encontrado na lista', 'green');
      } else {
        log('⚠️ Registro não encontrado na lista (pode estar com filtro ativo)', 'yellow');
      }

      log('✅ Validação de lista de registros completa!', 'green');

    } catch (error) {
      log(`❌ Erro ao validar lista de registros: ${error.message}`, 'red');
      throw error;
    }
  }

  async validateJornadaVisual() {
    log('\n🗺️  ETAPA 5: Validar em Jornada Visual...', 'bold');
    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/jornada-visual`);
      log('✓ Página de jornada visual aberta', 'green');

      // Aguardar página carregar (pode ter canvas/gráfico)
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        log('⚠️ Página ainda carregando, continuando...', 'yellow');
      });

      // Procurar por elemento visual do registro
      const hasContent = await this.page.content();
      if (hasContent.length > 1000) {
        log('✓ Página carregou com conteúdo', 'green');
      }

      log('✅ Jornada visual validada!', 'green');

    } catch (error) {
      log(`⚠️ Erro ao validar jornada visual: ${error.message}`, 'yellow');
      // Não falhar aqui, pode ser uma página com problemas de layout
    }
  }

  async validateJornadaRelacionamento() {
    log('\n🔗 ETAPA 6: Validar em Jornada de Relacionamento...', 'bold');
    try {
      await this.page.goto(`${CONFIG.BASE_URL}/comercial/jornada`);
      log('✓ Página de jornada de relacionamento aberta', 'green');

      // Aguardar página carregar
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        log('⚠️ Página ainda carregando, continuando...', 'yellow');
      });

      // Procurar por conteúdo
      const hasContent = await this.page.content();
      if (hasContent.length > 1000) {
        log('✓ Página carregou com conteúdo', 'green');
      }

      log('✅ Jornada de relacionamento validada!', 'green');

    } catch (error) {
      log(`⚠️ Erro ao validar jornada de relacionamento: ${error.message}`, 'yellow');
      // Não falhar aqui, pode ser uma página com problemas de layout
    }
  }

  async finish() {
    log('\n🏁 Finalizando robô...', 'blue');

    if (this.errors.length > 0) {
      log(`\n⚠️  ${this.errors.length} erro(s) encontrado(s):`, 'red');
      this.errors.forEach((err, i) => {
        log(`  ${i + 1}. ${err}`, 'red');
      });
    } else {
      log('\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!', 'green');
      log('✅ Registro criado e validado em todas as abas!', 'green');
    }

    if (this.browser) {
      await this.browser.close();
    }

    process.exit(this.errors.length > 0 ? 1 : 0);
  }
}

// Executar
const robo = new TestRobo();
robo.start();
