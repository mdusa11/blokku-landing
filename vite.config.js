import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: sirve desde el subpath del repo en GitHub Pages
// (mdusa11.github.io/blokku-landing/). En dev queda en '/'.
export default defineConfig({
  base: '/blokku-landing/',
  plugins: [react()],
})
