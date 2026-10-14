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
| `own/pushup-1.jpg` | pushup (início) — SUBSTITUÍDA em 13/10 | `6e4ac452…49e7f` | 25022 |
| `own/pushup-2.jpg` | pushup (fim) — SUBSTITUÍDA em 13/10 | `b78664a0…6fca3` | 36303 |
| `own/squat-1.jpg` | bodyweight-squat (início) — SUBSTITUÍDA em 13/10 | `1833df56…eb6dc` | 35043 |
| `own/squat-2.jpg` | bodyweight-squat (fim) — SUBSTITUÍDA em 13/10 | `a1f113b5…616f0` | 30427 |
| `own/climbers.jpg` | mountain-climbers — SUBSTITUÍDA em 13/10 | `6aafaa80…4564ed6` | 38496 |
| `own/pike.jpg` | pike-pushup — SUBSTITUÍDA em 13/10 | `75488eb2…406006` | 37868 |
| `own/capahome.jpg` | capa da tela Hoje | `f78d1142…69bd3` | 56331 |

Cobertura atual: **6 de 40** exercícios com demonstração (remada = par Commons
removido pelo usuário; flexão, agachamento, escalador e pike = fotos próprias;
prancha = placeholder até nova entrega). Ver `GUIA_DE_GRAVACAO.md`.

## Imagens geradas por IA a pedido do usuário (`_inbox/`, 13/10)

Renderizações geradas por IA (Gemini) a partir de prompts do usuário; uso no
app declarado pelo usuário em 13/10/2026. Incluídas SEM modificação (bytes
idênticos), via `sync-media:local` com SHA-256 verificado. Inspeção visual:
exercício correto em cada arquivo; pares topo/fundo coerentes (flexão,
agachamento). Arquivos substituídos seguem preservados em `_inbox/own/` e no
git (fora do build). NÃO incluídos: `remadainvertidanochao1/2.jpg` (mostram
pessoa deitada no chão, sem barra — não demonstram a remada), par abdominal
(`(4)`/`(5)` — sem exercício correspondente no catálogo de 40), `capahome.png`
(2,1 MB, acima do orçamento), arquivos ≥1,6 MB (`(1)`, `(2)`, base, `4i4z`,
`.svg` — redundantes com o par reduzido).

| Arquivo `_inbox/` → local | Exercício | SHA-256 | Bytes |
|---|---|---|---|
| `flexaoemcima (2).jpg` → `flexao-topo.jpg` | pushup (topo) | `9ebfd100…12edaa` | 51556 |
| `flexaomeio.jpg` → `flexao-fundo.jpg` | pushup (fundo) | `e20f96da…6800` | 35100 |
| `aagachamentoempé.jpg` → `agachamento-pe.jpg` | bodyweight-squat (em pé) | `6beb9fe0…4a48a0` | 44766 |
| `agachamentoembaixo.jpg` → `agachamento-fundo.jpg` | bodyweight-squat (embaixo) | `caef49a0…d0b7` | 50490 |
| `pranchaabdominsl1.jpg` → `prancha.jpg` | plank (única) | `0c58f15c…f56b2` | 53429 |
| `…(3).jpg` → `escalador.jpg` | mountain-climbers — SUBSTITUÍDA em 13/10 (série 04) | `f5c4e6da…4e9eb` | 54713 |
| `…(6).jpg` → `flexao-pike.jpg` | pike-pushup (única) | `7fa7cc88…6f988` | 54032 |

Cobertura após a troca: **6 de 40** (flexão, agachamento, prancha, escalador,
pike + capa). Prancha e o par da flexão/agachamento agora no estilo IA
coerente; fotos próprias anteriores preservadas em `_inbox/own/`.

## Série numerada 01–16 (13/10)

Mesma origem/procedência da seção anterior (IA Gemini a pedido do usuário).
Inspeção visual uma por uma; incluídas 10 (bytes idênticos, SHA-256
verificado). NÃO incluídas: `05` (pernas DEITADO — catálogo tem pendurado na
barra), `06` (quase duplicata da `02`), `08` (prancha ALTA — catálogo tem
prancha de antebraços), `11` (declinada — sem exercício), `13` (redundante com
o par animado do agachamento), `14` (sumo — sem exercício), nomes
não-identificáveis (`eGoLe/qhZv8/wsEeD/Captura…` — aguardando nome do
exercício), `Grade…Neon Azul.png` (colagem 1,8 MB).

