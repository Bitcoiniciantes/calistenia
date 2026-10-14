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
      <h1 className="screen-title">Alongamentos</h1>

      <div
        className="flex gap-1 rounded-2xl p-1"
        role="tablist"
        aria-label="Sequência"
        style={{ background: 'var(--surface-2)' }}
      >
        {alongamentoGroups.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === groupId}
            onClick={() => selectGroup(g.id)}
            className={`touch-target flex-1 rounded-xl px-4 text-sm font-bold ${
              g.id === groupId ? 'text-white' : ''
            }`}
            style={g.id === groupId ? { background: 'var(--green)' } : undefined}
          >
            {g.namePt} ({g.items.length})
          </button>
        ))}
      </div>

      {done ? (
        <div
          className="card flex flex-col items-center gap-2 p-6 text-center"
          data-testid="alongamento-fim"
        >
          <p className="text-xl font-bold">Parabéns! Sequência concluída!</p>
          <p className="tnum text-sm opacity-80">
            {group.items.length} de {group.items.length} ({group.namePt}).
          </p>
          <button
            type="button"
            onClick={restart}
            className="btn-primary mt-2 w-full"
          >
            Recomeçar
          </button>
        </div>
      ) : (
      <div className="card overflow-hidden">
        <div className="p-3" style={{ background: '#e8ecf1' }}>
          <img
            key={item.id}
            src={pub(item.file)}
            alt={`Alongamento: ${item.namePt}`}
            data-testid="alongamento-img"
            className="w-full rounded-xl object-cover"
          />
        </div>
        <div className="flex items-center justify-between p-4 pb-0">
          <p className="card-title" data-testid="alongamento-nome">
            {item.namePt}
          </p>
          <p
            className="tnum rounded-full px-2.5 py-0.5 text-xs font-bold"
            data-testid="alongamento-pos"
            style={{ background: 'var(--surface-2)' }}
          >
            {index + 1}/{group.items.length}
          </p>
        </div>
        <div className="flex items-center gap-4 p-4">
          <svg
            viewBox="0 0 120 120"
            width="120"
            height="120"
            role="progressbar"
            aria-valuenow={slideSec - left}
            aria-valuemin={0}
            aria-valuemax={slideSec}
            aria-label={`Próxima em ${left} segundos`}
            className="shrink-0"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--surface-2)"
              strokeWidth="10"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--green)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 52}
              strokeDashoffset={
                2 * Math.PI * 52 * (left / Math.max(1, slideSec))
              }
              transform="rotate(-90 60 60)"
            />
            <text
              x="60"
              y="58"
              textAnchor="middle"
              dominantBaseline="central"
              fill="var(--text)"
              fontSize="30"
              fontWeight="700"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {left}s
            </text>
          </svg>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <p className="text-sm" data-testid="alongamento-timer">
              {paused ? 'Pausado' : `Próxima em ${left}s`}
            </p>
            <p className="caption">Segure a posição até trocar</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-4 pt-0">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Anterior"
            className="touch-target flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'var(--surface-2)' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m14.5 5.5-6.5 6.5 6.5 6.5" />
            </svg>
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="touch-target mx-auto flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full text-sm font-bold text-white"
            style={{ background: 'linear-gradient(180deg, var(--green), var(--green-dark))' }}
          >
            {paused ? (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                <path d="M8 5.5v13l11-6.5-11-6.5Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
                <rect x="6.5" y="5" width="4" height="14" rx="1" />
                <rect x="13.5" y="5" width="4" height="14" rx="1" />
              </svg>
            )}
            {paused ? 'Continuar' : 'Pausar'}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Próxima"
            className="touch-target flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-xs font-semibold"
            style={{ background: 'var(--surface-2)' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
            </svg>
            Próxima
          </button>
        </div>
      </div>
      )}

      <p className="caption">
        Ilustrações fornecidas pelo usuário (declaradas em 14/10/2026).
      </p>
    </div>
  )
}
