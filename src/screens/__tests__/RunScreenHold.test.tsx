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

/** 1 item hold × 2 séries: cabe num teste rápido com descanso curto. */
const HOLD_SESSION: Session = {
  id: 'test-hold',
  title: 'Hold teste',
  items: [{ exerciseId: 'dead-hang', sets: 2, holdSec: 15, restSec: 60 }],
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
  it('concluir a série 1/2 pelo toque mostra Descanse…; na 2/2 encerra o treino', async () => {
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

    // Série 1/2: inicia e conclui pelo toque (antes era reinício silencioso).
    fireEvent.click(screen.getByText('Iniciar 15s'))
    expect(screen.getByText(/\(concluir\)/).textContent).toMatch(/15s/)
    fireEvent.click(screen.getByText(/\(concluir\)/))
    expect(screen.getByTestId('rest-panel')).toBeTruthy()
    expect(screen.getByText(/Série 2\/2/)).toBeTruthy()

    // Descanso de 10 s termina → próxima série inicia sozinha.
    // (Efeitos passivos só descarregam ao sair do act: é preciso
    // disparar o timeout de 0 ms do auto-início explicitamente.)
    act(() => {
      vi.advanceTimersByTime(11_000)
    })
    act(() => {
      vi.runOnlyPendingTimers()
    })
    fireEvent.click(screen.getByText(/\(concluir\)/))

    // Última série concluída pelo toque → tela de conclusão + log.
    expect(screen.getByText('Treino concluído!')).toBeTruthy()
    expect(repo.logs).toBe(1)
  })
})
