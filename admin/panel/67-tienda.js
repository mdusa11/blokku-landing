/* ================= TIENDA, BLOQUES Y PROTECTORES (19-tienda.sql, app 2.2) ================= */
// Todo por admin_tienda(p_clave, p_accion, p_datos): sin acción solo lee
// {hoy, config[{clave,valor,def,lo,hi,grupo,nota}], ofertas, ocultos, stats}.
//   'config'        {clave: valor, …}                 valores con rango (el servidor los vuelve a validar)
//   'ofertas'       {dia:'AAAA-MM-DD', items:[ids]}   forzar las ofertas de un día (items vacío = quitar)
//   'ocultar'       {item, ocultar:bool}              retirar / devolver un objeto de la venta
//   'saldo_ver'     {id}                              cartera de un jugador
//   'saldo_ajustar' {id, antes, nuevo}                solo si `antes` es el saldo de ahora
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.tienda = '19-tienda.sql';
FNF.admin_tienda = 'tienda';
RFN.tienda = 'admin_tienda';
N20['juego/tienda'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/tienda'; })) g.items.push(['juego/tienda', 'Tienda', 'store']);
  ROUTES['juego/tienda'] = { t: 'Tienda', ic: 'store', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/tienda'] = {
  que: 'La tienda de la app (solo cosméticos, sin dinero real), la moneda 🪙 Bloques que se gana jugando y los protectores de racha. Aquí enciendes o apagas la tienda, cambias precios y ganancias, fuerzas las ofertas de un día, retiras objetos de la venta, ves cuántos Bloques se emiten y se gastan, y ajustas el saldo de un jugador.',
  ve: 'En el menú, un contador 🪙 y el botón Tienda (con Blokki de vendedor). Dentro: cofre diario, bonus de racha, premio semanal por puesto en el ranking, protector de racha, 4 ofertas del día que rotan a medianoche UTC, paquetes con descuento y el catálogo por categoría. Cada objeto se ve en la escena de partida y se puede estrenar en UNA partida antes de comprarlo. Los que ya tiene salen como «Tuyo».',
  cuando: 'Revisa «Emitidos vs gastados» cada semana: si se emiten muchos más de los que se gastan, sube los precios o baja las ganancias; si nadie compra, al revés. Fuerza ofertas para un evento o una fecha. Apaga la tienda solo en una emergencia.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.2 o más nueva. Las anteriores no tienen tienda ni Bloques.',
    '<b>Reglas que no se pueden cambiar desde aquí:</b> los objetos <b>míticos y legendarios nunca se venden</b> (solo por código, drop o evento), Qué Plan tampoco, y no hay cajas sorpresa: cada objeto se ve y se paga a la vista. Solo se venden comunes, raros y épicos.',
    '<b>El saldo vive en el servidor</b>, ligado al jugador del ranking (id + token), no en el respaldo de la nube ni en el teléfono: no se puede editar desde la app y se recupera con el mismo jugador. Si el jugador borra sus datos, se borra también su cartera.',
    '<b>Cómo se ganan (el servidor decide):</b> el teléfono manda un resumen de partidas (líneas, combos, segundos) en un lote con id único y el servidor lo paga con tus valores, con topes por hora y por día (lo que pasa del tope se recorta) y rechazando lo imposible (más líneas de las que caben en esos segundos). Misiones: una vez por casilla y por día. Cofre diario: una vez al día, premio sorteado por el servidor entre el mínimo y el máximo. Bonus de racha: una vez al día, sale de la racha que el servidor ya conoce. Premio semanal: lo calcula el servidor con el puesto real en el ranking Clásico de la semana pasada (sin sospechosos ni ocultos).',
    '<b>Compras atómicas:</b> en una sola transacción se comprueba el saldo, se anotan los objetos y se descuenta; si algo falla no se cobra nada. Cada compra lleva un id único: reintentar tras un corte no cobra dos veces. Los paquetes llevan descuento fijo y las ofertas del día otro (no se suman).',
    '<b>Precios:</b> los fija la rareza (común, raro, épico). El servidor toma la rareza que declara la app; un teléfono modificado podría mentir (es solo estética). Para retirar un objeto concreto de la venta usa «Retirar de la venta».',
    '<b>Ofertas del día:</b> sin lista forzada, la app sortea 4 objetos vendibles con la semilla del día UTC (iguales para todos, de tipos distintos). Con una lista forzada para un día, esa lista manda ese día (máximo 8; la app enseña hasta 6). Un objeto que la app no conozca se ignora.',
    '<b>Protectores de racha:</b> se compran con Bloques o se ganan (uno gratis cada N días de racha) y se guardan hasta el máximo. Si un día no se juega y hay protector, la racha se salva (un protector por día perdido; si no alcanzan para todos los días perdidos, no se gasta ninguno). El servidor cuenta cada día cubierto una sola vez.',
    '<b>Ajustar saldo:</b> busca al jugador, revisa su cartera y escribe el saldo nuevo. Antes de aplicarlo ves «antes → después» y el servidor solo lo acepta si el saldo no cambió mientras tanto. Queda anotado en sus movimientos como «ajuste».',
    '<b>Cuánto tarda:</b> la app guarda precios y ajustes 30 minutos (1 hora si el servidor aún no tiene tienda), así que un cambio puede tardar en llegar. Apagar la tienda también.',
    H_HORA
  ]
};

