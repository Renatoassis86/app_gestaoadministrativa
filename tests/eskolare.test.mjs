// Rodar: npm run test:eskolare   (Node 22.18+/24 executa TypeScript direto)
import test from 'node:test'
import assert from 'node:assert/strict'
import { validarCnpj, validarCpf, validarValor, formatarWhatsapp, mascararCpf } from '../src/lib/eskolare-validacao.ts'
import { gerarToken, gerarPin, hashPin, verificarPin, tokenPlausivel, hashSessao, novaSessao } from '../src/lib/eskolare-seguranca.ts'
import { calcularPreenchimento, totalAlunos, CAMPOS, BLOCOS, MAX_PARTICIPANTES, campoAtivo, campoVisivel, campoPorChave } from '../src/lib/eskolare-campos.ts'

test('CNPJ e CPF: dígito verificador', () => {
  assert.equal(validarCnpj('11.222.333/0001-81'), true)
  assert.equal(validarCnpj('11.222.333/0001-82'), false)
  assert.equal(validarCnpj('00.000.000/0000-00'), false)
  assert.equal(validarCnpj('123'), false)
  assert.equal(validarCpf('529.982.247-25'), true)
  assert.equal(validarCpf('529.982.247-26'), false)
  assert.equal(validarCpf('111.111.111-11'), false)
})

test('validações de formato', () => {
  assert.equal(validarValor('email', 'a@b.com.br').valor, 'a@b.com.br')
  assert.ok(validarValor('email', 'sem-arroba').erro)
  assert.equal(validarValor('whatsapp', '83999990000').valor, '(83) 99999-0000')
  assert.ok(validarValor('whatsapp', '123').erro)
  assert.equal(validarValor('cep', '58000000').valor, '58000-000')
  assert.ok(validarValor('cep', '5800').erro)
  assert.equal(validarValor('inteiro', '012').valor, '12')
  assert.ok(validarValor('inteiro', '-1').erro)
  assert.ok(validarValor('inteiro', '1,5').erro)
  assert.equal(validarValor('dinheiro', '1.450,5').valor, '1450.50')
  assert.ok(validarValor('dinheiro', 'abc').erro)
  assert.equal(formatarWhatsapp('8399999'), '(83) 9999-9')
  assert.equal(mascararCpf('529.982.247-25'), '***.***.***-25')
})

test('PIN: correto, errado e formato', () => {
  const pin = gerarPin()
  assert.match(pin, /^\d{6}$/)
  const h = hashPin(pin)
  assert.ok(!h.includes(pin))
  assert.equal(verificarPin(pin, h), true)
  assert.equal(verificarPin(pin === '000000' ? '111111' : '000000', h), false)
  assert.equal(verificarPin('12345', h), false)
  assert.equal(verificarPin('abcdef', h), false)
  assert.equal(verificarPin(pin, null), false)
  assert.notEqual(hashPin(pin), hashPin(pin)) // salt diferente
})

test('token: 256 bits, único, não sequencial', () => {
  const a = gerarToken(), b = gerarToken()
  assert.notEqual(a, b)
  assert.equal(tokenPlausivel(a), true)
  assert.equal(tokenPlausivel('abc'), false)
  assert.equal(tokenPlausivel('../../etc/passwd'), false)
  assert.equal(hashSessao(novaSessao()).length, 64)
})

const PUBLICOS = CAMPOS.filter(c => !c.interno && c.tipo !== 'calculado')
const BASE = PUBLICOS.filter(c => !c.participante || c.participante === 1)      // sem os participantes extras

test('nada é obrigatório para a escola', () => {
  assert.ok(CAMPOS.every(c => c.obrigatorio === undefined && c.obrigatorioQuando === undefined && c.obrigatorioSe === undefined))
  assert.equal(calcularPreenchimento({}).pct, 0)
  assert.equal(calcularPreenchimento({}).total, BASE.length)
})

test('dados que cabem ao Education ou que não existem não são perguntados à escola', () => {
  assert.equal(campoPorChave('venda_2sem').interno, true)       // padrão Sim para todas as escolas
  assert.equal(campoPorChave('inf_com_ingles'), undefined)       // só Lamad e Luz têm kit sem Inglês e nenhuma é Eskolare
  assert.equal(campoPorChave('venda_avulso'), undefined)         // a Cidade Viva não vende livro avulso
  assert.equal(campoPorChave('ctr_valor'), undefined)
  assert.ok(!campoPorChave('preco_infantil').interno && !campoPorChave('preco_fundamental').interno)   // o valor negociado fica, com explicação
  assert.ok(PUBLICOS.some(c => c.bloco === 8))
})

test('termômetro: respondidas ÷ perguntas que a escola vê', () => {
  const d = {}
  for (const c of PUBLICOS) d[c.chave] = 'x'
  assert.equal(calcularPreenchimento(d).pct, 100)
  assert.equal(calcularPreenchimento(d).faltando.length, 0)
  const m = { cnpj: '11.222.333/0001-81', razao_social: 'Escola Teste' }
  const r = calcularPreenchimento(m)
  assert.equal(r.preenchidos, 2)
  assert.equal(r.pct, Math.round((2 / BASE.length) * 100))
})

