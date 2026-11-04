import { rand, pick, rr, confetti, power } from '../fx-core.js'

// Mundo Blokki: caritas que brincan y festejan + confeti. Con 3+ líneas o
// racha alta, cañonazo de confeti desde las esquinas (como «BlokkiCheer»).
const INK = '#1d1640'

function face(ctx, p) {
  const age = p.t / p.life
  const pop = age < 0.18 ? 0.4 + (age / 0.18) * 0.8 : age < 0.28 ? 1.2 - ((age - 0.18) / 0.1) * 0.2 : 1
  const s = p.size * pop
  ctx.rotate(p.rot)
  ctx.fillStyle = p.dark
  rr(ctx, -s / 2, -s / 2 + s * 0.06, s, s, s * 0.26); ctx.fill()
  ctx.fillStyle = p.color
  rr(ctx, -s / 2, -s / 2, s, s * 0.94, s * 0.26); ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,.42)'
  rr(ctx, -s * 0.3, -s * 0.4, s * 0.6, s * 0.16, s * 0.08); ctx.fill()
  ctx.strokeStyle = INK; ctx.fillStyle = INK
  ctx.lineWidth = s * 0.075; ctx.lineCap = 'round'
  const e = s * 0.17
  if (p.mood === 0) { // ojos felices ^ ^
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * e, -s * 0.02, s * 0.09, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke() }
  } else if (p.mood === 1) { // ojos de estrella
    ctx.fillStyle = '#ffd23f'
    for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * e, -s * 0.04); ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? s * 0.05 : s * 0.12; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) } ctx.fill(); ctx.restore() }
    ctx.fillStyle = INK
  } else { // ojos redondos con brillo
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * e, -s * 0.04, s * 0.075, 0, 7); ctx.fill() }
    ctx.fillStyle = '#fff'
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(sx * e + s * 0.025, -s * 0.07, s * 0.025, 0, 7); ctx.fill() }
    ctx.fillStyle = INK
  }
  ctx.beginPath() // boca abierta
  ctx.moveTo(-s * 0.13, s * 0.12); ctx.quadraticCurveTo(0, s * 0.36, s * 0.13, s * 0.12); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#ff6f91'
  ctx.beginPath(); ctx.arc(0, s * 0.22, s * 0.05, 0, Math.PI); ctx.fill()
  ctx.fillStyle = 'rgba(255,105,140,.45)'
  for (const sx of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sx * s * 0.3, s * 0.1, s * 0.07, s * 0.045, 0, 0, 7); ctx.fill() }
}

export default function blokkiFx(fx, ev) {
  const pw = power(ev)
  const cols = ev.colors
  const step = Math.max(1, Math.round(4 - pw * 0.7))
  ev.cells.forEach((c, i) => {
    if (i % step === 0) {
      fx.add({ kind: 'custom', draw: face, x: c.x, y: c.y, vx: rand(-60, 60), vy: rand(-420, -300) - pw * 30, g: 1100, size: c.s * rand(0.85, 1.05), color: c.color, dark: c.dark, mood: (i + ev.streak) % 3, rot: rand(-0.3, 0.3), vr: rand(-2, 2), life: rand(0.9, 1.15), delay: c.delay, fade: false, update: (f, p) => { if (p.t > p.life - 0.15) p.size *= 0.86 } })
    }
    if (!fx.reduced) confetti(fx, c.x, c.y, Math.round(1 + pw * 0.6), cols, 0.7)
  })
  if ((ev.n >= 3 || ev.streak >= 4) && !fx.reduced) {
    const y = ev.H - 10
    for (const [x, dir] of [[10, 1], [ev.W - 10, -1]]) {
      for (let i = 0; i < 40; i++) {
        const a = -Math.PI / 2 + dir * rand(0.15, 0.7), sp = rand(500, 900)
        fx.add({ kind: 'conf', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 700, drag: 1.4, size: rand(7, 12), color: pick(cols), rot: rand(0, 6), vr: rand(-9, 9), vf: rand(6, 14), life: rand(1.3, 1.9) })
      }
    }
  }
}
