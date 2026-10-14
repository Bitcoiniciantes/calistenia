import type {
  ActiveSession,
  Session,
  WorkoutEntry,
} from './types'

/** Funções puras da sessão em andamento (testáveis sem IndexedDB). */

export function buildEntries(session: Session): WorkoutEntry[] {
  return session.items.map((item) => ({
    exerciseId: item.exerciseId,
    sets: Array.from({ length: item.sets }, () => ({ done: false })),
  }))
}

export function startSession(
  sessionId: string,
  nowIso: string = new Date().toISOString(),
): ActiveSession {
  return {
    sessionId,
    startedAt: nowIso,
    currentItemIndex: 0,
    currentSet: 1,
    substitutions: {},
    entries: [],
  }
}

/** Inicializa as entradas a partir da sessão (chamar 1x ao começar). */
export function startSessionWithEntries(
  session: Session,
  nowIso: string = new Date().toISOString(),
): ActiveSession {
  return {
    ...startSession(session.id, nowIso),
    entries: buildEntries(session),
  }
}

export function isFinished(
  active: ActiveSession,
  session: Session,
): boolean {
  return active.currentItemIndex >= session.items.length
}

function restUntil(nowIso: string, restSec: number): string {
  return new Date(Date.parse(nowIso) + restSec * 1000).toISOString()
}

/**
 * Marca a série atual como concluída e avança.
 * Descanso usa timestamp absoluto (restEndsAt), nunca contador em memória.
 * restSecOverride (do perfil) vence o descanso do programa quando definido.
 */
export function completeSet(
  prev: ActiveSession,
  session: Session,
  nowIso: string = new Date().toISOString(),
  restSecOverride?: number,
): ActiveSession {
  const next: ActiveSession = structuredClone(prev)
  const item = session.items[next.currentItemIndex]
  if (!item) return next

  // Carimba o alvo da série (reps ou segundos): concluir = cumpriu o
  // prescrito, e é disso que os recordes pessoais são calculados.
  const entry = next.entries[next.currentItemIndex]
  entry?.sets.splice(next.currentSet - 1, 1, {
    ...(entry.sets[next.currentSet - 1] ?? { done: false }),
    done: true,
    ...(item.reps !== undefined ? { reps: item.reps } : {}),
    ...(item.holdSec !== undefined ? { holdSec: item.holdSec } : {}),
  })
  // Descanso após a série concluída. Com 0 (último exercício), não grava
  // restEndsAt: evita flash do painel por relógio defasado (restMs > 0
  // por ~1 tick) e bipe/auto-início espúrios do efeito de fim de descanso.
  const restSec = restSecOverride ?? item.restSec
  if (restSec > 0) {
    next.restEndsAt = restUntil(nowIso, restSec)
  }

  if (next.currentSet < item.sets) {
    next.currentSet += 1
    return next
  }
  if (next.currentItemIndex + 1 < session.items.length) {
    next.currentItemIndex += 1
    next.currentSet = 1
    return next
  }
  // Última série do último exercício: sessão concluída.
  next.currentItemIndex = session.items.length
  next.restEndsAt = undefined
  return next
}

/** Pula o exercício atual (séries restantes marcadas como não feitas). */
export function skipItem(
  prev: ActiveSession,
  session: Session,
  nowIso: string = new Date().toISOString(),
): ActiveSession {
  const next: ActiveSession = structuredClone(prev)
  const item = session.items[next.currentItemIndex]
  if (!item) return next
  const entry = next.entries[next.currentItemIndex]
  if (entry) {
    for (let i = next.currentSet - 1; i < entry.sets.length; i += 1) {
      entry.sets[i] = { ...(entry.sets[i] ?? { done: false }), done: false }
    }
  }
  void nowIso
  next.restEndsAt = undefined
  next.currentItemIndex += 1
  next.currentSet = 1
  return next
}

/** Troca o exercício atual por regressão/progressão (prevId/nextId). */
export function substitute(
  prev: ActiveSession,
  session: Session,
  toExerciseId: string,
): ActiveSession {
  const next: ActiveSession = structuredClone(prev)
  const item = session.items[next.currentItemIndex]
  if (!item) return next
  const originalId = item.exerciseId
  next.substitutions[originalId] = toExerciseId
  const entry = next.entries[next.currentItemIndex]
  if (entry) entry.exerciseId = toExerciseId
  return next
}

/** Resolve o id efetivo do exercício atual (com substituição). */
export function currentExerciseId(
  active: ActiveSession,
  session: Session,
): string | undefined {
  const item = session.items[active.currentItemIndex]
  if (!item) return undefined
  return active.substitutions[item.exerciseId] ?? item.exerciseId
}

/** Ms restantes de descanso (0 quando sem descanso). */
export function restRemainingMs(
  active: ActiveSession,
  nowMs: number = Date.now(),
): number {
  if (!active.restEndsAt) return 0
  return Math.max(0, Date.parse(active.restEndsAt) - nowMs)
}
