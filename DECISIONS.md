# DECISIONS.md

## 2026-10-13 — Lighthouse PWA removido (v12.0.0); instalabilidade verificada por manifest + SW + critérios do Chrome

- Contexto: categoria PWA removida no Lighthouse v12.0.0 (2024-04-22) pelos critérios de instalabilidade atualizados do Chrome. Sem Lighthouse instalado no projeto (sem `package.json`); verificação via release notes oficiais.
- Decisão: remover "Lighthouse PWA ≥ 90" do prompt (§9, §11) e do PROPOSTA.md (§5, §6-passo 7, §10, L4/R3). Substituir por critérios verificáveis: manifest válido + service worker registrado (painel Application do Chrome DevTools) + app instalável pelo Chrome + teste offline + Lighthouse Performance ≥ 85 em mobile.
- Escopo FREE mantido. Nenhum deploy/hospedagem sem autorização explícita.

## 2026-10-13 — Fase 1 etapas 1–2 (portão): decisões de implementação

- Template Vite atual traz `oxlint`, não ESLint. Prompt §9 exige ESLint (mais restritivo): adicionado `eslint.config.js` (flat, react-hooks/react-refresh) como `lint:eslint`; `lint` (oxlint) mantido. Ambos verdes.
- Template sem `"strict": true` explícito: adicionado ao `tsconfig.app.json` (prompt §9, mais restritivo).
- `vite-plugin-pwa` mínimo já nas etapas 1–2 (manifest + SW + precache) para viabilizar o teste offline do portão; PWA completa segue na etapa 7. Critério "instalável pelo Chrome" fica PENDENTE (ícones finais 192/512 ainda não existem).
- Mídia do portão: 10/10 arquivos do free-exercise-db BLOQUEADOS — cadeia `wrkout/exercises.json` → `yuhonas/free-exercise-db`, ambas Unlicense mas sem proveniência/atribuição por imagem; licença individual não confirmável (ver CREDITS.md). UI usa placeholder de autoria própria; decisão de mídia dos 5 exercícios = `placeholder`.
- Bug encontrado no QA headless e corrigido: texto do placeholder invisível sobre fundo preto (faltava `color: #fff`); confirmado por screenshot 390 px antes/depois.

## 2026-10-13 — Resultado do portão: arquitetura APROVADA, mídia REPROVADA (0/5 com demonstração)

- Mídia do free-exercise-db bloqueada integralmente (10/10 arquivos): Unlicense do repo não cobre cada imagem; cadeia wrkout → yuhonas sem atribuição por arquivo. Decisão: placeholder + pendência em CREDITS.md; catálogo de 40 NÃO iniciado (etapa 3 sem autorização).
- Pendências resolvidas em localhost: ícones próprios 192/512 + maskable (manifest completo; SW registrado/ativo/controlando; dimensões reais verificadas em headless); crossfade exercitado com fixtures SVG de teste + 6 testes novos (transição, pausa/play, reduced-motion, alt, regra animação/lado-a-lado/placeholder) — 13/13 verdes; Lighthouse v13.5.0 Performance mobile 98/100 local (FCP/LCP 1,7 s, TBT 110 ms, CLS 0).
- Segue PENDENTE (exige dispositivo real/hospedagem ou decisão do usuário): prompt de instalação Chrome, Performance em hardware real, licenças de imagem ou alternativa de mídia.

## 2026-10-13 — Inclusão Commons (3 arquivos) + fundo claro p/ traço preto

