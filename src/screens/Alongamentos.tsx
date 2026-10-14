import { useCallback, useEffect, useState } from 'react'
import { alongamentoGroups, SLIDE_MS } from '../data/alongamentos'
import { pub } from '../media'
import type { Repository } from '../repo/Repository'

const DEFAULT_SLIDE_SEC = Math.round(SLIDE_MS / 1000)

/**
 * Alongamentos: sequências de Yoga e Vôlei. Cada imagem fica slideSec
 * (padrão 30 s, ajustável em Ajustes > Tempos) com troca automática;
 * ao fim da sequência mostra Parabéns em vez de reiniciar. Pausável,
 * com navegação manual. Wake Lock mantém a tela acesa (quando suportado).
 */
export function Alongamentos({ repo }: { repo?: Repository }) {
  const [groupId, setGroupId] = useState<'yoga' | 'voley'>('yoga')
  const [index, setIndex] = useState(0)
  const [slideSec, setSlideSec] = useState(DEFAULT_SLIDE_SEC)
  const [left, setLeft] = useState(DEFAULT_SLIDE_SEC)
  const [paused, setPaused] = useState(false)
  const [done, setDone] = useState(false)

  const group = alongamentoGroups.find((g) => g.id === groupId)!
  const item = group.items[index]!

  // Duração configurada no perfil (Ajustes > Tempos).
  useEffect(() => {
    if (!repo) return
    let cancelled = false
    void repo.getProfile().then((p) => {
      if (cancelled || !p?.alongamentoSec) return
      // Só carrega na montagem: vale desde a primeira imagem.
      setSlideSec(p.alongamentoSec)
      setLeft(p.alongamentoSec)
    })
    return () => {
      cancelled = true
    }
  }, [repo])

  // Avanço de slide (mesmo padrão do timer de hold do RunScreen).
  // No fim da sequência, parabéns em vez de reiniciar.
  const advance = useCallback(() => {
    const len =
      alongamentoGroups.find((g) => g.id === groupId)?.items.length ?? 1
    if (index >= len - 1) {
      setDone(true)
      return
    }
    setIndex(index + 1)
    setLeft(slideSec)
  }, [groupId, index, slideSec])

  // Troca de grupo recomeça do início.
  function selectGroup(id: 'yoga' | 'voley') {
    setGroupId(id)
    setIndex(0)
    setLeft(slideSec)
    setPaused(false)
    setDone(false)
  }

  function restart() {
    setIndex(0)
    setLeft(slideSec)
    setPaused(false)
    setDone(false)
  }

  function go(delta: number) {
    const len = group.items.length
    const next = index + delta
    if (next >= len) {
      setDone(true)
      return
    }
    setDone(false)
    setIndex((next + len) % len)
    setLeft(slideSec)
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

  // Contagem regressiva; ao zerar, avança (ou encerra com parabéns).
  useEffect(() => {
    if (paused || done) return
    const t = window.setInterval(
      () =>
        setLeft((v) => {
          if (v <= 1) {
            window.clearInterval(t)
            advance()
            return slideSec
          }
          return v - 1
        }),
      1000,
    )
    return () => window.clearInterval(t)
  }, [paused, done, groupId, index, advance, slideSec])

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

      {done ? (
        <div
          className="flex flex-col items-center gap-4 rounded border p-6 text-center"
          data-testid="alongamento-fim"
        >
          <p className="text-xl font-bold">Parabéns! Sequência concluída!</p>
          <p className="text-sm">
            {group.items.length} de {group.items.length} ({group.namePt}).
          </p>
          <button
            type="button"
            onClick={restart}
            className="touch-target w-full rounded bg-green-700 px-4 font-bold text-white"
          >
            Recomeçar
          </button>
        </div>
      ) : (
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
          aria-valuenow={slideSec - left}
          aria-valuemin={0}
          aria-valuemax={slideSec}
        >
          <div
            className="h-2 rounded bg-green-700"
            style={{ width: `${((slideSec - left) / slideSec) * 100}%` }}
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
      )}

      <p className="text-sm opacity-70">
        Ilustrações fornecidas pelo usuário (declaradas em 14/10/2026).
      </p>
    </div>
  )
}
