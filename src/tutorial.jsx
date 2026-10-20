import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Move, Rows3, Bookmark, Zap, Gamepad2, Gift, Bomb, Undo2, Shuffle, Pipette, Hourglass, Leaf,
  CalendarDays, Trophy, Flag, Lock, Sparkles, Lightbulb, RotateCw, ArrowRight, ArrowUp, Play,
  Medal, Ghost, Crown, Globe, Download,
} from 'lucide-react'
import { Reveal } from './bits.jsx'
import { STORE_URL } from './extras.jsx'
import './tutorial.css'

/* ═══ CÓMO JUGAR — el tutorial de la app (1.0.5), en la web ═══════════════════
   Las 7 páginas de lib/screens/tutorial_screen.dart con sus demos. Cada demo
   se describe como en Flutter: funciones de v (0..1 del bucle) → posición,
   escala, opacidad. Esas funciones se muestrean una vez y se vuelven
   @keyframes CSS, así todo corre en el compositor (transform/opacity) y
   perf.js las congela fuera de pantalla con .is-off. */

// ─── Curvas de Flutter ───────────────────────────────────────────────────────
const bz = (u, a, b) => 3 * a * u * (1 - u) ** 2 + 3 * b * u * u * (1 - u) + u ** 3
const cubic = (x1, y1, x2, y2) => (t) => {
  if (t <= 0) return 0
  if (t >= 1) return 1
  let lo = 0, hi = 1, u = t
  for (let i = 0; i < 28; i++) {
    u = (lo + hi) / 2
    if (bz(u, x1, x2) < t) lo = u
    else hi = u
  }
  return bz(u, y1, y2)
}
const easeInOut = cubic(0.42, 0, 0.58, 1)
const easeOut = cubic(0, 0, 0.58, 1)
const easeIn = cubic(0.42, 0, 1, 1)
const easeOutBack = cubic(0.175, 0.885, 0.32, 1.275)
const easeInOutBack = cubic(0.68, -0.55, 0.265, 1.55)
const elasticOut = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : 2 ** (-10 * t) * Math.sin(((t - 0.1) * 2 * Math.PI) / 0.4) + 1)
const seg = (v, a, b) => Math.min(1, Math.max(0, (v - a) / (b - a)))
const lerp = (a, b, t) => a + (b - a) * t
const sinPi = (t) => Math.sin(Math.PI * t)

// ─── Funciones de v → @keyframes ─────────────────────────────────────────────
const KEYS = { x: [0, 0.3], y: [0, 0.3], r: [0, 0.5], s: [1, 0.004], sx: [1, 0.004], o: [1, 0.01], d: [0, 0.4] }
const N = 200

function compile(name, fn) {
  const pts = []
  for (let i = 0; i <= N; i++) {
    const p = fn(i / N)
    const q = {}
    for (const k in KEYS) q[k] = p[k] ?? KEYS[k][0]
    pts.push(q)
  }
  const used = Object.keys(KEYS).filter((k) => pts.some((p) => Math.abs(p[k] - pts[0][k]) > 1e-6 || p[k] !== KEYS[k][0]))
  const fits = (a, b) => {
    for (let i = a + 1; i < b; i++) {
      const t = (i - a) / (b - a)
      for (const k of used) if (Math.abs(lerp(pts[a][k], pts[b][k], t) - pts[i][k]) > KEYS[k][1]) return false
    }
    return true
  }
  const keep = [0]
  let a = 0
  for (let b = 2; b <= N; b++) if (!fits(a, b)) { keep.push(b - 1); a = b - 1 }
  keep.push(N)
  const f = (n) => +n.toFixed(3)
  const decl = (p) => {
    const tr = []
    if (used.includes('x') || used.includes('y')) tr.push(`translate(${f(p.x)}px,${f(p.y)}px)`)
    if (used.includes('r')) tr.push(`rotate(${f(p.r)}deg)`)
    if (used.includes('s')) tr.push(`scale(${f(p.s)})`)
    if (used.includes('sx')) tr.push(`scaleX(${f(p.sx)})`)
    let out = tr.length ? `transform:${tr.join(' ')};` : ''
    if (used.includes('o')) out += `opacity:${f(p.o)};`
    if (used.includes('d')) out += `stroke-dashoffset:${f(p.d)};`
    return out
  }
  return `@keyframes ${name}{${keep.map((i) => `${f((i / N) * 100)}%{${decl(pts[i])}}`).join('')}}`
}

const built = new Map()
function build(id, def) {
  if (!built.has(id)) {
    let css = '', n = 0
    const t = (fn) => {
      const name = `${id}${n++}`
      css += compile(name, fn)
      return name
    }
    built.set(id, { a: def(t), css })
  }
  return built.get(id)
}

// ─── Piezas y tablero (look de la app: gemas de gelatina sobre tablero rosa) ─
const PC = ['#00BCD4', '#E91E63', '#8BC34A', '#FF9800', '#9C27B0', '#FFEB3B', '#2196F3']
const LET = { a: 0, b: 4, c: 2, d: 6, e: 1, f: 5, g: 3, h: 0, i: 4, j: 2, k: 1, l: 6, m: 5, n: 3, p: 1 }
const cellsOf = (rows) => rows.join('').split('').map((ch) => (ch === '.' ? null : PC[LET[ch]]))
const FP = 7 // borde + relleno del marco
const geo = (x, y, side) => {
  const cell = (side - 2 * FP) / 8
  return { cell, at: (r, c) => ({ x: x + FP + c * cell, y: y + FP + r * cell }) }
}
const G = { blue: '#4EA1FF', pink: '#FF5D8F', gold: '#FFC93C', mint: '#43D9A3', cyan: '#3ED1E0', purple: '#9C6BFF', orange: '#FF8A3D' }
const fmt = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

