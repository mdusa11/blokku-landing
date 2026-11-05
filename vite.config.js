import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Precarga las fuentes que pinta el hero (logo/títulos y texto): sin esto el
// navegador no las pide hasta terminar de leer el CSS.
const PRELOAD_FONTS = /(luckiestguy|fredoka)-[\w-]+\.woff2$/
const preloadFonts = () => ({
  name: 'preload-fonts',
  apply: 'build',
  transformIndexHtml: {
    order: 'post',
    handler(html, { bundle }) {
      const tags = Object.keys(bundle || {}).filter((f) => PRELOAD_FONTS.test(f)).map((f) => ({
        tag: 'link', injectTo: 'head-prepend',
        attrs: { rel: 'preload', href: `/${f}`, as: 'font', type: 'font/woff2', crossorigin: '' },
      }))
      return { html, tags }
    },
  },
})

// https://vite.dev/config/
// El sitio vive en la raíz de blokku.online (Cloudflare). Antes usaba el
// subpath /blokku-landing/ porque se servía desde GitHub Pages.
export default defineConfig({
  base: '/',
  plugins: [react(), preloadFonts()],
})
