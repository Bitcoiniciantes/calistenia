import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { exerciseById } from '../data/exercises'
import { programById } from '../data/programs'
import type { Repository } from '../repo/Repository'
import { startingPointsFromTest } from '../repo/training'

const EQUIPMENT = [
  { id: 'bar', label: 'Barra' },
  { id: 'parallettes', label: 'Paralelas' },
  { id: 'rings', label: 'Argolas' },
  { id: 'bands', label: 'ElÃ¡sticos' },
]

/** Onboarding em 3 passos (~1 min), com aviso de seguranÃ§a. */
export function Onboarding({ repo }: { repo: Repository }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [pushups, setPushups] = useState(5)
  const [pullups, setPullups] = useState(0)
  const [squats, setSquats] = useState(10)
  const [equipment, setEquipment] = useState<string[]>(['bar'])
  const [days, setDays] = useState(3)
  const [goal, setGoal] = useState('strength')

  const points = startingPointsFromTest({ pushups, pullups, squats })
  const recommendedId =
    pushups < 10 ? 'iniciante-3d' : pushups < 20 ? 'intermediario-4d' : 'avancado-6d'
  const recommended = programById[recommendedId]!

  function toggle(eq: string) {
    setEquipment((prev) =>
      prev.includes(eq) ? prev.filter((e) => e !== eq) : [...prev, eq],
    )
  }

  async function finish() {
    await repo.saveProfile({
      startingPoints: points,
      equipment,
      daysPerWeek: days,
      goal,
      activeProgramId: recommended.id,
    })
    navigate('/')
  }

  return (
    <div className="app-shell gap-4 p-4">
      <h1 className="text-xl font-bold">ComeÃ§ar ({step}/3)</h1>

      {step === 1 && (
        <section className="flex flex-col gap-3" aria-label="Mini-teste">
          <p className="text-sm">Quantas repetiÃ§Ãµes vocÃª consegue fazer?</p>
          {(
            [
              ['FlexÃµes', pushups, setPushups, 50],
              ['Barras', pullups, setPullups, 20],
              ['Agachamentos', squats, setSquats, 50],
            ] as const
          ).map(([label, v, set, max]) => (
            <label key={label} className="flex items-center justify-between gap-2 text-sm">
              {label}
              <input
                type="number"
                min={0}
                max={max}
                value={v}
                onChange={(e) => set(Math.max(0, Number(e.target.value)))}
                className="touch-target w-24 rounded border px-2"
              />
            </label>
          ))}
          <div className="rounded border p-3 text-sm" aria-label="Ponto de partida">
            <p className="font-bold">Seu ponto de partida por cadeia:</p>
            <ul>
              {Object.entries(points).map(([chain, exId]) => (
                <li key={chain}>
                  {chain}: {exerciseById[exId]?.namePt ?? exId}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-3" aria-label="Equipamento e rotina">
          <p className="text-sm font-bold">Equipamento disponÃ­vel:</p>
          {EQUIPMENT.map((e) => (
            <label key={e.id} className="touch-target flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={equipment.includes(e.id)}
                onChange={() => toggle(e.id)}
              />
              {e.label}
            </label>
          ))}
          <label className="flex items-center justify-between text-sm">
            Dias por semana
            <input
              type="number"
              min={1}
              max={7}
              value={days}
              onChange={(e) => setDays(Math.min(7, Math.max(1, Number(e.target.value))))}
              className="touch-target w-24 rounded border px-2"
            />
          </label>
          <label className="flex items-center justify-between text-sm">
            Objetivo
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="touch-target rounded border px-2"
            >
              <option value="strength">ForÃ§a</option>
              <option value="muscle">Massa muscular</option>
              <option value="skills">Skills</option>
              <option value="fatloss">Gordura corporal</option>
            </select>
          </label>
          {!equipment.includes('bar') && (
            <p className="rounded border p-2 text-sm">
              Sem barra, os exercÃ­cios de puxar ficam limitados â€” o app mostra o
              desequilÃ­brio no volume semanal.
            </p>
          )}
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-3" aria-label="SeguranÃ§a e programa">
          <p className="rounded border p-3 text-sm" role="note">
            Aviso de seguranÃ§a: em caso de dor, lesÃ£o ou condiÃ§Ã£o mÃ©dica,
            consulte um profissional antes de treinar.
          </p>
          <p className="text-sm">
            Programa recomendado: <strong>{recommended.namePt}</strong>
          </p>
        </section>
      )}

      <div className="flex gap-2">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="touch-target rounded border px-4"
          >
            Voltar
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(step + 1)}
            className="touch-target flex-1 rounded bg-green-700 px-4 font-bold text-white"
          >
            Continuar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void finish()}
            className="touch-target flex-1 rounded bg-green-700 px-4 font-bold text-white"
          >
            Salvar e comeÃ§ar
          </button>
        )}
      </div>
      <Link to="/" className="text-sm underline opacity-70">
        Pular por agora
      </Link>
    </div>
  )
}