- `_inbox/` com 4 SVGs, SHA-1 conferindo com a API; aprovados e incluídos bytes idênticos via `sync-media:local`: `Body_row_1/2` (par coerente confirmado visualmente) e `Plank_exercise` (hold, 1 frame). `Push_ups_1` OK individualmente mas retido (par incompleto); wide ausente; resto placeholder. Sem scripts/links/`image` remotos; render só via `<img>`.
- Bug: traço preto dos SVGs invisível no fundo preto da área de mídia → `.exercise-media`/`.exercise-static` com fundo branco explícito e placeholder com fundo/texto explícitos (independem do tema). Confirmado por screenshot 390 px.
- Validação: 26/26 Vitest, ESLint/tsc/build verdes; QA headless (animação+pausa, estática, placeholders, 55% altura, offline com retomada); Lighthouse 13.5.0 Performance 99; 1ª imagem local em ~20 ms.

## 2026-10-13 — Fases 3–4: mídia própria (base pronta), a11y e robustez

- `_inbox/own/` criada (vazia); pares SVG do portão seguem ausentes → placeholders mantidos, sem substituto. `ExerciseMedia` com vídeo próprio (muted/loop/playsInline/poster, reduzido mostra estático+Play, falha→placeholder), prioridade sobre Commons; `sync-media` verifica tipo real por magic bytes + SHA-256, com modo `--local` (build sem rede). Cobertura: 2/40 (`GUIA_DE_GRAVACAO.md` na raiz).
- Regras confirmadas por teste: progressão sugestiva (up/down/stay), equilíbrio push/pull com aviso sem barra, prev/next dos 40, streak, volume, desafio sequencial, backup inválido rejeitado sem apagar dados, descanso com relógio alterado.
- Privacidade: hosts requisitados em produção = só o próprio host (0 trackers, 0 externas). Axe (wcag2aa) zerado nas 4 telas após trocar botões para green-700 (contraste) + `:focus-visible`; teclado nativo em tudo.
- Validação final: 36/36 Vitest, ESLint/tsc/build verdes; precache 482,7 KiB (< 25 MB); Lighthouse 13.5.0 Performance 98 mobile; fluxos e2e provados por partes (harness lento impede 1 passada limpa: onboarding, série/descanso, retomada, conclusão, histórico c/ duração, offline).

## 2026-10-13 — Publicação GitHub Pages (main/docs, Fase 5)

- Repo estava vazio (sem branches): por isso o Pages não ativava. Push inicial `main` (source + `docs/` com build) liberou a ativação.
- Deploy: branch `main`, pasta `/docs` (build `outDir: docs`), sem Actions. `base: /calistenia/`, `HashRouter` (sem 404 em links profundos), manifest `start_url`/`scope` com base, precache 22 entradas/716 KiB com as 7 fotos próprias. Encontrou-se e corrigiu-se: `globPatterns` sem jpg (mídia fora do precache) e 2 chaves quebradas por edição (`icons: [` sem `{`, `//` engolindo linha).
- Servido errado (index de src) até rebuild do Pages; após rebuild: URL https://bitcoiniciantes.github.io/calistenia/ com build correto. Lighthouse na URL: Performance 93 mobile. Manifest/SW/instalabilidade pendentes de confirmação em dispositivo real.

## 2026-10-13 — Acentos (mojibake) + conjunto IA do usuário

- Causa dos `ComeÃ§ar`/`ðŸ"¥`: fontes em `src/screens/` continham UTF-8 com dupla/tripla codificação (bytes UTF-8 lidos como latin1 e como windows-1252, recodificados). Corrigido com script de reversão (só troca o que decodifica em UTF-8 válido e diferente; `é/—/…/🔒` legítimos são pontos fixos). 94 trechos em 5 telas; bundle verificado em bytes (`ç`=c3a7, sem `c383`, 🔥 presente). Testes 36/36, tsc/eslint limpos.
- Mídia: 7 imagens geradas por IA (Gemini) a partir de prompts do usuário, uso declarado pelo usuário — creditadas honestamente como IA (NÃO como foto própria). Integradas: flexão (par topo/fundo), agachamento (par em pé/embaixo), prancha (única, preenche placeholder), escalador e pike (únicas, substituem fotos). Arquivos substituídos preservados em `_inbox/own/` + git, fora do build. NÃO incluídos com motivo: remada 1/2 (mostram pessoa deitada, sem barra), par abdominal (sem exercício no catálogo de 40 — teste trava a contagem), `capahome.png` (2,1 MB), arquivos ≥1,6 MB redundantes.

