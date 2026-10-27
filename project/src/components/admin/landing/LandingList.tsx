"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buttonClass } from "@/components/ui/Button";
import tableStyles from "@/components/admin/pages/PagesEditor.module.css";
import { LandingForm, type LandingFormValues } from "./LandingForm";
import styles from "./Landing.module.css";

// Lista das landing pages: nome, endereço, situação (chave Ativa/Inativa) e as ações.
// Mesma tabela do Page Editor, para o painel ter uma linguagem só.

export type LandingItem = {
  id: string;
  name: string;
  slug: string;
  url: string;
  active: boolean;
  noindex: boolean;
  seoTitle: string;
  seoDescription: string;
  updated: string;
  updatedBy: string | null;
};

type Gaveta = { modo: "editar" | "duplicar"; item: LandingItem } | null;

export function LandingList({ items, aviso: avisoInicial }: { items: LandingItem[]; aviso?: string }) {
  const router = useRouter();
  const [gaveta, setGaveta] = useState<Gaveta>(null);
  const [aviso, setAviso] = useState(avisoInicial ?? "");
  const [mudando, setMudando] = useState<string | null>(null);

  useEffect(() => {
    if (!gaveta) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setGaveta(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [gaveta]);

  async function alternar(item: LandingItem) {
    setMudando(item.id);
    const response = await fetch("/api/admin/landing-pages", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id: item.id, ativa: !item.active }),
    });
    const json = (await response.json()) as { ok: boolean; message?: string };
    setMudando(null);
    setAviso(json.ok ? (item.active ? `“${item.name}” saiu do ar.` : `“${item.name}” está no ar em ${item.url}.`) : (json.message ?? "Não foi possível mudar."));
    router.refresh();
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Nenhuma landing page ainda. A primeira nasce como cópia do modelo padrão.</p>
        <Link href="/admin/landing-pages/nova" className={buttonClass("solid")}>
          Criar página
        </Link>
      </div>
    );
  }

  return (
    <>
      {aviso && (
        <p className={styles.aviso} role="status">
          {aviso}
        </p>
      )}
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th scope="col">Nome</th>
            <th scope="col">Endereço</th>
            <th scope="col">Situação</th>
            <th scope="col">
              <span className="visually-hidden">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.name}</strong>
                {item.noindex && (
                  <span className={tableStyles.badge} data-tipo="alerta">
                    Fora do índice
                  </span>
                )}
                <p className={styles.meta}>
                  Atualizada em {item.updated}
                  {item.updatedBy ? ` por ${item.updatedBy}` : ""}
                </p>
              </td>
              <td>
                {item.active ? (
                  <a href={item.url} target="_blank" rel="noopener" className={tableStyles.path}>
                    {item.url}
                  </a>
                ) : (
                  <code className={tableStyles.path}>{item.url}</code>
                )}
              </td>
              <td>
                <button
                  type="button"
                  role="switch"
                  aria-checked={item.active}
                  className={styles.toggle}
                  disabled={mudando === item.id}
                  onClick={() => void alternar(item)}
                  aria-label={`${item.name}: ${item.active ? "ativa — clique para desativar" : "inativa — clique para ativar"}`}
                >
                  <span aria-hidden="true" />
                  {item.active ? "Ativa" : "Inativa"}
                </button>
              </td>
              <td className={tableStyles.actions}>
                <Link href={`/admin/landing-pages/${item.id}/editar`} className={tableStyles.action}>
                  Editar conteúdo
                </Link>
                <button type="button" className={tableStyles.action} onClick={() => setGaveta({ modo: "editar", item })}>
                  Configurações
                </button>
                <button type="button" className={tableStyles.action} onClick={() => setGaveta({ modo: "duplicar", item })}>
                  Duplicar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {gaveta && (
        <>
          <button type="button" className={styles.backdrop} aria-label="Fechar" onClick={() => setGaveta(null)} />
          <aside className={styles.drawer} aria-label={gaveta.modo === "editar" ? "Configurações da página" : "Duplicar página"}>
            <div className={styles.drawerHead}>
              <div>
                <p>{gaveta.modo === "editar" ? "Configurações da página" : "Duplicar página"}</p>
                <h2>{gaveta.item.name}</h2>
              </div>
              <button type="button" className={styles.close} onClick={() => setGaveta(null)} aria-label="Fechar">
                ×
              </button>
            </div>
            <LandingForm
              key={`${gaveta.modo}-${gaveta.item.id}`}
              modo={gaveta.modo}
              id={gaveta.item.id}
              de={gaveta.item.id}
              inicial={valoresIniciais(gaveta)}
              onPronto={(json) => {
                setGaveta(null);
                if (gaveta.modo === "duplicar" && json.pagina) {
                  router.push(`/admin/landing-pages/${json.pagina.id}/editar`);
                  return;
                }
                setAviso(json.message ?? "Salvo.");
                router.refresh();
              }}
            />
          </aside>
        </>
      )}
    </>
  );
}

function valoresIniciais(gaveta: NonNullable<Gaveta>): LandingFormValues {
  const { item, modo } = gaveta;
  if (modo === "editar") {
    return { nome: item.name, slug: item.slug, seoTitle: item.seoTitle, seoDescription: item.seoDescription, noindex: item.noindex };
  }
  // Cópia: mesmo texto de SEO como ponto de partida, nome e endereço novos.
  return { nome: `${item.name} (cópia)`, slug: `${item.slug}-copia`, seoTitle: item.seoTitle, seoDescription: item.seoDescription };
}
