/* ================= núcleo: utilidades, íconos, fechas, capas ================= */
var S = {
  route: 'inicio', qs: {}, ro: false, missing: {}, newSql: {}, booted: false,
  f: {}, open: {}, reveal: {}, view: {}
};
var A = {}, C = {}, I = {};
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function clone(o) { return o == null ? o : JSON.parse(JSON.stringify(o)); }
function uid(p) { return (p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function nf(n) { return Number(n || 0).toLocaleString('es-MX'); }
function pct(a, b) { return b ? (Math.round(a * 1000 / b) / 10).toLocaleString('es-MX') + ' %' : '—'; }
function plural(n, a, b) { return nf(n) + ' ' + (n === 1 ? a : (b || a + 's')); }
function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
function match(hay, q) { if (!q) return true; hay = norm(hay); return norm(q).split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) >= 0; }); }
function isHttps(u) { return /^https:\/\/[^\s<>"']+$/i.test(String(u || '')); }
function safeImg(u) { u = String(u || ''); return /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(u) || isHttps(u) ? u : ''; }
function by(k, dir) { return function (a, b) { var x = a[k], y = b[k]; return (x < y ? -1 : x > y ? 1 : 0) * (dir || 1); }; }
function debounce(fn, ms) { var t; return function () { var a = arguments, s = this; clearTimeout(t); t = setTimeout(function () { fn.apply(s, a); }, ms); }; }

/* ---------- íconos (trazos estilo Lucide) ---------- */
var ICP = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  live: 'M4.9 19.1a10 10 0 0 1 0-14.2M7.8 16.2a6 6 0 0 1 0-8.4M16.2 7.8a6 6 0 0 1 0 8.4M19.1 4.9a10 10 0 0 1 0 14.2|c12,12,2',
  ticket: 'M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4zM13 5v2M13 11v2M13 17v2',
  game: 'M6 12h4M8 10v4M15 13h.01M18 11h.01M17.3 5H6.7a4 4 0 0 0-3.96 3.43l-.7 4.9A3 3 0 0 0 5 17c1 0 1.9-.5 2.5-1.3L9 14h6l1.5 1.7c.6.8 1.5 1.3 2.5 1.3a3 3 0 0 0 2.96-3.67l-.7-4.9A4 4 0 0 0 17.3 5z',
  folder: 'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  sliders: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
  search: 'm21 21-4.3-4.3|c11,11,7',
  plus: 'M12 5v14M5 12h14', x: 'M18 6 6 18M6 6l12 12', check: 'M20 6 9 17l-5-5',
  chr: 'm9 18 6-6-6-6', chu: 'm18 15-6-6-6 6', chd: 'm6 9 6 6 6-6', chl: 'm15 18-6-6 6-6',
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  cal: 'M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 2v4M8 2v4M3 10h18',
  gift: 'M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  layers: 'm12 2 10 5-10 5L2 7zM2 17l10 5 10-5M2 12l10 5 10-5',
  tasks: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  bulb: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z',
  chart: 'M3 3v18h18M7 16v-4M12 16V8M17 16v-7',
  sticker: 'M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5zM15 3v6h6',
  key: 'm21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3|c7.5,15.5,5.5',
  refresh: 'M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5',
  copy: 'M9 11a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z|c12,12,3',
  eyeoff: 'M17.94 17.94A10 10 0 0 1 12 19c-6.5 0-10-7-10-7a18 18 0 0 1 5.06-5.94M9.9 4.24A9 9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24M1 1l22 22',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6',
  down: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  up: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12',
  image: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zm18 10-5-5L5 21|c8.5,8.5,1.5',
  cloud: 'M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z',
  wifioff: 'M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76M16.85 11.25a10 10 0 0 1 2.22 1.68M5 13a10 10 0 0 1 5.24-2.76M12 20h.01',
  warn: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  info: 'M12 16v-4M12 8h.01|c12,12,10',
  help: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01|c12,12,10',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z',
  sun: 'M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41|c12,12,4',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  dots: 'M5 12h.01M12 12h.01M19 12h.01',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  board: 'M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 3v18M15 3v18',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l4 2',
  clock: 'M12 6v6l4 2|c12,12,10',
  android: 'M5 18V9h14v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1zM5 9a7 7 0 0 1 14 0M8 3.5 9.5 6M16 3.5 14.5 6|c9.5,6.5,.5|c14.5,6.5,.5',
  apple: 'M12 7.5c-1.2-1.6-3.6-2-5-.6C5 8.8 5.4 13 7.4 16c1 1.5 2 3 3.4 3 .8 0 1.2-.5 1.9-.5s1 .5 1.9.5c1.4 0 2.4-1.5 3.4-3M12 7.5c-.2-2 .8-3.7 2.8-4.5',
  phone: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM12 18h.01',
  mega: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13',
  rocket: 'M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2zM9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5',
  spark: 'M12 3l1.9 5.8L20 10l-6.1 1.2L12 17l-1.9-5.8L4 10l6.1-1.2zM19 16l.7 2.1 2.1.7-2.1.7L19 21.6l-.7-2.1-2.1-.7 2.1-.7z',
  trend: 'M22 7 13.5 15.5 8.5 10.5 2 17M16 7h6v6',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z',
  power: 'M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10',
  ext: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  store: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2|c12,7,4',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  moonz: 'M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79zM15 4h4l-4 4h4',
  lock: 'M5 11h14v11H5zM7 11V7a5 5 0 0 1 10 0v4',
  db: 'M3 5c0-1.66 4-3 9-3s9 1.34 9 3-4 3-9 3-9-1.34-9-3zM3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4 3 9 3s9-1.34 9-3',
  play: 'M6 3l14 9-14 9z',
  hash: 'M4 9h16M4 15h16M10 3 8 21M16 3l-2 18',
  pause: 'M6 4h4v16H6zM14 4h4v16h-4z',
  dup: 'M8 8h12v12H8zM16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3'
};
function ic(n, cls) {
  var p = ICP[n] || ICP.info, parts = p.split('|'), s = '<svg class="i' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + parts[0] + '"/>';
  for (var i = 1; i < parts.length; i++) { var c = parts[i].slice(1).split(','); s += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '"/>'; }
  return s + '</svg>';
}

/* ---------- fechas ---------- */
var MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
var DSEM = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
function z2(n) { return (n < 10 ? '0' : '') + n; }
function ymd(d) { return d.getFullYear() + '-' + z2(d.getMonth() + 1) + '-' + z2(d.getDate()); }
function todayS() { return ymd(new Date()); }
function dn(s) { var p = String(s).split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5; }
function iso(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
function dayMs(s, end) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], end ? 23 : 0, end ? 59 : 0, end ? 59 : 0).getTime(); }
function fd(s, yr) { if (!s) return ''; var p = s.split('-'); var y = +p[0] !== new Date().getFullYear() || yr; return +p[2] + ' ' + MES[+p[1] - 1].slice(0, 3) + (y ? ' ' + p[0] : ''); }
function fdr(a, b) { return b && b !== a ? fd(a) + ' – ' + fd(b) : fd(a); }
function fdt(v, noTime) {
  if (!v) return '—'; var d = new Date(v); if (isNaN(d)) return '—';
  var s = d.getDate() + ' ' + MES[d.getMonth()].slice(0, 3) + (d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : '');
  return noTime ? s : s + ', ' + z2(d.getHours()) + ':' + z2(d.getMinutes());
}
function relDay(s) { var d = dn(s) - dn(todayS()); return d === 0 ? 'hoy' : d === 1 ? 'mañana' : d === -1 ? 'ayer' : d > 1 ? 'en ' + d + ' días' : 'hace ' + (-d) + ' días'; }
function relT(v) {
  var ms = new Date(v).getTime() - Date.now(), a = Math.abs(ms), n, u;
  if (a < 6e4) return ms > 0 ? 'en un momento' : 'hace un momento';
  if (a < 36e5) { n = Math.round(a / 6e4); u = 'min'; } else if (a < 864e5) { n = Math.round(a / 36e5); u = n === 1 ? 'hora' : 'horas'; } else { n = Math.round(a / 864e5); u = n === 1 ? 'día' : 'días'; }
  return ms > 0 ? 'en ' + n + ' ' + u : 'hace ' + n + ' ' + u;
}
function ago(t) { return t ? relT(t) : ''; }
function toLocalInput(v) { if (!v) return ''; var d = new Date(v); if (isNaN(d)) return ''; return ymd(d) + 'T' + z2(d.getHours()) + ':' + z2(d.getMinutes()); }
function fromLocalInput(v) { if (!v) return null; var d = new Date(v); return isNaN(d) ? null : d.toISOString(); }
function addMs(ms) { return new Date(Date.now() + ms); }

