// Revisa que cada idioma de la landing tenga las mismas claves que es.js y los
// mismos marcadores ({n}, {t}, {name}, {v}, {heart}) y negritas (**).
//   node scripts/check-i18n.mjs [lang ...]
const ALL = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ru', 'tr', 'ar', 'hi', 'id', 'ja', 'ko', 'vi', 'zh']
const only = process.argv.slice(2)
const load = async (l) => (await import(new URL(`../src/i18n/${l}.js`, import.meta.url))).default
const es = await load('es')
const marks = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',') + '|' + ((s.match(/\*\*/g) || []).length)
let bad = 0
for (const l of only.length ? only : ALL) {
  let d
  try { d = await load(l) } catch (e) { console.log(`${l}: no carga (${e.message.split('\n')[0]})`); bad++; continue }
  const errs = []
  for (const k of Object.keys(es)) {
    if (typeof d[k] !== 'string' || !d[k].trim()) { errs.push(`falta ${k}`); continue }
    if (marks(d[k]) !== marks(es[k])) errs.push(`marcadores distintos en ${k}: «${d[k]}»`)
  }
  for (const k of Object.keys(d)) if (!(k in es)) errs.push(`clave sobrante ${k}`)
  if (l !== 'es' && l !== 'en') for (const k of Object.keys(es)) if (d[k] && d[k] === es[k] && es[k].length > 12 && !k.startsWith('foot.made')) errs.push(`igual al español (¿sin traducir?) ${k}`)
  console.log(`${l}: ${errs.length ? errs.join('\n   ') : 'ok'}`)
  bad += errs.length
}
process.exit(bad ? 1 : 0)
