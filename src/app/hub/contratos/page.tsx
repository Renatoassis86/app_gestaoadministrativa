import { redirect } from 'next/navigation'

// Depois do login no hub, abre direto o módulo de contratos (cartões das escolas).
export default function HubContratos() {
  redirect('/contratos/escolas')
}