/* ---------- toasts ---------- */
function toast(msg, type, action) {
  var box = $('#toasts'), el = document.createElement('div');
  el.className = 'toast ' + (type || 'ok');
  el.setAttribute('role', type === 'bad' ? 'alert' : 'status');
  el.innerHTML = ic(type === 'bad' ? 'warn' : type === 'warn' ? 'info' : type === 'info' ? 'info' : 'check') + '<span>' + esc(msg) + '</span>' + (action ? '<button class="ta2">' + esc(action.label) + '</button>' : '');
  if (action) el.querySelector('.ta2').onclick = function () { action.fn(); kill(); };
  box.appendChild(el);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  var t = setTimeout(kill, action ? 6500 : type === 'bad' ? 6000 : 3200);
  function kill() { clearTimeout(t); el.classList.add('out'); setTimeout(function () { el.remove(); }, 200); }
}

/* ---------- capas: drawer, modal, lightbox ---------- */
var LAY = { dr: null, md: [] };
function lockScroll() { document.body.style.overflow = LAY.dr || LAY.md.length || LAY.pal ? 'hidden' : ''; }
function trapFocus(box, ev) {
  if (ev.key !== 'Tab') return;
  var f = $$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select,textarea,[tabindex="0"]', box).filter(function (e) { return e.offsetParent !== null; });
  if (!f.length) return;
  var a = f[0], b = f[f.length - 1];
  if (ev.shiftKey && document.activeElement === a) { b.focus(); ev.preventDefault(); }
  else if (!ev.shiftKey && document.activeElement === b) { a.focus(); ev.preventDefault(); }
}
/* spec: {title, sub, body(): html, foot(): html, wide, onMount(el), onClose(), dirty(): bool, key} */
function drawer(spec) {
  if (LAY.dr) drawerKill(true);
  var s = document.createElement('div'); s.className = 'scrim';
  var d = document.createElement('div'); d.className = 'drawer' + (spec.wide ? ' wide' : '') + (spec.auto ? ' auto' : '');
  d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
  $('#layer').appendChild(s); $('#layer').appendChild(d);
  LAY.dr = { spec: spec, el: d, scrim: s, back: document.activeElement };
  s.onclick = function () { drawerClose(); };
  d.addEventListener('keydown', function (e) { trapFocus(d, e); });
  drawerPaint(true);
  requestAnimationFrame(function () { s.classList.add('on'); d.classList.add('on'); });
  lockScroll();
}
function drawerPaint(first) {
  var D = LAY.dr; if (!D) return;
  var sp = D.spec, el = D.el, db = el.querySelector('.db'), sc = db ? db.scrollTop : 0;
  var ae = document.activeElement, fid = ae && el.contains(ae) && ae.id, sel = null, fval = fid && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT') && ae.type !== 'checkbox' && ae.type !== 'radio' ? ae.value : null;
  try { if (fid && ae.selectionStart != null) sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { }
  var t = typeof sp.title === 'function' ? sp.title() : sp.title;
  el.innerHTML = '<div class="grab"></div><div class="dh"><div class="tx"><h2 id="drt">' + (t || '') + '</h2>' + (sp.sub ? '<div class="sub">' + (typeof sp.sub === 'function' ? sp.sub() : sp.sub) + '</div>' : '') + '</div><button class="btn ghost ic sm" data-a="drClose" aria-label="Cerrar">' + ic('x') + '</button></div>' +
    '<div class="db">' + sp.body() + '</div>' + (sp.foot ? '<div class="df">' + sp.foot() + '</div>' : '');
  el.setAttribute('aria-labelledby', 'drt');
  el.querySelector('.db').scrollTop = first ? 0 : sc;
  if (sp.onMount) sp.onMount(el);
  if (fid) { var n = document.getElementById(fid); if (n) { if (fval != null) n.value = fval; n.focus(); if (sel) try { n.setSelectionRange(sel[0], sel[1]); } catch (e) { } } }
  else if (first) { var f = el.querySelector('[autofocus]') || el.querySelector('.dh .btn'); if (f) setTimeout(function () { try { f.focus({ preventScroll: true }); } catch (e) { } }, 30); }
}
function drawerRefresh() { if (LAY.dr) drawerPaint(false); }
async function drawerClose(force) {
  var D = LAY.dr; if (!D) return;
  if (!force && D.spec.dirty && D.spec.dirty()) {
    var ok = await confirmDlg({ title: '¿Salir sin guardar?', text: 'Tienes cambios que todavía no guardas.', ok: 'Salir sin guardar', danger: true });
    if (!ok) return;
  }
  drawerKill();
}
function drawerKill(instant) {
  var D = LAY.dr; if (!D) return; LAY.dr = null;
  if (D.spec.onClose) D.spec.onClose();
  D.el.classList.remove('on'); D.scrim.classList.remove('on');
  setTimeout(function () { D.el.remove(); D.scrim.remove(); }, instant ? 0 : 180);
  lockScroll();
  try { if (D.back && D.back.focus && document.body.contains(D.back)) D.back.focus({ preventScroll: true }); } catch (e) { }
}
function drawerVal(id) { var e = document.getElementById(id); if (!e) return ''; return e.type === 'checkbox' ? e.checked : e.value; }

function modal(html, opts) {
  opts = opts || {};
  return new Promise(function (res) {
    var s = document.createElement('div'); s.className = 'scrim top';
    var m = document.createElement('div'); m.className = 'modal' + (opts.big ? ' big' : ''); m.setAttribute('role', 'alertdialog'); m.setAttribute('aria-modal', 'true');
    m.innerHTML = html; $('#layer').appendChild(s); $('#layer').appendChild(m);
    var rec = { el: m, scrim: s, back: document.activeElement };
    LAY.md.push(rec); lockScroll();
    requestAnimationFrame(function () { s.classList.add('on'); m.classList.add('on'); });
    function done(v) {
      LAY.md.splice(LAY.md.indexOf(rec), 1);
      m.classList.remove('on'); s.classList.remove('on');
      setTimeout(function () { m.remove(); s.remove(); }, 160); lockScroll();
      try { if (rec.back && rec.back.focus) rec.back.focus({ preventScroll: true }); } catch (e) { }
      res(v);
    }
    rec.done = done;
    if (!opts.sticky) s.onclick = function () { done(null); };
    m.addEventListener('keydown', function (e) { trapFocus(m, e); });
    m.addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) { e.stopPropagation(); done(opts.read ? opts.read(b.dataset.m, m) : b.dataset.m); } });
    setTimeout(function () { var f = m.querySelector('[autofocus]') || m.querySelector('[data-m="ok"]') || m.querySelector('button'); if (f) f.focus(); }, 30);
    if (opts.mount) opts.mount(m, done);
  });
}
function confirmDlg(o) {
  return modal('<div class="mb"><div class="mi' + (o.danger ? ' bad' : '') + '">' + ic(o.icon || (o.danger ? 'trash' : 'help')) + '</div><h3>' + esc(o.title) + '</h3>' + (o.text ? '<p>' + esc(o.text) + '</p>' : '') + (o.html || '') + '</div>' +
    '<div class="mf"><button class="btn" data-m="no">' + esc(o.cancel || 'Cancelar') + '</button><button class="btn ' + (o.danger ? 'dng solid' : 'pri') + '" data-m="ok">' + esc(o.ok || 'Aceptar') + '</button></div>').then(function (v) { return v === 'ok'; });
}
function promptDlg(o) {
  return modal('<div class="mb"><h3>' + esc(o.title) + '</h3>' + (o.text ? '<p>' + esc(o.text) + '</p>' : '') + '<div class="f mt16"><label for="pdv">' + esc(o.label || '') + '</label><input class="in" id="pdv" autofocus value="' + esc(o.value || '') + '" placeholder="' + esc(o.ph || '') + '"></div></div>' +
    '<div class="mf"><button class="btn" data-m="no">Cancelar</button><button class="btn pri" data-m="ok">' + esc(o.ok || 'Guardar') + '</button></div>', {
    read: function (k, m) { return k === 'ok' ? m.querySelector('#pdv').value.trim() : null; },
    mount: function (m, done) { var i = m.querySelector('#pdv'); i.addEventListener('keydown', function (e) { if (e.key === 'Enter') done(i.value.trim()); }); }
  });
}
function lightbox(src, cap) {
  if (!safeImg(src)) return;
  var b = document.createElement('div'); b.className = 'lbox'; b.setAttribute('role', 'dialog');
  b.innerHTML = '<img alt="" src="' + esc(src) + '"><span>' + esc(cap || '') + ' · toca para cerrar</span>';
  b.onclick = function () { b.remove(); LAY.lb = null; };
  LAY.lb = b; document.body.appendChild(b);
}

