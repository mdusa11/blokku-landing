import { motion } from 'framer-motion'
import {
  Play, Gamepad2, Gift, WifiOff, LayoutGrid, Zap, Puzzle, Sparkles, Flame, Trophy,
  Bomb, Palette, Undo2, Shuffle, Infinity as InfinityIcon, Timer, Leaf, Medal,
  PiggyBank, CalendarDays, Crown,
} from 'lucide-react'
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
              <Play size={20} strokeWidth={3} fill="currentColor" /> JUGAR GRATIS
            </motion.a>
            <a className="btn3d blue" href="#demo"><Gamepad2 size={21} strokeWidth={2.5} /> Probar la demo</a>
          </motion.div>
          <motion.div className="tagrow hero-tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }}>
            <span className="tag"><Gift size={15} /> GRATIS</span>
            <span className="tag"><WifiOff size={15} /> SIN INTERNET</span>
            <span className="tag"><LayoutGrid size={15} /> 3 MODOS</span>
            <span className="tag"><Zap size={15} /> 5 PODERES</span>
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
  const items = [
    [Puzzle, 'ARRASTRA'], [Sparkles, 'REVIENTA'], [Flame, 'COMBOS'],
    [Zap, 'PODERES'], [Trophy, 'RÉCORDS'], [Gift, 'RECOMPENSAS'],
  ]
  const track = [...items, ...items]
  const colors = ['var(--blue)', 'var(--pink)', 'var(--yellow)', 'var(--green)', 'var(--purple)', '#fff']
  return (
    <div className="marquee" style={{ padding: '22px 0', borderTop: '1px solid var(--stroke)', borderBottom: '1px solid var(--stroke)', background: 'rgba(0,0,0,.18)' }}>
      <div className="marquee-track">
        {track.map(([Icon, t], i) => (
          <span key={i} className="marquee-item" style={{ color: colors[i % 6] }}>
            <Icon size={24} strokeWidth={2.5} /> {t}
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
          <h2 className="display">PRUÉBALO <span className="shimmer" style={{ color: 'var(--pink)' }}>AQUÍ MISMO</span></h2>
          <p className="sub">Esta es una probadita del modo Clásico. El juego completo trae poderes, misiones, pase de temporada y mucho más.</p>
        </Reveal>
        <Reveal delay={0.15} style={{ marginTop: 54 }}>
          <DemoGame />
        </Reveal>
      </div>
    </section>
  )
}

/* ═══ PODERES — fichas de poder estilo in-game ════════════════════════════════ */
const POWERS = [
  { I: Bomb, n: 'BOMBA', d: 'Explota una celda y todas sus vecinas', c: '#FF6600', qty: 3 },
  { I: Zap, n: 'RAYO', d: 'Borra una fila completa al instante', c: '#FFC400', qty: 3 },
  { I: Palette, n: 'DESTRUCTOR', d: 'Elimina todas las gemas de un color', c: '#FF2E88', qty: 2 },
  { I: Undo2, n: 'RETROCESO', d: 'Deshaz tu última jugada', c: '#12E0C4', qty: 3 },
  { I: Shuffle, n: 'MEZCLA', d: 'Cambia tus piezas por otras nuevas', c: '#9A5CFF', qty: 5 },
]

export function Powers() {
  return (
    <section id="poderes" className="sec-powers">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Cuando el tablero se pone feo</span>
          <h2 className="display">5 PODERES <span className="shimmer" style={{ color: 'var(--yellow)' }}>ÉPICOS</span></h2>
          <p className="sub">Guárdalos para el momento justo y dale la vuelta a la partida.</p>
        </Reveal>
        <div className="powers-grid">
          {POWERS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.07}>
              <motion.div
                className="power-card"
                style={{ '--c': p.c }}
                whileHover={{ y: -12, rotate: i % 2 ? 2 : -2 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              >
                <p.I className="power-ghost" size={130} strokeWidth={1.6} aria-hidden />
                <motion.div className="power-token" whileHover={{ rotate: [0, -8, 8, 0], scale: 1.08 }} transition={{ duration: 0.5 }}>
                  <p.I size={38} strokeWidth={2.4} />
                  <span className="power-badge">×{p.qty}</span>
                </motion.div>
                <div className="power-name">{p.n}</div>
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
  { n: 'CLÁSICO', d: 'Sin fin · cada línea cuenta para tu récord', I: InfinityIcon, bg: 'linear-gradient(160deg, #6fc4ff, #2b6ce0)' },
  { n: 'CONTRA RELOJ', d: '90 segundos · máxima puntuación · pura adrenalina', I: Timer, bg: 'linear-gradient(160deg, #ff7ba6, #e0335f)' },
  { n: 'ZEN', d: 'Sin game over · solo tú y las piezas · relájate', I: Leaf, bg: 'linear-gradient(160deg, #ffd76f, #e09a2b)' },
]

export function Modes() {
  return (
    <section id="modos">
      <FallingGems count={7} opacity={0.07} />
      <div className="wrap">
        <Reveal>
          <span className="kicker">Para cada mood</span>
          <h2 className="display">3 MODOS <span className="shimmer" style={{ color: 'var(--green)' }}>DE JUEGO</span></h2>
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
                  <m.I size={52} strokeWidth={2.4} />
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

/* ═══ PROGRESIÓN — tarjetas de recompensa con color propio ═════════════════════ */
const PROGS = [
  { I: Medal, n: 'PASE DE TEMPORADA', d: '30 niveles de recompensas gratis y premium cada temporada', c: '#FFC93C', chip: 'GRATIS + PREMIUM' },
  { I: PiggyBank, n: 'ALCANCÍA', d: 'Acumula monedas mientras juegas y rómpela cuando esté llena', c: '#FF5D8F', chip: 'HASTA 2000' },
  { I: CalendarDays, n: 'MISIONES DIARIAS', d: 'Retos nuevos cada día con cofres y monedas', c: '#4EA1FF', chip: 'CADA DÍA' },
  { I: Crown, n: 'VIP', d: 'Sin anuncios, monedas diarias y marco exclusivo', c: '#B388FF', chip: 'EXCLUSIVO', vip: true },
]

export function Progression() {
  return (
    <section id="progresion" className="sec-prog">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Siempre hay algo que ganar</span>
          <h2 className="display">PROGRESA <span className="shimmer" style={{ color: 'var(--purple)' }}>TODOS LOS DÍAS</span></h2>
        </Reveal>
        <div className="prog-grid">
          {PROGS.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.09}>
              <motion.div
                className={`prog-card${p.vip ? ' prog-vip' : ''}`}
                style={{ '--c': p.c }}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              >
                <motion.span className="prog-badge" whileHover={{ scale: 1.12, rotate: -8 }}>
                  <p.I size={34} strokeWidth={2.2} />
                </motion.span>
                <div className="prog-name">{p.n}</div>
                <div className="prog-desc">{p.d}</div>
                <span className="prog-chip">{p.chip}</span>
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
          <h2 className="display">ASÍ SE <span className="shimmer" style={{ color: 'var(--blue)' }}>VE</span></h2>
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
