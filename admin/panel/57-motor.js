/* ================= EVENTOS DE JUEGO: motor de eventos (17-motor-eventos.sql, app 2.0) ================= */
// La app 2.0 trae programados los TIPOS de modificador; aquí solo se eligen
// tipo + parámetros + fechas + meta + premio + textos. Todo se valida igual en
// el SQL (_motor_validar) y en la app (lib/services/motor_eventos.dart).
// Este archivo se registra solo (ruta, ayuda, SQL) para no tocar los demás.

SQLF.motor = '17-motor-eventos.sql';
['admin_motor', 'admin_motor_guardar', 'admin_motor_borrar', 'admin_motor_config', 'admin_motor_detalle', 'muerte_tabla'].forEach(function (f) { FNF[f] = 'motor'; });
RFN.motor = 'admin_motor';
(function () {
  var g = NAV.filter(function (x) { return x.k === 'vivo'; })[0];
  if (!g) return;
  g.items.push(['vivo/motor', 'Eventos de juego', 'rocket']);
  ROUTES['vivo/motor'] = { t: 'Eventos de juego', ic: 'rocket', g: g.g, k: g.k };
})();

AYUDA['vivo/motor'] = {
  que: 'Eventos que cambian cómo se juega por unos días: puntos dobles, lluvia de piezas, tablero en espejo, sin poderes, Muerte súbita… o un «Jefe semanal» que todos los jugadores derrotan juntos. Se arman aquí, sin sacar versión de la app.',
  ve: 'Una tarjeta del evento en el menú principal (con su progreso, o la vida del jefe que va bajando). Al tocarla ve qué cambia, la meta, el premio y el botón «Jugar el evento». Al empezar la partida, un aviso le recuerda las reglas.',
  cuando: 'Para dar una semana especial (Blokkumanía), un fin de semana distinto (Espejo), un reto entre todos (Jefe semanal) o un modo difícil (Muerte súbita). Combínalo con un aviso para anunciarlo.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Las anteriores no lo ven (no pasa nada malo).',
    H_TARDA, H_OFFLINE,
    '<b>Partida de evento:</b> si eliges un modo (Clásico, Contra reloj, Zen o Muerte súbita), la tarjeta trae el botón «Jugar el evento» y los modificadores solo aplican en esas partidas. Sin modo, el evento solo cuenta su meta en las partidas normales.',
    '<b>Ranking:</b> las partidas de evento <b>no van al ranking normal</b> (así un ×3 no ensucia la tabla) y no cambian el récord del clásico; cada evento guarda el récord aparte. Muerte súbita sin otros modificadores tiene su propia tabla (abajo).',
    '<b>Reto diario:</b> ningún modificador lo toca (sus piezas y su tablero son iguales para todos). La única excepción es «XP en todas las partidas», que solo da más XP.',
    '<b>Meta entre todos (Jefe semanal):</b> cada jugador suma con sus partidas y la app lo manda en lote (al terminar partidas, como mucho cada 2 minutos). Si la vida del jefe llega a 0 antes del fin, <b>todos los que aportaron</b> ganan el premio (aunque abran la app hasta 7 días después).',
    '<b>Trampas:</b> el servidor solo acepta lo que es posible jugar en el tiempo que pasó; lo demás lo recorta y marca al jugador como sospechoso (lo ves en «Detalle»). También puedes poner un tope por jugador.',
    '<b>Interruptor general:</b> «Motor de eventos» apagado = ningún evento de aquí se ve ni cuenta (lo ya ganado se queda). El interruptor «Eventos» de Ajustes del juego también los apaga.',
    '<b>Versiones futuras:</b> si algún día la app trae un tipo nuevo, una app vieja ignora lo que no conoce; si es esencial para el evento, no le muestra ese evento.',
    '<b>Plantillas:</b> un toque llena el formulario con un evento listo; revisa fechas y premio y guarda.',
    H_SW, H_ESTADOS, H_HORA
  ]
};

/* ---------- catálogo (mismo que _motor_catalogo y la app) ---------- */
var MX_COLORES = [['-1', 'El del evento (sale solo)'], ['0', 'Cian'], ['1', 'Rosa'], ['2', 'Verde'], ['3', 'Naranja'], ['4', 'Morado'], ['5', 'Amarillo'], ['6', 'Azul'], ['7', 'Rojo-naranja'], ['8', 'Cian brillante'], ['9', 'Rosa brillante']];
var MX_POD = [['bomb', 'Bomba'], ['lightning', 'Rayo'], ['undo', 'Deshacer'], ['shuffle', 'Mezclar'], ['picker', 'Gotero de color']];
var MX_MODS = [
  { t: 'puntos_x', n: 'Multiplicador de puntos', d: 'La partida del evento da más puntos. ×2 = el doble.', p: [['x', 'Multiplicador (×)', 1.5, 3, 2, '0.5']] },
  { t: 'xp_x', n: 'Multiplicador de XP', d: 'Más XP por línea y por partida. El tope de 3,000 XP por partida sigue igual.', p: [['x', 'Multiplicador (×)', 1.5, 3, 1.5, '0.5']], todo: 1 },
  { t: 'combo_x', n: 'Combos valen más', d: 'Cada nivel de racha cuenta más. ×2 = un combo ×3 vale como ×5.', p: [['x', 'Multiplicador (×)', 1.5, 3, 2, '0.5']] },
  { t: 'lluvia', n: 'Lluvia de piezas', d: 'Salen más piezas pequeñas (fácil) o grandes (difícil). Es un sesgo: «Fuerza 60 %» = 6 de cada 10 piezas salen del grupo elegido.', p: [['fuerza', 'Fuerza (%)', 25, 100, 60, '5']], piezas: 1 },
  { t: 'espejo', n: 'Modo espejo', d: 'Cada N piezas el tablero se voltea de izquierda a derecha (con un aviso «¡Espejo!»).', p: [['cada', 'Cada cuántas piezas', 5, 30, 10, '1']] },
  { t: 'poderes_extra', n: 'Poderes extra al inicio', d: 'Cargas de más con las que arranca la partida (0 a 3 de cada uno).', pod: 1 },
  { t: 'sin_poderes', n: 'Sin poderes (hardcore)', d: 'Ningún poder en la partida.', p: [] },
  { t: 'reloj_seg', n: 'Tiempo extra o menos', d: 'Solo con el modo Contra reloj: segundos que se suman (o restan, con −) a los 90 normales. Entre 45 y 150 s en total.', p: [['seg', 'Segundos (−45 a 60)', -45, 60, 30, '5']] },
  { t: 'color_unico', n: 'Piezas de un solo color', d: 'Todas las piezas salen del mismo color. Ojo: una línea de un solo color vale ×3, así que se hacen muchos puntos.', color: 1 },
  { t: 'tema', n: 'Tema del evento', d: 'Durante la partida del evento se ve este tema, aunque el jugador no lo tenga (al salir vuelve el suyo).', tema: 1 }
];
var MX_MODOS = [['', 'Sin partida propia (solo cuenta la meta en partidas normales)'], ['clasico', 'Clásico'], ['reloj', 'Contra reloj'], ['zen', 'Zen'], ['muerte', 'Muerte súbita (sin reserva, sin poderes, sin revivir)']];
var MX_METAS = [['partidas', 'Jugar partidas'], ['lineas', 'Limpiar líneas'], ['puntos', 'Puntos (en una partida; entre todos: la suma)'], ['combos', 'Hacer combos (racha ×2 o más)'], ['retos', 'Completar retos diarios']];
var MX_OCULTOS = [['espacio', 'Espacio'], ['vegas', 'Vegas'], ['laboratorio', 'Laboratorio'], ['olimpo', 'Olimpo'], ['heroes', 'Héroes']];
var MX_PIEZAS_OCULTAS = ['theme', 'style', 'effect', 'frame', 'badge', 'title'];
var MX = { cfg: null, saving: '', det: {}, muerte: null };

