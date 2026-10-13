import { Link, useParams } from 'react-router-dom'
import { exerciseById, progressionChains } from '../data/exercises'
import { creditsForExercise } from '../data/mediaCredits'
import { programs } from '../data/programs'
import { ExerciseMedia } from '../components/ExerciseMedia'

export function DetalheExercicio() {
  const { id = '' } = useParams()
  const exercise = exerciseById[id]
  if (!exercise) {
    return (
      <div className="app-shell gap-4 p-4">
        <p>Exercício não encontrado.</p>
        <Link to="/biblioteca" className="underline">
          Voltar à biblioteca
        </Link>
      </div>
    )
  }
  const chain = progressionChains.find((c) => c.id === exercise.progressionChainId)
  const credits = creditsForExercise(exercise.id)
  const usedIn = programs.filter((p) =>
    p.sessions.some((s) => s.items.some((i) => i.exerciseId === exercise.id)),
  )

  return (
    <div className="app-shell gap-3 p-4">
      <Link to="/biblioteca" className="touch-target text-sm underline">
        ← Biblioteca
      </Link>
      <div className="h-64">
        <ExerciseMedia
          frames={exercise.media.frames}
          coherent
          alt={`Demonstração de ${exercise.namePt}`}
          exerciseName={exercise.namePt}
          cues={exercise.cues}
        />
      </div>
      <h1 className="text-xl font-bold">{exercise.namePt}</h1>
      <p className="text-sm opacity-70">
        {exercise.nameEn} · Nível {exercise.level} ·{' '}
        {exercise.type === 'hold' ? 'isometria (timer)' : 'repetições'}
      </p>

      {chain && (
        <section aria-label="Cadeia de progressão">
          <h2 className="font-bold">Progressão: {chain.goal}</h2>
          <ol className="mt-1 flex flex-col gap-1">
            {chain.steps.map((stepId, i) => {
              const step = exerciseById[stepId]
              const current = stepId === exercise.id
              return (
                <li
                  key={stepId}
                  aria-current={current ? 'step' : undefined}
                  className={`touch-target rounded border px-3 text-sm ${current ? 'bg-black font-bold text-white' : ''}`}
                >
                  {i + 1}. {step?.namePt ?? stepId}
                  {current ? ' (atual)' : ''}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <section aria-label="Como fazer">
        <h2 className="font-bold">Como fazer</h2>
        <ul className="list-disc pl-5 text-sm">
          {exercise.cues.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <h2 className="mt-2 font-bold">Erros comuns</h2>
        <ul className="list-disc pl-5 text-sm">
          {exercise.commonMistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      {credits.length > 0 && (
        <section aria-label="Créditos da demonstração">
          <h2 className="font-bold">Créditos da demonstração</h2>
          <ul className="text-sm">
            {credits.map((c) => (
              <li key={c.file}>
                {c.attribution} —{' '}
                <a href={c.pageUrl} target="_blank" rel="noreferrer" className="underline">
                  origem
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {usedIn.length > 0 && (
        <section aria-label="Programas com este exercício">
          <h2 className="font-bold">Programas que incluem este exercício</h2>
          <ul className="text-sm underline">
            {usedIn.map((p) => (
              <li key={p.id}>
                <Link to={`/programas/${p.id}`}>{p.namePt}</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
