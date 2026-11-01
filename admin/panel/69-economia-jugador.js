/* ================= JUGADORES Y ECONOMÍA (40-panel-economia-jugador.sql) ================= */
// Solo lectura. Por jugador: Bloques, gemas, qué compra y su historial.
//   admin_economia_jugadores(p_orden, p_buscar, p_limite) → [{id, nombre, pais, visto, bloques, ganado, gastado, gemas, gemas_compradas, gemas_gastadas,
//                                                           dinero_usd, pase_premium, compras, actividad}]
//   admin_economia_jugador(p_id) → ficha {bloques{}, gemas{}, dinero_usd, compras_tienda[], gastos_gemas[], compras_dinero[], entregas_paquetes[],
//                                          pase[], canjes[] (códigos ya enmascarados por el servidor), movs_bloques[], movs_gemas[]}
//   admin_economia_resumen() → {bloques_circulacion, gemas_circulacion, top_bloques[], top_gemas[], ingresos{}}
// Se abre una ficha desde otras secciones con #/juego/economia?open=je:<id>.
SQLF.economia = '40-panel-economia-jugador.sql';
FNF.admin_economia_jugadores = 'economia';
FNF.admin_economia_jugador = 'economia';
FNF.admin_economia_resumen = 'economia';
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/economia'; })) {
    var at = -1; g.items.forEach(function (i, n) { if (i[0] === 'juego/ranking') at = n; });
    g.items.splice(at >= 0 ? at + 1 : g.items.length, 0, ['juego/economia', 'Jugadores y economía', 'user']);
  }
  ROUTES['juego/economia'] = { t: 'Jugadores y economía', ic: 'user', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/economia'] = {
  que: 'La lista de jugadores con su dinero del juego: cuántos Bloques y cuántas gemas tiene cada uno, cuánto ha ganado y gastado, qué ha comprado y cuánto dinero real ha puesto. Al tocar a un jugador se abre su ficha con todo su historial. Solo se LEE: aquí no se cambia nada (para ajustar o regalar gemas usa la sección Gemas).',
  ve: 'Nada. Esta pantalla es solo para ti; los jugadores no la ven. Solo salen los jugadores que ya están en el ranking (tienen nombre); quien nunca ha usado el ranking no tiene cartera y no aparece.',
  cuando: 'Cuando un jugador escribe diciendo «no me llegaron mis gemas» o «perdí mis Bloques», para revisar sus movimientos paso a paso; para ver quién gasta más o quién ha pagado; o para vigilar cuántos Bloques y gemas hay en circulación en total.',
  como: [
    '<b>Resumen de arriba:</b> total de Bloques y de gemas que los jugadores tienen sin gastar, los objetos más comprados (con Bloques y con gemas) y los ingresos por compras de gemas.',
    '<b>Lista:</b> ordénala por Bloques, gemas, gastado (Bloques) o dinero (USD) con los botones de arriba o tocando el título de la columna. El buscador acepta parte del nombre o el comienzo del id.',
    '<b>Dinero:</b> suma lo cobrado por compras reales de gemas, sin reembolsos y sin compras de prueba (sandbox). Es el bruto, antes de la comisión de la tienda.',
    '<b>Compras:</b> objetos comprados con Bloques + gastos con gemas + compras con dinero.',
    '<b>Ficha:</b> cada sección se abre y se cierra con un toque. Los últimos 100 movimientos de Bloques y de gemas muestran cuánto cambió el saldo y cuánto quedó después.',
    '<b>Códigos de canje:</b> salen enmascarados (por ejemplo BK-Q2••-••••): sirven para saber que canjeó algo, no para volver a usarlo.',
    '<b>Sin datos:</b> si falta correr <span class="mono">40-panel-economia-jugador.sql</span> en Supabase, la sección te lo dice.',
    H_HORA
  ]
};

var JE = { orden: 'bloques', q: '', rows: null, err: null, loading: false, seq: 0, sum: null, sumErr: null, started: false, f: null, open: { tienda: 1 } };
var JE_ORD = [['bloques', 'Bloques', 'db'], ['gemas', 'Gemas', 'star'], ['gastado', 'Gastado', 'gift'], ['dinero', 'Dinero', 'store']];
var JE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
var JE_BLQ = '#D4A017', JE_GEM = '#4497F5';

