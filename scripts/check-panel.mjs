// Chequeo del panel sin clave: sintaxis de cada archivo y de todos juntos, nombres
// globales (ámbito del IIFE) declarados dos veces y rutas/claves de objeto repetidas.
// Uso: node scripts/check-panel.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { parseAst } from 'rolldown/parseAst';

const dir = new URL('../admin/panel/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.js')).sort();
let bad = 0;
const fail = (m) => { bad++; console.log('✗', m); };

const lineOf = (src, pos) => src.slice(0, pos).split('\n').length;

// 1) sintaxis por archivo
for (const f of files) {
  try { parseAst(readFileSync(new URL(f, dir), 'utf8')); } catch (e) { fail(`sintaxis ${f}: ${e.message}`); }
}

// 2) todos juntos, igual que app.html: IIFE estricto
const head = '(function(){\n"use strict";\n';
let src = head; const spans = [];
for (const f of files) {
  const t = readFileSync(new URL(f, dir), 'utf8');
  spans.push({ f, from: src.length, to: src.length + t.length, base: src.length });
  src += t + '\n';
}
src += '})();';
let ast;
try { ast = parseAst(src); } catch (e) { fail('sintaxis conjunta: ' + e.message); process.exit(1); }
const body = ast.body[0].expression.callee.body.body;
const where = (pos) => { const s = spans.find((x) => pos >= x.from && pos < x.to + 1); return s ? `${s.f}:${lineOf(src.slice(s.from), pos - s.from)}` : '?'; };

const names = new Map();
const add = (n, kind, pos) => { (names.get(n) || names.set(n, []).get(n)).push({ kind, at: where(pos) }); };
const pat = (p, kind, pos) => {
  if (!p) return;
  if (p.type === 'Identifier') add(p.name, kind, pos);
  else if (p.type === 'ObjectPattern') p.properties.forEach((x) => pat(x.value || x.argument, kind, pos));
  else if (p.type === 'ArrayPattern') p.elements.forEach((x) => pat(x, kind, pos));
  else if (p.type === 'AssignmentPattern') pat(p.left, kind, pos);
  else if (p.type === 'RestElement') pat(p.argument, kind, pos);
};
for (const n of body) {
  if (n.type === 'FunctionDeclaration') add(n.id.name, 'function', n.start);
  else if (n.type === 'ClassDeclaration') add(n.id.name, 'class', n.start);
  else if (n.type === 'VariableDeclaration') n.declarations.forEach((d) => pat(d.id, n.kind, n.start));
}
for (const [n, l] of names) if (l.length > 1) fail(`global repetido «${n}»: ` + l.map((x) => `${x.kind}@${x.at}`).join(' | '));

// 2b) registros globales: `A.x = …`, `VIEWS['ruta'] = …`, `SQLF.x = …` asignados dos veces en el nivel superior
const regs = new Map();
const key = (m) => m.computed ? (m.property.type === 'Literal' ? String(m.property.value) : null) : m.property.name;
const topAssigns = (list) => {
  for (const n of list) {
    if (n.type === 'ExpressionStatement' && n.expression.type === 'AssignmentExpression' && n.expression.operator === '=') {
      const l = n.expression.left;
      if (l.type === 'MemberExpression' && l.object.type === 'Identifier') {
        const k = key(l); if (k == null) continue;
        const id = l.object.name + '.' + k;
        (regs.get(id) || regs.set(id, []).get(id)).push(where(n.start));
      }
    }
    if (n.type === 'ExpressionStatement' && n.expression.type === 'CallExpression' && n.expression.callee.type === 'FunctionExpression') topAssigns(n.expression.callee.body.body);
  }
};
topAssigns(body);
for (const [k, l] of regs) if (l.length > 1) fail(`registro repetido «${k}»: ` + l.join(' | '));

// 3) claves repetidas en literales de objeto y rutas `case`/`R.x` duplicadas
const walk = (n, fn) => {
  if (!n || typeof n.type !== 'string') return;
  fn(n);
  for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach((c) => walk(c, fn)); else if (v && typeof v.type === 'string') walk(v, fn); }
};
walk(ast, (n) => {
  if (n.type === 'ObjectExpression') {
    const seen = new Map();
    for (const p of n.properties) {
      if (p.type !== 'Property' || p.computed || p.kind !== 'init') continue;
      const k = p.key.name ?? String(p.key.value);
      if (seen.has(k)) fail(`clave repetida «${k}» en objeto @${where(p.start)}`);
      seen.set(k, 1);
    }
  }
  if (n.type === 'SwitchStatement') {
    const seen = new Set();
    for (const c of n.cases) {
      if (!c.test || c.test.type !== 'Literal') continue;
      if (seen.has(c.test.value)) fail(`case repetido «${c.test.value}» @${where(c.start)}`);
      seen.add(c.test.value);
    }
  }
});

console.log(bad ? `\n${bad} problema(s)` : `OK: ${files.length} archivos, ${names.size} globales, sin repetidos`);
process.exit(bad ? 1 : 0);
