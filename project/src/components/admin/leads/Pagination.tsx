import Link from "next/link";
import { toSearchParams, type LeadFilters } from "@/lib/leads-filters";
import styles from "./Pagination.module.css";

// Paginação preservando os filtros da URL. Serve à Central de leads e à Newsletter.
export function Pagination({
  filters,
  total,
  perPage,
  basePath = "/admin/leads",
}: {
  filters: LeadFilters;
  total: number;
  perPage: number;
  basePath?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;

  const href = (page: number) => {
    const query = toSearchParams(filters, { page });
    return `${basePath}${query ? `?${query}` : ""}`;
  };

  return (
    <nav className={styles.nav} aria-label="Paginação dos leads">
      {filters.page > 1 ? (
        <Link href={href(filters.page - 1)} rel="prev">
          ← Anteriores
        </Link>
      ) : (
        <span aria-hidden="true">← Anteriores</span>
      )}
      <span className={styles.status}>
        Página {filters.page} de {pages}
      </span>
      {filters.page < pages ? (
        <Link href={href(filters.page + 1)} rel="next">
          Próximos →
        </Link>
      ) : (
        <span aria-hidden="true">Próximos →</span>
      )}
    </nav>
  );
}