| Arquivo `_inbox/` → local | Exercício | SHA-256 | Bytes |
|---|---|---|---|
| `01_prancha_lateral.png` → `prancha-lateral.png` | side-plank (única) | `d29e0fd5…e6b5` | 110787 |
| `02_hollow_hold_corpo_oco.png` → `hollow.png` | hollow-hold (única) | `b9e34130…d7bb1` | 100235 |
| `03_elevacao_de_joelhos_na_barra.png` → `joelhos-barra.png` | knee-raises (única) | `39cc4d85…0293` | 95855 |
| `04_escalador_mountain_climber.png` → `escalador.png` | mountain-climbers (única, substitui `escalador.jpg`) | `bc8fdb62…cc6f` | 111461 |
| `07_l_sit_nas_paralelas.png` → `l-sit.png` | l-sit (única) | `1a83c49d…8994` | 93262 |
| `09_flexao_joelhos_flexionados.png` → `flexao-joelhos.png` | knee-pushup (única) | `78788105…762e` | 104450 |
| `10_flexao_diamante.png` → `flexao-diamante.png` | diamond-pushup (única) | `da535afc…41bb` | 101584 |
| `12_flexao_inclinada_no_banco.png` → `flexao-inclinada.png` | incline-pushup (única) | `71b60cdd…b682` | 93382 |
| `15_agachamento_bulgaro.png` → `bulgaro.png` | bulgarian-split (única) | `f72e7cf5…0958` | 113207 |
| `16_afundo_avanco.png` → `afundo.png` | reverse-lunge (única; afundo frontal ilustrando a família) | `a62bec50…ddb36` | 110491 |

Cobertura atual: **14 de 40** exercícios com demonstração.

## Cartões 700x700 do usuário (`_inbox/20posicoes/`, 13/10)

Cartões numerados com foto e legenda em pt-BR, produção própria do usuário
(uso declarado em 13/10/2026). 9 vistos visualmente (01, 02, 06, 10, 11, 12,
13, 19, 20); 03/05/08/14 aceitos pelo nome na série uniforme (mesmo estilo,
nomes precisos). Incluídos SEM modificação (bytes idênticos), via
`sync-media:local` com SHA-256 verificado. Arquivos IA substituídos seguem
preservados em `_inbox/` + git, fora do build. NÃO incluídos: `04` (declinada),
`07` (sumo), `09` (afundo alternado — `10` cobre o reverso), `15` (bicicleta),
`16` (pernas deitado), `17` (dead bug), `18` (superman) — sem exercício
correspondente no catálogo de 40.

| Arquivo `_inbox/20posicoes/` → local | Exercício | SHA-256 | Bytes |
|---|---|---|---|
| `01…tradicional.png` → `foto-flexao.png` | pushup (única; substitui par animado) | `f620f22b…b9d7` | 362716 |
| `02…joelhos_apoiados.png` → `foto-flexao-joelhos.png` | knee-pushup (única) | `5bd27cbb…c6c` | 379279 |
| `03_flexao_diamante.png` → `foto-flexao-diamante.png` | diamond-pushup (única) | `5bf5a093…da72` | 337114 |
| `05_flexao_inclinada.png` → `foto-flexao-inclinada.png` | incline-pushup (única) | `40ef6af8…60dd` | 348403 |
| `06_agachamento_livre.png` → `foto-agachamento.png` | bodyweight-squat (única; substitui par animado) | `6e9c00ae…594` | 310219 |
| `08_agachamento_bulgaro.png` → `foto-bulgaro.png` | bulgarian-split (única) | `96878192…992d` | 341681 |
| `10_avanco_reverso.png` → `foto-avanco-reverso.png` | reverse-lunge (única) | `5412f143…feb` | 351586 |
| `11…glute_bridge.png` → `foto-ponte.png` | glute-bridge (única) | `1d9d0b1d…9e2c` | 340086 |
| `12_panturrilha_em_pe.png` → `foto-panturrilha.png` | calf-raises (única) | `931fa06c…e3d6` | 310439 |
| `13_prancha_abdominal.png` → `foto-prancha.png` | plank (única) | `366e458d…2e40` | 314596 |
| `14_prancha_lateral.png` → `foto-prancha-lateral.png` | side-plank (única) | `8fecadcf…e946` | 335885 |
| `19…flexao_pike.png` → `foto-pike.png` | pike-pushup (única) | `b2945dd0…ef61` | 367475 |
| `20…handstand_hold.png` → `foto-handstand.png` | handstand-wall (única; substitui TODO de embed — pilar skill com mídia) | `d2ec8c02…ae6fa` | 311395 |

Cobertura atual: **17 de 40** exercícios com demonstração (13 cartões +
hollow, joelhos na barra, L-sit e escalador da série IA + capa).

## Versões 700x700 limpas (`_inbox/posiçõesnovas/`, 13/10)

Mesma série neon em 700x700, sem números/legendas queimados. 4 vistos
visualmente (02, 03, 04, 07 — hollow, joelhos na barra, escalador, L-sit);
substituem as versões pequenas. Demais arquivos redundam com cartões já
integrados (`01/09/10/12/13/15/16`), sem exercício (`11/14`), duplicata (`06`)
ou incompatíveis (`05` deitado, `08` prancha alta).

| Arquivo `_inbox/posiçõesnovas/` → local | Exercício | SHA-256 | Bytes |
|---|---|---|---|
| `02…` → `hollow-700.png` | hollow-hold (única) | `2cfdece0…59e90` | 237142 |
| `03…` → `joelhos-barra-700.png` | knee-raises (única) | `817a16be…9426` | 223592 |
| `04…` → `escalador-700.png` | mountain-climbers (única) | `fe541358…7724` | 269009 |
| `07…` → `lsit-700.png` | l-sit (única) | `9cd42408…1efa7` | 221273 |

