import { motion } from 'framer-motion'

export const COLORS = ['#00BCD4', '#E91E63', '#8BC34A', '#FF9800', '#9C27B0', '#FFEB3B', '#2196F3', '#FF5722', '#00E5FF', '#FF4081']

// PRNG determinista (mismo look en cada render)
export const rng = (seed) => {
  const x = Math.sin(seed * 999) * 10000
  return x - Math.floor(x)
}

export function Gem({ color, size, style }) {
  return (
    <div
      className="gem"
      style={{ width: size, height: size, background: `linear-gradient(160deg, ${color}, ${color}cc)`, ...style }}
    />
  )
}

/* Lluvia de gemas de fondo — 100% CSS (hilo compositor, no bloquea el JS).
   Reemplaza el loop de framer-motion que trababa en móvil. */
export function FallingGems({ count = 14, opacity = 0.16 }) {
  return (
    <div className="fgems" aria-hidden>
      {Array.from({ length: count }, (_, i) => {
        const size = 26 + rng(i + 1) * 62
        const left = rng(i * 3.7 + 2) * 100
        const dur = 11 + rng(i * 5.1 + 1) * 13
        const delay = -rng(i * 7.3 + 3) * dur
        const rot = Math.round(rng(i * 9 + 4) * 360)
        return (
          <span
            key={i}
            className="fgem"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              opacity,
              background: `linear-gradient(160deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}bb)`,
              '--r0': `${rot}deg`,
              '--r1': `${rot + 200}deg`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

export const THEME = { blue: '#4EA1FF', pink: '#FF5D8F', yellow: '#FFC93C', green: '#43D9A3' }

/* Wordmark BLOKKU multicolor */
export function Logo({ size = 64 }) {
  const letters = [
    ['B', THEME.blue], ['L', THEME.blue], ['O', THEME.blue],
    ['K', THEME.pink], ['K', THEME.yellow], ['U', THEME.green],
  ]
  return (
    <span className="display" style={{ fontSize: size, display: 'inline-flex' }}>
      {letters.map(([ch, c], i) => (
        <motion.span
          key={i}
          initial={{ y: -80, opacity: 0, rotate: -12 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          transition={{ delay: 0.15 + i * 0.09, type: 'spring', stiffness: 320, damping: 14 }}
          whileHover={{ y: -12, rotate: i % 2 ? 6 : -6, scale: 1.12 }}
          style={{ color: c, textShadow: '0 6px 0 rgba(0,0,0,.28), 0 16px 34px rgba(0,0,0,.45)', display: 'inline-block' }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

/* Ícono de la app (4 gemas) */
export function AppIcon({ size = 84 }) {
  const g = size * 0.09
  const s = (size - g * 3) / 2
  const cs = [THEME.blue, THEME.pink, THEME.yellow, THEME.green]
  return (
    <div
      style={{
        width: size, height: size, borderRadius: size * 0.24, background: '#101d4e',
        display: 'grid', gridTemplateColumns: `${s}px ${s}px`, gap: g, padding: g,
        boxShadow: '0 14px 34px rgba(0,0,0,.5), inset 0 2px 4px rgba(255,255,255,.12)',
      }}
    >
      {cs.map((c, i) => <Gem key={i} color={c} size={s} />)}
    </div>
  )
}

/* Reveal on-scroll con rebote exagerado */
export function Reveal({ children, delay = 0, y = 60, ...rest }) {
  return (
    <motion.div
      initial={{ opacity: 0, y, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay, type: 'spring', stiffness: 220, damping: 17 }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
