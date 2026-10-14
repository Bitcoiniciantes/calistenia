import { useEffect, useState } from 'react'
import { exerciseById } from '../data/exercises'
import { gateSession } from '../data/gateSession'
import { programs } from '../data/programs'
import type { Repository } from '../repo/Repository'
import type { WorkoutLog } from '../repo/types'
import { calcStreak, weeklyVolumeByPillar } from '../repo/training'

/** Mapa de apresentação (não altera o que está salvo). */
const PILLAR_PT: Record<string, string> = {
  push: 'Empurrar',
  pull: 'Puxar',
  legs: 'Pernas',
  core: 'Core',
  skill: 'Skills',
  mobility: 'Mobilidade',
}

const PILLAR_COLOR: Record<string, string> = {
  push: 'var(--green)',
  pull: '#3b82f6',
  legs: 'var(--orange)',
  core: '#a855f7',
  skill: '#eab308',
  mobility: '#64748b',
}

const SESSION_TITLE: Record<string, string> = Object.fromEntries([
  ...programs.flatMap((p) => p.sessions.map((s) => [s.id, s.title] as const)),
  [gateSession.id, gateSession.title],
])

function dayLabel(date: Date, today: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const t = new Date(today)
  t.setHours(0, 0, 0, 0)
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000)
  if (diff <= 0) return 'Hoje'
  if (diff === 1) return 'Ontem'
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

/** Progresso: resumo, volume semanal por pilar, recordes, histórico. */
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

  // Topo: mesma janela móvel de 7 dias do volume (regra do app).
  // "Treinos" conta dias distintos com treino: refazer no mesmo dia
  // soma séries, mas não conta duas vezes aqui nem na sequência.
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 7)
  const weekLogs = logs.filter((l) => new Date(l.date) >= cutoff)
  const weekDays = new Set(
    weekLogs.map((l) => new Date(l.date).toDateString()),
  )
  const totalSets = logs.reduce(
    (acc, l) =>
      acc +
      l.entries.reduce(
        (a, e) => a + e.sets.filter((s) => s.done).length,
        0,
      ),
    0,
  )
  const streak = calcStreak(logs.map((l) => l.date))

  const ordered = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  const groups = new Map<string, { label: string; items: WorkoutLog[] }>()
  const today = new Date()
  for (const l of ordered.slice(0, 20)) {
    const key = new Date(l.date).toDateString()
    const g = groups.get(key) ?? {
      label: dayLabel(new Date(l.date), today),
      items: [],
    }
    g.items.push(l)
    groups.set(key, g)
  }

  return (
    <div className="app-shell gap-4 p-4">
      <h1 className="screen-title">Progresso</h1>

      <div className="grid grid-cols-3 gap-2">
        <div className="card p-3 text-center">
          <p className="tnum text-2xl font-bold">{weekDays.size}</p>
          <p className="caption">treinos (7 dias)</p>
        </div>
        <div className="card p-3 text-center">
          <p className="tnum text-2xl font-bold">{streak}</p>
          <p className="caption">sequência (dias)</p>
        </div>
        <div className="card p-3 text-center">
          <p className="tnum text-2xl font-bold">{totalSets}</p>
          <p className="caption">séries concluídas</p>
        </div>
      </div>

      <section aria-label="Volume semanal por pilar" className="card p-4">
        <h2 className="card-title">Volume (séries, 7 dias)</h2>
        {Object.keys(volume).length === 0 && (
          <p className="caption mt-1">Sem treinos ainda.</p>
        )}
        <ul className="mt-2 flex flex-col gap-1.5">
          {Object.entries(volume).map(([pillar, sets]) => (
            <li key={pillar} className="flex items-center gap-2 text-sm">
              <span className="w-24 shrink-0 font-medium">
                {PILLAR_PT[pillar] ?? pillar}
              </span>
              <span
                role="img"
                aria-label={`${sets} séries de ${PILLAR_PT[pillar] ?? pillar}`}
                className="h-3 rounded-full align-middle"
                style={{
                  width: `${Math.max(8, (sets / maxVol) * 140)}px`,
                  background: PILLAR_COLOR[pillar] ?? 'var(--green)',
                }}
              />
              <span className="tnum ml-auto font-bold">{sets}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Recordes pessoais" className="card p-4">
        <h2 className="card-title">Recordes</h2>
        {prs.size === 0 && <p className="caption mt-1">Sem recordes ainda.</p>}
        {[...prs.values()].some(
          (pr) => pr.reps === undefined && pr.holdSec === undefined,
        ) && (
          <p className="caption mt-1">— = sem registro (treinos antigos).</p>
        )}
        <ul className="mt-1 text-sm">
          {[...prs.entries()].map(([id, pr]) => (
            <li key={id} className="flex justify-between gap-2 py-0.5">
              <span>{exerciseById[id]?.namePt ?? id}</span>
              <span className="tnum font-semibold">
                {pr.reps !== undefined
                  ? `${pr.reps} reps`
                  : pr.holdSec !== undefined
                    ? `${pr.holdSec} s`
                    : '—'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Histórico">
        <h2 className="card-title">Histórico</h2>
        {logs.length === 0 && (
          <p className="caption mt-1">
            Nada por aqui ainda. Conclua um treino para começar o histórico.
          </p>
        )}
        <div className="mt-2 flex flex-col gap-3">
          {[...groups.values()].map((g) => (
            <div key={g.label}>
              <p className="caption mb-1">{g.label}</p>
              <ul className="flex flex-col gap-1.5">
                {g.items.map((l) => (
                  <li key={l.id} className="card flex items-center gap-2 p-3">
                    <svg
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth={2.4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="shrink-0"
                    >
                      <path d="M4.5 12.5 10 18 19.5 6.5" />
                    </svg>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {SESSION_TITLE[l.sessionId] ?? l.sessionId}
                      </p>
                      <p className="tnum caption">
                        {Math.round(l.durationSec / 60)} min
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
