import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion } from 'framer-motion'
import './styles.css'
import App from './App.jsx'
import { startOffscreenPause } from './perf.js'
import { initI18n } from './i18n/index.js'

const motionFeatures = () => import('./motion-features.js').then((m) => m.default)

// El diccionario (y <html lang/dir>) quedan listos antes del primer render.
initI18n().finally(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <LazyMotion features={motionFeatures}>
        <App />
      </LazyMotion>
    </StrictMode>,
  )
})

startOffscreenPause()
