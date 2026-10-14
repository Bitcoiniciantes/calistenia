import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { exerciseById } from '../data/exercises'
import { programById, programs } from '../data/programs'
import type { Repository } from '../repo/Repository'
import { challengeUnlocked } from '../repo/training'
import type { UserProfile } from '../repo/types'

const LEVEL_PT: Record<number, string> = {
  1: 'Iniciante',
  2: 'Intermediário',
  3: 'Avançado',
}

/** Faixa por programa: iniciante verde, intermediário azul, avançado laranja, desafio roxo. */
function band(id: string, level: number): { from: string; to: string } {
  if (id === 'desafio-28d') return { from: '#7c3aed', to: '#4c1d95' }
  if (level >= 3) return { from: '#ff8a1f', to: '#b34d00' }
  if (level === 2) return { from: '#3b82f6', to: '#1d4ed8' }
  return { from: '#1db954', to: '#128a3e' }
}

function ProgramIcon({ id }: { id: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    width: 26,
    height: 26,
  } as const
  if (id === 'desafio-28d') {
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
        <path d="M3.5 9.7h17M8 3v3.6M16 3v3.6M9 14l2 2 4-4.5" />
      </svg>
    )
  }
  if (id.startsWith('avancado')) {
    return (
      <svg {...common}>
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
        <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 2 4 4 4M17 5h3a1 1 0 0 1 1 1c0 2.5-2 4-4 4M12 14v4M8.5 20.5h7" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11" />
    </svg>
  )
}

export function Programas({ repo }: { repo: Repository }) {
  const [activeId, setActiveId] = useState<string | undefined>()
  const [sessionIds, setSessionIds] = useState<string[]>([])

  useEffect(() => {
    void repo.getProfile().then((p) => setActiveId(p?.activeProgramId))
    void repo.listLogs().then((logs) => setSessionIds(logs.map((l) => l.sessionId)))
  }, [repo])

  return (
    <div className="app-shell gap-3 p-4">
      <h1 className="screen-title">Programas</h1>
      <ul className="flex flex-col gap-3">
        {programs.map((p) => {
          const c = band(p.id, p.level)
          const active = activeId === p.id
          const isChallenge = p.id === 'desafio-28d'
          const unlocked = isChallenge
            ? challengeUnlocked(
                p.id,
                sessionIds.map((sessionId) => ({ sessionId })),
                p.sessions.length,
              )
            : 0
          const doneCount = isChallenge
            ? p.sessions.filter((s) =>
                sessionIds.includes(s.id),
              ).length
            : 0
          return (
            <li key={p.id} className="card overflow-hidden">
              <Link to={`/programas/${p.id}`} className="block">
                <div
                  className="flex items-center gap-3 p-4 text-white"
                  style={{
                    background: `linear-gradient(135deg, ${c.from}, ${c.to})`,
                  }}
                >
                  <ProgramIcon id={p.id} />
                  <div className="min-w-0 flex-1">
                    <p className="card-title truncate text-white">{p.namePt}</p>
                    <p className="tnum text-sm text-white/85">
                      {p.sessions.length} sessões · {p.daysPerWeek}d/sem
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-black/25 px-2.5 py-0.5 text-xs font-bold text-white">
                    {isChallenge ? 'Desafio' : (LEVEL_PT[p.level] ?? `Nível ${p.level}`)}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3">
                  {active && (
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                      style={{ background: 'var(--green)' }}
                    >
                      Em andamento
                    </span>
                  )}
                  {isChallenge && active && (
                    <span className="tnum text-xs font-semibold opacity-80">
                      Dia {unlocked} de {p.sessions.length}
                    </span>
                  )}
                  {isChallenge && active && (
                    <span
                      className="h-2 flex-1 overflow-hidden rounded-full"
                      role="progressbar"
                      aria-valuenow={doneCount}
                      aria-valuemin={0}
                      aria-valuemax={p.sessions.length}
                      aria-label={`Progresso do desafio: ${doneCount} de ${p.sessions.length}`}
                      style={{ background: 'var(--surface-2)' }}
                    >
                      <span
                        className="block h-full rounded-full"
                        style={{
                          width: `${(doneCount / Math.max(1, p.sessions.length)) * 100}%`,
                          background: 'var(--green)',
                        }}
                      />
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function DetalhePrograma({ repo }: { repo: Repository }) {
  const { id = '' } = useParams()
  const program = programById[id]
  const [profile, setProfile] = useState<UserProfile | undefined>()
  const [doneCount, setDoneCount] = useState(0)
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    void repo.getProfile().then(setProfile)
    void repo.listLogs().then((logs) => {
      const ids = new Set(logs.map((l) => l.sessionId))
      setDoneIds(ids)
      setDoneCount(
        program ? program.sessions.filter((s) => ids.has(s.id)).length : 0,
      )
    })
  }, [repo, program])

  if (!program) {
    return (
      <div className="app-shell gap-4 p-4">
        <p>Programa não encontrado.</p>
        <Link to="/programas" className="underline">
          Voltar
        </Link>
      </div>
    )
  }
  const isChallenge = program.id === 'desafio-28d'
  const unlocked = challengeUnlocked(program.id, [...doneIds].map((sessionId) => ({ sessionId })), program.sessions.length)
  const active = profile?.activeProgramId === program.id

  async function activate() {
    const p: UserProfile = {
      startingPoints: {},
      equipment: ['bar'],
      daysPerWeek: program.daysPerWeek,
      goal: program.goal,
      ...(profile ?? {}),
      activeProgramId: program.id,
    }
    await repo.saveProfile(p)
    setProfile(p)
  }

  return (
    <div className="app-shell gap-3 p-4">
      <Link to="/programas" className="touch-target text-sm underline">
        ← Programas
      </Link>
      <h1 className="screen-title">{program.namePt}</h1>
      {isChallenge && (
        <p className="text-sm font-medium" data-testid="challenge-progress">
          {doneCount} de 28 exercícios
        </p>
      )}
      <button
        type="button"
        onClick={() => void activate()}
        disabled={active}
        className="btn-primary disabled:opacity-50"
      >
        {active ? 'Programa ativo' : 'Ativar programa'}
      </button>
      <ul className="flex flex-col gap-2">
        {program.sessions.map((s, i) => {
          const locked = isChallenge && i + 1 > unlocked
          const done = doneIds.has(s.id)
          return (
            <li key={s.id} className="card p-3">
              <p className="font-medium">
                {s.title} {done ? '✓' : ''} {locked ? '🔒' : ''}
              </p>
              <ul className="text-sm opacity-80">
                {s.items.map((item) => (
                  <li key={item.exerciseId}>
                    {exerciseById[item.exerciseId]?.namePt ?? item.exerciseId} ·{' '}
                    {item.sets}x{item.reps ?? `${item.holdSec}s`}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>
    </div>
  )
}