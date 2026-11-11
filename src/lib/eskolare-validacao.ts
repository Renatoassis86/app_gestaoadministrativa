// Validação e máscaras do Cadastro Eskolare. Sem imports de projeto (testável com `node --test`).

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
  tipo: string, bruto: unknown, opcoes?: string[],
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
      return { valor: String(parseInt(v, 10)) }
    }
    case 'dinheiro': {
      const n = Number(v.replace(/\./g, '').replace(',', '.'))
      if (!Number.isFinite(n) || n < 0) return { erro: 'Informe um valor em reais válido.' }
      return { valor: n.toFixed(2) }
    }
    case 'opcoes': return opcoes?.includes(v) ? { valor: v } : { erro: 'Escolha uma das opções.' }
    case 'texto': case 'textolongo': return v.length > 500 ? { erro: 'Texto muito longo.' } : { valor: v }
    default: return { valor: v }
  }
}
