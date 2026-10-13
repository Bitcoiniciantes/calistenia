# Proposta Técnica — App Calistenia PWA (Fase 1)

> Stack 100% FREE, sem assinatura. Fase 1 sem backend, sem login, sem serviço pago. Qualquer hospedagem/deploy, mesmo gratuito, só com autorização explícita.

## 0. Resumo executivo

- PWA mobile-first (base 390 px), React + Vite + TypeScript + Tailwind + React Router, offline-first, 100% FREE.
- Foco: tela de execução com mídia visual dominante (~55% da altura) e texto mínimo.
- Dados locais via IndexedDB (Dexie) atrás de camada `Repository`.
- Catálogo inicial curado: 40+ exercícios, 5 cadeias de progressão (empurrar, puxar, pernas, core, mobilidade).
- Portão obrigatório: validar 5 exercícios reais com PARE e evidências antes de expandir.

## 1. Objetivo e não-objetivos

- **Objetivo:** organizar a rotina semanal e demonstrar COMO executar cada exercício (demonstração visual utilizável em todo exercício).
- **Não-objetivos na Fase 1:** login, backend, sincronização, multi-dispositivo, notificações agendadas, deploy/publicação.
- **Fase 2 (menção de escopo, sem implementação):** login e sync. Nada além disso nesta proposta.

## 2. Arquitetura Fase 1

- Rotas: Hoje, Execução, Biblioteca, Programas, Progresso, Ajustes, Onboarding.
- Catálogo estático curado em `src/data/exercises.ts` com `progressionChainId`, `prevId` e `nextId`.
- Componente `ExerciseMedia`: crossfade de 2 frames (~1,2 s por posição, ajustável), botão pausar/play, respeita `prefers-reduced-motion`, fallback para placeholder identificado.
- Sessão em andamento (`ActiveSession`) persistida a cada ação, com retomada ao reabrir o app.
- PWA instalável (manifest + service worker) com precache do app shell e da mídia local.
- Testes Vitest (regras de progressão, geração de programa, streak, integridade `prevId`/`nextId`), TypeScript estrito, ESLint.
- O armazenamento fica isolado em uma camada Repository, permitindo trocar Dexie por Supabase na Fase 2 sem reescrever as telas.

## 3. Modelo de dados

- `Pillar`: `push | pull | legs | core | skill | mobility`. `Level`: `1 | 2 | 3 | 4` (novato, iniciante, intermediário, avançado).
- `Exercise`: `id, namePt, nameEn, pillar, level, equipment (none|bar|parallettes|rings|bands), type (reps|hold), muscles[], cues[3-5 em pt-BR], commonMistakes[2-3], media{source: free-exercise-db|embed|local, ref, frames?}, progressionChainId, prevId?, nextId?`.
- `ProgressionChain`: `id, pillar, goal, steps[]` (ids em ordem do mais fácil ao mais difícil).
- `Program`: `id, namePt, level, daysPerWeek, goal (strength|muscle|skills|fatloss), sessions[]`.
- `Session`: `id, title, items[]` onde item = `exerciseId, sets, reps?, holdSec?, restSec`.
- `WorkoutLog`: `id, date, sessionId, entries[{exerciseId, sets[{reps?, holdSec?, done}]}], durationSec`.
- `UserProfile`: `startingPoints: Record<chainId, exerciseId>, equipment[], daysPerWeek, goal, reminderTime?`.
- `ActiveSession`: `sessionId, startedAt, currentItemIndex, currentSet, restEndsAt? (timestamp absoluto, não contador em memória), substitutions: Record<originalId, substitutoId>, entries`.
- Dificuldade é por exercício/cadeia, nunca nível global. `startingPoints` guarda um exercício inicial por cadeia.

## 4. Estratégia de mídia (origem, build e produção)

