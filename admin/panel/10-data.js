/* ================= datos: Supabase, secciones, mezcla, migración ================= */
var SB_URL = 'https://fngbputjfnwtrcwaabue.supabase.co', SBK = 'sb_publishable_uSMrnJx7qRj2HU2yuyTs9A_y5eL514_';
(function () { try { if (typeof PREVIEW !== 'undefined' && PREVIEW) { var o = new URLSearchParams(location.search).get('sb'); if (o && /^http:\/\/127\.0\.0\.1:\d+$/.test(o)) SB_URL = o; } } catch (e) { } })();
var LEGACY = 'blokku_admin_doc', CACHE = 'bk_panel_cache_v2';
var SQLF = { canjes: '1-canjes.sql', remoto: '2-remoto.sql', panel: '3-panel.sql', ranking: '4-ranking.sql', errores: '5-errores.sql' };
var FNF = { resumen_canjes: 'canjes', config_remota: 'remoto', admin_codigos: 'remoto', admin_eventos: 'remoto', admin_avisos: 'remoto', admin_crear_codigos: 'remoto', admin_editar_codigo: 'remoto', admin_borrar_codigo: 'remoto', admin_guardar_evento: 'remoto', admin_borrar_evento: 'remoto', admin_guardar_aviso: 'remoto', admin_borrar_aviso: 'remoto', admin_ranking: 'ranking', admin_moderar: 'ranking', admin_ranking_resumen: 'ranking', admin_ranking_config: 'ranking', admin_errores: 'errores', admin_error_estado: 'errores' };
function key() {
  try { var k = sessionStorage.getItem('bk_k'); if (k) return k; } catch (e) { }
  try { var r = JSON.parse(localStorage.getItem('bk_k_rem') || 'null'); if (r && r.k && r.exp > Date.now()) return r.k; } catch (e) { }
  return '';
}

function remembered() { try { var r = JSON.parse(localStorage.getItem('bk_k_rem') || 'null'); return r && r.k && r.exp > Date.now() ? r.exp : 0; } catch (e) { return 0; } }

function rpc(fn, p, o) {
  o = o || {}; p = p || {};
  if (!o.anon) p.p_clave = key();
  var ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  var to = setTimeout(function () { if (ctl) ctl.abort(); }, o.timeout || 25000);
  return fetch(SB_URL + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: SBK, Authorization: 'Bearer ' + SBK, 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(p), cache: 'no-store', signal: ctl ? ctl.signal : undefined })
    .then(function (r) {
      clearTimeout(to);
      return r.text().then(function (t) {
        var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) { }
        if (r.ok) { var f = FNF[fn] || (/^admin_(panel|guardar_seccion|historial|version_seccion|guardar_imagen|imagenes|borrar_imagen)$/.test(fn) ? 'panel' : ''); if (f && S.missing[f]) { delete S.missing[f]; paintBanners(); } return j; }
        var e = new Error((j && (j.message || j.error)) || ('Error ' + r.status));
        if (r.status === 404 || (j && j.code === 'PGRST202')) {
          if (o.nomiss) { e.code = 'sin_sql'; throw e; } e.code = 'sin_sql'; var file = FNF[fn] || 'panel'; S.missing[file] = 1; paintBanners();
          if (fn === 'resumen_canjes') e.message = 'Falta correr ' + SQLF.canjes + ' en Supabase';
          else e.message = 'Falta correr ' + SQLF[file] + ' en Supabase';
        } else if (/no autorizado/i.test(e.message)) { e.code = 'auth'; e.message = 'La clave no está autorizada en Supabase'; }
        else if (/version_menor|plataforma|repetir|avisos_accion|avisos_extra|formato|botones|imagen_id|acento/.test(e.message)) { e.code = 'sql_viejo'; S.newSql.remoto = true; paintBanners(); e.message = 'Falta volver a correr 2-remoto.sql (y 3-panel.sql) en Supabase: columnas nuevas de avisos'; }
        else if (r.status >= 500 || r.status === 0) e.code = 'red';
        else e.code = 'msg';
        throw e;
      });
    }, function () { clearTimeout(to); var e = new Error('Sin conexión con Supabase'); e.code = 'red'; throw e; });
}

