/**
 * Alongamentos: sequências de Yoga e Vôlei com ilustrações do usuário.
 * Cada grupo é uma apresentação: 60 s por imagem com troca automática
 * (pausável), além de navegação manual. Imagens em /public/media
 * (yoga-*.png, voley-*.png), via sync-media:local com SHA-256.
 */
export interface Alongamento {
  id: string
  namePt: string
  file: string
}

export interface AlongamentoGroup {
  id: 'yoga' | 'voley'
  namePt: string
  items: Alongamento[]
}

/** Duração de cada imagem na apresentação (ms). */
export const SLIDE_MS = 60_000

const yogaNames = [
  'Gato camelo',
  'Postura da criança',
  'Postura da cobra',
  'Torção de coluna sentado',
  'Inclinação lateral',
  'Cachorro olhando para baixo',
  'Flexão para a frente',
  'Afundo baixo',
  'Borboleta',
  'Alongamento em quatro',
  'Isquiotibial supino',
  'Quadríceps em pé',
  'Sentado com pernas afastadas',
  'Lateral do pescoço',
  'Braços cruzados à frente',
  'Tríceps',
  'Abertura de peitoral',
  'Punho e antebraço',
]

const voleyNames = [
  'Círculos com os braços',
  'Braços cruzados à frente',
  'Manguito',
  'Tríceps',
  'Abertura de peito',
  'Rotação torácica',
  'Afundo com extensão',
  'Quadríceps',
  'Posterior da coxa',
  'Adutores',
  'Borboleta',
  'Figura quatro',
  'Panturrilha',
  'Mobilidade de tornozelo',
  'Agachamento profundo',
  'Balanço frontal',
  'Balanço lateral',
  'Elevação de joelhos',
  'Elevação de calcanhares',
  'Deslocamento lateral baixo',
]

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export const alongamentoGroups: AlongamentoGroup[] = [
  {
    id: 'yoga',
    namePt: 'Yoga',
    items: yogaNames.map((namePt, i) => ({
      id: `yoga-${pad(i + 1)}`,
      namePt,
      file: `/media/yoga-${pad(i + 1)}.png`,
    })),
  },
  {
    id: 'voley',
    namePt: 'Vôlei',
    items: voleyNames.map((namePt, i) => ({
      id: `voley-${pad(i + 1)}`,
      namePt,
      file: `/media/voley-${pad(i + 1)}.png`,
    })),
  },
]
