/* ================= EN VIVO: ahora, avisos, eventos ================= */
/* ---------- línea de tiempo tipo Gantt ---------- */
function gantt(rowsL, from, to, o) {
  o = o || {}; var span = to - from, P = function (t) { return Math.max(0, Math.min(100, (t - from) * 100 / span)); };
  var ticks = '', grid = '', d0 = new Date(from); d0.setHours(0, 0, 0, 0);
  var long = span > 100 * 864e5;
  for (var t = d0.getTime(); t <= to; t += 864e5) {
    var d = new Date(t);
    if (long ? d.getDate() === 1 : d.getDay() === 1) {
      if (t < from) continue;
      ticks += '<span class="' + (d.getDate() <= 7 ? 'm' : '') + '" style="left:' + P(t).toFixed(2) + '%">' + (long ? MES[d.getMonth()].slice(0, 3) + (d.getMonth() === 0 ? ' ' + d.getFullYear() : '') : d.getDate() + ' ' + MES[d.getMonth()].slice(0, 3)) + '</span>';
      grid += '<i style="left:' + P(t).toFixed(2) + '%"></i>';
    }
  }
  var now = Date.now(), h = '<div class="gantt" style="--gl:' + (o.gl || 'clamp(118px,26%,230px)') + '"><div class="gh">' + ticks + '</div><div class="gbody"><div class="ggrid">' + grid + (now >= from && now <= to ? '<div class="gnow" style="left:' + P(now).toFixed(2) + '%"></div>' : '') + '</div>';
  var g = null;
  rowsL.forEach(function (r) {
    if (r.grp !== g) { g = r.grp; if (g) h += '<div class="grp">' + esc(g) + '</div>'; }
    var a = P(r.a), b = P(r.b), w = Math.max(b - a, .8), cut = (r.a < from ? ' l' : '') + (r.b > to ? ' r' : '');
    h += '<div class="gr" data-a="' + (r.act || 'openx') + '" data-r="' + esc(r.r || '') + '" data-o="' + esc(r.o || '') + '" role="link" tabindex="0" title="' + esc(r.label + ' · ' + r.tip) + '"><div class="gl">' + esc(r.label) + '<small>' + esc(r.sub || '') + '</small></div><div class="gt"><div class="gb' + (r.ghost ? ' ghost' : '') + (r.off ? ' off' : '') + cut + '" style="left:' + a.toFixed(2) + '%;width:' + w.toFixed(2) + '%;--gc:' + (r.c || '#5b4cf0') + '">' + (w > 14 ? esc(r.inner || '') : '') + '</div></div></div>';
  });
  if (!rowsL.length) h += '<div class="empty" style="padding:20px">Nada programado en estas semanas.</div>';
  h += '</div></div>';
  if (o.legend) h += '<div class="glg">' + o.legend.map(function (l) { return '<span><i style="--gc:' + l[0] + '"></i>' + esc(l[1]) + '</span>'; }).join('') + '</div>';
  return h;
}
function liveRows(from, to) {
  var out = [];
  rows('eventos').forEach(function (e) { var a = new Date(e.inicio).getTime(), b = new Date(e.fin).getTime(); if (b < from || a > to) return; out.push({ grp: 'Eventos en la app', label: ml(e.nombre) || e.id, sub: goalTxt(e.meta, e.objetivo), a: a, b: b, c: '#5b4cf0', off: !e.activo, tip: fdt(e.inicio) + ' → ' + fdt(e.fin), inner: e.activo ? '' : 'apagado', r: 'vivo/eventos', o: 'ev:' + e.id }); });
  rows('avisos').forEach(function (x) { var a = new Date(x.inicio).getTime(), b = new Date(x.fin).getTime(); if (b < from || a > to) return; out.push({ grp: 'Avisos y drops', label: ml(x.titulo) || (x.tipo === 'drop' ? '¡Salió un código!' : 'Aviso'), sub: AV_FMT[avFmt(x)] + (isUpd(x) ? ' · actualización' : ''), a: a, b: b, c: x.tipo === 'drop' ? '#e64aa0' : isUpd(x) ? '#0ea5e9' : '#8a4be8', off: !x.activo, tip: fdt(x.inicio) + ' → ' + fdt(x.fin), r: 'vivo/avisos', o: 'av:' + x.id }); });
  var remote = {}; rows('eventos').forEach(function (e) { if (REPLACES[e.id]) remote[REPLACES[e.id]] = 1; });
  items('timeline').forEach(function (t) { if (t.tipo !== 'evento' && t.tipo !== 'temporada' || remote[t.id]) return; var a = dayMs(t.inicio), b = dayMs(t.fin || t.inicio, 1); if (b < from || a > to) return; out.push({ grp: 'Plan (calendario)', label: t.titulo, sub: t.estado === 'idea' ? 'Idea' : 'Planeado', a: a, b: b, c: t.estado === 'idea' ? '#94a3b8' : '#d97706', ghost: true, tip: fdr(t.inicio, t.fin), r: 'juego/temporadas', o: 'tl:' + t.id }); });
  var ord = { 'Eventos en la app': 0, 'Avisos y drops': 1, 'Plan (calendario)': 2 };
  out.sort(function (x, y) { return ord[x.grp] - ord[y.grp] || x.a - y.a; });
  return out;
}

