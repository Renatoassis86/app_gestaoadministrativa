import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestão Comercial — Cidade Viva Education',
  description: 'Cadastro de escolas, pipeline Kanban, registros de negociação, contratos, dashboard e indicadores em tempo real.',
  openGraph: {
    title: 'Gestão Comercial — Cidade Viva Education',
    description: 'CRM completo para parcerias com escolas.',
    images: [{ url: '/images/hero-modulos.png', width: 1672, height: 941, alt: 'Cidade Viva Education — Gestão Comercial' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestão Comercial — Cidade Viva Education',
    description: 'CRM completo para parcerias com escolas.',
    images: ['/images/hero-modulos.png'],
  },
}

export default function ComercialLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
