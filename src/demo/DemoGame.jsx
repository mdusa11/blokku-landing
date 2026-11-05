import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RotateCcw, Play, Trophy, Zap, Pointer, Check } from 'lucide-react'
import { PlayBadge, AppStoreBadge, isIOS } from '../extras.jsx'
import { THEMES, THEME, gemVars, loadFx } from './themes.js'
import { Fx, classicFx } from './fx-core.js'
import { GlyphDefs, Glyph } from './Glyphs.jsx'
import './demo.css'

/* ═══ DEMO JUGABLE ════════════════════════════════════════════════════════════
   Tablero en DOM (64 celdas con CSS, solo transform/opacity animados) y efectos
   en un único <canvas> que solo corre mientras hay partículas. El arrastre mueve
   la pieza por ref (sin re-render por cuadro); React solo se entera cuando la
   sombra cambia de casilla. */

const N = 8
const BASE = import.meta.env.BASE_URL
const MASCOT = { feliz: 'feliz', celebrando: 'celebrando', preocupado: 'preocupado', triste: 'triste' }

const SHAPES = [
  [[1]], [[1, 1]], [[1], [1]], [[1, 1, 1]], [[1], [1], [1]],
  [[1, 1], [1, 1]], [[1, 1, 1, 1]], [[1], [1], [1], [1]],
  [[1, 0], [1, 0], [1, 1]], [[0, 1], [0, 1], [1, 1]], [[1, 1, 1], [1, 0, 0]], [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 1], [0, 1, 0]], [[0, 1, 0], [1, 1, 1]], [[1, 1], [1, 0]], [[1, 1], [0, 1]], [[1, 0], [1, 1]],
  [[1, 1, 0], [0, 1, 1]], [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1], [1, 1], [1, 1]], [[1, 1, 1], [1, 1, 1]],
]
const WEIGHTS = [3, 5, 5, 6, 6, 6, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 2, 2]
const WSUM = WEIGHTS.reduce((a, b) => a + b, 0)

const TIERS = [
  { at: 2, label: '¡BIEN!', ramp: ['#7DD3FC', '#7DD3FC'] },
  { at: 3, label: '¡GENIAL!', ramp: ['#86EFAC', '#22C55E'] },
  { at: 5, label: '¡INCREÍBLE!', ramp: ['#FDE68A', '#F59E0B'], rays: true },
  { at: 7, label: '¡BRUTAL!', ramp: ['#FDBA74', '#EF4444'], rays: true },
  { at: 10, label: '¡LEYENDA!', ramp: ['#F0ABFC', '#A855F7'], rays: true },
]
const MULTI = ['', '', '¡DOBLE!', '¡TRIPLE!', '¡CUÁDRUPLE!', '¡QUÍNTUPLE!', '¡SÉXTUPLE!']
const CHEERS = ['¡Eso!', '¡Wow!', '¡Qué crack!', '¡Así se hace!']

let uid = 1
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d } catch { return d } },
  set(k, v) { try { localStorage.setItem(k, v) } catch { /* sin almacenamiento */ } },
}

const randShape = () => {
  let r = Math.random() * WSUM
  for (let i = 0; i < SHAPES.length; i++) if ((r -= WEIGHTS[i]) < 0) return SHAPES[i]
  return SHAPES[0]
}
const newPiece = (shape = randShape(), k = (Math.random() * 8) | 0) => ({ id: uid++, shape, k })

const canPlace = (grid, shape, r0, c0) => {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[0].length; c++) {
      if (!shape[r][c]) continue
      const rr = r0 + r, cc = c0 + c
      if (rr < 0 || cc < 0 || rr >= N || cc >= N || grid[rr * N + cc]) return false
    }
  return true
}
const fitsAnywhere = (grid, shape) => {
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (canPlace(grid, shape, r, c)) return true
  return false
}
const fullLines = (g) => {
  const rows = [], cols = []
  for (let i = 0; i < N; i++) {
    let rf = true, cf = true
    for (let j = 0; j < N; j++) { if (!g[i * N + j]) rf = false; if (!g[j * N + i]) cf = false }
    if (rf) rows.push(i)
    if (cf) cols.push(i)
  }
  return { rows, cols }
}
// Como la app: la bandeja nueva trae al menos una pieza que cabe.
const refill = (grid) => {
  let set
  for (let t = 0; t < 12; t++) {
    set = [newPiece(), newPiece(), newPiece()]
    if (set.some((p) => fitsAnywhere(grid, p.shape))) break
  }
  return set
}

