import { getLeadForm, validateLead, type LeadValues } from "@/lib/leads";
import { saveLead } from "@/lib/leads-db";
import { saveSubscriber } from "@/lib/newsletter-db";

// Recebe os formulários do site. Hoje o envio só grava o lead (visível em /admin/leads);
// o encaminhamento para CRM/e-mail entra aqui depois, sem mexer no front.
// Nunca é cacheado: é sempre uma escrita.
export const dynamic = "force-dynamic";

const MAX_BODY = 16 * 1024;

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return Response.json({ ok: false, message: "Envio grande demais." }, { status: 413 });
  }

  let payload: { form?: unknown; values?: unknown };
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, message: "Envio inválido." }, { status: 400 });
  }

  const form = typeof payload.form === "string" ? getLeadForm(payload.form) : undefined;
  if (!form) {
    return Response.json({ ok: false, message: "Formulário desconhecido." }, { status: 400 });
  }

  const values = (payload.values ?? {}) as LeadValues;
  const result = validateLead(form, values);
  if (!result.ok) {
    return Response.json(
      { ok: false, errors: result.errors, message: "Confira os campos destacados." },
      { status: 422 },
    );
  }

  const sourceUrl = request.headers.get("referer") ?? undefined;
  const userAgent = request.headers.get("user-agent") ?? undefined;

  try {
    // A newsletter do rodapé tem tabela e tela próprias: não entra na Central de leads.
    if (form.storage === "newsletter") {
      await saveSubscriber({ email: result.values[form.identity.email], sourceUrl, userAgent });
    } else {
      await saveLead({ form, values: result.values, sourceUrl, userAgent });
    }
  } catch (error) {
    console.error("[leads] falha ao gravar", error);
    return Response.json(
      { ok: false, message: "Não conseguimos registrar seu contato agora. Tente novamente em instantes." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