/* ---------- drops en vivo ---------- */
function liveDrops() {
  var C = rows('codigos'), nc = function (s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); };
  return rows('avisos').filter(function (a) { return a.tipo === 'drop' && avCode(a) && avEst(a) === 'activo'; }).map(function (a) {
    return { a: a, c: C.find(function (c) { return nc(c.mostrar) === nc(avCode(a)); }) };
  });
}
function dropLive(x) {
  var a = x.a, c = x.c, lim = c && c.usos_max != null, used = c ? c.usos : 0;
  var tot = new Date(a.fin) - new Date(a.inicio), el = Date.now() - new Date(a.inicio);
  return '<div class="card pad" style="border-color:var(--accent-line)"><div class="row nw" style="align-items:flex-start"><div class="grow"><div class="row">' + chip('En vivo', 'grad', 'zap') + '<span class="xs mut">Termina ' + relT(a.fin) + '</span></div>' +
    '<div class="row mt12"><span class="code big">' + esc(avCode(a)) + '</span><button class="btn sm ic" data-a="copy" data-t="' + esc(avCode(a)) + '" aria-label="Copiar">' + ic('copy') + '</button></div>' +
    '<div class="mt12 bar' + (lim && used >= c.usos_max ? ' warn' : '') + '"><i style="width:' + (lim ? Math.min(100, used * 100 / c.usos_max) : Math.min(100, el * 100 / tot)) + '%"></i></div>' +
    '<div class="row mt8 sm"><b>' + nf(used) + (lim ? ' de ' + nf(c.usos_max) : '') + '</b><span class="mut">canjes' + (lim ? ' · quedan ' + nf(Math.max(0, c.usos_max - used)) : '') + '</span><span class="grow"></span><span class="mut">' + (c ? 'Android ' + nf(c.android) + ' · iOS ' + nf(c.ios) : 'código no encontrado') + '</span></div>' +
    '<div class="row mt8 sm mut">' + nf(a.vistos) + ' lo vieron · ' + nf(a.clics) + ' tocaron «Canjear» · ' + pct(a.clics, a.vistos) + '</div>' +
    '<div class="row mt12"><button class="btn sm" data-a="dropEnd" data-id="' + esc(a.id) + '">' + ic('pause') + 'Terminar ya</button><button class="btn sm ghost" data-a="avEdit" data-id="' + esc(a.id) + '">' + ic('edit') + 'Editar aviso</button></div></div>' +
    '<div class="hide-sm" style="width:118px;height:243px;overflow:hidden;flex:none"><div style="transform:scale(.4126);transform-origin:top left;width:286px">' + avisoPhone(a) + '</div></div></div></div>';
}
A.dropEnd = async function (el) {
  var x = liveDrops().find(function (d) { return d.a.id === el.dataset.id; }); if (!x) return;
  if (!await confirmDlg({ title: '¿Terminar este drop ahora?', text: 'El aviso se apaga y el código deja de funcionar. Quien ya lo canjeó conserva su premio.', ok: 'Terminar', danger: true, icon: 'pause' })) return;
  try {
    var o = clone(x.a); o.activo = false; delete o.vistos; delete o.clics; await rpc('admin_guardar_aviso', { p_aviso: o });
    if (x.c) await rpc('admin_editar_codigo', { p_id: x.c.id, p_cambios: { activo: false } });
    toast('Drop terminado'); rload('avisos'); rload('codigos');
  } catch (e) { toast(e.message, 'bad'); }
};
var dropTimer = null;
function dropPoll() {
  clearInterval(dropTimer);
  dropTimer = setInterval(function () {
    if (document.visibilityState !== 'visible') return;
    if (!/^vivo|inicio/.test(S.route) || !liveDrops().length) return;
    rload('codigos', true); rload('avisos', true);
  }, 15000);
}

/* ---------- AHORA ---------- */
function vAhora() {
  ['eventos', 'avisos', 'codigos', 'config'].forEach(function (k) { rm(k); });
  var h = pageHead('Ahora en la app', 'Lo que ve cualquier persona que abra Blokku en este momento, y lo que viene en las próximas semanas. Todo esto cambia sin publicar una versión nueva.',
    '<button class="btn" data-a="liveReload">' + ic('refresh') + 'Actualizar</button><button class="btn pri" data-a="tplDrop">' + ic('zap') + 'Lanzar drop</button>',
    ['La app revisa Supabase <b>al abrirse y cada pocos minutos</b>. Lo que cambies aquí llega sin actualizar la app.', '<b>Eventos</b>: retos con fecha (por ejemplo «juega 5 partidas») que dan premios.', '<b>Avisos</b>: una <b>tarjeta</b> en el menú o un <b>drop</b> (ventana emergente). Pueden llevar un botón para canjear, ver un evento, abrir una página o actualizar.', 'La línea de tiempo junta lo remoto (morado y rosa) con lo que tienes planeado en el calendario (rayado).']);
  h += rerr(RM.eventos, 'los eventos') || rerr(RM.avisos, 'los avisos'); avProbe();
  var LD = liveDrops();
  if (LD.length) h += '<div class="sec" style="margin-top:0"><div class="sech"><h2>Drops en vivo</h2><span class="sub">Se actualiza solo cada 15 segundos.</span></div><div class="grid g2">' + LD.map(dropLive).join('') + '</div></div>';
  h += '<div class="sec" style="margin-top:' + (LD.length ? 28 : 0) + 'px"><div class="sech"><h2>Plantillas</h2><span class="sub">Un toque y se abre el editor con todo prellenado.</span></div>' + tplTiles() + '</div>';
  var from = Date.now() - 7 * 864e5, to = Date.now() + 49 * 864e5;
  h += '<div class="sec"><div class="sech"><h2>Próximas semanas</h2><span class="sub">Toca una barra para abrirla.</span></div><div class="card pad">' +
    (RM.eventos && RM.eventos.rows == null && !RM.eventos.err ? '<div class="sk" style="height:160px"></div>' : gantt(liveRows(from, to), from, to, { legend: [['#5b4cf0', 'Evento remoto'], ['#8a4be8', 'Tarjeta'], ['#e64aa0', 'Drop'], ['#0ea5e9', 'Actualización'], ['#d97706', 'Plan (aún no está en la app)']] })) + '</div></div>';
  /* vista como la app */
  var c = RM.config && RM.config.rows;
  h += '<div class="sec"><div class="sech"><h2>Así lo ve la app ahora</h2><span class="sub">Lo que devuelve Supabase a los teléfonos en este momento.</span></div>';
  if (!c) h += RM.config && RM.config.err ? '<div class="card pad mut">' + esc(RM.config.err.message) + '</div>' : '<div class="sk" style="height:300px"></div>';
  else {
    var ev = c.eventos || [], av = c.avisos || [], cards = av.filter(function (a) { return avFmt(a) === 'tarjeta'; }), banners = av.filter(function (a) { return avFmt(a) === 'banner'; }), drops = av.filter(function (a) { return avFmt(a) === 'ventana' || avFmt(a) === 'imagen'; });
    var inner = ev.map(eventCardPrev).join('') + cards.map(cardPrev).join('');
    h += '<div class="card pad"><div class="pvwrap" data-keep="pvw" style="justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap;padding:6px 4px 10px">' +
      '<div><div class="phone-sm">' + phone(inner || '<p style="font-size:12px;opacity:.7;text-align:center;margin:20px 0">Sin eventos ni tarjetas remotas</p>', '', banners.map(bannerPrev).join('')) + '</div><div class="pvcap">Menú principal</div></div>' +
      drops.map(function (a) { return '<div><div class="phone-sm">' + avisoPhone(a) + '</div><div class="pvcap">' + AV_FMT[avFmt(a)] + ': ' + esc(ml(a.titulo) || '¡Salió un código!') + '</div><div class="pvnote">' + targetTxt(a) + '</div></div>'; }).join('') +
      '</div>' + ((c.eventos_apagados || []).length ? '<p class="xs mut mt8">Apagados (la app deja de mostrarlos aunque los traiga de fábrica): ' + c.eventos_apagados.map(esc).join(', ') + '</p>' : '') +
      '<p class="xs mut mt8">La tarjeta y el drop se filtran en cada teléfono por plataforma y versión. Hora del servidor: ' + fdt(c.ahora) + '.</p></div>';
  }
  return h + '</div>';
}
A.liveReload = function () { rloadAll(); toast('Actualizando…', 'info'); };

