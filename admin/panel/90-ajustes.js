/* ================= AJUSTES, HISTORIAL, RESPALDO Y MIGRACIÓN ================= */
function secSize(n) { try { return JSON.stringify(DB.s[n].d).length; } catch (e) { return 0; } }
function kb(n) { return n < 1024 ? n + ' B' : (n / 1024).toFixed(n < 10240 ? 1 : 0).replace('.', ',') + ' KB'; }
function secCount(n) { var s = DB.s[n]; if (!s) return 0; if (n === 'codigos_notas') return Object.keys(s.d.map || {}).length; if (n === 'meta') return 0; return (s.d.items || []).length; }
function vAjustes() {
  var h = pageHead('Ajustes y respaldo', 'Dónde se guarda todo, versiones anteriores de cada sección y copias de seguridad.', '');
  /* supabase */
  var st = [['panel', SQLF.panel, 'Datos del panel (pendientes, notas, versiones…)'], ['remoto', SQLF.remoto, 'Códigos rotativos, eventos y avisos'], ['canjes', SQLF.canjes, 'Contador de canjes']];
  h += '<div class="card mb16"><div class="ch">' + ic('db') + '<h3>Supabase</h3><span class="sub grow">Archivos SQL que necesita el panel</span><button class="btn sm" data-a="sqlretry">' + ic('refresh') + 'Revisar</button></div>' + st.map(function (x) {
    var miss = S.missing[x[0]], ok = !miss && (x[0] === 'panel' ? DB.src === 'supabase' : x[0] === 'remoto' ? RM.codigos && RM.codigos.rows : RM.canjes && RM.canjes.rows);
    return '<div class="li"><div class="th sm" style="--tc:' + (miss ? '#dc2626' : ok ? '#16a34a' : '#94a3b8') + '">' + ic(miss ? 'x' : ok ? 'check' : 'clock') + '</div><div class="t"><b class="mono" style="font-size:13.5px">' + x[1] + '</b><span>' + x[2] + '</span></div>' + (miss ? chipN('Falta correrlo', 'bad') : ok ? chipN('Listo', 'ok') : chipN('Sin revisar', 'line')) + '</div>';
  }).join('') + '<div class="cb xs mut" style="border-top:1px solid var(--border)">Los archivos están en tu Escritorio › Blokku › 02-Documentos › Supabase. Se corren en Supabase › SQL Editor › Run, en orden (1, 2, 3). Se pueden volver a correr sin romper nada.</div></div>';
  /* secciones */
  h += '<div class="card mb16"><div class="ch">' + ic('cloud') + '<h3>Tus datos en Supabase</h3><span class="sub">Cada sección guarda sus últimas 30 versiones</span></div>' + ALLSEC.filter(function (n) { return n !== 'meta'; }).map(function (n) {
    var s = DB.s[n]; if (!s) return '';
    return '<div class="li"><div class="t"><b>' + esc(SECN[n]) + '</b><span>' + plural(secCount(n), 'elemento') + ' · ' + kb(secSize(n)) + ' · versión ' + (s.rev || 0) + (s.at ? ' · cambió ' + ago(s.at) : '') + '</span></div><button class="btn sm" data-a="histOpen" data-n="' + n + '"' + (S.ro ? ' disabled' : '') + '>' + ic('history') + '<span class="hide-sm">Historial</span></button></div>';
  }).join('') + '</div>';
  /* respaldo */
  h += '<div class="grid g2 mb16"><div class="card pad"><h3 style="font-size:15px;font-weight:700">' + ic('down') + ' Exportar respaldo</h3><p class="sm mut mt8">Descarga un archivo con todas las secciones y tus imágenes. Guárdalo donde quieras.</p><button class="btn mt12" data-a="expJson">' + ic('down') + 'Descargar respaldo</button></div>' +
    '<div class="card pad"><h3 style="font-size:15px;font-weight:700">' + ic('up') + ' Importar respaldo</h3><p class="sm mut mt8">Sube un respaldo del panel (nuevo o del panel anterior). Reemplaza lo que hay; lo actual queda en el historial.</p><button class="btn mt12" data-a="impJson"' + (S.ro ? ' disabled' : '') + '>' + ic('up') + 'Elegir archivo…</button></div></div>';
  /* navegador */
  var lg = legacyDoc();
  if (lg) { var ls = legacyStats(lg); h += '<div class="card pad mb16"><h3 style="font-size:15px;font-weight:700">' + ic('phone') + ' Datos viejos de este navegador</h3><p class="sm mut mt8">Este navegador todavía guarda una copia del panel anterior (' + plural(ls.pend, 'pendiente') + ', ' + plural(ls.notas, 'nota') + ' de códigos, ' + plural(ls.imgs, 'imagen', 'imágenes') + '). El panel ya no la usa; se dejó como respaldo.</p><button class="btn mt12" data-a="migMerge"' + (S.ro ? ' disabled' : '') + '>' + ic('up') + 'Subir los datos de este navegador</button></div>'; }
  /* apariencia */
  var th = document.documentElement.getAttribute('data-theme') || 'auto';
  h += '<div class="card pad mb16"><h3 style="font-size:15px;font-weight:700">Apariencia</h3><div class="mt12">' + seg('themeSet', th, [['light', 'Claro', 'sun'], ['dark', 'Oscuro', 'moon'], ['auto', 'Automático', 'phone']]) + '</div></div>';
  h += '<div class="card pad"><h3 style="font-size:15px;font-weight:700">Sesión</h3><p class="sm mut mt8">' + (remembered() ? 'Este dispositivo recuerda tu clave hasta ' + esc(fdt(remembered(), 1)) + '.' : 'La clave se olvida al cerrar la pestaña.') + ' En un equipo ajeno, sal al terminar. Al salir se borran la clave y los datos guardados en este navegador.</p><button class="btn mt12" data-a="logout">' + ic('logout') + 'Cerrar sesión en este dispositivo</button></div>';
  return h;
}
A.themeSet = function (el) { var v = el.dataset.v; if (v === 'auto') { document.documentElement.removeAttribute('data-theme'); try { localStorage.removeItem('bk_theme'); } catch (e) { } } else { document.documentElement.setAttribute('data-theme', v); try { localStorage.setItem('bk_theme', v); } catch (e) { } } paintShell(); paintPage(); };

