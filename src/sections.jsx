import { useEffect, useState } from 'react'
import { m as motion } from 'framer-motion'
import {
  Play, Gamepad2, Gift, WifiOff, LayoutGrid, Zap, Puzzle, Sparkles, Flame, Trophy,
  Bomb, Pipette, Undo2, Shuffle, Infinity as InfinityIcon, Timer, Leaf, Medal,
  CalendarDays, TrendingUp, Ban, Rocket,
} from 'lucide-react'
import { useSecret, SecretModal } from './secret.jsx'
import { AppIcon, FallingGems, Logo, Reveal, Shine } from './bits.jsx'
import { LazyDemoGame, WhenNear } from './lazy.jsx'
import { STORE_URL, StoreBadges } from './extras.jsx'

const BASE = import.meta.env.BASE_URL

const FEATS = [
  { I: Gift, big: 'GRATIS', small: 'para jugar', c: '#43d9a3' },
  { I: WifiOff, big: 'OFFLINE', small: 'juega sin internet', c: '#4ea1ff' },
  { I: LayoutGrid, big: '4 MODOS', small: 'de juego', c: '#ff5d8f' },
  { I: Zap, big: '5 PODERES', small: 'para salvarte', c: '#ffc93c', dark: true },
]

/* ═══ HERO ════════════════════════════════════════════════════════════════════ */
export function Hero() {
  const secret = useSecret()
  const video = useLateSrc(`${BASE}media/105/juego.mp4`)
  // Entrada con CSS (no espera a que llegue framer-motion): el hero pinta en
  // cuanto React monta. Mismo orden y rebote que antes, en menos tiempo.
  return (
    <div className="hero" id="inicio">
      <FallingGems count={18} opacity={0.18} />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="h-in h-icon" style={{ marginBottom: 26 }}>
            <AppIcon size={92} />
          </div>
          <h1><Logo size={'clamp(64px, 9vw, 110px)'} onLetter={secret.tap} pulse={secret.pulse} /></h1>
          <SecretModal open={secret.open} onClose={secret.close} />
          <p className="display hero-tagline h-in h-up" style={{ '--d': '.45s' }}>
            EL PUZZLE MÁS ADICTIVO
          </p>
          <p className="hero-desc h-in h-fade" style={{ '--d': '.55s' }}>
            Arrastra piezas, encaja y <strong>revienta líneas</strong> en combos explosivos.
            Fácil de aprender, imposible de soltar.
          </p>
          <div className="hero-ctas h-in h-up" style={{ '--d': '.65s' }}>
            <a className="btn3d pulse-cta" href={STORE_URL} target="_blank" rel="noopener noreferrer">
              <Play size={20} strokeWidth={3} fill="currentColor" /> JUGAR GRATIS
            </a>
            <a className="btn3d blue" href="#demo"><Gamepad2 size={21} strokeWidth={2.5} /> Probar la demo</a>
          </div>
          <div className="hero-ctas h-in h-fade" style={{ marginTop: 18, '--d': '.7s' }}>
            <StoreBadges />
          </div>
          {/* Aviso de lanzamiento: va en el hero porque es lo primero que se
              ve sin hacer scroll. Repetido en la FAQ y en el CTA final. */}
          <p className="hero-soon h-in h-fade" style={{ '--d': '.75s' }}>
            <Rocket size={15} /> ¡Ya disponible en Google Play y App Store!
          </p>
          <ul className="feats" aria-label="Lo que trae Blokku">
            {FEATS.map(({ I, big, small, c, dark }, i) => (
              <li key={big} className={`feat${dark ? ' dark' : ''}`} style={{ '--c': c, '--i': i }}>
                <span className="feat-ic"><I size={20} strokeWidth={2.6} /></span>
                <span className="feat-txt">
                  <b className="display">{big}</b>
                  <small>{small}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-in h-phone" style={{ '--d': '.3s' }}>
          <div className="phone float-y">
            <video src={video} poster={`${BASE}media/105/juego.webp`} width="540" height="1044" autoPlay muted loop playsInline preload="none" data-autopause aria-label="Partida real de Blokku 1.0.5" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* El video del hero (440 KB) espera a que la página termine de cargar: el
   póster se ve igual y no le quita ancho de banda al JS ni a las fuentes. */
function useLateSrc(url) {
  const [src, setSrc] = useState()
  useEffect(() => {
    let t = 0
    const go = () => { t = setTimeout(() => setSrc(url), 600) }
    if (document.readyState === 'complete') go()
    else window.addEventListener('load', go, { once: true })
    return () => { window.removeEventListener('load', go); clearTimeout(t) }
  }, [url])
  return src
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
      <div className="demo-aurora" aria-hidden><span /><span /><span /></div>
      <FallingGems count={8} opacity={0.08} />
      <div className="wrap">
        <Reveal>
          <span className="kicker">Sin descargar nada</span>
          <h2 className="display">PRUÉBALO <Shine color="var(--pink)">AQUÍ MISMO</Shine></h2>
          <p className="sub">Esta es una probadita del modo Clásico. El juego completo trae 4 modos, 5 poderes, reto diario y logros — todo gratis.</p>
        </Reveal>
        <Reveal delay={0.15} style={{ marginTop: 44 }}>
          <WhenNear className="ph-demo" margin="700px 0px"><LazyDemoGame /></WhenNear>
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
          <h2 className="display">5 PODERES <Shine color="var(--yellow)">ÉPICOS</Shine></h2>
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
          <h2 className="display">4 MODOS <Shine color="var(--green)">DE JUEGO</Shine></h2>
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
          <h2 className="display">PROGRESA <Shine color="var(--purple)">A TU RITMO</Shine></h2>
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
          <h2 className="display">ASÍ SE <Shine color="var(--blue)">VE</Shine></h2>
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
