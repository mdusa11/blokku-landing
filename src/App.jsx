import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Heart, Bot, Download } from 'lucide-react'
import { AppIcon, FallingGems, Logo, Reveal } from './bits.jsx'
import { Hero, MarqueeStrip, DemoSection, Powers, Modes, Progression, Novedades, Shots } from './sections.jsx'
import { ScrollProgress, StickyNav, Stats } from './interactive.jsx'
import { StoreBadges, STORE_URL } from './extras.jsx'
import { HowToPlay } from './tutorial.jsx'
import { Terminos, Privacidad, EliminarDatos, Soporte } from './legal.jsx'

/* ═══ FAQ ═════════════════════════════════════════════════════════════════════ */
const FAQS = [
  ['¿Blokku es gratis?', 'Sí, 100% gratis con anuncios. La única compra opcional es "Sin Anuncios" (solo en Android): un pago único que los quita para siempre. En iPhone no hay compras. Nada de suscripciones ni monedas.'],
  ['¿Necesito internet?', 'No para jugar: Blokku funciona offline — perfecto para el metro, el avión o donde sea. Solo el ranking mundial y por país necesita conexión.'],
  ['¿Cómo funciona el ranking?', 'Es opcional: eliges un nombre visible y compites en la tabla semanal, la histórica o el reto de hoy, a nivel mundial o de tu país. Puedes borrar tus datos y salir del ranking cuando quieras desde Ajustes.'],
  ['¿En qué se diferencia de otros block puzzles?', 'Poderes épicos (bomba, rayo, destructor…) gratis en cada partida, 4 modos de juego, ranking, eventos de temporada y un feel de arrastre ultra pulido.'],
  ['¿Para qué edades es?', 'Para todos. Fácil de aprender en 10 segundos, difícil de dominar.'],
  ['¿Dónde lo descargo?', 'Ya está disponible gratis en Google Play (Android) y en el App Store (iPhone y iPad). Y puedes jugar la demo aquí arriba.'],
]

function Faq() {
  const [open, setOpen] = useState(null)
  return (
    <section id="faq">
      <div className="wrap">
        <Reveal>
          <span className="kicker">Dudas rápidas</span>
          <h2 className="display">PREGUNTAS <span className="shimmer" style={{ color: 'var(--pink)' }}>FRECUENTES</span></h2>
        </Reveal>
        <div className="faq">
          {FAQS.map(([q, a], i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="card faq-item">
                <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <span>{q}</span>
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} style={{ color: 'var(--yellow)', lineHeight: 0 }}>
                    <Plus size={24} strokeWidth={3} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <p className="faq-a">{a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ═══ CTA FINAL ═══════════════════════════════════════════════════════════════ */
function FinalCta() {
  return (
    <section id="descargar" style={{ textAlign: 'center', overflow: 'hidden' }}>
      <FallingGems count={14} opacity={0.14} />
      <div className="wrap">
        <Reveal>
          <div className="wiggle" style={{ display: 'inline-block' }}>
            <AppIcon size={120} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ marginTop: 26 }}><Logo size={'clamp(52px, 8vw, 84px)'} /></div>
          <p className="display" style={{ color: 'var(--yellow)', fontSize: 'clamp(20px, 3vw, 30px)', marginTop: 14, textShadow: '0 4px 0 rgba(0,0,0,.25)' }}>
            ¿CUÁNTO PUEDES DURAR?
          </p>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40 }}>
            <a
              className="btn3d pulse-cta"
              href={STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 24, padding: '22px 52px', boxShadow: '0 6px 0 #2c9a45, 0 0 60px rgba(67,217,163,.5)' }}
            >
              <Download size={24} strokeWidth={3} /> DESCÁRGALO GRATIS
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 26 }}>
            <StoreBadges />
          </div>
          <p style={{ color: 'var(--muted)', marginTop: 20, fontFamily: 'var(--utility)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Bot size={17} /> Ya en Google Play y App Store · gratis · sin internet
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══ LANDING ═════════════════════════════════════════════════════════════════ */
function Landing() {
  return (
    <>
      <div className="aurora" aria-hidden><span className="a1" /><span className="a2" /></div>
      <ScrollProgress />
      <StickyNav />
      <Hero />
      <MarqueeStrip />
      <Stats />
      <HowToPlay />
      <DemoSection />
      <Powers />
      <Modes />
      <Progression />
      <Novedades />
      <Shots />
      <Faq />
      <FinalCta />
      <footer>
        <div className="wrap">
          <strong style={{ color: 'var(--yellow)', fontFamily: 'var(--display)', letterSpacing: 1 }}>BLOKKU</strong>
          <p style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            © 2026 DUSA Solutions · Hecho con <Heart size={14} fill="var(--blue)" color="var(--blue)" /> en México
          </p>
          <div className="links">
            <a href="#/terminos">Términos y condiciones</a>
            <a href="#/privacidad">Aviso de privacidad</a>
            <a href="#/eliminar-datos">Eliminar mis datos</a>
            <a href="#/soporte">Soporte</a>
          </div>
        </div>
      </footer>
    </>
  )
}

/* ═══ APP + ROUTER (hash) ═════════════════════════════════════════════════════ */
const ROUTES = {
  '#/terminos': Terminos,
  '#/privacidad': Privacidad,
  '#/eliminar-datos': EliminarDatos,
  '#/soporte': Soporte,
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const Page = ROUTES[hash]
  return Page ? <Page /> : <Landing />
}