/* ---------- AVISOS ---------- */
function avFilt(a, f) {
  var e = avEst(a);
  if (f === 'activo') return e === 'activo'; if (f === 'proximo') return e === 'proximo'; if (f === 'fin') return e === 'terminado' || e === 'inactivo';
  if (AV_FMT[f]) return avFmt(a) === f; if (f === 'upd') return isUpd(a); if (f === 'promo') return avBtns(a).some(function (b) { return b.accion === 'url'; });
  return true;
}
function avCard(a) {
  var e = avEst(a), v = a.vistos || 0, c = a.clics || 0, tot = new Date(a.fin) - new Date(a.inicio), el = Math.max(0, Math.min(1, (Date.now() - new Date(a.inicio)) / tot));
  return '<div class="card"><div class="row nw" style="align-items:stretch;gap:0"><div class="grow" style="padding:16px 18px"><div class="row">' + estChip(e) + chipN(AV_FMT[avFmt(a)], avFmt(a) === 'ventana' || avFmt(a) === 'imagen' ? 'grad' : 'ac') + (isUpd(a) ? chipN('Actualización', 'info') : '') + (a.plataforma ? chipN(a.plataforma === 'ios' ? 'Solo iOS' : 'Solo Android', 'line') : '') + (a.version_menor ? chipN('Versión < ' + a.version_menor, 'line') : '') + chipN({ una: 'Una vez', diaria: 'Diaria', siempre: 'Siempre' }[a.repetir] || 'Una vez', 'line') + '</div>' +
    '<h3 class="mt8" style="font-size:16px;font-weight:700;overflow-wrap:anywhere">' + esc(ml(a.titulo) || '(sin título)') + '</h3>' + (ml(a.texto) ? '<p class="sm mut mt4" style="overflow-wrap:anywhere">' + esc(ml(a.texto)) + '</p>' : '') +
    '<div class="sm mt8">' + ic('clock', 'faint') + ' ' + esc(fdt(a.inicio)) + ' → ' + esc(fdt(a.fin)) + ' <span class="mut">· ' + (e === 'activo' ? 'termina ' + relT(a.fin) : e === 'proximo' ? 'empieza ' + relT(a.inicio) : e === 'terminado' ? 'terminó ' + relT(a.fin) : 'apagado') + '</span></div>' +
    (e === 'activo' ? '<div class="bar mt8" style="max-width:360px"><i style="width:' + Math.round(el * 100) + '%"></i></div>' : '') +
    (avBtns(a).length ? '<div class="row mt8 sm mut">' + avBtns(a).map(function (b) { return '<span class="chip line">' + esc(btLabel(b)) + '</span>' + (b.destino ? '<span class="mono xs" style="overflow-wrap:anywhere">' + esc(b.destino) + '</span>' : '<span class="xs">' + esc((BT_ACC.filter(function (x) { return x[0] === b.accion; })[0] || [0, ''])[1]) + '</span>'); }).join(' ') + '</div>' : '') +
    '<div class="row mt12" style="gap:18px"><div><b style="font-size:18px">' + nf(v) + '</b> <span class="xs mut">vistos</span></div><div><b style="font-size:18px">' + nf(c) + '</b> <span class="xs mut">clics</span></div><div><b style="font-size:18px">' + pct(c, v) + '</b> <span class="xs mut">CTR</span></div></div>' +
    '<div class="row mt12"><button class="btn sm" data-a="avEdit" data-id="' + esc(a.id) + '">' + ic('edit') + 'Editar</button><button class="btn sm" data-a="avTog" data-id="' + esc(a.id) + '">' + ic(a.activo ? 'pause' : 'play') + (a.activo ? 'Apagar' : 'Encender') + '</button><button class="btn sm ghost" data-a="avDup" data-id="' + esc(a.id) + '">' + ic('dup') + 'Duplicar</button><button class="btn sm ghost dng" data-a="avDel" data-id="' + esc(a.id) + '">' + ic('trash') + 'Borrar</button></div></div>' +
    '<button class="avpv" data-a="avEdit" data-id="' + esc(a.id) + '" aria-label="Vista previa"><div class="avpvi">' + avisoPhone(a) + '</div></button></div></div>';
}
function vAvisos() {
  rm('avisos'); rm('codigos'); rm('eventos');
  var f = S.f.av || 'todos', R = rows('avisos').slice().sort(function (x, y) { var o = { activo: 0, proximo: 1, inactivo: 2, terminado: 3 }; return o[avEst(x)] - o[avEst(y)] || new Date(y.inicio) - new Date(x.inicio); });
  var cnt = function (k) { return R.filter(function (a) { return avFilt(a, k); }).length; };
  var h = pageHead('Avisos y drops', 'Mensajes que aparecen en la app sin actualizarla. Tú eliges el formato, los botones, la imagen y el color, o arrancas desde una plantilla.',
    '<button class="btn" data-a="tplDrop">' + ic('zap') + 'Lanzar drop</button><button class="btn pri" data-a="avNew">' + ic('plus') + 'Nuevo aviso</button>',
    ['<b>Tarjeta</b>: sale en el menú principal, debajo de «Jugar». El jugador la cierra con la ✕. Con imagen, ésta va como franja arriba.', '<b>Ventana</b>: emergente al abrir la app (o con ella abierta). Úsala para algo importante, como un código con pocos lugares o «actualiza».', '<b>Imagen</b>: emergente donde una imagen grande es la protagonista. Ideal para promos de otras apps.', '<b>Banner</b>: una franja delgada arriba del menú; toda la franja es el botón.', '<b>Botones</b> (hasta 2): abrir un link, ir a la tienda, abrir un evento, canjear un código, abrir Personalizar, jugar, ir al reto diario o solo cerrar. Cada uno puede ser principal (dorado) o secundario.', '<b>Frecuencia</b>: «una vez» se muestra una sola vez por teléfono; «diaria» una vez al día; «siempre» cada vez que abre la app mientras esté vigente.', '<b>Versión menor que…</b>: solo lo ven teléfonos con una versión más vieja. Ideal para «actualiza».', 'Los <b>vistos</b> y <b>clics</b> los manda la app; el CTR es clics ÷ vistos.']);
  h += rerr(RM.avisos, 'los avisos'); avProbe();
  if (R.length && R[0].version_menor === undefined) h += '<div class="ban">' + ic('warn') + '<div class="tx"><b>Falta volver a correr 2-remoto.sql en Supabase</b>Hasta entonces los avisos no guardan versión, plataforma, frecuencia ni el botón de tienda.</div></div>';
  h += '<div class="sech"><h2>Plantillas</h2><span class="sub">Un toque y se abre el editor con todo prellenado.</span></div>' + tplTiles();
  h += '<div class="sec"><div class="row mb16">' + fchips('avF', f, [['todos', 'Todos', R.length], ['activo', 'Activos', cnt('activo')], ['proximo', 'Próximos', cnt('proximo')], ['fin', 'Terminados y apagados', cnt('fin')], ['tarjeta', 'Tarjetas', cnt('tarjeta')], ['ventana', 'Ventanas', cnt('ventana')], ['imagen', 'Imágenes', cnt('imagen')], ['banner', 'Banners', cnt('banner')], ['upd', 'Actualizaciones', cnt('upd')], ['promo', 'Promos', cnt('promo')]]) + '</div>';
  var L = R.filter(function (a) { return avFilt(a, f); });
  if (RM.avisos && RM.avisos.rows == null && !RM.avisos.err) h += skel(3);
  else if (!L.length) h += '<div class="card">' + emptyBox('bell', R.length ? 'Ningún aviso con ese filtro' : 'Todavía no hay avisos', R.length ? 'Prueba con «Todos».' : 'Crea uno desde cero o usa una plantilla de arriba.', R.length ? '' : '<button class="btn pri" data-a="avNew">' + ic('plus') + 'Nuevo aviso</button>') + '</div>';
  else h += '<div class="col gap12">' + L.map(avCard).join('') + '</div>';
  return h + '</div>';
}
A.avF = function (el) { S.f.av = el.dataset.v; paintPage(); };
A.avNew = function () { avForm(null); };
A.avEdit = function (el) { var a = rows('avisos').find(function (x) { return x.id === el.dataset.id; }); if (a) avForm(a); };
A.avDup = function (el) { var a = rows('avisos').find(function (x) { return x.id === el.dataset.id; }); if (!a) return; var c = clone(a); delete c.id; c.titulo = { es: (ml(a.titulo) || '') + ' (copia)', en: (a.titulo || {}).en || '' }; c.activo = false; avForm(null, c); };
A.avTog = async function (el) {
  var a = rows('avisos').find(function (x) { return x.id === el.dataset.id; }); if (!a) return;
  var o = clone(a); o.activo = !a.activo; delete o.vistos; delete o.clics; delete o.actualizado;
  try { await rpc('admin_guardar_aviso', { p_aviso: o }); a.activo = o.activo; toast(o.activo ? 'Aviso encendido' : 'Aviso apagado'); rload('avisos'); rload('config'); paintPage(); } catch (e) { toast(e.message, 'bad'); }
};
A.avDel = async function (el) {
  var a = rows('avisos').find(function (x) { return x.id === el.dataset.id; }); if (!a) return;
  if (!await confirmDlg({ title: '¿Borrar este aviso?', text: '«' + (ml(a.titulo) || 'sin título') + '» desaparece de la app y se pierden sus vistos y clics. Si solo quieres pausarlo, mejor apágalo.', ok: 'Borrar', danger: true })) return;
  try { await rpc('admin_borrar_aviso', { p_id: a.id }); if (a.imagen_id && !avImgUsed(a.imagen_id, a.id)) rpc('admin_borrar_imagen', { p_id: a.imagen_id }).catch(function () { }); toast('Aviso borrado'); drawerKill(); rload('avisos'); rload('config'); } catch (e) { toast(e.message, 'bad'); }
};
OPENERS.av = function (id) { var go2 = function () { var a = rows('avisos').find(function (x) { return x.id === id; }); if (a) avForm(a); }; if (RM.avisos && RM.avisos.rows) go2(); else rload('avisos').then(go2); };