// Apertura guionada: la primera pieza revienta una línea al instante.
const OPENING = [
  '........',
  '........',
  '........',
  '.......a',
  'b......a',
  'bc....dd',
  'ec...fgd',
  'ec...fhh',
]
const openingGrid = () => {
  const ks = { a: 6, b: 1, c: 0, d: 4, e: 3, f: 2, g: 5, h: 7 }
  return OPENING.join('').split('').map((ch) => (ch === '.' ? null : { k: ks[ch], id: uid++, born: 0 }))
}
const openingPieces = () => [newPiece([[1, 1, 1]], 5), newPiece([[1, 1], [1, 1]], 1), newPiece([[1, 0], [1, 0], [1, 1]], 2)]

export default function DemoGame() {
  const reduced = useMemo(reducedMotion, [])
  const [themeId, setThemeId] = useState(() => (THEME[store.get('blokku_demo_theme', 'clasico')] ? store.get('blokku_demo_theme', 'clasico') : 'clasico'))
  const theme = THEME[themeId]
  const vars = useMemo(() => theme.colors.map(gemVars), [theme])
  const fxMod = useRef({})

  const [grid, setGrid] = useState(openingGrid)
  const [pieces, setPieces] = useState(openingPieces)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(store.get('blokku_demo_best', 0)) || 0)
  const bestAtStart = useRef(best)
  const [streak, setStreak] = useState(0)
  const [phase, setPhase] = useState('intro') // intro | play | ending | over
  const [clearing, setClearing] = useState(null) // Map idx -> delay(s)
  const [beams, setBeams] = useState([])
  const [floats, setFloats] = useState([])
  const [card, setCard] = useState(null)
  const [mood, setMood] = useState('feliz')
  const [bubble, setBubble] = useState({ id: 0, text: '¡Arrastra una pieza!' })
  const [dragIdx, setDragIdx] = useState(-1)
  const [ghost, setGhost] = useState(null)
  const [entered, setEntered] = useState(reduced)
  const [wave, setWave] = useState({ n: 0, seq: 0 })
  const [geo, setGeo] = useState({ cell: 38, tray: 20 })
  const [hand, setHand] = useState(null)
  const [record, setRecord] = useState(false)

  const screenRef = useRef(null), frameRef = useRef(null), gridRef = useRef(null)
  const canvasRef = useRef(null), fxRef = useRef(null), floatRef = useRef(null)
  const slotRefs = useRef([]), scoreRef = useRef(null), shown = useRef(0)
  const drag = useRef(null), timers = useRef(new Set())
  const seq = useRef(1)

  const later = useCallback((fn, ms) => {
    const t = setTimeout(() => { timers.current.delete(t); fn() }, ms)
    timers.current.add(t)
  }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  /* efecto del estilo: se descarga solo al elegirlo */
  useEffect(() => {
    store.set('blokku_demo_theme', themeId)
    loadFx(themeId).then((f) => { fxMod.current[themeId] = f })
  }, [themeId])

  /* canvas + medidas */
  useLayoutEffect(() => {
    const scr = screenRef.current
    const lowEnd = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 500
    const fx = new Fx(canvasRef.current, { reduced, lowEnd })
    fxRef.current = fx
    const measure = () => {
      const r = scr.getBoundingClientRect()
      fx.resize(r.width, r.height)
      const g = gridRef.current.getBoundingClientRect()
      const cell = g.width / N
      const slotW = g.width / 3
      setGeo({ cell, tray: Math.min(cell * 0.56, (slotW - 14) / 4) })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(scr)
    return () => { ro.disconnect(); fx.destroy() }
  }, [reduced])

  /* entrada: la sección aparece → cascada de gemas */
  useEffect(() => {
    if (entered) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setEntered(true); io.disconnect() }
    }, { threshold: 0.35 })
    io.observe(screenRef.current)
    return () => io.disconnect()
  }, [entered])
  useEffect(() => { if (entered) setWave({ n: 1, seq: seq.current }) }, [entered])

  const pickTheme = useCallback((id) => {
    if (id === themeId) return
    setThemeId(id)
    setWave((w) => ({ n: w.n + 1, seq: seq.current }))
    setBubble({ id: Date.now(), text: id === 'clasico' ? '¡El de siempre!' : `¡${THEME[id].name}!` })
  }, [themeId])

  /* marcador que sube */
  useEffect(() => {
    const el = scoreRef.current
    if (!el) return
    const from = shown.current, to = score
    if (from === to) { el.textContent = to.toLocaleString('es-MX'); return }
    if (reduced || to < from) { shown.current = to; el.textContent = to.toLocaleString('es-MX'); return }
    const t0 = performance.now(), dur = 520
    let raf
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur)
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)))
      shown.current = v
      el.textContent = v.toLocaleString('es-MX')
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    el.animate?.([{ transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.3,1.6,.5,1)' })
    return () => cancelAnimationFrame(raf)
  }, [score, reduced])

  const say = useCallback((text) => setBubble({ id: Date.now() + Math.random(), text }), [])

  /* ── colocar ── */
  const place = useCallback((idx, r0, c0) => {
    const p = pieces[idx]
    if (!p || phase === 'ending' || phase === 'over' || clearing) return false
    if (!canPlace(grid, p.shape, r0, c0)) return false
    const g = grid.slice()
    const born = ++seq.current
    let placed = 0
    p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) { g[(r0 + r) * N + c0 + c] = { k: p.k, id: uid++, born }; placed++ } }))
    const { rows, cols } = fullLines(g)
    const n = rows.length + cols.length
    let next = pieces.map((q, i) => (i === idx ? null : q))

    let gained = placed * 10
    let st = streak
    if (n) {
      st = streak + 1
      gained += n * n * st * 100
      const after = g.slice()
      rows.forEach((r) => { for (let c = 0; c < N; c++) after[r * N + c] = null })
      cols.forEach((c) => { for (let r = 0; r < N; r++) after[r * N + c] = null })
      const perfect = after.every((x) => !x)
      if (perfect) gained += 1000
      if (next.every((x) => !x)) next = refill(after)
      runClear(g, after, rows, cols, p, r0, c0, st, gained, perfect)
    } else {
      st = 0
      if (next.every((x) => !x)) next = refill(g)
    }
    setStreak(st)
    setGrid(g)
    setPieces(next)
    setPhase('play')
    setHand(null)
    setScore((s) => {
      const ns = s + gained
      if (ns > best) { setBest(ns); store.set('blokku_demo_best', String(ns)) }
      if (ns > bestAtStart.current && bestAtStart.current > 0 && !record) {
        setRecord(true)
        say('¡Nuevo récord!')
      }
      return ns
    })
    return true
    // runClear se define abajo con las mismas dependencias
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pieces, grid, streak, phase, clearing, best, record, themeId])

  /* ── reventar líneas: tiempos parecidos a la app (flash → limpieza) ── */
  function runClear(g, after, rows, cols, p, r0, c0, st, gained, perfect) {
    const n = rows.length + cols.length
    const oc = c0 + p.shape[0].length / 2 - 0.5, or = r0 + p.shape.length / 2 - 0.5
    const map = new Map()
    rows.forEach((r) => { for (let c = 0; c < N; c++) map.set(r * N + c, Math.min(map.get(r * N + c) ?? 9, Math.abs(c - oc) * 0.028)) })
    cols.forEach((c) => { for (let r = 0; r < N; r++) map.set(r * N + c, Math.min(map.get(r * N + c) ?? 9, Math.abs(r - or) * 0.028)) })
    const slow = st >= 3 ? 0.16 : 0
    setClearing(map)

    const scr = screenRef.current.getBoundingClientRect()
    const gr = gridRef.current.getBoundingClientRect()
    const cell = gr.width / N
    const ox = gr.left - scr.left, oy = gr.top - scr.top
    const cells = [...map].map(([i, dl]) => {
      const rr = (i / N) | 0, cc = i % N
      const v = vars[g[i].k]
      return { x: ox + (cc + 0.5) * cell, y: oy + (rr + 0.5) * cell, s: cell, color: theme.colors[g[i].k], dark: v['--b'], delay: 0.09 + slow + dl }
    })
    const lines = [
      ...rows.map((r) => ({ x1: ox, y1: oy + (r + 0.5) * cell, x2: ox + gr.width, y2: oy + (r + 0.5) * cell })),
      ...cols.map((c) => ({ x1: ox + (c + 0.5) * cell, y1: oy + gr.height, x2: ox + (c + 0.5) * cell, y2: oy })),
    ]
    const cx = cells.reduce((a, c) => a + c.x, 0) / cells.length
    const cy = cells.reduce((a, c) => a + c.y, 0) / cells.length
    const ev = {
      cells, lines, n, streak: st, cell, W: scr.width, H: scr.height, colors: theme.colors,
      center: { x: ox + gr.width / 2, y: oy + gr.height / 2 },
      glitch: (lvl) => {
        if (reduced) return
        const el = screenRef.current
        el.classList.remove('glitch-1', 'glitch-2', 'glitch-3')
        void el.offsetWidth
        el.classList.add(`glitch-${lvl}`)
        later(() => el.classList.remove(`glitch-${lvl}`), 420)
      },
    }
    const run = fxMod.current[themeId] || (theme.id === 'clasico' ? classicFx : null)
    later(() => {
      ;(run || classicFx)(fxRef.current, ev)
      // Temblor ligero, solo en jugadas grandes.
      if (!reduced && (n >= 2 || st >= 3)) {
        const a = Math.min(10, 2 + (n - 1) * 2.4 + Math.max(0, st - 2) * 1.2)
        frameRef.current.animate([
          { transform: 'translate(0,0)' }, { transform: `translate(${-a}px,${a * 0.5}px)` },
          { transform: `translate(${a * 0.8}px,${-a * 0.4}px)` }, { transform: `translate(${-a * 0.5}px,${a * 0.3}px)` },
          { transform: `translate(${a * 0.25}px,0)` }, { transform: 'translate(0,0)' },
        ], { duration: 380, easing: 'ease-out' })
      }
    }, 90 + slow * 1000)

    setBeams(lines.map((_, i) => ({ id: uid++, dir: i < rows.length ? 'r' : 'c', idx: i < rows.length ? rows[i] : cols[i - rows.length], n })))
    const fid = uid++
    setFloats((f) => [...f, { id: fid, x: cx, y: Math.max(cy, oy + gr.height * 0.84), text: `+${gained.toLocaleString('es-MX')}`, big: n >= 2 || st >= 3 }])
    later(() => setFloats((f) => f.filter((x) => x.id !== fid)), 1200)

    const tier = [...TIERS].reverse().find((t) => st >= t.at)
    const head = perfect ? '¡TABLERO LIMPIO!' : n >= 4 && theme.sign ? null : MULTI[Math.min(n, 6)]
    if (tier || head || (n >= 4 && theme.sign)) {
      setCard({ id: uid++, tier, streak: st, head, sign: n >= 4 && theme.sign ? theme.sign : null })
      later(() => setCard(null), 1500)
    }
    setMood('celebrando')
    say(st >= 3 ? '¡Imparable!' : n >= 2 ? '¡Increíble!' : CHEERS[(Math.random() * CHEERS.length) | 0])
    later(() => setMood('feliz'), 1500)

    const total = 90 + slow * 1000 + Math.max(...map.values()) * 1000 + 380
    later(() => { setGrid(after); setClearing(null); setBeams([]) }, total)
  }

  /* ── tras cada jugada: ¿peligro o fin? ── */
  useEffect(() => {
    if (clearing || phase === 'ending' || phase === 'over' || phase === 'intro') return
    const live = pieces.filter(Boolean)
    const fits = live.filter((p) => fitsAnywhere(grid, p.shape)).length
    if (live.length && !fits) {
      setPhase('ending')
      setMood('triste')
      later(() => setPhase('over'), reduced ? 50 : 900)
      return
    }
    const fill = grid.filter(Boolean).length / (N * N)
    const danger = fill >= 0.56 || (fits <= 1 && live.length > 1 && fill >= 0.4)
    setMood((m) => (m === 'celebrando' ? m : danger ? 'preocupado' : 'feliz'))
    if (danger) say('¡Cuidado!')
  }, [grid, pieces, clearing, phase, later, reduced, say])

  const reset = () => {
    timers.current.forEach(clearTimeout); timers.current.clear()
    fxRef.current?.clear()
    bestAtStart.current = best
    setGrid(Array(N * N).fill(null)); setPieces(refill(Array(N * N).fill(null)))
    setScore(0); setStreak(0); setPhase('play'); setClearing(null); setBeams([]); setFloats([]); setCard(null)
    setMood('feliz'); setRecord(false); setHand(null); say('¡A darle!')
    setWave((w) => ({ n: w.n + 1, seq: seq.current }))
  }

  /* ── mano guía en reposo ── */
  useLayoutEffect(() => {
    if (phase !== 'intro' || !entered || reduced) { setHand(null); return }
    const t = setTimeout(() => {
      const s = slotRefs.current[0], scr = screenRef.current, g = gridRef.current
      if (!s || !scr || !g) return
      const a = s.getBoundingClientRect(), b = scr.getBoundingClientRect(), gr = g.getBoundingClientRect()
      const cell = gr.width / N
      setHand({ fx: a.left + a.width / 2 - b.left, fy: a.top + a.height / 2 - b.top, tx: gr.left - b.left + 3.5 * cell, ty: gr.top - b.top + 7.5 * cell })
    }, 900)
    return () => clearTimeout(t)
  }, [phase, entered, reduced, geo])

  /* ── arrastre ── */
  const anchorAt = (x, y, shape, touch) => {
    const g = gridRef.current.getBoundingClientRect()
    const cell = g.width / N
    const w = shape[0].length * cell, h = shape.length * cell
    const left = x - w / 2
    const top = touch ? y - h - cell * 1.2 : y - h / 2
    return { left, top, r: Math.round((top - g.top) / cell), c: Math.round((left - g.left) / cell) }
  }
  const ghostFor = (shape, k, r, c) => {
    if (!canPlace(grid, shape, r, c)) return null
    const cells = new Set()
    const g2 = grid.slice()
    shape.forEach((row, rr) => row.forEach((v, cc) => { if (v) { const i = (r + rr) * N + c + cc; cells.add(i); g2[i] = 1 } }))
    const { rows, cols } = fullLines(g2)
    const hot = new Set()
    rows.forEach((rr) => { for (let cc = 0; cc < N; cc++) hot.add(rr * N + cc) })
    cols.forEach((cc) => { for (let rr = 0; rr < N; rr++) hot.add(rr * N + cc) })
    return { cells, hot, k, key: `${r},${c}` }
  }
  const moveFloat = (x, y) => {
    const d = drag.current
    if (!d) return
    const a = anchorAt(x, y, d.shape, d.touch)
    if (floatRef.current) floatRef.current.style.transform = `translate3d(${a.left}px,${a.top}px,0)`
    const key = `${a.r},${a.c}`
    if (key !== d.key) {
      d.key = key
      const gh = ghostFor(d.shape, d.k, a.r, a.c)
      d.target = gh ? a : null
      setGhost(gh)
    }
  }
  const onDown = (idx) => (e) => {
    const p = pieces[idx]
    if (!p || phase === 'ending' || phase === 'over' || clearing) return
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { idx, shape: p.shape, k: p.k, touch: e.pointerType !== 'mouse', key: null, target: null, x: e.clientX, y: e.clientY }
    setDragIdx(idx)
    setHand(null)
    requestAnimationFrame(() => moveFloat(e.clientX, e.clientY))
  }
  const onMove = (e) => {
    const d = drag.current
    if (!d) return
    d.x = e.clientX; d.y = e.clientY
    if (!d.raf) d.raf = requestAnimationFrame(() => { d.raf = 0; moveFloat(d.x, d.y) })
  }
  const onUp = () => {
    const d = drag.current
    if (!d) return
    cancelAnimationFrame(d.raf)
    drag.current = null
    const ok = d.target && place(d.idx, d.target.r, d.target.c)
    setGhost(null)
    if (ok || !floatRef.current || reduced) { setDragIdx(-1); return }
    // regresa a la bandeja
    const s = slotRefs.current[d.idx]?.getBoundingClientRect()
    const el = floatRef.current
    if (!s) { setDragIdx(-1); return }
    const w = el.offsetWidth, h = el.offsetHeight
    const anim = el.animate([{ transform: el.style.transform }, { transform: `translate3d(${s.left + s.width / 2 - w / 2}px,${s.top + s.height / 2 - h / 2}px,0) scale(.5)` }], { duration: 200, easing: 'ease-in' })
    anim.onfinish = () => setDragIdx(-1)
  }

  /* ── API de pruebas (solo con ?demotest) ── */
  useEffect(() => {
    if (!location.search.includes('demotest')) return
    window.__bkDemo = {
      load(rows, shapes) {
        setGrid(rows.join('').split('').map((ch) => (ch === '.' ? null : { k: Number(ch), id: uid++, born: 0 })))
        setPieces(shapes.map(([s, k]) => (s ? newPiece(s, k) : null)))
        setPhase('play'); setHand(null)
      },
      place: (i, r, c) => place(i, r, c),
      theme: (id) => pickTheme(id),
      streak: (n) => setStreak(n),
    }
  })

  const danger = mood === 'preocupado'
  const dragPiece = dragIdx >= 0 ? pieces[dragIdx] : null
  const tierNow = [...TIERS].reverse().find((t) => streak >= t.at)

  return (
    <div className={`dg-layout${entered ? '' : ' pre'}`}>
      <AllGlyphDefs />

      <ThemePicker themeId={themeId} onPick={pickTheme} />

      <div className="dg-col">
        <div
          ref={screenRef}
          className={`dg-screen th-${themeId}${danger ? ' danger' : ''}${phase === 'ending' || phase === 'over' ? ' ended' : ''}`}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Demo jugable de Blokku: arrastra las piezas al tablero"
        >
          <ThemeBg id={themeId} />

          {/* HUD */}
          <div className="dg-hud">
            <div className={`dg-best${record ? ' is-rec' : ''}`}>
              <span className="dg-best-ic"><Trophy size={14} strokeWidth={2.6} /></span>
              {record ? '¡RÉCORD!' : `RÉCORD ${best.toLocaleString('es-MX')}`}
            </div>
            <div className="dg-score display" ref={scoreRef} aria-live="polite">0</div>
            <div className="dg-combo-slot">
              {streak >= 2 && (
                <div className="dg-combo" key={streak} style={{ '--c1': tierNow?.ramp[0] ?? '#ffd54f' }}>
                  <span className="dg-combo-ic"><Zap size={14} strokeWidth={2.8} fill="currentColor" /></span>
                  COMBO ×{streak}
                </div>
              )}
            </div>
            <button className="dg-reset" onClick={reset} aria-label="Reiniciar partida"><RotateCcw size={20} strokeWidth={2.6} /></button>
          </div>

          {/* Tablero */}
          <div className="dg-boardwrap">
            <div className={`dg-blokki m-${mood}`} key={mood === 'celebrando' ? `c${bubble.id}` : mood}>
              <img src={`${BASE}media/blokki/${MASCOT[mood]}.webp`} alt="" width="120" height="120" draggable="false" />
            </div>
            {bubble.text && phase !== 'over' && streak < 2 && (
              <div className="dg-bubble" key={bubble.id}>{bubble.text}</div>
            )}
            <div className="dg-frame" ref={frameRef}>
              <i className="dg-stud s1" /><i className="dg-stud s2" /><i className="dg-stud s3" /><i className="dg-stud s4" />
              <div className="dg-board">
                <div className="dg-grid" ref={gridRef}>
                  {grid.map((cell, i) => {
                    const gh = ghost?.cells.has(i)
                    const dl = clearing?.get(i)
                    const r = (i / N) | 0, c = i % N
                    let cls = 'g'
                    if (cell) cls += cell.born > wave.seq ? ' pop' : wave.n ? ' in' : ''
                    if (dl !== undefined) cls += ' clr'
                    else if (ghost?.hot.has(i)) cls += ' hot'
                    if (phase === 'ending' || phase === 'over') cls += ' dead'
                    return (
                      <div key={i} className="c">
                        {cell && (
                          <div
                            key={`${cell.id}-${wave.n}`}
                            className={cls}
                            style={{ ...vars[cell.k], '--dl': `${dl ?? 0}s`, '--w': `${(r + c) * 0.026}s`, '--rw': `${r * 0.07}s` }}
                          >
                            {theme.glyphs && <Glyph theme={themeId} i={cell.k} />}
                          </div>
                        )}
                        {!cell && gh && (
                          <div className={`gh${ghost.hot.size ? ' gh-hot' : ''}`} style={vars[ghost.k]} />
                        )}
                      </div>
                    )
                  })}
                  {beams.map((b) => (
                    <div key={b.id} className={`dg-beam ${b.dir}`} style={{ '--i': b.idx, '--beam': theme.beam, '--n': b.n }} />
                  ))}
                </div>
              </div>
              {card && <ComboCard key={card.id} card={card} />}
            </div>
          </div>

          {/* Bandeja */}
          <div className="dg-tray">
            {pieces.map((p, idx) => {
              const fits = p && fitsAnywhere(grid, p.shape)
              return (
                <div
                  key={idx}
                  ref={(el) => { slotRefs.current[idx] = el }}
                  className={`dg-slot${p && !fits ? ' nofit' : ''}${dragIdx === idx ? ' lifted' : ''}`}
                  onPointerDown={p ? onDown(idx) : undefined}
                  role={p ? 'button' : undefined}
                  aria-label={p ? `Pieza ${idx + 1}` : undefined}
                >
                  {p && (
                    <div className="dg-pc" key={`${p.id}-${wave.n}`} style={{ '--d': `${idx * 0.08}s` }}>
                      <PieceView piece={p} size={geo.tray} vars={vars} theme={theme} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <canvas ref={canvasRef} className="dg-fx" aria-hidden />

          {floats.map((f) => (
            <div key={f.id} className={`dg-float display${f.big ? ' big' : ''}`} style={{ left: f.x, top: f.y }}>{f.text}</div>
          ))}

          {hand && (
            <div className="dg-hand" style={{ '--fx': `${hand.fx}px`, '--fy': `${hand.fy}px`, '--tx': `${hand.tx}px`, '--ty': `${hand.ty}px` }} aria-hidden>
              <div className="dg-hand-pc"><PieceView piece={pieces[0] ?? openingPieces()[0]} size={geo.cell} vars={vars} theme={theme} /></div>
              <Pointer className="dg-hand-ic" size={34} strokeWidth={2} fill="#fff" />
            </div>
          )}

          {phase === 'over' && (
            <GameOver score={score} isRecord={score > bestAtStart.current && bestAtStart.current > 0} onAgain={reset} />
          )}
        </div>
        <p className="dg-hint">Arrastra las piezas · completa filas o columnas para reventarlas</p>
      </div>

      {dragPiece && createPortal(
        <div ref={floatRef} className="dg-floatpc" style={{ transform: 'translate3d(-999px,-999px,0)' }} aria-hidden>
          <div className="dg-floatpc-in">
            <PieceView piece={dragPiece} size={geo.cell} vars={vars} theme={theme} lifted />
          </div>
        </div>,
        document.body,
      )}
    </div>
  )
}

function PieceView({ piece, size, vars, theme, lifted }) {
  return (
    <div className={`dg-piece th-${theme.id}${lifted ? ' lifted' : ''}`} style={{ gridTemplateColumns: `repeat(${piece.shape[0].length}, ${size}px)`, gridAutoRows: `${size}px` }}>
      {piece.shape.flatMap((row, r) => row.map((v, c) => (
        <div key={`${r}-${c}`} className="c">
          {v ? <div className="g" style={vars[piece.k]}>{theme.glyphs && <Glyph theme={theme.id} i={piece.k} />}</div> : null}
        </div>
      )))}
    </div>
  )
}

function ComboCard({ card }) {
  const t = card.tier
  return (
    <div className={`dg-card${card.sign ? ' has-sign' : ''}`} aria-live="polite">
      {t?.rays && <div className="dg-rays" style={{ '--rc': t.ramp[1] }} />}
      {card.sign && <div className="dg-sign display">{card.sign.split('').map((ch, i) => <span key={i} style={{ '--i': i }}>{ch}</span>)}</div>}
      {card.head && <div className="dg-head display">{card.head}</div>}
      {t && !card.sign && (
        <>
          <div className="dg-num display" style={{ '--r0': t.ramp[0], '--r1': t.ramp[1] }}>×{card.streak}</div>
          <div className="dg-tier display" style={{ color: t.ramp[1] }}>{t.label}</div>
        </>
      )}
    </div>
  )
}

function GameOver({ score, isRecord, onAgain }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (reducedMotion()) { el.textContent = score.toLocaleString('es-MX'); return }
    const t0 = performance.now()
    let raf
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 900)
      el.textContent = Math.round(score * (1 - Math.pow(1 - k, 3))).toLocaleString('es-MX')
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [score])
  return (
    <div className="dg-over" role="dialog" aria-label="Fin de la partida">
      <img className="dg-over-blokki" src={`${BASE}media/blokki/${isRecord ? 'celebrando' : 'triste'}.webp`} alt="" width="110" height="110" />
      <div className="dg-over-title display">{isRecord ? '¡NUEVO RÉCORD!' : '¡SE ACABÓ!'}</div>
      <div className="dg-over-score display" ref={ref}>0</div>
      <div className="dg-over-pts">puntos</div>
      <p className="dg-over-cta"><strong>¿Puedes más?</strong> Descarga Blokku gratis: 4 modos, poderes, retos diarios y todos estos estilos.</p>
      <div className="dg-over-badges">{isIOS ? <><AppStoreBadge /><PlayBadge /></> : <><PlayBadge /><AppStoreBadge /></>}</div>
      <button className="btn3d ghost dg-over-again" onClick={onAgain}><Play size={16} strokeWidth={3} fill="currentColor" /> Jugar otra vez</button>
    </div>
  )
}

function ThemeBg({ id }) {
  // Decorado del fondo por estilo: solo CSS (transform/opacity en bucle).
  return (
    <div className={`dg-bg bg-${id}`} aria-hidden>
      {id === 'clasico' && <><span className="orb o1" /><span className="orb o2" /></>}
      {id === 'blokki' && <><span className="cloud k1" /><span className="cloud k2" /><span className="cloud k3" /><span className="sun" /><span className="hills" /></>}
      {id === 'espacio' && <><span className="stars s1" /><span className="stars s2" /><span className="planet" /><span className="sat" /></>}
      {id === 'neon' && <><span className="skyline" /><span className="floor"><span className="lines" /></span><span className="scan" /></>}
      {id === 'carnaval' && <><span className="bunting" /><span className="lights" /><span className="lights l2" /><span className="spot" /></>}
      {id === 'dragon' && <><span className="peaks" /><span className="lava" /><span className="embers e1" /><span className="embers e2" /></>}
    </div>
  )
}

// Lo que no cambia en cada jugada no se vuelve a renderizar.
const AllGlyphDefs = memo(function AllGlyphDefs() {
  return THEMES.map((t) => <GlyphDefs key={t.id} theme={t.id} />)
})
const PICKER_VARS = Object.fromEntries(THEMES.map((t) => [t.id, t.colors.map(gemVars)]))

const ThemePicker = memo(function ThemePicker({ themeId, onPick }) {
  return (
    <div className="dg-picker">
      <div className="dg-picker-title display">ELIGE UN ESTILO</div>
      <div className="dg-picker-list" role="radiogroup" aria-label="Estilo del tablero">
        {THEMES.map((t) => {
          const v = PICKER_VARS[t.id]
          return (
            <button
              key={t.id}
              role="radio"
              aria-checked={t.id === themeId}
              className={`dg-chip${t.id === themeId ? ' on' : ''}`}
              onClick={() => onPick(t.id)}
              onPointerEnter={() => loadFx(t.id)}
            >
              <span className={`dg-sw th-${t.id}`}>
                {[0, 1, 2, 6].map((k) => (
                  <span key={k} className="g" style={v[k]}>{t.glyphs && <Glyph theme={t.id} i={k} />}</span>
                ))}
              </span>
              <span className="dg-chip-txt">
                <span className="dg-chip-name">{t.name}</span>
                <span className={`dg-tag t-${t.tagKind}`}>{t.tag}</span>
              </span>
              {t.id === themeId && <span className="dg-chip-ok"><Check size={13} strokeWidth={3.4} /></span>}
            </button>
          )
        })}
      </div>
      <p className="dg-picker-note">Así se ven algunos paquetes de la app: cada uno trae su tablero, su marco y su efecto al reventar líneas.</p>
    </div>
  )
})
