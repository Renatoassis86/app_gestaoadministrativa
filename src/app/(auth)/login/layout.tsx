import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrar — Gestão Comercial | Cidade Viva Education',
  description: 'Ferramenta exclusiva para a equipe interna da Cidade Viva Education. Gerencie escolas parceiras, registre interações, acompanhe negociações e monitore indicadores comerciais em tempo real.',
  openGraph: {
    title: 'Gestão comercial inteligente e integrada',
    description: 'Ferramenta exclusiva para a equipe interna da Cidade Viva Education.',
    images: [{ url: '/images/hero-modulos.png', width: 1672, height: 941, alt: 'Cidade Viva Education — Gestão Comercial' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestão comercial inteligente e integrada',
    description: 'Ferramenta exclusiva para a equipe interna da Cidade Viva Education.',
    images: ['/images/hero-modulos.png'],
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
