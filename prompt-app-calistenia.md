# PROMPT — App de Rotina de Calistenia (pt-BR)

## 1. PAPEL
Você é um engenheiro full-stack sênior e designer de produto mobile-first. Construa, de forma incremental e testável, um app web (PWA) de treino de calistenia para uso pessoal. Antes de codar, apresente em no máximo 15 linhas o plano de arquitetura e peça confirmação apenas se houver bloqueio real. Caso contrário, siga em frente.

## 2. CONTEXTO
- Usuário: pratica calistenia, quer um app que organize a rotina semanal e mostre COMO fazer cada exercício (imagem/animação em destaque).
- Referências analisadas:
  - **BetterMe (desafio de 28 dias)**: grade de dias com cadeado, barra "X de 28 exercícios", demonstração animada do exercício em destaque, texto curto de instrução.
  - **Calisteniapp**: 700+ exercícios, programas por nível e objetivo, progressões de habilidades (handstand, muscle-up, front lever), construtor de treino, lembrete de horário, "ver programas que incluem este exercício".
  - **Caliscool**: 240+ exercícios, 3 níveis, timer para isométricos (pranchas, holds), planilha de séries/reps.
  - **Calistree / Calisthenics Master**: cada exercício tem versão fácil, intermediária e avançada.
  - Padrão geral: 4 pilares (empurrar, puxar, pernas, core) e progressão em 4 níveis (novato, iniciante, intermediário, avançado). Regra de equilíbrio: para cada empurrar, um puxar.
- Princípio de produto: a tela do exercício é o coração do app. A mídia visual ocupa o maior espaço e o texto é mínimo.

## 3. FASES
- **Fase 1 (esta entrega): MVP sem login.** Dados salvos localmente no dispositivo.
- **Fase 2 (somente após eu aprovar a Fase 1): login e sincronização.** Deixe a arquitetura preparada (camada de repositório abstrata), mas NÃO implemente autenticação agora.

## 4. STACK (Fase 1)
- React + Vite + TypeScript, Tailwind CSS, React Router.
- PWA instalável (manifest + service worker), funcionando offline depois do primeiro carregamento.
- Persistência: IndexedDB via Dexie. Interface `Repository` isolando o armazenamento (para trocar por Supabase na Fase 2).
- Sem backend. Sem chaves de API no front-end.
- Fase 2 (futuro): Supabase Auth (e-mail + Google) e Postgres com RLS por `user_id`.

## 5. FONTE DE MÍDIA DOS EXERCÍCIOS (crítico)
Objetivo: cada exercício exibe uma demonstração visual clara.

1. **Fonte principal: `free-exercise-db`** (domínio público, licença Unlicense, ~870 exercícios).
   - JSON: `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json`
   - Imagens: prefixar o caminho de cada imagem com `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/` (ex.: `Air_Bike/0.jpg`).
   - Campos: `id, name, force, level, mechanic, equipment, primaryMuscles, secondaryMuscles, instructions[], category, images[]`.
   - Cada exercício tem normalmente 2 imagens estáticas (posição inicial e final). Crie o componente `ExerciseMedia` que alterna as duas imagens com crossfade suave e pausa em cada posição (ritmo ajustável; ponto de partida ~1,2 s por posição), com botão pausar/play. Só anime se as duas imagens mostrarem etapas coerentes do movimento (ver seção 14); caso contrário, exiba início e fim lado a lado, sem animação. Respeitar `prefers-reduced-motion`.
   - Filtre `equipment` = "body only" (ou nulo quando o nome indicar peso corporal). Muitos exercícios do banco são de academia; não os importe.
   - Esse banco NÃO cobre bem skills de calistenia (planche, front lever, muscle-up, human flag, handstand push-up). Para esses, use a fonte 2.
