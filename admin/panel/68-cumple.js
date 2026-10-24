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
  ve: 'En el Perfil, «Mi cumpleaños 🎂». La víspera, una notificación de Blokki («¡Mañana es tu cumple!»); el día, otra, Blokki con gorrito y pastel en el menú, confeti al abrir y el cofre. El cofre trae 500 Bloques, un protector de racha, el marco «Cumpleañero AAAA» y la insignia 🎂 del año (coleccionables: uno por año, nunca a la venta, ni el código maestro los da), y una tarjeta «Hoy te regalan cosas gratis por tu cumple» con el botón «Ver en Cumplegratis».',
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

var CU = { d: {}, on: {}, saving: '', clave: 'notif_dia', lang: 'es', texto: '', url: null, mt: null, mx: null };
var CU_TOG = { cumple_activo: ['Cumpleaños encendido', 'Encendido', 'Apagado'], regalo_protector: ['Protector de racha en el cofre', 'Sí', 'No'], regalo_cosmetico: ['Marco e insignia del año en el cofre', 'Sí', 'No'] };
var CU_TXT = [
  ['notif_manana', 'Notificación de la víspera'],
  ['notif_dia', 'Notificación del día'],
  ['felicidades', 'Frase de Blokki al tocarlo ({name} = nombre)'],
  ['cofre_tarjeta', 'Tarjeta de Cumplegratis en el cofre'],
  ['cofre_boton', 'Botón de Cumplegratis']
];
var CU_LANGS = ['*', 'es', 'en', 'pt', 'fr', 'de', 'it', 'ru', 'tr', 'id', 'vi', 'hi', 'ja', 'ko', 'zh', 'ar'];