/* ---------- plantillas ---------- */
/* lanzar drop: código con caducidad + aviso tipo drop */
function openDrop() {
  formDrawer({
    wide: true, title: 'Lanzar drop', sub: 'Un código con pocos lugares que aparece como ventana a quien tenga la app abierta.',
    body: function () {
      var f = '<div class="fsec"><h4>Premio</h4>' + field('dr_pr', 'Qué gana quien lo canjee', picker('drp', [], { onChange: dropPrevNow })) + '</div>';
      f += '<div class="fsec"><h4>Código</h4><div class="fg">' + field('dr_us', 'Lugares (cuántos pueden canjearlo)', inp('dr_us', 10, { type: 'number', min: 1, mode: 'numeric', di: 'drPrev' })) + field('dr_tx', 'Texto del código (opcional)', inp('dr_tx', '', { ph: 'Ej. NAVIDAD26 · vacío = al azar', max: 20, di: 'drPrev' }), '4 a 20 letras o números.') + '</div>' +
        '<div class="fg">' + field('dr_n', 'Dura', inp('dr_n', 15, { type: 'number', min: 1, mode: 'numeric', di: 'drPrev' })) + field('dr_u', 'Unidad', sel('dr_u', 'min', [['min', 'minutos'], ['h', 'horas'], ['d', 'días']], { dc: 'drPrevC' })) + '</div></div>';
      f += '<div class="fsec"><h4>Mensaje</h4>' + field('dr_ti', 'Título', inp('dr_ti', '¡Salió un código!', { max: 60, di: 'drPrev' })) + field('dr_te', 'Texto', inp('dr_te', '', { ph: 'Vacío = «Quedan N lugares. ¡Canjéalo ya!»', max: 120, di: 'drPrev' })) + '</div>';
      return '<div class="edl"><div>' + f + '</div><div class="pvs"><div id="dr_pv"></div><div class="pvcap">Así le saldrá a quien tenga la app abierta</div></div></div>';
    },
    foot: function () { return '<span class="xs mut grow">Se crea un código y un aviso «drop» con la misma duración.</span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="dropGo">' + ic('zap') + 'Lanzar ahora</button>'; },
    onMount: function () { dropPrevNow(); }
  });
}
function dropRead() {
  var u = Math.floor(Number(drawerVal('dr_us'))), n = Math.floor(Number(drawerVal('dr_n'))), mult = { min: 6e4, h: 36e5, d: 864e5 }[drawerVal('dr_u')] || 6e4;
  var tx = drawerVal('dr_te').trim() || 'Quedan ' + (u || 0) + ' lugares. ¡Canjéalo ya!';
  return { u: u, ms: n * mult, n: n, sel: pkSel('drp'), code: drawerVal('dr_tx').trim(), titulo: drawerVal('dr_ti').trim() || '¡Salió un código!', texto: tx, custom: !!drawerVal('dr_te').trim() };
}
function dropPrevNow() { var d = dropRead(), b = $('#dr_pv'); if (b) b.innerHTML = phone('', dropPrev({ tipo: 'drop', formato: 'ventana', titulo: { es: d.titulo }, texto: { es: d.texto }, botones: [bt('canjear', 'primario', d.code ? d.code.toUpperCase() : 'BK-XXXX-XXXX-XXXX', 'Canjear ahora', 'Redeem now'), bt('cerrar', 'secundario')], premio: d.sel[0] || '' })); }
I.drPrev = debounce(dropPrevNow, 80); C.drPrevC = dropPrevNow;
A.dropGo = async function (el) {
  var d = dropRead(), e = {};
  if (!d.sel.length) e.dr_pr = 'Elige al menos un premio';
  if (!(d.u >= 1)) e.dr_us = 'Un número de 1 en adelante';
  if (!(d.n >= 1) || d.ms > 90 * 864e5) e.dr_n = 'De 1 minuto a 90 días';
  if (d.code && !/^[A-Za-z0-9 -]{4,24}$/.test(d.code)) e.dr_tx = '4 a 20 letras o números';
  if (!showErrs(e)) return;
  busy(el, true, 'Lanzando…');
  var fin = addMs(d.ms).toISOString(), c;
  try {
    var r = await rpc('admin_crear_codigos', { p_cosmeticos: d.sel, p_cantidad: 1, p_usos_max: d.u, p_caduca: fin, p_etiqueta: 'drop ' + fdt(new Date()), p_texto: d.code || null });
    c = r && r[0]; if (!c) throw new Error('No se creó el código');
  } catch (er) { busy(el, false); toast(er.message, 'bad'); return; }
  try {
    await rpc('admin_guardar_aviso', { p_aviso: { tipo: 'drop', titulo: { es: d.titulo, en: d.titulo === '¡Salió un código!' ? 'A code just dropped!' : d.titulo }, texto: { es: d.texto, en: d.custom ? d.texto : d.u + ' spots left. Redeem it now!' }, inicio: new Date(Date.now() - 60000).toISOString(), fin: fin, accion: 'canjear', destino: c.mostrar, formato: 'ventana', botones: [bt('canjear', 'primario', c.mostrar, 'Canjear ahora', 'Redeem now'), bt('cerrar', 'secundario')], premio: d.sel[0], imagen: '', activo: true, orden: 0, repetir: 'una', plataforma: '', version_menor: '' } });
    toast('Drop lanzado: ' + c.mostrar); drawerKill(); rload('codigos'); rload('avisos'); rload('config'); go('vivo/ahora');
  } catch (er) { busy(el, false); rload('codigos'); toast('El código ' + c.mostrar + ' se creó, pero el aviso falló: ' + er.message, 'bad'); }
};

