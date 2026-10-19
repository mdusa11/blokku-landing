import { Reveal } from './bits.jsx'
import { Showcase } from './showcase.jsx'
import './novedades.css'

/* Novedades 1.0.5 como nota de parche: el ranking manda, Personalizar se
   juega en el teléfono y lo demás va en lista con su captura real.
   Fuente: 01-Versiones/v1.0.5/textos-es-MX.md y la hoja «Novedades» de la app. */
const M = `${import.meta.env.BASE_URL}media/105/`

const LIST = [
  { n: '03', c: 'var(--yellow)', t: 'Logros por escalones',
    d: 'Cada logro tiene Bronce, Plata, Oro, Diamante e Imposible. El Imposible de puntos pide 2,5 millones en una sola partida.',
    img: 't_escalones', w: 640, h: 309 },
  { n: '04', c: 'var(--green)', t: 'Niveles hasta el 100',
    d: 'Cada partida da XP. Subes por una ruta con marcos, estilos y efectos, y si se te juntan los cofres, «Abrir todos».',
    img: 't_ruta', w: 640, h: 646 },
  { n: '05', c: '#FF8A3D', t: 'Eventos de temporada',
    d: 'Halloween, Día de Muertos, Navidad y más, por tiempo limitado. En Halloween juegas 5 partidas y te llevas el paquete Noche de Brujas.',
    img: 't_premios', w: 640, h: 621 },
  { n: '06', c: 'var(--purple)', t: 'Extras que se ganan jugando',
    d: 'No todo se desbloquea por nivel: algunos logros traen premio. Limpias 250 líneas y te cae el tema Bosque.',
    img: 't_logro', w: 640, h: 196 },
]

const ALSO = [
  ['Códigos canjeables', 'en Ajustes › Canjear código.'],
  ['Widget de racha', 'para ver tus días seguidos desde la pantalla de inicio.'],
  ['Tutorial nuevo', 'que te enseña a jugar en unos cuantos pasos.'],
  ['Fondos más fluidos', 'y mejor rendimiento en general.'],
]

export function Novedades() {
  return (
    <section id="novedades" className="sec-new">
      <div className="wrap">
        <Reveal>
          <article className="nv-rank">
            <div className="nv-rank-copy">
              <header className="nv-head">
                <p className="nv-ver">Versión 1.0.5 · ya en Google Play y App Store</p>
                <h2 className="display nv-title">Lo nuevo de la <span>1.0.5</span></h2>
              </header>
              <span className="nv-num" style={{ color: 'var(--blue)' }}>01</span>
              <h3 className="display nv-h3 nv-h3-big">Ranking mundial y de tu país</h3>
              <p className="nv-p">
                Juega Clásico, Contra reloj o el reto del día y mira en qué lugar quedas:
                contra todo el mundo o nomás contra tu país.
              </p>
              <ul className="nv-facts">
                <li><i className="gem" style={{ background: 'linear-gradient(160deg,#4EA1FF,#4EA1FFcc)' }} />La tabla semanal se reinicia cada lunes.</li>
                <li><i className="gem" style={{ background: 'linear-gradient(160deg,#FFC93C,#FFC93Ccc)' }} />Solo cuenta tu mejor puntuación.</li>
                <li><i className="gem" style={{ background: 'linear-gradient(160deg,#FF5D8F,#FF5D8Fcc)' }} />El reto diario es el mismo tablero para todos.</li>
              </ul>
              <p className="nv-note">
                Es opcional y usa internet. No pide cuenta: eliges un nombre y listo.
                Desde Ajustes te sales y borras tus datos cuando quieras.
              </p>
            </div>
            <figure className="nv-rank-shot">
              <div className="phone nv-rank-phone">
                <img src={`${M}s_ranking.webp`} alt="Ranking semanal mundial en Blokku 1.0.5" width="540" height="1044" loading="lazy" decoding="async" />
              </div>
              <figcaption>Captura real; los nombres van difuminados.</figcaption>
            </figure>
          </article>
        </Reveal>

        <Reveal>
          <Showcase />
        </Reveal>

        <ol className="nv-list">
          {LIST.map((it, i) => (
            <Reveal key={it.n} y={30}>
              <li className={`nv-item${i % 2 ? ' alt' : ''}`}>
                <span className="nv-num" style={{ color: it.c }}>{it.n}</span>
                <div className="nv-item-copy">
                  <h3 className="nv-item-t">{it.t}</h3>
                  <p className="nv-p">{it.d}</p>
                </div>
                <img className="nv-thumb" src={`${M}${it.img}.webp`} alt="" width={it.w} height={it.h} loading="lazy" decoding="async" />
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal y={20}>
          <div className="nv-also">
            <p className="nv-also-t">Y también:</p>
            <ul>
              {ALSO.map(([b, t]) => <li key={b}><b>{b}</b> {t}</li>)}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
