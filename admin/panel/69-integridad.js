/* ================= INTEGRIDAD DE LA APP (49-integridad.sql) ================= */
// admin_integridad(p_clave, p_accion, p_datos): 'resumen' {dias, dudosos}, 'config' {clave: n, …} (devuelve el resumen),
// 'jugador' {id} → {jugador, nombre, historial[]}, 'olvidar' {id} → {ok}.
SQLF.integridad = '49-integridad.sql';
FNF.admin_integridad = 'integridad';
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/integridad'; })) {
    var at = g.items.map(function (i) { return i[0]; }).indexOf('juego/servidor');
    g.items.splice(at < 0 ? g.items.length : at + 1, 0, ['juego/integridad', 'Integridad de la app', 'lock']);
  }
  ROUTES['juego/integridad'] = { t: 'Integridad de la app', ic: 'lock', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/integridad'] = {
  que: 'Revisa si las peticiones importantes (gastar gemas, cobrar el pase o la tienda, subir puntajes, canjear códigos) vienen de la app original de Google Play o del App Store, y no de una copia alterada, un emulador o un script.',
  ve: 'El jugador no nota nada si usa la app original. En «exigir», quien use una copia alterada ve que su petición se rechaza.',
  cuando: 'Déjalo en «avisar» unos días y mira cuántas peticiones salen «sin veredicto» o sospechosas. Cuando «sin veredicto» sea casi 0 en una acción, pásala a «exigir». Si un jugador legítimo sale como malo, ábrelo y usa «Olvidar veredicto».',
  como: [
    '<b>Veredictos:</b> Verificado = la app original. Dudoso = Google/Apple no están seguros. Malo = copia alterada, otra app o token falso. Caído = el servicio de verificación no contestó. Sin servicio = el teléfono no tiene el servicio. Sin veredicto = la petición llegó de una versión sin integridad.',
    '<b>Avisar / exigir:</b> en «avisar» solo se anota. En «exigir» se rechaza lo que no traiga un veredicto bueno. «Encendida» es el interruptor general: apagada, todo pasa.',
    '<b>Cuota de Google:</b> Android consulta a Google con un tope diario; al agotarse, los veredictos salen «Cuota de Google agotada».',
    'Necesita <span class="mono">49-integridad.sql</span> en Supabase.',
    H_HORA
  ]
};

var IN = { d: null, err: null, loading: false, dias: 7, dud: false, ed: {}, saving: '', aj: false, ver: {}, seq: 0 };
var IN_ACC = [['gemas', 'Gastar gemas'], ['pase', 'Cobrar el pase'], ['tienda', 'Cobrar Bloques (tienda)'], ['ranking', 'Puntajes del ranking'], ['codigos', 'Canjear códigos']];
var IN_AJ = [
  ['vigencia_min', 'Vigencia del veredicto (min)'], ['gracia_min', 'Gracia sin veredicto (min)'], ['gracias_dia', 'Gracias por día'],
  ['dudoso_pasa', 'Dudoso pasa (0/1)'], ['sin_servicio_pasa', 'Sin servicio pasa (0/1)'], ['tope_android_dia', 'Tope diario de Google (Android)'], ['proyecto_gcp', 'Número de proyecto de Google Cloud']
];
var IN_EST = { ok: ['Verificado', 'ok'], dudoso: ['Dudoso', 'warn'], malo: ['Malo', 'bad'], caido: ['Caído', 'line'], sin_servicio: ['Sin servicio', 'line'], sin: ['Sin veredicto', 'line'] };
var IN_MOT = {
  app_no_reconocida: 'App alterada o no es la de Play', paquete: 'Otro paquete', hash: 'Token de otra petición', viejo: 'Token viejo (repetido)', token_invalido: 'Token falso o roto',
  dispositivo: 'Teléfono sin integridad (root/emulador)', sin_licencia: 'Instalada fuera de Play', sin_evaluar: 'Google no evaluó la app', cadena: 'Certificado de Apple inválido', firma: 'Firma de Apple inválida',
  contador: 'Afirmación repetida', llave_repetida: 'Llave de App Attest repetida', app_id: 'Otra app de iOS', sin_proyecto: 'Falta el número de proyecto de Google Cloud', tope: 'Cuota de Google agotada',
  no_disponible: 'El teléfono no tiene el servicio', temporal: 'Falla del teléfono (sin red)'
};

