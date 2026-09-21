import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PUBLIC_ADMIN_PATHS, SESSION_COOKIE, SESSION_RENEW_AFTER_HOURS, SESSION_TTL_DAYS } from "@/lib/admin/config";
import { readSessionCookie, signSessionCookie } from "@/lib/admin/cookie";
import { timingSafeEqual } from "@/lib/admin/crypto";

// Porta de entrada da área interna (/admin e /api/admin).
//
// Aqui a checagem é BARATA e OTIMISTA: confere a assinatura do cookie e o prazo,
// sem tocar no banco — o proxy roda em toda navegação, inclusive em prefetch.
// Quem decide se a sessão continua válida (revogada? usuário suspenso?) é o banco,
// em lib/admin/session.ts, chamado pelo layout do painel e por toda rota de API.
// Não mova essa decisão para cá "para ganhar desempenho": cookie assinado continua
// assinado depois de revogado.
//
// Os cabeçalhos de segurança também moram aqui: public/_headers só vale para
// arquivos estáticos e nunca alcança uma resposta gerada pelo Worker.

const REALM = 'Basic realm="PitchYes — área interna", charset="UTF-8"';

function harden(response: NextResponse): NextResponse {
  response.headers.set("cache-control", "no-store");
  response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  response.headers.set("x-frame-options", "DENY");
  response.headers.set("content-security-policy", "frame-ancestors 'none'");
  response.headers.set("referrer-policy", "no-referrer");
  response.headers.set("x-content-type-options", "nosniff");
  return response;
}

function unauthorizedBasic(message = "Área restrita.") {
  return harden(
    new NextResponse(message, { status: 401, headers: { "WWW-Authenticate": REALM } }) as NextResponse,
  );
}

/** Modo antigo, mantido como válvula de escape: volta a valer se ADMIN_AUTH_MODE=basic. */
function basicAuth(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD?.trim();
  if (!expected) {
    return harden(new NextResponse("Área interna sem senha configurada.", { status: 503 }) as NextResponse);
  }
  const header = request.headers.get("authorization") ?? "";
  const [scheme, encoded] = header.split(" ");
  if (scheme !== "Basic" || !encoded) return unauthorizedBasic();
  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorizedBasic();
  }
  const password = decoded.slice(decoded.indexOf(":") + 1);
  if (!timingSafeEqual(password, expected)) return unauthorizedBasic("Senha incorreta.");
  return harden(NextResponse.next());
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin");

  if (process.env.ADMIN_AUTH_MODE?.trim() === "basic") return basicAuth(request);

  // Telas e rotas que precisam funcionar sem sessão (entrar, código, recuperar senha).
  if (PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return harden(NextResponse.next());
  }

  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) {
    // Falha fechada, como já era com a senha básica: sem segredo, ninguém entra.
    return harden(
      new NextResponse("Área interna sem ADMIN_SESSION_SECRET configurado.", { status: 503 }) as NextResponse,
    );
  }

  const session = await readSessionCookie(secret, request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    if (isApi) {
      return harden(
        NextResponse.json({ ok: false, message: "Sessão expirada." }, { status: 401 }) as NextResponse,
      );
    }
    const url = new URL("/admin/entrar", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    return harden(NextResponse.redirect(url) as NextResponse);
  }

  const response = harden(NextResponse.next());

  // Renovação do prazo do cookie, no máximo uma vez por dia: componente de servidor
  // não escreve cookie, então esta é a única parte que pode estender o prazo.
  const ageHours = (Date.now() / 1000 - session.issuedAt) / 3600;
  if (ageHours > SESSION_RENEW_AFTER_HOURS) {
    const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_DAYS * 24 * 60 * 60;
    const value = await signSessionCookie(secret, {
      token: session.token,
      expiresAt,
      issuedAt: Math.floor(Date.now() / 1000),
    });
    response.cookies.set(SESSION_COOKIE, value, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    });
  }

  return response;
}

export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
