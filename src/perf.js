/* Pausa lo animado que no está en pantalla.
   - Elementos con animaciones CSS en bucle: se les pone .is-off y el CSS
     detiene sus animaciones (y las de sus hijos).
   - <video data-autopause>: play()/pause() según visibilidad.
   Un solo IntersectionObserver para todo; un MutationObserver engancha lo
   que React monte después (rutas, secciones perezosas). */
const SEL = '.fgems, .marquee, .shots-viewport, .how-miniboard, .shimmer, .prog-vip, .btn3d, .float-y, .wiggle, .pulse-cta, video[data-autopause]'

export function startOffscreenPause() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target
      if (el.tagName === 'VIDEO') {
        if (e.isIntersecting) el.play().catch(() => {})
        else el.pause()
      } else {
        el.classList.toggle('is-off', !e.isIntersecting)
      }
    }
  }, { rootMargin: '120px 0px' })
  const seen = new WeakSet()
  const scan = (root) => {
    if (root.nodeType !== 1) return
    const list = root.matches?.(SEL) ? [root] : []
    list.push(...root.querySelectorAll(SEL))
    for (const el of list) if (!seen.has(el)) { seen.add(el); io.observe(el) }
  }
  scan(document.body)
  new MutationObserver((ms) => { for (const m of ms) m.addedNodes.forEach(scan) })
    .observe(document.body, { childList: true, subtree: true })
}
