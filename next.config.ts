import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Upload de logo (PNG até 5 MB) e importação de planilha por Server Action; o padrão do Next é 1 MB.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  // Links digitados com acento (ex.: "formulário-pedidos", comum em e-mail e WhatsApp) levam ao endereço real, sem acento.
  async redirects() {
    return ['pedidos', 'ingles', 'eskolare'].flatMap(n => [
      { source: `/formulário-${n}`, destination: `/formulario-${n}`, permanent: false },
      { source: `/formulário-${n}/:resto*`, destination: `/formulario-${n}/:resto*`, permanent: false },
    ]).concat([
      { source: '/formulário', destination: '/formulario', permanent: false },
      { source: '/formulário/:resto*', destination: '/formulario/:resto*', permanent: false },
    ])
  },
  // Revalidação agressiva para garantir dados sempre frescos
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minuto
    pagesBufferLength: 5,
  },
};

export default nextConfig;
