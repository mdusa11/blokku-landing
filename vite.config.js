import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// El sitio vive en la raíz de blokku.online (Cloudflare). Antes usaba el
// subpath /blokku-landing/ porque se servía desde GitHub Pages.
export default defineConfig({
  base: '/',
  plugins: [react()],
})
