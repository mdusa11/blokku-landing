/* ================= ESCAPARATE DE LA TIENDA (33-tienda-escaparate.sql, app 2.0) ================= */
// Todo por admin_escaparate(p_clave, p_accion, p_datos): siempre devuelve el estado completo
// {activo, secciones[{id,visible}], temporada{evento,titulo,sub,colores,items,paquetes,desde,hasta}|null,
//  banners[{id,tipo,ref,imagen,titulo,sub,cinta,color,desde,hasta,orden,activo}],
//  colecciones[{id,nombre,color,icono,paquetes,premios,orden,activa,reclamos}], premios[ids], reclamos, ahora}.
//   'activo' {valor}  ·  'secciones' {lista:[{id,visible}]}  ·  'temporada' {temporada|null}
//   'banner_guardar' {banner}  ·  'banner_borrar' {id}  ·  'coleccion_guardar' {coleccion}  ·  'coleccion_borrar' {id}
//   'premio_agregar' {id}  ·  'premio_quitar' {id}
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.escaparate = '33-tienda-escaparate.sql';
FNF.admin_escaparate = 'escaparate';
RFN.escaparate = 'admin_escaparate';
N20['juego/escaparate'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/escaparate'; })) g.items.push(['juego/escaparate', 'Escaparate', 'store']);
  ROUTES['juego/escaparate'] = { t: 'Escaparate', ic: 'store', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/escaparate'] = {
  que: 'El escaparate de la tienda nueva de la app 2.0: el carrusel «Destacado» (banners), las colecciones de paquetes con premio por completarlas, el orden de las secciones de la tienda y la temporada «Feria» (toldo y papel picado ligados a un evento del motor). Aquí enciendes o apagas todo el escaparate y lo armas sin sacar versión.',
  ve: 'En la tienda, arriba: un carrusel con tus banners (un paquete mítico a la venta, un cosmético o una imagen tuya, con cinta, título y color), después las secciones en el orden que elijas. Las colecciones salen como tarjetas con los paquetes que las forman y un botón para reclamar el premio al completarlas. En temporada, el puesto de la Feria lleva toldo y papel picado con tus colores.',
  cuando: 'Cambia los banners con cada lanzamiento o promoción, y programa fechas «desde / hasta» para que entren y salgan solos. Arma una colección cuando haya 2 a 8 paquetes con una temática. Enciende la temporada junto con su evento. El escaparate nace APAGADO: mientras esté apagado, la app usa sus reglas de siempre y la tienda se ve como de fábrica.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Sin el SQL o con el interruptor apagado, la app usa sus reglas locales y no pasa nada raro.',
    '<b>Interruptor:</b> encenderlo o apagarlo afecta a los jugadores en vivo. Los cambios llegan a la app en 30 minutos como máximo (la app guarda la configuración en caché ese tiempo).',
    '<b>Banners:</b> hasta 8 se muestran a la vez, ordenados por «orden» (menor primero) y solo los activos dentro de sus fechas. Tipo <b>paquete</b>: el id de un paquete mítico (ej. taqueria). Tipo <b>cosmético</b>: un objeto del catálogo de Bloques (ej. theme_galaxy). Tipo <b>imagen</b>: una imagen que subes aquí (se ajusta sola a 1080 px y menos de 300 KB) y, si quieres, el paquete o cosmético al que lleva el toque. Los textos son en 15 idiomas; mínimo español e inglés, y los idiomas sin texto usan el inglés.',
    '<b>Colecciones:</b> de 2 a 8 paquetes y de 0 a 3 premios. Al completarla, el jugador toca «Reclamar» y <b>el servidor</b> entrega los premios, una sola vez por jugador y colección (repetir la petición devuelve lo mismo). Borrar una colección no quita lo ya reclamado.',
    '<b>Anti-trampa de las colecciones:</b> el teléfono solo pide «reclamar»; el servidor comprueba que el jugador (y las cuentas que se le unieron) tenga TODOS los objetos de cada paquete según lo que él sabe: compras con dinero no revocadas, compras con Bloques y códigos canjeados con la cuenta del ranking. Para que cuenten los códigos hay que encender «Quién canjea» (SQL 32). Lo que se ganó sin dejar rastro en el servidor (códigos viejos anónimos, drops) no cuenta, y la app lo explica.',
    '<b>Premios de colección:</b> solo pueden ser objetos ocultos que la app ya conozca (hoy <span class="mono">badge_coleccionista</span> y <span class="mono">title_coleccionista</span>). Si agregas otro id que la app no tenga, el jugador recibiría un objeto que no existe. No puede ser un objeto que se venda en la tienda, y no se puede quitar un premio que una colección esté usando.',
    '<b>Secciones:</b> el orden y la visibilidad de las 14 secciones de la tienda. Una sección oculta desaparece de la tienda; si su contenido no existe (por ejemplo, no hay colecciones activas), la app la esconde sola.',
    '<b>Temporada «Feria»:</b> se liga a un evento del motor (opcional), con título y subtítulo en idiomas, de 2 a 6 colores (el primero es el toldo; los demás, el papel picado), hasta 12 objetos y 6 paquetes en el puesto, y fechas. «Quitar temporada» la borra.',
    '<b>Cuánto tarda:</b> los banners, colecciones, secciones y la temporada llegan a la app en 30 minutos como máximo. El reclamo de premios usa lo nuevo al instante.',
    H_HORA
  ]
};

var TE = { saving: '', ban: null, col: null, sel: {}, sec: null, td: {}, tc: null, ti: null, tp: null, fresh: {}, orig: '', imid: '', imMeta: null, imLoading: '' };
var TE_LANGS = [['es', 'Español'], ['en', 'Inglés'], ['pt', 'Portugués'], ['fr', 'Francés'], ['de', 'Alemán'], ['it', 'Italiano'], ['ja', 'Japonés'], ['ko', 'Coreano'], ['zh', 'Chino'], ['ru', 'Ruso'], ['ar', 'Árabe'], ['hi', 'Hindi'], ['id', 'Indonesio'], ['tr', 'Turco'], ['vi', 'Vietnamita']];
var TE_ICONOS = [['star', 'Estrella'], ['flag', 'Bandera'], ['leaf', 'Hoja'], ['sparkle', 'Destello'], ['heart', 'Corazón'], ['trophy', 'Trofeo'], ['diamond', 'Diamante'], ['pumpkin', 'Calabaza'], ['snowflake', 'Copo de nieve'], ['gift', 'Regalo'], ['bookmark', 'Marcador']];
var TE_SECS = [
  ['destacado', 'Destacado', 'El carrusel de banners.'], ['ofertas', 'Ofertas del día', 'Las 4 ofertas que rotan a medianoche UTC.'], ['gratis', 'Gratis', 'Objetos gratuitos.'],
  ['premium', 'Paquetes premium', 'Paquetes míticos que se compran con dinero.'], ['ofertas_premium', 'Ofertas premium del día', 'Las 3 casillas de oferta con dinero.'],
  ['colecciones', 'Colecciones', 'Las tarjetas de colecciones de esta pantalla.'], ['temporada', 'Temporada (Feria)', 'El puesto con toldo y papel picado.'],
  ['te_falta', 'Te falta', 'Lo que le falta al jugador para completar algo.'], ['paquetes', 'Paquetes de Bloques', 'Paquetes con descuento pagados con Bloques.'],
  ['nuevo', 'Novedades', 'Lo más reciente del catálogo.'], ['recomendado', 'Recomendado', 'Sugerencias para el jugador.'], ['deseos', 'Lista de deseos', 'Lo que el jugador guardó.'],
  ['protector', 'Protector de racha', 'La compra del protector.'], ['catalogo', 'Catálogo', 'Todo el catálogo por categoría.']
];
var TE_COS = /^(theme|style|effect|frame|title|namecolor|costume|sfx|streakicon)_[A-Za-z0-9_]{1,40}$/;
var TE_HEX = /^#[0-9A-Fa-f]{6}$/;
var TE_FERIA = ['#C0392B', '#F1C40F', '#27AE60', '#2980B9', '#8E44AD', '#E67E22'];

