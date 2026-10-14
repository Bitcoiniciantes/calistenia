// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen } from '@testing-library/react'
import { BottomNav } from '../BottomNav'

afterEach(() => {
  cleanup()
})

describe('BottomNav: tab bar com ícone + rótulo', () => {
  it('5 abas, sem Ajustes (foi para a engrenagem do cabeçalho)', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>,
    )
    for (const label of [
      'Início',
      'Biblioteca',
      'Programas',
      'Alongar',
      'Progresso',
    ]) {
      expect(screen.getByText(label)).toBeTruthy()
    }
    expect(screen.queryByText('Ajustes')).toBeNull()
    expect(
      screen.getByRole('navigation', { name: 'Principal' }),
    ).toBeTruthy()
  })
})
