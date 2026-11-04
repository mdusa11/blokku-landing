import { rand, pick, power, confetti } from '../fx-core.js'

// Carnaval: confeti, serpentinas y plumas. Con 4 líneas sale el letrero
// «¡CARNAVAL!» (lo pinta el DOM; aquí solo la lluvia).
const COLS = ['#ff4f9a', '#f2c94c', '#2ec4e6', '#7bc96f', '#b45ce6', '#ff7a3d']

function ribbon(ctx, p) {
  ctx.rotate(p.rot)
  ctx.strokeStyle = p.color
  ctx.lineWidth = p.w
  ctx.lineCap = 'round'
  ctx.beginPath()
  const L = p.size, ph = p.t * 14
  for (let i = 0; i <= 14; i++) {
    const t = i / 14
    ctx.lineTo(Math.sin(t * 9 + ph) * L * 0.12, t * L - L / 2)
  }
  ctx.stroke()
}

function feather(ctx, p) {
  ctx.rotate(p.rot + Math.sin(p.t * 5 + p.ph) * 0.6)
  const s = p.size
  ctx.fillStyle = p.color
  ctx.beginPath()
  ctx.ellipse(0, 0, s * 0.22, s * 0.5, 0, 0, 7)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,.35)'
  ctx.beginPath(); ctx.ellipse(-s * 0.06, -s * 0.08, s * 0.07, s * 0.32, 0, 0, 7); ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.moveTo(0, -s * 0.45); ctx.lineTo(0, s * 0.62); ctx.stroke()
}

export default function carnavalFx(fx, ev) {
  const pw = power(ev)
  const red = fx.reduced
  for (const c of ev.cells) {
    fx.add({ kind: 'glow', x: c.x, y: c.y, size: c.s * 0.8, color: c.color, life: 0.35, delay: c.delay })
    if (!red) confetti(fx, c.x, c.y, Math.round(2 + pw), COLS, 0.8)
  }
  if (red) return
  const nr = Math.round(2 + pw * 2)
  for (let i = 0; i < nr; i++) {
    const c = pick(ev.cells)
    fx.add({ kind: 'custom', draw: ribbon, x: c.x, y: c.y, vx: rand(-160, 160), vy: rand(-520, -320), g: 650, drag: 1.2, size: ev.cell * rand(1.4, 2.2), w: rand(2.5, 4), color: pick(COLS), rot: rand(-1, 1), vr: rand(-3, 3), life: rand(1.2, 1.7) })
  }
  const nf = Math.round(1 + pw * 1.5)
  for (let i = 0; i < nf; i++) {
    const c = pick(ev.cells)
    fx.add({ kind: 'custom', draw: feather, x: c.x, y: c.y, vx: rand(-120, 120), vy: rand(-380, -220), g: 260, drag: 2.4, size: ev.cell * rand(0.9, 1.3), color: pick(COLS), rot: rand(-0.5, 0.5), ph: rand(0, 6), life: rand(1.4, 2) })
  }
  if (ev.n >= 3 || ev.streak >= 4) {
    for (let i = 0; i < 60; i++) {
      fx.add({ kind: 'conf', x: rand(0, ev.W), y: rand(-60, -10), vx: rand(-40, 40), vy: rand(80, 200), g: 120, size: rand(7, 11), color: pick(COLS), rot: rand(0, 6), vr: rand(-6, 6), vf: rand(6, 12), life: rand(1.6, 2.4), delay: rand(0, 0.5) })
    }
  }
}
