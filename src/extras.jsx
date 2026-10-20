// Publicada en producción el 2-oct-2026. En Android abre directo la app de Play.
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.dusasolutions.blokku'

export const APP_STORE_URL = 'https://apps.apple.com/mx/app/id6822583798'

export const isIOS = typeof navigator !== 'undefined' &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
export const STORE_URL = isIOS ? APP_STORE_URL : PLAY_URL

/* Badge de Google Play — lookalike propio (sin asset de marca). */
export function PlayBadge({ href = PLAY_URL }) {
  return (
    <a className="playbadge" href={href} target="_blank" rel="noopener noreferrer" aria-label="Disponible en Google Play">
      <svg className="pb-apple" viewBox="0 0 54 60" width="25" height="28" aria-hidden>
        <path d="M4 2 34 30 4 58c-2-1-3-3-3-5V7c0-2 1-4 3-5Z" fill="#34A853" />
        <path d="m34 30 9-9 9 5c3 2 3 6 0 8l-9 5Z" fill="#FBBC04" />
        <path d="M4 2c1-1 3-1 5 0l34 19-9 9Z" fill="#4285F4" />
        <path d="M4 58 34 30l9 9L9 58c-2 1-4 1-5 0Z" fill="#EA4335" />
      </svg>
      <span className="pb-txt">
        <span className="pb-small">DISPONIBLE EN</span>
        <span className="pb-big">Google Play</span>
      </span>
    </a>
  )
}

/* Badge de App Store — lookalike propio (sin asset de marca). */
export function AppStoreBadge({ href = APP_STORE_URL }) {
  return (
    <a className="playbadge" href={href} target="_blank" rel="noopener noreferrer" aria-label="Descárgalo en el App Store">
      <svg className="pb-apple" viewBox="0 0 384 512" width="24" height="28" aria-hidden fill="#fff">
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
      </svg>
      <span className="pb-txt">
        <span className="pb-small">Descárgalo en el</span>
        <span className="pb-big">App Store</span>
      </span>
    </a>
  )
}

/* Insignias en el orden de la plataforma: la de tu tienda primero. */
export function StoreBadges() {
  return isIOS ? <><AppStoreBadge /><PlayBadge /></> : <><PlayBadge /><AppStoreBadge /></>
}
