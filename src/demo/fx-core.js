// Motor de partículas en un solo <canvas>. Solo corre mientras hay algo vivo:
// sin partículas no hay requestAnimationFrame. Nada de shadowBlur (caro en
// celular): el brillo sale de sprites radiales pre-pintados + modo 'lighter'.

const TAU = Math.PI * 2
const sprites = new Map()

export function glowSprite(color) {
  let s = sprites.get(color)
  if (s) return s
  s = document.createElement('canvas')
  s.width = s.height = 64
  const g = s.getContext('2d')
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  gr.addColorStop(0, '#fff')
  gr.addColorStop(0.18, color)
  gr.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = gr
  g.fillRect(0, 0, 64, 64)
  sprites.set(color, s)
  return s
}

export const rand = (a, b) => a + Math.random() * (b - a)
export const pick = (arr) => arr[(Math.random() * arr.length) | 0]

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function star(ctx, r, inner = 0.28) {
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    const rad = i % 2 ? r * inner : r
    ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad)
  }
  ctx.closePath()
}

const DRAW = {
  // Esquirla de gema: cuadrito con su luz arriba.
  sq(ctx, p, k) {
    const s = p.size * (0.4 + 0.6 * k)
    ctx.rotate(p.rot)
    ctx.fillStyle = p.color
    rr(ctx, -s / 2, -s / 2, s, s, s * 0.22)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,.45)'
    ctx.fillRect(-s * 0.32, -s * 0.36, s * 0.64, s * 0.2)
  },
  // Confeti: rectángulo que "gira" en 3D (ancho con coseno).
  conf(ctx, p) {
    ctx.rotate(p.rot)
    ctx.scale(Math.cos(p.flip), 1)
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6)
  },
  glow(ctx, p, k) {
    const s = p.size * (p.grow ? 1 + (1 - k) * p.grow : k)
    ctx.globalCompositeOperation = 'lighter'
    ctx.drawImage(glowSprite(p.color), -s, -s, s * 2, s * 2)
  },
  star(ctx, p, k) {
    ctx.globalCompositeOperation = 'lighter'
    ctx.rotate(p.rot)
    const s = p.size * (k < 0.5 ? k * 2 : 1)
    ctx.drawImage(glowSprite(p.color), -s * 1.4, -s * 1.4, s * 2.8, s * 2.8)
    ctx.fillStyle = '#fff'
    star(ctx, s)
    ctx.fill()
  },
  streak(ctx, p) {
    ctx.globalCompositeOperation = 'lighter'
    const len = p.len ?? 4
    ctx.strokeStyle = p.color
    ctx.lineWidth = p.size
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-p.vx * len * 0.016, -p.vy * len * 0.016)
    ctx.stroke()
  },
  ring(ctx, p, k) {
    const r = p.r0 + (p.r1 - p.r0) * (1 - k)
    ctx.globalCompositeOperation = 'lighter'
    ctx.strokeStyle = p.color
    ctx.lineWidth = p.size * k
    if (p.dash) { ctx.setLineDash(p.dash); ctx.rotate(p.rot) }
    ctx.beginPath()
    ctx.arc(0, 0, Math.max(1, r), 0, TAU)
    ctx.stroke()
  },
  smoke(ctx, p, k) {
    const s = p.size * (1.6 - k * 0.6)
    ctx.fillStyle = p.color
    ctx.globalAlpha *= 0.5
    ctx.beginPath()
    ctx.arc(0, 0, s, 0, TAU)
    ctx.fill()
  },
  custom(ctx, p, k) { p.draw(ctx, p, k) },
}

