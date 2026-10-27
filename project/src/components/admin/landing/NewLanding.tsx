"use client";

import { useRouter } from "next/navigation";
import { LandingForm } from "./LandingForm";

// Criar página: o formulário vazio; ao criar, abre o editor visual da página nova.
export function NewLanding() {
  const router = useRouter();
  return (
    <LandingForm
      modo="criar"
      inicial={{ nome: "", slug: "", seoTitle: "", seoDescription: "" }}
      onPronto={(json) => {
        if (json.pagina) router.push(`/admin/landing-pages/${json.pagina.id}/editar`);
      }}
    />
  );
}
