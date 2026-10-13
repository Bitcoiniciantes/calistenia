/**
 * Créditos de mídia visíveis no app (Ajustes -> Créditos de mídia).
 * Um item por arquivo USADO, com autor, licença e origem.
 * Textos de atribuição exatos; mesma informação registrada em CREDITS.md.
 */
export interface MediaCredit {
  exerciseId: string
  file: string
  pageUrl: string
  author: string
  license: string
  /** Vazio quando não há página de licença (autoria própria). */
  licenseUrl: string
  attribution: string
}

const OWN = 'usuário (autoria própria, declarada em 13/10/2026)'
const OWN_LICENSE = 'Autoria própria do usuário'
const OWN_ATTR = 'Autoria própria do usuário (declarada em 13/10/2026)'
const AI = 'gerada por IA (Gemini) a partir de prompt do usuário; uso declarado pelo usuário em 13/10/2026'
const AI_LICENSE = 'Geração por IA a pedido do usuário (uso declarado)'
const AI_ATTR = 'Imagem gerada por IA (Gemini) a pedido do usuário (declarada em 13/10/2026)'

export const mediaCredits: MediaCredit[] = [
  {
    exerciseId: 'pushup',
    file: 'flexao-topo.jpg',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'pushup',
    file: 'flexao-fundo.jpg',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'bodyweight-squat',
    file: 'agachamento-pe.jpg',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'bodyweight-squat',
    file: 'agachamento-fundo.jpg',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'plank',
    file: 'prancha.jpg',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'mountain-climbers',
    file: 'escalador.jpg',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'pike-pushup',
    file: 'flexao-pike.jpg',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'capa-hoje',
    file: 'capahome.jpg',
    pageUrl: '',
    author: OWN,
    license: OWN_LICENSE,
    licenseUrl: '',
    attribution: OWN_ATTR,
  },
]

export function creditsForExercise(exerciseId: string): MediaCredit[] {
  return mediaCredits.filter((c) => c.exerciseId === exerciseId)
}