function Gem({ x, y, w, h = w, c, anim, gap = 1.2, children }) {
  return (
    <i className={anim ? 'tg ta' : 'tg'} style={{ left: x + gap, top: y + gap, width: w - 2 * gap, height: h - 2 * gap, '--c': c, animationName: anim }}>
      {children}
    </i>
  )
}

function Board({ x, y, side, cells }) {
  const { cell } = geo(0, 0, side)
  const o = FP - 3
  return (
    <div className="tboard" style={{ left: x, top: y, width: side, height: side }}>
      {cells.map((c, i) => (
        <Fragment key={i}>
          <i className="tcell" style={{ left: o + (i % 8) * cell + 1.2, top: o + Math.floor(i / 8) * cell + 1.2, width: cell - 2.4, height: cell - 2.4 }} />
          {c && <Gem x={o + (i % 8) * cell} y={o + Math.floor(i / 8) * cell} w={cell} c={c} />}
        </Fragment>
      ))}
    </div>
  )
}

/* Pieza [shape] en un contenedor propio (para moverla/girarla entera). */
function Piece({ shape, cell, c, anim, x = 0, y = 0, className = '' }) {
  return (
    <div className={`tpiece ${anim ? 'ta' : ''} ${className}`} style={{ left: x, top: y, width: shape[0].length * cell, height: shape.length * cell, animationName: anim }}>
      {shape.flatMap((row, r) => row.map((on, k) => (on ? <Gem key={`${r}-${k}`} x={k * cell} y={r * cell} w={cell} c={c} gap={cell * 0.06} /> : null)))}
    </div>
  )
}
const pieceAt = (shape, cx, cy, cell) => ({ x: cx - (shape[0].length * cell) / 2, y: cy - (shape.length * cell) / 2 })

function Finger({ anim, ringAnim }) {
  return (
    <div className="tfinger ta" style={{ animationName: anim }}>
      {ringAnim && (
        <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden>
          <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="4" />
          <circle className="ta" cx="22" cy="22" r="20" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="125.7" transform="rotate(-90 22 22)" style={{ animationName: ringAnim }} />
        </svg>
      )}
      <i />
    </div>
  )
}

function Tag({ text, color, I, anim, style, className = '' }) {
  return (
    <span className={`ttag ta ${className}`} style={{ '--c': color, animationName: anim, ...style }}>
      {I && <I size={14} strokeWidth={3} />} {text}
    </span>
  )
}

function Tile({ c, I, size = 38, tilt = 0, children, style }) {
  return (
    <span className="tgt" style={{ '--c': c, width: size, height: size, transform: tilt ? `rotate(${tilt}deg)` : undefined, ...style }}>
      {I ? <I size={size * 0.52} strokeWidth={2.6} /> : children}
    </span>
  )
}

