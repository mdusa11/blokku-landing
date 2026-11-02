/* ================= SIN ANUNCIOS en Jugadores y economía (45-sin-anuncios.sql) ================= */
// Compra única blokku_no_ads. Se engancha a 69-economia-jugador.js (JE, jeSec, jeFila, jeUsd…).
//   admin_sin_anuncios({}) → {compradores, compras, reembolsos, usd, solo_app, sin_jugador, pruebas, por_tienda[], lista[], anonimos[]}
//   admin_sin_anuncios({p_id}) → {jugador, cuentas[], compras[], transfers[], app{}|null}
// fuente 'rc' = confirmada por RevenueCat (con precio) · 'app' = «según la app» (sin precio, no es dinero confirmado).
SQLF.sinanuncios = '45-sin-anuncios.sql';
FNF.admin_sin_anuncios = 'sinanuncios';
AYUDA['juego/economia'].como.splice(AYUDA['juego/economia'].como.length - 2, 0,
  '<b>Sin anuncios:</b> quién compró el pago único que quita los anuncios, cuándo, en qué tienda y por cuánto. Sale de los avisos de RevenueCat; «según la app» significa que el teléfono dijo que la tiene pero no hay un pago confirmado (sin precio, no cuenta como dinero). Con el botón «Compraron Sin anuncios» ves la lista completa.',
  '<b>Compras viejas:</b> las hechas antes de la 2.0 no tienen dueño conocido y salen en «Compras sin jugador»; se ligan solas cuando esa persona abre la 2.0 con cuenta. Necesita <span class="mono">45-sin-anuncios.sql</span> en Supabase.');
JE.sa = null; JE.saErr = null; JE.saMap = {}; JE.vista = 'todos'; JE.open.sinads = 1;

var JE_TIENDA = { PLAY_STORE: 'Google Play', APP_STORE: 'App Store' };
var JE_SA_APP = 'Compra anterior al aviso de RevenueCat; el precio exacto está en RevenueCat › Customers';

function jeSaLoad() {
  rpc('admin_sin_anuncios', {}, { nomiss: true }).then(function (r) {
    JE.sa = r || {}; JE.saErr = null; JE.saMap = {};
    (JE.sa.lista || []).forEach(function (x) {
      var ids = (x.cuentas || []).concat([x.jugador]);
      ids.forEach(function (id) { var o = JE.saMap[id]; if (id && (!o || (o.reembolsado && !x.reembolsado))) JE.saMap[id] = x; });
    });
  }, function (e) { JE.saErr = e; }).then(function () { repaint(); });
}
function jeSaTienda(t) { return t ? JE_TIENDA[t] || t : '—'; }
function jeSaPrecio(x) {
  if (x.fuente === 'app' || x.precio == null) return '<span class="mut">—</span>';
  var m = x.moneda || '';
  return '<b>' + esc(Number(x.precio).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) + ' ' + esc(m) + '</b>' +
    (m !== 'USD' && Number(x.precio_usd) > 0 ? '<div class="xs mut">≈ ' + esc(jeUsd(x.precio_usd)) + ' USD</div>' : '');
}
function jeSaChips(x) {
  return (x.reembolsado ? chipN('reembolsado ' + fdt(x.reembolsado, true), 'bad') + ' ' : '') + (x.entorno && x.entorno !== 'PRODUCTION' ? chipN('prueba', 'warn') + ' ' : '') +
    (x.fuente === 'app' ? '<span class="chip line" title="' + esc(JE_SA_APP) + '">según la app</span>' : '');
}
/* insignia junto al nombre en la lista */
function jeSaChip(id) {
  var x = JE.saMap && JE.saMap[id];
  if (!x) return '';
  var h = ' <span class="chip ' + (x.reembolsado ? 'bad' : 'ok') + ' je-sa" title="' + esc(x.fuente === 'app' ? JE_SA_APP : 'Compró Sin anuncios') + '">Sin anuncios' + (x.reembolsado ? ' · reembolsado' : '') + '</span>';
  if (x.entorno && x.entorno !== 'PRODUCTION') h += ' ' + chipN('prueba', 'warn');
  if (x.fuente === 'app') h += ' <span class="chip line" title="' + esc(JE_SA_APP) + '">según la app</span>';
  return h;
}
function jeSaKpi() {
  var s = JE.sa, e = JE.saErr, v, sub;
  if (e) { v = '—'; sub = jeSinSql(e) ? 'Falta correr ' + SQLF.sinanuncios : esc(e.message); }
  else if (!s) { v = '…'; sub = 'Cargando'; }
  else {
    v = nf(s.compradores);
    sub = esc(jeUsd(s.usd)) + ' USD · ' + plural(s.compras, 'compra') + ' · ' + plural(s.reembolsos, 'reembolso') + (s.solo_app > 0 ? ' · ' + nf(s.solo_app) + ' según la app' : '') + (s.sin_jugador > 0 ? ' · ' + nf(s.sin_jugador) + ' sin jugador' : '');
  }
  return kpi('lock', 'Sin anuncios', v, sub);
}
function jeSaSeg() { return '<div class="je-seg">' + seg('jeVista', JE.vista, [['todos', 'Todos'], ['sa', 'Compraron Sin anuncios']]) + '</div>'; }
A.jeVista = function (el) { if (JE.vista === el.dataset.v) return; JE.vista = el.dataset.v; repaint(); };

