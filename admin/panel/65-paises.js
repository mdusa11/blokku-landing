/* ================= PAÍSES (16-paises.sql, app 2.0) ================= */
// Copa de Países en vivo, historial de campeones, regalo del paquete de cada
// país (interruptor por país), URLs de Instagram/TikTok de Blokku y reglas de
// la Copa. Todo por admin_paises(p_clave, p_cambios): sin cambios solo lee; con
// {regalo|redes|config|recalcular|semana} guarda y devuelve el estado nuevo.
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA) para
// no tocar las listas de los demás archivos.
SQLF.paises = '16-paises.sql';
FNF.admin_paises = 'paises';
RFN.paises = 'admin_paises';
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/paises'; })) g.items.push(['juego/paises', 'Países', 'flag']);
  ROUTES['juego/paises'] = { t: 'Países', ic: 'flag', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/paises'] = {
  que: 'La Copa de Países (cada semana los países compiten con los puntos de Clásico de sus jugadores), el regalo del paquete de cada país y los enlaces a las redes de Blokku dentro del juego.',
  ve: 'En el ranking aparece una tarjeta «Copa de Países» con su bandera y «Tu país va #N». Los jugadores de un país con regalo encendido reciben su paquete (México: tema, piezas, marco, insignia y título «Orgullo Mexicano») la próxima vez que abren la app con cuenta del ranking. Quien juega en la semana que su país gana recibe la insignia y el título «Campeón de la Copa». En Ajustes salen los botones de Instagram y TikTok.',
  cuando: 'Revisa la Copa para ver cómo va la semana, enciende o apaga el regalo de un país, cambia los enlaces de redes cuando abras una cuenta nueva y ajusta las reglas si un país con pocos jugadores gana de forma injusta.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Las anteriores no tienen Copa, regalos ni botones de redes.',
    '<b>Cómo se puntúa:</b> cada país suma los <b>N mejores puntajes de Clásico</b> de la semana de sus jugadores (N = 10 de fábrica). Así un país enorme no gana solo por tener más gente, y uno con una sola estrella tampoco. Para ser campeón hace falta un mínimo de jugadores (3 de fábrica); los países con menos salen en la tabla, después de los que califican, marcados «Aún no califica».',
    '<b>Caché:</b> la tabla se recalcula como máximo cada 10 minutos. «Recalcular ahora» la fuerza. Una semana cerrada ya no cambia.',
    '<b>Cierre de semana:</b> la semana (lunes a domingo) se cierra el <b>martes a las 06:00 hora de México</b> (36 horas después de que termina en UTC, para que quepan todos los husos y los envíos en cola). Entonces se guarda el podio en el historial y el país campeón gana el premio. Solo se cierran las dos últimas semanas vencidas.',
    '<b>Regalo por país:</b> el interruptor verde «Encendido» = ese país recibe su paquete. Apagarlo no quita lo que ya se entregó; solo detiene las entregas nuevas. La «clave del paquete» tiene que existir en la app (hoy solo <b>mx</b>); con una clave que la app no conoce no pasa nada hasta que salga la versión con su arte.',
    '<b>País del jugador:</b> el que detecta Cloudflare cuando se registra en el ranking, no el idioma del teléfono.',
    '<b>Redes:</b> solo https://instagram.com/… y https://tiktok.com/@…. Vacío = el botón no sale en la app. Los enlaces llevan ?src=app para medir cuánta gente llega desde el juego. Quien toca un botón por primera vez recibe la insignia «Fan de Blokku», sin tener que seguir a nadie.',
    '<b>Cuánto tarda:</b> la app guarda esta configuración unas horas, así que un cambio puede tardar en llegar a todos.',
    H_HORA
  ]
};

var PA = { d: {}, alt: null, saving: '' };
var PA_PAQ = ['mx'];

