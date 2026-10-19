/* ================= estructura: navegación, rutas, barra, buscador ================= */
var NAV = [
  { g: '', items: [['inicio', 'Inicio', 'home']] },
  { g: 'En vivo', k: 'vivo', ic: 'live', items: [['vivo/ahora', 'Ahora en la app', 'live'], ['vivo/avisos', 'Avisos y drops', 'bell'], ['vivo/eventos', 'Eventos', 'cal']] },
  { g: 'Códigos', k: 'codigos', ic: 'ticket', items: [['codigos/rotativos', 'Rotativos', 'zap'], ['codigos/unicos', 'Únicos fijos', 'key'], ['codigos/stickers', 'Stickers', 'sticker'], ['codigos/revocados', 'Revocados', 'pause'], ['codigos/canjes', 'Canjes', 'chart']] },
  { g: 'Juego', k: 'juego', ic: 'game', items: [['juego/premios', 'Premios', 'gift'], ['juego/progresion', 'Progresión', 'trend'], ['juego/temporadas', 'Temporadas', 'spark'], ['juego/ranking', 'Ranking', 'trophy']] },
  { g: 'Proyecto', k: 'proyecto', ic: 'folder', items: [['proyecto/pendientes', 'Pendientes', 'tasks'], ['proyecto/versiones', 'Versiones', 'layers'], ['proyecto/ideas', 'Ideas y decisiones', 'bulb'], ['proyecto/errores', 'Errores', 'warn']] }
];
var ROUTES = {}; NAV.forEach(function (g) { g.items.forEach(function (it) { ROUTES[it[0]] = { t: it[1], ic: it[2], g: g.g, k: g.k }; }); });
ROUTES.ajustes = { t: 'Ajustes y respaldo', ic: 'sliders', g: '' };
var VIEWS = {};
var BN = [['inicio', 'Inicio', 'home'], ['vivo', 'En vivo', 'live'], ['codigos', 'Códigos', 'ticket'], ['proyecto', 'Proyecto', 'folder'], ['mas', 'Más', 'dots']];
function groupFirst(k) { var g = NAV.find(function (x) { return x.k === k; }); try { var l = localStorage.getItem('bk_last_' + k); if (l && ROUTES[l]) return l; } catch (e) { } return g ? g.items[0][0] : 'inicio'; }

function parseHash() {
  var h = (location.hash || '').replace(/^#\/?/, ''), q = {}, i = h.indexOf('?');
  if (i >= 0) { h.slice(i + 1).split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) q[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); }); h = h.slice(0, i); }
  if (!ROUTES[h]) { var g = NAV.find(function (x) { return x.k === h; }); h = g ? groupFirst(g.k) : 'inicio'; }
  return { r: h, q: q };
}
function go(r, q) {
  var s = '#/' + r; if (q) { var p = Object.keys(q).filter(function (k) { return q[k] != null && q[k] !== ''; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(q[k]); }); if (p.length) s += '?' + p.join('&'); }
  if (location.hash === s) route(); else location.hash = s;
}
function route() {
  var p = parseHash(), changed = p.r !== S.route;
  S.route = p.r; S.qs = p.q;
  var k = ROUTES[p.r].k; if (k) try { localStorage.setItem('bk_last_' + k, p.r); } catch (e) { }
  if (LAY.dr && changed) drawerKill(true);
  if (LAY.more) closeMore();
  paintShell(); paintPage(changed);
  if (changed) { window.scrollTo(0, 0); var pg = $('#page'); try { pg.focus({ preventScroll: true }); } catch (e) { } }
  if (p.q.open && OPENERS[p.q.open.split(':')[0]]) { var o = p.q.open.split(':'); setTimeout(function () { OPENERS[o[0]](o.slice(1).join(':')); }, 0); }
}
var OPENERS = {};

