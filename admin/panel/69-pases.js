/* ================= PASES DE BATALLA: LÍNEA DEL TIEMPO Y COMPARATIVA (solo lectura) ================= */
// Contenido de cada nivel: admin/panel/datos-temporadas.js (var TPD), generado con scripts/gen-temporadas.mjs
// desde lib/pase/*.json de la app. Fechas y gemas: admin_solo_gemas; Bloques y protectores: admin_pase_bloques
// (los mismos datos que usa «Solo gemas › Pase»). Si el servidor difiere del JSON, la casilla se marca.
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/pases'; })) {
    var at = -1; g.items.forEach(function (i, n) { if (i[0] === 'juego/temporadas') at = n; });
    g.items.splice(at >= 0 ? at + 1 : g.items.length, 0, ['juego/pases', 'Pases de batalla', 'layers']);
  }
  ROUTES['juego/pases'] = { t: 'Pases de batalla', ic: 'layers', g: g ? g.g : 'Juego', k: 'juego' };
})();
N20['juego/pases'] = 1;
AYUDA['juego/pases'] = {
  que: 'Los pases de batalla (temporadas) uno junto al otro: una línea del tiempo con las fechas de cada temporada y, nivel por nivel, qué trae el carril gratis y el premium (cosméticos con su rareza, Bloques, cofres, protectores y gemas), con totales para comparar una temporada contra otra.',
  ve: 'Es lo que el jugador ve en la pantalla del Pase de la app 2.0: la temporada en curso, sus 30 niveles y lo que gana en cada uno. Aquí no se cambia nada, solo se mira.',
  cuando: 'Antes de diseñar o ajustar una temporada nueva (para que no sea más pobre ni más rica que la anterior), al revisar si el premium vale lo que cuesta, o para ver cuántos días faltan para que empiece o termine un pase.',
  como: [
    '<b>De dónde salen los datos:</b> los premios de cada nivel vienen de la app (archivos lib/pase/temporada_N.json) y se copian a este panel con <span class="mono">node scripts/gen-temporadas.mjs</span>; hay que correrlo (y volver a compilar el panel) cada vez que cambie una temporada de la app. Las <b>fechas, las gemas por nivel, los Bloques y los protectores</b> se leen en vivo del servidor, así que coinciden con lo que de verdad paga.',
    '<b>Casilla marcada «Servidor»:</b> el servidor paga un valor distinto al del JSON de la app (por ejemplo corregiste los Bloques de un nivel en «Solo gemas › Pase»). El jugador recibe el del servidor, aunque la casilla de la app enseñe el suyo.',
    '<b>Exclusivo</b> = solo se gana en ese pase (no se vende ni sale por código). <b>Paquete mítico</b> (estrella) = el paquete completo de 6 piezas.',
    '<b>Valor aproximado en Bloques:</b> Bloques que da + cosméticos comunes (3,000), raros (9,000) y épicos (24,000) al precio de la tienda. Los legendarios y míticos no se venden con Bloques, así que no suman. Es una guía para comparar, no un precio real.',
    '<b>Cuánto regresa el premium:</b> las gemas del carril premium contra el precio del pase en gemas; si se cambiara todo el valor en Bloques por gemas al tipo de cambio de la tienda, se suma también.',
    '<b>Para editar</b> gemas, Bloques o fechas usa el botón «Editar en Solo gemas › Pase» de cada temporada.',
    '<b>Cómo va la gente:</b> por temporada, quién compró el premium, qué tan avanzado va cada jugador (gratis y premium), cuántos ya lo completaron y qué tan difícil se le está haciendo a la gente. <b>El nivel lo reporta el teléfono del jugador</b> (cuando sube de nivel, abre el pase o cierra la temporada, máximo una vez por minuto): es <b>estadística, no dinero</b>. No paga ni abre nada, y un teléfono modificado podría mandar un nivel falso; lo que se cobra (gemas y Bloques) lo valida siempre el servidor aparte.',
    '<b>Compradores</b> y <b>gemas del pase</b> sí salen de las compras reales del servidor (premium comprado con gemas). <b>Activos</b> = reportaron su nivel en los últimos 7 días. <b>Completado</b> = llegó al último nivel. <b>Medianas de días</b> = días desde que empezó la temporada hasta que el jugador reportó por primera vez el nivel 10, 20 y 30.',
    '<b>Indicador de dificultad:</b> compara el nivel de la mediana de los jugadores con el nivel esperado hoy (niveles de la temporada × días transcurridos ÷ duración; es decir, llegar al último nivel justo al terminar). Menos de 75 % de lo esperado = va lento (baja XP por nivel o da más XP por misión); entre 75 % y 125 % = va bien. Con menos de 5 jugadores reportando no se juzga.',
    '<b>Si dice que falta el SQL:</b> hay que correr <span class="mono">44-pase-progreso.sql</span> en Supabase (Escritorio › Blokku › 02-Documentos › Supabase). Mientras no se corra, la app 2.0 no puede reportar y esta sección queda vacía.',
    H_HORA
  ]
};

ICP.tpgem = 'M6 4h12l4 6-10 11L2 10zM2 10h20M9 4l-2 6 5 11 5-11-2-6';
ICP.tpcofre = 'M4 10h16v10H4zM3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v4H3zM12 10v4';
ICP.tpescudo = 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z';
ICP.tpblq = 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z';

SQLF.pase_stats = '44-pase-progreso.sql';
var TP = { c: 'ambos', t: 'todas' };
var TP_RAR = { common: ['Común', '#8a94a6'], rare: ['Raro', '#3b82f6'], epic: ['Épico', '#a855f7'], legendary: ['Legendario', '#f59e0b'], mythic: ['Mítico', '#ec4899'] };
var TP_PLU = { common: 'Comunes', rare: 'Raros', epic: 'Épicos', legendary: 'Legendarios', mythic: 'Míticos' };
var TP_RAR_ORD = ['common', 'rare', 'epic', 'legendary', 'mythic'];
var TP_PRECIO = { common: 3000, rare: 9000, epic: 24000 };
var TP_KIND = { theme: ['Tema', 'image'], pieceStyle: ['Piezas', 'grid'], lineEffect: ['Efecto', 'spark'], frame: ['Marco', 'board'], badge: ['Insignia', 'star'], title: ['Título', 'hash'], nameColor: ['Color de nombre', 'edit'], costume: ['Disfraz', 'user'], placeSound: ['Sonido', 'mega'], streakIcon: ['Ícono de racha', 'zap'] };
var TP_GEM = '#4497F5', TP_BLQ = '#D4A017';

