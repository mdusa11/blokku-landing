import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, Palette, CalendarDays, Gem as GemIcon } from 'lucide-react'

/* Vitrina «Hazlo tuyo»: clips reales de la 1.0.5 (Galaxy A17) dentro de un teléfono.
   Los clips se cargan solo cuando la vitrina entra en pantalla; con reduced-motion
   se queda en el póster. */
const M = `${import.meta.env.BASE_URL}media/105/`
const gems = (t) => [0, 1, 2].map((i) => `${M}g_${t}_${i}.webp`)

const CLIPS = [
  { id: 'galaxia', n: 'Galaxia', I: GemIcon, c: '#B388FF', glow: '154,92,255',
    t: 'Tema Galaxia', d: 'Índigo espacial con el efecto Cristal roto: cada línea estalla en pedazos.', deco: gems('galaxia') },
  { id: 'chicle', n: 'Chicle', I: GemIcon, c: '#FF5D8F', glow: '255,93,143',
    t: 'Tema Chicle', d: 'Rosa y dulce, con piezas Caramelo y Fuegos artificiales al limpiar.', deco: gems('chicle') },
  { id: 'bosque', n: 'Bosque', I: GemIcon, c: '#43D9A3', glow: '67,217,163',
    t: 'Tema Bosque', d: 'Verde profundo con piezas de Hielo. Se gana jugando: limpia 250 líneas.', deco: gems('bosque') },
  { id: 'efectos', n: 'Efectos', I: Sparkles, c: '#FFC93C', glow: '255,201,60',
    t: 'Efectos de línea', d: 'Fuegos artificiales, cristal roto y más: elige cómo revientan tus líneas.', deco: [...gems('chicle').slice(0, 1), ...gems('bosque').slice(0, 1), ...gems('galaxia').slice(0, 1)] },
  { id: 'personalizar', n: 'Personalizar', I: Palette, c: '#4EA1FF', glow: '78,161,255',
    t: 'Prueba antes de usar', d: 'Tema, piezas y efecto con vista previa en vivo. Tocas «Usar» y toda la app cambia.', deco: [...gems('galaxia').slice(1, 2), ...gems('chicle').slice(1, 2), ...gems('bosque').slice(1, 2)] },
  { id: 'eventos', n: 'Eventos', I: CalendarDays, c: '#FF8A3D', glow: '255,138,61',
    t: 'Eventos de temporada', d: 'Halloween y Día de Muertos por tiempo limitado, con premios exclusivos.', deco: [`${M}hw_calabaza.webp`, `${M}hw_badge.webp`, `${M}hw_calabaza.webp`] },
]

const DECO_POS = [
  { left: '-14%', top: '12%', size: 64, r: -18, dur: 5.5 },
  { right: '-12%', top: '38%', size: 74, r: 14, dur: 6.5 },
  { left: '-8%', bottom: '10%', size: 54, r: 10, dur: 6 },
]

function ClipVideo({ clip, live, loop, onEnded }) {
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (live) {
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [live, clip.id])
  return (
    <video
      ref={ref}
      key={clip.id}
      src={`${M}${clip.id}.mp4`}
      poster={`${M}${clip.id}.webp`}
      muted
      playsInline
      loop={loop}
      preload="none"
      onEnded={onEnded}
      aria-label={`${clip.t} en Blokku 1.0.5`}
      width="540"
      height="1044"
    />
  )
}

export function Showcase() {
  const reduce = useReducedMotion()
  const [idx, setIdx] = useState(0)
  const [pinned, setPinned] = useState(false)
  const [inView, setInView] = useState(false)
  const boxRef = useRef(null)
  const clip = CLIPS[idx]

  useEffect(() => {
    const el = boxRef.current
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const pick = (i) => { setIdx(i); setPinned(true) }
  const next = () => setIdx((i) => (i + 1) % CLIPS.length)

  return (
    <div className="showcase" style={{ '--sc': clip.c, '--sg': clip.glow }}>
      <div className="sc-copy">
        <span className="kicker sc-kicker">Hazlo tuyo</span>
        <h3 className="display sc-title">TEMAS, PIEZAS Y <span style={{ color: 'var(--yellow)' }}>EFECTOS</span></h3>
        <p className="sc-sub">Más de 40 extras nuevos en la 1.0.5. Así se ven en el juego, sin trucos: grabado en un teléfono real.</p>
        <div className="sc-chips" role="tablist" aria-label="Elige qué ver">
          {CLIPS.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === idx}
              className={`sc-chip${i === idx ? ' on' : ''}`}
              style={{ '--c': c.c }}
              onClick={() => pick(i)}
            >
              <c.I size={16} strokeWidth={2.6} /> {c.n}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={clip.id}
            className="sc-caption"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <div className="sc-cap-title">{clip.t}</div>
            <p className="sc-cap-desc">{clip.d}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sc-stage" ref={boxRef}>
        <div className="sc-halo" aria-hidden />
        {!reduce && clip.deco.map((src, i) => {
          const p = DECO_POS[i]
          return (
            <motion.img
              key={`${clip.id}-${i}`}
              src={src}
              alt=""
              aria-hidden
              className="sc-deco"
              style={{ left: p.left, right: p.right, top: p.top, bottom: p.bottom, width: p.size, height: p.size }}
              initial={{ opacity: 0, scale: 0.3, rotate: p.r - 60 }}
              animate={{ opacity: 1, scale: 1, rotate: p.r, y: [0, -12, 0] }}
              transition={{ opacity: { duration: 0.3, delay: i * 0.08 }, scale: { type: 'spring', stiffness: 260, damping: 13, delay: i * 0.08 }, rotate: { type: 'spring', stiffness: 200, damping: 14, delay: i * 0.08 }, y: { duration: p.dur, repeat: Infinity, ease: 'easeInOut' } }}
            />
          )
        })}
        <div className="phone sc-phone">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={clip.id}
              className="sc-screen"
              initial={reduce ? false : { opacity: 0, scale: 1.06, filter: 'blur(6px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35 }}
            >
              {reduce
                ? <img src={`${M}${clip.id}.webp`} alt={`${clip.t} en Blokku 1.0.5`} width="540" height="1044" />
                : <ClipVideo clip={clip} live={inView} loop={pinned} onEnded={next} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="sc-badge">GRABADO EN LA APP 1.0.5</span>
      </div>
    </div>
  )
}