/* cupón de temporada: código que caduca + tarjeta para canjearlo */
A.tplSeason = function () {
  formDrawer({
    wide: true, title: 'Cupón de temporada', sub: 'Un código que sirve hasta una fecha y una ventana emergente para canjearlo.',
    body: function () {
      var f = '<div class="fsec"><h4>Premio</h4>' + field('se_pr', 'Qué da el cupón', picker('sep', [], { onChange: seasonPrev })) + '</div>';
      f += '<div class="fsec"><h4>Código</h4><div class="fg">' + field('se_tx', 'Texto del código', inp('se_tx', '', { ph: 'Ej. MUERTOS26 · vacío = al azar', max: 20, di: 'sePrev' }), '4 a 20 letras o números.') + field('se_us', 'Usos', inp('se_us', '', { type: 'number', min: 1, ph: 'Vacío = sin límite', mode: 'numeric' })) + '</div></div>';
      f += '<div class="fsec"><h4>Temporada</h4><div class="fg">' + field('se_ini', 'Empieza', inp('se_ini', toLocalInput(new Date()), { type: 'datetime-local' })) + field('se_fin', 'Termina (el código caduca)', inp('se_fin', toLocalInput(addMs(14 * 864e5)), { type: 'datetime-local' })) + '</div>' + presetBtns('se_ini,se_fin', [[7 * 864e5, '1 semana'], [14 * 864e5, '2 semanas'], [30 * 864e5, '1 mes']]) + '</div>';
      f += '<div class="fsec"><h4>Ventana</h4>' + field('se_ti', 'Título', inp('se_ti', 'Cupón de temporada', { max: 80, di: 'sePrev' })) + field('se_te', 'Texto', area('se_te', 'Canjea este código antes de que se acabe la temporada.', { rows: 2, di: 'sePrev' })) + field('se_et', 'Etiqueta (para ubicarlo)', inp('se_et', 'temporada', { max: 60 })) + '</div>';
      return '<div class="edl"><div>' + f + '</div><div class="pvs"><div id="se_pv"></div><div class="pvcap">Ventana al abrir la app</div></div></div>';
    },
    foot: function () { return '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="seasonGo">' + ic('spark') + 'Crear cupón y ventana</button>'; },
    onMount: seasonPrev
  });
};
function seasonPrev() { var b = $('#se_pv'); if (b) b.innerHTML = phone('', dropPrev({ tipo: 'drop', formato: 'ventana', titulo: { es: drawerVal('se_ti') }, texto: { es: drawerVal('se_te') }, botones: [bt('canjear', 'primario', (drawerVal('se_tx') || 'BK-XXXX').toUpperCase()), bt('cerrar', 'secundario')], premio: pkSel('sep')[0] || '' })); }
I.sePrev = debounce(seasonPrev, 80);
A.seasonGo = async function (el) {
  var sel2 = pkSel('sep'), tx = drawerVal('se_tx').trim(), us = drawerVal('se_us').trim(), ini = fromLocalInput(drawerVal('se_ini')), fin = fromLocalInput(drawerVal('se_fin')), e = {};
  if (!sel2.length) e.se_pr = 'Elige al menos un premio';
  if (tx && !/^[A-Za-z0-9 -]{4,24}$/.test(tx)) e.se_tx = '4 a 20 letras o números';
  if (us && !(Math.floor(Number(us)) >= 1)) e.se_us = 'Un número de 1 en adelante, o vacío';
  if (!ini) e.se_ini = 'Elige la fecha'; if (!fin) e.se_fin = 'Elige la fecha';
  if (ini && fin && new Date(fin) <= new Date(ini)) e.se_fin = 'Debe terminar después de empezar';
  if (fin && new Date(fin) <= new Date()) e.se_fin = 'Esa fecha ya pasó';
  if (!drawerVal('se_ti').trim()) e.se_ti = 'Escribe un título';
  if (!showErrs(e)) return;
  busy(el, true, 'Creando…');
  try {
    var r = await rpc('admin_crear_codigos', { p_cosmeticos: sel2, p_cantidad: 1, p_usos_max: us ? Math.floor(Number(us)) : null, p_caduca: fin, p_etiqueta: drawerVal('se_et').trim(), p_texto: tx || null });
    var c = r && r[0]; if (!c) throw new Error('No se creó el código');
    await rpc('admin_guardar_aviso', { p_aviso: { tipo: 'drop', formato: 'ventana', botones: [bt('canjear', 'primario', c.mostrar), bt('cerrar', 'secundario')], titulo: { es: drawerVal('se_ti').trim(), en: drawerVal('se_ti').trim() }, texto: { es: drawerVal('se_te').trim(), en: drawerVal('se_te').trim() }, inicio: ini, fin: fin, accion: 'canjear', destino: c.mostrar, premio: sel2[0], imagen: '', activo: true, orden: 0, repetir: 'una', plataforma: '', version_menor: '' } });
    toast('Cupón ' + c.mostrar + ' y ventana creados'); drawerKill(); rload('codigos'); rload('avisos'); rload('config'); go('vivo/avisos');
  } catch (er) { busy(el, false); toast(er.message, 'bad'); rload('codigos'); }
};

