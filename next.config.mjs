import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Há package-lock.json em pastas acima; fixa a raiz para o build não inferir a errada
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  reactStrictMode: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"], deviceSizes: [360, 480, 640, 828, 1080, 1280, 1600, 1920] },
  async headers() {
    // Arquivos com nome fixo: cache longo no navegador/CDN
    const cache = [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }];
    return [
      { source: "/video/:path*", headers: cache },
      { source: "/img/:path*", headers: cache },
      { source: "/brand/:path*", headers: cache },
    ];
  },
};
export default nextConfig;