/* ---------- pintado ---------- */
function logoImg(cls) { return IMGS.icono ? '<img class="' + (cls || '') + '" alt="" src="' + IMGS.icono + '">' : '<span class="lg ' + (cls || '') + '"></span>'; }
function navCount(r) {
  if (r === 'proyecto/pendientes' && DB.ready) { var n = items('pendientes').filter(function (k) { return k.quien === 'Manuel' && k.col !== 'hecho' && !k.bloqueo; }).length; return n ? '<span class="ct">' + n + '</span>' : ''; }
  if (r === 'vivo/avisos') { var a = rows('avisos').filter(function (x) { return avEst(x) === 'activo'; }).length; return a ? '<span class="ct hot">' + a + '</span>' : ''; }
  if (r === 'juego/ranking') { var rr = RM.rkres && RM.rkres.rows; return rr && rr.sospechosos ? '<span class="ct hot">' + rr.sospechosos + '</span>' : ''; }
  if (r === 'proyecto/errores') { var en = erNuevos(); return en ? '<span class="ct hot">' + en + '</span>' : ''; }
  return '';
}
function paintShell() {
  var cur = S.route;
  var side = '<div class="brand">' + logoImg() + '<div><b>Blokku <em>HQ</em></b><span>Panel de Manuel</span></div></div>' +
    '<button class="sbtn" data-a="palette" aria-label="Buscar">' + ic('search') + '<span>Buscar…</span><kbd>' + (/Mac|iP/.test(navigator.platform) ? '⌘' : 'Ctrl') + ' K</kbd></button><nav class="snav">';
  NAV.forEach(function (g) {
    side += '<div class="sg">' + (g.g ? '<div class="sgh">' + esc(g.g) + '</div>' : '');
    g.items.forEach(function (it) { side += '<a class="si" href="#/' + it[0] + '" title="' + esc(it[1]) + '"' + (cur === it[0] ? ' aria-current="page"' : '') + '>' + ic(it[2]) + '<span>' + esc(it[1]) + '</span>' + navCount(it[0]) + '</a>'; });
    side += '</div>';
  });
  side += '</nav><div class="sfoot"><a class="si" href="#/ajustes" title="Ajustes y respaldo"' + (cur === 'ajustes' ? ' aria-current="page"' : '') + '>' + ic('sliders') + '<span>Ajustes</span></a>' +
    '<button class="si sq" data-a="theme" title="' + (isDark() ? 'Tema claro' : 'Tema oscuro') + '" aria-label="' + (isDark() ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro') + '">' + ic(isDark() ? 'sun' : 'moon') + '</button>' +
    '<button class="si sq" data-a="logout" title="Cerrar sesión en este dispositivo" aria-label="Cerrar sesión en este dispositivo">' + ic('logout') + '</button></div>';
  $('#side').innerHTML = side;
  var R = ROUTES[cur];
  $('#top').innerHTML = '<div class="tt"><div class="tlogo">' + logoImg() + '<span>' + esc(R.t) + '</span></div><div class="crumb">' + (R.g ? esc(R.g) + ' <span class="faint">/</span> ' : '') + '<b>' + esc(R.t) + '</b></div></div>' +
    '<div class="tact"><button class="btn ghost ic sm tsrch" data-a="palette" aria-label="Buscar">' + ic('search') + '</button><span id="syncw"></span></div>';
  var g = R.k || (cur === 'inicio' ? 'inicio' : cur === 'ajustes' ? 'mas' : '');
  if (g === 'juego') g = 'mas';
  $('#bnav').innerHTML = BN.map(function (b) {
    var on = b[0] === g;
    if (b[0] === 'mas') return '<button class="bn" data-a="more"' + (on ? ' aria-current="page"' : '') + '>' + ic(b[2]) + '<span>' + b[1] + '</span></button>';
    return '<a class="bn" href="#/' + (b[0] === 'inicio' ? 'inicio' : groupFirst(b[0])) + '"' + (on ? ' aria-current="page"' : '') + '>' + ic(b[2]) + '<span>' + b[1] + '</span>' + (b[0] === 'vivo' && rows('avisos').some(function (x) { return avEst(x) === 'activo' && x.tipo === 'drop'; }) ? '<i class="dot"></i>' : '') + '</a>';
  }).join('');
  paintSync(); paintBanners();
}
function paintSync() {
  var w = $('#syncw'); if (!w) return;
  var s = syncState(), cls = '', t;
  if (DB.needInit) { t = 'Por configurar'; cls = 'ro'; }
  else if (!DB.ready && DB.loading) { t = 'Cargando…'; cls = 'saving'; }
  else if (S.ro) { t = DB.err && DB.err.code !== 'sin_sql' ? 'Sin conexión' : 'Solo lectura'; cls = DB.err && DB.err.code !== 'sin_sql' ? 'off' : 'ro'; }
  else if (s.st === 'off') { t = 'Sin conexión, reintentando'; cls = 'off'; }
  else if (s.st === 'saving') { t = 'Guardando…'; cls = 'saving'; }
  else if (DB.src === 'cache') { t = 'Sin conexión'; cls = 'off'; }
  else t = 'Guardado ✓';
  w.innerHTML = '<button class="sync ' + cls + '" data-a="syncinfo" aria-live="polite" title="Estado del guardado en Supabase"><i></i><span class="lbl">' + esc(t) + '</span></button>';
}
function paintBanners() {
  var h = '';
  var miss = Object.keys(S.missing);
  if (miss.length) {
    var files = miss.map(function (k) { return SQLF[k]; }).sort();
    h += '<div class="ban">' + ic('db') + '<div class="tx"><b>Falta correr ' + (files.length > 1 ? 'unos archivos' : 'un archivo') + ' en Supabase: ' + files.map(function (f) { return '<span class="path">' + esc(f) + '</span>'; }).join(' ') + '</b>' +
      'Están en tu Escritorio › Blokku › 02-Documentos › Supabase. Ábrelo, copia todo el texto, pégalo en Supabase › SQL Editor y presiona <b style="display:inline">Run</b>. ' +
      (S.missing.panel ? 'Mientras tanto ves tus datos, pero <b style="display:inline">no se guardan cambios</b> de pendientes, notas ni versiones.' : 'Hasta entonces esa parte del panel no funciona.') +
      '<div class="acts"><button class="btn sm" data-a="sqlretry">' + ic('refresh') + 'Ya lo corrí, revisar otra vez</button></div></div></div>';
  }
  if (avSqlOld()) h += '<div class="ban bad">' + ic('warn') + '<div class="tx"><b>Los avisos nuevos necesitan actualizar Supabase</b>Vuelve a correr <span class="path">2-remoto.sql</span> y <span class="path">3-panel.sql</span> (están en tu Escritorio › Blokku › 02-Documentos › Supabase): ábrelos, copia todo el texto, pégalo en Supabase › SQL Editor y presiona <b style="display:inline">Run</b>, uno y luego el otro. Mientras tanto el diseñador de avisos (formato, botones, imagen y color) <b style="display:inline">no guarda</b>; los avisos de antes se ven y funcionan igual.<div class="acts"><button class="btn sm" data-a="sqlretry2">' + ic('refresh') + 'Ya lo corrí, revisar otra vez</button></div></div></div>';
  if (S.view.seedMsg) h += '<div class="ban info">' + ic('spark') + '<div class="tx"><b>Datos nuevos</b>' + esc(S.view.seedMsg) + '</div><button class="btn ghost ic sm" data-a="seedok" aria-label="Cerrar">' + ic('x') + '</button></div>';
  $('#banners').innerHTML = h;
}
var paintQueued = false;
function repaint() {
  if (paintQueued) return; paintQueued = true;
  requestAnimationFrame(function () { paintQueued = false; paintShell(); paintPage(false); if (LAY.dr && LAY.dr.spec.live) drawerRefresh(); });
}
function paintPage(changed) {
  var pg = $('#page'), v = VIEWS[S.route];
  var ae = document.activeElement, fid = ae && pg.contains(ae) && ae.id, sel = null, fval = fid && (ae.tagName === 'TEXTAREA' || ae.tagName === 'INPUT') && ae.type !== 'checkbox' && ae.type !== 'radio' ? ae.value : null;
  try { if (fid && ae.selectionStart != null) sel = [ae.selectionStart, ae.selectionEnd]; } catch (e) { }
  var keep = $$('[data-keep]', pg).map(function (e) { return [e.dataset.keep, e.scrollLeft, e.scrollTop]; });
  var y = window.scrollY;
  if (DB.needInit) pg.innerHTML = vOnboard();
  else if (!DB.ready) pg.innerHTML = '<div class="ph"><div class="tx"><div class="sk" style="height:30px;width:220px"></div><div class="sk skl" style="width:360px;max-width:100%"></div></div></div>' + skel(5);
  else pg.innerHTML = v ? v() : '';
  var km = {}; keep.forEach(function (k) { km[k[0]] = k; });
  $$('[data-keep]', pg).forEach(function (e) { var k = km[e.dataset.keep]; if (k) { e.scrollLeft = k[1]; e.scrollTop = k[2]; } });
  if (fid) { var n = document.getElementById(fid); if (n) { if (fval != null) n.value = fval; n.focus({ preventScroll: true }); if (sel) try { n.setSelectionRange(sel[0], sel[1]); } catch (e) { } } }
  if (!changed) window.scrollTo(0, y);
  if (PAGEMOUNT[S.route]) PAGEMOUNT[S.route](pg);
}
var PAGEMOUNT = {};

/* ---------- tema ---------- */
function isDark() { var t = document.documentElement.getAttribute('data-theme'); return t ? t === 'dark' : window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches; }
A.theme = function () { var d = !isDark(); document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light'); try { localStorage.setItem('bk_theme', d ? 'dark' : 'light'); } catch (e) { } paintShell(); if (LAY.more) { closeMore(); } };

/* ---------- hoja «Más» (teléfono) ---------- */
function closeMore() { if (LAY.more) { LAY.more = null; drawerKill(); } }
A.mclose = function () { setTimeout(closeMore, 0); };
A.more = function () {
  var list = [['juego/premios', 'Premios', 'gift'], ['juego/progresion', 'Progresión', 'trend'], ['juego/temporadas', 'Temporadas', 'spark'], ['codigos/canjes', 'Canjes', 'chart'], ['juego/ranking', 'Ranking', 'trophy'], ['proyecto/versiones', 'Versiones', 'layers'], ['proyecto/ideas', 'Ideas', 'bulb'], ['vivo/eventos', 'Eventos', 'cal'], ['codigos/unicos', 'Únicos fijos', 'key'], ['ajustes', 'Ajustes', 'sliders']];
  drawer({
    title: 'Más', auto: true, onClose: function () { LAY.more = null; },
    body: function () {
      return '<div class="more-grid">' + list.map(function (x) { return '<a class="mg" href="#/' + x[0] + '"><span class="mgi">' + ic(x[2]) + '</span>' + esc(x[1]) + '</a>'; }).join('') + '</div>' +
        '<div class="col mt16"><button class="btn blk" data-a="palette">' + ic('search') + 'Buscar en todo el panel</button><button class="btn blk" data-a="theme">' + ic(isDark() ? 'sun' : 'moon') + (isDark() ? 'Tema claro' : 'Tema oscuro') + '</button><button class="btn blk ghost" data-a="logout">' + ic('logout') + 'Salir</button></div>';
    }
  });
  LAY.more = true;
};

/* ---------- acciones globales ---------- */
A.drClose = function () { drawerClose(); };
A.logout = async function () {
  if (pending() && !await confirmDlg({ title: '¿Salir ahora?', text: 'Todavía se están guardando cambios. Si sales, se pueden perder.', ok: 'Salir', danger: true })) return;
  try { sessionStorage.removeItem('bk_k'); } catch (e) { }
  try {
    localStorage.removeItem('bk_k_rem'); localStorage.removeItem(CACHE);
    Object.keys(localStorage).forEach(function (k) { if (k.indexOf('bk_last_') === 0) localStorage.removeItem(k); });
  } catch (e) { }
  location.reload();
};
A.sqlretry = function () { S.missing = {}; paintBanners(); if (S.ro || DB.needInit) location.reload(); else { rloadAll(); toast('Revisando…', 'info'); } };
A.seedok = function () { S.view.seedMsg = ''; paintBanners(); };
A.rretry = function () { rloadAll(); };
A.syncinfo = function () {
  var s = syncState();
  drawer({
    title: 'Guardado en Supabase', sub: s.st === 'ok' ? 'Todo está guardado.' : s.st === 'saving' ? 'Guardando cambios…' : s.st === 'ro' ? 'Solo lectura por ahora.' : 'Sin conexión: se reintenta solo.', auto: true,
    body: function () {
      var h = '<p class="mut mb12">Cada sección se guarda por separado en cuanto cambias algo. Si abres el panel en otro dispositivo, verás lo mismo.</p><div class="list">';
      ALLSEC.forEach(function (n) {
        var x = DB.s[n]; if (!x) return;
        var st = x.err && x.dirty ? chip('Reintentando', 'warn') : x.saving || x.dirty ? chip('Guardando', 'ac') : chip('Guardado', 'ok');
        h += '<div class="li"><div class="t"><b>' + esc(SECN[n] || n) + '</b><span>' + (x.at ? 'Último cambio ' + ago(x.at) : 'Sin cambios en esta sesión') + ' · versión ' + (x.rev || 0) + '</span></div><div class="r">' + st + '</div></div>';
      });
      return h + '</div>';
    },
    foot: function () { return '<button class="btn" data-a="flush">' + ic('refresh') + 'Reintentar ahora</button><span class="sp"></span><a class="btn ghost" href="#/ajustes">Historial y respaldo</a>'; }
  });
};
A.flush = function () { ALLSEC.forEach(function (n) { var s = DB.s[n]; if (s && s.dirty) { s.retry = 0; saveSec(n); } }); drawerRefresh(); };
A.lb = function (el) { lightbox(el.dataset.src || el.getAttribute('src'), el.dataset.cap); };
A.lbi = function (el) { var k = el.dataset.k; if (IMGS[k]) lightbox(IMGS[k], el.dataset.cap); };
A.copy = function (el) { copyTxt(el.dataset.t, el.dataset.msg || 'Copiado: ' + el.dataset.t); };
A.go = function (el) { go(el.dataset.r, el.dataset.q ? JSON.parse(el.dataset.q) : null); };
A.addimg = function (el) { pickImage(el.dataset.n, el.dataset.id); };
A.rmimg = function (el) { removeImage(el.dataset.n, el.dataset.id, Number(el.dataset.i)); };

/* ---------- buscador global (⌘K) ---------- */
var PAL = { q: '', sel: 0, res: [] };
function palItems() {
  var out = [];
  Object.keys(ROUTES).forEach(function (r) { out.push({ g: 'Ir a', t: ROUTES[r].t, s: ROUTES[r].g || 'Página', ic: ROUTES[r].ic, run: function () { go(r); } }); });
  [['Lanzar un drop', 'zap', function () { go('vivo/avisos'); setTimeout(openDrop, 30); }], ['Nuevo aviso', 'bell', function () { go('vivo/avisos'); setTimeout(function () { avForm(null); }, 30); }], ['Nuevo evento', 'cal', function () { go('vivo/eventos'); setTimeout(function () { evForm(null); }, 30); }], ['Crear códigos', 'ticket', function () { go('codigos/rotativos'); setTimeout(genForm, 30); }], ['Nuevo pendiente', 'tasks', function () { go('proyecto/pendientes'); setTimeout(function () { pendForm(null); }, 30); }], ['Cambiar tema claro / oscuro', 'moon', A.theme]].forEach(function (a) { out.push({ g: 'Acciones', t: a[0], s: 'Acción rápida', ic: a[1], run: a[2] }); });
  if (DB.ready) {
    items('premios').forEach(function (p) { out.push({ g: 'Premios', t: p.nombre, s: p.tipo + ' · ' + p.rareza + ' · ' + (GANA[p.gana] || ''), th: p, k: p.cid || '', run: function () { go('juego/premios'); setTimeout(function () { premDrawer(p.id); }, 30); } }); });
    items('pendientes').forEach(function (k) { out.push({ g: 'Pendientes', t: k.titulo, s: k.quien + (k.col === 'hecho' ? ' · hecho' : k.bloqueo ? ' · en espera' : ''), ic: 'tasks', run: function () { go('proyecto/pendientes'); setTimeout(function () { pendForm(k); }, 30); } }); });
    items('versiones').forEach(function (v) { out.push({ g: 'Versiones', t: 'Versión ' + v.version, s: 'Android ' + v.android + ' · iOS ' + v.ios, ic: 'layers', run: function () { go('proyecto/versiones'); } }); });
    items('timeline').forEach(function (x) { out.push({ g: 'Calendario', t: x.titulo, s: fdr(x.inicio, x.fin), ic: 'spark', run: function () { go('juego/temporadas'); setTimeout(function () { tlDrawer(x.id); }, 30); } }); });
    items('cupones').forEach(function (c) { out.push({ g: 'Stickers', t: c.codigo, s: c.da, ic: 'sticker', run: function () { go('codigos/stickers'); } }); });
    items('ideas').forEach(function (i) { out.push({ g: 'Ideas', t: i.texto, s: 'Prioridad ' + i.prioridad, ic: 'bulb', run: function () { go('proyecto/ideas'); } }); });
  }
  rows('codigos').forEach(function (c) { out.push({ g: 'Códigos rotativos', t: c.mostrar, s: (c.etiqueta ? c.etiqueta + ' · ' : '') + (c.cosmeticos || []).map(cname).join(' + '), ic: 'zap', mono: 1, run: function () { go('codigos/rotativos'); setTimeout(function () { codeDrawer(c.id); }, 30); } }); });
  rows('avisos').forEach(function (a) { out.push({ g: 'Avisos', t: ml(a.titulo) || 'Aviso sin título', s: (AV_FMT[avFmt(a)]) + ' · ' + EST_L[avEst(a)], ic: 'bell', run: function () { go('vivo/avisos'); setTimeout(function () { avForm(a); }, 30); } }); });
  rows('eventos').forEach(function (e) { out.push({ g: 'Eventos', t: ml(e.nombre) || e.id, s: e.id + ' · ' + fdt(e.inicio, 1) + ' → ' + fdt(e.fin, 1), ic: 'cal', run: function () { go('vivo/eventos'); setTimeout(function () { evForm(e); }, 30); } }); });
  var grp = {}; (typeof CODES !== 'undefined' ? CODES : []).forEach(function (c) { if (c.i !== '*' && !grp[c.i]) grp[c.i] = c; });
  Object.keys(grp).forEach(function (cid) { var c = grp[cid]; out.push({ g: 'Códigos únicos', t: c.n, s: 'Códigos únicos de este premio', ic: 'key', run: function () { S.f.uq = c.n; S.open['u_' + cid] = true; go('codigos/unicos'); } }); });
  return out;
}
function palSearch(q) {
  var all = palItems();
  if (!q) return all.filter(function (x) { return x.g === 'Acciones' || x.g === 'Ir a'; }).slice(0, 14);
  var nq = norm(q), sc = [];
  all.forEach(function (x) { var hay = x.t + ' ' + x.s + ' ' + (x.k || ''); if (!match(hay, q)) return; var t = norm(x.t); sc.push([t.indexOf(nq) === 0 ? 0 : t.indexOf(nq) >= 0 ? 1 : 2, x]); });
  sc.sort(function (a, b) { return a[0] - b[0]; });
  var per = {}; return sc.map(function (x) { return x[1]; }).filter(function (x) { per[x.g] = (per[x.g] || 0) + 1; return per[x.g] <= 6; }).slice(0, 40);
}
function palPaint() {
  var box = LAY.pal && LAY.pal.el.querySelector('.pr'); if (!box) return;
  var R = PAL.res, h = '', g = '';
  if (!R.length) h = '<div class="empty"><b>Sin resultados</b><p>Prueba con otra palabra: un premio, un código, un pendiente…</p></div>';
  R.forEach(function (x, i) {
    if (x.g !== g) { g = x.g; h += '<div class="pg">' + esc(g) + '</div>'; }
    h += '<button class="po" role="option" data-pi="' + i + '" aria-selected="' + (i === PAL.sel) + '">' + (x.th ? thumb(x.th, 'sm') : '<span class="pic">' + ic(x.ic || 'chr') + '</span>') + '<span class="t"><b' + (x.mono ? ' class="mono"' : '') + '>' + esc(x.t) + '</b><span>' + esc(x.s || '') + '</span></span></button>';
  });
  box.innerHTML = h;
  var s = box.querySelector('[aria-selected="true"]'); if (s) s.scrollIntoView({ block: 'nearest' });
}
A.palette = function () {
  if (LAY.pal) return;
  if (LAY.more) closeMore();
  ['codigos', 'avisos', 'eventos'].forEach(function (k) { if (!RM[k]) rload(k, true); });
  var s = document.createElement('div'); s.className = 'scrim pal-s';
  var p = document.createElement('div'); p.className = 'cmdk'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', 'Buscar');
  p.innerHTML = '<div class="pi">' + ic('search') + '<input id="palq" placeholder="Busca premios, códigos, avisos, pendientes…" autocomplete="off" aria-label="Buscar"><span class="kbd">Esc</span></div><div class="pr" role="listbox"></div><div class="pf"><span>↑↓ moverse</span><span>Enter abrir</span><span>Esc cerrar</span></div>';
  $('#layer').appendChild(s); $('#layer').appendChild(p);
  LAY.pal = { el: p, scrim: s, back: document.activeElement }; lockScroll();
  requestAnimationFrame(function () { s.classList.add('on'); p.classList.add('on'); });
  var inpt = p.querySelector('#palq');
  PAL.q = ''; PAL.sel = 0; PAL.res = palSearch(''); palPaint();
  inpt.focus();
  inpt.addEventListener('input', function () { PAL.q = inpt.value; PAL.sel = 0; PAL.res = palSearch(PAL.q); palPaint(); });
  inpt.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { PAL.sel = Math.min(PAL.res.length - 1, PAL.sel + 1); palPaint(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { PAL.sel = Math.max(0, PAL.sel - 1); palPaint(); e.preventDefault(); }
    else if (e.key === 'Enter') { var x = PAL.res[PAL.sel]; if (x) { palClose(); x.run(); } e.preventDefault(); }
    else if (e.key === 'Escape') { palClose(); e.preventDefault(); }
  });
  p.addEventListener('click', function (e) { var b = e.target.closest('[data-pi]'); if (b) { var x = PAL.res[+b.dataset.pi]; palClose(); if (x) x.run(); } });
  s.onclick = palClose;
};
function palClose() { var P = LAY.pal; if (!P) return; LAY.pal = null; P.el.remove(); P.scrim.remove(); lockScroll(); }

/* ---------- delegación de eventos ---------- */
document.addEventListener('click', function (ev) {
  var el = ev.target.closest('[data-a]'); if (!el) return;
  var f = A[el.dataset.a]; if (!f) return;
  if (el.tagName === 'A' && !el.getAttribute('href')) ev.preventDefault();
  if (el.tagName === 'BUTTON' || el.dataset.stop) ev.preventDefault();
  if (el.dataset.stop) ev.stopPropagation();
  f(el, ev);
});
document.addEventListener('change', function (ev) { var el = ev.target.closest('[data-c]'); if (el && C[el.dataset.c]) C[el.dataset.c](el, ev); if (ev.target.id === 'imgin') onImagePicked(ev.target.files[0]); if (ev.target.id === 'jsonin') onJsonPicked(ev.target.files[0]); });
document.addEventListener('input', function (ev) { var el = ev.target.closest('[data-i]'); if (el && I[el.dataset.i]) I[el.dataset.i](el, ev); });
document.addEventListener('keydown', function (e) {
  if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (LAY.pal) palClose(); else A.palette(); return; }
  if (e.key === 'Escape') {
    if (LAY.lb) { LAY.lb.remove(); LAY.lb = null; return; }
    if (LAY.pal) { palClose(); return; }
    if (LAY.md.length) { LAY.md[LAY.md.length - 1].done(null); return; }
    if (LAY.dr) { drawerClose(); return; }
  }
  var t = e.target.tagName;
  if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('role') === 'link' && e.target.dataset.a) { e.preventDefault(); e.target.click(); return; }
  if (e.key === '/' && t !== 'INPUT' && t !== 'TEXTAREA' && t !== 'SELECT' && !LAY.dr && !LAY.md.length) { e.preventDefault(); A.palette(); }
});
window.addEventListener('hashchange', route);
window.addEventListener('scroll', function () { var t = $('#top'); if (t) t.classList.toggle('scrolled', window.scrollY > 4); }, { passive: true });
window.addEventListener('beforeunload', function (e) { if (pending()) { e.preventDefault(); e.returnValue = ''; } });
document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { refreshPanel(); rloadAll(); } });
window.addEventListener('online', function () { flushAll(); if (DB.src !== 'supabase') retryLoad(); });
