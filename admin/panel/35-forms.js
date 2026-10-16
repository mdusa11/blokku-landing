/* ================= piezas de formularios ================= */
/* selector de premios con buscador. key = cid (por defecto) o id del premio */
var PK = {};
function picker(name, sel, o) {
  o = o || {}; PK[name] = { sel: (sel || []).slice(), q: '', single: !!o.single, by: o.by || 'cid', onChange: o.onChange || null, extra: o.extra || [] };
  return '<div class="pk" id="pk_' + name + '">' + pkInner(name) + '</div>';
}
function pkList(name) {
  var P = PK[name], q = P.q, L = items('premios').filter(function (p) { return P.by === 'id' || p.cid; });
  return L.filter(function (p) { return match(p.nombre + ' ' + p.tipo + ' ' + p.rareza + ' ' + (p.cid || '') + ' ' + (GANA[p.gana] || ''), q); })
    .sort(function (a, b) { return RAR.indexOf(b.rareza) - RAR.indexOf(a.rareza) || (a.nombre < b.nombre ? -1 : 1); });
}
function pkKey(name, p) { return PK[name].by === 'id' ? p.id : p.cid; }
function pkName(name, k) { var p = PK[name].by === 'id' ? prem(k) : pc(k); return p ? p.nombre : k + ' (no está en el catálogo)'; }
function pkInner(name) {
  var P = PK[name];
  var h = '<div class="pkh">' + (P.sel.length ? P.sel.map(function (k) { var p = P.by === 'id' ? prem(k) : pc(k); return '<button type="button" class="pkc" data-a="pkTog" data-p="' + name + '" data-k="' + esc(k) + '" aria-label="Quitar ' + esc(pkName(name, k)) + '">' + (p ? thumb(p) : '') + esc(pkName(name, k)) + ic('x') + '</button>'; }).join('') : '<span class="mut">' + (P.single ? 'Ninguno elegido' : 'Ningún premio elegido todavía') + '</span>') + '</div>';
  h += '<div class="pks">' + searchBox('pkq_' + name, P.q, 'Buscar premio por nombre, tipo o rareza…', 'pkQ').replace('<input ', '<input data-p="' + name + '" ') + '</div>';
  return h + '<div class="pkl" id="pkl_' + name + '" data-keep="pkl_' + name + '">' + pkRows(name) + '</div>';
}
function pkRows(name) {
  var P = PK[name], L = pkList(name);
  return L.map(function (p) { var k = pkKey(name, p), on = P.sel.indexOf(k) >= 0; return '<button type="button" class="pkr" data-a="pkTog" data-p="' + name + '" data-k="' + esc(k) + '" aria-pressed="' + on + '">' + thumb(p) + '<span class="t">' + esc(p.nombre) + '<span>' + esc(p.tipo) + ' · ' + esc(p.rareza) + '</span></span><span class="ck">' + ic('check') + '</span></button>'; }).join('') || '<div class="empty" style="padding:18px">Ningún premio con esa búsqueda.</div>';
}
A.pkTog = function (el) {
  var P = PK[el.dataset.p]; if (!P) return; var k = el.dataset.k, i = P.sel.indexOf(k);
  if (i >= 0) P.sel.splice(i, 1); else if (P.single) P.sel = [k]; else P.sel.push(k);
  var box = document.getElementById('pk_' + el.dataset.p), l = document.getElementById('pkl_' + el.dataset.p), sc = l ? l.scrollTop : 0;
  if (box) { box.innerHTML = pkInner(el.dataset.p); var l2 = document.getElementById('pkl_' + el.dataset.p); if (l2) l2.scrollTop = sc; }
  if (P.onChange) P.onChange(P.sel);
};
I.pkQ = function (el) { var P = PK[el.dataset.p]; P.q = el.value; var l = document.getElementById('pkl_' + el.dataset.p); if (l) { l.innerHTML = pkRows(el.dataset.p); l.scrollTop = 0; } };
function pkSel(name) { return PK[name] ? PK[name].sel.slice() : []; }

/* firma del formulario para avisar si se sale sin guardar */
function formSig(root) {
  if (!root) return '';
  return $$('input,select,textarea', root).filter(function (x) { return !/^pkq_/.test(x.id) && x.id !== 'palq'; }).map(function (x) { return x.type === 'checkbox' || x.type === 'radio' ? (x.checked ? 1 : 0) : x.value; }).join('\u0001') + '|' + Object.keys(PK).map(function (k) { return PK[k].sel.join(','); }).join(';');
}
function formDrawer(spec) {
  var sig = null;
  var mount = spec.onMount;
  spec.onMount = function (el) { if (mount) mount(el); if (sig === null) sig = formSig(el.querySelector('.db')); };
  spec.dirty = function () { return LAY.dr && sig !== null && formSig(LAY.dr.el.querySelector('.db')) !== sig; };
  spec.markClean = function () { sig = null; };
  drawer(spec);
}
function busy(btn, on, txt) {
  if (!btn) return;
  if (on) { btn.dataset.html = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span>' + esc(txt || 'Guardando…'); }
  else { btn.disabled = false; if (btn.dataset.html) btn.innerHTML = btn.dataset.html; }
}
function presetBtns(target, list) {
  return '<div class="presets">' + list.map(function (p) { return '<button type="button" class="btn xs" data-a="preset" data-t="' + target + '" data-ms="' + p[0] + '">' + esc(p[1]) + '</button>'; }).join('') + '</div>';
}
A.preset = function (el) {
  var t = el.dataset.t.split(','), ms = Number(el.dataset.ms), a = document.getElementById(t[0]), b = document.getElementById(t[1]);
  if (a) a.value = toLocalInput(new Date(Date.now() - 60000)); if (b) b.value = toLocalInput(addMs(ms));
  if (a) a.dispatchEvent(new Event('input', { bubbles: true }));
};
