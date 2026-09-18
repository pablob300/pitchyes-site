# PitchYes — site

Next.js 16 servido pelo Cloudflare Workers via [OpenNext](https://opennext.js.org/cloudflare), com cache incremental em R2.

```bash
npm run dev       # desenvolvimento local
npm run preview   # build OpenNext + runtime do Workers local (porta 8787)
npm run deploy    # build + deploy para produção
```

## Domínio

O domínio público vem da variável `SITE_URL` (ver `src/lib/site.ts`). Sem ela, o site usa
`https://pitchyes-site.borges-filho.workers.dev`.

A indexação por buscadores só é liberada quando `SITE_ENV=production` **e** o domínio não é
`*.workers.dev` — antes disso, `robots.txt` e as meta tags bloqueiam tudo.

Para trocar para o domínio definitivo (ex.: `pitchyes.com.br`):

1. Workers & Pages → `pitchyes-site` → **Settings → Domains & Routes** → adicionar Custom Domain.
2. **Settings → Variables and Secrets** → `SITE_URL = https://pitchyes.com.br` (vale na hora para `robots.txt`).
3. **Settings → Build → Variables** → mesma `SITE_URL`, e disparar um novo build (as meta tags e
   URLs canônicas das páginas estáticas são geradas no build).

`keep_vars: true` no `wrangler.jsonc` garante que o deploy não apague variáveis definidas no painel.
