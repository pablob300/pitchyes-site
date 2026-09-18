import Image from "next/image";

// Source art: docs/pitchyes-logo-*.svg (white wordmark). The site uses the dark-text
// version for light backgrounds; pitchyes-logo-white.svg is kept for dark ones.
const RATIO = 1946 / 402;

type Props = {
  height: number;
  variant?: "dark" | "white";
  priority?: boolean;
  className?: string;
};

export function Logo({ height, variant = "dark", priority, className }: Props) {
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