function teRows() { var o = rm('escaparate'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.banners ? o.rows : null; }
function teInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^-?\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function teVal(id, srv) { return id in TE.td ? TE.td[id] : (srv == null ? '' : String(srv)); }
I.teTd = function (el) { TE.td[el.id] = el.value; if (/^te_tc_/.test(el.id)) tePrevT(); };
C.teTd = function (el) { TE.td[el.id] = el.value; };
function teNom(cid) { var p = pc(cid); return p ? p.nombre : cid; }
function teColSw(inputId, cur) {
  return '<div class="sws">' + ACENTOS.concat([['#C0392B', 'Rojo'], ['#27AE60', 'Verde'], ['#E67E22', 'Naranja']]).map(function (a) {
    return '<button type="button" class="sw2" style="--c:' + a[0] + '" data-a="teColor" data-t="' + inputId + '" data-v="' + a[0] + '" aria-pressed="' + (String(cur).toLowerCase() === a[0].toLowerCase()) + '" aria-label="' + a[1] + '" title="' + a[1] + '">' + ic('check') + '</button>';
  }).join('') + '</div>';
}
A.teColor = function (el) {
  var i = document.getElementById(el.dataset.t); if (!i) return;
  i.value = el.dataset.v; i.dispatchEvent(new Event('input', { bubbles: true }));
};

/* ---------- paquetes y textos ---------- */
function tePaqs() {
  var m = {}, p = RM.pagos && RM.pagos.rows && RM.pagos.rows.paquetes;
  items('premios').forEach(function (x) { var k = /^theme_([a-z0-9]{2,20})$/.exec(x.cid || ''); if (k && x.rareza === 'Mítico') m[k[1]] = x.nombre; });
  (p || []).forEach(function (q) { if (!m[q.id]) m[q.id] = pgPack(q.id); });
  return Object.keys(m).sort(function (a, b) { return String(m[a]).localeCompare(m[b]); }).map(function (k) { return [k, m[k]]; });
}
function tePaqNom(id) { var f = tePaqs().filter(function (p) { return p[0] === id; })[0]; return f ? f[1] : id; }
function tePaqTh(ids, max) { return '<span class="ths">' + ids.slice(0, max || 4).map(function (i) { return cthumb('theme_' + i, 'xs'); }).join('') + (ids.length > (max || 4) ? '<span class="more">+' + (ids.length - (max || 4)) + '</span>' : '') + '</span>'; }
/* lista marcable (paquetes, premios): el estado vive en TE.sel[g] y no repinta el drawer */
function teSelHtml(g, list, sel, max) {
  var ids = list.map(function (p) { return p[0]; });
  sel.forEach(function (k) { if (ids.indexOf(k) < 0) list = list.concat([[k, k + ' (no está en el catálogo del panel)', '']]); });
  TE.sel[g] = sel.slice();
  return '<div class="pkl" data-max="' + max + '" style="border:1px solid var(--border);border-radius:10px;max-height:250px;overflow-y:auto">' + (list.map(function (p) {
    return '<button type="button" class="pkr" data-a="teTog" data-g="' + g + '" data-k="' + esc(p[0]) + '" data-max="' + max + '" aria-pressed="' + (sel.indexOf(p[0]) >= 0) + '">' + (p[2] != null ? p[2] : cthumb('theme_' + p[0])) + '<span class="t">' + esc(p[1]) + '<span class="mono">' + esc(p[0]) + '</span></span><span class="ck">' + ic('check') + '</span></button>';
  }).join('') || '<div class="empty" style="padding:18px">No hay nada que elegir.</div>') + '</div><div class="xs mut" id="te_cnt_' + g + '" style="margin-top:6px">' + teCnt(g, max) + '</div>';
}
function teCnt(g, max) { var n = (TE.sel[g] || []).length; return 'Elegidos: <b>' + n + '</b> de ' + max + (g === 'cp' ? ' (mínimo 2)' : ''); }
A.teTog = function (el) {
  var g = el.dataset.g, k = el.dataset.k, max = Number(el.dataset.max), s = TE.sel[g] = TE.sel[g] || [], i = s.indexOf(k);
  if (i >= 0) s.splice(i, 1); else { if (s.length >= max) { toast('Máximo ' + max, 'warn'); return; } s.push(k); }
  el.setAttribute('aria-pressed', String(i < 0));
  var c = document.getElementById('te_cnt_' + g); if (c) c.innerHTML = teCnt(g, max);
  if (g === 'tp') TE.tp = s.slice();
};
/* textos en 15 idiomas: es + en a la vista, el resto plegado. No hay traductor automático en el panel: se escribe a mano. */
function teLangs(pref, obj, o) {
  o = o || {}; obj = obj || {};
  function f(l, req) { var id = 'te_' + pref + '_' + l[0]; return field(id, l[1] + (req && o.req ? ' *' : ''), inp(id, o.td ? teVal(id, obj[l[0]]) : obj[l[0]], { max: 160, di: o.di || 'tePrev', ph: o.ph || '' })); }
  var rest = TE_LANGS.slice(2), filled = rest.filter(function (l) { return obj[l[0]] || (o.td && TE.td['te_' + pref + '_' + l[0]]); }).length;
  return '<div class="grid g2">' + f(TE_LANGS[0], true) + f(TE_LANGS[1], true) + '</div>' +
    '<details class="help" style="margin:0 0 12px"' + (filled ? ' open' : '') + '><summary>' + ic('chr', 'chev') + 'Otros 13 idiomas (' + filled + ' con texto)</summary><div class="grid g2" style="margin-top:10px">' + rest.map(function (l) { return f(l, false); }).join('') + '</div><div class="xs mut">El idioma sin texto usa el inglés. Máximo 160 caracteres cada uno.</div></details>';
}
function teLangsRead(pref) {
  var o = {};
  TE_LANGS.forEach(function (l) { var e = document.getElementById('te_' + pref + '_' + l[0]); var t = e ? String(e.value).trim() : ''; if (t) o[l[0]] = t; });
  return o;
}
function teLangsErr(pref, o, errs, label) {
  if (!o.es) errs['te_' + pref + '_es'] = label + ' en español.';
  if (!o.en) errs['te_' + pref + '_en'] = label + ' en inglés.';
}

/* ---------- fecha ---------- */
function teDate(id, v) { return '<input class="in" type="datetime-local" id="' + id + '" value="' + esc(toLocalInput(v)) + '" data-i="tePrev">'; }
function teEst(b) {
  var n = Date.now();
  if (!b.activo) return ['apagado', ''];
  if (b.desde && n < new Date(b.desde).getTime()) return ['programado', 'ac'];
  if (b.hasta && n >= new Date(b.hasta).getTime()) return ['vencido', 'line'];
  return ['en vivo', 'ok'];
}

/* ================= interruptor ================= */
function teHead(r) {
  var on = !!r.activo;
  return '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Escaparate del panel</h3><span class="sub grow">' + (on ? 'Encendido: la app usa lo que armas aquí' : 'Apagado: la app usa sus reglas de siempre') + '</span></div><div class="cb">' +
    '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>Interruptor del escaparate</b><div class="xs mut">Verde «Encendido» = la tienda de la app 2.0 muestra tus banners, colecciones, secciones y temporada. Gris «Apagado» = la tienda se ve como de fábrica y esto no tiene efecto. Apagar no borra nada. Nace <b>apagado</b>. Encenderlo afecta a los jugadores en vivo: los cambios llegan a la app en 30 minutos como máximo.</div></div>' +
    tog('te_activo', on, 'Escaparate', { dc: 'teTog', on: 'Encendido', off: 'Apagado' }) + '</div>' +
    '<div class="kpis mt16">' + kpi('image', 'Banners', nf((r.banners || []).length), nf((r.banners || []).filter(function (b) { return teEst(b)[0] === 'en vivo'; }).length) + ' en vivo ahora') +
    kpi('layers', 'Colecciones', nf((r.colecciones || []).length), nf((r.colecciones || []).filter(function (c) { return c.activa; }).length) + ' activas') +
    kpi('trophy', 'Premios reclamados', nf(r.reclamos), 'En todas las colecciones') + '</div></div></div>';
}
C.teTog = async function (el) {
  var v = el.checked, r = teRows(); if (!r) return;
  var ok = await confirmDlg({ title: v ? '¿Encender el escaparate?' : '¿Apagar el escaparate?', text: 'Esto afecta a los jugadores en vivo.', html: cbox([['Cambio', (r.activo ? 'Encendido' : 'Apagado') + ' → <b>' + (v ? 'Encendido' : 'Apagado') + '</b>'], ['A quién', 'A todos los jugadores con la app 2.0 o más nueva.'], ['Cuánto tarda', 'Los cambios llegan a la app en <b>30 minutos como máximo</b>.'], ['Qué pasa', v ? 'La tienda enseña tus banners, colecciones, secciones y temporada.' : 'La tienda vuelve a verse como de fábrica. No se borra nada.']]), ok: v ? 'Sí, encender' : 'Apagar', danger: !v, icon: 'power' });
  if (!ok) { el.checked = !v; return; }
  await tePost('activo', { valor: v }, v ? 'Escaparate encendido' : 'Escaparate apagado');
};
async function tePost(accion, datos, okMsg) {
  try { await rpc('admin_escaparate', { p_accion: accion, p_datos: datos }); if (okMsg) toast(okMsg); await rload('escaparate', true); return true; }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); await rload('escaparate', true); return false; }
}
A.teReload = function () { TE.sec = null; TE.td = {}; TE.tc = null; TE.ti = null; TE.tp = null; rload('escaparate'); toast('Recargando…', 'info'); };

