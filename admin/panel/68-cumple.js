/* ================= CUMPLEAÑOS EN BLOKKU (20-cumple.sql, app 2.0) ================= */
// Todo por admin_cumple(p_clave, p_accion, p_datos): sin acción solo lee
// {hoy, config[{clave,valor,def,lo,hi,nota}], url, textos[{clave,lang,texto}], cumplen_hoy[{id,nombre,pais}], stats}.
//   'config'  {clave: valor, …}                 números con rango (el servidor los vuelve a validar)
//   'texto'   {clave, lang, texto|null}         fija o quita un texto (url: lang '*', https://…)
// La fecha de cumpleaños de cada jugador NUNCA se muestra aquí: solo quién cumple hoy.
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.cumple = '20-cumple.sql';
FNF.admin_cumple = 'cumple';
RFN.cumple = 'admin_cumple';
N20['juego/cumple'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/cumple'; })) g.items.push(['juego/cumple', 'Cumpleaños', 'gift']);
  ROUTES['juego/cumple'] = { t: 'Cumpleaños', ic: 'gift', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/cumple'] = {
  que: 'La función «Cumpleaños en Blokku»: el jugador pone su día y mes (nunca el año), y ese día recibe un cofre de regalo, Bloques dobles en sus partidas, Blokki con gorrito y pastel, un 🎂 junto a su nombre en el ranking y un aviso a Cumplegratis. Aquí la enciendes o apagas, cambias el regalo, los textos y la URL de Cumplegratis, ves las estadísticas y mandas un mensaje a quien cumple hoy.',
  ve: 'En el Perfil, «Mi cumpleaños 🎂». La víspera, una notificación de Blokki («¡Mañana es tu cumple!»); el día, otra, Blokki con gorrito y pastel en el menú, confeti al abrir y el cofre. El cofre trae los Bloques de «Bloques del cofre» (5,000 de fábrica desde 37-bloques-x10), un protector de racha, el marco «Cumpleañero AAAA» y la insignia 🎂 del año (coleccionables: uno por año, nunca a la venta, ni el código maestro los da), y una tarjeta «Hoy te regalan cosas gratis por tu cumple» con el botón «Ver en Cumplegratis».',
  cuando: 'Revisa «Cofres entregados» y «Clics a Cumplegratis» para saber si funciona. Apaga la función solo en una emergencia: no borra ninguna fecha ni cofre.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Si el servidor no tiene 20-cumple.sql o la función está apagada, la app esconde todo (perfil, avisos, sombrero).',
    '<b>Privacidad:</b> solo se guarda día y mes, si el jugador lo da. Aquí nunca ves su fecha: solo quién cumple hoy. Se borra cuando él quiere (Perfil › Mi cumpleaños) o con «Borrar mis datos».',
    '<b>Antiabuso (lo decide el servidor):</b> la fecha solo se puede cambiar 1 vez cada 30 días y nunca a una fecha a 7 días o menos de hoy (editables abajo). El cofre se abre una vez por año por jugador, solo el día de su cumple con tolerancia de ±14 horas de zona horaria, y solo si la fecha se fijó hace al menos 6 días.',
    '<b>Bloques dobles:</b> el servidor paga un extra igual a lo que ya cobró cada lote de partidas ese día (multiplicador 2) con un tope diario igual al de las partidas. Con multiplicador 1 no hay extra.',
    '<b>Cosmético del año:</b> si lo dejas encendido, el cofre da el marco y la insignia del año de apertura (se dibujan en la app; hay hasta 2040). Apagarlo no quita los ya entregados.',
    '<b>Textos:</b> sin texto aquí, la app usa los suyos traducidos a 15 idiomas. Con texto, ese idioma usa el tuyo («*» vale para todos los idiomas sin texto propio). En «Felicidades» puedes poner {name} para el nombre del jugador.',
    '<b>Cuánto tarda:</b> la app guarda estos valores 30 minutos, así que un cambio puede tardar en llegar. Los cobros y el cofre ya usan lo nuevo al instante.',
    H_HORA
  ]
};