function tpData() { return typeof TPD !== 'undefined' && TPD && TPD.temporadas ? TPD : null; }
function tpCos(id) { var d = tpData(); return (d && d.cosm[id]) || { n: id, k: '?', r: 'common' }; }
function tpSG() { return typeof sgRows === 'function' ? sgRows() : null; }
function tpPB() { return typeof sgPbRows === 'function' ? sgPbRows() : null; }
function tpSrvT(id) { var r = tpSG(); return r ? (r.temporadas || []).filter(function (t) { return t.id === id; })[0] || null : null; }
function tpPbT(id) { var r = tpPB(); return r ? (r.temporadas || []).filter(function (t) { return t.id === id; })[0] || null : null; }
function tpCfg(k) { var r = tpSG(), c = r && (r.config || []).filter(function (x) { return x.clave === k; })[0]; return c ? Number(c.valor) : null; }
function tpPrecio(rar) {
  var r = tpSG(), c = r && (r.tienda || []).filter(function (x) { return x.clave === 'precio_' + ({ common: 'comun', rare: 'raro', epic: 'epico' }[rar]); })[0];
  return c && c.valor > 0 ? Number(c.valor) : TP_PRECIO[rar] || 0;
}
function tpAhora() { var r = tpSG(), t = r && r.ahora ? new Date(r.ahora).getTime() : NaN; return isNaN(t) ? Date.now() : t; }
function tpMs(v) { return new Date(v).getTime(); }
function tpDias(ms) { return Math.round(ms / 864e5); }
function tpFin(v) { return fdt(new Date(tpMs(v) - 6e4).toISOString(), true); }
function tpEstado(t, ahora) { return ahora < tpMs(t.inicio) ? 'próxima' : ahora < tpMs(t.fin) ? 'en curso' : 'terminada'; }
function tpRelativo(t, ahora) {
  var e = tpEstado(t, ahora), d;
  if (e === 'próxima') { d = Math.ceil((tpMs(t.inicio) - ahora) / 864e5); return d <= 1 ? 'empieza mañana' : 'empieza en ' + nf(d) + ' días'; }
  if (e === 'en curso') { d = Math.ceil((tpMs(t.fin) - ahora) / 864e5); return d <= 1 ? 'termina hoy o mañana' : 'quedan ' + nf(d) + ' días'; }
  d = Math.floor((ahora - tpMs(t.fin)) / 864e5); return d < 1 ? 'terminó hoy' : 'terminó hace ' + nf(d) + ' día' + (d === 1 ? '' : 's');
}
function tpEstChip(e) { return e === 'en curso' ? chip('en curso', 'ok') : e === 'próxima' ? chip('próxima', 'info') : chip('terminada', 'line'); }

/* ---------- temporadas combinadas: contenido de la app + servidor ---------- */
// {id, numero, nombre, inicio, fin, jsonIni, jsonFin, srv, d (contenido o null)}
function tpTemps() {
  var d = tpData(), r = tpSG(), out = {}, lst = [];
  ((d && d.temporadas) || []).forEach(function (t) { out[t.id] = { id: t.id, numero: t.numero, nombre: t.nombre.es, lema: t.lema.es, inicio: t.inicio, fin: t.fin, jsonIni: t.inicio, jsonFin: t.fin, d: t, srv: null }; });
  if (r) (r.temporadas || []).forEach(function (s) {
    var o = out[s.id] || (out[s.id] = { id: s.id, numero: Number((/\d+/.exec(s.id) || [0])[0]) || 0, nombre: s.id, lema: '', d: null });
    o.srv = s; o.inicio = s.inicio; o.fin = s.fin; o.niveles = s.niveles;
  });
  Object.keys(out).forEach(function (k) { lst.push(out[k]); });
  lst.sort(function (a, b) { return tpMs(a.inicio) - tpMs(b.inicio); });
  lst.forEach(function (t) {
    t.etq = t.d && t.numero ? 'T' + t.numero : t.id;
    t.fechasDist = !!(t.srv && t.jsonIni && (Math.abs(tpMs(t.srv.inicio) - tpMs(t.jsonIni)) > 6e4 || Math.abs(tpMs(t.srv.fin) - tpMs(t.jsonFin)) > 6e4));
    t.sinServidor = !!(r && !t.srv);
  });
  return lst;
}

/* ---------- premios de una casilla ---------- */
// Premios del servidor: bloques (con cofre), protectores y gemas del carril.
function tpEsperado(items) {
  var b = 0, p = 0, g = 0;
  items.forEach(function (i) { if (i.t === 'b' || i.t === 'f') b += i.n; else if (i.t === 'p') p += i.n; else if (i.t === 'g') g += i.n; });
  return { b: b, p: p, g: g };
}
// Compara con el servidor; devuelve null si coincide o no hay datos.
function tpDifSrv(t, n, lane, items) {
  var pb = tpPbT(t.id), out = {}, any = false, e = tpEsperado(items);
  if (pb) {
    var x = ((pb.cajas || {})[String(n)] || {})[lane === 'g' ? 'gratis' : 'premium'] || {};
    var sb = Number(x.bloques) || 0, sp = Number(x.protectores) || 0;
    if (sb !== e.b) { out.b = sb; any = true; }
    if (sp !== e.p) { out.p = sp; any = true; }
  }
  if (t.srv && lane === 'p') {
    var sg = Number((t.srv.gemas || {})[String(n)]) || 0;
    if (e.g && sg !== e.g) { out.g = sg; any = true; }
  }
  return any ? out : null;
}
function tpGemasSrv(t, n) { return t.srv ? Number((t.srv.gemas || {})[String(n)]) || 0 : 0; }
function tpItems(t, lvl, lane) {
  var items = (lane === 'g' ? lvl.g : lvl.p).slice();
  if (lane === 'p' && t.srv && !items.some(function (i) { return i.t === 'g'; })) { var gm = tpGemasSrv(t, lvl.n); if (gm > 0) items.push({ t: 'g', n: gm, srv: 1 }); }
  return items;
}

