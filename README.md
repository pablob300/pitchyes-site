# PitchYes: site institucional

Site da PitchYes (IA de voz para empresas), em Next.js 16, publicado no Cloudflare Workers.

- **Homologação:** https://pitchyes-site.borges-filho.workers.dev (bloqueado para buscadores)
- **Domínio definitivo:** `pitchyes.com.br` (último passo, via variável `SITE_URL`)
- **Histórico de versões e pendências:** [CHANGELOG.md](CHANGELOG.md)

## Estrutura

| Pasta | O que é |
|---|---|
| [`project/`](project/) | O site em Next.js: código, deploy e SEO. Ver [project/README.md](project/README.md) |
| [`System/`](System/) | Design system: tokens, componentes de referência em HTML, marca e regras de animação. Abra `System/style-guide.html` |
| [`docs/`](docs/) | Material de referência: wireframe da homepage e logo original |

## Publicar

```bash
cd project
npm run deploy   # build (OpenNext) + deploy no Cloudflare
```

Toda mudança é testada no ambiente online depois do deploy e registrada no [CHANGELOG.md](CHANGELOG.md).
