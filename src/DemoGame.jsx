import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RotateCcw, Play, Download } from 'lucide-react'
import { COLORS, rng } from './bits.jsx'

/* ═══ DEMO JUGABLE — mini Blokku en el navegador ══════════════════════════════
   Drag & drop real: la pieza flota ELEVADA sobre el dedo/cursor (como en la
   app), ghost de colocación, clears de filas/columnas con flash + confeti,
   combos y récord en localStorage. Pointer events → funciona touch y mouse. */

const N = 8
const LIFT = 1.6 // celdas de elevación sobre el dedo

const SHAPES = [
  [[1]], [[1, 1]], [[1], [1]], [[1, 1, 1]], [[1], [1], [1]],
  [[1, 1], [1, 1]], [[1, 1, 1, 1]], [[1], [1], [1], [1]],
  [[1, 0], [1, 0], [1, 1]], [[0, 1], [0, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]], [[1, 1], [1, 0]], [[1, 0], [1, 1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]], [[1, 1], [1, 1], [1, 1]],
]

const newPiece = (seed) => ({
  id: Math.random().toString(36).slice(2),
  shape: SHAPES[Math.floor(rng(seed) * SHAPES.length)],
  color: COLORS[Math.floor(rng(seed * 1.7 + 3) * COLORS.length)],
})

const emptyGrid = () => Array(N * N).fill(null)

const canPlace = (grid, shape, r0, c0) => {
  for (let r = 0; r < shape.length; r++)
    for (let c = 0; c < shape[0].length; c++) {
      if (!shape[r][c]) continue
      const rr = r0 + r, cc = c0 + c
      if (rr < 0 || cc < 0 || rr >= N || cc >= N || grid[rr * N + cc]) return false
    }
  return true
}

const anyFits = (grid, pieces) =>
  pieces.some((p) => {
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (canPlace(grid, p.shape, r, c)) return true
    return false
  })

