"use client";

import { useId, useState } from "react";
import type { Field } from "@/lib/content/schema/types";
import styles from "./ContentEditor.module.css";

// Um campo da gaveta, desenhado a partir do schema. Não existe formulário escrito à mão
// por seção: tudo o que aparece aqui saiu de lib/content/schema.

export function FieldInput({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = useId();
  const text = typeof value === "string" ? value : value === undefined ? "" : String(value);
  const long = field.max ? text.length > field.max : false;
  const empty = !field.optional && text.trim() === "" && field.type !== "booleano";

  return (
    <div className={styles.campo}>
      <label htmlFor={id}>
        {field.label}
        {field.max && (
          <em data-alerta={long || undefined}>
            {text.length}/{field.max}
          </em>
        )}
      </label>

      {field.type === "booleano" ? (
        <label className={styles.check}>
          <input
            id={id}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.help ?? "Ativado"}</span>
        </label>
      ) : field.type === "paragrafo" ? (
        <RichText id={id} value={text} onChange={onChange} invalid={empty} />
      ) : field.type === "imagem" ? (
        <ImageInput id={id} value={text} aspect={field.aspect} onChange={onChange} />
      ) : (
        <input
          id={id}
          type={field.type === "data" ? "date" : field.type === "numero" ? "number" : "text"}
          value={text}
          aria-invalid={empty || undefined}
          onChange={(e) =>
            onChange(field.type === "numero" ? Number(e.target.value) : e.target.value)
          }
        />
      )}

      {empty && <p className={styles.erro}>Este campo não pode ficar vazio.</p>}
      {field.help && field.type !== "booleano" && <small>{field.help}</small>}
    </div>
  );
}

/**
 * Parágrafo com formatação limitada.
 *
 * O texto é guardado em um subconjunto de markdown (**negrito**, *itálico*,
 * [texto](/caminho)) e convertido em elementos React na renderização. Não existe HTML de
 * usuário em lugar nenhum, então não há o que sanitizar nem por onde injetar.
 */
function RichText({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const wrap = (before: string, after = before) => {
    const el = document.getElementById(id) as HTMLTextAreaElement | null;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end) || "texto";
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  return (
    <>
      <div className={styles.formatacao}>
        <button type="button" onClick={() => wrap("**")} title="Negrito">
          <strong>N</strong>
        </button>
        <button type="button" onClick={() => wrap("*")} title="Itálico">
          <em>I</em>
        </button>
        <button type="button" onClick={() => wrap("[", "](/)")} title="Link">
          link
        </button>
      </div>
      <textarea
        id={id}
        rows={4}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </>
  );
}

function ImageInput({
  id,
  value,
  aspect,
  onChange,
}: {
  id: string;
  value: string;
  aspect?: number;
  onChange: (value: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setErro(null);
    try {
      const form = new FormData();
      form.append("arquivo", file);
      form.append("pasta", "conteudo");
      const response = await fetch("/api/admin/midia", { method: "POST", body: form });
      const json = (await response.json()) as { ok: boolean; url?: string; message?: string };
      if (!json.ok || !json.url) throw new Error(json.message ?? "Falha ao enviar.");
      onChange(json.url);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Falha ao enviar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.imagem}>
      {value ? (
        /* Prévia dentro da gaveta, não imagem do site: sem otimizador e sem dimensões
           fixas de propósito — serve para conferir o arquivo escolhido. */
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Prévia da imagem escolhida" style={{ aspectRatio: aspect ?? 1 }} />
      ) : (
        <p className={styles.semImagem}>Nenhuma imagem escolhida.</p>
      )}
      <input
        id={id}
        type="text"
        value={value}
        placeholder="/images/… ou /midia/…"
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      {busy && <small>Enviando…</small>}
      {erro && <p className={styles.erro}>{erro}</p>}
    </div>
  );
}
