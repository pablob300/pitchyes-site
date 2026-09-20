import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proteção da área interna (/admin/*): autenticação básica com a senha guardada no
// segredo ADMIN_PASSWORD do Worker (`npx wrangler secret put ADMIN_PASSWORD`).
// Sem o segredo configurado, a área fica fechada — nunca aberta por engano.
// A área guarda dados pessoais de leads: não pode ficar pública (ver /privacidade).

const REALM = 'Basic realm="PitchYes — área interna", charset="UTF-8"';

function unauthorized(message = "Área restrita.") {
  return new NextResponse(message, {
    status: 401,
    headers: { "WWW-Authenticate": REALM, "cache-control": "no-store" },
  });
}

// Comparação em tempo constante, para a resposta não entregar o tamanho/prefixo da senha.
function sameSecret(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function proxy(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) {
    return new NextResponse(
      "Área interna sem senha configurada. Defina o segredo ADMIN_PASSWORD no Worker.",
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }
  const password = decoded.slice(decoded.indexOf(":") + 1);
  if (!sameSecret(password, expected)) return unauthorized("Senha incorreta.");

  const response = NextResponse.next();
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-robots-tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: "/admin/:path*" };
