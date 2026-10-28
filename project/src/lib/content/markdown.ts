import type { Block, PageContent } from "@/content/types";
import { toPlainText } from "@/lib/content/richtext";
import { absoluteUrl } from "@/lib/sitemap";

// Página interna → Markdown, para o /llms-full.txt. É o mesmo conteúdo que a página
// desenha (código + edição publicada), em texto corrido: o formato que um modelo lê e
// cita sem precisar interpretar HTML. Formulário e imagem entram só pelo que dizem.

const plain = (text: string) => toPlainText(text).replace(/\s+/g, " ").trim();
const link = (href: string) => (href.startsWith("/") ? absoluteUrl(href) : href);

function block(b: Block): string {
  const heading = (title?: string, lead?: string) =>
    [title ? `### ${plain(title)}` : "", lead ? plain(lead) : ""].filter(Boolean).join("\n\n");

  switch (b.kind) {
    case "prose":
      return [heading(b.title), ...b.paragraphs.map(plain)].filter(Boolean).join("\n\n");
    case "features":
      return [heading(b.title, b.lead), b.items.map((i) => `- **${plain(i.title)}**: ${plain(i.text)}`).join("\n")].join("\n\n");
    case "steps":
      return [heading(b.title, b.lead), b.steps.map((s, i) => `${i + 1}. **${plain(s.title)}** (${plain(s.label)}): ${plain(s.text)}`).join("\n")].join("\n\n");
    case "stats":
      return [heading(b.title, b.lead), b.items.map((i) => `- ${plain(i.value)} ${plain(i.label)}`).join("\n")].join("\n\n");
    case "checklist":
      return [heading(b.title, b.lead), b.items.map((i) => `- ${plain(i)}`).join("\n")].join("\n\n");
    case "cases":
      return [
        heading(b.title, b.lead),
        b.items
          .map((i) => `- **${plain(i.company)}** (${plain(i.sector)}): ${plain(i.headline)}${i.quote ? ` — "${plain(i.quote)}"${i.person ? `, ${plain(i.person)}` : ""}` : ""}`)
          .join("\n"),
      ].join("\n\n");
    case "timeline":
      // Novidades de modelo (datas e textos ainda não reais) não vão para as IAs.
      if (b.sample) return "";
      return [
        heading(b.title, b.lead),
        [...b.items]
          .sort((x, y) => y.date.localeCompare(x.date))
          .map((i) => `- **${i.date} — ${plain(i.title)}**: ${plain(i.text)}`)
          .join("\n"),
      ].join("\n\n");
    case "caseStories":
      return [heading(b.title, b.lead), ...b.items.map((i) => [`#### ${plain(i.title)}`, ...i.paragraphs.map(plain)].join("\n\n"))]
        .filter(Boolean)
        .join("\n\n");
    case "logos":
      return [heading(b.title, b.lead), b.items.map((i) => i.name).join(", ") + "."].join("\n\n");
    case "pricing":
      return [
        heading(b.title, b.lead),
        b.plans
          .map((p) => `- **${plain(p.name)}** (${plain(p.audience)}): ${plain(p.price)}${p.priceUnit ? ` ${plain(p.priceUnit)}` : ""}; ${plain(p.fee)}. Inclui: ${p.features.map(plain).join("; ")}.`)
          .join("\n"),
        b.note ? plain(b.note) : "",
      ]
        .filter(Boolean)
        .join("\n\n");
    case "table":
      return [
        heading(b.title, b.lead),
        `| Item | ${b.columns.join(" | ")} |\n| --- | ${b.columns.map(() => "---").join(" | ")} |`,
        ...b.groups.map((g) => [`| **${plain(g.title)}** | ${b.columns.map(() => "").join(" | ")} |`, ...g.rows.map((r) => `| ${plain(r.label)} | ${r.values.map(plain).join(" | ")} |`)].join("\n")),
      ].join("\n");
    case "contact":
      return [
        heading(b.title),
        ...(b.benefits ?? []).map((x) => `- ${plain(x)}`),
        b.channels.map((c) => `- ${plain(c.label)}: ${plain(c.value)}${c.hint ? ` (${plain(c.hint)})` : ""}`).join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n");
    case "faq":
      return [heading(b.title), b.items.map((i) => `**${plain(i.q)}**\n${plain(i.a)}`).join("\n\n")].join("\n\n");
    case "image":
      return b.caption ? plain(b.caption) : "";
    case "links":
      return [heading(b.title, b.lead), b.items.map((i) => `- [${plain(i.title)}](${link(i.href)}): ${plain(i.text)}`).join("\n")].join("\n\n");
    // Blocos das landing pages: elas não entram no /llms-full.txt (texto de campanha, com
    // números ainda sem fonte — lib/content/claims.ts).
    default:
      return "";
  }
}

export function pageToMarkdown(path: string, content: PageContent): string {
  return [
    `## ${plain(content.h1)}`,
    `Endereço: ${absoluteUrl(path)}`,
    plain(content.lead),
    ...content.blocks.map(block).filter(Boolean),
  ].join("\n\n");
}
