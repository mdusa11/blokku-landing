/* ================= dominio: premios, estados, vista de la app ================= */
var RAR = ['Común', 'Raro', 'Épico', 'Legendario', 'Mítico'];
var RVAR = { 'Común': '--r-comun', 'Raro': '--r-raro', 'Épico': '--r-epico', 'Legendario': '--r-leg', 'Mítico': '--r-mit' };
var RHEX = { 'Común': '#9ca3af', 'Raro': '#2563EB', 'Épico': '#7c3aed', 'Legendario': '#d97706', 'Mítico': '#db2777' };
var GANA = { inicio: 'Gratis desde el inicio', logro: 'Logro', nivel: 'Ruta de nivel', reto: 'Reto difícil', evento: 'Evento', dusa: 'Colección Dusa', 'código': 'Solo código' };
var TIPOS = [['Tema', 'Temas'], ['Estilo', 'Estilos de pieza'], ['Marco', 'Marcos'], ['Efecto', 'Efectos de línea'], ['Otro', 'Insignias y títulos']];
var PLAN_L = { '': 'Normal', codigo: 'Solo con código', dormido: 'Dormido' };
var META_L = { partidas: ['partida', 'partidas', 'Juega {n} partidas'], lineas: ['línea', 'líneas', 'Limpia {n} líneas'], puntos: ['punto', 'puntos', 'Haz {n} puntos en una partida'], retos: ['reto diario', 'retos diarios', 'Completa {n} retos diarios'] };
var EST_L = { activo: 'Activo', proximo: 'Próximo', terminado: 'Terminado', inactivo: 'Apagado', agotado: 'Agotado', caducado: 'Caducado', desactivado: 'Desactivado' };
var EST_C = { activo: 'ok', proximo: 'ac', terminado: 'line', inactivo: 'warn', agotado: 'warn', caducado: 'line', desactivado: 'bad' };
var REPLACES = { muertos26: 't-mue26', pionero: 't-pion' };
var PROMOS = {
  fakturo: { n: 'Fakturo', url: 'https://fakturo.cloud', tes: 'Prueba Fakturo', ten: 'Try Fakturo', xes: 'Factura en segundos desde tu celular. De los creadores de Blokku.', xen: 'Invoice in seconds from your phone. From the makers of Blokku.', premio: 'theme_fakturo' },
  cumple: { n: 'Cumplegratis', url: 'https://cumplegratis.fun', tes: 'Tu cumpleaños sale gratis', ten: 'Your birthday is on the house', xes: 'Descubre promos de cumpleaños cerca de ti con Cumplegratis.', xen: 'Find birthday deals near you with Cumplegratis.', premio: 'theme_cumplegratis' }
};

