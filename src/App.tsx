import { useEffect, useMemo } from 'react'
import { HashRouter, Link, Route, Routes, useParams } from 'react-router-dom'
import { gateSession } from './data/gateSession'
import { programById, programs } from './data/programs'
import { DexieRepository } from './repo/dexieRepo'
import type { Repository } from './repo/Repository'
import { Ajustes } from './screens/Ajustes'
import { Biblioteca } from './screens/Biblioteca'
import { DetalheExercicio } from './screens/DetalheExercicio'
import { Hoje } from './screens/Hoje'
import { Onboarding } from './screens/Onboarding'
import { DetalhePrograma, Programas } from './screens/Programas'
import { Progresso } from './screens/Progresso'
import { RunScreen } from './screens/RunScreen'

function ExecucaoPorId({ repo }: { repo: Repository }) {
  const { sessionId = '' } = useParams()
  const session =
    programs
      .flatMap((p) => p.sessions)
      .find((s) => s.id === sessionId) ??
    (sessionId === gateSession.id ? gateSession : undefined)
  if (!session) {
    return (
      <div className="app-shell gap-4 p-4">
        <p>Sessão não encontrada.</p>
        <Link to="/" className="underline">
          Voltar ao início
        </Link>
      </div>
    )
  }
  return <RunScreen key={session.id} session={session} repo={repo} />
}

function TreinoDoPortao({ repo }: { repo: Repository }) {
  void programById
  return <RunScreen session={gateSession} repo={repo} />
}

export default function App() {
  const repo = useMemo(() => new DexieRepository(), [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('calistenia-theme')
      // Padrão: escuro (só usa claro se o usuário escolheu).
      document.documentElement.dataset['theme'] =
        saved === 'light' ? 'light' : 'dark'
    } catch {
      /* sem storage */
    }
  }, [])

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Hoje repo={repo} />} />
        <Route path="/execucao" element={<TreinoDoPortao repo={repo} />} />
        <Route path="/execucao/:sessionId" element={<ExecucaoPorId repo={repo} />} />
        <Route path="/biblioteca" element={<Biblioteca />} />
        <Route path="/exercicio/:id" element={<DetalheExercicio />} />
        <Route path="/programas" element={<Programas />} />
        <Route path="/programas/:id" element={<DetalhePrograma repo={repo} />} />
        <Route path="/progresso" element={<Progresso repo={repo} />} />
        <Route path="/ajustes" element={<Ajustes repo={repo} />} />
        <Route path="/onboarding" element={<Onboarding repo={repo} />} />
      </Routes>
    </HashRouter>
  )
}
