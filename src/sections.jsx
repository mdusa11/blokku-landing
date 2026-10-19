import { motion } from 'framer-motion'
import {
  Play, Gamepad2, Gift, WifiOff, LayoutGrid, Zap, Puzzle, Sparkles, Flame, Trophy,
  Bomb, Pipette, Undo2, Shuffle, Infinity as InfinityIcon, Timer, Leaf, Medal,
  CalendarDays, TrendingUp, Ban, Rocket,
} from 'lucide-react'
import { AppIcon, FallingGems, Logo, Reveal } from './bits.jsx'
import DemoGame from './DemoGame.jsx'
import { STORE_URL, StoreBadges } from './extras.jsx'

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
            <a className="btn3d pulse-cta" href={STORE_URL} target="_blank" rel="noopener noreferrer">
              <Play size={20} strokeWidth={3} fill="currentColor" /> JUGAR GRATIS
            </a>
            <a className="btn3d blue" href="#demo"><Gamepad2 size={21} strokeWidth={2.5} /> Probar la demo</a>
          </motion.div>
          <motion.div className="hero-ctas" style={{ marginTop: 18 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
            <StoreBadges />
          </motion.div>
          {/* Aviso de lanzamiento: va en el hero porque es lo primero que se
              ve sin hacer scroll. Repetido en la FAQ y en el CTA final. */}
          <motion.p
            className="hero-soon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.25 }}
          >
            <Rocket size={15} /> ¡Ya disponible en Google Play y App Store!
          </motion.p>
          <motion.div className="tagrow hero-tags" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.35 }}>
            <span className="tag"><Gift size={15} /> GRATIS</span>
            <span className="tag"><WifiOff size={15} /> SIN INTERNET</span>
            <span className="tag"><LayoutGrid size={15} /> 4 MODOS</span>
            <span className="tag"><Zap size={15} /> 5 PODERES</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 90, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 130, damping: 15 }}
        >
          <div className="phone float-y">
            <video src={`${import.meta.env.BASE_URL}media/105/juego.mp4`} poster={`${import.meta.env.BASE_URL}media/105/juego.webp`} width="540" height="1044" autoPlay muted loop playsInline preload="metadata" data-autopause aria-label="Partida real de Blokku 1.0.5" />
          </div>
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
          <p className="sub">Esta es una probadita del modo Clásico. El juego completo trae 4 modos, 5 poderes, reto diario y logros — todo gratis.</p>
        </Reveal>
        <Reveal delay={0.15} style={{ marginTop: 54 }}>
          <DemoGame />
        </Reveal>
      </div>
    </section>
  )
}

/* ═══ PODERES — fichas de poder estilo in-game ════════════════════════════════ */
// Mismo orden y color que la barra de poderes de la 1.0.5
const POWERS = [
  { I: Bomb, n: 'BOMBA', d: 'Despeja una zona del tablero', c: '#FF6A00' },
  { I: Zap, n: 'RAYO', d: 'Limpia una línea completa', c: '#FFC400' },
  { I: Undo2, n: 'DESHACER', d: 'Regresa tu última jugada', c: '#12E0C4' },
  { I: Shuffle, n: 'MEZCLAR', d: 'Cambia las piezas de la bandeja', c: '#9A5CFF' },
  { I: Pipette, n: 'DESTRUCTOR', d: 'Elimina todos los bloques de un color', c: '#FF2E88' },
]

