"use client";

import { useEffect, useState } from "react";
import styles from "./LeadsBrowser.module.css";

// Lista de leads: clicar numa linha abre a ficha completa numa barra à direita.

export type LeadItem = {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  company: string | null;
  form: string;
  fields: Record<string, string>;
};

export function LeadsBrowser({ items, labels }: { items: LeadItem[]; labels: Record<string, string> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = items.find((item) => item.id === openId) ?? null;

  useEffect(() => {
    if (!selected) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  if (!items.length) {
    return (
      <p className={styles.empty}>
        Assim que alguém enviar o formulário de contato, o registro aparece aqui com todos os campos preenchidos.
      </p>
    );
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Data</th>
            <th scope="col">Horário</th>
            <th scope="col">Nome</th>
            <th scope="col">E-mail</th>
            <th scope="col">
              <span className={styles.srOnly}>Abrir ficha</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} data-open={item.id === openId || undefined}>
              <td>{item.date}</td>
              <td>{item.time}</td>
              <td>
                <button type="button" className={styles.rowButton} onClick={() => setOpenId(item.id)}>
                  {item.name || "(sem nome)"}
                </button>
              </td>
              <td className={styles.email}>{item.email}</td>
              <td className={styles.actionCell}>
                <button type="button" className={styles.rowLink} onClick={() => setOpenId(item.id)}>
                  Ver ficha
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <>
          <button
            type="button"
            className={styles.backdrop}
            aria-label="Fechar ficha do lead"
            onClick={() => setOpenId(null)}
          />
          <aside className={styles.sidebar} aria-label={`Ficha de ${selected.name}`}>
            <div className={styles.sidebarHead}>
              <div>
                <p className={styles.sidebarEyebrow}>
                  Formulário: {selected.form} · {selected.date} às {selected.time}
                </p>
                <h2>{selected.name || "(sem nome)"}</h2>
              </div>
              <button type="button" className={styles.close} onClick={() => setOpenId(null)} aria-label="Fechar">
                ×
              </button>
            </div>
            <dl className={styles.fields}>
              {Object.entries(selected.fields).map(([key, value]) => (
                <div key={key}>
                  <dt>{labels[key] ?? key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.sidebarActions}>
              <a className={styles.mail} href={`mailto:${selected.email}`}>
                Responder por e-mail
              </a>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
