"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { useEffect, useState } from "react";
import { Dialog } from "@/components/admin/ui/Dialog";
import { buttonClass } from "@/components/ui/Button";
import { Cta, Faq, Figure, toEmbedUrl, Video, type FigureAttrs } from "./extensions";
import { LinkDialog } from "./LinkDialog";
import { MediaDialog } from "./MediaDialog";
import styles from "./Editor.module.css";

// Editor do corpo do artigo, no estilo do WordPress: modo Visual (TipTap) e modo HTML para
// ajuste fino. Os dois trabalham sobre o mesmo HTML; voltar do HTML para o Visual passa o
// texto pelo esquema do editor (o que ele não conhece some — o servidor sanitiza de novo
// ao salvar, então nada perigoso chega ao site de qualquer jeito).

/** Quebra de linha depois dos blocos, para o modo HTML ficar legível. */
export function formatHtml(html: string): string {
  return html
    .replace(/>\s+</g, "><")
    .replace(/(<\/(?:p|h[1-6]|li|blockquote|figure|figcaption|div|table|thead|tbody|tr|pre|ul|ol)>)/g, "$1\n")
    .replace(/(<(?:ul|ol|table|thead|tbody|tr|blockquote|div[^>]*|figure[^>]*)>)/g, "$1\n")
    .replace(/(<hr\s*\/?>)/g, "$1\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

type Mode = "visual" | "html";

export function RichEditor({
  initialHtml,
  onChange,
  onReady,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  onReady?: (editor: Editor) => void;
}) {
  const [mode, setMode] = useState<Mode>("visual");
  const [source, setSource] = useState("");
  const [dialog, setDialog] = useState<null | "link" | "imagem" | "editar-imagem" | "video">(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https", HTMLAttributes: { rel: null, target: null } },
      }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({ placeholder: "Comece a escrever. Use H2 para as seções e H3 para os subtítulos." }),
      CharacterCount,
      Figure,
      Video,
      Cta,
      Faq,
    ],
    content: initialHtml,
    editorProps: { attributes: { class: styles.prose, "aria-label": "Texto do artigo" } },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  useEffect(() => {
    if (editor && onReady) onReady(editor);
  }, [editor, onReady]);

  if (!editor) return <div className={styles.editorShell}>Carregando editor…</div>;

  // Estado da barra lido direto do editor: o componente re-renderiza a cada transação
  // (shouldRerenderOnTransaction), então os botões ativos acompanham o cursor.
  const words = (editor.storage as { characterCount?: { words: () => number } }).characterCount?.words() ?? 0;
  const state = {
    block: editor.isActive("heading", { level: 2 })
      ? "h2"
      : editor.isActive("heading", { level: 3 })
        ? "h3"
        : editor.isActive("heading", { level: 4 })
          ? "h4"
          : "p",
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    underline: editor.isActive("underline"),
    strike: editor.isActive("strike"),
    link: editor.isActive("link"),
    bullet: editor.isActive("bulletList"),
    ordered: editor.isActive("orderedList"),
    quote: editor.isActive("blockquote"),
    code: editor.isActive("codeBlock"),
    table: editor.isActive("table"),
    figure: editor.isActive("figure"),
    cta: editor.isActive("cta"),
    words,
    canUndo: editor.can().undo(),
    canRedo: editor.can().redo(),
  };

  function switchMode(next: Mode) {
    if (!editor || next === mode) return;
    if (next === "html") {
      setSource(formatHtml(editor.getHTML()));
    } else {
      editor.commands.setContent(source, { emitUpdate: true });
    }
    setMode(next);
  }

  const figureAttrs = state.figure ? (editor.getAttributes("figure") as FigureAttrs) : null;

  const tool = (label: string, active: boolean, run: () => void, text: React.ReactNode, disabled = false) => (
    <button
      type="button"
      className={styles.tool}
      aria-label={label}
      title={label}
      aria-pressed={active}
      disabled={disabled || mode === "html"}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    >
      {text}
    </button>
  );

  const chain = () => editor.chain().focus();

  return (
    <div className={styles.editorShell}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatação">
        <select
          className={styles.blockSelect}
          aria-label="Tipo de bloco"
          value={state.block}
          disabled={mode === "html"}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "p") chain().setParagraph().run();
            else chain().toggleHeading({ level: Number(value[1]) as 2 | 3 | 4 }).run();
          }}
        >
          <option value="p">Parágrafo</option>
          <option value="h2">Título H2</option>
          <option value="h3">Subtítulo H3</option>
          <option value="h4">Subtítulo H4</option>
        </select>
        <span className={styles.sep} />
        {tool("Negrito (Ctrl+B)", state.bold, () => chain().toggleBold().run(), <strong>B</strong>)}
        {tool("Itálico (Ctrl+I)", state.italic, () => chain().toggleItalic().run(), <em>I</em>)}
        {tool("Sublinhado (Ctrl+U)", state.underline, () => chain().toggleUnderline().run(), <u>U</u>)}
        {tool("Tachado", state.strike, () => chain().toggleStrike().run(), <s>S</s>)}
        {tool("Link (Ctrl+K)", state.link, () => setDialog("link"), "🔗")}
        <span className={styles.sep} />
        {tool("Lista com marcadores", state.bullet, () => chain().toggleBulletList().run(), "• Lista")}
        {tool("Lista numerada", state.ordered, () => chain().toggleOrderedList().run(), "1. Lista")}
        {tool("Citação", state.quote, () => chain().toggleBlockquote().run(), "❝")}
        {tool("Código", state.code, () => chain().toggleCodeBlock().run(), "</>")}
        {tool("Linha separadora", false, () => chain().setHorizontalRule().run(), "―")}
        <span className={styles.sep} />
        {tool("Imagem", false, () => setDialog("imagem"), "Imagem")}
        {figureAttrs && tool("Editar imagem selecionada", true, () => setDialog("editar-imagem"), "Editar imagem")}
        {tool("Vídeo do YouTube ou Vimeo", false, () => {
          setVideoUrl("");
          setVideoError("");
          setDialog("video");
        }, "Vídeo")}
        {tool("Tabela", state.table, () => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), "Tabela", state.table)}
        {tool("Faixa de chamada (CTA)", state.cta, () => chain().toggleCta().run(), "CTA")}
        {tool("Perguntas frequentes (gera o schema FAQ)", false, () => chain().insertFaq().run(), "FAQ")}
        <span className={styles.sep} />
        {tool("Desfazer (Ctrl+Z)", false, () => chain().undo().run(), "↶", !state.canUndo)}
        {tool("Refazer (Ctrl+Shift+Z)", false, () => chain().redo().run(), "↷", !state.canRedo)}
        {tool("Limpar formatação", false, () => chain().unsetAllMarks().clearNodes().run(), "Limpar")}

        <div className={styles.modeSwitch} role="tablist" aria-label="Modo de edição">
          <button type="button" role="tab" aria-selected={mode === "visual"} onClick={() => switchMode("visual")}>
            Visual
          </button>
          <button type="button" role="tab" aria-selected={mode === "html"} onClick={() => switchMode("html")}>
            HTML
          </button>
        </div>
      </div>

      {state.table && mode === "visual" && (
        <div className={styles.subToolbar} aria-label="Tabela">
          <span className={styles.hint}>Tabela:</span>
          <button type="button" onClick={() => chain().addRowAfter().run()}>+ linha</button>
          <button type="button" onClick={() => chain().addColumnAfter().run()}>+ coluna</button>
          <button type="button" onClick={() => chain().deleteRow().run()}>− linha</button>
          <button type="button" onClick={() => chain().deleteColumn().run()}>− coluna</button>
          <button type="button" onClick={() => chain().toggleHeaderRow().run()}>Cabeçalho</button>
          <button type="button" onClick={() => chain().deleteTable().run()}>Excluir tabela</button>
        </div>
      )}

      <div hidden={mode !== "visual"}>
        <EditorContent editor={editor} />
      </div>
      {mode === "html" && (
        <textarea
          className={styles.source}
          value={source}
          spellCheck={false}
          aria-label="HTML do artigo"
          onChange={(e) => {
            setSource(e.target.value);
            onChange(e.target.value);
          }}
        />
      )}

      <div className={styles.statusBar}>
        <span>{state.words} palavras</span>
        <span>{mode === "html" ? "Editando o HTML: volte ao Visual para ver o resultado." : "Ctrl+K cria link · arraste imagens e vídeos para mover"}</span>
      </div>

      {dialog === "link" && (
        <LinkDialog
          initialHref={(editor.getAttributes("link").href as string | undefined) ?? ""}
          onClose={() => setDialog(null)}
          onApply={(href) => {
            const { empty } = editor.state.selection;
            if (empty && !state.link) chain().insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] }).run();
            else chain().extendMarkRange("link").setLink({ href }).run();
            setDialog(null);
          }}
          onRemove={() => {
            chain().extendMarkRange("link").unsetLink().run();
            setDialog(null);
          }}
        />
      )}
      {dialog === "imagem" && (
        <MediaDialog
          onClose={() => setDialog(null)}
          onPick={(image) => {
            chain().setFigure({ ...image, size: "" }).run();
            setDialog(null);
          }}
        />
      )}
      {dialog === "editar-imagem" && figureAttrs && (
        <MediaDialog
          title="Editar imagem"
          initial={figureAttrs}
          onClose={() => setDialog(null)}
          onPick={(image) => {
            chain().updateFigure(image).run();
            setDialog(null);
          }}
        />
      )}
      {dialog === "video" && (
        <VideoDialog
          url={videoUrl}
          error={videoError}
          onUrl={setVideoUrl}
          onClose={() => setDialog(null)}
          onApply={(title) => {
            const src = toEmbedUrl(videoUrl);
            if (!src) {
              setVideoError("Cole o link de um vídeo do YouTube ou do Vimeo.");
              return;
            }
            chain().setVideo({ src, title: title || "Vídeo" }).run();
            setDialog(null);
          }}
        />
      )}
    </div>
  );
}

function VideoDialog({
  url,
  error,
  onUrl,
  onClose,
  onApply,
}: {
  url: string;
  error: string;
  onUrl: (value: string) => void;
  onClose: () => void;
  onApply: (title: string) => void;
}) {
  const [title, setTitle] = useState("");
  return (
    <Dialog
      title="Inserir vídeo"
      onClose={onClose}
      footer={
        <>
          <button type="button" className={buttonClass("ghost")} onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className={buttonClass("solid")} onClick={() => onApply(title)}>
            Inserir vídeo
          </button>
        </>
      }
    >
      <div className={styles.dialogBody}>
        <label className={styles.field}>
          <span>Link do YouTube ou Vimeo</span>
          <input className={styles.input} value={url} onChange={(e) => onUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" />
        </label>
        <label className={styles.field}>
          <span>Título do vídeo (leitor de tela e SEO)</span>
          <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Demonstração da IA de voz atendendo uma clínica" />
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