- **Fonte primária:** `free-exercise-db` (Unlicense, ~870 exercícios). Filtrar `equipment = body only` (ou nulo quando o nome indicar peso corporal). Não importar exercícios de academia.
- **GitHub raw aparece SOMENTE como origem do `scripts/sync-media.ts` em tempo de build.** Em produção a mídia vem de `/public/media` local, sem hotlink do GitHub raw e sem dependência de rede em execução.
- **Build offline:** `sync-media.ts` baixa SOMENTE arquivos listados explicitamente em `media-allowlist.json`. Não baixar automaticamente tudo que aparece no dataset. Toda mídia usada entra no precache do service worker.
- **Licença por arquivo:** a Unlicense do dataset não comprova a licença de cada imagem. Registrar origem, licença e atribuição exigida por arquivo em `CREDITS.md`. Se licença/atribuição não confirmável, bloquear o arquivo e registrar pendência. Zero mídia de terceiros com copyright incluída.
- **Proibido:** copiar, raspar ou fazer hotlink de GIFs/vídeos de apps comerciais (BetterMe, Calisteniapp etc.) ou de datasets/API com mídia de terceiros ou chave/limites (ex.: `hasaneyldrm/exercises-dataset`, ExerciseDB).
- **Skills sem cobertura no banco (planche, front lever, muscle-up, human flag, HSPU):** campo `mediaUrl` por exercício aceitando embed YouTube oficial (com `start`/`end` quando houver) ou arquivo local em `/public/media/`, marcados `TODO_USUARIO`.
- **Demonstração utilizável (3 formas, sem exceção):** (a) animação crossfade só se as 2 imagens forem coerentes (início/fim do mesmo movimento), com transição suave; (b) senão, início e fim lado a lado, estáticos, sem animação; (c) senão, placeholder identificado com nome + instruções, sem quebrar a tela.
- **Critério 1 s:** primeira apresentação visual utilizável em até 1 segundo com mídia já armazenada localmente. A animação completa não precisa terminar nesse prazo. Animação sempre pausável. `alt` em toda imagem, `prefers-reduced-motion` pausa automaticamente.
- **Fallback:** se a imagem falhar, exibir placeholder + texto das instruções.

## 5. Portão de validação (trava obrigatória)

- Validar 5 exercícios reais de pilares diferentes, incluindo pelo menos 1 isométrico (`hold`, ex.: prancha) e 1 com progressão (`prevId`/`nextId`).
- Verificar por exercício: qualidade visual, correspondência imagem↔exercício, licença, carregamento e funcionamento offline.
- Procedimento de teste offline: carregar/instalar online; abrir cada exercício de validação pelo menos 1x; ativar modo avião; fechar e reabrir o app; testar mídia, navegação, execução do treino e persistência da sessão. Registrar dispositivo, navegador e resultado. Separar teste automatizado de teste manual em dispositivo real.
- O teste em localhost + modo avião NÃO cobre instalação do PWA em celular (service worker em dispositivo real exige HTTPS ou túnel/rede local configurada). O teste manual em dispositivo real fica PENDENTE sem hospedagem. Não considerar localhost suficiente para aprovar instalação. Qualquer hospedagem/deploy, mesmo gratuito, só com autorização explícita.
- Reportar resultado com evidências (capturas/logs + manifest válido e service worker registrado conferidos no painel Application do Chrome DevTools + app reconhecido como instalável pelo Chrome + teste offline conforme este §5 + Lighthouse Performance ≥ 85 em mobile, sem categoria/score PWA) e PARE. Não avançar para o catálogo de 40 sem passar. Se a fonte falhar, informar a limitação e propor alternativa antes de expandir.
- Nota de verificação (13/10/2026): sem Lighthouse instalado no projeto (sem `package.json`); remoção da categoria PWA confirmada no Lighthouse v12.0.0 (2024-04-22) pelos critérios de instalabilidade atualizados do Chrome.

## 6. Plano incremental (ordem travada)

