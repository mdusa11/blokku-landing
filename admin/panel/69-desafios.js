/* ================= DESAFÍOS DE LA SEMANA (28-desafios-semana.sql, app 2.0) ================= */
// Todo por admin_desafios(p_clave, p_accion, p_datos): sin acción solo lee
// {ahora, semana, activo, tienda_activa, config[{clave,valor,def,lo,hi,nota}], catalogo[{id,metrica,dif,meta,bloques,xp,activo}],
//  cosmeticos[ids], semanas[{semana,inicia,termina,actual,programada,retos[],cosmetico}], stats[{semana,retos,activos,jugadores,bonus,bloques,por_reto}]}.
//   'config'           {clave: valor, …}                    números con rango (el servidor los vuelve a validar)
//   'catalogo'         {id, metrica, dif, meta, bloques, xp, activo}
//   'catalogo_quitar'  {id}
//   'semana'           {semana, facil, media, dificil, cosmetico}   programa una semana (ausente/vacío = automático)
//   'semana_quitar'    {semana}
//   'cosmetico'        {id} / 'cosmetico_quitar' {id}
// Esta sección se registra aquí mismo (SQLF, FNF, RFN, NAV, ROUTES, AYUDA, chip 2.0).
SQLF.desafios = '28-desafios-semana.sql';
FNF.admin_desafios = 'desafios';
RFN.desafios = 'admin_desafios';
N20['juego/desafios'] = 1;
(function () {
  var g = NAV.filter(function (x) { return x.k === 'juego'; })[0];
  if (g && !g.items.some(function (i) { return i[0] === 'juego/desafios'; })) g.items.push(['juego/desafios', 'Desafíos semanales', 'star']);
  ROUTES['juego/desafios'] = { t: 'Desafíos semanales', ic: 'star', g: g ? g.g : 'Juego', k: 'juego' };
})();
AYUDA['juego/desafios'] = {
  que: 'Los «Desafíos de la semana»: 3 desafíos (uno fácil, uno medio y uno difícil) que cambian cada lunes a las 00:00 de la Ciudad de México y son los mismos para todos los jugadores, además de las misiones diarias. Aquí enciendes o apagas la función, editas el catálogo de desafíos y sus premios, programas semanas concretas y ves cuántos jugadores completan cada uno.',
  ve: 'En el menú, justo debajo de las misiones diarias: la tarjeta «Desafíos de la semana» con una barra por desafío, la cuenta atrás hasta el lunes, un botón RECLAMAR al completar cada uno y un cofre semanal (bonus) cuando se cobran los tres. El desafío difícil puede dar un cosmético sorpresa (sale como un regalo «?» hasta que se gana). Una notificación suave avisa al completar uno y otra 24 horas antes de que acabe la semana.',
  cuando: 'Programa las semanas especiales (un evento, una fecha) con tiempo. Revisa las estadísticas: si casi nadie completa el difícil, bájale la meta; si todos terminan el fácil el primer día, súbesela. La función nace apagada.',
  como: [
    '<b>Qué versión lo soporta:</b> la app 2.0 o más nueva. Sin el SQL, con el interruptor apagado o con la tienda de Bloques apagada, la app esconde la tarjeta entera, sin errores.',
    '<b>Cómo se eligen (el servidor decide):</b> si no programas nada, el servidor sortea los 3 de cada semana con una cuenta fija sobre el catálogo activo (uno de cada dificultad, sin repetir tipo de desafío). Programar una semana fija los que tú elijas; lo que dejes en «Automático» lo sortea el servidor. Se puede programar la semana actual y las siguientes mientras nadie haya cobrado nada de esa semana.',
    '<b>Se congelan:</b> la primera vez que un teléfono pide la semana, sus metas y premios quedan guardados. Cambiar el catálogo a media semana NO cambia los desafíos de esa semana, solo las siguientes.',
    '<b>El progreso se lleva en el teléfono</b> (como las misiones). <b>La entrega del premio la valida el servidor:</b> una sola vez por jugador, semana y desafío (reintentar tras un corte no paga dos veces); solo de la semana actual (o la anterior durante la «gracia»); compara el progreso con la meta del servidor; exige haber jugado esa semana (partidas ya cobradas en la cartera de Bloques); y limita los cobros por hora. El cofre semanal solo se abre con los tres cobrados.',
    '<b>Premios:</b> Bloques (a la cartera de la tienda) y XP. Cada desafío tiene los suyos; el cofre da el bonus de «Valores». El difícil puede dar un <b>cosmético oculto</b> (de la lista de «Cosméticos posibles»): nunca se vende, no sale en catálogos hasta tenerlo y, si el jugador ya lo tenía, el servidor lo compensa con Bloques extra.',
    '<b>Estadísticas:</b> «Completaron» cuenta los desafíos <b>cobrados</b> (el jugador toca RECLAMAR), y el porcentaje es sobre los jugadores que jugaron esa semana (con partida cobrada en la cartera).',
    '<b>Cuánto tarda:</b> la app guarda la configuración 30 minutos, así que un cambio puede tardar en llegar. Los cobros ya usan lo nuevo al instante.',
    H_HORA
  ]
};