/* ---------- totales ---------- */
function tpLane(t, lane) {
  var s = { b: 0, f: 0, p: 0, g: 0, cos: 0, rar: { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 }, ex: 0, paq: 0, val: 0, valCos: 0, sinPrecio: 0 };
  ((t.d && t.d.niveles) || []).forEach(function (l) {
    tpItems(t, l, lane).forEach(function (i) {
      if (i.t === 'b') s.b += i.n; else if (i.t === 'f') s.f += i.n; else if (i.t === 'p') s.p += i.n; else if (i.t === 'g') s.g += i.n;
      else (i.ids || []).forEach(function (id) {
        var c = tpCos(id); s.cos++; s.rar[c.r] = (s.rar[c.r] || 0) + 1; if (c.x) s.ex++;
        if (TP_PRECIO[c.r]) s.valCos += tpPrecio(c.r); else s.sinPrecio++;
      });
      if (i.paquete) s.paq++;
    });
  });
  s.val = s.b + s.f + s.valCos;
  return s;
}
function tpSum(a, b) {
  var o = { b: a.b + b.b, f: a.f + b.f, p: a.p + b.p, g: a.g + b.g, cos: a.cos + b.cos, ex: a.ex + b.ex, paq: a.paq + b.paq, val: a.val + b.val, valCos: a.valCos + b.valCos, sinPrecio: a.sinPrecio + b.sinPrecio, rar: {} };
  TP_RAR_ORD.forEach(function (r) { o.rar[r] = (a.rar[r] || 0) + (b.rar[r] || 0); });
  return o;
}
function tpStats(t) { var g = tpLane(t, 'g'), p = tpLane(t, 'p'); return { g: g, p: p, all: tpSum(g, p) }; }
function tpSel(st) { return TP.c === 'g' ? st.g : TP.c === 'p' ? st.p : st.all; }

/* ---------- línea del tiempo ---------- */
function tpTimeline(ts, ahora) {
  var h = '<div class="card sec"><div class="ch">' + ic('cal') + '<h3>Línea del tiempo</h3><span class="sub grow">Fechas del servidor (hora de México) · hoy ' + esc(fdt(new Date(ahora).toISOString(), true)) + '</span></div><div class="cb">';
  if (!ts.length) return h + '<p class="mut">No hay temporadas.</p></div></div>';
  var min = Math.min(ahora, tpMs(ts[0].inicio)) - 6 * 864e5, max = Math.max.apply(null, ts.map(function (t) { return tpMs(t.fin); })) + 8 * 864e5;
  if (ahora > max) max = ahora + 8 * 864e5;
  var span = max - min, pc = function (ms) { return Math.max(0, Math.min(100, 100 * (ms - min) / span)); };
  var bars = '', gaps = '', ticks = '', d0 = new Date(min), m = new Date(Date.UTC(d0.getUTCFullYear(), d0.getUTCMonth() + 1, 1, 6));
  for (; m.getTime() < max; m = new Date(Date.UTC(m.getUTCFullYear(), m.getUTCMonth() + 1, 1, 6))) {
    var p = pc(m.getTime());
    ticks += '<div class="tp-tk" style="left:' + p.toFixed(2) + '%"><span>' + esc(MES[m.getUTCMonth()].slice(0, 3)) + (m.getUTCMonth() === 0 ? ' ' + m.getUTCFullYear() : '') + '</span></div>';
  }
  var prevEnd = null, lanes = [];
  ts.forEach(function (t, i) {
    var a = tpMs(t.inicio), b = tpMs(t.fin), e = tpEstado(t, ahora), lbl = t.etq + ' · ' + t.nombre;
    var ln = 0; while (lanes[ln] != null && lanes[ln] > a) ln++; lanes[ln] = b;
    bars += '<div class="tp-bar ' + (e === 'en curso' ? 'on' : e === 'terminada' ? 'off' : '') + ' c' + (i % 2) + '" style="top:' + (6 + ln * 52) + 'px;left:' + pc(a).toFixed(2) + '%;width:' + (pc(b) - pc(a)).toFixed(2) + '%" title="' + esc(lbl + ': ' + fdt(t.inicio, true) + ' → ' + tpFin(t.fin) + ' (' + e + ')') + '"><b>' + esc(t.etq) + '</b><span>' + esc(t.nombre) + '</span></div>';
    var from = prevEnd == null ? (ahora < a ? ahora : null) : prevEnd;
    if (from != null && a - from > 36e5) {
      var dd = tpDias(a - from);
      gaps += '<div class="tp-gap" style="left:' + pc(from).toFixed(2) + '%;width:' + (pc(a) - pc(from)).toFixed(2) + '%" title="' + esc((prevEnd == null ? 'Faltan ' : 'Hueco de ') + nf(dd) + ' días' + (prevEnd == null ? ' para ' + t.etq : ' sin pase')) + '"><span>' + (prevEnd == null ? 'faltan ' : 'hueco ') + nf(dd) + ' d</span></div>';
    }
    prevEnd = Math.max(prevEnd || 0, b);
  });
  var hoy = '<div class="tp-hoy" style="left:' + pc(ahora).toFixed(2) + '%"><span>Hoy</span></div>';
  h += '<div class="tp-tl" role="img" aria-label="Línea del tiempo de las temporadas"><div class="tp-ax">' + ticks + '</div><div class="tp-tr" style="height:' + (14 + Math.max(1, lanes.length) * 52) + 'px">' + gaps + bars + hoy + '</div></div>';
  h += '<div class="tp-tcs">' + ts.map(function (t) { return tpTCard(t, ahora); }).join('') + '</div>';
  return h + '</div></div>';
}
function tpTCard(t, ahora) {
  var e = tpEstado(t, ahora), dias = tpDias(tpMs(t.fin) - tpMs(t.inicio));
  var avisos = '';
  if (t.srv && !t.srv.activa) avisos += chip('apagada en el servidor', 'warn');
  if (t.fechasDist) avisos += chip('fechas distintas a las de la app', 'warn');
  if (t.sinServidor) avisos += chip('no está en el servidor', 'bad');
  if (!t.d) avisos += chip('sin contenido en el panel', 'bad');
  var dif = tpNDif(t);
  if (dif) avisos += chip(nf(dif) + ' casilla' + (dif === 1 ? '' : 's') + ' distinta' + (dif === 1 ? '' : 's') + ' al servidor', 'warn');
  return '<div class="tp-tc"><div class="row nw" style="gap:8px;align-items:center;flex-wrap:wrap"><span class="tp-id">' + esc(t.etq) + '</span><b class="grow">' + esc(t.nombre) + '</b>' + tpEstChip(e) + '</div>' +
    (t.lema ? '<div class="xs mut" style="margin-top:2px">' + esc(t.lema) + '</div>' : '') +
    '<div class="sm" style="margin-top:8px"><b>' + esc(fdt(t.inicio, true)) + '</b> → <b>' + esc(tpFin(t.fin)) + '</b></div>' +
    '<div class="xs mut">' + esc(tpRelativo(t, ahora)) + ' · dura ' + nf(dias) + ' días · ' + nf(t.niveles || (t.d && t.d.niveles.length) || 0) + ' niveles</div>' +
    (avisos ? '<div class="chips" style="margin-top:8px">' + avisos + '</div>' : '') +
    '<div style="margin-top:10px"><button class="btn sm" data-a="tpEdit" data-id="' + esc(t.id) + '">' + ic('edit') + 'Editar en Solo gemas › Pase</button></div></div>';
}
A.tpEdit = function (el) {
  if (typeof SG !== 'undefined') { SG.tab = 'pase'; SG.tsel = el.dataset.id; SG.pbsel = el.dataset.id; }
  go('juego/solo-gemas');
};
A.tpCarril = function (el) { TP.c = el.dataset.v; paintPage(); };
A.tpVer = function (el) { TP.t = el.dataset.v; paintPage(); };
A.tpReload = function () { rload('solo_gemas'); rload('pase_bloques'); TPS.d = {}; TPS.j = {}; toast('Recargando…', 'info'); repaint(); };