/* ================= banners ================= */
function teBanners(r) {
  var L = (r.banners || []).slice().sort(function (a, b) { return a.orden - b.orden || (a.id < b.id ? -1 : 1); });
  var h = '<div class="card sec"><div class="ch">' + ic('image') + '<h3>Banners del carrusel</h3><span class="sub grow">' + nf(L.length) + ' de 40 · la app muestra hasta 8 a la vez</span><button class="btn pri sm" data-a="teBanNew">' + ic('plus') + 'Nuevo banner</button></div><div class="cb">';
  if (!L.length) return h + emptyBox('image', 'Sin banners', 'Crea el primero para que el carrusel «Destacado» tenga algo que enseñar.', '<button class="btn pri" data-a="teBanNew">' + ic('plus') + 'Nuevo banner</button>') + '</div></div>';
  h += '<div class="tw"><table class="tbl"><thead><tr><th>Orden</th><th>Banner</th><th>Va a</th><th>Cuándo</th><th>Estado</th><th></th></tr></thead><tbody>' + L.map(function (b, i) {
    var e = teEst(b), va = b.tipo === 'paquete' ? 'Paquete ' + tePaqNom(b.ref) : b.tipo === 'cosmetico' ? teNom(b.ref) : (b.ref ? (/^theme_|^style_|^effect_|^frame_|^title_/.test(b.ref) ? teNom(b.ref) : 'Paquete ' + tePaqNom(b.ref)) : 'Solo imagen');
    return '<tr><td class="num"><div class="row nw" style="gap:2px;justify-content:flex-end"><button class="btn sm ghost ic" data-a="teBanMove" data-id="' + esc(b.id) + '" data-d="-1" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>' + ic('up') + '</button><b>' + nf(b.orden) + '</b><button class="btn sm ghost ic" data-a="teBanMove" data-id="' + esc(b.id) + '" data-d="1" aria-label="Bajar"' + (i === L.length - 1 ? ' disabled' : '') + '>' + ic('down') + '</button></div></td>' +
      '<td><div class="row nw" style="gap:10px"><span style="width:6px;align-self:stretch;border-radius:3px;background:' + col(b.color) + '"></span><div><b>' + esc(ml(b.titulo) || b.id) + '</b>' + (ml(b.cinta) ? ' ' + chipN(ml(b.cinta), 'ac') : '') + '<div class="xs mut mono">' + esc(b.id) + ' · ' + esc(b.tipo) + '</div></div></div></td>' +
      '<td>' + esc(va) + '</td><td class="xs">' + (b.desde ? esc(fdt(b.desde)) : 'Siempre') + (b.hasta ? '<br>hasta ' + esc(fdt(b.hasta)) : '') + '</td><td>' + chip(e[0], e[1]) + '</td>' +
      '<td class="num"><button class="btn sm" data-a="teBanEdit" data-id="' + esc(b.id) + '">' + ic('edit') + 'Editar</button> <button class="btn sm ghost dng" data-a="teBanDel" data-id="' + esc(b.id) + '" aria-label="Borrar">' + ic('trash') + '</button></td></tr>';
  }).join('') + '</tbody></table></div><p class="xs mut" style="margin:10px 0 0">El orden va de menor a mayor. Las flechas reacomodan el carrusel.</p></div></div>';
  return h;
}
function teBanById(id) { return ((teRows() || {}).banners || []).filter(function (b) { return b.id === id; })[0]; }
A.teBanNew = function () {
  var r = teRows(); if (!r) return;
  var mx = (r.banners || []).reduce(function (m, b) { return Math.max(m, b.orden); }, 0);
  teBanForm({ id: '', tipo: 'paquete', ref: '', imagen: '', titulo: {}, sub: {}, cinta: {}, color: '', desde: null, hasta: null, orden: mx + 10, activo: true }, true);
};
A.teBanEdit = function (el) { var b = teBanById(el.dataset.id); if (b) teBanForm(JSON.parse(JSON.stringify(b)), false); };
function teBanForm(v, isNew) {
  TE.ban = { v: v, isNew: isNew, saved: false }; TE.imid = v.imagen || ''; TE.orig = v.imagen || ''; TE.fresh = {}; TE.imMeta = null;
  formDrawer({
    wide: true,
    title: isNew ? 'Nuevo banner' : 'Editar banner', sub: isNew ? 'Aparece en el carrusel «Destacado»' : esc(v.id),
    body: function () { return teBanBody(TE.ban.v, isNew); },
    foot: function () { return '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="teBanSave">' + ic('check') + (isNew ? 'Crear banner' : 'Guardar') + '</button>'; },
    onMount: function () { tePrev(); },
    onClose: function () { if (!TE.ban.saved) Object.keys(TE.fresh).forEach(teImgDrop); }
  });
}
function teBanBody(v, isNew) {
  var h = '<div class="grid g2">' +
    field('te_b_id', 'Identificador', inp('te_b_id', v.id, { dis: !isNew, max: 40, ph: 'ej. feria_taqueria', di: 'tePrev' }), isNew ? 'Minúsculas, números y guion bajo (2 a 40). No se puede cambiar después.' : 'No se puede cambiar.') +
    field('te_b_tipo', 'Tipo', sel('te_b_tipo', v.tipo, [['paquete', 'Paquete mítico a la venta'], ['cosmetico', 'Cosmético del catálogo de Bloques'], ['imagen', 'Imagen propia']], { dc: 'teBanTipo' })) + '</div>';
  if (v.tipo === 'paquete') h += field('te_b_ref', 'Paquete', sel('te_b_ref', v.ref, [['', 'Elige un paquete…']].concat(tePaqs().concat(v.ref && !tePaqs().some(function (p) { return p[0] === v.ref; }) ? [[v.ref, v.ref]] : [])), { dc: 'tePrevC' }), 'Paquetes míticos del catálogo del panel. La tarjeta lleva a su compra.');
  else if (v.tipo === 'cosmetico') h += '<div class="f" id="f_te_b_ref"><label>Cosmético</label>' + picker('te_b_ref', v.ref ? [v.ref] : [], { single: true, onChange: tePrev }) + '<div class="hint">Un objeto del catálogo de Bloques (tema, estilo, efecto, marco, título…).</div></div>';
  else h += field('te_b_ref', 'A dónde lleva el toque (opcional)', '<input class="in" id="te_b_ref" list="te_dl" value="' + esc(v.ref) + '" maxlength="60" autocomplete="off" placeholder="paquete (taqueria) o cosmético (theme_galaxy)" data-i="tePrev"><datalist id="te_dl">' + tePaqs().map(function (p) { return '<option value="' + esc(p[0]) + '">' + esc(p[1]) + '</option>'; }).join('') + '</datalist>', 'Vacío = solo se ve la imagen. Un paquete (id) o un cosmético (ej. theme_galaxy).');
  if (v.tipo === 'imagen') h += '<div class="f" id="f_te_b_img"><label>Imagen *</label><div id="te_imw">' + teImgHtml() + '</div></div>';
  h += '<h4 style="margin:14px 0 8px">Título</h4>' + teLangs('bt', v.titulo, { req: 1 }) + '<h4 style="margin:14px 0 8px">Subtítulo</h4>' + teLangs('bs', v.sub) + '<h4 style="margin:14px 0 8px">Cinta (ej. «NUEVO», «-30 %»)</h4>' + teLangs('bc', v.cinta, { ph: 'Opcional' });
  h += '<div class="grid g2 mt8">' + field('te_b_color', 'Color (opcional)', inp('te_b_color', v.color, { max: 7, ph: '#C0392B', di: 'tePrev' }), 'Hex de 6 dígitos. Vacío = el de la app.') + '<div class="f"><label>Paleta</label>' + teColSw('te_b_color', v.color) + '</div></div>' +
    '<div class="grid g2">' + field('te_b_desde', 'Desde (hora de México)', teDate('te_b_desde', v.desde), 'Vacío = ya.') + field('te_b_hasta', 'Hasta (hora de México)', teDate('te_b_hasta', v.hasta), 'Vacío = sin fin.') + '</div>' +
    '<div class="grid g2">' + field('te_b_orden', 'Orden', inp('te_b_orden', v.orden, { type: 'number', mode: 'numeric', di: 'tePrev' }), 'De menor a mayor. De 10 en 10 deja espacio para intercalar.') +
    '<div class="f"><label>Estado</label>' + tog('te_b_activo', v.activo, 'Activo', { on: 'Activo', off: 'Apagado' }) + '</div></div>' +
    '<h4 style="margin:14px 0 8px">Vista previa</h4><div id="te_prev"></div><div class="xs mut" style="margin-top:6px">Aproximación: la app dibuja el banner con su propio diseño.</div>';
  return h;
}
C.teBanTipo = function () { teBanSync(); TE.ban.v.ref = ''; if (TE.ban.v.tipo !== 'imagen') { TE.imid = ''; } drawerRefresh(); tePrev(); };
C.tePrevC = function () { tePrev(); };
I.tePrev = debounce(function () { tePrev(); }, 120);
/* pasa lo que hay en el formulario al borrador (antes de repintar el drawer) */
function teBanSync() {
  var v = TE.ban.v, g = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };
  if (TE.ban.isNew) v.id = g('te_b_id').trim();
  v.tipo = g('te_b_tipo') || v.tipo; v.titulo = teLangsRead('bt'); v.sub = teLangsRead('bs'); v.cinta = teLangsRead('bc');
  v.color = g('te_b_color').trim(); v.desde = fromLocalInput(g('te_b_desde')); v.hasta = fromLocalInput(g('te_b_hasta'));
  var o = teInt(g('te_b_orden'), -100000, 100000); if (o != null) v.orden = o;
  var a = document.getElementById('te_b_activo'); if (a) v.activo = a.checked;
  if (v.tipo === 'cosmetico') v.ref = pkSel('te_b_ref')[0] || ''; else v.ref = g('te_b_ref').trim();
  v.imagen = TE.imid;
}
function tePrev() {
  var w = document.getElementById('te_prev'); if (!w || !TE.ban) return;
  var g = function (id) { var e = document.getElementById(id); return e ? e.value : ''; };
  var tipo = g('te_b_tipo'), ref = tipo === 'cosmetico' ? (pkSel('te_b_ref')[0] || '') : g('te_b_ref').trim(), c = g('te_b_color').trim();
  var t = g('te_bt_es') || g('te_bt_en') || 'Título del banner', s = g('te_bs_es') || g('te_bs_en'), cin = g('te_bc_es') || g('te_bc_en');
  var u = tipo === 'imagen' && TE.imid ? (IMG.c[TE.imid] ? safeImg(IMG.c[TE.imid]) : '') : '';
  var th = tipo === 'paquete' ? (ref ? cthumb('theme_' + ref) : '') : (ref && TE_COS.test(ref) ? cthumb(ref) : '');
  w.innerHTML = '<div style="position:relative;display:flex;align-items:center;gap:14px;padding:16px;border-radius:16px;min-height:96px;overflow:hidden;color:#fff;background:linear-gradient(120deg,' + (TE_HEX.test(c) ? c : '#4b3a8f') + ',#14122a)' + (u ? ';background-image:linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,.05)),url(\'' + esc(u) + '\');background-size:cover;background-position:center' : '') + '">' +
    (cin ? '<span style="position:absolute;top:10px;right:-28px;transform:rotate(35deg);background:#ffc93c;color:#222;font-weight:800;font-size:11px;padding:3px 34px;letter-spacing:.04em">' + esc(cin) + '</span>' : '') +
    (th ? '<div style="flex:none">' + th + '</div>' : '') + '<div><div style="font-weight:800;font-size:17px">' + esc(t) + '</div>' + (s ? '<div style="opacity:.85;font-size:13px">' + esc(s) + '</div>' : '') + '</div></div>';
}
/* imagen: mismo subidor que los avisos (compressAv + admin_guardar_imagen) */
function teImgHtml() {
  var id = TE.imid;
  if (!id) return '<button type="button" class="dz" data-a="teImgPick"><span class="di">' + ic('image') + '</span><span><b>Sube una imagen</b><span>JPG, PNG o WebP. Se ajusta sola a 1080 px de ancho y menos de 300 KB.</span></span></button>';
  var u = IMG.c[id] ? safeImg(IMG.c[id]) : ''; if (!u) teImgLoad(id);
  return '<div class="imgp"><div class="ip' + (u ? '' : ' sk2 sk') + '">' + (u ? '<img alt="Imagen del banner" src="' + esc(u) + '">' : '') + '</div><div class="meta"><b>Imagen lista</b> ' + (u ? Math.round((u.length - u.indexOf(',') - 1) * .75 / 1024) + ' KB' + (TE.imMeta ? ' · ' + TE.imMeta.w + '×' + TE.imMeta.h + ' px' : '') : 'Cargando…') + '<div class="row mt8"><button type="button" class="btn sm" data-a="teImgPick">' + ic('refresh') + 'Reemplazar</button><button type="button" class="btn sm ghost dng" data-a="teImgDel">' + ic('trash') + 'Quitar</button></div></div></div>';
}
function teImgPaint() { var w = document.getElementById('te_imw'); if (w) w.innerHTML = teImgHtml(); tePrev(); }
function teImgLoad(id) {
  if (IMG.c[id] || IMG.miss[id] || TE.imLoading === id) return; TE.imLoading = id;
  rpc('admin_imagenes', { p_ids: [id] }).then(function (r) { if (r && r[id]) IMG.c[id] = r[id]; else IMG.miss[id] = 1; }, function () { IMG.miss[id] = 1; }).then(function () { TE.imLoading = ''; if (LAY.dr) teImgPaint(); });
}
A.teImgPick = function () {
  var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
  i.onchange = function () { teImgUp(i.files[0]); };
  i.click();
};
async function teImgUp(file) {
  if (!file) return;
  if (!/^image\//.test(file.type)) { toast('Ese archivo no es una imagen', 'bad'); return; }
  toast('Subiendo imagen…', 'info');
  try {
    var d = await compressAv(file), id = 'pub_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    await rpc('admin_guardar_imagen', { p_id: id, p_data: d.url }, { timeout: 60000 });
    IMG.c[id] = d.url;
    if (TE.imid && TE.fresh[TE.imid]) teImgDrop(TE.imid);
    TE.imid = id; TE.fresh[id] = 1; TE.imMeta = { w: d.w, h: d.h };
    teImgPaint(); toast('Imagen subida (' + d.kb + ' KB)');
  } catch (e) { toast('No se pudo subir la imagen: ' + e.message, 'bad'); }
}
function teImgDrop(id) { delete TE.fresh[id]; rpc('admin_borrar_imagen', { p_id: id }).catch(function () { }); }
A.teImgDel = function () { if (TE.imid && TE.fresh[TE.imid]) teImgDrop(TE.imid); TE.imid = ''; TE.imMeta = null; teImgPaint(); };
function teImgUsed(id, exceptId) { return ((teRows() || {}).banners || []).some(function (b) { return b.imagen === id && b.id !== exceptId; }); }

function teBanRead() {
  teBanSync();
  var v = TE.ban.v, o = { id: TE.ban.isNew ? (document.getElementById('te_b_id') || {}).value.trim() : v.id, tipo: v.tipo, ref: v.ref, imagen: v.tipo === 'imagen' ? TE.imid : '', titulo: v.titulo, sub: v.sub, cinta: v.cinta, color: v.color, desde: v.desde, hasta: v.hasta, orden: v.orden, activo: v.activo };
  return o;
}
function teBanErr(o) {
  var e = {}, r = teRows() || {};
  if (!/^[a-z0-9_]{2,40}$/.test(o.id)) e.te_b_id = 'Minúsculas, números y guion bajo (2 a 40).';
  else if (TE.ban.isNew && (r.banners || []).some(function (b) { return b.id === o.id; })) e.te_b_id = 'Ya existe un banner con ese identificador.';
  if (TE.ban.isNew && (r.banners || []).length >= 40) e.te_b_id = 'Ya hay 40 banners (el máximo): borra alguno.';
  if (o.tipo === 'paquete' && !/^[a-z0-9]{2,20}$/.test(o.ref)) e.te_b_ref = 'Elige un paquete.';
  if (o.tipo === 'cosmetico' && !TE_COS.test(o.ref)) e.te_b_ref = 'Elige un cosmético.';
  if (o.tipo === 'imagen') {
    if (!o.imagen) e.te_b_img = 'Sube una imagen.';
    if (o.ref && !/^[a-z0-9]{2,20}$/.test(o.ref) && !TE_COS.test(o.ref)) e.te_b_ref = 'Un id de paquete (taqueria) o de cosmético (theme_galaxy), o déjalo vacío.';
  }
  teLangsErr('bt', o.titulo, e, 'Escribe el título');
  if (o.color && !TE_HEX.test(o.color)) e.te_b_color = 'Un hex de 6 dígitos, como #C0392B, o vacío.';
  if (o.desde && o.hasta && new Date(o.hasta) <= new Date(o.desde)) e.te_b_hasta = '«Hasta» debe ser después de «Desde».';
  if (teInt(String((document.getElementById('te_b_orden') || {}).value), -100000, 100000) == null) e.te_b_orden = 'Un número entero.';
  return e;
}
A.teBanSave = async function (el) {
  var o = teBanRead(), e = teBanErr(o), r = teRows();
  if (!showErrs(e)) return;
  if (r && r.activo && o.activo && !await confirmDlg({ title: TE.ban.isNew ? '¿Publicar este banner?' : '¿Guardar los cambios del banner?', text: 'El escaparate está encendido: lo verán los jugadores.', html: cbox([['Banner', esc(ml(o.titulo)) + ' <span class="mono xs">' + esc(o.id) + '</span>'], ['Cuándo', (o.desde ? esc(fdt(o.desde)) : 'Ya') + ' → ' + (o.hasta ? esc(fdt(o.hasta)) : 'sin fin') + ' (hora de México)'], ['Cuánto tarda', 'Llega a la app en 30 minutos como máximo.']]), ok: 'Sí, guardar', icon: 'image' })) return;
  busy(el, true);
  try {
    await rpc('admin_escaparate', { p_accion: 'banner_guardar', p_datos: { banner: o } });
    TE.ban.saved = true;
    Object.keys(TE.fresh).forEach(function (id) { if (id !== o.imagen) teImgDrop(id); });
    if (TE.orig && TE.orig !== o.imagen && !teImgUsed(TE.orig, o.id)) rpc('admin_borrar_imagen', { p_id: TE.orig }).catch(function () { });
    toast(TE.ban.isNew ? 'Banner creado' : 'Banner guardado'); drawerKill(); await rload('escaparate', true);
  } catch (er) { busy(el, false); toast('No se pudo guardar: ' + er.message, 'bad'); }
};
A.teBanDel = async function (el) {
  var b = teBanById(el.dataset.id); if (!b) return;
  if (!await confirmDlg({ title: '¿Borrar este banner?', text: 'Desaparece del carrusel y no se puede deshacer.', html: cbox([['Banner', esc(ml(b.titulo) || b.id)], ['Identificador', '<span class="mono">' + esc(b.id) + '</span>']]), ok: 'Borrar', danger: true, icon: 'trash' })) return;
  if (await tePost('banner_borrar', { id: b.id }, 'Banner borrado') && b.imagen && !teImgUsed(b.imagen, b.id)) rpc('admin_borrar_imagen', { p_id: b.imagen }).catch(function () { });
};
A.teBanMove = async function (el) {
  var r = teRows(); if (!r || TE.saving) return;
  var L = r.banners.slice().sort(function (a, b) { return a.orden - b.orden || (a.id < b.id ? -1 : 1); }), i = L.findIndex(function (b) { return b.id === el.dataset.id; }), j = i + Number(el.dataset.d);
  if (i < 0 || j < 0 || j >= L.length) return;
  var t = L[i]; L[i] = L[j]; L[j] = t;
  TE.saving = 'orden'; paintPage();
  try {
    for (var k = 0; k < L.length; k++) {
      var n = (k + 1) * 10;
      if (L[k].orden !== n) await rpc('admin_escaparate', { p_accion: 'banner_guardar', p_datos: { banner: Object.assign({}, L[k], { orden: n }) } });
    }
    toast('Orden actualizado');
  } catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
  TE.saving = ''; await rload('escaparate', true);
};

/* ================= colecciones ================= */
function teColecciones(r) {
  var L = (r.colecciones || []).slice().sort(function (a, b) { return a.orden - b.orden || (a.id < b.id ? -1 : 1); });
  var h = '<div class="card sec"><div class="ch">' + ic('layers') + '<h3>Colecciones</h3><span class="sub grow">' + nf(L.length) + ' de 30 · la app muestra hasta 12 activas</span><button class="btn pri sm" data-a="teColNew">' + ic('plus') + 'Nueva colección</button></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Un grupo de 2 a 8 paquetes míticos con premio al completarlo. El servidor revisa que el jugador tenga todos los objetos (compras con dinero, compras con Bloques y códigos canjeados con la cuenta del ranking) y entrega el premio una sola vez.</p>';
  if (!L.length) return h + emptyBox('layers', 'Sin colecciones', 'Crea una con una temática: por ejemplo, los paquetes de comida mexicana.', '<button class="btn pri" data-a="teColNew">' + ic('plus') + 'Nueva colección</button>') + '</div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr><th>Colección</th><th>Paquetes</th><th>Premios</th><th class="num">Reclamos</th><th>Estado</th><th></th></tr></thead><tbody>' + L.map(function (c) {
    return '<tr><td><div class="row nw" style="gap:10px"><span style="width:6px;align-self:stretch;border-radius:3px;background:' + col(c.color) + '"></span><div><b>' + esc(ml(c.nombre) || c.id) + '</b><div class="xs mut mono">' + esc(c.id) + ' · ' + esc(c.icono) + ' · orden ' + nf(c.orden) + '</div></div></div></td>' +
      '<td>' + tePaqTh(c.paquetes, 5) + '<div class="xs mut">' + esc(c.paquetes.map(tePaqNom).join(', ')) + '</div></td><td class="xs">' + (c.premios.length ? esc(c.premios.join(', ')) : '—') + '</td><td class="num">' + nf(c.reclamos) + '</td><td>' + (c.activa ? chip('activa', 'ok') : chip('apagada', '')) + '</td>' +
      '<td class="num"><button class="btn sm" data-a="teColEdit" data-id="' + esc(c.id) + '">' + ic('edit') + 'Editar</button> <button class="btn sm ghost dng" data-a="teColDel" data-id="' + esc(c.id) + '" aria-label="Borrar">' + ic('trash') + '</button></td></tr>';
  }).join('') + '</tbody></table></div></div></div>';
}
function teColById(id) { return ((teRows() || {}).colecciones || []).filter(function (c) { return c.id === id; })[0]; }
A.teColNew = function () {
  var r = teRows(); if (!r) return;
  var mx = (r.colecciones || []).reduce(function (m, c) { return Math.max(m, c.orden); }, 0);
  teColForm({ id: '', nombre: {}, color: '', icono: 'star', paquetes: [], premios: [], orden: mx + 10, activa: true }, true);
};
A.teColEdit = function (el) { var c = teColById(el.dataset.id); if (c) teColForm(JSON.parse(JSON.stringify(c)), false); };
function teColForm(v, isNew) {
  TE.col = { v: v, isNew: isNew };
  formDrawer({
    wide: true, title: isNew ? 'Nueva colección' : 'Editar colección', sub: isNew ? '' : esc(v.id),
    body: function () {
      var r = teRows() || {}, pr = (r.premios || []).map(function (id) { return [id, teNom(id), '']; });
      return '<div class="grid g2">' + field('te_c_id', 'Identificador', inp('te_c_id', v.id, { dis: !isNew, max: 40, ph: 'ej. sabores_mx' }), isNew ? 'Minúsculas, números y guion bajo (2 a 40). No se puede cambiar después.' : 'No se puede cambiar.') +
        field('te_c_icono', 'Icono', sel('te_c_icono', v.icono, TE_ICONOS)) + '</div>' +
        '<h4 style="margin:6px 0 8px">Nombre</h4>' + teLangs('cn', v.nombre, { di: 'teNop', req: 1 }) +
        '<div class="grid g2">' + field('te_c_color', 'Color (opcional)', inp('te_c_color', v.color, { max: 7, ph: '#27AE60' }), 'Hex de 6 dígitos.') + '<div class="f"><label>Paleta</label>' + teColSw('te_c_color', v.color) + '</div></div>' +
        '<div class="f" id="f_te_c_pk"><label>Paquetes (de 2 a 8) *</label>' + teSelHtml('cp', tePaqs(), v.paquetes, 8) + '</div>' +
        '<div class="f" id="f_te_c_pr"><label>Premios al completarla (de 0 a 3)</label>' + (pr.length ? teSelHtml('cr', pr, v.premios, 3) : '<div class="xs mut">No hay premios en la lista. Agrégalos abajo, en «Premios de colección».</div>' + (TE.sel.cr = v.premios.slice(), '')) + '</div>' +
        '<div class="grid g2">' + field('te_c_orden', 'Orden', inp('te_c_orden', v.orden, { type: 'number', mode: 'numeric' }), 'De menor a mayor.') + '<div class="f"><label>Estado</label>' + tog('te_c_activa', v.activa, 'Activa', { on: 'Activa', off: 'Apagada' }) + '</div></div>';
    },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="teColDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="teColSave">' + ic('check') + (isNew ? 'Crear colección' : 'Guardar') + '</button>'; }
  });
}
I.teNop = function () { };
A.teColSave = async function (el) {
  var isNew = TE.col.isNew, g = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }, r = teRows() || {}, e = {};
  var o = { id: isNew ? g('te_c_id') : TE.col.v.id, nombre: teLangsRead('cn'), color: g('te_c_color'), icono: g('te_c_icono'), paquetes: (TE.sel.cp || []).slice(), premios: (TE.sel.cr || []).slice(), orden: teInt(g('te_c_orden'), -100000, 100000), activa: !!(document.getElementById('te_c_activa') || {}).checked };
  if (!/^[a-z0-9_]{2,40}$/.test(o.id)) e.te_c_id = 'Minúsculas, números y guion bajo (2 a 40).';
  else if (isNew && (r.colecciones || []).some(function (c) { return c.id === o.id; })) e.te_c_id = 'Ya existe una colección con ese identificador.';
  if (isNew && (r.colecciones || []).length >= 30) e.te_c_id = 'Ya hay 30 colecciones (el máximo).';
  teLangsErr('cn', o.nombre, e, 'Escribe el nombre');
  if (o.color && !TE_HEX.test(o.color)) e.te_c_color = 'Un hex de 6 dígitos, como #27AE60, o vacío.';
  if (o.paquetes.length < 2 || o.paquetes.length > 8) e.te_c_pk = 'Elige de 2 a 8 paquetes.';
  if (o.premios.length > 3) e.te_c_pr = 'Máximo 3 premios.';
  if (o.orden == null) { e.te_c_orden = 'Un número entero.'; }
  if (!showErrs(e)) return;
  if (r.activo && o.activa && !await confirmDlg({ title: isNew ? '¿Publicar esta colección?' : '¿Guardar la colección?', text: 'El escaparate está encendido: los jugadores la verán.', html: cbox([['Colección', esc(ml(o.nombre))], ['Paquetes', esc(o.paquetes.map(tePaqNom).join(', '))], ['Premios', esc(o.premios.join(', ') || 'ninguno')], ['Cuánto tarda', 'Llega a la app en 30 minutos como máximo.']]), ok: 'Sí, guardar', icon: 'layers' })) return;
  busy(el, true);
  try { await rpc('admin_escaparate', { p_accion: 'coleccion_guardar', p_datos: { coleccion: o } }); toast(isNew ? 'Colección creada' : 'Colección guardada'); drawerKill(); await rload('escaparate', true); }
  catch (er) { busy(el, false); toast('No se pudo guardar: ' + er.message, 'bad'); }
};
A.teColDel = async function (el) {
  var c = teColById(el.dataset.id); if (!c) return;
  if (!await confirmDlg({ title: '¿Borrar esta colección?', text: 'Deja de verse en la tienda. Lo que los jugadores ya reclamaron se queda con ellos; los reclamos no se borran.', html: cbox([['Colección', esc(ml(c.nombre) || c.id)], ['Reclamos hechos', nf(c.reclamos)]]), ok: 'Borrar', danger: true, icon: 'trash' })) return;
  if (await tePost('coleccion_borrar', { id: c.id }, 'Colección borrada')) drawerKill();
};