/* Lienzo fijo de w×h escalado al hueco, como _Stage en la app. */
function Stage({ w, h, children }) {
  const ref = useRef(null)
  const [k, setK] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    const fit = () => setK(Math.min(el.clientWidth / w, el.clientHeight / h))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [w, h])
  return (
    <div ref={ref} className="tstage-box">
      <div className="tstage" style={{ width: w, height: h, transform: `translate(-50%,-50%) scale(${k})`, visibility: k ? 'visible' : 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

const Demo = ({ T, still, css, w, h, children }) => (
  <>
    <style>{css}</style>
    <Stage w={w} h={h}>
      <div className="tdemo-vars" style={{ '--T': `${T}s`, '--still': still }}>{children}</div>
    </Stage>
  </>
)

// ─── 1. Arrastra y coloca ────────────────────────────────────────────────────
const DRAG_ROWS = ['........', '.....aa.', '.....aa.', 'b.......', 'bb...cc.', 'b.....cc', 'dd.eee..', 'dddeee.f']
const L_SHAPE = [[1, 0], [1, 0], [1, 1]]
function DragDemo() {
  const side = 210, bx = 45, land = 0.62, slotA = { x: 55, y: 285 }
  const g = geo(bx, 0, side)
  const { a, css } = build('tdrag', (t) => {
    const target = { x: bx + FP + 3.5 * g.cell, y: FP + 6 * g.cell }
    const pos = (v) => {
      const move = easeInOut(seg(v, 0.32, land))
      return { move, x: lerp(slotA.x, target.x, move), y: lerp(slotA.y, target.y, move) - 26 * sinPi(move), size: 17 + (g.cell - 17) * move }
    }
    return {
      flyer: t((v) => {
        const p = pos(v)
        return { x: p.x - g.cell, y: p.y - 1.5 * g.cell, s: p.size / g.cell, r: 90 * easeOutBack(seg(v, 0.14, 0.26)), o: v < land ? seg(v, 0, 0.06) : 0 }
      }),
      landed: t((v) => ({ o: v >= land && v < 0.97 ? 1 : 0 })),
      finger: t((v) => {
        const p = pos(v)
        const press = v > 0.12 && v < 0.2 ? sinPi(seg(v, 0.12, 0.2)) : v > 0.3 && v < land ? 0.6 : 0
        const f = p.move > 0 ? { x: p.x, y: p.y + p.size * 1.6 + 6 } : { x: slotA.x, y: slotA.y + 6 }
        const o = v > 0.04 && v < land + 0.06 ? seg(v, 0.04, 0.09) * (1 - seg(v, land + 0.01, land + 0.06)) : 0
        return { x: f.x - 23, y: f.y - 23, s: (30 - 6 * press) / 30, o }
      }),
      tag: t((v) => {
        const k = seg(v, 0.13, 0.18) * (1 - seg(v, 0.4, 0.46))
        return { o: k, s: 0.8 + 0.2 * k }
      }),
    }
  })
  const landedCells = [[5, 2], [5, 3], [5, 4], [6, 2]]
  return (
    <Demo T={4.4} still={0.75} css={css} w={300} h={330}>
      <Board x={bx} y={0} side={side} cells={cellsOf(DRAG_ROWS)} />
      {landedCells.map(([r, c]) => {
        const p = g.at(r, c)
        return <Gem key={`${r}${c}`} x={p.x} y={p.y} w={g.cell} c={PC[4]} anim={a.landed} />
      })}
      <Piece shape={[[1, 1, 1], [0, 1, 0]]} cell={17} c={PC[1]} {...pieceAt([[1, 1, 1], [0, 1, 0]], 150, 285, 17)} />
      <Piece shape={[[1, 1], [1, 1]]} cell={17} c={PC[2]} {...pieceAt([[1, 1], [1, 1]], 245, 285, 17)} />
      <Piece shape={L_SHAPE} cell={g.cell} c={PC[4]} anim={a.flyer} />
      <Tag text="Toca = girar" color={G.pink} I={RotateCw} anim={a.tag} style={{ left: 0, top: 200, transformOrigin: '0 100%' }} />
      <Finger anim={a.finger} />
    </Demo>
  )
}

// ─── 2. Líneas y combos ──────────────────────────────────────────────────────
const LINE_ROWS = ['.a...b..', '.aa..b.c', 'dd...bcc', 'ddeef.gg', '...h.ii.', '..hh.i..', 'j....kk.', 'jj..lkkm']
function LinesDemo() {
  const side = 230, top = 72, left = 35, R = 3, C = 5, landAt = 0.3, clearAt = 0.36
  const g = geo(left, top, side)
  const cells = cellsOf(LINE_ROWS)
  const lines = [...Array.from({ length: 8 }, (_, i) => R * 8 + i), ...Array.from({ length: 8 }, (_, i) => i * 8 + C).filter((i) => i !== R * 8 + C)]
  const { a, css } = build('tline', (t) => {
    const target = g.at(R, C)
    const score = (v) => 24 + Math.round(12 * easeOut(seg(v, clearAt, 0.56)))
    const vanish = (v) => {
      const k = seg(v, 0.37, 0.45)
      return { s: k < 0.3 ? 1 + 0.2 * (k / 0.3) : 1.2 * (1 - (k - 0.3) / 0.7), o: 1 - seg(v, 0.41, 0.45) }
    }
    return {
      fly: t((v) => {
        const m = easeInOut(seg(v, 0.08, landAt))
        return { x: lerp(150 - g.cell / 2, target.x, m), y: lerp(340, target.y, m), o: v < landAt ? seg(v, 0.02, 0.08) : 0 }
      }),
      cell: t((v) => (v < clearAt ? { s: 1, o: 1 } : v < 0.94 ? vanish(v) : { s: 0.6 + 0.4 * seg(v, 0.94, 1), o: seg(v, 0.94, 1) })),
      placed: t((v) => (v < landAt ? { o: 0, s: 1 } : v < clearAt ? { o: 1, s: 1 } : v < 0.94 ? vanish(v) : { o: 0, s: 0 })),
      flash: t((v) => ({ o: 0.85 * sinPi(seg(v, clearAt, 0.43)) })),
      digits: Array.from({ length: 13 }, (_, k) => t((v) => ({ o: score(v) - 24 === k ? 1 : 0 }))),
      combo: t((v) => {
        const out = seg(v, 0.8, 0.9)
        return v < clearAt ? { o: 0, s: 0.4 } : { o: 1 - out, s: 0.4 + 0.6 * elasticOut(seg(v, clearAt, clearAt + 0.12)) }
      }),
      gain: t((v) => {
        const f = seg(v, clearAt, 0.8)
        return { y: -40 * f, o: v < clearAt ? 0 : 1 - f }
      }),
      parts: [...lines, R * 8 + C].map((idx, n) => {
        const ang = (n * 137.5 * Math.PI) / 180
        const dist = 34 + ((n * 53) % 30)
        return t((v) => {
          const k = easeOut(seg(v, clearAt, 0.66))
          return { x: Math.cos(ang) * dist * k, y: Math.sin(ang) * dist * k + 26 * k * k, s: 1 - k, o: v >= clearAt && v < 0.66 ? 1 - 0.5 * k : 0 }
        })
      }),
    }
  })
  const rowP = g.at(R, 0), colP = g.at(0, C)
  return (
    <Demo T={4.6} still={0.62} css={css} w={300} h={330}>
      <div className="tscore">
        <small>PUNTAJE</small>
        <span className="tscore-num">
          {a.digits.map((d, k) => (
            <b key={k} className="ta" style={{ animationName: d }}>{fmt(24000 + k * 1000)}</b>
          ))}
        </span>
      </div>
      <Board x={left} y={top} side={side} cells={cells.map((c, i) => (lines.includes(i) ? null : c))} />
      {lines.map((i) => {
        const p = g.at(Math.floor(i / 8), i % 8)
        return <Gem key={i} x={p.x} y={p.y} w={g.cell} c={cells[i]} anim={a.cell} />
      })}
      <Gem x={g.at(R, C).x} y={g.at(R, C).y} w={g.cell} c={PC[5]} anim={a.placed} />
      <i className="tflash ta" style={{ left: rowP.x, top: rowP.y, width: 8 * g.cell, height: g.cell, animationName: a.flash }} />
      <i className="tflash ta" style={{ left: colP.x, top: colP.y, width: g.cell, height: 8 * g.cell, animationName: a.flash }} />
      {[...lines, R * 8 + C].map((idx, n) => {
        const p = g.at(Math.floor(idx / 8), idx % 8)
        return <i key={n} className="tpart ta" style={{ left: p.x + g.cell / 2 - 5, top: p.y + g.cell / 2 - 5, '--c': cells[idx] ?? PC[5], animationName: a.parts[n] }} />
      })}
      <Gem x={0} y={0} w={g.cell} c={PC[5]} anim={a.fly} />
      <div className="tcombo ta" style={{ top: top + side * 0.32 - 22, animationName: a.combo }}>COMBO x3</div>
      <div className="tgain ta" style={{ top: top + side * 0.56 - 14, animationName: a.gain }}>+12.000</div>
    </Demo>
  )
}

// ─── 3. Guarda una pieza ─────────────────────────────────────────────────────
const HOLD_ROWS = ['........', '..aa....', '..aa..c.', 'b....cc.', 'bb...c..', 'b.......', 'dd.ee.ff', 'ddeee.ff']
const T_SHAPE = [[1, 1, 1], [0, 1, 0]]
function HoldDemo() {
  const dy = 200, cell = 19, slot = { x: 8, y: dy + 34, w: 76, h: 102 }
  const p1 = { x: 205, y: dy + 85 }
  const slotC = { x: slot.x + slot.w / 2, y: slot.y + slot.h / 2 + 8 }
  const { a, css } = build('thold', (t) => ({
    piece: t((v) => {
      const go = easeInOut(seg(v, 0.36, 0.52)), back = easeInOut(seg(v, 0.72, 0.88))
      const pos = back > 0 ? { x: lerp(slotC.x, p1.x, back), y: lerp(slotC.y, p1.y, back) } : { x: lerp(p1.x, slotC.x, go), y: lerp(p1.y, slotC.y, go) }
      const size = (back > 0 ? 12 + (cell - 12) * back : cell + (12 - cell) * go) * (v > 0.3 && v < 0.36 ? 1.08 : 1)
      return { x: pos.x - 1.5 * cell, y: pos.y - cell, s: size / cell }
    }),
    lit: t((v) => ({ o: seg(v, 0.5, 0.53) * (1 - seg(v, 0.71, 0.74)) })),
    mark: t((v) => ({ o: v > 0.36 && v < 0.88 ? 0 : 1 })),
    press: t((v) => ({ x: p1.x - 23, y: p1.y + 10 - 23, s: 0.85, o: v > 0.06 && v < 0.38 ? seg(v, 0.06, 0.1) * (1 - seg(v, 0.35, 0.38)) : 0 })),
    ring: t((v) => ({ d: 125.7 * (1 - seg(v, 0.08, 0.36)) })),
    tap: t((v) => {
      const k = v > 0.64 && v < 0.74 ? sinPi(seg(v, 0.64, 0.74)) : 0
      return { x: slotC.x - 23, y: slotC.y - 23, s: (30 - 6 * k) / 30, o: k }
    }),
    chip: t((v) => ({ o: seg(v, 0.1, 0.16) * (1 - seg(v, 0.56, 0.62)) })),
    chip2: t((v) => ({ o: seg(v, 0.64, 0.7) * (1 - seg(v, 0.9, 0.96)) })),
  }))
  return (
    <Demo T={5.2} still={0.62} css={css} w={320} h={384}>
      <Board x={67} y={0} side={186} cells={cellsOf(HOLD_ROWS)} />
      <div className="tslot" style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h }}>
        <small>GUARDAR</small>
        <Bookmark className="ta" style={{ animationName: a.mark }} size={24} strokeWidth={2.4} fill="currentColor" />
      </div>
      <div className="tslot on ta" style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h, animationName: a.lit }}>
        <small>GUARDAR</small>
      </div>
      <div className="ttray" style={{ left: 100, top: dy + 34, width: 220, height: 102 }} />
      <Piece shape={L_SHAPE} cell={cell} c={PC[0]} {...pieceAt(L_SHAPE, 128, dy + 85, cell)} />
      <Piece shape={T_SHAPE} cell={cell} c={PC[3]} anim={a.piece} />
      <Piece shape={[[1, 1], [1, 1]]} cell={cell} c={PC[6]} {...pieceAt([[1, 1], [1, 1]], 280, dy + 85, cell)} />
      <Finger anim={a.press} ringAnim={a.ring} />
      <Finger anim={a.tap} />
      <Tag text="Mantén pulsado" color={G.mint} I={Bookmark} anim={a.chip} style={{ left: 100, top: dy - 6 }} />
      <Tag text="Toca para sacarla" color={G.blue} I={ArrowUp} anim={a.chip2} style={{ left: 8, top: dy + 146 }} />
    </Demo>
  )
}

