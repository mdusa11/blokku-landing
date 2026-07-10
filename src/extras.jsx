import { Fragment } from 'react'
import { motion } from 'framer-motion'
import { Hand, Grid3x3, ArrowRight } from 'lucide-react'
import { Reveal } from './bits.jsx'

/* Badge "Disponible en Google Play" — lookalike propio (sin asset de marca). */
export function PlayBadge({ href = '#descargar' }) {
  return (
    <a className="playbadge" href={href} aria-label="Disponible en Google Play">
      <span className="pb-tri" aria-hidden />
      <span className="pb-txt">
        <span className="pb-small">DISPONIBLE EN</span>
        <span className="pb-big">Google Play</span>
      </span>
    </a>
  )
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