/* ---------- copiar / descargar ---------- */
function copyTxt(t, msg) {
  function ok() { toast(msg || 'Copiado'); }
  try {
    if (navigator.clipboard && window.isSecureContext !== false) return navigator.clipboard.writeText(t).then(ok, fallback);
  } catch (e) { }
  fallback();
  function fallback() {
    var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); ok(); } catch (e) { toast('No se pudo copiar', 'bad'); }
    ta.remove();
  }
}
function download(name, text, type) {
  var b = new Blob([text], { type: type || 'text/plain;charset=utf-8' }), u = URL.createObjectURL(b), l = document.createElement('a');
  l.href = u; l.download = name; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
}
function csvCell(v) { v = v == null ? '' : String(v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function csv(rows) { return '﻿' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n'); }

/* ---------- piezas de UI reutilizables ---------- */
function chip(txt, cls, icn) { return '<span class="chip ' + (cls || '') + '">' + (icn ? ic(icn) : '<i></i>') + esc(txt) + '</span>'; }
function chipN(txt, cls) { return '<span class="chip ' + (cls || '') + '">' + esc(txt) + '</span>'; }
function emptyBox(icn, title, text, btn) { return '<div class="empty"><div class="ei">' + ic(icn) + '</div><b>' + esc(title) + '</b>' + (text ? '<p>' + esc(text) + '</p>' : '') + (btn || '') + '</div>'; }
function skel(n) { var h = ''; for (var i = 0; i < (n || 3); i++) h += '<div class="li"><div class="sk" style="width:44px;height:44px;border-radius:12px"></div><div class="t"><div class="sk skl" style="width:' + (40 + (i * 17) % 40) + '%"></div><div class="sk skl" style="width:' + (25 + (i * 23) % 30) + '%;height:11px"></div></div></div>'; return '<div class="list">' + h + '</div>'; }
function seg(name, cur, opts, extra) {
  return '<div class="seg' + (extra || '') + '" role="group">' + opts.map(function (o) { return '<button type="button" data-a="' + name + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (String(o[0]) === String(cur)) + '">' + (o[2] ? ic(o[2]) : '') + esc(o[1]) + '</button>'; }).join('') + '</div>';
}
function fchips(name, cur, opts) {
  return '<div class="chips">' + opts.map(function (o) { return '<button type="button" class="fchip" data-a="' + name + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (String(o[0]) === String(cur)) + '">' + esc(o[1]) + (o[2] != null ? ' <span class="n">' + o[2] + '</span>' : '') + '</button>'; }).join('') + '</div>';
}
function opts(list, cur) { return list.map(function (o) { var v = Array.isArray(o) ? o[0] : o, l = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(cur) ? ' selected' : '') + '>' + esc(l) + '</option>'; }).join(''); }
function searchBox(id, val, ph, act) { return '<label class="srch"><span class="sr">' + esc(ph) + '</span>' + ic('search') + '<input class="in" id="' + id + '" data-i="' + act + '" value="' + esc(val || '') + '" placeholder="' + esc(ph) + '" autocomplete="off"></label>'; }
function help(items) { return '<details class="help"><summary>' + ic('chr', 'chev') + '¿Cómo funciona?</summary><div class="hb">' + (Array.isArray(items) ? '<ul>' + items.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : items) + '</div></details>'; }
function pageHead(title, lead, acts, helpItems) {
  return '<div class="ph"><div class="tx"><h1>' + esc(title) + '</h1><p class="lead">' + lead + '</p>' + (helpItems ? help(helpItems) : '') + '</div>' + (acts ? '<div class="acts">' + acts + '</div>' : '') + '</div>';
}
function ring(p, size) {
  size = size || 44; var r = size / 2 - 4, c = 2 * Math.PI * r, o = c * (1 - Math.max(0, Math.min(1, p)));
  return '<svg class="ring" viewBox="0 0 ' + size + ' ' + size + '" style="width:' + size + 'px;height:' + size + 'px"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="var(--sunken)" stroke-width="5"/><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke="' + (p >= 1 ? 'var(--ok)' : 'var(--accent)') + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + o.toFixed(1) + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" style="font:700 ' + Math.round(size / 4) + 'px var(--font);fill:var(--text)">' + Math.round(p * 100) + '%</text></svg>';
}
function field(id, label, inner, hint) { return '<div class="f" id="f_' + id + '"><label for="' + id + '">' + esc(label) + '</label>' + inner + (hint ? '<div class="hint">' + hint + '</div>' : '') + '</div>'; }
function inp(id, val, o) { o = o || {}; return '<input class="in" id="' + id + '" type="' + (o.type || 'text') + '" value="' + esc(val == null ? '' : val) + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.min != null ? ' min="' + o.min + '"' : '') + (o.dis ? ' disabled' : '') + (o.auto ? ' autofocus' : '') + (o.di ? ' data-i="' + o.di + '"' : '') + (o.mode ? ' inputmode="' + o.mode + '"' : '') + ' autocomplete="off">'; }
function area(id, val, o) { o = o || {}; return '<textarea class="ta" id="' + id + '"' + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.di ? ' data-i="' + o.di + '"' : '') + (o.rows ? ' rows="' + o.rows + '"' : '') + '>' + esc(val || '') + '</textarea>'; }
function sel(id, val, list, o) { o = o || {}; return '<select class="sel" id="' + id + '"' + (o.dc ? ' data-c="' + o.dc + '"' : '') + '>' + opts(list, val) + '</select>'; }
function tog(id, on, label, o) { o = o || {}; return '<label class="tog"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + (o.dc ? ' data-c="' + o.dc + '"' : '') + '><span class="sw"></span><span>' + esc(label) + '</span></label>'; }
function radios(name, cur, list) {
  return '<div class="opts' + (list.length > 2 && list.every(function (x) { return !x[2] || x[2].length < 70; }) ? ' h' : '') + '">' + list.map(function (o) { return '<label class="opt"><input type="radio" name="' + name + '" value="' + esc(o[0]) + '"' + (String(o[0]) === String(cur) ? ' checked' : '') + '><div><b>' + esc(o[1]) + '</b>' + (o[2] ? '<span>' + esc(o[2]) + '</span>' : '') + '</div></label>'; }).join('') + '</div>';
}
function radioVal(name) { var e = document.querySelector('input[name="' + name + '"]:checked'); return e ? e.value : ''; }
function showErrs(errs) {
  $$('.f.bad').forEach(function (f) { f.classList.remove('bad'); var e = f.querySelector('.err'); if (e) e.remove(); });
  var first = null;
  Object.keys(errs).forEach(function (k) {
    var f = document.getElementById('f_' + k); if (!f) { toast(errs[k], 'bad'); return; }
    f.classList.add('bad'); f.insertAdjacentHTML('beforeend', '<div class="err">' + esc(errs[k]) + '</div>');
    if (!first) first = f;
  });
  if (first) { first.scrollIntoView({ block: 'center', behavior: 'smooth' }); var i = first.querySelector('input,select,textarea'); if (i) i.focus({ preventScroll: true }); }
  return !first && !Object.keys(errs).length;
}
