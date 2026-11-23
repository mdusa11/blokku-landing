import { Suspense, lazy, useEffect, useState } from 'react'
import { m as motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Heart, Bot, Download } from 'lucide-react'
import { AppIcon, FallingGems, Logo, Reveal, Shine } from './bits.jsx'
import { Hero, MarqueeStrip, DemoSection, Powers, Modes, Progression, Shots } from './sections.jsx'
import { ScrollProgress, StickyNav, Stats } from './interactive.jsx'
import { StoreBadges, STORE_URL } from './extras.jsx'
import { useT } from './i18n/index.js'
import { LangPicker } from './i18n/LangPicker.jsx'
import { LazyHowToPlay, LazyNovedades, WhenNear, warmOnFirstInput } from './lazy.jsx'

const legal = (name) => lazy(() => import('./legal.jsx').then((m) => ({ default: m[name] })))

/* ═══ FAQ ═════════════════════════════════════════════════════════════════════ */
const FAQ_N = 6

function Faq() {
  const t = useT()
  const [open, setOpen] = useState(null)
  return (
    <section id="faq">
      <div className="wrap">
        <Reveal>
          <span className="kicker">{t('faq.kicker')}</span>
          <h2 className="display">{t('faq.t1')} <Shine color="var(--pink)">{t('faq.t2')}</Shine></h2>
        </Reveal>
        <div className="faq">
          {Array.from({ length: FAQ_N }, (_, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="card faq-item">
                <button className="faq-q" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
                  <span>{t(`faq.q${i + 1}`)}</span>
                  <motion.span animate={{ rotate: open === i ? 45 : 0 }} style={{ color: 'var(--yellow)', lineHeight: 0 }}>
                    <Plus size={24} strokeWidth={3} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                      <p className="faq-a">{t(`faq.a${i + 1}`)}</p>
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
  const t = useT()
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
            {t('cta.tag')}
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
              <Download size={24} strokeWidth={3} /> {t('cta.btn')}
            </a>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 26 }}>
            <StoreBadges />
          </div>
          <p style={{ color: 'var(--muted)', marginTop: 20, fontFamily: 'var(--utility)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Bot size={17} /> {t('cta.line')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}

/* ═══ LANDING ═════════════════════════════════════════════════════════════════ */
function Landing() {
  const t = useT()
  return (
    <>
      <div className="aurora" aria-hidden><span className="a1" /><span className="a2" /></div>
      <ScrollProgress />
      <StickyNav />
      <Hero />
      <MarqueeStrip />
      <Stats />
      <WhenNear id="como-jugar" className="ph-tut"><LazyHowToPlay /></WhenNear>
      <DemoSection />
      <Powers />
      <Modes />
      <Progression />
      <WhenNear id="novedades" className="ph-nov"><LazyNovedades /></WhenNear>
      <Shots />
      <Faq />
      <FinalCta />
      <footer>
        <div className="wrap">
          <strong style={{ color: 'var(--yellow)', fontFamily: 'var(--display)', letterSpacing: 1 }}>BLOKKU</strong>
          <p style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {t.rich('foot.made', { heart: <Heart size={14} fill="var(--blue)" color="var(--blue)" /> })}
          </p>
          <p className="sx-hint">{t('foot.secret')}</p>
          <LangPicker className="langpick-foot" />
          <div className="links">
            <a href="#/terminos">{t('foot.terms')}</a>
            <a href="#/privacidad">{t('foot.privacy')}</a>
            <a href="#/eliminar-datos">{t('foot.delete')}</a>
            <a href="#/soporte">{t('foot.support')}</a>
          </div>
        </div>
      </footer>
    </>
  )
}

/* ═══ APP + ROUTER (hash) ═════════════════════════════════════════════════════ */
const ROUTES = {
  '#/terminos': legal('Terminos'),
  '#/privacidad': legal('Privacidad'),
  '#/eliminar-datos': legal('EliminarDatos'),
  '#/soporte': legal('Soporte'),
}

export default function App() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  useEffect(warmOnFirstInput, [])
  const Page = ROUTES[hash]
  return Page ? <Suspense fallback={<div style={{ minHeight: '100vh' }} />}><Page /></Suspense> : <Landing />
}
