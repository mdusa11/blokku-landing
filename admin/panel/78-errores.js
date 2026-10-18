/* ================= PROYECTO: errores de la app ================= */
var ER_EST = { nuevo: ['Nuevo', 'bad'], visto: ['Visto', 'info'], resuelto: ['Resuelto', 'ok'], ignorado: ['Ignorado', 'line'] };
var ER_PLAT = { android: 'Android', ios: 'iOS', otra: 'Otra' };
var ER_CRASH = 'https://console.firebase.google.com/project/blokku-dusa/crashlytics';
function erList() {
  return rows('errores').slice().sort(function (a, b) {
    return (b.estado === 'nuevo') - (a.estado === 'nuevo') || new Date(b.ultima) - new Date(a.ultima);
  });
}
function erNuevos() { return rows('errores').filter(function (x) { return x.estado === 'nuevo'; }).length; }
function erFatales() { return rows('errores').filter(function (x) { return x.fatal && (x.estado === 'nuevo' || x.estado === 'visto'); }).length; }
function erGet(f) { return rows('errores').filter(function (x) { return x.firma === f; })[0]; }
function erLinea(m) { return String(m || '').split('\n')[0]; }
function erTitulo(x) { return x.tipo + ': ' + erLinea(x.mensaje); }
function erF() { return S.f.er = S.f.er || { tab: 'nuevos' }; }
function erTabOf(x, t) { return t === 'todos' ? true : t === 'nuevos' ? x.estado === 'nuevo' : t === 'resueltos' ? x.estado === 'resuelto' : x.estado === 'ignorado'; }
function erChips(x) {
  var h = '<div class="chips">';
  if (x.fatal) h += chip('fatal', 'bad', 'warn');
  h += chip(ER_EST[x.estado] ? ER_EST[x.estado][0] : x.estado, ER_EST[x.estado] ? ER_EST[x.estado][1] : '');
  (x.versiones || []).forEach(function (v) { if (v) h += chipN('v' + v, 'ac'); });
  (x.plataformas || []).forEach(function (p) { h += chipN(ER_PLAT[p] || p, 'line'); });
  return h + '</div>';
}
function erKpis() {
  var l = rows('errores'), o = rm('errores'), now = Date.now(), ld = o.rows == null && !o.err ? '<span class="sk" style="display:inline-block;width:48px;height:26px"></span>' : null;
  var tot = l.reduce(function (a, x) { return a + (x.conteo || 0); }, 0), d1 = l.filter(function (x) { return now - new Date(x.ultima).getTime() < 864e5; }).length;
  var h1 = l.filter(function (x) { return now - new Date(x.ultima).getTime() < 36e5; }).length;
  var last = l.reduce(function (a, x) { return !a || new Date(x.ultima) > new Date(a) ? x.ultima : a; }, null);
  return '<div class="kpis">' +
    kpi('warn', 'Errores nuevos', ld || nf(erNuevos()), erNuevos() ? 'Sin revisar' : 'Nada por revisar') +
    kpi('hash', 'Ocurrencias', ld || nf(tot), plural(l.length, 'error distinto', 'errores distintos')) +
    kpi('flag', 'Fatales', ld || nf(erFatales()), 'Sin resolver') +
    kpi('clock', 'Últimas 24 h', ld || nf(d1), (h1 ? plural(h1, 'en la última hora', 'en la última hora') : last ? 'Último ' + relT(last) : 'Sin errores')) + '</div>';
}
function vErrores() {
  var f = erF(), o = rm('errores');
  var h = pageHead('Errores', 'Fallos de la app que llegan desde los teléfonos, agrupados por tipo. Un renglón por error, con cuántas veces pasó.', '<button class="btn" data-a="erReload">' + ic('refresh') + 'Actualizar</button>',
    ['Cada error se agrupa por su «firma» (tipo y primeras líneas del stack): si pasa 50 veces, ves un renglón con <b>×50</b>.',
      'Los <b>nuevos</b> son los que no has abierto. Al abrir uno queda como <b>visto</b>. Si marcas uno como <b>resuelto</b> y vuelve a pasar en una versión distinta, regresa a nuevo.',
      '<b>Copiar</b> en el detalle arma un reporte listo para pegarle a Claude.',
      'Aquí solo llegan errores de Dart. Los cierres nativos (Android/iOS) se ven en Firebase Crashlytics.']);
  if (o.err && o.err.code === 'sin_sql') return h + '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.errores, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Ábrelo, copia todo el texto, pégalo en Supabase › SQL Editor y presiona Run.') + '</div>' + erCrashCard();
  if (o.err) h += rerr(o, 'los errores').replace('data-a="rretry"', 'data-a="erReload"');
  h += erKpis();
  var all = erList(), cnt = function (t) { return all.filter(function (x) { return erTabOf(x, t); }).length; };
  h += '<div class="row sec mb12">' + fchips('erTab', f.tab, [['nuevos', 'Nuevos', cnt('nuevos')], ['todos', 'Todos', cnt('todos')], ['resueltos', 'Resueltos', cnt('resueltos')], ['ignorados', 'Ignorados', cnt('ignorados')]]) + '</div>';
  var L = all.filter(function (x) { return erTabOf(x, f.tab); });
  h += '<div class="card">';
  if (o.rows == null && !o.err) h += skel(4);
  else if (!L.length) h += f.tab === 'nuevos' ? emptyBox('check', all.length ? 'Sin errores nuevos' : 'Todavía no ha llegado ningún error', all.length ? 'Todo lo que llegó ya lo viste. Revisa «Todos» para ver el historial.' : 'Cuando la app reporte un fallo, aparecerá aquí.') : emptyBox('check', 'Nada en esta lista', 'Cambia de pestaña para ver los demás errores.');
  else {
    h += '<div class="list" style="border:0;box-shadow:none;border-radius:0">';
    L.forEach(function (x) {
      h += '<div class="li clk er-li' + (x.estado === 'nuevo' ? ' nuevo' : '') + '" data-a="erOpen" data-f="' + esc(x.firma) + '" role="link" tabindex="0"><div class="t"><b><span class="er-ty">' + esc(x.tipo) + '</span></b><span class="er-msg">' + esc(erLinea(x.mensaje) || 'Sin mensaje') + '</span>' + erChips(x) +
        '<div class="er-when">Primera vez ' + esc(relT(x.primera)) + ' · última ' + esc(relT(x.ultima)) + '</div></div><span class="er-n' + (x.estado === 'nuevo' ? ' hot' : '') + '" title="' + esc(plural(x.conteo, 'vez', 'veces')) + '">×' + nf(x.conteo) + '</span></div>';
    });
    h += '</div>';
  }
  h += '</div>' + erCrashCard();
  return h;
}
function erCrashCard() {
  return '<a class="card pad sec row" style="gap:14px;text-decoration:none;color:inherit" href="' + ER_CRASH + '" target="_blank" rel="noopener noreferrer"><span class="kic" style="width:36px;height:36px;border-radius:10px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);flex:none">' + ic('ext') + '</span><div class="grow" style="min-width:0"><b>Cierres nativos (Android/iOS) → Firebase Crashlytics</b><div class="sm mut">Los cierres que tumban la app por completo no pasan por aquí; se ven en Crashlytics. Se abre en otra pestaña.</div></div>' + ic('chr', 'faint') + '</a>';
}
function erReporte(x) {
  var f = function (a) { return (a && a.length ? a.join(', ') : '—'); };
  return '## Error en Blokku: ' + x.tipo + '\n\n' +
    '- **Mensaje:** ' + String(x.mensaje || '').replace(/\n/g, '\n  ') + '\n' +
    '- **Fatal:** ' + (x.fatal ? 'sí' : 'no') + '\n' +
    '- **Versiones:** ' + f(x.versiones) + '\n' +
    '- **Plataformas:** ' + f((x.plataformas || []).map(function (p) { return ER_PLAT[p] || p; })) + '\n' +
    '- **Dispositivo de ejemplo:** ' + (x.ejemplo_dispositivo || '—') + '\n' +
    '- **Ocurrencias:** ' + x.conteo + '\n' +
    '- **Primera vez:** ' + (x.primera ? new Date(x.primera).toISOString() : '—') + '\n' +
    '- **Última vez:** ' + (x.ultima ? new Date(x.ultima).toISOString() : '—') + '\n' +
    '- **Estado:** ' + x.estado + '\n\n' +
    '### Stack\n\n```\n' + (x.stack || '(sin stack)') + '\n```\n';
}
async function erSet(firma, estado, silent) {
  var x = erGet(firma); if (!x) return false;
  var prev = x.estado;
  if (estado !== 'borrar') x.estado = estado;
  repaint();
  try { await rpc('admin_error_estado', { p_firma: firma, p_estado: estado }); }
  catch (e) { if (estado !== 'borrar') x.estado = prev; repaint(); toast(e.message || 'No se pudo guardar', 'bad'); return false; }
  if (estado === 'borrar') { var o = RM.errores; o.rows = o.rows.filter(function (r) { return r.firma !== firma; }); repaint(); }
  return true;
}
function erDrawer(firma) {
  var x0 = erGet(firma); if (!x0) { toast('Ese error ya no está', 'warn'); return; }
  drawer({
    title: function () { var x = erGet(firma); return x ? esc(x.tipo) : ''; },
    sub: function () { var x = erGet(firma); return x ? esc(plural(x.conteo, 'vez', 'veces')) + ' · última ' + esc(relT(x.ultima)) : ''; },
    live: true, wide: true,
    body: function () {
      var x = erGet(firma); if (!x) return emptyBox('check', 'Este error ya no está', '');
      return erChips(x) +
        '<div class="er-h"><h4>Mensaje</h4></div><div class="er-full">' + esc(x.mensaje || 'Sin mensaje') + '</div>' +
        '<div class="er-h"><h4>Stack</h4><button class="btn sm" data-a="erCopy" data-f="' + esc(x.firma) + '">' + ic('copy') + 'Copiar</button></div>' +
        '<div class="er-stack" data-keep="erstack" tabindex="0">' + esc(x.stack || '(sin stack)') + '</div>' +
        '<div class="xs mut mt8">«Copiar» arma un reporte en markdown con todo esto, listo para pegarle a Claude.</div>' +
        '<div class="er-h"><h4>Detalles</h4></div><dl class="er-dl">' +
        '<dt>Versiones</dt><dd>' + esc((x.versiones || []).join(', ') || '—') + '</dd>' +
        '<dt>Plataformas</dt><dd>' + esc((x.plataformas || []).map(function (p) { return ER_PLAT[p] || p; }).join(', ') || '—') + '</dd>' +
        '<dt>Dispositivo</dt><dd>' + (x.ejemplo_dispositivo ? esc(x.ejemplo_dispositivo) + ' <span class="mut">(de un caso)</span>' : '—') + '</dd>' +
        '<dt>Ocurrencias</dt><dd>' + esc(nf(x.conteo)) + '</dd>' +
        '<dt>Primera vez</dt><dd>' + esc(fdt(x.primera)) + ' · ' + esc(relT(x.primera)) + '</dd>' +
        '<dt>Última vez</dt><dd>' + esc(fdt(x.ultima)) + ' · ' + esc(relT(x.ultima)) + '</dd>' +
        '<dt>Firma</dt><dd class="mono xs">' + esc(x.firma) + '</dd></dl>';
    },
    foot: function () {
      var x = erGet(firma); if (!x) return '';
      var b = function (a, ico, t, cls) { return '<button class="btn ' + (cls || '') + '" data-a="' + a + '" data-f="' + esc(firma) + '">' + ic(ico) + t + '</button>'; };
      return (x.estado === 'nuevo' ? b('erVisto', 'eye', 'Marcar visto') : '') +
        (x.estado !== 'resuelto' ? b('erResuelto', 'check', 'Resuelto', 'pri') : '') +
        (x.estado !== 'ignorado' ? b('erIgnorar', 'eyeoff', 'Ignorar') : '') +
        (x.estado !== 'nuevo' ? b('erReabrir', 'refresh', 'Reabrir') : '') +
        '<span class="sp"></span>' + b('erBorrar', 'trash', 'Borrar', 'dng');
    }
  });
  if (x0.estado === 'nuevo') erSet(firma, 'visto');
}
A.erOpen = function (el) { erDrawer(el.dataset.f); };
A.erTab = function (el) { erF().tab = el.dataset.v; paintPage(); };
A.erReload = function () { rload('errores'); };
A.erCopy = function (el) { var x = erGet(el.dataset.f); if (x) copyTxt(erReporte(x), 'Reporte copiado: pégalo en Claude'); };
function erAct(estado, msg) { return async function (el) { if (await erSet(el.dataset.f, estado)) toast(msg); }; }
A.erVisto = erAct('visto', 'Marcado como visto');
A.erResuelto = erAct('resuelto', 'Marcado como resuelto');
A.erIgnorar = erAct('ignorado', 'Error ignorado');
A.erReabrir = erAct('nuevo', 'Error reabierto');
A.erBorrar = async function (el) {
  var f = el.dataset.f, x = erGet(f); if (!x) return;
  if (!await confirmDlg({ title: '¿Borrar este error?', text: 'Se quita de la lista. Si la app lo vuelve a reportar, aparece de nuevo como nuevo.', ok: 'Borrar', danger: true })) return;
  if (await erSet(f, 'borrar')) { drawerKill(); toast('Error borrado'); }
};
OPENERS.er = function (a) { var f = erF(); if (a === 'nuevos') f.tab = 'nuevos'; paintPage(); };
VIEWS['proyecto/errores'] = vErrores;
