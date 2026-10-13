import type { Session } from '../repo/types'

/** Sessão mínima do portão: os 5 exercícios de validação. */
export const gateSession: Session = {
  id: 'gate-fullbody',
  title: 'Treino do portão (corpo inteiro)',
  items: [
    { exerciseId: 'pushup', sets: 3, reps: 8, restSec: 60 },
    { exerciseId: 'pushup-wide', sets: 3, reps: 8, restSec: 60 },
    { exerciseId: 'inverted-row', sets: 3, reps: 8, restSec: 60 },
    { exerciseId: 'bodyweight-squat', sets: 3, reps: 12, restSec: 60 },
    { exerciseId: 'plank', sets: 3, holdSec: 30, restSec: 60 },
  ],
}