function paRows() {
  if (PA.alt) return PA.alt;
  var o = rm('paises');
  return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null;
}
function paDraft(id, srv) { return id in PA.d ? PA.d[id] : (srv == null ? '' : String(srv)); }
I.paIn = function (el) { PA.d[el.id] = el.value; };
function paFlag(c) {
  c = String(c || '').toUpperCase();
  return bkFlag(c, 14);
}
function paName(c) {
  try { return new Intl.DisplayNames(['es'], { type: 'region' }).of(String(c).toUpperCase()) || c; } catch (e) { return c; }
}
function paLabel(c) { return paFlag(c) + ' ' + esc(paName(c)) + ' <span class="xs mut">' + esc(c) + '</span>'; }

/* ISO 8601: 'YYYY-Www' ± semanas */
function paWeekShift(k, n) {
  var m = /^(\d{4})-W(\d{2})$/.exec(k); if (!m) return k;
  var y = Number(m[1]), w = Number(m[2]);
  var jan4 = new Date(Date.UTC(y, 0, 4)), dow = (jan4.getUTCDay() + 6) % 7;
  var mon = new Date(jan4.getTime() - dow * 864e5 + (w - 1) * 7 * 864e5 + n * 7 * 864e5);
  var th = new Date(mon.getTime() + 3 * 864e5), ty = th.getUTCFullYear();
  var j1 = new Date(Date.UTC(ty, 0, 1)), wk = Math.floor((th.getTime() - j1.getTime()) / 864e5 / 7) + 1;
  return ty + '-W' + (wk < 10 ? '0' : '') + wk;
}

function paCopa(r) {
  var lista = r.copa || [], h = '<div class="card sec"><div class="ch">' + ic('trophy') + '<h3>Copa en vivo</h3><span class="sub grow">Semana ' + esc(r.semana) + (r.semana === r.actual ? ' (esta semana)' : '') + '</span></div><div class="cb">';
  h += '<div class="row" style="flex-wrap:wrap;gap:8px;margin-bottom:12px"><button class="btn sm" data-a="paWeek" data-d="-1">' + ic('chr') + 'Semana anterior</button><button class="btn sm" data-a="paWeek" data-d="1">Semana siguiente</button>' + (PA.alt && r.semana !== r.actual ? '<button class="btn sm" data-a="paWeek" data-d="0">Ir a esta semana</button>' : '') + '<button class="btn sm" data-a="paRecalc"' + (PA.saving ? ' disabled' : '') + '>' + (PA.saving === 'recalc' ? '<span class="spin"></span>' : ic('refresh')) + 'Recalcular ahora</button></div>';
  h += '<div class="xs mut" style="margin-bottom:12px">' + (r.calculado ? 'Calculada ' + esc(relT(r.calculado)) + ' (' + esc(fdt(r.calculado)) + ').' : 'Aún sin calcular.') + ' Cierra el <b>' + esc(fdt(r.cierra)) + '</b>. Cuenta los <b>' + nf(r.config.copa_top_n) + '</b> mejores puntajes de Clásico por país; para ganar hacen falta <b>' + nf(r.config.copa_min_jugadores) + '</b> jugadores.</div>';
  if (!lista.length) return h + '<p class="mut">Todavía no hay puntajes de Clásico en esta semana.</p></div></div>';
  h += '<div class="tw"><table class="tbl"><thead><tr><th>#</th><th>País</th><th class="num">Puntos de la Copa</th><th class="num">Jugadores</th><th>Estado</th></tr></thead><tbody>';
  lista.forEach(function (x) {
    h += '<tr><td>' + nf(x.pos) + '</td><td>' + paLabel(x.pais) + '</td><td class="num">' + nf(x.puntos) + '</td><td class="num">' + nf(x.jugadores) + '</td><td>' + (x.califica ? chip(x.pos === 1 ? 'Va ganando' : 'Califica', x.pos === 1 ? 'ok' : '') : chip('Aún no califica', 'warn')) + '</td></tr>';
  });
  return h + '</tbody></table></div></div></div>';
}

