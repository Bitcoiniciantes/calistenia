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
const CARD = 'produção própria do usuário (cartões 700x700 numerados, pasta 20posicoes); uso declarado pelo usuário em 13/10/2026'
const CARD_LICENSE = 'Produção própria do usuário (uso declarado)'
const CARD_ATTR = 'Cartão produzido pelo usuário (declarado em 13/10/2026)'

function card(exerciseId: string, file: string): MediaCredit {
  return { exerciseId, file, pageUrl: '', author: CARD, license: CARD_LICENSE, licenseUrl: '', attribution: CARD_ATTR }
}

function ai(exerciseId: string, file: string): MediaCredit {
  return { exerciseId, file, pageUrl: '', author: AI, license: AI_LICENSE, licenseUrl: '', attribution: AI_ATTR }
}

export const mediaCredits: MediaCredit[] = [
  card('pushup', 'foto-flexao.png'),
  card('incline-pushup', 'foto-flexao-inclinada.png'),
  card('knee-pushup', 'foto-flexao-joelhos.png'),
  card('diamond-pushup', 'foto-flexao-diamante.png'),
  card('pike-pushup', 'foto-pike.png'),
  card('bodyweight-squat', 'foto-agachamento.png'),
  card('reverse-lunge', 'foto-avanco-reverso.png'),
  card('glute-bridge', 'foto-ponte.png'),
  card('bulgarian-split', 'foto-bulgaro.png'),
  card('calf-raises', 'foto-panturrilha.png'),
  card('plank', 'foto-prancha.png'),
  card('side-plank', 'foto-prancha-lateral.png'),
  card('handstand-wall', 'foto-handstand.png'),
  ai('archer-pushup', 'barra-arqueiro.png'),
  ai('pseudo-planche', 'barra-pseudo.png'),
  ai('inverted-row', 'barra-remada.png'),
  ai('inverted-row-elevated', 'barra-remada-elev.png'),
  ai('dead-hang', 'barra-deadhang.png'),
  ai('negative-pullup', 'barra-negativa.png'),
  ai('pullup', 'barra-fixa.png'),
  ai('chinup', 'barra-supinada.png'),
  ai('wide-pullup', 'barra-aberta.png'),
  ai('arm-circles', 'mob-bracos.png'),
  ai('cat-cow', 'mob-gato.png'),
  ai('trunk-rotation', 'mob-tronco.png'),
  ai('deep-squat-hold', 'mob-agacha.png'),
  ai('wall-pushup', 'nova-parede.png'),
  ai('pushup-wide', 'nova-ampla.png'),
  ai('muscleup-prog', 'nova-muscleup.png'),
  {
    exerciseId: 'mountain-climbers',
    file: 'escalador-700.png',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'hollow-hold',
    file: 'hollow-700.png',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'knee-raises',
    file: 'joelhos-barra-700.png',
    pageUrl: '',
    author: AI,
    license: AI_LICENSE,
    licenseUrl: '',
    attribution: AI_ATTR,
  },
  {
    exerciseId: 'l-sit',
    file: 'lsit-700.png',
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
