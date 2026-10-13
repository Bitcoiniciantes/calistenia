import { describe, expect, it } from 'vitest'
import { exerciseById, exercises, progressionChains } from '../../data/exercises'

describe('integridade prevId/nextId (portão)', () => {
  it('todo exercício tem id único e cadeia existente', () => {
    const ids = new Set(exercises.map((e) => e.id))
    expect(ids.size).toBe(exercises.length)
    const chainIds = new Set(progressionChains.map((c) => c.id))
    for (const e of exercises) {
      expect(chainIds.has(e.progressionChainId)).toBe(true)
    }
  })

  it('prevId/nextId são simétricos e apontam para exercício ou passo planejado da cadeia', () => {
    const chainSteps = new Map(
      progressionChains.map((c) => [c.id, new Set(c.steps)]),
    )
    for (const e of exercises) {
      for (const [rel, otherId] of [
        ['prevId', e.prevId],
        ['nextId', e.nextId],
      ] as const) {
        if (!otherId) continue
        const other = exerciseById[otherId]
        const planned = chainSteps.get(e.progressionChainId)?.has(otherId)
        expect(
          other !== undefined || planned === true,
          `${e.id}.${rel} -> ${otherId} inexistente`,
        ).toBe(true)
        if (other) {
          // Simetria: prev aponta de volta com next e vice-versa.
          if (rel === 'prevId') expect(other.nextId).toBe(e.id)
          else expect(other.prevId).toBe(e.id)
        }
      }
    }
  })

  it('portão cobre 4+ pilares, 1 hold e 1 par com progressão', () => {
    const pillars = new Set(exercises.map((e) => e.pillar))
    expect(pillars.size).toBeGreaterThanOrEqual(4)
    expect(exercises.some((e) => e.type === 'hold')).toBe(true)
    expect(exercises.some((e) => e.prevId ?? e.nextId)).toBe(true)
  })
})