var TI = { d: {}, on: null, saving: '', dia: null, pick: null, sel: null, who: null, q: '', qr: null, nuevo: '' };
var TI_GRP = [
  ['precios', 'Precios', 'gift', 'Cuánto cuesta cada rareza y los descuentos.'],
  ['protectores', 'Protectores de racha', 'zap', 'Precio, máximo guardado y cada cuántos días de racha se regala uno.'],
  ['ganar', 'Cómo se ganan los Bloques', 'trend', 'Lo que paga el servidor por línea, combo, partida, misión, cofre y racha.'],
  ['semanal', 'Premio semanal del ranking', 'trophy', 'Bloques por el puesto que se logró en el ranking Clásico de la semana pasada.'],
  ['topes', 'Límites anti-trampas', 'lock', 'Topes de ganancia por partidas y creíble por segundo.']
];
var TI_TIPO = { partida: 'Partidas (líneas, combos)', mision: 'Misiones', cofre: 'Cofre diario', racha: 'Bonus de racha', semanal: 'Premio semanal', ajuste: 'Ajustes tuyos', compra: 'Compras en la tienda', protector: 'Protectores comprados' };
var TI_TIPOS_OK = { 'Tema': 1, 'Estilo de pieza': 1, 'Efecto de línea': 1, 'Marco': 1, 'Título': 1 };
var TI_RAR_OK = { 'Común': 1, 'Raro': 1, 'Épico': 1 };