export function Powers() {
  return (
    <section id="poderes" className="sec-powers">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Cuando el tablero se pone feo</span>
          <h2 className="display">5 PODERES <span className="shimmer" style={{ color: 'var(--yellow)' }}>ÉPICOS</span></h2>
          <p className="sub">Cada partida empieza con poderes gratis. Si te quedas sin espacio, Blokku te dice cuál te puede salvar.</p>
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
  { n: 'CLÁSICO', d: 'Sin fin · cada línea cuenta para tu récord', I: InfinityIcon, chip: 'SIN FIN', bg: 'linear-gradient(160deg, #6fc4ff, #2b6ce0)' },
  { n: 'CONTRA RELOJ', d: '90 segundos · máxima puntuación · pura adrenalina', I: Timer, chip: '90 SEGUNDOS', bg: 'linear-gradient(160deg, #ff7ba6, #e0335f)' },
  { n: 'ZEN', d: 'Sin game over · solo tú y las piezas · relájate', I: Leaf, chip: 'CERO ESTRÉS', bg: 'linear-gradient(160deg, #ffd76f, #e09a2b)' },
  { n: 'DESAFÍO DIARIO', d: 'Un puzzle nuevo cada día · con su racha', I: CalendarDays, chip: 'CADA DÍA', bg: 'linear-gradient(160deg, #b388ff, #6a3fd6)' },
]

export function Modes() {
  return (
    <section id="modos">
      <FallingGems count={7} opacity={0.07} />
      <div className="wrap">
        <Reveal>
          <span className="kicker">Para cada mood</span>
          <h2 className="display">4 MODOS <span className="shimmer" style={{ color: 'var(--green)' }}>DE JUEGO</span></h2>
        </Reveal>
        <div className="modes-grid">
          {MODES.map((m, i) => (
            <Reveal key={m.n} delay={i * 0.12}>
              <motion.div
                className="mode-card"
                style={{ background: m.bg }}
                whileHover={{ y: -14, scale: 1.04, rotate: i % 2 ? 1.5 : -1.5 }}
                transition={{ type: 'spring', stiffness: 280, damping: 15 }}
              >
                <m.I className="mode-ghost" size={150} strokeWidth={1.4} aria-hidden />
                <span className="mode-icon float-y" style={{ animationDelay: `${i * 0.4}s` }}>
                  <m.I size={52} strokeWidth={2.4} />
                </span>
                <div className="mode-name">{m.n}</div>
                <div className="mode-desc">{m.d}</div>
                <span className="mode-chip">{m.chip}</span>
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
  { I: Medal, n: 'LOGROS', d: 'Logros por escalones: cada meta tiene varios niveles por conquistar', c: '#FFC93C', chip: 'COLECCIÓNALOS' },
  { I: TrendingUp, n: 'NIVELES', d: 'Sube hasta el nivel 100 con una ruta de premios y cofres', c: '#FF5D8F', chip: 'HASTA EL 100' },
  { I: CalendarDays, n: 'RETO DIARIO', d: 'Un puzzle nuevo cada día, con su racha', c: '#4EA1FF', chip: 'CADA DÍA' },
  { I: Ban, n: 'SIN ANUNCIOS', d: 'Un pago único opcional y cero anuncios para siempre (Android)', c: '#B388FF', chip: 'OPCIONAL', vip: true },
]

export function Progression() {
  return (
    <section id="progresion" className="sec-prog">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Siempre hay algo que ganar</span>
          <h2 className="display">PROGRESA <span className="shimmer" style={{ color: 'var(--purple)' }}>A TU RITMO</span></h2>
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

/* ═══ NOVEDADES 1.0.5 — vive en novedades.jsx ═══════════════════════════════════ */
export { Novedades } from './novedades.jsx'

/* ═══ SCREENSHOTS — escaparate de 2 filas opuestas ════════════════════════════ */
// Capturas de la 1.0.5 en un Galaxy A17 (nombres de prueba difuminados)
const SHOTS = [
  ['s_juego', 'Partida en Zen con combo x2'],
  ['s_inicio', 'Inicio con misiones diarias'],
  ['s_ranking', 'Ranking semanal mundial'],
  ['s_personalizar', 'Personalizar con vista previa del tema Galaxia'],
  ['s_chicle', 'Partida con el tema Chicle y combo x3'],
  ['s_logros', 'Logros por escalones'],
  ['s_evento', 'Evento de Halloween y sus premios'],
  ['s_nuevo', 'Desbloqueo del efecto Confeti'],
]
const ShotCard = ({ id, alt }) => (
  <div className="shot-card">
    <img src={`${import.meta.env.BASE_URL}media/105/${id}.webp`} alt={alt} width="540" height="1044" loading="lazy" decoding="async" />
  </div>
)

export function Shots() {
  const shots = SHOTS
  const rowA = [...shots, ...shots]
  const rowB = [...shots.slice(4), ...shots.slice(0, 4)]
  const rowBdup = [...rowB, ...rowB]
  return (
    <section id="capturas" className="sec-shots">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Directo del juego</span>
          <h2 className="display">ASÍ SE <span className="shimmer" style={{ color: 'var(--blue)' }}>VE</span></h2>
          <p className="sub">Capturas de la versión 1.0.5, tal cual se ve en el teléfono.</p>
        </Reveal>
      </div>
      <Reveal delay={0.1} style={{ marginTop: 52 }}>
        <div className="shots-viewport">
          <div className="shots-row">{rowA.map(([id, alt], i) => <ShotCard key={`a${i}`} id={id} alt={alt} />)}</div>
          <div className="shots-row rev">{rowBdup.map(([id, alt], i) => <ShotCard key={`b${i}`} id={id} alt={alt} />)}</div>
        </div>
      </Reveal>
    </section>
  )
}