## 2026-10-13 — Série numerada 01–16 (cobertura 6→14 de 40)

- Publicado estava em dia (git limpo, Pages no commit verificado). 10 imagens da série integradas após inspeção visual (SHA-256 + tipo real): lateral, hollow, joelhos na barra, escalador (substitui `escalador.jpg`), L-sit, flexões joelhos/diamante/inclinada, búlgaro, afundo (ilustra `reverse-lunge`). NÃO incluídas: `05` (deitado vs pendurado), `06` (duplicata da 02), `08` (prancha alta vs antebraços), `11`/`14` (sem exercício), `13` (redundante com par animado), nomes não-identificáveis (aguardam nome do exercício), colagem 1,8 MB.

## 2026-10-13 — Cartões 20posicoes (cobertura 14→17 de 40) + correções

- 13 cartões 700x700 do usuário como identidade visual (9 vistos + 4 por nome na série uniforme). Preenchem: glute-bridge, calf-raises, handstand-wall (troca embed TODO por local — skill com mídia). `escalador.png` nunca existiu (sync gerou `.jpg`): `mountain-climbers` ficou com ref quebrada desde o deploy anterior (fallback placeholder salvou); corrigido de volta para `escalador.jpg` + crédito. `pike-pushup` também apontava para edição não aplicada; corrigido para `foto-pike.png`. Verificação nova: script `check-refs` (todo frames existe + tem crédito).

## 2026-10-13 — Parte B: diagnóstico do bug da tela /execucao

- Causa: `ExerciseMedia` renderizava `<img>` sem `onError`; com `frames` apontando para arquivos ainda não baixados (429), o navegador exibia o glifo de imagem quebrada sobre o fundo preto, e o botão Pausar aparecia porque o ramo de animação só checava o array, não o carregamento.
- Correção: estado de falha por src (derivado, sem efeito; troca de frames limpa o erro); qualquer erro cai no placeholder com nome + instruções (`cues`); Pausar/Reproduzir só no ramo de animação; botões desabilitados exibem motivo curto; shell 430→480 px (390 px inalterado).
- Testes: "imagem com erro → placeholder" (par e frame único) e "sem animação → sem botão Pausar".

## 2026-10-13 — posicoesnovas 700x700 (17 de 40, qualidade)

- Série neon em 700x700 sem legendas queimadas. 4 integradas após inspeção visual (hollow-700, joelhos-barra-700, escalador-700, lsit-700), substituindo as versões pequenas. Restante redundante com cartões, sem exercício ou incompatível (05 deitado, 08 prancha alta, 06 duplicata). check-refs verde; 36/36 testes; tsc/eslint limpos.

## 2026-10-13 — barras + mobilidade (30 de 40) + limpeza segura

- 13 arquivos de _inbox/barras integrados após inspeção visual (SHA-256 + tipo real): pilar pull inteiro (remada, remada elevada, dead hang, negativa, fixa, supinada, aberta), arqueiro, pseudo-planche e mobilidade completa (braços, gato-vaca, tronco, agachamento profundo). mob-tronco mostra posição inicial — ressalva em CREDITS.
- Limpeza: prancha-lateral.png obsoleta desaprovada/removida + scaffold src/assets/{hero,react,vite} removido (versionados). _inbox/ intacta (pergunta de escopo dispensada pelo usuário; apagamento lá é permanente).
- check-refs: 30 refs, 0 faltando, 0 sem crédito. 36/36 testes, tsc/eslint limpos. Detalhe da remada conferido visualmente.

## 2026-10-13 — pasta Novas (33 de 40)

