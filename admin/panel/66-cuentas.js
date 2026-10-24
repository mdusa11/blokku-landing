/* ================= CUENTAS: respaldo en la nube y código de recuperación (18-nube.sql, app 2.2) ================= */
// Todo por admin_nube(p_clave, p_accion, p_datos):
//   resumen · buscar {q} · ver {id} · unir_previa {origen, destino} · unir {origen, destino} · config {activo, codigo_horas, lim}
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0) para no tocar las listas de los demás.
SQLF.nube = '18-nube.sql';
FNF.admin_nube = 'nube';
RFN.nube = 'admin_nube';
N20['juego/cuentas'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/cuentas'; })) g.items.push(['juego/cuentas', 'Cuentas', 'user']);
  ROUTES['juego/cuentas'] = { t: 'Cuentas', ic: 'user', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/cuentas'] = {
  que: 'El respaldo en la nube del progreso de cada jugador (nivel, premios, racha, récords, logros) y el código de recuperación para cambiar de teléfono. Aquí buscas a un jugador, ves su último respaldo, unes cuentas duplicadas y ves cuántos respaldos, restauraciones y códigos hay.',
  ve: 'En Perfil › «Respaldo de tu progreso»: cuándo fue su último respaldo, un botón para respaldar ya, «Generar código» (BK-RCV-XXXX-XXXX) y un campo para escribir el código en un teléfono nuevo. Si instala de nuevo (sobre todo en iPhone) y la nube tiene más que su teléfono, le sale «Encontramos tu progreso del …: Nivel X, Y premios. ¿Restaurar?».',
  cuando: 'Cuando un jugador escriba que perdió su progreso, que cambió de teléfono o que tiene dos cuentas en el ranking: búscalo, revisa su respaldo y, si hay una cuenta duplicada, únela a la buena.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.2 o más nueva. Las anteriores no respaldan nada.',
    '<b>Cuándo se respalda:</b> al volver de una partida, al salir de la app y cada 10 minutos con la app abierta, solo si algo cambió y como mucho cada 3 minutos. Va ligado a la cuenta del ranking (id + token), sin ningún identificador del teléfono. Tope: 32 KB.',
    '<b>Nada baja:</b> el servidor fusiona lo que llega con lo guardado (une premios y logros, se queda con el máximo de XP, récords y estadísticas). Restaurar en el teléfono también fusiona: nunca borra progreso que el teléfono ya tenga.',
    '<b>Trampas:</b> el servidor no se fía del teléfono. XP, premios, logros, racha y estadísticas tienen un <b>tope acumulado</b> desde que se creó la cuenta (base + tanto por día); los récords no pasan del tope del ranking ni del mejor puntaje que el jugador ya tiene ahí; las insignias del staff solo entran si el jugador está autorizado. Lo que se pasa se recorta (el teléfono lo vuelve a mandar y entra cuando el tope crece). Los topes se cambian abajo, en «Reglas».',
    '<b>Monedas:</b> el saldo NO va en este respaldo; vive en el servidor, en su propia tabla (Tienda).',
    '<b>Código de recuperación:</b> sirve una vez y caduca en 24 horas (ajustable). Generar otro anula el anterior. Al usarlo, el teléfono nuevo recibe la MISMA cuenta con un token nuevo (el teléfono viejo ya no puede usarla) y el respaldo. Si el teléfono nuevo ya tenía su propia cuenta, sus puntajes se unen a la recuperada y esa cuenta queda oculta. Contra fuerza bruta: 10 intentos por conexión por hora.',
    '<b>Unir cuentas:</b> eliges la cuenta <b>vieja</b> (la duplicada, se oculta) y la <b>buena</b> (la que se queda). Pasan a la buena: el mejor puntaje de cada modo y periodo, los retos creados y jugados, los aportes a eventos, Muerte súbita, insignias del staff y avisos dirigidos. El respaldo que se queda es el de la buena (si no tiene, pasa el de la vieja). Antes de unir ves cómo queda; unir no se puede deshacer.',
    '<b>Borrar mis datos:</b> si el jugador borra sus datos en la app, se borran también su respaldo y sus códigos.',
    H_HORA
  ]
};