/* ---------- secciones del panel ---------- */
var COLS = ['pendientes', 'versiones', 'timeline', 'premios', 'eventos_plan', 'cupones', 'decisiones', 'ideas'];
var SEEDK = { pendientes: 'pendientes', versiones: 'versiones', timeline: 'timeline', premios: 'premios', eventos_plan: 'eventos', cupones: 'cupones', decisiones: 'decisiones', ideas: 'ideas' };
var SECN = { pendientes: 'Pendientes', versiones: 'Versiones', timeline: 'Calendario (temporadas)', premios: 'Premios (notas y plan)', eventos_plan: 'Plan de eventos', cupones: 'Stickers', decisiones: 'Decisiones', ideas: 'Ideas', codigos_notas: 'Notas de códigos únicos', meta: 'Datos del panel' };
var ALLSEC = COLS.concat(['codigos_notas', 'meta']);
var DB = { s: {}, ready: false, loading: true, err: null, src: '', at: 0 };
function sec(n) { return DB.s[n]; }
function items(n) { var s = DB.s[n]; return s && s.d && s.d.items || []; }
function item(n, id) { return items(n).find(function (x) { return x.id === id; }); }
function note(h) { var s = DB.s.codigos_notas; var m = s && s.d && s.d.map || {}; return m[h] || null; }
function stripF(o) { var c = clone(o); delete c._forzar; return c; }

function emptySec(n) { return n === 'codigos_notas' ? { map: {} } : n === 'meta' ? {} : { items: [], borrados: [], seedRev: 0 }; }
function seedMergeCol(d, n, now) {
  var sv = SEED_DOC[SEEDK[n]] || [], borr = d.borrados || [], list = d.items = d.items || [], ch = false;
  sv.forEach(function (si) {
    if (borr.indexOf(si.id) >= 0) return;
    var u = list.find(function (x) { return x.id === si.id; });
    if (!u) { var c = stripF(si); c._t = now; list.push(c); ch = true; return; }
    var t = false;
    Object.keys(si).forEach(function (f) { if (f === '_forzar') return; if (u[f] === undefined) { u[f] = clone(si[f]); t = true; } });
    (si._forzar || []).forEach(function (f) { if (JSON.stringify(u[f]) !== JSON.stringify(si[f])) { u[f] = clone(si[f]); t = true; } });
    if (Array.isArray(si.checklist)) { u.checklist = u.checklist || []; si.checklist.forEach(function (c) { if (!u.checklist.some(function (x) { return x.t === c.t; })) { u.checklist.push(clone(c)); t = true; } }); }
    delete u._forzar;
    if (t) { u._t = now; ch = true; }
  });
  d.seedRev = SEED_DOC.seedRev || 1;
  return ch;
}
/* mezcla: el más reciente por elemento gana; los borrados se respetan */
function mergeCol(srv, loc) {
  srv = srv || { items: [] }; loc = loc || { items: [] };
  var borr = {}; (srv.borrados || []).concat(loc.borrados || []).forEach(function (id) { borr[id] = 1; });
  var L = {}; (loc.items || []).forEach(function (x) { L[x.id] = x; });
  var out = [], seen = {};
  (srv.items || []).forEach(function (s) {
    if (borr[s.id]) return; seen[s.id] = 1;
    var l = L[s.id]; out.push(l && (l._t || 0) > (s._t || 0) ? l : s);
  });
  (loc.items || []).forEach(function (l) { if (!seen[l.id] && !borr[l.id]) out.push(l); });
  return { items: out, borrados: Object.keys(borr), seedRev: Math.max(srv.seedRev || 0, loc.seedRev || 0) };
}
function mergeMap(srv, loc) {
  var m = clone((srv && srv.map) || {}), lm = (loc && loc.map) || {};
  Object.keys(lm).forEach(function (h) { if (!m[h] || (lm[h]._t || 0) > (m[h]._t || 0)) m[h] = lm[h]; });
  return { map: m };
}
function mergeSec(n, srv, loc) {
  if (srv == null) return loc;
  if (n === 'codigos_notas') return mergeMap(srv, loc);
  if (n === 'meta') return Object.assign({}, srv, loc);
  return mergeCol(srv, loc);
}