// ─── 4. Poderes ──────────────────────────────────────────────────────────────
// Color e ícono de la barra de poderes de la app.
const POWERS = [
  { n: 'Bomba', d: 'Borra un área de 3×3', I: Bomb, c: '#FF6A00', ink: '#C24A00' },
  { n: 'Rayo', d: 'Borra una fila entera', I: Zap, c: '#FFC400', ink: '#A87A00' },
  { n: 'Retroceso', d: 'Deshace tu última jugada', I: Undo2, c: '#12E0C4', ink: '#0A8F7C' },
  { n: 'Mezcla', d: 'Cambia las piezas de la bandeja', I: Shuffle, c: '#9A5CFF', ink: '#6A35D0' },
  { n: 'Destructor de color', d: 'Borra todas las piezas de un color', I: Pipette, c: '#FF2E88', ink: '#C21463' },
]
const POW_ROWS = ['..aab.', 'c.dab.', 'cddpee', 'cfpfge', 'hijklm', 'p.nnp.']
const POW_COL = { a: 0, b: 4, c: 2, d: 6, e: 3, f: 5, g: 0, p: 1, h: 0, i: 6, j: 5, k: 3, l: 4, m: 2, n: 6 }
const hit = (w, r, c, ch) => (w === 0 ? r >= 1 && r <= 3 && c >= 1 && c <= 3 : w === 1 ? r === 4 : w === 2 ? ch === 'a' : w === 4 ? ch === 'p' : false)
const TRAY_A = [[[1, 1], [1, 0]], [[1, 1, 1]], [[1], [1]]]
const TRAY_B = [[[1, 1], [1, 1]], [[0, 1], [1, 1]], [[1, 1, 1], [0, 1, 0]]]
function PowersDemo() {
  const cell = 26, gx = 82, gy = 86
  const phase = (v) => {
    const x = v * 5
    const i = Math.min(4, Math.floor(x))
    return { i, p: x - i }
  }
  const { a, css } = build('tpow', (t) => ({
    tiles: POWERS.map((_, k) => t((v) => {
      const { i, p } = phase(v)
      return k === i ? { y: -6 * sinPi(seg(p, 0, 0.3)), s: 1, o: 1 } : { y: 0, s: 44 / 54, o: 0.5 }
    })),
    on: POWERS.map((_, k) => t((v) => ({ o: phase(v).i === k ? 1 : 0 }))),
    cells: POW_ROWS.map((row, r) => row.split('').map((ch, c) => (ch === '.' ? null : {
      gem: t((v) => {
        const { i: w, p } = phase(v)
        if (!hit(w, r, c, ch)) return { x: 0, y: 0, s: 1, o: 1 }
        const back = seg(p, 0.9, 1)
        if (back > 0) return { x: 0, y: 0, s: 1, o: 1 }
        const g = w === 1 ? easeIn(seg(p, 0.36 + c * 0.04, 0.5 + c * 0.04)) : easeIn(seg(p, 0.4, 0.62))
        if (w === 2) return { y: 190 * g, s: 1, o: (1 - g) * (1 - g * 0.3) }
        return { y: 0, s: 1 - g, o: 1 - g * 0.3 }
      }),
      flash: t((v) => {
        const { i: w, p } = phase(v)
        return { o: hit(w, r, c, ch) ? 0.75 * sinPi(seg(p, 0.28, 0.44)) : 0 }
      }),
    }))),
    trayA: [0, 1, 2].map(() => t((v) => {
      const { i, p } = phase(v)
      if (i !== 3) return { s: 1, o: 1 }
      const back = seg(p, 0.9, 1), swap = seg(p, 0.3, 0.7)
      if (back > 0) return { s: 1, o: 1 }
      return swap < 0.5 ? { s: 1 - swap * 2, o: 1 } : { s: 0, o: 0 }
    })),
    trayB: [0, 1, 2].map(() => t((v) => {
      const { i, p } = phase(v)
      const swap = seg(p, 0.3, 0.7)
      if (i !== 3 || swap < 0.5 || p >= 0.9) return { s: 0, o: 0 }
      return { s: (swap - 0.5) * 2, o: 1 }
    })),
  }))
  return (
    <Demo T={9.5} still={0.32} css={css} w={320} h={420}>
      {POWERS.map((pw, k) => (
        <div key={k} className="ta tpow-tile" style={{ left: 12 + k * 60 + 1, top: 7, animationName: a.tiles[k] }}>
          <Tile c={pw.c} I={pw.I} size={54} tilt={k % 2 ? 5 : -5} />
        </div>
      ))}
      <div className="tpow-board" style={{ left: gx - 6, top: gy - 6, width: 6 * cell + 12, height: 6 * cell + 12 }}>
        {POWERS.map((pw, k) => <i key={k} className="ta" style={{ borderColor: pw.c, animationName: a.on[k] }} />)}
      </div>
      {POW_ROWS.flatMap((row, r) => row.split('').map((_, c) => <i key={`e${r}${c}`} className="tcell" style={{ left: gx + c * cell + 1, top: gy + r * cell + 1, width: cell - 2, height: cell - 2, borderRadius: 5 }} />))}
      {POW_ROWS.flatMap((row, r) => row.split('').map((ch, c) => (ch === '.' ? null : (
        <Gem key={`g${r}${c}`} x={gx + c * cell} y={gy + r * cell} w={cell} c={PC[POW_COL[ch]]} anim={a.cells[r][c].gem}>
          <b className="tgflash ta" style={{ animationName: a.cells[r][c].flash }} />
        </Gem>
      ))))}
      {[0, 1, 2].map((k) => {
        const cx = gx + 26 + k * 52
        return (
          <Fragment key={k}>
            <Piece shape={TRAY_A[k]} cell={13} c={PC[(k * 3) % 7]} anim={a.trayA[k]} {...pieceAt(TRAY_A[k], cx, 272, 13)} className="tpiece-at" />
            <Piece shape={TRAY_B[k]} cell={13} c={PC[(k * 3 + 2) % 7]} anim={a.trayB[k]} {...pieceAt(TRAY_B[k], cx, 272, 13)} className="tpiece-at" />
          </Fragment>
        )
      })}
      {POWERS.map((pw, k) => (
        <div key={k} className="tpow-name ta" style={{ animationName: a.on[k], '--ink': pw.ink }}>
          <strong><pw.I size={18} strokeWidth={2.6} color={pw.c} /> {pw.n}</strong>
          <span>{pw.d}</span>
        </div>
      ))}
      <div className="trescue">
        <Tile c={G.gold} I={Lightbulb} size={32} tilt={-7} />
        <span>¿No cabe nada? Te sugerimos el poder que te salva.</span>
      </div>
    </Demo>
  )
}

