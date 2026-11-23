import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { useT } from './i18n/index.js'

/* Personalizar: clips reales de la 1.0.5 (Galaxy A17). El video solo carga y
   corre mientras la vitrina está en pantalla; con reduced-motion, póster fijo. */
const M = `${import.meta.env.BASE_URL}media/105/`

const CLIPS = [
  { id: 'personalizar', c: '#4EA1FF' },
  { id: 'galaxia', c: '#B388FF' },
  { id: 'chicle', c: '#FF5D8F' },
  { id: 'bosque', c: '#43D9A3' },
  { id: 'efectos', c: '#FFC93C' },
]

function ClipVideo({ clip, live, loop, onEnded }) {
  const t = useT()
  const ref = useRef(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (live) v.play().catch(() => {})
    else v.pause()
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
      aria-label={t('sc.alt', { n: t(`sc.${clip.id}.n`) })}
      width="540"
      height="1044"
    />
  )
}

export function Showcase() {
  const t = useT()
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
    <div className="nv-perso" style={{ '--sc': clip.c }}>
      <div className="nv-perso-stage" ref={boxRef}>
        <div className="phone nv-perso-phone">
          <div className="nv-screen" key={clip.id}>
            {reduce
              ? <img src={`${M}${clip.id}.webp`} alt={t('sc.alt', { n: t(`sc.${clip.id}.n`) })} width="540" height="1044" />
              : <ClipVideo clip={clip} live={inView} loop={pinned} onEnded={next} />}
          </div>
        </div>
      </div>

      <div className="nv-perso-copy">
        <span className="nv-num" style={{ color: 'var(--pink)' }}>02</span>
        <h3 className="display nv-h3">{t('sc.title')}</h3>
        <p className="nv-p">{t('sc.p')}</p>
        <div className="nv-tabs" role="tablist" aria-label={t('sc.tabsAria')}>
          {CLIPS.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === idx}
              className={`nv-tab${i === idx ? ' on' : ''}`}
              style={{ '--c': c.c }}
              onClick={() => pick(i)}
            >
              <i className="gem nv-tab-gem" aria-hidden /> {t(`sc.${c.id}.n`)}
            </button>
          ))}
        </div>
        <p className="nv-cap" key={clip.id} aria-live="polite">{t(`sc.${clip.id}.d`)}</p>
      </div>
    </div>
  )
}
