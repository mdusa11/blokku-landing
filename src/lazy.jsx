import { Suspense, lazy, useEffect, useRef, useState } from 'react'

/* Secciones pesadas en chunks aparte. Se montan al acercarse a la pantalla;
   mientras, un hueco con su altura aproximada (y su id, para que los enlaces
   #ancla funcionen). Con el primer scroll o toque se precargan todas en
   segundo plano, así al llegar ya están listas. */
const loaders = {
  tutorial: () => import('./tutorial.jsx'),
  demo: () => import('./demo/DemoGame.jsx'),
  novedades: () => import('./novedades.jsx'),
}
export const LazyHowToPlay = lazy(() => loaders.tutorial().then((m) => ({ default: m.HowToPlay })))
export const LazyDemoGame = lazy(loaders.demo)
export const LazyNovedades = lazy(() => loaders.novedades().then((m) => ({ default: m.Novedades })))

let warmed = false
export function warmOnFirstInput() {
  if (typeof window === 'undefined') return
  const evs = ['scroll', 'pointerdown', 'keydown', 'touchstart']
  const go = () => {
    evs.forEach((e) => window.removeEventListener(e, go))
    if (warmed) return
    warmed = true
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 200))
    idle(() => Object.values(loaders).forEach((l) => l().catch(() => {})))
  }
  evs.forEach((e) => window.addEventListener(e, go, { passive: true, once: true }))
  // Si la página abre con #ancla, el navegador ya hizo scroll: cargar ya.
  if (location.hash && location.hash.length > 1 && !location.hash.startsWith('#/')) go()
}

export function WhenNear({ children, className, id, margin = '1000px 0px', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [near, setNear] = useState(() => typeof IntersectionObserver === 'undefined')
  useEffect(() => {
    if (near) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNear(true); io.disconnect() }
    }, { rootMargin: margin })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [near, margin])
  const hole = <Tag ref={near ? undefined : ref} id={id} className={`lazy-hole ${className}`} aria-busy="true" />
  return near ? <Suspense fallback={hole}>{children}</Suspense> : hole
}
