/* ================= TU MES EN BLOKKU (30-wrapped.sql, app 2.0) ================= */
// admin_wrapped(p_clave, p_cambios): sin cambios solo lee {config:{activo,aviso,percentil,percentil_min}}.
// Todo lo demás (contadores del mes, tarjetas) vive en el teléfono de cada jugador.
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.wrapped = '30-wrapped.sql';
FNF.admin_wrapped = 'wrapped';
RFN.wrapped = 'admin_wrapped';
N20['juego/wrapped'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/wrapped'; })) g.items.push(['juego/wrapped', 'Mes en Blokku', 'spark']);
  ROUTES['juego/wrapped'] = { t: 'Mes en Blokku', ic: 'spark', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/wrapped'] = {
  que: 'La función «Tu mes en Blokku» (estilo Spotify Wrapped): del día 1 al 7 de cada mes sale un aviso en el menú y, todo el mes, un botón en el Perfil, con 5 a 7 tarjetas animadas del mes anterior (partidas, líneas, mejor puntaje, combo, racha, tema favorito, hora favorita, comparación con el mes pasado y cierre con Blokki). Cada tarjeta se puede compartir como imagen. Aquí la enciendes o apagas.',
  ve: 'En el menú, una tarjeta «¡Ya está tu mes en Blokku!» los primeros 7 días del mes (una vez por mes; se puede cerrar). En el Perfil, el botón «Tu mes en Blokku» durante todo el mes siguiente. Las tarjetas se pasan tocando a la derecha (o a la izquierda para volver) y se pausan manteniendo pulsado.',
  cuando: 'Enciéndela cerca del día 1 del mes, con la app 2.0 ya en manos de los jugadores. Apágala solo en una emergencia: no borra nada del teléfono de nadie.',
  como: [
    '<b>De fábrica está APAGADA.</b> Sin este SQL (30-wrapped.sql) o con el interruptor apagado, la app esconde todo sin errores. Los contadores del mes se siguen anotando en el teléfono (son locales y baratos), así que al encenderla ya hay mes que mostrar.',
    '<b>Aviso del menú:</b> se puede apagar solo el aviso y dejar el botón del Perfil.',
    '<b>«Superaste al X % de los jugadores»:</b> es el único dato que viene del servidor. Se calcula con el mejor puntaje de Clásico de las semanas del mes (cada semana cuenta para el mes de su jueves), sin sospechosos ni ocultos, y solo sale si el jugador tiene cuenta del ranking y hay al menos el mínimo de jugadores de abajo. Si no hay dato real, la tarjeta simplemente no muestra esa línea.',
    '<b>Primera edición:</b> los contadores empiezan cuando el jugador instala la 2.0; la primera tarjeta le dice «Contamos desde el día X». Lo que no se registró antes no se inventa ni se compara.',
    '<b>Cuánto tarda:</b> la app guarda estos valores unas 6 horas, así que un cambio puede tardar en llegar.',
    H_HORA
  ]
};

var WR = { on: {}, min: null, saving: false };
var WR_TOG = { activo: ['Tu mes en Blokku encendido', 'Encendido', 'Apagado', 'Interruptor maestro. Apagado = la app esconde todo (menú y Perfil).'], aviso: ['Aviso en el menú los primeros 7 días', 'Sí', 'No', 'Apagado = solo queda el botón del Perfil.'], percentil: ['Línea «Superaste al X % de los jugadores»', 'Sí', 'No', 'Apagado = esa línea nunca sale.'] };
function wrCfg() { var o = rm('wrapped'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows.config : null; }
function wrOn(c, k) { return k in WR.on ? WR.on[k] : (k === 'activo' ? c[k] === true : c[k] !== false); }
C.wrTog = function (el) { WR.on[el.id.replace(/^wr_/, '')] = el.checked; };
I.wrMin = function (el) { WR.min = el.value; };
A.wrReload = function () { WR.on = {}; WR.min = null; rload('wrapped'); toast('Recargando…', 'info'); };
A.wrSave = async function () {
  if (WR.saving) return;
  var c = wrCfg(); if (!c) return;
  var ch = {}, dl = [], errs = {};
  Object.keys(WR_TOG).forEach(function (k) {
    var v = wrOn(c, k), now = k === 'activo' ? c[k] === true : c[k] !== false;
    if (v !== now) { ch[k] = v; dl.push([WR_TOG[k][0], (now ? WR_TOG[k][1] : WR_TOG[k][2]) + ' → <b>' + (v ? WR_TOG[k][1] : WR_TOG[k][2]) + '</b>']); }
  });
  if (WR.min != null) {
    var t = String(WR.min).trim();
    if (!/^\d{1,6}$/.test(t) || Number(t) < 2 || Number(t) > 100000) errs.wr_min = 'Un entero de 2 a 100000.';
    else if (Number(t) !== c.percentil_min) { ch.percentil_min = Number(t); dl.push(['Mínimo de jugadores para el porcentaje', nf(c.percentil_min) + ' → <b>' + nf(Number(t)) + '</b>']); }
  }
  if (!showErrs(errs)) return;
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var off = ch.activo === false, on = ch.activo === true;
  if (!await confirmDlg({ title: off ? '¿Apagar Tu mes en Blokku?' : (on ? '¿Encender Tu mes en Blokku?' : '¿Guardar los cambios?'), text: 'Esto afecta a todos los jugadores.', html: cbox(dl.concat([['A quién', 'A todos los jugadores con la app 2.0 o más nueva.'], ['Cuánto tarda', 'La app guarda estos valores unas 6 horas.']])), ok: off ? 'Apagar' : 'Sí, guardar', danger: off, icon: 'spark' })) return;
  WR.saving = true; paintPage();
  try { await rpc('admin_wrapped', { p_cambios: ch }); WR.on = {}; WR.min = null; toast('Guardado'); await rload('wrapped', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  WR.saving = false; paintPage();
};
function vWrapped() {
  var o = rm('wrapped');
  var h = pageHead('Mes en Blokku', '«Tu mes en Blokku»: el resumen mensual con tarjetas animadas que el jugador comparte. Los números salen de su teléfono; solo el «superaste al X %» viene de aquí.', '<button class="btn" data-a="wrReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.wrapped, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 26-ranking-mas-lugares.sql.') + '</div>' : rerr(o, 'Tu mes en Blokku'));
  var c = wrCfg();
  if (!c) return h + skel(3);
  var on = wrOn(c, 'activo');
  var b = '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Interruptores</h3><span class="sub grow">' + (on ? 'Encendido' : 'Apagado: la app esconde todo') + '</span></div><div class="cb">';
  Object.keys(WR_TOG).forEach(function (k) {
    b += '<div class="row nw" style="align-items:flex-start;margin-bottom:10px"><div class="grow"><b>' + esc(WR_TOG[k][0]) + '</b><div class="xs mut">' + esc(WR_TOG[k][3]) + '</div></div>' + tog('wr_' + k, wrOn(c, k), 'Interruptor', { dc: 'wrTog', on: WR_TOG[k][1], off: WR_TOG[k][2] }) + '</div>';
  });
  b += field('wr_min', 'Mínimo de jugadores para mostrar el porcentaje', inp('wr_min', WR.min == null ? String(c.percentil_min == null ? 20 : c.percentil_min) : WR.min, { type: 'number', mode: 'numeric', min: 2, ph: 'De fábrica: 20', di: 'wrMin' }), 'Entero de 2 a 100000. Con menos jugadores con puntaje ese mes, la línea no sale.') +
    '<div class="row mt16"><button class="btn pri" data-a="wrSave"' + (WR.saving ? ' disabled' : '') + '>' + (WR.saving ? '<span class="spin"></span>' : ic('check')) + 'Guardar</button><span class="xs mut">Te enseño «antes → después» antes de guardar.</span></div></div></div>';
  return h + b;
}
VIEWS['juego/wrapped'] = vWrapped;