function mxRows() { var o = rm('motor'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) ? o.rows : null; }
function mxEvs() { var r = mxRows(); return (r && r.eventos) || []; }
function mxEst(e) { return winEst(e.activo, e.inicio, e.fin); }
function mxModTxt(m) {
  switch (m.tipo) {
    case 'puntos_x': return 'Puntos ×' + m.x;
    case 'xp_x': return 'XP ×' + m.x + (m.todo ? ' en todas las partidas' : '');
    case 'combo_x': return 'Combos ×' + m.x;
    case 'lluvia': return 'Lluvia de piezas ' + (m.piezas === 'grandes' ? 'grandes' : 'pequeñas') + ' (' + m.fuerza + ' %)';
    case 'espejo': return 'Espejo cada ' + m.cada + ' piezas';
    case 'poderes_extra': return 'Poderes extra: ' + MX_POD.filter(function (p) { return m[p[0]]; }).map(function (p) { return p[1] + ' +' + m[p[0]]; }).join(', ');
    case 'sin_poderes': return 'Sin poderes';
    case 'reloj_seg': return (m.seg > 0 ? '+' : '−') + Math.abs(m.seg) + ' s en Contra reloj';
    case 'color_unico': return 'Piezas de un solo color';
    case 'tema': return 'Tema: ' + cname(m.id);
  }
  return m.tipo;
}
function mxMetaTxt(m) {
  if (!m) return '';
  var n = nf(m.objetivo), t = m.tipo;
  var s = t === 'partidas' ? 'Jugar ' + n + ' partidas' : t === 'lineas' ? 'Limpiar ' + n + ' líneas' : t === 'puntos' ? (m.comunitaria ? 'Sumar ' + n + ' puntos' : 'Hacer ' + n + ' puntos en una partida') : t === 'combos' ? 'Hacer ' + n + ' combos' : 'Completar ' + n + ' retos diarios';
  return (m.comunitaria ? 'Entre todos: ' : '') + s + (m.solo_evento ? ' (solo partidas del evento)' : '') + (m.tope ? ' · tope ' + nf(m.tope) + ' por jugador' : '');
}
function mxModo(e) { var m = MX_MODOS.filter(function (x) { return x[0] === (e.modo || ''); })[0]; return m ? m[1].split(' (')[0] : e.modo; }
function mxPremioIds(e) { return ((e.premios || {}).cosmeticos || []); }

/* ---------- vista previa (como la tarjeta de la app) ---------- */
function mxCardPrev(e) {
  var now = Date.now(), up = now < new Date(e.inicio).getTime(), days = Math.max(1, Math.ceil(((up ? new Date(e.inicio) : new Date(e.fin)).getTime() - now) / 864e5));
  var when = up ? (days === 1 ? 'Empieza en 1 día' : 'Empieza en ' + days + ' días') : (days === 1 ? 'Último día' : 'Quedan ' + days + ' días');
  var m = e.meta || {}, com = !!m.comunitaria, st = e.stats || {};
  var p = mxPremioIds(e).map(pc).filter(Boolean)[0];
  var acc = /^#[0-9a-f]{6}$/i.test(e.acento || '') ? e.acento : '';
  var mods = (e.mods || []).map(mxModTxt);
  if (e.modo === 'muerte') mods.unshift('Muerte súbita');
  var ey = com ? (ml((e.jefe || {}).nombre) || 'Jefe semanal') : 'Evento';
  var vida = com ? Math.max(0, 1 - (st.total || 0) / Math.max(1, m.objetivo || 1)) : 0;
  var bar = up ? '<p>' + esc(mxMetaTxt(m)) + '</p>' :
    com ? '<div class="gpb"><span class="bar"><i style="width:' + Math.round(vida * 100) + '%;background:#FF4D5E"></i></span>' + (st.derrotado ? '¡Jefe derrotado!' : 'Vida: ' + nf(Math.max(0, (m.objetivo || 0) - (st.total || 0)))) + '</div>'
      : '<div class="gpb"><span class="bar"><i style="width:0"></i></span>0/' + nf(m.objetivo || 0) + '</div>';
  return '<div class="gcard' + (acc ? ' ac' : '') + '"' + (acc ? ' style="--edge:' + acc + '"' : '') + '><div class="ga">' + (com ? gem('spark') : p ? thumb(p, '', true) : gem('gift')) + '</div><div class="gtx"><div class="ey">' + esc(ey) + '</div><div class="gtt"><b>' + esc(ml(e.nombre) || e.id || 'Nombre del evento') + '</b><span class="gch">' + when + '</span></div>' +
    (mods.length ? '<p style="margin:2px 0 4px;opacity:.75">' + esc(mods.join(' · ')) + '</p>' : '') + bar + '</div></div>';
}
function mxSheetPrev(e) {
  var m = e.meta || {}, ids = mxPremioIds(e), xp = (e.premios || {}).xp || 0;
  return '<div class="card pad" style="max-width:330px;margin:12px auto 0;font-size:13px"><div class="xs mut" style="text-transform:uppercase;letter-spacing:1px">Al tocar la tarjeta</div>' +
    '<b style="display:block;font-size:16px;margin:4px 0">' + esc(ml(e.nombre) || 'Nombre del evento') + '</b>' + (ml(e.descripcion) ? '<p class="sm mut">' + esc(ml(e.descripcion)) + '</p>' : '') +
    '<div class="row mt8" style="flex-wrap:wrap;gap:6px">' + (e.modo === 'muerte' ? chipN('Muerte súbita', 'warn') : '') + (e.mods || []).map(function (x) { return chipN(mxModTxt(x), 'info'); }).join('') + '</div>' +
    '<div class="mt8"><b>' + esc(mxMetaTxt(m)) + '</b></div>' +
    '<div class="row mt8" style="flex-wrap:wrap;gap:6px">' + ids.map(function (c) { return '<span class="pkc">' + cthumb(c) + esc(cname(c)) + '</span>'; }).join('') + (xp ? chipN('+' + nf(xp) + ' XP', 'ok') : '') + '</div>' +
    (e.modo ? '<div class="btn pri mt12" style="width:100%;justify-content:center;pointer-events:none">' + ic('play') + 'Jugar el evento</div><p class="xs mut mt4" style="text-align:center">Las partidas de evento no cuentan para el ranking normal.</p>' : '') + '</div>';
}