function paHistorial(r) {
  var l = r.historial || [], h = '<div class="card sec"><div class="ch">' + ic('star') + '<h3>Campeones de la Copa</h3><span class="sub grow">Historial de semanas cerradas</span></div>';
  if (!l.length) return h + '<div class="cb"><p class="mut">Todavía no se cierra ninguna semana. Cuando pase el cierre de la primera, aparecerá aquí el podio.</p></div></div>';
  var medal = ['🥇', '🥈', '🥉'];
  h += '<div class="tw"><table class="tbl"><thead><tr><th>Semana</th><th>Puesto</th><th>País</th><th class="num">Puntos</th><th class="num">Jugadores</th></tr></thead><tbody>';
  l.forEach(function (x) {
    h += '<tr><td class="mono">' + esc(x.semana) + '</td><td>' + (medal[x.puesto - 1] || x.puesto) + ' ' + nf(x.puesto) + '</td><td>' + paLabel(x.pais) + '</td><td class="num">' + nf(x.puntos) + '</td><td class="num">' + nf(x.jugadores) + '</td></tr>';
  });
  return h + '</tbody></table></div><div class="cb"><span class="xs mut">El campeón (puesto 1) gana la insignia y el título «Campeón de la Copa» para sus jugadores que jugaron esa semana. Los puestos 2 y 3 solo quedan en el historial.</span></div></div>';
}

function paRegalos(r) {
  var l = r.regalos || [], on = l.filter(function (x) { return x.activo; }).length;
  var h = '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Regalo del paquete de tu país</h3><span class="sub grow">' + (l.length ? plural(on, 'país con regalo encendido', 'países con regalo encendido') : 'Ninguno configurado') + '</span></div><div class="cb">';
  h += '<div class="rule">' + ic('info') + '<div><b>Verde «Encendido» = ese país recibe su paquete.</b> Se entrega una sola vez a cada jugador, cuando abre la app con cuenta del ranking y el servidor lo ubica en ese país. Apagarlo no quita lo ya entregado.</div></div>';
  if (l.length) {
    h += '<div class="col gap12">' + l.map(function (x) {
      return '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>' + paLabel(x.pais) + '</b><div class="xs mut">Paquete <span class="mono">' + esc(x.paquete) + '</span>' + (PA_PAQ.indexOf(x.paquete) < 0 ? ' · <b>la app 2.0 no lo conoce todavía</b> (no se entrega nada hasta que salga su arte)' : '') + ' · ' + nf(x.jugadores) + ' jugadores de este país en el ranking</div></div>' +
        tog('pa_reg_' + x.pais, x.activo, '', { dc: 'paRegalo', on: 'Encendido', off: 'Apagado' }).replace('<input ', '<input data-k="' + esc(x.pais) + '" ') +
        '<button class="btn sm ghost" data-a="paDel" data-k="' + esc(x.pais) + '" aria-label="Quitar ' + esc(x.pais) + '">' + ic('trash') + '</button></div>';
    }).join('') + '</div>';
  } else h += '<p class="mut">Ningún país tiene regalo. Agrega uno abajo.</p>';
  h += '<h4 style="margin:16px 0 8px">Agregar país</h4><div class="grid g2">' +
    field('pa_new_pais', 'País (código de 2 letras)', inp('pa_new_pais', paDraft('pa_new_pais', ''), { max: 2, ph: 'MX', di: 'paIn' }), 'Código ISO: MX, US, ES, AR…') +
    field('pa_new_paq', 'Clave del paquete', inp('pa_new_paq', paDraft('pa_new_paq', ''), { max: 20, ph: 'mx', di: 'paIn' }), 'Minúsculas, números o guion bajo. Vacío = el código del país en minúsculas. Paquetes que la app conoce hoy: <b>' + esc(PA_PAQ.join(', ')) + '</b>.') +
    '</div><div class="row"><button class="btn" data-a="paAdd"' + (PA.saving ? ' disabled' : '') + '>' + ic('plus') + 'Agregar y encender</button></div>';
  return h + '</div></div>';
}

