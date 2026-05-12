import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Revalidação agressiva para garantir dados sempre frescos
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 1 minuto
    pagesBufferLength: 5,
  },
};

export default nextConfig;
