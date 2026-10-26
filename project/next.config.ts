import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Sem experimental.inlineCss: testado em 25/10/2026, ele repete o CSS dentro dos dados do
  // React e a home vai de 23 KB para 71 KB (gzip); o PageSpeed piorou (98 contra 99 no celular).
  images: {
    // 320 entre os tamanhos: a miniatura dos depoimentos ocupa ~280px no desktop e, sem
    // ele, o Next pulava de 256 para 384 (PageSpeed "Improve image delivery").
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384],
  },
  // O Next trata o postcss (dependência do sanitize-html, que limpa o HTML do blog) como
  // pacote externo do servidor; no Windows o OpenNext não consegue criar o link simbólico
  // dele (EPERM). Empacotado junto, o problema some e nada muda em produção.
  transpilePackages: ["sanitize-html", "postcss"],
  // URL que mudou ganha 301 para sempre (SEO.md §1.8): backlinks e buscadores seguem.
  async redirects() {
    return [{ source: "/precos", destination: "/planos", statusCode: 301 }];
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