/* historial por sección */
function itemName(x) { return x.titulo || x.nombre || x.version && 'Versión ' + x.version || x.codigo || x.texto || x.id; }
function diffSec(n, old, cur) {
  if (n === 'codigos_notas') { var a = (old && old.map) || {}, b = (cur && cur.map) || {}, ch = 0; Object.keys(Object.assign({}, a, b)).forEach(function (k) { var x = a[k] || {}, y = b[k] || {}; if ((x.e || 'disponible') !== (y.e || 'disponible') || (x.n || '') !== (y.n || '')) ch++; }); return ch ? [plural(ch, 'código') + ' con estado o nota distinta'] : ['Sin diferencias']; }
  var O = {}, C2 = {}, out = [];
  ((old && old.items) || []).forEach(function (x) { O[x.id] = x; }); ((cur && cur.items) || []).forEach(function (x) { C2[x.id] = x; });
  var add = [], del = [], chg = [];
  Object.keys(O).forEach(function (id) { if (!C2[id]) add.push(O[id]); else { var a = clone(O[id]), b = clone(C2[id]); delete a._t; delete b._t; if (JSON.stringify(a) !== JSON.stringify(b)) chg.push(O[id]); } });
  Object.keys(C2).forEach(function (id) { if (!O[id]) del.push(C2[id]); });
  if (add.length) out.push('Regresan ' + add.length + ': ' + add.slice(0, 4).map(itemName).join(', ') + (add.length > 4 ? '…' : ''));
  if (del.length) out.push('Se quitan ' + del.length + ': ' + del.slice(0, 4).map(itemName).join(', ') + (del.length > 4 ? '…' : ''));
  if (chg.length) out.push('Cambian ' + chg.length + ': ' + chg.slice(0, 4).map(itemName).join(', ') + (chg.length > 4 ? '…' : ''));
  return out.length ? out : ['Igual a lo actual'];
}
A.histOpen = function (el) { histDrawer(el.dataset.n); };
function histDrawer(n) {
  var H = { rows: null, err: null, open: {} };
  drawer({
    title: 'Historial · ' + esc(SECN[n]), sub: 'Versiones guardadas antes de cada cambio. Restaurar no borra nada: lo actual también queda aquí.',
    body: function () {
      if (H.err) return '<div class="ban bad">' + ic('warn') + '<div class="tx">' + esc(H.err) + '</div></div>';
      if (!H.rows) return skel(4);
      if (!H.rows.length) return emptyBox('history', 'Todavía no hay versiones anteriores', 'Aparecen en cuanto cambies algo de esta sección.');
      return '<div class="list">' + H.rows.map(function (r) {
        var o = H.open[r.rev];
        return '<div class="li" style="flex-wrap:wrap"><div class="t"><b>' + esc(fdt(r.creado)) + '</b><span>versión ' + r.rev + ' · ' + kb(r.tam) + ' · ' + ago(r.creado) + '</span></div><div class="r"><button class="btn sm" data-a="histSee" data-n="' + n + '" data-rev="' + r.rev + '">' + ic('eye') + '<span class="hide-sm">Ver cambios</span></button><button class="btn sm" data-a="histRestore" data-n="' + n + '" data-rev="' + r.rev + '">' + ic('history') + 'Restaurar</button></div>' +
          (o ? '<div style="flex-basis:100%" class="sm mut">' + (o === 1 ? 'Cargando…' : o.map(function (x) { return '<div>• ' + esc(x) + '</div>'; }).join('')) + '</div>' : '') + '</div>';
      }).join('') + '</div>';
    }
  });
  rpc('admin_historial', { p_seccion: n }).then(function (r) { H.rows = r || []; drawerRefresh(); }, function (e) { H.err = e.message; drawerRefresh(); });
  A.histSee = async function (el) {
    var rev = +el.dataset.rev; if (H.open[rev] && H.open[rev] !== 1) { delete H.open[rev]; drawerRefresh(); return; }
    H.open[rev] = 1; drawerRefresh();
    try { var d = await rpc('admin_version_seccion', { p_seccion: n, p_rev: rev }); H.open[rev] = diffSec(n, d, DB.s[n].d); } catch (e) { H.open[rev] = [e.message]; }
    drawerRefresh();
  };
  A.histRestore = async function (el) {
    var rev = +el.dataset.rev;
    if (!await confirmDlg({ title: '¿Restaurar la versión ' + rev + '?', text: SECN[n] + ' regresa a como estaba el ' + fdt((H.rows.find(function (r) { return r.rev === rev; }) || {}).creado) + '. Lo de ahora queda en el historial por si te arrepientes.', ok: 'Restaurar', icon: 'history' })) return;
    try {
      var d = await rpc('admin_version_seccion', { p_seccion: n, p_rev: rev }); if (!d) throw new Error('Esa versión ya no existe');
      var now = Date.now();
      if (d.items) d.items.forEach(function (x) { x._t = now; });
      if (d.map) Object.keys(d.map).forEach(function (k) { d.map[k]._t = now; });
      if (d.items) { var cur = DB.s[n].d.items.map(function (x) { return x.id; }); d.borrados = (d.borrados || []).filter(function (id) { return !d.items.some(function (x) { return x.id === id; }); }).concat(cur.filter(function (id) { return !d.items.some(function (x) { return x.id === id; }); })); }
      DB.s[n].d = d; touch(n); await saveSec(n, true);
      toast('Versión restaurada'); drawerKill(); repaint();
    } catch (e) { toast(e.message, 'bad'); }
  };
}

