import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { hasFilters, toSearchParams, type LeadFilters as Filters } from "@/lib/leads-filters";
import styles from "./LeadFilters.module.css";

// Barra de filtros: um <form method="get"> comum. O estado vive na URL, então isto
// é componente de servidor — nada de JavaScript para filtrar, e o link resultante
// pode ser salvo ou mandado para alguém.

export function LeadFilters({
  filters,
  forms,
  total,
}: {
  filters: Filters;
  forms: { value: string; label: string }[];
  total: number;
}) {
  const exportQuery = toSearchParams(filters, { page: 1 });

  return (
    <form className={styles.bar} method="get">
      <label className={styles.field}>
        <span>Formulário</span>
        <select name="formulario" defaultValue={filters.form ?? ""}>
          <option value="">Todos</option>
          {forms.map((form) => (
            <option key={form.value} value={form.value}>
              {form.label}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span>Perfil</span>
        <select name="perfil" defaultValue={filters.profile ?? ""}>
          <option value="">Todos</option>
          <option value="comercial">Perfil comercial</option>
          <option value="sem_perfil">Sem perfil</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>De</span>
        <input type="date" name="de" defaultValue={filters.from ?? ""} />
      </label>

      <label className={styles.field}>
        <span>Até</span>
        <input type="date" name="ate" defaultValue={filters.to ?? ""} />
      </label>

      <label className={`${styles.field} ${styles.grow}`}>
        <span>Busca</span>
        <input
          type="search"
          name="busca"
          defaultValue={filters.q ?? ""}
          placeholder="Nome, e-mail ou empresa"
        />
      </label>

      <div className={styles.actions}>
        <button type="submit" className={buttonClass("solid")}>
          Filtrar
        </button>
        {hasFilters(filters) && (
          <Link href="/admin/leads" className={buttonClass("ghost")}>
            Limpar
          </Link>
        )}
        <a
          className={buttonClass("outline")}
          href={`/api/admin/leads/exportar${exportQuery ? `?${exportQuery}` : ""}`}
          aria-disabled={total === 0}
        >
          Exportar CSV
        </a>
      </div>
    </form>
  );
}