/* ---------- casillas ---------- */
function tpDifTxt(d) {
  var p = [];
  if (d.b != null) p.push(nf(d.b) + ' Bloques'); if (d.p != null) p.push(nf(d.p) + ' prot.'); if (d.g != null) p.push(nf(d.g) + ' gemas');
  return p.join(' · ');
}
function tpNDif(t) {
  var n = 0; if (!t.d || (!tpPbT(t.id) && !t.srv)) return 0;
  t.d.niveles.forEach(function (l) { ['g', 'p'].forEach(function (c) { if (tpDifSrv(t, l.n, c, tpItems(t, l, c))) n++; }); });
  return n;
}
function tpRow(icn, color, main, sub, rc, extra) {
  return '<div class="tp-it" style="--rc:' + rc + '"><span class="tp-ic"' + (color ? ' style="color:' + color + '"' : '') + '>' + ic(icn) + '</span><span class="tp-tx"><span class="tp-nm">' + main + '</span>' + (sub ? '<span class="tp-sub">' + sub + '</span>' : '') + '</span>' + (extra || '') + '</div>';
}
function tpItem(i) {
  if (i.t === 'b') return tpRow('tpblq', TP_BLQ, nf(i.n) + ' Bloques', '', TP_RAR.common[1]);
  if (i.t === 'f') return tpRow('tpcofre', TP_BLQ, 'Cofre', 'hasta ' + nf(i.n) + ' Bloques', TP_RAR[i.n >= 4000 ? 'epic' : 'rare'][1]);
  if (i.t === 'p') return tpRow('tpescudo', '', nf(i.n) + ' protector' + (i.n === 1 ? '' : 'es') + ' de racha', '', TP_RAR.rare[1]);
  if (i.t === 'g') return tpRow('tpgem', TP_GEM, nf(i.n) + ' gemas', i.srv ? 'las paga el servidor' : '', TP_RAR.epic[1]);
  if (i.paquete) {
    var cs = i.ids.map(tpCos), tema = cs.filter(function (c) { return c.k === 'theme'; })[0], nom = tema ? tema.n : i.paquete;
    var ex = cs.some(function (c) { return c.x; });
    return tpRow('star', '#f59e0b', 'Paquete mítico «' + esc(nom) + '»', nf(i.ids.length) + ' piezas: ' + esc(cs.map(function (c) { return c.n; }).join(' · ')), TP_RAR.mythic[1], '<span class="tp-ch">' + chip('paquete', 'warn') + (ex ? chip('EXCLUSIVO', 'ac') : '') + '</span>');
  }
  return i.ids.map(function (id) {
    var c = tpCos(id), k = TP_KIND[c.k] || ['?', 'gift'], r = TP_RAR[c.r] || TP_RAR.common;
    return tpRow(k[1], r[1], esc(c.n), esc(k[0]) + ' · <span style="color:' + r[1] + '">' + r[0] + '</span>', r[1], c.x ? '<span class="tp-ch">' + chip('EXCLUSIVO', 'ac') + '</span>' : '');
  }).join('');
}
function tpLaneCell(t, lvl, lane) {
  var items = tpItems(t, lvl, lane), dif = tpDifSrv(t, lvl.n, lane, items);
  var h = '<div class="tp-ln ' + (lane === 'p' ? 'tp-lp' : 'tp-lg') + '"><span class="tp-lb">' + (lane === 'p' ? 'Premium' : 'Gratis') + '</span>' + (items.length ? items.map(tpItem).join('') : '<span class="xs mut">—</span>');
  if (dif) h += '<div class="tp-dif" title="El servidor paga distinto a lo que trae la app (JSON)">' + chip('Servidor', 'warn', 'warn') + ' paga ' + esc(tpDifTxt(dif)) + '</div>';
  return h + '</div>';
}