/* exportar / importar */
A.expJson = async function (el) {
  busy(el, true, 'Preparando…');
  try {
    var refs = {}; COLS.forEach(function (n) { items(n).forEach(function (x) { (x.imgs || []).forEach(function (r) { if (r.indexOf('img:') === 0) refs[r.slice(4)] = 1; }); }); });
    var ids = Object.keys(refs), imgs = ids.length ? await rpc('admin_imagenes', { p_ids: ids }) || {} : {};
    var out = { formato: 'blokku-panel-v2', exportado: new Date().toISOString(), secciones: {}, imagenes: imgs };
    ALLSEC.forEach(function (n) { if (DB.s[n]) out.secciones[n] = DB.s[n].d; });
    download('blokku-panel-' + todayS() + '.json', JSON.stringify(out), 'application/json');
    toast('Respaldo descargado');
  } catch (e) { toast('No se pudo exportar: ' + e.message, 'bad'); }
  busy(el, false);
};
A.impJson = function () { var i = $('#jsonin'); i.value = ''; i.click(); };
function onJsonPicked(file) {
  if (!file) return;
  var fr = new FileReader();
  fr.onload = async function () {
    var j; try { j = JSON.parse(fr.result); } catch (e) { toast('Ese archivo no es un respaldo del panel', 'bad'); return; }
    var conv;
    if (j && j.formato === 'blokku-panel-v2' && j.secciones) conv = { secs: j.secciones, imgs: [], v2: j.imagenes || {} };
    else if (j && (Array.isArray(j.pendientes) || Array.isArray(j.timeline))) conv = docToSections(j, true);
    else { toast('Ese archivo no es un respaldo del panel', 'bad'); return; }
    if (!await confirmDlg({ title: '¿Importar este respaldo?', text: 'Reemplaza los datos del panel por los del archivo. Lo de ahora queda en el historial de cada sección.', ok: 'Importar', icon: 'up' })) return;
    var now = Date.now(); COLS.forEach(function (n) { var d = conv.secs[n]; if (d && d.items) d.items.forEach(function (x) { x._t = now; }); });
    conv.secs.meta = Object.assign({}, conv.secs.meta || {}, { importado: new Date().toISOString() });
    await runMigration(conv, false, 'Importando respaldo');
  };
  fr.readAsText(file);
}

