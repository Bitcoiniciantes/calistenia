import { NavLink } from 'react-router-dom'

function TabIcon({ name }: { name: string }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  } as const
  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 11.5 12 3l9 8.5" />
          <path d="M5.5 10.5V21h5v-6h3v6h5v-10.5" />
        </svg>
      )
    case 'grid':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'calendar':
      return (
        <svg {...common}>
          <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
          <path d="M3.5 9.7h17M8 3v3.6M16 3v3.6" />
        </svg>
      )
    case 'person':
      return (
        <svg {...common}>
          <circle cx="12" cy="4.8" r="2" />
          <path d="M12 7.5v5.5M12 9.5 6.5 7.5M12 9.5l5.5-2M12 13l-4 7.5M12 13l4 7.5" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common}>
          <path d="M3.5 20.5h17" />
          <path d="M6.5 20.5v-6M12 20.5V5.5M17.5 20.5v-10" />
        </svg>
      )
    default:
      return null
  }
}

const tabs = [
  { to: '/', label: 'Início', end: true, icon: 'home' },
  { to: '/biblioteca', label: 'Biblioteca', end: false, icon: 'grid' },
  { to: '/programas', label: 'Programas', end: false, icon: 'calendar' },
  { to: '/alongamentos', label: 'Alongar', end: false, icon: 'person' },
  { to: '/progresso', label: 'Progresso', end: false, icon: 'chart' },
]

/**
 * Tab bar inferior fixa: ícone + rótulo, aba ativa em pílula verde.
 * Fora do treino (/execucao) e do onboarding para não interromper a
 * sessão (a tela de execução tem o próprio ‹ Sair). Ajustes saiu daqui
 * para a engrenagem do cabeçalho.
 */
export function BottomNav() {
  return (
    <>
      <nav aria-label="Principal" className="tabbar">
        {tabs.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `tab${isActive ? ' tab-active' : ''}`}
          >
            <span className="tab-pill">
              <TabIcon name={l.icon} />
              <span>{l.label}</span>
            </span>
          </NavLink>
        ))}
      </nav>
      <div aria-hidden="true" className="tabbar-spacer" />
    </>
  )
}