/* ---------- comparativa nivel por nivel ---------- */
function tpFiltros(ts) {
  var ct = ts.filter(function (t) { return t.d; });
  var opts = [['todas', 'Ambas']].concat(ct.map(function (t) { return [t.id, t.etq]; }));
  return '<div class="row sec" style="flex-wrap:wrap;gap:12px"><div class="tp-fl"><span class="xs mut">Carril</span>' + seg('tpCarril', TP.c, [['ambos', 'Ambos'], ['p', 'Solo premium'], ['g', 'Solo gratis']]) + '</div>' +
    '<div class="tp-fl"><span class="xs mut">Comparar</span>' + seg('tpVer', TP.t, opts) + '</div></div>';
}
function tpComparativa(ts) {
  var ct = ts.filter(function (t) { return t.d; });
  var vis = TP.t === 'todas' ? ct : ct.filter(function (t) { return t.id === TP.t; });
  if (!vis.length) vis = ct;
  var h = '<div class="card sec"><div class="ch">' + ic('layers') + '<h3>Nivel por nivel</h3><span class="sub grow">Qué trae cada nivel</span></div><div class="cb">';
  if (!vis.length) return h + '<p class="mut">No hay contenido de temporadas en el panel. Corre <span class="mono">node scripts/gen-temporadas.mjs</span>.</p></div></div>';
  var nmax = Math.max.apply(null, vis.map(function (t) { return t.d.niveles.length; }));
  h += '<div class="tp-cmp" style="--tpn:' + vis.length + '"><div class="tp-row tp-hd"><div class="tp-n">Nivel</div>' + vis.map(function (t) { return '<div class="tp-c"><b>' + esc(t.etq) + '</b> ' + esc(t.nombre) + '</div>'; }).join('') + '</div>';
  for (var n = 1; n <= nmax; n++) {
    var dest = vis.some(function (t) { var l = t.d.niveles[n - 1]; return l && l.d; });
    h += '<div class="tp-row' + (dest ? ' dest' : '') + '"><div class="tp-n"><b>' + n + '</b>' + (dest ? '<span title="Nivel destacado">' + ic('star') + '</span>' : '') + '</div>';
    vis.forEach(function (t) {
      var l = t.d.niveles[n - 1];
      h += '<div class="tp-c"><div class="tp-tt"><b>' + esc(t.etq) + '</b> · nivel ' + n + '</div>' + (l ? (TP.c !== 'p' ? tpLaneCell(t, l, 'g') : '') + (TP.c !== 'g' ? tpLaneCell(t, l, 'p') : '') : '<span class="xs mut">sin este nivel</span>') + '</div>';
    });
    h += '</div>';
  }
  return h + '</div></div></div>';
}

/* ---------- totales ---------- */
function tpTotales(ts) {
  var ct = ts.filter(function (t) { return t.d; });
  var h = '<div class="card sec"><div class="ch">' + ic('chart') + '<h3>Totales por temporada</h3><span class="sub grow">' + (TP.c === 'p' ? 'Solo premium' : TP.c === 'g' ? 'Solo gratis' : 'Gratis + premium') + ' · abajo de cada número, gratis y premium</span></div>';
  if (!ct.length) return h + '<div class="cb"><p class="mut">Sin contenido.</p></div></div>';
  var st = ct.map(function (t) { return tpStats(t); }), two = ct.length === 2;
  var precio = tpCfg('pase_precio'), bxg = tpCfg('bloques_por_gema');
  function fila(lbl, fn, o) {
    o = o || {};
    var vals = st.map(function (s) { return fn(s); });
    var h = '<tr><td>' + lbl + '</td>' + vals.map(function (v) { return '<td class="num"><b>' + v.t + '</b>' + (v.s ? '<div class="xs mut">' + v.s + '</div>' : '') + '</td>'; }).join('');
    if (two) { var d = vals[1].n - vals[0].n; h += '<td class="num tp-dc ' + (d > 0 ? 'tp-up' : d < 0 ? 'tp-dn' : 'mut') + '">' + (vals[0].n == null ? '' : (d > 0 ? '+' : '') + nf(d)) + '</td>'; }
    return h + '</tr>';
  }
  function num(k, suf) { return function (s) { var v = tpSel(s)[k]; return { n: v, t: nf(v) + (suf || ''), s: TP.c === 'ambos' ? 'G ' + nf(s.g[k]) + ' · P ' + nf(s.p[k]) : '' }; }; }
  function bq(s) { var v = tpSel(s); return { n: v.b + v.f, t: nf(v.b + v.f), s: 'cofres ' + nf(v.f) + (TP.c === 'ambos' ? '<br>G ' + nf(s.g.b + s.g.f) + ' · P ' + nf(s.p.b + s.p.f) : '') }; }
  function rar(r) { return function (s) { var v = tpSel(s).rar[r]; return { n: v, t: nf(v), s: TP.c === 'ambos' ? 'G ' + nf(s.g.rar[r]) + ' · P ' + nf(s.p.rar[r]) : '' }; }; }
  function val(s) { var v = tpSel(s); return { n: v.val, t: nf(v.val), s: 'Bloques ' + nf(v.b + v.f) + ' + cosméticos ' + nf(v.valCos) + (v.sinPrecio ? '<br>(' + nf(v.sinPrecio) + ' sin precio no suman)' : '') }; }
  var body = fila('Bloques <span class="xs mut">(con cofres)</span>', bq) + fila('Protectores de racha', num('p')) + fila('<span style="color:' + TP_GEM + '"><b>Gemas</b></span> <span class="xs mut">(servidor)</span>', num('g')) + fila('Cosméticos', num('cos')) +
    TP_RAR_ORD.map(function (r) { return fila('<span class="tp-dot" style="background:' + TP_RAR[r][1] + '"></span>' + TP_PLU[r], rar(r)); }).join('') +
    fila(chip('EXCLUSIVO', 'ac') + ' cosméticos', num('ex')) + fila('<span style="color:#f59e0b">' + ic('star') + '</span> Paquetes míticos', num('paq')) +
    fila('Valor aprox. en Bloques', val);
  function regresa(s) {
    var p = s.p, pct = precio ? Math.round(100 * p.g / precio) : null;
    var enBq = bxg ? Math.round(p.val / bxg) : null, tot = precio && enBq != null ? Math.round(100 * (p.g + enBq) / precio) : null;
    return { n: pct, t: pct == null ? '—' : pct + ' %', s: precio ? nf(p.g) + ' de ' + nf(precio) + ' gemas' + (tot != null ? '<br>con su valor en Bloques ≈ ' + tot + ' %' : '') : 'falta el precio del servidor' };
  }
  body += fila('Cuánto regresa el premium <span class="xs mut">(en gemas)</span>', regresa);
  h += '<div class="tw"><table class="tbl tp-tb"><thead><tr><th></th>' + ct.map(function (t) { return '<th class="num">' + esc(t.etq) + '</th>'; }).join('') + (two ? '<th class="num tp-dc">Dif.</th>' : '') + '</tr></thead><tbody>' + body + '</tbody></table></div>';
  h += '<div class="cb"><p class="xs mut" style="margin:0">Valor aproximado: común ' + nf(tpPrecio('common')) + ', raro ' + nf(tpPrecio('rare')) + ', épico ' + nf(tpPrecio('epic')) + ' Bloques (precios de tienda); legendarios y míticos no se venden con Bloques y no suman. «Regresa el premium»: las gemas del carril premium entre el precio del pase' + (bxg ? '; el valor en Bloques se cambia a gemas a ' + nf(bxg) + ' Bloques por gema' : '') + '.</p></div>';
  return h + '</div>';
}