/* ================= premios de colección ================= */
function tePremios(r) {
  var L = r.premios || [], uso = {};
  (r.colecciones || []).forEach(function (c) { c.premios.forEach(function (p) { uso[p] = (uso[p] || 0) + 1; }); });
  var h = '<div class="card sec"><div class="ch">' + ic('trophy') + '<h3>Premios de colección</h3><span class="sub grow">' + nf(L.length) + ' en la lista</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Lo que una colección puede regalar al completarse. Deben ser <b>objetos ocultos que la app ya conozca</b> (hoy <span class="mono">badge_coleccionista</span> y <span class="mono">title_coleccionista</span>): nunca se venden y no salen en catálogos hasta tenerlos. Si agregas un id que la app no tenga, el jugador recibiría un objeto inexistente. No se puede quitar uno que una colección use.</p>';
  h += L.length ? '<div class="tw"><table class="tbl"><thead><tr><th>Premio</th><th class="num">Usado en</th><th></th></tr></thead><tbody>' + L.map(function (id) {
    return '<tr><td><span class="mono">' + esc(id) + '</span>' + (pc(id) ? '<div class="xs mut">' + esc(teNom(id)) + '</div>' : '') + '</td><td class="num">' + plural(uso[id] || 0, 'colección', 'colecciones') + '</td><td class="num"><button class="btn sm ghost dng" data-a="tePreDel" data-id="' + esc(id) + '"' + (uso[id] ? ' disabled title="Una colección lo usa"' : '') + '>' + ic('trash') + 'Quitar</button></td></tr>';
  }).join('') + '</tbody></table></div>' : '<p class="mut">La lista está vacía: las colecciones no podrán dar premios.</p>';
  return h + '<div class="grid g2 mt16">' + field('te_pre', 'Agregar un premio', inp('te_pre', '', { max: 50, ph: 'ej. frame_coleccionista' }), 'Empieza con badge_, title_ o frame_. Letras, números y guion bajo.') + '</div><div class="row mt8"><button class="btn" data-a="tePreAdd">' + ic('plus') + 'Agregar</button></div></div></div>';
}
A.tePreAdd = async function () {
  var e = document.getElementById('te_pre'), id = e ? e.value.trim() : '';
  if (!/^(badge|title|frame)_[A-Za-z0-9_]{1,40}$/.test(id)) { showErrs({ te_pre: 'Debe empezar con badge_, title_ o frame_ (letras, números y guion bajo).' }); return; }
  if (!await confirmDlg({ title: '¿Agregar este premio?', text: 'La app debe conocer este objeto oculto; si no, el jugador no lo verá.', html: cbox([['Premio', '<span class="mono">' + esc(id) + '</span>']]), ok: 'Sí, agregar', icon: 'trophy' })) return;
  if (await tePost('premio_agregar', { id: id }, 'Premio agregado')) e.value = '';
};
A.tePreDel = async function (el) {
  if (!await confirmDlg({ title: '¿Quitar este premio de la lista?', text: 'Deja de poder usarse en colecciones nuevas. Lo ya entregado se queda.', html: cbox([['Premio', '<span class="mono">' + esc(el.dataset.id) + '</span>']]), ok: 'Quitar', danger: true, icon: 'trash' })) return;
  await tePost('premio_quitar', { id: el.dataset.id }, 'Premio quitado');
};

