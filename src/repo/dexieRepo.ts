import Dexie, { type Table } from 'dexie'
import type { Repository } from './Repository'
import type {
  ActiveSession,
  UserProfile,
  WorkoutLog,
} from './types'

interface KvRow {
  key: string
  value: unknown
}

class CalisteniaDb extends Dexie {
  logs!: Table<WorkoutLog, string>
  kv!: Table<KvRow, string>

  constructor() {
    super('calistenia')
    this.version(1).stores({
      logs: 'id, date, sessionId',
      kv: 'key',
    })
  }
}

const PROFILE_KEY = 'profile'
const ACTIVE_SESSION_KEY = 'activeSession'

/** Implementação IndexedDB via Dexie (Fase 1, 100% local). */
export class DexieRepository implements Repository {
  private db = new CalisteniaDb()

  async getProfile(): Promise<UserProfile | undefined> {
    const row = await this.db.kv.get(PROFILE_KEY)
    return row?.value as UserProfile | undefined
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.db.kv.put({ key: PROFILE_KEY, value: profile })
  }

  async listLogs(): Promise<WorkoutLog[]> {
    return this.db.logs.orderBy('date').reverse().toArray()
  }

  async addLog(log: WorkoutLog): Promise<void> {
    await this.db.logs.put(log)
  }

  async getActiveSession(): Promise<ActiveSession | undefined> {
    const row = await this.db.kv.get(ACTIVE_SESSION_KEY)
    return row?.value as ActiveSession | undefined
  }

  async saveActiveSession(session: ActiveSession): Promise<void> {
    await this.db.kv.put({ key: ACTIVE_SESSION_KEY, value: session })
  }

  async clearActiveSession(): Promise<void> {
    await this.db.kv.delete(ACTIVE_SESSION_KEY)
  }
}
