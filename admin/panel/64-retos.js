/* ================= RETOS ENTRE AMIGOS (15-retos.sql, app 2.0) ================= */
// admin_retos sin parámetros de ajuste = solo lectura: {config, stats, recientes}.
// Con p_activo / p_max_dia / p_dias también guarda. Rangos iguales a los del SQL.
var RT = { d: {}, on: null, saving: false };
var RT_MAXDIA = [1, 200], RT_DIAS = [1, 365];

function rtRows() { var o = rm('retos'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function rtOn(c) { return RT.on != null ? RT.on : c.activo !== false; }
function rtInt(raw, r) { var t = String(raw == null ? '' : raw).trim(); return /^\d+$/.test(t) && Number(t) >= r[0] && Number(t) <= r[1] ? Number(t) : null; }
function rtDraft(id, srv) { return id in RT.d ? RT.d[id] : (srv == null ? '' : String(srv)); }
I.rtIn = function (el) { RT.d[el.id] = el.value; };
C.rtTog = function (el) { RT.on = el.checked; };

function rtKpis(s) {
  return '<div class="kpis">' +
    kpi('rocket', 'Retos creados', nf(s.creados), nf(s.creados_7d) + ' en 7 días · ' + nf(s.creados_hoy) + ' en 24 h') +
    kpi('check', 'Retos aceptados', nf(s.aceptados), 'Con al menos 1 intento de un amigo') +
    kpi('trend', 'Conversión', pct(s.aceptados, s.creados), 'Aceptados entre creados') +
    kpi('play', 'Intentos totales', nf(s.intentos), 'Partidas jugadas para vencer un reto') +
    kpi('trophy', 'El amigo ganó', nf(s.ganados_amigo), s.aceptados ? pct(s.ganados_amigo, s.aceptados) + ' de los aceptados' : 'Aún sin retos aceptados') +
    kpi('user', 'Jugadores que retaron', nf(s.jugadores_retadores), 'Distintos jugadores con al menos 1 reto') + '</div>';
}

function rtAjustes(c) {
  var on = rtOn(c);
  return '<div class="card sec"><div class="ch">' + ic('sliders') + '<h3>Ajustes de los retos</h3><span class="sub grow">' + (c.activo === false ? 'Apagados: la app no deja crear retos' : 'Encendidos') + '</span></div><div class="cb">' +
    '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>Retos activos</b><div class="xs mut">Verde «Encendidos» = los jugadores pueden crear y aceptar retos. Gris «Apagados» = el botón desaparece y no se crean retos nuevos. Apagar no borra nada. Úsalo solo en una emergencia (abuso, mal funcionamiento).</div></div>' +
    tog('rt_activo', on, 'Retos entre amigos', { dc: 'rtTog', on: 'Encendidos', off: 'Apagados' }) + '</div>' +
    '<div class="grid g2 mt16">' +
    field('rt_max_dia', 'Retos por jugador al día', inp('rt_max_dia', rtDraft('rt_max_dia', c.max_dia), { type: 'number', mode: 'numeric', min: RT_MAXDIA[0], di: 'rtIn' }), 'Entero de ' + RT_MAXDIA[0] + ' a ' + RT_MAXDIA[1] + '. Cuántos retos puede crear un mismo jugador por día (por conexión, 5 veces esto). <b>Ahora:</b> ' + nf(c.max_dia) + '.') +
    field('rt_dias', 'Días que dura un código', inp('rt_dias', rtDraft('rt_dias', c.dias), { type: 'number', mode: 'numeric', min: RT_DIAS[0], di: 'rtIn' }), 'Entero de ' + RT_DIAS[0] + ' a ' + RT_DIAS[1] + '. Pasado ese tiempo el enlace dice «ya no está disponible». Solo cuenta para retos nuevos. <b>Ahora:</b> ' + nf(c.dias) + '.') +
    '</div><div class="row mt16"><button class="btn pri" data-a="rtSave"' + (RT.saving ? ' disabled' : '') + '>' + (RT.saving ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">Afecta a las apps 2.0 o más nuevas. La app guarda estos ajustes unas horas, así que un cambio puede tardar en llegar a todos.</span></div></div></div>';
}

function rtLista(list) {
  var h = '<div class="card sec"><div class="ch">' + ic('list') + '<h3>Retos recientes</h3><span class="sub grow">Los últimos ' + nf(list.length) + '</span></div>';
  if (!list.length) return h + '<div class="cb"><p class="mut">Todavía no hay retos. Aparecerán aquí cuando los jugadores con la app 2.0 empiecen a retar a sus amigos.</p></div></div>';
  h += '<div class="tw"><table class="tbl"><thead><tr><th>Código</th><th>Retador</th><th class="num">Puntos</th><th class="num">Intentos</th><th class="num">Mejor rival</th><th>Creado</th><th>Caduca</th></tr></thead><tbody>';
  list.forEach(function (r) {
    var code = String(r.codigo || ''), url = 'https://blokku.online/r/' + encodeURIComponent(code), vencido = r.caduca && new Date(r.caduca).getTime() < Date.now();
    h += '<tr><td class="mono"><a href="' + esc(url) + '" target="_blank" rel="noopener">' + esc(code) + ' ' + ic('ext') + '</a></td><td>' + esc(r.retador) + '</td><td class="num">' + nf(r.puntos) + '</td><td class="num">' + nf(r.intentos) + '</td><td class="num">' + (r.mejor_rival == null ? '—' : nf(r.mejor_rival) + (r.mejor_rival > r.puntos ? ' ' + ic('trophy') : '')) + '</td><td>' + esc(fdt(r.creado)) + '</td><td' + (vencido ? ' class="mut"' : '') + '>' + esc(fdt(r.caduca)) + (vencido ? ' (caducó)' : '') + '</td></tr>';
  });
  return h + '</tbody></table></div></div>';
}

function vRetos() {
  var o = rm('retos');
  var h = pageHead('Retos entre amigos', 'Un jugador termina una partida de Clásico, la app le da un código y su amigo juega <b>las mismas piezas</b> desde blokku.online/r/CÓDIGO. Aquí ves cuántos se crean y se aceptan, y ajustas los límites.', '<button class="btn" data-a="rtReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.retos, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 14-servidor.sql.') + '</div>' : rerr(o, 'los retos'));
  var r = rtRows();
  if (!r) return h + skel(4);
  return h + rtKpis(r.stats || {}) + rtAjustes(r.config) + rtLista(Array.isArray(r.recientes) ? r.recientes : []);
}
VIEWS['juego/retos'] = vRetos;
A.rtReload = function () { RT.d = {}; RT.on = null; rload('retos'); toast('Recargando…', 'info'); };

A.rtSave = async function () {
  if (RT.saving) return;
  var r = rtRows(); if (!r) return;
  var c = r.config, errs = {};
  var md = rtInt(rtDraft('rt_max_dia', c.max_dia), RT_MAXDIA), dd = rtInt(rtDraft('rt_dias', c.dias), RT_DIAS), on = rtOn(c);
  if (md == null) errs.rt_max_dia = 'Un entero de ' + RT_MAXDIA[0] + ' a ' + RT_MAXDIA[1] + '.';
  if (dd == null) errs.rt_dias = 'Un entero de ' + RT_DIAS[0] + ' a ' + RT_DIAS[1] + '.';
  if (!showErrs(errs)) return;
  var args = {}, dl = [];
  if (on !== (c.activo !== false)) { args.p_activo = on; dl.push(['Retos', (c.activo !== false ? 'Encendidos' : 'Apagados') + ' → <b>' + (on ? 'Encendidos' : 'Apagados') + '</b>']); }
  if (md !== c.max_dia) { args.p_max_dia = md; dl.push(['Retos por jugador al día', nf(c.max_dia) + ' → <b>' + nf(md) + '</b>']); }
  if (dd !== c.dias) { args.p_dias = dd; dl.push(['Días que dura un código', nf(c.dias) + ' → <b>' + nf(dd) + '</b>']); }
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var ok = await confirmDlg({ title: args.p_activo === false ? '¿Apagar los retos?' : '¿Guardar los ajustes de los retos?', text: 'Esto afecta a todos los jugadores.', html: cbox(dl.concat([['A quién', 'A todos los jugadores con la app 2.0 o más nueva. Las versiones anteriores no tienen retos.'], ['Cuánto tarda', 'La app guarda este ajuste unas horas, así que un cambio puede tardar en llegar a todos. Los códigos ya creados conservan su fecha de caducidad.']])), ok: args.p_activo === false ? 'Apagar' : 'Sí, guardar', danger: args.p_activo === false, icon: 'sliders' });
  if (!ok) return;
  RT.saving = true; paintPage();
  try {
    await rpc('admin_retos', args);
    RT.d = {}; RT.on = null; toast('Ajustes de retos guardados');
    await rload('retos', true);
  } catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  RT.saving = false; paintPage();
};
