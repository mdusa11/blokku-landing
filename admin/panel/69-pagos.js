/* ================= VENTAS CON DINERO REAL (24-compras-reales.sql, app 2.0) ================= */
// Todo por admin_pagos(p_clave, p_accion, p_datos): sin acción solo lee
// {hoy, ajustes, nunca, paquetes, casillas, hoy_casillas, eventos, totales}.
//   'config'   {compras_reales?, maestro_incluye_pago?, revocar_reembolsos?, entregar_sandbox?}
//   'paquete'  {id, a_la_venta?, orden?}
//   'casilla'  {dia, casilla, items:[]}   (items vacío = quitar esa programación)
//   'entregar' {jugador, producto | items, nota}
//   'revocar'  {transaccion, jugador, revocar}
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.pagos = '24-compras-reales.sql';
FNF.admin_pagos = 'pagos';
RFN.pagos = 'admin_pagos';
N20['juego/pagos'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/pagos'; })) g.items.push(['juego/pagos', 'Ventas con dinero', 'trend']);
  ROUTES['juego/pagos'] = { t: 'Ventas con dinero', ic: 'trend', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/pagos'] = {
  que: 'La venta de cosméticos con DINERO REAL (Google Play y App Store, cobrado por RevenueCat). Aquí enciendes la venta, eliges qué paquetes premium están a la venta, programas por fecha qué trae cada «casilla» de oferta (chica, mediana, grande), ves cada compra y reembolso con sus totales y entregas a mano si algo falló.',
  ve: 'En la Tienda, arriba: «Paquetes premium» (una tarjeta por paquete con su escena en movimiento, «Probar 1 partida» y el precio que da la tienda en su moneda) y «Ofertas premium del día» con las 3 casillas y su cuenta atrás. «Restaurar compras» abajo. Con el interruptor apagado no se ve nada de esto.',
  cuando: 'Enciende la venta cuando los productos ya estén creados en Play Console, App Store Connect y RevenueCat y el webhook responda (ver PASOS.md). Programa las casillas con unos días de anticipación. Revisa el historial si alguien dice que pagó y no le llegó.',
  como: [
    '<b>Quién entrega:</b> SOLO el servidor. RevenueCat verifica el pago con la tienda y avisa a la función rc-webhook de Supabase (con un secreto); el servidor anota la compra ligada al jugador del ranking y la app la recoge. El teléfono nunca puede decir «ya pagué». Cada aviso se procesa una sola vez (si RevenueCat lo repite, no se entrega dos veces).',
    '<b>Paquetes:</b> cada uno es un producto propio y no consumible (<span class="mono">blokku_pack_ID</span>). Solo se venden los que marques «A la venta» y que existan en la app instalada. Los paquetes de marcas, regalos y staff (Héroes, Qué Plan, Fakturo, Cumplegratis, Viral, México, Monkeys, Piratas, Lucha Libre, cumpleaños) NUNCA se pueden poner a la venta: el servidor lo rechaza.',
    '<b>Casillas:</b> 3 productos fijos consumibles (<span class="mono">blokku_oferta_chica / _mediana / _grande</span>) con el precio que pongas en las tiendas. Tú decides qué trae cada una a partir de un día (UTC): la programación sigue hasta que haya otra más nueva. Se entrega lo que tenía la casilla el día de la compra. Una casilla sin nada programado no se enseña.',
    '<b>Precios:</b> se ponen en Play Console y App Store Connect, no aquí. La app enseña el precio que da la tienda, ya en la moneda del jugador.',
    '<b>Reembolsos:</b> siempre se anotan. Con «Revocar al reembolsar» encendido, la compra reembolsada deja de contar para recuperarla en otro teléfono (en el teléfono donde ya la tiene se queda).',
    '<b>Restaurar y cambiar de teléfono:</b> «Restaurar compras» pasa los paquetes de la cuenta de Google/Apple al jugador actual. Con el código de recuperación (Cuentas) lo comprado sigue a la cuenta.',
    '<b>Código maestro:</b> con «El maestro incluye lo de pago» apagado, el código maestro deja de regalar los paquetes que están a la venta (lo que ya regaló antes se queda).',
    '<b>Pruebas (sandbox):</b> compras con cuentas de prueba. Se entregan si «Entregar compras de prueba» está encendido y NO cuentan en los totales.',
    H_HORA
  ]
};

var PG = { saving: '', on: {}, dia: null, cas: 'chica', pick: null, q: '', qr: null, who: null, prod: '', nota: '' };
var PG_SW = [
  ['compras_reales', 'Venta con dinero real', 'Verde = la app enseña «Paquetes premium» y «Ofertas premium del día». Gris = no se ve nada (lo ya comprado se queda).'],
  ['maestro_incluye_pago', 'El maestro incluye lo de pago', 'Verde = el código maestro también da los paquetes que se venden. Gris = no los regala.'],
  ['revocar_reembolsos', 'Revocar al reembolsar', 'Verde = una compra reembolsada deja de contar para recuperarla. Gris = solo se anota.'],
  ['entregar_sandbox', 'Entregar compras de prueba', 'Verde = las compras con cuentas de prueba (sandbox) se entregan. No cuentan en los totales.']
];
var PG_CAS = { chica: 'Chica', mediana: 'Mediana', grande: 'Grande' };
var PG_RES = { entregado: ['Entregado', 'ok'], ya_entregado: ['Ya estaba', 'ok'], sin_jugador: ['Sin jugador', 'bad'], sin_contenido: ['Casilla vacía', 'bad'], sin_transaccion: ['Sin transacción', 'bad'], sandbox_ignorado: ['Prueba (no entregada)', 'warn'], otro_producto: ['Otro producto', ''], reembolso: ['Reembolso anotado', 'warn'], reembolso_revocado: ['Reembolso revocado', 'warn'], reembolso_sin_entrega: ['Reembolso', 'warn'], reembolso_revertido: ['Reembolso revertido', 'ok'], prueba: ['Prueba de RevenueCat', ''], ignorado: ['Ignorado', ''] };

function pgRows() { var o = rm('pagos'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.ajustes ? o.rows : null; }
function pgOn(r, k) { return k in PG.on ? PG.on[k] : !!(r.ajustes || {})[k]; }
function pgNom(cid) { return typeof tiNom === 'function' ? tiNom(cid) : cid; }
function pgPack(id) { var p = items('premios').filter(function (x) { return x.cid === 'theme_' + id; })[0]; return p ? p.nombre : id; }
function pgUsd(n) { return '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD'; }
/* objetos que se pueden poner en una casilla: del catálogo del panel, en la app y no de un paquete «nunca» */
function pgPool(r) {
  var nunca = r.nunca || [];
  return items('premios').filter(function (x) {
    if (!x.cid || x.estado !== 'en la app') return false;
    if (/^badge_(ceo|medusa_dusa)$/.test(x.cid) || /cumple20\d\d$/.test(x.cid)) return false;
    return !nunca.some(function (n) { return x.cid.slice(-(n.length + 1)) === '_' + n; });
  }).sort(function (a, b) { return String(a.tipo).localeCompare(b.tipo) || String(a.nombre).localeCompare(b.nombre); });
}
C.pgTog = function (el) { PG.on[el.id.slice(3)] = el.checked; };

function pgKpis(t) {
  var pm = t.por_moneda || {}, pp = t.por_producto || {};
  return '<div class="kpis">' +
    kpi('trend', 'Ventas', nf(t.compras), nf(t.compras_7d) + ' en 7 días · ' + nf(t.compras_30d) + ' en 30 días') +
    kpi('store', 'Ingreso bruto', pgUsd(t.usd), pgUsd(t.usd_7d) + ' en 7 días · ' + pgUsd(t.usd_30d) + ' en 30 días (antes de comisión de la tienda)') +
    kpi('user', 'Compradores', nf(t.compradores), 'Jugadores con al menos una compra') +
    kpi('refresh', 'Reembolsos', nf(t.reembolsos), pgUsd(t.usd_reembolsado) + ' devueltos') +
    kpi('warn', 'Sin entregar', nf(t.sin_entregar), 'Revisa el historial: entrega a mano si hace falta') +
    kpi('play', 'Compras de prueba', nf(t.pruebas), 'Sandbox: no cuentan') + '</div>' +
    '<div class="card sec"><div class="ch">' + ic('chart') + '<h3>Por producto y por moneda</h3><span class="sub grow">Solo compras reales</span></div><div class="cb">' +
    (Object.keys(pp).length ? hbars(Object.keys(pp).sort(function (a, b) { return pp[b] - pp[a]; }).map(function (k) { return { l: '<span class="mono">' + esc(k) + '</span>', v: pp[k] }; })) : '<p class="mut">Todavía no hay ventas.</p>') +
    (Object.keys(pm).length ? '<p class="xs mut" style="margin:10px 0 0">Cobrado en cada moneda: ' + Object.keys(pm).map(function (k) { return esc(k) + ' ' + nf(pm[k]); }).join(' · ') + '</p>' : '') +
    '</div></div>';
}

function pgSwitches(r) {
  var h = '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Interruptores</h3><span class="sub grow">' + (r.ajustes.compras_reales ? 'Venta ENCENDIDA' : 'Venta apagada: la app no enseña nada') + '</span></div><div class="cb">';
  PG_SW.forEach(function (s) {
    h += '<div class="row nw" style="align-items:flex-start;margin-bottom:12px"><div class="grow"><b>' + esc(s[1]) + '</b><div class="xs mut">' + esc(s[2]) + '</div></div>' + tog('pg_' + s[0], pgOn(r, s[0]), '', { dc: 'pgTog', on: 'Encendido', off: 'Apagado' }) + '</div>';
  });
  return h + '<div class="row"><button class="btn pri" data-a="pgSave"' + (PG.saving ? ' disabled' : '') + '>' + (PG.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptores</button><span class="xs mut">La app los ve en unos 30 minutos.</span></div></div></div>';
}
A.pgSave = async function () {
  var r = pgRows(); if (!r || PG.saving) return;
  var ch = {}, dl = [];
  PG_SW.forEach(function (s) { var v = pgOn(r, s[0]), was = !!r.ajustes[s[0]]; if (v !== was) { ch[s[0]] = v; dl.push([s[1], (was ? 'Encendido' : 'Apagado') + ' → <b>' + (v ? 'Encendido' : 'Apagado') + '</b>']); } });
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var on = ch.compras_reales === true;
  if (!await confirmDlg({ title: on ? '¿Encender la venta con dinero real?' : '¿Guardar los interruptores?', text: on ? 'Revisa antes que los productos, RevenueCat y el webhook estén listos (PASOS.md).' : 'Afecta a todos los jugadores.', html: cbox(dl), ok: 'Sí, guardar', icon: 'power' })) return;
  PG.saving = 'cfg'; paintPage();
  try { await rpc('admin_pagos', { p_accion: 'config', p_datos: ch }); PG.on = {}; toast('Guardado'); await rload('pagos', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  PG.saving = ''; paintPage();
};

function pgPaquetes(r) {
  var ps = r.paquetes || [];
  var h = '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Paquetes premium</h3><span class="sub grow">' + nf(ps.filter(function (p) { return p.a_la_venta; }).length) + ' a la venta de ' + nf(ps.length) + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Cada paquete necesita su producto en Play Console y App Store Connect con el id exacto de la columna «Producto». Si la tienda no tiene el producto (o la app instalada no tiene el paquete), la app simplemente no lo enseña.</p>';
  if (!ps.length) return h + '<p class="mut">No hay paquetes.</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Paquete</th><th>Producto</th><th class="num">Objetos</th><th class="num">Ventas</th><th>Estado</th><th></th></tr></thead><tbody>' + ps.map(function (p) {
    return '<tr><td><b>' + esc(pgPack(p.id)) + '</b><div class="xs mut mono">' + esc(p.id) + '</div></td><td class="mono xs">blokku_pack_' + esc(p.id) + '</td><td class="num" title="' + esc((p.items || []).join(', ')) + '">' + nf((p.items || []).length) + '</td><td class="num">' + nf(p.ventas) + '</td>' +
      '<td>' + (p.a_la_venta ? chip('a la venta', 'ok') : chip('no se vende', '')) + '</td>' +
      '<td class="num"><button class="btn sm' + (p.a_la_venta ? ' ghost' : '') + '" data-a="pgPack" data-id="' + esc(p.id) + '" data-v="' + (p.a_la_venta ? 0 : 1) + '">' + (p.a_la_venta ? 'Quitar de la venta' : 'Poner a la venta') + '</button></td></tr>';
  }).join('') + '</tbody></table></div></div></div>';
}
A.pgPack = async function (el) {
  var id = el.dataset.id, v = el.dataset.v === '1';
  if (!await confirmDlg({ title: v ? '¿Poner a la venta?' : '¿Quitar de la venta?', text: v ? 'Los jugadores podrán comprarlo con dinero (si el producto existe en las tiendas).' : 'Deja de verse. Quien ya lo compró lo conserva.', html: cbox([['Paquete', esc(pgPack(id))], ['Producto', '<span class="mono">blokku_pack_' + esc(id) + '</span>']]), ok: v ? 'Sí, a la venta' : 'Quitar', danger: !v, icon: 'gift' })) return;
  try { await rpc('admin_pagos', { p_accion: 'paquete', p_datos: { id: id, a_la_venta: v } }); toast(v ? 'A la venta' : 'Quitado de la venta'); await rload('pagos', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

function pgCasillas(r) {
  var hoyc = {}, pool = pgPool(r), pick = PG.pick || [], dia = PG.dia || r.hoy;
  (r.hoy_casillas || []).forEach(function (c) { hoyc[c.casilla] = c; });
  var h = '<div class="card sec"><div class="ch">' + ic('cal') + '<h3>Ofertas premium del día (casillas)</h3><span class="sub grow">Hoy (UTC) es ' + esc(fd(r.hoy, true)) + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Programa qué trae cada casilla a partir de un día (UTC, cambia a las 6 pm de México). Sigue igual hasta la siguiente programación. Se entrega lo que tenía la casilla el día de la compra.</p><div class="grid g3" style="margin-bottom:14px">';
  ['chica', 'mediana', 'grande'].forEach(function (k) {
    var c = hoyc[k];
    h += '<div class="card" style="padding:12px"><b>' + PG_CAS[k] + '</b> <span class="xs mut mono">blokku_oferta_' + k + '</span><div class="mt8">' + (c ? (c.items || []).map(function (i) { return esc(pgNom(i)); }).join(', ') + '<div class="xs mut mt8">Desde ' + esc(fd(c.desde, true)) + (c.hasta ? ' · cambia ' + esc(fdt(c.hasta)) : ' · sin cambio programado') + '</div>' : '<span class="mut">Vacía: la app no la enseña</span>') + '</div></div>';
  });
  h += '</div>';
  var prog = r.casillas || [];
  if (prog.length) {
    h += '<div class="tw" style="margin-bottom:14px"><table class="tbl"><thead><tr><th>Desde (UTC)</th><th>Casilla</th><th>Objetos</th><th></th></tr></thead><tbody>' + prog.map(function (c) {
      return '<tr><td>' + esc(fd(c.dia, true)) + (c.dia === r.hoy ? ' ' + chip('hoy', 'ok') : '') + '</td><td>' + PG_CAS[c.casilla] + '</td><td>' + (c.items || []).map(function (i) { return esc(pgNom(i)); }).join(', ') + '</td><td class="num">' + (c.dia >= r.hoy ? '<button class="btn sm ghost" data-a="pgCasDel" data-d="' + esc(c.dia) + '" data-c="' + esc(c.casilla) + '">' + ic('trash') + 'Quitar</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  }
  h += '<h4 style="margin:6px 0 8px">Programar</h4><div class="grid g2">' + field('pg_dia', 'Desde el día (UTC)', inp('pg_dia', dia, { type: 'date', di: 'pgDia' })) +
    field('pg_cas', 'Casilla', sel('pg_cas', PG.cas, [['chica', 'Chica'], ['mediana', 'Mediana'], ['grande', 'Grande']], { dc: 'pgCas' })) + '</div>' +
    '<div class="f"><label>Objetos (1 a 6)</label><div class="chips">' + (pool.length ? pool.map(function (p) {
      return '<button type="button" class="fchip" data-a="pgPick" data-id="' + esc(p.cid) + '" aria-pressed="' + (pick.indexOf(p.cid) >= 0) + '">' + esc(p.nombre) + ' <span class="n">' + esc(p.tipo) + ' · ' + esc(p.rareza) + '</span></button>';
    }).join('') : '<span class="mut">El catálogo del panel aún no carga.</span>') + '</div><div class="hint">Solo objetos que ya están en la app. Los de paquetes que nunca se venden no aparecen.</div></div>' +
    '<div class="row mt16"><button class="btn pri" data-a="pgCasSave"' + (PG.saving ? ' disabled' : '') + '>' + (PG.saving === 'cas' ? '<span class="spin"></span>' : ic('check')) + 'Programar casilla</button><span class="xs mut">' + pick.length + ' elegidos</span></div>';
  return h + '</div></div>';
}
I.pgDia = function (el) { PG.dia = el.value; };
C.pgCas = function (el) { PG.cas = el.value; };
A.pgPick = function (el) {
  var id = el.dataset.id, p = (PG.pick = PG.pick || []), i = p.indexOf(id);
  if (i >= 0) p.splice(i, 1); else if (p.length >= 6) { toast('Máximo 6 objetos', 'warn'); return; } else p.push(id);
  paintPage();
};
A.pgCasSave = async function () {
  var r = pgRows(); if (!r || PG.saving) return;
  var dia = PG.dia || r.hoy, pick = PG.pick || [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia) || dia < r.hoy) { showErrs({ pg_dia: 'Elige hoy o un día futuro (UTC).' }); return; }
  if (!pick.length) { toast('Elige al menos un objeto', 'warn'); return; }
  if (!await confirmDlg({ title: '¿Programar la casilla ' + PG_CAS[PG.cas] + '?', text: 'Desde ese día los jugadores la verán con estos objetos.', html: cbox([['Desde (UTC)', esc(fd(dia, true))], ['Casilla', PG_CAS[PG.cas] + ' · <span class="mono">blokku_oferta_' + PG.cas + '</span>'], ['Objetos', pick.map(function (i) { return esc(pgNom(i)); }).join(', ')]]), ok: 'Sí, programar', icon: 'cal' })) return;
  PG.saving = 'cas'; paintPage();
  try { await rpc('admin_pagos', { p_accion: 'casilla', p_datos: { dia: dia, casilla: PG.cas, items: pick } }); PG.pick = null; toast('Casilla programada'); await rload('pagos', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
  PG.saving = ''; paintPage();
};
A.pgCasDel = async function (el) {
  if (!await confirmDlg({ title: '¿Quitar esta programación?', text: 'La casilla seguirá con la programación anterior (o vacía).', html: cbox([['Desde (UTC)', esc(fd(el.dataset.d, true))], ['Casilla', PG_CAS[el.dataset.c]]]), ok: 'Quitar', icon: 'trash' })) return;
  try { await rpc('admin_pagos', { p_accion: 'casilla', p_datos: { dia: el.dataset.d, casilla: el.dataset.c, items: [] } }); toast('Quitada'); await rload('pagos', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

function pgHistorial(r) {
  var ev = r.eventos || [];
  var h = '<div class="card sec"><div class="ch">' + ic('history') + '<h3>Historial de compras y reembolsos</h3><span class="sub grow">Últimos ' + nf(ev.length) + ' avisos de RevenueCat</span></div>';
  if (!ev.length) return h + '<div class="cb"><p class="mut">Todavía no llega ningún aviso. Cuando configures el webhook, usa «Send test event» en RevenueCat y aparecerá aquí como «Prueba de RevenueCat».</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Cuándo</th><th>Qué</th><th>Jugador</th><th class="num">Precio</th><th>Resultado</th><th></th></tr></thead><tbody>' + ev.map(function (e) {
    var res = PG_RES[e.resultado] || [e.resultado, ''];
    if (/^transferido/.test(e.resultado)) res = ['Restaurado en otro jugador (' + e.resultado.split(':')[1] + ')', 'ok'];
    var canRev = (e.resultado === 'entregado' || e.resultado === 'ya_entregado') && e.jugador && e.transaccion;
    return '<tr><td>' + esc(fdt(e.recibido)) + '</td><td><b>' + esc(e.tipo) + '</b><div class="xs mut mono">' + esc(e.producto || '') + '</div>' + (e.entorno === 'SANDBOX' ? chip('prueba', 'warn') : '') + '</td>' +
      '<td>' + esc(e.nombre || (e.jugador ? String(e.jugador).slice(0, 8) + '…' : '—')) + '</td>' +
      '<td class="num">' + (e.precio != null ? esc(e.moneda || '') + ' ' + nf(e.precio) : '') + (e.precio_usd != null ? '<div class="xs mut">' + pgUsd(e.precio_usd) + '</div>' : '') + '</td>' +
      '<td>' + chip(res[0], res[1]) + ((e.items || []).length ? '<div class="xs mut">' + e.items.map(function (i) { return esc(pgNom(i)); }).join(', ') + '</div>' : '') + '</td>' +
      '<td class="num">' + (canRev ? '<button class="btn sm ghost" data-a="pgRev" data-t="' + esc(e.transaccion) + '" data-j="' + esc(e.jugador) + '">Revocar</button>' : '') + '</td></tr>';
  }).join('') + '</tbody></table></div></div>';
}
A.pgRev = async function (el) {
  if (!await confirmDlg({ title: '¿Revocar esta entrega?', text: 'Deja de contar para recuperarla en otro teléfono. Úsalo solo con fraude o un reembolso que no llegó.', html: cbox([['Transacción', '<span class="mono">' + esc(el.dataset.t) + '</span>']]), ok: 'Revocar', danger: true, icon: 'warn' })) return;
  try { await rpc('admin_pagos', { p_accion: 'revocar', p_datos: { transaccion: el.dataset.t, jugador: el.dataset.j, revocar: true } }); toast('Revocada'); await rload('pagos', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

function pgEntregar(r) {
  var prods = [['', 'Elige qué entregar…']].concat((r.paquetes || []).map(function (p) { return ['blokku_pack_' + p.id, 'Paquete ' + pgPack(p.id)]; }))
    .concat((r.hoy_casillas || []).map(function (c) { return ['blokku_oferta_' + c.casilla, 'Casilla ' + PG_CAS[c.casilla] + ' (lo de hoy)']; }));
  var h = '<div class="card sec"><div class="ch">' + ic('user') + '<h3>Entregar a mano</h3><span class="sub grow">Si alguien pagó y no le llegó</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Busca al jugador por su nombre del ranking, elige el paquete o la casilla y escribe por qué. Le llega la próxima vez que abra la tienda.</p>' +
    searchBox('pg_q', PG.q, 'Buscar por nombre del ranking (2 letras o más)…', 'pgQ') + '<div id="pg_res" class="mt8">' + pgResHtml() + '</div>';
  if (PG.who) {
    h += '<div class="grid g2 mt16">' + field('pg_prod', 'Qué entregar', sel('pg_prod', PG.prod, prods, { dc: 'pgProd' })) + field('pg_nota', 'Nota (por qué)', inp('pg_nota', PG.nota, { di: 'pgNota', max: 200 })) + '</div>' +
      '<div class="row mt16"><button class="btn pri" data-a="pgGive"' + (PG.saving ? ' disabled' : '') + '>' + (PG.saving === 'give' ? '<span class="spin"></span>' : ic('gift')) + 'Entregar a ' + esc(PG.who.nombre) + '</button></div>';
  }
  return h + '</div></div>';
}
function pgResHtml() {
  if (PG.qr == null) return '';
  return PG.qr.length ? '<div class="pkl" style="border:1px solid var(--border);border-radius:10px">' + PG.qr.map(function (j) {
    return '<button type="button" class="pkr" data-a="pgWho" data-id="' + esc(j.id) + '" data-n="' + esc(j.nombre) + '" aria-pressed="' + (PG.who && PG.who.id === j.id) + '"><span class="t">' + esc(j.nombre) + '<span>' + (j.pais ? esc(j.pais) + ' · ' : '') + 'visto ' + esc(relT(j.visto)) + '</span></span></button>';
  }).join('') + '</div>' : '<div class="xs mut">Nadie con ese nombre.</div>';
}
C.pgProd = function (el) { PG.prod = el.value; };
I.pgNota = function (el) { PG.nota = el.value; };
I.pgQ = debounce(function (el) {
  PG.q = el.value; var q = el.value.trim();
  if (q.length < 2) { PG.qr = null; var b = $('#pg_res'); if (b) b.innerHTML = ''; return; }
  var mine = PG.seq = (PG.seq || 0) + 1;
  rpc('admin_buscar_jugadores', { p_q: q }, { nomiss: true }).then(function (r) {
    if (mine !== PG.seq) return; PG.qr = r || []; var b = $('#pg_res'); if (b) b.innerHTML = pgResHtml();
  }, function (e) { toast(e.code === 'sin_sql' ? 'Falta correr 14-servidor.sql para buscar jugadores' : e.message, 'warn'); });
}, 250);
A.pgWho = function (el) { PG.who = { id: el.dataset.id, nombre: el.dataset.n }; paintPage(); };
A.pgGive = async function () {
  if (!PG.who || PG.saving) return;
  if (!PG.prod) { showErrs({ pg_prod: 'Elige qué entregar.' }); return; }
  if (String(PG.nota).trim().length < 3) { showErrs({ pg_nota: 'Escribe por qué (queda anotado).' }); return; }
  if (!await confirmDlg({ title: '¿Entregar a ' + PG.who.nombre + '?', text: 'Se anota como entrega del panel (no es una venta).', html: cbox([['Jugador', esc(PG.who.nombre)], ['Qué', '<span class="mono">' + esc(PG.prod) + '</span>'], ['Nota', esc(PG.nota)]]), ok: 'Sí, entregar', icon: 'gift' })) return;
  PG.saving = 'give'; paintPage();
  try { await rpc('admin_pagos', { p_accion: 'entregar', p_datos: { jugador: PG.who.id, producto: PG.prod, nota: PG.nota } }); toast('Entregado'); PG.prod = ''; PG.nota = ''; await rload('pagos', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
  PG.saving = ''; paintPage();
};

A.pgReload = function () { PG.on = {}; rload('pagos'); toast('Recargando…', 'info'); };
function vPagos() {
  var o = rm('pagos');
  var h = pageHead('Ventas con dinero', 'Cosméticos con <b>dinero real</b> (Google Play y App Store vía RevenueCat): paquetes premium y 3 casillas de oferta que programas por fecha. La entrega la decide el servidor.', '<button class="btn" data-a="pgReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.pagos, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Los pasos completos están en 02-Documentos › compras-reales › PASOS.md.') + '</div>' : rerr(o, 'las ventas'));
  var r = pgRows();
  if (!r) return h + skel(4);
  return h + pgKpis(r.totales || {}) + pgSwitches(r) + pgPaquetes(r) + pgCasillas(r) + pgHistorial(r) + pgEntregar(r);
}
VIEWS['juego/pagos'] = vPagos;
