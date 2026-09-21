"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import type { PageItem } from "./PagesEditor";
import styles from "./MetaDrawer.module.css";

// Gaveta de metadados de uma página, no mesmo formato da ficha de lead.
// Campo em branco = usar o padrão do código; o padrão fica visível ao lado.

const TITLE_IDEAL = 60;
const DESCRIPTION_MIN = 120;
const DESCRIPTION_MAX = 160;

export function MetaDrawer({
  page,
  defaultImage,
  onClose,
  onSaved,
}: {
  page: PageItem;
  defaultImage: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [titulo, setTitulo] = useState(page.edited ? page.title : "");
  const [descricao, setDescricao] = useState(page.edited ? page.description : "");
  const [ogTitulo, setOgTitulo] = useState(page.ogTitle ?? "");
  const [ogDescricao, setOgDescricao] = useState(page.ogDescription ?? "");
  const [imagem, setImagem] = useState(page.imageUrl ?? "");
  const [imagemAlt, setImagemAlt] = useState(page.imageAlt ?? "");
  const [noindex, setNoindex] = useState(page.noindex && !page.placeholder);
  const [revisadoEm, setRevisadoEm] = useState(page.updated);
  const [busy, setBusy] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erro, setErro] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const tituloFinal = titulo || page.defaultTitle;
  const descricaoFinal = descricao || page.defaultDescription;

  async function salvar(restaurar = false) {
    setBusy(true);
    setErros({});
    setErro("");
    try {
      const response = await fetch("/api/admin/paginas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          restaurar
            ? { caminho: page.path, restaurar: true }
            : {
                caminho: page.path,
                titulo,
                descricao,
                ogTitulo,
                ogDescricao,
                imagem,
                imagemAlt,
                noindex,
                revisadoEm,
              },
        ),
      });
      const data = (await response.json()) as { ok: boolean; message?: string; errors?: Record<string, string> };
      setBusy(false);
      if (!data.ok) {
        setErros(data.errors ?? {});
        if (!data.errors) setErro(data.message ?? "Não foi possível salvar.");
        return;
      }
      onSaved(data.message ?? "Salvo.");
    } catch {
      setBusy(false);
      setErro("Sem conexão com o servidor.");
    }
  }

  async function enviarImagem(file: File) {
    setBusy(true);
    setErro("");
    const body = new FormData();
    body.append("arquivo", file);
    try {
      const response = await fetch("/api/admin/midia", { method: "POST", body });
      const data = (await response.json()) as { ok: boolean; url?: string; message?: string };
      setBusy(false);
      if (!data.ok || !data.url) {
        setErro(data.message ?? "Não foi possível enviar a imagem.");
        return;
      }
      setImagem(data.url);
    } catch {
      setBusy(false);
      setErro("Sem conexão com o servidor.");
    }
  }

  return (
    <>
      <button type="button" className={styles.backdrop} aria-label="Fechar" onClick={onClose} />
      <aside className={styles.drawer} aria-label={`Metadados de ${page.path}`}>
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Editar Meta</p>
            <h2>
              <code>{page.path}</code>
            </h2>
            {page.editedAt && (
              <p className={styles.hint}>
                Última edição por {page.editedBy ?? "alguém do time"} em{" "}
                {new Date(page.editedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.group}>
            <h3>Busca do Google</h3>

            <label className={styles.field}>
              <span>
                Título
                <em data-alerta={tituloFinal.length > TITLE_IDEAL || undefined}>
                  {tituloFinal.length}/{TITLE_IDEAL}
                </em>
              </span>
              <input
                type="text"
                value={titulo}
                placeholder={page.defaultTitle}
                onChange={(event) => setTitulo(event.target.value)}
                aria-invalid={erros.titulo ? true : undefined}
              />
              {erros.titulo && <small className={styles.erro}>{erros.titulo}</small>}
              <small>
                Comece pelo termo que a pessoa busca. O sufixo &quot;| PitchYes&quot; é acrescentado sozinho.
              </small>
            </label>

            <label className={styles.field}>
              <span>
                Descrição
                <em data-alerta={descricaoFinal.length < DESCRIPTION_MIN || descricaoFinal.length > DESCRIPTION_MAX || undefined}>
                  {descricaoFinal.length}/{DESCRIPTION_MIN}–{DESCRIPTION_MAX}
                </em>
              </span>
              <textarea
                rows={3}
                value={descricao}
                placeholder={page.defaultDescription}
                onChange={(event) => setDescricao(event.target.value)}
                aria-invalid={erros.descricao ? true : undefined}
              />
              {erros.descricao && <small className={styles.erro}>{erros.descricao}</small>}
              <small>Entre 120 e 160 caracteres, com a proposta de valor e uma razão para clicar.</small>
            </label>

            <div className={styles.preview} aria-label="Prévia do resultado de busca">
              <p className={styles.previewUrl}>pitchyes.com.br{page.path === "/" ? "" : page.path}</p>
              <p className={styles.previewTitle}>{tituloFinal} | PitchYes</p>
              <p className={styles.previewDescription}>{descricaoFinal}</p>
            </div>
          </section>

          <section className={styles.group}>
            <h3>Compartilhamento em redes e mensageiros</h3>

            <label className={styles.field}>
              <span>Imagem (1200 × 630)</span>
              <div className={styles.imagem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagem || defaultImage} alt="" />
                <div>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void enviarImagem(file);
                    }}
                  />
                  <p className={styles.hint}>
                    {imagem ? "Imagem própria desta página." : "Usando a imagem padrão do site."}
                  </p>
                  {imagem && (
                    <button type="button" className={styles.linkButton} onClick={() => setImagem("")}>
                      Voltar para a padrão
                    </button>
                  )}
                </div>
              </div>
              {erros.imagem && <small className={styles.erro}>{erros.imagem}</small>}
            </label>

            <label className={styles.field}>
              <span>Texto alternativo da imagem</span>
              <input type="text" value={imagemAlt} onChange={(event) => setImagemAlt(event.target.value)} />
            </label>

            <label className={styles.field}>
              <span>Título nas redes</span>
              <input
                type="text"
                value={ogTitulo}
                placeholder={`${tituloFinal} | PitchYes`}
                onChange={(event) => setOgTitulo(event.target.value)}
              />
              <small>Em branco, usa o título da busca.</small>
            </label>

            <label className={styles.field}>
              <span>Descrição nas redes</span>
              <textarea
                rows={2}
                value={ogDescricao}
                placeholder={descricaoFinal}
                onChange={(event) => setOgDescricao(event.target.value)}
              />
            </label>
          </section>

          <section className={styles.group}>
            <h3>Indexação</h3>

            <label className={styles.check}>
              <input
                type="checkbox"
                checked={noindex}
                disabled={page.placeholder}
                onChange={(event) => setNoindex(event.target.checked)}
              />
              <span>
                Manter esta página fora dos buscadores (noindex)
                {page.placeholder && <em> — já está fora por ser página sem conteúdo próprio.</em>}
              </span>
            </label>

            <label className={styles.field}>
              <span>Data da última revisão de conteúdo</span>
              <input
                type="date"
                value={revisadoEm}
                onChange={(event) => setRevisadoEm(event.target.value)}
                aria-invalid={erros.revisadoEm ? true : undefined}
              />
              {erros.revisadoEm && <small className={styles.erro}>{erros.revisadoEm}</small>}
              <small>Vira o &lt;lastmod&gt; do sitemap: diz ao Google quando vale reler a página.</small>
            </label>
          </section>
        </div>

        <footer className={styles.foot}>
          {erro && (
            <p className={styles.erro} role="status">
              {erro}
            </p>
          )}
          <div className={styles.botoes}>
            {page.edited && (
              <button type="button" className={buttonClass("ghost")} disabled={busy} onClick={() => salvar(true)}>
                Restaurar padrão
              </button>
            )}
            <button type="button" className={buttonClass("outline")} onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className={buttonClass("solid")} disabled={busy} onClick={() => salvar()}>
              {busy ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}