/* ---------- plantillas ---------- */
// Fechas en hora de México (UTC−6 fijo). dow: 1 = lunes … 5 = viernes.
function mxProximo(dow, hora) {
  var mx = new Date(Date.now() - 6 * 36e5), d = mx.getUTCDay(), add = (dow - d + 7) % 7 || 7;
  return new Date(Date.UTC(mx.getUTCFullYear(), mx.getUTCMonth(), mx.getUTCDate() + add, hora + 6)).toISOString();
}
function mxMas(iso, dias) { return new Date(new Date(iso).getTime() + dias * 864e5).toISOString(); }
var MX_PLANTILLAS = [
  { k: 'mania', n: 'Semana Blokkumanía', d: 'Una semana de Clásico con puntos ×2, combos ×1.5 y XP ×1.5 en todas las partidas. Meta: 10 partidas del evento.', ic: 'rocket',
    f: function () { var a = mxProximo(1, 0); return { id: 'blokkumania_' + a.slice(5, 10).replace('-', ''), nombre: { es: 'Semana Blokkumanía', en: 'Blokkumania Week' }, descripcion: { es: 'Toda la semana: puntos dobles, combos que valen más y XP extra en todas las partidas.', en: 'All week: double points, stronger combos and extra XP in every game.' }, inicio: a, fin: mxMas(a, 7), modo: 'clasico', mods: [{ tipo: 'puntos_x', x: 2 }, { tipo: 'combo_x', x: 1.5 }, { tipo: 'xp_x', x: 1.5, todo: true }], meta: { tipo: 'partidas', objetivo: 10, solo_evento: true }, premios: { cosmeticos: [], xp: 1000 }, acento: '#FFC93C', activo: false }; } },
  { k: 'combos', n: 'Lluvia de combos', d: 'Tres días con piezas pequeñas (fácil encadenar) y combos ×2. Meta: 60 combos.', ic: 'zap',
    f: function () { var a = mxProximo(5, 0); return { id: 'lluvia_combos_' + a.slice(5, 10).replace('-', ''), nombre: { es: 'Lluvia de combos', en: 'Combo Shower' }, descripcion: { es: 'Llueven piezas pequeñas y cada combo vale el doble. ¡Encadénalos!', en: 'Small pieces rain down and every combo counts double. Chain them!' }, inicio: a, fin: mxMas(a, 3), modo: 'clasico', mods: [{ tipo: 'lluvia', piezas: 'pequenas', fuerza: 60 }, { tipo: 'combo_x', x: 2 }], meta: { tipo: 'combos', objetivo: 60 }, premios: { cosmeticos: [], xp: 600 }, acento: '#4EA1FF', activo: false }; } },
  { k: 'espejo', n: 'Fin de semana espejo', d: 'Viernes 18:00 a lunes: el tablero se voltea cada 10 piezas y los puntos valen ×1.5. Meta: 150 líneas en partidas del evento.', ic: 'dup',
    f: function () { var a = mxProximo(5, 18); return { id: 'espejo_' + a.slice(5, 10).replace('-', ''), nombre: { es: 'Fin de semana espejo', en: 'Mirror Weekend' }, descripcion: { es: 'Cada 10 piezas el tablero se voltea. ¿Te adaptas?', en: 'Every 10 pieces the board flips. Can you adapt?' }, inicio: a, fin: mxMas(a, 2.25), modo: 'clasico', mods: [{ tipo: 'espejo', cada: 10 }, { tipo: 'puntos_x', x: 1.5 }], meta: { tipo: 'lineas', objetivo: 150, solo_evento: true }, premios: { cosmeticos: [], xp: 600 }, acento: '#9C6BFF', activo: false }; } },
  { k: 'jefe', n: 'Jefe semanal', d: 'Un jefe con vida = 200,000 líneas entre todos. Cada línea de cualquier partida le resta. Si cae antes del domingo, todos los que ayudaron ganan.', ic: 'trophy',
    f: function () { var a = mxProximo(1, 0); return { id: 'jefe_' + a.slice(5, 10).replace('-', ''), nombre: { es: 'Jefe semanal', en: 'Weekly Boss' }, descripcion: { es: 'Cada línea que limpias le quita vida. Si lo derrotamos antes del domingo, todos los que ayudaron ganan el premio.', en: 'Every line you clear hurts it. Beat it before Sunday and everyone who helped wins.' }, inicio: a, fin: mxMas(a, 7), modo: '', mods: [], meta: { tipo: 'lineas', objetivo: 200000, comunitaria: true, tope: 5000 }, jefe: { nombre: { es: 'Blokkzilla', en: 'Blokkzilla' } }, premios: { cosmeticos: [], xp: 1500 }, acento: '#FF5D8F', activo: false }; } },
  { k: 'muerte', n: 'Muerte súbita', d: 'Una semana de Muerte súbita: sin reserva, sin poderes, sin revivir. Meta: 40,000 puntos en una partida.', ic: 'power',
    f: function () { var a = mxProximo(1, 0); return { id: 'muerte_' + a.slice(5, 10).replace('-', ''), nombre: { es: 'Semana de Muerte súbita', en: 'Sudden Death Week' }, descripcion: { es: 'Sin reserva, sin poderes y sin segunda oportunidad. Un error y se acabó.', en: 'No hold, no powers, no second chances. One mistake and it is over.' }, inicio: a, fin: mxMas(a, 7), modo: 'muerte', mods: [], meta: { tipo: 'puntos', objetivo: 40000, solo_evento: true }, premios: { cosmeticos: [], xp: 1000 }, acento: '#FF8A3D', activo: false }; } }
];

