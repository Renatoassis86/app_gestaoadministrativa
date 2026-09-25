import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestão de Contratos — Cidade Viva Education',
  description: 'Gestão de cursos, alunos, professores, contratos e indicadores acadêmicos da Cidade Viva Education.',
  openGraph: {
    title: 'Gestão de Contratos — Cidade Viva Education',
    description: 'Plataforma acadêmica e contratual.',
    images: [{ url: '/images/hero-modulos.png', width: 1672, height: 941, alt: 'Cidade Viva Education — Gestão de Contratos' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestão de Contratos — Cidade Viva Education',
    description: 'Plataforma acadêmica e contratual.',
    images: ['/images/hero-modulos.png'],
  },
}

export default function ContratosLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
