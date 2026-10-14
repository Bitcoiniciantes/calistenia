import { NavLink } from 'react-router-dom'
import { APP_VERSION } from '../version'

const links = [
  { to: '/', label: 'Início', end: true },
  { to: '/biblioteca', label: 'Biblioteca', end: false },
  { to: '/programas', label: 'Programas', end: false },
  { to: '/alongamentos', label: 'Alongar', end: false },
  { to: '/progresso', label: 'Progresso', end: false },
  { to: '/ajustes', label: 'Ajustes', end: false },
]

/**
 * Barra inferior fixa: atalho de Início sempre visível nas telas
 * principais — volta com 1 toque de qualquer link. Fora do treino
 * (/execucao) e do onboarding para não interromper a sessão.
 */
export function BottomNav() {
  return (
    <footer className="sticky bottom-0 z-10 mx-auto w-full max-w-[480px]">
      <nav
        aria-label="Principal"
        className="grid w-full grid-cols-6 border-t"
        style={{ background: 'var(--app-bg)' }}
      >
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `touch-target flex items-center justify-center px-1 py-2 text-center text-xs underline ${
                isActive ? 'font-bold' : 'opacity-80'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
      <p
        data-testid="app-version"
        className="pb-1 text-center text-[10px] opacity-50"
        style={{ background: 'var(--app-bg)' }}
      >
        {APP_VERSION}
      </p>
    </footer>
  )
}