2. **Skills e progressões avançadas: vídeo curto incorporado.** Campo `mediaUrl` por exercício aceitando: (a) link do YouTube (usar iframe de embed oficial, com `start`/`end` quando houver) ou (b) arquivo local em `/public/media/`. Deixe esses links como placeholders claramente marcados `TODO_USUARIO` para eu preencher com vídeos que eu escolher.
3. **Proibido:** copiar, raspar ou fazer hotlink de GIFs/vídeos de apps comerciais (BetterMe, Calisteniapp etc.) ou de datasets cuja mídia tenha copyright de terceiros (ex.: o dataset `hasaneyldrm/exercises-dataset` e a API ExerciseDB usam mídia com direitos reservados ou com chave/limites). Se eu quiser GIFs depois, a licença deve ser verificada primeiro.
4. **Fallback:** se a imagem falhar, mostrar ilustração placeholder com o nome do exercício e o texto das instruções, sem quebrar a tela.
5. Prefira baixar e embutir a mídia selecionada no build (`/public/media`) para funcionar offline e não depender do GitHub raw em produção. Faça um script `scripts/sync-media.ts` que baixa só os exercícios usados pelo app. Baixar não implica poder redistribuir: só inclua arquivos cuja licença for confirmada e registre origem, licença e atribuição exigida, por exercício, em `CREDITS.md`. Toda a mídia usada deve entrar no precache do service worker, e o funcionamento deve ser verificado em modo avião após a primeira instalação.
6. A licença do dataset (Unlicense) não comprova, por si só, a licença de cada imagem. O `sync-media.ts` deve baixar somente arquivos previamente aprovados em uma lista explícita (`media-allowlist.json`). Não baixar nem incluir arquivos automaticamente só porque aparecem no dataset. Se a licença ou a atribuição exigida não puder ser confirmada, bloquear o arquivo e registrar a pendência em `CREDITS.md`.

## 6. MODELO DE DADOS
```ts
type Pillar = 'push' | 'pull' | 'legs' | 'core' | 'skill' | 'mobility';
type Level = 1 | 2 | 3 | 4; // novato, iniciante, intermediário, avançado

interface Exercise {
  id: string;
  namePt: string;
  nameEn: string;
  pillar: Pillar;
  level: Level;
  equipment: 'none' | 'bar' | 'parallettes' | 'rings' | 'bands';
  type: 'reps' | 'hold';          // hold usa timer
  muscles: string[];
  cues: string[];                 // 3 a 5 dicas curtas de execução, em pt-BR
  commonMistakes: string[];       // 2 a 3 erros comuns
  media: { source: 'free-exercise-db' | 'embed' | 'local'; ref: string; frames?: string[] };
  progressionChainId: string;
  prevId?: string;                // regressão (mais fácil)
  nextId?: string;                // progressão (mais difícil)
}

interface ProgressionChain { id: string; pillar: Pillar; goal: string; steps: string[] } // ids em ordem

interface Program {
  id: string; namePt: string; level: Level; daysPerWeek: number;
  goal: 'strength' | 'muscle' | 'skills' | 'fatloss';
  sessions: Session[];
}
interface Session { id: string; title: string; items: SessionItem[] }
interface SessionItem { exerciseId: string; sets: number; reps?: number; holdSec?: number; restSec: number }

interface WorkoutLog { id: string; date: string; sessionId: string; entries: { exerciseId: string; sets: { reps?: number; holdSec?: number; done: boolean }[] }[]; durationSec: number }
interface UserProfile {
  startingPoints: Record<string, string>; // chainId -> exerciseId inicial recomendado (dificuldade é por exercício, não global)
  equipment: string[]; daysPerWeek: number; goal: string; reminderTime?: string;
}

// Sessão em andamento, persistida a cada mudança para sobreviver a fechar/recarregar o app
interface ActiveSession {
  sessionId: string; startedAt: string;
  currentItemIndex: number; currentSet: number;
  restEndsAt?: string;                         // timestamp absoluto, não contador em memória
  substitutions: Record<string, string>;       // exerciseId original -> substituto (mais fácil/difícil)
  entries: WorkoutLog['entries'];
}
```

### Conteúdo inicial (curado por mim, mínimo)
Crie `src/data/exercises.ts` com pelo menos 40 exercícios e estas cadeias de progressão (do mais fácil ao mais difícil):
- **Empurrar:** flexão na parede → flexão inclinada → flexão de joelhos → flexão padrão → flexão diamante / pike → mergulho em paralelas → flexão arqueiro → pseudo planche.
- **Puxar:** remada invertida → remada invertida pés elevados → barra com negativa → barra fixa → barra pegada aberta → barra pegada supinada → muscle-up (progressão).
- **Pernas:** agachamento na cadeira → agachamento livre → avanço reverso → agachamento búlgaro → pistol assistido → pistol.
- **Core:** prancha → prancha lateral → elevação de joelhos → elevação de pernas → hollow hold → L-sit.
- **Mobilidade/aquecimento:** círculos de braço, gato-vaca, rotação de tronco, agachamento profundo com pausa.
Valide a coerência de `prevId/nextId` com um teste automatizado.

