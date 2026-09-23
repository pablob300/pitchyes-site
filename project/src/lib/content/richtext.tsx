import { Fragment, type ReactNode } from "react";
import Link from "next/link";

// Formatação limitada dentro de um parágrafo: **negrito**, *itálico* e [texto](/caminho).
//
// O texto é guardado nessa sintaxe e vira ELEMENTOS REACT aqui. Em nenhum momento existe
// HTML vindo do painel, então não há `dangerouslySetInnerHTML`, não há o que sanitizar e
// não há por onde injetar script. Escrever `<script>` num campo produz, no máximo, a
// palavra "<script>" na tela.

const PATTERN = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

/** Só caminho interno ou https: link para javascript: ou data: nunca é montado. */
function safeHref(href: string): string | null {
  const value = href.trim();
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("https://")) return value;
  return null;
}

/** Converte o texto em elementos. Serve para qualquer campo de parágrafo do editor. */
export function rich(text: string): ReactNode {
  if (!text.includes("*") && !text.includes("[")) return text;

  return text.split(PATTERN).map((part, i) => {
    if (!part) return null;
    const key = `${i}-${part.slice(0, 8)}`;

    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = safeHref(link[2]);
      // Endereço recusado: fica só o texto, em vez de um link quebrado na página.
      if (!href) return <Fragment key={key}>{link[1]}</Fragment>;
      return href.startsWith("/") ? (
        <Link key={key} href={href}>
          {link[1]}
        </Link>
      ) : (
        <a key={key} href={href} target="_blank" rel="noopener">
          {link[1]}
        </a>
      );
    }

    return <Fragment key={key}>{part}</Fragment>;
  });
}

/**
 * O mesmo texto sem as marcas de formatação.
 *
 * Obrigatório antes de qualquer dado estruturado ou `<meta>`: a resposta da FAQ vai para
 * `FAQPage.acceptedAnswer.text`, e mandar `**` para o Google seria publicar a marcação
 * como se fosse o texto.
 */
export function toPlainText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
