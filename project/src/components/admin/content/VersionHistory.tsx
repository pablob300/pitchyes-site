"use client";

import { useEffect, useState } from "react";
import styles from "./ContentEditor.module.css";

// Histórico de publicações: data, hora e quem publicou.
//
// Restaurar traz a versão para o RASCUNHO, nunca direto para o ar — voltar atrás continua
// sendo uma decisão que passa pelo botão Publicar.

type Versao = { id: string; em: string; por: string | null };

const quando = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function VersionHistory({
  caminhos,
  onFechar,
  onRestaurado,
}: {
  caminhos: { caminho: string; rotulo: string }[];
  onFechar: () => void;
  onRestaurado: () => void;
}) {
  const [listas, setListas] = useState<Record<string, Versao[]>>({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const fechar = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    document.addEventListener("keydown", fechar);
    return () => document.removeEventListener("keydown", fechar);
  }, [onFechar]);

  useEffect(() => {
    void (async () => {
      const saida: Record<string, Versao[]> = {};
      for (const { caminho } of caminhos) {
        const response = await fetch(
          `/api/admin/conteudo/versoes?caminho=${encodeURIComponent(caminho)}`,
        );
        const json = (await response.json()) as { ok: boolean; versoes?: Versao[] };
        saida[caminho] = json.ok ? (json.versoes ?? []) : [];
      }
      setListas(saida);
      setCarregando(false);
    })();
  }, [caminhos]);

  async function restaurar(caminho: string, versao: string) {
    setErro(null);
    const response = await fetch("/api/admin/conteudo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ caminho, acao: "restaurar", versao }),
    });
    const json = (await response.json()) as { ok: boolean; message?: string };
    if (!json.ok) {
      setErro(json.message ?? "Não foi possível restaurar.");
      return;
    }
    onRestaurado();
  }

  return (
    <>
      <button className={styles.fundo} onClick={onFechar} aria-label="Fechar o histórico" />
      <div className={styles.historico} role="dialog" aria-label="Histórico de publicações">
        <div className={styles.gavetaTopo}>
          <h2>Histórico</h2>
          <button type="button" onClick={onFechar} aria-label="Fechar">
            ×
          </button>
        </div>

        <div className={styles.gavetaCorpo}>
          {carregando && <p className={styles.nota}>Carregando…</p>}
          {erro && <p className={styles.erro}>{erro}</p>}

          {!carregando &&
            caminhos.map(({ caminho, rotulo }) => {
              const versoes = listas[caminho] ?? [];
              return (
                <section key={caminho} className={styles.lista}>
                  <header>
                    <h3>{rotulo}</h3>
                    <span>{versoes.length}</span>
                  </header>
                  {versoes.length === 0 ? (
                    <p className={styles.nota}>Nada publicado por aqui ainda.</p>
                  ) : (
                    <ol>
                      {versoes.map((versao, i) => (
                        <li key={versao.id}>
                          <div className={styles.itemTopo}>
                            <span className={styles.versao}>
                              <strong>{quando(versao.em)}</strong>
                              <em>{versao.por ?? "—"}</em>
                            </span>
                            {i === 0 ? (
                              <span className={styles.atual}>no ar</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void restaurar(caminho, versao.id)}
                              >
                                Restaurar
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </section>
              );
            })}

          <p className={styles.nota}>
            Restaurar traz a versão para o rascunho. Para ela voltar ao ar, é preciso
            publicar.
          </p>
        </div>
      </div>
    </>
  );
}