/* ---------- guardado con bloqueo optimista ---------- */
var SAVE_MS = 700;
function roStop() { toast(DB.err && DB.err.code !== 'sin_sql' ? 'Sin conexión con Supabase: por ahora no se puede guardar' : 'Primero corre ' + SQLF.panel + ' en Supabase para poder guardar', 'warn'); repaint(); var e = new Error('solo lectura'); e.ro = true; throw e; }
function touch(n) {
  if (S.ro) roStop();
  var s = DB.s[n]; if (!s) return false;
  s.dirty = true; clearTimeout(s.tm); s.tm = setTimeout(function () { saveSec(n); }, SAVE_MS);
  paintSync(); writeCache();
  return true;
}
async function saveSec(n, force) {
  var s = DB.s[n]; if (!s) return;
  if (s.saving) { s.again = true; return; }
  clearTimeout(s.tm); s.saving = true; s.dirty = false; s.again = false; paintSync();
  var tries = 0;
  try {
    for (;;) {
      var r = await rpc('admin_guardar_seccion', { p_seccion: n, p_rev: s.rev || 0, p_datos: s.d }, { timeout: 30000 });
      if (r && r.ok) { s.rev = r.rev; s.at = Date.now(); s.err = null; s.retry = 0; break; }
      if (r && r.conflicto) {
        if (++tries > 6) throw Object.assign(new Error('Conflicto repetido'), { code: 'red' });
        s.d = force ? s.d : mergeSec(n, r.datos, s.d);
        s.rev = r.rev || 0; S.view.conflicts = (S.view.conflicts || 0) + 1;
        continue;
      }
      throw new Error('Respuesta inesperada');
    }
    s.saving = false;
    if (s.again || s.dirty) { s.again = false; saveSec(n); }
    if (tries) { repaint(); }
  } catch (e) {
    s.saving = false; s.dirty = true; s.err = e;
    if (e.code === 'sin_sql') { S.ro = true; repaint(); }
    else if (e.code === 'auth' || e.code === 'msg') { toast('No se pudo guardar ' + (SECN[n] || n) + ': ' + e.message, 'bad'); s.retry = Math.min((s.retry || 0) + 1, 6); clearTimeout(s.tm); s.tm = setTimeout(function () { saveSec(n); }, 15000); }
    else { s.retry = Math.min((s.retry || 0) + 1, 6); clearTimeout(s.tm); s.tm = setTimeout(function () { saveSec(n); }, [2000, 4000, 8000, 15000, 30000, 30000, 30000][s.retry]); }
  }
  paintSync(); writeCache();
}
function flushAll() { ALLSEC.forEach(function (n) { var s = DB.s[n]; if (s && s.dirty && !s.saving) saveSec(n); }); }
function syncState() {
  var st = 'ok', last = 0;
  ALLSEC.forEach(function (n) { var s = DB.s[n]; if (!s) return; if (s.err && s.dirty) st = 'off'; else if ((s.dirty || s.saving) && st !== 'off') st = 'saving'; if (s.at > last) last = s.at; });
  if (S.ro) st = 'ro';
  return { st: st, last: last };
}
function pending() { return ALLSEC.some(function (n) { var s = DB.s[n]; return s && (s.dirty || s.saving); }); }