function inN(v) { return Number(v) || 0; }
function inMot(m) {
  var t = IN_MOT[m] || (/^google_/.test(m || '') ? 'Google no contestó' : m);
  return m ? '<span title="' + esc(m) + '">' + esc(t) + '</span>' : '<span class="mut">—</span>';
}
function inChip(e) { var x = IN_EST[e] || [e || '—', 'line']; return '<span class="chip ' + x[1] + '" title="' + esc(e) + '">' + esc(x[0]) + '</span>'; }
function inCfg() { var m = {}; ((IN.d && IN.d.config) || []).forEach(function (c) { m[c.clave] = c; }); return m; }
function inFecha(v) { return v ? '<span title="' + esc(fdt(v)) + '">' + esc(relT(v)) + '</span>' : '<span class="mut">—</span>'; }
function inSinSql(e) { return e && (e.code === 'sin_sql' || /Could not find the function|PGRST202/i.test(e.message || '')); }

function inCall(accion, datos) { return rpc('admin_integridad', { p_accion: accion, p_datos: datos || {} }, { nomiss: true }); }
function inLoad() {
  var n = ++IN.seq; IN.loading = true;
  var datos = { dias: IN.dias }; if (IN.dud) datos.dudosos = true;
  inCall('resumen', datos).then(function (r) { if (n !== IN.seq) return; IN.d = r || {}; IN.err = null; }, function (e) { if (n !== IN.seq) return; IN.err = e; })
    .then(function () { if (n !== IN.seq) return; IN.loading = false; repaint(); });
}

