import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Hand, Grid3x3, ArrowRight } from 'lucide-react'
import { Reveal } from './bits.jsx'

// Publicada en producción el 2-oct-2026. En Android abre directo la app de Play.
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.dusasolutions.blokku'

export const APP_STORE_URL = 'https://apps.apple.com/mx/app/id6822583798'

export const isIOS = typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
export const STORE_URL = isIOS ? APP_STORE_URL : PLAY_URL

/* Badge de Google Play — lookalike propio (sin asset de marca). */
export function PlayBadge({ href = PLAY_URL }) {
  return (
    <a className="playbadge" href={href} target="_blank" rel="noopener noreferrer" aria-label="Disponible en Google Play">
      <span className="pb-tri" aria-hidden />
      <span className="pb-txt">
        <span className="pb-small">DISPONIBLE EN</span>
        <span className="pb-big">Google Play</span>
      </span>
    </a>
  )
}

/* Badge de App Store — lookalike propio (sin asset de marca). */
export function AppStoreBadge({ href = APP_STORE_URL }) {
  return (
    <a className="playbadge" href={href} target="_blank" rel="noopener noreferrer" aria-label="Descárgalo en el App Store">
      <svg className="pb-apple" viewBox="0 0 384 512" width="24" height="28" aria-hidden fill="#fff">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
      </svg>
      <span className="pb-txt">
        <span className="pb-small">Descárgalo en el</span>
        <span className="pb-big">App Store</span>
      </span>
    </a>
  )
}

/* Insignias en el orden de la plataforma: la de tu tienda primero. */
export function StoreBadges() {
  return isIOS ? <><AppStoreBadge /><PlayBadge /></> : <><PlayBadge /><AppStoreBadge /></>
}

/* ═══ CÓMO JUGAR — 3 pasos ════════════════════════════════════════════════════ */
const MiniBoard = () => {
  // Fila inferior (índices 12-15) se "llena" y revienta en loop.
  const on = new Set([12, 13, 14, 15])
  return (
    <div className="how-miniboard" aria-hidden>
      {Array.from({ length: 16 }, (_, i) => <i key={i} className={on.has(i) ? 'on' : ''} />)}
    </div>
  )
}

const STEPS = [
  { I: Hand, n: 'ARRASTRA', d: 'Toma una pieza de la bandeja con el dedo.', c: '#4EA1FF' },
  { I: Grid3x3, n: 'ENCAJA', d: 'Colócala donde quepa en el tablero 8×8.', c: '#FF5D8F' },
  { I: null, n: 'REVIENTA', d: 'Completa una fila o columna y ¡boom!', c: '#43D9A3' },
]

export function HowToPlay() {
  return (
    <section id="como-jugar" className="sec-how">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Se aprende en 10 segundos</span>
          <h2 className="display">CÓMO <span className="shimmer" style={{ color: 'var(--green)' }}>JUGAR</span></h2>
          <p className="sub">Tres pasos y ya estás enganchado. En serio.</p>
        </Reveal>
        <div className="how-grid">
          {STEPS.map((s, i) => (
            <Fragment key={s.n}>
              <Reveal delay={i * 0.12}>
                <motion.div className="how-step" style={{ '--c': s.c }} whileHover={{ y: -8 }}>
                  <span className="how-num">{i + 1}</span>
                  {s.I ? (
                    <motion.div className="how-icon" whileHover={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }}>
                      <s.I size={40} strokeWidth={2.3} />
                    </motion.div>
                  ) : (
                    <MiniBoard />
                  )}
                  <div className="how-title">{s.n}</div>
                  <div className="how-desc">{s.d}</div>
                </motion.div>
              </Reveal>
              {i < STEPS.length - 1 && (
                <div className="how-arrow" aria-hidden>
                  <ArrowRight size={30} strokeWidth={2.5} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}
