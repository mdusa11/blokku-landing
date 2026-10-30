/* ================= SOLO GEMAS (36-solo-gemas.sql, app 2.0) ================= */
// Modelo «solo gemas»: con dinero real solo se compran paquetes de gemas y Sin anuncios; el pase y lo exclusivo cuestan gemas.
// Todo por admin_solo_gemas(p_clave, p_accion, p_datos). Sin acción (o 'ver') solo lee y devuelve
// {ahora, activa, config, tienda, paquetes, ofertas, articulos, catalogo, temporadas, cambios}; cada acción devuelve lo mismo.
//   'config' {clave:n}  'tienda_config' {clave:n}  'paquete' {producto,gemas?,bonus?,a_la_venta?,orden?}
//   'oferta' {producto,extra,desde,hasta}  'oferta_quitar' {id}  'articulo' {id,gemas?,activo?,orden?}
//   'moneda' {item,moneda,precio,rareza?}  'temporada' {id,inicio,fin,niveles?,plus_niveles?,activa?}
//   'niveles' {temporada,gemas:{"4":50,…}}
SQLF.solo_gemas = '36-solo-gemas.sql';
FNF.admin_solo_gemas = 'solo_gemas';
RFN.solo_gemas = 'admin_solo_gemas';
N20['juego/solo-gemas'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/solo-gemas'; })) {
    var at = -1; g.items.forEach(function (i, n) { if (i[0] === 'juego/gemas') at = n; });
    g.items.splice(at >= 0 ? at + 1 : g.items.length, 0, ['juego/solo-gemas', 'Solo gemas', 'gift']);
  }
  ROUTES['juego/solo-gemas'] = { t: 'Solo gemas', ic: 'gift', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/solo-gemas'] = {
  que: 'El modelo «SOLO GEMAS»: con dinero real la app solo vende PAQUETES DE GEMAS y «Sin anuncios». Todo lo demás se paga con gemas (el pase de temporada y lo exclusivo) o con Bloques (lo normal de la tienda). Aquí decides cuántas gemas da cada paquete, las ofertas con fecha, cuánto cuesta el pase y cuántas gemas regala por nivel, en qué moneda se vende cada artículo y los precios generales, y ves todo lo que se ha cambiado.',
  ve: 'En la app 2.0: la tienda de gemas (los paquetes con su «+X %» de regalo), el pase de temporada que se compra con gemas, los artículos exclusivos con precio en gemas (color magenta) y los de siempre con precio en Bloques (color dorado). Los productos viejos blokku_pack_* y blokku_oferta_* YA NO SE VENDEN, pero lo que alguien ya compró se conserva.',
  cuando: 'Cuando quieras cambiar un paquete, lanzar una oferta de fin de semana, mover el precio del pase, pasar un artículo de Bloques a gemas (o al revés) o revisar quién cambió qué. Antes de subir un precio, revisa que el paquete grande siga dando más gemas por peso que el chico.',
  como: [
    '<b>Paquetes de gemas (dinero real):</b> el precio en pesos NO se decide aquí: lo fija Google Play / App Store (ahí se pone $19, $49, $99…). El panel solo decide cuántas gemas y cuánto bonus da cada producto. La tabla de pesos que ves es una referencia fija para calcular «gemas por peso».',
    '<b>Ofertas temporales:</b> gemas extra de regalo para un paquete entre dos fechas (máximo 31 días, sin pisarse con otra del mismo paquete, y el extra no puede pasar de las gemas del paquete). La compra recibe lo que diga el panel en el momento de pagar: gemas + bonus + extra vigente.',
    '<b>Pase:</b> el premium y el «premium + niveles» cuestan gemas. Cada nivel del carril premium puede regalar gemas. El total de gemas que devuelve una temporada no puede pasar del DOBLE del precio del premium (el servidor lo bloquea); arriba del 100 % el jugador gana gemas de más al completarlo, por eso te aviso.',
    '<b>Tienda con dos monedas:</b> cada artículo se vende en Bloques O en gemas. Al pasarlo a gemas deja de venderse en Bloques y al revés. Con Bloques solo se venden temas, piezas, efectos, marcos y títulos. Lo ya comprado nunca se quita.',
    '<b>Precios generales:</b> cada valor tiene un rango (lo permite el servidor) y, en los de gemas, el valor de fábrica por si quieres volver a él.',
    '<b>Historial:</b> cada cambio queda anotado con fecha, qué se pidió y cómo estaba antes.',
    '<b>Sin anuncios</b> sigue siendo la otra compra con dinero; no se administra aquí.',
    H_HORA
  ]
};

var SG = { saving: '', tab: 'paq', d: {}, on: {}, q: '', lim: 40, tsel: '', hn: 30 };
var sgPesos = { blokku_gemas_80: 19, blokku_gemas_210: 49, blokku_gemas_450: 99, blokku_gemas_950: 199, blokku_gemas_2000: 399 };
var SG_GEM = '#E0388F', SG_BLQ = '#D4A017';
var SG_TABS = [['paq', 'Paquetes y ofertas', 'store'], ['pase', 'Pase', 'trophy'], ['tienda', 'Tienda', 'gift'], ['precios', 'Precios generales', 'edit'], ['hist', 'Historial', 'history']];
var SG_ACC = { config: 'Ajustes de gemas', tienda_config: 'Precios de la tienda en Bloques', paquete: 'Paquete de gemas', oferta: 'Oferta nueva', oferta_quitar: 'Oferta quitada', articulo: 'Artículo con gemas', moneda: 'Cambio de moneda', temporada: 'Temporada del pase', niveles: 'Gemas por nivel del pase' };
var SG_KEY = { producto: 'Producto', gemas: 'Gemas', bonus: 'Bonus', a_la_venta: 'A la venta', orden: 'Orden', extra: 'Extra', desde: 'Desde', hasta: 'Hasta', id: 'Id', activo: 'Activo', item: 'Artículo', moneda: 'Moneda', precio: 'Precio', rareza: 'Rareza', inicio: 'Inicio', fin: 'Fin', niveles: 'Niveles', plus_niveles: 'Niveles del plus', activa: 'Activa', temporada: 'Temporada', bloques: 'En Bloques', actualizado: 'Actualizado', vendible: 'Se vende' };

