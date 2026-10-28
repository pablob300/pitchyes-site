import type { Client } from "@/content/clients";
import { FIXED_FIRST_SECTION, type HomeContent, type SectionKey } from "@/content/home.schema";
import { CaseHighlight } from "./CaseHighlight";
import { ClientLogos } from "./ClientLogos";
import { CustomerVideos } from "./CustomerVideos";
import { Faq } from "./Faq";
import { Hero } from "./Hero";
import { Latency } from "./Latency";
import { Platform } from "./Platform";
import { Rollout } from "./Rollout";
import { Security } from "./Security";
import { UseCases } from "./UseCases";

// O corpo da página inicial, usado por DUAS rotas: a pública (app/(site)/page.tsx, em
// cache) e a do editor (app/(editor)/..., dinâmica, com o rascunho). É o que garante que
// o editor mostra exatamente o site, e não uma imitação dele.
//
// A ordem sai de content.sections. Seção oculta simplesmente não é renderizada — nunca
// escondida por CSS: display:none e visibility:hidden tiram o texto do que o robô lê
// (SEO.md §9.1, o erro que já custou 651 palavras nesta home).

export function HomePage({
  content,
  clients,
  editable,
}: {
  content: HomeContent;
  clients: Client[];
  editable?: boolean;
}) {
  const section = (key: SectionKey) => {
    switch (key) {
      case "hero":
        return <Hero key={key} content={content.hero} editable={editable} />;
      case "clientLogos":
        return (
          <ClientLogos
            key={key}
            content={content.clientLogos}
            clients={clients}
            editable={editable}
          />
        );
      case "platform":
        return <Platform key={key} content={content.platform} editable={editable} />;
      case "latency":
        return <Latency key={key} content={content.latency} editable={editable} />;
      case "caseHighlight":
        return <CaseHighlight key={key} content={content.caseHighlight} editable={editable} />;
      case "testimonials":
        // O carrossel é "use client": só viajam os campos que ele desenha. `seconds` e
        // `published` ficam no servidor, onde alimentam o VideoObject do JSON-LD.
        return (
          <CustomerVideos
            key={key}
            content={{
              eyebrow: content.testimonials.eyebrow,
              title: content.testimonials.title,
              lead: content.testimonials.lead,
              items: content.testimonials.items.map(
                ({ company, videoId, thumb, person, role, headline, quote }) => ({
                  company,
                  videoId,
                  thumb,
                  person,
                  role,
                  headline,
                  quote,
                }),
              ),
            }}
            editable={editable}
          />
        );
      case "rollout":
        return <Rollout key={key} content={content.rollout} editable={editable} />;
      case "security":
        return <Security key={key} content={content.security} editable={editable} />;
      case "useCases":
        return <UseCases key={key} content={content.useCases} editable={editable} />;
      case "faq":
        return <Faq key={key} content={content.faq} editable={editable} />;
    }
  };

  return <>{visibleSections(content).map(section)}</>;
}

/**
 * Ordem final das seções. O hero é trazido para o topo e nunca some: é ele que carrega o
 * único <h1> da página, e uma home sem h1 quebra a regra do SEO.md §1.2.
 */
export function visibleSections(content: HomeContent): SectionKey[] {
  const keys = content.sections.filter((s) => !s.hidden).map((s) => s.key);
  return [FIXED_FIRST_SECTION, ...keys.filter((key) => key !== FIXED_FIRST_SECTION)];
}
