import { motion } from 'framer-motion'
import { AppIcon, FallingGems, Logo, Reveal } from './bits.jsx'
import DemoGame from './DemoGame.jsx'

/* ═══ HERO ════════════════════════════════════════════════════════════════════ */
export function Hero() {
  return (
    <div className="hero" id="inicio">
      <FallingGems count={18} opacity={0.18} />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 12 }} style={{ marginBottom: 26 }}>
            <AppIcon size={92} />
          </motion.div>
          <h1><Logo size={'clamp(64px, 9vw, 110px)'} /></h1>
          <motion.p className="display hero-tagline" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}>
            EL PUZZLE MÁS ADICTIVO
          </motion.p>
          <motion.p className="hero-desc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
            Arrastra piezas, encaja y <strong>revienta líneas</strong> en combos explosivos.
            Fácil de aprender, imposible de soltar.
          </motion.p>
          <motion.div className="hero-ctas" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, type: 'spring' }}>
            <motion.a className="btn3d" href="#descargar" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>
              ▶ JUGAR GRATIS
            </motion.a>
            <a className="btn3d blue" href="#demo">🎮 Probar la demo</a>
          </motion.div>
          <motion.div className="tagrow hero-tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }}>
            <span className="tag">🆓 GRATIS</span>
            <span className="tag">📶 SIN INTERNET</span>
            <span className="tag">🎮 3 MODOS</span>
            <span className="tag">⚡ 5 PODERES</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 90, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 130, damping: 15 }}
        >
          <motion.div className="phone" animate={{ y: [0, -14, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
            <video src="/media/gameplay.mp4" autoPlay muted loop playsInline />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

/* ═══ MARQUEE ═════════════════════════════════════════════════════════════════ */
export function MarqueeStrip() {
  const items = ['🧩 ARRASTRA', '💥 REVIENTA', '🔥 COMBOS', '⚡ PODERES', '🏆 RÉCORDS', '🎁 RECOMPENSAS']
  const track = [...items, ...items]
  return (
    <div className="marquee" style={{ padding: '22px 0', borderTop: '1px solid var(--stroke)', borderBottom: '1px solid var(--stroke)', background: 'rgba(0,0,0,.18)' }}>
      <div className="marquee-track">
        {track.map((t, i) => (
          <span key={i} className="marquee-item" style={{ color: ['var(--blue)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--purple)', '#fff'][i % 6] }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ═══ DEMO ════════════════════════════════════════════════════════════════════ */
export function DemoSection() {
  return (
    <section id="demo">
      <FallingGems count={8} opacity={0.08} />
      <div className="wrap">
        <Reveal>
          <span className="kicker">Sin descargar nada</span>
          <h2 className="display">PRUÉBALO <span style={{ color: 'var(--pink)' }}>AQUÍ MISMO</span></h2>
          <p className="sub">Esta es una probadita del modo Clásico. El juego completo trae poderes, misiones, pase de temporada y mucho más.</p>
        </Reveal>
        <Reveal delay={0.15} style={{ marginTop: 54 }}>
          <DemoGame />
        </Reveal>
      </div>
    </section>
  )
}

/* ═══ PODERES ═════════════════════════════════════════════════════════════════ */
const POWERS = [
  { e: '💣', n: 'BOMBA', d: 'Explota una celda y todas sus vecinas', c: '#FF6600' },
  { e: '⚡', n: 'RAYO', d: 'Borra una fila completa al instante', c: '#FFDD00' },
  { e: '🎨', n: 'DESTRUCTOR', d: 'Elimina todas las gemas de un color', c: '#FF0088' },
  { e: '↩️', n: 'RETROCESO', d: 'Deshaz tu última jugada', c: '#00FFCC' },
  { e: '🔀', n: 'MEZCLA', d: 'Cambia tus piezas por otras nuevas', c: '#8800FF' },
]

export function Powers() {
  return (
    <section id="poderes" style={{ background: 'rgba(0,0,0,.15)' }}>
      <div className="wrap">
        <Reveal>
          <span className="kicker">Cuando el tablero se pone feo</span>
          <h2 className="display">5 PODERES <span style={{ color: 'var(--yellow)' }}>ÉPICOS</span></h2>
        </Reveal>
        <div className="powers-grid">
          {POWERS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.08}>
              <motion.div
                className="card power-card"
                whileHover={{ scale: 1.09, rotate: i % 2 ? 2.5 : -2.5, borderColor: p.c, boxShadow: `0 0 44px ${p.c}66, 0 22px 44px rgba(0,0,0,.45)` }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              >
                <motion.span className="power-emoji" whileHover={{ scale: 1.35, rotate: 12 }}>{p.e}</motion.span>
                <div className="power-name" style={{ color: p.c }}>{p.n}</div>
                <div className="power-desc">{p.d}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══ MODOS ═══════════════════════════════════════════════════════════════════ */
const MODES = [
  { n: 'CLÁSICO', d: 'Sin fin · cada línea cuenta para tu récord', i: '♾️', bg: 'linear-gradient(160deg, #6fc4ff, #2b6ce0)' },
  { n: 'CONTRA RELOJ', d: '90 segundos · máxima puntuación · pura adrenalina', i: '⏱️', bg: 'linear-gradient(160deg, #ff7ba6, #e0335f)' },
  { n: 'ZEN', d: 'Sin game over · solo tú y las piezas · relájate', i: '🧘', bg: 'linear-gradient(160deg, #ffd76f, #e09a2b)' },
]

export function Modes() {
  return (
    <section id="modos">
      <FallingGems count={7} opacity={0.07} />
      <div className="wrap">
        <Reveal>
          <span className="kicker">Para cada mood</span>
          <h2 className="display">3 MODOS <span style={{ color: 'var(--green)' }}>DE JUEGO</span></h2>
        </Reveal>
        <div className="modes-grid">
          {MODES.map((m, i) => (
            <Reveal key={m.n} delay={i * 0.12}>
              <motion.div
                className="mode-card"
                style={{ background: m.bg }}
                whileHover={{ y: -14, scale: 1.04, rotate: i === 1 ? 0 : i ? 1.5 : -1.5 }}
                transition={{ type: 'spring', stiffness: 280, damping: 15 }}
              >
                <motion.span className="mode-icon" animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}>
                  {m.i}
                </motion.span>
                <div className="mode-name">{m.n}</div>
                <div className="mode-desc">{m.d}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══ PROGRESIÓN ══════════════════════════════════════════════════════════════ */
const PROGS = [
  { e: '🏅', n: 'PASE DE TEMPORADA', d: '30 niveles de recompensas gratis y premium cada temporada' },
  { e: '🐷', n: 'ALCANCÍA', d: 'Acumula monedas mientras juegas y rómpela cuando esté llena' },
  { e: '📆', n: 'MISIONES DIARIAS', d: 'Retos nuevos cada día con cofres y monedas' },
  { e: '👑', n: 'VIP', d: 'Sin anuncios, monedas diarias y marco exclusivo' },
]

export function Progression() {
  return (
    <section id="progresion" style={{ background: 'rgba(0,0,0,.15)' }}>
      <div className="wrap">
        <Reveal>
          <span className="kicker">Siempre hay algo que ganar</span>
          <h2 className="display">PROGRESA <span style={{ color: 'var(--purple)' }}>TODOS LOS DÍAS</span></h2>
        </Reveal>
        <div className="prog-grid">
          {PROGS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.09}>
              <motion.div className="card" whileHover={{ y: -10, scale: 1.03 }} style={{ textAlign: 'center' }}>
                <motion.span className="prog-emoji" style={{ display: 'inline-block' }} whileHover={{ scale: 1.4, rotate: -10 }}>{p.e}</motion.span>
                <div className="prog-name" style={{ color: 'var(--yellow)' }}>{p.n}</div>
                <div className="prog-desc">{p.d}</div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══ SCREENSHOTS ═════════════════════════════════════════════════════════════ */
export function Shots() {
  const shots = [1, 2, 3, 4, 5, 6, 7, 8]
  const track = [...shots, ...shots]
  return (
    <section id="capturas" style={{ paddingBottom: 40 }}>
      <div className="wrap">
        <Reveal>
          <span className="kicker">Directo del juego</span>
          <h2 className="display">ASÍ SE <span style={{ color: 'var(--blue)' }}>VE</span></h2>
        </Reveal>
      </div>
      <Reveal delay={0.1} style={{ marginTop: 50 }}>
        <div className="marquee">
          <div className="marquee-track shots-track" style={{ animationDuration: '38s' }}>
            {track.map((n, i) => (
              <motion.img key={i} src={`/media/shot_${n}.jpg`} alt={`Captura ${n} de Blokku`} loading="lazy" whileHover={{ scale: 1.07, rotate: i % 2 ? 2 : -2 }} />
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
