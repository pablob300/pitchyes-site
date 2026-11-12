// Depois do deploy: pede ao site publicado que reenvie os sitemaps ao Google e avise o
// IndexNow das páginas que mudaram no código (rota /api/search-console/deploy).
// Chamado por scripts/cf.mjs ao fim de "deploy"; também roda sozinho:
//   node scripts/search-console-ping.mjs [https://pitchyes.com.br]
// O token é o segredo DEPLOY_PING_TOKEN do Worker, lido do ambiente ou do .dev.vars.
// Nunca falha o deploy: só avisa no terminal.
import { readFileSync } from "node:fs";

function tokenFromDevVars() {
  try {
    const vars = readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
    return vars.match(/^DEPLOY_PING_TOKEN\s*=\s*"?([^"\r\n]+)"?/m)?.[1]?.trim();
  } catch {
    return undefined;
  }
}

const site = (process.argv[2] ?? process.env.SITE_URL ?? "https://pitchyes.com.br").replace(/\/$/, "");
const token = process.env.DEPLOY_PING_TOKEN?.trim() || tokenFromDevVars();

if (!token) {
  console.log("[search-console] DEPLOY_PING_TOKEN ausente (.dev.vars): sitemaps não reenviados.");
} else {
  try {
    const response = await fetch(`${site}/api/search-console/deploy`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(60_000),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      console.log(`[search-console] ${response.status}: ${data.message ?? "falha ao avisar"}`);
    } else {
      console.log(`[search-console] ${data.changes?.length ?? 0} página(s) mudaram no código.`);
      for (const item of data.sitemaps ?? []) console.log(`  ${item.ok ? "✓" : "✗"} ${item.sitemap} — ${item.message}`);
      if (data.indexNow) console.log(`  IndexNow: ${data.indexNow.message}`);
      if (data.message) console.log(`  ${data.message}`);
    }
  } catch (error) {
    console.log(`[search-console] site não respondeu: ${error.message}`);
  }
}
