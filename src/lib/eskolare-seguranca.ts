// Token, PIN e sessão do acesso da escola. Sem imports de projeto (testável com `node --test`).
import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from 'node:crypto'

export const MAX_TENTATIVAS = 5
export const BLOQUEIO_MINUTOS = 15
export const SESSAO_HORAS = 2

// 32 bytes aleatórios = 256 bits, não sequencial.
export const gerarToken = () => randomBytes(32).toString('base64url')

// PIN de 6 dígitos (com zeros à esquerda), gerado por CSPRNG.
export const gerarPin = () => String(randomInt(0, 1_000_000)).padStart(6, '0')

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(pin, salt, 32).toString('hex')}`
}

export function verificarPin(pin: string, guardado: string | null | undefined): boolean {
  if (!guardado || !/^\d{6}$/.test(pin)) return false
  const [salt, hash] = guardado.split(':')
  if (!salt || !hash) return false
  const calculado = scryptSync(pin, salt, 32)
  const esperado = Buffer.from(hash, 'hex')
  return calculado.length === esperado.length && timingSafeEqual(calculado, esperado)
}

export const novaSessao = () => randomBytes(32).toString('base64url')
export const hashSessao = (s: string) => createHash('sha256').update(s).digest('hex')

export function tokenPlausivel(token: string) {
  return /^[A-Za-z0-9_-]{43}$/.test(token)   // 32 bytes em base64url
}
