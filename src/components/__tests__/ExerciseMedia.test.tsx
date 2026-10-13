// @vitest-environment jsdom
// Fixtures pose-a/pose-b: SVG original de teste (fora do catálogo).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ExerciseMedia } from '../ExerciseMedia'
import poseA from '../__fixtures__/pose-a.svg?url'
import poseB from '../__fixtures__/pose-b.svg?url'

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: () => ({
      matches,
      media: '',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  })
}

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const ALT = 'Demonstração de fixture'

describe('ExerciseMedia: regra de decisão', () => {
  it('sem frames -> placeholder identificado com alt', () => {
    render(<ExerciseMedia alt={ALT} exerciseName="Fixture" />)
    expect(screen.getByTestId('exercise-placeholder')).toBeDefined()
    expect(screen.getByAltText(ALT)).toBeDefined()
  })

  it('1 frame (hold) -> imagem estática com alt, sem placeholder', () => {
    render(
      <ExerciseMedia frames={[poseA]} alt={ALT} exerciseName="Fixture" />,
    )
    expect(screen.getByTestId('exercise-static')).toBeDefined()
    expect(screen.queryByTestId('exercise-placeholder')).toBeNull()
    expect(screen.queryByTestId('exercise-media')).toBeNull()
    expect(screen.getByAltText(ALT)).toBeDefined()
  })

  it('2 frames incoerentes -> lado a lado estático, sem botão de pausa', () => {
    render(
      <ExerciseMedia
        frames={[poseA, poseB]}
        coherent={false}
        alt={ALT}
        exerciseName="Fixture"
      />,
    )
    expect(screen.getByTestId('exercise-side-by-side')).toBeDefined()
    expect(screen.queryByTestId('exercise-media')).toBeNull()
    expect(screen.queryByRole('button', { name: /animação/ })).toBeNull()
    // Ambas as imagens têm alt (a segunda identifica a posição final).
    expect(screen.getByAltText(ALT)).toBeDefined()
    expect(screen.getByAltText(`${ALT} (posição final)`)).toBeDefined()
  })
})

describe('ExerciseMedia: crossfade com 2 frames coerentes', () => {
  it('alterna o frame ativo a cada ritmo e pausa/play funciona', () => {
    vi.useFakeTimers()
    render(
      <ExerciseMedia
        frames={[poseA, poseB]}
        alt={ALT}
        exerciseName="Fixture"
        rhythmMs={1200}
      />,
    )
    const active = () =>
      screen.getByTestId('exercise-frame-active').getAttribute('src')
    const first = active()
    act(() => {
      vi.advanceTimersByTime(1200)
    })
    expect(active()).not.toBe(first)

    // Pausar congela no frame atual.
    fireEvent.click(screen.getByRole('button', { name: 'Pausar animação' }))
    const frozen = active()
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(active()).toBe(frozen)

    // Play retoma.
    fireEvent.click(screen.getByRole('button', { name: 'Reproduzir animação' }))
    act(() => {
      vi.advanceTimersByTime(1200)
    })
    expect(active()).not.toBe(frozen)
  })

  it('prefers-reduced-motion começa pausado', () => {
    stubMatchMedia(true)
    vi.useFakeTimers()
    render(
      <ExerciseMedia
        frames={[poseA, poseB]}
        alt={ALT}
        exerciseName="Fixture"
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Reproduzir animação' }),
    ).toBeDefined()
    const first = screen
      .getByTestId('exercise-frame-active')
      .getAttribute('src')
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(
      screen.getByTestId('exercise-frame-active').getAttribute('src'),
    ).toBe(first)
  })

  it('só o frame ativo carrega o alt (segundo é decorativo)', () => {
    render(
      <ExerciseMedia
        frames={[poseA, poseB]}
        alt={ALT}
        exerciseName="Fixture"
      />,
    )
    const imgs = screen.getAllByTestId(/exercise-frame/)
    expect(imgs).toHaveLength(2)
    expect(screen.getByAltText(ALT)).toBeDefined()
  })
})