/* ---------- migración ---------- */
function vOnboard() {
  var M = S.view.mig;
  if (M) return '<div class="card pad onb" style="max-width:560px;margin:8vh auto 0"><div class="mi" style="width:52px;height:52px;border-radius:14px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);margin-bottom:16px">' + ic('cloud') + '</div><h2 style="font-size:22px;font-weight:800">' + esc(M.title) + '</h2><p class="mut mt8">' + esc(M.txt) + '</p><div class="bar prog"><i style="width:' + Math.round(M.p * 100) + '%;transition:width .2s"></i></div>' + (M.err ? '<div class="ban bad">' + ic('warn') + '<div class="tx"><b>No se pudo terminar</b>' + esc(M.err) + '<div class="acts"><button class="btn sm" data-a="migRetry">' + ic('refresh') + 'Reintentar</button></div></div></div>' : '') + '</div>';
  var lg = legacyDoc();
  if (!lg) return '<div class="card pad" style="max-width:560px;margin:8vh auto 0"><div class="sk skl"></div></div>';
  var s = legacyStats(lg);
  return '<div class="card pad onb" style="max-width:600px;margin:6vh auto 0;padding:28px"><div style="width:56px;height:56px;border-radius:16px;display:grid;place-items:center;background:var(--grad);color:#fff;margin-bottom:18px;box-shadow:0 8px 24px rgba(91,76,240,.35)">' + ic('cloud') + '</div>' +
    '<h1 style="font-size:26px;font-weight:800">Bienvenido al panel nuevo</h1><p class="mt8" style="color:var(--text-2)">Ahora todo se guarda en <b>Supabase</b>: lo ves igual en tu teléfono, tu compu o cualquier navegador, y cada cambio queda con historial.</p>' +
    '<p class="mt12" style="color:var(--text-2)">Encontramos los datos que guardaste en <b>este navegador</b> con el panel anterior:</p>' +
    '<div class="stat3"><div><b>' + s.pend + '</b><span>pendientes (' + s.hechos + ' hechos)</span></div><div><b>' + s.notas + '</b><span>' + (s.notas === 1 ? 'nota' : 'notas') + ' de códigos</span></div><div><b>' + s.imgs + '</b><span>' + (s.imgs === 1 ? 'imagen' : 'imágenes') + '</span></div></div>' +
    '<button class="btn pri blk" style="height:48px;font-size:15px" data-a="migLegacy">' + ic('up') + 'Subir mis datos de este navegador a Supabase</button>' +
    '<button class="btn ghost blk mt8" data-a="migSeed">Empezar con los datos de Claude</button>' +
    '<p class="xs mut mt12">La copia de este navegador no se borra: queda como respaldo. Si empiezas con los datos de Claude, después la puedes subir desde Ajustes.</p></div>';
}
async function runMigration(conv, merge, title) {
  S.view.mig = { title: title, txt: 'Preparando…', p: 0, conv: conv, merge: merge };
  var keepInit = DB.needInit; DB.needInit = true; paintPage();
  try {
    await uploadAll(conv, function (t, p) { S.view.mig.txt = t; S.view.mig.p = p; paintPage(); }, merge);
    S.view.mig = null; DB.needInit = false; IMG.miss = {};
    toast(title === 'Importando respaldo' ? 'Respaldo importado' : 'Listo: tus datos ya viven en Supabase');
    paintShell(); paintPage(true); rloadAll();
  } catch (e) { S.view.mig.err = e.message; DB.needInit = keepInit || true; paintPage(); }
}
A.migRetry = function () { var M = S.view.mig; if (M) runMigration(M.conv, M.merge, M.title); };
function legacyConv(lg, merge) {
  var conv = docToSections(lg, true), now = Date.now();
  if (merge) {
    COLS.forEach(function (n) { (conv.secs[n].items || []).forEach(function (x) { var c = item(n, x.id); var a = clone(x), b = c ? clone(c) : null; if (a) delete a._t; if (b) delete b._t; if (!b || JSON.stringify(a) !== JSON.stringify(b)) x._t = now; }); });
    Object.keys(conv.secs.codigos_notas.map).forEach(function (h) { conv.secs.codigos_notas.map[h]._t = now; });
  }
  conv.secs.meta = Object.assign({}, DB.s.meta ? DB.s.meta.d : {}, { origen: 'navegador', decidido: true, subido: new Date().toISOString() });
  return conv;
}
A.migLegacy = function () { var lg = legacyDoc(); if (!lg) return; var m = !!DB.ready; runMigration(legacyConv(lg, m), m, 'Subiendo tus datos'); };
A.migSeed = async function () {
  if (!await confirmDlg({ title: '¿Empezar con los datos de Claude?', text: 'Tus datos de este navegador no se suben ahora (quedan guardados aquí). Los puedes subir después desde Ajustes.', ok: 'Empezar', icon: 'spark' })) return;
  if (DB.ready) { DB.s.meta.d = Object.assign({}, DB.s.meta.d, { decidido: true }); touch('meta'); DB.needInit = false; paintShell(); paintPage(true); return; }
  var c = docToSections(clone(SEED_DOC), false); c.secs.meta.decidido = true;
  runMigration(c, false, 'Preparando tu panel');
};
A.migMerge = async function () {
  var lg = legacyDoc(); if (!lg) return;
  if (!await confirmDlg({ title: '¿Subir los datos de este navegador?', text: 'Se suman a lo que ya hay en Supabase. Si algo existe en los dos lados, gana lo de este navegador. Todo queda en el historial.', ok: 'Subir', icon: 'up' })) return;
  await runMigration(legacyConv(lg, true), true, 'Subiendo los datos de este navegador');
};
VIEWS.ajustes = vAjustes;