function paRedes(r) {
  var x = r.redes || {};
  return '<div class="card sec"><div class="ch">' + ic('link') + '<h3>Redes de Blokku en el juego</h3><span class="sub grow">' + ((x.instagram || x.tiktok) ? 'Visibles en Ajustes' : 'Ocultas (sin enlaces)') + '</span></div><div class="cb"><div class="grid g2">' +
    field('pa_ig', 'Instagram', inp('pa_ig', paDraft('pa_ig', x.instagram), { max: 200, ph: 'https://www.instagram.com/…', di: 'paIn' }), 'Debe empezar con https://instagram.com/ o https://www.instagram.com/. Vacío = el botón no sale.') +
    field('pa_tt', 'TikTok', inp('pa_tt', paDraft('pa_tt', x.tiktok), { max: 200, ph: 'https://www.tiktok.com/@…', di: 'paIn' }), 'Debe empezar con https://tiktok.com/@ o https://www.tiktok.com/@. Vacío = el botón no sale.') +
    '</div><div class="row"><button class="btn pri" data-a="paSaveRedes"' + (PA.saving ? ' disabled' : '') + '>' + (PA.saving === 'redes' ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">La app agrega <span class="mono">?src=app</span> al abrirlos. La primera vez que un jugador toca un botón, gana la insignia «Fan de Blokku».</span></div></div></div>';
}

function paReglas(r) {
  var c = r.config;
  return '<div class="card sec"><div class="ch">' + ic('sliders') + '<h3>Reglas de la Copa</h3><span class="sub grow">Mejores ' + nf(c.copa_top_n) + ' · mínimo ' + nf(c.copa_min_jugadores) + ' jugadores</span></div><div class="cb"><div class="grid g2">' +
    field('pa_topn', 'Puntajes que cuentan por país', inp('pa_topn', paDraft('pa_topn', c.copa_top_n), { type: 'number', mode: 'numeric', min: 1, di: 'paIn' }), 'Entero de 1 a 100. Cada país suma sus N mejores puntajes de Clásico de la semana. Más alto = favorece a países con mucha gente; más bajo = decide el nivel de los mejores. <b>Ahora:</b> ' + nf(c.copa_top_n) + '.') +
    field('pa_minj', 'Jugadores mínimos para ser campeón', inp('pa_minj', paDraft('pa_minj', c.copa_min_jugadores), { type: 'number', mode: 'numeric', min: 1, di: 'paIn' }), 'Entero de 1 a 1,000. Un país con menos jugadores sale en la tabla pero no puede ganar ni entrar al podio. <b>Ahora:</b> ' + nf(c.copa_min_jugadores) + '.') +
    '</div><div class="row"><button class="btn pri" data-a="paSaveCfg"' + (PA.saving ? ' disabled' : '') + '>' + (PA.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">Recalcula la semana que estás viendo al guardar. Las semanas ya cerradas no cambian.</span></div></div></div>';
}

function paPaises(r) {
  var l = r.paises || [];
  if (!l.length) return '';
  return '<div class="card sec"><div class="ch">' + ic('user') + '<h3>Jugadores por país</h3><span class="sub grow">Los 30 con más jugadores registrados en el ranking</span></div><div class="cb"><div class="row" style="flex-wrap:wrap;gap:6px">' +
    l.map(function (x) { return '<span class="chip">' + paFlag(x.pais) + ' ' + esc(x.pais) + ' · ' + nf(x.jugadores) + '</span>'; }).join('') + '</div></div></div>';
}

function vPaises() {
  var o = rm('paises');
  var h = pageHead('Países', 'La <b>Copa de Países</b> de cada semana, el <b>regalo del paquete de tu país</b> y los enlaces a las redes de Blokku dentro del juego. Necesita la app 2.0 o más nueva.', '<button class="btn" data-a="paReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.paises, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 14-servidor.sql; solo crea cosas nuevas y no obliga a volver a correr nada.') + '</div>' : rerr(o, 'los países'));
  var r = paRows();
  if (!r) return h + skel(4);
  return h + paCopa(r) + paHistorial(r) + paRegalos(r) + paRedes(r) + paReglas(r) + paPaises(r);
}
VIEWS['juego/paises'] = vPaises;

A.paReload = function () { PA.d = {}; PA.alt = null; rload('paises'); toast('Recargando…', 'info'); };

function paCall(name, cambios, okMsg) {
  if (PA.saving) return Promise.resolve();
  PA.saving = name; paintPage();
  return rpc('admin_paises', { p_cambios: cambios }).then(function (r) {
    PA.alt = null; PA.d = {};
    var cur = RM.paises; if (cur) { cur.rows = r; cur.err = null; cur.t = Date.now(); }
    if (cambios.semana && r && r.semana !== r.actual) PA.alt = r;
    if (okMsg) toast(okMsg);
  }, function (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }).then(function () { PA.saving = ''; paintPage(); });
}

A.paWeek = function (el) {
  var r = paRows(); if (!r) return;
  var d = Number(el.dataset.d), sem = d === 0 ? r.actual : paWeekShift(r.semana, d);
  PA.saving = 'week'; paintPage();
  rpc('admin_paises', { p_cambios: { semana: sem } }).then(function (x) {
    PA.alt = x.semana === x.actual ? null : x;
    var cur = RM.paises; if (cur && x.semana === x.actual) { cur.rows = x; cur.err = null; }
  }, function (e) { toast(e.message, 'bad'); }).then(function () { PA.saving = ''; paintPage(); });
};

A.paRecalc = function () {
  var r = paRows(); if (!r) return;
  paCall('recalc', { recalcular: true, semana: r.semana }, 'Copa recalculada');
};

C.paRegalo = async function (el) {
  var k = el.dataset.k, on = el.checked, x = ((paRows() || {}).regalos || []).filter(function (g) { return g.pais === k; })[0];
  if (!x) return;
  var ok = await confirmDlg({
    title: on ? '¿Encender el regalo para ' + paName(k) + '?' : '¿Apagar el regalo para ' + paName(k) + '?',
    text: 'Esto afecta a los jugadores de ese país.',
    html: cbox([['Qué pasa', on ? 'Los jugadores de ' + esc(paName(k)) + ' con la app 2.0 recibirán el paquete <span class="mono">' + esc(x.paquete) + '</span> la próxima vez que abran la app (una sola vez).' : 'Se dejan de entregar paquetes nuevos en ' + esc(paName(k)) + '. Lo que ya se entregó se queda.'], ['Cuánto tarda', 'La app consulta al servidor al abrirse y como máximo cada 6 horas.']]),
    ok: on ? 'Sí, encender' : 'Sí, apagar', danger: !on, icon: 'gift'
  });
  if (!ok) { paintPage(); return; }
  paCall('reg', { regalo: { pais: k, activo: on } }, on ? 'Regalo encendido' : 'Regalo apagado');
};

A.paAdd = async function () {
  var pais = String(paDraft('pa_new_pais', '')).trim().toUpperCase(), paq = String(paDraft('pa_new_paq', '')).trim().toLowerCase() || pais.toLowerCase(), errs = {};
  if (!/^[A-Z]{2}$/.test(pais)) errs.pa_new_pais = 'Dos letras, por ejemplo MX.';
  if (!/^[a-z0-9_]{1,20}$/.test(paq)) errs.pa_new_paq = 'Minúsculas, números o guion bajo (máximo 20).';
  if (!showErrs(errs)) return;
  var ok = await confirmDlg({ title: '¿Encender el regalo para ' + paName(pais) + '?', text: 'Esto afecta a los jugadores de ese país.', html: cbox([['Paquete', '<span class="mono">' + esc(paq) + '</span>' + (PA_PAQ.indexOf(paq) < 0 ? ' — <b>la app 2.0 no lo conoce todavía</b>: no se entregará nada hasta que salga una versión con su arte.' : '')], ['Quién lo recibe', 'Cada jugador de ' + esc(paName(pais)) + ' con la app 2.0, una sola vez.']]), ok: 'Sí, agregar y encender', icon: 'gift' });
  if (!ok) return;
  paCall('add', { regalo: { pais: pais, paquete: paq, activo: true } }, 'País agregado');
};

A.paDel = async function (el) {
  var k = el.dataset.k;
  var ok = await confirmDlg({ title: '¿Quitar a ' + paName(k) + ' de la lista?', text: 'Se deja de entregar su paquete. Lo ya entregado se queda en los teléfonos.', ok: 'Quitar', danger: true, icon: 'trash' });
  if (!ok) return;
  paCall('del', { regalo: { pais: k, borrar: true } }, 'País quitado');
};

var PA_IG = /^https:\/\/(www\.)?instagram\.com\/[A-Za-z0-9._\/-]{1,100}$/, PA_TT = /^https:\/\/(www\.)?tiktok\.com\/@[A-Za-z0-9._]{1,60}\/?$/;
A.paSaveRedes = async function () {
  var r = paRows(); if (!r) return;
  var ig = String(paDraft('pa_ig', (r.redes || {}).instagram)).trim(), tt = String(paDraft('pa_tt', (r.redes || {}).tiktok)).trim(), errs = {};
  if (ig && !PA_IG.test(ig)) errs.pa_ig = 'Debe ser https://instagram.com/… (o www.instagram.com).';
  if (tt && !PA_TT.test(tt)) errs.pa_tt = 'Debe ser https://tiktok.com/@… (o www.tiktok.com).';
  if (!showErrs(errs)) return;
  if (ig === (r.redes || {}).instagram && tt === (r.redes || {}).tiktok) { toast('No hay cambios', 'info'); return; }
  var ok = await confirmDlg({ title: '¿Guardar los enlaces de redes?', text: 'Esto afecta a todos los jugadores.', html: cbox([['Instagram', ig ? esc(ig) : 'oculto'], ['TikTok', tt ? esc(tt) : 'oculto'], ['Cuánto tarda', 'La app guarda los enlaces unas horas (6 como máximo); sin internet usa los últimos que supo.']]), ok: 'Sí, guardar', icon: 'link' });
  if (!ok) return;
  paCall('redes', { redes: { instagram: ig, tiktok: tt } }, 'Enlaces guardados');
};

A.paSaveCfg = async function () {
  var r = paRows(); if (!r) return;
  var c = r.config, errs = {}, t = String(paDraft('pa_topn', c.copa_top_n)).trim(), m = String(paDraft('pa_minj', c.copa_min_jugadores)).trim();
  if (!/^\d+$/.test(t) || +t < 1 || +t > 100) errs.pa_topn = 'Un entero de 1 a 100.';
  if (!/^\d+$/.test(m) || +m < 1 || +m > 1000) errs.pa_minj = 'Un entero de 1 a 1,000.';
  if (!showErrs(errs)) return;
  if (+t === c.copa_top_n && +m === c.copa_min_jugadores) { toast('No hay cambios', 'info'); return; }
  var ok = await confirmDlg({ title: '¿Cambiar las reglas de la Copa?', text: 'Cambia cómo se calcula la Copa de la semana en curso y de las siguientes.', html: cbox([['Puntajes que cuentan', nf(c.copa_top_n) + ' → <b>' + nf(+t) + '</b>'], ['Jugadores mínimos', nf(c.copa_min_jugadores) + ' → <b>' + nf(+m) + '</b>'], ['Semanas cerradas', 'No cambian: su podio ya está guardado.']]), ok: 'Sí, guardar', icon: 'sliders' });
  if (!ok) return;
  paCall('cfg', { config: { copa_top_n: +t, copa_min_jugadores: +m }, semana: r.semana }, 'Reglas guardadas');
};
