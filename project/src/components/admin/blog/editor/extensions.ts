import { mergeAttributes, Node } from "@tiptap/react";

// Nós próprios do editor do blog. Cada um grava HTML comum — o mesmo que o modo HTML
// mostra e que lib/blog/html.ts aceita e prepara para o site.

declare module "@tiptap/react" {
  interface Commands<ReturnType> {
    figure: {
      setFigure: (attrs: FigureAttrs) => ReturnType;
      updateFigure: (attrs: Partial<FigureAttrs>) => ReturnType;
    };
    video: { setVideo: (attrs: { src: string; title?: string }) => ReturnType };
    cta: { toggleCta: () => ReturnType };
    faq: { insertFaq: () => ReturnType };
  }
}

export type FigureAttrs = {
  src: string;
  alt: string;
  caption: string;
  width: number | null;
  height: number | null;
  size: "" | "pequena";
};

/**
 * Imagem com legenda: <figure><img alt …><figcaption>…</figcaption></figure>.
 * Nó atômico (a imagem não é editada por dentro): clicar seleciona; "Editar imagem"
 * na barra abre o diálogo com alt, legenda e tamanho. Aceita <img> solto ao colar HTML.
 */
export const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      width: { default: null },
      height: { default: null },
      size: { default: "" },
    };
  },

  parseHTML() {
    const fromImg = (img: HTMLImageElement | null, figure?: HTMLElement) => {
      if (!img) return false;
      return {
        src: img.getAttribute("src") ?? "",
        alt: img.getAttribute("alt") ?? "",
        caption: figure?.querySelector("figcaption")?.textContent?.trim() ?? "",
        width: Number(img.getAttribute("width")) || null,
        height: Number(img.getAttribute("height")) || null,
        size: (figure?.getAttribute("data-size") || img.getAttribute("data-size") || "") as FigureAttrs["size"],
      };
    };
    return [
      { tag: "figure", getAttrs: (el) => fromImg((el as HTMLElement).querySelector("img"), el as HTMLElement) },
      { tag: "img[src]", getAttrs: (el) => fromImg(el as HTMLImageElement) },
    ];
  },

  renderHTML({ node }) {
    const { src, alt, caption, width, height, size } = node.attrs as FigureAttrs;
    const img = ["img", { src, alt, ...(width ? { width } : {}), ...(height ? { height } : {}) }] as const;
    return caption
      ? ["figure", size ? { "data-size": size } : {}, img, ["figcaption", {}, caption]]
      : ["figure", size ? { "data-size": size } : {}, img];
  },

  addCommands() {
    return {
      setFigure:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
      updateFigure:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});

/** Converte link de YouTube (watch, youtu.be, shorts) ou Vimeo no endereço de incorporação. */
export function toEmbedUrl(url: string): string | null {
  const trimmed = url.trim();
  const yt =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([A-Za-z0-9_-]{11})/.exec(trimmed);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = /vimeo\.com\/(?:video\/)?(\d+)/.exec(trimmed);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

/** Vídeo incorporado: <div data-youtube-video><iframe src="…/embed/ID"></iframe></div>. */
export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return { src: { default: "" }, title: { default: "Vídeo" } };
  },

  parseHTML() {
    const attrs = (iframe: Element | null) => {
      const src = iframe ? toEmbedUrl(iframe.getAttribute("src") ?? "") : null;
      return src ? { src, title: iframe?.getAttribute("title") || "Vídeo" } : false;
    };
    return [
      { tag: "div[data-youtube-video]", getAttrs: (el) => attrs((el as HTMLElement).querySelector("iframe")) },
      { tag: "iframe[src]", getAttrs: (el) => attrs(el as HTMLElement) },
    ];
  },

  renderHTML({ node }) {
    return [
      "div",
      { "data-youtube-video": "" },
      ["iframe", { src: node.attrs.src, title: node.attrs.title, allowfullscreen: "true", width: "640", height: "360" }],
    ];
  },

  addCommands() {
    return {
      setVideo:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});

/** Faixa de chamada no meio do texto: <div data-cta>…</div> (o link vira botão no site). */
export const Cta = Node.create({
  name: "cta",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "div[data-cta]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-cta": "" }), 0];
  },

  addCommands() {
    return {
      toggleCta:
        () =>
        ({ commands }) =>
          commands.toggleWrap(this.name),
    };
  },
});

/** Perguntas frequentes: <div data-faq><h3>Pergunta</h3><p>Resposta</p>…</div> → schema FAQPage. */
export const Faq = Node.create({
  name: "faq",
  group: "block",
  content: "block+",
  defining: true,

  parseHTML() {
    return [{ tag: "div[data-faq]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-faq": "" }), 0];
  },

  addCommands() {
    return {
      insertFaq:
        () =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            content: [
              { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Perguntas frequentes" }] },
              { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "Pergunta?" }] },
              { type: "paragraph", content: [{ type: "text", text: "Resposta objetiva no primeiro parágrafo." }] },
            ],
          }),
    };
  },
});