function tiRows() { var o = rm('tienda'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function tiCfg(r) { var m = {}; (r.config || []).forEach(function (c) { m[c.clave] = c; }); return m; }
function tiDraft(id, srv) { return id in TI.d ? TI.d[id] : (srv == null ? '' : String(srv)); }
function tiInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function tiNom(cid) {
  var p = items('premios').filter(function (x) { return x.cid === cid; })[0];
  return p ? p.nombre + ' · ' + p.tipo : cid;
}
/* objetos del catálogo que podrían estar en la tienda: comunes, raros y épicos de tipos que se venden */
function tiPool() {
  return items('premios').filter(function (x) { return x.cid && TI_TIPOS_OK[x.tipo] && TI_RAR_OK[x.rareza] && x.estado === 'en la app'; })
    .sort(function (a, b) { return String(a.tipo).localeCompare(b.tipo) || String(a.nombre).localeCompare(b.nombre); });
}
I.tiIn = function (el) { TI.d[el.id] = el.value; };
C.tiTog = function (el) { TI.on = el.checked; };

function tiKpis(s) {
  var pt = s.por_tipo || {};
  return '<div class="kpis">' +
    kpi('trend', 'Bloques emitidos', nf(s.emitidos), nf(s.emitidos_24h) + ' en 24 h · ' + nf(s.emitidos_7d) + ' en 7 días') +
    kpi('gift', 'Bloques gastados', nf(s.gastados), nf(s.gastados_24h) + ' en 24 h · ' + nf(s.gastados_7d) + ' en 7 días') +
    kpi('db', 'En circulación', nf(s.saldo_total), 'Suma de los saldos de ' + nf(s.carteras) + ' jugadores') +
    kpi('store', 'Compras', nf(s.compras), nf(s.compras_7d) + ' en 7 días · ' + nf(s.compradores) + ' compradores') +
    kpi('zap', 'Protectores', nf(s.protectores_comprados), nf(s.protectores_usados) + ' usados (' + nf(s.protectores_usados_7d) + ' en 7 días) · ' + nf(s.protectores_guardados) + ' guardados') +
    kpi('live', 'Rachas vivas', nf(s.rachas_vivas), 'Jugadores con racha activa (ranking de rachas)') + '</div>' +
    '<div class="card sec"><div class="ch">' + ic('chart') + '<h3>De dónde salen y a dónde van los Bloques</h3><span class="sub grow">Total desde el inicio</span></div><div class="cb">' +
    (Object.keys(pt).length ? hbars(Object.keys(pt).sort(function (a, b) { return Math.abs(pt[b]) - Math.abs(pt[a]); }).map(function (k) { return { l: esc(TI_TIPO[k] || k) + (pt[k] < 0 ? ' <span class="mut">(gasto)</span>' : ''), v: Math.abs(pt[k]) }; })) : '<p class="mut">Todavía no hay movimientos.</p>') +
    '</div></div>';
}

/* ---- interruptor y valores ---- */
function tiOn(m) { return TI.on != null ? TI.on : (m.tienda_activa ? m.tienda_activa.valor === 1 : true); }
function tiValores(r) {
  var m = tiCfg(r), on = tiOn(m);
  var h = '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Tienda encendida</h3><span class="sub grow">' + (m.tienda_activa && m.tienda_activa.valor === 0 ? 'Apagada: la app no enseña tienda ni Bloques' : 'Encendida') + '</span></div><div class="cb">' +
    '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>Interruptor de la tienda</b><div class="xs mut">Verde «Encendida» = la app enseña el contador, el botón Tienda y cobra Bloques. Gris «Apagada» = desaparece todo y el servidor rechaza compras y cobros. Apagar no borra ningún saldo ni compra. Úsalo solo en una emergencia.</div></div>' +
    tog('ti_activa', on, 'Tienda', { dc: 'tiTog', on: 'Encendida', off: 'Apagada' }) + '</div></div></div>';
  TI_GRP.forEach(function (g) {
    var list = (r.config || []).filter(function (c) { return c.grupo === g[0]; });
    if (!list.length) return;
    h += '<div class="card sec"><div class="ch">' + ic(g[2]) + '<h3>' + esc(g[1]) + '</h3><span class="sub grow">' + esc(g[3]) + '</span></div><div class="cb"><div class="grid g2">';
    list.forEach(function (c) {
      var id = 'ti_' + c.clave;
      h += field(id, c.nota, inp(id, tiDraft(id, c.valor), { type: 'number', mode: 'numeric', min: c.lo, ph: 'De fábrica: ' + nf(c.def), di: 'tiIn' }), 'Entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '. <b>Ahora:</b> ' + nf(c.valor) + (c.valor !== c.def ? ' (de fábrica ' + nf(c.def) + ')' : '') + '.');
    });
    h += '</div></div></div>';
  });
  return h + '<div class="row" style="margin:4px 0 20px"><button class="btn pri" data-a="tiSave"' + (TI.saving ? ' disabled' : '') + '>' + (TI.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptor y valores</button><span class="xs mut">Te enseño «antes → después» antes de guardar. Afecta a las apps 2.2 o más nuevas.</span></div>';
}
A.tiReload = function () { TI.d = {}; TI.on = null; rload('tienda'); toast('Recargando…', 'info'); };
A.tiSave = async function () {
  if (TI.saving) return;
  var r = tiRows(); if (!r) return;
  var m = tiCfg(r), errs = {}, ch = {}, dl = [];
  (r.config || []).forEach(function (c) {
    if (c.clave === 'tienda_activa') return;
    var id = 'ti_' + c.clave, v = tiInt(tiDraft(id, c.valor), c.lo, c.hi);
    if (v == null) { errs[id] = 'Un entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '.'; return; }
    if (v !== c.valor) { ch[c.clave] = v; dl.push([c.nota, nf(c.valor) + ' → <b>' + nf(v) + '</b>']); }
  });
  var on = tiOn(m), was = !m.tienda_activa || m.tienda_activa.valor === 1;
  if (on !== was) { ch.tienda_activa = on ? 1 : 0; dl.unshift(['Tienda', (was ? 'Encendida' : 'Apagada') + ' → <b>' + (on ? 'Encendida' : 'Apagada') + '</b>']); }
  var cmin = ch.ganar_cofre_min != null ? ch.ganar_cofre_min : (m.ganar_cofre_min || {}).valor, cmax = ch.ganar_cofre_max != null ? ch.ganar_cofre_max : (m.ganar_cofre_max || {}).valor;
  if (cmin > cmax) errs.ti_ganar_cofre_min = 'El mínimo del cofre no puede pasar del máximo (' + nf(cmax) + ').';
  if (!showErrs(errs)) return;
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var ok = await confirmDlg({ title: ch.tienda_activa === 0 ? '¿Apagar la tienda?' : '¿Guardar los valores de la tienda?', text: 'Esto afecta a todos los jugadores.', html: cbox(dl.concat([['A quién', 'A todos los jugadores con la app 2.2 o más nueva.'], ['Cuánto tarda', 'La app guarda precios y ajustes unos 30 minutos; los cobros y compras ya usan lo nuevo al instante.']])), ok: ch.tienda_activa === 0 ? 'Apagar' : 'Sí, guardar', danger: ch.tienda_activa === 0, icon: 'sliders' });
  if (!ok) return;
  TI.saving = 'cfg'; paintPage();
  try {
    await rpc('admin_tienda', { p_accion: 'config', p_datos: ch });
    TI.d = {}; TI.on = null; toast('Tienda actualizada');
    await rload('tienda', true);
  } catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  TI.saving = ''; paintPage();
};

/* ---- ofertas del día ---- */
function tiOfertas(r) {
  var dia = TI.dia || r.hoy, pool = tiPool(), pick = TI.pick || [], forz = r.ofertas || [];
  var h = '<div class="card sec"><div class="ch">' + ic('spark') + '<h3>Ofertas del día</h3><span class="sub grow">Hoy (UTC) es ' + esc(fd(r.hoy, true)) + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Sin lista forzada, la app sortea 4 objetos vendibles con la semilla del día (los mismos para todos, de tipos distintos). Si fuerzas una lista para un día, esa manda ese día. Cambia a medianoche UTC (6 pm en México).</p>';
  if (forz.length) {
    h += '<div class="tw" style="margin-bottom:14px"><table class="tbl"><thead><tr><th>Día</th><th>Objetos forzados</th><th></th></tr></thead><tbody>' + forz.map(function (f) {
      return '<tr><td>' + esc(fd(f.dia, true)) + (f.dia === r.hoy ? ' ' + chip('hoy', 'ok') : '') + '</td><td>' + (f.items || []).map(function (i) { return esc(tiNom(i)); }).join(', ') + '</td><td class="num"><button class="btn sm ghost" data-a="tiOfDel" data-d="' + esc(f.dia) + '">' + ic('trash') + 'Quitar</button></td></tr>';
    }).join('') + '</tbody></table></div>';
  } else h += '<p class="mut" style="margin:0 0 12px">Ahora mismo no hay ofertas forzadas: la app sortea las de cada día.</p>';
  h += field('ti_dia', 'Día a forzar (UTC)', inp('ti_dia', dia, { type: 'date', di: 'tiDia' }), 'Del día anterior a 2 días adelante se mandan a la app; fuera de eso se guarda pero no se usa.') +
    '<div class="f"><label>Objetos (hasta 8, la app enseña 6)</label><div class="chips">' + (pool.length ? pool.map(function (p) {
      return '<button type="button" class="fchip" data-a="tiOfPick" data-id="' + esc(p.cid) + '" aria-pressed="' + (pick.indexOf(p.cid) >= 0) + '">' + esc(p.nombre) + ' <span class="n">' + esc(p.tipo) + ' · ' + esc(p.rareza) + '</span></button>';
    }).join('') : '<span class="mut">El catálogo del panel aún no carga.</span>') + '</div><div class="hint">Solo salen objetos comunes, raros y épicos. Si eliges uno que la app no vende (p. ej. por una regla de la app), simplemente se ignora.</div></div>' +
    '<div class="row mt16"><button class="btn pri" data-a="tiOfSave"' + (TI.saving ? ' disabled' : '') + '>' + (TI.saving === 'of' ? '<span class="spin"></span>' : ic('check')) + 'Forzar estas ofertas</button><span class="xs mut">' + pick.length + ' elegidos</span></div></div></div>';
  return h;
}
I.tiDia = function (el) { TI.dia = el.value; };
A.tiOfPick = function (el) {
  var id = el.dataset.id, p = (TI.pick = TI.pick || []), i = p.indexOf(id);
  if (i >= 0) p.splice(i, 1); else if (p.length >= 8) { toast('Máximo 8 objetos', 'warn'); return; } else p.push(id);
  paintPage();
};
A.tiOfSave = async function () {
  if (TI.saving) return;
  var r = tiRows(); if (!r) return;
  var dia = TI.dia || r.hoy, pick = TI.pick || [];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) { showErrs({ ti_dia: 'Elige un día.' }); return; }
  if (!pick.length) { toast('Elige al menos un objeto (o usa «Quitar» en la tabla)', 'warn'); return; }
  var ok = await confirmDlg({ title: '¿Forzar las ofertas de ese día?', text: 'Todos los jugadores verán estas ofertas ese día.', html: cbox([['Día (UTC)', esc(fd(dia, true))], ['Objetos', pick.map(function (i) { return esc(tiNom(i)); }).join(', ')], ['Descuento', 'El de las ofertas del día (ver valores arriba). Solo estos objetos lo reciben ese día.']]), ok: 'Sí, forzar', icon: 'spark' });
  if (!ok) return;
  TI.saving = 'of'; paintPage();
  try {
    await rpc('admin_tienda', { p_accion: 'ofertas', p_datos: { dia: dia, items: pick } });
    TI.pick = null; toast('Ofertas guardadas');
    await rload('tienda', true);
  } catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  TI.saving = ''; paintPage();
};
A.tiOfDel = async function (el) {
  var dia = el.dataset.d;
  if (!await confirmDlg({ title: '¿Quitar las ofertas forzadas?', text: 'Ese día la app volverá a sortear las suyas.', html: cbox([['Día (UTC)', esc(fd(dia, true))]]), ok: 'Quitar', icon: 'trash' })) return;
  try { await rpc('admin_tienda', { p_accion: 'ofertas', p_datos: { dia: dia, items: [] } }); toast('Ofertas forzadas quitadas'); await rload('tienda', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

/* ---- retirar de la venta ---- */
function tiOcultos(r) {
  var oc = r.ocultos || [], pool = tiPool();
  var h = '<div class="card sec"><div class="ch">' + ic('eyeoff') + '<h3>Retirar de la venta</h3><span class="sub grow">' + (oc.length ? nf(oc.length) + ' retirados' : 'Nada retirado') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Un objeto retirado desaparece de la tienda y el servidor no lo vende. Lo que los jugadores ya compraron se queda. Sirve si hay un error en un objeto o una marca lo pide.</p>';
  if (oc.length) h += '<div class="chips" style="margin-bottom:12px">' + oc.map(function (i) { return '<button type="button" class="fchip" data-a="tiShow" data-id="' + esc(i) + '" aria-pressed="true" title="Devolver a la venta">' + esc(tiNom(i)) + ' ' + ic('x') + '</button>'; }).join('') + '</div>';
  h += '<div class="row nw"><div class="grow">' + sel('ti_hide', '', [['', 'Elige un objeto…']].concat(pool.filter(function (p) { return oc.indexOf(p.cid) < 0; }).map(function (p) { return [p.cid, p.nombre + ' · ' + p.tipo + ' · ' + p.rareza]; }))) + '</div><button class="btn" data-a="tiHide">' + ic('eyeoff') + 'Retirar</button></div></div></div>';
  return h;
}
A.tiHide = async function () {
  var s = $('#ti_hide'), id = s && s.value; if (!id) { toast('Elige un objeto', 'warn'); return; }
  if (!await confirmDlg({ title: '¿Retirar de la venta?', text: 'Nadie podrá comprarlo hasta que lo devuelvas.', html: cbox([['Objeto', esc(tiNom(id))]]), ok: 'Retirar', danger: true, icon: 'eyeoff' })) return;
  try { await rpc('admin_tienda', { p_accion: 'ocultar', p_datos: { item: id, ocultar: true } }); toast('Retirado de la venta'); await rload('tienda', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};
A.tiShow = async function (el) {
  var id = el.dataset.id;
  try { await rpc('admin_tienda', { p_accion: 'ocultar', p_datos: { item: id, ocultar: false } }); toast('Devuelto a la venta'); await rload('tienda', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

/* ---- compras más frecuentes ---- */
function tiCompras(s) {
  var t = s.top_compras || [];
  var h = '<div class="card sec"><div class="ch">' + ic('trophy') + '<h3>Lo más comprado</h3><span class="sub grow">Top ' + nf(t.length) + '</span></div>';
  if (!t.length) return h + '<div class="cb"><p class="mut">Todavía no hay compras. Aparecerán aquí cuando los jugadores con la app 2.2 empiecen a comprar.</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Objeto</th><th>Rareza</th><th class="num">Compras</th></tr></thead><tbody>' + t.map(function (x) {
    return '<tr><td>' + esc(tiNom(x.item)) + '<div class="xs mut mono">' + esc(x.item) + '</div></td><td>' + esc({ comun: 'Común', raro: 'Raro', epico: 'Épico' }[x.rareza] || x.rareza) + '</td><td class="num">' + nf(x.n) + '</td></tr>';
  }).join('') + '</tbody></table></div></div>';
}

/* ---- ajustar el saldo de un jugador ---- */
function tiJugador() {
  var h = '<div class="card sec"><div class="ch">' + ic('user') + '<h3>Ajustar el saldo de un jugador</h3><span class="sub grow">Con confirmación «antes → después»</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Busca al jugador por su nombre del ranking. Úsalo para compensar un error o regalar Bloques. Queda anotado en sus movimientos como «ajuste».</p>' +
    searchBox('ti_q', TI.q, 'Buscar por nombre del ranking (2 letras o más)…', 'tiQ') + '<div id="ti_res" class="mt8">' + tiResHtml() + '</div>';
  if (TI.who) {
    var w = TI.who, j = w.jugador || {};
    h += '<div class="mt16"><div class="kpis">' + kpi('user', esc(j.nombre || 'Jugador'), nf(j.saldo), 'Bloques de saldo') + kpi('zap', 'Protectores', nf(j.protectores), 'Guardados') + kpi('live', 'Racha', nf(j.racha), 'Mejor: ' + nf(j.mejor)) + '</div>' +
      '<div class="grid g2 mt16">' + field('ti_nuevo', 'Saldo nuevo', inp('ti_nuevo', TI.nuevo, { type: 'number', mode: 'numeric', min: 0, ph: 'Ahora: ' + nf(j.saldo), di: 'tiNuevo' }), 'Entero de 0 a 10,000,000.') + '</div>' +
      '<div class="row mt16"><button class="btn pri" data-a="tiAjustar"' + (TI.saving ? ' disabled' : '') + '>' + (TI.saving === 'saldo' ? '<span class="spin"></span>' : ic('check')) + 'Revisar y ajustar</button></div>' +
      '<h4 style="margin:18px 0 8px">Últimos movimientos</h4>' + ((w.movs || []).length ? '<div class="tw"><table class="tbl"><thead><tr><th>Cuándo</th><th>Tipo</th><th class="num">Monto</th><th class="num">Saldo</th></tr></thead><tbody>' + w.movs.map(function (m) {
        return '<tr><td>' + esc(fdt(m.creado)) + '</td><td>' + esc(TI_TIPO[m.tipo] || m.tipo) + '</td><td class="num">' + (m.monto > 0 ? '+' : '') + nf(m.monto) + '</td><td class="num">' + nf(m.saldo) + '</td></tr>';
      }).join('') + '</tbody></table></div>' : '<p class="mut">Sin movimientos todavía.</p>') + '</div>';
  }
  return h + '</div></div>';
}
function tiResHtml() {
  if (TI.qr == null) return '';
  return TI.qr.length ? '<div class="pkl" style="border:1px solid var(--border);border-radius:10px">' + TI.qr.map(function (j) {
    return '<button type="button" class="pkr" data-a="tiWho" data-id="' + esc(j.id) + '" aria-pressed="' + (TI.sel === j.id) + '"><span class="t">' + esc(j.nombre) + '<span>' + (j.pais ? esc(j.pais) + ' · ' : '') + 'visto ' + esc(relT(j.visto)) + (j.oculto ? ' · oculto' : '') + '</span></span></button>';
  }).join('') + '</div>' : '<div class="xs mut">Nadie con ese nombre.</div>';
}
I.tiNuevo = function (el) { TI.nuevo = el.value; };
I.tiQ = debounce(function (el) {
  TI.q = el.value; var q = el.value.trim();
  if (q.length < 2) { TI.qr = null; var b = $('#ti_res'); if (b) b.innerHTML = ''; return; }
  var mine = TI.seq = (TI.seq || 0) + 1;
  rpc('admin_buscar_jugadores', { p_q: q }, { nomiss: true }).then(function (r) {
    if (mine !== TI.seq) return; TI.qr = r || []; var b = $('#ti_res'); if (b) b.innerHTML = tiResHtml();
  }, function (e) { if (e.code === 'sin_sql') toast('Falta correr 14-servidor.sql para buscar jugadores', 'warn'); else toast(e.message, 'bad'); });
}, 250);
A.tiWho = async function (el) {
  var id = el.dataset.id; TI.sel = id; TI.nuevo = '';
  try { TI.who = await rpc('admin_tienda', { p_accion: 'saldo_ver', p_datos: { id: id } }); paintPage(); }
  catch (e) { toast('No se pudo abrir la cartera: ' + e.message, 'bad'); }
};
A.tiAjustar = async function () {
  if (TI.saving || !TI.who) return;
  var j = TI.who.jugador || {}, n = tiInt(TI.nuevo, 0, 10000000);
  if (n == null) { showErrs({ ti_nuevo: 'Un entero de 0 a 10,000,000.' }); return; }
  if (n === j.saldo) { toast('Ya tiene ese saldo', 'info'); return; }
  var d = n - j.saldo;
  var ok = await confirmDlg({ title: '¿Ajustar el saldo de ' + (j.nombre || 'este jugador') + '?', text: 'El jugador verá el cambio la próxima vez que abra la tienda.', html: cbox([['Jugador', esc(j.nombre || '') + ' <span class="mut mono">' + esc(String(j.id || '').slice(0, 8)) + '…</span>'], ['Saldo', nf(j.saldo) + ' → <b>' + nf(n) + '</b> (' + (d > 0 ? '+' : '') + nf(d) + ')'], ['Se anota como', 'Movimiento «ajuste» en su cartera.']]), ok: 'Sí, ajustar', danger: d < 0, icon: 'user' });
  if (!ok) return;
  TI.saving = 'saldo'; paintPage();
  try {
    var res = await rpc('admin_tienda', { p_accion: 'saldo_ajustar', p_datos: { id: j.id, antes: j.saldo, nuevo: n } });
    TI.who = res; TI.nuevo = '';
    toast('Saldo ajustado: ' + nf(res.resultado.antes) + ' → ' + nf(res.resultado.despues));
    rload('tienda', true);
  } catch (e) { toast('No se pudo ajustar: ' + e.message, 'bad'); }
  TI.saving = ''; paintPage();
};

function vTienda() {
  var o = rm('tienda');
  var h = pageHead('Tienda y Bloques', 'La tienda de cosméticos de la app, la moneda <b>🪙 Bloques</b> que se gana jugando y los <b>protectores de racha</b>. Solo cosméticos, sin dinero real; los míticos nunca se venden.', '<button class="btn" data-a="tiReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.tienda, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 14-servidor.sql (y de 15, 16 y 17 si ya los corriste).') + '</div>' : rerr(o, 'la tienda'));
  var r = tiRows();
  if (!r) return h + skel(4);
  return h + tiKpis(r.stats || {}) + tiValores(r) + tiOfertas(r) + tiOcultos(r) + tiCompras(r.stats || {}) + tiJugador();
}
VIEWS['juego/tienda'] = vTienda;
