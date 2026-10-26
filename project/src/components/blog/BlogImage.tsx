// Imagem do blog servida pelo R2 (/midia/...). Não usa next/image: o otimizador do
// OpenNext só lê arquivos estáticos, e as imagens do blog moram no bucket. O srcset sai
// da própria rota /midia?w= (AVIF/WebP redimensionado e com cache).
//
// Sempre com width/height (CLS zero) e alt com texto (SEO.md §1.7).

const WIDTHS = [320, 640, 960, 1280, 1600];

export function BlogImage({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  className,
}: {
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const fromBucket = src.startsWith("/midia/");
  const maxWidth = width ?? 1600;
  const widths = WIDTHS.filter((w) => w <= maxWidth);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={fromBucket ? `${src}?w=${widths.includes(1280) ? 1280 : (widths.at(-1) ?? 640)}` : src}
      srcSet={fromBucket && widths.length ? widths.map((w) => `${src}?w=${w} ${w}w`).join(", ") : undefined}
      sizes={sizes}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 630}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
    />
  );
}
