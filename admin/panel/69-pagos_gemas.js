/* ================= GEMAS (34-gemas.sql, app 2.0) ================= */
// Moneda premium que se compra con dinero real. Todo por admin_gemas(p_clave, p_accion, p_datos): sin acción solo lee
// {hoy, pagos_activa, config[{clave,valor,def,lo,hi,grupo,nota}], paquetes, miticos, eventos, gastos, totales, jugador?}.
//   'config'   {clave: número, …}
//   'paquete'  {producto, gemas?, bonus?, a_la_venta?, orden?}
//   'mitico'   {id, gemas: n|null, oculto?}
//   'jugador'  {id}   'ajustar' {id, antes, nuevo, nota}   'entregar' {jugador, gemas, nota}
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.gemas = '34-gemas.sql';
FNF.admin_gemas = 'gemas';
RFN.gemas = 'admin_gemas';
N20['juego/gemas'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/gemas'; })) {
    var at = -1; g.items.forEach(function (i, n) { if (i[0] === 'juego/pagos') at = n; });
    g.items.splice(at >= 0 ? at + 1 : g.items.length, 0, ['juego/gemas', 'Gemas', 'star']);
  }
  ROUTES['juego/gemas'] = { t: 'Gemas', ic: 'star', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/gemas'] = {
  que: 'Las GEMAS son la moneda premium de Blokku: se compran con dinero real (Google Play y App Store, cobrado por RevenueCat) y NO se ganan jugando. Aquí enciendes o apagas las gemas, decides cuánto cuesta cada cosa, qué paquetes de gemas se venden, qué paquetes míticos se pueden comprar con gemas, ves las ventas y el historial, y arreglas la cartera de un jugador si algo salió mal.',
  ve: 'En la app, con las gemas encendidas: el saldo de gemas, la compra de paquetes de gemas, y la opción de pagar con gemas los paquetes míticos, el cambio por Bloques y los protectores de racha (el pase y lo exclusivo se manejan en «Solo gemas»). Nada de esto da ventaja en la partida. Con el interruptor general apagado la app no enseña nada de gemas.',
  cuando: 'Enciéndelas hasta que los productos blokku_gemas_… existan en Play Console, App Store Connect y RevenueCat (como CONSUMIBLES) y el webhook responda. Después revisa el historial de vez en cuando: si alguien dice que pagó y no le llegaron, mira aquí si el aviso quedó como «Sin jugador» y regálale las gemas.',
  como: [
    '<b>Quién entrega:</b> SOLO el servidor. RevenueCat verifica el pago con la tienda y avisa al servidor; el teléfono nunca puede decir «ya pagué». Cada aviso y cada transacción se acreditan una sola vez. Con el interruptor general apagado, las compras que lleguen se acreditan igual (ya se pagaron); lo que se apaga es enseñar y gastar.',
    '<b>Paquetes de gemas:</b> cada uno es un producto CONSUMIBLE con id <span class="mono">blokku_gemas_N</span>. El producto tiene que existir con el MISMO id en Play Console, App Store Connect y RevenueCat; el precio en dinero se pone ahí, no aquí. Aquí decides cuántas gemas y cuánto bonus da cada uno.',
    '<b>Precios en gemas:</b> son enteros dentro de un rango. El «≈ $ MXN» es solo una guía con 4.5 gemas por peso: no es un precio real y no se cobra en pesos.',
    '<b>Paquetes míticos con gemas:</b> salen de los que ya tienes «A la venta» en Ventas con dinero. Aquí puedes ponerles un precio propio en gemas (vacío = el general) o retirarlos de las gemas sin quitarlos de la venta con dinero.',
    '<b>Reembolsos:</b> con «Quitar gemas al reembolsar» encendido se quitan las gemas de la compra reembolsada. Si el jugador ya las gastó, lo que falta queda como DEUDA y se cobra de su siguiente compra de gemas (el saldo nunca es negativo).',
    '<b>Ajustar y regalar:</b> «Ajustar saldo» fija el saldo exacto (solo si no cambió mientras lo editabas); «Regalar gemas» suma gemas y cuenta como entrega del panel. Las dos quedan anotadas con tu nota.',
    H_HORA
  ]
};

var GM = { saving: '', d: {}, on: {}, q: '', qr: null, seq: 0, who: null, jug: null, nuevo: '', nota: '', reg: '', rnota: '', ev: 25, gs: 25 };
var GM_PESO = 4.5;
var GM_OLD = /^(casillas_activo|casilla_[a-z_]+|pase_nivel)$/;
function gmViejo(old, grid) {
  if (!old) return '';
  return '<details class="help" style="margin:0 0 14px"><summary>' + ic('chr', 'chev') + 'Avanzado: ofertas premium del día y niveles del pase (modelo viejo)</summary><div class="hbody"><p class="xs mut" style="margin:0 0 10px">Con el modelo «solo gemas» la app 2.0 ya no usa estas opciones. Se dejan aquí por si algún día vuelven; cambiarlas no se nota en la app.</p>' + (grid ? '<div class="grid g2">' + old + '</div>' : old) + '</div></details>';
}
var GM_CAS = { chica: 'Chica', mediana: 'Mediana', grande: 'Grande' };
var GM_SW = [['general', 'General', 'power', 'Lo básico: encender las gemas y qué hacer con las compras de prueba y los reembolsos.'], ['gastos', 'En qué se pueden gastar', 'gift', 'Cada uso se enciende o apaga por separado. Apagar uno no borra nada de nadie.']];
var GM_PR = [['precios', 'Precios en gemas', 'store', 'Cuántas gemas cuesta cada cosa.'], ['cambio', 'Cambio de gemas por Bloques', 'refresh', 'Cuántos Bloques da cada gema y cuántas gemas se pueden cambiar de una vez.'], ['topes', 'Límite anti-abuso', 'lock', 'Tope de gastos por jugador y por hora.']];
var GM_PRECIO = { paquete_mitico: 1, casilla_chica: 1, casilla_mediana: 1, casilla_grande: 1, protector: 1, pase_nivel: 1 };
var GM_GASTO = { paquete: 'Paquetes míticos', casilla: 'Ofertas premium del día', bloques: 'Cambio por Bloques', protector: 'Protectores de racha', pase_nivel: 'Niveles del pase', articulo: 'Artículos de la tienda', pase: 'Pase de temporada' };
var GM_TIPO = { gasto: ['Gasto', ''], ajuste: ['Ajuste del panel', 'warn'], panel: ['Regalo del panel', 'ok'], reembolso: ['Reembolso', 'warn'], compra: ['Compra', 'ok'], reembolso_revertido: ['Reembolso revertido', 'ok'], pase: ['Pase de temporada', 'ok'] };
var GM_RES = { acreditado: ['Acreditado', 'ok'], ya_acreditado: ['Ya estaba', 'ok'], sin_jugador: ['Sin jugador', 'bad'], sin_contenido: ['Producto desconocido', 'bad'], sin_transaccion: ['Sin transacción', 'bad'], sandbox_ignorado: ['Prueba (no acreditada)', 'warn'], otro_producto: ['Otro producto', ''], reembolso: ['Reembolso anotado', 'warn'], reembolso_quitado: ['Reembolso: gemas quitadas', 'warn'], reembolso_deuda: ['Reembolso con deuda', 'warn'], reembolso_repetido: ['Reembolso repetido', ''], reembolso_sin_entrega: ['Reembolso sin compra', 'warn'], reembolso_revertido: ['Reembolso revertido', 'ok'], prueba: ['Prueba de RevenueCat', ''], ignorado: ['Ignorado', ''] };

