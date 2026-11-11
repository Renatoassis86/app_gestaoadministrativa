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

const OBRIG = CAMPOS.filter(c => c.obrigatorio)
const completo = () => {
  const d = {}
  for (const c of OBRIG) d[c.chave] = 'x'
  return d
}

test('% preenchido: 20 obrigatórios + preço = 21 (igual à planilha)', () => {
  assert.equal(OBRIG.length, 20)
  assert.equal(calcularPreenchimento({}).total, 21)
  assert.equal(calcularPreenchimento({}).pct, 0)
  const d = completo()
  assert.equal(calcularPreenchimento(d).preenchidos, 20)
  assert.equal(calcularPreenchimento(d).pct, 95)       // falta só o preço
  assert.deepEqual(calcularPreenchimento(d).faltando, ['Preço final ou comissão (bloco 8)'])
})

test('bloco de preço: preço final OU comissão completa o bloco (conta 1)', () => {
  assert.equal(calcularPreenchimento({ ...completo(), preco_infantil: '1150.00' }).pct, 100)
  assert.equal(calcularPreenchimento({ ...completo(), preco_fundamental: '1450.00' }).pct, 100)
  assert.equal(calcularPreenchimento({ ...completo(), comissao_kit: '200.00' }).pct, 100)
  // os três preenchidos continuam contando só 1
  const tres = { ...completo(), preco_infantil: '1', preco_fundamental: '1', comissao_kit: '1' }
  assert.equal(calcularPreenchimento(tres).preenchidos, 21)
  assert.equal(calcularPreenchimento({ ...completo(), comissao_kit: '0.00' }).pct, 95)
})

test('bloco de preço mostra só os campos da opção escolhida', () => {
  const inf = campoPorChave('preco_infantil'), com = campoPorChave('comissao_kit')
  assert.equal(campoVisivel(inf, { preco_modo: 'Preço final às famílias' }), true)
  assert.equal(campoVisivel(com, { preco_modo: 'Preço final às famílias' }), false)
  assert.equal(campoVisivel(com, { preco_modo: 'Comissão desejada' }), true)
  assert.equal(campoVisivel(inf, {}), false)
})

test('total de alunos é a soma das 9 séries', () => {
  assert.equal(totalAlunos({ al_inf2: '20', al_inf3: '22', al_inf4: '25', al_ano1: '3' }), 70)
  assert.equal(totalAlunos({}), 0)
})
