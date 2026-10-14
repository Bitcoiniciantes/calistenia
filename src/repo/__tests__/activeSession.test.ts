import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  completeSet,
  currentExerciseId,
  isFinished,
  restRemainingMs,
  startSessionWithEntries,
  substitute,
} from '../activeSession'
import { DexieRepository } from '../dexieRepo'
import { gateSession } from '../../data/gateSession'

describe('ActiveSession: helpers puros', () => {
  it('inicia com entradas zeradas e avança série com restEndsAt absoluto', () => {
    const started = startSessionWithEntries(gateSession, '2026-10-13T10:00:00.000Z')
    expect(started.currentItemIndex).toBe(0)
    expect(started.currentSet).toBe(1)
    expect(started.entries).toHaveLength(gateSession.items.length)

    const after = completeSet(started, gateSession, '2026-10-13T10:00:00.000Z')
    expect(after.entries[0]?.sets[0]?.done).toBe(true)
    expect(after.currentSet).toBe(2)
    // Timestamp absoluto: início + 60 s de descanso.
    expect(after.restEndsAt).toBe('2026-10-13T10:01:00.000Z')
    expect(restRemainingMs(after, Date.parse('2026-10-13T10:00:30.000Z'))).toBe(30000)
    expect(restRemainingMs(after, Date.parse('2026-10-13T10:02:00.000Z'))).toBe(0)
  })

  it('override de descanso vence o programa; sem override usa o programa', () => {
    const t0 = '2026-10-13T10:00:00.000Z'
    const started = startSessionWithEntries(gateSession, t0)
    const com = completeSet(started, gateSession, t0, 30)
    expect(com.restEndsAt).toBe('2026-10-13T10:00:30.000Z')
    const sem = completeSet(started, gateSession, t0)
    expect(sem.restEndsAt).toBe('2026-10-13T10:01:00.000Z')
  })

  it('descanso 0 não grava restEndsAt (sem flash do painel)', () => {
    const t0 = '2026-10-13T10:00:00.000Z'
    const started = startSessionWithEntries(gateSession, t0)
    const com = completeSet(started, gateSession, t0, 0)
    expect(com.restEndsAt).toBeUndefined()
    expect(restRemainingMs(com, Date.parse(t0))).toBe(0)
    expect(com.entries[0]?.sets[0]?.done).toBe(true)
    expect(com.currentSet).toBe(2)
  })

  it('substituição troca o exercício atual e registra o mapa', () => {
    const started = startSessionWithEntries(gateSession)
    const sub = substitute(started, gateSession, 'pushup-wide')
    expect(currentExerciseId(sub, gateSession)).toBe('pushup-wide')
    expect(sub.substitutions['pushup']).toBe('pushup-wide')
  })

  it('completar todas as séries conclui a sessão', () => {
    let s = startSessionWithEntries(gateSession, '2026-10-13T10:00:00.000Z')
    const total = gateSession.items.reduce((a, i) => a + i.sets, 0)
    for (let k = 0; k < total; k += 1) {
      s = completeSet(s, gateSession, '2026-10-13T10:00:00.000Z')
    }
    expect(isFinished(s, gateSession)).toBe(true)
    expect(s.restEndsAt).toBeUndefined()
  })
})

describe('ActiveSession: persistência/retomada (Dexie)', () => {
  beforeEach(async () => {
    const repo = new DexieRepository()
    await repo.clearActiveSession()
  })

  it('salva a cada mudança e retoma após "fechar" (nova instância)', async () => {
    const repo1 = new DexieRepository()
    let s = startSessionWithEntries(gateSession, '2026-10-13T10:00:00.000Z')
    s = completeSet(s, gateSession, '2026-10-13T10:00:00.000Z')
    await repo1.saveActiveSession(s)

    // "Fecha e reabre": nova instância lê o mesmo IndexedDB.
    const repo2 = new DexieRepository()
    const resumed = await repo2.getActiveSession()
    expect(resumed?.sessionId).toBe('gate-fullbody')
    expect(resumed?.currentSet).toBe(2)
    expect(resumed?.entries[0]?.sets[0]?.done).toBe(true)
    expect(resumed?.restEndsAt).toBe('2026-10-13T10:01:00.000Z')
  })
})
