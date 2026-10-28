import "server-only";
import type { PageContent } from "@/content/types";
import { faqItems } from "@/content/types";
import { toPlainText } from "@/lib/content/richtext";
import { getPage } from "@/lib/routes";
import { breadcrumbSchema, serviceSchema, softwareApplicationSchema, webPageSchema } from "@/lib/seo";
import { getSiteUrl } from "@/lib/site";

// JSON-LD das páginas internas, montado do MESMO conteúdo que a página desenha (código +
// edição publicada). Antes cada rota repetia o seu @graph à mão; aqui fica uma regra só:
// WebPage (com o tipo certo), BreadcrumbList pelos títulos de routes.ts, Service nas
// páginas de solução, FAQPage quando houver perguntas e os extras de /planos e /clientes.

type Thing = Record<string, unknown>;

/** Papel da página para o buscador. O resto é WebPage. */
const PAGE_TYPE: Record<string, string> = {
  "/sobre": "AboutPage",
  "/contato": "ContactPage",
  "/clientes": "CollectionPage",
  "/clientes/cases": "CollectionPage",
};

/** O que cada página de solução vende, em termos de busca. */
const SERVICE_TYPE: Record<string, string> = {
  "/solucoes": "Agentes de voz com IA para ligações ativas, receptivas e operacionais",
  "/solucoes/ativo": "Ligações ativas com IA de voz: prospecção, qualificação de leads, confirmação e cobrança",
  "/solucoes/receptivo": "Atendimento receptivo com IA de voz e substituição de URA",
  "/solucoes/operacional": "Ligações operacionais com IA de voz: cobrança, recuperação de carrinho, onboarding, avisos e pesquisas",
  "/solucoes/por-setor": "IA de voz para saúde, seguros, serviços financeiros, imobiliário, energia, tecnologia, automotivo e provedores de internet",
  "/solucoes/por-funcao": "IA de voz para vendas, atendimento, cobrança, agendamento e operações",
};

/** Início › página-mãe (quando existe em routes.ts) › página. Nomes curtos do menu. */
function trail(path: string, fallback: string) {
  const items = [{ name: "Início", path: "/" }];
  const parent = path.slice(0, path.lastIndexOf("/"));
  const parentPage = parent ? getPage(parent) : undefined;
  if (parentPage) items.push({ name: parentPage.title, path: parent });
  items.push({ name: getPage(path)?.title ?? fallback, path });
  return items;
}

/** "R$ 1.249" → 1249; sem número, sem oferta (não inventamos preço). */
function priceValue(price: string): number | null {
  const digits = price.replace(/[^\d,]/g, "").replace(",", ".");
  const value = Number.parseFloat(digits);
  return Number.isFinite(value) ? value : null;
}

function planOffers(content: PageContent, path: string): Thing[] {
  const url = new URL(path, getSiteUrl()).toString();
  return content.blocks.flatMap((block) =>
    block.kind === "pricing"
      ? block.plans.flatMap((plan) => {
          const price = priceValue(plan.price);
          if (price === null) return [];
          return [
            {
              "@type": "Offer",
              name: `Plano ${plan.name}`,
              description: toPlainText(`${plan.audience}. ${plan.fee}`),
              price,
              priceCurrency: "BRL",
              ...(plan.priceUnit ? { eligibleQuantity: { "@type": "QuantitativeValue", unitText: plan.priceUnit.replace(/^\//, "") } } : {}),
              url,
            },
          ];
        })
      : [],
  );
}

function clientList(content: PageContent): Thing | null {
  const names = content.blocks.flatMap((b) => (b.kind === "logos" ? b.items.map((i) => i.name) : []));
  if (!names.length) return null;
  return {
    "@type": "ItemList",
    name: "Empresas que usam a IA de voz da PitchYes",
    numberOfItems: names.length,
    itemListElement: names.map((name, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Organization", name },
    })),
  };
}

export function innerPageGraph(path: string, content: PageContent): Thing[] {
  const faq = faqItems(content);
  const serviceType = SERVICE_TYPE[path];
  const offers = path === "/planos" ? planOffers(content, path) : [];
  const clients = path === "/clientes" ? clientList(content) : null;

  return [
    webPageSchema({
      title: content.seoTitle,
      description: content.seoDescription,
      path,
      type: PAGE_TYPE[path],
      dateModified: getPage(path)?.updated,
      breadcrumb: true,
    }),
    breadcrumbSchema(trail(path, content.seoTitle)),
    ...(serviceType ? [serviceSchema({ name: content.seoTitle, description: content.seoDescription, path, serviceType })] : []),
    ...(offers.length ? [softwareApplicationSchema(offers)] : []),
    ...(clients ? [clients] : []),
    ...(faq.length
      ? [
          {
            "@type": "FAQPage",
            "@id": `${new URL(path, getSiteUrl()).toString()}#faq`,
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: toPlainText(item.q),
              acceptedAnswer: { "@type": "Answer", text: toPlainText(item.a) },
            })),
          },
        ]
      : []),
  ];
}
