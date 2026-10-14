import { Link } from 'react-router-dom'

/**
 * Cabeçalho das telas principais: nome do app + engrenagem de Ajustes.
 * Fora do treino (/execucao) e do onboarding, como a tab bar.
 */
export function AppHeader() {
  return (
    <header className="app-header">
      <span className="app-header-title">Calistenia</span>
      <Link to="/ajustes" aria-label="Ajustes" className="icon-btn">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2.8v3M12 18.2v3M2.8 12h3M18.2 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1" />
        </svg>
      </Link>
    </header>
  )
}