export default function DemoGame() {
  const boardRef = useRef(null)
  const seedRef = useRef(Math.random() * 1000)
  const [grid, setGrid] = useState(emptyGrid)
  const [pieces, setPieces] = useState(() => [1, 2, 3].map((i) => newPiece(Math.random() * 100 + i)))
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => Number(localStorage.getItem('blokku_demo_best') || 0))
  const [combo, setCombo] = useState(0)
  const [drag, setDrag] = useState(null) // {idx, x, y, cell}
  const [flash, setFlash] = useState(new Set())
  const [popup, setPopup] = useState(null) // {text, big}
  const [confetti, setConfetti] = useState([])
  const [over, setOver] = useState(false)
  const [shake, setShake] = useState(0)

  const cellPx = useCallback(() => {
    const el = boardRef.current
    return el ? el.getBoundingClientRect().width / N : 44
  }, [])

  /* anchor (fila/col) desde la posición del dedo — la pieza flota LIFT arriba */
  const anchorFrom = useCallback((x, y, shape) => {
    const el = boardRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const cell = rect.width / N
    const topLeftX = x - (shape[0].length * cell) / 2
    const topLeftY = y - shape.length * cell - LIFT * cell
    const c = Math.round((topLeftX - rect.left) / cell)
    const r = Math.round((topLeftY - rect.top) / cell)
    return { r, c }
  }, [])

  const ghost = useMemo(() => {
    if (!drag) return null
    const p = pieces[drag.idx]
    if (!p) return null
    const a = anchorFrom(drag.x, drag.y, p.shape)
    if (!a || !canPlace(grid, p.shape, a.r, a.c)) return null
    const cells = []
    p.shape.forEach((row, r) => row.forEach((v, c) => v && cells.push((a.r + r) * N + (a.c + c))))
    // ¿limpiaría líneas? → glow dorado
    const g2 = [...grid]
    cells.forEach((i) => (g2[i] = p.color))
    let wouldClear = false
    for (let i = 0; i < N; i++) {
      if (g2.slice(i * N, i * N + N).every(Boolean)) wouldClear = true
      if (Array.from({ length: N }, (_, r) => g2[r * N + i]).every(Boolean)) wouldClear = true
    }
    return { cells, color: p.color, wouldClear }
  }, [drag, pieces, grid, anchorFrom])

  const burst = useCallback((cx, cy) => {
    const parts = Array.from({ length: 26 }, (_, i) => ({
      id: Math.random().toString(36).slice(2),
      x: cx, y: cy,
      dx: (Math.random() - 0.5) * 320,
      dy: -Math.random() * 260 - 60,
      color: COLORS[i % COLORS.length],
      rot: Math.random() * 360,
    }))
    setConfetti((cs) => [...cs, ...parts])
    setTimeout(() => setConfetti((cs) => cs.filter((p) => !parts.includes(p))), 900)
  }, [])

  const drop = useCallback((idx, x, y) => {
    const p = pieces[idx]
    if (!p) return
    const a = anchorFrom(x, y, p.shape)
    if (!a || !canPlace(grid, p.shape, a.r, a.c)) return

    const g = [...grid]
    let placed = 0
    p.shape.forEach((row, r) => row.forEach((v, c) => { if (v) { g[(a.r + r) * N + (a.c + c)] = p.color; placed++ } }))

    // detectar líneas completas
    const rows = [], cols = []
    for (let i = 0; i < N; i++) {
      if (g.slice(i * N, i * N + N).every(Boolean)) rows.push(i)
      if (Array.from({ length: N }, (_, r) => g[r * N + i]).every(Boolean)) cols.push(i)
    }
    const lines = rows.length + cols.length
    const nextPieces = pieces.map((q, i) => (i === idx ? null : q)).filter(Boolean)
    const refill = nextPieces.length ? nextPieces : [1, 2, 3].map((i) => newPiece((seedRef.current += 1.3) + i))

    let gained = placed * 10
    if (lines) {
      const clearSet = new Set()
      rows.forEach((r) => { for (let c = 0; c < N; c++) clearSet.add(r * N + c) })
      cols.forEach((c) => { for (let r = 0; r < N; r++) clearSet.add(r * N + c) })
      const streak = combo + 1
      gained += lines * 100 * streak
      setCombo(streak)
      setFlash(clearSet)
      setShake((s) => s + 1)
      const rect = boardRef.current.getBoundingClientRect()
      burst(rect.width / 2, rect.height / 2)
      setPopup({ text: streak > 1 ? `¡COMBO x${streak}!` : `+${lines * 100}`, big: streak > 1 })
      setTimeout(() => setPopup(null), 950)
      setTimeout(() => {
        setFlash(new Set())
        setGrid((gg) => gg.map((v, i) => (clearSet.has(i) ? null : v)))
      }, 190)
    } else {
      setCombo(0)
    }

    setGrid(g)
    setPieces(refill)
    setScore((s) => {
      const ns = s + gained
      if (ns > best) { setBest(ns); localStorage.setItem('blokku_demo_best', String(ns)) }
      return ns
    })
  }, [pieces, grid, combo, best, anchorFrom, burst])

  /* game over cuando nada cabe (tras el settle del clear) */
  useEffect(() => {
    if (flash.size) return
    if (pieces.length && !anyFits(grid, pieces)) setOver(true)
  }, [grid, pieces, flash])

  const reset = () => {
    seedRef.current = Math.random() * 1000
    setGrid(emptyGrid()); setPieces([1, 2, 3].map((i) => newPiece(Math.random() * 100 + i)))
    setScore(0); setCombo(0); setOver(false)
  }

  /* pointer handlers */
  const onPieceDown = (idx) => (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDrag({ idx, x: e.clientX, y: e.clientY })
  }
  useEffect(() => {
    if (!drag) return
    const move = (e) => setDrag((d) => (d ? { ...d, x: e.clientX, y: e.clientY } : d))
    const up = (e) => { drop(drag.idx, e.clientX, e.clientY); setDrag(null) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up, { once: true })
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [drag, drop])

  const cell = cellPx()
  const dragPiece = drag ? pieces[drag.idx] : null

  return (
    <div className="demo-wrap" style={{ touchAction: 'none', userSelect: 'none', WebkitUserSelect: 'none' }}>
      {/* HUD */}
      <div className="demo-hud">
        <div className="demo-score">
          <span className="demo-score-label"><Trophy size={13} /> RÉCORD {best.toLocaleString('es-MX')}</span>
          <motion.span key={score} className="demo-score-num display" initial={{ scale: 1.35 }} animate={{ scale: 1 }}>
            {score.toLocaleString('es-MX')}
          </motion.span>
        </div>
        <button className="btn3d ghost demo-reset" onClick={reset}><RotateCcw size={16} /> Reiniciar</button>
      </div>

      {/* Tablero */}
      <motion.div
        key={shake}
        initial={{ x: 0 }}
        animate={{ x: [0, -9, 8, -5, 3, 0], y: [0, 5, -4, 3, 0, 0] }}
        transition={{ duration: 0.4 }}
        className="demo-board"
        ref={boardRef}
      >
        {grid.map((color, i) => {
          const isGhost = ghost?.cells.includes(i)
          const flashing = flash.has(i)
          return (
            <div key={i} className="demo-cell">
              {flashing ? (
                <div className="demo-gem demo-flash" />
              ) : color ? (
                <div className="demo-gem gem" style={{ background: `linear-gradient(160deg, ${color}, ${color}cc)` }} />
              ) : isGhost ? (
                <div
                  className="demo-ghost"
                  style={{
                    border: `2.5px solid ${ghost.wouldClear ? '#FFD54F' : ghost.color}`,
                    background: `${ghost.wouldClear ? '#FFD54F' : ghost.color}33`,
                    boxShadow: ghost.wouldClear ? '0 0 18px #FFD54Fcc' : 'none',
                  }}
                />
              ) : null}
            </div>
          )
        })}

        {/* popup de puntos/combo */}
        <AnimatePresence>
          {popup && (
            <motion.div
              className="display demo-popup"
              initial={{ scale: 0.3, opacity: 0, rotate: -8 }}
              animate={{ scale: popup.big ? 1.25 : 1, opacity: 1, rotate: 0, y: -30 }}
              exit={{ opacity: 0, y: -70 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              style={{ color: popup.big ? 'var(--yellow)' : '#fff' }}
            >
              {popup.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* confeti */}
        {confetti.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: p.x, y: p.y, rotate: p.rot, opacity: 1 }}
            animate={{ x: p.x + p.dx, y: p.y + p.dy + 320, rotate: p.rot + 320, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{
              position: 'absolute', left: 0, top: 0, width: 11, height: 11,
              borderRadius: 3, background: p.color, pointerEvents: 'none', zIndex: 6,
            }}
          />
        ))}

        {/* overlay game over */}
        <AnimatePresence>
          {over && (
            <motion.div className="demo-over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.5, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 13 }} className="display demo-over-title">
                ¡SE ACABÓ!
              </motion.div>
              <div className="demo-over-score">{score.toLocaleString('es-MX')} puntos</div>
              <button className="btn3d" onClick={reset}><Play size={17} strokeWidth={3} fill="currentColor" /> OTRA VEZ</button>
              <a className="btn3d blue" href="#descargar" onClick={() => setOver(false)}><Download size={17} /> Descarga el juego completo</a>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bandeja */}
      <div className="demo-tray">
        {pieces.map((p, idx) => {
          const hidden = drag?.idx === idx
          const tcell = Math.min(30, cell * 0.62)
          return (
            <div key={p.id} className="demo-slot" onPointerDown={onPiecesDownGuard(over) ? undefined : onPieceDown(idx)} style={{ opacity: hidden ? 0.15 : 1, cursor: 'grab' }}>
              <PieceView piece={p} cellSize={tcell} />
            </div>
          )
        })}
      </div>

      {/* pieza flotante siguiendo el dedo (elevada) */}
      {dragPiece && drag && (
        <div
          style={{
            position: 'fixed',
            left: drag.x - (dragPiece.shape[0].length * cell) / 2,
            top: drag.y - dragPiece.shape.length * cell - LIFT * cell,
            zIndex: 50, pointerEvents: 'none',
            filter: `drop-shadow(0 16px 20px rgba(0,0,0,.5))${ghost?.wouldClear ? ' drop-shadow(0 0 18px #FFD54F)' : ''}`,
          }}
        >
          <PieceView piece={dragPiece} cellSize={cell} />
        </div>
      )}

      <p className="demo-hint">Arrastra las piezas al tablero · completa filas o columnas para reventarlas</p>
    </div>
  )
}

const onPiecesDownGuard = (over) => over

function PieceView({ piece, cellSize }) {
  const g = cellSize * 0.08
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${piece.shape[0].length}, ${cellSize}px)`, gap: g }}>
      {piece.shape.flatMap((row, r) =>
        row.map((v, c) =>
          v ? (
            <div key={`${r}-${c}`} className="gem" style={{ width: cellSize, height: cellSize, background: `linear-gradient(160deg, ${piece.color}, ${piece.color}cc)` }} />
          ) : (
            <div key={`${r}-${c}`} style={{ width: cellSize, height: cellSize }} />
          ),
        ),
      )}
    </div>
  )
}