// ─── 5. Modos de juego ───────────────────────────────────────────────────────
const MODES = [
  { I: Gamepad2, c: '#FF5D8F', n: 'CLÁSICO', d: 'Sin fin · cuenta para tu récord' },
  { I: Hourglass, c: '#9C6BFF', n: 'CONTRA RELOJ', d: '90 segundos · puntaje máximo' },
  { I: Leaf, c: '#FFAD45', n: 'ZEN', d: 'Sin game over · solo relájate' },
  { I: CalendarDays, c: '#4EA1FF', n: 'DESAFÍO DIARIO', d: 'El mismo tablero para todos, una vez al día' },
  { I: Trophy, c: '#FF5D8F', n: 'EVENTO DE FIN DE SEMANA', d: 'Sábado y domingo, con reglas especiales' },
]
function ModesDemo() {
  const { a, css } = build('tmode', (t) => ({
    rows: MODES.map((_, i) => t((v) => {
      const x = v * 5
      const on = Math.min(4, Math.floor(x))
      return on === i ? { s: 1 + 0.04 * sinPi(x - on), o: 1 } : { s: 0.97, o: 0.72 }
    })),
    glow: MODES.map((_, i) => t((v) => ({ o: Math.min(4, Math.floor(v * 5)) === i ? 1 : 0 }))),
  }))
  return (
    <Demo T={7} still={0.1} css={css} w={320} h={360}>
      {MODES.map((m, i) => (
        <div key={i} className="tmode ta" style={{ top: 9 + i * 70, '--c': m.c, animationName: a.rows[i] }}>
          <i className="tmode-glow ta" style={{ animationName: a.glow[i] }} />
          <span className="tmode-ic"><m.I size={21} strokeWidth={2.6} /></span>
          <span className="tmode-tx"><strong>{m.n}</strong><small>{m.d}</small></span>
        </div>
      ))}
    </Demo>
  )
}

