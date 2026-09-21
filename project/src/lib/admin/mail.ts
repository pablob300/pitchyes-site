import "server-only";

// Envio de e-mail da área interna. Provedor: Resend (https://resend.com).
//
// Enquanto o DNS de pitchyes.com.br não estiver sob nosso controle, o remetente
// definitivo não pode ser verificado. Por isso o modo é uma variável de ambiente,
// não código:
//
//   ADMIN_MAIL_MODE=live     remetente próprio (ADMIN_MAIL_FROM), domínio verificado
//   ADMIN_MAIL_MODE=test     remetente de teste da Resend (só entrega para o dono da conta)
//   ADMIN_MAIL_MODE=console  não chama a Resend: escreve no log do Worker (wrangler tail)
//
// Trocar para produção é mudar a variável no painel da Cloudflare — sem novo build.

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const TEST_FROM = "PitchYes <onboarding@resend.dev>";

type Mode = "live" | "test" | "console";

function mode(): Mode {
  const raw = process.env.ADMIN_MAIL_MODE?.trim() as Mode | undefined;
  if (raw === "live" || raw === "test" || raw === "console") return raw;
  return process.env.RESEND_API_KEY ? "test" : "console";
}

function sender(): string {
  const from = process.env.ADMIN_MAIL_FROM?.trim();
  return mode() === "live" && from ? from : TEST_FROM;
}

export type MailResult = { ok: boolean; id?: string; error?: string };

/**
 * Nunca lança: quem chama não pode quebrar o login por causa do provedor de e-mail,
 * e o erro do provedor jamais chega ao navegador (seria uma pista de que a conta existe).
 */
export async function sendAdminMail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (mode() === "console" || !key) {
    console.warn(`[admin-mail] modo console — e-mail NÃO enviado\npara: ${to}\nassunto: ${subject}\n${text}`);
    return { ok: true, id: "console" };
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ from: sender(), to: [to], subject, text, html }),
    });
    const data = (await response.json()) as { id?: string; message?: string; name?: string };
    if (!response.ok) {
      console.error("[admin-mail] recusado pela Resend", response.status, data?.name, data?.message);
      return { ok: false, error: data?.message ?? String(response.status) };
    }
    return { ok: true, id: data.id };
  } catch (error) {
    console.error("[admin-mail] falha ao enviar", error);
    return { ok: false, error: "rede" };
  }
}