function grp(t) { t = t || ''; if (/tema/i.test(t)) return 'Tema'; if (/estilo|pieza/i.test(t)) return 'Estilo'; if (/marco/i.test(t)) return 'Marco'; if (/efecto/i.test(t)) return 'Efecto'; return 'Otro'; }
function prem(id) { return item('premios', id); }
function pc(cid) { return items('premios').find(function (p) { return p.cid === cid; }); }
function cname(cid) { var p = pc(cid); return p ? p.nombre : cid; }
function ml(o) { return o && (o.es || o.en) || ''; }
function col(c) { return /^#[0-9a-f]{3,8}$/i.test(c || '') ? c : '#9ca3af'; }
function rr(r) { return '<span class="chip rar" style="--rc:var(' + (RVAR[r] || '--r-comun') + ')"><i></i>' + esc(r || '—') + '</span>'; }
function estChip(e) { return chip(EST_L[e] || e, EST_C[e] || ''); }
function pimg(p, big) {
  if (!p) return '';
  if (p.imgs && p.imgs.length) { var u = imgSrc(p.imgs[0]); if (u) return u; }
  var m = MAPA[p.id]; if (!m) return '';
  return (big && m.big && IMGS[m.big]) || IMGS[m.img] || '';
}
function thumb(p, cls, big) {
  if (!p) return '<div class="th ' + (cls || '') + '">?</div>';
  var u = pimg(p, big);
  if (u) return '<div class="th ' + (cls || '') + '"><img loading="lazy" alt="" src="' + esc(u) + '"></div>';
  var ch = esc((p.nombre || '?').charAt(0).toUpperCase());
  if (p.pal && p.pal.length === 2) return '<div class="th pal ' + (cls || '') + '" style="--p1:' + col(p.pal[0]) + ';--p2:' + col(p.pal[1]) + '" aria-hidden="true">' + ch + '</div>';
  return '<div class="th ' + (cls || '') + '" style="--tc:' + (RHEX[p.rareza] || '#9ca3af') + '" aria-hidden="true">' + ch + '</div>';
}
function cthumb(cid, cls) { var p = pc(cid); return p ? thumb(p, cls) : '<div class="th ' + (cls || '') + '" title="' + esc(cid) + '">' + esc(String(cid || '?').charAt(0).toUpperCase()) + '</div>'; }
function thumbs(cids, max) { max = max || 4; return '<span class="ths">' + cids.slice(0, max).map(function (c) { return cthumb(c, 'xs'); }).join('') + (cids.length > max ? '<span class="more">+' + (cids.length - max) + '</span>' : '') + '</span>'; }
function goalTxt(meta, n) { var m = META_L[meta]; if (!m) return n + ' ' + meta; if (meta === 'puntos') return 'Haz ' + nf(n) + ' puntos en una partida'; return (meta === 'lineas' ? 'Limpia ' : meta === 'retos' ? 'Completa ' : 'Juega ') + nf(n) + ' ' + (n === 1 ? m[0] : m[1]); }

/* estados */
function winEst(on, ini, fin) { var n = Date.now(); if (!on) return 'inactivo'; if (n < new Date(ini).getTime()) return 'proximo'; if (n >= new Date(fin).getTime()) return 'terminado'; return 'activo'; }
function avEst(a) { return winEst(a.activo, a.inicio, a.fin); }
function evEst(e) { return winEst(e.activo, e.inicio, e.fin); }
function cEst(c) { if (!c.activo) return 'desactivado'; if (c.usos_max != null && c.usos >= c.usos_max) return 'agotado'; if (c.caduca && new Date(c.caduca).getTime() <= Date.now()) return 'caducado'; return 'activo'; }
function isUpd(a) { return avBtns(a).some(function (b) { return b.accion === 'tienda'; }); }

/* códigos fijos */
var CODEA = null;
function codeByA(a) { if (!CODEA) { CODEA = {}; (typeof CODES !== 'undefined' ? CODES : []).forEach(function (c) { CODEA[c.a] = c; }); } return CODEA[a]; }
function cjWho(h) {
  if (V1H[h]) { var cu = items('cupones').find(function (c) { return c.codigo === V1H[h]; }); return { k: 'sticker', n: 'Sticker ' + V1H[h], code: V1H[h], cids: cu ? (cu.premios || []).map(function (id) { var p = prem(id); return p && p.cid; }).filter(Boolean) : [] }; }
  var c = codeByA(h);
  if (!c) return { k: '?', n: 'Código desconocido', cids: [] };
  return c.i === '*' ? { k: 'maestro', n: 'Código maestro', code: c.c, c: c, cids: [] } : { k: 'unico', n: c.n, code: c.c, c: c, cids: [c.i] };
}
function cjAgg() {
  var R = rows('canjes'), o = { tot: 0, day: {}, h: {}, plat: { android: 0, ios: 0 }, fam: { sticker: 0, unico: 0, maestro: 0, '?': 0 }, cid: {} };
  R.forEach(function (r) {
    var n = Number(r.n) || 0; o.tot += n; o.day[r.d] = (o.day[r.d] || 0) + n; o.h[r.h] = (o.h[r.h] || 0) + n; o.plat[r.p] = (o.plat[r.p] || 0) + n;
    var w = cjWho(r.h); o.fam[w.k] = (o.fam[w.k] || 0) + n; w.cids.forEach(function (c) { o.cid[c] = (o.cid[c] || 0) + n; });
  });
  return o;
}
function lastDays(map, n) { var t = dn(todayS()), out = []; for (var i = n - 1; i >= 0; i--) { var s = iso(t - i); out.push({ d: s, v: map[s] || 0 }); } return out; }

/* ---------- vista como la app (teléfono) ---------- */
var AV_FMT = { tarjeta: 'Tarjeta', ventana: 'Ventana', imagen: 'Imagen', banner: 'Banner' };
var BT_ACC = [['url', 'Abrir link'], ['tienda', 'Ir a la tienda'], ['evento', 'Abrir evento'], ['canjear', 'Canjear código'], ['personalizar', 'Abrir Personalizar'], ['jugar', 'Jugar'], ['diario', 'Reto diario'], ['cerrar', 'Solo cerrar']];
var BT_DEF = { url: ['Ver más', 'See more'], tienda: ['Actualizar', 'Update'], evento: ['Ver evento', 'View event'], canjear: ['Canjear', 'Redeem'], personalizar: ['Personalizar', 'Customize'], jugar: ['Jugar', 'Play'], diario: ['Reto diario', 'Daily challenge'], cerrar: ['Luego', 'Later'] };
var PERS_TABS = [['temas', 'Temas'], ['piezas', 'Estilos de pieza'], ['efectos', 'Efectos de línea'], ['marcos', 'Marcos'], ['insignias', 'Insignias y títulos']];
var ACENTOS = [['#FFC93C', 'Dorado'], ['#FF5D8F', 'Rosa'], ['#9C6BFF', 'Violeta'], ['#43D9A3', 'Menta'], ['#4EA1FF', 'Azul']];
function avFmt(a) { var f = a && a.formato; return AV_FMT[f] ? f : (a && a.tipo === 'drop' ? 'ventana' : 'tarjeta'); }
/* botones efectivos: los nuevos, o el botón viejo (accion/destino) convertido */
function avBtns(a) {
  var b = Array.isArray(a.botones) ? a.botones.filter(function (x) { return x && BT_DEF[x.accion]; }) : [];
  if (b.length) return b.slice(0, 2);
  var acc = a.accion || (a.tipo === 'drop' && a.destino ? 'canjear' : '');
  if (acc && BT_DEF[acc]) return [{ texto: { es: BT_DEF[acc][0], en: BT_DEF[acc][1] }, accion: acc, destino: a.destino || '', estilo: 'primario' }];
  return [];
}
function btLabel(b) { return ml(b.texto) || (BT_DEF[b.accion] || [''])[0]; }
function avCode(a) { var b = avBtns(a).filter(function (x) { return x.accion === 'canjear' && x.destino; })[0]; return b ? b.destino : ''; }
function avAcc(a) { var c = String(a.acento || ''); return /^#[0-9a-f]{6}$/i.test(c) ? c : ''; }
function avImg(a) {
  if (a.imagen_id) return imgSrc('img:' + a.imagen_id);
  return isHttps(a.imagen) ? a.imagen : '';
}
function gem(glyph) { return '<div class="gem">' + ic(glyph || 'gift') + '</div>'; }
function pimgTag(u, fit) { return '<img alt="" style="width:100%;height:100%;object-fit:' + (fit || 'cover') + ';display:block" src="' + esc(u) + '" referrerpolicy="no-referrer" onerror="this.remove()">'; }
function noticeArt(a, glyph, imgFirst) {
  var p = a.premio && pc(a.premio), u = avImg(a);
  if (imgFirst && u) return pimgTag(u);
  if (p) return thumb(p, '', true);
  if (u) return '<div style="position:relative;width:100%;height:100%">' + gem(glyph) + '<div style="position:absolute;inset:0">' + pimgTag(u) + '</div></div>';
  if (isUpd(a)) return IMGS.icono ? '<img alt="" src="' + IMGS.icono + '">' : gem('rocket');
  return gem(glyph);
}
function btnPrev(b, cls) {
  var sec = b.estilo === 'secundario';
  return '<span class="' + cls + (sec ? ' s' : ' p') + '">' + esc(btLabel(b)) + '</span>';
}
function cardPrev(a) {
  var t = ml(a.titulo), x = ml(a.texto), bs = avBtns(a), u = a.imagen_id ? avImg(a) : '';
  if (!t && !x) return '<div class="gcard" style="opacity:.6"><div class="gtx"><p>La app no muestra tarjetas sin título ni texto.</p></div></div>';
  var ac = avAcc(a), st = ac ? ' style="--edge:' + ac + '"' : '';
  var body = (u ? '' : '<div class="ga">' + noticeArt(a, 'bell') + '</div>') + '<div class="gtx"><div class="gtt"><b>' + esc(t) + '</b><span class="gx">✕</span></div>' + (x ? '<p>' + esc(x) + '</p>' : '') +
    (bs.length ? '<div class="gbs">' + bs.map(function (b) { return btnPrev(b, 'gbtn'); }).join('') + '</div>' : '') + '</div>';
  if (u) return '<div class="gcard col' + (ac ? ' ac' : '') + '"' + st + '><div class="gimg">' + pimgTag(u) + '</div><div class="gin">' + body + '</div></div>';
  return '<div class="gcard' + (ac ? ' ac' : '') + '"' + st + '>' + body + '</div>';
}
function bannerPrev(a) {
  var t = ml(a.titulo) || ml(a.texto) || 'Título del banner', ac = avAcc(a), p = a.premio && pc(a.premio), u = avImg(a);
  return '<div class="gban' + (ac ? ' ac' : '') + '"' + (ac ? ' style="--edge:' + ac + '"' : '') + '><span class="gbt">' + (u ? pimgTag(u) : p ? thumb(p, '', true) : gem('bell')) + '</span><span class="gbl">' + esc(t) + '</span><span class="gbc">›</span></div>';
}
function eventCardPrev(e) {
  var now = Date.now(), up = now < new Date(e.inicio).getTime(), days = Math.max(1, Math.ceil(((up ? new Date(e.inicio) : new Date(e.fin)).getTime() - now) / 864e5));
  var when = up ? (days === 1 ? 'Empieza en 1 día' : 'Empieza en ' + days + ' días') : (days === 1 ? 'Último día' : 'Quedan ' + days + ' días');
  var p = (e.premios || []).map(pc).filter(Boolean)[0];
  return '<div class="gcard"><div class="ga">' + (p ? thumb(p, '', true) : gem('gift')) + '</div><div class="gtx"><div class="ey">Evento</div><div class="gtt"><b>' + esc(ml(e.nombre) || e.id) + '</b><span class="gch">' + when + '</span></div>' +
    (up ? '<p>' + esc(goalTxt(e.meta, e.objetivo)) + '</p>' : '<div class="gpb"><span class="bar"><i style="width:0"></i></span>0/' + nf(e.objetivo) + '</div>') + '</div></div>';
}
function modalBtns(a) {
  var bs = avBtns(a);
  if (!bs.length) return '<div class="gbtns"><span class="gghost">¡GENIAL!</span></div>';
  return '<div class="gbtns">' + bs.map(function (b) { return btnPrev(b, 'mb'); }).join('') + '</div>';
}
function dropPrev(a) {
  var p = a.premio && pc(a.premio), ac = avAcc(a), edge = ac || (p ? RHEX[p.rareza] || '#ffc93c' : '#ffc93c'), t = ml(a.titulo), x = ml(a.texto), code = avCode(a);
  return '<div class="pdim"><div class="gsurf" style="--edge:' + edge + '"><div class="gstk">' + esc(t || (isUpd(a) ? '¡Nueva versión!' : code ? '¡Salió un código!' : '')) + '</div><div class="gart">' + noticeArt(a, 'gift', true) + '</div>' +
    (p ? rr(p.rareza) : '') + (x ? '<p>' + esc(x) + '</p>' : '') + (code ? '<div class="gcode">' + esc(code) + '</div>' : '') + '</div>' + modalBtns(a) + '</div>';
}
function imagenPrev(a) {
  var t = ml(a.titulo), x = ml(a.texto), ac = avAcc(a), u = avImg(a), p = a.premio && pc(a.premio), code = avCode(a);
  var art = u ? '<img alt="" src="' + esc(u) + '" referrerpolicy="no-referrer" onerror="this.remove()">' : p ? '<div class="gph">' + thumb(p, '', true) + '</div>' : '<div class="gph">' + gem('gift') + '<span>Sube tu imagen</span></div>';
  return '<div class="pdim"><div class="gimgm" style="--edge:' + (ac || 'transparent') + '"><span class="gxx">✕</span>' + art +
    (t || x || code ? '<div class="gcap">' + (t ? '<b>' + esc(t) + '</b>' : '') + (x ? '<p>' + esc(x) + '</p>' : '') + (code ? '<div class="gcode">' + esc(code) + '</div>' : '') + '</div>' : '') + '</div>' + modalBtns(a) + '</div>';
}
function phone(inner, overlay, top) {
  var d = new Date();
  return '<div class="phone" aria-hidden="true"><div class="scr"><div class="notch"></div><div class="sb"><span>' + z2(d.getHours()) + ':' + z2(d.getMinutes()) + '</span><span>●●● 5G</span></div>' +
    '<div class="pm">' + (top || '') + '<div class="pmh">' + (IMGS.icono ? '<img alt="" src="' + IMGS.icono + '">' : '') + '<b>Blokku</b><span>NIVEL 12</span></div><div class="pplay">JUGAR</div>' + inner + '<div class="pfake"></div><div class="pfake"></div></div>' + (overlay || '') + '</div></div>';
}
function avisoPhone(a) {
  var f = avFmt(a);
  return f === 'ventana' ? phone('', dropPrev(a)) : f === 'imagen' ? phone('', imagenPrev(a)) : f === 'banner' ? phone('', '', bannerPrev(a)) : phone(cardPrev(a));
}
