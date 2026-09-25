import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestão de Marketing — Cidade Viva Education',
  description: 'Formulários de briefing por cargo para alimentar o diagnóstico, o posicionamento, o plano de campanhas e o calendário de conteúdo do marketing.',
  openGraph: {
    title: 'Gestão de Marketing — Cidade Viva Education',
    description: 'Briefing estratégico para o planejamento de marketing.',
    images: [{ url: '/images/hero-modulos.png', width: 1672, height: 941, alt: 'Cidade Viva Education — Gestão de Marketing' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gestão de Marketing — Cidade Viva Education',
    description: 'Briefing estratégico para o planejamento de marketing.',
    images: ['/images/hero-modulos.png'],
  },
}

export default function MarketingLoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