/* editar elementos de una colección */
function putItem(n, it, isNew) {
  if (S.ro) roStop();
  var s = DB.s[n]; if (!s) return false;
  it._t = Date.now();
  var L = s.d.items, i = L.findIndex(function (x) { return x.id === it.id; });
  if (i >= 0) L[i] = it; else if (isNew === 'top') L.unshift(it); else L.push(it);
  return touch(n);
}
function patchItem(n, id, patch) { var it = item(n, id); if (!it) return false; var c = Object.assign({}, it, patch); return putItem(n, c); }
function delItem(n, id, silent) {
  if (S.ro) roStop();
  var s = DB.s[n], L = s.d.items, i = L.findIndex(function (x) { return x.id === id; }); if (i < 0) return;
  var old = L[i]; L.splice(i, 1); s.d.borrados = s.d.borrados || []; if (s.d.borrados.indexOf(id) < 0) s.d.borrados.push(id);
  touch(n); repaint();
  if (!silent) toast('Borrado', 'ok', { label: 'Deshacer', fn: function () { s.d.borrados = s.d.borrados.filter(function (x) { return x !== id; }); old._t = Date.now(); L.splice(Math.min(i, L.length), 0, old); touch(n); repaint(); } });
}
function setNote(h, patch) {
  if (S.ro) roStop();
  var s = DB.s.codigos_notas; var m = s.d.map = s.d.map || {};
  m[h] = Object.assign({ e: 'disponible', n: '' }, m[h] || {}, patch, { _t: Date.now() });
  touch('codigos_notas');
}

/* ---------- caché de lectura (solo para abrir rápido / sin conexión) ---------- */
var writeCache = debounce(function () {
  if (!DB.ready || S.ro) return;
  try { var o = {}; ALLSEC.forEach(function (n) { var s = DB.s[n]; if (s) o[n] = { d: s.d, rev: s.rev }; }); localStorage.setItem(CACHE, JSON.stringify({ t: Date.now(), s: o })); } catch (e) { }
}, 800);
function readCache() { try { var c = JSON.parse(localStorage.getItem(CACHE) || 'null'); return c && c.s ? c : null; } catch (e) { return null; } }

/* ---------- carga inicial ---------- */
function legacyDoc() { try { var d = JSON.parse(localStorage.getItem(LEGACY) || 'null'); return d && typeof d === 'object' && Array.isArray(d.pendientes || d.timeline) ? d : null; } catch (e) { return null; } }
function adopt(n, row) { DB.s[n] = { d: row.datos || emptySec(n), rev: row.rev || 0, at: row.actualizado ? new Date(row.actualizado).getTime() : 0 }; }
async function loadPanel() {
  DB.loading = true;
  var r;
  try { r = await rpc('admin_panel'); }
  catch (e) {
    DB.loading = false;
    if (e.code === 'sin_sql') { S.ro = true; fromDocReadOnly(); return; }
    var c = readCache();
    if (c) { ALLSEC.forEach(function (n) { if (c.s[n]) DB.s[n] = { d: c.s[n].d, rev: c.s[n].rev, at: 0 }; }); DB.ready = true; DB.src = 'cache'; DB.err = e; ensureAll(); toast('Sin conexión: mostrando tu última copia. Lo que cambies se guardará al volver la conexión.', 'warn'); setTimeout(retryLoad, 8000); return; }
    DB.err = e; S.ro = true; fromDocReadOnly(); setTimeout(retryLoad, 8000); return;
  }
  var secs = (r && r.secciones) || {};
  ALLSEC.forEach(function (n) { if (secs[n]) adopt(n, secs[n]); });
  DB.loading = false; DB.err = null; DB.src = 'supabase';
  if (!secs.meta) { DB.needInit = true; return; }
  ensureAll(); DB.ready = true; seedUpdate(); writeCache();
  /* el panel se inició con los datos de Claude y este navegador tiene datos viejos: ofrecer subirlos */
  var md = secs.meta.datos || {};
  if (md.origen === 'semilla' && !md.decidido && legacyDoc()) DB.needInit = true;
}
async function retryLoad() {
  if (DB.src === 'supabase') return;
  try { var r = await rpc('admin_panel'); }
  catch (e) { if (e.code !== 'sin_sql') setTimeout(retryLoad, 15000); return; }
  var secs = (r && r.secciones) || {};
  if (!secs.meta) { location.reload(); return; }
  S.ro = false;
  ALLSEC.forEach(function (n) { if (!secs[n]) return; var s = DB.s[n]; if (s && s.dirty) { s.rev = secs[n].rev; } else adopt(n, secs[n]); });
  DB.src = 'supabase'; DB.err = null; ensureAll(); flushAll(); repaint(); toast('Conexión recuperada');
}
function ensureAll() {
  var now = Date.now();
  ALLSEC.forEach(function (n) {
    if (DB.s[n]) return;
    var d = emptySec(n); if (COLS.indexOf(n) >= 0) seedMergeCol(d, n, now);
    DB.s[n] = { d: d, rev: 0, at: 0 }; if (!S.ro && DB.src === 'supabase') touch(n);
  });
}
function seedUpdate() {
  var now = Date.now(), any = false;
  COLS.forEach(function (n) { var s = DB.s[n]; if (!s) return; if ((s.d.seedRev || 0) < (SEED_DOC.seedRev || 1)) { seedMergeCol(s.d, n, now); touch(n); any = true; } });
  if (any) S.view.seedMsg = 'Claude agregó datos nuevos (versión ' + SEED_DOC.seedRev + '). Se sumaron sin tocar lo tuyo.';
}
/* panel.sql no corrido: se muestra lo que haya (navegador o semilla) sin guardar */
function fromDocReadOnly() {
  var lg = legacyDoc(), conv = docToSections(lg || clone(SEED_DOC), !!lg);
  ALLSEC.forEach(function (n) { DB.s[n] = { d: conv.secs[n] || emptySec(n), rev: 0, at: 0 }; });
  DB.ready = true; DB.src = lg ? 'navegador' : 'semilla';
}

