# CREDITS.md — origem e licença da mídia

## Nota sobre share-alike (CC BY-SA)

Arquivos CC BY-SA são incluídos **sem modificação** (bytes idênticos) e o app
é de uso pessoal. Incluir sem modificar, com atribuição (autor + link da
licença + indicação de mudanças quando houver), cumpre a licença sem
relicenciar o app. **Qualquer modificação futura** (redimensionar, recortar,
recolorir) é adaptação: exige a mesma licença (ou compatível) e nota da
alteração aqui e na allowlist. Nenhum downscale ou edição foi aplicado.

## Cadeia de origem

1. `wrkout/exercises.json` (Ollie Jennings, Unlicense) — dataset original. As imagens acompanham o dataset **sem proveniência individual documentada** (sem fotógrafo/fonte por arquivo). O repositório ainda oferece um dataset comercial separado (`wrkout.xyz`), o que reforça a incerteza sobre as imagens gratuitas.
2. `yuhonas/free-exercise-db` (Unlicense) — reestruturação do dataset acima + frontend. README confirma: *"I stumbled upon exercises.json which was amazing… so I restructured the data"*. Imagens herdadas, **sem atribuição por arquivo**.

Conclusão: a Unlicense do repositório **não comprova** a licença de cada imagem. Nenhum arquivo abaixo entra no build até confirmação individual.

## Arquivos avaliados no portão (todos BLOQUEADOS)

| Arquivo upstream | Exercício | Tamanho remoto | Status | Motivo |
|---|---|---|---|---|
| `Incline_Push-Up/0.jpg` | incline-pushup | 69704 bytes (68,1 KB) | BLOQUEADO | license-unconfirmed |
| `Incline_Push-Up/1.jpg` | incline-pushup | 68439 bytes (66,8 KB) | BLOQUEADO | license-unconfirmed |
| `Push-Up_Wide/0.jpg` | pushup-wide | 38369 bytes (37,5 KB) | BLOQUEADO | license-unconfirmed |
| `Push-Up_Wide/1.jpg` | pushup-wide | 36418 bytes (35,6 KB) | BLOQUEADO | license-unconfirmed |
| `Inverted_Row/0.jpg` | inverted-row | 57494 bytes (56,1 KB) | BLOQUEADO | license-unconfirmed |
| `Inverted_Row/1.jpg` | inverted-row | 59968 bytes (58,6 KB) | BLOQUEADO | license-unconfirmed |
| `Bodyweight_Squat/0.jpg` | bodyweight-squat | 37986 bytes (37,1 KB) | BLOQUEADO | license-unconfirmed |
| `Bodyweight_Squat/1.jpg` | bodyweight-squat | 41546 bytes (40,6 KB) | BLOQUEADO | license-unconfirmed |
| `Plank/0.jpg` | plank | 43296 bytes (42,3 KB) | BLOQUEADO | license-unconfirmed |
| `Plank/1.jpg` | plank | 43135 bytes (42,1 KB) | BLOQUEADO | license-unconfirmed |

Tamanhos medidos remotamente em 13/10/2026 (download de avaliação em diretório temporário, **não** incluído no build). Todos bem abaixo da meta inicial de ~200 KB/exercício: maior par 133,6 KB (incline-pushup), menor 71,4 KB (pushup-wide).

Coerência dos frames (animação vs lado a lado): **não verificada visualmente** — sem mídia aprovada, a decisão por exercício é `placeholder` para os 5. Reavaliar se alguma licença for confirmada.

## Arquivos Commons incluídos no build (verificação em 13/10)

Incluídos SEM modificação (bytes idênticos), via `sync-media:local` com
SHA-256 verificado. Inspeção visual: exercício correto; `_1`/`_2` coerentes
(início/fim). Segurança: sem scripts, sem links externos, sem `<image>`
remota (só namespaces/RDF internos); renderização só via `<img>`.

| Arquivo Commons → local | Exercício | Autor / licença | SHA-1 | SHA-256 | Bytes |
|---|---|---|---|---|---|
| `Body_row_1.svg` → `inverted-row-1.svg` | inverted-row | Everkinetic / CC BY-SA 3.0 | `e44e19eb7d234db61c55f624dc6d7e1684e4ab0d` | `06018636…e49057` | 19954 |
| `Body_row_2.svg` → `inverted-row-2.svg` | inverted-row | Everkinetic / CC BY-SA 3.0 | `6af6afe66c908b39857d02fab4f4f90d82537b3c` | `cb6f887b…ed3ca8d6` | 17190 |
| `Plank_exercise.svg` → `plank.svg` | plank | Pk0001 / CC BY-SA 4.0 | `3680a1caf2bd8e2579bf1586239b6d111619ca6d` | `ba6b8a8c…90f222e` | 14811 |