/* ---------- EVENTOS ---------- */
function evCard(e) {
  var st = evEst(e), tot = new Date(e.fin) - new Date(e.inicio), el = Math.max(0, Math.min(1, (Date.now() - new Date(e.inicio)) / tot)), P = e.premios || [];
  return '<div class="card pad"><div class="row">' + estChip(st) + '<span class="code" style="font-size:12px">' + esc(e.id) + '</span>' + (REPLACES[e.id] ? chipN('Reemplaza al que trae la app', 'info') : '') + '</div>' +
    '<h3 class="mt8" style="font-size:17px;font-weight:700">' + esc(ml(e.nombre) || e.id) + '</h3>' + (ml(e.descripcion) ? '<p class="sm mut mt4">' + esc(ml(e.descripcion)) + '</p>' : '') +
    '<div class="row mt12 sm">' + ic('trophy', 'faint') + '<b>' + esc(goalTxt(e.meta, e.objetivo)) + '</b></div>' +
    '<div class="row mt8 sm">' + ic('clock', 'faint') + esc(fdt(e.inicio)) + ' → ' + esc(fdt(e.fin)) + ' <span class="mut">· ' + (st === 'activo' ? 'termina ' + relT(e.fin) : st === 'proximo' ? 'empieza ' + relT(e.inicio) : st === 'terminado' ? 'terminó ' + relT(e.fin) : 'apagado') + '</span></div>' +
    (st === 'activo' ? '<div class="bar mt8"><i style="width:' + Math.round(el * 100) + '%"></i></div>' : '') +
    '<div class="row mt12">' + P.map(function (c) { var p = pc(c); return '<button class="pkc" data-a="premOpenCid" data-c="' + esc(c) + '" style="padding-right:10px">' + cthumb(c) + esc(p ? p.nombre : c) + '</button>'; }).join('') + '</div>' +
    '<div class="row mt12"><button class="btn sm" data-a="evEdit" data-id="' + esc(e.id) + '">' + ic('edit') + 'Editar</button><button class="btn sm" data-a="evTog" data-id="' + esc(e.id) + '">' + ic(e.activo ? 'pause' : 'play') + (e.activo ? 'Apagar' : 'Encender') + '</button><button class="btn sm ghost" data-a="evDup" data-id="' + esc(e.id) + '">' + ic('dup') + 'Duplicar</button><button class="btn sm ghost dng" data-a="evDel" data-id="' + esc(e.id) + '">' + ic('trash') + 'Borrar</button></div></div>';
}
function vEventos() {
  rm('eventos'); var cfg = rm('config');
  var R = rows('eventos').slice().sort(function (a, b) { var o = { activo: 0, proximo: 1, inactivo: 2, terminado: 3 }; return o[evEst(a)] - o[evEst(b)] || new Date(a.inicio) - new Date(b.inicio); });
  var h = pageHead('Eventos', 'Retos con fecha que dan premios («juega 5 partidas entre tal y tal día»). Se crean, mueven o apagan aquí y la app los toma sola.',
    '<button class="btn pri" data-a="evNew">' + ic('plus') + 'Nuevo evento</button>',
    ['La app muestra el evento en el menú <b>desde 45 días antes</b> («Empieza en N días») y cuenta el progreso solo mientras está activo.', 'Los ids <b>muertos26</b> y <b>pionero</b> son los eventos que la 1.0.5 trae de fábrica: si los editas aquí, cambias sus fechas o premios sin versión nueva.', '<b>Apagar</b> deja de mostrarlo y de contar progreso. <b>Borrar</b> lo quita y la app lo apaga aunque ya lo tuviera guardado.', 'Las horas son las de tu teléfono o computadora (hora de México).']);
  h += rerr(RM.eventos, 'los eventos');
  if (RM.eventos && RM.eventos.rows == null && !RM.eventos.err) h += skel(3);
  else if (!R.length) h += '<div class="card">' + emptyBox('cal', 'Sin eventos remotos', 'Crea el primero: elige fechas, una meta y los premios.', '<button class="btn pri" data-a="evNew">' + ic('plus') + 'Nuevo evento</button>') + '</div>';
  else h += '<div class="grid g2">' + R.map(evCard).join('') + '</div>';
  var off = ((cfg.rows && cfg.rows.eventos_apagados) || []).filter(function (id) { return !R.some(function (e) { return e.id === id; }); });
  if (off.length) h += '<div class="sec"><div class="sech"><h2>Borrados</h2><span class="sub">La app los mantiene apagados. Crear uno con el mismo id lo revive.</span></div><div class="row">' + off.map(function (id) { return '<span class="code">' + esc(id) + '</span>'; }).join('') + '</div></div>';
  return h;
}
A.evNew = function () { evForm(null); };
A.evEdit = function (el) { var e = rows('eventos').find(function (x) { return x.id === el.dataset.id; }); if (e) evForm(e); };
A.evDup = function (el) { var e = rows('eventos').find(function (x) { return x.id === el.dataset.id; }); if (!e) return; var c = clone(e); c.id = ''; c.activo = false; evForm(null, c); };
A.evTog = async function (el) {
  var e = rows('eventos').find(function (x) { return x.id === el.dataset.id; }); if (!e) return;
  var o = clone(e); o.activo = !e.activo; delete o.actualizado;
  try { await rpc('admin_guardar_evento', { p_evento: o }); toast(o.activo ? 'Evento encendido' : 'Evento apagado'); rload('eventos'); rload('config'); } catch (er) { toast(er.message, 'bad'); }
};
A.evDel = async function (el) {
  var e = rows('eventos').find(function (x) { return x.id === el.dataset.id; }); if (!e) return;
  if (!await confirmDlg({ title: '¿Borrar el evento ' + e.id + '?', text: 'La app lo apagará aunque ya lo tenga guardado, y se pierde el progreso de los jugadores.' + (REPLACES[e.id] ? ' Como trae uno de fábrica con este id, también ese quedará apagado.' : ' Si solo quieres pausarlo, mejor apágalo.'), ok: 'Borrar', danger: true })) return;
  try { await rpc('admin_borrar_evento', { p_id: e.id }); toast('Evento borrado'); drawerKill(); rload('eventos'); rload('config'); } catch (er) { toast(er.message, 'bad'); }
};
A.premOpenCid = function (el) { var p = pc(el.dataset.c); if (p) premDrawer(p.id); };
OPENERS.ev = function (id) { var g = function () { var e = rows('eventos').find(function (x) { return x.id === id; }); if (e) evForm(e); }; if (RM.eventos && RM.eventos.rows) g(); else rload('eventos').then(g); };
function evForm(e, pre) {
  var isNew = !e, v = Object.assign({ id: '', nombre: {}, descripcion: {}, inicio: new Date().toISOString(), fin: addMs(7 * 864e5).toISOString(), meta: 'partidas', objetivo: 5, premios: [], activo: true }, e || {}, pre || {});
  formDrawer({
    wide: true, title: isNew ? 'Nuevo evento' : 'Editar evento', sub: isNew ? 'Elige fechas, una meta y qué premios da.' : esc(v.id) + ' · ' + esc(EST_L[evEst(v)]),
    body: function () {
      var f = '<div class="fsec"><h4>Nombre</h4>' + field('ev_id', 'Id (no se puede cambiar después)', inp('ev_id', v.id, { ph: 'Ej. navidad26', max: 40, dis: !isNew, di: 'evPrev' }), 'Minúsculas, números y _. Usa muertos26 o pionero para mover los que trae la app.') +
        field('ev_nes', 'Nombre', inp('ev_nes', (v.nombre || {}).es, { ph: 'Ej. Navidad', max: 60, di: 'evPrev' })) + field('ev_des', 'Descripción', area('ev_des', (v.descripcion || {}).es, { rows: 2, ph: 'Ej. Juega 5 partidas y llévate…' })) +
        '<details class="help" style="margin:0 0 12px"><summary>' + ic('chr', 'chev') + 'Versión en inglés (opcional)</summary><div style="margin-top:10px">' + field('ev_nen', 'Nombre en inglés', inp('ev_nen', (v.nombre || {}).en, { max: 60 })) + field('ev_den', 'Descripción en inglés', area('ev_den', (v.descripcion || {}).en, { rows: 2 })) + '</div></details></div>';
      f += '<div class="fsec"><h4>Cuándo</h4><div class="fg">' + field('ev_ini', 'Empieza', inp('ev_ini', toLocalInput(v.inicio), { type: 'datetime-local', di: 'evPrev' })) + field('ev_fin', 'Termina', inp('ev_fin', toLocalInput(v.fin), { type: 'datetime-local', di: 'evPrev' })) + '</div>' + presetBtns('ev_ini,ev_fin', [[3 * 864e5, '3 días'], [7 * 864e5, '1 semana'], [14 * 864e5, '2 semanas'], [30 * 864e5, '1 mes']]) + '</div>';
      f += '<div class="fsec"><h4>Meta</h4><div class="fg">' + field('ev_meta', 'Qué hay que hacer', sel('ev_meta', v.meta, [['partidas', 'Jugar partidas'], ['lineas', 'Limpiar líneas'], ['puntos', 'Hacer puntos en una partida'], ['retos', 'Completar retos diarios']], { dc: 'evPrevC' })) + field('ev_obj', 'Cantidad', inp('ev_obj', v.objetivo, { type: 'number', min: 1, mode: 'numeric', di: 'evPrev' })) + '</div><div class="sm mut" id="ev_goal" style="margin:-6px 0 8px">En la app dirá: <b style="color:var(--text)">' + esc(goalTxt(v.meta, v.objetivo)) + '</b></div></div>';
      f += '<div class="fsec"><h4>Premios</h4>' + field('ev_pr', 'Qué da al completarlo', picker('evp', v.premios || [], { onChange: evPrevNow })) + '</div>';
      f += '<div class="fsec"><h4>Estado</h4>' + tog('ev_act', v.activo !== false, 'Encendido') + '</div>';
      return '<div class="edl"><div>' + f + '</div><div class="pvs"><div id="ev_pv"></div><div class="pvcap">Tarjeta del evento en el menú</div></div></div>';
    },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="evDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="evSave" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + (isNew ? 'Crear evento' : 'Guardar') + '</button>'; },
    onMount: function () { evPrevNow(); }
  });
}
function evRead() { return { id: drawerVal('ev_id').trim(), nombre: { es: drawerVal('ev_nes').trim(), en: drawerVal('ev_nen').trim() || drawerVal('ev_nes').trim() }, descripcion: { es: drawerVal('ev_des').trim(), en: drawerVal('ev_den').trim() || drawerVal('ev_des').trim() }, inicio: fromLocalInput(drawerVal('ev_ini')), fin: fromLocalInput(drawerVal('ev_fin')), meta: drawerVal('ev_meta'), objetivo: Math.floor(Number(drawerVal('ev_obj'))) || 0, premios: pkSel('evp'), activo: !!drawerVal('ev_act') }; }
function evPrevNow() { var e = evRead(), b = $('#ev_pv'), g = $('#ev_goal'); if (g) g.innerHTML = 'En la app dirá: <b style="color:var(--text)">' + esc(goalTxt(e.meta, e.objetivo || 0)) + '</b>'; if (b && e.inicio && e.fin) b.innerHTML = phone(eventCardPrev(e)); }
I.evPrev = debounce(evPrevNow, 80); C.evPrevC = evPrevNow;
A.evSave = async function (el) {
  var o = evRead(), e = {}, isNew = !!el.dataset.new;
  if (!/^[a-z0-9_]{2,40}$/.test(o.id)) e.ev_id = '2 a 40 caracteres: minúsculas, números o _';
  else if (isNew && rows('eventos').some(function (x) { return x.id === o.id; })) e.ev_id = 'Ya existe un evento con ese id';
  if (!o.nombre.es) e.ev_nes = 'Escribe el nombre';
  if (!o.inicio) e.ev_ini = 'Elige la fecha'; if (!o.fin) e.ev_fin = 'Elige la fecha';
  if (o.inicio && o.fin && new Date(o.fin) <= new Date(o.inicio)) e.ev_fin = 'Debe terminar después de empezar';
  if (!(o.objetivo > 0)) e.ev_obj = 'Mayor que 0';
  if (!o.premios.length) e.ev_pr = 'Elige al menos un premio';
  if (!showErrs(e)) return;
  busy(el, true);
  try { await rpc('admin_guardar_evento', { p_evento: o }); toast(isNew ? 'Evento creado' : 'Evento guardado'); drawerKill(); rload('eventos'); rload('config'); }
  catch (er) { busy(el, false); toast(er.message, 'bad'); }
};

VIEWS['vivo/ahora'] = vAhora; VIEWS['vivo/avisos'] = vAvisos; VIEWS['vivo/eventos'] = vEventos;
