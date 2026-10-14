import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExerciseMedia } from '../components/ExerciseMedia'
import { pub } from '../media'
import {
  completeSet,
  currentExerciseId,
  isFinished,
  restRemainingMs,
  skipItem,
  startSessionWithEntries,
  substitute,
} from '../repo/activeSession'
import type { Repository } from '../repo/Repository'
import type {
  ActiveSession,
  Session,
} from '../repo/types'
import { exerciseById } from '../data/exercises'

interface RunScreenProps {
  session: Session
  repo: Repository
}

function formatCountdown(ms: number): string {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Anel de progresso do cronômetro (série e hold): segundos grandes no centro. */
function TimerRing({
  total,
  left,
  label,
}: {
  total: number
  left: number
  label: string
}) {
  const c = 2 * Math.PI * 52
  const safeTotal = Math.max(1, total)
  return (
    <svg
      viewBox="0 0 120 120"
      width="148"
      height="148"
      role="progressbar"
      aria-valuenow={safeTotal - Math.max(0, left)}
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-label={label}
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
        strokeDasharray={c}
        strokeDashoffset={c * (Math.max(0, left) / safeTotal)}
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        fontSize="30"
        fontWeight="700"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {Math.max(0, left)}s
      </text>
    </svg>
  )
}

 /** Janela de execução da série de repetições (s): ao zerar, avança sozinho. */
const DEFAULT_SERIES_SEC = 30
/** Descanso padrão (s) quando o perfil não define outro valor. */
const DEFAULT_REST_SEC = 30

/** Bipe curto de fim de descanso (WebAudio, sem arquivos). Opcional. */
function beep() {
  try {
    const w = window as unknown as {
      AudioContext?: typeof AudioContext
      webkitAudioContext?: typeof AudioContext
    }
    const Ctx = w.AudioContext ?? w.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
    void ctx.close?.()
  } catch {
    /* sem som */
  }
}

export function RunScreen({ session, repo }: RunScreenProps) {
  const [active, setActive] = useState<ActiveSession | null>(null)
  const [resumeOffer, setResumeOffer] = useState<ActiveSession | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [holdLeft, setHoldLeft] = useState<number | null>(null)
  const [seriesLeft, setSeriesLeft] = useState<number | null>(null)
  const [seriesSec, setSeriesSec] = useState(DEFAULT_SERIES_SEC)
  const [restOverride, setRestOverride] = useState<number | undefined>()
  const [done, setDone] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const wasResting = useRef(false)

  // Wake Lock: tela não apaga durante o treino (quando suportado).
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

  // Carrega sessão salva: oferece retomar. Também lê preferência de som.
  useEffect(() => {
    let cancelled = false
    void repo.getActiveSession().then((stored) => {
      if (cancelled) return
      if (
        stored &&
        stored.sessionId === session.id &&
        !isFinished(stored, session)
      ) {
        setResumeOffer(stored)
      } else {
        setActive(startSessionWithEntries(session))
      }
    })
    void repo.getProfile().then((p) => {
      if (cancelled) return
      if (p?.soundOn === false) setSoundOn(false)
      if (p?.seriesSec) setSeriesSec(p.seriesSec)
      setRestOverride(p?.restSecOverride)
    })
    return () => {
      cancelled = true
    }
  }, [repo, session])

  // Persiste a cada mudança (sobrevive a fechar/recarregar).
  useEffect(() => {
    if (active && !done) void repo.saveActiveSession(active)
  }, [active, done, repo])

  // Tique para descanso/timer (500 ms).
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(t)
  }, [])

  const exerciseId = active ? currentExerciseId(active, session) : undefined
  const exercise = exerciseId ? exerciseById[exerciseId] : undefined
  const item = active ? session.items[active.currentItemIndex] : undefined
  const finished = active ? isFinished(active, session) : false
  const restMs = active ? restRemainingMs(active, now) : 0
  const resting = restMs > 0 && !finished

  // Fim do descanso: bipe (se ativado) + vibração, e início automático
  // da próxima série (a imagem já avançou na conclusão da série anterior).
  useEffect(() => {
    if (wasResting.current && !resting && !finished) {
      if (soundOn) beep()
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(200)
        } catch {
          /* sem vibração */
        }
      }
      // Início automático fora do corpo do efeito (setState síncrono
      // em efeito causa render em cascata; aqui vai num callback).
      const auto =
        exercise?.type === 'hold'
          ? () => setHoldLeft((v) => v ?? item?.holdSec ?? 30)
          : () => setSeriesLeft((v) => v ?? seriesSec)
      const t = window.setTimeout(auto, 0)
      wasResting.current = resting
      return () => window.clearTimeout(t)
    }
    wasResting.current = resting
  }, [resting, finished, soundOn, exercise, item, seriesSec])

  async function toggleSound() {
    const next = !soundOn
    setSoundOn(next)
    const profile = (await repo.getProfile()) ?? {
      startingPoints: {},
      equipment: [] as string[],
      daysPerWeek: 3,
      goal: 'strength',
    }
    await repo.saveProfile({ ...profile, soundOn: next })
  }

  const nextPreview = useMemo(() => {
    if (!active || finished) return undefined
    const nextItem =
      session.items[active.currentItemIndex + (active.currentSet >= (item?.sets ?? 1) ? 1 : 0)]
    if (!nextItem || nextItem === item) return undefined
    return exerciseById[nextItem.exerciseId]?.namePt ?? nextItem.exerciseId
  }, [active, finished, session, item])

  const nextThumb = useMemo(() => {
    if (!active || finished) return undefined
    const nextItem =
      session.items[active.currentItemIndex + (active.currentSet >= (item?.sets ?? 1) ? 1 : 0)]
    if (!nextItem) return undefined
    const frames = exerciseById[nextItem.exerciseId]?.media.frames
    return frames?.[0]
  }, [active, finished, session, item])

  const handleComplete = useCallback(() => {
    setSeriesLeft(null)
    setActive((prev) => {
      if (!prev) return prev
      // Último exercício: sem descanso — termina mais rápido.
      const lastItem = prev.currentItemIndex === session.items.length - 1
      const next = completeSet(
        prev,
        session,
        new Date().toISOString(),
        lastItem ? 0 : (restOverride ?? DEFAULT_REST_SEC),
      )
      if (isFinished(next, session)) {
        const durationSec = Math.max(
          0,
          Math.round((Date.now() - Date.parse(next.startedAt)) / 1000),
        )
        void repo
          .addLog({
            id: `${next.sessionId}-${next.startedAt}`,
            date: next.startedAt,
            sessionId: next.sessionId,
            entries: next.entries,
            durationSec,
          })
          .then(() => repo.clearActiveSession())
        setDone(true)
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(200)
          } catch {
            /* sem vibração */
          }
        }
      } else if (lastItem) {
        // Sem painel de descanso: a próxima série começa sozinha.
        const nextEx =
          exerciseById[currentExerciseId(next, session) ?? '']
        const startNext =
          nextEx?.type === 'hold'
            ? () =>
                setHoldLeft(
                  (v) =>
                    v ??
                    session.items[next.currentItemIndex]?.holdSec ??
                    30,
                )
            : () => setSeriesLeft((v) => v ?? seriesSec)
        window.setTimeout(startNext, 0)
      }
      setHoldLeft(null)
      return next
    })
  }, [repo, session, restOverride, seriesSec])

  // Timer da série (repetições): contagem regressiva; ao zerar, conclui
  // a série e pula para a próxima imagem. Tocar de novo conclui antes.
  useEffect(() => {
    if (seriesLeft === null || seriesLeft <= 0) return
    if (resting) return
    const t = window.setInterval(
      () =>
        setSeriesLeft((v) => {
          if (v === null) return v
          if (v <= 1) {
            window.clearInterval(t)
            handleComplete()
            return 0
          }
          return v - 1
        }),
      1000,
    )
    return () => window.clearInterval(t)
  }, [seriesLeft, resting, handleComplete])

  // Troca de exercício/série reinicia a janela da série (chamado nas transições).
  const resetSeries = useCallback(() => setSeriesLeft(null), [])

  // Timer do hold: contagem regressiva; ao zerar, conclui a série.
  useEffect(() => {
    if (holdLeft === null || holdLeft <= 0) return
    if (resting) return
    const t = window.setInterval(
      () =>
        setHoldLeft((v) => {
          if (v === null) return v
          if (v <= 1) {
            window.clearInterval(t)
            handleComplete()
            return 0
          }
          return v - 1
        }),
      1000,
    )
    return () => window.clearInterval(t)
  }, [holdLeft, resting, handleComplete])

  if (resumeOffer && !active) {
    return (
      <div className="app-shell items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-xl font-bold">Retomar treino?</h1>
        <p className="text-sm">
          Exercício {resumeOffer.currentItemIndex + 1} de {session.items.length},
          série {resumeOffer.currentSet}.
        </p>
        <button
          type="button"
          className="touch-target w-full rounded bg-green-700 px-4 font-bold text-white"
          onClick={() => {
            setActive(resumeOffer)
            setResumeOffer(null)
          }}
        >
          Retomar treino
        </button>
        <button
          type="button"
          className="touch-target w-full rounded border px-4"
          onClick={() => {
            setActive(startSessionWithEntries(session))
            setResumeOffer(null)
          }}
        >
          Recomeçar
        </button>
      </div>
    )
  }

  if (done || (active && finished)) {
    const totalSets = active?.entries.reduce(
      (acc, e) => acc + e.sets.filter((s) => s.done).length,
      0,
    )
    return (
      <div className="app-shell items-center justify-center gap-4 p-6 text-center">
        <h1 className="screen-title">Parabéns! Treino concluído!</h1>
        <p className="tnum text-sm opacity-80">{totalSets ?? 0} séries registradas no histórico local.</p>
        <Link
          to="/"
          className="btn-primary w-full"
        >
          Voltar ao início
        </Link>
      </div>
    )
  }

  if (!active || !item || !exercise) {
    return (
      <div className="app-shell items-center justify-center p-6">
        <p>Carregando treino…</p>
      </div>
    )
  }

  const easier = exercise.prevId ? exerciseById[exercise.prevId] : undefined
  const harder = exercise.nextId ? exerciseById[exercise.nextId] : undefined
  const target =
    exercise.type === 'hold'
      ? `Segure ${item.holdSec ?? 0}s`
      : `${item.reps ?? 0} reps`

  return (
    <div className="run-screen app-shell">
      <div className="flex items-center justify-between px-4 pt-2">
        <Link
          to="/"
          title="Sair (o treino fica salvo e dá para retomar)"
          className="touch-target text-sm font-semibold underline opacity-80"
        >
          ‹ Sair
        </Link>
        <button
          type="button"
          onClick={() => void toggleSound()}
          aria-pressed={soundOn}
          className="touch-target rounded-xl px-3 text-xs font-semibold"
          style={{ background: 'var(--surface-2)' }}
        >
          Som: {soundOn ? 'ligado' : 'desligado'}
        </button>
      </div>
      <div className="run-media">
        <ExerciseMedia
          key={exercise.id}
          frames={exercise.media.frames}
          alt={`Demonstração de ${exercise.namePt}`}
          exerciseName={exercise.namePt}
          cues={exercise.cues}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div>
          <h1 className="text-[22px] leading-tight font-bold">{exercise.namePt}</h1>
          <div className="mt-1.5 flex gap-1.5">
            <span className="tnum rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: 'var(--surface-2)' }}>
              {active.currentItemIndex + 1}/{session.items.length}
            </span>
            <span className="tnum rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: 'var(--green)' }}>
              Série {active.currentSet}/{item.sets}
            </span>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold opacity-80" style={{ background: 'var(--surface-2)' }}>
              {target}
            </span>
          </div>
        </div>

        {resting ? (
          <div className="card flex flex-col items-center gap-1 p-4 text-center" data-testid="rest-panel">
            <p className="text-lg font-bold">Descanse…</p>
            <p className="tnum text-5xl font-bold" data-testid="rest-countdown">
              {formatCountdown(restMs)}
            </p>
            <p className="caption">respire e prepare a próxima</p>
            {(nextPreview ?? nextThumb) && (
              <p className="mt-1 flex items-center gap-2 text-sm">
                {nextThumb && (
                  <img
                    src={pub(nextThumb)}
                    alt=""
                    aria-hidden="true"
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                )}
                <span className="opacity-80">
                  Próximo: {nextPreview ?? 'próxima série'}
                </span>
              </p>
            )}
            <div className="mt-2 flex w-full gap-2">
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={() =>
                  setActive((prev) => {
                    if (!prev?.restEndsAt) return prev ?? null
                    return { ...prev, restEndsAt: undefined }
                  })
                }
              >
                Pular descanso
              </button>
              <button
                type="button"
                className="btn-secondary px-4"
                onClick={() =>
                  setActive((prev) => {
                    if (!prev?.restEndsAt) return prev ?? null
                    return {
                      ...prev,
                      restEndsAt: new Date(
                        Date.parse(prev.restEndsAt) + 15000,
                      ).toISOString(),
                    }
                  })
                }
              >
                +15 s
              </button>
            </div>
          </div>
        ) : exercise.type === 'hold' ? (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              aria-label={holdLeft === null ? `Iniciar ${item.holdSec ?? 0}s` : `${holdLeft}s… (concluir)`}
              className="rounded-full"
              onClick={() =>
                holdLeft === null
                  ? setHoldLeft(item.holdSec ?? 30)
                  : handleComplete()
              }
            >
              <TimerRing
                total={item.holdSec ?? 30}
                left={holdLeft ?? item.holdSec ?? 30}
                label={holdLeft === null ? `Segure ${item.holdSec ?? 0}s` : `Faltam ${holdLeft}s`}
              />
            </button>
            <p className="text-sm font-semibold opacity-80">
              {holdLeft === null ? `Iniciar ${item.holdSec ?? 0}s` : `${holdLeft}s… (concluir)`}
            </p>
            {holdLeft !== null && (
              <button
                type="button"
                className="touch-target rounded-xl px-4 text-sm font-semibold"
                style={{ background: 'var(--surface-2)' }}
                onClick={() => setHoldLeft(null)}
              >
                Parar
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              aria-label={seriesLeft === null ? `Iniciar a série (${seriesSec}s)` : `${seriesLeft}s… (concluir)`}
              className="rounded-full"
              onClick={() =>
                seriesLeft === null
                  ? setSeriesLeft(seriesSec)
                  : handleComplete()
              }
            >
              <TimerRing
                total={seriesSec}
                left={seriesLeft ?? seriesSec}
                label={seriesLeft === null ? `Série de ${seriesSec} segundos` : `Faltam ${seriesLeft}s`}
              />
            </button>
            <p className="text-sm font-semibold opacity-80">
              {seriesLeft === null
                ? `Iniciar a série (${seriesSec}s)`
                : `${seriesLeft}s… (concluir)`}
            </p>
            {seriesLeft !== null && (
              <button
                type="button"
                className="touch-target rounded-xl px-4 text-sm font-semibold"
                style={{ background: 'var(--surface-2)' }}
                onClick={() => setSeriesLeft(null)}
              >
                Parar
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!easier}
            title={easier ? `Trocar por ${easier.namePt}` : 'Sem regressão: já é o mais fácil'}
            className="touch-target min-w-0 flex-1 rounded-xl px-2 text-sm font-semibold disabled:opacity-40"
            style={{ background: 'var(--surface-2)' }}
            onClick={() => {
              if (easier) {
                resetSeries()
                setActive((p) => (p ? substitute(p, session, easier.id) : p))
              }
            }}
          >
            {easier ? `Mais fácil: ${easier.namePt}` : 'Mais fácil (já é o mais fácil)'}
          </button>
          <button
            type="button"
            disabled={!harder}
            title={harder ? `Trocar por ${harder.namePt}` : 'Sem progressão: já é o mais difícil'}
            className="touch-target min-w-0 flex-1 rounded-xl px-2 text-sm font-semibold disabled:opacity-40"
            style={{ background: 'var(--surface-2)' }}
            onClick={() => {
              if (harder) {
                resetSeries()
                setActive((p) => (p ? substitute(p, session, harder.id) : p))
              }
            }}
          >
            {harder ? `Mais difícil: ${harder.namePt}` : 'Mais difícil (já é o mais difícil)'}
          </button>
          <button
            type="button"
            className="touch-target rounded-xl px-3 text-sm font-semibold"
            style={{ background: 'var(--surface-2)' }}
            onClick={() =>
              setActive((p) => {
                if (!p) return p
                const n = skipItem(p, session)
                if (isFinished(n, session)) {
                  // Pular até o fim também registra o histórico (séries não feitas).
                  const durationSec = Math.max(
                    0,
                    Math.round((Date.now() - Date.parse(n.startedAt)) / 1000),
                  )
                  void repo
                    .addLog({
                      id: `${n.sessionId}-${n.startedAt}`,
                      date: n.startedAt,
                      sessionId: n.sessionId,
                      entries: n.entries,
                      durationSec,
                    })
                    .then(() => repo.clearActiveSession())
                  setDone(true)
                }
                setHoldLeft(null)
                setSeriesLeft(null)
                return n
              })
            }
          >
            Pular
          </button>
        </div>

        <details>
          <summary className="touch-target text-sm font-medium">
            Dicas e erros comuns
          </summary>
          <ul className="list-disc pl-5 text-sm">
            {exercise.cues.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <ul className="list-disc pl-5 text-sm">
            {exercise.commonMistakes.map((m) => (
              <li key={m}>Evite: {m}</li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  )
}