var CM = { d: {}, on: {}, saving: '', clave: 'notif_dia', lang: 'es', texto: '', url: null, mt: null, mx: null };
var CM_TOG = { cumple_activo: ['Cumpleaños encendido', 'Encendido', 'Apagado'], regalo_protector: ['Protector de racha en el cofre', 'Sí', 'No'], regalo_cosmetico: ['Marco e insignia del año en el cofre', 'Sí', 'No'] };
var CM_TXT = [
  ['notif_manana', 'Notificación de la víspera'],
  ['notif_dia', 'Notificación del día'],
  ['felicidades', 'Frase de Blokki al tocarlo ({name} = nombre)'],
  ['cofre_tarjeta', 'Tarjeta de Cumplegratis en el cofre'],
  ['cofre_boton', 'Botón de Cumplegratis']
];
var CM_LANGS = ['*', 'es', 'en', 'pt', 'fr', 'de', 'it', 'ru', 'tr', 'id', 'vi', 'hi', 'ja', 'ko', 'zh', 'ar'];

function cmRows() { var o = rm('cumple'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function cmCfg(r) { var m = {}; (r.config || []).forEach(function (c) { m[c.clave] = c; }); return m; }
function cmDraft(id, srv) { return id in CM.d ? CM.d[id] : (srv == null ? '' : String(srv)); }
function cmInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function cmTogOn(m, k) { return k in CM.on ? CM.on[k] : (m[k] ? m[k].valor === 1 : true); }
I.cmIn = function (el) { CM.d[el.id] = el.value; };
I.cmTexto = function (el) { CM.texto = el.value; };
I.cmUrl = function (el) { CM.url = el.value; };
C.cmTog = function (el) { CM.on[el.id.replace(/^cm_/, '')] = el.checked; };
C.cmClave = function (el) { CM.clave = el.value; };
C.cmLang = function (el) { CM.lang = el.value; };
A.cmReload = function () { CM.d = {}; CM.on = {}; CM.url = null; rload('cumple'); toast('Recargando…', 'info'); };

function cmKpis(s) {
  return '<div class="kpis">' +
    kpi('gift', 'Fechas registradas', nf(s.fechas), 'Jugadores que pusieron su día y mes') +
    kpi('spark', 'Cumplen hoy', nf(s.hoy), nf(s.semana) + ' en los próximos 7 días') +
    kpi('store', 'Cofres entregados', nf(s.cofres), nf(s.cofres_anio) + ' este año · ' + nf(s.cofres_hoy) + ' en 24 h') +
    kpi('trend', 'Bloques regalados', nf(s.bloques), 'Del cofre · más ' + nf(s.extra_x2) + ' del doble de partidas') +
    kpi('link', 'Clics a Cumplegratis', nf(s.clics), nf(s.clics_7d) + ' en 7 días · ' + nf(s.clics_hoy) + ' hoy') + '</div>';
}

function cmValores(r) {
  var m = cmCfg(r), h = '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Interruptor y regalo</h3><span class="sub grow">' + (cmTogOn(m, 'cumple_activo') ? 'Encendido' : 'Apagado: la app esconde todo') + '</span></div><div class="cb">';
  Object.keys(CM_TOG).forEach(function (k) {
    var c = m[k]; if (!c) return;
    h += '<div class="row nw" style="align-items:flex-start;margin-bottom:10px"><div class="grow"><b>' + esc(CM_TOG[k][0]) + '</b><div class="xs mut">' + esc(c.nota) + '</div></div>' + tog('cm_' + k, cmTogOn(m, k), CM_TOG[k][0], { dc: 'cmTog', on: CM_TOG[k][1], off: CM_TOG[k][2] }) + '</div>';
  });
  h += '<div class="grid g2">';
  (r.config || []).forEach(function (c) {
    if (CM_TOG[c.clave]) return;
    var id = 'cm_' + c.clave;
    h += field(id, c.nota, inp(id, cmDraft(id, c.valor), { type: 'number', mode: 'numeric', min: c.lo, ph: 'De fábrica: ' + nf(c.def), di: 'cmIn' }), 'Entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '. <b>Ahora:</b> ' + nf(c.valor) + (c.valor !== c.def ? ' (de fábrica ' + nf(c.def) + ')' : '') + '.');
  });
  return h + '</div><div class="row mt16"><button class="btn pri" data-a="cmSave"' + (CM.saving ? ' disabled' : '') + '>' + (CM.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptor y regalo</button><span class="xs mut">Te enseño «antes → después» antes de guardar.</span></div></div></div>';
}
A.cmSave = async function () {
  if (CM.saving) return;
  var r = cmRows(); if (!r) return;
  var m = cmCfg(r), errs = {}, ch = {}, dl = [];
  (r.config || []).forEach(function (c) {
    var v;
    if (CM_TOG[c.clave]) { v = cmTogOn(m, c.clave) ? 1 : 0; }
    else { var id = 'cm_' + c.clave; v = cmInt(cmDraft(id, c.valor), c.lo, c.hi); if (v == null) { errs[id] = 'Un entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '.'; return; } }
    if (v !== c.valor) { ch[c.clave] = v; dl.push([c.nota, nf(c.valor) + ' → <b>' + nf(v) + '</b>']); }
  });
  if (!showErrs(errs)) return;
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var off = ch.cumple_activo === 0;
  var ok = await confirmDlg({ title: off ? '¿Apagar los cumpleaños?' : '¿Guardar los valores de cumpleaños?', text: 'Esto afecta a todos los jugadores.', html: cbox(dl.concat([['A quién', 'A todos los jugadores con la app 2.0 o más nueva.'], ['Cuánto tarda', 'La app guarda estos valores unos 30 minutos; el cofre y los cobros ya usan lo nuevo al instante.']])), ok: off ? 'Apagar' : 'Sí, guardar', danger: off, icon: 'sliders' });
  if (!ok) return;
  CM.saving = 'cfg'; paintPage();
  try { await rpc('admin_cumple', { p_accion: 'config', p_datos: ch }); CM.d = {}; CM.on = {}; toast('Cumpleaños actualizado'); await rload('cumple', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  CM.saving = ''; paintPage();
};

/* ---- URL de Cumplegratis y textos ---- */
function cmTextos(r) {
  var url = CM.url != null ? CM.url : r.url;
  var h = '<div class="card sec"><div class="ch">' + ic('link') + '<h3>Cumplegratis</h3><span class="sub grow">Adónde lleva el botón del cofre</span></div><div class="cb">' +
    field('cm_url', 'URL del botón «Ver en Cumplegratis»', inp('cm_url', url, { ph: 'https://cumplegratis.fun/?ref=blokku', di: 'cmUrl', max: 300 }), 'Solo https. Vacío = la de fábrica (https://cumplegratis.fun/?ref=blokku). Cada clic se cuenta.') +
    '<div class="row mt16"><button class="btn pri" data-a="cmUrlSave">' + ic('check') + 'Guardar URL</button></div></div></div>';
  var tx = r.textos || [];
  h += '<div class="card sec"><div class="ch">' + ic('edit') + '<h3>Textos</h3><span class="sub grow">' + (tx.length ? nf(tx.length) + ' propios' : 'Todos de fábrica') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Sin texto propio, la app usa el suyo traducido. «*» = cualquier idioma sin texto propio.</p>';
  if (tx.length) h += '<div class="tw" style="margin-bottom:14px"><table class="tbl"><thead><tr><th>Texto</th><th>Idioma</th><th>Contenido</th><th></th></tr></thead><tbody>' + tx.map(function (t) {
    var n = CM_TXT.filter(function (x) { return x[0] === t.clave; })[0];
    return '<tr><td>' + esc(n ? n[1] : t.clave) + '</td><td class="mono">' + esc(t.lang) + '</td><td>' + esc(t.texto) + '</td><td class="num"><button class="btn sm ghost" data-a="cmTxtDel" data-k="' + esc(t.clave) + '" data-l="' + esc(t.lang) + '">' + ic('trash') + 'Quitar</button></td></tr>';
  }).join('') + '</tbody></table></div>';
  h += '<div class="grid g2">' + field('cm_clave', 'Texto', sel('cm_clave', CM.clave, CM_TXT.map(function (x) { return [x[0], x[1]]; }), { dc: 'cmClave' })) +
    field('cm_lang', 'Idioma', sel('cm_lang', CM.lang, CM_LANGS.map(function (l) { return [l, l === '*' ? '* (todos)' : l]; }), { dc: 'cmLang' })) + '</div>' +
    field('cm_texto', 'Contenido (hasta 300 caracteres)', inp('cm_texto', CM.texto, { di: 'cmTexto', max: 300, ph: '¡Feliz cumpleaños! 🎂 …' })) +
    '<div class="row mt16"><button class="btn pri" data-a="cmTxtSave">' + ic('check') + 'Guardar texto</button><span class="xs mut">Mismo clave + idioma reemplaza el anterior.</span></div></div></div>';
  return h;
}
A.cmUrlSave = async function () {
  var r = cmRows(); if (!r) return;
  var u = String(CM.url != null ? CM.url : r.url).trim();
  if (u !== '' && !/^https:\/\/[A-Za-z0-9.-]+(\/\S*)?$/.test(u)) { showErrs({ cm_url: 'Debe empezar con https:// y no llevar espacios.' }); return; }
  if (!await confirmDlg({ title: '¿Cambiar la URL de Cumplegratis?', text: 'El botón del cofre abrirá esta dirección.', html: cbox([['Antes', esc(r.url)], ['Ahora', esc(u || 'la de fábrica')]]), ok: 'Sí, guardar', icon: 'link' })) return;
  try { await rpc('admin_cumple', { p_accion: 'texto', p_datos: { clave: 'url', texto: u } }); CM.url = null; toast('URL guardada'); await rload('cumple', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
};
A.cmTxtSave = async function () {
  var t = String(CM.texto).trim();
  if (!t) { showErrs({ cm_texto: 'Escribe el texto.' }); return; }
  if (t.length > 300) { showErrs({ cm_texto: 'Máximo 300 caracteres.' }); return; }
  if (!await confirmDlg({ title: '¿Guardar este texto?', text: 'Lo verán los jugadores del idioma elegido.', html: cbox([['Texto', esc((CM_TXT.filter(function (x) { return x[0] === CM.clave; })[0] || [0, CM.clave])[1])], ['Idioma', esc(CM.lang)], ['Contenido', esc(t)]]), ok: 'Sí, guardar', icon: 'chat' })) return;
  try { await rpc('admin_cumple', { p_accion: 'texto', p_datos: { clave: CM.clave, lang: CM.lang, texto: t } }); CM.texto = ''; toast('Texto guardado'); await rload('cumple', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
};
A.cmTxtDel = async function (el) {
  try { await rpc('admin_cumple', { p_accion: 'texto', p_datos: { clave: el.dataset.k, lang: el.dataset.l, texto: null } }); toast('Texto quitado'); await rload('cumple', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

/* ---- quién cumple hoy y «Mandar mensaje» (reusa avisos por jugador) ---- */
function cmHoy(r) {
  var l = r.cumplen_hoy || [];
  var h = '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Cumplen hoy</h3><span class="sub grow">' + (l.length ? nf(l.length) + (l.length === 1 ? ' jugador' : ' jugadores') : 'Nadie por ahora') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Con la tolerancia de zona horaria puede salir quien cumple ayer o mañana en otra parte del mundo. Solo ves los nombres, nunca la fecha.</p>';
  if (!l.length) return h + '<p class="mut">Hoy nadie de los que registraron su cumpleaños cumple años.</p></div></div>';
  h += '<div class="chips" style="margin-bottom:14px">' + l.map(function (j) { return '<span class="fchip" aria-pressed="true">' + esc(j.nombre) + (j.pais ? ' <span class="n">' + esc(j.pais) + '</span>' : '') + '</span>'; }).join('') + '</div>' +
    '<h4 style="margin:6px 0 8px">Mandar mensaje a quien cumple hoy</h4>' +
    '<div class="grid g2">' + field('cm_mt', 'Título', inp('cm_mt', CM.mt == null ? '¡Feliz cumpleaños! 🎂' : CM.mt, { di: 'cmMt', max: 60 })) +
    field('cm_mx', 'Mensaje', inp('cm_mx', CM.mx == null ? 'Todo el equipo de Blokku te desea un gran día. ¡Abre tu cofre de cumpleaños!' : CM.mx, { di: 'cmMx', max: 200 })) + '</div>' +
    '<div class="row mt16"><button class="btn pri" data-a="cmMsg"' + (CM.saving ? ' disabled' : '') + '>' + (CM.saving === 'msg' ? '<span class="spin"></span>' : ic('bell')) + 'Mandar mensaje</button><span class="xs mut">Es un aviso solo para ' + (l.length === 1 ? 'esa persona' : 'esas ' + l.length + ' personas') + ' (app 1.0.8 o más nueva), vigente 24 horas. Lo ves y lo apagas en Avisos.</span></div></div></div>';
  return h;
}
I.cmMt = function (el) { CM.mt = el.value; };
I.cmMx = function (el) { CM.mx = el.value; };
A.cmMsg = async function () {
  if (CM.saving) return;
  var r = cmRows(); if (!r) return;
  var l = r.cumplen_hoy || [], t = String(CM.mt == null ? '¡Feliz cumpleaños! 🎂' : CM.mt).trim(), x = String(CM.mx == null ? 'Todo el equipo de Blokku te desea un gran día. ¡Abre tu cofre de cumpleaños!' : CM.mx).trim();
  var errs = {};
  if (!t) errs.cm_mt = 'Escribe un título.';
  if (!x) errs.cm_mx = 'Escribe el mensaje.';
  if (!showErrs(errs)) return;
  if (!l.length) { toast('Nadie cumple hoy', 'info'); return; }
  if (!await confirmDlg({ title: '¿Mandar el mensaje?', text: 'Lo verán solo quienes cumplen hoy.', html: cbox([['A quién', esc(l.map(function (j) { return j.nombre; }).join(', '))], ['Título', esc(t)], ['Mensaje', esc(x)], ['Vigencia', '24 horas']]), ok: 'Sí, mandar', icon: 'bell' })) return;
  CM.saving = 'msg'; paintPage();
  try {
    var fin = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    await rpc('admin_guardar_aviso', { p_aviso: { tipo: 'tarjeta', formato: 'tarjeta', titulo: { es: t, en: t }, texto: { es: x, en: x }, inicio: new Date(Date.now() - 60000).toISOString(), fin: fin, accion: '', destino: '', premio: '', imagen: '', botones: [], activo: true, orden: 0, repetir: 'una', plataforma: '', version_menor: '', jugadores: l.map(function (j) { return j.id; }) } });
    toast('Mensaje enviado'); rload('avisos');
  } catch (e) { toast(e.code === 'sin_sql' ? 'Falta correr 14-servidor.sql (avisos por jugador)' : 'No se pudo mandar: ' + e.message, 'bad'); }
  CM.saving = ''; paintPage();
};

function vCumple() {
  var o = rm('cumple');
  var h = pageHead('Cumpleaños', 'El regalo de cumpleaños de Blokku: cofre anual, <b>Bloques dobles</b> ese día, 🎂 en el ranking y el aviso a Cumplegratis.', '<button class="btn" data-a="cmReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.cumple, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 19-tienda.sql.') + '</div>' : rerr(o, 'los cumpleaños'));
  var r = cmRows();
  if (!r) return h + skel(4);
  return h + cmKpis(r.stats || {}) + cmValores(r) + cmTextos(r) + cmHoy(r);
}
VIEWS['juego/cumple'] = vCumple;
