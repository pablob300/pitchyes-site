import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Lead } from "./leads-db";

// Todo lead com telefone (formulário de contato e landing pages) dispara esse webhook, que
// gera a ligação da IA para o cliente. Roda em segundo plano (waitUntil): nunca atrasa nem
// derruba o envio do formulário — uma falha aqui só fica no log.

const WEBHOOK_URL = "https://apiv4.pitchyes.com.br/webhook/entrada-lead-atualizado";

async function inBackground(task: Promise<unknown>): Promise<void> {
  const safe = task.catch((error) => console.error("[leads] webhook da IA falhou", error));
  try {
    const { ctx } = await getCloudflareContext({ async: true });
    ctx.waitUntil(safe);
  } catch {
    await safe;
  }
}

async function send(lead: Lead): Promise<void> {
  const token = process.env.LEAD_WEBHOOK_TOKEN?.trim();
  if (!token) {
    console.error("[leads] LEAD_WEBHOOK_TOKEN não configurado no Worker; ligação da IA não disparada.");
    return;
  }
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({
      id: lead.id,
      formulario: lead.form,
      nome: lead.name,
      email: lead.email,
      telefone: lead.phone,
      empresa: lead.company,
      perfil: lead.profile,
      criado_em: lead.created_at,
      campos: lead.fields,
    }),
  });
  if (!response.ok) {
    console.error("[leads] webhook da IA recusou o lead", lead.id, response.status, await response.text());
  }
}

/** Dispara a ligação da IA. Só para leads com telefone — sem número não há para quem ligar. */
export function notifyLeadWebhook(lead: Lead): void {
  if (!lead.phone) return;
  void inBackground(send(lead));
}
