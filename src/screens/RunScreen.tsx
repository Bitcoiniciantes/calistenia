import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExerciseMedia } from '../components/ExerciseMedia'
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
  const [done, setDone] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const wasResting = useRef(false)

  // Wake Lock: tela nÃ£o apaga durante o treino (quando suportado).
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

  // Carrega sessÃ£o salva: oferece retomar. TambÃ©m lÃª preferÃªncia de som.
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
      if (!cancelled && p?.soundOn === false) setSoundOn(false)
    })
    return () => {
      cancelled = true
    }
  }, [repo, session])

  // Persiste a cada mudanÃ§a (sobrevive a fechar/recarregar).
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

  // Fim do descanso: bipe (se ativado) + vibraÃ§Ã£o. Som Ã© opcional.
  useEffect(() => {
    if (wasResting.current && !resting && !finished) {
      if (soundOn) beep()
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(200)
        } catch {
          /* sem vibraÃ§Ã£o */
        }
      }
    }
    wasResting.current = resting
  }, [resting, finished, soundOn])

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

  const handleComplete = useCallback(() => {
    setActive((prev) => {
      if (!prev) return prev
      const next = completeSet(prev, session)
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
            /* sem vibraÃ§Ã£o */
          }
        }
      }
      setHoldLeft(null)
      return next
    })
  }, [repo, session])

  // Timer do hold: contagem regressiva; ao zerar, conclui a sÃ©rie.
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
          ExercÃ­cio {resumeOffer.currentItemIndex + 1} de {session.items.length},
          sÃ©rie {resumeOffer.currentSet}.
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
          RecomeÃ§ar
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
        <h1 className="text-xl font-bold">Treino concluÃ­do!</h1>
        <p className="text-sm">{totalSets ?? 0} sÃ©ries registradas no histÃ³rico local.</p>
        <Link
          to="/"
          className="touch-target flex w-full items-center justify-center rounded bg-green-700 px-4 font-bold text-white"
        >
          Voltar ao inÃ­cio
        </Link>
      </div>
    )
  }

  if (!active || !item || !exercise) {
    return (
      <div className="app-shell items-center justify-center p-6">
        <p>Carregando treinoâ€¦</p>
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
      <div className="run-media">
        <ExerciseMedia
          frames={exercise.media.frames}
          alt={`DemonstraÃ§Ã£o de ${exercise.namePt}`}
          exerciseName={exercise.namePt}
          cues={exercise.cues}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-lg font-bold">{exercise.namePt}</h1>
          <span className="text-sm opacity-70">
            {active.currentItemIndex + 1}/{session.items.length} Â· SÃ©rie{' '}
            {active.currentSet}/{item.sets}
          </span>
        </div>
        <p className="text-sm font-medium">{target}</p>
        <button
          type="button"
          onClick={() => void toggleSound()}
          aria-pressed={soundOn}
          className="touch-target self-start rounded border px-2 text-xs"
        >
          Som: {soundOn ? 'ligado' : 'desligado'}
        </button>

        {resting ? (
          <div className="rounded border p-3 text-center" data-testid="rest-panel">
            <p className="text-2xl font-bold" data-testid="rest-countdown">
              {formatCountdown(restMs)}
            </p>
            <p className="text-xs opacity-70">
              PrÃ³ximo: {nextPreview ?? 'prÃ³xima sÃ©rie'}
            </p>
            <button
              type="button"
              className="touch-target mt-2 w-full rounded border px-4"
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
        ) : exercise.type === 'hold' ? (
          <div className="flex gap-2">
            <button
              type="button"
              className="touch-target flex-1 rounded bg-green-700 px-4 text-lg font-bold text-white"
              onClick={() => setHoldLeft(item.holdSec ?? 30)}
            >
              {holdLeft === null ? `Iniciar ${item.holdSec ?? 0}s` : `${holdLeft}sâ€¦`}
            </button>
            {holdLeft !== null && (
              <button
                type="button"
                className="touch-target rounded border px-4"
                onClick={() => setHoldLeft(null)}
              >
                Parar
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            className="touch-target w-full rounded bg-green-700 px-4 text-lg font-bold text-white"
            onClick={handleComplete}
          >
            ConcluÃ­ a sÃ©rie
          </button>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            disabled={!easier}
            title={easier ? `Trocar por ${easier.namePt}` : 'Sem regressÃ£o: jÃ¡ Ã© o mais fÃ¡cil'}
            className="touch-target flex-1 rounded border px-2 text-sm disabled:opacity-40"
            onClick={() =>
              easier && setActive((p) => (p ? substitute(p, session, easier.id) : p))
            }
          >
            {easier ? `Mais fÃ¡cil: ${easier.namePt}` : 'Mais fÃ¡cil (jÃ¡ Ã© o mais fÃ¡cil)'}
          </button>
          <button
            type="button"
            disabled={!harder}
            title={harder ? `Trocar por ${harder.namePt}` : 'Sem progressÃ£o: jÃ¡ Ã© o mais difÃ­cil'}
            className="touch-target flex-1 rounded border px-2 text-sm disabled:opacity-40"
            onClick={() =>
              harder && setActive((p) => (p ? substitute(p, session, harder.id) : p))
            }
          >
            {harder ? `Mais difÃ­cil: ${harder.namePt}` : 'Mais difÃ­cil (jÃ¡ Ã© o mais difÃ­cil)'}
          </button>
          <button
            type="button"
            className="touch-target rounded border px-3 text-sm"
            onClick={() =>
              setActive((p) => {
                if (!p) return p
                const n = skipItem(p, session)
                if (isFinished(n, session)) {
                  // Pular atÃ© o fim tambÃ©m registra o histÃ³rico (sÃ©ries nÃ£o feitas).
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
        <Link to="/ajustes" className="touch-target text-xs underline opacity-70">
          CrÃ©ditos de mÃ­dia
        </Link>
      </div>
    </div>
  )
}