// ─── 6. Progreso y premios ───────────────────────────────────────────────────
const RARITY = { comun: ['COMÚN', '#8FA0C8'], raro: ['RARO', '#4EA1FF'], epico: ['ÉPICO', '#9C6BFF'], legendario: ['LEGENDARIO', '#FFB020'], mitico: ['SECRETO', '#FF4FD8'] }
const UNLOCKS = [
  { k: 'galaxy', r: 'epico' }, { k: 'diamond', r: 'legendario' }, { k: 'aurora', r: 'epico' }, { k: 'nova', r: 'legendario' },
  { k: 'phoenix', r: 'legendario' }, { k: 'jewel', r: 'comun' }, { k: 'gold', r: 'legendario' }, { k: 'prism', r: 'raro' },
]
function Unlock({ k, r }) {
  const [label, c] = RARITY[r]
  const gems = { diamond: ['#3ED1E0', '#8BC34A', '#B388FF', '#2196F3', '#00E5FF', '#43D9A3'], jewel: ['#E91E63', '#FFEB3B', '#00BCD4', '#9C27B0', '#FF9800', '#8BC34A'], prism: ['#FF5D8F', '#FFC93C', '#43D9A3', '#4EA1FF', '#9C6BFF', '#3ED1E0'] }[k]
  return (
    <div className="tunl">
      <div className={`tunl-art tu-${k}`}>
        {gems && <div className="tunl-gems">{gems.map((g, i) => <i key={i} className="tg" style={{ '--c': g }} />)}</div>}
        {k === 'gold' && <div className="tunl-grid">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>}
        {k === 'phoenix' && <div className="tunl-grid fire">{Array.from({ length: 9 }, (_, i) => <i key={i} />)}</div>}
      </div>
      <span className="tchip" style={{ '--c': c }}>{label}</span>
    </div>
  )
}
function ProgressDemo() {
  const TILE = 96, GAP = 12, loop = (UNLOCKS.length + 1) * (TILE + GAP)
  const { a, css } = build('tprog', (t) => {
    const st = (v) => {
      const q = (v * 4) % 1
      const lvl = 23 + Math.min(3, Math.floor(v * 4))
      const up = seg(q, 0.6, 0.72)
      return { q, lvl, up, shown: up > 0 ? lvl + 1 : lvl }
    }
    return {
      badge: t((v) => ({ s: 1 + 0.25 * sinPi(st(v).up) })),
      bar: t((v) => {
        const s = st(v)
        return { sx: s.up > 0 ? 0.05 : 0.15 + 0.85 * easeOut(seg(s.q, 0.05, 0.6)) }
      }),
      lv: [23, 24, 25, 26, 27].map((n) => t((v) => ({ o: st(v).shown === n ? 1 : 0 }))),
      strip: t((v) => ({ x: -loop * v })),
    }
  })
  const items = [...UNLOCKS.map((u) => <Unlock key={u.k} {...u} />), <Mystery key="m" />]
  return (
    <Demo T={12} still={0.3} css={css} w={320} h={380}>
      <div className="tlevel">
        <span className="tlevel-badge ta" style={{ animationName: a.badge }}>
          <Tile c={G.gold} size={44} tilt={-6}>
            {[23, 24, 25, 26, 27].map((n, i) => <b key={n} className="ta" style={{ animationName: a.lv[i] }}>{n}</b>)}
          </Tile>
        </span>
        <div className="tlevel-info">
          <div className="tlevel-row">
            <span className="tlevel-lbl">
              {[23, 24, 25, 26, 27].map((n, i) => <b key={n} className="ta" style={{ animationName: a.lv[i] }}>Nivel {n} de 100</b>)}
            </span>
            <em>+XP</em>
          </div>
          <div className="tbar"><i className="ta" style={{ animationName: a.bar }} /></div>
        </div>
      </div>
      <div className="tfeats" style={{ top: 82 }}>
        <Feature c={G.mint} I={Flag} text="Ruta de nivel" />
        <Feature c={G.gold} I={Trophy} text="Logros por escalones" />
        <Feature c={G.pink} I={Gift} text="Cofres" />
      </div>
      <div className="tstrip-win">
        <div className="tstrip ta" style={{ animationName: a.strip }}>{items}{items.map((it) => <Fragment key={`b${it.key}`}>{it}</Fragment>)}</div>
      </div>
      <p className="tcustom"><Sparkles size={16} color="#FF5D8F" /> Personalízalo todo en Personalizar</p>
    </Demo>
  )
}
const Mystery = () => (
  <div className="tunl">
    <div className="tunl-art tu-mystery"><Lock size={28} strokeWidth={2.6} /><b>???</b></div>
    <span className="tchip" style={{ '--c': RARITY.mitico[1] }}>SECRETO</span>
  </div>
)
const Feature = ({ c, I, text }) => (
  <div className="tfeat">
    <Tile c={c} I={I} size={30} tilt={-5} />
    <span>{text}</span>
  </div>
)

