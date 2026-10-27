import Image from "next/image";
import type { BrandImage } from "@/lib/site-settings";

// Source art: docs/pitchyes-logo-*.svg (white wordmark). The site uses the dark-text
// version for light backgrounds; pitchyes-logo-white.svg is kept for dark ones.
const RATIO = 1946 / 402;

type Props = {
  height: number;
  variant?: "dark" | "white";
  priority?: boolean;
  className?: string;
  /** Logo enviado em Configurações › Configuração geral; ausente = a arte da marca. */
  brand?: BrandImage | null;
};

export function Logo({ height, variant = "dark", priority, className, brand }: Props) {
  // O logo enviado vale para fundo claro; a versão branca (fundo escuro) continua a da marca.
  if (brand && variant === "dark") {
    return (
      <Image
        src={brand.src}
        alt="PitchYes"
        width={Math.round((height * brand.width) / brand.height)}
        height={height}
        priority={priority}
        className={className}
        unoptimized
      />
    );
  }
  return (
    <Image
      src={variant === "white" ? "/brand/pitchyes-logo-white.svg" : "/brand/pitchyes-logo.svg"}
      alt="PitchYes"
      width={Math.round(height * RATIO)}
      height={height}
      priority={priority}
      className={className}
    />
  );
}
