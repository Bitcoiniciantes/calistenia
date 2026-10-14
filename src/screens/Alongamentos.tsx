import { useCallback, useEffect, useState } from 'react'
import { alongamentoGroups, SLIDE_MS } from '../data/alongamentos'
import { pub } from '../media'

const SLIDE_SEC = Math.round(SLIDE_MS / 1000)

/**
 * Alongamentos: sequências de Yoga e Vôlei. Cada imagem fica SLIDE_MS
 * (60 s) com troca automática em ciclo; pausável, com navegação manual.
 * Wake Lock mantém a tela acesa durante a sequência (quando suportado).
 */
export function Alongamentos() {
  const [groupId, setGroupId] = useState<'yoga' | 'voley'>('yoga')
  const [index, setIndex] = useState(0)
  const [left, setLeft] = useState(SLIDE_SEC)
  const [paused, setPaused] = useState(false)

  const group = alongamentoGroups.find((g) => g.id === groupId)!
  const item = group.items[index]!

  // Avanço de slide (mesmo padrão do timer de hold do RunScreen).
  const advance = useCallback(() => {
    const len =
      alongamentoGroups.find((g) => g.id === groupId)?.items.length ?? 1
    setIndex((i) => (i + 1) % len)
    setLeft(SLIDE_SEC)
  }, [groupId])

  // Troca de grupo recomeça do início.
  function selectGroup(id: 'yoga' | 'voley') {
    setGroupId(id)
    setIndex(0)
    setLeft(SLIDE_SEC)
    setPaused(false)
  }

  function go(delta: number) {
    setIndex((i) => (i + delta + group.items.length) % group.items.length)
    setLeft(SLIDE_SEC)
  }

  // Wake Lock: tela não apaga durante a sequência (quando suportado).
  useEffect(() => {
    let lock: { release?: () => void } | undefined
    const nav = navigator as Navigator & {
      wakeLock?: { request: (t: string) => Promise<unknown> }
    }
    nav.wakeLock?.request('screen').then(
      (l) => {
        lock = l as { release?: () => void }
      },
      () => undefined,
    )
    return () => lock?.release?.()
  }, [])

  // Contagem regressiva; ao zerar, avança para a próxima imagem.
  useEffect(() => {
    if (paused) return
    const t = window.setInterval(
      () =>
        setLeft((v) => {
          if (v <= 1) {
            window.clearInterval(t)
            advance()
            return SLIDE_SEC
          }
          return v - 1
        }),
      1000,
    )
    return () => window.clearInterval(t)
  }, [paused, groupId, index, advance])

  return (
    <div className="app-shell gap-4 p-4">
      <h1 className="text-xl font-bold">Alongamentos</h1>

      <div className="flex gap-2" role="tablist" aria-label="Sequência">
        {alongamentoGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === groupId}
            onClick={() => selectGroup(g.id)}
            className={`touch-target flex-1 rounded border px-4 font-bold ${
              g.id === groupId ? 'bg-green-700 text-white' : ''
            }`}
          >
            {g.namePt} ({g.items.length})
          </button>
        ))}
      </div>

      <div className="rounded border p-4">
        <img
          key={item.id}
          src={pub(item.file)}
          alt={`Alongamento: ${item.namePt}`}
          data-testid="alongamento-img"
          className="w-full rounded object-cover"
        />
        <div className="mt-2 flex items-baseline justify-between">
          <p className="font-medium" data-testid="alongamento-nome">
            {item.namePt}
          </p>
          <p className="text-sm opacity-70" data-testid="alongamento-pos">
            {index + 1}/{group.items.length}
          </p>
        </div>
        <p className="text-sm" data-testid="alongamento-timer">
          {paused ? 'Pausado' : `Próxima em ${left}s`}
        </p>
        <div
          className="mt-1 h-2 rounded bg-gray-300"
          role="progressbar"
          aria-valuenow={SLIDE_SEC - left}
          aria-valuemin={0}
          aria-valuemax={SLIDE_SEC}
        >
          <div
            className="h-2 rounded bg-green-700"
            style={{ width: `${((SLIDE_SEC - left) / SLIDE_SEC) * 100}%` }}
          />
        </div>
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            className="touch-target flex-1 rounded border px-4"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="touch-target flex-1 rounded border px-4 font-bold"
          >
            {paused ? 'Continuar' : 'Pausar'}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="touch-target flex-1 rounded border px-4"
          >
            Próxima
          </button>
        </div>
      </div>

      <p className="text-sm opacity-70">
        Ilustrações fornecidas pelo usuário (declaradas em 14/10/2026).
      </p>
    </div>
  )
}
