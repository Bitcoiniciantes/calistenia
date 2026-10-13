import type {
  ActiveSession,
  UserProfile,
  WorkoutLog,
} from './types'

/**
 * Camada de persistência. A Fase 1 implementa com Dexie (IndexedDB);
 * a Fase 2 troca por Supabase sem reescrever as telas.
 */
export interface Repository {
  getProfile(): Promise<UserProfile | undefined>
  saveProfile(profile: UserProfile): Promise<void>
  listLogs(): Promise<WorkoutLog[]>
  addLog(log: WorkoutLog): Promise<void>
  getActiveSession(): Promise<ActiveSession | undefined>
  saveActiveSession(session: ActiveSession): Promise<void>
  clearActiveSession(): Promise<void>
}