## Barras + mobilidade (`_inbox/barras/`, 13/10)

Mesma origem IA e procedimento (SHA-256 + tipo real + inspeção visual das
13). Preenchem o pilar pull inteiro, arqueiro/pseudo-planche e a mobilidade
completa. `03_rotacao_de_tronco.png` mostra a postura inicial (neutra), não o
giro — aceita como ilustração da posição-base, com a ressalva registrada aqui.

| Arquivo `_inbox/barras/` → local | Exercício | SHA-256 | Bytes |
|---|---|---|---|
| `01_flexao_arqueiro.png` → `barra-arqueiro.png` | archer-pushup (única) | `6c321c22…d64f2b` | 196469 |
| `02_pseudo_planche.png` → `barra-pseudo.png` | pseudo-planche (única) | `d5dbcf58…423b` | 185904 |
| `03_remada_invertida.png` → `barra-remada.png` | inverted-row (única) | `bf3d1440…4275` | 186208 |
| `04_…pes_elevados.png` → `barra-remada-elev.png` | inverted-row-elevated (única) | `483f0805…cb1` | 180938 |
| `05_pendurado_na_barra.png` → `barra-deadhang.png` | dead-hang (única) | `c65e03f5…c6de` | 139964 |
| `06_barra_com_negativa.png` → `barra-negativa.png` | negative-pullup (única) | `808e48f8…f8d` | 144487 |
| `07_barra_fixa.png` → `barra-fixa.png` | pullup (única) | `e21d05f3…67f2c` | 156894 |
| `08_barra_supinada.png` → `barra-supinada.png` | chinup (única) | `3eb4de11…f491` | 150157 |
| `09_barra_pegada_aberta.png` → `barra-aberta.png` | wide-pullup (única) | `8438493e…c5b7` | 165592 |
| `01_circulos_de_braco.png` → `mob-bracos.png` | arm-circles (única) | `50bf801a…8e53` | 107590 |
| `02_gato_vaca.png` → `mob-gato.png` | cat-cow (única) | `2d809350…e23c9` | 145862 |
| `03_rotacao_de_tronco.png` → `mob-tronco.png` | trunk-rotation (única, posição inicial) | `3020a013…87d3` | 83252 |
| `04_…com_pausa.png` → `mob-agacha.png` | deep-squat-hold (única) | `f077b955…c16` | 95862 |

Cobertura atual: **30 de 40** exercícios com demonstração. Limpeza segura
desta rodada: `public/media/prancha-lateral.png` obsoleta removida (entry
desaprovada) + scaffold `src/assets/{hero.png,react.svg,vite.svg}` sem
referência removido (versionados, recuperáveis no git). `_inbox/` intacta
(não versionada — apagamento permanente adiado).

## Pasta Novas (`_inbox/Novas/`, 13/10)

Mesma origem IA e procedimento (SHA-256 + tipo real + inspeção visual das 4).
Integradas 3; `03_dips_em_paralelas.png` REJEITADA: mostra flexão de braço com
as mãos em paralelas de chão (push-up bars), NÃO mergulho em paralelas
(suspensão entre barras) — ensinaria o movimento errado.

| Arquivo `_inbox/Novas/` → local | Exercício | SHA-256 | Bytes |
|---|---|---|---|
| `01_flexao_na_parede.png` → `nova-parede.png` | wall-pushup (única) | `5b167eca…e5612` | 82019 |
| `02_flexao_ampla.png` → `nova-ampla.png` | pushup-wide (única; encerra pendência do par) | `7d63d30d…51d` | 160914 |
| `04_muscle_up_progressao.png` → `nova-muscleup.png` | muscleup-prog (única; troca embed TODO por local) | `e3a10634…f48b` | 94996 |

Cobertura atual: **33 de 40** exercícios com demonstração.

## Pasta novas2 (`_inbox/novas2/`, 13/10)

Mesma origem IA e procedimento (SHA-256 + tipo real + inspeção visual das 7).
Integradas 3 (cadeira, pernas pendurada, front lever — este troca o último
embed TODO por local); `n2-frontlever.jpg` traz legenda queimada no próprio
cartão (duplica o título do app, sem prejuízo). REJEITADAS 4 (não mostram o
exercício): `02_mergulho…` (ajoelhada sem barras), `05_pistol_assistido`
(afundo segurando barras), `06_pistol` (afundo), `08_hollow_rocks` (sentada
inclinada com joelhos dobrados, não hollow).

| Arquivo `_inbox/novas2/` → local | Exercício | SHA-256 | Bytes |
|---|---|---|---|
| `04_agachamento_na_cadeira.png` → `n2-cadeira.png` | chair-squat (única) | `5267eb3d…cace1` | 104911 |
| `07_elevacao_de_pernas.png` → `n2-pernas.png` | leg-raises (única, pendurada) | `465b92bd…128e` | 114434 |
| `frontlevergrupado.png.jpg` → `n2-frontlever.jpg` | tuck-front-lever (única; JPG real) | `d86ce6a5…34f8` | 37748 |

Cobertura atual: **36 de 40**. Faltam 4: dips-parallettes, assisted-pistol,
pistol, hollow-rocks.

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
