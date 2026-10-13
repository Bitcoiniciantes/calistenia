import { useEffect, useRef, useState } from 'react'
import { pub } from '../media'

interface ExerciseMediaProps {
  /** 0, 1 ou 2 frames locais. 2 frames = par início/fim do movimento. */
  frames?: string[]
  /**
   * Os 2 frames mostram etapas coerentes do mesmo movimento?
   * Omitido = coerente. `false` exibe início e fim lado a lado, sem animação.
   */
  coherent?: boolean
  alt: string
  exerciseName: string
  /** Dicas curtas exibidas no placeholder quando não há imagem. */
  cues?: string[]
  /** Vídeo próprio (GIF/WebM/MP4 local). Prioritário sobre `frames`. */
  video?: { src: string; poster?: string }
  /** Pausa em cada posição (ponto de partida ~1,2 s). */
  rhythmMs?: number
}

/**
 * Demonstração visual do exercício (regra de decisão):
 * - vídeo próprio -> player (muted, loop, playsInline) com poster inicial;
 *   com prefers-reduced-motion, só o quadro estático + botão Play.
 * - 2 frames coerentes -> crossfade com play/pause.
 * - 2 frames incoerentes -> início e fim lado a lado, estáticos.
 * - 1 frame (hold) -> imagem estática.
 * - Sem frames, ou qualquer imagem com erro -> placeholder identificado
 *   (nome + instruções). Nunca área preta com ícone quebrado.
 * O botão Pausar/Reproduzir existe SOMENTE com animação de 2 frames.
 * Respeita `prefers-reduced-motion` (começa pausado) e exige `alt`.
 * SVGs sempre via <img>, nunca inline.
 */
export function ExerciseMedia({
  frames,
  coherent = true,
  alt,
  exerciseName,
  cues = [],
  video,
  rhythmMs = 1200,
}: ExerciseMediaProps) {
  const [index, setIndex] = useState(0)
  // Respeita prefers-reduced-motion desde a primeira renderização (sem efeito).
  const [reducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [playing, setPlaying] = useState(!reducedMotion)
  const [videoOn, setVideoOn] = useState(!reducedMotion)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  // Arquivo que falhou ao carregar. Derivado do src (não de efeito), então
  // trocar de exercício/frames limpa o erro automaticamente.
  const [failedSrc, setFailedSrc] = useState('')
  const [failedVideoSrc, setFailedVideoSrc] = useState('')
  const hasPair = frames !== undefined && frames.length === 2
  const single = frames !== undefined && frames.length === 1
  const failed = failedSrc !== '' && (frames?.includes(failedSrc) ?? false)
  const failedVideo =
    video !== undefined && failedVideoSrc !== '' && failedVideoSrc === video.src
  const animate = hasPair && coherent && !failed

  useEffect(() => {
    if (!animate || !playing) return
    const timer = window.setInterval(
      () => setIndex((i) => (i + 1) % 2),
      rhythmMs,
    )
    return () => window.clearInterval(timer)
  }, [animate, playing, rhythmMs])

  function toggleVideo() {
    const el = videoRef.current
    if (videoOn) {
      try {
        el?.pause()
      } catch {
        /* sem reprodução */
      }
      setVideoOn(false)
    } else {
      setVideoOn(true)
      try {
        const r = el?.play() as unknown as
          | { catch?: (fn: () => void) => void }
          | undefined
        r?.catch?.(() => undefined)
      } catch {
        /* sem reprodução */
      }
    }
  }

  // Vídeo próprio tem prioridade sobre os frames do Commons (reserva).
  if (video && !failedVideo) {
    return (
      <div className="exercise-video" data-testid="exercise-video">
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="metadata"
          autoPlay={!reducedMotion}
          data-testid="exercise-video-el"
          aria-label={alt}
          onError={() => setFailedVideoSrc(video.src)}
        />
        <button
          type="button"
          onClick={toggleVideo}
          aria-label={videoOn ? 'Pausar vídeo' : 'Reproduzir vídeo'}
          className="touch-target absolute bottom-2 right-2 rounded bg-black/60 px-3 text-sm text-white"
        >
          {videoOn ? 'Pausar' : 'Reproduzir'}
        </button>
      </div>
    )
  }

  if (failed || failedVideo || (!hasPair && !single)) {
    return (
      <div
        className="exercise-placeholder"
        data-testid="exercise-placeholder"
        role="img"
        aria-label={alt}
      >
        <img src={pub('/media/placeholder.svg')} alt={alt} />
        <p className="text-sm font-medium">{exerciseName}</p>
        {cues.length > 0 ? (
          <ul className="list-disc pl-5 text-left text-xs opacity-90">
            {cues.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs opacity-70">Demonstração pendente de licença</p>
        )}
      </div>
    )
  }

  if (single) {
    return (
      <div className="exercise-static" data-testid="exercise-static">
        <img
          src={pub((frames as string[])[0] ?? '')}
          alt={alt}
          onError={() => setFailedSrc((frames as string[])[0] ?? '')}
        />
      </div>
    )
  }

  if (!animate) {
    return (
      <div className="exercise-side-by-side" data-testid="exercise-side-by-side">
        {(frames as string[]).map((src, i) => (
          <img
            key={src}
            src={pub(src)}
            alt={i === 0 ? alt : `${alt} (posição final)`}
            onError={() => setFailedSrc(src)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="exercise-media" data-testid="exercise-media">
      {(frames as string[]).map((src, i) => (
        <img
          key={src}
          src={pub(src)}
          alt={i === 0 ? alt : ''}
          aria-hidden={i === 0 ? undefined : true}
          data-active={i === index}
          data-testid={i === index ? 'exercise-frame-active' : 'exercise-frame'}
          onError={() => setFailedSrc(src)}
        />
      ))}
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pausar animação' : 'Reproduzir animação'}
        className="touch-target absolute bottom-2 right-2 rounded bg-black/60 px-3 text-sm text-white"
      >
        {playing ? 'Pausar' : 'Reproduzir'}
      </button>
    </div>
  )
}
