// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { Repository } from '../../repo/Repository'
import type { Session, UserProfile } from '../../repo/types'
import { RunScreen } from '../RunScreen'

function stubRepo(profile?: UserProfile): Repository & { logs: number } {
  const stub: Repository & { logs: number } = {
    logs: 0,
    getProfile: () => Promise.resolve(profile),
    saveProfile: () => Promise.resolve(),
    listLogs: () => Promise.resolve([]),
    addLog: () => {
      stub.logs += 1
      return Promise.resolve()
    },
    getActiveSession: () => Promise.resolve(undefined),
    saveActiveSession: () => Promise.resolve(),
    clearActiveSession: () => Promise.resolve(),
  }
  return stub
}

/** 1 item hold × 2 séries: é o último exercício → sem descanso. */
const HOLD_SESSION: Session = {
  id: 'test-hold',
  title: 'Hold teste',
  items: [{ exerciseId: 'dead-hang', sets: 2, holdSec: 15, restSec: 60 }],
}

/** 2 itens hold × 1 série: o 1º (não-último) tem descanso normal. */
const TWO_ITEM_SESSION: Session = {
  id: 'test-hold-2',
  title: 'Hold teste 2',
  items: [
    { exerciseId: 'dead-hang', sets: 1, holdSec: 15, restSec: 60 },
    { exerciseId: 'dead-hang', sets: 1, holdSec: 15, restSec: 60 },
  ],
}

const PROFILE: UserProfile = {
  startingPoints: {},
  equipment: [],
  daysPerWeek: 3,
  goal: 'strength',
  seriesSec: 30,
  restSecOverride: 10,
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('RunScreen hold: toque no timer rodando conclui (não reinicia)', () => {
  it('último exercício: sem descanso, próxima série auto-inicia e encerra com parabéns', async () => {
    // Descanso usa relógio de parede: Date precisa ser falso para avançar.
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    })
    const repo = stubRepo(PROFILE)
    // findBy não funciona com timers falsos: monta com act assíncrono
    // (descarrega getActiveSession/getProfile) e usa consultas síncronas.
    await act(async () => {
      render(
        <MemoryRouter>
          <RunScreen session={HOLD_SESSION} repo={repo} />
        </MemoryRouter>,
      )
    })

    // Sair leva ao início sem perder o treino (sessão é salva a cada mudança).
    expect(
      screen.getByRole('link', { name: '‹ Sair' }).getAttribute('href'),
    ).toBe('/')

    // Série 1/2 do ÚLTIMO exercício: já começa sozinha ao abrir o treino.
    // Concluir pelo toque, sem descanso — a próxima auto-inicia.
    expect(screen.getByText(/\(concluir\)/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /\(concluir\)/ }))
    expect(screen.queryByTestId('rest-panel')).toBeNull()
    expect(screen.getByText(/Série 2\/2/)).toBeTruthy()
    act(() => {
      vi.runOnlyPendingTimers()
    })
    fireEvent.click(screen.getByRole('button', { name: /\(concluir\)/ }))

    // Última série concluída pelo toque → parabéns + log.
    expect(screen.getByText('Parabéns! Treino concluído!')).toBeTruthy()
    expect(repo.logs).toBe(1)
  })

  it('item não-último mantém o descanso de 10 s antes do auto-início', async () => {
    // Descanso usa relógio de parede: Date precisa ser falso para avançar.
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date'],
    })
    const repo = stubRepo(PROFILE)
    await act(async () => {
      render(
        <MemoryRouter>
          <RunScreen session={TWO_ITEM_SESSION} repo={repo} />
        </MemoryRouter>,
      )
    })

    // Item 1/2 (não-último) já auto-iniciou: concluir mostra descanso.
    expect(screen.getByText(/\(concluir\)/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /\(concluir\)/ }))
    expect(screen.getByTestId('rest-panel')).toBeTruthy()

    // Descanso termina → item 2/2 (último) inicia sozinho; concluir encerra.
    act(() => {
      vi.advanceTimersByTime(11_000)
    })
    act(() => {
      vi.runOnlyPendingTimers()
    })
    fireEvent.click(screen.getByRole('button', { name: /\(concluir\)/ }))
    expect(screen.getByText('Parabéns! Treino concluído!')).toBeTruthy()
    expect(repo.logs).toBe(1)
  })
})