/* ---------- vista ---------- */
function mxStats(e) {
  var s = e.stats || {}, m = e.meta || {}, com = !!m.comunitaria, h = '<div class="row mt12" style="flex-wrap:wrap;gap:6px">';
  h += chipN(plural(s.participantes || 0, 'participante'), '');
  if (com) {
    var pr = Math.min(1, (s.total || 0) / Math.max(1, m.objetivo || 1));
    h += s.derrotado ? chipN('¡Jefe derrotado! ' + fdt(s.derrotado), 'ok') : chipN('Vida del jefe: ' + nf(Math.max(0, (m.objetivo || 0) - (s.total || 0))), 'warn');
    h += '</div><div class="bar mt8"><i style="width:' + Math.round(pr * 100) + '%"></i></div><div class="xs mut mt4">Entre todos: ' + nf(s.total || 0) + ' de ' + nf(m.objetivo || 0) + ' (' + pct(s.total || 0, m.objetivo || 0) + ')</div>';
  } else {
    h += chipN(plural(s.completados || 0, 'completó', 'completaron') + ' la meta', s.completados ? 'ok' : '') + '</div>';
  }
  if (s.sospechosos) h += '<div class="xs mt4" style="color:var(--warn)">' + ic('warn') + ' ' + plural(s.sospechosos, 'jugador sospechoso', 'jugadores sospechosos') + ' (aportes recortados)</div>';
  return h;
}
function mxCard(e) {
  var st = mxEst(e), P = mxPremioIds(e), xp = (e.premios || {}).xp || 0;
  return '<div class="card pad"><div class="row">' + estChip(st) + '<span class="code" style="font-size:12px">' + esc(e.id) + '</span>' + chipN(mxModo(e) || 'Sin partida', 'info') + (e.reglas > 1 ? chipN('App con reglas ' + e.reglas + '+', 'warn') : '') + '</div>' +
    '<h3 class="mt8" style="font-size:17px;font-weight:700">' + esc(ml(e.nombre) || e.id) + '</h3>' + (ml(e.descripcion) ? '<p class="sm mut mt4">' + esc(ml(e.descripcion)) + '</p>' : '') +
    ((e.mods || []).length ? '<div class="row mt8" style="flex-wrap:wrap;gap:6px">' + e.mods.map(function (m) { return chipN(mxModTxt(m), ''); }).join('') + '</div>' : '') +
    '<div class="row mt12 sm">' + ic('trophy', 'faint') + '<b>' + esc(mxMetaTxt(e.meta)) + '</b></div>' +
    '<div class="row mt8 sm">' + ic('clock', 'faint') + esc(fdt(e.inicio)) + ' → ' + esc(fdt(e.fin)) + ' <span class="mut">· ' + (st === 'activo' ? 'termina ' + relT(e.fin) : st === 'proximo' ? 'empieza ' + relT(e.inicio) : st === 'terminado' ? 'terminó ' + relT(e.fin) : 'apagado') + '</span></div>' +
    (st !== 'proximo' ? mxStats(e) : '') +
    '<div class="row mt12" style="flex-wrap:wrap;gap:6px">' + P.map(function (c) { return '<span class="pkc">' + cthumb(c) + esc(cname(c)) + '</span>'; }).join('') + (xp ? chipN('+' + nf(xp) + ' XP', 'ok') : '') + '</div>' +
    '<div class="row mt12"><button class="btn sm" data-a="mxEdit" data-id="' + esc(e.id) + '">' + ic('edit') + 'Editar</button><button class="btn sm" data-a="mxTog" data-id="' + esc(e.id) + '">' + ic(e.activo ? 'pause' : 'play') + (e.activo ? 'Apagar' : 'Encender') + '</button><button class="btn sm ghost" data-a="mxDet" data-id="' + esc(e.id) + '">' + ic('chart') + 'Detalle</button><button class="btn sm ghost" data-a="mxDup" data-id="' + esc(e.id) + '">' + ic('dup') + 'Duplicar</button><button class="btn sm ghost dng" data-a="mxDel" data-id="' + esc(e.id) + '">' + ic('trash') + 'Borrar</button></div></div>';
}
function mxMuerteCard() {
  var t = MX.muerte;
  if (!t) { mxMuerteLoad(); return ''; }
  var f = (t.filas || []).slice(0, 10);
  return '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Ranking de Muerte súbita</h3><span class="sub grow">Histórico · ' + plural(t.total || 0, 'jugador', 'jugadores') + '</span><button class="btn sm ghost" data-a="mxMuerteRe">' + ic('refresh') + '</button></div><div class="cb">' +
    (f.length ? '<div class="list">' + f.map(function (r) { return '<div class="li"><b style="width:28px">' + r.pos + '</b><div class="t"><b>' + esc(r.nombre) + '</b><span class="xs mut">' + esc(r.pais || '') + '</span></div><b>' + nf(r.puntos) + '</b></div>'; }).join('') + '</div>' : '<p class="sm mut">Todavía nadie. Aquí llegan las partidas de Muerte súbita sin otros modificadores de puntos (la del selector de modos o un evento «Muerte súbita» puro). Los sospechosos no salen.</p>') +
    '<p class="xs mut mt8">La app 2.0 manda el mejor puntaje de cada semana. Mostrar esta tabla dentro de la app queda para una versión siguiente (ver MEJORAS 2.0).</p></div></div>';
}
function mxMuerteLoad() {
  if (MX.muerteBusy) return; MX.muerteBusy = true;
  rpc('muerte_tabla', { p_periodo: 'historico', p_n: 10 }, { anon: true, nomiss: true }).then(function (r) { MX.muerte = r || { filas: [] }; }, function () { MX.muerte = { filas: [], total: 0 }; }).then(function () { MX.muerteBusy = false; repaint(); });
}
A.mxMuerteRe = function () { MX.muerte = null; repaint(); };

