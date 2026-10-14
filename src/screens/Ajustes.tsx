import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Repository } from '../repo/Repository'
import type { UserProfile } from '../repo/types'

/** Ajustes: perfil, lembrete de treino e tema. */
export function Ajustes({ repo }: { repo: Repository }) {
  const [profile, setProfile] = useState<UserProfile | undefined>()
  const [reminder, setReminder] = useState('')
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
