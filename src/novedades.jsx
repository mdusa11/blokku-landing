import { Reveal } from './bits.jsx'
import { Showcase } from './showcase.jsx'
import { useT } from './i18n/index.js'
import './novedades.css'

/* Novedades 1.0.5 como nota de parche: el ranking manda, Personalizar se
   juega en el teléfono y lo demás va en lista con su captura real.
   Fuente: 01-Versiones/v1.0.5/textos-es-MX.md y la hoja «Novedades» de la app. */
const M = `${import.meta.env.BASE_URL}media/105/`

const LIST = [
  { n: '03', k: 'ach', c: 'var(--yellow)', img: 't_escalones', w: 640, h: 309 },
  { n: '04', k: 'lvl', c: 'var(--green)', img: 't_ruta', w: 640, h: 646 },
  { n: '05', k: 'evt', c: '#FF8A3D', img: 't_premios', w: 640, h: 621 },
  { n: '06', k: 'ext', c: 'var(--purple)', img: 't_logro', w: 640, h: 196 },
]

const ALSO = ['codes', 'widget', 'tut', 'bg']

export function Novedades() {
  const t = useT()
  return (
    <section id="novedades" className="sec-new">
      <div className="wrap">
        <Reveal>
          <article className="nv-rank">
            <div className="nv-rank-copy">
              <header className="nv-head">
                <p className="nv-ver">{t('nv.ver')}</p>
                <h2 className="display nv-title">{t.rich('nv.title', { v: <span>1.0.5</span> })}</h2>
              </header>
              <span className="nv-num" style={{ color: 'var(--blue)' }}>01</span>
              <h3 className="display nv-h3 nv-h3-big">{t('nv.rank.h')}</h3>
              <p className="nv-p">{t('nv.rank.p')}</p>
              <ul className="nv-facts">
                <li><i className="gem" style={{ background: 'linear-gradient(160deg,#4EA1FF,#4EA1FFcc)' }} />{t('nv.rank.f1')}</li>
                <li><i className="gem" style={{ background: 'linear-gradient(160deg,#FFC93C,#FFC93Ccc)' }} />{t('nv.rank.f2')}</li>
                <li><i className="gem" style={{ background: 'linear-gradient(160deg,#FF5D8F,#FF5D8Fcc)' }} />{t('nv.rank.f3')}</li>
              </ul>
              <p className="nv-note">{t('nv.rank.note')}</p>
            </div>
            <figure className="nv-rank-shot">
              <div className="phone nv-rank-phone">
                <img src={`${M}s_ranking.webp`} alt={t('nv.rank.alt')} width="540" height="1044" loading="lazy" decoding="async" />
              </div>
              <figcaption>{t('nv.rank.cap')}</figcaption>
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
                  <h3 className="nv-item-t">{t(`nv.${it.k}.t`)}</h3>
                  <p className="nv-p">{t(`nv.${it.k}.d`)}</p>
                </div>
                <img className="nv-thumb" src={`${M}${it.img}.webp`} alt="" width={it.w} height={it.h} loading="lazy" decoding="async" />
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal y={20}>
          <div className="nv-also">
            <p className="nv-also-t">{t('nv.also')}</p>
            <ul>
              {ALSO.map((k) => <li key={k}><b>{t(`nv.also.${k}.b`)}</b> {t(`nv.also.${k}.t`)}</li>)}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
