# Regras do projeto PitchYes

Leia antes de qualquer alteração no site:

- **[SEO.md](SEO.md)**: regras de SEO e indexação (Google e mecanismos de IA). O maior
  objetivo do projeto é ser encontrado — toda mudança de código ou conteúdo passa por lá.
- **[System/README.md](System/README.md)**: design system (tokens, componentes, marca e
  regras de animação). O visual sempre sai daqui; componente novo ganha referência no System.
- **[CHANGELOG.md](CHANGELOG.md)**: histórico das versões e pendências abertas.
- **[project/README.md](project/README.md)**: como o site funciona (páginas, blog, domínio, deploy).

## Fluxo de trabalho

1. Alterar o código em `project/`, usando os tokens e componentes de `System/`.
2. Conferir tipos, lint e build (`npx tsc --noEmit`, `npm run lint`, `npm run build`).
3. Publicar (`npm run deploy`) e **testar no ambiente online**, não só localmente.
4. Registrar a versão no `CHANGELOG.md` (commit + Version ID da Cloudflare).
5. Commit e push.

@SEO.md
