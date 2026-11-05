import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion } from 'framer-motion'
import './styles.css'
import App from './App.jsx'
import { startOffscreenPause } from './perf.js'

const motionFeatures = () => import('./motion-features.js').then((m) => m.default)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LazyMotion features={motionFeatures}>
      <App />
    </LazyMotion>
  </StrictMode>,
)

startOffscreenPause()