- 3 de 4 integradas após inspeção visual (parede, ampla, muscle-up — este troca embed TODO por local). 03 (dips) REJEITADA: imagem mostra flexão com mãos em paralelas de chão, não mergulho. PENDING_WIDE removido (era o único uso). Faltam 7 para 100%: dips-parallettes, chair-squat, assisted-pistol, pistol, leg-raises (pendurada), hollow-rocks, tuck-front-lever (embed). check-refs 33/33; 36/36 testes.

## 2026-10-13 — novas2 (36 de 40, faltam 4)

- 3 de 7 integradas (cadeira, pernas pendurada, front lever — zera os TODOs de embed). 4 rejeitadas por não mostrarem o exercício (02 ajoelhada, 05/06 afundos, 08 sentada). Faltam: dips-parallettes, assisted-pistol, pistol, hollow-rocks. check-refs 36/36; 36/36 testes.

## 2026-10-13 — novas3: 40 de 40 (projeto com imagens completo)

- 4 integradas por nome, sem revisão de conteúdo (pedido expresso). Removida const PH (sem uso — tsc). check-refs 40/40 com crédito; 36/36 testes; build verde.

## 2026-10-14 — Aba Alongamentos + nav inferior + Iniciar a série

- Nova rota /alongamentos (Yoga 18 + Vôlei 20, 60 s por imagem com troca automática em ciclo, pausável, Wake Lock). BottomNav fixa (Início/Biblioteca/Programas/Alongar/Progresso/Ajustes) em todas as telas exceto treino/onboarding; nav antiga da Hoje removida.
- RunScreen (reps): botão vira Iniciar a série (janela de 60 s, auto-conclui e pula a imagem); tocar de novo conclui antes; Parar cancela. Link Créditos de mídia removido do treino (seção saiu dos Ajustes; crédito segue no detalhe do exercício).
- Testes novos do slideshow (avanço, pausa, grupo, reinício manual). 39/39 testes; tsc/eslint limpos.

## 2026-10-14 — Tempos ajustáveis + Descanse

- Perfil: seriesSec (padrão 60) e restSecOverride (vazio = programa). Ajustes ganha seção Tempos (10–600 s). RunScreen: painel de descanso com título Descanse…; botão Iniciar a série (Xs) usa configurado; descanso usa override. completeSet ganha 4º parâmetro opcional (testes antigos intactos). 40/40 testes.

## 2026-10-14 — Avanço automático pós-descanso + padrão 30/30

- Fim do descanso inicia sozinho o timer da próxima série (reps: seriesSec; hold: holdSec). Imagem já avança na conclusão da série; descanso mostra Descanse… + próximo. Verificado em navegador (série 10s/descanso 10s auto-iniciou).
- Padrões: série 30s, descanso 30s (Ajustes > Tempos; descanso vazio = 30s). Tempos ficam no perfil Dexie: recarregar não altera.

## 2026-10-14 — Hold: toque no timer rodando conclui (não reinicia)

- Causa do treino que nunca encerrava: no hold, tocar o botão com o timer rodando chamava setHoldLeft(holdSec) — reinício silencioso na mesma série. Quem vinha do fluxo de reps (toque = concluir) ficava em loop, inclusive na última série.
- Botão de hold agora igual ao de reps: rodando mostra `Xs… (concluir)` e o toque conclui a série. `Parar` segue cancelando.
- Regressão: `src/screens/__tests__/RunScreenHold.test.tsx` (toque conclui 1/2 → Descanse…; auto-início; toque na 2/2 → Treino concluído! + log). 41/41 testes. Verificado em navegador (inic-b: toque concluiu e avançou para Série 2/3).

## 2026-10-14 — Versão visível no rodapé (v1, v2, …)

- `src/version.ts` (`APP_VERSION`): rodapé da BottomNav + seção Versão nos Ajustes ("se não mudou após publicar, recarregue"). Incrementar a cada publicação.
- Motivo: "nada mudou" — SW com autoUpdate + cache offline podem segurar a versão antiga; além disso o muscoloso.pages.dev (Cloudflare) não acompanha a main. O marcador mostra em qual build o aparelho está.
- Teste: `src/components/__tests__/BottomNav.test.tsx`. 42/42 testes.