### Programas iniciais
- Iniciante 3 dias/semana (full body A/B/A, depois B/A/B), com progressão automática.
- Intermediário 4 dias (push / pull / legs / core+skills).
- Avançado 6 dias (PPL duas vezes).
- **Desafio de 28 dias** (inspirado no BetterMe): dias bloqueados que liberam em sequência, barra de progresso "X de 28".

## 7. TELAS E FLUXOS (mobile-first, 390 px de largura-base)
1. **Onboarding (3 passos, 1 minuto):** mini-teste (quantas flexões, barras, agachamentos consegue) que recomenda um ponto de partida por cadeia de progressão (não um nível único para tudo), equipamento disponível, dias por semana e objetivo. Gera o programa recomendado; a dificuldade de cada exercício respeita equipamento e progressões cadastradas.
2. **Hoje:** treino do dia em card, botão "Começar", sequência de dias (streak), semana em calendário.
3. **Execução do treino (tela principal):**
   - Mídia do exercício ocupando ~55% da altura, em loop.
   - Nome, série atual (ex.: 2/4), meta de reps ou timer de hold.
   - Botões: "Concluí a série" (grande), "Mais fácil" / "Mais difícil" (troca pelo `prevId`/`nextId` na hora), "Pular".
   - Descanso com contagem regressiva, +15 s, e prévia do próximo exercício.
   - Dicas e erros comuns em acordeão recolhido.
   - Wake Lock para a tela não apagar. Vibração e som opcionais ao fim do descanso.
   - A sessão em andamento (`ActiveSession`) é salva a cada ação; ao reabrir o app, oferecer "Retomar treino".
   - Deve funcionar sem rolagem indevida em 390 px: mídia, timer e botões visíveis juntos.
4. **Biblioteca:** busca, filtros por pilar, nível e equipamento; grid de cards com miniatura animada; detalhe com a cadeia de progressão visual (degraus, o atual destacado).
5. **Programas:** lista, detalhe com as sessões, "ativar programa".
6. **Progresso:** histórico de treinos, volume semanal por pilar, recordes pessoais por exercício, gráfico simples (recharts ou SVG próprio).
7. **Ajustes:** perfil, lembrete conforme as capacidades reais do navegador/dispositivo (a Notification API não garante notificação agendada com o app fechado; não prometer isso, e avisar a limitação na interface), exportar/importar dados em JSON (backup), tema claro/escuro.

## 8. REGRAS DE PRODUTO
- Progressão sugerida: se completar todas as séries no topo da faixa de reps em 2 sessões seguidas, sugerir avançar para o `nextId`. Se falhar a meta mínima em 2 sessões, sugerir regredir. Sempre uma sugestão, nunca troca automática.
- Equilíbrio: no conjunto semanal, equilibrar o volume de empurrar e puxar, medido em séries de trabalho semanais (não em número de exercícios). Não forçar puxar em toda sessão; pernas, core e skills podem ter foco próprio. Quando o equipamento disponível (ex.: sem barra) ou o objetivo do programa impedir o equilíbrio, documentar a diferença e mostrá-la ao usuário.
- Textos em pt-BR, tom direto e motivador, sem jargão excessivo. Evite prometer resultados de saúde.
- Incluir aviso curto de segurança no onboarding (consultar profissional em caso de dor, lesão ou condição médica).

## 9. QUALIDADE E ACESSIBILIDADE
- TypeScript estrito, ESLint, testes com Vitest para: regras de progressão, geração de programa, cálculo de streak, integridade dos dados.
- Manifest válido e service worker registrado (painel Application do Chrome DevTools), app reconhecido como instalável pelo Chrome, e Lighthouse Performance ≥ 85 em mobile (a categoria PWA foi removida no Lighthouse v12; não usar score PWA).
- Contraste AA, alvos de toque ≥ 44 px, `prefers-reduced-motion` pausa as animações automaticamente, `alt` em toda imagem.
- Estados de carregamento, vazio e erro em todas as telas.

## 10. ORDEM DE ENTREGA
1. Estrutura do projeto, tema, rotas e `Repository` com Dexie.
2. **PORTÃO DE VALIDAÇÃO (não avance sem passar):** 5 exercícios reais de pilares diferentes (incluir um isométrico e um com progressão) com mídia, origem e licença verificadas, componente `ExerciseMedia` e uma tela de execução mínima testada em 390 px e em modo avião. Reporte o resultado com evidências (capturas/logs) e PARE. Se a fonte não passar, informe a limitação e proponha alternativa antes de expandir o catálogo.
   - **Procedimento de teste offline (registrar no relatório):** instalar ou carregar o app online; abrir cada exercício de validação pelo menos uma vez; ativar o modo avião; fechar e reabrir o app; testar mídia, navegação, execução do treino e persistência da sessão. Informar dispositivo, navegador e resultado. Separar o que foi teste automatizado do que foi teste manual em dispositivo real. Se não houver acesso a um dispositivo real, executar os testes automatizados e registrar o teste manual em dispositivo como PENDENTE. Não declarar o portão aprovado integralmente até que essa verificação seja realizada.
