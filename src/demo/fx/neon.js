import { rand, pick, power } from '../fx-core.js'

// Neón (Cromópolis): rayos eléctricos sobre cada línea, chispas de neón y
// glitch. Con 3+ líneas, barras de interferencia en toda la pantalla.
const NEON = ['#29f0ff', '#ff2e9a', '#f5ff3d', '#b04dff']

function jag(x1, y1, x2, y2, segs, amp) {
  const pts = [[x1, y1]]
  const nx = -(y2 - y1), ny = x2 - x1, nl = Math.hypot(nx, ny) || 1
  for (let i = 1; i < segs; i++) {
    const t = i / segs, o = rand(-amp, amp)
    pts.push([x1 + (x2 - x1) * t + (nx / nl) * o, y1 + (y2 - y1) * t + (ny / nl) * o])
  }
  pts.push([x2, y2])
  return pts
}

function bolt(ctx, p, k) {
  if ((p.f = (p.f || 0) + 1) % 3 === 1 || !p.pts) p.pts = jag(p.x1, p.y1, p.x2, p.y2, p.segs, p.amp)
  ctx.setTransform(p.dpr, 0, 0, p.dpr, 0, 0)
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'
  for (const [w, col, a] of [[p.w * 4, p.color, 0.25], [p.w * 1.8, p.color, 0.7], [p.w * 0.7, '#ffffff', 1]]) {
    ctx.globalAlpha = a * Math.min(1, k * 2)
    ctx.strokeStyle = col; ctx.lineWidth = w
    ctx.beginPath()
    for (const [x, y] of p.pts) ctx.lineTo(x, y)
    ctx.stroke()
  }
}

function bars(ctx, p, k) {
  ctx.setTransform(p.dpr, 0, 0, p.dpr, 0, 0)
  ctx.globalCompositeOperation = 'lighter'
  if (Math.random() < 0.6) {
    for (let i = 0; i < 5; i++) {
      ctx.globalAlpha = rand(0.1, 0.35) * k
      ctx.fillStyle = pick(NEON)
      ctx.fillRect(rand(-40, p.W * 0.5), rand(0, p.H), rand(p.W * 0.3, p.W), rand(2, 10))
    }
  }
}

export default function neonFx(fx, ev) {
  const pw = power(ev)
  const dpr = fx.dpr
  ev.lines.forEach((L, i) => {
    const color = NEON[i % 2]
    fx.add({ kind: 'custom', draw: bolt, x: 0, y: 0, dpr, x1: L.x1, y1: L.y1, x2: L.x2, y2: L.y2, segs: 12, amp: ev.cell * 0.32, w: 2 + pw * 0.4, color, life: 0.42 + pw * 0.04 })
    if (pw > 2.5) fx.add({ kind: 'custom', draw: bolt, x: 0, y: 0, dpr, x1: L.x1, y1: L.y1, x2: L.x2, y2: L.y2, segs: 8, amp: ev.cell * 0.55, w: 1.4, color: NEON[(i + 1) % 2], life: 0.35, delay: 0.06 })
  })
  if (!fx.reduced) {
    for (const c of ev.cells) {
      fx.add({ kind: 'glow', x: c.x, y: c.y, size: c.s * 0.9, color: c.color, life: 0.35, delay: c.delay })
      const n = Math.round(2 + pw)
      for (let i = 0; i < n; i++) {
        const a = rand(0, 6.28), sp = rand(200, 480)
        fx.add({ kind: 'streak', x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, drag: 4, size: rand(1.5, 2.5), len: 4, color: pick([c.color, '#ffffff']), life: rand(0.25, 0.45), delay: c.delay })
      }
    }
  }
  ev.glitch?.(Math.min(3, Math.ceil(pw / 1.6)))
  if ((ev.n >= 3 || ev.streak >= 4) && !fx.reduced) {
    fx.add({ kind: 'custom', draw: bars, x: 0, y: 0, dpr, W: ev.W, H: ev.H, life: 0.45 })
    fx.add({ kind: 'glow', x: ev.center.x, y: ev.center.y, size: ev.cell * 6, color: '#29f0ff', life: 0.4 })
  }
}
