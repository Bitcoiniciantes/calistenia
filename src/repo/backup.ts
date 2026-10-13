import type { UserProfile, WorkoutLog } from './types'

/** Valida backup JSON sem tocar nos dados (rejeita com mensagem clara). */
export function parseBackup(text: string): {
  profile?: UserProfile
  logs?: WorkoutLog[]
} {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('Arquivo inválido: não é um JSON válido.')
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Arquivo inválido: formato inesperado.')
  }
  const { profile, logs } = data as {
    profile?: unknown
    logs?: unknown
  }
  if (profile !== undefined) {
    const p = profile as Record<string, unknown>
    if (
      typeof p['daysPerWeek'] !== 'number' ||
      typeof p['goal'] !== 'string' ||
      typeof p['equipment'] === 'undefined'
    ) {
      throw new Error('Arquivo inválido: perfil incompleto.')
    }
  }
  if (logs !== undefined) {
    if (!Array.isArray(logs)) throw new Error('Arquivo inválido: histórico incompleto.')
    for (const log of logs as Record<string, unknown>[]) {
      if (typeof log['id'] !== 'string' || !Array.isArray(log['entries'])) {
        throw new Error('Arquivo inválido: treino incompleto no histórico.')
      }
    }
  }
  return { profile: profile as UserProfile | undefined, logs: logs as WorkoutLog[] | undefined }
}