/* ================= CÓMO VA LA GENTE (44-pase-progreso.sql) =================
   admin_pase_stats(p_temporada) → {ok, temporada{}, compradores{total,plus,gemas,lista[]}, reportan, activos, completaron{total,pct},
     distribucion[{nivel,gratis,premium}], embudo[{nivel,jugadores}], medianas_dias{n10,n20,n30}, ritmo{esperado,mediana,mediana_gratis,mediana_premium,a_tiempo,atrasados}}
   admin_pase_jugadores(p_temporada, p_orden, p_buscar, p_limite) → {ok, jugadores[{id,nombre,pais,premium,plus,nivel,xp,reporte,comprado,casillas,completo}]}
   El nivel lo reporta el teléfono: es estadística, no dinero. */
var TPS = { t: null, d: {}, j: {}, orden: 'nivel', q: '', seq: 0 };
var TPS_ORD = [['nivel', 'Nivel', 'trend'], ['xp', 'XP', 'spark'], ['reporte', 'Último reporte', 'cal'], ['compra', 'Compra', 'store']];
var TPS_POCOS = 5;

function tpsSinSql(e) { return e && e.code === 'sin_sql'; }
function tpsTemp(ts, ahora) {
  var ok = ts.filter(function (t) { return t.srv || t.d; });
  var sel = ok.filter(function (t) { return t.id === TPS.t; })[0];
  if (sel) return sel;
  var en = ok.filter(function (t) { return tpEstado(t, ahora) === 'en curso'; })[0];
  var pasadas = ok.filter(function (t) { return tpEstado(t, ahora) === 'terminada'; });
  return en || pasadas[pasadas.length - 1] || ok[0] || null;
}
function tpsLoad(id, force) {
  var o = TPS.d[id];
  if (o && !force && (o.loading || o.st || o.err)) return o;
  o = TPS.d[id] = { st: null, err: null, loading: true };
  rpc('admin_pase_stats', { p_temporada: id }, { nomiss: true }).then(function (r) {
    if (r && r.ok === false) o.err = { message: 'El servidor no conoce la temporada ' + id };
    else o.st = r || {};
  }, function (e) { o.err = e; }).then(function () { o.loading = false; repaint(); });
  return o;
}
function tpsLoadJ(id, force) {
  var k = id + '|' + TPS.orden + '|' + TPS.q.trim(), o = TPS.j[id];
  if (o && o.k === k && !force && (o.loading || o.rows || o.err)) return o;
  var mine = ++TPS.seq;
  o = TPS.j[id] = { k: k, rows: (o && o.rows) || null, err: null, loading: true, seq: mine };
  rpc('admin_pase_jugadores', { p_temporada: id, p_orden: TPS.orden, p_buscar: TPS.q.trim() || null, p_limite: 100 }, { nomiss: true }).then(function (r) {
    if (TPS.j[id].seq !== mine) return; o.rows = (r && r.jugadores) || []; o.err = null;
  }, function (e) { if (TPS.j[id].seq === mine) o.err = e; }).then(function () { if (TPS.j[id].seq === mine) { o.loading = false; repaint(); } });
  return o;
}

/* Veredicto de dificultad: nivel mediano real contra el esperado hoy (llegar al último nivel justo al terminar). */
function tpsVeredicto(st) {
  var r = st.ritmo || {}, n = Number(st.reportan) || 0, esp = Number(r.esperado) || 0, med = Number(r.mediana) || 0;
  var tot = (Number(r.a_tiempo) || 0) + (Number(r.atrasados) || 0), atr = tot ? Number(r.atrasados) / tot : 0;
  if (n < TPS_POCOS) return { c: 'info', ic: 'info', t: 'Todavía hay pocos datos', d: 'Solo ' + plural(n, 'jugador ha reportado', 'jugadores han reportado') + ' su nivel; con menos de ' + TPS_POCOS + ' no se puede juzgar la dificultad.' };
  if (esp < 2) return { c: 'info', ic: 'info', t: 'La temporada apenas empieza', d: 'El nivel esperado hoy es ' + esp.toFixed(1).replace('.0', '') + '; espera unos días para comparar el ritmo.' };
  var ratio = med / esp, det = 'Nivel mediano ' + med.toFixed(1).replace('.0', '') + ' contra ' + esp.toFixed(1).replace('.0', '') + ' esperado hoy (' + Math.round(ratio * 100) + ' %) · ' + Math.round(atr * 100) + ' % de los jugadores va atrasado.';
  if (ratio < 0.75 || atr > 0.6) return { c: 'warn', ic: 'warn', t: 'Va más lento de lo esperado', d: 'Considera bajar XP por nivel o dar más XP por misión. ' + det };
  if (ratio > 1.25 && atr < 0.2) return { c: 'info', ic: 'info', t: 'Va más rápido de lo esperado', d: 'La gente lo termina antes de tiempo: considera subir XP por nivel si quieres que dure toda la temporada. ' + det };
  return { c: 'ok', ic: 'check', t: 'Va bien', d: det };
}

