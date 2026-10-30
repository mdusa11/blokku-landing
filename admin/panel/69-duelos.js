/* ================= 1 VS 1: DUELOS EN TIEMPO REAL (29-duelos.sql, app 2.0) ================= */
// Todo por admin_duelos(p_clave, p_accion, p_datos): sin acción solo lee
// {ajustes[{clave,valor,lo,hi,grupo,nota}], config, stats, en_curso, historial, sospechosos, tabla}.
//   'guardar'          {clave: valor, …}   enteros dentro de [lo, hi] (el servidor los vuelve a validar)
//   'sospechoso'       {id, valor:bool}    marcar / limpiar (marcado = sin premio y su grabación no se usa)
//   'cancelar'         {id}                cerrar un duelo colgado
//   'borrar_grabacion' {duelo_id}          que esa partida ya no salga como rival grabado
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.duelos = '29-duelos.sql';
FNF.admin_duelos = 'duelos';
RFN.duelos = 'admin_duelos';
N20['juego/duelos'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/duelos'; })) g.items.push(['juego/duelos', 'Duelos 1 vs 1', 'zap']);
  ROUTES['juego/duelos'] = { t: 'Duelos 1 vs 1', ic: 'zap', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/duelos'] = {
  que: 'El modo «1 vs 1»: dos jugadores juegan a la vez con las mismas piezas durante unos minutos y gana quien haga más puntos. Se juega con un amigo (código o enlace blokku.online/d/CÓDIGO), buscando rival, o contra un rival grabado / Blokki si no hay nadie.',
  ve: 'En el selector de modos aparece la tarjeta «1 vs 1» (solo si está encendido). Durante la partida ve el puntaje y una miniatura del tablero del rival, y un reloj. El rival grabado y el bot siempre dicen que lo son.',
  cuando: 'Enciéndelo cuando quieras probarlo. Revisa «Sospechosos» de vez en cuando y la cantidad de premios del día. Apágalo si algo falla: el modo desaparece de la app y no se pierde nada.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Nace <b>apagado</b>.',
    '<b>Quién decide quién gana:</b> siempre el servidor, con la hora del servidor. Si un jugador deja de dar señal más que la «gracia», el otro gana por abandono.',
    '<b>Anti-trampas:</b> un puntaje imposible para el tiempo jugado no se acepta (cuenta el último válido) y el duelo queda en «Sospechosos», sin premio. Un salto muy grande en medio segundo también lo marca.',
    '<b>Rival grabado:</b> es la partida real (limpia) de otro jugador con las mismas piezas. Si una grabación te parece rara, quítala con «No usar».',
    '<b>Premios:</b> Bloques por ganar, con tope de duelos premiados al día y con el mismo amigo (para que dos cuentas no se regalen victorias). Necesita la tienda (19-tienda.sql); sin ella no paga.',
    '<b>Cuánto tarda:</b> la app guarda estos ajustes unas horas; un cambio puede tardar en llegar a todos.',
    H_HORA
  ]
};

var DU = { d: {}, saving: false };
var DU_GRP = [
  ['general', 'Interruptores', 'power', 'Encender el modo y cada forma de jugar.'],
  ['partida', 'La partida', 'clock', 'Duración, cuenta regresiva y cuánto esperar a quien se desconecta.'],
  ['fila', 'Buscar rival y región', 'user', 'Cuánto se espera en la fila, cuánto se busca solo en tu región y qué tanta diferencia de nivel se acepta.'],
  ['premios', 'Premios y nivel', 'gift', 'Bloques por ganar, topes del día y cuánto se mueve el nivel (elo).'],
  ['trampas', 'Anti-trampas', 'lock', 'Límites de puntos creíbles.']
];
var DU_TIPO = { amigo: 'Amigo', cola: 'Fila', fantasma: 'Grabado', bot: 'Bot' };
var DU_MOT = { puntos: 'Puntos', abandono: 'Abandono', rendicion: 'Se rindió', plazo: 'Tiempo' };

