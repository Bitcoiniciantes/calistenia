import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Repository } from '../repo/Repository'
import type { UserProfile } from '../repo/types'
import { APP_VERSION } from '../version'

const GOAL_PT: Record<string, string> = {
  strength: 'Força',
  muscle: 'Músculo',
  skills: 'Skills',
  fatloss: 'Definição',
}

const EQUIP_PT: Record<string, string> = {
  none: 'Sem equipamento',
  bar: 'Barra',
  parallettes: 'Paralelas',
  rings: 'Argolas',
  bands: 'Elásticos',
}

function sectionTitle(label: string) {
  return (
    <h2 className="caption font-bold tracking-wide uppercase">{label}</h2>
  )
}

/** Ajustes: perfil, lembrete de treino, tempos e tema. */
export function Ajustes({ repo }: { repo: Repository }) {
  const [profile, setProfile] = useState<UserProfile | undefined>()
  const [reminder, setReminder] = useState('')
  const [seriesSec, setSeriesSec] = useState('30')
  const [restSec, setRestSec] = useState('')
  const [alongSec, setAlongSec] = useState('30')
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.dataset['theme'] === 'light'
      ? 'light'
      : 'dark',
  )
  const [msgLembrete, setMsgLembrete] = useState('')
  const [msgTempos, setMsgTempos] = useState('')

  useEffect(() => {
    void repo.getProfile().then((p) => {
      setProfile(p)
      setReminder(p?.reminderTime ?? '')
      setSeriesSec(String(p?.seriesSec ?? 30))
      setRestSec(p?.restSecOverride === undefined ? '' : String(p.restSecOverride))
      setAlongSec(String(p?.alongamentoSec ?? 30))
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

  function baseProfile(): UserProfile {
    return (
      profile ?? {
        startingPoints: {},
        equipment: [],
        daysPerWeek: 3,
        goal: 'strength',
      }
    )
  }

  async function saveReminder() {
    const next = { ...baseProfile(), reminderTime: reminder || undefined }
    await repo.saveProfile(next)
    setProfile(next)
    setMsgLembrete('Salvo ✓')
  }

  function clampSec(v: number, fallback: number): number {
    if (!Number.isFinite(v)) return fallback
    return Math.min(600, Math.max(10, Math.round(v)))
  }

  function step(
    current: string,
    setter: (v: string) => void,
    delta: number,
  ) {
    const base = current.trim() === '' ? 30 : Number(current)
    setter(String(clampSec((Number.isFinite(base) ? base : 30) + delta, 30)))
  }

  async function saveTimes() {
    const base = baseProfile()
    const rest = restSec.trim() === '' ? undefined : clampSec(Number(restSec), 30)
    const next = {
      ...base,
      seriesSec: clampSec(Number(seriesSec), 30),
      restSecOverride: rest,
      alongamentoSec: clampSec(Number(alongSec), 30),
    }
    await repo.saveProfile(next)
    setProfile(next)
    setSeriesSec(String(next.seriesSec))
    setRestSec(rest === undefined ? '' : String(rest))
    setAlongSec(String(next.alongamentoSec))
    setMsgTempos('Salvo ✓')
  }

  function timeField(
    label: string,
    value: string,
    setter: (v: string) => void,
    placeholder?: string,
  ) {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={`tempo-${label}`} className="text-sm font-medium">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(value, setter, -5)}
            aria-label={`Diminuir ${label}`}
            className="touch-target w-11 rounded-xl text-lg font-bold"
            style={{ background: 'var(--surface-2)' }}
          >
            −
          </button>
          <input
            id={`tempo-${label}`}
            type="number"
            min={10}
            max={600}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setter(e.target.value)}
            className="touch-target tnum w-full rounded-xl border px-2 text-center"
          />
          <button
            type="button"
            onClick={() => step(value, setter, 5)}
            aria-label={`Aumentar ${label}`}
            className="touch-target w-11 rounded-xl text-lg font-bold"
            style={{ background: 'var(--surface-2)' }}
          >
            +
          </button>
          <span className="caption w-4">s</span>
        </div>
      </div>
    )
  }

  const equipmentPt =
    profile?.equipment?.map((e) => EQUIP_PT[e] ?? e).join(', ') || '—'

  return (
    <div className="app-shell gap-5 p-4">
      <h1 className="screen-title">Ajustes</h1>

      <section aria-label="Perfil" className="flex flex-col gap-2">
        {sectionTitle('Perfil')}
        <div className="card row-divide p-4">
          <div className="flex justify-between gap-2 py-1.5 text-sm">
            <span className="opacity-70">Objetivo</span>
            <span className="font-semibold">
              {profile?.goal ? (GOAL_PT[profile.goal] ?? profile.goal) : '—'}
            </span>
          </div>
          <div className="flex justify-between gap-2 py-1.5 text-sm">
            <span className="opacity-70">Equipamento</span>
            <span className="text-right font-semibold">{equipmentPt}</span>
          </div>
          <div className="flex justify-between gap-2 py-1.5 text-sm">
            <span className="opacity-70">Frequência</span>
            <span className="font-semibold">
              {profile?.daysPerWeek !== undefined
                ? `${profile.daysPerWeek} dias por semana`
                : '—'}
            </span>
          </div>
        </div>
        <Link to="/onboarding" className="btn-secondary">
          Refazer onboarding
        </Link>
      </section>

      <section aria-label="Lembrete" className="flex flex-col gap-2">
        {sectionTitle('Lembrete')}
        <div className="card flex flex-col gap-3 p-4">
          <label htmlFor="lembrete-horario" className="text-sm font-medium">
            Horário
          </label>
          <input
            id="lembrete-horario"
            type="time"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            className="touch-target tnum rounded-xl border px-3"
          />
          <button
            type="button"
            onClick={() => void saveReminder()}
            className="btn-primary"
          >
            Salvar lembrete
          </button>
          {msgLembrete && (
            <p role="status" className="text-sm font-bold" style={{ color: 'var(--green)' }}>
              {msgLembrete}
            </p>
          )}
          <p className="caption">
            Compromisso pessoal: o app não envia notificação, o horário fica
            salvo aqui para você consultar.
          </p>
        </div>
      </section>

      <section aria-label="Tempos" className="flex flex-col gap-2">
        {sectionTitle('Tempos')}
        <div className="card flex flex-col gap-4 p-4">
          {timeField('Série', seriesSec, setSeriesSec)}
          {timeField('Descanso', restSec, setRestSec, 'padrão 30s')}
          {timeField('Alongamento', alongSec, setAlongSec)}
          <button
            type="button"
            onClick={() => void saveTimes()}
            className="btn-primary"
          >
            Salvar tempos
          </button>
          {msgTempos && (
            <p role="status" className="text-sm font-bold" style={{ color: 'var(--green)' }}>
              {msgTempos}
            </p>
          )}
          <p className="caption">
            10–600 s. Descanso vazio = 30s; no último exercício não há
            descanso. Ficam salvos no aparelho.
          </p>
        </div>
      </section>

      <section aria-label="Limites" className="flex flex-col gap-2">
        {sectionTitle('Limites')}
        <div className="card p-4">
          <ul className="caption list-disc pl-5">
            <li>Exige o primeiro carregamento online; depois funciona offline.</li>
            <li>
              No iOS, instalação, precache, Wake Lock e notificações podem variar.
            </li>
          </ul>
        </div>
      </section>

      <section aria-label="Tema" className="flex flex-col gap-2">
        {sectionTitle('Tema')}
        <button
          type="button"
          onClick={() => applyTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-pressed={theme === 'dark'}
          className="btn-secondary"
        >
          Tema: {theme === 'dark' ? 'escuro' : 'claro'} (trocar)
        </button>
      </section>

      <section aria-label="Versão" className="flex flex-col gap-2">
        {sectionTitle('Versão')}
        <p className="caption" data-testid="app-version-ajustes">
          {APP_VERSION} · Funciona offline após o primeiro carregamento.
        </p>
      </section>

      <Link to="/" className="text-center text-sm underline opacity-80">
        Voltar ao início
      </Link>
    </div>
  )
}
