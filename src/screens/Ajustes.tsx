import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Repository } from '../repo/Repository'
import type { UserProfile } from '../repo/types'

/** Ajustes: perfil, lembrete de treino, tempos e tema. */
export function Ajustes({ repo }: { repo: Repository }) {
  const [profile, setProfile] = useState<UserProfile | undefined>()
  const [reminder, setReminder] = useState('')
  const [seriesSec, setSeriesSec] = useState('30')
  const [restSec, setRestSec] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.dataset['theme'] === 'light'
      ? 'light'
      : 'dark',
  )
  const [msg, setMsg] = useState('')

  useEffect(() => {
    void repo.getProfile().then((p) => {
      setProfile(p)
      setReminder(p?.reminderTime ?? '')
      setSeriesSec(String(p?.seriesSec ?? 30))
      setRestSec(p?.restSecOverride === undefined ? '' : String(p.restSecOverride))
    })
  }, [repo])

  function applyTheme(next: 'light' | 'dark') {
    setTheme(next)
    document.documentElement.dataset['theme'] = next
    try {
      localStorage.setItem('calistenia-theme', next)
    } catch {
      /* sem storage */
    }
  }

  async function saveReminder() {
    const base: UserProfile = profile ?? {
      startingPoints: {},
      equipment: [],
      daysPerWeek: 3,
      goal: 'strength',
    }
    const next = { ...base, reminderTime: reminder || undefined }
    await repo.saveProfile(next)
    setProfile(next)
    setMsg('Lembrete salvo (só dentro do app).')
  }

  function clampSec(v: number, fallback: number): number {
    if (!Number.isFinite(v)) return fallback
    return Math.min(600, Math.max(10, Math.round(v)))
  }

  async function saveTimes() {
    const base: UserProfile = profile ?? {
      startingPoints: {},
      equipment: [],
      daysPerWeek: 3,
      goal: 'strength',
    }
    const rest = restSec.trim() === '' ? undefined : clampSec(Number(restSec), 30)
    const next = {
      ...base,
      seriesSec: clampSec(Number(seriesSec), 30),
      restSecOverride: rest,
    }
    await repo.saveProfile(next)
    setProfile(next)
    setSeriesSec(String(next.seriesSec))
    setRestSec(rest === undefined ? '' : String(rest))
    setMsg('Tempos salvos.')
  }

  return (
    <div className="app-shell gap-4 p-4">
      <h1 className="text-xl font-bold">Ajustes</h1>
      {msg && (
        <p role="status" className="rounded border p-2 text-sm">
          {msg}
        </p>
      )}

      <section aria-label="Perfil">
        <h2 className="font-bold">Perfil</h2>
        <p className="text-sm">
          Dias/semana: {profile?.daysPerWeek ?? '—'} · Objetivo:{' '}
          {profile?.goal ?? '—'} · Equipamento:{' '}
          {profile?.equipment?.join(', ') || 'nenhum'}
        </p>
        <Link to="/onboarding" className="text-sm underline">
          Refazer onboarding
        </Link>
      </section>

      <section aria-label="Lembrete" className="flex flex-col gap-2">
        <h2 className="font-bold">Lembrete</h2>
        <label className="flex items-center gap-2 text-sm">
          Horário
          <input
            type="time"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="touch-target rounded border px-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void saveReminder()}
          className="touch-target rounded border px-4 text-sm"
        >
          Salvar lembrete
        </button>
        <p className="rounded border p-2 text-sm">
          Para que serve: guarda o horário em que você pretende treinar,
          como um compromisso pessoal. O app não envia notificação — na
          Fase 1 não há push nem aviso com o app fechado; o horário fica
          salvo aqui para você consultar.
        </p>
      </section>

      <section aria-label="Tempos" className="flex flex-col gap-2">
        <h2 className="font-bold">Tempos</h2>
        <label className="flex items-center gap-2 text-sm">
          Série (segundos)
          <input
            type="number"
            min={10}
            max={600}
            value={seriesSec}
            onChange={(e) => setSeriesSec(e.target.value)}
            className="touch-target w-24 rounded border px-2"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          Descanso (segundos)
          <input
            type="number"
            min={10}
            max={600}
            placeholder="padrão 30s"
            value={restSec}
            onChange={(e) => setRestSec(e.target.value)}
            className="touch-target w-24 rounded border px-2"
          />
        </label>
        <button
          type="button"
          onClick={() => void saveTimes()}
          className="touch-target rounded border px-4 text-sm"
        >
          Salvar tempos
        </button>
        <p className="rounded border p-2 text-sm">
          A série conclui sozinha ao zerar (10–600 s). Descanso vazio = 30s.
          Ficam salvos no aparelho: recarregar a tela não altera.
        </p>
      </section>

      <section aria-label="Limites">
        <h2 className="font-bold">Limites</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>Exige o primeiro carregamento online; depois funciona offline.</li>
          <li>
            No iOS, instalação, precache, Wake Lock e notificações podem variar.
          </li>
        </ul>
      </section>

      <section aria-label="Tema">
        <h2 className="font-bold">Tema</h2>
        <button
          type="button"
          onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-pressed={theme === 'dark'}
          className="touch-target rounded border px-4 text-sm"
        >
          Tema: {theme === 'dark' ? 'escuro' : 'claro'} (trocar)
        </button>
      </section>

      <Link to="/" className="text-sm underline">
        Voltar ao início
      </Link>
    </div>
  )
}