function duRows() { var o = rm('duelos'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.ajustes ? o.rows : null; }
function duDraft(id, srv) { return id in DU.d ? DU.d[id] : (srv == null ? '' : String(srv)); }
function duInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
I.duIn = function (el) { DU.d[el.id] = el.value; };
C.duTog = function (el) { DU.d[el.id] = el.checked ? '1' : '0'; };

function duKpis(s, c) {
  return '<div class="kpis">' +
    kpi('power', 'Estado', c.activo ? 'Encendido' : 'Apagado', c.activo ? 'Se ve en la app 2.0' : 'El modo no aparece en la app') +
    kpi('play', 'Duelos jugados', nf(s.total), nf(s.hoy) + ' en 24 h · ' + nf(s.semana) + ' en 7 días') +
    kpi('live', 'Ahora', nf(s.en_curso), nf(s.en_cola) + ' buscando rival') +
    kpi('user', 'Por tipo', nf(s.amigo) + ' / ' + nf(s.cola), 'Amigo / fila · ' + nf(s.fantasma) + ' grabado · ' + nf(s.bot) + ' bot') +
    kpi('gift', 'Bloques hoy', nf(s.premios_hoy), 'Pagados por duelos en 24 h') +
    kpi('warn', 'Sospechosos', nf(s.sospechosos), nf(s.abandonos) + ' abandonos · ' + nf(s.empates) + ' empates') +
    kpi('history', 'Grabaciones', nf(s.grabaciones), 'Partidas limpias que sirven de rival grabado') + '</div>';
}

function duAjustes(r) {
  var h = '';
  DU_GRP.forEach(function (g) {
    var list = (r.ajustes || []).filter(function (a) { return a.grupo === g[0]; });
    if (!list.length) return;
    h += '<div class="card sec"><div class="ch">' + ic(g[2]) + '<h3>' + esc(g[1]) + '</h3><span class="sub grow">' + esc(g[3]) + '</span></div><div class="cb"><div class="grid g2">';
    list.forEach(function (a) {
      var id = 'du_' + a.clave;
      if (a.lo === 0 && a.hi === 1) {
        var on = duDraft(id, a.valor) === '1';
        h += '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>' + esc(a.nota) + '</b><div class="xs mut">Ahora: ' + (a.valor ? 'encendido' : 'apagado') + '</div></div>' + tog(id, on, a.nota, { dc: 'duTog', on: 'Sí', off: 'No' }) + '</div>';
      } else {
        h += field(id, a.nota, inp(id, duDraft(id, a.valor), { type: 'number', mode: 'numeric', min: a.lo, di: 'duIn' }), 'Entero de ' + nf(a.lo) + ' a ' + nf(a.hi) + '. <b>Ahora:</b> ' + nf(a.valor) + '.');
      }
    });
    h += '</div></div></div>';
  });
  return h + '<div class="row mt16"><button class="btn pri" data-a="duSave"' + (DU.saving ? ' disabled' : '') + '>' + (DU.saving ? '<span class="spin"></span>' : ic('check')) + 'Guardar ajustes</button><span class="xs mut">Afecta a la app 2.0 o más nueva. Puede tardar unas horas en llegar a todos.</span></div>';
}

function duTabla(title, icon, cols, rows, empty) {
  var h = '<div class="card sec"><div class="ch">' + ic(icon) + '<h3>' + esc(title) + '</h3><span class="sub grow">' + nf(rows.length) + '</span></div>';
  if (!rows.length) return h + '<div class="cb"><p class="mut">' + esc(empty) + '</p></div></div>';
  return h + '<div class="tw"><table class="tbl"><thead><tr>' + cols.map(function (c) { return '<th' + (c[1] ? ' class="num"' : '') + '>' + esc(c[0]) + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div></div>';
}

function duVs(d) { return esc(d.j1 || '—') + ' <span class="mut">vs</span> ' + (d.tipo === 'bot' ? '<i>Blokki (bot)</i>' : d.tipo === 'fantasma' ? '<i>grabado</i>' : esc(d.j2 || '…')); }

function vDuelos() {
  var o = rm('duelos');
  var h = pageHead('Duelos 1 vs 1', 'Dos jugadores, las mismas piezas, al mismo tiempo. Con un amigo por código, buscando rival o contra un rival grabado. El servidor decide quién gana.', '<button class="btn" data-a="duReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.duelos, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 4-ranking.sql y 9-limites.sql (y de 19-tienda.sql para pagar premios con su cartera).') + '</div>' : rerr(o, 'los duelos'));
  var r = duRows();
  if (!r) return h + skel(4);
  var s = r.stats || {}, c = r.config || {};
  var curso = (r.en_curso || []).map(function (d) {
    return '<tr><td class="mono">' + nf(d.id) + '</td><td>' + esc(DU_TIPO[d.tipo] || d.tipo) + (d.codigo ? ' <span class="mono xs">' + esc(d.codigo) + '</span>' : '') + '</td><td>' + duVs(d) + '</td><td>' + esc(d.estado === 'espera' ? 'Esperando amigo' : 'Jugando') + '</td><td class="num">' + nf(d.p1) + ' – ' + nf(d.p2) + '</td><td>' + esc(fdt(d.inicio || d.creado)) + '</td><td><button class="btn sm" data-a="duCancelar" data-id="' + esc(d.id) + '">' + ic('x') + 'Cerrar</button></td></tr>';
  });
  var hist = (r.historial || []).map(function (d) {
    var gan = d.resultado === 'empate' ? 'Empate' : d.resultado === 'j1' ? esc(d.j1) : (d.tipo === 'bot' ? 'Bot' : d.tipo === 'fantasma' ? 'Grabado' : esc(d.j2));
    return '<tr><td class="mono">' + nf(d.id) + '</td><td>' + esc(DU_TIPO[d.tipo] || d.tipo) + '</td><td>' + duVs(d) + '</td><td class="num">' + nf(d.p1) + ' – ' + nf(d.p2) + '</td><td>' + gan + '</td><td>' + esc(DU_MOT[d.motivo] || d.motivo || '') + '</td><td class="num">' + nf((d.premio1 || 0) + (d.premio2 || 0)) + '</td><td>' + (d.sospechoso ? ic('warn') : '') + '</td><td>' + esc(fdt(d.terminado)) + '</td></tr>';
  });
  var sosp = (r.sospechosos || []).map(function (d) {
    return '<tr><td class="mono">' + nf(d.id) + '</td><td>' + esc(DU_TIPO[d.tipo] || d.tipo) + '</td><td>' + duVs(d) + '</td><td class="num">' + nf(d.p1) + ' – ' + nf(d.p2) + '</td><td class="xs mono">' + esc(d.nota || '') + '</td><td>' + esc(fdt(d.creado)) + '</td><td><button class="btn sm" data-a="duLimpiar" data-id="' + esc(d.id) + '">' + ic('check') + 'No es trampa</button> <button class="btn sm" data-a="duGrab" data-id="' + esc(d.id) + '">' + ic('trash') + 'No usar grabación</button></td></tr>';
  });
  var tabla = (r.tabla || []).map(function (t, i) {
    return '<tr><td class="num">' + (i + 1) + '</td><td>' + esc(t.nombre) + '</td><td class="num">' + nf(t.elo) + '</td><td class="num">' + nf(t.ganadas) + ' / ' + nf(t.perdidas) + ' / ' + nf(t.empates) + '</td><td class="num">' + nf(t.jugadas) + '</td></tr>';
  });
  return h + duKpis(s, c) + duAjustes(r) +
    duTabla('Duelos en curso', 'live', [['#'], ['Tipo'], ['Jugadores'], ['Estado'], ['Puntos', 1], ['Desde'], ['']], curso, 'Ningún duelo en curso ahora.') +
    duTabla('Sospechosos', 'warn', [['#'], ['Tipo'], ['Jugadores'], ['Puntos', 1], ['Por qué'], ['Cuándo'], ['']], sosp, 'Nada sospechoso. Aquí aparecen los duelos con puntajes imposibles o saltos raros.') +
    duTabla('Historial (últimos 50)', 'history', [['#'], ['Tipo'], ['Jugadores'], ['Puntos', 1], ['Ganó'], ['Motivo'], ['Bloques', 1], [''], ['Terminó']], hist, 'Todavía no hay duelos terminados.') +
    duTabla('Mejores por nivel (elo)', 'trophy', [['#', 1], ['Jugador'], ['Nivel', 1], ['G / P / E', 1], ['Duelos', 1]], tabla, 'Aún no hay jugadores con duelos.');
}
VIEWS['juego/duelos'] = vDuelos;
A.duReload = function () { DU.d = {}; rload('duelos'); toast('Recargando…', 'info'); };

A.duSave = async function () {
  if (DU.saving) return;
  var r = duRows(); if (!r) return;
  var ch = {}, dl = [], errs = {};
  (r.ajustes || []).forEach(function (a) {
    var id = 'du_' + a.clave;
    if (!(id in DU.d)) return;
    var v = duInt(DU.d[id], a.lo, a.hi);
    if (v == null) { errs[id] = 'Un entero de ' + a.lo + ' a ' + a.hi + '.'; return; }
    if (v !== a.valor) { ch[a.clave] = v; dl.push([a.nota, nf(a.valor) + ' → <b>' + nf(v) + '</b>']); }
  });
  if (!showErrs(errs)) return;
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var apaga = ch.activo === 0, enciende = ch.activo === 1;
  var ok = await confirmDlg({ title: apaga ? '¿Apagar el 1 vs 1?' : enciende ? '¿Encender el 1 vs 1?' : '¿Guardar los ajustes de los duelos?', text: 'Esto afecta a todos los jugadores con la app 2.0.', html: cbox(dl.concat([['Cuánto tarda', 'La app guarda estos ajustes unas horas. Los duelos que ya empezaron terminan con las reglas con las que empezaron.']])), ok: apaga ? 'Apagar' : 'Sí, guardar', danger: apaga, icon: 'sliders' });
  if (!ok) return;
  DU.saving = true; paintPage();
  try { await rpc('admin_duelos', { p_accion: 'guardar', p_datos: ch }); DU.d = {}; toast('Ajustes de duelos guardados'); await rload('duelos', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  DU.saving = false; paintPage();
};

async function duAccion(accion, datos, pregunta, okMsg) {
  var ok = await confirmDlg({ title: pregunta, text: '', ok: 'Sí', icon: 'zap' });
  if (!ok) return;
  try { await rpc('admin_duelos', { p_accion: accion, p_datos: datos }); toast(okMsg); await rload('duelos', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
}
A.duCancelar = function (el) { duAccion('cancelar', { id: Number(el.dataset.id) }, '¿Cerrar este duelo?', 'Duelo cerrado'); };
A.duLimpiar = function (el) { duAccion('sospechoso', { id: Number(el.dataset.id), valor: false }, '¿Quitar la marca de sospechoso? (No devuelve el premio que no se pagó.)', 'Marca quitada'); };
A.duGrab = function (el) { duAccion('borrar_grabacion', { duelo_id: Number(el.dataset.id) }, '¿Dejar de usar esta partida como rival grabado?', 'Grabación retirada'); };
