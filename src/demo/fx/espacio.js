import { rand, pick, power, glowSprite } from '../fx-core.js'

// Misión espacial: un cohete recorre cada línea dejando humo y chispas,
// las celdas sueltan estrellas, caen meteoros y con 3+ líneas se abre un portal.
const STARS = ['#9fe8ff', '#ffd76a', '#ff9ad5', '#b9a6ff']

function rocket(ctx, p) {
  const s = p.size
  ctx.rotate(p.ang)
  ctx.globalCompositeOperation = 'lighter'
  const fl = s * (1.1 + Math.random() * 0.5)
  ctx.drawImage(glowSprite('#ff8a2b'), -s * 0.9 - fl, -fl * 0.6, fl * 1.4, fl * 1.2)
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = '#d9314a' // aletas
  ctx.beginPath(); ctx.moveTo(-s * 0.55, -s * 0.18); ctx.lineTo(-s * 0.85, -s * 0.48); ctx.lineTo(-s * 0.3, -s * 0.2); ctx.fill()
  ctx.beginPath(); ctx.moveTo(-s * 0.55, s * 0.18); ctx.lineTo(-s * 0.85, s * 0.48); ctx.lineTo(-s * 0.3, s * 0.2); ctx.fill()
  ctx.fillStyle = '#f2f4fa' // cuerpo
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.7, s * 0.24, 0, 0, 7); ctx.fill()
  ctx.fillStyle = '#d9314a' // punta
  ctx.beginPath(); ctx.moveTo(s * 0.42, -s * 0.2); ctx.quadraticCurveTo(s * 0.86, 0, s * 0.42, s * 0.2); ctx.fill()
  ctx.fillStyle = '#3c7fe0' // ventanilla
  ctx.beginPath(); ctx.arc(s * 0.08, 0, s * 0.1, 0, 7); ctx.fill()
  ctx.fillStyle = '#bfe3ff'
  ctx.beginPath(); ctx.arc(s * 0.06, -s * 0.03, s * 0.04, 0, 7); ctx.fill()
}

function portal(ctx, p) {
  const age = p.t / p.life
  const open = age < 0.2 ? age / 0.2 : age > 0.75 ? (1 - age) / 0.25 : 1
  const R = p.size * open
  ctx.globalCompositeOperation = 'lighter'
  ctx.drawImage(glowSprite('#7b4dff'), -R * 1.8, -R * 1.8, R * 3.6, R * 3.6)
  ctx.lineWidth = Math.max(1, R * 0.12)
  for (let i = 0; i < 3; i++) {
    ctx.save()
    ctx.rotate(p.t * (i % 2 ? -5 : 4) + i)
    ctx.strokeStyle = ['#29f0ff', '#b04dff', '#ff9ad5'][i]
    ctx.setLineDash([R * 0.5, R * 0.3])
    ctx.beginPath(); ctx.arc(0, 0, R * (1 - i * 0.22), 0, 7); ctx.stroke()
    ctx.restore()
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.fillStyle = 'rgba(10,4,30,.85)'
  ctx.beginPath(); ctx.arc(0, 0, R * 0.42, 0, 7); ctx.fill()
}

export default function espacioFx(fx, ev) {
  const pw = power(ev)
  const red = fx.reduced
  for (const L of ev.lines) {
    const dx = L.x2 - L.x1, dy = L.y2 - L.y1
    const len = Math.hypot(dx, dy), dur = 0.42 + len / 2400
    fx.add({
      kind: 'custom', draw: rocket, x: L.x1, y: L.y1, vx: dx / dur, vy: dy / dur, ang: Math.atan2(dy, dx),
      size: ev.cell * 1.15, life: dur + 0.12, fade: false,
      update: (f, p) => {
        if (red) return
        const bx = p.x - Math.cos(p.ang) * p.size * 0.8, by = p.y - Math.sin(p.ang) * p.size * 0.8
        f.add({ kind: 'smoke', x: bx, y: by, vx: rand(-30, 30), vy: rand(-30, 30), size: ev.cell * rand(0.14, 0.24), color: 'rgba(220,210,255,.5)', life: rand(0.45, 0.7), drag: 2 })
        if (Math.random() < 0.7) f.add({ kind: 'glow', x: bx, y: by, vx: -Math.cos(p.ang) * 160 + rand(-60, 60), vy: -Math.sin(p.ang) * 160 + rand(-60, 60), size: ev.cell * 0.22, color: pick(['#ffb14a', '#ffd76a']), life: 0.3, drag: 3 })
      },
    })
  }
  if (!red) {
    for (const c of ev.cells) {
      const n = Math.round(1 + pw * 0.5)
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.28), sp = rand(60, 200)
        fx.add({ kind: 'star', x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 2.2, size: c.s * rand(0.1, 0.2), color: pick(STARS), vr: rand(-4, 4), life: rand(0.5, 0.9), delay: c.delay + 0.1 })
      }
    }
    const meteors = Math.round(1 + pw * 1.5)
    for (let i = 0; i < meteors; i++) {
      const x = rand(ev.W * 0.2, ev.W * 1.1), sp = rand(700, 1000)
      fx.add({ kind: 'streak', x, y: rand(-40, ev.H * 0.3), vx: -sp * 0.6, vy: sp * 0.8, size: rand(2, 3.5), len: 9, color: pick(['#ffd76a', '#9fe8ff', '#ffffff']), life: rand(0.5, 0.8), delay: rand(0, 0.5) })
    }
  }
  if (ev.n >= 3 || ev.streak >= 4) {
    const { x, y } = ev.center
    fx.add({ kind: 'custom', draw: portal, x, y, size: ev.cell * (1.6 + ev.n * 0.3), life: 1.3, fade: false, delay: 0.15 })
    if (!red) {
      for (let i = 0; i < 40; i++) {
        const a = rand(0, 6.28), d = rand(ev.cell * 3, ev.cell * 6)
        fx.add({ kind: 'star', x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, size: rand(3, 6), color: pick(STARS), life: 0.9, delay: rand(0.2, 0.6),
          update: (f, p) => { p.vx = (x - p.x) * 3.2; p.vy = (y - p.y) * 3.2 } })
      }
    }
  }
}
