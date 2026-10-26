"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { buttonClass } from "@/components/ui/Button";
import styles from "./Editor.module.css";

// Escolher imagem: enviar uma nova (vai para o R2 e para a biblioteca) ou reaproveitar
// uma da biblioteca. O texto alternativo é obrigatório (SEO.md §1.7): descreva o que a
// imagem mostra, ligado ao assunto do artigo.

export type PickedImage = { src: string; alt: string; caption: string; width: number | null; height: number | null };

type Media = { id: string; url: string; alt: string | null; caption: string | null; width: number | null; height: number | null };

export function MediaDialog({
  title = "Inserir imagem",
  withCaption = true,
  initial,
  onClose,
  onPick,
}: {
  title?: string;
  withCaption?: boolean;
  initial?: Partial<PickedImage>;
  onClose: () => void;
  onPick: (image: PickedImage) => void;
}) {
  const [tab, setTab] = useState<"enviar" | "biblioteca">(initial?.src ? "biblioteca" : "enviar");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.src ?? null);
  const [picked, setPicked] = useState<Media | null>(
    initial?.src ? { id: "", url: initial.src, alt: initial.alt ?? "", caption: initial.caption ?? "", width: initial.width ?? null, height: initial.height ?? null } : null,
  );
  const [alt, setAlt] = useState(initial?.alt ?? "");
  const [caption, setCaption] = useState(initial?.caption ?? "");
  const [library, setLibrary] = useState<Media[] | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (tab !== "biblioteca") return;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/admin/blog/midia?q=${encodeURIComponent(query)}`);
        const data = (await response.json()) as { ok: boolean; midias?: Media[] };
        setLibrary(data.midias ?? []);
      } catch {
        setLibrary([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [tab, query]);

  // Prévia do arquivo escolhido: um endereço local por vez, liberado ao trocar e ao fechar.
  const objectUrl = useRef<string | null>(null);
  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);
  function chooseFile(next: File | null) {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = next ? URL.createObjectURL(next) : null;
    setFile(next);
    setPreview(objectUrl.current);
  }

  async function confirm() {
    setError("");
    if (!alt.trim()) {
      setError("Escreva o texto alternativo: o que a imagem mostra.");
      return;
    }
    if (tab === "enviar") {
      if (!file) {
        setError("Escolha um arquivo.");
        return;
      }
      setBusy(true);
      const form = new FormData();
      form.set("arquivo", file);
      form.set("pasta", "blog");
      form.set("alt", alt);
      form.set("legenda", caption);
      try {
        const response = await fetch("/api/admin/midia", { method: "POST", body: form });
        const data = (await response.json()) as { ok: boolean; url?: string; largura?: number; altura?: number; message?: string };
        setBusy(false);
        if (!data.ok || !data.url) {
          setError(data.message ?? "Não foi possível enviar.");
          return;
        }
        onPick({ src: data.url, alt: alt.trim(), caption: caption.trim(), width: data.largura ?? null, height: data.altura ?? null });
      } catch {
        setBusy(false);
        setError("Sem conexão com o servidor.");
      }
      return;
    }
    if (!picked) {
      setError("Escolha uma imagem da biblioteca.");
      return;
    }
    // Atualiza o alt/legenda na biblioteca, para a próxima vez já vir preenchido.
    if (picked.id) {
      fetch("/api/admin/blog/midia", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: picked.id, alt, legenda: caption }),
      }).catch(() => undefined);
    }
    onPick({ src: picked.url, alt: alt.trim(), caption: caption.trim(), width: picked.width, height: picked.height });
  }

  return (
    <Dialog
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className={buttonClass("ghost")} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={buttonClass("solid")} onClick={confirm} disabled={busy}>
            {busy ? "Enviando…" : "Usar imagem"}
          </button>
        </>
      }
    >
      <div className={styles.dialogBody}>
        <div className={styles.segmented} role="tablist">
          <button type="button" role="tab" aria-selected={tab === "enviar"} onClick={() => setTab("enviar")}>
            Enviar
          </button>
          <button type="button" role="tab" aria-selected={tab === "biblioteca"} onClick={() => setTab("biblioteca")}>
            Biblioteca
          </button>
        </div>

        {tab === "enviar" ? (
          <label className={styles.field}>
            <span>Arquivo (JPG, PNG ou WebP, até 8 MB)</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => chooseFile(e.target.files?.[0] ?? null)} />
          </label>
        ) : (
          <>
            <input className={styles.input} placeholder="Buscar pelo texto alternativo ou legenda" value={query} onChange={(e) => setQuery(e.target.value)} />
            <div className={styles.library}>
              {library === null ? (
                <p className={styles.hint}>Carregando…</p>
              ) : library.length ? (
                library.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={styles.libraryItem}
                    aria-pressed={picked?.url === item.url}
                    onClick={() => {
                      setPicked(item);
                      setPreview(item.url);
                      setAlt(item.alt ?? "");
                      setCaption(item.caption ?? "");
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${item.url}?w=320`} alt={item.alt ?? ""} />
                  </button>
                ))
              ) : (
                <p className={styles.hint}>Nenhuma imagem na biblioteca.</p>
              )}
            </div>
          </>
        )}

        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.preview} src={preview.startsWith("/midia/") ? `${preview}?w=640` : preview} alt="" aria-hidden="true" />
        )}

        <label className={styles.field}>
          <span>Texto alternativo (obrigatório)</span>
          <input className={styles.input} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex.: Atendente acompanhando no painel as ligações feitas pela IA de voz" />
          <span className={styles.hint}>Descreva o que aparece na imagem, ligado ao assunto do artigo. Sem “imagem de”.</span>
        </label>
        {withCaption && (
          <label className={styles.field}>
            <span>Legenda (opcional, aparece abaixo da imagem)</span>
            <input className={styles.input} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </label>
        )}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