function jeSinSql(e) { return e && e.code === 'sin_sql'; }
function jeSqlBox() { return '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.economia, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 39-auditoria-economia.sql.') + '</div>'; }
function jeLoad() {
  var mine = ++JE.seq;
  JE.loading = true;
  rpc('admin_economia_jugadores', { p_orden: JE.orden, p_buscar: JE.q.trim() || null, p_limite: 200 }, { nomiss: true }).then(function (r) {
    if (mine !== JE.seq) return; JE.rows = r || []; JE.err = null;
  }, function (e) { if (mine === JE.seq) JE.err = e; }).then(function () { if (mine === JE.seq) { JE.loading = false; repaint(); } });
}
function jeLoadSum() {
  rpc('admin_economia_resumen', {}, { nomiss: true }).then(function (r) { JE.sum = r || {}; JE.sumErr = null; }, function (e) { JE.sumErr = e; }).then(function () { repaint(); });
}
function jeReload() { JE.rows = null; JE.sum = null; jeLoad(); jeLoadSum(); repaint(); if (JE.f && JE.f.id) jeFicha(JE.f.id, true); }

/* nombre del objeto: catálogo del panel (premios) y, si es un paquete, su nombre */
function jeObj(id) {
  if (!id) return '<span class="mut">—</span>';
  var pr = pc(id) || prem('p-' + id), n = pr && pr.nombre ? pr.nombre : id;
  if (n === id && typeof pgPack === 'function') { var k = pgPack(id); if (k !== id) n = k; }
  return n === id ? '<span class="mono">' + esc(id) + '</span>' : esc(n) + ' <span class="xs faint mono">' + esc(id) + '</span>';
}
function jeUsd(n) { return '$' + Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function jeUsdCel(n) { return Number(n) > 0 ? '<b>' + esc(jeUsd(n)) + '</b>' : '<span class="mut">—</span>'; }
function jeNom(j) { return esc(j.nombre || 'Jugador'); }
function jeBandera(c) { return c && typeof rkFlag === 'function' ? rkFlag(c) + ' ' : ''; }
function jeSigno(n) { return (n > 0 ? '+' : '') + nf(n); }
function jeMonto(n) { return '<b class="je-mt" style="color:var(--' + (n < 0 ? 'bad' : 'ok') + ')">' + jeSigno(n) + '</b>'; }

/* ---------- lista ---------- */
function jeKpis(s) {
  var ing = s.ingresos || {};
  return '<div class="kpis">' +
    kpi('db', 'Bloques en circulación', nf(s.bloques_circulacion), nf(s.con_bloques) + ' jugadores con saldo · ' + nf(s.bloques_ganados) + ' ganados · ' + nf(s.bloques_gastados) + ' gastados') +
    kpi('star', 'Gemas en circulación', nf(s.gemas_circulacion), nf(s.con_gemas) + ' jugadores con saldo · ' + nf(s.gemas_compradas) + ' compradas · ' + nf(s.gemas_gastadas) + ' gastadas' + (s.gemas_deuda ? ' · deuda ' + nf(s.gemas_deuda) : '')) +
    kpi('store', 'Ingresos por gemas', jeUsd(ing.usd) + ' USD', nf(ing.compras) + ' compras de ' + nf(ing.compradores) + ' compradores · ' + nf(ing.reembolsos) + ' reembolsos') +
    kpi('user', 'Pase premium', nf(s.pase_premium), 'Jugadores con el premium de alguna temporada · ' + nf(s.jugadores) + ' jugadores en total') + '</div>';
}
function jeTops(s) {
  var tb = (s.top_bloques || []).map(function (x) { return { l: jeObj(x.item), v: Number(x.compras) }; });
  var tg = (s.top_gemas || []).map(function (x) { return { l: x.que === 'paquete' ? esc(pgPack(x.id)) : x.que === 'pase' ? 'Pase ' + esc(x.id) : jeObj(x.id), v: Number(x.compras) }; });
  var pp = (s.ingresos && s.ingresos.por_producto) || [];
  return '<div class="grid g2">' +
    '<div class="card sec"><div class="ch">' + ic('db') + '<h3>Más comprado con Bloques</h3><span class="sub grow">Veces comprado</span></div><div class="cb">' + (tb.length ? hbars(tb) : '<p class="mut">Todavía no hay compras.</p>') + '</div></div>' +
    '<div class="card sec"><div class="ch">' + ic('star') + '<h3>Más comprado con gemas</h3><span class="sub grow">Veces comprado</span></div><div class="cb">' + (tg.length ? hbars(tg) : '<p class="mut">Todavía no hay compras.</p>') + '</div></div>' +
    '<div class="card sec"><div class="ch">' + ic('store') + '<h3>Ingresos por paquete de gemas</h3><span class="sub grow">USD, sin reembolsos ni pruebas</span></div><div class="cb">' +
    (pp.length ? hbars(pp.map(function (x) { return { l: '<span class="mono">' + esc(x.producto) + '</span> · ' + nf(x.compras) + ' compras', v: Math.round(Number(x.usd) * 100) / 100 }; })) : '<p class="mut">Todavía no hay ventas.</p>') + '</div></div></div>';
}
function jeTh(k, t, num) {
  return '<th class="' + (num ? 'num ' : '') + 'je-th"><button type="button" class="je-sort" data-a="jeOrd" data-v="' + k + '" aria-pressed="' + (JE.orden === k) + '" title="Ordenar por ' + esc(t) + '">' + esc(t) + (JE.orden === k ? ic('chr', 'chev') : '') + '</button></th>';
}
function jeTabla(R) {
  var d = '<div class="tw je-d"><table class="tbl"><thead><tr><th>Jugador</th>' + jeTh('bloques', 'Bloques', 1) + jeTh('gastado', 'Gastado', 1) + jeTh('gemas', 'Gemas', 1) + jeTh('dinero', 'Dinero', 1) +
    '<th class="num">Compras</th><th>Actividad</th></tr></thead><tbody>' + R.map(function (j) {
      return '<tr class="clk" data-a="jeOpen" data-id="' + esc(j.id) + '" tabindex="0" role="link"><td><b>' + jeBandera(j.pais) + jeNom(j) + '</b>' + (j.pase_premium ? ' ' + chipN('pase', 'ok') : '') + '<div class="xs faint mono">' + esc(String(j.id).slice(0, 8)) + '…</div></td>' +
        '<td class="num"><b>' + nf(j.bloques) + '</b><div class="xs mut">ganó ' + nf(j.ganado) + '</div></td><td class="num">' + nf(j.gastado) + '</td>' +
        '<td class="num"><b>' + nf(j.gemas) + '</b><div class="xs mut">compró ' + nf(j.gemas_compradas) + ' · gastó ' + nf(j.gemas_gastadas) + '</div></td>' +
        '<td class="num">' + jeUsdCel(j.dinero_usd) + '</td><td class="num">' + nf(j.compras) + '</td>' +
        '<td class="xs">' + (j.actividad ? '<span title="' + esc(fdt(j.actividad)) + '">' + esc(relT(j.actividad)) + '</span>' : '<span class="mut">—</span>') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  var m = '<div class="list je-m">' + R.map(function (j) {
    return '<button type="button" class="li je-li" data-a="jeOpen" data-id="' + esc(j.id) + '"><div class="t"><b>' + jeBandera(j.pais) + jeNom(j) + '</b>' +
      '<span><span style="color:' + JE_BLQ + '"><b>' + nf(j.bloques) + '</b> Bloques</span> · <span style="color:' + JE_GEM + '"><b>' + nf(j.gemas) + '</b> gemas</span></span>' +
      '<span>' + (Number(j.dinero_usd) > 0 ? esc(jeUsd(j.dinero_usd)) + ' USD · ' : '') + nf(j.compras) + (j.compras === 1 ? ' compra' : ' compras') + (j.pase_premium ? ' · pase' : '') + (j.actividad ? ' · ' + esc(relT(j.actividad)) : '') + '</span></div>' + ic('chr') + '</button>';
  }).join('') + '</div>';
  return d + m;
}
function vEconomia() {
  if (!JE.started) { JE.started = true; jeLoad(); jeLoadSum(); }
  var h = pageHead('Jugadores y economía', 'Cuántos <b>Bloques</b> y <b>gemas</b> tiene cada jugador, qué compra y su historial. Toca a un jugador para ver su ficha completa.',
    '<button class="btn" data-a="jeReload">' + ic('refresh') + 'Actualizar</button>');
  if (jeSinSql(JE.err) || jeSinSql(JE.sumErr)) return h + jeSqlBox();
  var s = JE.sum;
  h += s ? jeKpis(s) + jeTops(s) : (JE.sumErr ? '<div class="card">' + emptyBox('warn', 'No se pudo cargar el resumen', JE.sumErr.message, '<button class="btn" data-a="jeReload">Reintentar</button>') + '</div>' : skel(2));
  h += '<div class="card sec mt16"><div class="ch">' + ic('user') + '<h3>Jugadores</h3><span class="sub grow">' + (JE.rows ? plural(JE.rows.length, 'jugador', 'jugadores') + (JE.rows.length >= 200 ? ' · los primeros 200' : '') : '') + '</span></div><div class="cb">' +
    '<div class="row je-fil">' + searchBox('je_q', JE.q, 'Buscar por nombre o id…', 'jeQ') + '<div class="je-seg">' + seg('jeOrd', JE.orden, JE_ORD) + '</div></div>';
  if (JE.err) h += '<div class="mt12">' + rerr({ err: JE.err }, 'los jugadores') + '</div>';
  else if (JE.rows == null) h += '<div class="mt12">' + skel(4) + '</div>';
  else if (!JE.rows.length) h += emptyBox('user', JE.q.trim() ? 'Nadie con ese nombre' : 'Todavía no hay jugadores', JE.q.trim() ? 'Prueba con otra parte del nombre o con el comienzo del id.' : 'Aparecen cuando alguien se registra en el ranking.');
  else h += '<div class="mt12' + (JE.loading ? ' je-busy' : '') + '">' + jeTabla(JE.rows) + '</div>';
  return h + '</div></div>';
}
VIEWS['juego/economia'] = vEconomia;
I.jeQ = debounce(function (el) { JE.q = el.value; jeLoad(); }, 300);
A.jeOrd = function (el) { if (JE.orden === el.dataset.v) return; JE.orden = el.dataset.v; jeLoad(); repaint(); };
A.jeReload = function () { jeReload(); };

/* ---------- ficha ---------- */
function jeFicha(id, force) {
  var f = JE.f;
  if (!f || f.id !== id || force) f = JE.f = { id: id, d: null, err: null, loading: true };
  else if (f.d || f.loading) return f;
  f.loading = true;
  rpc('admin_economia_jugador', { p_id: id }, { nomiss: true }).then(function (r) { f.d = r; f.err = r ? null : { message: 'Ese jugador no existe' }; }, function (e) { f.err = e; })
    .then(function () { f.loading = false; drawerRefresh(); });
  return f;
}
function jeOpenDr(id) {
  if (!JE_UUID.test(String(id))) { toast('Id de jugador no válido', 'warn'); return; }
  JE.f = null; jeFicha(id);
  drawer({
    wide: true, live: true,
    title: function () { var d = JE.f && JE.f.d; return d ? jeBandera(d.pais) + jeNom(d) : 'Jugador'; },
    sub: function () { var d = JE.f && JE.f.d; return d ? 'Visto ' + esc(relT(d.visto)) + ' · <span class="mono">' + esc(String(d.id).slice(0, 8)) + '…</span>' : ''; },
    onClose: function () { JE.f = null; },
    body: jeFichaHtml,
    foot: function () { return '<span class="sp"></span><button class="btn pri" data-a="drClose">Listo</button>'; }
  });
}
OPENERS.je = function (id) { jeOpenDr(id); };
A.jeOpen = function (el) { jeOpenDr(el.dataset.id); };
A.jeIr = function (el) { var id = el.dataset.id; if (LAY.dr) drawerKill(true); go('juego/economia', { open: 'je:' + id }); };
A.jeSec = function (el) { var k = el.dataset.k; JE.open[k] = !JE.open[k]; drawerRefresh(); };

function jeSec(k, titulo, n, html, icn) {
  var on = !!JE.open[k];
  return '<section class="je-sec' + (on ? ' on' : '') + '"><button type="button" class="je-h" data-a="jeSec" data-k="' + k + '" aria-expanded="' + on + '">' + ic('chr', 'chev') + '<span class="je-ht">' + (icn ? ic(icn) : '') + esc(titulo) + '</span>' +
    '<span class="chip">' + nf(n) + '</span></button>' + (on ? '<div class="je-b">' + (n ? html : '<p class="xs mut" style="margin:0">Nada todavía.</p>') + '</div>' : '') + '</section>';
}
function jeFila(izq, sub, der) {
  return '<div class="je-r"><div class="je-rt">' + izq + (sub ? '<div class="xs mut">' + sub + '</div>' : '') + '</div><div class="je-rd">' + der + '</div></div>';
}
function jeGasto(g) {
  var q = g.que, d;
  if (q === 'articulo') d = jeObj(g.id);
  else if (q === 'paquete') d = 'Paquete mítico: <b>' + esc(pgPack(g.id)) + '</b>';
  else if (q === 'pase') d = 'Pase de temporada <b>' + esc(g.id || '') + '</b>' + (g.plus === 'true' ? ' (premium + niveles)' : ' (premium)');
  else if (q === 'pase_nivel') d = 'Niveles del pase' + (g.niveles ? ': ' + nf(g.niveles) : '');
  else if (q === 'casilla') d = 'Oferta premium del día' + (g.casilla ? ' (' + esc(GM_CAS[g.casilla] || g.casilla) + ')' : '');
  else if (q === 'bloques') d = 'Cambio por Bloques' + (g.bloques ? ': ' + nf(g.bloques) + ' Bloques' : '');
  else if (q === 'protector') d = 'Protector de racha';
  else d = esc(GM_GASTO[q] || q || 'Gasto');
  return d;
}
function jeSecTienda(d) {
  return d.compras_tienda.map(function (c) { return jeFila(jeObj(c.item), esc(fdt(c.creado)) + ' · ' + esc(c.rareza), '<b>' + nf(c.precio) + '</b> <span class="xs mut">Bloques</span>'); }).join('');
}
function jeSecGastos(d) {
  return d.gastos_gemas.map(function (g) { return jeFila(jeGasto(g), esc(fdt(g.creado)), '<b>' + nf(g.gemas) + '</b> <span class="xs mut">gemas</span>'); }).join('');
}
function jeSecDinero(d) {
  var h = d.compras_dinero.map(function (e) {
    var ch = (e.origen === 'panel' ? chipN('regalo del panel', 'line') + ' ' : '') + (e.entorno !== 'PRODUCTION' ? chipN('prueba', 'warn') + ' ' : '') +
      (e.reembolsado ? chipN('reembolsado ' + fdt(e.reembolsado, true), 'bad') + (e.quitadas ? ' <span class="xs mut">quitó ' + nf(e.quitadas) + ' gemas</span>' : '') : '');
    return jeFila('<span class="mono">' + esc(e.producto) + '</span> · ' + nf(e.gemas) + ' gemas', esc(fdt(e.creado)) + (e.nota ? ' · ' + esc(e.nota) : '') + (ch ? '<div class="mt8">' + ch + '</div>' : ''),
      e.origen === 'pago' && Number(e.precio_usd) > 0 ? '<b>' + esc(jeUsd(e.precio_usd)) + '</b> <span class="xs mut">USD</span>' : '<span class="mut">—</span>');
  }).join('');
  h += d.entregas_paquetes.map(function (e) {
    var ch = (e.origen !== 'pago' ? chipN(e.origen === 'panel' ? 'regalo del panel' : e.origen, 'line') + ' ' : '') + (e.entorno !== 'PRODUCTION' ? chipN('prueba', 'warn') + ' ' : '') +
      (e.reembolsado ? chipN('reembolsado', 'bad') + ' ' : '') + (e.revocado ? chipN('revocado', 'bad') : '');
    return jeFila('Paquete <span class="mono">' + esc(e.producto) + '</span>', esc(fdt(e.creado)) + '<div class="je-it">' + (e.items || []).map(function (i) { return jeObj(i); }).join(', ') + '</div>' + (ch ? '<div class="mt8">' + ch + '</div>' : ''), '');
  }).join('');
  return h;
}
function jeSecPase(d) {
  return d.pase.map(function (p) {
    var nv = p.niveles || [];
    return jeFila('Temporada <b>' + esc(p.temporada) + '</b> ' + (p.premium ? chipN(p.plus ? 'premium + niveles' : 'premium', 'ok') : chipN('sin premium', 'line')),
      p.premium ? 'Comprado ' + esc(fdt(p.creado, true)) + ' por ' + nf(p.pagado) + ' gemas' : '',
      '<b>' + nf(nv.length)  + '</b> <span class="xs mut">' + (nv.length === 1 ? 'nivel' : 'niveles') + '</span>') +
      (nv.length ? '<div class="je-niv xs mut">Reclamados: ' + nv.map(function (n) { return nf(n); }).join(', ') + '</div>' : '');
  }).join('');
}
function jeSecCanjes(d) {
  return d.canjes.map(function (k) {
    var it = k.items || [];
    return jeFila('<span class="mono">' + esc(k.codigo || (k.hash_mask ? 'sticker ' + k.hash_mask : 'código')) + '</span>', esc(fdt(k.creado)) + (k.plataforma ? ' · ' + esc(k.plataforma) : '') +
      (it.length ? '<div class="je-it">' + it.map(function (i) { return jeObj(i); }).join(', ') + '</div>' : ''), '');
  }).join('');
}
function jeSecMovB(d) {
  return d.movs_bloques.map(function (m) { return jeFila(esc(TI_TIPO[m.tipo] || m.tipo), esc(fdt(m.creado)), jeMonto(m.monto) + '<div class="xs mut">queda ' + nf(m.saldo) + '</div>'); }).join('');
}
function jeSecMovG(d) {
  return d.movs_gemas.map(function (m) {
    var t = GM_TIPO[m.tipo] || [m.tipo, ''];
    var que = m.tipo === 'gasto' ? jeGasto({ que: m.que, id: m.id }) : m.producto ? '<span class="mono">' + esc(m.producto) + '</span>' : '';
    return jeFila(chip(t[0], t[1]) + (que ? ' ' + que : ''), esc(fdt(m.creado)), jeMonto(m.monto) + '<div class="xs mut">queda ' + nf(m.saldo) + '</div>');
  }).join('');
}
function jeFichaHtml() {
  var f = JE.f;
  if (!f || f.loading) return skel(4);
  if (f.err) {
    return jeSinSql(f.err) ? emptyBox('db', 'Falta correr ' + SQLF.economia, 'Está en Escritorio › Blokku › 02-Documentos › Supabase.') :
      emptyBox('warn', 'No se pudo abrir la ficha', f.err.message, '<button class="btn" data-a="jeFichaRe" data-id="' + esc(f.id) + '">Reintentar</button>');
  }
  var d = f.d, b = d.bloques || {}, g = d.gemas || {};
  d.compras_tienda = d.compras_tienda || []; d.gastos_gemas = d.gastos_gemas || []; d.compras_dinero = d.compras_dinero || []; d.entregas_paquetes = d.entregas_paquetes || [];
  d.pase = d.pase || []; d.canjes = d.canjes || []; d.movs_bloques = d.movs_bloques || []; d.movs_gemas = d.movs_gemas || [];
  var P = typeof rkPlat === 'function' ? rkPlat(d.plataforma) : null;
  var h = '<div class="row">' + (d.oculto ? chipN('oculto del ranking', 'line') : '') + (P ? chipN(P.n, 'line') : '') + (d.modelo ? chipN(d.modelo, 'line') : '') + (d.version_app ? chipN('v' + d.version_app, 'line') : '') +
    '<span class="xs mut">Se registró ' + esc(fdt(d.creado, true)) + '</span></div>' +
    '<div class="kpis mt12">' +
    kpi('db', 'Bloques', nf(b.saldo), 'Ganó ' + nf(b.ganado) + ' · gastó ' + nf(b.gastado) + (b.protectores ? ' · ' + nf(b.protectores) + (b.protectores === 1 ? ' protector' : ' protectores') : '')) +
    kpi('star', 'Gemas', nf(g.saldo), 'Compró ' + nf(g.compradas) + ' · gastó ' + nf(g.gastadas) + (g.deuda ? ' · deuda ' + nf(g.deuda) : '')) +
    kpi('store', 'Dinero real', jeUsd(d.dinero_usd) + ' USD', 'Compras de gemas sin reembolsos ni pruebas') +
    kpi('trend', 'Racha', nf(b.racha) + (b.racha === 1 ? ' día' : ' días'), 'Su mejor: ' + nf(b.mejor_racha)) + '</div>';
  h += '<div class="je-secs mt16">' +
    jeSec('tienda', 'Compras con Bloques', d.compras_tienda.length, jeSecTienda(d), 'db') +
    jeSec('gastos', 'Gastos con gemas', d.gastos_gemas.length, jeSecGastos(d), 'star') +
    jeSec('dinero', 'Compras con dinero', d.compras_dinero.length + d.entregas_paquetes.length, jeSecDinero(d), 'store') +
    jeSec('pase', 'Pase de temporada', d.pase.length, jeSecPase(d), 'trophy') +
    jeSec('canjes', 'Códigos canjeados', d.canjes.length, jeSecCanjes(d), 'ticket') +
    jeSec('movb', 'Movimientos de Bloques', d.movs_bloques.length, jeSecMovB(d), 'history') +
    jeSec('movg', 'Movimientos de gemas', d.movs_gemas.length, jeSecMovG(d), 'history') + '</div>' +
    '<p class="xs mut mt12">Compras y gastos: hasta 200; dinero y códigos: hasta 100; movimientos: los últimos 100. Los códigos salen enmascarados.</p>';
  return h;
}
A.jeFichaRe = function (el) { jeFicha(el.dataset.id, true); drawerRefresh(); };
