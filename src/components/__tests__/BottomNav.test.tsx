// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen } from '@testing-library/react'
import { BottomNav } from '../BottomNav'
import { APP_VERSION } from '../../version'

afterEach(() => {
  cleanup()
})

describe('BottomNav: versão visível no rodapé', () => {
  it('mostra o APP_VERSION para saber se a página atualizou', () => {
    render(
      <MemoryRouter>
        <BottomNav />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('app-version').textContent).toBe(APP_VERSION)
  })
})
