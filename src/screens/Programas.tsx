import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { exerciseById } from '../data/exercises'
import { programById, programs } from '../data/programs'
import type { Repository } from '../repo/Repository'
import { challengeUnlocked } from '../repo/training'
import type { UserProfile } from '../repo/types'

export function Programas() {
  return (
    <div className="app-shell gap-3 p-4">
      <h1 className="text-xl font-bold">Programas</h1>
      <ul className="flex flex-col gap-2">
        {programs.map((p) => (
          <li key={p.id} className="rounded border p-3">
            <Link to={`/programas/${p.id}`} className="block">
              <p className="font-medium">{p.namePt}</p>
              <p className="text-sm opacity-70">
                {p.sessions.length} sessÃµes Â· {p.daysPerWeek}d/sem
              </p>
            </Link>
          </li>
        ))}
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
        <p>Programa nÃ£o encontrado.</p>
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
        â† Programas
      </Link>
      <h1 className="text-xl font-bold">{program.namePt}</h1>
      {isChallenge && (
        <p className="text-sm font-medium" data-testid="challenge-progress">
          {doneCount} de 28 exercÃ­cios
        </p>
      )}
      <button
        type="button"
        onClick={() => void activate()}
        disabled={active}
        className="touch-target rounded bg-green-700 px-4 font-bold text-white disabled:opacity-50"
      >
        {active ? 'Programa ativo' : 'Ativar programa'}
      </button>
      <ul className="flex flex-col gap-2">
        {program.sessions.map((s, i) => {
          const locked = isChallenge && i + 1 > unlocked
          const done = doneIds.has(s.id)
          return (
            <li key={s.id} className="rounded border p-3">
              <p className="font-medium">
                {s.title} {done ? 'âœ“' : ''} {locked ? 'ðŸ”’' : ''}
              </p>
              <ul className="text-sm opacity-80">
                {s.items.map((item) => (
                  <li key={item.exerciseId}>
                    {exerciseById[item.exerciseId]?.namePt ?? item.exerciseId} Â·{' '}
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
