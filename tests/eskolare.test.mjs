// Rodar: npm run test:eskolare   (Node 22.18+/24 executa TypeScript direto)
import test from 'node:test'
import assert from 'node:assert/strict'
import { validarCnpj, validarCpf, validarValor, formatarWhatsapp, mascararCpf } from '../src/lib/eskolare-validacao.ts'
import { gerarToken, gerarPin, hashPin, verificarPin, tokenPlausivel, hashSessao, novaSessao } from '../src/lib/eskolare-seguranca.ts'
import { calcularPreenchimento, totalAlunos, CAMPOS, campoVisivel, campoPorChave } from '../src/lib/eskolare-campos.ts'

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

const OBRIG = CAMPOS.filter(c => c.obrigatorio && !c.interno)
const completo = () => {
  const d = {}
  for (const c of OBRIG) d[c.chave] = 'x'
  return d
}

test('% preenchido: 28 obrigatórios da escola (inclui os dois valores de kit)', () => {
  assert.equal(OBRIG.length, 28)
  assert.equal(calcularPreenchimento({}).total, 28)
  assert.equal(calcularPreenchimento({}).pct, 0)
  assert.equal(calcularPreenchimento(completo()).pct, 100)
  const d = completo(); delete d.preco_fundamental
  assert.equal(calcularPreenchimento(d).pct, 96)
  assert.ok(calcularPreenchimento(d).faltando[0].includes('kit Fundamental'))
})

test('valor negociado: Infantil e Fundamental são campos separados, ambos obrigatórios e sempre visíveis', () => {
  const inf = campoPorChave('preco_infantil'), fun = campoPorChave('preco_fundamental')
  assert.ok(inf.obrigatorio && fun.obrigatorio)
  assert.equal(campoVisivel(inf, {}), true)
  assert.equal(campoVisivel(fun, {}), true)
  assert.equal(campoPorChave('ctr_valor'), undefined)       // valor total do contrato não é perguntado
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

test('pré-preenchido não confirmado não conta como resposta da escola', () => {
  const d = completo(); 
  assert.equal(calcularPreenchimento(d).pct, 100)
  const sit = { parc_nome: 'pre', parc_cargo: 'pre' }
  d.parc_cargo = 'Diretor'
  const c = calcularPreenchimento(d, sit)
  assert.ok(c.pct < 100)
  assert.ok(c.faltando.some(x => x.includes('confirme ou corrija')))
  assert.equal(calcularPreenchimento(d, { parc_nome: 'confirmado', parc_cargo: 'corrigido' }).pct, 100)
})

test('bloco do contrato é interno: a escola não responde', () => {
  assert.ok(CAMPOS.filter(c => c.bloco === 10).every(c => c.interno))
})