var CU = { q: '', res: null, buscando: false, origen: null, destino: null, previa: null, previando: false, uniendo: false, ver: {}, cfg: {}, cfgOn: null, saving: false };
var CU_LIM = [['xp', 'XP'], ['cos', 'Premios (cosméticos)'], ['logros', 'Logros'], ['racha', 'Racha (días)'], ['stat:*', 'Cada estadística'], ['stat:gamesPlayed', 'Partidas jugadas'], ['stat:linesCleared', 'Líneas'], ['stat:stat_piecesPlaced', 'Piezas colocadas']];
var CU_ST = [['respaldos', 'Respaldos guardados'], ['respaldos_nuevos', 'Jugadores con su primer respaldo'], ['restauraciones', 'Restauraciones aceptadas'], ['cargas', 'Consultas del respaldo'], ['recortes', 'Respaldos recortados'], ['codigos_creados', 'Códigos creados'], ['codigos_usados', 'Códigos usados'], ['codigos_fallidos', 'Códigos mal escritos o caducados'], ['uniones', 'Cuentas unidas']];

function cuRows() { var o = rm('nube'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function cuSt(s, k) { return (s && s[k]) || { total: 0, d7: 0, hoy: 0 }; }
function cuBytes(n) { n = Number(n) || 0; return n < 1024 ? nf(n) + ' B' : (Math.round(n / 102.4) / 10).toLocaleString('es-MX') + ' KB'; }
function cuRes(r) {
  if (!r) return '<span class="mut">Sin respaldo</span>';
  var s = r.resumen || {};
  return 'Nivel <b>' + nf(s.nivel) + '</b> · ' + nf(s.xp) + ' XP · ' + nf(s.cos) + ' premios · ' + nf(s.logros) + ' logros · racha ' + nf(s.racha) + ' (mejor ' + nf(s.racha_max) + ')';
}
function cuMej(m) {
  m = m || {};
  return ['clasico', 'reloj', 'diario'].map(function (k) { return m[k] != null ? nf(m[k]) : '—'; });
}
I.cuIn = function (el) { CU.q = el.value; };
I.cuCfg = function (el) { CU.cfg[el.id] = el.value; };
C.cuTog = function (el) { CU.cfgOn = el.checked; };

function cuKpis(r) {
  var s = r.stats || {}, sv = cuSt(s, 'respaldos'), rs = cuSt(s, 'restauraciones'), cc = cuSt(s, 'codigos_creados'), cus = cuSt(s, 'codigos_usados'), un = cuSt(s, 'uniones'), fa = cuSt(s, 'codigos_fallidos');
  return '<div class="kpis k6">' +
    kpi('cloud', 'Jugadores con respaldo', nf(r.respaldos), nf(r.respaldos_7d) + ' respaldaron en 7 días') +
    kpi('refresh', 'Respaldos guardados', nf(sv.total), nf(sv.d7) + ' en 7 días · ' + nf(sv.hoy) + ' hoy') +
    kpi('down', 'Restauraciones', nf(rs.total), nf(rs.d7) + ' en 7 días') +
    kpi('key', 'Códigos', nf(cus.total) + ' / ' + nf(cc.total), 'usados / creados · ' + nf(r.codigos_vivos) + ' vigentes · ' + nf(fa.total) + ' fallidos') +
    kpi('dup', 'Cuentas unidas', nf(un.total), nf(un.d7) + ' en 7 días') +
    kpi('db', 'Tamaño', cuBytes(r.bytes_prom), 'promedio · máximo ' + cuBytes(r.bytes_max) + ' de 32 KB · ' + nf(r.con_recortes) + ' con recortes') + '</div>';
}

function cuBuscar() {
  var h = '<div class="card sec"><div class="ch">' + ic('search') + '<h3>Buscar jugador</h3><span class="sub grow">Por nombre (2 letras o más) o por id</span></div><div class="cb">' +
    '<div class="row nw"><div class="grow">' + inp('cu_q', CU.q, { ph: 'Nombre o id del jugador', di: 'cuIn' }) + '</div><button class="btn pri" data-a="cuBuscar"' + (CU.buscando ? ' disabled' : '') + '>' + (CU.buscando ? '<span class="spin"></span>' : ic('search')) + 'Buscar</button></div>';
  var res = CU.res;
  if (res && !res.length) h += '<p class="mut mt12">Nadie con ese nombre o id.</p>';
  if (res && res.length) {
    h += '<div class="tw mt12"><table class="tbl"><thead><tr><th>Jugador</th><th>Respaldo</th><th>Último respaldo</th><th class="num">Clásico</th><th></th></tr></thead><tbody>';
    res.forEach(function (j) {
      var r = j.respaldo, id = esc(j.id), sel = CU.origen && CU.origen.id === j.id ? ' (vieja)' : CU.destino && CU.destino.id === j.id ? ' (buena)' : '';
      h += '<tr><td><b>' + esc(j.nombre) + '</b>' + (j.oculto ? ' ' + chip('oculto', 'line', 'eyeoff') : '') + esc(sel) + '<div class="xs mut mono">' + id.slice(0, 8) + '… · ' + esc(j.pais || '—') + ' · alta ' + esc(fdt(j.creado, true)) + ' · visto ' + esc(relT(j.visto)) + '</div></td>' +
        '<td class="xs">' + cuRes(r) + '</td><td>' + (r ? esc(fdt(r.actualizado)) + '<div class="xs mut">' + cuBytes(r.bytes) + (r.app ? ' · app ' + esc(r.app) : '') + '</div>' : '<span class="mut">—</span>') + '</td>' +
        '<td class="num">' + cuMej(j.mejores)[0] + '</td>' +
        '<td><div class="row nw"><button class="btn sm" data-a="cuVer" data-id="' + id + '">' + ic('eye') + 'Ver</button>' +
        '<button class="btn sm" data-a="cuElegir" data-id="' + id + '" data-v="origen" title="La cuenta duplicada: se oculta">Vieja</button>' +
        '<button class="btn sm" data-a="cuElegir" data-id="' + id + '" data-v="destino" title="La cuenta que se queda">Buena</button></div></td></tr>';
    });
    h += '</tbody></table></div>';
  }
  return h + '</div></div>';
}

function cuFila(label, a, b, c) { return '<tr><td>' + esc(label) + '</td><td class="num">' + a + '</td><td class="num">' + b + '</td><td class="num"><b>' + c + '</b></td></tr>'; }
function cuPrevia(p) {
  var o = p.antes.origen || {}, d = p.antes.destino || {}, x = (p.despues && p.despues.destino) || {}, mo = cuMej(o.mejores), md = cuMej(d.mejores), mx = cuMej(x.mejores);
  var rn = function (f) { return f.respaldo ? 'Nivel ' + nf((f.respaldo.resumen || {}).nivel) + ' · ' + nf((f.respaldo.resumen || {}).cos) + ' premios' : '—'; };
  var h = '<div class="tw mt12"><table class="tbl"><thead><tr><th></th><th class="num">Vieja (antes)</th><th class="num">Buena (antes)</th><th class="num">Buena (después)</th></tr></thead><tbody>' +
    cuFila('Nombre', esc(o.nombre), esc(d.nombre), esc(x.nombre)) +
    cuFila('Mejor Clásico', mo[0], md[0], mx[0]) + cuFila('Mejor Contra reloj', mo[1], md[1], mx[1]) + cuFila('Mejor Reto diario', mo[2], md[2], mx[2]) +
    cuFila('Puntajes guardados (filas)', nf(o.puntajes), nf(d.puntajes), nf(x.puntajes)) +
    cuFila('Muerte súbita', nf(o.muerte), nf(d.muerte), nf(x.muerte)) +
    cuFila('Retos creados', nf(o.retos_creados), nf(d.retos_creados), nf(x.retos_creados)) +
    cuFila('Retos jugados', nf(o.retos_jugados), nf(d.retos_jugados), nf(x.retos_jugados)) +
    cuFila('Eventos con aportes', nf(o.eventos), nf(d.eventos), nf(x.eventos)) +
    cuFila('Respaldo', rn(o), rn(d), rn(x)) +
    '</tbody></table></div><p class="xs mut mt12">Después de unir, la vieja queda <b>oculta</b> (no sale en el ranking) y sin puntajes.</p>';
  var otras = p.otras || {}, ks = Object.keys(otras);
  if (ks.length) h += '<div class="ban warn mt12">' + ic('warn') + '<div class="tx"><b>Hay datos que esta unión no sabe mover</b>' + ks.map(function (k) { return esc(k) + ': ' + nf(otras[k]) + ' filas'; }).join(' · ') + '. Se quedan en la cuenta vieja (salvo que su sección los mueva con <span class="path">_nube_unir_extra</span>).</div></div>';
  return h;
}

function cuUnir() {
  var o = CU.origen, d = CU.destino;
  var slot = function (x, rol, txt) { return '<div class="grow"><div class="xs mut">' + esc(rol) + '</div>' + (x ? '<b>' + esc(x.nombre) + '</b> <span class="xs mut mono">' + esc(String(x.id).slice(0, 8)) + '…</span>' : '<span class="mut">' + esc(txt) + '</span>') + '</div>'; };
  var h = '<div class="card sec"><div class="ch">' + ic('dup') + '<h3>Unir cuentas</h3><span class="sub grow">Para un jugador con dos cuentas en el ranking</span></div><div class="cb">' +
    '<div class="row" style="align-items:flex-start">' + slot(o, 'Cuenta vieja (duplicada, se oculta)', 'Elige «Vieja» en la búsqueda') + '<div style="padding:14px 8px">' + ic('chr') + '</div>' + slot(d, 'Cuenta buena (se queda con todo)', 'Elige «Buena» en la búsqueda') + '</div>' +
    '<div class="row mt16"><button class="btn" data-a="cuPrevia"' + (!o || !d || CU.previando ? ' disabled' : '') + '>' + (CU.previando ? '<span class="spin"></span>' : ic('eye')) + 'Ver cómo queda</button>' +
    '<button class="btn dng solid" data-a="cuUnirOk"' + (!CU.previa || CU.uniendo ? ' disabled' : '') + '>' + (CU.uniendo ? '<span class="spin"></span>' : ic('dup')) + 'Unir</button>' +
    (o || d ? '<button class="btn ghost" data-a="cuLimpiar">Limpiar</button>' : '') + '<span class="xs mut">Primero «Ver cómo queda»: no cambia nada. Unir no se puede deshacer.</span></div>';
  if (CU.previa) h += cuPrevia(CU.previa);
  return h + '</div></div>';
}

function cuRecientes(r) {
  var list = Array.isArray(r.recientes) ? r.recientes : [], un = Array.isArray(r.uniones) ? r.uniones : [];
  var h = '<div class="card sec"><div class="ch">' + ic('history') + '<h3>Respaldos recientes</h3><span class="sub grow">Los últimos ' + nf(list.length) + '</span></div>';
  if (!list.length) h += '<div class="cb"><p class="mut">Todavía no hay respaldos. Aparecerán cuando los jugadores tengan la app 2.2.</p></div>';
  else {
    h += '<div class="tw"><table class="tbl"><thead><tr><th>Jugador</th><th>Resumen</th><th>Cuándo</th><th class="num">Tamaño</th><th></th></tr></thead><tbody>';
    list.forEach(function (x) {
      h += '<tr><td><b>' + esc(x.nombre) + '</b><div class="xs mut">' + esc(x.pais || '—') + (x.app ? ' · app ' + esc(x.app) : '') + (x.recortes ? ' · ' + nf(x.recortes) + ' recortes' : '') + '</div></td><td class="xs">' + cuRes(x) + '</td><td>' + esc(fdt(x.actualizado)) + '</td><td class="num">' + cuBytes(x.bytes) + '</td><td><button class="btn sm" data-a="cuVer" data-id="' + esc(x.id) + '">' + ic('eye') + 'Ver</button></td></tr>';
    });
    h += '</tbody></table></div>';
  }
  h += '</div>';
  if (un.length) {
    h += '<div class="card sec"><div class="ch">' + ic('dup') + '<h3>Uniones recientes</h3></div><div class="tw"><table class="tbl"><thead><tr><th>Vieja</th><th>Buena</th><th>Cómo</th><th>Cuándo</th><th>Movido</th></tr></thead><tbody>';
    un.forEach(function (u) {
      var m = u.movido || {};
      h += '<tr><td>' + esc(u.origen_nombre || String(u.origen).slice(0, 8)) + '</td><td>' + esc(u.destino_nombre || String(u.destino).slice(0, 8)) + '</td><td>' + (u.por === 'codigo' ? chip('código', 'line', 'key') : chip('panel', 'line', 'user')) + '</td><td>' + esc(fdt(u.creado)) + '</td><td class="xs">' + nf(m.puntajes) + ' puntajes · ' + nf(m.retos) + ' retos · ' + nf(m.intentos) + ' intentos · ' + nf(m.eventos) + ' eventos</td></tr>';
    });
    h += '</tbody></table></div></div>';
  }
  return h;
}

function cuCfgVal(id, srv) { return id in CU.cfg ? CU.cfg[id] : (srv == null ? '' : String(srv)); }
function cuAjustes(r) {
  var c = r.config || {}, on = CU.cfgOn != null ? CU.cfgOn : c.activo !== false;
  var h = '<div class="card sec"><div class="ch">' + ic('sliders') + '<h3>Reglas</h3><span class="sub grow">' + (c.activo === false ? 'Apagado: no se respalda ni se restaura' : 'Encendido') + '</span></div><div class="cb">' +
    '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>Respaldo en la nube</b><div class="xs mut">Apagado = la app no sube ni baja respaldos y los códigos no funcionan. No borra nada. Solo para una emergencia.</div></div>' + tog('cu_activo', on, 'Respaldo', { dc: 'cuTog' }) + '</div>' +
    '<div class="grid g2 mt16">' + field('cu_horas', 'Horas que dura un código', inp('cu_horas', cuCfgVal('cu_horas', c.codigo_horas), { type: 'number', mode: 'numeric', min: 1, di: 'cuCfg' }), 'Entero de 1 a 168. Solo cuenta para códigos nuevos.') + '</div>' +
    '<p class="xs mut mt16"><b>Topes acumulados</b> desde que se creó la cuenta: <b>base + por día × días</b>, sin pasar del tope. Lo que manda el teléfono por encima se recorta.</p>' +
    '<div class="tw"><table class="tbl"><thead><tr><th>Qué</th><th class="num">Base</th><th class="num">Por día</th><th class="num">Tope</th></tr></thead><tbody>';
  CU_LIM.forEach(function (l, i) {
    var v = c['lim:' + l[0]] || {}, b = 'cu_l' + i;
    h += '<tr><td>' + esc(l[1]) + '<div class="xs mut mono">' + esc(l[0]) + '</div></td>' +
      ['base', 'por_dia', 'tope'].map(function (k) { return '<td class="num">' + inp(b + '_' + k, cuCfgVal(b + '_' + k, v[k]), { type: 'number', mode: 'numeric', min: 0, di: 'cuCfg' }) + '</td>'; }).join('') + '</tr>';
  });
  h += '</tbody></table></div><div class="row mt16"><button class="btn pri" data-a="cuSave"' + (CU.saving ? ' disabled' : '') + '>' + (CU.saving ? '<span class="spin"></span>' : ic('check')) + 'Guardar reglas</button><span class="xs mut">Aplica al siguiente respaldo de cada jugador.</span></div></div></div>';
  return h;
}

function vCuentas() {
  var o = rm('nube');
  var h = pageHead('Cuentas', 'El <b>respaldo en la nube</b> del progreso de cada jugador y el <b>código de recuperación</b> para cambiar de teléfono. Busca a un jugador, mira su respaldo y une cuentas duplicadas.', '<button class="btn" data-a="cuReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.nube, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 17-motor-eventos.sql; solo crea tablas y funciones nuevas.') + '</div>' : rerr(o, 'las cuentas'));
  var r = cuRows();
  if (!r) return h + skel(4);
  return h + cuKpis(r) + cuBuscar() + cuUnir() + cuRecientes(r) + cuAjustes(r);
}
VIEWS['juego/cuentas'] = vCuentas;

function cuNube(accion, datos) { return rpc('admin_nube', { p_accion: accion, p_datos: datos || {} }); }
function cuFind(id) { return (CU.res || []).filter(function (j) { return j.id === id; })[0] || ((cuRows() || {}).recientes || []).filter(function (j) { return j.id === id; })[0]; }

A.cuReload = function () { CU.cfg = {}; CU.cfgOn = null; rload('nube'); toast('Recargando…', 'info'); };
A.cuBuscar = async function () {
  var q = String(CU.q || '').trim();
  if (q.length < 2) { toast('Escribe al menos 2 letras o el id', 'warn'); return; }
  CU.buscando = true; paintPage();
  try { CU.res = await cuNube('buscar', { q: q }) || []; } catch (e) { toast('No se pudo buscar: ' + e.message, 'bad'); }
  CU.buscando = false; paintPage();
};
A.cuElegir = function (el) {
  var j = cuFind(el.dataset.id); if (!j) return;
  var otro = el.dataset.v === 'origen' ? 'destino' : 'origen';
  if (CU[otro] && CU[otro].id === j.id) CU[otro] = null;
  CU[el.dataset.v] = { id: j.id, nombre: j.nombre };
  CU.previa = null; paintPage();
};
A.cuLimpiar = function () { CU.origen = CU.destino = CU.previa = null; paintPage(); };
A.cuPrevia = async function () {
  if (!CU.origen || !CU.destino) return;
  CU.previando = true; paintPage();
  try { CU.previa = await cuNube('unir_previa', { origen: CU.origen.id, destino: CU.destino.id }); } catch (e) { toast('No se pudo calcular: ' + e.message, 'bad'); }
  CU.previando = false; paintPage();
};
A.cuUnirOk = async function () {
  var p = CU.previa; if (!p || CU.uniendo) return;
  var o = p.antes.origen, d = p.antes.destino;
  var ok = await confirmDlg({ title: '¿Unir estas dos cuentas?', text: 'No se puede deshacer.', html: cbox([['Vieja (se oculta)', '<b>' + esc(o.nombre) + '</b>'], ['Buena (se queda con todo)', '<b>' + esc(d.nombre) + '</b>'], ['Qué pasa', 'Los mejores puntajes, retos, aportes a eventos e insignias pasan a la buena. La vieja deja de salir en el ranking.']]), ok: 'Sí, unir', danger: true, icon: 'dup' });
  if (!ok) return;
  CU.uniendo = true; paintPage();
  try {
    var r = await cuNube('unir', { origen: o.id, destino: d.id });
    CU.previa = null; CU.origen = null; CU.destino = null; CU.res = null;
    toast('Cuentas unidas: ' + nf((r.movido || {}).puntajes) + ' puntajes pasaron a ' + d.nombre);
    rload('nube', true);
  } catch (e) { toast('No se pudo unir: ' + e.message, 'bad'); }
  CU.uniendo = false; paintPage();
};

function cuVerBody(id) {
  var o = CU.ver[id];
  if (!o || o.loading) return '<div class="sk skl"></div><div class="sk skl"></div>';
  if (o.err) return '<p class="mut">No se pudo cargar: ' + esc(o.err.message) + '</p>';
  var f = o.d || {}, d = f.datos || null, dash = '<span class="mut">—</span>';
  var h = '<div class="list"><div class="li"><div class="t"><b>Alta</b><span>' + esc(fdt(f.creado)) + ' · visto ' + esc(relT(f.visto)) + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Respaldo</b><span>' + (f.respaldo ? esc(fdt(f.respaldo.actualizado)) + ' · ' + cuBytes(f.respaldo.bytes) + ' · ' + nf(f.guardados) + ' guardados' + (f.recortes ? ' · ' + nf(f.recortes) + ' con recortes' : '') : 'Sin respaldo') + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Crédito de topes desde</b><span>' + (f.desde ? esc(fdt(f.desde)) : dash) + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Código de recuperación</b><span>' + (f.codigo_vivo ? 'Tiene uno vigente' : 'Ninguno vigente') + '</span></div></div></div>';
  if (!d) return h;
  var s = d.stats || {}, rec = d.rec || {}, ra = d.racha || {}, eq = d.eq || {}, cos = d.cos || [], lg = d.logros || [];
  h += '<div class="dsec"><h4>Progreso</h4><div class="list">' +
    '<div class="li"><div class="t"><b>Nivel ' + nf((f.respaldo.resumen || {}).nivel) + '</b><span>' + nf(d.xp) + ' XP</span></div></div>' +
    '<div class="li"><div class="t"><b>Racha</b><span>' + nf(ra.n) + ' días (último ' + esc(ra.dia || '—') + ') · mejor ' + nf(ra.max) + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Récords</b><span>Clásico ' + (rec.clasico != null ? nf(rec.clasico) : '—') + ' · Contra reloj ' + (rec.reloj != null ? nf(rec.reloj) : '—') + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Equipado</b><span>' + (Object.keys(eq).length ? Object.keys(eq).map(function (k) { return esc(k) + ': ' + esc(eq[k] || '—'); }).join(' · ') : dash) + '</span></div></div></div></div>';
  h += '<div class="dsec"><h4>Premios (' + nf(cos.length) + ')</h4><div class="row">' + cos.slice(0, 80).map(function (c) { return chipN(c, 'line'); }).join('') + (cos.length > 80 ? '<span class="xs mut">y ' + nf(cos.length - 80) + ' más</span>' : '') + '</div></div>';
  h += '<div class="dsec"><h4>Logros (' + nf(lg.length) + ')</h4><div class="row">' + lg.slice(0, 60).map(function (c) { return chipN(c, 'line'); }).join('') + (lg.length > 60 ? '<span class="xs mut">y ' + nf(lg.length - 60) + ' más</span>' : '') + '</div></div>';
  var sk = Object.keys(s).sort();
  if (sk.length) h += '<div class="dsec"><h4>Estadísticas</h4><table class="tbl"><tbody>' + sk.map(function (k) { return '<tr><td class="mono xs">' + esc(k) + '</td><td class="num">' + nf(s[k]) + '</td></tr>'; }).join('') + '</tbody></table></div>';
  var xk = Object.keys(d.x || {});
  if (xk.length) h += '<div class="dsec"><h4>Secciones extra</h4><p class="xs mono">' + xk.map(esc).join(' · ') + '</p></div>';
  var ot = Object.keys(f.otras || {});
  if (ot.length) h += '<div class="dsec"><h4>Otras tablas con datos</h4><p class="xs">' + ot.map(function (k) { return esc(k) + ': ' + nf(f.otras[k]); }).join(' · ') + '</p></div>';
  return h;
}
A.cuVer = function (el) {
  var id = el.dataset.id, o = CU.ver[id] = { loading: true };
  cuNube('ver', { id: id }).then(function (r) { o.d = r; }, function (e) { o.err = e; }).then(function () { o.loading = false; drawerRefresh(); });
  var j = cuFind(id) || {};
  drawer({ title: esc(j.nombre || 'Jugador'), sub: '<span class="mono xs">' + esc(id) + '</span>', wide: true, body: function () { return cuVerBody(id); } });
};

A.cuSave = async function () {
  var r = cuRows(); if (!r || CU.saving) return;
  var c = r.config || {}, d = {}, dl = [], errs = {};
  var on = CU.cfgOn != null ? CU.cfgOn : c.activo !== false;
  if (on !== (c.activo !== false)) { d.activo = on; dl.push(['Respaldo', (c.activo !== false ? 'Encendido' : 'Apagado') + ' → <b>' + (on ? 'Encendido' : 'Apagado') + '</b>']); }
  var hs = String(cuCfgVal('cu_horas', c.codigo_horas)).trim();
  if (!/^\d+$/.test(hs) || +hs < 1 || +hs > 168) errs.cu_horas = 'Un entero de 1 a 168.';
  else if (+hs !== Number(c.codigo_horas)) { d.codigo_horas = +hs; dl.push(['Horas del código', nf(c.codigo_horas) + ' → <b>' + nf(+hs) + '</b>']); }
  var lim = {};
  CU_LIM.forEach(function (l, i) {
    var v = c['lim:' + l[0]] || {}, b = 'cu_l' + i, nv = {}, changed = false, bad = false;
    ['base', 'por_dia', 'tope'].forEach(function (k) {
      var t = String(cuCfgVal(b + '_' + k, v[k])).trim();
      if (!/^\d{1,15}$/.test(t)) { errs[b + '_' + k] = 'Entero ≥ 0'; bad = true; return; }
      nv[k] = +t; if (+t !== Number(v[k])) changed = true;
    });
    if (!bad && changed) { lim[l[0]] = nv; dl.push([l[1], nf(v.base) + ' + ' + nf(v.por_dia) + '/día (tope ' + nf(v.tope) + ') → <b>' + nf(nv.base) + ' + ' + nf(nv.por_dia) + '/día (tope ' + nf(nv.tope) + ')</b>']); }
  });
  if (!showErrs(errs)) return;
  if (Object.keys(lim).length) d.lim = lim;
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var ok = await confirmDlg({ title: d.activo === false ? '¿Apagar el respaldo en la nube?' : '¿Guardar las reglas del respaldo?', text: 'Afecta a todos los jugadores con la app 2.2 o más nueva.', html: cbox(dl), ok: d.activo === false ? 'Apagar' : 'Sí, guardar', danger: d.activo === false, icon: 'sliders' });
  if (!ok) return;
  CU.saving = true; paintPage();
  try { await cuNube('config', d); CU.cfg = {}; CU.cfgOn = null; toast('Reglas guardadas'); await rload('nube', true); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  CU.saving = false; paintPage();
};