1. Estrutura do projeto, tema claro/escuro, rotas e `Repository` com Dexie.
2. PORTÃO DE VALIDAÇÃO (§5). PARE e reporte.
3. Biblioteca e detalhe do exercício com cadeia de progressão visual (degraus, atual destacado), busca e filtros por pilar/nível/equipamento.
4. Execução do treino: timer para `hold`, descanso com contagem regressiva +15 s e prévia do próximo, Mais fácil/Mais difícil via `prevId`/`nextId` na hora, Pular, Wake Lock, vibração/som opcionais, dicas e erros em acordeão recolhido, layout sem rolagem indevida em 390 px.
5. Programas, onboarding e Hoje. Programas: iniciante 3d full A/B, intermediário 4d (push/pull/legs/core+skills), avançado 6d PPL, Desafio 28 dias com cadeado e barra "X de 28". Onboarding em 3 passos (~1 min): mini-teste (flexões, barras, agachamentos) → ponto de partida por cadeia + equipamento + dias/semana + objetivo. Hoje: card do treino, Começar, streak, calendário semanal. Retomar treino se `ActiveSession` existir.
6. Progresso e Ajustes. Progresso: histórico, volume semanal por pilar, recordes por exercício, gráfico simples (recharts ou SVG próprio, ambos FREE). Ajustes: perfil, lembrete honesto (ver §7), exportar/importar JSON (backup), tema. Mensagens de limitação na UI, sem telas novas: (a) Ajustes — "Lembrete só dentro do app; sem notificação em segundo plano/com app fechado"; (b) Onboarding e Ajustes — "Exige primeiro carregamento online; depois funciona offline"; (c) Ajustes (quando aplicável) — "Limites no iOS: instalação/precache/Wake Lock/notificações podem variar".
7. PWA offline, testes, README (como rodar, como adicionar exercícios, como preencher `TODO_USUARIO`), `DECISIONS.md`, `CREDITS.md`, critérios verificáveis: manifest válido + service worker registrado (painel Application do Chrome DevTools) + instalável pelo Chrome + teste offline do §5 + Lighthouse Performance ≥ 85 em mobile (sem categoria/score PWA).

## 7. Regras de produto implementáveis

- Progressão sugestiva, nunca automática: 2 sessões completas no topo da faixa → sugerir `nextId`; 2 falhas na meta mínima → sugerir `prevId`.
- Equilíbrio push/pull medido em séries de trabalho semanais, não em número de exercícios. Não forçar puxar em toda sessão; pernas, core e skills podem ter foco próprio. Se equipamento (ex.: sem barra) ou objetivo impedir o equilíbrio, documentar a diferença e exibi-la ao usuário.
- Textos em pt-BR, diretos, sem promessa de resultado de saúde. Aviso curto de segurança no onboarding (dor, lesão ou condição médica → consultar profissional).
- Lembrete: refletir só capacidades reais do navegador/dispositivo. Não prometer notificação em segundo plano ou com app fechado; avisar a limitação na interface.

## 8. Limitações assumidas

- **L1 Mídia:** banco primário tem 2 fotos estáticas por exercício, coerência incerta; skills avançadas sem cobertura; licença de cada imagem precisa confirmação individual.
- **L2 Offline/instalação:** exige primeiro carregamento online + precache. Localhost + modo avião não valida instalação em celular; service worker em dispositivo real exige HTTPS ou túnel/rede local configurada. Teste manual em dispositivo real fica PENDENTE sem hospedagem, e hospedagem/deploy só com autorização explícita. iOS tem limites de precache, Wake Lock e notificações. UI: aviso em Onboarding e Ajustes sobre o primeiro carregamento online + aviso em Ajustes sobre limites do iOS quando aplicável.
- **L3 Notificações:** sem execução em segundo plano garantida; apenas lembrete in-app/visual. Nada de agendamento com app fechado. UI: aviso em Ajustes junto ao lembrete ("só dentro do app; sem segundo plano").
- **L4 Performance:** ~200 KB/ex. como meta inicial a validar no portão (não requisito); registrar o tamanho real medido no relatório do portão. Alvo: Lighthouse Performance ≥ 85 em mobile + primeira imagem utilizável ≤ 1 s com mídia local. Sem categoria/score PWA (removida no Lighthouse v12.0.0).
- **L5 Dados Fase 1:** sem sync, sem multi-dispositivo; backup manual via JSON; conflito `last-write-wins` só existiria na Fase 2.
- **L6 Escopo FREE:** sem GIFs/vídeos comerciais, sem API com chave, sem backend/serviço assinado. Fase 2 citada só como escopo futuro. UI: sem tela própria; limites comunicados pelos avisos de L2/L3 acima.

## 9. Riscos e mitigação

