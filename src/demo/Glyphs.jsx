// Sprites SVG de los símbolos de cada estilo (uno por color). Se pintan una
// vez por estilo y las celdas los reusan con <use>: 64 celdas, cero peso extra.

const INK = '#1d1640'
const eyeRound = <><circle cx="14" cy="18" r="3" fill={INK} /><circle cx="26" cy="18" r="3" fill={INK} /><circle cx="15" cy="17" r="1" fill="#fff" /><circle cx="27" cy="17" r="1" fill="#fff" /></>
const mouthOpen = <path d="M15 24q5 7 10 0z" fill={INK} />
const cheeks = <><ellipse cx="10" cy="24" rx="3" ry="1.8" fill="#ff7aa0" opacity=".45" /><ellipse cx="30" cy="24" rx="3" ry="1.8" fill="#ff7aa0" opacity=".45" /></>
const st = { fill: 'none', stroke: INK, strokeWidth: 2.4, strokeLinecap: 'round', strokeLinejoin: 'round' }

const BLOKKI = [
  <g key="0">{cheeks}<path d="M11 19q3-4 6 0M23 19q3-4 6 0" {...st} />{mouthOpen}</g>,
  <g key="1">{cheeks}{eyeRound}<path d="M15 24q5 4 10 0" {...st} /></g>,
  <g key="2">{cheeks}<path d="M14 13l1.5 3.2 3.4.4-2.5 2.3.7 3.4-3.1-1.7-3.1 1.7.7-3.4-2.5-2.3 3.4-.4zM26 13l1.5 3.2 3.4.4-2.5 2.3.7 3.4-3.1-1.7-3.1 1.7.7-3.4-2.5-2.3 3.4-.4z" fill="#ffd23f" stroke={INK} strokeWidth="1" />{mouthOpen}</g>,
  <g key="3">{cheeks}<path d="M14 21l-3.5-3.3a2.2 2.2 0 013.5-2.6 2.2 2.2 0 013.5 2.6zM26 21l-3.5-3.3a2.2 2.2 0 013.5-2.6 2.2 2.2 0 013.5 2.6z" fill="#ff3d6e" /><path d="M15 25q5 4 10 0" {...st} /></g>,
  <g key="4">{cheeks}<path d="M11 15l5 3-5 3M29 15l-5 3 5 3" {...st} />{mouthOpen}</g>,
  <g key="5">{cheeks}<circle cx="14" cy="18" r="3" fill={INK} /><path d="M23 18.5q3-3 6 0" {...st} /><path d="M15 24q5 4 10 0" {...st} /></g>,
  <g key="6"><path d="M10 13l7 3M30 13l-7 3" {...st} /><circle cx="15" cy="19" r="2.6" fill={INK} /><circle cx="25" cy="19" r="2.6" fill={INK} /><path d="M15 27q5-4 10 0" {...st} /></g>,
  <g key="7">{cheeks}{eyeRound}<ellipse cx="20" cy="26" rx="3" ry="3.6" fill={INK} /></g>,
]