var DC = { d: {}, on: null, saving: '', ed: null };
var DC_MET = [
  ['lineas', 'Líneas limpiadas (suma de todas las partidas)'], ['combo', 'Combo máximo en una jugada'], ['combos', 'Veces que se logra un combo (×2 o más)'],
  ['cuatro_lineas', 'Veces que se limpian 4 líneas de golpe'], ['poderes', 'Poderes usados'], ['partidas', 'Partidas jugadas (cualquier modo)'],
  ['partidas_clasico', 'Partidas de Clásico'], ['partidas_contrarreloj', 'Partidas de Contrarreloj'], ['partidas_zen', 'Partidas de Zen'],
  ['puntos_clasico', 'Puntos en UNA partida de Clásico'], ['puntos_contrarreloj', 'Puntos en UNA partida de Contrarreloj'],
  ['lineas_partida', 'Líneas limpiadas en UNA partida'], ['diarios', 'Retos diarios jugados (días distintos)'], ['temas', 'Temas distintos usados'],
  ['perfectos', 'Tableros perfectos (limpiar todo)'], ['xp', 'XP ganado'], ['dias_juego', 'Días distintos jugados']
];
var DC_DIF = [['facil', 'Fácil'], ['media', 'Medio'], ['dificil', 'Difícil']];
var DC_DIF_N = { facil: 'Fácil', media: 'Medio', dificil: 'Difícil' };
var DC_GRP = [
  ['Bonus por cobrar los 3', 'trophy', ['bonus_bloques', 'bonus_xp'], 'Lo que da el cofre semanal.'],
  ['Cosmético del difícil', 'gift', ['cosmetico_cada', 'cosmetico_repetido'], 'Cada cuántas semanas (sin programar) el difícil da un cosmético oculto, y qué se da si ya lo tenía.'],
  ['Anti-trampas', 'lock', ['min_partidas_facil', 'min_partidas_media', 'min_partidas_dificil', 'gracia_horas', 'tope_cobros_hora'], 'Lo que exige el servidor para pagar.']
];

function dcRows() { var o = rm('desafios'); return o && o.rows && typeof o.rows === 'object' && !Array.isArray(o.rows) && o.rows.config ? o.rows : null; }
function dcCfg(r) { var m = {}; (r.config || []).forEach(function (c) { m[c.clave] = c; }); return m; }
function dcDraft(id, srv) { return id in DC.d ? DC.d[id] : (srv == null ? '' : String(srv)); }
function dcInt(raw, lo, hi) { var t = String(raw == null ? '' : raw).trim(); return /^\d{1,9}$/.test(t) && Number(t) >= lo && Number(t) <= hi ? Number(t) : null; }
function dcOn(m) { return DC.on != null ? DC.on : !!(m.desafios_activo && m.desafios_activo.valor === 1); }
function dcMetN(k) { var f = DC_MET.filter(function (x) { return x[0] === k; })[0]; return f ? f[1] : k; }
function dcMetCorto(k) { return String(dcMetN(k)).replace(/ \(.*\)$/, ''); }
function dcNum(n) { return Number(n).toLocaleString('en-US'); }
/* «Limpia 300 líneas», como lo lee el jugador */
function dcTxt(m, n) {
  var v = dcNum(n);
  return ({
    lineas: 'Limpia ' + v + ' líneas', combo: 'Logra un combo ×' + v, combos: 'Haz ' + v + ' combos', cuatro_lineas: 'Limpia 4 líneas de golpe ' + v + (n === 1 ? ' vez' : ' veces'),
    poderes: 'Usa ' + v + (n === 1 ? ' poder' : ' poderes'), partidas: 'Juega ' + v + (n === 1 ? ' partida' : ' partidas'),
    partidas_clasico: 'Clásico · Juega ' + v + (n === 1 ? ' partida' : ' partidas'), partidas_contrarreloj: 'Contrarreloj · Juega ' + v + (n === 1 ? ' partida' : ' partidas'),
    partidas_zen: 'Zen · Juega ' + v + (n === 1 ? ' partida' : ' partidas'), puntos_clasico: 'Clásico · Llega a ' + v + ' puntos', puntos_contrarreloj: 'Contrarreloj · Llega a ' + v + ' puntos',
    lineas_partida: 'Limpia ' + v + ' líneas en una partida', diarios: 'Juega ' + v + (n === 1 ? ' reto diario' : ' retos diarios'), temas: 'Juega con ' + v + ' temas distintos',
    perfectos: 'Logra ' + v + (n === 1 ? ' tablero perfecto' : ' tableros perfectos'), xp: 'Gana ' + v + ' XP', dias_juego: 'Juega en ' + v + ' días distintos'
  })[m] || (m + ' ' + v);
}
function dcRetoTxt(c) { return c ? dcTxt(c.metrica, c.meta) : '—'; }
function dcCat(r, id) { return (r.catalogo || []).filter(function (c) { return c.id === id; })[0]; }
function dcNom(r, id) { var c = dcCat(r, id); return c ? dcTxt(c.metrica, c.meta) : id; }
I.dcIn = function (el) { DC.d[el.id] = el.value; };
C.dcTog = function (el) { DC.on = el.checked; };