/* ================= secciones ================= */
function teSecBase(r) {
  var out = [], seen = {};
  (r.secciones || []).forEach(function (s) { if (TE_SECS.some(function (x) { return x[0] === s.id; }) && !seen[s.id]) { seen[s.id] = 1; out.push({ id: s.id, visible: s.visible !== false }); } });
  TE_SECS.forEach(function (s) { if (!seen[s[0]]) out.push({ id: s[0], visible: true }); });
  return out;
}
function teSecDirty(r) { return TE.sec && JSON.stringify(TE.sec) !== JSON.stringify(teSecBase(r)); }
function teSecNom(id) { var f = TE_SECS.filter(function (s) { return s[0] === id; })[0]; return f ? f[1] : id; }
function teSecciones(r) {
  var L = TE.sec || teSecBase(r), stored = (r.secciones || []).length > 0;
  var h = '<div class="card sec"><div class="ch">' + ic('list') + '<h3>Secciones de la tienda</h3><span class="sub grow">' + (stored ? 'Orden guardado' : 'Orden de fábrica') + (teSecDirty(r) ? ' · cambios sin guardar' : '') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">De arriba hacia abajo, como las ve el jugador. Una sección sin casilla no se muestra.</p>' +
    '<div class="tw"><table class="tbl"><thead><tr><th>#</th><th>Sección</th><th>Visible</th><th></th></tr></thead><tbody>' + L.map(function (s, i) {
      var d = (TE_SECS.filter(function (x) { return x[0] === s.id; })[0] || [])[2] || '';
      return '<tr><td class="num">' + (i + 1) + '</td><td><b>' + esc(teSecNom(s.id)) + '</b><div class="xs mut"><span class="mono">' + esc(s.id) + '</span> · ' + esc(d) + '</div></td>' +
        '<td><label class="tog"><input type="checkbox" data-c="teSecVis" data-id="' + esc(s.id) + '"' + (s.visible ? ' checked' : '') + ' aria-label="Visible"><span class="sw"></span><em class="ts" data-on="Visible" data-off="Oculta"></em></label></td>' +
        '<td class="num"><button class="btn sm ghost ic" data-a="teSecMove" data-i="' + i + '" data-d="-1" aria-label="Subir"' + (i === 0 ? ' disabled' : '') + '>' + ic('up') + '</button> <button class="btn sm ghost ic" data-a="teSecMove" data-i="' + i + '" data-d="1" aria-label="Bajar"' + (i === L.length - 1 ? ' disabled' : '') + '>' + ic('down') + '</button></td></tr>';
    }).join('') + '</tbody></table></div>' +
    '<div class="row mt16"><button class="btn pri" data-a="teSecSave"' + (TE.saving === 'sec' ? ' disabled' : '') + '>' + (TE.saving === 'sec' ? '<span class="spin"></span>' : ic('check')) + 'Guardar secciones</button><button class="btn ghost" data-a="teSecReset"' + (TE.sec ? '' : ' disabled') + '>Descartar cambios</button><button class="btn ghost" data-a="teSecFab">Orden de fábrica</button></div></div></div>';
  return h;
}
A.teSecMove = function (el) {
  var r = teRows(); if (!r) return;
  var L = (TE.sec || teSecBase(r)).map(function (s) { return { id: s.id, visible: s.visible }; }), i = Number(el.dataset.i), j = i + Number(el.dataset.d);
  if (j < 0 || j >= L.length) return;
  var t = L[i]; L[i] = L[j]; L[j] = t; TE.sec = L; paintPage();
};
C.teSecVis = function (el) {
  var r = teRows(); if (!r) return;
  var L = (TE.sec || teSecBase(r)).map(function (s) { return { id: s.id, visible: s.visible }; });
  L.forEach(function (s) { if (s.id === el.dataset.id) s.visible = el.checked; });
  TE.sec = L; paintPage();
};
A.teSecReset = function () { TE.sec = null; paintPage(); };
A.teSecFab = function () { TE.sec = TE_SECS.map(function (s) { return { id: s[0], visible: true }; }); paintPage(); };
A.teSecSave = async function () {
  var r = teRows(); if (!r || TE.saving) return;
  var L = TE.sec || teSecBase(r), antes = teSecBase(r);
  if (JSON.stringify(L) === JSON.stringify(antes) && (r.secciones || []).length) { toast('No hay cambios', 'info'); return; }
  var ok = await confirmDlg({ title: '¿Guardar el orden de las secciones?', text: r.activo ? 'El escaparate está encendido: lo verán los jugadores.' : 'El escaparate está apagado: se verá cuando lo enciendas.', html: cbox([['Antes', esc(antes.map(function (s) { return teSecNom(s.id) + (s.visible ? '' : ' (oculta)'); }).join(' › '))], ['Ahora', '<b>' + esc(L.map(function (s) { return teSecNom(s.id) + (s.visible ? '' : ' (oculta)'); }).join(' › ')) + '</b>'], ['Cuánto tarda', 'Llega a la app en 30 minutos como máximo.']]), ok: 'Sí, guardar', icon: 'list' });
  if (!ok) return;
  TE.saving = 'sec'; paintPage();
  var good = await tePost('secciones', { lista: L }, 'Secciones guardadas');
  if (good) TE.sec = null;
  TE.saving = ''; paintPage();
};

