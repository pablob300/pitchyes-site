// Criptografia da área interna, só com Web Crypto — é o que o Workers oferece
// (nada de bcrypt/argon2). Sem `server-only`: o proxy também usa daqui.

import { PBKDF2_ITERATIONS, PBKDF2_ROUNDS } from "./config";

const encoder = new TextEncoder();

export function b64urlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function b64urlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Token opaco de `bytes` bytes, em base64url. */
export function randomToken(bytes = 32): string {
  return b64urlEncode(crypto.getRandomValues(new Uint8Array(bytes)));
}

/**
 * Código numérico sem viés. `% 10` sobre bytes aleatórios favorece os dígitos
 * baixos; com código de 6 dígitos isso importa, então descartamos o excedente.
 */
export function randomDigits(length: number): string {
  let out = "";
  while (out.length < length) {
    for (const byte of crypto.getRandomValues(new Uint8Array(length * 2))) {
      if (byte < 250) out += String(byte % 10);
      if (out.length === length) break;
    }
  }
  return out;
}

/** Comparação em tempo constante: não entrega quantos bytes bateram. */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
}

/** HMAC-SHA256 em base64url. O segredo é a "pimenta" que fica fora do banco. */
export async function hmac(secret: string, value: string): Promise<string> {
  const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(value));
  return b64urlEncode(new Uint8Array(signature));
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return b64urlEncode(new Uint8Array(digest));
}

// --- Senhas -----------------------------------------------------------------

async function pbkdf2(password: string, salt: Uint8Array, iterations: number, rounds: number): Promise<string> {
  let secret = encoder.encode(password) as BufferSource;
  let bits = new ArrayBuffer(0);
  // Rodadas encadeadas: o Workers limita cada chamada a 100.000 iterações, então
  // a saída de uma rodada alimenta a próxima. Trabalho total = rodadas × iterações.
  for (let round = 0; round < rounds; round++) {
    const key = await crypto.subtle.importKey("raw", secret, "PBKDF2", false, ["deriveBits"]);
    bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", hash: "SHA-256", salt: salt as BufferSource, iterations },
      key,
      256,
    );
    secret = bits;
  }
  return b64urlEncode(new Uint8Array(bits));
}

/** Formato: pbkdf2-sha256$<rodadas>x<iterações>$<sal>$<hash>, tudo em base64url. */
export async function hashPassword(
  password: string,
  iterations = PBKDF2_ITERATIONS,
  rounds = PBKDF2_ROUNDS,
): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2(password, salt, iterations, rounds);
  return `pbkdf2-sha256$${rounds}x${iterations}$${b64urlEncode(salt)}$${hash}`;
}

/** Hash de mentira, para gastar o mesmo tempo quando o e-mail não existe. */
export const DUMMY_HASH =
  "pbkdf2-sha256$3x100000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

export async function verifyPassword(
  password: string,
  stored: string | null,
): Promise<{ ok: boolean; needsRehash: boolean }> {
  const target = stored ?? DUMMY_HASH;
  const [scheme, costRaw, saltRaw, hashRaw] = target.split("$");
  if (scheme !== "pbkdf2-sha256" || !costRaw || !saltRaw || !hashRaw) {
    return { ok: false, needsRehash: false };
  }
  // "3x100000" (formato atual) ou "210000" (uma rodada só, formato antigo).
  const [roundsRaw, iterationsRaw] = costRaw.includes("x") ? costRaw.split("x") : ["1", costRaw];
  const rounds = Number(roundsRaw);
  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(rounds) || !Number.isFinite(iterations)) return { ok: false, needsRehash: false };

  const computed = await pbkdf2(password, b64urlDecode(saltRaw), iterations, rounds);
  // Mesmo sem senha cadastrada a conta continua sem acesso, mas o tempo de resposta
  // é o mesmo de uma conta existente.
  const ok = stored !== null && timingSafeEqual(computed, hashRaw);
  return { ok, needsRehash: ok && rounds * iterations < PBKDF2_ROUNDS * PBKDF2_ITERATIONS };
}