test('pré-preenchido não confirmado não conta como resposta da escola (mas não trava nada)', () => {
  const d = { parc_nome: 'Maria', parc_cargo: 'Diretora' }
  const sem = calcularPreenchimento(d, { parc_nome: 'pre', parc_cargo: 'pre' })
  assert.equal(sem.preenchidos, 0)
  assert.ok(sem.faltando.some(x => x.includes('confirmar')))
  const com = calcularPreenchimento(d, { parc_nome: 'confirmado', parc_cargo: 'corrigido' })
  assert.equal(com.preenchidos, 2)
})

test('explicação objetiva em cada pergunta que precisa e em cada etapa', () => {
  for (const k of ['cnpj', 'razao_social', 'nome_loja', 'logo', 'adm_ja_usa', 'adm_email', 'adm_cpf', 'fin_banco', 'preco_infantil', 'preco_fundamental', 'ent_endereco'])
    assert.ok(campoPorChave(k).ajuda && campoPorChave(k).ajuda.length > 10, k)
  for (const id of [1, 2, 3, 4, 5, 7, 8, 9]) assert.ok(BLOCOS.find(b => b.id === id).descricao, `bloco ${id}`)
  // objetivo: nenhuma explicação passa de 120 caracteres e a etapa 8 não repete que os kits têm valores diferentes
  for (const c of CAMPOS) assert.ok((c.ajuda ?? '').length <= 120, c.chave)
  for (const b of BLOCOS) assert.ok((b.descricao ?? '').length <= 130, `bloco ${b.id}`)
  assert.ok(!/diferentes/.test(BLOCOS.find(b => b.id === 8).descricao))
})

test('coordenação pedagógica não é perguntada à escola', () => {
  assert.ok(CAMPOS.filter(c => c.bloco === 6).every(c => c.interno))
})

test('conta para receber a comissão é perguntada à escola (não "tem conta na Eskolare")', () => {
  assert.equal(campoPorChave('fin_conta_resgate'), undefined)
  for (const k of ['fin_banco', 'fin_agencia', 'fin_conta', 'fin_tipo_conta', 'fin_titular', 'fin_titular_doc', 'fin_pix']) assert.ok(campoPorChave(k) && !campoPorChave(k).interno, k)
})

test('participantes do treinamento: até 6, os extras só contam quando têm dado', () => {
  assert.equal(MAX_PARTICIPANTES, 6)
  for (let n = 1; n <= 6; n++) assert.equal(CAMPOS.filter(c => c.participante === n).length, 4)
  assert.equal(campoPorChave('trein_participantes'), undefined)
  const extra = campoPorChave('trein2_nome')
  assert.equal(campoAtivo(extra, {}), false)
  assert.equal(campoAtivo(extra, { trein2_email: 'a@b.com' }), true)
  assert.equal(campoAtivo(campoPorChave('trein_nome'), {}), true)
  const d = { trein2_nome: 'Ana', trein2_email: 'ana@escola.com' }
  assert.equal(calcularPreenchimento(d).total, BASE.length + 4)        // o participante 2 entra no termômetro
  assert.equal(calcularPreenchimento(d).preenchidos, 2)
})

test('total de alunos é a soma das 9 séries', () => {
  assert.equal(totalAlunos({ al_inf2: '20', al_inf3: '22', al_inf4: '25', al_ano1: '3' }), 70)
  assert.equal(totalAlunos({}), 0)
})

test('dinheiro: aceita formato BR e decimal já normalizado sem multiplicar por 100/1000', () => {
  const v = (x) => validarValor('dinheiro', x).valor
  assert.equal(v('1.450,50'), '1450.50')
  assert.equal(v('1450,5'), '1450.50')
  assert.equal(v('1150.00'), '1150.00')   // valor que o próprio sistema grava e relê
  assert.equal(v('12345.67'), '12345.67')
  assert.equal(v('1150.5'), '1150.50')
  assert.equal(v('1.450'), '1450.00')     // milhar BR
  assert.equal(v('R$ 2.000,00'), '2000.00')
  assert.equal(v(v('1.450,50')), '1450.50') // idempotente
  assert.ok(validarValor('dinheiro', 'abc').erro)
})

test('regras de negócio: valor do kit e limites', () => {
  assert.equal(validarValor('dinheiro', '1.150,00', undefined, 'preco_infantil').valor, '1150.00')
  assert.equal(validarValor('dinheiro', '1450', undefined, 'preco_fundamental').valor, '1450.00')
  assert.equal(validarValor('dinheiro', '0', undefined, 'preco_infantil').valor, '0.00')   // escola sem Infantil
  assert.ok(validarValor('dinheiro', '145', undefined, 'preco_fundamental').erro)           // provável erro de digitação
  assert.ok(validarValor('dinheiro', '99999', undefined, 'preco_infantil').erro)
  assert.ok(validarValor('inteiro', '99999', undefined, 'al_inf2').erro)
  assert.equal(validarValor('inteiro', '0', undefined, 'al_ano3').valor, '0')
})

test('bloco do contrato é interno: a escola não responde', () => {
  assert.ok(CAMPOS.filter(c => c.bloco === 10).every(c => c.interno))
})
