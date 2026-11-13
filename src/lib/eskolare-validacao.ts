// Validação e máscaras do Cadastro Eskolare. Sem imports de projeto (testável com `node --test`).

// Preço de tabela por kit (R$): o preço final às famílias não pode ficar abaixo, e a comissão não pode passar dele.
export const PRECO_TABELA = { infantil: 1150, fundamental: 1450 }
const LIMITE_INTEIRO: Record<string, number> = { trein_participantes: 200, ctr_kits: 100000 }
const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const soDigitos = (v: unknown) => String(v ?? '').replace(/\D/g, '')

export function validarCnpj(valor: string): boolean {
  const d = soDigitos(valor)
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false
  const dv = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const soma = base.split('').reduce((a, n, i) => a + Number(n) * pesos[i], 0)
    const r = soma % 11
    return r < 2 ? 0 : 11 - r
  }
  const d1 = dv(d.slice(0, 12))
  const d2 = dv(d.slice(0, 12) + d1)
  return d1 === Number(d[12]) && d2 === Number(d[13])
}

export function validarCpf(valor: string): boolean {
  const d = soDigitos(valor)
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false
  const dv = (base: string) => {
    const soma = base.split('').reduce((a, n, i) => a + Number(n) * (base.length + 1 - i), 0)
    const r = (soma * 10) % 11
    return r === 10 ? 0 : r
  }
  const d1 = dv(d.slice(0, 9))
  const d2 = dv(d.slice(0, 9) + d1)
  return d1 === Number(d[9]) && d2 === Number(d[10])
}

export const validarEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())

export function formatarCnpj(v: string) {
  const d = soDigitos(v).slice(0, 14)
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2')
}
export function formatarCpf(v: string) {
  const d = soDigitos(v).slice(0, 11)
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2')
}
export const formatarCep = (v: string) => soDigitos(v).slice(0, 8).replace(/^(\d{5})(\d)/, '$1-$2')
export function formatarWhatsapp(v: string) {
  const d = soDigitos(v).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const mascararCpf = (v: string) => {
  const d = soDigitos(v)
  return d.length === 11 ? `***.***.***-${d.slice(9)}` : (v ? '•••.•••.•••-••' : '')
}

// Normaliza e valida um valor segundo o tipo. Devolve { valor } normalizado ou { erro }.
export function validarValor(
  tipo: string, bruto: unknown, opcoes?: string[], chave?: string,
): { valor: string; erro?: undefined } | { erro: string; valor?: undefined } {
  const v = String(bruto ?? '').trim()
  if (v === '') return { valor: '' }
  switch (tipo) {
    case 'cnpj': return validarCnpj(v) ? { valor: formatarCnpj(v) } : { erro: 'CNPJ inválido.' }
    case 'cpf': return validarCpf(v) ? { valor: formatarCpf(v) } : { erro: 'CPF inválido.' }
    case 'email': return validarEmail(v) ? { valor: v.toLowerCase() } : { erro: 'E-mail inválido.' }
    case 'cep': return soDigitos(v).length === 8 ? { valor: formatarCep(v) } : { erro: 'CEP deve ter 8 dígitos.' }
    case 'whatsapp': {
      const n = soDigitos(v).length
      return n === 10 || n === 11 ? { valor: formatarWhatsapp(v) } : { erro: 'Use o formato (DD) 9XXXX-XXXX.' }
    }
    case 'inteiro': {
      if (!/^\d+$/.test(v)) return { erro: 'Informe um número inteiro maior ou igual a zero.' }
      const n = parseInt(v, 10)
      const max = chave?.startsWith('al_') ? 5000 : (chave ? LIMITE_INTEIRO[chave] : undefined)
      if (max !== undefined && n > max) return { erro: `Confira o número: o máximo aceito aqui é ${max.toLocaleString('pt-BR')}.` }
      return { valor: String(n) }
    }
    case 'dinheiro': {
      // Aceita "1.450,50" (BR) e "1450.50" (já normalizado). Sem vírgula e com ponto + 1-2 casas, o ponto é decimal.
      const limpo = v.replace(/[R$\s]/g, '')
      const n = limpo.includes(',') ? Number(limpo.replace(/\./g, '').replace(',', '.'))
        : /^\d+\.\d{1,2}$/.test(limpo) ? Number(limpo)
        : Number(limpo.replace(/\./g, ''))
      if (!Number.isFinite(n) || n < 0) return { erro: 'Informe um valor em reais válido.' }
      if (chave === 'preco_infantil' && n < PRECO_TABELA.infantil) return { erro: `O preço final do kit Infantil não pode ser menor que o preço de tabela (${fmtBRL(PRECO_TABELA.infantil)}).` }
      if (chave === 'preco_fundamental' && n < PRECO_TABELA.fundamental) return { erro: `O preço final do kit Fundamental não pode ser menor que o preço de tabela (${fmtBRL(PRECO_TABELA.fundamental)}).` }
      if ((chave === 'preco_infantil' || chave === 'preco_fundamental') && n > 5000) return { erro: 'Confira o valor: ele está muito acima do esperado.' }
      if (chave === 'comissao_kit' && (n <= 0 || n >= PRECO_TABELA.infantil)) return { erro: `A comissão por kit deve ser maior que zero e menor que o preço de tabela do kit Infantil (${fmtBRL(PRECO_TABELA.infantil)}).` }
      return { valor: n.toFixed(2) }
    }
    case 'opcoes': return opcoes?.includes(v) ? { valor: v } : { erro: 'Escolha uma das opções.' }
    case 'texto': case 'textolongo': return v.length > 500 ? { erro: 'Texto muito longo.' } : { valor: v }
    default: return { valor: v }
  }
}