/* ---------- conversión del documento viejo (localStorage) a secciones ---------- */
function docToSections(doc, isLegacy) {
  var d = clone(doc), now = Date.now(), borr = d.borrados || [], out = {}, imgs = [];
  COLS.forEach(function (n) {
    var k = SEEDK[n], arr = Array.isArray(d[k]) ? d[k] : null, seedIds = (SEED_DOC[k] || []).map(function (x) { return x.id; });
    var sd = { items: (arr || []).map(function (x) { var c = stripF(x); c._t = isLegacy ? 1 : now; return c; }), borrados: borr.filter(function (id) { return seedIds.indexOf(id) >= 0; }), seedRev: isLegacy ? (d.seedRev || 1) : 0 };
    if (!arr) sd.seedRev = 0;
    seedMergeCol(sd, n, isLegacy ? 1 : now);
    sd.items.forEach(function (it) { if (Array.isArray(it.imgs)) it.imgs.forEach(function (u, i) { if (typeof u === 'string' && u.indexOf('data:') === 0) imgs.push({ it: it, i: i, data: u }); }); });
    out[n] = sd;
  });
  var map = {};
  Object.keys(d.codigos || {}).forEach(function (h) { var c = d.codigos[h]; if (c && (c.e || c.n)) map[h] = { e: c.e || 'disponible', n: c.n || '', _t: 1 }; });
  out.codigos_notas = { map: map };
  out.meta = { creado: new Date().toISOString(), origen: isLegacy ? 'navegador' : 'semilla' };
  return { secs: out, imgs: imgs };
}
function legacyStats(doc) {
  var n = 0, im = 0;
  Object.keys(doc).forEach(function (k) { if (Array.isArray(doc[k])) doc[k].forEach(function (x) { if (x && Array.isArray(x.imgs)) im += x.imgs.length; }); });
  Object.keys(doc.codigos || {}).forEach(function (h) { var c = doc.codigos[h]; if (c && (c.n || (c.e && c.e !== 'disponible'))) n++; });
  var done = (doc.pendientes || []).filter(function (k) { return k.col === 'hecho'; }).length;
  return { notas: n, imgs: im, pend: (doc.pendientes || []).length, hechos: done };
}
/* sube todas las secciones (y las imágenes); progreso(texto, 0..1) */
async function uploadAll(conv, progreso, mergeWithCurrent) {
  var v2 = conv.v2 ? Object.keys(conv.v2) : [], tot = conv.imgs.length + v2.length + ALLSEC.length, k = 0;
  for (var q = 0; q < v2.length; q++) {
    progreso('Subiendo imágenes (' + (q + 1) + ' de ' + v2.length + ')…', k++ / tot);
    var vd = conv.v2[v2[q]];
    if (!/^[A-Za-z0-9_-]{4,60}$/.test(v2[q]) || !/^data:image\/(jpeg|png|webp);base64,/.test(vd || '')) continue;
    await rpc('admin_guardar_imagen', { p_id: v2[q], p_data: vd }, { timeout: 60000 }); IMG.c[v2[q]] = vd;
  }
  for (var i = 0; i < conv.imgs.length; i++) {
    var x = conv.imgs[i], id = uid('m');
    progreso('Subiendo imágenes (' + (i + 1) + ' de ' + conv.imgs.length + ')…', k++ / tot);
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(x.data) || x.data.length >= 1500000) continue;
    try { await rpc('admin_guardar_imagen', { p_id: id, p_data: x.data }, { timeout: 60000 }); x.it.imgs[x.i] = 'img:' + id; IMG.c[id] = x.data; }
    catch (e) { if (e.code === 'red') throw e; }
  }
  var order = ALLSEC.filter(function (n) { return n !== 'meta'; }).concat(['meta']);
  for (var j = 0; j < order.length; j++) {
    var n = order[j], data = conv.secs[n], rev = DB.s[n] ? DB.s[n].rev : 0;
    if (data == null) { k++; continue; }
    if (mergeWithCurrent && DB.s[n]) data = mergeSec(n, DB.s[n].d, data);
    progreso('Guardando ' + (SECN[n] || n).toLowerCase() + '…', k++ / tot);
    for (var t = 0; t < 5; t++) {
      var r = await rpc('admin_guardar_seccion', { p_seccion: n, p_rev: rev, p_datos: data }, { timeout: 30000 });
      if (r && r.ok) { DB.s[n] = { d: data, rev: r.rev, at: Date.now() }; break; }
      if (r && r.conflicto) { rev = r.rev || 0; if (mergeWithCurrent) data = mergeSec(n, r.datos, data); continue; }
      throw new Error('No se pudo guardar ' + n);
    }
  }
  progreso('Listo', 1);
  DB.ready = true; DB.needInit = false; DB.src = 'supabase'; S.ro = false; ensureAll(); seedUpdate(); writeCache();
}