describe('ExerciseMedia: fallback de erro (Parte B)', () => {
  it('imagem com erro cai no placeholder com nome e instruções', () => {
    const cues = ['Dica um', 'Dica dois']
    render(
      <ExerciseMedia
        frames={['/media/quebrada-a.svg', '/media/quebrada-b.svg']}
        alt={ALT}
        exerciseName="Fixture"
        cues={cues}
      />,
    )
    expect(screen.getByTestId('exercise-media')).toBeDefined()
    fireEvent.error(screen.getByAltText(ALT))
    expect(screen.getByTestId('exercise-placeholder')).toBeDefined()
    expect(screen.queryByTestId('exercise-media')).toBeNull()
    expect(screen.getByText('Fixture')).toBeDefined()
    expect(screen.getByText('Dica um')).toBeDefined()
    // Sem animação, sem botão Pausar.
    expect(screen.queryByRole('button', { name: /animação/ })).toBeNull()
  })

  it('frame único com erro também cai no placeholder', () => {
    render(
      <ExerciseMedia frames={['/media/quebrada.svg']} alt={ALT} exerciseName="Fixture" />,
    )
    expect(screen.getByTestId('exercise-static')).toBeDefined()
    fireEvent.error(screen.getByAltText(ALT))
    expect(screen.getByTestId('exercise-placeholder')).toBeDefined()
  })

  it('placeholder sem animação não tem botão Pausar', () => {
    render(<ExerciseMedia alt={ALT} exerciseName="Fixture" />)
    expect(screen.queryByRole('button', { name: /animação/ })).toBeNull()
  })
})

describe('ExerciseMedia: vídeo próprio (GIF/WebM/MP4)', () => {
  const video = { src: '/media/fixture.mp4', poster: '/media/fixture.jpg' }

  beforeEach(() => {
    stubMatchMedia(false)
  })

  function mockMedia(el: HTMLElement) {
    Object.defineProperty(el, 'play', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    })
    Object.defineProperty(el, 'pause', {
      configurable: true,
      value: vi.fn(),
    })
  }

  it('renderiza vídeo muted/loop/playsInline com poster e tem prioridade sobre frames', () => {
    render(
      <ExerciseMedia
        video={video}
        frames={[poseA, poseB]}
        alt={ALT}
        exerciseName="Fixture"
      />,
    )
    const el = screen.getByTestId('exercise-video-el') as HTMLVideoElement
    expect(el.tagName).toBe('VIDEO')
    expect(el.muted).toBe(true)
    expect(el.loop).toBe(true)
    expect(el.playsInline).toBe(true)
    expect(el.getAttribute('preload')).toBe('metadata')
    expect(el.getAttribute('poster')).toBe(video.poster)
    expect(screen.queryByTestId('exercise-media')).toBeNull()
  })

  it('pausa/play funciona no vídeo', () => {
    render(
      <ExerciseMedia video={video} alt={ALT} exerciseName="Fixture" />,
    )
    const el = screen.getByTestId('exercise-video-el')
    mockMedia(el)
    fireEvent.click(screen.getByRole('button', { name: 'Pausar vídeo' }))
    expect(screen.getByRole('button', { name: 'Reproduzir vídeo' })).toBeDefined()
  })

  it('reduced-motion começa pausado com botão Play', () => {
    stubMatchMedia(true)
    render(
      <ExerciseMedia video={video} alt={ALT} exerciseName="Fixture" />,
    )
    expect(
      screen.getByRole('button', { name: 'Reproduzir vídeo' }),
    ).toBeDefined()
  })

  it('falha de carga do vídeo cai no placeholder', () => {
    render(
      <ExerciseMedia video={video} alt={ALT} exerciseName="Fixture" />,
    )
    fireEvent.error(screen.getByTestId('exercise-video-el'))
    expect(screen.getByTestId('exercise-placeholder')).toBeDefined()
    expect(screen.queryByTestId('exercise-video')).toBeNull()
  })
})