function tpsBanner(v) { return '<div class="ban' + (v.c === 'ok' ? ' ok' : v.c === 'info' ? ' info' : '') + '">' + ic(v.ic) + '<div class="tx"><b>' + esc(v.t) + '</b>' + esc(v.d) + '</div></div>'; }
function tpsEmbudo(st) {
  var n = Number(st.reportan) || 0, L = st.embudo || [];
  if (!n || !L.length) return '<p class="mut">Todavía nadie ha reportado su nivel.</p>';
  return '<div class="tps-emb">' + L.map(function (x) {
    var p = 100 * x.jugadores / n;
    return '<div class="tps-er"><span class="tps-el">Nivel ' + nf(x.nivel) + '</span><div class="bar"><i style="width:' + Math.max(p > 0 ? 2 : 0, Math.round(p)) + '%"></i></div><span class="tps-en"><b>' + nf(x.jugadores) + '</b> <span class="xs mut">' + Math.round(p) + ' %</span></span></div>';
  }).join('') + '</div>';
}
function tpsDistrib(st) {
  var L = (st.distribucion || []).filter(function (x) { return x.nivel >= 1; });
  var max = Math.max.apply(null, L.map(function (x) { return Math.max(x.gratis, x.premium); }).concat([1]));
  if (!(Number(st.reportan) > 0)) return '<p class="mut">Todavía nadie ha reportado su nivel.</p>';
  var cols = L.map(function (x) {
    var tip = 'Nivel ' + nf(x.nivel) + ': ' + nf(x.gratis) + ' gratis · ' + nf(x.premium) + ' premium';
    return '<div class="tps-col" title="' + esc(tip) + '"><div class="tps-bars"><i class="g" style="height:' + (x.gratis ? Math.max(3, Math.round(100 * x.gratis / max)) : 0) + '%"></i><i class="p" style="height:' + (x.premium ? Math.max(3, Math.round(100 * x.premium / max)) : 0) + '%"></i></div><span class="tps-nv">' + (x.nivel === 1 || x.nivel % 5 === 0 ? nf(x.nivel) : '') + '</span></div>';
  }).join('');
  return '<div class="tps-leg"><span><i class="tps-sw g"></i>Gratis</span><span><i class="tps-sw p"></i>Premium</span><span class="xs mut">Jugadores por nivel (el más alto de cada uno) · el más grande: ' + nf(max) + '</span></div>' +
    '<div class="tps-chart" role="img" aria-label="Jugadores por nivel, gratis contra premium">' + cols + '</div>';
}
function tpsMed(lbl, v) {
  return '<div class="tps-md"><div class="xs mut">' + esc(lbl) + '</div><div class="tps-mv">' + (v == null ? '<span class="mut">—</span>' : '<b>' + esc(String(v).replace('.0', '')) + '</b> <span class="xs mut">' + (Number(v) === 1 ? 'día' : 'días') + '</span>') + '</div></div>';
}
function tpsKpis(st) {
  var c = st.compradores || {}, cp = st.completaron || {}, n = Number(st.reportan) || 0;
  return '<div class="kpis">' +
    kpi('user', 'Compraron el premium', nf(c.total), nf(c.plus) + ' con el plus · ' + (n ? Math.round(100 * c.total / n) + ' % de los que reportan' : 'nadie reporta aún')) +
    kpi('trend', 'Jugadores activos', nf(st.activos), 'Reportaron en los últimos 7 días · ' + nf(n) + ' en total') +
    kpi('trophy', 'Completaron el pase', (Number(cp.pct) || 0).toString().replace('.', ',') + ' %', nf(cp.total) + (cp.total === 1 ? ' jugador llegó' : ' jugadores llegaron') + ' al último nivel') +
    kpi('star', 'Ingresos en gemas', nf(c.gemas), 'Gastadas en el premium de esta temporada') + '</div>';
}
function tpsRitmo(st) {
  var r = st.ritmo || {}, t = st.temporada || {}, m = st.medianas_dias || {};
  return '<div class="tps-mds">' + tpsMed('Mediana al nivel 10', m.n10) + tpsMed('Mediana al nivel 20', m.n20) + tpsMed('Mediana al nivel ' + (t.niveles || 30), m.n30) + '</div>' +
    '<p class="xs mut" style="margin:10px 0 0">Días desde que empezó la temporada hasta el primer reporte de ese nivel. ' + nf(r.a_tiempo) + ' a tiempo · ' + nf(r.atrasados) + ' atrasados · nivel mediano gratis ' + (r.mediana_gratis == null ? '—' : esc(String(r.mediana_gratis).replace('.0', ''))) + ', premium ' + (r.mediana_premium == null ? '—' : esc(String(r.mediana_premium).replace('.0', ''))) + '.</p>';
}

