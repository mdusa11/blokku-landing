// Animaciones de framer-motion en un chunk aparte: el bundle inicial solo
// lleva los componentes `m` (LazyMotion) y esto llega después del primer pintado.
export { domAnimation as default } from 'framer-motion'
