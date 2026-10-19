import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/* Personalizar: clips reales de la 1.0.5 (Galaxy A17). El video solo carga y
   corre mientras la vitrina está en pantalla; con reduced-motion, póster fijo. */
const M = `${import.meta.env.BASE_URL}media/105/`

const CLIPS = [
  { id: 'personalizar', n: 'Vista previa', c: '#4EA1FF',
    d: 'Escoges tema, piezas o efecto y lo ves en el tablero de muestra antes de tocar «Usar».' },
  { id: 'galaxia', n: 'Galaxia', c: '#B388FF',
    d: 'Índigo con brillos de nebulosa, aquí con el efecto Cristal roto.' },
  { id: 'chicle', n: 'Chicle', c: '#FF5D8F',
    d: 'Claro y rosado, con piezas Caramelo y Fuegos artificiales al limpiar.' },
  { id: 'bosque', n: 'Bosque', c: '#43D9A3',
    d: 'Verde profundo con piezas de Hielo. Este se gana: limpias 250 líneas y es tuyo.' },
  { id: 'efectos', n: 'Efectos', c: '#FFC93C',
    d: 'Fuegos artificiales, Cristal roto, Confeti… tú decides cómo truenan tus líneas.' },
]

function ClipVideo({ clip, live, loop, onEnded }) {
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
      aria-label={`${clip.n} en Blokku 1.0.5`}
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
    <div className="nv-perso" style={{ '--sc': clip.c }}>
      <div className="nv-perso-stage" ref={boxRef}>
        <div className="phone nv-perso-phone">
          <div className="nv-screen" key={clip.id}>
            {reduce
              ? <img src={`${M}${clip.id}.webp`} alt={`${clip.n} en Blokku 1.0.5`} width="540" height="1044" />
              : <ClipVideo clip={clip} live={inView} loop={pinned} onEnded={next} />}
          </div>
        </div>
      </div>

      <div className="nv-perso-copy">
        <span className="nv-num" style={{ color: 'var(--pink)' }}>02</span>
        <h3 className="display nv-h3">Personalizar</h3>
        <p className="nv-p">
          Una pantalla nueva para probar temas, piezas, efectos, marcos e insignias.
          Más de 40 son nuevos en esta versión.
        </p>
        <div className="nv-tabs" role="tablist" aria-label="Qué ver en el teléfono">
          {CLIPS.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={i === idx}
              className={`nv-tab${i === idx ? ' on' : ''}`}
              style={{ '--c': c.c }}
              onClick={() => pick(i)}
            >
              <i className="gem nv-tab-gem" aria-hidden /> {c.n}
            </button>
          ))}
        </div>
        <p className="nv-cap" key={clip.id} aria-live="polite">{clip.d}</p>
      </div>
    </div>
  )
}
