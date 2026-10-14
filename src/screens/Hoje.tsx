import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { exerciseById } from '../data/exercises'
import { programById } from '../data/programs'
import { pub } from '../media'
import type { Repository } from '../repo/Repository'
import type { Session, WorkoutLog } from '../repo/types'
import { calcStreak } from '../repo/training'

const DOW = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

const LEVEL_PT: Record<number, string> = {
  1: 'Iniciante',
  2: 'Intermediário',
  3: 'Avançado',
}

interface WeekDay {
  dow: string
  day: number
  trained: boolean
  isToday: boolean
  isFuture: boolean
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/** Hoje: treino do dia, streak e mini-calendário da semana. */
export function Hoje({ repo }: { repo: Repository }) {
  const [streak, setStreak] = useState(0)
  const [week, setWeek] = useState<WeekDay[]>([])
  const [programId, setProgramId] = useState<string>('iniciante-3d')
  const [session, setSession] = useState<Session | undefined>()
  const [todayLog, setTodayLog] = useState<WorkoutLog | undefined>()

  useEffect(() => {
    void (async () => {
      const [profile, logs] = await Promise.all([
        repo.getProfile(),
        repo.listLogs(),
      ])
      const pid =
        profile?.activeProgramId && programById[profile.activeProgramId]
          ? profile.activeProgramId
          : 'iniciante-3d'
      setProgramId(pid)
      // Rotaciona as sessões pelo dia do ano (efeito, não render).
      const prog = programById[pid]!
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
          86400000,
      )
      const today = prog.sessions[dayOfYear % prog.sessions.length]!
      setSession(today)
      setStreak(calcStreak(logs.map((l) => l.date)))
      setTodayLog(
        logs.find(
          (l) =>
            l.sessionId === today.id &&
            sameDay(new Date(l.date), new Date()),
        ),
      )
      const trainedDays = new Set(
        logs.map((l) => new Date(l.date).toDateString()),
      )
      // Semana de segunda a domingo.
      const now = new Date()
      const monday = new Date(now)
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
      const days: WeekDay[] = []
      for (let k = 0; k < 7; k += 1) {
        const d = new Date(monday)
        d.setDate(monday.getDate() + k)
        days.push({
          dow: DOW[k]!,
          day: d.getDate(),
          trained: trainedDays.has(d.toDateString()),
          isToday: sameDay(d, now),
          isFuture: d > now && !sameDay(d, now),
        })
      }
      setWeek(days)
    })()
  }, [repo])

  const program = programById[programId]!
  const firstFrame = session
    ? exerciseById[session.items[0]?.exerciseId ?? '']?.media.frames?.[0]
    : undefined
  const totalSets =
    session?.items.reduce((acc, i) => acc + i.sets, 0) ?? 0
  const doneSets =
    todayLog?.entries.reduce(
      (acc, e) => acc + e.sets.filter((s) => s.done).length,
      0,
    ) ?? 0
  const doneMin = todayLog ? Math.round(todayLog.durationSec / 60) : 0
  const todayLong = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="app-shell gap-4 p-4">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="screen-title">Bora treinar</h1>
          <p className="caption capitalize">{todayLong}</p>
        </div>
        <span
          data-testid="streak"
          className="tnum flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold text-white"
          style={{ background: 'var(--orange)' }}
          title={`${streak} dia(s) seguidos treinando`}
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.5c-2.7 4.2-5.5 6.3-5.5 10.5a5.5 5.5 0 0 0 11 0c0-1.5-.5-2.8-1.2-4-.4 1-1 1.9-2 2.6.3-2.9-.6-6.3-2.3-9.1Z" />
          </svg>
          {streak} dia(s)
        </span>
      </div>

      <div className="flex gap-1" aria-label="Semana">
        {week.map((d) => (
          <span
            key={d.dow}
            title={
              d.trained ? 'Treinou' : d.isFuture ? 'Dia futuro' : 'Sem treino'
            }
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 ${
              d.isFuture ? 'opacity-40' : ''
            } ${d.isToday ? 'ring-2' : ''}`}
            style={
              d.isToday
                ? ({ '--tw-ring-color': 'var(--green)' } as CSSProperties)
                : undefined
            }
          >
            <span className="caption" style={{ fontSize: 10 }}>
              {d.dow}
            </span>
            <span className="tnum text-sm font-bold">
              {d.trained ? (
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="var(--green)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-label="Treinou"
                  role="img"
                >
                  <path d="M4.5 12.5 10 18 19.5 6.5" />
                </svg>
              ) : (
                d.day
              )}
            </span>
          </span>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="relative">
          <img
            src={pub(firstFrame ?? '/media/capahome.jpg')}
            alt={
              session
                ? `Demonstração de ${exerciseById[session.items[0]?.exerciseId ?? '']?.namePt ?? session.title}`
                : 'Guia visual com exercícios de calistenia'
            }
            loading="lazy"
            className="aspect-[16/9] w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, transparent 30%, rgba(0,0,0,.78))',
            }}
          />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="card-title text-white">{session?.title ?? 'Carregando…'}</p>
            <p className="text-sm text-white/80">{program.namePt}</p>
            {session && (
              <div className="mt-2 flex gap-1.5">
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {LEVEL_PT[program.level] ?? `Nível ${program.level}`}
                </span>
                <span className="tnum rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {session.items.length} exercícios
                </span>
                <span className="tnum rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {totalSets} séries
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          {session &&
            (todayLog ? (
              <>
                <p className="font-bold" style={{ color: 'var(--green)' }}>
                  Treino concluído ✓
                  <span className="tnum ml-2 text-sm font-medium opacity-80">
                    {doneSets} séries · {doneMin} min
                  </span>
                </p>
                <Link
                  to={`/execucao/${session.id}`}
                  className="btn-secondary w-full"
                >
                  Refazer treino
                </Link>
              </>
            ) : (
              <Link
                to={`/execucao/${session.id}`}
                className="btn-primary w-full"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="currentColor"
                  aria-hidden="true"
                  className="mr-2"
                >
                  <path d="M7 4.8v14.4c0 .8.9 1.3 1.6.9l11.3-7.2c.6-.4.6-1.4 0-1.8L8.6 3.9c-.7-.4-1.6.1-1.6.9Z" />
                </svg>
                Começar treino
              </Link>
            ))}
          <Link
            to={`/programas/${programId}`}
            className="text-center text-sm underline opacity-80"
          >
            Ver exercícios do treino
          </Link>
        </div>
      </div>
    </div>
  )
}