function tpsTabla(o, id) {
  var R = o.rows || [];
  var d = '<div class="tw je-d"><table class="tbl"><thead><tr><th>Jugador</th><th class="num">Nivel</th><th class="num">XP</th><th>Último reporte</th><th class="num">Casillas</th><th>Estado</th></tr></thead><tbody>' + R.map(function (j) {
    return '<tr class="clk" data-a="tpsJug" data-id="' + esc(j.id) + '" tabindex="0" role="link"><td><b>' + jeBandera(j.pais) + esc(j.nombre || 'Jugador') + '</b>' + (j.premium ? ' ' + chipN(j.plus ? 'premium+' : 'premium', 'ok') : '') + '<div class="xs faint mono">' + esc(String(j.id).slice(0, 8)) + '…</div></td>' +
      '<td class="num">' + (j.nivel == null ? '<span class="mut">—</span>' : '<b>' + nf(j.nivel) + '</b>') + '</td><td class="num">' + (j.xp == null ? '<span class="mut">—</span>' : nf(j.xp)) + '</td>' +
      '<td class="xs">' + (j.reporte ? '<span title="' + esc(fdt(j.reporte)) + '">' + esc(relT(j.reporte)) + '</span>' : '<span class="mut">nunca reportó</span>') + '</td>' +
      '<td class="num">' + nf(j.casillas) + '</td><td>' + (j.completo ? chipN('completó', 'ac') : '') + '</td></tr>';
  }).join('') + '</tbody></table></div>';
  var m = '<div class="list je-m">' + R.map(function (j) {
    return '<button type="button" class="li je-li" data-a="tpsJug" data-id="' + esc(j.id) + '"><div class="t"><b>' + jeBandera(j.pais) + esc(j.nombre || 'Jugador') + '</b>' +
      '<span>' + (j.nivel == null ? 'Sin reporte' : 'Nivel <b>' + nf(j.nivel) + '</b> · ' + nf(j.xp) + ' XP') + (j.premium ? ' · premium' : '') + (j.completo ? ' · completó' : '') + '</span>' +
      '<span>' + nf(j.casillas) + ' casilla' + (j.casillas === 1 ? '' : 's') + (j.reporte ? ' · ' + esc(relT(j.reporte)) : '') + '</span></div>' + ic('chr') + '</button>';
  }).join('') + '</div>';
  return d + m;
}
function tpsJugadores(id) {
  var o = tpsLoadJ(id);
  var h = '<div class="card sec"><div class="ch">' + ic('user') + '<h3>Jugadores del pase</h3><span class="sub grow">' + (o.rows ? plural(o.rows.length, 'jugador', 'jugadores') + (o.rows.length >= 100 ? ' · los primeros 100' : '') : '') + '</span></div><div class="cb">' +
    '<div class="row je-fil">' + searchBox('tps_q', TPS.q, 'Buscar por nombre o id…', 'tpsQ') + '<div class="je-seg">' + seg('tpsOrd', TPS.orden, TPS_ORD) + '</div></div>';
  if (o.err) h += '<div class="mt12">' + rerr({ err: o.err }, 'los jugadores del pase') + '</div>';
  else if (o.rows == null) h += '<div class="mt12">' + skel(3) + '</div>';
  else if (!o.rows.length) h += emptyBox('user', TPS.q.trim() ? 'Nadie con ese nombre' : 'Nadie en este pase todavía', TPS.q.trim() ? 'Prueba con otra parte del nombre o con el comienzo del id.' : 'Aparecen cuando un jugador reporta su nivel o compra el premium.');
  else h += '<div class="mt12' + (o.loading ? ' je-busy' : '') + '">' + tpsTabla(o, id) + '</div>';
  return h + '<p class="xs mut mt12">Toca a un jugador para abrir su ficha en Jugadores y economía. Casillas = gemas y Bloques que ya cobró de este pase. El nivel lo reporta su teléfono.</p></div></div>';
}
function tpsSeccion(ts, ahora) {
  var t = tpsTemp(ts, ahora);
  var h = '<div class="card sec tps"><div class="ch">' + ic('trend') + '<h3>Cómo va la gente</h3><span class="sub grow">El nivel lo reporta el teléfono: es estadística, no dinero</span></div><div class="cb">';
  if (!t) return h + '<p class="mut">No hay temporadas.</p></div></div>';
  var opts = ts.filter(function (x) { return x.srv || x.d; }).map(function (x) { return [x.id, x.etq + ' · ' + x.nombre]; });
  h += '<div class="row" style="gap:12px;flex-wrap:wrap;align-items:center"><div class="tp-fl"><span class="xs mut">Temporada</span>' + seg('tpsT', t.id, opts) + '</div>' + tpEstChip(tpEstado(t, ahora)) + '<span class="xs mut">' + esc(tpRelativo(t, ahora)) + '</span></div>';
  var o = tpsLoad(t.id);
  if (tpsSinSql(o.err)) return h + emptyBox('db', 'Falta correr ' + SQLF.pase_stats, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 43-exclusivos-pase.sql. Hasta entonces la app no puede reportar el progreso y aquí no hay nada que ver.') + '</div></div>';
  if (o.err) return h + '<div class="mt12">' + rerr({ err: o.err }, 'las estadísticas del pase') + '</div></div></div>';
  if (!o.st) return h + '<div class="mt12">' + skel(3) + '</div></div></div>';
  var st = o.st, v = tpsVeredicto(st);
  h += '<div class="mt12">' + tpsBanner(v) + '</div><div class="mt12">' + tpsKpis(st) + '</div>';
  h += '<div class="grid g2 mt16"><div class="card"><div class="ch">' + ic('chart') + '<h3>Embudo</h3><span class="sub grow">Cuántos llegan a cada nivel</span></div><div class="cb">' + tpsEmbudo(st) + '</div></div>' +
    '<div class="card"><div class="ch">' + ic('cal') + '<h3>Tiempo para llegar</h3><span class="sub grow">Medianas</span></div><div class="cb">' + tpsRitmo(st) + '</div></div></div>';
  h += '<div class="card mt16"><div class="ch">' + ic('chart') + '<h3>Dónde está cada quien</h3><span class="sub grow">Gratis contra premium</span></div><div class="cb">' + tpsDistrib(st) + '</div></div>';
  h += '<div class="mt16">' + tpsJugadores(t.id) + '</div>';
  return h + '</div></div>';
}
A.tpsT = function (el) { TPS.t = el.dataset.v; TPS.q = ''; repaint(); };
A.tpsOrd = function (el) { if (TPS.orden === el.dataset.v) return; TPS.orden = el.dataset.v; repaint(); };
I.tpsQ = debounce(function (el) { TPS.q = el.value; repaint(); }, 300);
A.tpsJug = function (el) { go('juego/economia', { open: 'je:' + el.dataset.id }); };

/* ---------- vista ---------- */
function vPases() {
  var o1 = rm('solo_gemas'), o2 = rm('pase_bloques'), d = tpData();
  var h = pageHead('Pases de batalla', 'Las temporadas en una <b>línea del tiempo</b> y, nivel por nivel, <b>qué trae cada una</b> para compararlas. Solo lectura: para cambiar algo usa «Solo gemas › Pase».', '<button class="btn" data-a="tpReload">' + ic('refresh') + 'Recargar</button>');
  if (!d) return h + '<div class="card">' + emptyBox('db', 'Faltan los datos de las temporadas', 'Corre node scripts/gen-temporadas.mjs en blokku-landing y vuelve a compilar el panel.') + '</div>';
  var avisos = '';
  if (o1 && o1.err) avisos += '<div class="ban">' + ic('warn') + '<div class="tx"><b>No se pudieron leer las fechas y gemas del servidor</b>' + (o1.err.code === 'sin_sql' ? 'Falta correr ' + esc(SQLF.solo_gemas) + '. ' : esc(o1.err.message) + '. ') + 'Se muestran las fechas y premios del JSON de la app, sin comprobar contra el servidor.</div></div>';
  else if (!tpSG()) avisos += '<div class="ban info">' + ic('info') + '<div class="tx"><b>Cargando fechas y gemas del servidor…</b>Mientras tanto se ve lo que trae la app.</div></div>';
  if (o2 && o2.err) avisos += '<div class="ban">' + ic('warn') + '<div class="tx"><b>No se pudieron leer los Bloques del servidor</b>' + (o2.err.code === 'sin_sql' ? 'Falta correr ' + esc(SQLF.pase_bloques) + '. ' : esc(o2.err.message) + '. ') + 'No se puede comprobar que los Bloques y protectores coincidan con el servidor.</div></div>';
  var ts = tpTemps(), ahora = tpAhora();
  var dist = ts.filter(function (t) { return tpNDif(t) > 0; });
  if (dist.length) avisos += '<div class="ban">' + ic('warn') + '<div class="tx"><b>El servidor paga distinto a la app en ' + esc(dist.map(function (t) { return t.etq; }).join(' y ')) + '</b>Las casillas con «Servidor» enseñan lo que de verdad se paga (se cambió en «Solo gemas › Pase» o el JSON de la app ya cambió y falta regenerar los datos).</div></div>';
  return h + avisos + tpTimeline(ts, ahora) + tpsSeccion(ts, ahora) + tpFiltros(ts) + tpTotales(ts) + tpComparativa(ts);
}
VIEWS['juego/pases'] = vPases;
