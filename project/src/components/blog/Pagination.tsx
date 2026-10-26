import Link from "next/link";
import styles from "./Blog.module.css";

// Paginação com links reais (o robô segue cada página). A página atual não é link.
export function Pagination({ page, pages, href }: { page: number; pages: number; href: (n: number) => string }) {
  if (pages <= 1) return null;
  const numbers = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - page) <= 1,
  );
  return (
    <nav className={styles.pagination} aria-label="Páginas do blog">
      {page > 1 && (
        <Link href={href(page - 1)} rel="prev" className={styles.pageLink}>
          ← Anteriores
        </Link>
      )}
      <ol className={styles.pageNumbers}>
        {numbers.map((n, i) => (
          <li key={n}>
            {i > 0 && n - numbers[i - 1] > 1 && <span className={styles.pageGap}>…</span>}
            {n === page ? (
              <span className={styles.pageCurrent} aria-current="page">
                {n}
              </span>
            ) : (
              <Link href={href(n)} className={styles.pageLink} aria-label={`Página ${n}`}>
                {n}
              </Link>
            )}
          </li>
        ))}
      </ol>
      {page < pages && (
        <Link href={href(page + 1)} rel="next" className={styles.pageLink}>
          Próximos →
        </Link>
      )}
    </nav>
  );
}
