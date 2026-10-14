// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { alongamentoGroups, SLIDE_MS } from '../../data/alongamentos'
import { Alongamentos } from '../Alongamentos'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Alongamentos: dados', () => {
  it('Yoga 18 + Vôlei 20, ids únicos, arquivos no padrão', () => {
    expect(SLIDE_MS).toBe(30_000)
    expect(alongamentoGroups).toHaveLength(2)
    const yoga = alongamentoGroups[0]!
    const voley = alongamentoGroups[1]!
    expect(yoga.items).toHaveLength(18)
    expect(voley.items).toHaveLength(20)
    const ids = [...yoga.items, ...voley.items].map((i) => i.id)
    expect(new Set(ids).size).toBe(38)
    for (const i of yoga.items) expect(i.file).toMatch(/^\/media\/yoga-\d{2}\.png$/)
    for (const i of voley.items) expect(i.file).toMatch(/^\/media\/voley-\d{2}\.png$/)
  })
})

describe('Alongamentos: troca automática de 30 s', () => {
  it('avança sozinho após 30 s, pausa congela, grupo troca', () => {
    vi.useFakeTimers()
    render(<Alongamentos />)
    expect(screen.getByTestId('alongamento-nome').textContent).toBe('Gato camelo')
    expect(screen.getByTestId('alongamento-pos').textContent).toBe('1/18')

    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(screen.getByTestId('alongamento-nome').textContent).toBe('Postura da criança')
    expect(screen.getByTestId('alongamento-pos').textContent).toBe('2/18')

    fireEvent.click(screen.getByText('Pausar'))
    expect(screen.getByTestId('alongamento-timer').textContent).toBe('Pausado')
    act(() => {
      vi.advanceTimersByTime(60_000)
    })
    expect(screen.getByTestId('alongamento-nome').textContent).toBe('Postura da criança')

    fireEvent.click(screen.getByText('Vôlei (20)'))
    expect(screen.getByTestId('alongamento-nome').textContent).toBe('Círculos com os braços')
    expect(screen.getByTestId('alongamento-pos').textContent).toBe('1/20')
  })

  it('navegação manual reinicia a contagem', () => {
    vi.useFakeTimers()
    render(<Alongamentos />)
    act(() => {
      vi.advanceTimersByTime(15_000)
    })
    expect(screen.getByTestId('alongamento-timer').textContent).toBe('Próxima em 15s')
    fireEvent.click(screen.getByText('Próxima'))
    expect(screen.getByTestId('alongamento-nome').textContent).toBe('Postura da criança')
    expect(screen.getByTestId('alongamento-timer').textContent).toBe('Próxima em 30s')
  })

  it('no fim (18/18) mostra Parabéns em vez de reiniciar; Recomeçar volta ao início', () => {
    vi.useFakeTimers()
    render(<Alongamentos />)
    // 17 avanços até 18/18; o 18º encerra com parabéns.
    for (let k = 0; k < 17; k += 1) {
      fireEvent.click(screen.getByText('Próxima'))
    }
    expect(screen.getByTestId('alongamento-pos').textContent).toBe('18/18')
    act(() => {
      vi.advanceTimersByTime(30_000)
    })
    expect(screen.getByTestId('alongamento-fim')).toBeTruthy()
    expect(screen.queryByTestId('alongamento-img')).toBeNull()
    fireEvent.click(screen.getByText('Recomeçar'))
    expect(screen.getByTestId('alongamento-pos').textContent).toBe('1/18')
  })

  it('usa a duração do perfil quando configurada', async () => {
    vi.useFakeTimers()
    const repo = {
      getProfile: () =>
        Promise.resolve({
          startingPoints: {},
          equipment: [],
          daysPerWeek: 3,
          goal: 'strength',
          alongamentoSec: 10,
        }),
    } as never
    await act(async () => {
      render(<Alongamentos repo={repo} />)
    })
    expect(screen.getByTestId('alongamento-timer').textContent).toBe('Próxima em 10s')
    act(() => {
      vi.advanceTimersByTime(10_000)
    })
    expect(screen.getByTestId('alongamento-pos').textContent).toBe('2/18')
  })
})
