import type { Exercise, Program } from './types'

/** Lógica pura de treino (testável sem IndexedDB). */

export interface MiniTest {
  pushups: number
  pullups: number
  squats: number
}

/** Ponto de partida por cadeia a partir do mini-teste (nunca nível global). */
export function startingPointsFromTest(t: MiniTest): Record<string, string> {
  const push =
    t.pushups >= 25 ? 'pushup-wide' : t.pushups >= 15 ? 'pushup' : t.pushups >= 10 ? 'knee-pushup' : t.pushups >= 5 ? 'incline-pushup' : 'wall-pushup'
  const pull =
    t.pullups >= 8 ? 'pullup' : t.pullups >= 3 ? 'negative-pullup' : t.pullups >= 1 ? 'dead-hang' : 'inverted-row'
  const legs =
    t.squats >= 30 ? 'bulgarian-split' : t.squats >= 20 ? 'reverse-lunge' : t.squats >= 10 ? 'bodyweight-squat' : 'chair-squat'
  const core = t.pushups >= 15 ? 'hollow-hold' : 'plank'
  return { 'push-1': push, 'pull-1': pull, 'legs-1': legs, 'core-1': core }
}

export interface Balance {
  pushSets: number
  pullSets: number
  balanced: boolean
  /** Explicação quando o equilíbrio é impossível (ex.: sem barra). */
  note?: string
}

/**
 * Equilíbrio push/pull em SÉRIES de trabalho semanais (não nº de exercícios).
 * Filtra pelo equipamento disponível; se puxar zerar por falta de barra,
 * documenta a diferença em vez de forçar.
 */
export function analyzeBalance(
  program: Program,
  byId: Record<string, Exercise>,
  equipment: string[],
): Balance {
  let pushSets = 0
  let pullSets = 0
  let skippedPull = 0
  for (const session of program.sessions) {
    for (const item of session.items) {
      const e = byId[item.exerciseId]
      if (!e) continue
      if (e.equipment !== 'none' && !equipment.includes(e.equipment)) {
        if (e.pillar === 'pull') skippedPull += item.sets
        continue
      }
      if (e.pillar === 'push') pushSets += item.sets
      if (e.pillar === 'pull') pullSets += item.sets
    }
  }
  const max = Math.max(pushSets, pullSets, 1)
  const balanced = Math.abs(pushSets - pullSets) / max <= 0.2
  const note =
    pullSets === 0 && skippedPull > 0
      ? `Sem barra: ${skippedPull} séries de puxar ignoradas na semana; adicione uma barra para equilibrar com as ${pushSets} de empurrar.`
      : undefined
  return { pushSets, pullSets, balanced, note }
}

/** Dias do desafio desbloqueados em sequência (concluídos + próximo). */
export function challengeUnlocked(
  programId: string,
  logs: { sessionId: string }[],
  total: number,
): number {
  if (!programId.startsWith('desafio')) return total
  const done = new Set(
    logs.filter((l) => l.sessionId.startsWith('desafio-dia-')).map((l) => l.sessionId),
  )
  let unlocked = 1
  while (unlocked <= total && done.has(`desafio-dia-${unlocked}`)) unlocked += 1
  return Math.min(unlocked, total)
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Sequência de dias consecutivos com treino, terminando hoje (ou ontem). */
export function calcStreak(logDates: string[], today: Date = new Date()): number {
  const days = new Set(
    logDates.map((iso) => dayKey(new Date(iso))),
  )
  let streak = 0
  const cursor = new Date(today)
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1)
  while (days.has(dayKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Volume semanal (últimos 7 dias) em séries por pilar. */
export interface RatedSet {
  done: boolean
  reps?: number
  targetReps?: number
}

/**
 * Progressão SUGESTIVA (nunca automática):
 * - 2 sessões com todas as séries no topo da faixa -> 'up' (sugerir nextId).
 * - 2 sessões com falha na meta mínima (série não concluída) -> 'down' (prevId).
 * - Senão -> 'stay'.
 */
export function suggestProgression(lastTwoSessions: RatedSet[][]): 'up' | 'down' | 'stay' {
  if (lastTwoSessions.length < 2) return 'stay'
  const [a, b] = lastTwoSessions.slice(-2) as [RatedSet[], RatedSet[]]
  const topped = (sets: RatedSet[]) =>
    sets.length > 0 &&
    sets.every(
      (s) => s.done && s.reps !== undefined && s.targetReps !== undefined && s.reps >= s.targetReps,
    )
  const failed = (sets: RatedSet[]) => sets.some((s) => !s.done)
  if (topped(a) && topped(b)) return 'up'
  if (failed(a) && failed(b)) return 'down'
  return 'stay'
}export function weeklyVolumeByPillar(
  logs: { date: string; entries: { exerciseId: string; sets: { done: boolean }[] }[] }[],
  byId: Record<string, Exercise>,
  today: Date = new Date(),
): Record<string, number> {
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - 7)
  const vol: Record<string, number> = {}
  for (const log of logs) {
    if (new Date(log.date) < cutoff) continue
    for (const entry of log.entries) {
      const pillar = byId[entry.exerciseId]?.pillar ?? 'unknown'
      vol[pillar] = (vol[pillar] ?? 0) + entry.sets.filter((s) => s.done).length
    }
  }
  return vol
}