## 2026-10-14 — v2: remontagem da mídia a cada troca de exercício

- `RunScreen`: `<ExerciseMedia key={exercise.id}>` — estado interno (index/playing/videoOn) zera a cada exercício; entre séries do mesmo exercício a imagem permanece (correto).
- `inic-b` verificado: 4 exercícios com arquivos distintos (dados intactos). Validado no navegador (src troca a cada exercício). 42/42 testes; tsc/eslint/build limpos.

## 2026-10-14 — v3: avanço reverso com cartão 10 atualizado

- `_inbox/20posicoes/10_avanco_reverso.png` trocado pelo usuário (483681 bytes, SHA-256 `586909f5…564f9`, PNG real). Re-sincronizado via `sync-media:local` (bytes idênticos) para `foto-avanco-reverso.png`; allowlist + CREDITS atualizados. Nome do arquivo no app inalterado (reverse-lunge segue apontando para `foto-avanco-reverso.png`).

## 2026-10-14 — v4: botão Sair no treino

- `RunScreen` ganha `‹ Sair` no topo (volta ao início). Sair no meio é seguro: a sessão é salva a cada mudança e voltar ao treino oferece "Retomar treino". Teste estendido em `RunScreenHold.test.tsx`.

## 2026-10-14 — v5: último exercício sem descanso + parabéns direto

- `handleComplete`: no último item, `restSecOverride = 0` (sem painel de descanso) e a próxima série auto-inicia; na última série vai direto para `Parabéns! Treino concluído!`.
- Testes: `RunScreenHold.test.tsx` com 2 casos (último sem descanso; não-último com descanso). 43/43 testes; tsc/eslint/build limpos. E2E: último exercício concluído por toques até `Parabéns`, zero painéis de descanso.

## 2026-10-14 — v6: fim do flash de descanso no último exercício

- Causa: `restEndsAt = agora` (descanso 0) vs `now` defasado (ticker 500 ms) → `restMs > 0` por ~1 tick → painel `Descanse…` piscava e o efeito de fim de descanso bipava + auto-iniciava de novo (loop aparente).
- `completeSet` (`src/repo/activeSession.ts`): só grava `restEndsAt` quando descanso > 0; com 0 fica indefinido (`restRemainingMs = 0`). O auto-início do último exercício (timeout no `RunScreen`) segue único.
- Teste repo: `completeSet(..., 0)` sem `restEndsAt`. 44/44 testes; tsc/eslint/build limpos. E2E: `Parabéns` sem nenhum flash de descanso.

## 2026-10-14 — v10: auto-início ao abrir o treino + "Começar treino"

- `RunScreen`: ao montar com sessão ativa (estreia ou retomada sem descanso), a 1ª série inicia sozinha — sem o segundo toque. Só 1x por montagem, com perfil carregado; Parar/Pular seguem manuais.
- `Hoje`: botão passa a `Começar treino`.
- Testes `RunScreenHold` ajustados ao auto-início (clicar via `aria-label`). 46/46 testes.

## 2026-10-14 — v7: alongamento 30s + parabéns no fim + calibragem

- Padrão de cada imagem: 60s → 30s (`SLIDE_MS`); perfil ganha `alongamentoSec` e Ajustes > Tempos ganha o campo Alongamento (10–600 s, padrão 30s).
- Fim da sequência (18/18, 20/20) mostra `Parabéns! Sequência concluída!` + `Recomeçar` em vez de reiniciar sozinho; trocar de grupo reinicia.
- Testes de Alongamentos atualizados (30s, parabéns, recomeço, duração do perfil). 46/46 testes; tsc/eslint/build limpos. E2E: navegação até 18/18 → parabéns → recomeço em 1/18.
