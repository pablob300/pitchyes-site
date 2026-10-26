"use client";

import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { talkToAiHref } from "@/lib/routes";

// "Fale com nossa IA" do cabeçalho e da faixa final: no blog vai para /contato, no resto do
// site para o player da home (ver talkToAiHref em lib/routes.ts). Cliente só pelo usePathname.
export function TalkToAiButton(props: Omit<ComponentProps<typeof ButtonLink>, "href">) {
  return <ButtonLink href={talkToAiHref(usePathname())} {...props} />;
}