/* vista filtrada: todos los registros de la lista de Sin anuncios */
function jeSaFiltra() {
  var q = JE.q.trim().toLowerCase();
  return (JE.sa.lista || []).filter(function (x) {
    return !q || String(x.nombre || '').toLowerCase().indexOf(q) >= 0 || String(x.jugador).toLowerCase().indexOf(q) >= 0 || (x.cuentas || []).some(function (c) { return String(c).toLowerCase().indexOf(q) === 0; });
  });
}
function jeSaPais(c) { return c ? jeBandera(c) + esc(c) : '<span class="mut">—</span>'; }
function jeSaFecha(x) { return x.comprado ? '<span title="' + esc(fdt(x.comprado)) + '">' + esc(fdt(x.comprado, true)) + '</span>' : '<span class="mut">—</span>'; }
function jeSaTabla(R) {
  var d = '<div class="tw je-d"><table class="tbl"><thead><tr><th>Jugador</th><th>Fecha</th><th>Tienda</th><th>País de la tienda</th><th class="num">Precio</th><th>Estado</th></tr></thead><tbody>' + R.map(function (x) {
    return '<tr class="clk" data-a="jeOpen" data-id="' + esc(x.jugador) + '" tabindex="0" role="link"><td><b>' + jeBandera(x.pais) + jeNom(x) + '</b><div class="xs faint mono">' + esc(String(x.jugador).slice(0, 8)) + '…</div></td>' +
      '<td>' + jeSaFecha(x) + '</td><td>' + esc(jeSaTienda(x.tienda)) + '</td><td>' + jeSaPais(x.pais_tienda) + '</td><td class="num">' + jeSaPrecio(x) + '</td><td>' + (jeSaChips(x) || chipN('confirmada', 'ok')) + '</td></tr>';
  }).join('') + '</tbody></table></div>';
  var m = '<div class="list je-m">' + R.map(function (x) {
    return '<button type="button" class="li je-li" data-a="jeOpen" data-id="' + esc(x.jugador) + '"><div class="t"><b>' + jeBandera(x.pais) + jeNom(x) + '</b>' +
      '<span>' + esc(fdt(x.comprado, true) || '—') + ' · ' + esc(jeSaTienda(x.tienda)) + (x.pais_tienda ? ' · ' + esc(x.pais_tienda) : '') + '</span>' +
      '<span>' + (x.fuente === 'app' || x.precio == null ? 'sin precio' : esc(Number(x.precio).toFixed(2) + ' ' + (x.moneda || ''))) + '</span><span>' + (jeSaChips(x) || chipN('confirmada', 'ok')) + '</span></div>' + ic('chr') + '</button>';
  }).join('') + '</div>';
  return d + m;
}
function jeSaAnon(A) {
  return '<div class="card sec mt16"><div class="ch">' + ic('user') + '<h3>Compras sin jugador</h3><span class="sub grow">' + plural(A.length, 'compra') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 8px">Son compras anónimas (de la 1.1.x o de quien nunca se registró). Se ligan solas a un jugador cuando ese teléfono abre la 2.0 con cuenta.</p>' +
    '<div class="tw"><table class="tbl"><thead><tr><th>Id de RevenueCat</th><th>Fecha</th><th>Tienda</th><th>País</th><th class="num">Precio</th><th>Estado</th></tr></thead><tbody>' + A.map(function (x) {
      return '<tr><td class="mono xs">' + esc(x.rc_id) + '</td><td>' + jeSaFecha(x) + '</td><td>' + esc(jeSaTienda(x.tienda)) + '</td><td>' + jeSaPais(x.pais_tienda) + '</td><td class="num">' + jeSaPrecio({ fuente: 'rc', precio: x.precio, moneda: x.moneda, precio_usd: x.precio_usd }) +
        '</td><td>' + (jeSaChips({ reembolsado: x.reembolsado, entorno: x.entorno, fuente: 'rc' }) || chipN('confirmada', 'ok')) + '</td></tr>';
    }).join('') + '</tbody></table></div></div></div>';
}
function jeSaVista() {
  var e = JE.saErr, s = JE.sa;
  if (e) return '<div class="mt12">' + (jeSinSql(e) ? emptyBox('db', 'Falta correr ' + SQLF.sinanuncios, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 44-pase-progreso.sql.') : rerr({ err: e }, 'Sin anuncios')) + '</div>';
  if (!s) return '<div class="mt12">' + skel(4) + '</div>';
  var R = jeSaFiltra(), h = '<div class="mt12">';
  h += R.length ? jeSaTabla(R) : emptyBox('lock', JE.q.trim() ? 'Nadie con ese nombre' : 'Todavía no hay compras', JE.q.trim() ? 'Prueba con otra parte del nombre o con el comienzo del id.' : 'Aparecen cuando RevenueCat avisa de una compra o la app la reporta.');
  h += '</div>';
  var pt = s.por_tienda || [];
  if (pt.length) h += '<div class="card sec mt16"><div class="ch">' + ic('store') + '<h3>Por tienda</h3><span class="sub grow">Compras</span></div><div class="cb">' +
    hbars(pt.map(function (x) { return { l: esc(jeSaTienda(x.tienda)) + ' · ' + esc(jeUsd(x.usd)) + ' USD', v: Number(x.compras) }; })) + '</div></div>';
  if ((s.anonimos || []).length) h += jeSaAnon(s.anonimos);
  return h;
}

/* ficha */
function jeSaFicha(f) {
  f.sa = null;
  rpc('admin_sin_anuncios', { p_id: f.id }, { nomiss: true }).then(function (r) { f.sa = { d: r || {} }; }, function (e) { f.sa = { err: e }; }).then(function () { drawerRefresh(); });
}
function jeSaChipFicha(f) {
  var c = f.sa && f.sa.d && f.sa.d.compras || [];
  if (!c.length) return '';
  var x = c.filter(function (y) { return !y.reembolsado; })[0] || c[0];
  return (x.reembolsado ? chipN('Sin anuncios · reembolsado', 'bad') : chipN('Sin anuncios', 'ok')) + (x.fuente === 'app' ? '<span class="chip line" title="' + esc(JE_SA_APP) + '">según la app</span>' : '') + ' ';
}
function jeSaSec(f) {
  var s = f.sa;
  if (!s) return jeSec('sinads', 'Sin anuncios', 1, '<p class="xs mut" style="margin:0">Cargando…</p>', 'store');
  if (s.err) return jeSec('sinads', 'Sin anuncios', 1, '<p class="xs mut" style="margin:0">' + (jeSinSql(s.err) ? 'Falta correr ' + esc(SQLF.sinanuncios) + ' en Supabase.' : 'No se pudo cargar: ' + esc(s.err.message)) + '</p>', 'store');
  var d = s.d, c = d.compras || [], t = d.transfers || [], a = d.app;
  var h = c.map(function (x) {
    var otra = x.cuenta && x.cuenta !== f.id ? '<div class="xs mut">comprada en la cuenta <span class="mono">' + esc(String(x.cuenta).slice(0, 8)) + '…</span></div>' : '';
    return jeFila(esc(x.comprado ? fdt(x.comprado) : 'Fecha desconocida') + ' · ' + esc(jeSaTienda(x.tienda)), (x.pais_tienda ? 'País de la tienda: ' + esc(x.pais_tienda) : '') + otra + '<div class="mt8">' + (jeSaChips(x) || chipN('confirmada', 'ok')) + '</div>', jeSaPrecio(x));
  }).join('');
  if (a) h += jeFila('La app reportó que la tiene', 'Primer aviso ' + esc(fdt(a.primero)) + ' · último ' + esc(fdt(a.visto)) + (a.comprado ? ' · comprada ' + esc(fdt(a.comprado, true)) : '') + (a.tienda ? ' · ' + esc(jeSaTienda(a.tienda)) : ''), '');
  h += t.map(function (x) {
    return jeFila(x.llego ? 'Llegó a esta cuenta' : x.salio ? 'Salió de esta cuenta' : 'Transferencia', esc(fdt(x.recibido)) + ' · ' + esc(jeSaTienda(x.tienda)) + (x.entorno && x.entorno !== 'PRODUCTION' ? ' ' + chipN('prueba', 'warn') : ''), '');
  }).join('');
  return jeSec('sinads', 'Sin anuncios', c.length + t.length + (a ? 1 : 0), h, 'store');
}