/* refresco: trae lo que otro dispositivo haya guardado */
async function refreshPanel() {
  if (!DB.ready || S.ro || DB.src !== 'supabase') return;
  var r; try { r = await rpc('admin_panel'); } catch (e) { return; }
  var secs = (r && r.secciones) || {}, ch = false;
  ALLSEC.forEach(function (n) {
    var x = secs[n], s = DB.s[n]; if (!x || !s) return;
    if (x.rev > (s.rev || 0) && !s.dirty && !s.saving) { adopt(n, x); ch = true; }
  });
  if (ch) { repaint(); }
}

/* ---------- imágenes guardadas en Supabase ---------- */
var IMG = { c: {}, want: {}, miss: {} };
var BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
var fetchImgs = debounce(async function () {
  var ids = Object.keys(IMG.want); IMG.want = {}; if (!ids.length) return;
  try {
    var r = await rpc('admin_imagenes', { p_ids: ids }) || {};
    ids.forEach(function (id) { if (r[id]) IMG.c[id] = r[id]; else IMG.miss[id] = 1; });
    repaint();
  } catch (e) { ids.forEach(function (id) { IMG.miss[id] = 1; }); }
}, 60);
function imgSrc(ref) {
  if (!ref) return '';
  if (ref.indexOf('data:') === 0) return safeImg(ref);
  if (ref.indexOf('img:') === 0) { var id = ref.slice(4); if (IMG.c[id]) return safeImg(IMG.c[id]); if (!IMG.miss[id] && !S.ro) { IMG.want[id] = 1; fetchImgs(); } return ''; }
  return '';
}
function compress(file) {
  return new Promise(function (res, rej) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var w = Math.min(1200, im.width), q = .85, u;
        for (var i = 0; i < 14; i++) {
          var h = Math.round(im.height * w / im.width), c = document.createElement('canvas'); c.width = w; c.height = h;
          var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(im, 0, 0, w, h);
          u = c.toDataURL('image/jpeg', q);
          if (u.length < 950000) break;
          if (q > .6) q -= .1; else w = Math.round(w * .82);
        }
        res(u);
      };
      im.onerror = function () { rej(new Error('No se pudo leer esa imagen')); };
      im.src = fr.result;
    };
    fr.onerror = function () { rej(new Error('No se pudo leer el archivo')); };
    fr.readAsDataURL(file);
  });
}
var imgTarget = null;
function pickImage(n, id) {
  if (S.ro) roStop();
  imgTarget = { n: n, id: id }; var i = $('#imgin'); i.value = ''; i.click();
}
async function onImagePicked(file) {
  var t = imgTarget; imgTarget = null; if (!file || !t) return;
  toast('Subiendo imagen…', 'info');
  try {
    var data = await compress(file), id = uid('i');
    await rpc('admin_guardar_imagen', { p_id: id, p_data: data }, { timeout: 60000 });
    IMG.c[id] = data;
    var it = item(t.n, t.id); if (!it) return;
    var c = Object.assign({}, it); c.imgs = (c.imgs || []).concat(['img:' + id]);
    putItem(t.n, c); repaint(); toast('Imagen guardada (' + Math.round(data.length * .75 / 1024) + ' KB)');
  } catch (e) { toast('No se pudo subir la imagen: ' + e.message, 'bad'); }
}
async function removeImage(n, id, idx) {
  var it = item(n, id); if (!it || !it.imgs) return;
  if (!await confirmDlg({ title: '¿Quitar esta imagen?', text: 'Se borra de Supabase y no se puede recuperar.', ok: 'Quitar', danger: true })) return;
  var ref = it.imgs[idx], c = Object.assign({}, it); c.imgs = it.imgs.filter(function (_, i) { return i !== idx; });
  putItem(n, c); repaint();
  if (ref && ref.indexOf('img:') === 0) rpc('admin_borrar_imagen', { p_id: ref.slice(4) }).catch(function () { });
}