function inKpis(d) {
  var a = d.acciones || [], t = 0, ok = 0, sos = 0, blq = 0;
  a.forEach(function (x) { t += inN(x.total); ok += inN(x.ok); sos += inN(x.malo) + inN(x.dudoso); blq += inN(x.bloqueadas); });
  var cuota = d.android_hoy != null && d.tope_android_dia != null ? nf(d.android_hoy) + ' / ' + nf(d.tope_android_dia) : '—';
  return '<div class="kpis">' +
    kpi('check', '% verificadas', pct(ok, t), nf(ok) + ' de ' + nf(t) + ' peticiones') +
    kpi('warn', 'Sospechosas', nf(sos), 'Malas + dudosas en ' + inN(d.dias || IN.dias) + ' d') +
    kpi('lock', 'Bloqueadas', nf(blq), 'Rechazadas por estar en «exigir»') +
    kpi('android', 'Cuota de Google hoy', cuota, 'Consultas a Google de hoy / tope diario') + '</div>';
}
function inEstado(d) {
  var on = inN((inCfg().activa || {}).valor) === 1;
  return '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Estado general</h3></div><div class="cb">' +
    tog('in_activa', on, 'Verificación', { dc: 'inActiva', on: 'Encendida', off: 'Apagada' }) +
    (on ? '' : '<div class="ban warn mt12">' + ic('warn') + '<div class="tx">Apagada: la app no pide veredictos y todo pasa.</div></div>') +
    '</div></div>';
}
function inTabla(d) {
  var cfg = inCfg(), by = {};
  (d.acciones || []).forEach(function (x) { by[x.accion] = x; });
  return '<div class="card sec"><div class="ch">' + ic('list') + '<h3>Por acción</h3><span class="sub grow">Últimos ' + inN(d.dias || IN.dias) + ' días</span></div><div class="cb"><div class="tw"><table class="tbl"><thead><tr>' +
    '<th>Acción</th><th class="num">Total</th><th class="num">% ok</th><th class="num">Dudosas</th><th class="num">Malas</th><th class="num">Sin veredicto</th><th class="num">Caídas</th><th class="num">Bloqueadas</th><th>Modo</th></tr></thead><tbody>' +
    IN_ACC.map(function (a) {
      var x = by[a[0]] || {}, k = 'exigir_' + a[0], ex = inN((cfg[k] || {}).valor) === 1, bad = inN(x.malo);
      return '<tr><td><b>' + esc(a[1]) + '</b></td><td class="num">' + nf(x.total) + '</td><td class="num">' + esc(pct(inN(x.ok), inN(x.total))) + '</td><td class="num">' + nf(x.dudoso) + '</td>' +
        '<td class="num">' + (bad ? '<b style="color:var(--bad)">' + nf(bad) + '</b>' : '0') + '</td><td class="num">' + nf(inN(x.sin) + inN(x.sin_servicio)) + '</td><td class="num">' + nf(x.caido) + '</td><td class="num">' + nf(x.bloqueadas) + '</td>' +
        '<td><div class="seg">' + [['0', 'avisar'], ['1', 'exigir']].map(function (o) {
          return '<button type="button" data-a="inModo" data-k="' + esc(k) + '" data-v="' + o[0] + '" aria-pressed="' + ((o[0] === '1') === ex) + '"' + (IN.saving ? ' disabled' : '') + '>' + o[1] + '</button>';
        }).join('') + '</div></td></tr>';
    }).join('') + '</tbody></table></div></div></div>';
}
function inDias(d) {
  var p = d.por_dia || [];
  if (!p.length) return '<div class="card sec"><div class="ch">' + ic('chart') + '<h3>Por día</h3></div><div class="cb"><p class="mut">Sin peticiones en este periodo.</p></div></div>';
  return '<div class="card sec"><div class="ch">' + ic('chart') + '<h3>Por día</h3></div><div class="cb"><div class="tw"><table class="tbl"><thead><tr><th>Día</th><th class="num">Total</th><th class="num">% ok</th><th style="min-width:110px"></th><th class="num">Sospechosas</th></tr></thead><tbody>' +
    p.map(function (x) {
      var t = inN(x.total), w = t ? Math.round(inN(x.ok) * 100 / t) : 0;
      return '<tr><td>' + esc(x.dia) + '</td><td class="num">' + nf(t) + '</td><td class="num">' + esc(pct(inN(x.ok), t)) + '</td>' +
        '<td><div class="bar"><i style="width:' + w + '%"></i></div></td><td class="num">' + (inN(x.sospechosas) ? '<b style="color:var(--warn)">' + nf(x.sospechosas) + '</b>' : '0') + '</td></tr>';
    }).join('') + '</tbody></table></div></div></div>';
}
function inMalos(d) {
  var m = d.malos || [];
  return '<div class="card sec"><div class="ch">' + ic('user') + '<h3>Jugadores con veredicto malo</h3><span class="sub grow">' + plural(m.length, 'jugador') + '</span></div><div class="cb">' +
    '<label class="row xs mut" style="gap:8px;margin-bottom:10px"><input type="checkbox" id="in_dud" data-c="inDud"' + (IN.dud ? ' checked' : '') + '> Incluir dudosos en la lista</label>' +
    (m.length ? '<div class="tw"><table class="tbl"><thead><tr><th>Jugador</th><th>Plataforma</th><th>Estado</th><th>Motivo</th><th>Última vez</th><th class="num">Veces malo</th><th class="num">Peticiones malas</th><th>Último ok</th></tr></thead><tbody>' +
      m.map(function (x) {
        return '<tr class="clk" data-a="inJug" data-id="' + esc(x.id) + '" tabindex="0" role="link"><td><b>' + esc(x.nombre || 'Sin nombre') + '</b><div class="xs faint mono">' + esc(String(x.id || '').slice(0, 8)) + '…</div></td>' +
          '<td>' + esc(x.plataforma || '—') + '</td><td>' + inChip(x.estado) + '</td><td>' + inMot(x.motivo) + '</td><td>' + inFecha(x.ultimo_malo || x.actualizado) + '</td>' +
          '<td class="num">' + nf(x.malos) + '</td><td class="num">' + nf(x.pedidas_malo) + '</td><td>' + inFecha(x.ultimo_ok) + '</td></tr>';
      }).join('') + '</tbody></table></div>' : '<p class="mut" style="margin:0">Nadie con veredicto malo' + (IN.dud ? ' ni dudoso' : '') + ' en este periodo.</p>') +
    '</div></div>';
}
function inMotivos(d) {
  var m = d.motivos || [];
  return '<div class="card sec"><div class="ch">' + ic('hash') + '<h3>Motivos</h3></div><div class="cb">' + (m.length ? '<div class="tw"><table class="tbl"><thead><tr><th>Estado</th><th>Motivo</th><th class="num">Veces</th></tr></thead><tbody>' +
    m.map(function (x) { return '<tr><td>' + inChip(x.estado) + '</td><td>' + inMot(x.motivo) + '</td><td class="num">' + nf(x.n) + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="mut" style="margin:0">Sin motivos que mostrar.</p>') + '</div></div>';
}
function inAjustes(d) {
  var cfg = inCfg(), h = '<div class="card sec"><div class="ch">' + ic('sliders') + '<h3>Ajustes</h3><span class="sub grow"></span><button class="btn sm" data-a="inAj" aria-expanded="' + IN.aj + '">' + (IN.aj ? 'Ocultar' : 'Mostrar') + '</button></div>';
  if (!IN.aj) return h + '</div>';
  h += '<div class="cb">' + IN_AJ.map(function (a) {
    var c = cfg[a[0]]; if (!c) return '';
    var id = 'in_c_' + a[0], v = id in IN.ed ? IN.ed[id] : c.valor;
    return field(id, a[1], inp(id, v, { type: 'text', mode: 'numeric', di: 'inIn' }),
      esc(c.nota || '') + ' <span class="mut">Rango ' + nf(c.lo) + '–' + nf(c.hi) + ' · por defecto ' + nf(c.def) + (c.cambiado ? ' · cambiado ' + esc(fdt(c.cambiado)) : '') + '</span>');
  }).join('') + '<div class="row mt16"><button class="btn pri" data-a="inGuardar"' + (IN.saving ? ' disabled' : '') + '>' + (IN.saving === 'aj' ? '<span class="spin"></span>' : ic('refresh')) + 'Guardar</button><span class="xs mut">Solo se manda lo que cambiaste.</span></div></div>';
  return h + '</div>';
}

function vIntegridad() {
  var head = pageHead('Integridad de la app', 'Si las peticiones importantes vienen de la app original de Google Play o del App Store. En «avisar» solo se anota; en «exigir» se rechaza lo que no venga de la app original.',
    '<div class="seg">' + [1, 7, 30].map(function (n) { return '<button type="button" data-a="inDias" data-v="' + n + '" aria-pressed="' + (IN.dias === n) + '">' + n + (n === 1 ? ' día' : ' días') + '</button>'; }).join('') + '</div><button class="btn" data-a="inReload">' + ic('refresh') + 'Recargar</button>');
  if (!IN.d && !IN.err) { if (!IN.loading) inLoad(); return head + skel(4); }
  if (IN.err && !IN.d) {
    if (inSinSql(IN.err)) return head + '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.integridad + ' en Supabase', 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Hasta entonces la app no verifica nada.') + '</div>';
    return head + rerr({ err: IN.err }, 'la integridad').replace('data-a="rretry"', 'data-a="inReload"');
  }
  var d = IN.d, j = d.jugadores || {};
  var jug = '<p class="xs mut" style="margin:12px 0 0">Jugadores: ' + ['ok', 'dudoso', 'malo', 'caido', 'sin_servicio'].map(function (k) { return inChip(k) + ' ' + nf(j[k]); }).join(' &nbsp; ') + ' &nbsp; · ' + nf(j.vencidos) + ' con veredicto vencido</p>';
  return head + (IN.loading ? '<div class="xs mut">Actualizando…</div>' : '') + inKpis(d) + jug + inEstado(d) + inTabla(d) + inDias(d) + inMalos(d) + inMotivos(d) + inAjustes(d);
}
VIEWS['juego/integridad'] = vIntegridad;

A.inReload = function () { IN.err = null; IN.d = null; IN.loading = false; repaint(); };
A.inDias = function (el) { var n = +el.dataset.v; if (n === IN.dias) return; IN.dias = n; inLoad(); repaint(); };
C.inDud = function (el) { IN.dud = el.checked; inLoad(); };
A.inAj = function () { IN.aj = !IN.aj; repaint(); };
I.inIn = function (el) { IN.ed[el.id] = el.value; };

async function inGuarda(datos, que) {
  IN.saving = que; repaint();
  try { IN.d = await inCall('config', datos); IN.ed = {}; toast('Guardado'); }
  catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  IN.saving = ''; repaint();
}
C.inActiva = function (el) { var d = { activa: el.checked ? 1 : 0 }; inGuarda(d, 'activa'); };
A.inModo = async function (el) {
  var k = el.dataset.k, v = +el.dataset.v, c = inCfg()[k]; if (!c || IN.saving || inN(c.valor) === v) return;
  if (v === 1) {
    var a = IN_ACC.filter(function (x) { return 'exigir_' + x[0] === k; })[0];
    var ok = await confirmDlg({ title: '¿Pasar a «exigir»?', text: 'En exigir, las peticiones de ' + (a ? a[1] : k) + ' sin veredicto bueno se rechazan. Revisa antes que «sin veredicto» sea casi 0 (la mayoría ya tiene la versión con integridad). ¿Seguro?', ok: 'Sí, exigir', danger: true, icon: 'lock' });
    if (!ok) return;
  }
  var d = {}; d[k] = v; inGuarda(d, k);
};
A.inGuardar = function () {
  var cfg = inCfg(), d = {}, errs = {};
  IN_AJ.forEach(function (a) {
    var c = cfg[a[0]], id = 'in_c_' + a[0]; if (!c || !(id in IN.ed)) return;
    var t = String(IN.ed[id]).trim();
    if (!/^-?\d{1,15}$/.test(t) || +t < c.lo || +t > c.hi) { errs[id] = 'Un entero de ' + c.lo + ' a ' + c.hi + '.'; return; }
    if (+t !== Number(c.valor)) d[a[0]] = +t;
  });
  if (!showErrs(errs)) return;
  if (!Object.keys(d).length) { toast('No hay cambios', 'info'); return; }
  inGuarda(d, 'aj');
};

function inJugBody(id) {
  var o = IN.ver[id];
  if (!o || o.loading) return '<div class="sk skl"></div><div class="sk skl"></div>';
  if (o.err) return '<p class="mut">No se pudo cargar: ' + esc(o.err.message) + '</p>';
  var f = o.d || {}, j = f.jugador, h = '';
  if (j) h += '<div class="list"><div class="li"><div class="t"><b>Veredicto actual</b><span>' + inChip(j.estado) + ' ' + inMot(j.motivo) + (j.plataforma ? ' · ' + esc(j.plataforma) : '') + '</span></div></div>' +
    '<div class="li"><div class="t"><b>Actualizado</b><span>' + inFecha(j.actualizado) + (j.hasta ? ' · vale hasta ' + esc(fdt(j.hasta)) : '') + '</span></div></div></div>';
  else h += '<p class="mut">Sin veredicto guardado.</p>';
  var hs = f.historial || [];
  h += '<div class="dsec"><h4>Historial (' + nf(hs.length) + ')</h4>' + (hs.length ? '<div class="list">' + hs.map(function (x) {
    var det = x.detalle && Object.keys(x.detalle).length ? JSON.stringify(x.detalle) : '';
    return '<div class="li"><div class="t"><b>' + esc(fdt(x.creado)) + ' · ' + esc(x.plataforma || '—') + '</b><span>' + inChip(x.estado) + ' ' + inMot(x.motivo) + '</span>' +
      (det ? '<span class="mono xs faint" style="word-break:break-all">' + esc(det.length > 300 ? det.slice(0, 300) + '…' : det) + '</span>' : '') + '</div></div>';
  }).join('') + '</div>' : '<p class="mut">Sin historial.</p>') + '</div>';
  if (j) h += '<div class="row mt16"><button class="btn dng" data-a="inOlvidar" data-id="' + esc(id) + '">' + ic('trash') + 'Olvidar veredicto</button></div><p class="xs mut">Para falsos positivos: borra su veredicto y se vuelve a evaluar en su próxima petición.</p>';
  return h;
}
A.inJug = function (el) {
  var id = el.dataset.id, o = IN.ver[id] = { loading: true }, m = ((IN.d || {}).malos || []).filter(function (x) { return x.id === id; })[0] || {};
  inCall('jugador', { id: id }).then(function (r) { o.d = r; }, function (e) { o.err = e; }).then(function () { o.loading = false; drawerRefresh(); });
  drawer({ title: esc(m.nombre || 'Jugador'), sub: '<span class="mono xs">' + esc(id) + '</span>', wide: true, body: function () { return inJugBody(id); } });
};
A.inOlvidar = async function (el) {
  var id = el.dataset.id;
  var ok = await confirmDlg({ title: '¿Olvidar el veredicto?', text: 'Se borra el veredicto guardado de este jugador (útil para falsos positivos). Se vuelve a evaluar en su próxima petición.', ok: 'Olvidar', danger: true });
  if (!ok) return;
  try { await inCall('olvidar', { id: id }); toast('Veredicto olvidado'); delete IN.ver[id]; drawerClose(); IN.d = null; IN.loading = false; repaint(); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};