// ─── 7. Compite ──────────────────────────────────────────────────────────────
// Apodos de muestra (no son jugadores reales).
const WORLD = [['GemaVeloz', 980000], ['ComboKing', 884000], ['Bloquecito', 851000]]
const LOCAL = [['TacoCombo', 905000], ['ReinaDelRayo', 860000], ['Pixelito', 846000]]
function CompeteDemo() {
  const ROW = 50
  const { a, css } = build('tcomp', (t) => {
    const climb = (v) => easeInOutBack(seg(((v % 0.5) * 2), 0.35, 0.65))
    return {
      world: t((v) => ({ o: v < 0.5 ? 1 : 0 })),
      local: t((v) => ({ o: v >= 0.5 ? 1 : 0 })),
      others: [0, 1, 2].map((k) => t((v) => ({ y: (k + (k >= 1 ? climb(v) : 0)) * ROW }))),
      rankA: t((v) => ({ o: climb(v) > 0.5 ? 0 : 1 })),
      rankB: t((v) => ({ o: climb(v) > 0.5 ? 1 : 0 })),
      me: t((v) => ({ y: (3 - 2 * climb(v)) * ROW })),
    }
  })
  const name = (k) => (
    <span className="trk-name">
      <b className="ta" style={{ animationName: a.world }}>{WORLD[k][0]}</b>
      <b className="ta" style={{ animationName: a.local }}>{LOCAL[k][0]}</b>
    </span>
  )
  const pts = (k) => (
    <span className="trk-pts">
      <b className="ta" style={{ animationName: a.world }}>{fmt(WORLD[k][1])}</b>
      <b className="ta" style={{ animationName: a.local }}>{fmt(LOCAL[k][1])}</b>
    </span>
  )
  const pos = (from, to) => (
    <span className="trk-pos">
      <b className="ta" style={{ animationName: a.rankA }}>#{from}</b>
      <b className="ta" style={{ animationName: a.rankB }}>#{to}</b>
    </span>
  )
  return (
    <Demo T={6} still={0.6} css={css} w={320} h={370}>
      <div className="ttoggles">
        <div className="ttog"><Globe size={16} strokeWidth={2.6} /> Mundial<i className="ttog-on ta" style={{ animationName: a.world }}><Globe size={16} strokeWidth={2.6} /> Mundial</i></div>
        <div className="ttog"><Flag size={16} strokeWidth={2.6} /> Tu país<i className="ttog-on ta" style={{ animationName: a.local }}><Flag size={16} strokeWidth={2.6} /> Tu país</i></div>
      </div>
      {[0, 1, 2].map((k) => (
        <div key={k} className={`trk ta ${k === 0 ? 'first' : ''}`} style={{ animationName: a.others[k] }}>
          {k === 0 ? <span className="trk-pos">#1</span> : pos(k + 1, k + 2)}
          {name(k)}
          {pts(k)}
        </div>
      ))}
      <div className="trk me ta" style={{ animationName: a.me }}>
        {pos(4, 2)}
        <Crown size={20} strokeWidth={2.6} fill="#FFC93C" color="#B07A00" />
        <span className="trk-name"><b>Tú</b></span>
        <span className="trk-pts"><b className="ta" style={{ animationName: a.rankA }}>812.000</b><b className="ta" style={{ animationName: a.rankB }}>902.000</b></span>
      </div>
      <div className="tfeats" style={{ bottom: 0 }}>
        <Feature c={G.gold} I={Medal} text="Insignias" />
        <Feature c={G.orange} I={Ghost} text="Eventos de temporada" />
        <Feature c={G.purple} I={Gift} text="Códigos" />
      </div>
    </Demo>
  )
}

// ─── Páginas ─────────────────────────────────────────────────────────────────
const Podium = ({ size = 20, strokeWidth = 2.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" aria-hidden>
    <path d="M8.5 21V8h7v13M2.5 21v-8h6M15.5 21v-5h6v5M1.5 21h21" />
  </svg>
)

const PAGES = [
  { I: Move, c: G.blue, t: 'Arrastra y coloca', b: 'Arrastra una pieza de la bandeja al tablero. Tócala antes para girarla 90°.', D: DragDemo, ch: ['ARRASTRA', 'y coloca'], ms: 8800 },
  { I: Rows3, c: G.gold, t: 'Líneas y combos', b: 'Llena una fila o una columna y desaparece. Limpia varias a la vez o seguidas para encadenar combos: más puntos y más XP.', D: LinesDemo, ch: ['LLENA', 'filas y columnas'], ms: 9200 },
  { I: Bookmark, c: G.mint, t: 'Guarda una pieza', b: 'Mantén pulsada una pieza para mandarla a GUARDAR. Toca GUARDAR cuando quieras usarla.', D: HoldDemo, ch: ['GUARDA', 'una pieza'], ms: 10400 },
  { I: Zap, c: G.purple, t: 'Poderes', b: 'Cada partida empiezas con poderes gratis. Úsalos cuando el tablero se complique.', D: PowersDemo, ch: ['5 PODERES', 'para salvarte'], ms: 9500 },
  { I: Gamepad2, c: G.pink, t: 'Modos de juego', b: 'Cinco formas de jugar: elige la tuya cada vez.', D: ModesDemo, ch: ['ELIGE', 'tu modo'], ms: 7000 },
  { I: Gift, c: G.orange, t: 'Progreso y premios', b: 'Cada partida da XP: sube hasta el nivel 100, sigue la ruta de nivel, completa logros por escalones y abre cofres.', D: ProgressDemo, ch: ['SUBE', 'de nivel'], ms: 9000 },
  { I: Podium, c: G.cyan, t: 'Compite', b: 'Ranking mundial y de tu país, semanal e histórico. Luce tu insignia, entra a los eventos de temporada y canjea códigos en Ajustes.', D: CompeteDemo, ch: ['COMPITE', 'con todos'], ms: 12000 },
]
const LAST = PAGES.length - 1

export function HowToPlay() {
  const [page, setPage] = useState(0)
  const [dir, setDir] = useState(1)
  const [auto, setAuto] = useState(true)
  const [hover, setHover] = useState(false)
  const [inView, setInView] = useState(false)
  const reduced = useReducedMotion()
  const sheetRef = useRef(null)
  const swipe = useRef(null)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.intersectionRatio >= 0.5), { threshold: [0, 0.5, 1] })
    io.observe(sheetRef.current)
    return () => io.disconnect()
  }, [])

  const running = auto && inView && !hover && !reduced
  useEffect(() => {
    if (!running) return
    const id = setTimeout(() => { setDir(1); setPage((p) => (p + 1) % PAGES.length) }, PAGES[page].ms)
    return () => clearTimeout(id)
  }, [running, page])

  const go = (to) => {
    setAuto(false)
    if (to < 0 || to > LAST || to === page) return
    setDir(to > page ? 1 : -1)
    setPage(to)
  }
  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(page + 1) }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(page - 1) }
    else if (e.key === 'Home') { e.preventDefault(); go(0) }
    else if (e.key === 'End') { e.preventDefault(); go(LAST) }
  }
  const onDown = (e) => { swipe.current = { x: e.clientX, y: e.clientY } }
  const onUp = (e) => {
    const s = swipe.current
    swipe.current = null
    if (!s) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) go(page + (dx < 0 ? 1 : -1))
  }

  const P = PAGES[page]
  const enter = reduced ? { opacity: 0 } : { opacity: 0, transform: `translateX(${dir * 36}px)` }
  return (
    <section id="como-jugar" className="sec-how">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Igualito que en la app</span>
          <h2 className="display">CÓMO <span className="shimmer" style={{ color: 'var(--green)' }}>JUGAR</span></h2>
          <p className="sub">El tutorial de Blokku en 7 pasos. Desliza, usa las flechas o tu teclado.</p>
        </Reveal>

        <div className="tut-layout">
          <ol className="tut-chapters" aria-label="Pasos del tutorial">
            {PAGES.map((p, i) => (
              <li key={i}>
                <button type="button" className={i === page ? 'on' : ''} style={{ '--c': p.c }} onClick={() => go(i)} aria-current={i === page ? 'step' : undefined}>
                  <span className="tut-ch-n">{i + 1}</span>
                  <span className="tut-ch-t"><strong>{p.ch[0]}</strong><small>{p.ch[1]}</small></span>
                  {i === page && running && <i key={page} className="tut-prog" style={{ '--ms': `${p.ms}ms` }} />}
                </button>
              </li>
            ))}
          </ol>

          <Reveal y={40}>
            <div
              ref={sheetRef}
              className="tut-sheet"
              role="region"
              aria-roledescription="carrusel"
              aria-label="Tutorial de Blokku"
              tabIndex={0}
              onKeyDown={onKey}
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
              onPointerLeave={() => setHover(false)}
            >
              <div className="tut-top">
                <div className="tut-dots">
                  {PAGES.map((p, i) => (
                    <button key={i} type="button" className={i === page ? 'on' : i < page ? 'past' : ''} onClick={() => go(i)} aria-label={`Paso ${i + 1}: ${p.t}`} aria-current={i === page ? 'step' : undefined} />
                  ))}
                </div>
                <a className="tut-skip" href="#demo">Saltar</a>
              </div>

              <div className="tut-swipe" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { swipe.current = null }}>
                <motion.div key={page} className="tut-page" initial={enter} animate={{ opacity: 1, transform: 'translateX(0px)' }} transition={{ duration: 0.32, ease: [0.42, 0, 0.58, 1] }}>
                  <div className="tut-demo" style={{ '--tint': P.c }} aria-hidden>
                    <P.D />
                  </div>
                  <div className="tut-text" aria-live="polite">
                    <h3><Tile c={P.c} I={P.I} size={38} tilt={page % 2 ? 6 : -6} /> {P.t}</h3>
                    <p>{P.b}</p>
                  </div>
                </motion.div>
              </div>

              <div className="tut-nav">
                {page > 0 ? <button type="button" className="tut-back" onClick={() => go(page - 1)}>Atrás</button> : <span />}
                {page < LAST ? (
                  <button type="button" className="tut-btn" style={{ '--c': P.c }} onClick={() => go(page + 1)}>
                    <ArrowRight size={20} strokeWidth={3} /> Siguiente
                  </button>
                ) : (
                  <a className="tut-btn" style={{ '--c': G.pink }} href="#demo" onClick={() => setAuto(false)}>
                    <Play size={18} strokeWidth={3} fill="currentColor" /> ¡A jugar!
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
        <p className="tut-store">
          ¿Ya le agarraste? <a href={STORE_URL} target="_blank" rel="noopener noreferrer"><Download size={15} strokeWidth={3} /> Descarga Blokku gratis</a>
        </p>
      </div>
    </section>
  )
}