/* ================= temporada «Feria» ================= */
function teTem(r) {
  var t = r.temporada, has = !!t; t = t || {};
  var ti = TE.ti || t.items || [], tp = TE.tp || t.paquetes || [];
  var cols = TE.tc || (t.colores && t.colores.length ? t.colores.slice() : TE_FERIA.slice(0, 4));
  var evs = (typeof mxEvs === 'function' ? mxEvs() : []), evId = teVal('te_t_evento', t.evento || '');
  var evList = [['', 'Ninguno (solo por fechas)']].concat(evs.map(function (e) { return [e.id, (ml(e.nombre) || e.id) + ' · ' + (EST_L[winEst(e.activo, e.inicio, e.fin)] || '')]; }));
  if (evId && !evs.some(function (e) { return e.id === evId; })) evList.push([evId, evId + ' (no está en el motor)']);
  var h = '<div class="card sec"><div class="ch">' + ic('spark') + '<h3>Temporada «Feria»</h3><span class="sub grow">' + (has ? 'Guardada' + (t.evento ? ' · evento ' + t.evento : '') : 'Sin temporada') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">El puesto de la Feria en la tienda: un toldo, papel picado, objetos y paquetes a la vista. Se liga a un evento del motor para que salga y se quite junto con él, y/o a fechas propias.</p>' +
    '<div class="grid g2">' + field('te_t_evento', 'Evento del motor', sel('te_t_evento', evId, evList, { dc: 'teTd' }), 'Opcional. Se carga de «Eventos de juego».') + '</div>' +
    '<h4 style="margin:10px 0 8px">Título</h4>' + teLangs('tt', t.titulo, { td: 1, di: 'teTd', req: 1 }) + '<h4 style="margin:10px 0 8px">Subtítulo</h4>' + teLangs('ts', t.sub, { td: 1, di: 'teTd' }) +
    '<h4 style="margin:10px 0 8px">Colores (de 2 a 6)</h4><div class="xs mut" style="margin-bottom:8px">El <b>primero</b> es el toldo; los demás se reparten en el papel picado.</div><div class="grid g2" id="te_tcw">' + cols.map(function (c, i) {
      return '<div class="f" id="f_te_tc_' + i + '"><div class="row nw"><span style="width:26px;height:26px;border-radius:8px;flex:none;border:1px solid var(--border);background:' + (TE_HEX.test(c) ? c : 'transparent') + '"></span><input class="in" id="te_tc_' + i + '" data-i="teTd" value="' + esc(c) + '" maxlength="7" placeholder="#C0392B" aria-label="Color ' + (i + 1) + '" autocomplete="off"><button type="button" class="btn sm ghost ic" data-a="teTcDel" data-i="' + i + '" aria-label="Quitar color"' + (cols.length <= 2 ? ' disabled' : '') + '>' + ic('trash') + '</button></div></div>';
    }).join('') + '</div><div class="row mt8"><button class="btn sm" data-a="teTcAdd"' + (cols.length >= 6 ? ' disabled' : '') + '>' + ic('plus') + 'Agregar color</button></div>' +
    '<h4 style="margin:14px 0 8px">Vista previa del puesto</h4><div id="te_tprev">' + teFeriaPrev(cols) + '</div>' +
    '<div class="f mt16" id="f_te_t_items"><label>Objetos del puesto (cosméticos, hasta 12)</label>' + picker('te_titems', ti, { onChange: function (s) { TE.ti = s.slice(); } }) + '</div>' +
    '<div class="f" id="f_te_t_paq"><label>Paquetes míticos del puesto (hasta 6)</label>' + teSelHtml('tp', tePaqs(), tp, 6) + '</div>' +
    '<div class="grid g2 mt16">' + field('te_t_desde', 'Desde (hora de México)', '<input class="in" type="datetime-local" id="te_t_desde" value="' + esc(teVal('te_t_desde', toLocalInput(t.desde))) + '" data-i="teTd">', 'Vacío = sin inicio.') +
    field('te_t_hasta', 'Hasta (hora de México)', '<input class="in" type="datetime-local" id="te_t_hasta" value="' + esc(teVal('te_t_hasta', toLocalInput(t.hasta))) + '" data-i="teTd">', 'Vacío = sin fin.') + '</div>' +
    '<div class="row mt16"><button class="btn pri" data-a="teTemSave"' + (TE.saving === 'tem' ? ' disabled' : '') + '>' + (TE.saving === 'tem' ? '<span class="spin"></span>' : ic('check')) + 'Guardar temporada</button>' + (has ? '<button class="btn ghost dng" data-a="teTemDel">' + ic('trash') + 'Quitar temporada</button>' : '') + '<span class="xs mut">Llega a la app en 30 minutos como máximo.</span></div></div></div>';
  return h;
}
/* toldo (rayas del primer color con festón) + papel picado (banderines con los demás colores) */
function teFeriaPrev(cols) {
  var ok = cols.filter(function (c) { return TE_HEX.test(c); }), top = ok[0] || '#C0392B', rest = ok.slice(1).length ? ok.slice(1) : ['#F1C40F', '#27AE60'];
  var flags = '';
  for (var i = 0; i < 14; i++) flags += '<i style="flex:1;height:34px;margin:0 2px;background:' + rest[i % rest.length] + ';clip-path:polygon(0 0,100% 0,100% 78%,75% 100%,50% 78%,25% 100%,0 78%)"></i>';
  return '<div style="border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--surface-2)">' +
    '<div style="height:46px;background:repeating-linear-gradient(90deg,' + top + ' 0 22px,#fff 22px 44px);-webkit-mask:radial-gradient(circle 11px at 11px 100%,#0000 98%,#000) 0 100%/22px 51% repeat-x,linear-gradient(#000 0 0) 0 0/100% 70% no-repeat;mask:radial-gradient(circle 11px at 11px 100%,#0000 98%,#000) 0 100%/22px 51% repeat-x,linear-gradient(#000 0 0) 0 0/100% 70% no-repeat"></div>' +
    '<div style="display:flex;padding:6px 8px 0;margin-top:2px">' + flags + '</div><div style="height:30px"></div></div>';
}
function tePrevT() {
  var w = document.getElementById('te_tprev'); if (!w) return;
  var cols = []; for (var i = 0; i < 6; i++) { var e = document.getElementById('te_tc_' + i); if (e) cols.push(e.value.trim()); }
  TE.tc = cols; w.innerHTML = teFeriaPrev(cols);
}
function teTcSync() { var cols = []; for (var i = 0; i < 6; i++) { var e = document.getElementById('te_tc_' + i); if (e) cols.push(e.value.trim()); } if (cols.length) TE.tc = cols; }
A.teTcAdd = function () { teTcSync(); var c = TE.tc || []; if (c.length >= 6) return; c.push(TE_FERIA[c.length % TE_FERIA.length]); TE.tc = c; paintPage(); };
A.teTcDel = function (el) { teTcSync(); var c = TE.tc || []; if (c.length <= 2) return; c.splice(Number(el.dataset.i), 1); TE.tc = c; paintPage(); };
A.teTemSave = async function () {
  var r = teRows(); if (!r || TE.saving) return;
  teTcSync();
  var g = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; }, e = {};
  var o = { evento: g('te_t_evento'), titulo: teLangsRead('tt'), sub: teLangsRead('ts'), colores: (TE.tc || []).slice(), items: (TE.ti || (r.temporada || {}).items || []).slice(), paquetes: (TE.sel.tp || []).slice(), desde: fromLocalInput(g('te_t_desde')), hasta: fromLocalInput(g('te_t_hasta')) };
  teLangsErr('tt', o.titulo, e, 'Escribe el título');
  if (o.colores.length < 2 || o.colores.length > 6 || o.colores.some(function (c) { return !TE_HEX.test(c); })) e.te_tc_0 = 'De 2 a 6 colores, cada uno un hex de 6 dígitos (#C0392B).';
  if (o.items.length > 12) e.te_t_items = 'Máximo 12 objetos.';
  else if (o.items.some(function (c) { return !TE_COS.test(c); })) e.te_t_items = 'Hay un objeto con un id que la tienda no reconoce.';
  if (o.paquetes.length > 6) e.te_t_paq = 'Máximo 6 paquetes.';
  if (o.desde && o.hasta && new Date(o.hasta) <= new Date(o.desde)) e.te_t_hasta = '«Hasta» debe ser después de «Desde».';
  if (!showErrs(e)) return;
  var ok = await confirmDlg({ title: '¿Guardar la temporada?', text: r.activo ? 'El escaparate está encendido: los jugadores la verán.' : 'El escaparate está apagado: se verá cuando lo enciendas.', html: cbox([['Título', esc(ml(o.titulo))], ['Evento', esc(o.evento || 'ninguno')], ['Colores', o.colores.map(function (c) { return '<span style="display:inline-block;width:14px;height:14px;border-radius:4px;vertical-align:middle;background:' + esc(c) + '"></span> ' + esc(c); }).join(' ')], ['Puesto', nf(o.items.length) + ' objetos y ' + nf(o.paquetes.length) + ' paquetes'], ['Cuándo', (o.desde ? esc(fdt(o.desde)) : 'sin inicio') + ' → ' + (o.hasta ? esc(fdt(o.hasta)) : 'sin fin') + ' (hora de México)'], ['Cuánto tarda', 'Llega a la app en 30 minutos como máximo.']]), ok: 'Sí, guardar', icon: 'spark' });
  if (!ok) return;
  TE.saving = 'tem'; paintPage();
  if (await tePost('temporada', { temporada: o }, 'Temporada guardada')) { TE.td = {}; TE.tc = null; TE.ti = null; TE.tp = null; }
  TE.saving = ''; paintPage();
};
A.teTemDel = async function () {
  var r = teRows(); if (!r || !r.temporada) return;
  if (!await confirmDlg({ title: '¿Quitar la temporada?', text: 'El puesto de la Feria desaparece de la tienda. No se puede deshacer.', html: cbox([['Temporada', esc(ml(r.temporada.titulo) || 'Feria')]]), ok: 'Quitar', danger: true, icon: 'trash' })) return;
  if (await tePost('temporada', { temporada: null }, 'Temporada quitada')) { TE.td = {}; TE.tc = null; TE.ti = null; TE.tp = null; paintPage(); }
};

/* ================= vista ================= */
function vEscaparate() {
  var o = rm('escaparate');
  var h = pageHead('Escaparate', 'El carrusel «Destacado», las <b>colecciones</b> con premio, el orden de las <b>secciones</b> y la temporada <b>Feria</b> de la tienda de la app 2.0. Nace apagado.', '<button class="btn" data-a="teReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.escaparate, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 9-limites.sql; las tablas de 18, 19, 24 y 32 son opcionales.') + '</div>' : rerr(o, 'el escaparate'));
  var r = teRows();
  if (!r) return h + skel(4);
  return h + teHead(r) + teBanners(r) + teColecciones(r) + tePremios(r) + teSecciones(r) + teTem(r);
}
VIEWS['juego/escaparate'] = vEscaparate;
