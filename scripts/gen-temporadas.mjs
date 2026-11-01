// Genera admin/panel/datos-temporadas.js (var TPD) con el contenido de los pases de la app:
// niveles, carril gratis y premium, nombres, rareza y exclusivos de cada cosmético.
// Lee lib/pase/temporada_*.json, lib/models/cosmetic.dart, lib/paquetes/*.dart,
// lib/l10n/l10n_data.dart y lib/l10n/generado/app_es.arb de la app.
// Se corre al cambiar las temporadas:
//   node scripts/gen-temporadas.mjs [/ruta/a/lib]      (por defecto /tmp/bt-20/lib o $BLOKKU_LIB)
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';

const LIB = process.argv[2] || process.env.BLOKKU_LIB || '/tmp/bt-20/lib';
if (!existsSync(`${LIB}/pase`)) { console.error('No encuentro ' + LIB + '/pase. Pasa la ruta de lib/ de la app.'); process.exit(1); }
const rd = (p) => readFileSync(`${LIB}/${p}`, 'utf8');

// --- temporadas
const files = readdirSync(`${LIB}/pase`).filter((f) => /^temporada_\d+\.json$/.test(f)).sort((a, b) => parseInt(a.match(/\d+/)) - parseInt(b.match(/\d+/)));
const temps = files.map((f) => JSON.parse(rd('pase/' + f)));

// --- ARB en español
const arb = JSON.parse(rd('l10n/generado/app_es.arb'));
const txt = (k) => (typeof arb[k] === 'string' ? arb[k].replace(/\{[^}]*\}/g, '').trim() : null);

// --- cosméticos: id, tipo y rareza (models/ + paquetes/)
const dartFiles = ['models/cosmetic.dart', ...readdirSync(`${LIB}/paquetes`).filter((f) => f.endsWith('.dart')).map((f) => 'paquetes/' + f)];
const cos = {}; // id -> {k, r, file, fx}
const balanced = (s, i) => { let d = 0; for (let j = i; j < s.length; j++) { if (s[j] === '(') d++; else if (s[j] === ')' && --d === 0) return s.slice(i, j + 1); } return s.slice(i); };
const textosPorArchivo = {};
for (const f of dartFiles) {
  const s = rd(f);
  for (const m of s.matchAll(/Cosmetic\(\s*id:\s*'([^']+)'/g)) {
    const blk = balanced(s, m.index + 'Cosmetic'.length);
    const k = blk.match(/kind:\s*CosmeticKind\.(\w+)/), r = blk.match(/rarity:\s*Rarity\.(\w+)/), fx = blk.match(/effect:\s*LineEffect\.(\w+)/);
    if (k && r) cos[m[1]] = { k: k[1], r: r[1], file: f, fx: fx && fx[1] };
  }
  const t = s.indexOf('TextosPaquete(');
  if (t >= 0) {
    const blk = balanced(s, t + 'TextosPaquete'.length), o = {};
    for (const m of blk.matchAll(/\b(tema|piezas|efecto|marco|insignia|titulo):\s*\(\s*l\.(\w+)/g)) o[m[1]] = m[2];
    o.otros = {};
    for (const m of blk.matchAll(/'([^']+)':\s*\(\s*l\.(\w+)/g)) o.otros[m[1]] = m[2];
    textosPorArchivo[f] = o;
  }
}
const CAMPO = { theme: 'tema', pieceStyle: 'piezas', lineEffect: 'efecto', frame: 'marco', badge: 'insignia', title: 'titulo' };
const ld = rd('l10n/l10n_data.dart');
const porId = {}; for (const m of ld.matchAll(/'([a-z_0-9]+)'\s*=>\s*(\w+),/g)) porId[m[1]] = m[2];
const porFx = {}; for (const m of ld.matchAll(/LineEffect\.(\w+)\s*=>\s*(\w+),/g)) porFx[m[1]] = m[2];
function nombre(id) {
  const c = cos[id]; if (!c) return null;
  const tp = textosPorArchivo[c.file];
  const key = (tp && (tp.otros[id] || tp[CAMPO[c.k]])) || porId[id] || (c.fx && porFx[c.fx]);
  return key ? txt(key) : null;
}

// --- exclusivos (lib/pase/pase_exclusivos.dart)
const ex = rd('pase/pase_exclusivos.dart');
const paquetesPase = [...(ex.match(/kPaquetesPase\s*=\s*<String>\{([^}]*)\}/)?.[1] || '').matchAll(/'([^']+)'/g)].map((m) => m[1]);
const reTemp = new RegExp(ex.match(/RegExp\(r'([^']+)'\)/)[1]);
const esExclusivo = (id) => reTemp.test(id) || paquetesPase.some((p) => id.endsWith('_' + p));

// --- salida
const usados = new Set();
const item = (r) => {
  if (r.t === 'cosmetico') { const ids = r.ids || [r.id]; ids.forEach((i) => usados.add(i)); return { t: 'c', ids, ...(r.paquete ? { paquete: r.paquete } : {}) }; }
  const t = { bloques: 'b', cofre: 'f', protector: 'p', gemas: 'g' }[r.t];
  if (!t) throw new Error('premio desconocido: ' + JSON.stringify(r));
  return { t, n: r.n };
};
const T = temps.map((t) => ({
  id: t.id, numero: t.numero, inicio: t.inicio, fin: t.fin,
  nombre: { es: t.nombre.es, en: t.nombre.en }, lema: { es: t.lema.es, en: t.lema.en },
  xp_nivel: t.xp_nivel, plus_niveles: t.tienda?.plus_niveles ?? 0,
  niveles: t.niveles.map((n) => ({ n: n.n, ...(n.destacado ? { d: 1 } : {}), g: n.gratis.map(item), p: n.premium.map(item) })),
}));
const C = {}, sin = [];
for (const id of [...usados].sort()) {
  const c = cos[id], nm = nombre(id);
  if (!c) { sin.push(id + ' (sin tipo/rareza)'); C[id] = { n: id, k: '?', r: 'common' }; continue; }
  if (!nm) sin.push(id + ' (sin nombre)');
  C[id] = { n: nm || id, k: c.k, r: c.r, ...(esExclusivo(id) ? { x: 1 } : {}) };
}
const out = '/* GENERADO por scripts/gen-temporadas.mjs desde lib/pase/*.json, lib/models, lib/paquetes y el ARB en español de la app. No editar a mano. */\n' +
  'var TPD = ' + JSON.stringify({ temporadas: T, cosm: C }) + ';\n';
writeFileSync(new URL('../admin/panel/datos-temporadas.js', import.meta.url), out);
console.log(`datos-temporadas.js: ${T.length} temporadas, ${Object.keys(C).length} cosméticos, ${Object.values(C).filter((c) => c.x).length} exclusivos`);
if (sin.length) { console.log('SIN RESOLVER (' + sin.length + '):\n  ' + sin.join('\n  ')); process.exitCode = 2; }
