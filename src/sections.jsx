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
import { useT } from './i18n/index.js'
import { LangPicker } from './i18n/LangPicker.jsx'

const BASE = import.meta.env.BASE_URL

const FEATS = [
  { I: Gift, k: 'free', c: '#43d9a3' },
  { I: WifiOff, k: 'offline', c: '#4ea1ff' },
  { I: LayoutGrid, k: 'modes', c: '#ff5d8f' },
  { I: Zap, k: 'powers', c: '#ffc93c', dark: true },
]

/* ═══ HERO ════════════════════════════════════════════════════════════════════ */
export function Hero() {
  const t = useT()
  const secret = useSecret()
  const video = useLateSrc(`${BASE}media/105/juego.mp4`)
  // Entrada con CSS (no espera a que llegue framer-motion): el hero pinta en
  // cuanto React monta. Mismo orden y rebote que antes, en menos tiempo.
  return (
    <div className="hero" id="inicio">
      <FallingGems count={18} opacity={0.18} />
      <LangPicker className="langpick-hero" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <div className="h-in h-icon" style={{ marginBottom: 26 }}>
            <AppIcon size={92} />
          </div>
          <h1><Logo size={'clamp(64px, 9vw, 110px)'} onLetter={secret.tap} pulse={secret.pulse} /></h1>
          <SecretModal open={secret.open} onClose={secret.close} />
          <p className="display hero-tagline h-in h-up" style={{ '--d': '.45s' }}>
            {t('hero.tagline')}
          </p>
          <p className="hero-desc h-in h-fade" style={{ '--d': '.55s' }}>
            {t.rich('hero.desc')}
          </p>
          <div className="hero-ctas h-in h-up" style={{ '--d': '.65s' }}>
            <a className="btn3d pulse-cta" href={STORE_URL} target="_blank" rel="noopener noreferrer">
              <Play size={20} strokeWidth={3} fill="currentColor" /> {t('hero.cta')}
            </a>
            <a className="btn3d blue" href="#demo"><Gamepad2 size={21} strokeWidth={2.5} /> {t('hero.demo')}</a>
          </div>
          <div className="hero-ctas h-in h-fade" style={{ marginTop: 18, '--d': '.7s' }}>
            <StoreBadges />
          </div>
          {/* Aviso de lanzamiento: va en el hero porque es lo primero que se
              ve sin hacer scroll. Repetido en la FAQ y en el CTA final. */}
          <p className="hero-soon h-in h-fade" style={{ '--d': '.75s' }}>
            <Rocket size={15} /> {t('hero.soon')}
          </p>
          <ul className="feats" aria-label={t('hero.featsAria')}>
            {FEATS.map(({ I, k, c, dark }, i) => (
              <li key={k} className={`feat${dark ? ' dark' : ''}`} style={{ '--c': c, '--i': i }}>
                <span className="feat-ic"><I size={20} strokeWidth={2.6} /></span>
                <span className="feat-txt">
                  <b className="display">{t(`feat.${k}.big`)}</b>
                  <small>{t(`feat.${k}.small`)}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-in h-phone" style={{ '--d': '.3s' }}>
          <div className="phone float-y">
            <video src={video} poster={`${BASE}media/105/juego.webp`} width="540" height="1044" autoPlay muted loop playsInline preload="none" data-autopause aria-label={t('hero.videoAria')} />
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
  const t = useT()
  const items = [
    [Puzzle, t('marq.drag')], [Sparkles, t('marq.pop')], [Flame, t('marq.combos')],
    [Zap, t('marq.powers')], [Trophy, t('marq.records')], [Gift, t('marq.rewards')],
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
  const t = useT()
  return (
    <section id="demo">
      <div className="demo-aurora" aria-hidden><span /><span /><span /></div>
      <FallingGems count={8} opacity={0.08} />
      <div className="wrap">
        <Reveal>
          <span className="kicker">{t('demo.kicker')}</span>
          <h2 className="display">{t('demo.t1')} <Shine color="var(--pink)">{t('demo.t2')}</Shine></h2>
          <p className="sub">{t('demo.sub')}</p>
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
  { I: Bomb, k: 'bomb', c: '#FF6A00' },
  { I: Zap, k: 'lightning', c: '#FFC400' },
  { I: Undo2, k: 'undo', c: '#12E0C4' },
  { I: Shuffle, k: 'shuffle', c: '#9A5CFF' },
  { I: Pipette, k: 'color', c: '#FF2E88' },
]

export function Powers() {
  const t = useT()
  return (
    <section id="poderes" className="sec-powers">
      <div className="wrap">
        <Reveal>
          <span className="kicker">{t('powers.kicker')}</span>
          <h2 className="display">{t('powers.t1')} <Shine color="var(--yellow)">{t('powers.t2')}</Shine></h2>
          <p className="sub">{t('powers.sub')}</p>
        </Reveal>
        <div className="powers-grid">
          {POWERS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.07}>
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
                <div className="power-name">{t.up(`pow.${p.k}`)}</div>
                <div className="power-desc">{t(`tutpow.${p.k}`)}</div>
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
  { k: 'classic', I: InfinityIcon, bg: 'linear-gradient(160deg, #6fc4ff, #2b6ce0)' },
  { k: 'timed', I: Timer, bg: 'linear-gradient(160deg, #ff7ba6, #e0335f)' },
  { k: 'zen', I: Leaf, bg: 'linear-gradient(160deg, #ffd76f, #e09a2b)' },
  { k: 'daily', I: CalendarDays, bg: 'linear-gradient(160deg, #b388ff, #6a3fd6)' },
]

export function Modes() {
  const t = useT()
  return (
    <section id="modos">
      <FallingGems count={7} opacity={0.07} />
      <div className="wrap">
        <Reveal>
          <span className="kicker">{t('modes.kicker')}</span>
          <h2 className="display">{t('modes.t1')} <Shine color="var(--green)">{t('modes.t2')}</Shine></h2>
        </Reveal>
        <div className="modes-grid">
          {MODES.map((m, i) => (
            <Reveal key={m.k} delay={i * 0.12}>
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
                <div className="mode-name">{t(`mode.${m.k}`)}</div>
                <div className="mode-desc">{t(`modes.${m.k}.d`)}</div>
                <span className="mode-chip">{t(`modes.${m.k}.chip`)}</span>
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
  { I: Medal, k: 'ach', c: '#FFC93C' },
  { I: TrendingUp, k: 'lvl', c: '#FF5D8F' },
  { I: CalendarDays, k: 'daily', c: '#4EA1FF' },
  { I: Ban, k: 'ads', c: '#B388FF', vip: true },
]

export function Progression() {
  const t = useT()
  return (
    <section id="progresion" className="sec-prog">
      <div className="wrap">
        <Reveal>
          <span className="kicker">{t('prog.kicker')}</span>
          <h2 className="display">{t('prog.t1')} <Shine color="var(--purple)">{t('prog.t2')}</Shine></h2>
        </Reveal>
        <div className="prog-grid">
          {PROGS.map((p, i) => (
            <Reveal key={p.k} delay={i * 0.09}>
              <motion.div
                className={`prog-card${p.vip ? ' prog-vip' : ''}`}
                style={{ '--c': p.c }}
                whileHover={{ y: -10 }}
                transition={{ type: 'spring', stiffness: 300, damping: 16 }}
              >
                <motion.span className="prog-badge" whileHover={{ scale: 1.12, rotate: -8 }}>
                  <p.I size={34} strokeWidth={2.2} />
                </motion.span>
                <div className="prog-name">{t(`prog.${p.k}.n`)}</div>
                <div className="prog-desc">{t(`prog.${p.k}.d`)}</div>
                <span className="prog-chip">{t(`prog.${p.k}.chip`)}</span>
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
const SHOTS = ['s_juego', 's_inicio', 's_ranking', 's_personalizar', 's_chicle', 's_logros', 's_evento', 's_nuevo']
const ShotCard = ({ id, alt }) => (
  <div className="shot-card">
    <img src={`${import.meta.env.BASE_URL}media/105/${id}.webp`} alt={alt} width="540" height="1044" loading="lazy" decoding="async" />
  </div>
)

export function Shots() {
  const t = useT()
  const shots = SHOTS
  const rowA = [...shots, ...shots]
  const rowB = [...shots.slice(4), ...shots.slice(0, 4)]
  const rowBdup = [...rowB, ...rowB]
  return (
    <section id="capturas" className="sec-shots">
      <div className="wrap">
        <Reveal>
          <span className="kicker">{t('shots.kicker')}</span>
          <h2 className="display">{t('shots.t1')} <Shine color="var(--blue)">{t('shots.t2')}</Shine></h2>
          <p className="sub">{t('shots.sub')}</p>
        </Reveal>
      </div>
      <Reveal delay={0.1} style={{ marginTop: 52 }}>
        <div className="shots-viewport">
          <div className="shots-row">{rowA.map((id, i) => <ShotCard key={`a${i}`} id={id} alt={t(`shot.${id}`)} />)}</div>
          <div className="shots-row rev">{rowBdup.map((id, i) => <ShotCard key={`b${i}`} id={id} alt={t(`shot.${id}`)} />)}</div>
        </div>
      </Reveal>
    </section>
  )
}
