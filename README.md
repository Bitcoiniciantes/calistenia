# Calistenia — PWA de rotina (Fase 1, uso pessoal, 100% FREE)

## Como rodar

```bash
npm install
npm run dev      # localhost, porta 5173
npm test         # Vitest
npm run build    # tsc + build de produção (gera SW e precache)
npm run preview  # serve o build em localhost:4173
npm run sync-media        # baixa mídia aprovada (modo URL)
npm run sync-media:local  # copia de _inbox/ verificando SHA-256
```

Somente localhost. Sem deploy, hospedagem ou backend na Fase 1.

## Como adicionar exercícios

1. Acrescente o item em `src/data/exercises.ts` (id único, `prevId`/`nextId` simétricos, cadeia em `progressionChains`).
2. Sem `media.frames`, a UI exibe placeholder identificado automaticamente.
3. Rode `npm test` (integridade prev/next) e `npm run build`.

## Como preencher os TODO_USUARIO de vídeo (skills)

Troque `media: { source: 'embed', ref: 'TODO_USUARIO…' }` por embed oficial
do YouTube ou arquivo local em `/public/media/`. Embeds exigem conexão
(não funcionam offline); links ficam listados nos créditos.

## Mídia e licenças

Ver `CREDITS.md` (origem, licença e hash por arquivo) e
`media-allowlist.json` (somente arquivos aprovados entram no build).
Entrega manual via `_inbox/` (fora do build e do precache).