function dcSemanaAct(r) { return (r.semanas || []).filter(function (s) { return s.actual; })[0]; }
function dcKpis(r) {
  var st = (r.stats || []).filter(function (x) { return x.semana === r.semana; })[0] || {};
  var por = st.por_reto || {}, tot = 0, bonus = st.bonus || 0;
  Object.keys(por).forEach(function (k) { if (k !== 'bonus') tot += por[k]; });
  return '<div class="kpis">' +
    kpi('live', 'Jugaron esta semana', nf(st.activos || 0), 'Con al menos una partida cobrada en la cartera de Bloques') +
    kpi('user', 'Cobraron algo', nf(st.jugadores || 0), st.activos ? pct(st.jugadores || 0, st.activos) + ' de los que jugaron' : 'Aún sin cobros esta semana') +
    kpi('check', 'Desafíos cobrados', nf(tot), 'Suma de los 3 desafíos de esta semana') +
    kpi('gift', 'Cofres abiertos', nf(bonus), st.jugadores ? pct(bonus, st.jugadores) + ' de los que cobraron' : 'Los tres cobrados') +
    kpi('trend', 'Bloques pagados', nf(st.bloques || 0), 'Esta semana, incluido el cofre') + '</div>';
}

/* ---- interruptor y valores ---- */
function dcValores(r) {
  var m = dcCfg(r), on = dcOn(m);
  var estado = !m.desafios_activo || m.desafios_activo.valor === 1 ? (r.tienda_activa ? 'Encendidos' : 'Encendidos, pero la tienda está apagada: la app los esconde') : 'Apagados: la app no enseña la tarjeta';
  var h = '<div class="card sec"><div class="ch">' + ic('power') + '<h3>Desafíos semanales encendidos</h3><span class="sub grow">' + esc(estado) + '</span></div><div class="cb">' +
    '<div class="row nw" style="align-items:flex-start"><div class="grow"><b>Interruptor de los desafíos</b><div class="xs mut">Verde «Encendidos» = la app enseña la tarjeta «Desafíos de la semana» junto a las misiones y el servidor paga los premios. Gris «Apagados» = desaparece todo y el servidor rechaza los cobros. Apagar no borra nada. Nacen <b>apagados</b>: enciéndelos cuando estés listo. Necesitan la tienda de Bloques encendida.</div></div>' +
    tog('dc_activo', on, 'Desafíos semanales', { dc: 'dcTog', on: 'Encendidos', off: 'Apagados' }) + '</div></div></div>';
  DC_GRP.forEach(function (g) {
    h += '<div class="card sec"><div class="ch">' + ic(g[1]) + '<h3>' + esc(g[0]) + '</h3><span class="sub grow">' + esc(g[3]) + '</span></div><div class="cb"><div class="grid g2">';
    g[2].forEach(function (k) {
      var c = m[k]; if (!c) return;
      var id = 'dc_' + k;
      h += field(id, c.nota, inp(id, dcDraft(id, c.valor), { type: 'number', mode: 'numeric', min: c.lo, ph: 'De fábrica: ' + nf(c.def), di: 'dcIn' }), 'Entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '. <b>Ahora:</b> ' + nf(c.valor) + (c.valor !== c.def ? ' (de fábrica ' + nf(c.def) + ')' : '') + '.');
    });
    h += '</div></div></div>';
  });
  return h + '<div class="row" style="margin:4px 0 20px"><button class="btn pri" data-a="dcSave"' + (DC.saving ? ' disabled' : '') + '>' + (DC.saving === 'cfg' ? '<span class="spin"></span>' : ic('check')) + 'Guardar interruptor y valores</button><span class="xs mut">Te enseño «antes → después» antes de guardar. Afecta a las apps 2.0 o más nuevas.</span></div>';
}
A.dcReload = function () { DC.d = {}; DC.on = null; DC.ed = null; rload('desafios'); toast('Recargando…', 'info'); };
A.dcSave = async function () {
  if (DC.saving) return;
  var r = dcRows(); if (!r) return;
  var m = dcCfg(r), errs = {}, ch = {}, dl = [];
  Object.keys(m).forEach(function (k) {
    if (k === 'desafios_activo') return;
    var c = m[k], id = 'dc_' + k, v = dcInt(dcDraft(id, c.valor), c.lo, c.hi);
    if (v == null) { errs[id] = 'Un entero de ' + nf(c.lo) + ' a ' + nf(c.hi) + '.'; return; }
    if (v !== c.valor) { ch[k] = v; dl.push([c.nota, nf(c.valor) + ' → <b>' + nf(v) + '</b>']); }
  });
  var on = dcOn(m), was = !!(m.desafios_activo && m.desafios_activo.valor === 1);
  if (on !== was) { ch.desafios_activo = on ? 1 : 0; dl.unshift(['Desafíos semanales', (was ? 'Encendidos' : 'Apagados') + ' → <b>' + (on ? 'Encendidos' : 'Apagados') + '</b>']); }
  if (!showErrs(errs)) return;
  if (!dl.length) { toast('No hay cambios', 'info'); return; }
  var apaga = ch.desafios_activo === 0;
  var ok = await confirmDlg({ title: apaga ? '¿Apagar los desafíos semanales?' : (ch.desafios_activo === 1 ? '¿Encender los desafíos semanales?' : '¿Guardar los valores de los desafíos?'), text: 'Esto afecta a todos los jugadores.', html: cbox(dl.concat([['A quién', 'A todos los jugadores con la app 2.0 o más nueva.'], ['Cuánto tarda', 'La app guarda la configuración unos 30 minutos; los cobros ya usan lo nuevo al instante.']])), ok: apaga ? 'Apagar' : 'Sí, guardar', danger: apaga, icon: 'sliders' });
  if (!ok) return;
  DC.saving = 'cfg'; paintPage();
  try {
    await rpc('admin_desafios', { p_accion: 'config', p_datos: ch });
    DC.d = {}; DC.on = null; toast('Desafíos actualizados');
    await rload('desafios', true);
  } catch (e) { toast('No se pudo guardar: ' + e.message, 'bad'); }
  DC.saving = ''; paintPage();
};

/* ---- semanas: lo que toca y programar ---- */
function dcSemanas(r) {
  var list = r.semanas || [], ed = DC.ed;
  var h = '<div class="card sec"><div class="ch">' + ic('cal') + '<h3>Semanas</h3><span class="sub grow">La actual y las 8 siguientes (cambian el lunes a las 00:00 de México)</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Esto es lo que tocará cada semana: si no programas nada, el servidor la sortea con una cuenta fija (igual para todos). Una semana ya empezada se «congela» cuando el primer jugador la pide; solo se puede cambiar mientras nadie haya cobrado nada de ella.</p>' +
    '<div class="tw"><table class="tbl"><thead><tr><th>Semana</th><th>Fácil</th><th>Medio</th><th>Difícil</th><th>Cosmético</th><th>Estado</th><th></th></tr></thead><tbody>' + list.map(function (s) {
      var rt = s.retos || [];
      function celda(i) { var x = rt[i]; return x ? esc(dcTxt(x.metrica, x.meta)) + '<div class="xs mut">' + nf(x.bloques) + ' Bloques · ' + nf(x.xp) + ' XP</div>' : '<span class="mut">—</span>'; }
      return '<tr><td>' + esc(s.semana) + (s.actual ? ' ' + chip('actual', 'ok') : '') + '<div class="xs mut">' + esc(fdt(s.inicia, true)) + ' → ' + esc(fdt(s.termina, true)) + '</div></td><td>' + celda(0) + '</td><td>' + celda(1) + '</td><td>' + celda(2) + '</td>' +
        '<td>' + (s.cosmetico ? '<span class="mono xs">' + esc(s.cosmetico) + '</span>' : '<span class="mut">ninguno</span>') + '</td>' +
        '<td>' + (s.programada ? chip('programada', 'warn') : chip('automática', '')) + '</td>' +
        '<td class="num"><button class="btn sm" data-a="dcEd" data-s="' + esc(s.semana) + '">' + ic('edit') + 'Programar</button>' +
        (s.programada ? ' <button class="btn sm ghost" data-a="dcSemDel" data-s="' + esc(s.semana) + '">' + ic('trash') + 'Automática</button>' : '') + '</td></tr>';
    }).join('') + '</tbody></table></div>';
  if (ed) {
    var cat = r.catalogo || [];
    function pick(dif, key) {
      var o = [['', 'Automático (lo sortea el servidor)']].concat(cat.filter(function (c) { return c.dif === dif && c.activo; }).map(function (c) { return [c.id, dcTxt(c.metrica, c.meta) + ' · ' + nf(c.bloques) + ' Bloques']; }));
      var cur = ed[key]; if (cur && !o.some(function (x) { return x[0] === cur; })) o.push([cur, cur]);
      return field('dc_e_' + key, DC_DIF_N[dif], sel('dc_e_' + key, cur || '', o));
    }
    var co = [['__auto', 'Automático (cada ' + ((dcCfg(r).cosmetico_cada || {}).valor || 0) + ' semanas, o ninguno si es 0)'], ['__none', 'Ninguno esta semana']].concat((r.cosmeticos || []).map(function (c) { return [c, c]; }));
    h += '<h4 style="margin:18px 0 8px">Programar la semana ' + esc(ed.semana) + '</h4><div class="grid g2">' + pick('facil', 'facil') + pick('media', 'media') + pick('dificil', 'dificil') +
      field('dc_e_cosm', 'Cosmético oculto del difícil', sel('dc_e_cosm', ed.cosm || '__auto', co), 'Sale como regalo «?» hasta que el jugador lo gana. Nunca se vende.') + '</div>' +
      '<div class="row mt16"><button class="btn pri" data-a="dcSemSave"' + (DC.saving ? ' disabled' : '') + '>' + (DC.saving === 'sem' ? '<span class="spin"></span>' : ic('check')) + 'Programar esta semana</button><button class="btn ghost" data-a="dcEdOff">Cancelar</button></div>';
  }
  return h + '</div></div>';
}
A.dcEd = function (el) {
  var r = dcRows(); if (!r) return;
  var s = (r.semanas || []).filter(function (x) { return x.semana === el.dataset.s; })[0]; if (!s) return;
  var rt = s.retos || [], cosm = '__auto';
  if (s.programada) cosm = s.cosmetico ? s.cosmetico : '__none';
  DC.ed = { semana: s.semana, facil: s.programada && rt[0] ? rt[0].id : '', media: s.programada && rt[1] ? rt[1].id : '', dificil: s.programada && rt[2] ? rt[2].id : '', cosm: cosm };
  paintPage();
};
A.dcEdOff = function () { DC.ed = null; paintPage(); };
A.dcSemSave = async function () {
  if (DC.saving || !DC.ed) return;
  var r = dcRows(); if (!r) return;
  var ed = DC.ed, f = $('#dc_e_facil'), m = $('#dc_e_media'), d = $('#dc_e_dificil'), c = $('#dc_e_cosm');
  var datos = { semana: ed.semana, facil: f ? f.value : '', media: m ? m.value : '', dificil: d ? d.value : '' };
  var cv = c ? c.value : '__auto';
  if (cv === '__none') datos.cosmetico = ''; else if (cv !== '__auto') datos.cosmetico = cv;
  var dl = [['Semana', esc(ed.semana)],
    ['Fácil', datos.facil ? esc(dcNom(r, datos.facil)) : '<span class="mut">automático</span>'],
    ['Medio', datos.media ? esc(dcNom(r, datos.media)) : '<span class="mut">automático</span>'],
    ['Difícil', datos.dificil ? esc(dcNom(r, datos.dificil)) : '<span class="mut">automático</span>'],
    ['Cosmético', cv === '__auto' ? 'automático' : cv === '__none' ? 'ninguno' : esc(cv)]];
  var ok = await confirmDlg({ title: '¿Programar esta semana?', text: 'Todos los jugadores verán estos desafíos esa semana.', html: cbox(dl.concat([['Cuándo', 'Del lunes a las 00:00 al domingo a las 23:59 (hora de México).'], ['Cuánto tarda', 'La app guarda la configuración unos 30 minutos.']])), ok: 'Sí, programar', icon: 'cal' });
  if (!ok) return;
  DC.saving = 'sem'; paintPage();
  try {
    await rpc('admin_desafios', { p_accion: 'semana', p_datos: datos });
    DC.ed = null; toast('Semana programada');
    await rload('desafios', true);
  } catch (e) { toast('No se pudo programar: ' + e.message, 'bad'); }
  DC.saving = ''; paintPage();
};
A.dcSemDel = async function (el) {
  var s = el.dataset.s;
  if (!await confirmDlg({ title: '¿Volver a automática?', text: 'El servidor sortea esa semana otra vez.', html: cbox([['Semana', esc(s)]]), ok: 'Sí, automática', icon: 'trash' })) return;
  try { await rpc('admin_desafios', { p_accion: 'semana_quitar', p_datos: { semana: s } }); toast('Semana automática'); await rload('desafios', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
};

/* ---- catálogo y premios ---- */
function dcCatalogo(r) {
  var cat = r.catalogo || [];
  var h = '<div class="card sec"><div class="ch">' + ic('list') + '<h3>Catálogo y premios</h3><span class="sub grow">' + nf(cat.filter(function (c) { return c.activo; }).length) + ' activos de ' + nf(cat.length) + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">De aquí sale cada semana un desafío de cada dificultad. Cada uno es un <b>tipo</b> (lo que la app sabe contar) con una <b>meta</b> y sus premios. Cambiar un desafío afecta a las semanas que aún no se han congelado. «Pausar» lo saca del sorteo sin borrarlo.</p>';
  if (cat.length) {
    h += '<div class="tw" style="margin-bottom:14px"><table class="tbl"><thead><tr><th>Desafío</th><th>Tipo</th><th>Dificultad</th><th>Meta</th><th>Bloques</th><th>XP</th><th>Estado</th><th></th></tr></thead><tbody>' + cat.map(function (c) {
      return '<tr><td>' + esc(dcTxt(c.metrica, c.meta)) + '<div class="xs mut mono">' + esc(c.id) + '</div></td>' +
        '<td>' + sel('dc_cm_' + c.id, c.metrica, DC_MET) + '</td>' +
        '<td>' + sel('dc_cd_' + c.id, c.dif, DC_DIF) + '</td>' +
        '<td>' + inp('dc_ct_' + c.id, String(c.meta), { type: 'number', mode: 'numeric', min: 1 }) + '</td>' +
        '<td>' + inp('dc_cb_' + c.id, String(c.bloques), { type: 'number', mode: 'numeric', min: 0 }) + '</td>' +
        '<td>' + inp('dc_cx_' + c.id, String(c.xp), { type: 'number', mode: 'numeric', min: 0 }) + '</td>' +
        '<td>' + (c.activo ? chip('en sorteo', 'ok') : chip('pausado', 'warn')) + '</td>' +
        '<td class="num"><button class="btn sm" data-a="dcCatSave" data-id="' + esc(c.id) + '" data-v="' + (c.activo ? 1 : 0) + '">' + ic('check') + 'Guardar</button> ' +
        '<button class="btn sm ghost" data-a="dcCatTog" data-id="' + esc(c.id) + '" data-v="' + (c.activo ? 0 : 1) + '">' + (c.activo ? 'Pausar' : 'Reanudar') + '</button> ' +
        '<button class="btn sm ghost" data-a="dcCatDel" data-id="' + esc(c.id) + '">' + ic('trash') + 'Quitar</button></td></tr>';
    }).join('') + '</tbody></table></div>';
  } else h += '<p class="mut" style="margin:0 0 12px">El catálogo está vacío: la app no tendrá desafíos hasta que agregues al menos uno de cada dificultad.</p>';
  h += '<h4 style="margin:6px 0 8px">Agregar un desafío</h4><div class="grid g2">' +
    field('dc_n_id', 'Identificador', inp('dc_n_id', '', { ph: 'ej. lineas_450', max: 40 }), 'Minúsculas, números y guion bajo (2 a 40). No se puede repetir.') +
    field('dc_n_m', 'Tipo', sel('dc_n_m', 'lineas', DC_MET)) +
    field('dc_n_d', 'Dificultad', sel('dc_n_d', 'media', DC_DIF)) +
    field('dc_n_t', 'Meta', inp('dc_n_t', '', { type: 'number', mode: 'numeric', min: 1, ph: 'ej. 450' })) +
    field('dc_n_b', 'Bloques de premio', inp('dc_n_b', '', { type: 'number', mode: 'numeric', min: 0, ph: 'ej. 1200' }), 'De 0 a 5,000.') +
    field('dc_n_x', 'XP de premio', inp('dc_n_x', '', { type: 'number', mode: 'numeric', min: 0, ph: 'ej. 250' }), 'De 0 a 5,000.') + '</div>' +
    '<div class="row mt16"><button class="btn" data-a="dcCatAdd">' + ic('check') + 'Agregar</button><span class="xs mut">Referencia (Bloques ×10, 37-bloques-x10): fácil 500 Bloques + 100 XP · medio 1,200 + 250 · difícil 3,000 + 500.</span></div></div></div>';
  return h;
}
function dcLeeCat(pref, id) {
  function v(k) { var e = $('#dc_' + pref + '_' + k); return e ? String(e.value).trim() : ''; }
  var meta = dcInt(v('t'), 1, 10000000), bl = dcInt(v('b'), 0, 5000), xp = dcInt(v('x'), 0, 5000), errs = {};
  if (meta == null) errs['dc_' + pref + '_t'] = 'Un entero de 1 a 10,000,000.';
  if (bl == null) errs['dc_' + pref + '_b'] = 'Un entero de 0 a 5,000.';
  if (xp == null) errs['dc_' + pref + '_x'] = 'Un entero de 0 a 5,000.';
  if (!showErrs(errs)) return null;
  return { id: id, metrica: v('m'), dif: v('d'), meta: meta, bloques: bl, xp: xp };
}
async function dcCatPost(accion, datos, okMsg) {
  try { await rpc('admin_desafios', { p_accion: accion, p_datos: datos }); toast(okMsg); await rload('desafios', true); }
  catch (e) { toast('No se pudo: ' + e.message, 'bad'); }
}
A.dcCatSave = async function (el) {
  var id = el.dataset.id, r = dcRows() || {}, d;
  // En la fila los campos se llaman dc_cm_/dc_cd_/dc_ct_/dc_cb_/dc_cx_<id>.
  function v(k) { var e = $('#dc_c' + k + '_' + id); return e ? String(e.value).trim() : ''; }
  var meta = dcInt(v('t'), 1, 10000000), bl = dcInt(v('b'), 0, 5000), xp = dcInt(v('x'), 0, 5000), errs = {};
  if (meta == null) errs['dc_ct_' + id] = 'Un entero de 1 a 10,000,000.';
  if (bl == null) errs['dc_cb_' + id] = 'Un entero de 0 a 5,000.';
  if (xp == null) errs['dc_cx_' + id] = 'Un entero de 0 a 5,000.';
  if (!showErrs(errs)) return;
  d = { id: id, metrica: v('m'), dif: v('d'), meta: meta, bloques: bl, xp: xp, activo: el.dataset.v === '1' };
  var antes = dcCat(r, id) || {};
  if (!await confirmDlg({ title: '¿Guardar este desafío?', text: 'Vale para las semanas que aún no se han congelado.', html: cbox([['Desafío', esc(id)], ['Tipo', esc(dcMetN(d.metrica))], ['Dificultad', esc(DC_DIF_N[d.dif])], ['Meta', nf(antes.meta) + ' → <b>' + nf(d.meta) + '</b>'], ['Bloques', nf(antes.bloques) + ' → <b>' + nf(d.bloques) + '</b>'], ['XP', nf(antes.xp) + ' → <b>' + nf(d.xp) + '</b>']]), ok: 'Sí, guardar', icon: 'list' })) return;
  await dcCatPost('catalogo', d, 'Desafío guardado');
};
A.dcCatTog = async function (el) {
  var id = el.dataset.id, c = dcCat(dcRows() || {}, id); if (!c) return;
  await dcCatPost('catalogo', { id: id, metrica: c.metrica, dif: c.dif, meta: c.meta, bloques: c.bloques, xp: c.xp, activo: el.dataset.v === '1' }, el.dataset.v === '1' ? 'Reanudado' : 'Pausado');
};
A.dcCatDel = async function (el) {
  var id = el.dataset.id;
  if (!await confirmDlg({ title: '¿Quitar del catálogo?', text: 'Deja de salir en el sorteo. Las semanas ya congeladas lo conservan y lo ya cobrado se queda.', html: cbox([['Desafío', esc(id)]]), ok: 'Quitar', danger: true, icon: 'trash' })) return;
  await dcCatPost('catalogo_quitar', { id: id }, 'Quitado del catálogo');
};
A.dcCatAdd = async function () {
  var idEl = $('#dc_n_id'), id = idEl ? String(idEl.value).trim() : '';
  if (!/^[a-z0-9_]{2,40}$/.test(id)) { showErrs({ dc_n_id: 'Minúsculas, números y guion bajo (2 a 40).' }); return; }
  if (dcCat(dcRows() || {}, id)) { showErrs({ dc_n_id: 'Ese identificador ya existe: edítalo en la tabla.' }); return; }
  var d = dcLeeCat('n', id); if (!d) return;
  d.activo = true;
  if (!await confirmDlg({ title: '¿Agregar este desafío?', text: 'Entra al sorteo de las semanas que aún no se han congelado.', html: cbox([['Desafío', esc(dcTxt(d.metrica, d.meta))], ['Identificador', esc(id)], ['Dificultad', esc(DC_DIF_N[d.dif])], ['Premio', nf(d.bloques) + ' Bloques + ' + nf(d.xp) + ' XP']]), ok: 'Sí, agregar', icon: 'list' })) return;
  await dcCatPost('catalogo', d, 'Desafío agregado');
};

/* ---- cosméticos posibles ---- */
function dcCosmeticos(r) {
  var cs = r.cosmeticos || [];
  var h = '<div class="card sec"><div class="ch">' + ic('gift') + '<h3>Cosméticos posibles</h3><span class="sub grow">' + (cs.length ? nf(cs.length) + ' en la lista' : 'Lista vacía') + '</span></div><div class="cb">' +
    '<p class="xs mut" style="margin:0 0 12px">Los que puede dar el desafío difícil. Quedan <b>ocultos hasta ganarlos</b> y <b>nunca se venden</b>: el servidor no deja agregar uno que esté en el catálogo de la tienda. De fábrica: el título «Desafiante» y la insignia «Medalla semanal». Para usar otro, tiene que existir ya en la app.</p>';
  if (cs.length) h += '<div class="chips" style="margin-bottom:12px">' + cs.map(function (i) { return '<button type="button" class="fchip" data-a="dcCosDel" data-id="' + esc(i) + '" aria-pressed="true" title="Quitar de la lista">' + esc(i) + ' ' + ic('x') + '</button>'; }).join('') + '</div>';
  h += '<div class="row nw"><div class="grow">' + inp('dc_cos_n', '', { ph: 'ej. badge_desafiante (theme_, style_, effect_, frame_, badge_ o title_)', max: 48 }) + '</div><button class="btn" data-a="dcCosAdd">' + ic('check') + 'Agregar</button></div></div></div>';
  return h;
}
A.dcCosAdd = async function () {
  var e = $('#dc_cos_n'), id = e ? String(e.value).trim() : '';
  if (!/^(theme|style|effect|frame|badge|title)_[A-Za-z0-9_]{1,40}$/.test(id)) { showErrs({ dc_cos_n: 'Empieza con theme_, style_, effect_, frame_, badge_ o title_.' }); return; }
  if (!await confirmDlg({ title: '¿Agregar este cosmético?', text: 'Podrá salir como premio del desafío difícil.', html: cbox([['Cosmético', esc(id)], ['Importante', 'Debe existir en la app (si no, el jugador no lo vería). Nunca se vende.']]), ok: 'Sí, agregar', icon: 'gift' })) return;
  await dcCatPost('cosmetico', { id: id }, 'Cosmético agregado');
};
A.dcCosDel = async function (el) {
  var id = el.dataset.id;
  if (!await confirmDlg({ title: '¿Quitar de la lista?', text: 'Deja de poder salir como premio. Lo que ya se ganó se queda.', html: cbox([['Cosmético', esc(id)]]), ok: 'Quitar', danger: true, icon: 'trash' })) return;
  await dcCatPost('cosmetico_quitar', { id: id }, 'Quitado de la lista');
};

/* ---- estadísticas por semana ---- */
function dcStats(r) {
  var st = r.stats || [];
  var h = '<div class="card sec"><div class="ch">' + ic('chart') + '<h3>Cuántos completan cada desafío</h3><span class="sub grow">Últimas ' + nf(st.length) + ' semanas</span></div><div class="cb">';
  if (!st.length) return h + '<p class="mut">Todavía no hay datos. Aparecerán aquí cuando los jugadores con la app 2.0 empiecen a cobrar desafíos.</p></div></div>';
  st.forEach(function (w) {
    var por = w.por_reto || {}, rt = w.retos || [];
    h += '<h4 style="margin:14px 0 8px">' + esc(w.semana) + (w.semana === r.semana ? ' ' + chip('actual', 'ok') : '') + '<span class="xs mut" style="font-weight:500"> · ' + nf(w.activos) + ' jugaron · ' + nf(w.jugadores) + ' cobraron algo · ' + nf(w.bloques) + ' Bloques pagados</span></h4>' +
      '<div class="tw"><table class="tbl"><thead><tr><th>Desafío</th><th>Dificultad</th><th class="num">Completaron</th><th class="num">De los que jugaron</th></tr></thead><tbody>' + rt.map(function (x) {
        var n = por[x.id] || 0;
        return '<tr><td>' + esc(dcTxt(x.metrica, x.meta)) + '<div class="xs mut mono">' + esc(x.id) + '</div></td><td>' + esc(DC_DIF_N[x.dif] || x.dif) + '</td><td class="num">' + nf(n) + '</td><td class="num">' + pct(n, w.activos) + '</td></tr>';
      }).join('') + '<tr><td>Cofre semanal (los 3)</td><td>Bonus</td><td class="num">' + nf(w.bonus) + '</td><td class="num">' + pct(w.bonus, w.activos) + '</td></tr></tbody></table></div>';
  });
  return h + '</div></div>';
}

function vDesafios() {
  var o = rm('desafios');
  var h = pageHead('Desafíos semanales', '<b>3 desafíos por semana</b> (fácil, medio y difícil) que cambian cada lunes y son los mismos para todos, con premios en Bloques y XP, un cofre al completar los tres y, a veces, un cosmético oculto.', '<button class="btn" data-a="dcReload">' + ic('refresh') + 'Recargar</button>');
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.desafios, 'Está en Escritorio › Blokku › 02-Documentos › Supabase. Va después de 19-tienda.sql (usa la cartera de Bloques).') + '</div>' : rerr(o, 'los desafíos semanales'));
  var r = dcRows();
  if (!r) return h + skel(4);
  return h + dcKpis(r) + dcValores(r) + dcSemanas(r) + dcCatalogo(r) + dcCosmeticos(r) + dcStats(r);
}
VIEWS['juego/desafios'] = vDesafios;