export class Fx {
  constructor(canvas, { reduced = false, lowEnd = false } = {}) {
    this.c = canvas
    this.ctx = canvas.getContext('2d')
    this.ps = []
    this.raf = 0
    this.reduced = reduced
    this.max = lowEnd ? 260 : 520
    this.dpr = Math.min(window.devicePixelRatio || 1, lowEnd ? 1.5 : 2)
    this.w = 0; this.h = 0
    this.tick = this.tick.bind(this)
  }
  resize(w, h) {
    this.w = w; this.h = h
    this.c.width = Math.round(w * this.dpr)
    this.c.height = Math.round(h * this.dpr)
  }
  add(p) {
    if (this.ps.length >= this.max) return null
    p.t = 0
    p.life ??= 0.8
    p.vx ??= 0; p.vy ??= 0; p.g ??= 0; p.drag ??= 0
    p.rot ??= 0; p.vr ??= 0; p.flip ??= 0; p.vf ??= 0
    p.delay ??= 0
    this.ps.push(p)
    if (!this.raf) { this.last = performance.now(); this.raf = requestAnimationFrame(this.tick) }
    return p
  }
  clear() { this.ps.length = 0 }
  tick(now) {
    const dt = Math.min(0.033, (now - this.last) / 1000)
    this.last = now
    const { ctx, dpr } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, this.c.width, this.c.height)
    const ps = this.ps
    let j = 0
    for (let i = 0; i < ps.length; i++) {
      const p = ps[i]
      if (p.delay > 0) { p.delay -= dt; ps[j++] = p; continue }
      p.t += dt
      if (p.t >= p.life) { p.onEnd?.(this, p); continue }
      p.update?.(this, p, dt)
      p.vx *= 1 - p.drag * dt; p.vy *= 1 - p.drag * dt
      p.vy += p.g * dt
      p.x += p.vx * dt; p.y += p.vy * dt
      p.rot += p.vr * dt; p.flip += p.vf * dt
      const k = 1 - p.t / p.life
      if (!p.hidden) {
        ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr)
        ctx.globalAlpha = p.fade === false ? 1 : Math.min(1, k * (p.fadeIn ? Math.min(1, p.t / p.fadeIn) : 1) * 1.6)
        ctx.globalCompositeOperation = 'source-over'
        DRAW[p.kind](ctx, p, k)
        if (p.dash) ctx.setLineDash([])
      }
      ps[j++] = p
    }
    ps.length = j
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
    this.raf = ps.length ? requestAnimationFrame(this.tick) : 0
    if (!ps.length) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.c.width, this.c.height) }
  }
  destroy() { cancelAnimationFrame(this.raf); this.raf = 0; this.ps.length = 0 }
}

// Escala de intensidad compartida: 1–4 líneas y racha.
export const power = (ev) => Math.min(4, ev.n) + Math.min(3, Math.max(0, ev.streak - 1)) * 0.5

// Efecto del Clásico: esquirlas de gema + chispas, aro con 3+ líneas.
export function classicFx(fx, ev) {
  const pw = power(ev)
  const per = fx.reduced ? 0 : Math.round(3 + pw * 1.2)
  for (const c of ev.cells) {
    for (let i = 0; i < per; i++) {
      const a = rand(0, Math.PI * 2), sp = rand(80, 220 + pw * 40)
      fx.add({ kind: 'sq', x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 140, g: 900, drag: 1.2, size: c.s * rand(0.18, 0.32), color: c.color, rot: rand(0, 6), vr: rand(-12, 12), life: rand(0.55, 0.9), delay: c.delay })
    }
    if (Math.random() < 0.5 + pw * 0.1) fx.add({ kind: 'star', x: c.x + rand(-6, 6), y: c.y + rand(-6, 6), size: c.s * rand(0.12, 0.2), color: c.color, vr: rand(-3, 3), life: rand(0.35, 0.6), delay: c.delay + 0.05 })
  }
  if (ev.n >= 3 && !fx.reduced) {
    fx.add({ kind: 'ring', x: ev.center.x, y: ev.center.y, r0: 10, r1: ev.cell * (4 + ev.n), size: 10, color: '#ffffff', life: 0.55 })
    fx.add({ kind: 'ring', x: ev.center.x, y: ev.center.y, r0: 6, r1: ev.cell * (3 + ev.n), size: 6, color: '#ffd54f', life: 0.7, delay: 0.08 })
  }
}

export function confetti(fx, x, y, n, colors, spread = 1) {
  for (let i = 0; i < n; i++) {
    const a = rand(-Math.PI * 0.9, -Math.PI * 0.1), sp = rand(180, 420) * spread
    fx.add({ kind: 'conf', x: x + rand(-8, 8), y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 520, drag: 1.6, size: rand(6, 11), color: pick(colors), rot: rand(0, 6), vr: rand(-8, 8), vf: rand(6, 14), life: rand(1, 1.6) })
  }
}
