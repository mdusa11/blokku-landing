// Estilos de la demo: aproximaciones ligeras (CSS + canvas) de los paquetes
// de la app. Cada uno trae paleta, celdas, fondo, marco y efecto de línea.
// El efecto vive en ./fx/<id>.js y se carga solo al elegir el estilo.

const hex2hsl = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (mx + mn) / 2
  if (mx !== mn) {
    const d = mx - mn
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
    h *= 60
  }
  return [h, s * 100, l * 100]
}
const hsl = (h, s, l) => `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${Math.max(0, Math.min(100, l)).toFixed(0)}%)`

// Misma cuenta que GemSpec de la app: arriba +12 de luz, abajo −14.
export const gemVars = (hex) => {
  const [h, s, l] = hex2hsl(hex)
  return { '--c': hex, '--t': hsl(h, s, l + 12), '--b': hsl(h, s, l - 14), '--d': hsl(h, s, l - 30) }
}

export const THEMES = [
  {
    id: 'clasico', name: 'Clásico', tag: 'Gratis', tagKind: 'free',
    colors: ['#00BCD4', '#E91E63', '#8BC34A', '#FF9800', '#9C27B0', '#FFEB3B', '#2196F3', '#FF5722'],
    beam: '#ffffff', light: false,
  },
  {
    id: 'blokki', name: 'Mundo Blokki', tag: 'Próximamente', tagKind: 'soon',
    colors: ['#4FB8FF', '#FF6FA3', '#6FD35E', '#FF9A3D', '#A98BFF', '#FFCF3A', '#FF5E5E', '#35D6A6'],
    beam: '#fff6c2', light: true, glyphs: true,
  },
  {
    id: 'espacio', name: 'Espacio', tag: 'Con el código ESPACIO', tagKind: 'code',
    colors: ['#2EB8A3', '#E9588C', '#5DAF4E', '#F0A32F', '#9B5DE5', '#E6D24A', '#3C7FE0', '#E2523C'],
    beam: '#9fe8ff', glyphs: true,
  },
  {
    id: 'neon', name: 'Neón', tag: 'En eventos', tagKind: 'event',
    colors: ['#29F0FF', '#FF2E9A', '#3DFF8B', '#FFB020', '#B04DFF', '#F5FF3D', '#3D7BFF', '#FF4D3D'],
    beam: '#29f0ff', glyphs: true,
  },
  {
    id: 'carnaval', name: 'Carnaval', tag: 'Pase de temporada', tagKind: 'pass',
    colors: ['#B45CE6', '#F2C94C', '#FF7A3D', '#2EC4E6', '#FF4F9A', '#7BC96F', '#3D8BFF', '#FF5A5A'],
    beam: '#ffe27a', glyphs: true, sign: '¡CARNAVAL!',
  },
  {
    id: 'dragon', name: 'Dragón', tag: 'Pase de temporada', tagKind: 'pass',
    colors: ['#E8483C', '#FF8A2B', '#FFC93C', '#2ECFC4', '#E85AA0', '#8FD14F', '#9B5CE6', '#3D9BFF'],
    beam: '#ffb14a',
  },
]

export const THEME = Object.fromEntries(THEMES.map((t) => [t.id, t]))

// Carga perezosa del efecto de cada estilo (chunk propio).
const loaders = {
  blokki: () => import('./fx/blokki.js'),
  espacio: () => import('./fx/espacio.js'),
  neon: () => import('./fx/neon.js'),
  carnaval: () => import('./fx/carnaval.js'),
  dragon: () => import('./fx/dragon.js'),
}
const cache = {}
export const loadFx = (id) => {
  if (!loaders[id]) return Promise.resolve(null)
  cache[id] ??= loaders[id]().then((m) => m.default).catch(() => null)
  return cache[id]
}
