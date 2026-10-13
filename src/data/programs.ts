import type { Program, Session } from '../repo/types'

function s(id: string, title: string, items: Session['items']): Session {
  return { id, title, items }
}

const A = s('gate-fullbody', 'Full body A', [
  { exerciseId: 'pushup', sets: 3, reps: 8, restSec: 60 },
  { exerciseId: 'inverted-row', sets: 3, reps: 6, restSec: 60 },
  { exerciseId: 'bodyweight-squat', sets: 3, reps: 10, restSec: 60 },
  { exerciseId: 'plank', sets: 3, holdSec: 20, restSec: 60 },
])

const B = s('inic-b', 'Full body B', [
  { exerciseId: 'knee-pushup', sets: 3, reps: 10, restSec: 60 },
  { exerciseId: 'dead-hang', sets: 3, holdSec: 15, restSec: 60 },
  { exerciseId: 'reverse-lunge', sets: 3, reps: 8, restSec: 60 },
  { exerciseId: 'glute-bridge', sets: 3, reps: 12, restSec: 60 },
])

const PUSH = s('inter-push', 'Push', [
  { exerciseId: 'pushup-wide', sets: 4, reps: 8, restSec: 90 },
  { exerciseId: 'diamond-pushup', sets: 3, reps: 8, restSec: 90 },
  { exerciseId: 'dips-parallettes', sets: 3, reps: 6, restSec: 90 },
  { exerciseId: 'pike-pushup', sets: 3, reps: 8, restSec: 90 },
])

const PULL = s('inter-pull', 'Pull', [
  { exerciseId: 'inverted-row-elevated', sets: 4, reps: 8, restSec: 90 },
  { exerciseId: 'negative-pullup', sets: 3, reps: 5, restSec: 90 },
  { exerciseId: 'pullup', sets: 3, reps: 5, restSec: 90 },
  { exerciseId: 'dead-hang', sets: 2, holdSec: 20, restSec: 60 },
])

const LEGS = s('inter-legs', 'Pernas', [
  { exerciseId: 'bodyweight-squat', sets: 4, reps: 15, restSec: 90 },
  { exerciseId: 'bulgarian-split', sets: 3, reps: 8, restSec: 90 },
  { exerciseId: 'reverse-lunge', sets: 3, reps: 10, restSec: 90 },
  { exerciseId: 'calf-raises', sets: 3, reps: 15, restSec: 60 },
])

const CORE_SKILLS = s('inter-core', 'Core + skills', [
  { exerciseId: 'plank', sets: 3, holdSec: 40, restSec: 60 },
  { exerciseId: 'hollow-hold', sets: 3, holdSec: 20, restSec: 60 },
  { exerciseId: 'knee-raises', sets: 3, reps: 8, restSec: 60 },
  { exerciseId: 'handstand-wall', sets: 3, holdSec: 15, restSec: 90 },
])

const PPL_PUSH = s('ppl-push', 'Push', PUSH.items)
const PPL_PULL = s('ppl-pull', 'Pull', PULL.items)
const PPL_LEGS = s('ppl-legs', 'Pernas', LEGS.items)
const PPL_PUSH2 = s('ppl-push2', 'Push 2', [
  ...PUSH.items.map((i) => ({ ...i, sets: Math.max(2, i.sets - 1) })),
])
const PPL_PULL2 = s('ppl-pull2', 'Pull 2', [
  ...PULL.items.map((i) => ({ ...i, sets: Math.max(2, i.sets - 1) })),
])
const PPL_LEGS2 = s('ppl-legs2', 'Pernas 2', [
  ...LEGS.items.map((i) => ({ ...i, sets: Math.max(2, i.sets - 1) })),
])

/** Desafio de 28 dias: sessões curtas alternando foco; desbloqueio em sequência. */
function challenge28(): Session[] {
  const base: Session['items'][] = [
    [
      { exerciseId: 'wall-pushup', sets: 2, reps: 10, restSec: 45 },
      { exerciseId: 'chair-squat', sets: 2, reps: 10, restSec: 45 },
      { exerciseId: 'plank', sets: 2, holdSec: 15, restSec: 45 },
    ],
    [
      { exerciseId: 'knee-pushup', sets: 2, reps: 8, restSec: 45 },
      { exerciseId: 'glute-bridge', sets: 2, reps: 10, restSec: 45 },
      { exerciseId: 'dead-hang', sets: 2, holdSec: 10, restSec: 45 },
    ],
    [
      { exerciseId: 'pushup', sets: 3, reps: 6, restSec: 60 },
      { exerciseId: 'bodyweight-squat', sets: 3, reps: 12, restSec: 60 },
      { exerciseId: 'hollow-hold', sets: 2, holdSec: 15, restSec: 60 },
    ],
    [
      { exerciseId: 'inverted-row', sets: 3, reps: 6, restSec: 60 },
      { exerciseId: 'reverse-lunge', sets: 3, reps: 8, restSec: 60 },
      { exerciseId: 'side-plank', sets: 2, holdSec: 15, restSec: 60 },
    ],
  ]
  return Array.from({ length: 28 }, (_, i) => ({
    id: `desafio-dia-${i + 1}`,
    title: `Dia ${i + 1} de 28`,
    items: base[i % base.length] ?? base[0] ?? [],
  }))
}

export const programs: Program[] = [
  { id: 'iniciante-3d', namePt: 'Iniciante · 3 dias (full body)', level: 1, daysPerWeek: 3, goal: 'strength', sessions: [A, B] },
  { id: 'intermediario-4d', namePt: 'Intermediário · 4 dias', level: 2, daysPerWeek: 4, goal: 'strength', sessions: [PUSH, PULL, LEGS, CORE_SKILLS] },
  { id: 'avancado-6d', namePt: 'Avançado · 6 dias (PPL 2x)', level: 3, daysPerWeek: 6, goal: 'muscle', sessions: [PPL_PUSH, PPL_PULL, PPL_LEGS, PPL_PUSH2, PPL_PULL2, PPL_LEGS2] },
  { id: 'desafio-28d', namePt: 'Desafio 28 dias', level: 1, daysPerWeek: 7, goal: 'fatloss', sessions: challenge28() },
]

export const programById: Record<string, Program> = Object.fromEntries(
  programs.map((p) => [p.id, p]),
)

export { gateSession } from './gateSession'
