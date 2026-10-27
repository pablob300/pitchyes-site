import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { getSiteSettings } from "@/lib/settings";

// Landing pages (/conteudo/<slug>): fora do grupo (site) de propósito — sem o cabeçalho, o
// rodapé e a faixa de CTA do site, que levariam o visitante para outras páginas. O topo e o
// rodapé próprios ficam em components/landing/LandingPage.tsx.
//
// O Google Tag Manager entra aqui como no site: é nas landing pages que a conversão importa.
export default async function LandingLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <>
      <GoogleTagManager id={settings.gtmId} />
      {children}
    </>
  );
}
