import { useEffect, useMemo, useRef, useState } from 'react'
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

/** Imagem com esqueleto enquanto carrega e reserva se falhar. */
function CardImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-1 rounded-xl bg-black/20 text-xs opacity-70">
        <img
          src={pub('/media/placeholder.svg')}
          alt=""
          aria-hidden="true"
          className="h-10 w-10"
        />
        {alt}
      </div>
    )
  }
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
      {!loaded && (
        <div aria-hidden="true" className="skeleton absolute inset-0" />
      )}
      <img
        src={src}
        alt=""
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
        style={{ opacity: loaded ? 1 : 0 }}
      />
    </div>
  )
}

export function Biblioteca() {
  const [q, setQ] = useState('')
  const [pillar, setPillar] = useState<Pillar | 'all'>('all')
  const [level, setLevel] = useState<Level | 0>(0)
  const [equipment, setEquipment] = useState('all')
  const [sheetOpen, setSheetOpen] = useState(false)
  const filterBtnRef = useRef<HTMLButtonElement>(null)

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

  const activeFilters =
    (level === 0 ? 0 : 1) + (equipment === 'all' ? 0 : 1)
  const isDefault =
    q.trim() === '' && pillar === 'all' && activeFilters === 0

  function clearFilters() {
    setLevel(0)
    setEquipment('all')
  }

  // Bottom sheet: fecha com Esc, trava o scroll, devolve o foco.
  useEffect(() => {
    if (!sheetOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setSheetOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      filterBtnRef.current?.focus()
    }
  }, [sheetOpen])

  return (
    <div className="app-shell gap-3 p-4">
      <h1 className="screen-title">
        Biblioteca{' '}
        <span className="tnum text-base font-semibold opacity-60">
          {isDefault ? `(${list.length})` : `${list.length} resultados`}
        </span>
      </h1>

      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 opacity-60"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          placeholder="Buscar exercício"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Buscar exercício"
          className="touch-target w-full rounded-xl py-2 pr-10 pl-10 text-sm"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        />
        {q !== '' && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Limpar busca"
            className="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full opacity-70"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.4}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      <div
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1"
        role="group"
        aria-label="Pilar"
      >
        {PILLARS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPillar(p.id)}
            aria-pressed={pillar === p.id}
            className="chip touch-target shrink-0 px-3 text-sm font-semibold"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div>
        <button
          ref={filterBtnRef}
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className="chip touch-target px-4 text-sm font-semibold"
        >
          Filtros
          {activeFilters > 0 && (
            <span
              className="tnum ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-bold text-white"
              style={{ background: 'var(--green)' }}
            >
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Filtros"
          onClick={() => setSheetOpen(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-t-2xl p-4 pb-6"
            style={{
              background: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="card-title">Nível</p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Nível">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLevel(l.id)}
                  aria-pressed={level === l.id}
                  className="chip touch-target px-3 text-sm font-semibold"
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="card-title mt-4">Equipamento</p>
            <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Equipamento">
              {EQUIP.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setEquipment(e.id)}
                  aria-pressed={equipment === e.id}
                  className="chip touch-target px-3 text-sm font-semibold"
                >
                  {e.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="btn-secondary flex-1"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="btn-primary flex-1"
              >
                Ver {list.length}
              </button>
            </div>
          </div>
        </div>
      )}

      {list.length === 0 && <p>Nenhum exercício encontrado.</p>}
      <ul className="grid grid-cols-2 gap-3">
        {list.map((e) => (
          <li key={e.id} className="card overflow-hidden p-2">
            <Link to={`/exercicio/${e.id}`} className="block">
              <CardImage
                src={pub(e.media.frames?.[0] ?? '/media/placeholder.svg')}
                alt={e.namePt}
              />
              <p className="mt-1.5 text-[15px] font-semibold">{e.namePt}</p>
              <p className="mt-1 flex gap-1">
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'var(--surface-2)' }}>
                  Nível {e.level}
                </span>
                <span className="rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'var(--surface-2)' }}>
                  {e.type === 'hold' ? 'tempo' : 'reps'}
                </span>
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