- **R1 Licença de imagem inválida →** allowlist explícita + `CREDITS.md` por arquivo + bloqueio por padrão.
- **R2 Animação incoerente →** validação manual no portão de 5 + regra lado-a-lado quando incoerente + `prefers-reduced-motion`.
- **R3 Offline/instalação quebra →** teste offline do §5 + precache auditado + manifest válido e SW registrado (painel Application do DevTools) + instalável pelo Chrome + Lighthouse Performance ≥ 85 em mobile; não aprovar sem evidência; dispositivo real PENDENTE sem hospedagem autorizada.
- **R4 Desequilíbrio push/pull sem barra →** filtro por equipamento + aviso explícito da diferença semanal.
- **R5 Scope creep →** ordem incremental travada (§6); não ampliar telas, programas ou gráficos antes de validar mídia + execução recuperável + offline.

## 10. Critérios de aceite verificáveis (Fase 1)

- [ ] Abre no celular, instala como app e usa sem internet — comprovado por teste offline do §5 + manifest válido e SW registrado (painel Application do DevTools) + instalável pelo Chrome + Lighthouse Performance ≥ 85 em mobile, não por declaração. Sem score PWA. Dispositivo real PENDENTE sem hospedagem autorizada.
- [ ] Todo exercício tem demonstração utilizável (animação coerente pausável, ou estáticas lado a lado, ou placeholder identificado), primeira apresentação ≤ 1 s com mídia local.
- [ ] Treino completo executável: séries, descanso, troca Mais fácil/Mais difícil, Pular, histórico; fechar/reabrir mantém tudo via `ActiveSession` com `restEndsAt` absoluto.
- [ ] Nenhuma mídia de terceiros com copyright; origem, licença e atribuição por arquivo em `CREDITS.md`.
- [ ] Testes Vitest verdes + `DECISIONS.md` para cada ambiguidade. Nenhum aceite declarado sem teste automatizado ou evidência.

## 11. Rubrica para a tutora avaliar

> Instrução: para cada item abaixo, dar nota de 0 a 10, 1 linha de justificativa e o trecho do MD que sustenta a nota.

| Item | Nota 0-10 | Justificativa (1 linha) | Evidência (trecho do MD) |
|------|-----------|--------------------------|---------------------------|
| 1. Isolamento do armazenamento (Repository permite trocar Dexie por Supabase sem reescrever telas). 10 = camada isolada nomeada com efeito explícito na troca; 5 = menciona abstração sem dizer onde isola nem o efeito. | (preencher) | (1 linha) | (colar trecho do §2) |
| 2. Portão de 5 trava expansão prematura (multi-pilar + hold + prev/next, PARE, evidências, avião). 10 = critérios + parada + evidências + PENDENTE dispositivo real; 5 = cita portão sem parada nem evidência. | (preencher) | (1 linha) | (colar trecho do §5) |
| 3. Licença de mídia por arquivo (allowlist + CREDITS por arquivo + bloqueio padrão + proibição hotlink/copyright). 10 = processo completo com build local em `/public/media`; 5 = cita licença genérica sem processo. | (preencher) | (1 linha) | (colar trecho do §4) |
| 4. Sessão retomável (`ActiveSession` com `restEndsAt` absoluto + persistência a cada ação + retomar). 10 = campos + absoluto + retomada; 5 = salva sessão sem timestamp absoluto. | (preencher) | (1 linha) | (colar trecho do §3/§6) |
| 5. Equilíbrio push/pull e dificuldade por cadeia (séries semanais, não nº exercícios; dificuldade por exercício; filtro equipamento). 10 = métrica + exceção documentada + ponto por cadeia; 5 = equilíbrio por nº exercícios ou nível global. | (preencher) | (1 linha) | (colar trecho do §7) |
| 6. Limitações honestas (sem notificação background, sem aprovar offline/animação/perf sem evidência, localhost insuficiente p/ instalação, PENDENTE sem hospedagem). 10 = limitações com reflexo na UI e no teste; 5 = cita limitação sem consequência. | (preencher) | (1 linha) | (colar trecho do §5/§8) |
| 7. Ordem incremental preserva o core (mídia + execução + offline antes de extras, sem scope creep). 10 = ordem travada com portão no passo 2; 5 = ordem listada permitindo antecipar telas. | (preencher) | (1 linha) | (colar trecho do §6) |
