import { Globe } from 'lucide-react'
import { LANGS, setLang, useLang, useT } from './index.js'

/* Selector de idioma: un <select> nativo (accesible, y en móvil abre el selector del sistema). */
export function LangPicker({ className = '' }) {
  const lang = useLang()
  const t = useT()
  return (
    <label className={`langpick ${className}`}>
      <Globe size={15} strokeWidth={2.6} aria-hidden />
      <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t('lang.label')}>
        {LANGS.map(([c, n]) => <option key={c} value={c} lang={c}>{n}</option>)}
      </select>
    </label>
  )
}
