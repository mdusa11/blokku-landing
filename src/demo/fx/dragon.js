import { rand, pick, power } from '../fx-core.js'

// Dragón: llamarada que barre cada línea (fuego aditivo), brasas que suben y
// humo. Con 3+ líneas, columna de fuego desde abajo.
const FIRE = ['#ff3b1f', '#ff7a1a', '#ffb02e', '#ffd75e']

function sweep(fx, L, cell, pw, delay) {
  const dx = L.x2 - L.x1, dy = L.y2 - L.y1
  const dur = 0.32 + pw * 0.03
  const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy)
  fx.add({
    kind: 'glow', hidden: true, x: L.x1 - ux * cell, y: L.y1 - uy * cell, vx: (dx + ux * cell * 2) / dur, vy: (dy + uy * cell * 2) / dur, size: 1, color: '#ff7a1a', life: dur, delay,
    update: (f, p) => {
      const n = f.reduced ? 1 : 3 + Math.round(pw)
      for (let i = 0; i < n; i++) {
        f.add({ kind: 'glow', x: p.x + rand(-cell * 0.3, cell * 0.3), y: p.y + rand(-cell * 0.3, cell * 0.3), vx: ux * rand(80, 220) + rand(-50, 50), vy: uy * rand(80, 220) + rand(-120, -20), drag: 2, size: cell * rand(0.45, 0.8) * (1 + pw * 0.08), grow: 0.6, color: pick(FIRE), life: rand(0.35, 0.6) })
      }
    },
  })
}

export default function dragonFx(fx, ev) {
  const pw = power(ev)
  ev.lines.forEach((L, i) => sweep(fx, L, ev.cell, pw, i * 0.05))
  if (fx.reduced) return
  for (const c of ev.cells) {
    for (let i = 0; i < 2; i++) {
      fx.add({ kind: 'glow', x: c.x + rand(-8, 8), y: c.y, vx: rand(-40, 40), vy: rand(-260, -120), drag: 0.6, size: rand(3, 5), color: pick(['#ffd75e', '#ff9a2e']), life: rand(0.8, 1.3), delay: c.delay + 0.2, update: (f, p) => { p.vx += Math.sin(p.t * 9) * 8 } })
    }
    if (Math.random() < 0.35) fx.add({ kind: 'smoke', x: c.x, y: c.y, vy: rand(-80, -40), size: c.s * 0.35, color: 'rgba(60,30,40,.55)', life: 0.9, delay: c.delay + 0.35, drag: 1 })
  }
  if (ev.n >= 3 || ev.streak >= 4) {
    const x0 = ev.center.x
    for (let i = 0; i < 70; i++) {
      fx.add({ kind: 'glow', x: x0 + rand(-ev.cell * 1.6, ev.cell * 1.6), y: ev.H + 20, vx: rand(-60, 60), vy: rand(-1300, -900), drag: 1.8, size: ev.cell * rand(0.6, 1.1), grow: 0.8, color: pick(FIRE), life: rand(0.5, 0.8), delay: rand(0, 0.35) })
    }
  }
}