function gmRows() { var o = rm('gemas'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function gmCfg(r, k) { return (r.config || []).filter(function (c) { return c.clave === k; })[0]; }
function gmDraft(id, srv) { return id in GM.d ? GM.d[id] : (srv == null ? '' : String(srv)); }
function gmInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function gmOn(id, srv) { return id in GM.on ? GM.on[id] : !!srv; }
function gmUsd(n) { return '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD'; }
function gmMxn(g) { var n = Number(g); return isFinite(n) && n > 0 ? '≈ $' + nf(Math.round(n / GM_PESO)) + ' MXN' : ''; }
function gmGem(n) { return nf(n) + ' gema' + (Number(n) === 1 ? '' : 's'); }
I.gmIn = function (el) {
  GM.d[el.id] = el.value;
  var s = $('#' + el.id + '_mx'); if (s) s.textContent = gmMxn(el.value.trim());
};
C.gmTog = function (el) { GM.on[el.id] = el.checked; };

function gmKpis(t) {
  var pp = t.por_producto || {}, pg = t.por_gasto || {};
  return '<div class="kpis">' +
    kpi('trend', 'Ventas', nf(t.ventas), nf(t.ventas_7d) + ' en 7 días · ' + nf(t.ventas_30d) + ' en 30 días') +
    kpi('store', 'Ingreso bruto', gmUsd(t.usd), gmUsd(t.usd_30d) + ' en 30 días (antes de la comisión de la tienda)') +
    kpi('user', 'Compradores', nf(t.compradores), 'Jugadores con al menos una compra') +
    kpi('star', 'Gemas vendidas', nf(t.gemas_vendidas), 'Con bonus incluido · ' + nf(t.gemas_regaladas) + ' regaladas desde el panel') +
    kpi('gift', 'Gemas gastadas (7 días)', nf(t.gemas_gastadas_7d), nf(t.gemas_gastadas) + ' gastadas desde el inicio') +
    kpi('db', 'Saldo en carteras', nf(t.saldo_total), 'Gemas sin gastar de ' + nf(t.carteras) + ' jugadores') +
    kpi('warn', 'Deuda total', nf(t.deuda_total), 'Reembolsos de gemas que ya se habían gastado: se cobra de su siguiente compra') +
    kpi('refresh', 'Reembolsos', nf(t.reembolsos), 'Compras devueltas por la tienda') +
    kpi('warn', 'Sin entregar', nf(t.sin_entregar), 'Avisos que no se pudieron acreditar: revisa el historial') +
    kpi('play', 'Compras de prueba', nf(t.pruebas), 'Sandbox: no cuentan en los totales') + '</div>' +
    '<div class="grid g2"><div class="card sec"><div class="ch">' + ic('chart') + '<h3>Ventas por producto</h3><span class="sub grow">Solo compras reales</span></div><div class="cb">' +
    (Object.keys(pp).length ? hbars(Object.keys(pp).sort(function (a, b) { return pp[b] - pp[a]; }).map(function (k) { return { l: '<span class="mono">' + esc(k) + '</span>', v: pp[k] }; })) : '<p class="mut">Todavía no hay ventas.</p>') +
    '</div></div><div class="card sec"><div class="ch">' + ic('chart') + '<h3>En qué se gastan</h3><span class="sub grow">Gemas gastadas</span></div><div class="cb">' +
    (Object.keys(pg).length ? hbars(Object.keys(pg).sort(function (a, b) { return pg[b] - pg[a]; }).map(function (k) { return { l: esc(GM_GASTO[k] || k), v: pg[k] }; })) : '<p class="mut">Todavía no se ha gastado nada.</p>') +
    '</div></div></div>';
}

function gmBanner(r) {
  if (r.pagos_activa) return '';
  return '<div class="ban">' + ic('warn') + '<div class="tx"><b>Ventas con dinero está apagada</b>Las gemas se pueden encender igual, pero los paquetes míticos que se pagan con gemas salen de la sección «Ventas con dinero»: mientras esa venta siga apagada, no habrá qué ofrecer. Cambiar bloques por gemas y los protectores no dependen de ella.<div class="acts"><button class="btn sm" data-a="go" data-r="juego/pagos">Ir a Ventas con dinero</button></div></div></div>';
}

function gmSwitches(r) {
  var h = '', old = '';
  GM_SW.forEach(function (g) {
    var list = (r.config || []).filter(function (c) { return c.grupo === g[0]; });
    if (!list.length) return;
    var act = gmCfg(r, 'gemas_activo');
    h += '<div class="card sec"><div class="ch">' + ic(g[2]) + '<h3>' + esc(g[1]) + '</h3><span class="sub grow">' + (g[0] === 'general' ? (act && act.valor ? 'Gemas ENCENDIDAS' : 'Gemas apagadas: la app no enseña nada') : esc(g[3])) + '</span></div><div class="cb">';
    list.forEach(function (c) {
      var row = '<div class="row nw" style="align-items:flex-start;margin-bottom:12px"><div class="grow"><b>' + esc(c.nota) + '</b><div class="xs mut mono">' + esc(c.clave) + ' · de fábrica ' + (c.def ? 'encendido' : 'apagado') + '</div></div>' + tog('gm_' + c.clave, gmOn('gm_' + c.clave, c.valor), '', { dc: 'gmTog', on: 'Encendido', off: 'Apagado' }) + '</div>';
      if (GM_OLD.test(c.clave)) old += row; else h += row;
    });
    h += '</div></div>';
  });
  return h + gmViejo(old) + '<div class="row" style="margin:4px 0 20px"><button class="btn pri" data-a="gmSaveSw"' + (GM.saving ? ' disabled' : '') + '>' + (GM.saving === 'sw' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptores</button><span class="xs mut">Te enseño «antes → después» antes de guardar. La app lo ve en unos 30 minutos.</span></div>';
}
async function gmSaveKeys(r, ch, dl, tipo, ttl, txt) {
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  if (!await confirmDlg({ title: ttl, text: txt, html: cbox(dl), ok: 'Sí, guardar', icon: 'power' })) return;
  GM.saving = tipo; paintPage();
  try { await rpc('admin_gemas', { p_accion: 'config', p_datos: ch }); Object.keys(ch).forEach(function (k) { delete GM.d['gm_' + k]; delete GM.on['gm_' + k]; }); toast('Guardado'); await rload('gemas', true); if (RM.solo_gemas) rload('solo_gemas', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  GM.saving = ''; paintPage();
}
A.gmSaveSw = function () {
  var r = gmRows(); if (!r || GM.saving) return Promise.resolve();
  var ch = {}, dl = [];
  (r.config || []).forEach(function (c) {
    if (c.grupo !== 'general' && c.grupo !== 'gastos') return;
    var v = gmOn('gm_' + c.clave, c.valor);
    if (v !== !!c.valor) { ch[c.clave] = v ? 1 : 0; dl.push([c.nota, (c.valor ? 'Encendido' : 'Apagado') + ' → <b>' + (v ? 'Encendido' : 'Apagado') + '</b>']); }
  });
  var act = ch.gemas_activo === 1;
  return gmSaveKeys(r, ch, dl, 'sw', act ? '¿Encender las gemas?' : ch.gemas_activo === 0 ? '¿Apagar las gemas?' : '¿Guardar los interruptores?',
    act ? 'La app enseñará el saldo y las compras de gemas. Revisa antes que los productos blokku_gemas_… existan en las tiendas y en RevenueCat.' : 'Afecta a todos los jugadores.');
};

function gmValores(r) {
  var h = '', old = '';
  GM_PR.forEach(function (g) {
    var list = (r.config || []).filter(function (c) { return c.grupo === g[0]; });
    if (!list.length) return;
    h += '<div class="card sec"><div class="ch">' + ic(g[2]) + '<h3>' + esc(g[1]) + '</h3><span class="sub grow">' + esc(g[3]) + '</span></div><div class="cb"><div class="grid g2">';
    list.forEach(function (c) {
      var id = 'gm_' + c.clave, cur = gmDraft(id, c.valor);
      var row = field(id, c.nota, inp(id, cur, { type: 'number', mode: 'numeric', min: c.lo, ph: 'De fábrica: ' + nf(c.def), di: 'gmIn' }),
        'Entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '. <b>Ahora:</b> ' + nf(c.valor) + (c.valor !== c.def ? ' (de fábrica ' + nf(c.def) + ')' : '') + '.' +
        (GM_PRECIO[c.clave] ? ' <b id="' + id + '_mx" class="mono">' + gmMxn(cur) + '</b>' : ''));
      if (GM_OLD.test(c.clave)) old += row; else h += row;
    });
    h += '</div>' + (g[0] === 'precios' ? '<p class="xs mut" style="margin:6px 0 0">El «≈ $ MXN» es solo una guía con ' + GM_PESO + ' gemas por peso (aproximado, no es un precio real).</p>' : '') + '</div></div>';
  });
  return h + gmViejo(old, true) + '<div class="row" style="margin:4px 0 20px"><button class="btn pri" data-a="gmSaveVal"' + (GM.saving ? ' disabled' : '') + '>' + (GM.saving === 'val' ? '<span class="spin"></span>' : ic('check')) + 'Guardar precios y valores</button><span class="xs mut">Los cobros ya usan lo nuevo al instante; la app enseña los precios unos 30 minutos después.</span></div>';
}
A.gmSaveVal = function () {
  var r = gmRows(); if (!r || GM.saving) return Promise.resolve();
  var ch = {}, dl = [], errs = {}, val = {};
  (r.config || []).forEach(function (c) {
    if (c.grupo === 'general' || c.grupo === 'gastos') return;
    var id = 'gm_' + c.clave, lo = c.clave === 'paquete_mitico' ? Math.max(c.lo, 50) : c.lo, v = gmInt(gmDraft(id, c.valor), lo, c.hi);
    if (v == null) { errs[id] = 'Un entero de ' + nf(lo) + ' a ' + nf(c.hi) + '.'; return; }
    val[c.clave] = v;
    if (v !== c.valor) { ch[c.clave] = v; dl.push([c.nota, nf(c.valor) + ' → <b>' + nf(v) + '</b>' + (GM_PRECIO[c.clave] ? ' <span class="mut">' + gmMxn(v) + '</span>' : '')]); }
  });
  if (val.bloques_min != null && val.bloques_max != null && val.bloques_min > val.bloques_max) errs.gm_bloques_min = 'El mínimo no puede pasar del máximo (' + nf(val.bloques_max) + ').';
  if (!showErrs(errs)) return Promise.resolve();
  return gmSaveKeys(r, ch, dl, 'val', '¿Guardar precios y valores?', 'Esto afecta a todos los jugadores.');
};

/* ---- paquetes de gemas ---- */
function gmPaquetes(r) {
  var ps = r.paquetes || [];
  var h = '<div class="card sec"><div class="ch">' + ic('store') + '<h3>Paquetes de gemas a la venta</h3><span class="sub grow">' + nf(ps.filter(function (p) { return p.a_la_venta; }).length) + ' a la venta de ' + nf(ps.length) + '</span></div><div class="cb">' +
    '<div class="ban info" style="margin:0 0 12px">' + ic('info') + '<div class="tx"><b>Acuérdate</b>Cada producto tiene que existir con el MISMO id en Play Console, App Store Connect y RevenueCat, como CONSUMIBLE. Si falta en alguno, el jugador no puede comprarlo o no le llega. El precio en dinero se pone en las tiendas, no aquí.</div></div>';
  if (ps.length) {
    h += '<div class="tw"><table class="tbl"><thead><tr><th>Producto</th><th class="num">Gemas</th><th class="num">Bonus</th><th class="num">Total</th><th>A la venta</th><th class="num">Orden</th><th class="num">Ventas</th><th></th></tr></thead><tbody>' + ps.map(function (p) {
      var k = 'gm_p_' + p.producto, g = gmDraft(k + '_g', p.gemas), b = gmDraft(k + '_b', p.bonus), o = gmDraft(k + '_o', p.orden);
      return '<tr><td class="mono xs">' + esc(p.producto) + '</td>' +
        '<td class="num"><label class="sr" for="' + k + '_g">Gemas de ' + esc(p.producto) + '</label>' + inp(k + '_g', g, { type: 'number', mode: 'numeric', min: 1, di: 'gmIn' }).replace('class="in"', 'class="in" style="width:92px"') + '</td>' +
        '<td class="num"><label class="sr" for="' + k + '_b">Bonus de ' + esc(p.producto) + '</label>' + inp(k + '_b', b, { type: 'number', mode: 'numeric', min: 0, di: 'gmIn' }).replace('class="in"', 'class="in" style="width:92px"') + '</td>' +
        '<td class="num"><b>' + nf((Number(g) || 0) + (Number(b) || 0)) + '</b></td>' +
        '<td>' + tog(k + '_v', gmOn(k + '_v', p.a_la_venta), '', { dc: 'gmTog', on: 'Sí', off: 'No' }) + '</td>' +
        '<td class="num"><label class="sr" for="' + k + '_o">Orden de ' + esc(p.producto) + '</label>' + inp(k + '_o', o, { type: 'number', mode: 'numeric', min: 0, di: 'gmIn' }).replace('class="in"', 'class="in" style="width:72px"') + '</td>' +
        '<td class="num">' + nf(p.ventas) + '</td>' +
        '<td class="num"><button class="btn sm" data-a="gmPackSave" data-p="' + esc(p.producto) + '"' + (GM.saving ? ' disabled' : '') + '>' + ic('check') + 'Guardar</button></td></tr>';
    }).join('') + '</tbody></table></div>';
  } else h += '<p class="mut">No hay paquetes de gemas.</p>';
  h += '<h4 style="margin:16px 0 8px">Crear un paquete nuevo</h4><div class="grid g2">' +
    field('gm_n_prod', 'Producto (id exacto de las tiendas)', inp('gm_n_prod', gmDraft('gm_n_prod', ''), { ph: 'blokku_gemas_3000', di: 'gmIn', max: 24 }), 'Solo <span class="mono">blokku_gemas_</span> y un número (hasta 6 cifras). Máximo 20 paquetes.') +
    field('gm_n_gemas', 'Gemas', inp('gm_n_gemas', gmDraft('gm_n_gemas', ''), { type: 'number', mode: 'numeric', min: 1, di: 'gmIn' }), 'De 1 a 100,000.') +
    field('gm_n_bonus', 'Bonus', inp('gm_n_bonus', gmDraft('gm_n_bonus', '0'), { type: 'number', mode: 'numeric', min: 0, di: 'gmIn' }), 'Gemas extra de regalo (0 si no hay).') +
    field('gm_n_orden', 'Orden', inp('gm_n_orden', gmDraft('gm_n_orden', '100'), { type: 'number', mode: 'numeric', min: 0, di: 'gmIn' }), 'Más bajo = sale primero.') + '</div>' +
    '<div class="row mt16"><div class="row nw">' + tog('gm_n_venta', gmOn('gm_n_venta', false), 'A la venta al crearlo', { dc: 'gmTog', on: 'Sí', off: 'No' }) + '</div><button class="btn pri" data-a="gmPackNew"' + (GM.saving ? ' disabled' : '') + '>' + (GM.saving === 'pnew' ? '<span class="spin"></span>' : ic('plus')) + 'Crear paquete</button></div>';
  return h + '</div></div>';
}
async function gmPackDo(datos, tipo, ttl, lines, okMsg) {
  if (!await confirmDlg({ title: ttl, text: 'Afecta a lo que ven los jugadores en la tienda de gemas.', html: cbox(lines), ok: 'Sí, guardar', icon: 'store' })) return false;
  GM.saving = tipo; paintPage();
  var ok = false;
  try { await rpc('admin_gemas', { p_accion: 'paquete', p_datos: datos }); toast(okMsg); await rload('gemas', true); if (RM.solo_gemas) rload('solo_gemas', true); ok = true; }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
  GM.saving = ''; paintPage(); return ok;
}
A.gmPackSave = function (el) {
  var r = gmRows(); if (!r || GM.saving) return Promise.resolve();
  var pr = el.dataset.p, p = (r.paquetes || []).filter(function (x) { return x.producto === pr; })[0]; if (!p) return Promise.resolve();
  var k = 'gm_p_' + pr, g = gmInt(gmDraft(k + '_g', p.gemas), 1, 100000), b = gmInt(gmDraft(k + '_b', p.bonus), 0, 100000), o = gmInt(gmDraft(k + '_o', p.orden), 0, 999999), errs = {};
  if (g == null) errs[k + '_g'] = 'De 1 a 100,000.';
  if (b == null) errs[k + '_b'] = 'De 0 a 100,000.';
  if (o == null) errs[k + '_o'] = 'Un entero de 0 a 999,999.';
  if (g != null && b != null && b > g) errs[k + '_b'] = 'El bonus no puede pasar de las gemas (' + nf(g) + ').';
  if (!showErrs(errs)) return Promise.resolve();
  var v = gmOn(k + '_v', p.a_la_venta);
  if (g === p.gemas && b === p.bonus && o === p.orden && v === !!p.a_la_venta) { toast('No hay cambios', 'info'); return Promise.resolve(); }
  return gmPackDo({ producto: pr, gemas: g, bonus: b, a_la_venta: v, orden: o }, 'pack', '¿Guardar este paquete?',
    [['Producto', '<span class="mono">' + esc(pr) + '</span>'], ['Gemas', nf(p.gemas) + ' → <b>' + nf(g) + '</b>'], ['Bonus', nf(p.bonus) + ' → <b>' + nf(b) + '</b>'], ['A la venta', (p.a_la_venta ? 'Sí' : 'No') + ' → <b>' + (v ? 'Sí' : 'No') + '</b>'], ['Orden', nf(p.orden) + ' → <b>' + nf(o) + '</b>']], 'Paquete guardado')
    .then(function (ok) { if (ok) ['_g', '_b', '_o', '_v'].forEach(function (s) { delete GM.d[k + s]; delete GM.on[k + s]; }); });
};
A.gmPackNew = function () {
  var r = gmRows(); if (!r || GM.saving) return Promise.resolve();
  var pr = String(gmDraft('gm_n_prod', '')).trim(), g = gmInt(gmDraft('gm_n_gemas', ''), 1, 100000), b = gmInt(gmDraft('gm_n_bonus', '0'), 0, 100000), o = gmInt(gmDraft('gm_n_orden', '100'), 0, 999999), errs = {};
  if (!/^blokku_gemas_[0-9]{1,6}$/.test(pr)) errs.gm_n_prod = 'Tiene que ser blokku_gemas_ y un número (por ejemplo blokku_gemas_3000).';
  else if ((r.paquetes || []).some(function (p) { return p.producto === pr; })) errs.gm_n_prod = 'Ese producto ya existe: edítalo en la tabla de arriba.';
  if (g == null) errs.gm_n_gemas = 'De 1 a 100,000.';
  if (b == null) errs.gm_n_bonus = 'De 0 a 100,000.';
  if (o == null) errs.gm_n_orden = 'Un entero de 0 a 999,999.';
  if (g != null && b != null && b > g) errs.gm_n_bonus = 'El bonus no puede pasar de las gemas (' + nf(g) + ').';
  if (!showErrs(errs)) return Promise.resolve();
  var v = gmOn('gm_n_venta', false);
  return gmPackDo({ producto: pr, gemas: g, bonus: b, a_la_venta: v, orden: o }, 'pnew', '¿Crear este paquete?',
    [['Producto', '<span class="mono">' + esc(pr) + '</span>'], ['Gemas', nf(g) + ' + ' + nf(b) + ' de bonus = <b>' + nf(g + b) + '</b>'], ['A la venta', v ? 'Sí' : 'No (lo activas cuando el producto exista en las tiendas)'], ['Recuerda', 'Créalo como CONSUMIBLE con ese mismo id en Play Console, App Store Connect y RevenueCat.']], 'Paquete creado')
    .then(function (ok) { if (ok) { ['gm_n_prod', 'gm_n_gemas', 'gm_n_bonus', 'gm_n_orden'].forEach(function (s) { delete GM.d[s]; }); delete GM.on.gm_n_venta; } });
};

/* ---- paquetes míticos con gemas ---- */
function gmMiticos(r) {
  var ms = r.miticos || [];
  var h = '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Paquetes míticos con gemas</h3><span class="sub grow">' + nf(ms.filter(function (m) { return m.precio != null; }).length) + ' se pueden comprar con gemas</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Salen de los paquetes que tienes «A la venta» en Ventas con dinero. El precio general es el de «Gemas por un paquete mítico completo»; aquí puedes ponerle uno propio a un paquete (déjalo vacío para usar el general) o retirarlo de las gemas sin quitarlo de la venta con dinero.</p>';
  if (!ms.length) return h + '<p class="mut">No hay paquetes míticos.</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Paquete</th><th>A la venta con dinero</th><th class="num">Precio ahora</th><th>Precio propio</th><th>En gemas</th><th class="num">Ventas</th><th></th></tr></thead><tbody>' + ms.map(function (m) {
    var k = 'gm_m_' + m.id, cur = gmDraft(k, m.gemas == null ? '' : m.gemas);
    var est = m.oculto ? chip('retirado', 'warn') : m.precio != null ? chip('a la venta', 'ok') : chip('no disponible', '');
    return '<tr><td><b>' + esc(pgPack(m.id)) + '</b><div class="xs mut mono">' + esc(m.id) + '</div></td>' +
      '<td>' + (m.a_la_venta ? chip('sí', 'ok') : chip('no', '')) + '</td>' +
      '<td class="num">' + (m.precio != null ? nf(m.precio) + '<div class="xs mut">' + gmMxn(m.precio) + '</div>' : '—') + '</td>' +
      '<td><label class="sr" for="' + k + '">Precio propio en gemas de ' + esc(m.id) + '</label>' + inp(k, cur, { type: 'number', mode: 'numeric', min: 10, ph: 'El general', di: 'gmIn' }).replace('class="in"', 'class="in" style="width:110px"') + '</td>' +
      '<td>' + est + '</td><td class="num">' + nf(m.ventas) + '</td>' +
      '<td class="num"><div class="row" style="justify-content:flex-end;flex-wrap:wrap"><button class="btn sm" data-a="gmMitSave" data-id="' + esc(m.id) + '"' + (GM.saving ? ' disabled' : '') + '>' + ic('check') + 'Guardar precio</button>' +
      '<button class="btn sm ghost" data-a="gmMitOculto" data-id="' + esc(m.id) + '" data-v="' + (m.oculto ? 0 : 1) + '"' + (GM.saving ? ' disabled' : '') + '>' + (m.oculto ? 'Volver a ofrecer' : 'Retirar de gemas') + '</button></div></td></tr>';
  }).join('') + '</tbody></table></div></div></div>';
}
async function gmMitDo(datos, ttl, lines, okMsg, danger) {
  if (!await confirmDlg({ title: ttl, text: 'Afecta solo a la compra con gemas; la venta con dinero no cambia.', html: cbox(lines), ok: 'Sí, guardar', danger: !!danger, icon: 'gift' })) return;
  GM.saving = 'mit'; paintPage();
  try { await rpc('admin_gemas', { p_accion: 'mitico', p_datos: datos }); delete GM.d['gm_m_' + datos.id]; toast(okMsg); await rload('gemas', true); if (RM.solo_gemas) rload('solo_gemas', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
  GM.saving = ''; paintPage();
}
A.gmMitSave = function (el) {
  var r = gmRows(); if (!r || GM.saving) return Promise.resolve();
  var id = el.dataset.id, m = (r.miticos || []).filter(function (x) { return x.id === id; })[0]; if (!m) return Promise.resolve();
  var k = 'gm_m_' + id, t = String(gmDraft(k, m.gemas == null ? '' : m.gemas)).trim(), n = null;
  if (t !== '') { n = gmInt(t, 10, 10000); if (n == null) { var er = {}; er[k] = 'Vacío (el general) o un entero de 10 a 10,000.'; showErrs(er); return Promise.resolve(); } }
  if (n === (m.gemas == null ? null : m.gemas)) { toast('No hay cambios', 'info'); return Promise.resolve(); }
  return gmMitDo({ id: id, gemas: n, oculto: !!m.oculto }, '¿Cambiar el precio en gemas?', [['Paquete', esc(pgPack(id))], ['Precio propio', (m.gemas == null ? 'el general' : nf(m.gemas)) + ' → <b>' + (n == null ? 'el general' : nf(n) + ' ' + gmMxn(n)) + '</b>']], 'Precio guardado');
};
A.gmMitOculto = function (el) {
  var r = gmRows(); if (!r || GM.saving) return Promise.resolve();
  var id = el.dataset.id, v = el.dataset.v === '1';
  return gmMitDo({ id: id, oculto: v }, v ? '¿Retirar de las gemas?' : '¿Volver a ofrecerlo con gemas?', [['Paquete', esc(pgPack(id))]], v ? 'Retirado de las gemas' : 'Vuelve a ofrecerse', v);
};

/* ---- historial ---- */
function gmHistorial(r) {
  var ev = r.eventos || [], gs = r.gastos || [];
  var h = '<div class="card sec"><div class="ch">' + ic('history') + '<h3>Compras y reembolsos de gemas</h3><span class="sub grow">Últimos ' + nf(ev.length) + ' avisos de RevenueCat</span></div>';
  if (!ev.length) h += '<div class="cb"><p class="mut">Todavía no llega ningún aviso de gemas. Cuando se configure el webhook, «Send test event» en RevenueCat aparecerá aquí como «Prueba de RevenueCat».</p></div></div>';
  else {
    h += '<div class="tw"><table class="tbl"><thead><tr><th>Cuándo</th><th>Qué</th><th>Jugador</th><th class="num">Precio</th><th class="num">Gemas</th><th>Resultado</th></tr></thead><tbody>' + ev.slice(0, GM.ev).map(function (e) {
      var res = GM_RES[e.resultado] || [e.resultado || '—', ''];
      return '<tr><td>' + esc(fdt(e.recibido)) + '</td><td><b>' + esc(e.tipo) + '</b><div class="xs mut mono">' + esc(e.producto || '') + '</div>' + (e.entorno === 'SANDBOX' ? chip('prueba', 'warn') : '') + '</td>' +
        '<td>' + (e.jugador ? '<button type="button" class="btn sm ghost" data-a="gmWho" data-id="' + esc(e.jugador) + '" data-n="' + esc(e.nombre || '') + '">' + esc(e.nombre || String(e.jugador).slice(0, 8) + '…') + '</button>' : '—') + '</td>' +
        '<td class="num">' + (e.precio != null ? esc(e.moneda || '') + ' ' + nf(e.precio) : '') + (e.precio_usd != null ? '<div class="xs mut">' + gmUsd(e.precio_usd) + '</div>' : '') + '</td>' +
        '<td class="num">' + (e.gemas ? nf(e.gemas) : '') + '</td><td>' + chip(res[0], res[1]) + '</td></tr>';
    }).join('') + '</tbody></table></div>' + (ev.length > GM.ev ? '<div class="cb"><button class="btn sm" data-a="gmMore" data-w="ev">Ver todos (' + nf(ev.length) + ')</button></div>' : '') + '</div>';
  }
  h += '<div class="card sec"><div class="ch">' + ic('list') + '<h3>Gastos, ajustes y regalos</h3><span class="sub grow">Últimos ' + nf(gs.length) + ' movimientos</span></div>';
  if (!gs.length) return h + '<div class="cb"><p class="mut">Todavía no hay movimientos.</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Cuándo</th><th>Tipo</th><th>Qué</th><th class="num">Gemas</th><th>Jugador</th></tr></thead><tbody>' + gs.slice(0, GM.gs).map(function (g) {
    var t = GM_TIPO[g.tipo] || [g.tipo, ''];
    return '<tr><td>' + esc(fdt(g.creado)) + '</td><td>' + chip(t[0], t[1]) + '</td><td>' + gmQue(g) + '</td>' +
      '<td class="num"><b style="color:var(--' + (g.monto < 0 ? 'bad' : 'ok') + ')">' + (g.monto > 0 ? '+' : '') + nf(g.monto) + '</b></td>' +
      '<td>' + (g.jugador ? '<button type="button" class="btn sm ghost" data-a="gmWho" data-id="' + esc(g.jugador) + '" data-n="' + esc(g.nombre || '') + '">' + esc(g.nombre || String(g.jugador).slice(0, 8) + '…') + '</button>' : '—') + '</td></tr>';
  }).join('') + '</tbody></table></div>' + (gs.length > GM.gs ? '<div class="cb"><button class="btn sm" data-a="gmMore" data-w="gs">Ver todos (' + nf(gs.length) + ')</button></div>' : '') + '</div>';
}
function gmQue(g) {
  var d = g.detalle || {};
  if (g.tipo === 'gasto') {
    var q = GM_GASTO[g.que] || g.que || 'Gasto';
    if (g.que === 'paquete' && d.id) return esc(q) + ': <b>' + esc(pgPack(d.id)) + '</b>';
    if (g.que === 'casilla' && d.casilla) return esc(q) + ' (' + esc(GM_CAS[d.casilla] || d.casilla) + ')';
    if (g.que === 'bloques' && d.bloques) return esc(q) + ': ' + nf(d.bloques) + ' Bloques';
    if (g.que === 'pase_nivel' && d.niveles) return esc(q) + ': ' + nf(d.niveles) + (d.niveles === 1 ? ' nivel' : ' niveles');
    return esc(q);
  }
  if (d.producto) return 'Compra de <span class="mono">' + esc(d.producto) + '</span>';
  return d.nota ? esc(d.nota) : g.tipo === 'reembolso' ? 'Reembolso de la tienda' + (d.deuda ? ' (deuda ' + nf(d.deuda) + ')' : '') : '<span class="mut">—</span>';
}
A.gmMore = function (el) { GM[el.dataset.w] = 1000; paintPage(); };

/* ---- jugador ---- */
function gmJugador(r) {
  var h = '<div class="card sec"><div class="ch">' + ic('user') + '<h3>Cartera de un jugador</h3><span class="sub grow">Ver, ajustar o regalar gemas</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Busca al jugador por su nombre del ranking (o pega su id). Verás su saldo y sus últimos movimientos; también puedes corregir el saldo o regalarle gemas. Todo queda anotado con tu nota.</p>' +
    searchBox('gm_q', GM.q, 'Buscar por nombre del ranking (2 letras o más) o pegar un id…', 'gmQ') + '<div id="gm_res" class="mt8">' + gmResHtml() + '</div>';
  if (GM.who && GM.loadingJ) h += '<div class="mt16">' + skel(2) + '</div>';
  else if (GM.who && GM.jug) h += gmFicha(GM.jug);
  return h + '</div></div>';
}
var GM_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function gmResHtml() {
  var q = GM.q.trim();
  if (GM_UUID.test(q)) return '<button type="button" class="btn sm" data-a="gmWho" data-id="' + esc(q) + '" data-n="">Usar este id</button>';
  if (GM.qr == null) return '';
  return GM.qr.length ? '<div class="pkl" style="border:1px solid var(--border);border-radius:10px">' + GM.qr.map(function (j) {
    return '<button type="button" class="pkr" data-a="gmWho" data-id="' + esc(j.id) + '" data-n="' + esc(j.nombre) + '" aria-pressed="' + (!!GM.who && GM.who.id === j.id) + '"><span class="t">' + esc(j.nombre) + '<span>' + (j.pais ? esc(j.pais) + ' · ' : '') + 'visto ' + esc(relT(j.visto)) + '</span></span></button>';
  }).join('') + '</div>' : '<div class="xs mut">Nadie con ese nombre.</div>';
}
function gmFicha(j) {
  var h = '<div class="mt16"><h4 style="margin:0 0 10px">' + esc(j.nombre || 'Jugador') + ' <span class="xs mut mono">' + esc(String(j.id).slice(0, 8)) + '…</span></h4>' +
    '<div class="kpis">' + kpi('db', 'Saldo', nf(j.saldo), 'Gemas que tiene ahora') + kpi('warn', 'Deuda', nf(j.deuda), 'Se cobra de su siguiente compra') +
    kpi('star', 'Compradas', nf(j.compradas), 'Con compra o regalo del panel') + kpi('gift', 'Gastadas', nf(j.gastadas), 'Desde el inicio') + '</div>' +
    '<p class="mt8"><b>Cosméticos conseguidos con gemas:</b> ' + ((j.items || []).length ? (j.items || []).map(function (i) { return esc(tiNom(i)); }).join(', ') : '<span class="mut">ninguno</span>') + '</p>' +
    '<div class="grid g2 mt16"><div class="card" style="padding:14px"><b>Ajustar saldo</b><div class="xs mut" style="margin-bottom:8px">Fija el saldo exacto. Solo se guarda si su saldo sigue siendo ' + nf(j.saldo) + ' al confirmar.</div>' +
    field('gm_nuevo', 'Saldo nuevo', inp('gm_nuevo', GM.nuevo, { type: 'number', mode: 'numeric', min: 0, ph: String(j.saldo), di: 'gmJIn' }), 'De 0 a 1,000,000.') +
    field('gm_nota', 'Nota (por qué)', inp('gm_nota', GM.nota, { di: 'gmJIn', max: 200 })) +
    '<button class="btn pri" data-a="gmAjustar"' + (GM.saving ? ' disabled' : '') + '>' + (GM.saving === 'aj' ? '<span class="spin"></span>' : ic('edit')) + 'Ajustar saldo</button></div>' +
    '<div class="card" style="padding:14px"><b>Regalar gemas</b><div class="xs mut" style="margin-bottom:8px">Suma gemas al saldo (para compensar un error). Cuenta como entrega del panel, no como venta.</div>' +
    field('gm_reg', 'Cuántas gemas', inp('gm_reg', GM.reg, { type: 'number', mode: 'numeric', min: 1, di: 'gmJIn' }), 'De 1 a 100,000.') +
    field('gm_rnota', 'Nota (por qué)', inp('gm_rnota', GM.rnota, { di: 'gmJIn', max: 200 })) +
    '<button class="btn pri" data-a="gmRegalar"' + (GM.saving ? ' disabled' : '') + '>' + (GM.saving === 'reg' ? '<span class="spin"></span>' : ic('gift')) + 'Regalar gemas</button></div></div>';
  var mv = j.movs || [];
  h += '<h4 style="margin:18px 0 8px">Últimos movimientos</h4>';
  if (!mv.length) return h + '<p class="mut">Todavía no tiene movimientos.</p></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Cuándo</th><th>Tipo</th><th>Qué</th><th class="num">Gemas</th><th class="num">Saldo después</th></tr></thead><tbody>' + mv.map(function (m) {
    var t = GM_TIPO[m.tipo] || [m.tipo, ''];
    return '<tr><td>' + esc(fdt(m.creado)) + '</td><td>' + chip(t[0], t[1]) + '</td><td>' + gmQue({ tipo: m.tipo, que: (m.detalle || {}).que, detalle: m.detalle, monto: m.monto }) + '</td><td class="num"><b style="color:var(--' + (m.monto < 0 ? 'bad' : 'ok') + ')">' + (m.monto > 0 ? '+' : '') + nf(m.monto) + '</b></td><td class="num">' + nf(m.saldo) + '</td></tr>';
  }).join('') + '</tbody></table></div></div>';
}
I.gmJIn = function (el) { var m = { gm_nuevo: 'nuevo', gm_nota: 'nota', gm_reg: 'reg', gm_rnota: 'rnota' }; GM[m[el.id]] = el.value; };
I.gmQ = debounce(function (el) {
  GM.q = el.value; var q = el.value.trim(), b = $('#gm_res');
  if (GM_UUID.test(q)) { GM.qr = null; if (b) b.innerHTML = gmResHtml(); return; }
  if (q.length < 2) { GM.qr = null; if (b) b.innerHTML = ''; return; }
  var mine = GM.seq = GM.seq + 1;
  rpc('admin_buscar_jugadores', { p_q: q }, { nomiss: true }).then(function (r) {
    if (mine !== GM.seq) return; GM.qr = r || []; var x = $('#gm_res'); if (x) x.innerHTML = gmResHtml();
  }, function (e) { toast(e.code === 'sin_sql' ? 'Falta correr 14-servidor.sql para buscar jugadores' : e.message, 'warn'); });
}, 250);
async function gmCargarJ(id, nombre) {
  GM.who = { id: id, nombre: nombre }; GM.jug = null; GM.loadingJ = true; GM.nuevo = ''; GM.nota = ''; GM.reg = ''; GM.rnota = ''; paintPage();
  try { var res = await rpc('admin_gemas', { p_accion: 'jugador', p_datos: { id: id } }); GM.jug = res && res.jugador; if (GM.jug) GM.who.nombre = GM.jug.nombre || nombre; }
  catch (e) { GM.who = null; toast(e.message === 'jugador no existe' ? 'Ese jugador no existe' : 'No se pudo abrir la cartera: ' + e.message, 'bad'); }
  GM.loadingJ = false; paintPage();
}
A.gmWho = function (el) { return gmCargarJ(el.dataset.id, el.dataset.n); };
async function gmJDo(accion, datos, tipo, ttl, text, lines, okLbl) {
  if (!await confirmDlg({ title: ttl, text: text, html: cbox(lines), ok: okLbl, icon: 'star' })) return false;
  GM.saving = tipo; paintPage();
  var ok = false;
  try { var res = await rpc('admin_gemas', { p_accion: accion, p_datos: datos }); if (res && res.jugador) GM.jug = res.jugador; ok = true; toast('Listo'); await rload('gemas', true); }
  catch (e) { toast(/saldo cambi/.test(e.message) ? 'El saldo cambió mientras editabas: ' + e.message + '. Revisa y vuelve a intentar.' : 'No se pudo: ' + e.message, 'bad'); if (/saldo cambi/.test(e.message)) gmCargarJ(GM.who.id, GM.who.nombre); }
  GM.saving = ''; paintPage(); return ok;
}
A.gmAjustar = function () {
  if (!GM.who || !GM.jug || GM.saving) return Promise.resolve();
  var n = gmInt(GM.nuevo, 0, 1000000), errs = {};
  if (n == null) errs.gm_nuevo = 'Un entero de 0 a 1,000,000.';
  if (String(GM.nota).trim().length < 3) errs.gm_nota = 'Escribe por qué (queda anotado).';
  if (!showErrs(errs)) return Promise.resolve();
  if (n === GM.jug.saldo) { toast('Ya tiene ese saldo', 'info'); return Promise.resolve(); }
  return gmJDo('ajustar', { id: GM.who.id, antes: GM.jug.saldo, nuevo: n, nota: GM.nota.trim() }, 'aj', '¿Ajustar el saldo de ' + (GM.who.nombre || 'este jugador') + '?', 'Se anota como ajuste del panel.',
    [['Jugador', esc(GM.who.nombre || GM.who.id)], ['Saldo', nf(GM.jug.saldo) + ' → <b>' + nf(n) + '</b> (' + (n > GM.jug.saldo ? '+' : '') + nf(n - GM.jug.saldo) + ')'], ['Nota', esc(GM.nota)]], 'Sí, ajustar')
    .then(function (ok) { if (ok) { GM.nuevo = ''; GM.nota = ''; paintPage(); } });
};
A.gmRegalar = function () {
  if (!GM.who || !GM.jug || GM.saving) return Promise.resolve();
  var n = gmInt(GM.reg, 1, 100000), errs = {};
  if (n == null) errs.gm_reg = 'Un entero de 1 a 100,000.';
  if (String(GM.rnota).trim().length < 3) errs.gm_rnota = 'Escribe por qué (queda anotado).';
  if (!showErrs(errs)) return Promise.resolve();
  return gmJDo('entregar', { jugador: GM.who.id, gemas: n, nota: GM.rnota.trim() }, 'reg', '¿Regalar ' + gmGem(n) + ' a ' + (GM.who.nombre || 'este jugador') + '?', 'Se suman a su saldo y quedan como entrega del panel (no es una venta).',
    [['Jugador', esc(GM.who.nombre || GM.who.id)], ['Gemas', '<b>+' + nf(n) + '</b> (saldo ' + nf(GM.jug.saldo) + ' → ' + nf(GM.jug.saldo + n) + ')'], ['Nota', esc(GM.rnota)]], 'Sí, regalar')
    .then(function (ok) { if (ok) { GM.reg = ''; GM.rnota = ''; paintPage(); } });
};

A.gmReload = function () { GM.d = {}; GM.on = {}; rload('gemas'); toast('Recargando…', 'info'); };
function vGemas() {
  var o = rm('gemas');
  var h = pageHead('Gemas', 'La moneda <b>premium</b> de Blokku: se compra con dinero real y no se gana jugando. Aquí la enciendes, pones precios, eliges qué paquetes se venden y arreglas la cartera de un jugador.', '<button class="btn" data-a="gmReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.gemas, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 19-tienda.sql y 24-compras-reales.sql.') + '</div>' : rerr(o, 'las gemas'));
  var r = gmRows();
  if (!r) return h + skel(4);
  return h + gmBanner(r) + gmKpis(r.totales || {}) + gmSwitches(r) + gmValores(r) + gmPaquetes(r) + gmMiticos(r) + gmHistorial(r) + gmJugador(r);
}
VIEWS['juego/gemas'] = vGemas;
