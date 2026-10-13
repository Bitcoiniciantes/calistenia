import { describe, expect, it } from 'vitest'
import { exerciseById } from '../../data/exercises'
import { programById } from '../../data/programs'
import {
  analyzeBalance,
  calcStreak,
  challengeUnlocked,
  startingPointsFromTest,
  weeklyVolumeByPillar,
} from '../training'

describe('onboarding: ponto de partida por cadeia', () => {
  it('iniciante zero vai para base de cada cadeia', () => {
    expect(startingPointsFromTest({ pushups: 0, pullups: 0, squats: 0 })).toEqual({
      'push-1': 'wall-pushup',
      'pull-1': 'inverted-row',
      'legs-1': 'chair-squat',
      'core-1': 'plank',
    })
  })

  it('avançado vai para progressões (dificuldade por exercício)', () => {
    const pts = startingPointsFromTest({ pushups: 30, pullups: 10, squats: 35 })
    expect(pts['push-1']).toBe('pushup-wide')
    expect(pts['pull-1']).toBe('pullup')
    expect(pts['legs-1']).toBe('bulgarian-split')
  })
})

describe('equilíbrio push/pull semanal', () => {
  it('programa 4d com barra fica equilibrado', () => {
    const b = analyzeBalance(programById['intermediario-4d']!, exerciseById, ['bar', 'parallettes'])
    expect(b.pushSets).toBeGreaterThan(0)
    expect(b.pullSets).toBeGreaterThan(0)
    expect(b.balanced).toBe(true)
    expect(b.note).toBeUndefined()
  })

  it('sem barra documenta a diferença em vez de forçar', () => {
    const b = analyzeBalance(programById['intermediario-4d']!, exerciseById, [])
    expect(b.pullSets).toBe(0)
    expect(b.note).toMatch(/Sem barra/)
  })
})

describe('desafio 28 dias: desbloqueio em sequência', () => {
  it('libera o próximo dia após concluir em ordem', () => {
    expect(challengeUnlocked('desafio-28d', [], 28)).toBe(1)
    expect(
      challengeUnlocked(
        'desafio-28d',
        [{ sessionId: 'desafio-dia-1' }, { sessionId: 'desafio-dia-2' }],
        28,
      ),
    ).toBe(3)
  })

  it('programa normal não trava nada', () => {
    expect(challengeUnlocked('iniciante-3d', [], 2)).toBe(2)
  })
})

describe('streak e volume', () => {  it('conta dias consecutivos até hoje', () => {
    const today = new Date('2026-10-13T12:00:00')
    expect(
      calcStreak(
        ['2026-10-13T08:00', '2026-10-12T08:00', '2026-10-11T08:00', '2026-10-09T08:00'],
        today,
      ),
    ).toBe(3)
  })

  it('volume semanal soma séries concluídas por pilar', () => {
    const vol = weeklyVolumeByPillar(
      [
        {
          date: '2026-10-12T08:00',
          entries: [
            { exerciseId: 'pushup', sets: [{ done: true }, { done: true }, { done: false }] },
            { exerciseId: 'plank', sets: [{ done: true }] },
          ],
        },
      ],
      exerciseById,
      new Date('2026-10-13T12:00:00'),
    )
    expect(vol['push']).toBe(2)
    expect(vol['core']).toBe(1)
  })
})

describe('integridade do catálogo (40)', () => {
  it('40 exercícios, ids únicos, prev/next simétricos e cadeias existentes', async () => {
    const { exercises, progressionChains } = await import('../../data/exercises')
    expect(exercises.length).toBe(40)
    const byId = Object.fromEntries(exercises.map((e) => [e.id, e]))
    expect(Object.keys(byId)).toHaveLength(40)
    const chains = new Map(progressionChains.map((c) => [c.id, new Set(c.steps)]))
    for (const e of exercises) {
      expect(chains.has(e.progressionChainId)).toBe(true)
      for (const [rel, otherId] of [['prevId', e.prevId], ['nextId', e.nextId]] as const) {
        if (!otherId) continue
        const other = byId[otherId]
        const planned = chains.get(e.progressionChainId)?.has(otherId)
        expect(other !== undefined || planned === true).toBe(true)
        if (other) {
          if (rel === 'prevId') expect(other.nextId).toBe(e.id)
          else expect(other.prevId).toBe(e.id)
        }
      }
      expect(e.cues.length).toBeGreaterThanOrEqual(3)
      expect(e.commonMistakes.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('programas só referenciam exercícios existentes', async () => {
    const { exercises } = await import('../../data/exercises')
    const { programs } = await import('../../data/programs')
    const ids = new Set(exercises.map((e) => e.id))
    for (const p of programs) {
      expect(p.sessions.length).toBeGreaterThan(0)
      for (const s of p.sessions)
        for (const item of s.items) expect(ids.has(item.exerciseId)).toBe(true)
    }
    expect(programs.find((p) => p.id === 'desafio-28d')?.sessions).toHaveLength(28)
  })
})
