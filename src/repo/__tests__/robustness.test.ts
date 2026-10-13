import { describe, expect, it } from 'vitest'
import { parseBackup } from '../backup'
import { restRemainingMs, startSessionWithEntries } from '../activeSession'
import { suggestProgression } from '../training'
import { gateSession } from '../../data/gateSession'

describe('progressão sugestiva', () => {
  const top = [
    [
      { done: true, reps: 10, targetReps: 10 },
      { done: true, reps: 10, targetReps: 10 },
    ],
    [
      { done: true, reps: 12, targetReps: 10 },
      { done: true, reps: 10, targetReps: 10 },
    ],
  ]
  it('2 sessões no topo -> up', () => {
    expect(suggestProgression(top)).toBe('up')
  })
  it('2 sessões com falha -> down', () => {
    expect(
      suggestProgression([
        [{ done: true }, { done: false }],
        [{ done: false }],
      ]),
    ).toBe('down')
  })
  it('misto ou 1 sessão -> stay', () => {
    expect(suggestProgression([top[0]!])).toBe('stay')
    expect(suggestProgression([top[0]!, [{ done: false }]])).toBe('stay')
  })
})

describe('robustez: relógio e backup', () => {
  it('descanso usa timestamp absoluto (relógio alterado não quebra)', () => {
    const s = startSessionWithEntries(gateSession, '2026-10-13T10:00:00.000Z')
    const resting = {
      ...s,
      restEndsAt: '2026-10-13T10:01:00.000Z',
    }
    // Relógio adiantado: descanso zerado, sem negativo.
    expect(restRemainingMs(resting, Date.parse('2026-10-13T12:00:00.000Z'))).toBe(0)
    // Relógio atrasado: ainda mostra o restante real.
    expect(restRemainingMs(resting, Date.parse('2026-10-13T09:59:00.000Z'))).toBe(120000)
  })

  it('backup inválido é rejeitado com mensagem clara', () => {
    expect(() => parseBackup('não é json')).toThrow(/JSON válido/)
    expect(() => parseBackup('[]')).toThrow(/formato inesperado/)
    expect(() => parseBackup('{"profile":{}}')).toThrow(/perfil incompleto/)
    expect(() => parseBackup('{"logs":{}}')).toThrow(/histórico/)
  })

  it('backup válido passa', () => {
    const out = parseBackup(
      '{"profile":{"startingPoints":{},"equipment":[],"daysPerWeek":3,"goal":"strength"},"logs":[]}',
    )
    expect(out.profile?.daysPerWeek).toBe(3)
    expect(out.logs).toEqual([])
  })
})
