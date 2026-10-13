import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { exercises } from '../data/exercises'
import { pub } from '../media'
import type { Level, Pillar } from '../repo/types'

const PILLARS: { id: Pillar | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'push', label: 'Empurrar' },
  { id: 'pull', label: 'Puxar' },
  { id: 'legs', label: 'Pernas' },
  { id: 'core', label: 'Core' },
  { id: 'skill', label: 'Skills' },
  { id: 'mobility', label: 'Mobilidade' },
]

const LEVELS: { id: Level | 0; label: string }[] = [
  { id: 0, label: 'Todos' },
  { id: 1, label: 'Novato' },
  { id: 2, label: 'Iniciante' },
  { id: 3, label: 'Intermediário' },
  { id: 4, label: 'Avançado' },
]

const EQUIP: { id: string; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'none', label: 'Sem equipamento' },
  { id: 'bar', label: 'Barra' },
  { id: 'parallettes', label: 'Paralelas' },
  { id: 'rings', label: 'Argolas' },
  { id: 'bands', label: 'Elásticos' },
]

export function Biblioteca() {
  const [q, setQ] = useState('')
  const [pillar, setPillar] = useState<Pillar | 'all'>('all')
  const [level, setLevel] = useState<Level | 0>(0)
  const [equipment, setEquipment] = useState('all')

  const list = useMemo(
    () =>
      exercises.filter(
        (e) =>
          (pillar === 'all' || e.pillar === pillar) &&
          (level === 0 || e.level === level) &&
          (equipment === 'all' || e.equipment === equipment) &&
          (q.trim() === '' ||
            e.namePt.toLowerCase().includes(q.trim().toLowerCase())),
      ),
    [q, pillar, level, equipment],
  )

  return (
    <div className="app-shell gap-3 p-4">
      <h1 className="text-xl font-bold">Biblioteca ({list.length})</h1>
      <input
        type="search"
        placeholder="Buscar exercício"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Buscar exercício"
        className="touch-target w-full rounded border px-3"
      />
      <div className="flex flex-wrap gap-1" role="group" aria-label="Pilar">
        {PILLARS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPillar(p.id)}
            aria-pressed={pillar === p.id}
            className={`touch-target rounded border px-2 text-sm ${pillar === p.id ? 'bg-black text-white' : ''}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <select
          aria-label="Nível"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value) as Level | 0)}
          className="touch-target rounded border px-2 text-sm"
        >
          {LEVELS.map((l) => (
            <option key={l.id} value={l.id}>
              {l.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Equipamento"
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          className="touch-target rounded border px-2 text-sm"
        >
          {EQUIP.map((e) => (
            <option key={e.id} value={e.id}>
              {e.label}
            </option>
          ))}
        </select>
      </div>
      {list.length === 0 && <p>Nenhum exercício encontrado.</p>}
      <ul className="grid grid-cols-2 gap-2">
        {list.map((e) => (
          <li key={e.id} className="rounded border p-2">
            <Link to={`/exercicio/${e.id}`} className="block">
              <img
                src={pub(e.media.frames?.[0] ?? '/media/placeholder.svg')}
                alt=""
                loading="lazy"
                className="h-24 w-full rounded object-cover"
              />
              <p className="mt-1 text-sm font-medium">{e.namePt}</p>
              <p className="text-xs opacity-70">
                Nível {e.level} · {e.type === 'hold' ? 'isometria' : 'reps'}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
