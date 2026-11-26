import { redirect } from 'next/navigation'

// Página inicial do módulo = Visão geral (como no módulo de contratos da We Make).
export default function ContratosIndex() {
  redirect('/contratos/visao-geral')
}