const plate = <rect x="8" y="9" width="24" height="23" rx="5" fill="rgba(255,255,255,.26)" stroke="rgba(0,0,0,.32)" strokeWidth="1.6" />
const ic = { fill: '#fff', stroke: 'rgba(0,0,0,.5)', strokeWidth: 1.4, strokeLinejoin: 'round' }
const icS = { fill: 'none', stroke: '#fff', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
const ESPACIO = [
  <g key="0">{plate}<path d="M17.5 14h5v5h5v5h-5v5h-5v-5h-5v-5h5z" {...ic} /></g>,
  <g key="1">{plate}<path d="M20 13l2 5.5 5.5 2-5.5 2-2 5.5-2-5.5-5.5-2 5.5-2z" {...ic} /></g>,
  <g key="2">{plate}<path d="M20 13l7 7h-4v8h-6v-8h-4z" {...ic} /></g>,
  <g key="3">{plate}<circle cx="20" cy="20.5" r="6" {...icS} /><circle cx="20" cy="20.5" r="2" fill="#fff" /></g>,
  <g key="4">{plate}<path d="M13 24a7 7 0 0114 0" {...icS} /><path d="M20 24l4-5" {...icS} /></g>,
  <g key="5">{plate}<path d="M14 16h12M14 20.5h12M14 25h8" {...icS} /></g>,
  <g key="6">{plate}<path d="M13 14h14v13H13zM17.7 14v13M22.3 14v13M13 20.5h14" fill="none" stroke="#fff" strokeWidth="1.8" /></g>,
  <g key="7">{plate}<path d="M20 13l8 14H12z" {...ic} /><path d="M20 18v4.5" stroke={INK} strokeWidth="2" strokeLinecap="round" /><circle cx="20" cy="25" r="1.1" fill={INK} /></g>,
]

const ne = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' }
const NEON = [
  <path key="0" d="M20 10l8.7 5v10L20 30l-8.7-5V15z" {...ne} />,
  <path key="1" d="M20 9l10 11-10 11-10-11z" {...ne} />,
  <path key="2" d="M20 10l10 18H10z" {...ne} />,
  <g key="3"><rect x="11" y="11" width="18" height="18" rx="2" {...ne} /><rect x="16" y="16" width="8" height="8" {...ne} /></g>,
  <path key="4" d="M20 9l2.5 8.5L31 20l-8.5 2.5L20 31l-2.5-8.5L9 20l8.5-2.5z" {...ne} />,
  <path key="5" d="M16 10h8v6h6v8h-6v6h-8v-6h-6v-8h6z" {...ne} />,
  <path key="6" d="M11 12l8 8-8 8M20 12l8 8-8 8" {...ne} />,
  <g key="7"><path d="M14 14a9 9 0 1012 0" {...ne} /><path d="M20 10v10" {...ne} /></g>,
]

const med = <circle cx="20" cy="20" r="10.5" fill="rgba(255,255,255,.9)" stroke="rgba(0,0,0,.35)" strokeWidth="1.4" />
const cv = { fill: 'none', stroke: INK, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }
const CARNAVAL = [
  <g key="0">{med}<path d="M20 13.5l1.9 4 4.4.5-3.3 3 .9 4.3-3.9-2.2-3.9 2.2.9-4.3-3.3-3 4.4-.5z" fill={INK} /></g>,
  <g key="1">{med}<path d="M13 18q7-3 14 0-1 6-4 6-2 0-3-2-1 2-3 2-3 0-4-6z" fill={INK} /><circle cx="17" cy="19.5" r="1.3" fill="#fff" /><circle cx="23" cy="19.5" r="1.3" fill="#fff" /></g>,
  <g key="2">{med}<path d="M20 13l6 7-6 7-6-7z" fill={INK} /></g>,
  <g key="3">{med}<circle cx="20" cy="20" r="2.6" fill={INK} /><path d="M20 13v3M20 24v3M13 20h3M24 20h3M15 15l2 2M23 23l2 2M25 15l-2 2M17 23l-2 2" {...cv} /></g>,
  <g key="4">{med}<path d="M15 26q0-10 10-12-1 10-10 12zM15 26l6-7" {...cv} /></g>,
  <g key="5">{med}<path d="M15 14q10 1 0 4t0 4 0 4q10 1 10 1" {...cv} /></g>,
  <g key="6">{med}<rect x="14" y="17" width="12" height="9" rx="2" {...cv} /><path d="M14 20h12M16 14l2 3M24 14l-2 3" {...cv} /></g>,
  <g key="7">{med}<path d="M20 26l-5.5-5.2a3.3 3.3 0 015.5-3.9 3.3 3.3 0 015.5 3.9z" fill={INK} /></g>,
]

const SETS = { blokki: BLOKKI, espacio: ESPACIO, neon: NEON, carnaval: CARNAVAL }

export function GlyphDefs({ theme }) {
  const set = SETS[theme]
  if (!set) return null
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <defs>
        {set.map((g, i) => <symbol key={i} id={`dg-${theme}-${i}`} viewBox="0 0 40 40">{g}</symbol>)}
      </defs>
    </svg>
  )
}

export const Glyph = ({ theme, i }) => (
  <svg className="gl" viewBox="0 0 40 40" aria-hidden><use href={`#dg-${theme}-${i}`} /></svg>
)
