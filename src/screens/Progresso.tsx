import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { exerciseById } from '../data/exercises'
import type { Repository } from '../repo/Repository'
import type { WorkoutLog } from '../repo/types'
import { weeklyVolumeByPillar } from '../repo/training'

/** Progresso: histórico, volume semanal por pilar, recordes, gráfico simples. */
export function Progresso({ repo }: { repo: Repository }) {
  const [logs, setLogs] = useState<WorkoutLog[]>([])

  useEffect(() => {
    void repo.listLogs().then(setLogs)
  }, [repo])

  const volume = weeklyVolumeByPillar(logs, exerciseById)
  const maxVol = Math.max(1, ...Object.values(volume))

  // Recordes pessoais: maior reps / maior hold por exercício.
  const prs = new Map<string, { reps?: number; holdSec?: number }>()
  for (const log of logs) {
    for (const entry of log.entries) {
      for (const s of entry.sets) {
        if (!s.done) continue
        const cur = prs.get(entry.exerciseId) ?? {}
        if (s.reps !== undefined) cur.reps = Math.max(cur.reps ?? 0, s.reps)
        if (s.holdSec !== undefined) cur.holdSec = Math.max(cur.holdSec ?? 0, s.holdSec)
        prs.set(entry.exerciseId, cur)
      }
    }
  }

  return (
    <div className="app-shell gap-4 p-4">
      <h1 className="text-xl font-bold">Progresso</h1>

      <section aria-label="Volume semanal por pilar">
        <h2 className="font-bold">Volume (séries, 7 dias)</h2>
        {Object.keys(volume).length === 0 && (
          <p className="text-sm opacity-70">Sem treinos ainda.</p>
        )}
        <ul className="mt-1 flex flex-col gap-1">
          {Object.entries(volume).map(([pillar, sets]) => (
            <li key={pillar} className="text-sm">
              <span className="inline-block w-20">{pillar}</span>
              <span
                role="img"
                aria-label={`${sets} séries de ${pillar}`}
                className="inline-block h-4 rounded bg-green-700 align-middle"
                style={{ width: `${Math.max(4, (sets / maxVol) * 160)}px` }}
              />{' '}
              {sets}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Recordes pessoais">
        <h2 className="font-bold">Recordes</h2>
        {prs.size === 0 && <p className="text-sm opacity-70">Sem recordes ainda.</p>}
        <ul className="text-sm">
          {[...prs.entries()].map(([id, pr]) => (
            <li key={id}>
              {exerciseById[id]?.namePt ?? id}:{' '}
              {pr.reps !== undefined ? `${pr.reps} reps` : ''}
              {pr.holdSec !== undefined ? `${pr.holdSec}s` : ''}
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Histórico">
        <h2 className="font-bold">Histórico</h2>
        {logs.length === 0 && <p className="text-sm opacity-70">Sem treinos ainda.</p>}
        <ul className="flex flex-col gap-1 text-sm">
          {logs.slice(0, 20).map((l) => (
            <li key={l.id} className="rounded border p-2">
              {new Date(l.date).toLocaleDateString('pt-BR')} · {l.sessionId} ·{' '}
              {Math.round(l.durationSec / 60)} min
            </li>
          ))}
        </ul>
      </section>

      <Link to="/" className="text-sm underline">
        Voltar ao início
      </Link>
    </div>
  )
}
