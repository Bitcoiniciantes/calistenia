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

## 2026-10-13 — Parte B: diagnóstico do bug da tela /execucao

- Causa: `ExerciseMedia` renderizava `<img>` sem `onError`; com `frames` apontando para arquivos ainda não baixados (429), o navegador exibia o glifo de imagem quebrada sobre o fundo preto, e o botão Pausar aparecia porque o ramo de animação só checava o array, não o carregamento.
- Correção: estado de falha por src (derivado, sem efeito; troca de frames limpa o erro); qualquer erro cai no placeholder com nome + instruções (`cues`); Pausar/Reproduzir só no ramo de animação; botões desabilitados exibem motivo curto; shell 430→480 px (390 px inalterado).
- Testes: "imagem com erro → placeholder" (par e frame único) e "sem animação → sem botão Pausar".
