// Tipos de dados — contrato da Fase 1 (baseado no §6 do prompt).
// A dificuldade é por exercício/cadeia, nunca um nível global.

export type Pillar = 'push' | 'pull' | 'legs' | 'core' | 'skill' | 'mobility'
export type Level = 1 | 2 | 3 | 4 // novato, iniciante, intermediário, avançado

export interface ExerciseMediaRef {
  source: 'free-exercise-db' | 'embed' | 'local' | 'own'
  ref: string
  /** Frames locais em /public/media. Ausente = mídia bloqueada/pendente -> placeholder. */
  frames?: string[]
  /**
   * Vídeo próprio do usuário (GIF/WebM/MP4 em /public/media). Tem prioridade
   * sobre `frames` (Commons fica como reserva). `poster` é o quadro estático.
   */
  video?: { src: string; poster?: string }
}

export interface Exercise {
  id: string
  namePt: string
  nameEn: string
  pillar: Pillar
  level: Level
  equipment: 'none' | 'bar' | 'parallettes' | 'rings' | 'bands'
  type: 'reps' | 'hold' // hold usa timer
  muscles: string[]
  cues: string[] // 3 a 5 dicas curtas de execução, em pt-BR
  commonMistakes: string[] // 2 a 3 erros comuns
  media: ExerciseMediaRef
  progressionChainId: string
  prevId?: string // regressão (mais fácil)
  nextId?: string // progressão (mais difícil)
}

export interface ProgressionChain {
  id: string
  pillar: Pillar
  goal: string
  steps: string[] // ids em ordem, do mais fácil ao mais difícil
}

export interface SessionItem {
  exerciseId: string
  sets: number
  reps?: number
  holdSec?: number
  restSec: number
}

export interface Session {
  id: string
  title: string
  items: SessionItem[]
}

export interface Program {
  id: string
  namePt: string
  level: Level
  daysPerWeek: number
  goal: 'strength' | 'muscle' | 'skills' | 'fatloss'
  sessions: Session[]
}

export interface WorkoutSet {
  reps?: number
  holdSec?: number
  done: boolean
}

export interface WorkoutEntry {
  exerciseId: string
  sets: WorkoutSet[]
}

export interface WorkoutLog {
  id: string
  date: string
  sessionId: string
  entries: WorkoutEntry[]
  durationSec: number
}

export interface UserProfile {
  startingPoints: Record<string, string> // chainId -> exerciseId inicial
  equipment: string[]
  daysPerWeek: number
  goal: string
  reminderTime?: string
  activeProgramId?: string
  soundOn?: boolean
  /** Janela da série em segundos (padrão 30 quando ausente). */
  seriesSec?: number
  /** Descanso entre séries em segundos (ausente = 30 padrão). */
  restSecOverride?: number
  /** Duração de cada imagem do alongamento em segundos (padrão 30). */
  alongamentoSec?: number
}

// Sessão em andamento, persistida a cada mudança para sobreviver a
// fechar/recarregar o app. restEndsAt é timestamp absoluto (ISO),
// nunca contador em memória.
export interface ActiveSession {
  sessionId: string
  startedAt: string
  currentItemIndex: number
  currentSet: number
  restEndsAt?: string
  substitutions: Record<string, string> // original -> substituto
  entries: WorkoutEntry[]
}
