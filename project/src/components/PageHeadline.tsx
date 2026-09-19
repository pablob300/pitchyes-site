import type { ReactNode } from "react";
import styles from "./PageHeadline.module.css";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
};

// Headline block for inner pages. Mirrors System/components/page-headline.html.
export function PageHeadline({ eyebrow, title, description, children }: Props) {
  return (
    <section className={styles.headline}>
      <div className="container">
        {eyebrow && (
          <p className="eyebrow" data-reveal>
            {eyebrow}
          </p>
        )}
        <h1 data-reveal>{title}</h1>
        {description && (
          <p className="lead" data-reveal>
            {description}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
