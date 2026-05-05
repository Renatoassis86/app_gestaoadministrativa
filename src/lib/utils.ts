import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatDate(date: string | null | undefined) {
  if (!date) return '—'
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

export function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function calcularPotencial(infantil: number, fund1: number, fund2: number, medio: number) {
  return infantil * 500 + fund1 * 600 + fund2 * 700 + medio * 800
}

export function diasDesdeData(date: string | null | undefined) {
  if (!date) return null
  const diff = Date.now() - new Date(date).getTime()
  return Math.floor(diff / 86400000)
}
