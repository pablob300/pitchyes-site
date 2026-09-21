// Constantes da área interna. Sem I/O: este arquivo é importado tanto pelo servidor
// quanto pelo proxy (que roda antes de qualquer rota), então nada de `server-only`.

export const SESSION_COOKIE = "py_sessao";
export const DEVICE_COOKIE = "py_dispositivo";
/** Cookie curto que liga o passo da senha ao passo do código. */
export const PENDING_COOKIE = "py_login";

/** Sessão: 7 dias, renovada em uso. */
export const SESSION_TTL_DAYS = 7;
/** Teto absoluto: passado isso, pede a senha de novo (sem código, se o aparelho é confiável). */
export const SESSION_ABSOLUTE_DAYS = 30;
/** Só renova a sessão quando ela já tem mais de 1 dia, para não escrever a cada clique. */
export const SESSION_RENEW_AFTER_HOURS = 24;

/**
 * Confiança do aparelho dura mais que a sessão de propósito: a sessão de 7 dias é
 * quanto tempo a pessoa fica logada; a confiança é por quanto tempo aquele navegador
 * não precisa de código novo. Se fossem iguais, haveria um código por semana.
 */
export const DEVICE_TRUST_DAYS = 180;

export const CODE_LENGTH = 6;
export const CODE_TTL_MINUTES = 10;
export const CODE_MAX_ATTEMPTS = 5;
export const CODE_RESEND_SECONDS = 60;

export const INVITE_TTL_DAYS = 7;
export const RESET_TTL_HOURS = 24;

/**
 * PBKDF2-SHA256. O Workers recusa mais de 100.000 iterações por chamada
 * ("Pbkdf2 failed: iteration counts above 100000 are not supported"), que é
 * abaixo do recomendado hoje. Para recuperar a força, encadeamos rodadas: a saída
 * de uma vira a entrada da seguinte, então o trabalho total é rodadas × iterações
 * e o atacante precisa repetir a mesma corrente.
 *
 * Os dois números ficam gravados junto do hash, então dá para aumentar depois sem
 * invalidar senha nenhuma (ela é regravada no próximo login).
 */
export const PBKDF2_ITERATIONS = 100_000;
export const PBKDF2_ROUNDS = 3;

export const MIN_PASSWORD_LENGTH = 10;

/** Caminhos do painel que precisam funcionar sem sessão. */
export const PUBLIC_ADMIN_PATHS = [
  "/admin/entrar",
  "/admin/verificar",
  "/admin/recuperar",
  "/admin/definir-senha",
  "/api/admin/login",
  "/api/admin/login/codigo",
  "/api/admin/login/codigo/reenviar",
  "/api/admin/senha",
  "/api/admin/senha/recuperar",
];

export const ADMIN_HOME = "/admin/leads";
