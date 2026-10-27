import Link from "next/link";
import type { UseCases as UseCasesContent } from "@/content/home.schema";
import { editFn } from "@/lib/content/edit";
import { rich } from "@/lib/content/richtext";
import styles from "./UseCases.module.css";

export function UseCases({ content, editable }: { content: UseCasesContent; editable?: boolean }) {
  const edit = editFn(editable);
  return (
    <section className="section" aria-labelledby="casos-de-uso-title">
      <div className="container">
        <h2 id="casos-de-uso-title" className={styles.title} data-reveal {...edit("useCases.title")}>
          {content.title}
        </h2>
        <ul className={styles.grid}>
          {content.items.map((item, i) => (
            <li key={item.title} className={styles.card} data-reveal {...edit(`useCases.items.${i}`)}>
              {/* O link cobre o card inteiro (::after), mas o texto dele é o título. */}
              <h3>{item.href ? <Link href={item.href}>{item.title}</Link> : item.title}</h3>
              <p>{rich(item.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
