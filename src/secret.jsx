import { useCallback, useEffect, useRef, useState } from 'react'
import { m as motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Copy, Check, X } from 'lucide-react'
import { THEME } from './bits.jsx'
import { useT } from './i18n/index.js'

// azul, rosa, oro, menta (orden del logo). Letras: B L O K K U
const ORDER = ['blue', 'pink', 'yellow', 'green']
export const LETTER_COLOR = ['blue', 'blue', 'blue', 'pink', 'yellow', 'green']
// Código partido para que no salga como texto plano en el HTML inicial
const CODE = ['LAS4', 'GEMAS'].join('')

const ITEMS = [
  ['theme_blokku', 'theme'],
  ['style_blokku', 'style'],
  ['effect_blokku', 'effect'],
  ['frame_blokku', 'frame'],
  ['badge_blokku', 'badge'],
]

export function useSecret() {
  const step = useRef(0)
  const [open, setOpen] = useState(false)
  const [pulse, setPulse] = useState({ i: -1, n: 0 })
  useEffect(() => {
    try { console.log('%c◆ ◆ ◆ ◆  Las gemas guardan un secreto…', 'color:#ffc93c;font:600 13px system-ui') } catch { /* sin consola */ }
  }, [])
  const tap = useCallback((i) => {
    const c = LETTER_COLOR[i]
    if (c === ORDER[step.current]) step.current += 1
    else step.current = c === ORDER[0] ? 1 : 0
    setPulse((p) => ({ i, n: p.n + 1 }))
    if (step.current >= ORDER.length) { step.current = 0; setTimeout(() => setOpen(true), 250) }
  }, [])
  return { open, close: () => setOpen(false), tap, pulse }
}

const GEMS = [
  ['blue', THEME.blue, -1, -1], ['pink', THEME.pink, 1, -1],
  ['yellow', THEME.yellow, -1, 1], ['green', THEME.green, 1, 1],
]

export function SecretModal({ open, onClose }) {
  const t = useT()
  const reduce = useReducedMotion()
  const [stage, setStage] = useState(0) // 0 gemas armando, 1 tarjeta
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    if (!open) return
    setStage(reduce ? 1 : 0)
    setCopied(false)
    const timer = reduce ? 0 : setTimeout(() => setStage(1), 1500)
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { clearTimeout(timer); window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, reduce, onClose])

  const copy = async () => {
    try { await navigator.clipboard.writeText(CODE) } catch {
      const ta = document.createElement('textarea'); ta.value = CODE; document.body.appendChild(ta); ta.select()
      try { document.execCommand('copy') } catch { /* nada */ }
      ta.remove()
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="sx-back" role="dialog" aria-modal="true" aria-label={t('sx.i5')} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          {stage === 0 && (
            <div className="sx-assemble" aria-hidden>
              {GEMS.map(([k, c, dx, dy], i) => (
                <motion.span key={k} className="gem sx-gem" style={{ background: `linear-gradient(160deg, ${c}, ${c}cc)` }}
                  initial={{ x: dx * 140, y: dy * 160 - 120, opacity: 0, rotate: dx * 40, scale: 0.6 }}
                  animate={{ x: dx * 30, y: dy * 30, opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ delay: i * 0.18, type: 'spring', stiffness: 160, damping: 14 }} />
              ))}
            </div>
          )}
          {stage === 1 && (
            <motion.div className="sx-card" onClick={(e) => e.stopPropagation()}
              initial={reduce ? false : { scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}>
              <button className="sx-x" onClick={onClose} aria-label={t('sx.close')}><X size={20} /></button>
              <div className="sx-gems" aria-hidden>
                {GEMS.map(([k, c]) => <span key={k} className="gem" style={{ width: 22, height: 22, background: `linear-gradient(160deg, ${c}, ${c}cc)` }} />)}
              </div>
              <p className="sx-kicker">{t('sx.kicker')}</p>
              <h2 className="display sx-title">{t.up('sx.i5')}</h2>
              <p className="sx-sub">{t('sx.sub')}</p>
              <div className="sx-items">
                {ITEMS.map(([id, k], i) => (
                  <motion.figure key={id} initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 260, damping: 18 }}>
                    <img src={`/media/106/${id}.webp`} alt={t(`sx.i${i + 1}`)} width="240" height="240" loading="lazy" />
                    <figcaption><b>{t(`sx.i${i + 1}`)}</b><span>{t(`sx.t.${k}`)}</span></figcaption>
                  </motion.figure>
                ))}
              </div>
              <div className="sx-code">
                <code>{CODE}</code>
                <button className="btn3d sx-copy" onClick={copy}>{copied ? <><Check size={18} strokeWidth={3} /> {t('sx.copied')}</> : <><Copy size={18} strokeWidth={3} /> {t('sx.copy')}</>}</button>
              </div>
              <p className="sx-how">{t('sx.how')}<br /><small>{t('sx.need')}</small></p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
