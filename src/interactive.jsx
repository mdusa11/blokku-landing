import { useEffect, useRef, useState } from 'react'
import { m as motion, useInView } from 'framer-motion'
import { Play } from 'lucide-react'
import { Logo } from './bits.jsx'
import { STORE_URL } from './extras.jsx'
import { useT } from './i18n/index.js'
import { LangPicker } from './i18n/LangPicker.jsx'

/* Barra de progreso de scroll — transform scaleX en compositor (barato). */
export function ScrollProgress() {
  const ref = useRef(null)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        const h = document.documentElement.scrollHeight - window.innerHeight
        const p = h > 0 ? window.scrollY / h : 0
        if (ref.current) ref.current.style.transform = `scaleX(${p})`
        raf = 0
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return <div className="scroll-progress"><div ref={ref} className="scroll-progress-bar" /></div>
}

/* Nav sticky que aparece al pasar el hero. */
export function StickyNav() {
  const t = useT()
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => { setShow(window.scrollY > window.innerHeight * 0.7); raf = 0 })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])
  return (
    <motion.nav
      className="stickynav"
      initial={false}
      animate={{ y: show ? 0 : -80, opacity: show ? 1 : 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ pointerEvents: show ? 'auto' : 'none' }}
    >
      <div className="wrap stickynav-inner">
        <a href="#inicio" className="stickynav-logo"><Logo size={26} /></a>
        <div className="stickynav-links">
          <a href="#demo">{t('nav.demo')}</a>
          <a href="#poderes">{t('nav.powers')}</a>
          <a href="#modos">{t('nav.modes')}</a>
          <a href="#novedades">{t('nav.news')}</a>
          <a href="#faq">{t('nav.faq')}</a>
        </div>
        <LangPicker className="langpick-nav" />
        <a href={STORE_URL} target="_blank" rel="noopener noreferrer" className="btn3d stickynav-cta">
          <Play size={15} strokeWidth={3} fill="currentColor" /> {t('nav.play')}
        </a>
      </div>
    </motion.nav>
  )
}

/* Contador que sube de 0 al valor cuando entra en pantalla. */
function CountUp({ to, suffix = '', duration = 1100 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0, start = 0
    const tick = (t) => {
      if (!start) start = t
      const p = Math.min((t - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * to))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return <span ref={ref}>{n}{suffix}</span>
}

const STATS = [
  { to: 8, suffix: '×8', k: 'stats.board' },
  { to: 4, suffix: '', k: 'stats.modes' },
  { to: 5, suffix: '', k: 'stats.powers' },
  { to: 100, suffix: '%', k: 'stats.free' },
]

export function Stats() {
  const t = useT()
  return (
    <section className="stats-sec">
      <div className="wrap stats-grid">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            className="stat"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 240, damping: 16 }}
          >
            <div className="stat-num display"><CountUp to={s.to} suffix={s.suffix} /></div>
            <div className="stat-label">{t(s.k)}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
