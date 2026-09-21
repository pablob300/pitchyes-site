import "server-only";
import { CODE_TTL_MINUTES, RESET_TTL_HOURS } from "./config";

// Textos dos e-mails do painel. HTML simples com estilo embutido: cliente de e-mail
// não lê variável CSS, então os valores da marca vão em hexadecimal mesmo.

const INK = "#151515";
const MUTED = "#6b6b6b";
const BORDER = "#e6e6e2";

function wrapper(title: string, body: string): string {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f9f9f4;padding:32px 16px;font-family:Inter,Helvetica,Arial,sans-serif;color:${INK}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" style="max-width:480px;background:#fff;border:1px solid ${BORDER};border-radius:12px;padding:32px">
      <tr><td>
        <p style="margin:0 0 24px;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:${MUTED}">PitchYes · Área interna</p>
        <h1 style="margin:0 0 16px;font-size:22px;line-height:1.25">${title}</h1>
        ${body}
        <p style="margin:32px 0 0;font-size:12px;color:${MUTED};border-top:1px solid ${BORDER};padding-top:16px">
          Mensagem automática do painel da PitchYes. Se não foi você, ignore este e-mail.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export function deviceCodeEmail(code: string, deviceLabel: string) {
  const text = `Seu código de acesso é ${code}.

Ele vale por ${CODE_TTL_MINUTES} minutos e foi pedido a partir de: ${deviceLabel}.
Se não foi você, ignore este e-mail e troque sua senha do painel.`;
  return {
    subject: `${code} é o seu código de acesso ao painel`,
    text,
    html: wrapper(
      "Confirme o acesso",
      `<p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:${MUTED}">
         Use o código abaixo para liberar este aparelho. Ele vale por ${CODE_TTL_MINUTES} minutos.
       </p>
       <p style="margin:0 0 20px;font-size:34px;font-weight:700;letter-spacing:.2em">${code}</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED}">Pedido a partir de: <strong style="color:${INK}">${deviceLabel}</strong>.</p>`,
    ),
  };
}

export function resetEmail(url: string) {
  const text = `Para definir uma nova senha do painel da PitchYes, abra:

${url}

O link vale por ${RESET_TTL_HOURS} horas e só pode ser usado uma vez.`;
  return {
    subject: "Definir a senha do painel da PitchYes",
    text,
    html: wrapper(
      "Definir sua senha",
      `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${MUTED}">
         Clique no botão para criar uma senha nova. O link vale por ${RESET_TTL_HOURS} horas e só funciona uma vez.
       </p>
       <p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;background:#f9a900;color:${INK};text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:6px">Definir senha</a></p>
       <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};word-break:break-all">${url}</p>`,
    ),
  };
}

export function inviteEmail(name: string, url: string) {
  const text = `${name}, você recebeu acesso ao painel da PitchYes.

Defina sua senha em: ${url}

O convite vale por 7 dias.`;
  return {
    subject: "Seu acesso ao painel da PitchYes",
    text,
    html: wrapper(
      `${name}, seu acesso está pronto`,
      `<p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:${MUTED}">
         Você recebeu acesso ao painel da PitchYes. Defina sua senha para entrar. O convite vale por 7 dias.
       </p>
       <p style="margin:0 0 24px"><a href="${url}" style="display:inline-block;background:#f9a900;color:${INK};text-decoration:none;font-weight:600;font-size:15px;padding:12px 20px;border-radius:6px">Definir senha</a></p>
       <p style="margin:0;font-size:13px;line-height:1.6;color:${MUTED};word-break:break-all">${url}</p>`,
    ),
  };
}
