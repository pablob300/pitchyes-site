import Link from "next/link";
import styles from "./Blog.module.css";

// Trilha visível (o schema BreadcrumbList sai da mesma lista, na página).
// O último item é a página atual: texto, não link.
export function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Você está em">
      <ol>
        {trail.map((item, i) => (
          <li key={item.path}>
            {i < trail.length - 1 ? (
              <Link href={item.path}>{item.name}</Link>
            ) : (
              <span aria-current="page">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