function sgRows() { var o = rm('solo_gemas'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function sgCfg(r, k) { return (r.config || []).filter(function (c) { return c.clave === k; })[0]; }
function sgDraft(id, srv) { return id in SG.d ? SG.d[id] : (srv == null ? '' : String(srv)); }
function sgOn(id, srv) { return id in SG.on ? SG.on[id] : !!srv; }
function sgInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function sgGem(n) { return nf(n) + ' gema' + (Number(n) === 1 ? '' : 's'); }
function sgPct(p) { return p.gemas > 0 ? Math.round(100 * ((p.bonus || 0) + (p.extra || 0)) / p.gemas) : 0; }
function sgPeso1(n) { return (Math.round(n * 10) / 10).toLocaleString('es-MX', { minimumFractionDigits: 1, maximumFractionDigits: 1 }); }
function sgMoneda(m) {
  var c = m === 'gemas' ? SG_GEM : m === 'bloques' ? SG_BLQ : '';
  var t = m === 'gemas' ? 'Gemas' : m === 'bloques' ? 'Bloques' : 'No se vende';
  return '<span class="chip" style="' + (c ? 'color:' + c + ';border-color:' + c + ';font-weight:700' : '') + '"><i' + (c ? ' style="background:' + c + '"' : '') + '></i>' + t + '</span>';
}
function sgAhora(r) { var t = r && r.ahora ? new Date(r.ahora).getTime() : NaN; return isNaN(t) ? Date.now() : t; }
function sgStore(res) {
  var o = RM.solo_gemas = RM.solo_gemas || { rows: null };
  if (res && res.config) { o.rows = res; o.err = null; o.t = Date.now(); } else rload('solo_gemas', true);
}
async function sgCall(accion, datos) { var res = await rpc('admin_solo_gemas', { p_accion: accion, p_datos: datos }); sgStore(res); return res; }
// confirma en palabras, manda la acción y repinta. extra = avisos que piden una segunda confirmación.
async function sgDo(accion, datos, tipo, ttl, txt, lines, okMsg, o) {
  o = o || {};
  if (!await confirmDlg({ title: ttl, text: txt, html: cbox(lines), ok: o.ok || 'Sí, guardar', danger: !!o.danger, icon: o.icon || 'gift' })) return false;
  if (o.warn && o.warn.length && !await confirmDlg({ title: 'Ojo, revisa esto antes de seguir', text: 'Hay cosas que podrían salir mal. ¿Seguro que quieres guardarlo así?', html: '<div class="conf-box">' + o.warn.map(function (w) { return '<div>• ' + w + '</div>'; }).join('') + '</div>', ok: 'Sí, guardar de todos modos', danger: true, icon: 'warn' })) return false;
  SG.saving = tipo; paintPage();
  var ok = false;
  try { await sgCall(accion, datos); toast(okMsg || 'Guardado'); ok = true; }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
  SG.saving = ''; paintPage(); return ok;
}
function sgBtn(act, tipo, icn, txt, extra) {
  return '<button class="btn pri" data-a="' + act + '"' + (extra || '') + (SG.saving ? ' disabled' : '') + '>' + (SG.saving === tipo ? '<span class="spin"></span>' : ic(icn)) + txt + '</button>';
}

I.sgIn = function (el) { SG.d[el.id] = el.value; sgLive(el.id); };
C.sgTog = function (el) { SG.on[el.id] = el.checked; };
C.sgDate = function (el) { SG.d[el.id] = el.value; };
A.sgTab = function (el) { SG.tab = el.dataset.v; paintPage(); };
A.sgReload = function () { SG.d = {}; SG.on = {}; rload('solo_gemas'); toast('Recargando…', 'info'); };
function sgLive(id) {
  var m;
  if ((m = /^(sg_p_.+)_[gbo]$/.exec(id))) { var r = sgRows(); if (!r) return; var pr = m[1].slice(5), p = (r.paquetes || []).filter(function (x) { return x.producto === pr; })[0], e = $('#' + m[1] + '_pv'); if (p && e) e.innerHTML = sgPackPrev(p, m[1]); }
  else if (/^sg_nv_/.test(id)) sgNvTot();
}

/* ---------- paquetes ---------- */
function sgPackPrev(p, k) {
  var g = sgInt(sgDraft(k + '_g', p.gemas), 0, 1e9), b = sgInt(sgDraft(k + '_b', p.bonus), 0, 1e9);
  if (g == null || b == null || g < 1) return '<span class="mut">Escribe números enteros</span>';
  var tot = g + b + (p.extra || 0), peso = sgPesos[p.producto], pct = Math.round(100 * (b + (p.extra || 0)) / g);
  return 'Total <b>' + nf(tot) + '</b> · el jugador verá <b>+' + pct + ' %</b>' + (peso ? ' · <b>' + sgPeso1(tot / peso) + '</b> gemas por peso' : '');
}
function sgPackWarns(r, pr, g, b) {
  var w = [], list = (r.paquetes || []).filter(function (x) { return sgPesos[x.producto]; }).map(function (x) {
    var gg = x.producto === pr ? g : x.gemas, bb = x.producto === pr ? b : x.bonus;
    return { pr: x.producto, peso: sgPesos[x.producto], t: gg + bb + (x.extra || 0) };
  });
  list.forEach(function (a) {
    list.forEach(function (c) {
      if (a.peso < c.peso && c.t / c.peso < a.t / a.peso && (a.pr === pr || c.pr === pr))
        w.push('«' + esc(c.pr) + '» ($' + c.peso + ') daría ' + sgPeso1(c.t / c.peso) + ' gemas por peso, MENOS que «' + esc(a.pr) + '» ($' + a.peso + ') con ' + sgPeso1(a.t / a.peso) + '. Al jugador le convendría comprar el barato varias veces.');
    });
  });
  return w;
}
function sgPaquetes(r) {
  var ps = r.paquetes || [];
  var h = '<div class="card sec"><div class="ch">' + ic('store') + '<h3>Paquetes de gemas (dinero real)</h3><span class="sub grow">' + nf(ps.filter(function (p) { return p.a_la_venta; }).length) + ' a la venta de ' + nf(ps.length) + '</span></div><div class="cb">' +
    '<div class="ban info" style="margin:0 0 12px">' + ic('info') + '<div class="tx"><b>El precio en pesos no se decide aquí</b>Lo fija Google Play / App Store (la tabla de pesos es solo una referencia fija para calcular gemas por peso). Aquí cambias cuántas gemas y cuánto bonus da cada producto. Los productos blokku_pack_* y blokku_oferta_* ya no se venden.</div></div>';
  if (!ps.length) return h + '<p class="mut">No hay paquetes de gemas.</p></div></div>';
  h += ps.map(function (p) {
    var k = 'sg_p_' + p.producto, peso = sgPesos[p.producto];
    var frase = '<span class="mono">' + esc(p.producto) + '</span> → ' + (peso ? '<b>$' + peso + ' MXN</b> <span class="xs mut">(lo cobra Play/App Store · lo fija la tienda)</span>' : '<b>precio en la tienda</b> <span class="xs mut">(sin referencia en el panel)</span>') + ' → <b>' + sgGem(p.total) + '</b>';
    return '<div class="card" style="padding:14px;margin-bottom:10px"><div class="row nw" style="align-items:flex-start;flex-wrap:wrap"><div class="grow">' + frase +
      '<div class="xs mut" style="margin-top:4px">' + nf(p.gemas) + ' + ' + nf(p.bonus) + ' de bonus' + (p.extra ? ' + <b style="color:' + SG_GEM + '">' + nf(p.extra) + ' de oferta vigente</b>' : '') + ' · hoy el jugador ve <b>+' + sgPct(p) + ' %</b>' + (peso ? ' · ' + sgPeso1(p.total / peso) + ' gemas por peso' : '') + ' · ' + nf(p.ventas) + ' ventas · ' + (p.a_la_venta ? chip('a la venta', 'ok') : chip('apagado', 'warn')) + '</div></div></div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:12px;align-items:flex-end;margin-top:10px">' +
      field(k + '_g', 'Gemas', inp(k + '_g', sgDraft(k + '_g', p.gemas), { type: 'number', mode: 'numeric', min: 1, di: 'sgIn' }).replace('class="in"', 'class="in" style="width:110px"')) +
      field(k + '_b', 'Bonus', inp(k + '_b', sgDraft(k + '_b', p.bonus), { type: 'number', mode: 'numeric', min: 0, di: 'sgIn' }).replace('class="in"', 'class="in" style="width:110px"')) +
      field(k + '_o', 'Orden', inp(k + '_o', sgDraft(k + '_o', p.orden), { type: 'number', mode: 'numeric', min: 0, di: 'sgIn' }).replace('class="in"', 'class="in" style="width:90px"')) +
      '<div class="f">' + tog(k + '_v', sgOn(k + '_v', p.a_la_venta), 'A la venta', { dc: 'sgTog', on: 'Sí', off: 'No' }) + '</div>' +
      '<button class="btn sm" data-a="sgPackSave" data-p="' + esc(p.producto) + '"' + (SG.saving ? ' disabled' : '') + '>' + ic('check') + 'Guardar</button></div>' +
      '<div class="xs" id="' + k + '_pv" style="margin-top:8px">' + sgPackPrev(p, k) + '</div></div>';
  }).join('');
  return h + '</div></div>';
}
A.sgPackSave = function (el) {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var pr = el.dataset.p, p = (r.paquetes || []).filter(function (x) { return x.producto === pr; })[0]; if (!p) return Promise.resolve();
  var k = 'sg_p_' + pr, g = sgInt(sgDraft(k + '_g', p.gemas), 1, 100000), b = sgInt(sgDraft(k + '_b', p.bonus), 0, 100000), o = sgInt(sgDraft(k + '_o', p.orden), 0, 999999), errs = {};
  if (g == null) errs[k + '_g'] = 'Un entero de 1 a 100,000 (no puede quedar vacío ni en 0).';
  if (b == null) errs[k + '_b'] = 'Un entero de 0 a 100,000 (pon 0 si no hay bonus).';
  else if (g != null && b > g) errs[k + '_b'] = 'El bonus no puede pasar de las gemas del paquete (' + nf(g) + ', o sea 100 %).';
  if (o == null) errs[k + '_o'] = 'Un entero de 0 a 999,999.';
  if (!showErrs(errs)) return Promise.resolve();
  var v = sgOn(k + '_v', p.a_la_venta);
  if (g === p.gemas && b === p.bonus && o === p.orden && v === !!p.a_la_venta) { toast('No hay cambios', 'info'); return Promise.resolve(); }
  var warn = sgPackWarns(r, pr, g, b), old = p.gemas + p.bonus, nw = g + b;
  if (old > 0 && Math.abs(nw - old) / old > 0.5) warn.push('El total del paquete pasa de ' + nf(old) + ' a ' + nf(nw) + ' gemas (' + (nw > old ? 'sube' : 'baja') + ' ' + Math.round(100 * Math.abs(nw - old) / old) + ' %). Es un cambio muy grande.');
  var peso = sgPesos[pr], tot = nw + (p.extra || 0);
  return sgDo('paquete', { producto: pr, gemas: g, bonus: b, a_la_venta: v, orden: o }, 'pack', '¿Cambiar este paquete de gemas?',
    'Desde ahora, quien compre ' + pr + (peso ? ' (cuesta $' + peso + ' MXN en la tienda)' : '') + ' recibirá ' + sgGem(tot) + '. Lo ya comprado no cambia.',
    [['Producto', '<span class="mono">' + esc(pr) + '</span>'], ['Gemas', nf(p.gemas) + ' → <b>' + nf(g) + '</b>'], ['Bonus', nf(p.bonus) + ' → <b>' + nf(b) + '</b> (el jugador verá +' + Math.round(100 * (b + (p.extra || 0)) / g) + ' %)'], ['A la venta', (p.a_la_venta ? 'Sí' : 'No') + ' → <b>' + (v ? 'Sí' : 'No') + '</b>'], ['Orden', nf(p.orden) + ' → <b>' + nf(o) + '</b>']],
    'Paquete guardado', { icon: 'store', warn: warn })
    .then(function (ok) { if (ok) ['_g', '_b', '_o', '_v'].forEach(function (s) { delete SG.d[k + s]; delete SG.on[k + s]; }); });
};

/* ---------- ofertas temporales ---------- */
function sgOfertas(r) {
  var os = r.ofertas || [], now = sgAhora(r), ps = r.paquetes || [];
  var h = '<div class="card sec"><div class="ch">' + ic('clock') + '<h3>Ofertas temporales de gemas extra</h3><span class="sub grow">' + nf(os.filter(function (o) { return o.vigente; }).length) + ' vigentes</span></div><div class="cb">';
  if (!os.length) h += '<p class="mut">No hay ofertas (se muestran las de los últimos 30 días y las próximas).</p>';
  else h += '<div class="tw"><table class="tbl"><thead><tr><th>Paquete</th><th class="num">Gemas extra</th><th>Desde</th><th>Hasta</th><th>Estado</th><th></th></tr></thead><tbody>' + os.map(function (o) {
    var est = o.vigente ? chip('vigente', 'ok') : new Date(o.desde).getTime() > now ? chip('próxima', 'warn') : chip('pasada', '');
    return '<tr><td class="mono xs">' + esc(o.producto) + '</td><td class="num"><b>+' + nf(o.extra) + '</b></td><td>' + esc(fdt(o.desde)) + '</td><td>' + esc(fdt(o.hasta)) + '</td><td>' + est + '</td>' +
      '<td class="num"><button class="btn sm ghost" data-a="sgOfQuitar" data-id="' + esc(o.id) + '"' + (SG.saving ? ' disabled' : '') + '>' + ic('trash') + 'Quitar</button></td></tr>';
  }).join('') + '</tbody></table></div>';
  var d0 = SG.d.sg_o_desde == null ? toLocalInput(new Date()) : SG.d.sg_o_desde, d1 = SG.d.sg_o_hasta == null ? toLocalInput(addMs(3 * 864e5)) : SG.d.sg_o_hasta;
  h += '<h4 style="margin:16px 0 8px">Crear una oferta</h4><div class="grid g2">' +
    field('sg_o_prod', 'Paquete', sel('sg_o_prod', SG.d.sg_o_prod || (ps[0] && ps[0].producto) || '', ps.map(function (p) { return [p.producto, p.producto + ' (' + nf(p.gemas) + ' gemas)']; }), { dc: 'sgDate' })) +
    field('sg_o_extra', 'Gemas extra de regalo', inp('sg_o_extra', sgDraft('sg_o_extra', ''), { type: 'number', mode: 'numeric', min: 1, di: 'sgIn' }), 'De 1 hasta las gemas del paquete (100 %).') +
    field('sg_o_desde', 'Desde', inp('sg_o_desde', d0, { type: 'datetime-local', di: 'sgIn' }).replace('class="in"', 'class="in" data-c="sgDate"'), 'Hora de México.') +
    field('sg_o_hasta', 'Hasta', inp('sg_o_hasta', d1, { type: 'datetime-local', di: 'sgIn' }).replace('class="in"', 'class="in" data-c="sgDate"'), 'Hora de México. Máximo 31 días y sin pisar otra oferta del mismo paquete.') + '</div>' +
    '<div class="row mt16">' + sgBtn('sgOfNew', 'ofnew', 'plus', 'Crear oferta', ps.length ? '' : ' disabled') + '</div>';
  return h + '</div></div>';
}
A.sgOfNew = function () {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var ps = r.paquetes || [], pr = SG.d.sg_o_prod || (ps[0] && ps[0].producto), p = ps.filter(function (x) { return x.producto === pr; })[0], errs = {};
  var d0 = fromLocalInput(SG.d.sg_o_desde == null ? toLocalInput(new Date()) : SG.d.sg_o_desde), d1 = fromLocalInput(SG.d.sg_o_hasta == null ? toLocalInput(addMs(3 * 864e5)) : SG.d.sg_o_hasta);
  if (!p) errs.sg_o_prod = 'Elige un paquete.';
  var ex = p ? sgInt(sgDraft('sg_o_extra', ''), 1, p.gemas) : null;
  if (p && ex == null) errs.sg_o_extra = 'Un entero de 1 a ' + nf(p.gemas) + ' (las gemas del paquete).';
  if (!d0) errs.sg_o_desde = 'Elige la fecha y hora de inicio.';
  if (!d1) errs.sg_o_hasta = 'Elige la fecha y hora de fin.';
  if (d0 && d1) {
    var a = new Date(d0).getTime(), b = new Date(d1).getTime();
    if (b <= a) errs.sg_o_hasta = 'El fin tiene que ser después del inicio.';
    else if (b - a > 31 * 864e5) errs.sg_o_hasta = 'Una oferta dura máximo 31 días.';
    else if (b < Date.now()) errs.sg_o_hasta = 'Esa fecha ya pasó.';
    else if ((r.ofertas || []).some(function (o) { return o.producto === pr && new Date(o.desde).getTime() < b && a < new Date(o.hasta).getTime(); })) errs.sg_o_hasta = 'Se pisa con otra oferta de este paquete (míralas arriba).';
  }
  if (!showErrs(errs)) return Promise.resolve();
  return sgDo('oferta', { producto: pr, extra: ex, desde: d0, hasta: d1 }, 'ofnew', '¿Crear esta oferta?',
    'Entre esas fechas, quien compre ' + pr + ' recibirá ' + nf(p.gemas + p.bonus + ex) + ' gemas en vez de ' + nf(p.gemas + p.bonus) + '.',
    [['Paquete', '<span class="mono">' + esc(pr) + '</span>'], ['Extra', '<b>+' + nf(ex) + '</b> gemas (el jugador verá +' + Math.round(100 * (p.bonus + ex) / p.gemas) + ' %)'], ['Desde', esc(fdt(d0))], ['Hasta', esc(fdt(d1))]], 'Oferta creada', { icon: 'clock' })
    .then(function (ok) { if (ok) ['sg_o_extra', 'sg_o_desde', 'sg_o_hasta'].forEach(function (s) { delete SG.d[s]; }); });
};
A.sgOfQuitar = function (el) {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var o = (r.ofertas || []).filter(function (x) { return String(x.id) === el.dataset.id; })[0]; if (!o) return Promise.resolve();
  return sgDo('oferta_quitar', { id: o.id }, 'ofdel', '¿Quitar esta oferta?',
    o.vigente ? 'Está vigente: desde ahora los que compren ya no recibirán el extra.' : 'Se borra de la lista.',
    [['Paquete', '<span class="mono">' + esc(o.producto) + '</span>'], ['Extra', '+' + nf(o.extra)], ['Fechas', esc(fdt(o.desde)) + ' – ' + esc(fdt(o.hasta))]], 'Oferta quitada', { danger: true, ok: 'Sí, quitar', icon: 'trash' });
};

/* ---------- ajustes numéricos y interruptores (config / tienda) ---------- */
function sgCfgForm(list, pre) {
  var grid = '', sw = '';
  list.forEach(function (c) {
    var id = pre + c.clave;
    if (c.lo === 0 && c.hi === 1) {
      sw += '<div class="row nw" style="align-items:flex-start;margin-bottom:12px"><div class="grow"><b>' + esc(c.nota) + '</b><div class="xs mut mono">' + esc(c.clave) + (c.def != null ? ' · de fábrica ' + (c.def ? 'encendido' : 'apagado') : '') + '</div></div>' + tog(id, sgOn(id, c.valor), '', { dc: 'sgTog', on: 'Encendido', off: 'Apagado' }) + '</div>';
    } else {
      grid += field(id, c.nota, inp(id, sgDraft(id, c.valor), { type: 'number', mode: 'numeric', min: c.lo, ph: c.def != null ? 'De fábrica: ' + nf(c.def) : '', di: 'sgIn' }),
        'Entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '. <b>Ahora:</b> ' + nf(c.valor) + (c.def != null ? (c.valor !== c.def ? ' (de fábrica ' + nf(c.def) + ')' : ' (es el de fábrica)') : '') + '.');
    }
  });
  return sw + (grid ? '<div class="grid g2">' + grid + '</div>' : '');
}
function sgCfgCollect(list, pre, errs) {
  var ch = {}, dl = [], val = {};
  list.forEach(function (c) {
    var id = pre + c.clave;
    if (c.lo === 0 && c.hi === 1) {
      var on = sgOn(id, c.valor);
      if (on !== !!c.valor) { ch[c.clave] = on ? 1 : 0; dl.push([c.nota, (c.valor ? 'Encendido' : 'Apagado') + ' → <b>' + (on ? 'Encendido' : 'Apagado') + '</b>']); }
      return;
    }
    var v = sgInt(sgDraft(id, c.valor), c.lo, c.hi);
    if (v == null) { errs[id] = 'Un entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '.'; return; }
    val[c.clave] = v;
    if (v !== c.valor) { ch[c.clave] = v; dl.push([c.nota, nf(c.valor) + ' → <b>' + nf(v) + '</b>']); }
  });
  return { ch: ch, dl: dl, val: val };
}
function sgCfgClean(ch, pre) { Object.keys(ch).forEach(function (k) { delete SG.d[pre + k]; delete SG.on[pre + k]; }); }

/* ---------- pase ---------- */
function sgPase(r) {
  var list = (r.config || []).filter(function (c) { return c.grupo === 'pase'; });
  var h = '<div class="card sec"><div class="ch">' + ic('trophy') + '<h3>Pase de temporada (se compra con gemas)</h3><span class="sub grow">Precio, interruptores y reglas</span></div><div class="cb">';
  h += list.length ? sgCfgForm(list, 'sg_c_') + '<div class="row mt16">' + sgBtn('sgSavePase', 'pase', 'check', 'Guardar ajustes del pase') + '<span class="xs mut">Te enseño «antes → después» antes de guardar.</span></div>' : '<p class="mut">El servidor no devolvió ajustes del pase.</p>';
  return h + '</div></div>' + sgTemporadas(r) + sgNiveles(r);
}
A.sgSavePase = function () {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var list = (r.config || []).filter(function (c) { return c.grupo === 'pase'; }), errs = {}, x = sgCfgCollect(list, 'sg_c_', errs);
  if (x.val.pase_precio != null && x.val.pase_plus_precio != null && x.val.pase_plus_precio < x.val.pase_precio) errs.sg_c_pase_plus_precio = 'Premium + niveles no puede costar menos que el premium (' + nf(x.val.pase_precio) + ').';
  if (!showErrs(errs)) return Promise.resolve();
  if (!x.dl.length) { toast('No hay cambios', 'info'); return Promise.resolve(); }
  var warn = [], pp = x.val.pase_precio;
  if (pp != null) (r.temporadas || []).forEach(function (t) { if (t.total_gemas > 2 * pp) warn.push('La temporada «' + esc(t.id) + '» regala ' + nf(t.total_gemas) + ' gemas en total: con premium a ' + nf(pp) + ' pasa del doble del precio. Tendrás que bajar sus gemas por nivel para volver a guardarlas.'); else if (t.total_gemas > pp) warn.push('La temporada «' + esc(t.id) + '» regala ' + nf(t.total_gemas) + ' gemas y el premium costaría ' + nf(pp) + ': el jugador ganaría gemas de más.'); });
  return sgDo('config', x.ch, 'pase', '¿Cambiar los ajustes del pase?', 'Afecta a todos los jugadores; la app lo ve en unos 30 minutos.', x.dl, 'Pase guardado', { icon: 'trophy', warn: warn }).then(function (ok) { if (ok) sgCfgClean(x.ch, 'sg_c_'); });
};
function sgTemporadas(r) {
  var ts = r.temporadas || [];
  var h = '<div class="card sec"><div class="ch">' + ic('cal') + '<h3>Temporadas del pase</h3><span class="sub grow">' + nf(ts.length) + ' en total</span></div><div class="cb">';
  if (!ts.length) h += '<p class="mut">Todavía no hay temporadas. Crea la primera abajo.</p>';
  else h += '<div class="tw"><table class="tbl"><thead><tr><th>Temporada</th><th>Fechas</th><th class="num">Niveles</th><th class="num">Compradores</th><th class="num">Gemas gastadas</th><th class="num">Gemas devueltas</th><th></th></tr></thead><tbody>' + ts.map(function (t) {
    return '<tr><td><b class="mono">' + esc(t.id) + '</b> ' + (t.activa ? chip('activa', 'ok') : chip('apagada', 'warn')) + '</td><td>' + esc(fdt(t.inicio)) + ' – ' + esc(fdt(t.fin)) + '</td>' +
      '<td class="num">' + nf(t.niveles) + '<div class="xs mut">+' + nf(t.plus_niveles) + ' del plus</div></td><td class="num">' + nf(t.compradores) + '<div class="xs mut">' + nf(t.plus) + ' con plus</div></td><td class="num">' + nf(t.gemas_gastadas) + '</td><td class="num">' + nf(t.gemas_devueltas) + '</td>' +
      '<td class="num"><div class="row" style="justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" data-a="sgTEdit" data-id="' + esc(t.id) + '">' + ic('edit') + 'Editar</button><button class="btn sm ghost" data-a="sgTNiv" data-id="' + esc(t.id) + '">' + ic('star') + 'Gemas por nivel</button></div></td></tr>';
  }).join('') + '</tbody></table></div>';
  var d0 = SG.d.sg_te_ini == null ? toLocalInput(new Date()) : SG.d.sg_te_ini, d1 = SG.d.sg_te_fin == null ? toLocalInput(addMs(60 * 864e5)) : SG.d.sg_te_fin;
  h += '<h4 style="margin:16px 0 8px">Crear o editar una temporada</h4><div class="grid g2">' +
    field('sg_te_id', 'Id de la temporada', inp('sg_te_id', sgDraft('sg_te_id', ''), { ph: 'temporada1', di: 'sgIn', max: 20 }), 'Minúsculas, números y _ (hasta 20). Si ya existe, se edita.') +
    field('sg_te_niv', 'Niveles', inp('sg_te_niv', sgDraft('sg_te_niv', '30'), { type: 'number', mode: 'numeric', min: 2, di: 'sgIn' }), 'De 2 a 100.') +
    field('sg_te_ini', 'Empieza', inp('sg_te_ini', d0, { type: 'datetime-local', di: 'sgIn' }).replace('class="in"', 'class="in" data-c="sgDate"'), 'Hora de México.') +
    field('sg_te_fin', 'Termina', inp('sg_te_fin', d1, { type: 'datetime-local', di: 'sgIn' }).replace('class="in"', 'class="in" data-c="sgDate"'), 'Hora de México. Máximo 120 días.') +
    field('sg_te_plus', 'Niveles extra del plus', inp('sg_te_plus', sgDraft('sg_te_plus', '10'), { type: 'number', mode: 'numeric', min: 0, di: 'sgIn' }), 'Lo que suma «premium + niveles». De 0 a 50.') + '</div>' +
    '<div class="row mt16"><div class="row nw">' + tog('sg_te_act', sgOn('sg_te_act', true), 'Activa', { dc: 'sgTog', on: 'Sí', off: 'No' }) + '</div>' + sgBtn('sgTSave', 'temp', 'check', 'Guardar temporada') + '</div>';
  return h + '</div></div>';
}
A.sgTEdit = function (el) {
  var r = sgRows(), t = r && (r.temporadas || []).filter(function (x) { return x.id === el.dataset.id; })[0]; if (!t) return;
  SG.d.sg_te_id = t.id; SG.d.sg_te_niv = String(t.niveles); SG.d.sg_te_plus = String(t.plus_niveles); SG.d.sg_te_ini = toLocalInput(t.inicio); SG.d.sg_te_fin = toLocalInput(t.fin); SG.on.sg_te_act = !!t.activa;
  paintPage(); var f = $('#f_sg_te_id'); if (f) f.scrollIntoView({ block: 'center', behavior: 'smooth' });
};
A.sgTSave = function () {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var id = String(sgDraft('sg_te_id', '')).trim(), errs = {};
  var ini = fromLocalInput(SG.d.sg_te_ini == null ? toLocalInput(new Date()) : SG.d.sg_te_ini), fin = fromLocalInput(SG.d.sg_te_fin == null ? toLocalInput(addMs(60 * 864e5)) : SG.d.sg_te_fin);
  var niv = sgInt(sgDraft('sg_te_niv', '30'), 2, 100), plus = sgInt(sgDraft('sg_te_plus', '10'), 0, 50), act = sgOn('sg_te_act', true);
  if (!/^[a-z0-9_]{1,20}$/.test(id)) errs.sg_te_id = 'Minúsculas, números y _ (de 1 a 20 caracteres).';
  if (niv == null) errs.sg_te_niv = 'Un entero de 2 a 100.';
  if (plus == null) errs.sg_te_plus = 'Un entero de 0 a 50.';
  if (!ini) errs.sg_te_ini = 'Elige la fecha de inicio.';
  if (!fin) errs.sg_te_fin = 'Elige la fecha de fin.';
  if (ini && fin) { var d = new Date(fin).getTime() - new Date(ini).getTime(); if (d <= 0) errs.sg_te_fin = 'El fin tiene que ser después del inicio.'; else if (d > 120 * 864e5) errs.sg_te_fin = 'Una temporada dura máximo 120 días.'; }
  if (!showErrs(errs)) return Promise.resolve();
  var t = (r.temporadas || []).filter(function (x) { return x.id === id; })[0], warn = [];
  if (t && t.compradores > 0) warn.push('La temporada ya tiene ' + nf(t.compradores) + ' compradores; cambiar fechas o niveles les afecta.');
  if (t && niv < t.niveles && Object.keys(t.gemas || {}).some(function (n) { return Number(n) > niv; })) warn.push('Hay gemas puestas en niveles arriba de ' + nf(niv) + '. Vuelve a guardar sus gemas por nivel.');
  var lines = t ? [['Temporada', '<span class="mono">' + esc(id) + '</span>'], ['Fechas', esc(fdt(t.inicio)) + ' – ' + esc(fdt(t.fin)) + ' → <b>' + esc(fdt(ini)) + ' – ' + esc(fdt(fin)) + '</b>'], ['Niveles', nf(t.niveles) + ' → <b>' + nf(niv) + '</b> (+' + nf(t.plus_niveles) + ' → <b>+' + nf(plus) + '</b> del plus)'], ['Activa', (t.activa ? 'Sí' : 'No') + ' → <b>' + (act ? 'Sí' : 'No') + '</b>']]
    : [['Temporada', '<span class="mono">' + esc(id) + '</span> (nueva)'], ['Fechas', esc(fdt(ini)) + ' – ' + esc(fdt(fin))], ['Niveles', nf(niv) + ' + ' + nf(plus) + ' del plus'], ['Activa', act ? 'Sí' : 'No']];
  return sgDo('temporada', { id: id, inicio: ini, fin: fin, niveles: niv, plus_niveles: plus, activa: act }, 'temp', t ? '¿Cambiar esta temporada?' : '¿Crear esta temporada?',
    act ? 'Mientras esté activa y dentro de fechas, los jugadores podrán comprar su premium con gemas.' : 'Apagada: no se podrá comprar su premium.', lines, 'Temporada guardada', { icon: 'calendar', warn: warn })
    .then(function (ok) { if (ok) { ['sg_te_id', 'sg_te_niv', 'sg_te_plus', 'sg_te_ini', 'sg_te_fin'].forEach(function (s) { delete SG.d[s]; }); delete SG.on.sg_te_act; paintPage(); } });
};

/* gemas por nivel */
function sgSelTemp(r) { var ts = r.temporadas || []; return ts.filter(function (t) { return t.id === SG.tsel; })[0] || ts[0] || null; }
function sgNvVals(t) {
  var out = [];
  for (var n = 1; n <= t.niveles; n++) out.push(sgInt(sgDraft('sg_nv_' + n, (t.gemas || {})[String(n)] || 0), 0, 1000));
  return out;
}
function sgNvTot() {
  var r = sgRows(), t = r && sgSelTemp(r), e = $('#sg_nv_tot'); if (!t || !e) return;
  var c = sgCfg(r, 'pase_precio'), precio = c ? c.valor : 0, vals = sgNvVals(t), bad = vals.some(function (v) { return v == null; });
  var tot = vals.reduce(function (a, v) { return a + (v || 0); }, 0), pct = precio ? Math.round(100 * tot / precio) : 0, tope = 2 * precio, pas = tot > tope;
  e.innerHTML = '<b style="font-size:16px">Total: ' + nf(tot) + ' gemas</b> · el jugador que lo completa recupera <b>' + nf(tot) + ' de ' + nf(precio) + '</b> gemas (<b>' + pct + ' %</b>).' +
    (bad ? '<div style="color:var(--bad);margin-top:4px">Hay casillas vacías o fuera de 0 a 1,000.</div>' : '') +
    (pas ? '<div style="color:var(--bad);margin-top:4px"><b>Bloqueado:</b> pasa del doble del precio (tope ' + nf(tope) + '). Baja ' + nf(tot - tope) + ' gemas.</div>' : tot > precio ? '<div style="color:var(--warn,#B7791F);margin-top:4px"><b>Ojo:</b> pasa del 100 %: quien complete la temporada ganaría ' + nf(tot - precio) + ' gemas de más que lo que pagó.</div>' : '');
  var b = $('#sg_nv_btn'); if (b) b.disabled = !!(pas || bad || SG.saving);
}
function sgNiveles(r) {
  var ts = r.temporadas || [], t = sgSelTemp(r);
  var h = '<div class="card sec"><div class="ch">' + ic('star') + '<h3>Gemas por nivel del carril premium</h3><span class="sub grow">Lo que regala cada nivel</span></div><div class="cb">';
  if (!t) return h + '<p class="mut">Crea una temporada para poner gemas por nivel.</p></div></div>';
  h += '<div class="row" style="flex-wrap:wrap;margin-bottom:12px"><label for="sg_tsel" class="xs mut">Temporada</label>' + sel('sg_tsel', t.id, ts.map(function (x) { return [x.id, x.id + ' (' + nf(x.niveles) + ' niveles)']; }), { dc: 'sgTSel' }) + '</div>' +
    '<p class="xs mut" style="margin:0 0 10px">Pon cuántas gemas regala cada nivel (0 = ninguna). Al guardar se REEMPLAZAN todas las de esta temporada. El tope del servidor es el doble del precio del premium.</p>' +
    '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(86px,1fr));gap:8px">';
  for (var n = 1; n <= t.niveles; n++) {
    var id = 'sg_nv_' + n;
    h += '<div class="f" id="f_' + id + '" style="margin:0"><label for="' + id + '" class="xs">Nivel ' + n + '</label>' + inp(id, sgDraft(id, (t.gemas || {})[String(n)] || 0), { type: 'number', mode: 'numeric', min: 0, di: 'sgIn' }) + '</div>';
  }
  h += '</div><div id="sg_nv_tot" style="margin:14px 0"></div><div class="row"><button class="btn pri" id="sg_nv_btn" data-a="sgNvSave"' + (SG.saving ? ' disabled' : '') + '>' + (SG.saving === 'niv' ? '<span class="spin"></span>' : ic('check')) + 'Guardar gemas por nivel</button><button class="btn sm ghost" data-a="sgNvCero">Poner todo en 0</button></div>';
  setTimeout(sgNvTot, 0);
  return h + '</div></div>';
}
function sgNvClear() { Object.keys(SG.d).forEach(function (k) { if (/^sg_nv_/.test(k)) delete SG.d[k]; }); }
C.sgTSel = function (el) { SG.tsel = el.value; sgNvClear(); paintPage(); };
A.sgTNiv = function (el) { SG.tsel = el.dataset.id; sgNvClear(); paintPage(); var c = $('#sg_tsel'); if (c) c.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
A.sgNvCero = function () { var r = sgRows(), t = r && sgSelTemp(r); if (!t) return; for (var n = 1; n <= t.niveles; n++) SG.d['sg_nv_' + n] = '0'; paintPage(); };
A.sgNvSave = function () {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var t = sgSelTemp(r); if (!t) return Promise.resolve();
  var c = sgCfg(r, 'pase_precio'), precio = c ? c.valor : 0, errs = {}, gem = {}, tot = 0, n;
  for (n = 1; n <= t.niveles; n++) {
    var v = sgInt(sgDraft('sg_nv_' + n, (t.gemas || {})[String(n)] || 0), 0, 1000);
    if (v == null) errs['sg_nv_' + n] = 'Entero de 0 a 1,000.'; else { gem[String(n)] = v; tot += v; }
  }
  if (Object.keys(errs).length) { var first = Object.keys(errs)[0]; showErrs((function () { var o = {}; o[first] = 'Hay casillas vacías o fuera de 0 a 1,000 (nivel ' + first.slice(6) + ' y quizá más).'; return o; })()); return Promise.resolve(); }
  if (tot > 2 * precio) { toast('El total (' + nf(tot) + ') pasa del doble del precio del premium (' + nf(2 * precio) + ')', 'bad'); return Promise.resolve(); }
  var antes = 0; Object.keys(t.gemas || {}).forEach(function (k) { antes += Number(t.gemas[k]) || 0; });
  var warn = tot > precio ? ['El total (' + nf(tot) + ') pasa del precio del premium (' + nf(precio) + '): quien complete la temporada ganaría ' + nf(tot - precio) + ' gemas de más.'] : [];
  var conGemas = Object.keys(gem).filter(function (k) { return gem[k] > 0; }).length;
  return sgDo('niveles', { temporada: t.id, gemas: gem }, 'niv', '¿Cambiar las gemas por nivel?',
    'Se REEMPLAZAN las gemas de la temporada «' + t.id + '». Quien compre el premium las reclamará nivel por nivel (una vez). Lo ya reclamado no se quita.',
    [['Temporada', '<span class="mono">' + esc(t.id) + '</span>'], ['Total de gemas', nf(antes) + ' → <b>' + nf(tot) + '</b>'], ['Niveles con gemas', nf(conGemas) + ' de ' + nf(t.niveles)], ['El jugador recupera', '<b>' + nf(tot) + ' de ' + nf(precio) + '</b> gemas (' + (precio ? Math.round(100 * tot / precio) : 0) + ' %)']], 'Gemas por nivel guardadas', { icon: 'star', warn: warn })
    .then(function (ok) { if (ok) sgNvClear(); });
};

/* ---------- tienda con dos monedas ---------- */
function sgItems(r) {
  var m = {};
  (r.catalogo || []).forEach(function (c) { m[c.id] = { id: c.id, c: c }; });
  (r.articulos || []).forEach(function (a) { (m[a.id] = m[a.id] || { id: a.id }).a = a; });
  return Object.keys(m).sort().map(function (k) {
    var i = m[k], gem = i.a && i.a.activo, blq = i.c && i.c.vendible;
    i.mon = gem ? 'gemas' : blq ? 'bloques' : i.a ? 'gemas' : 'bloques';
    i.est = gem ? 'gemas' : blq ? 'bloques' : '';
    i.precio = i.mon === 'gemas' ? (i.a ? i.a.gemas : 100) : (i.c ? (i.c.efectivo != null ? i.c.efectivo : i.c.precio) : 150);
    return i;
  });
}
function sgItemRow(i) {
  var k = 'sg_i_' + i.id, mon = sgDraft(k + '_m', i.mon), col = mon === 'gemas' ? SG_GEM : SG_BLQ;
  return '<div class="card" style="padding:12px;margin-bottom:8px;border-left:4px solid ' + col + '"><div class="row nw" style="flex-wrap:wrap;gap:10px;align-items:flex-end">' +
    '<div class="grow" style="min-width:180px"><b>' + esc(tiNom(i.id)) + '</b><div class="xs mut mono">' + esc(i.id) + '</div><div style="margin-top:4px">' + sgMoneda(i.est) + (i.a && !i.a.ok ? ' ' + chip('no se puede vender', 'bad') : '') + (i.a && i.a.ventas ? ' <span class="xs mut">' + nf(i.a.ventas) + ' ventas</span>' : '') + '</div></div>' +
    field(k + '_m', 'Moneda', sel(k + '_m', mon, [['bloques', 'Bloques'], ['gemas', 'Gemas']], { dc: 'sgMon' })) +
    field(k + '_p', mon === 'gemas' ? 'Precio en gemas' : 'Precio en Bloques', inp(k + '_p', sgDraft(k + '_p', i.precio), { type: 'number', mode: 'numeric', min: 10, di: 'sgIn' }).replace('class="in"', 'class="in" style="width:110px;border-color:' + col + '"'), mon === 'gemas' ? '10 a 10,000' : '10 a 100,000') +
    (i.c ? '' : field(k + '_r', 'Rareza (si pasa a Bloques)', sel(k + '_r', sgDraft(k + '_r', 'comun'), [['comun', 'Común'], ['raro', 'Raro'], ['epico', 'Épico']], { dc: 'sgDate' }))) +
    (i.a ? '<div class="f">' + tog(k + '_v', sgOn(k + '_v', i.a.activo), 'Activo', { dc: 'sgTog', on: 'Sí', off: 'No' }) + '</div>' + field(k + '_o', 'Orden', inp(k + '_o', sgDraft(k + '_o', i.a.orden), { type: 'number', mode: 'numeric', min: 0, di: 'sgIn' }).replace('class="in"', 'class="in" style="width:80px"')) : '') +
    '<button class="btn sm" data-a="sgItemSave" data-id="' + esc(i.id) + '"' + (SG.saving ? ' disabled' : '') + '>' + ic('check') + 'Guardar</button></div></div>';
}
function sgListaHtml(r) {
  var q = SG.q.trim().toLowerCase(), all = sgItems(r), list = all.filter(function (i) { return !q || i.id.toLowerCase().indexOf(q) >= 0 || tiNom(i.id).toLowerCase().indexOf(q) >= 0; });
  return '<div class="xs mut" style="margin:8px 0">' + nf(list.length) + ' de ' + nf(all.length) + ' artículos · ' + sgMoneda('gemas') + ' ' + nf(all.filter(function (i) { return i.est === 'gemas'; }).length) + ' · ' + sgMoneda('bloques') + ' ' + nf(all.filter(function (i) { return i.est === 'bloques'; }).length) + '</div>' +
    (list.length ? list.slice(0, SG.lim).map(sgItemRow).join('') : '<p class="mut">Ningún artículo coincide.</p>') +
    (list.length > SG.lim ? '<button class="btn sm" data-a="sgMas">Ver más (' + nf(list.length - SG.lim) + ' restantes)</button>' : '');
}
I.sgQ = debounce(function (el) { SG.q = el.value; SG.lim = 40; var r = sgRows(), b = $('#sg_lista'); if (r && b) b.innerHTML = sgListaHtml(r); }, 200);
A.sgMas = function () { SG.lim += 60; paintPage(); };
C.sgMon = function (el) { SG.d[el.id] = el.value; var r = sgRows(), id = el.id.slice(5, -2), i = r && sgItems(r).filter(function (x) { return x.id === id; })[0]; if (i) { if (!(('sg_i_' + id + '_p') in SG.d)) SG.d['sg_i_' + id + '_p'] = String(el.value === i.mon ? i.precio : (el.value === 'gemas' ? (i.a ? i.a.gemas : 100) : (i.c ? i.c.precio : 150))); } paintPage(); };
function sgTienda(r) {
  var h = '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Tienda con dos monedas</h3><span class="sub grow">Cada artículo se vende en Bloques o en gemas</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 10px">' + sgMoneda('bloques') + ' lo normal de la tienda · ' + sgMoneda('gemas') + ' lo exclusivo. Al cambiar la moneda el artículo deja de venderse en la otra. Lo ya comprado se conserva.</p>' +
    searchBox('sg_q', SG.q, 'Buscar artículo por nombre o id…', 'sgQ') + '<div id="sg_lista">' + sgListaHtml(r) + '</div></div></div>';
  h += '<div class="card sec"><div class="ch">' + ic('plus') + '<h3>Agregar un artículo nuevo con gemas</h3><span class="sub grow">Por su id</span></div><div class="cb"><div class="grid g2">' +
    field('sg_n_id', 'Id del artículo', inp('sg_n_id', sgDraft('sg_n_id', ''), { ph: 'frame_dorado', di: 'sgIn', max: 60 }), 'Formato tipo_nombre (por ejemplo frame_dorado). El servidor revisa que se pueda vender.') +
    field('sg_n_gemas', 'Precio en gemas', inp('sg_n_gemas', sgDraft('sg_n_gemas', ''), { type: 'number', mode: 'numeric', min: 10, di: 'sgIn' }), 'De 10 a 10,000.') +
    field('sg_n_orden', 'Orden', inp('sg_n_orden', sgDraft('sg_n_orden', '100'), { type: 'number', mode: 'numeric', min: 0, di: 'sgIn' }), 'Más bajo = sale primero.') + '</div>' +
    '<div class="row mt16">' + sgBtn('sgArtNew', 'artnew', 'plus', 'Agregar artículo') + '</div></div></div>';
  return h;
}
A.sgItemSave = function (el) {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var id = el.dataset.id, i = sgItems(r).filter(function (x) { return x.id === id; })[0]; if (!i) return Promise.resolve();
  var k = 'sg_i_' + id, mon = sgDraft(k + '_m', i.mon), gem = mon === 'gemas', errs = {};
  var pr = sgInt(sgDraft(k + '_p', i.precio), 10, gem ? 10000 : 100000);
  if (pr == null) errs[k + '_p'] = gem ? 'Gemas: un entero de 10 a 10,000.' : 'Bloques: un entero de 10 a 100,000.';
  if (!gem && !/^(theme|style|effect|frame|title)_[A-Za-z0-9_]{1,40}$/.test(id)) errs[k + '_p'] = 'Con Bloques solo se venden temas, piezas, efectos, marcos y títulos.';
  var rar = sgDraft(k + '_r', 'comun'), o = null, act = i.a ? sgOn(k + '_v', i.a.activo) : true;
  if (i.a) { o = sgInt(sgDraft(k + '_o', i.a.orden), 0, 999999); if (o == null) errs[k + '_o'] = 'Un entero de 0 a 999,999.'; }
  if (!showErrs(errs)) return Promise.resolve();
  var nombre = esc(tiNom(id)), mlbl = gem ? 'gemas' : 'Bloques';
  // mismo moneda y es un artículo de gemas: solo precio/activo/orden con 'articulo'
  if (gem && i.a && i.mon === 'gemas' && mon === 'gemas' && i.est === 'gemas') {
    if (pr === i.a.gemas && act === i.a.activo && o === i.a.orden) { toast('No hay cambios', 'info'); return Promise.resolve(); }
    return sgDo('articulo', { id: id, gemas: pr, activo: act, orden: o }, 'item', '¿Cambiar este artículo de gemas?', 'Afecta lo que ven los jugadores en la tienda.',
      [['Artículo', nombre], ['Precio', nf(i.a.gemas) + ' → <b style="color:' + SG_GEM + '">' + nf(pr) + ' gemas</b>'], ['Activo', (i.a.activo ? 'Sí' : 'No') + ' → <b>' + (act ? 'Sí' : 'No') + '</b>'], ['Orden', nf(i.a.orden) + ' → <b>' + nf(o) + '</b>']], 'Artículo guardado', { icon: 'gift' })
      .then(function (ok) { if (ok) ['_m', '_p', '_r', '_v', '_o'].forEach(function (s) { delete SG.d[k + s]; delete SG.on[k + s]; }); });
  }
  if (mon === i.est && pr === i.precio) { toast('No hay cambios', 'info'); return Promise.resolve(); }
  var d = { item: id, moneda: mon, precio: pr }; if (!gem && !i.c) d.rareza = rar;
  var antes = i.est === '' ? 'no se vende' : (i.est === 'gemas' ? nf(i.a.gemas) + ' gemas' : nf(i.precio) + ' Bloques');
  return sgDo('moneda', d, 'item', mon !== i.est ? '¿Pasar este artículo a ' + mlbl + '?' : '¿Cambiar el precio en ' + mlbl + '?',
    gem ? 'Desde ahora «' + tiNom(id) + '» se compra SOLO con gemas y deja de venderse en Bloques. Lo ya comprado se conserva.' : 'Desde ahora «' + tiNom(id) + '» se compra SOLO con Bloques y se apaga su precio en gemas. Lo ya comprado se conserva.',
    [['Artículo', nombre], ['Antes', esc(antes)], ['Después', '<b style="color:' + (gem ? SG_GEM : SG_BLQ) + '">' + nf(pr) + ' ' + mlbl + '</b>']].concat(d.rareza ? [['Rareza', esc(d.rareza)]] : []), 'Moneda guardada', { icon: 'gift' })
    .then(function (ok) { if (ok) ['_m', '_p', '_r', '_v', '_o'].forEach(function (s) { delete SG.d[k + s]; delete SG.on[k + s]; }); });
};
A.sgArtNew = function () {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var id = String(sgDraft('sg_n_id', '')).trim(), g = sgInt(sgDraft('sg_n_gemas', ''), 10, 10000), o = sgInt(sgDraft('sg_n_orden', '100'), 0, 999999), errs = {};
  if (!/^[a-z]+_[A-Za-z0-9_]{1,60}$/.test(id)) errs.sg_n_id = 'Formato tipo_nombre, por ejemplo frame_dorado (minúsculas para el tipo, sin espacios).';
  else if ((r.articulos || []).some(function (a) { return a.id === id; })) errs.sg_n_id = 'Ya existe: edítalo en la lista de arriba.';
  if (g == null) errs.sg_n_gemas = 'Un entero de 10 a 10,000.';
  if (o == null) errs.sg_n_orden = 'Un entero de 0 a 999,999.';
  if (!showErrs(errs)) return Promise.resolve();
  return sgDo('articulo', { id: id, gemas: g, activo: true, orden: o }, 'artnew', '¿Agregar este artículo con gemas?', 'Saldrá en la tienda de gemas ya activo.',
    [['Artículo', '<span class="mono">' + esc(id) + '</span>'], ['Precio', '<b style="color:' + SG_GEM + '">' + nf(g) + ' gemas</b>'], ['Orden', nf(o)]], 'Artículo agregado', { icon: 'gift' })
    .then(function (ok) { if (ok) ['sg_n_id', 'sg_n_gemas', 'sg_n_orden'].forEach(function (s) { delete SG.d[s]; }); });
};

/* ---------- precios generales ---------- */
var SG_GR = [['precios', 'Precios en gemas', 'store', 'Cuántas gemas cuesta cada cosa.'], ['gastos', 'En qué se pueden gastar las gemas', 'power', 'Cada uso se enciende o apaga por separado. Apagar uno no borra nada de nadie.'], ['cambio', 'Cambio de gemas por Bloques', 'refresh', 'Cuántos Bloques da cada gema y cuántas gemas se pueden cambiar de una vez.'], ['topes', 'Límites anti-abuso', 'lock', 'Tope de gastos por jugador y por hora.']];
function sgPrecios(r) {
  var h = '', tl = r.tienda || [];
  h += '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Tienda en Bloques</h3><span class="sub grow">Rareza, descuentos y protector de racha</span></div><div class="cb">' +
    (tl.length ? sgCfgForm(tl.map(function (c) { return { clave: c.clave, valor: c.valor, lo: c.lo, hi: c.hi, nota: c.nota }; }), 'sg_tc_') +
      '<p class="xs mut" style="margin:6px 0 0">Aquí el servidor no guarda un valor de fábrica, solo el rango.</p><div class="row mt16">' + sgBtn('sgSaveTc', 'tc', 'check', 'Guardar precios de la tienda') + '</div>' : '<p class="mut">El servidor no devolvió precios.</p>') + '</div></div>';
  SG_GR.forEach(function (g) {
    var list = (r.config || []).filter(function (c) { return c.grupo === g[0]; });
    if (!list.length) return;
    h += '<div class="card sec"><div class="ch">' + ic(g[2]) + '<h3>' + esc(g[1]) + '</h3><span class="sub grow">' + esc(g[3]) + '</span></div><div class="cb">' + sgCfgForm(list, 'sg_c_') + '</div></div>';
  });
  return h + '<div class="row" style="margin:4px 0 20px">' + sgBtn('sgSaveGem', 'gem', 'check', 'Guardar ajustes de gemas') + '<span class="xs mut">Los cobros ya usan lo nuevo al instante; la app lo ve en unos 30 minutos. El interruptor general de las gemas está en la sección «Gemas».</span></div>';
}
A.sgSaveTc = function () {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var errs = {}, x = sgCfgCollect((r.tienda || []).map(function (c) { return { clave: c.clave, valor: c.valor, lo: c.lo, hi: c.hi, nota: c.nota }; }), 'sg_tc_', errs);
  if (!showErrs(errs)) return Promise.resolve();
  if (!x.dl.length) { toast('No hay cambios', 'info'); return Promise.resolve(); }
  return sgDo('tienda_config', x.ch, 'tc', '¿Cambiar los precios de la tienda en Bloques?', 'Afecta a todos los jugadores en la tienda de Bloques.', x.dl, 'Precios guardados', { icon: 'store' }).then(function (ok) { if (ok) sgCfgClean(x.ch, 'sg_tc_'); });
};
A.sgSaveGem = function () {
  var r = sgRows(); if (!r || SG.saving) return Promise.resolve();
  var gs = SG_GR.map(function (g) { return g[0]; }), list = (r.config || []).filter(function (c) { return gs.indexOf(c.grupo) >= 0; }), errs = {}, x = sgCfgCollect(list, 'sg_c_', errs);
  if (x.val.bloques_min != null && x.val.bloques_max != null && x.val.bloques_min > x.val.bloques_max) errs.sg_c_bloques_min = 'El mínimo no puede pasar del máximo (' + nf(x.val.bloques_max) + ').';
  if (!showErrs(errs)) return Promise.resolve();
  if (!x.dl.length) { toast('No hay cambios', 'info'); return Promise.resolve(); }
  return sgDo('config', x.ch, 'gem', '¿Guardar estos ajustes de gemas?', 'Afecta a todos los jugadores.', x.dl, 'Guardado', { icon: 'power' }).then(function (ok) { if (ok) sgCfgClean(x.ch, 'sg_c_'); });
};

/* ---------- historial ---------- */
function sgVal(k, v, r) {
  if (v == null) return '—';
  if (typeof v === 'boolean') return v ? 'Sí' : 'No';
  if (typeof v === 'number') return nf(v);
  if (typeof v === 'string') return /^\d{4}-\d{2}-\d{2}T/.test(v) ? esc(fdt(v)) : esc(v);
  if (typeof v === 'object') return sgObj(v, r, k);
  return esc(String(v));
}
function sgObj(o, r, ctx) {
  if (o == null) return '—';
  if (ctx === 'gemas' && !Array.isArray(o) && Object.keys(o).length && Object.keys(o).every(function (x) { return /^\d+$/.test(x); })) {
    var t = 0, n = 0; Object.keys(o).forEach(function (x) { t += Number(o[x]) || 0; if (Number(o[x])) n++; });
    return nf(n) + (n === 1 ? ' nivel' : ' niveles') + ' con gemas, total ' + nf(t);
  }
  var ks = Object.keys(o);
  if (!ks.length) return '—';
  var etq = {}; ((r && r.config) || []).concat((r && r.tienda) || []).forEach(function (c) { etq[c.clave] = c.nota; });
  return ks.map(function (k) {
    var lbl = SG_KEY[k] || etq[k] || k;
    return '<span class="xs"><span class="mut">' + esc(lbl) + ':</span> <b>' + sgVal(k, o[k], r) + '</b></span>';
  }).join('<br>');
}
function sgHistorial(r) {
  var cs = r.cambios || [];
  var h = '<div class="card sec"><div class="ch">' + ic('history') + '<h3>Historial de cambios</h3><span class="sub grow">Últimos ' + nf(cs.length) + ' · hora de México</span></div>';
  if (!cs.length) return h + '<div class="cb"><p class="mut">Todavía no se ha cambiado nada desde este panel.</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Cuándo</th><th>Qué se hizo</th><th>Qué se pidió</th><th>Cómo estaba antes</th></tr></thead><tbody>' + cs.slice(0, SG.hn).map(function (c) {
    var d = c.datos || {}, quien = d.producto || d.item || d.id || d.temporada || '';
    return '<tr><td style="white-space:nowrap">' + esc(fdt(c.creado)) + '</td><td><b>' + esc(SG_ACC[c.accion] || c.accion) + '</b>' + (quien && typeof quien !== 'object' ? '<div class="xs mut mono">' + esc(quien) + '</div>' : '') + '</td><td>' + sgObj(d, r) + '</td><td>' + (c.antes == null ? '<span class="mut">no existía</span>' : sgAntes(c, r)) + '</td></tr>';
  }).join('') + '</tbody></table></div>' + (cs.length > SG.hn ? '<div class="cb"><button class="btn sm" data-a="sgHMas">Ver todos (' + nf(cs.length) + ')</button></div>' : '') + '</div>';
}
function sgAntes(c, r) {
  var a = c.antes;
  if (c.accion === 'moneda' && a && typeof a === 'object') {
    var p = [];
    if (a.gemas) p.push('<span class="xs"><span style="color:' + SG_GEM + '"><b>Gemas:</b></span> ' + nf(a.gemas.gemas) + (a.gemas.activo ? '' : ' (apagado)') + '</span>');
    if (a.bloques) p.push('<span class="xs"><span style="color:' + SG_BLQ + '"><b>Bloques:</b></span> ' + nf(a.bloques.precio) + (a.bloques.vendible ? '' : ' (no se vendía)') + '</span>');
    return p.length ? p.join('<br>') : '<span class="mut">no estaba en la tienda</span>';
  }
  return sgObj(a, r, c.accion === 'niveles' ? 'gemas' : '');
}
A.sgHMas = function () { SG.hn = 1000; paintPage(); };

/* ---------- vista ---------- */
function vSoloGemas() {
  var o = rm('solo_gemas');
  var h = pageHead('Solo gemas', 'Con dinero real solo se compran <b>paquetes de gemas</b> y «Sin anuncios». El pase y lo exclusivo cuestan <b>gemas</b>; lo normal sigue en <b>Bloques</b>. Aquí ajustas todo sin sacar versión.', '<button class="btn" data-a="sgReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.solo_gemas, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 34-gemas.sql.') + '</div>' : rerr(o, 'Solo gemas'));
  var r = sgRows();
  if (!r) return h + skel(4);
  var ban = r.activa ? '' : '<div class="ban">' + ic('warn') + '<div class="tx"><b>Las gemas están apagadas</b>La app no enseña nada de gemas hasta que las enciendas en la sección «Gemas». Puedes preparar todo aquí mientras tanto.<div class="acts"><button class="btn sm" data-a="go" data-r="juego/gemas">Ir a Gemas</button></div></div></div>';
  var body = SG.tab === 'pase' ? sgPase(r) : SG.tab === 'tienda' ? sgTienda(r) : SG.tab === 'precios' ? sgPrecios(r) : SG.tab === 'hist' ? sgHistorial(r) : sgPaquetes(r) + sgOfertas(r);
  return h + ban + '<div class="row sec mb12">' + seg('sgTab', SG.tab, SG_TABS.map(function (t) { return [t[0], t[1], t[2]]; })) + '</div>' + body;
}
VIEWS['juego/solo-gemas'] = vSoloGemas;
