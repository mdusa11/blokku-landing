/* ================= QUIÉN CANJEÓ UN CÓDIGO (32-quien-canjea.sql, app 2.0 y 1.1.2) ================= */
// En el cajón de cada código rotativo (60-codigos.js llama qcSection(id)).
//   admin_canjes_codigo(p_clave, p_codigo_id) → {activo, total, vinculados, anonimos, filas[{jugador_id, nombre, pais, plataforma, version, creado}]}
//   admin_canjes_vinculo(p_clave[, p_activo]) → {activo, vinculados}   interruptor «guardar quién canjea»
SQLF.quiencanjea = '32-quien-canjea.sql';
FNF.admin_canjes_codigo = 'quiencanjea';
FNF.admin_canjes_vinculo = 'quiencanjea';
var QC = {};
function qcLoad(id, force) {
  var o = QC[id];
  if (o && !force) return o;
  o = QC[id] = { d: null, err: null, loading: true };
  rpc('admin_canjes_codigo', { p_codigo_id: id }, { nomiss: true }).then(function (r) { o.d = r; o.err = null; }, function (e) { o.err = e; })
    .then(function () { o.loading = false; drawerRefresh(); });
  return o;
}
function qcSection(id) {
  if (typeof rkT === 'function') rkT('clasico', 'historico', '');
  var o = qcLoad(id), h = '<div class="dsec"><h4>Quién lo canjeó</h4>';
  if (o.loading) return h + '<div class="sk skl"></div></div>';
  if (o.err) {
    return h + '<p class="xs mut">' + (o.err.code === 'sin_sql' ? 'Falta correr ' + SQLF.quiencanjea + ' en Supabase (Escritorio › Blokku › 02-Documentos › Supabase).' : 'No se pudo cargar (' + esc(o.err.message) + ').') +
      '</p><button class="btn sm" data-a="qcReload" data-id="' + esc(id) + '">Reintentar</button></div>';
  }
  var d = o.d || {}, F = d.filas || [];
  h += '<p class="xs mut">' + (d.vinculados ? '<b>' + nf(d.vinculados) + '</b> de ' + nf(d.total) + ' canjes con nombre' : 'Ningún canje con nombre todavía') +
    (d.anonimos ? ' · ' + nf(d.anonimos) + ' anónimos (sin ranking o versión anterior)' : '') + '.</p>';
  if (!d.activo) {
    h += '<p class="xs mut">Guardar quién canjea está <b>apagado</b>: los canjes nuevos no se ligan a nadie.</p>' +
      '<button class="btn sm pri" data-a="qcTog" data-id="' + esc(id) + '" data-v="1">' + ic('play') + 'Encender</button>';
  }
  if (F.length) {
    h += '<div class="list mt8">' + F.map(function (r) {
      var nm = (typeof rkRow === 'function' && rkRow(r.jugador_id, 'clasico', 'historico')) ?
        '<a data-a="qcJug" tabindex="0" role="link" style="cursor:pointer" data-id="' + esc(r.jugador_id) + '">' + esc(r.nombre) + '</a>' : esc(r.nombre);
      return '<div class="li"><div class="t"><b>' + nm + '</b><span>' + (typeof rkFlag === 'function' && r.pais ? rkFlag(r.pais) + ' ' : '') + esc(r.plataforma === 'ios' ? 'iOS' : r.plataforma === 'android' ? 'Android' : r.plataforma) +
        (r.version ? ' · v' + esc(r.version) : '') + ' · <span title="' + esc(fdt(r.creado)) + '">' + esc(relT(r.creado)) + '</span></span></div></div>';
    }).join('') + '</div>';
    if (d.vinculados > F.length) h += '<p class="xs mut">Se muestran los últimos ' + nf(F.length) + '.</p>';
  }
  if (d.activo) h += '<div class="row mt8"><button class="btn sm ghost" data-a="qcTog" data-id="' + esc(id) + '" data-v="0">' + ic('pause') + 'Apagar guardado de nombres</button></div>';
  return h + '</div>';
}
A.qcReload = function (el) { qcLoad(el.dataset.id, true); drawerRefresh(); };
A.qcTog = async function (el) {
  var on = el.dataset.v === '1';
  if (!await confirmDlg({ title: on ? '¿Guardar quién canjea?' : '¿Dejar de guardar quién canjea?', text: on ? 'Desde ahora, quien use el ranking y canjee un código (de la app 1.1.2 o 2.0) quedará ligado a su nombre. Se borra solo si el jugador usa «Borrar mis datos».' : 'Los canjes nuevos volverán a ser anónimos. Lo ya guardado se queda.', ok: on ? 'Encender' : 'Apagar' })) return;
  try { await rpc('admin_canjes_vinculo', { p_activo: on }, { nomiss: true }); toast(on ? 'Guardando quién canjea' : 'Guardado de nombres apagado'); QC = {}; drawerRefresh(); } catch (er) { toast(er.message, 'bad'); }
};
A.qcJug = function (el) {
  var id = el.dataset.id;
  if (typeof rkRow === 'function' && typeof rkOpenDr === 'function' && rkRow(id, 'clasico', 'historico')) { drawerKill(true); rkOpenDr(id, 'clasico', 'historico', ['historico']); }
};
