import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Upload de logo (PNG até 5 MB) e importação de planilha por Server Action; o padrão do Next é 1 MB.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
  // Revalidação agressiva para garantir dados sempre frescos
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minuto
    pagesBufferLength: 5,
  },
};

export default nextConfig;