function cuRows() { var o = rm('cumple'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function cuCfg(r) { var m = {}; (r.config || []).forEach(function (c) { m[c.clave] = c; }); return m; }
function cuDraft(id, srv) { return id in CU.d ? CU.d[id] : (srv == null ? '' : String(srv)); }
function cuInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function cuTogOn(m, k) { return k in CU.on ? CU.on[k] : (m[k] ? m[k].valor === 1 : true); }
I.cuIn = function (el) { CU.d[el.id] = el.value; };
I.cuTexto = function (el) { CU.texto = el.value; };
I.cuUrl = function (el) { CU.url = el.value; };
C.cuTog = function (el) { CU.on[el.id.replace(/^cu_/, '')] = el.checked; };
C.cuClave = function (el) { CU.clave = el.value; };
C.cuLang = function (el) { CU.lang = el.value; };
A.cuReload = function () { CU.d = {}; CU.on = {}; CU.url = null; rload('cumple'); toast('Recargando…', 'info'); };

function cuKpis(s) {
  return '<div class="kpis">' +
    kpi('gift', 'Fechas registradas', nf(s.fechas), 'Jugadores que pusieron su día y mes') +
    kpi('spark', 'Cumplen hoy', nf(s.hoy), nf(s.semana) + ' en los próximos 7 días') +
    kpi('store', 'Cofres entregados', nf(s.cofres), nf(s.cofres_anio) + ' este año · ' + nf(s.cofres_hoy) + ' en 24 h') +
    kpi('trend', 'Bloques regalados', nf(s.bloques), 'Del cofre · más ' + nf(s.extra_x2) + ' del doble de partidas') +
    kpi('link', 'Clics a Cumplegratis', nf(s.clics), nf(s.clics_7d) + ' en 7 días · ' + nf(s.clics_hoy) + ' hoy') + '</div>';
}

function cuValores(r) {
  var m = cuCfg(r), h = '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Interruptor y regalo</h3><span class="sub grow">' + (cuTogOn(m, 'cumple_activo') ? 'Encendido' : 'Apagado: la app esconde todo') + '</span></div><div class="cb">';
  Object.keys(CU_TOG).forEach(function (k) {
    var c = m[k]; if (!c) return;
    h += '<div class="row nw" style="align-items:flex-start;margin-bottom:10px"><div class="grow"><b>' + esc(CU_TOG[k][0]) + '</b><div class="xs mut">' + esc(c.nota) + '</div></div>' + tog('cu_' + k, cuTogOn(m, k), CU_TOG[k][0], { dc: 'cuTog', on: CU_TOG[k][1], off: CU_TOG[k][2] }) + '</div>';
  });
  h += '<div class="grid g2">';
  (r.config || []).forEach(function (c) {
    if (CU_TOG[c.clave]) return;
    var id = 'cu_' + c.clave;
    h += field(id, c.nota, inp(id, cuDraft(id, c.valor), { type: 'number', mode: 'numeric', min: c.lo, ph: 'De fábrica: ' + nf(c.def), di: 'cuIn' }), 'Entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '. <b>Ahora:</b> ' + nf(c.valor) + (c.valor !== c.def ? ' (de fábrica ' + nf(c.def) + ')' : '') + '.');
  });
  return h + '</div><div class="row mt16"><button class="btn pri" data-a="cuSave"' + (CU.saving ? ' disabled' : '') + '>' + (CU.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptor y regalo</button><span class="xs mut">Te enseño «antes → después» antes de guardar.</span></div></div></div>';
}
A.cuSave = async function () {
  if (CU.saving) return;
  var r = cuRows(); if (!r) return;
  var m = cuCfg(r), errs = {}, ch = {}, dl = [];
  (r.config || []).forEach(function (c) {
    var v;
    if (CU_TOG[c.clave]) { v = cuTogOn(m, c.clave) ? 1 : 0; }
    else { var id = 'cu_' + c.clave; v = cuInt(cuDraft(id, c.valor), c.lo, c.hi); if (v == null) { errs[id] = 'Un entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '.'; return; } }
    if (v !== c.valor) { ch[c.clave] = v; dl.push([c.nota, nf(c.valor) + ' → <b>' + nf(v) + '</b>']); }
  });
  if (!showErrs(errs)) return;
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var off = ch.cumple_activo === 0;
  var ok = await confirmDlg({ title: off ? '¿Apagar los cumpleaños?' : '¿Guardar los valores de cumpleaños?', text: 'Esto afecta a todos los jugadores.', html: cbox(dl.concat([['A quién', 'A todos los jugadores con la app 2.0 o más nueva.'], ['Cuánto tarda', 'La app guarda estos valores unos 30 minutos; el cofre y los cobros ya usan lo nuevo al instante.']])), ok: off ? 'Apagar' : 'Sí, guardar', danger: off, icon: 'sliders' });
  if (!ok) return;
  CU.saving = 'cfg'; paintPage();
  try { await rpc('admin_cumple', { p_accion: 'config', p_datos: ch }); CU.d = {}; CU.on = {}; toast('Cumpleaños actualizado'); await rload('cumple', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  CU.saving = ''; paintPage();
};

/* ---- URL de Cumplegratis y textos ---- */
function cuTextos(r) {
  var url = CU.url != null ? CU.url : r.url;
  var h = '<div class="card sec"><div class="ch">' + ic('link') + '<h3>Cumplegratis</h3><span class="sub grow">Adónde lleva el botón del cofre</span></div><div class="cb">' +
    field('cu_url', 'URL del botón «Ver en Cumplegratis»', inp('cu_url', url, { ph: 'https://cumplegratis.fun/?ref=blokku', di: 'cuUrl', max: 300 }), 'Solo https. Vacío = la de fábrica (https://cumplegratis.fun/?ref=blokku). Cada clic se cuenta.') +
    '<div class="row mt16"><button class="btn pri" data-a="cuUrlSave">' + ic('check') + 'Guardar URL</button></div></div></div>';
  var tx = r.textos || [];
  h += '<div class="card sec"><div class="ch">' + ic('edit') + '<h3>Textos</h3><span class="sub grow">' + (tx.length ? nf(tx.length) + ' propios' : 'Todos de fábrica') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Sin texto propio, la app usa el suyo traducido. «*» = cualquier idioma sin texto propio.</p>';
  if (tx.length) h += '<div class="tw" style="margin-bottom:14px"><table class="tbl"><thead><tr><th>Texto</th><th>Idioma</th><th>Contenido</th><th></th></tr></thead><tbody>' + tx.map(function (t) {
    var n = CU_TXT.filter(function (x) { return x[0] === t.clave; })[0];
    return '<tr><td>' + esc(n ? n[1] : t.clave) + '</td><td class="mono">' + esc(t.lang) + '</td><td>' + esc(t.texto) + '</td><td class="num"><button class="btn sm ghost" data-a="cuTxtDel" data-k="' + esc(t.clave) + '" data-l="' + esc(t.lang) + '">' + ic('trash') + 'Quitar</button></td></tr>';
  }).join('') + '</tbody></table></div>';
  h += '<div class="grid g2">' + field('cu_clave', 'Texto', sel('cu_clave', CU.clave, CU_TXT.map(function (x) { return [x[0], x[1]]; }), { dc: 'cuClave' })) +
    field('cu_lang', 'Idioma', sel('cu_lang', CU.lang, CU_LANGS.map(function (l) { return [l, l === '*' ? '* (todos)' : l]; }), { dc: 'cuLang' })) + '</div>' +
    field('cu_texto', 'Contenido (hasta 300 caracteres)', inp('cu_texto', CU.texto, { di: 'cuTexto', max: 300, ph: '¡Feliz cumpleaños! 🎂 …' })) +
    '<div class="row mt16"><button class="btn pri" data-a="cuTxtSave">' + ic('check') + 'Guardar texto</button><span class="xs mut">Mismo clave + idioma reemplaza el anterior.</span></div></div></div>';
  return h;
}
A.cuUrlSave = async function () {
  var r = cuRows(); if (!r) return;
  var u = String(CU.url != null ? CU.url : r.url).trim();
  if (u !== '' && !/^https:\/\/[A-Za-z0-9.-]+(\/\S*)?$/.test(u)) { showErrs({ cu_url: 'Debe empezar con https:// y no llevar espacios.' }); return; }
  if (!await confirmDlg({ title: '¿Cambiar la URL de Cumplegratis?', text: 'El botón del cofre abrirá esta dirección.', html: cbox([['Antes', esc(r.url)], ['Ahora', esc(u || 'la de fábrica')]]), ok: 'Sí, guardar', icon: 'link' })) return;
  try { await rpc('admin_cumple', { p_accion: 'texto', p_datos: { clave: 'url', texto: u } }); CU.url = null; toast('URL guardada'); await rload('cumple', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
};
A.cuTxtSave = async function () {
  var t = String(CU.texto).trim();
  if (!t) { showErrs({ cu_texto: 'Escribe el texto.' }); return; }
  if (t.length > 300) { showErrs({ cu_texto: 'Máximo 300 caracteres.' }); return; }
  if (!await confirmDlg({ title: '¿Guardar este texto?', text: 'Lo verán los jugadores del idioma elegido.', html: cbox([['Texto', esc((CU_TXT.filter(function (x) { return x[0] === CU.clave; })[0] || [0, CU.clave])[1])], ['Idioma', esc(CU.lang)], ['Contenido', esc(t)]]), ok: 'Sí, guardar', icon: 'chat' })) return;
  try { await rpc('admin_cumple', { p_accion: 'texto', p_datos: { clave: CU.clave, lang: CU.lang, texto: t } }); CU.texto = ''; toast('Texto guardado'); await rload('cumple', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
};
A.cuTxtDel = async function (el) {
  try { await rpc('admin_cumple', { p_accion: 'texto', p_datos: { clave: el.dataset.k, lang: el.dataset.l, texto: null } }); toast('Texto quitado'); await rload('cumple', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

/* ---- quién cumple hoy y «Mandar mensaje» (reusa avisos por jugador) ---- */
function cuHoy(r) {
  var l = r.cumplen_hoy || [];
  var h = '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Cumplen hoy</h3><span class="sub grow">' + (l.length ? nf(l.length) + (l.length === 1 ? ' jugador' : ' jugadores') : 'Nadie por ahora') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Con la tolerancia de zona horaria puede salir quien cumple ayer o mañana en otra parte del mundo. Solo ves los nombres, nunca la fecha.</p>';
  if (!l.length) return h + '<p class="mut">Hoy nadie de los que registraron su cumpleaños cumple años.</p></div></div>';
  h += '<div class="chips" style="margin-bottom:14px">' + l.map(function (j) { return '<span class="fchip" aria-pressed="true">' + esc(j.nombre) + (j.pais ? ' <span class="n">' + esc(j.pais) + '</span>' : '') + '</span>'; }).join('') + '</div>' +
    '<h4 style="margin:6px 0 8px">Mandar mensaje a quien cumple hoy</h4>' +
    '<div class="grid g2">' + field('cu_mt', 'Título', inp('cu_mt', CU.mt == null ? '¡Feliz cumpleaños! 🎂' : CU.mt, { di: 'cuMt', max: 60 })) +
    field('cu_mx', 'Mensaje', inp('cu_mx', CU.mx == null ? 'Todo el equipo de Blokku te desea un gran día. ¡Abre tu cofre de cumpleaños!' : CU.mx, { di: 'cuMx', max: 200 })) + '</div>' +
    '<div class="row mt16"><button class="btn pri" data-a="cuMsg"' + (CU.saving ? ' disabled' : '') + '>' + (CU.saving === 'msg' ? '<span class="spin"></span>' : ic('bell')) + 'Mandar mensaje</button><span class="xs mut">Es un aviso solo para ' + (l.length === 1 ? 'esa persona' : 'esas ' + l.length + ' personas') + ' (app 1.0.8 o más nueva), vigente 24 horas. Lo ves y lo apagas en Avisos.</span></div></div></div>';
  return h;
}
I.cuMt = function (el) { CU.mt = el.value; };
I.cuMx = function (el) { CU.mx = el.value; };
A.cuMsg = async function () {
  if (CU.saving) return;
  var r = cuRows(); if (!r) return;
  var l = r.cumplen_hoy || [], t = String(CU.mt == null ? '¡Feliz cumpleaños! 🎂' : CU.mt).trim(), x = String(CU.mx == null ? 'Todo el equipo de Blokku te desea un gran día. ¡Abre tu cofre de cumpleaños!' : CU.mx).trim();
  var errs = {};
  if (!t) errs.cu_mt = 'Escribe un título.';
  if (!x) errs.cu_mx = 'Escribe el mensaje.';
  if (!showErrs(errs)) return;
  if (!l.length) { toast('Nadie cumple hoy', 'info'); return; }
  if (!await confirmDlg({ title: '¿Mandar el mensaje?', text: 'Lo verán solo quienes cumplen hoy.', html: cbox([['A quién', esc(l.map(function (j) { return j.nombre; }).join(', '))], ['Título', esc(t)], ['Mensaje', esc(x)], ['Vigencia', '24 horas']]), ok: 'Sí, mandar', icon: 'bell' })) return;
  CU.saving = 'msg'; paintPage();
  try {
    var fin = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    await rpc('admin_guardar_aviso', { p_aviso: { tipo: 'tarjeta', formato: 'tarjeta', titulo: { es: t, en: t }, texto: { es: x, en: x }, inicio: new Date(Date.now() - 60000).toISOString(), fin: fin, accion: '', destino: '', premio: '', imagen: '', botones: [], activo: true, orden: 0, repetir: 'una', plataforma: '', version_menor: '', jugadores: l.map(function (j) { return j.id; }) } });
    toast('Mensaje enviado'); rload('avisos');
  } catch (e) { toast(e.code === 'sin_sql' ? 'Falta correr 14-servidor.sql (avisos por jugador)' : 'No se pudo mandar: ' + e.message, 'bad'); }
  CU.saving = ''; paintPage();
};

function vCumple() {
  var o = rm('cumple');
  var h = pageHead('Cumpleaños', 'El regalo de cumpleaños de Blokku: cofre anual, <b>Bloques dobles</b> ese día, 🎂 en el ranking y el aviso a Cumplegratis.', '<button class="btn" data-a="cuReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.cumple, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 19-tienda.sql.') + '</div>' : rerr(o, 'los cumpleaños'));
  var r = cuRows();
  if (!r) return h + skel(4);
  return h + cuKpis(r.stats || {}) + cuValores(r) + cuTextos(r) + cuHoy(r);
}
VIEWS['juego/cumple'] = vCumple;
