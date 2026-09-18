import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./Button.module.css";

type Variant = "solid" | "dark" | "outline" | "ghost";
type Size = "md" | "lg";

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export function buttonClass(variant: Variant = "solid", size: Size = "md", extra?: string) {
  return [styles.btn, styles[variant], size === "lg" && styles.lg, extra]
    .filter(Boolean)
    .join(" ");
}

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
