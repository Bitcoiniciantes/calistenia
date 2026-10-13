import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mediaCredits } from '../data/mediaCredits'
import { parseBackup } from '../repo/backup'
import type { Repository } from '../repo/Repository'
import type { UserProfile } from '../repo/types'

/** Ajustes: perfil, lembrete honesto, backup JSON, tema e créditos. */
export function Ajustes({ repo }: { repo: Repository }) {
  const [profile, setProfile] = useState<UserProfile | undefined>()
  const [reminder, setReminder] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.dataset['theme'] === 'dark'
      ? 'dark'
      : 'light',
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

  async function exportJson() {
    const [p, logs] = await Promise.all([repo.getProfile(), repo.listLogs()])
    const blob = new Blob([JSON.stringify({ profile: p, logs }, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'calistenia-backup.json'
    a.click()
    URL.revokeObjectURL(url)
    setMsg('Backup exportado.')
  }

  async function importJson(file: File) {
    try {
      // Valida sem tocar nos dados; rejeita com mensagem clara.
      const data = parseBackup(await file.text())
      if (data.profile) await repo.saveProfile(data.profile)
      if (Array.isArray(data.logs)) {
        for (const log of data.logs) await repo.addLog(log)
      }
      const p = await repo.getProfile()
      setProfile(p)
      setMsg('Backup importado.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Arquivo inválido.')
    }
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
          Lembrete só dentro do app; sem notificação em segundo plano ou com o
          app fechado.
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

      <section aria-label="Backup" className="flex flex-col gap-2">
        <h2 className="font-bold">Backup</h2>
        <button
          type="button"
          onClick={() => void exportJson()}
          className="touch-target rounded border px-4 text-sm"
        >
          Exportar JSON
        </button>
        <label className="touch-target flex items-center gap-2 rounded border px-4 text-sm">
          Importar JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) void importJson(f)
            }}
          />
        </label>
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

      <section aria-label="Créditos de mídia">
        <h2 className="font-bold">Créditos de mídia</h2>
        <ul className="mt-1 flex flex-col gap-2">
          {mediaCredits.map((c) => (
            <li key={c.file} className="rounded border p-2 text-sm">
              <p className="font-medium">{c.file}</p>
              <p>
                Autor: {c.author} ·{' '}
                {c.licenseUrl ? (
                  <a href={c.licenseUrl} target="_blank" rel="noreferrer" className="underline">
                    {c.license}
                  </a>
                ) : (
                  <span>{c.license}</span>
                )}
              </p>
              <p className="opacity-70">{c.attribution}</p>
              {c.pageUrl ? (
                <a href={c.pageUrl} target="_blank" rel="noreferrer" className="underline">
                  Página do arquivo no Wikimedia Commons
                </a>
              ) : null}
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
