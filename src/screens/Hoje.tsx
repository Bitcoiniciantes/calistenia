import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { programById } from '../data/programs'
import { pub } from '../media'
import type { Repository } from '../repo/Repository'
import type { Session } from '../repo/types'
import { calcStreak } from '../repo/training'

/** Hoje: treino do dia, streak e semana em calendÃ¡rio. */
export function Hoje({ repo }: { repo: Repository }) {
  const [streak, setStreak] = useState(0)
  const [week, setWeek] = useState<{ label: string; trained: boolean }[]>([])
  const [programId, setProgramId] = useState<string>('iniciante-3d')
  const [session, setSession] = useState<Session | undefined>()

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
      // Rotaciona as sessÃµes pelo dia do ano (efeito, nÃ£o render).
      const prog = programById[pid]!
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
          86400000,
      )
      setSession(prog.sessions[dayOfYear % prog.sessions.length])
      setStreak(calcStreak(logs.map((l) => l.date)))
      const trainedDays = new Set(
        logs.map((l) => new Date(l.date).toDateString()),
      )
      const days: { label: string; trained: boolean }[] = []
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        days.push({
          label: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }),
          trained: trainedDays.has(d.toDateString()),
        })
      }
      setWeek(days)
    })()
  }, [repo])

  const program = programById[programId]!

  return (
    <div className="app-shell gap-4 p-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">Hoje</h1>
        <span data-testid="streak">ðŸ”¥ {streak}</span>
      </div>
      <div className="flex gap-1" aria-label="Semana">
        {week.map((d, i) => (
          <span
            key={i}
            title={d.trained ? 'Treinou' : 'Sem treino'}
            className={`touch-target flex flex-1 items-center justify-center rounded border text-sm ${d.trained ? 'bg-green-700 text-white' : ''}`}
          >
            {d.label}
          </span>
        ))}
      </div>
      <div className="rounded border p-4">
        <img
          src={pub('/media/capahome.jpg')}
          alt="Guia visual com 20 exercícios de calistenia"
          loading="lazy"
          className="mb-3 w-full rounded object-cover"
        />
        <p className="text-sm opacity-70">{program.namePt}</p>
        <p className="font-medium">{session?.title ?? 'Carregandoâ€¦'}</p>
        {session && (
          <Link
            to={`/execucao/${session.id}`}
            className="touch-target mt-3 flex items-center justify-center rounded bg-green-700 px-4 font-bold text-white"
          >
            ComeÃ§ar
          </Link>
        )}
      </div>
      <nav className="flex gap-3 text-sm underline">
        <Link to="/biblioteca">Biblioteca</Link>
        <Link to="/programas">Programas</Link>
        <Link to="/progresso">Progresso</Link>
        <Link to="/ajustes">Ajustes</Link>
      </nav>
    </div>
  )
}