/* ---------- datos remotos (Supabase) ---------- */
var RM = {};
var RFN = { codigos: 'admin_codigos', eventos: 'admin_eventos', avisos: 'admin_avisos', canjes: 'resumen_canjes', config: 'config_remota', rkres: 'admin_ranking_resumen', errores: 'admin_errores' };
function rm(k) { if (!RM[k]) rload(k); return RM[k]; }
function rows(k) { var o = RM[k]; return (o && Array.isArray(o.rows) && o.rows) || []; }
function rload(k, quiet) {
  var o = RM[k] = RM[k] || { rows: null };
  if (o.loading) return o.p;
  o.loading = true; if (!quiet) o.err = null;
  o.p = rpc(RFN[k], {}, { anon: k === 'config' }).then(function (r) { o.rows = k === 'config' ? r : (r || []); o.err = null; o.t = Date.now(); },
    function (e) { o.err = e; }).then(function () { o.loading = false; repaint(); });
  return o.p;
}
function rloadAll() { ['codigos', 'eventos', 'avisos', 'canjes', 'config', 'rkres', 'errores'].forEach(function (k) { rload(k, true); }); }
function rerr(o, what) {
  if (!o || !o.err) return '';
  var e = o.err;
  if (e.code === 'sin_sql') return '';
  return '<div class="ban bad">' + ic('warn') + '<div class="tx"><b>No se pudo leer ' + esc(what) + '</b>' + esc(e.message) + (e.code === 'red' ? '. Revisa tu conexión. Si Supabase se pausó por inactividad, reactívalo en supabase.com.' : '') + '<div class="acts"><button class="btn sm" data-a="rretry">' + ic('refresh') + 'Reintentar</button></div></div></div>';
}