Atribuição exata: "Everkinetic, CC BY-SA 3.0, via Wikimedia Commons" (par) e
"Pk0001, CC BY-SA 4.0, via Wikimedia Commons" (prancha), com links na tela
Ajustes → Créditos de mídia e na tela do exercício. Revisão da página do
`Plank_exercise.svg` **não verificada** (API 429); licença CC BY-SA 4.0
confirmada na página do arquivo na curadoria.
`Push_ups_1.svg` verificado individualmente OK, mas **não incluído**: par
incompleto (`Push_ups_2.svg` ausente) — placeholder até o par completar.

## Mídia própria do usuário (`_inbox/own/`)

Autoria própria do usuário, declarada em 13/10/2026. Derivados otimizados
(720 px, JPEG q70) gerados dos originais com autorização do usuário em 13/10;
originais preservados em `_inbox/`. Sem marca d'água, logotipo ou áudio de
terceiros (verificação visual). `_inbox/own/` listado abaixo (bytes idênticos
aos incluídos em `/public/media`):

| Arquivo | Exercício/uso | SHA-256 | Bytes |
|---|---|---|---|
| `own/pushup-1.jpg` | pushup (início) | `6e4ac452…49e7f` | 25022 |
| `own/pushup-2.jpg` | pushup (fim) | `b78664a0…6fca3` | 36303 |
| `own/squat-1.jpg` | bodyweight-squat (início) | `1833df56…eb6dc` | 35043 |
| `own/squat-2.jpg` | bodyweight-squat (fim) | `a1f113b5…616f0` | 30427 |
| `own/climbers.jpg` | mountain-climbers (única) | `6aafaa80…4564ed6` | 38496 |
| `own/pike.jpg` | pike-pushup (única) | `75488eb2…406006` | 37868 |
| `own/capahome.jpg` | capa da tela Hoje | `f78d1142…69bd3` | 56331 |

Cobertura atual: **6 de 40** exercícios com demonstração (remada = par Commons
removido pelo usuário; flexão, agachamento, escalador e pike = fotos próprias;
prancha = placeholder até nova entrega). Ver `GUIA_DE_GRAVACAO.md`.

- `public/media/placeholder.svg` — ilustração placeholder criada neste projeto (autoria própria), usada como fallback em todos os exercícios do portão.
- Textos `cues`/`commonMistakes` em `src/data/exercises.ts` — redação própria em pt-BR (não copiados do dataset).
- Ícones `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (+ `icon-source.svg`) — design original gerado neste projeto via `scripts/make-icons.mjs` (autoria própria, sem restrição).
- Fixtures `src/components/__fixtures__/pose-a.svg` e `pose-b.svg` — figuras originais de TESTE, fora do catálogo; usadas só nos testes do `ExerciseMedia`.

## Opções de mídia avaliadas em 13/10/2026 (pesquisa, nada baixado/incluído)

- (a) Ilustrações SVG próprias: licença própria, esforço alto (2 poses × 40+ exercícios), demonstração esquemática (não fotorrealista).
- (b) Fotos/vídeos do usuário: licença própria total, melhor demonstração, depende de arquivos fornecidos pelo usuário.
- (c) Wikimedia Commons por arquivo (ex.: série Everkinetic de flexões, CC BY-SA 3.0, pares 900×469 ~30 KB; BruceBlaus CC BY-SA 4.0; PSF domínio público): licença verificável na página do arquivo, exige atribuição por arquivo + share-alike quando BY-SA; cobertura de skills avançadas incerta.
- (d) Embed YouTube oficial só p/ skills: sem redistribuição, exige conexão (não funciona offline); links como `TODO_USUARIO`.
- (e) Esclarecer proveniência com o mantenedor do free-exercise-db: apenas descrita; NENHUM contato feito (aguarda autorização).

## Status por arquivo

Os 10 arquivos do free-exercise-db seguem BLOQUEADOS (`license-unconfirmed`);
nada de terceiros incluído no build. `public/media/` contém: 7 fotos próprias
(pushup-1/2, squat-1/2, climbers, pike, capahome), `placeholder.svg` próprio e
`public/icons/` só com arte própria. SVGs do Commons removidos a pedido do
usuário em 13/10 (retirados de `public/media/`, arquivos em `_inbox/` apagados
pelo usuário).
