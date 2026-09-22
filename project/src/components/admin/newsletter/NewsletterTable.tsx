import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { hasFilters, toSearchParams, type LeadFilters } from "@/lib/leads-filters";
import styles from "./NewsletterTable.module.css";

// Lista de assinaturas: e-mail e quando a pessoa assinou. Tudo componente de
// servidor — o filtro é um <form method="get"> e a lista não tem interação.

export type SubscriberRow = { id: string; email: string; date: string; time: string };

export function NewsletterTable({
  rows,
  filters,
  total,
}: {
  rows: SubscriberRow[];
  filters: LeadFilters;
  total: number;
}) {
  const exportQuery = toSearchParams(filters, { page: 1 });

  return (
    <>
      <form className={styles.bar} method="get">
        <label className={styles.field}>
          <span>De</span>
          <input type="date" name="de" defaultValue={filters.from ?? ""} />
        </label>
        <label className={styles.field}>
          <span>Até</span>
          <input type="date" name="ate" defaultValue={filters.to ?? ""} />
        </label>
        <div className={styles.actions}>
          <button type="submit" className={buttonClass("solid")}>
            Filtrar
          </button>
          {hasFilters(filters) && (
            <Link href="/admin/newsletter" className={buttonClass("ghost")}>
              Limpar
            </Link>
          )}
          <a
            className={buttonClass("outline")}
            href={`/api/admin/newsletter/exportar${exportQuery ? `?${exportQuery}` : ""}`}
            aria-disabled={total === 0}
          >
            {hasFilters(filters) ? "Exportar filtrados" : "Exportar tudo"}
          </a>
        </div>
      </form>

      {rows.length === 0 ? (
        <p className={styles.vazio}>
          {hasFilters(filters)
            ? "Nenhuma assinatura nesse período."
            : "Nenhuma assinatura ainda. Quem assina pelo rodapé do site aparece aqui."}
        </p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">E-mail</th>
              <th scope="col">Data</th>
              <th scope="col">Hora</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className={styles.email}>
                  <a href={`mailto:${row.email}`}>{row.email}</a>
                </td>
                <td className={styles.quando}>{row.date}</td>
                <td className={styles.quando}>{row.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
