// Eventos para o Google Tag Manager (dataLayer). Só roda no navegador.
//
// O GTM é instalado pelo ID cadastrado em Configurações › Configuração geral; sem ele, o
// dataLayer existe do mesmo jeito (é só um array) e os eventos ficam esperando — nada quebra.

type DataLayerEvent = Record<string, unknown> & { event: string };

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
  }
}

export function pushEvent(event: DataLayerEvent): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(event);
}

/**
 * Evento "lead", disparado depois que o servidor ACEITA o envio de um formulário.
 * Vai só o que a pessoa preencheu entre nome, e-mail e telefone.
 * Quem chama decide se dispara: lead "Sem perfil" não dispara (lib/leads.ts, leadProfile).
 */
export function pushLead(data: LeadIdentity): void {
  pushEvent({ event: "lead", ...filled(data) });
}

/**
 * Evento "LigarAgora", o último do cadastro das landing pages: a pessoa salvou o número da
 * IA nos contatos e pediu a ligação (components/forms/PhoneConfirmDialog.tsx). Mesma regra
 * do "lead": quem chama não dispara para lead "Sem perfil".
 */
export function pushCallNow(data: LeadIdentity): void {
  pushEvent({ event: "LigarAgora", ...filled(data) });
}

type LeadIdentity = { nome?: string; email?: string; telefone?: string };

const filled = (data: LeadIdentity) => Object.fromEntries(Object.entries(data).filter(([, value]) => value?.trim()));
