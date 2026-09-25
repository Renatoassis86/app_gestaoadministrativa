import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestão de Pedidos — Cidade Viva Education',
  description: 'Acompanhe pedidos das escolas parceiras, status de envio, separação de materiais e integração com o time comercial.',
  openGraph: {
    title: 'Gestão de Pedidos — Cidade Viva Education',
    description: 'Controle de pedidos e fluxo logístico das escolas parceiras.',
    images: [{ url: '/images/hero-modulos.png', width: 1672, height: 941, alt: 'Cidade Viva Education — Gestão de Pedidos' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestão de Pedidos — Cidade Viva Education',
    description: 'Controle de pedidos e fluxo logístico das escolas parceiras.',
    images: ['/images/hero-modulos.png'],
  },
}

export default function PedidosLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