3. Biblioteca e detalhe do exercício com cadeia de progressão.
4. Execução do treino (timer, descanso, mais fácil/difícil).
5. Programas, onboarding e tela Hoje.
6. Progresso e Ajustes (backup JSON).
7. PWA offline, testes e README com como rodar, como adicionar exercícios e como preencher os `TODO_USUARIO` de vídeo.

A cada etapa: diga o que foi feito em até 5 linhas, rode os testes e mostre como eu verifico.

## 11. CRITÉRIOS DE ACEITE (Fase 1)
Cada critério deve ser comprovado por teste automatizado ou evidência (captura, log, relatório Lighthouse de Performance, verificação de manifest/service worker/instalabilidade no DevTools e teste offline conforme o procedimento da seção 10). Não declare aprovado sem evidência.
- Consigo abrir no celular, instalar como app e usar sem internet.
- Todo exercício apresenta uma demonstração visual utilizável: animação quando as imagens forem coerentes, imagens estáticas lado a lado quando não forem, ou placeholder identificado quando não houver mídia aprovada. A primeira apresentação visual ocorre em até 1 segundo nas condições de teste definidas, com a mídia já armazenada localmente. A animação completa não precisa terminar nesse prazo. Quando houver animação, consigo pausá-la.
- Consigo fazer um treino completo: séries, descanso, troca para mais fácil/difícil, e ele aparece no histórico.
- Fechar e reabrir o app mantém tudo.
- Nenhuma mídia de terceiros com copyright incluída; origem e licença de cada fonte listadas em `CREDITS.md`.

## 12. FASE 2 (NÃO IMPLEMENTAR AGORA, APENAS PREPARAR)
- Supabase Auth (e-mail e Google), tabelas espelhando `UserProfile`, `WorkoutLog`, programas personalizados.
- RLS: cada linha só acessível pelo `user_id` dono.
- Migração: no primeiro login, oferecer enviar os dados locais para a conta.
- Resolução de conflitos: último `updatedAt` vence.

## 13. DÚVIDAS
Se algo estiver ambíguo, escolha o padrão mais simples, registre a decisão em `DECISIONS.md` e continue. Exceção: os portões e restrições da seção 14 valem sempre.

## 14. PORTÕES DE VALIDAÇÃO E RESTRIÇÕES

- Antes de expandir o catálogo, validar 5 exercícios reais de pilares diferentes, incluindo pelo menos um exercício isométrico e um com progressão. Verificar qualidade visual, correspondência entre imagem e exercício, licença, carregamento e funcionamento offline.
- Não considerar duas imagens alternadas como animação válida se não demonstrarem claramente as posições do movimento. Usar transição suave e respeitar `prefers-reduced-motion`.
- Não redistribuir mídia sem licença verificável. Registrar fonte, licença e atribuição exigida por arquivo em `CREDITS.md`.
- Persistir o treino em andamento, incluindo exercício, série atual, descanso restante quando aplicável e substituições realizadas. Recuperar a sessão após fechar ou recarregar o aplicativo.
- Tratar os critérios de aceitação como testes verificáveis. Não declarar offline, animação, instalação PWA ou desempenho aprovados sem evidências.
- Se a mídia da fonte principal for insuficiente, informar a limitação e propor uma alternativa antes de ampliar o catálogo.
- Notificações e lembretes devem refletir as capacidades reais do navegador e do dispositivo; não prometer execução em segundo plano sem suporte comprovado.
- Na geração de treinos, equilibrar o volume de empurrar e puxar no conjunto semanal, sem forçar exercícios incompatíveis com o objetivo de cada sessão.
- O onboarding recomenda o nível inicial; a dificuldade deve ser definida por exercício, respeitando equipamento disponível e progressões cadastradas.
- Controle de escopo: preservar a ordem incremental da seção 10 e não ampliar funcionalidades (telas, programas, gráficos) antes de validar a experiência central de treino (mídia, treino recuperável, offline).
- Nenhuma publicação, deploy ou integração de Fase 2 sem minha autorização explícita.
