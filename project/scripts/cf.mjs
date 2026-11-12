// Runs the OpenNext CLI pinned to the Cloudflare account in wrangler.jsonc.
// Wrangler honours "account_id", but OpenNext's R2 cache population spawns wrangler in a way
// that ignores it and asks which account to use when the login sees more than one. Exporting
// CLOUDFLARE_ACCOUNT_ID makes every step (build, cache upload, deploy) use the same account.
//
// Usage: node scripts/cf.mjs build deploy   (each argument is one opennextjs-cloudflare command)
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const config = readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8");
const accountId = config.match(/"account_id"\s*:\s*"([0-9a-f]{32})"/)?.[1];
if (!accountId) {
  console.error('wrangler.jsonc sem "account_id": defina a conta antes de publicar.');
  process.exit(1);
}

// The package "exports" hide the CLI from require.resolve; it is the "bin" entry of the package.
const cli = fileURLToPath(new URL("../node_modules/@opennextjs/cloudflare/dist/cli/index.js", import.meta.url));
// SITE_ENV lives in wrangler.jsonc "vars", which only exist at runtime. The static pages are
// rendered at build time, so without it here they shipped as staging (robots noindex) even on
// the production domain. The first "SITE_ENV" in the file is the top-level (production) one.
const siteEnv = process.env.SITE_ENV ?? config.match(/"SITE_ENV"\s*:\s*"([a-z]+)"/)?.[1];
const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId, ...(siteEnv && { SITE_ENV: siteEnv }) };
for (const command of process.argv.slice(2)) {
  execFileSync(process.execPath, [cli, command], { stdio: "inherit", env });
}
