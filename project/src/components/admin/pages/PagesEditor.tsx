"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fold } from "@/lib/fold";
import { MetaDrawer } from "./MetaDrawer";
import styles from "./PagesEditor.module.css";

// Lista das páginas do site, em ordem alfabética pelo endereço, com busca.
// "Editar Meta" abre a gaveta à direita; "Editar Conteúdo" chega depois.

export type PageItem = {
  path: string;
  name: string;
  title: string;
  description: string;
  defaultTitle: string;
  defaultDescription: string;
  edited: boolean;
  noindex: boolean;
  placeholder: boolean;
  updated: string;
  imageUrl: string | null;
  imageAlt: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  editedAt: string | null;
  editedBy: string | null;
};

export function PagesEditor({ items, defaultImage }: { items: PageItem[]; defaultImage: string }) {
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<PageItem | null>(null);
  const [aviso, setAviso] = useState("");

  const filtradas = useMemo(() => {
    const termo = fold(busca);
    if (!termo) return items;
    return items.filter((item) => fold(`${item.path} ${item.name} ${item.title}`).includes(termo));
  }, [busca, items]);

  return (
    <>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <span className="visually-hidden">Buscar página</span>
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar por endereço ou nome da página"
          />
        </label>
        <p className={styles.count}>
          {filtradas.length} de {items.length} páginas
        </p>
        {aviso && (
          <p className={styles.aviso} role="status">
            {aviso}
          </p>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Endereço</th>
            <th scope="col">Página</th>
            <th scope="col">Título em vigor</th>
            <th scope="col">
              <span className="visually-hidden">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtradas.map((item) => (
            <tr key={item.path}>
              <td>
                <code className={styles.path}>{item.path}</code>
                {item.edited && <span className={styles.badge}>Editada</span>}
                {item.noindex && (
                  <span className={styles.badge} data-tipo="alerta">
                    Fora do índice
                  </span>
                )}
              </td>
              <td className={styles.name}>{item.name}</td>
              <td className={styles.title}>
                <span>{item.title}</span>
                <span className={styles.description}>{item.description}</span>
              </td>
              <td className={styles.actions}>
                <button type="button" className={styles.action} onClick={() => setAberta(item)}>
                  <CodeIcon />
                  Editar Meta
                </button>
                <button
                  type="button"
                  className={styles.action}
                  disabled
                  title="Em construção: a edição de conteúdo por blocos chega numa próxima etapa."
                >
                  <BlocksIcon />
                  Editar Conteúdo
                </button>
              </td>
            </tr>
          ))}
          {filtradas.length === 0 && (
            <tr>
              <td colSpan={4} className={styles.vazio}>
                Nenhuma página com esse termo.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {aberta && (
        <MetaDrawer
          page={aberta}
          defaultImage={defaultImage}
          onClose={() => setAberta(null)}
          onSaved={(message) => {
            setAberta(null);
            setAviso(message);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M5.5 4 2 8l3.5 4M10.5 4 14 8l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BlocksIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
    </svg>
  );
}