function vMotor() {
  var o = rm('motor'), r = mxRows();
  var h = pageHead('Eventos de juego', 'Arma eventos que cambian cómo se juega (puntos dobles, espejo, lluvia de piezas, Muerte súbita, Jefe semanal…) <b>sin sacar versión</b>. La app 2.0 trae los tipos; aquí eliges cuáles, con qué valores, fechas, meta y premio.',
    '<button class="btn" data-a="mxReload">' + ic('refresh') + 'Recargar</button><button class="btn pri" data-a="mxNew">' + ic('plus') + 'Nuevo evento</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.motor, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 14-servidor.sql; solo crea tablas y funciones nuevas.') + '</div>' : rerr(o, 'los eventos de juego'));
  if (!r) return h + skel(4);
  // Interruptores
  h += '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Interruptores</h3><span class="sub grow">' + (r.encendido ? 'Motor encendido: los eventos funcionan' : 'Motor apagado: ningún evento de aquí se ve') + '</span></div><div class="cb"><div class="col gap12">' +
    '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>Motor de eventos</b><div class="xs mut">Verde «Encendido» = los eventos de esta sección se ven y cuentan. Gris «Apagado» = ninguno se ve ni cuenta (lo ya ganado se queda). Para emergencias.</div></div>' + tog('mx_on', MX.cfg && 'on' in MX.cfg ? MX.cfg.on : r.encendido, '', {}) + '</div>' +
    '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>Muerte súbita en el selector de modos</b><div class="xs mut">Verde = aparece como modo fijo al tocar «Jugar» (con su propio ranking). Gris = solo existe en los eventos que la usen.</div></div>' + tog('mx_mu', MX.cfg && 'mu' in MX.cfg ? MX.cfg.mu : r.muerte_siempre, '', { on: 'Visible', off: 'Oculto' }) + '</div>' +
    '</div><div class="row mt16"><button class="btn pri" data-a="mxSaveCfg"' + (MX.saving ? ' disabled' : '') + '>' + (MX.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptores</button><span class="xs mut">Los teléfonos lo reciben en unos minutos (como máximo unos 15).</span></div></div></div>';
  // Plantillas
  h += '<div class="sec"><div class="sech"><h2>Plantillas listas</h2><span class="sub">Un toque abre el editor ya lleno (empieza apagado: revisa y enciende).</span></div><div class="grid g3">' +
    MX_PLANTILLAS.map(function (p) { return '<button class="card pad" style="text-align:left;cursor:pointer" data-a="mxTpl" data-k="' + p.k + '"><div class="row">' + ic(p.ic) + '<b>' + esc(p.n) + '</b></div><p class="sm mut mt4">' + esc(p.d) + '</p></button>'; }).join('') + '</div></div>';
  // Eventos
  var E = mxEvs().slice().sort(function (a, b) { var o2 = { activo: 0, proximo: 1, inactivo: 2, terminado: 3 }; return o2[mxEst(a)] - o2[mxEst(b)] || new Date(a.inicio) - new Date(b.inicio); });
  h += '<div class="sec"><div class="sech"><h2>Eventos</h2><span class="sub">' + plural(E.length, 'evento') + '</span></div>' +
    (E.length ? '<div class="grid g2">' + E.map(mxCard).join('') + '</div>' : '<div class="card">' + emptyBox('rocket', 'Sin eventos de juego', 'Empieza con una plantilla de arriba o crea uno desde cero.', '<button class="btn pri" data-a="mxNew">' + ic('plus') + 'Nuevo evento</button>') + '</div>') + '</div>';
  h += mxMuerteCard();
  return h;
}
VIEWS['vivo/motor'] = vMotor;
A.mxReload = function () { MX.cfg = null; MX.muerte = null; rload('motor'); toast('Recargando…', 'info'); };
C.mxCfg = function () { };
document.addEventListener('change', function (ev) {
  var t = ev.target; if (!t || (t.id !== 'mx_on' && t.id !== 'mx_mu')) return;
  MX.cfg = MX.cfg || {}; MX.cfg[t.id === 'mx_on' ? 'on' : 'mu'] = t.checked;
});
A.mxSaveCfg = async function () {
  var r = mxRows(); if (!r || MX.saving) return;
  var on = MX.cfg && 'on' in MX.cfg ? MX.cfg.on : r.encendido, mu = MX.cfg && 'mu' in MX.cfg ? MX.cfg.mu : r.muerte_siempre;
  if (on === r.encendido && mu === r.muerte_siempre) { toast('No hay cambios', 'info'); return; }
  var L = [];
  if (on !== r.encendido) L.push(['Motor de eventos', on ? '<b>Encendido</b>: los eventos de aquí se ven y cuentan.' : '<b>Apagado</b>: ningún evento de aquí se ve ni cuenta.']);
  if (mu !== r.muerte_siempre) L.push(['Muerte súbita en el selector', mu ? '<b>Visible</b>' : '<b>Oculta</b>']);
  L.push(['A quién', 'A todos los jugadores con la app 2.0 o más nueva.'], ['Cuánto tarda', LLEGA]);
  if (!await confirmDlg({ title: '¿Guardar los interruptores?', text: 'Esto afecta a todos los jugadores.', html: cbox(L), ok: 'Sí, guardar', icon: 'power' })) return;
  MX.saving = 'cfg'; repaint();
  try { await rpc('admin_motor_config', { p_encendido: on, p_muerte_siempre: mu }); MX.cfg = null; toast('Interruptores guardados'); await rload('motor', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  MX.saving = ''; repaint();
};

/* ---------- acciones de la lista ---------- */
function mxFind(id) { return mxEvs().filter(function (x) { return x.id === id; })[0]; }
function mxLimpio(e) { var o = clone(e); delete o.stats; delete o.actualizado; return o; }
A.mxNew = function () { mxForm(null); };
A.mxTpl = function (el) { var p = MX_PLANTILLAS.filter(function (x) { return x.k === el.dataset.k; })[0]; if (p) { var v = p.f(); v.plantilla = p.k; mxForm(null, v); } };
A.mxEdit = function (el) { var e = mxFind(el.dataset.id); if (e) mxForm(e); };
A.mxDup = function (el) { var e = mxFind(el.dataset.id); if (!e) return; var c = mxLimpio(e); c.id = ''; c.activo = false; mxForm(null, c); };
A.mxTog = async function (el) {
  var e = mxFind(el.dataset.id); if (!e) return;
  var o = mxLimpio(e); o.activo = !e.activo;
  if (o.activo ? !await mxConfirmar(o, '¿Encender este evento?', 'Sí, encender') : !await confirmDlg({ title: '¿Apagar este evento?', text: '«' + (ml(e.nombre) || e.id) + '» deja de mostrarse y de contar. Se puede volver a encender; no se pierde el progreso.', html: cbox([['Cuánto tarda', LLEGA]]), ok: 'Sí, apagar', icon: 'pause' })) return;
  try { await rpc('admin_motor_guardar', { p_evento: o }); toast(o.activo ? 'Evento encendido' : 'Evento apagado'); rload('motor'); } catch (er) { toast(er.message, 'bad'); }
};
A.mxDel = async function (el) {
  var e = mxFind(el.dataset.id); if (!e) return;
  if (!await confirmDlg({ title: '¿Borrar el evento ' + e.id + '?', text: 'Se borra con todo su progreso (también el de la meta entre todos) y la app deja de mostrarlo. Si solo quieres pausarlo, mejor apágalo.', ok: 'Borrar', danger: true })) return;
  try { await rpc('admin_motor_borrar', { p_id: e.id }); toast('Evento borrado'); drawerKill(); rload('motor'); } catch (er) { toast(er.message, 'bad'); }
};
A.mxDet = function (el) {
  var e = mxFind(el.dataset.id); if (!e) return;
  var id = e.id;
  drawer({
    title: 'Detalle: ' + (ml(e.nombre) || id), sub: esc(mxMetaTxt(e.meta)), live: true,
    body: function () {
      var d = MX.det[id];
      if (!d) return skel(4);
      if (d.err) return '<div class="ban bad">' + ic('warn') + '<div class="tx">' + esc(d.err) + '</div></div>';
      var row = function (r) { return '<div class="li"><div class="t"><b>' + esc(r.nombre) + '</b><span class="xs mut">' + esc(r.pais || '') + (r.completado ? ' · completó' : '') + ' · ' + esc(relT(r.actualizado)) + '</span></div><b>' + nf(r.valor) + '</b>' + (r.recortado ? chipN('recortado ' + nf(r.recortado), 'warn') : '') + '</div>'; };
      return mxStats(e) + '<h4 class="mt16">Los que más aportan</h4>' + (d.top.length ? '<div class="list">' + d.top.map(row).join('') + '</div>' : '<p class="sm mut">Nadie todavía.</p>') +
        '<h4 class="mt16">Sospechosos</h4><p class="xs mut">Mandaron más de lo que se puede jugar en el tiempo que pasó: el servidor aceptó solo lo posible y recortó el resto. Si es trampa clara, puedes ocultarlos en Juego › Ranking.</p>' +
        (d.sospechosos.length ? '<div class="list">' + d.sospechosos.map(function (r) { return '<div class="li"><div class="t"><b>' + esc(r.nombre) + '</b></div><b>' + nf(r.valor) + '</b>' + chipN('recortado ' + nf(r.recortado), 'warn') + '</div>'; }).join('') + '</div>' : '<p class="sm mut">Ninguno.</p>');
    }
  });
  MX.det[id] = null;
  rpc('admin_motor_detalle', { p_id: id }).then(function (r) { MX.det[id] = { top: (r && r.top) || [], sospechosos: (r && r.sospechosos) || [] }; }, function (er) { MX.det[id] = { err: er.message }; }).then(function () { drawerRefresh(); });
};
OPENERS.mx = function (id) { var g = function () { var e = mxFind(id); if (e) mxForm(e); }; if (mxRows()) g(); else rload('motor').then(g); };

/* ---------- formulario ---------- */
function mxModsOf(v) { var o = {}; (v.mods || []).forEach(function (m) { o[m.tipo] = m; }); return o; }
function mxModRow(spec, cur) {
  var on = !!cur, id = 'mx_m_' + spec.t, h = '<div class="card pad" style="margin:0 0 8px"><div class="row nw" style="align-items:flex-start"><div class="grow"><b>' + esc(spec.n) + '</b><div class="xs mut">' + esc(spec.d) + '</div></div>' + tog(id, on, '', { dc: 'mxPrevC', on: 'Usar', off: 'No' }) + '</div>';
  var f = '';
  (spec.p || []).forEach(function (p) { var pid = id + '_' + p[0]; f += field(pid, p[1], inp(pid, cur && cur[p[0]] != null ? cur[p[0]] : p[4], { type: 'number', min: p[2], di: 'mxPrev' }), 'De ' + p[2] + ' a ' + p[3] + '.'); });
  if (spec.piezas) f += field(id + '_piezas', 'Qué piezas', sel(id + '_piezas', (cur && cur.piezas) || 'pequenas', [['pequenas', 'Pequeñas (más fácil)'], ['grandes', 'Grandes (más difícil)']], { dc: 'mxPrevC' }));
  if (spec.todo) f += '<div class="f">' + tog(id + '_todo', !!(cur && cur.todo), 'En todas las partidas (también normales y el reto diario)', { dc: 'mxPrevC', on: 'Sí', off: 'Solo en el evento' }) + '<div class="hint">Así sirve aunque el evento no tenga partida propia. Solo da más XP: no cambia piezas, tablero ni puntaje.</div></div>';
  if (spec.pod) MX_POD.forEach(function (p) { var pid = id + '_' + p[0]; f += field(pid, p[1] + ' (+)', inp(pid, cur && cur[p[0]] != null ? cur[p[0]] : 0, { type: 'number', min: 0, di: 'mxPrev' }), '0 a 3 cargas de más.'); });
  if (spec.color) f += field(id + '_color', 'Color', sel(id + '_color', String(cur && cur.color != null ? cur.color : -1), MX_COLORES, { dc: 'mxPrevC' }));
  if (spec.tema) {
    var temas = items('premios').filter(function (p) { return /^theme_/.test(p.cid || ''); }).map(function (p) { return [p.cid, p.nombre]; });
    f += field(id + '_id', 'Tema', sel(id + '_id', (cur && cur.id) || (temas[0] || [''])[0], temas.length ? temas : [['', 'Sin temas en el catálogo']], { dc: 'mxPrevC' }));
  }
  if (f) h += '<div class="grid g2 mt8" style="' + (on ? '' : 'opacity:.55') + '">' + f + '</div>';
  return h + '</div>';
}
function mxForm(e, pre) {
  var isNew = !e, a0 = new Date(Date.now() + 36e5).toISOString();
  var v = Object.assign({ id: '', nombre: {}, descripcion: {}, inicio: a0, fin: mxMas(a0, 7), modo: 'clasico', mods: [], meta: { tipo: 'partidas', objetivo: 5 }, premios: { cosmeticos: [], xp: 0 }, jefe: {}, acento: '', activo: true }, e ? mxLimpio(e) : {}, pre || {});
  var mods = mxModsOf(v), m = v.meta || {}, pr = v.premios || {};
  var known = (pr.cosmeticos || []).filter(function (c) { return pc(c); }), extra = (pr.cosmeticos || []).filter(function (c) { return !pc(c); });
  MX.form = { isNew: isNew, plantilla: v.plantilla || '' };
  formDrawer({
    wide: true, title: isNew ? 'Nuevo evento de juego' : 'Editar evento de juego', sub: isNew ? 'Elige modo, modificadores, meta, premio y fechas.' : esc(v.id) + ' · ' + esc(EST_L[mxEst(v)]),
    body: function () {
      var f = '<div class="fsec"><h4>Nombre</h4>' + field('mx_id', 'Id (no se puede cambiar después)', inp('mx_id', v.id, { ph: 'Ej. blokkumania_1103', max: 40, dis: !isNew, di: 'mxPrev' }), 'Minúsculas, números y _. Solo lo ves tú.') +
        field('mx_nes', 'Nombre', inp('mx_nes', (v.nombre || {}).es, { ph: 'Ej. Semana Blokkumanía', max: 40, di: 'mxPrev' })) + field('mx_des', 'Descripción', area('mx_des', (v.descripcion || {}).es, { rows: 2, ph: 'Ej. Toda la semana, puntos dobles…', di: 'mxPrev' }), 'Hasta 200 caracteres. Sale en la hoja del evento.') +
        '<details class="help" style="margin:0 0 12px"' + ((v.nombre || {}).en ? ' open' : '') + '><summary>' + ic('chr', 'chev') + 'Versión en inglés (los demás idiomas usan esta)</summary><div style="margin-top:10px">' + field('mx_nen', 'Nombre en inglés', inp('mx_nen', (v.nombre || {}).en, { max: 40 })) + field('mx_den', 'Descripción en inglés', area('mx_den', (v.descripcion || {}).en, { rows: 2 })) + '</div></details>' +
        field('mx_acc', 'Color de la tarjeta', sel('mx_acc', v.acento || '', [['', 'Dorado (normal)']].concat(ACENTOS.slice(1)), { dc: 'mxPrevC' })) + '</div>';
      f += '<div class="fsec"><h4>Cuándo</h4><div class="fg">' + field('mx_ini', 'Empieza', inp('mx_ini', toLocalInput(v.inicio), { type: 'datetime-local', di: 'mxPrev' }), 'Hora de México. Desde 45 días antes se anuncia en el menú.') + field('mx_fin', 'Termina', inp('mx_fin', toLocalInput(v.fin), { type: 'datetime-local', di: 'mxPrev' }), 'Hora de México. Máximo 62 días de duración.') + '</div>' + presetBtns('mx_ini,mx_fin', [[3 * 864e5, '3 días'], [7 * 864e5, '1 semana'], [14 * 864e5, '2 semanas']]) + '</div>';
      f += '<div class="fsec"><h4>Partida del evento</h4>' + field('mx_modo', 'Modo', sel('mx_modo', v.modo || '', MX_MODOS, { dc: 'mxPrevC' }), 'Con modo, la tarjeta trae «Jugar el evento» y los modificadores aplican SOLO en esas partidas (que no van al ranking normal). Sin modo, solo cuenta la meta en las partidas normales.') +
        '<div class="hint" style="margin:0 0 8px">Modificadores (máximo 6). Verde «Usar» = entra en el evento.</div>' + MX_MODS.map(function (s) { return mxModRow(s, mods[s.t]); }).join('') + '</div>';
      f += '<div class="fsec"><h4>Meta</h4><div class="fg">' + field('mx_mt', 'Qué hay que hacer', sel('mx_mt', m.tipo || 'partidas', MX_METAS, { dc: 'mxPrevC' })) + field('mx_obj', 'Cantidad', inp('mx_obj', m.objetivo || 1, { type: 'number', min: 1, mode: 'numeric', di: 'mxPrev' }), 'Entre todos se usan números grandes (ej. 200,000 líneas).') + '</div>' +
        '<div class="f">' + tog('mx_com', !!m.comunitaria, 'Meta entre todos (Jefe semanal)', { dc: 'mxPrevC', on: 'Entre todos', off: 'Cada quien' }) + '<div class="hint">Entre todos: se suma lo de todos los jugadores; si llegan a la cantidad antes del fin, todos los que aportaron ganan el premio.</div></div>' +
        '<div class="f">' + tog('mx_solo', !!m.solo_evento, 'Contar solo las partidas del evento', { dc: 'mxPrevC', on: 'Solo evento', off: 'Todas' }) + '</div>' +
        field('mx_tope', 'Tope por jugador (opcional)', inp('mx_tope', m.tope || '', { type: 'number', min: 1, ph: 'Sin tope', di: 'mxPrev' }), 'Lo máximo que cuenta de una sola persona. Útil entre todos para que nadie derrote al jefe solo.') +
        field('mx_jefe', 'Nombre del jefe (entre todos)', inp('mx_jefe', ml((v.jefe || {}).nombre), { ph: 'Ej. Blokkzilla', max: 40, di: 'mxPrev' }), 'Sale arriba en la tarjeta. Vacío = «Jefe semanal».') + '</div>';
      f += '<div class="fsec"><h4>Premio</h4>' + field('mx_pr', 'Cosméticos', picker('mxp', known, { onChange: mxPrevNow }), 'Elige uno o varios.') +
        '<div class="f"><label>Paquetes escondidos (1.0.8)</label><div class="row" style="flex-wrap:wrap;gap:6px">' + MX_OCULTOS.map(function (p) { return '<button class="btn sm" data-a="mxOculto" data-p="' + p[0] + '">' + ic('plus') + esc(p[1]) + '</button>'; }).join('') + '</div><div class="hint">Agrega el paquete completo (tema, piezas, efecto, marco, insignia y título) a «Otros ids».</div></div>' +
        field('mx_extra', 'Otros ids (separados por coma)', inp('mx_extra', extra.join(', '), { ph: 'Ej. theme_espacio, style_espacio', di: 'mxPrev' }), 'Ids que no están en el catálogo del panel. La app guarda también los que aún no conoce.') +
        field('mx_xp', 'XP', inp('mx_xp', pr.xp || 0, { type: 'number', min: 0, di: 'mxPrev' }), 'De 0 a 20,000. Al menos un cosmético o algo de XP.') + '</div>';
      f += '<div class="fsec"><h4>Estado</h4>' + tog('mx_act', v.activo !== false, 'Mostrar este evento a los jugadores') + '<div class="fnote" style="margin-top:8px">Encendido = los jugadores lo ven y cuenta progreso (dentro de las fechas). Apagado = no se muestra aunque esté en fechas.</div></div>';
      return '<div class="edl"><div>' + f + '</div><div class="pvs"><div id="mx_pv"></div><div class="pvcap">Tarjeta del evento en el menú</div><div id="mx_pv2"></div></div></div>';
    },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="mxDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="mxSave">' + ic('check') + (isNew ? 'Crear evento' : 'Guardar') + '</button>'; },
    onMount: function () { mxPrevNow(); }
  });
}
function mxNum(id) { var t = String(drawerVal(id) || '').trim(); return t === '' ? null : Number(t); }
function mxRead() {
  var mods = [];
  MX_MODS.forEach(function (s) {
    var id = 'mx_m_' + s.t; if (!drawerVal(id)) return;
    var o = { tipo: s.t };
    (s.p || []).forEach(function (p) { o[p[0]] = mxNum(id + '_' + p[0]); });
    if (s.piezas) o.piezas = drawerVal(id + '_piezas');
    if (s.todo) o.todo = !!drawerVal(id + '_todo');
    if (s.pod) MX_POD.forEach(function (p) { var n = mxNum(id + '_' + p[0]); if (n) o[p[0]] = n; });
    if (s.color) o.color = Number(drawerVal(id + '_color'));
    if (s.tema) o.id = drawerVal(id + '_id');
    mods.push(o);
  });
  var extra = String(drawerVal('mx_extra') || '').split(/[\s,]+/).map(function (x) { return x.trim(); }).filter(Boolean);
  var cos = pkSel('mxp').concat(extra).filter(function (x, i, a) { return a.indexOf(x) === i; });
  var com = !!drawerVal('mx_com'), jefe = String(drawerVal('mx_jefe') || '').trim();
  var meta = { tipo: drawerVal('mx_mt'), objetivo: Math.floor(Number(drawerVal('mx_obj'))) || 0, comunitaria: com, solo_evento: !!drawerVal('mx_solo') };
  var tope = mxNum('mx_tope'); if (tope) meta.tope = Math.floor(tope);
  return {
    id: String(drawerVal('mx_id') || '').trim(), nombre: { es: String(drawerVal('mx_nes') || '').trim(), en: String(drawerVal('mx_nen') || '').trim() || String(drawerVal('mx_nes') || '').trim() },
    descripcion: { es: String(drawerVal('mx_des') || '').trim(), en: String(drawerVal('mx_den') || '').trim() || String(drawerVal('mx_des') || '').trim() },
    inicio: fromLocalInput(drawerVal('mx_ini')), fin: fromLocalInput(drawerVal('mx_fin')), modo: drawerVal('mx_modo'), mods: mods, meta: meta,
    premios: { cosmeticos: cos, xp: Math.floor(Number(drawerVal('mx_xp'))) || 0 }, jefe: com && jefe ? { nombre: { es: jefe, en: jefe } } : {},
    acento: drawerVal('mx_acc') || '', plantilla: (MX.form && MX.form.plantilla) || '', activo: !!drawerVal('mx_act')
  };
}
function mxPrevNow() {
  var b = $('#mx_pv'), b2 = $('#mx_pv2'); if (!b) return;
  var e = mxRead(); if (!e.inicio || !e.fin) return;
  b.innerHTML = phone(mxCardPrev(e)); if (b2) b2.innerHTML = mxSheetPrev(e);
}
I.mxPrev = debounce(mxPrevNow, 80); C.mxPrevC = function () { mxPrevNow(); };
A.mxOculto = function (el) {
  var p = el.dataset.p, inpEl = document.getElementById('mx_extra'); if (!inpEl) return;
  var cur = inpEl.value.split(/[\s,]+/).filter(Boolean);
  MX_PIEZAS_OCULTAS.forEach(function (k) { var id = k + '_' + p; if (cur.indexOf(id) < 0) cur.push(id); });
  inpEl.value = cur.join(', '); mxPrevNow(); toast('Paquete agregado', 'info');
};

/* ---------- validación (la misma que _motor_validar) ---------- */
function mxErrores(o, isNew) {
  var e = {};
  if (!/^[a-z0-9_]{2,40}$/.test(o.id)) e.mx_id = '2 a 40 caracteres: minúsculas, números o _';
  else if (isNew && mxFind(o.id)) e.mx_id = 'Ya existe un evento con ese id';
  if (!o.nombre.es) e.mx_nes = 'Escribe el nombre';
  if (o.descripcion.es.length > 200) e.mx_des = 'Máximo 200 caracteres';
  if (!o.inicio) e.mx_ini = 'Elige la fecha'; if (!o.fin) e.mx_fin = 'Elige la fecha';
  if (o.inicio && o.fin) {
    var d = new Date(o.fin) - new Date(o.inicio);
    if (d <= 0) e.mx_fin = 'Debe terminar después de empezar'; else if (d > 62 * 864e5) e.mx_fin = 'Máximo 62 días';
  }
  if (o.mods.length > 6) e.mx_modo = 'Máximo 6 modificadores a la vez';
  o.mods.forEach(function (m) {
    var s = MX_MODS.filter(function (x) { return x.t === m.tipo; })[0], id = 'mx_m_' + m.tipo;
    if (!o.modo && !(m.tipo === 'xp_x' && m.todo)) e[id + (s.p && s.p[0] ? '_' + s.p[0][0] : '')] = s.n + ': necesita una partida de evento (elige un modo arriba)';
    (s.p || []).forEach(function (p) { var v = m[p[0]]; if (v == null || isNaN(v) || v < p[2] || v > p[3]) e[id + '_' + p[0]] = 'De ' + p[2] + ' a ' + p[3]; else if (p[0] !== 'x' && v !== Math.floor(v)) e[id + '_' + p[0]] = 'Número entero'; });
    if (m.tipo === 'reloj_seg' && o.modo !== 'reloj') e[id + '_seg'] = 'Solo con el modo Contra reloj';
    if (m.tipo === 'reloj_seg' && m.seg === 0) e[id + '_seg'] = 'Pon segundos distintos de 0';
    if (m.tipo === 'poderes_extra') {
      var any = false;
      MX_POD.forEach(function (p) { var v = m[p[0]]; if (v != null && (v < 0 || v > 3 || v !== Math.floor(v))) e[id + '_' + p[0]] = 'De 0 a 3'; if (v) any = true; });
      if (!any) e[id + '_bomb'] = 'Pon al menos un poder con 1 o más';
      if (o.modo === 'muerte') e[id + '_bomb'] = 'Muerte súbita no lleva poderes';
    }
    if (m.tipo === 'tema' && !/^theme_[a-z0-9_]{1,40}$/.test(m.id || '')) e[id + '_id'] = 'Elige un tema';
  });
  if (!(o.meta.objetivo >= 1)) e.mx_obj = 'Mayor que 0';
  if (o.meta.solo_evento && !o.modo) e.mx_obj = '«Solo partidas del evento» necesita un modo';
  if (o.meta.solo_evento && o.meta.tipo === 'retos') e.mx_obj = 'Los retos diarios no son partidas de evento';
  if (o.premios.xp < 0 || o.premios.xp > 20000) e.mx_xp = 'De 0 a 20,000';
  if (o.premios.cosmeticos.some(function (c) { return !/^[a-z0-9_]{1,60}$/.test(c); })) e.mx_extra = 'Solo minúsculas, números y _';
  if (o.premios.cosmeticos.length > 12) e.mx_extra = 'Máximo 12 premios';
  if (!o.premios.cosmeticos.length && !o.premios.xp) e.mx_xp = 'Elige al menos un premio (cosmético o XP)';
  return e;
}
function mxConfirmar(o, titulo, okTxt) {
  var n = Date.now(), a = new Date(o.inicio).getTime(), b = new Date(o.fin).getTime();
  return confirmDlg({
    title: titulo, text: '«' + (o.nombre.es || o.id) + '»: ' + mxMetaTxt(o.meta) + '.',
    html: cbox([
      ['A quién', 'A todos los jugadores con la app 2.0 o más nueva.'],
      ['Cuándo', esc(fdt(o.inicio)) + ' → ' + esc(fdt(o.fin)) + ' (hora de México). ' + (b <= n ? '<b>Ojo:</b> esas fechas ya pasaron, así que no se verá.' : a > n ? 'Se anuncia en el menú y empieza ' + esc(relT(o.inicio)) + '.' : 'Ya empezó.')],
      ['Partida', o.modo ? esc(mxModo(o)) + (o.mods.length ? ': ' + esc(o.mods.map(mxModTxt).join(' · ')) : '') + '. No va al ranking normal.' : 'Sin partida propia' + (o.mods.length ? ' (' + esc(o.mods.map(mxModTxt).join(' · ')) + ')' : '')],
      ['Premio', esc(o.premios.cosmeticos.map(cname).join(' + ') || '—') + (o.premios.xp ? ' + ' + nf(o.premios.xp) + ' XP' : '')],
      ['Cuánto tarda', LLEGA]
    ]), ok: okTxt, icon: 'rocket'
  });
}
A.mxSave = async function (el) {
  var o = mxRead(), isNew = !!(MX.form && MX.form.isNew);
  if (!showErrs(mxErrores(o, isNew))) return;
  if (o.activo && !await mxConfirmar(o, isNew ? '¿Publicar este evento?' : '¿Guardar los cambios del evento?', isNew ? 'Sí, publicar' : 'Sí, guardar')) return;
  busy(el, true);
  try { await rpc('admin_motor_guardar', { p_evento: o }); toast(isNew ? 'Evento creado' : 'Evento guardado'); drawerKill(); rload('motor'); }
  catch (er) { busy(el, false); toast(er.message, 'bad'); }
};
