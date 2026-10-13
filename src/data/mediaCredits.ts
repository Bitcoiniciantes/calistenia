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

export const mediaCredits: MediaCredit[] = [
  {
    exerciseId: 'pushup',
    file: 'pushup-1.jpg',
    pageUrl: '',
    author: OWN,
    license: OWN_LICENSE,
    licenseUrl: '',
    attribution: OWN_ATTR,
  },
  {
    exerciseId: 'pushup',
    file: 'pushup-2.jpg',
    pageUrl: '',
    author: OWN,
    license: OWN_LICENSE,
    licenseUrl: '',
    attribution: OWN_ATTR,
  },
  {
    exerciseId: 'bodyweight-squat',
    file: 'squat-1.jpg',
    pageUrl: '',
    author: OWN,
    license: OWN_LICENSE,
    licenseUrl: '',
    attribution: OWN_ATTR,
  },
  {
    exerciseId: 'bodyweight-squat',
    file: 'squat-2.jpg',
    pageUrl: '',
    author: OWN,
    license: OWN_LICENSE,
    licenseUrl: '',
    attribution: OWN_ATTR,
  },
  {
    exerciseId: 'mountain-climbers',
    file: 'climbers.jpg',
    pageUrl: '',
    author: OWN,
    license: OWN_LICENSE,
    licenseUrl: '',
    attribution: OWN_ATTR,
  },
  {
    exerciseId: 'pike-pushup',
    file: 'pike.jpg',
    pageUrl: '',
    author: OWN,
    license: OWN_LICENSE,
    licenseUrl: '',
    attribution: OWN_ATTR,
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
