/* ================= CÓDIGOS: rotativos, únicos, stickers, canjes ================= */
var CEST_L = [['todos', 'Todos'], ['activo', 'Activos ahora'], ['agotado', 'Agotados'], ['caducado', 'Vencidos'], ['desactivado', 'Apagados']];
function cFilt() {
  var f = S.f.cr || {}, q = f.q || '';
  return rows('codigos').filter(function (c) {
    if (f.e && f.e !== 'todos' && cEst(c) !== f.e) return false;
    if (f.p && (c.cosmeticos || []).indexOf(f.p) < 0) return false;
    if (f.t && c.etiqueta !== f.t) return false;
    return match(c.mostrar + ' ' + c.etiqueta + ' ' + (c.cosmeticos || []).map(cname).join(' '), q);
  });
}
function crRow(c) {
  var e = cEst(c), lim = c.usos_max != null, P = c.cosmeticos || [];
  return '<div class="cr" data-a="codeOpen" data-id="' + esc(c.id) + '" role="link" tabindex="0"><div class="c-co" style="min-width:0"><span class="code">' + esc(c.mostrar) + '</span>' + (c.etiqueta ? ' <span class="chip line" style="margin-left:4px">' + esc(c.etiqueta) + '</span>' : '') + '<small class="mt4">Creado ' + esc(fdt(c.creado, 1)) + '</small></div>' +
    '<div class="c-pr row nw" style="min-width:0">' + thumbs(P, 3) + '<span class="sm ell">' + esc(P.map(cname).join(' + ')) + '</span></div>' +
    '<div class="c-us"><b>' + nf(c.usos) + (lim ? '<span class="mut" style="font-weight:500"> / ' + nf(c.usos_max) + '</span>' : '') + '</b><small>' + (lim ? 'usos gastados' : 'sin límite de usos') + '</small>' + (lim ? '<div class="bar mt4' + (e === 'agotado' ? ' warn' : '') + '"><i style="width:' + Math.min(100, c.usos * 100 / c.usos_max) + '%"></i></div>' : '') + '</div>' +
    '<div class="c-pl sm">' + nf(c.android) + ' <span class="mut">Android</span><br>' + nf(c.ios) + ' <span class="mut">iOS</span></div>' +
    '<div class="c-ca sm">' + (c.caduca ? '<span title="' + esc(fdt(c.caduca)) + '">' + (new Date(c.caduca) > Date.now() ? 'Caduca ' : 'Caducó ') + relT(c.caduca) + '</span>' : '<span class="mut">Sin caducidad</span>') + '<small>' + (c.ultimo ? 'Último canje ' + relT(c.ultimo) : 'Sin canjes') + '</small></div>' +
    '<div class="c-st">' + estChip(e) + '</div></div>';
}
function vRotativos() {
  var o = rm('codigos'), R = rows('codigos'), f = S.f.cr = S.f.cr || { e: 'todos', q: '', p: '', t: '', lim: 60 };
  var act = R.filter(function (c) { return cEst(c) === 'activo'; }).length, tot = 0, hoyN = 0, hoy = todayS();
  R.forEach(function (c) { tot += c.usos || 0; if (c.ultimo && ymd(new Date(c.ultimo)) === hoy) hoyN++; });
  var h = pageHead('Códigos rotativos', 'Códigos que creas aquí y funcionan al instante en la app, sin actualizarla. Puedes limitar usos, ponerles fecha de fin y apagarlos.',
    '<button class="btn" data-a="crExport"' + (R.length ? '' : ' disabled') + '>' + ic('down') + 'CSV</button><button class="btn pri" data-a="genOpen">' + ic('plus') + 'Crear códigos</button>',
    ['Cada código da <b>todos</b> los premios que elijas.']);
  h += rerr(o, 'los códigos');
  h += '<div class="kpis mb16">' + kpi('zap', 'Activos', nf(act), 'listos para canjearse') + kpi('trophy', 'Canjes totales', nf(tot), 'de todos los rotativos') + kpi('clock', 'Con canje hoy', nf(hoyN), 'códigos usados hoy') + kpi('ticket', 'Creados', nf(R.length), 'en total') + '</div>';
  var pr = [], et = [];
  R.forEach(function (c) { (c.cosmeticos || []).forEach(function (x) { if (pr.indexOf(x) < 0) pr.push(x); }); if (c.etiqueta && et.indexOf(c.etiqueta) < 0) et.push(c.etiqueta); });
  pr.sort(function (a, b) { return cname(a) < cname(b) ? -1 : 1; }); et.sort();
  var cnt = function (k) { return k === 'todos' ? R.length : R.filter(function (c) { return cEst(c) === k; }).length; };
  h += '<div class="col gap12 mb16">' + fchips('crE', f.e, CEST_L.map(function (x) { return [x[0], x[1], cnt(x[0])]; })) +
    '<div class="row">' + searchBox('cr_q', f.q, 'Buscar código, etiqueta o premio…', 'crQ') + '<select class="sel" style="flex:0 1 220px" data-c="crP" aria-label="Premio">' + opts([['', 'Cualquier premio']].concat(pr.map(function (x) { return [x, cname(x)]; })), f.p) + '</select><select class="sel" style="flex:0 1 200px" data-c="crT" aria-label="Etiqueta">' + opts([['', 'Cualquier etiqueta']].concat(et.map(function (x) { return [x, x]; })), f.t) + '</select></div></div>';
  var L = cFilt();
  if (o.rows == null && !o.err) h += skel(4);
  else if (!L.length) h += '<div class="card">' + emptyBox('zap', R.length ? 'Ningún código con esos filtros' : 'Todavía no hay códigos', R.length ? 'Ningún código cumple los filtros de arriba. Quita alguno (o escribe otra búsqueda) para ver más.' : 'Todavía no creaste ningún código rotativo. Crea el primero: elige premios, cuántos usos tiene y hasta cuándo sirve.', R.length ? '' : '<button class="btn pri" data-a="genOpen">' + ic('plus') + 'Crear códigos</button>') + '</div>';
  else h += '<div class="list"><div class="cr hd"><span>Código</span><span>Premios</span><span>Usos</span><span class="c-pl">Plataformas</span><span>Caducidad</span><span>Estado</span></div>' + L.slice(0, f.lim).map(crRow).join('') + '</div>' + (L.length > f.lim ? '<div class="row mt12"><button class="btn" data-a="crMore">Ver ' + Math.min(60, L.length - f.lim) + ' más (quedan ' + (L.length - f.lim) + ')</button></div>' : '<p class="xs mut mt8">' + plural(L.length, 'código') + '</p>');
  return h;
}
A.crE = function (el) { S.f.cr.e = el.dataset.v; S.f.cr.lim = 60; paintPage(); };
I.crQ = debounce(function (el) { S.f.cr.q = el.value; paintPage(); }, 120);
C.crP = function (el) { S.f.cr.p = el.value; paintPage(); };
C.crT = function (el) { S.f.cr.t = el.value; paintPage(); };
A.crMore = function () { S.f.cr.lim += 60; paintPage(); };
A.crExport = function () {
  var L = cFilt();
  download('codigos-blokku-' + todayS() + '.csv', csv([['codigo', 'estado', 'premios', 'ids', 'usos', 'usos_max', 'android', 'ios', 'caduca', 'ultimo_canje', 'etiqueta', 'creado']].concat(L.map(function (c) { return [c.mostrar, EST_L[cEst(c)], (c.cosmeticos || []).map(cname).join(' + '), (c.cosmeticos || []).join(' '), c.usos, c.usos_max == null ? '' : c.usos_max, c.android || 0, c.ios || 0, c.caduca || '', c.ultimo || '', c.etiqueta, c.creado]; }))), 'text/csv;charset=utf-8');
  toast(plural(L.length, 'código') + ' exportados');
};
A.codeOpen = function (el) { codeDrawer(el.dataset.id); };
OPENERS.code = function (id) { var g = function () { codeDrawer(id); }; if (RM.codigos && RM.codigos.rows) g(); else rload('codigos').then(g); };
function codeDrawer(id) {
  if (!rows('codigos').some(function (x) { return x.id === id; })) return;
  formDrawer({
    title: function () { var c = rows('codigos').find(function (x) { return x.id === id; }); return c ? '<span class="mono">' + esc(c.mostrar) + '</span>' : 'Código'; },
    sub: function () { var c = rows('codigos').find(function (x) { return x.id === id; }); return c ? EST_L[cEst(c)] + ' · creado ' + fdt(c.creado) : ''; },
    body: function () {
      var c = rows('codigos').find(function (x) { return x.id === id; }); if (!c) return emptyBox('ticket', 'Este código ya no existe', '');
      var lim = c.usos_max != null, e = cEst(c), av = rows('avisos').filter(function (a) { return a.accion === 'canjear' && String(a.destino).toUpperCase().replace(/[^A-Z0-9]/g, '') === c.mostrar.toUpperCase().replace(/[^A-Z0-9]/g, ''); });
      var h = '<div class="row"><span class="code big">' + esc(c.mostrar) + '</span><button class="btn sm" data-a="copy" data-t="' + esc(c.mostrar) + '">' + ic('copy') + 'Copiar</button></div>';
      h += '<div class="kpis mt16" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="kpi"><div class="kl">Usos</div><div class="kn">' + nf(c.usos) + (lim ? '<small>de ' + nf(c.usos_max) + '</small>' : '') + '</div>' + (lim ? '<div class="bar mt8"><i style="width:' + Math.min(100, c.usos * 100 / c.usos_max) + '%"></i></div>' : '<div class="ks">sin límite</div>') + '</div><div class="kpi"><div class="kl">Android</div><div class="kn">' + nf(c.android) + '</div></div><div class="kpi"><div class="kl">iOS</div><div class="kn">' + nf(c.ios) + '</div></div></div>';
      h += '<div class="dsec"><h4>Premios que da</h4><div class="row">' + (c.cosmeticos || []).map(function (x) { return '<button class="pkc" data-a="premOpenCid" data-c="' + esc(x) + '" style="padding-right:10px">' + cthumb(x) + esc(cname(x)) + '</button>'; }).join('') + '</div></div>';
      h += '<div class="dsec"><h4>Datos</h4><dl class="dkv"><dt>Estado</dt><dd>' + estChip(e) + '</dd><dt>Último canje</dt><dd>' + (c.ultimo ? fdt(c.ultimo) + ' (' + relT(c.ultimo) + ')' : 'Nadie lo ha canjeado') + '</dd><dt>Avisos que lo usan</dt><dd>' + (av.length ? av.map(function (a) { return '<a href="#/vivo/avisos?open=av:' + esc(a.id) + '">' + esc(ml(a.titulo) || 'aviso') + '</a> (' + EST_L[avEst(a)].toLowerCase() + ')'; }).join(', ') : 'Ninguno') + '</dd></dl></div>';
      h += '<div class="dsec"><h4>Cambiar</h4>' + field('cd_um', 'Usos máximos', inp('cd_um', c.usos_max == null ? '' : c.usos_max, { type: 'number', min: 1, ph: 'Vacío = sin límite', mode: 'numeric' }), 'Cuántas veces en total se puede canjear. Ya se ha usado ' + plural(c.usos, 'vez', 'veces') + '. Si pones un número menor o igual a eso, el código queda «Agotado». Vacío quita el límite.') +
        field('cd_ca', 'Caducidad', inp('cd_ca', toLocalInput(c.caduca), { type: 'datetime-local' }), 'Hora de México. Después de esta hora la app responde «caducado». Vacío = nunca caduca.') + field('cd_et', 'Etiqueta', inp('cd_et', c.etiqueta, { max: 60, ph: 'Para ubicarlo, ej. giveaway-tiktok' }), 'Solo para ti: sirve para filtrar la lista. Los jugadores no la ven.') +
        '<button class="btn pri" data-a="codeSave" data-id="' + esc(c.id) + '">' + ic('check') + 'Guardar cambios</button></div>';
      return h;
    },
    foot: function () {
      var c = rows('codigos').find(function (x) { return x.id === id; }); if (!c) return '';
      return (c.usos === 0 ? '<button class="btn ghost dng" data-a="codeDel" data-id="' + esc(c.id) + '">' + ic('trash') + 'Borrar</button>' : '') + '<span class="sp"></span><button class="btn ' + (c.activo ? 'dng' : 'pri') + '" data-a="codeTog" data-id="' + esc(c.id) + '">' + ic(c.activo ? 'pause' : 'play') + (c.activo ? 'Apagar código' : 'Encender código') + '</button>';
    }
  });
}
A.codeSave = async function (el) {
  var c = rows('codigos').find(function (x) { return x.id === el.dataset.id; }); if (!c) return;
  var um = drawerVal('cd_um').trim(), ca = drawerVal('cd_ca'), e = {};
  if (um !== '' && !(Math.floor(Number(um)) >= 1)) e.cd_um = 'Un número de 1 en adelante, o vacío';
  if (ca && !fromLocalInput(ca)) e.cd_ca = 'Fecha no válida';
  if (!showErrs(e)) return;
  var nUm = um === '' ? null : Math.floor(Number(um)), nCa = fromLocalInput(ca), cambios = [];
  if (nUm !== (c.usos_max == null ? null : c.usos_max)) cambios.push(['Usos máximos', (c.usos_max == null ? 'sin límite' : nf(c.usos_max)) + ' → <b>' + (nUm == null ? 'sin límite' : nf(nUm)) + '</b>' + (nUm != null && nUm <= (c.usos || 0) ? ' (ya se usó ' + plural(c.usos, 'vez', 'veces') + ': el código quedará <b>Agotado</b>)' : '')]);
  if ((nCa ? new Date(nCa).getTime() : null) !== (c.caduca ? new Date(c.caduca).getTime() : null)) cambios.push(['Caducidad', (c.caduca ? esc(fdt(c.caduca)) : 'nunca') + ' → <b>' + (nCa ? esc(fdt(nCa)) : 'nunca') + '</b> (hora de México)' + (nCa && new Date(nCa) <= new Date() ? ' (esa hora ya pasó: el código quedará <b>Vencido</b>)' : '')]);
  if (cambios.length && !await confirmDlg({ title: '¿Guardar estos cambios en ' + c.mostrar + '?', text: 'Aplican al instante para cualquiera que lo intente canjear.', html: cbox(cambios), ok: 'Sí, guardar', icon: 'ticket' })) return;
  busy(el, true);
  try {
    await rpc('admin_editar_codigo', { p_id: c.id, p_cambios: { usos_max: um === '' ? null : Math.floor(Number(um)), caduca: fromLocalInput(ca), etiqueta: drawerVal('cd_et').trim() } });
    toast('Código actualizado'); LAY.dr && LAY.dr.spec.markClean && LAY.dr.spec.markClean(); await rload('codigos'); drawerRefresh();
  } catch (er) { busy(el, false); toast(er.message, 'bad'); }
};
A.codeTog = async function (el) {
  var c = rows('codigos').find(function (x) { return x.id === el.dataset.id; }); if (!c) return;
  if (c.activo && !await confirmDlg({ title: '¿Desactivar ' + c.mostrar + '?', text: 'Deja de funcionar al instante. Quien ya lo canjeó conserva su premio. Lo puedes volver a activar.', ok: 'Desactivar', danger: true, icon: 'pause' })) return;
  if (!c.activo && !await confirmDlg({ title: '¿Volver a encender ' + c.mostrar + '?', text: 'Vuelve a funcionar al instante, siempre que no esté agotado ni vencido. Cualquiera que lo tenga podrá canjearlo.', ok: 'Sí, encender', icon: 'play' })) return;
  try { await rpc('admin_editar_codigo', { p_id: c.id, p_cambios: { activo: !c.activo } }); toast(c.activo ? 'Código desactivado' : 'Código activado'); await rload('codigos'); drawerRefresh(); } catch (er) { toast(er.message, 'bad'); }
};
A.codeDel = async function (el) {
  var c = rows('codigos').find(function (x) { return x.id === el.dataset.id; }); if (!c) return;
  if (!await confirmDlg({ title: '¿Borrar ' + c.mostrar + '?', text: 'Nadie lo ha usado, así que se puede borrar para siempre.', ok: 'Borrar', danger: true })) return;
  try { await rpc('admin_borrar_codigo', { p_id: c.id }); toast('Código borrado'); drawerKill(); rload('codigos'); } catch (er) { toast(er.message, 'bad'); rload('codigos'); }
};

/* generador */
A.genOpen = function () { genForm(); };
function genForm() {
  var out = null;
  formDrawer({
    title: 'Crear códigos', sub: 'Funcionan al instante en cuanto los creas. Cada código da todos los premios que elijas.',
    body: function () {
      if (out) return '<div class="ban info" style="margin-top:0">' + ic('check') + '<div class="tx"><b>' + (out.length === 1 ? 'Código creado' : nf(out.length) + ' códigos creados') + '</b>Ya funcionan en la app. Cópialos o descárgalos ahora: después los encuentras en la lista de Rotativos.</div></div>' +
        '<div class="row mt16"><button class="btn" data-a="genCopy">' + ic('copy') + 'Copiar todos</button><button class="btn" data-a="genCsv">' + ic('down') + 'Descargar CSV</button></div>' +
        '<div class="row mt16">' + out.slice(0, 200).map(function (c) { return '<span class="code">' + esc(c.mostrar) + '</span>'; }).join('') + '</div>' + (out.length > 200 ? '<p class="xs mut mt8">… y ' + (out.length - 200) + ' más en el CSV.</p>' : '');
      return '<div class="fsec">' + field('gn_pr', 'Premios que da cada código', picker('gen', []), 'Elige uno o varios. Quien canjee el código recibe todos.') + '</div><div class="fsec"><div class="fg">' +
        field('gn_n', 'Cantidad', inp('gn_n', 1, { type: 'number', min: 1, mode: 'numeric', di: 'genN' }), 'Cuántos códigos distintos crear, de 1 a 500. Cada uno tiene su propio texto al azar.') +
        field('gn_u', 'Usos por código', inp('gn_u', 1, { type: 'number', min: 1, mode: 'numeric' }) + '<div class="mt8">' + tog('gn_sl', false, 'Sin límite de usos', { dc: 'genSL' }) + '</div>', 'Cuántas veces se puede canjear cada código. 1 = de un solo uso; 100 = hasta 100 canjes.') + '</div>' +
        field('gn_ca', 'Caducidad', inp('gn_ca', '', { type: 'datetime-local' }), 'Hora de México. Después de esta hora el código ya no sirve. Vacío = no caduca.') + presetBtns(',gn_ca', [[864e5, 'Mañana'], [7 * 864e5, '1 semana'], [30 * 864e5, '1 mes']]) +
        '<div class="mt16"></div>' + field('gn_et', 'Etiqueta', inp('gn_et', '', { max: 60, ph: 'Ej. giveaway-tiktok' }), 'Te ayuda a encontrarlos y filtrarlos después.') +
        field('gn_tx', 'Texto propio', inp('gn_tx', '', { max: 20, ph: 'Ej. BLOKKU-OCTUBRE' }), 'Solo cuando creas 1 código. 4 a 20 letras o números, sin acentos. Vacío = el sistema inventa uno (BK-XXXX-XXXX-XXXX).') + '</div>';
    },
    foot: function () { return out ? '<button class="btn" data-a="genAgain">' + ic('plus') + 'Crear más</button><span class="sp"></span><button class="btn pri" data-a="drClose">Listo</button>' : '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="genGo">' + ic('zap') + 'Crear</button>'; },
    onMount: function () { if (!out) genSync(); }
  });
  A.genGo = async function (el) {
    var sel2 = pkSel('gen'), n = Math.floor(Number(drawerVal('gn_n'))), sl = drawerVal('gn_sl'), u = Math.floor(Number(drawerVal('gn_u'))), ca = drawerVal('gn_ca'), tx = drawerVal('gn_tx').trim(), e = {};
    if (!sel2.length) e.gn_pr = 'Elige al menos un premio';
    if (!(n >= 1 && n <= 500)) e.gn_n = 'De 1 a 500';
    if (!sl && !(u >= 1)) e.gn_u = 'Un número de 1 en adelante, o «Sin límite»';
    if (ca && (!fromLocalInput(ca) || new Date(fromLocalInput(ca)) <= new Date())) e.gn_ca = 'Elige una fecha futura';
    if (tx && n === 1 && !/^[A-Za-z0-9 -]{4,24}$/.test(tx)) e.gn_tx = '4 a 20 letras o números';
    if (!showErrs(e)) return;
    if (!await confirmDlg({ title: n === 1 ? '¿Crear este código?' : '¿Crear ' + nf(n) + ' códigos?', text: 'Quedan activos al instante.', html: cbox([['Premios', esc(sel2.map(cname).join(' + '))], ['Usos por código', sl ? 'sin límite' : nf(u)], ['Caducidad', ca ? esc(fdt(fromLocalInput(ca))) + ' (hora de México)' : 'nunca caduca'], ['A quién', 'Cualquiera que tenga el código y la app 1.0.5 o más nueva podrá canjearlo.']]), ok: 'Sí, crear', icon: 'ticket' })) return;
    busy(el, true, 'Creando…');
    try {
      out = await rpc('admin_crear_codigos', { p_cosmeticos: sel2, p_cantidad: n, p_usos_max: sl ? null : u, p_caduca: fromLocalInput(ca), p_etiqueta: drawerVal('gn_et').trim(), p_texto: n === 1 && tx ? tx : null }, { timeout: 60000 }) || [];
      toast(out.length === 1 ? 'Código creado' : out.length + ' códigos creados'); LAY.dr.spec.dirty = function () { return false; }; drawerRefresh(); rload('codigos');
    } catch (er) { busy(el, false); toast(er.message, 'bad'); }
  };
  A.genCopy = function () { copyTxt(out.map(function (c) { return c.mostrar; }).join('\n'), 'Copiados ' + out.length); };
  A.genCsv = function () { download('codigos-nuevos-' + todayS() + '.csv', csv([['codigo', 'premios', 'usos_max', 'caduca', 'etiqueta']].concat(out.map(function (c) { return [c.mostrar, (c.cosmeticos || []).map(cname).join(' + '), c.usos_max == null ? '' : c.usos_max, c.caduca || '', c.etiqueta]; }))), 'text/csv;charset=utf-8'); };
  A.genAgain = function () { drawerKill(true); genForm(); };
}
function genSync() { var n = Number(drawerVal('gn_n')), t = $('#gn_tx'); if (t) { t.disabled = n !== 1; if (n !== 1) t.value = ''; } var u = $('#gn_u'); if (u) u.disabled = !!drawerVal('gn_sl'); }
I.genN = genSync; C.genSL = genSync;

/* ---------- ÚNICOS FIJOS ---------- */
var CST = [['disponible', 'Disponible'], ['publicado', 'Publicado'], ['regalado', 'Regalado']];
function cst(h) { var n = note(h); return n && n.e || 'disponible'; }
function ucRow(c) {
  if (c.e === 'revocado') return '<div class="uc"><span class="code">••••-••••-' + esc(c.c.slice(-4)) + '</span>' + chipN('Revocado desde 1.0.6', 'warn') + '<span class="xs mut">Ya no se acepta; quien lo canjeó conserva todo.</span><span class="xs ' + (cjCount(c.a) ? 'b' : 'mut') + ' nowrap">' + (cjCount(c.a) ? plural(cjCount(c.a), 'canje') : 'sin canjes') + '</span></div>';
  var h = c.h, show = !!S.reveal[h], e = cst(h), n = note(h), cj = cjCount(c.a);
  return '<div class="uc"><span class="code">' + (show ? esc(c.c) : '••••-••••-••••') + '</span><div class="mini"><button class="btn xs ic" data-a="ucRev" data-h="' + h + '" aria-label="' + (show ? 'Ocultar' : 'Ver') + '" title="' + (show ? 'Ocultar' : 'Ver') + '">' + ic(show ? 'eyeoff' : 'eye') + '</button><button class="btn xs ic" data-a="ucCopy" data-h="' + h + '" aria-label="Copiar" title="Copiar">' + ic('copy') + '</button></div>' +
    '<div class="c-st">' + seg('ucSt" data-h="' + h, e, CST) + '</div><input class="in sm c-nt" id="ucn_' + h.slice(0, 16) + '" data-c="ucNote" data-h="' + h + '" value="' + esc(n && n.n || '') + '" placeholder="Nota: ¿a quién o dónde se lo diste?" aria-label="Nota (solo para ti)">' +
    '<span class="xs ' + (cj ? 'b' : 'mut') + ' nowrap">' + (cj ? plural(cj, 'canje') : 'sin canjes') + '</span></div>';
}
function cjCount(a) { var n = 0; rows('canjes').forEach(function (r) { if (r.h === a) n += Number(r.n) || 0; }); return n; }
function vUnicos() {
  rm('canjes');
  var all = typeof CODES !== 'undefined' ? CODES : [], f = S.f.uc = S.f.uc || { e: 'todos', r: '' };
  if (S.f.uq != null) { f.q = S.f.uq; S.f.uq = null; }
  if (!all.length) return pageHead('Códigos únicos fijos', 'Códigos de un solo uso que vienen dentro de la app.') + '<div class="card">' + emptyBox('key', 'No hay códigos en este panel', 'El archivo privado de códigos no estaba cuando se armó el panel, así que esta lista sale vacía. Pídele a Claude que vuelva a compilar el panel con el archivo codigos-canje.csv.') + '</div>';
  var mas = all.filter(function (c) { return c.i === '*'; }), ind = all.filter(function (c) { return c.i !== '*'; });
  var disp = ind.filter(function (c) { return cst(c.h) === 'disponible'; }).length, pub = ind.filter(function (c) { return cst(c.h) === 'publicado'; }).length, reg = ind.filter(function (c) { return cst(c.h) === 'regalado'; }).length;
  var h = pageHead('Códigos únicos fijos', 'Los ' + ind.length + ' códigos que vienen dentro de la app (5 por premio). Lleva el control de cuáles ya diste y a quién.', '',
    ['Cada código desbloquea <b>un</b> premio y vive dentro de la app, así que funciona sin internet.', 'Marca cada uno como <b>Disponible</b>, <b>Publicado</b> (lo pusiste en redes) o <b>Regalado</b> (se lo diste a alguien), y anota a quién.', 'Los códigos solo existen dentro de este panel cifrado: nunca se guardan en Supabase; ahí solo va el estado y tu nota.', 'Los <b>canjes</b> los cuenta Supabase desde la 1.0.5 (anónimos).']);
  h += '<div class="rule">' + ic('info') + '<div>Marcar «Disponible», «Publicado» o «Regalado» y escribir notas es <b>solo tu control</b>: no cambia nada para los jugadores. Para dejar de aceptar un código, usa «Revocados».</div></div>';
  h += '<div class="kpis mb16">' + kpi('key', 'Disponibles', nf(disp), 'de ' + nf(ind.length)) + kpi('mega', 'Publicados', nf(pub), 'en redes o en público') + kpi('gift', 'Regalados', nf(reg), 'a alguien en concreto') + kpi('trophy', 'Canjeados', nf(ind.reduce(function (a, c) { return a + (cjCount(c.a) ? 1 : 0); }, 0)), 'códigos con al menos un canje') + '</div>';
  if (mas.length) h += '<div class="card mb16" style="border-color:var(--warn-line)"><div class="ch">' + ic('warn') + '<h3>Códigos maestros</h3><span class="sub">Desbloquea TODOS los cosméticos (menos los del staff). No lo publiques ni lo regales a la ligera.</span></div><div class="ub" style="padding-top:12px">' + mas.map(ucRow).join('') + '</div></div>';
  h += '<div class="col gap12 mb16">' + fchips('ucE', f.e, [['todos', 'Todos'], ['disponible', 'Con códigos disponibles'], ['publicado', 'Con códigos publicados'], ['regalado', 'Con códigos regalados']]) + '<div class="row">' + searchBox('uc_q', f.q, 'Buscar premio…', 'ucQ') + '<select class="sel" style="flex:0 1 200px" data-c="ucR" aria-label="Rareza">' + opts([['', 'Todas las rarezas']].concat(RAR.map(function (r) { return [r, r]; })), f.r) + '</select></div></div>';
  var g = {}, ord = [];
  ind.forEach(function (c) { if (!g[c.i]) { g[c.i] = { n: c.n, r: c.r, l: [] }; ord.push(c.i); } g[c.i].l.push(c); });
  var rowsH = '';
  ord.forEach(function (cid) {
    var o = g[cid]; if (!match(o.n + ' ' + cid, f.q)) return; if (f.r && o.r !== f.r) return;
    if (f.e !== 'todos' && !o.l.some(function (c) { return cst(c.h) === f.e; })) return;
    var d = o.l.filter(function (c) { return cst(c.h) === 'disponible'; }).length, cj = o.l.reduce(function (a, c) { return a + cjCount(c.a); }, 0), op = S.open['u_' + cid] || (f.q && f.q.length > 2);
    rowsH += '<div class="ug' + (op ? ' open' : '') + '"><button class="ugh" data-a="ucGrp" data-c="' + esc(cid) + '" aria-expanded="' + !!op + '">' + cthumb(cid, 'sm') + '<span class="grow"><b style="display:block;font-size:14.5px">' + esc(o.n) + '</b><span class="xs mut">' + d + ' de ' + o.l.length + ' disponibles' + (cj ? ' · ' + plural(cj, 'canje') : '') + '</span></span>' + rr(o.r) + '<span class="hide-sm" style="width:80px"><span class="bar"><i style="width:' + Math.round(d * 100 / o.l.length) + '%"></i></span></span>' + ic('chr', 'chev') + '</button>' +
      (op ? '<div class="ub">' + o.l.map(ucRow).join('') + '</div>' : '') + '</div>';
  });
  h += '<div class="list">' + (rowsH || emptyBox('search', 'Ningún premio con ese filtro', 'Prueba con otra palabra o toca «Todos».')) + '</div>';
  return h;
}
A.ucGrp = function (el) { var k = 'u_' + el.dataset.c; S.open[k] = !S.open[k]; paintPage(); };
A.ucRev = function (el) { S.reveal[el.dataset.h] = !S.reveal[el.dataset.h]; paintPage(); };
A.ucCopy = function (el) { var c = CODES.find(function (x) { return x.h === el.dataset.h; }); if (c) copyTxt(c.c, 'Código copiado'); };
A.ucSt = function (el) { var h = el.closest('[data-h]').dataset.h; setNote(h, { e: el.dataset.v }); paintPage(); };
C.ucNote = function (el) { setNote(el.dataset.h, { n: el.value.trim() }); toast('Nota guardada'); };
A.ucE = function (el) { S.f.uc.e = el.dataset.v; paintPage(); };
I.ucQ = debounce(function (el) { S.f.uc.q = el.value; paintPage(); }, 120);
C.ucR = function (el) { S.f.uc.r = el.value; paintPage(); };

/* ---------- STICKERS ---------- */
function v1count(code) { var n = 0, hs = Object.keys(V1H).filter(function (h) { return V1H[h] === code; }); rows('canjes').forEach(function (r) { if (hs.indexOf(r.h) >= 0) n += Number(r.n) || 0; }); return n; }
function vStickers() {
  rm('canjes');
  var L = items('cupones');
  var h = pageHead('Stickers', 'Los códigos impresos en los stickers. Son permanentes y cualquiera puede usarlos las veces que quiera.', '<button class="btn pri" data-a="cupNew">' + ic('plus') + 'Agregar sticker</button>',
    ['Estos códigos viven dentro de la app (desde la 1.0.4) y no caducan.', 'Los <b>canjes</b> se cuentan desde la 1.0.5.', 'Puedes subir fotos de cada sticker y anotar dónde los repartiste.']);
  if (!L.length) return h + '<div class="card">' + emptyBox('sticker', 'Sin stickers en la lista', 'Agrega aquí los stickers que imprimas para llevar la cuenta de qué da cada uno y dónde los repartiste. Ojo: agregar uno aquí no crea el código en la app.', '') + '</div>';
  h += '<div class="grid g2">' + L.map(function (c) {
    var ps = (c.premios || []).map(prem).filter(Boolean), n = v1count(c.codigo);
    return '<div class="card pad"><div class="row nw" style="align-items:flex-start"><div class="grow"><div class="row"><span class="code big">' + esc(c.codigo) + '</span><button class="btn sm ic" data-a="copy" data-t="' + esc(c.codigo) + '" aria-label="Copiar">' + ic('copy') + '</button></div><p class="mt8 b">' + esc(c.da) + '</p><p class="sm mut">' + esc([c.tipo, c.vigencia, c.donde].filter(Boolean).join(' · ')) + '</p></div><div style="text-align:right"><div style="font-size:26px;font-weight:800">' + nf(n) + '</div><div class="xs mut">canjes</div></div></div>' +
      '<div class="row mt12">' + ps.map(function (p) { return '<button class="pkc" data-a="premOpen" data-id="' + esc(p.id) + '" style="padding-right:10px">' + thumb(p) + esc(p.nombre) + '</button>'; }).join('') + '</div>' +
      (c.notas ? '<p class="sm mt12">' + esc(c.notas) + '</p>' : '') + '<div class="uimgs mt12">' + uimgs('cupones', c) + '</div>' +
      '<div class="row mt12"><button class="btn sm" data-a="cupEdit" data-id="' + esc(c.id) + '">' + ic('edit') + 'Editar</button></div></div>';
  }).join('') + '</div>';
  return h;
}
function uimgs(n, it, noAdd) {
  return (it.imgs || []).map(function (r, i) { var u = imgSrc(r); return '<div class="uimg">' + (u ? '<img alt="" src="' + esc(u) + '" data-a="lb" data-src="' + esc(u) + '">' : '<div class="sk" style="width:100%;height:100%"></div>') + (S.ro ? '' : '<button data-a="rmimg" data-n="' + n + '" data-id="' + esc(it.id) + '" data-i="' + i + '" aria-label="Quitar imagen">' + ic('x') + '</button>') + '</div>'; }).join('') +
    (noAdd || S.ro ? '' : '<button class="uadd" data-a="addimg" data-n="' + n + '" data-id="' + esc(it.id) + '">' + ic('image') + 'Agregar</button>');
}
A.cupNew = function () { cupForm(null); };
A.cupEdit = function (el) { cupForm(item('cupones', el.dataset.id)); };
function cupForm(c) {
  var isNew = !c, v = c || { id: uid('c'), codigo: '', da: '', premios: [], tipo: 'permanente', vigencia: 'Sin caducidad', donde: 'Stickers', notas: '' };
  formDrawer({
    title: isNew ? 'Agregar sticker' : 'Editar sticker',
    body: function () { return '<div class="rule">' + ic('info') + '<div>Esto es solo tu lista de control. Cambiarla <b>no modifica</b> el código dentro de la app.</div></div>' + field('cu_co', 'Código', inp('cu_co', v.codigo, { max: 40, auto: isNew }), 'Tal como está impreso en el sticker.') + field('cu_da', 'Qué da', inp('cu_da', v.da, { ph: 'Ej. Piezas Dusa' }), 'Descripción corta para ti.') + field('cu_pr', 'Premios', picker('cup', v.premios || [], { by: 'id' })) + '<div class="fg">' + field('cu_ti', 'Tipo', inp('cu_ti', v.tipo), 'Ej. permanente.') + field('cu_vi', 'Vigencia', inp('cu_vi', v.vigencia), 'Ej. Sin caducidad.') + '</div>' + field('cu_do', 'Dónde se reparte', inp('cu_do', v.donde), 'Ej. Stickers en la expo, paquete a creadores…') + field('cu_no', 'Notas', area('cu_no', v.notas)); },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="cupDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="cupSave" data-id="' + esc(v.id) + '" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + 'Guardar</button>'; }
  });
}
A.cupSave = function (el) {
  var co = drawerVal('cu_co').trim(); if (!showErrs(co ? {} : { cu_co: 'Escribe el código' })) return;
  var old = item('cupones', el.dataset.id) || {};
  putItem('cupones', Object.assign({}, old, { id: el.dataset.id, codigo: co, da: drawerVal('cu_da').trim(), premios: pkSel('cup'), tipo: drawerVal('cu_ti').trim(), vigencia: drawerVal('cu_vi').trim(), donde: drawerVal('cu_do').trim(), notas: drawerVal('cu_no').trim() }), !!el.dataset.new);
  drawerKill(); repaint(); toast('Sticker guardado');
};
A.cupDel = async function (el) { if (await confirmDlg({ title: '¿Borrar este sticker del panel?', text: 'Solo se quita de esta lista; el código sigue funcionando en la app.', ok: 'Borrar', danger: true })) { drawerKill(); delItem('cupones', el.dataset.id); } };

/* ---------- CANJES ---------- */
function vCanjes() {
  var o = rm('canjes'); rm('codigos');
  var h = pageHead('Canjes', 'Cuántas veces se canjean los códigos fijos (stickers y únicos) y los rotativos. Anónimo: solo cuenta, plataforma y día.', '<button class="btn" data-a="cjReload">' + ic('refresh') + 'Actualizar</button>',
    ['Los canjes de <b>códigos fijos</b> (stickers, únicos y maestros) los registra la app desde la 1.0.5.', 'Los <b>rotativos</b> se cuentan en Supabase al canjearse.', 'Nada personal: solo qué código, plataforma, versión y fecha.']);
  if (o.err) return h + (o.err.code === 'sin_sql' ? '<div class="card">' + emptyBox('db', 'Falta correr ' + SQLF.canjes, 'Está en Escritorio › Blokku › 02-Documentos › Supabase.') + '</div>' : rerr(o, 'los canjes'));
  if (o.rows == null) return h + '<div class="kpis">' + '<div class="kpi"><div class="sk" style="height:70px"></div></div>'.repeat(4) + '</div>';
  var Ag = cjAgg(), t = dn(todayS()), sum = function (n) { var s = 0; for (var i = 0; i < n; i++) s += Ag.day[iso(t - i)] || 0; return s; };
  var rng = S.f.cjr || 30;
  h += '<div class="kpis">' + kpi('trophy', 'Total de canjes', nf(Ag.tot), 'códigos fijos, desde la 1.0.5') + kpi('clock', 'Hoy', nf(Ag.day[todayS()] || 0), 'ayer ' + nf(Ag.day[iso(t - 1)] || 0)) + kpi('chart', 'Últimos 7 días', nf(sum(7)), '', spark(lastDays(Ag.day, 14).map(function (x) { return x.v; }))) + kpi('cal', 'Últimos 30 días', nf(sum(30)), '') + '</div>';
  if (!Ag.tot) h += '<div class="card mt16">' + emptyBox('chart', 'Todavía nadie ha canjeado un código fijo', 'Cuando alguien canjee un sticker o un código único con la app 1.0.5 o más nueva, aparecerá aquí. Si esperabas canjes, pulsa «Actualizar».') + '</div>';
  else {
    var D = lastDays(Ag.day, rng).map(function (x) { var p = x.d.split('-'); return { label: +p[2] + ' ' + MES[+p[1] - 1].slice(0, 3), v: x.v, hot: x.d === todayS(), tip: fd(x.d) + ': ' + plural(x.v, 'canje') }; });
    h += '<div class="card mt16"><div class="ch">' + ic('chart') + '<h3>Por día</h3><span class="grow"></span>' + seg('cjRng', rng, [[14, '14 días'], [30, '30 días'], [90, '90 días']]) + '</div><div class="cb">' + bars(D, { label: 'Canjes por día', ticks: rng > 30 ? 9 : 8 }) + '</div></div>';
    var fam = [{ v: Ag.fam.sticker, c: '#5b4cf0', l: 'Stickers' }, { v: Ag.fam.unico, c: '#e64aa0', l: 'Únicos' }, { v: Ag.fam.maestro, c: '#d97706', l: 'Maestros' }, { v: Ag.fam['?'], c: '#94a3b8', l: 'Otros' }].filter(function (x) { return x.v; });
    h += '<div class="grid g2 sec"><div class="card"><div class="ch">' + ic('phone') + '<h3>Android vs iOS</h3></div><div class="cb row gap16" style="flex-wrap:nowrap">' + donut([{ v: Ag.plat.android || 0, c: '#16a34a', l: 'Android' }, { v: Ag.plat.ios || 0, c: '#0f172a', l: 'iOS' }]) + '<div class="col"><div class="legend"><span><i style="--gc:#16a34a"></i>Android <b style="color:var(--text)">' + nf(Ag.plat.android || 0) + '</b> (' + pct(Ag.plat.android || 0, Ag.tot) + ')</span></div><div class="legend"><span><i style="--gc:#0f172a"></i>iOS <b style="color:var(--text)">' + nf(Ag.plat.ios || 0) + '</b> (' + pct(Ag.plat.ios || 0, Ag.tot) + ')</span></div></div></div></div>' +
      '<div class="card"><div class="ch">' + ic('ticket') + '<h3>Por tipo de código</h3></div><div class="cb row gap16" style="flex-wrap:nowrap">' + donut(fam) + '<div class="col">' + fam.map(function (x) { return '<div class="legend"><span><i style="--gc:' + x.c + '"></i>' + x.l + ' <b style="color:var(--text)">' + nf(x.v) + '</b></span></div>'; }).join('') + '</div></div></div></div>';
    var hs = Object.keys(Ag.h).sort(function (a, b) { return Ag.h[b] - Ag.h[a]; }).slice(0, 15);
    var cids = Object.keys(Ag.cid).sort(function (a, b) { return Ag.cid[b] - Ag.cid[a]; }).slice(0, 10);
    h += '<div class="grid g2 sec"><div class="card"><div class="ch">' + ic('star') + '<h3>Códigos más canjeados</h3></div><div class="tw"><table class="tbl"><thead><tr><th>Código</th><th>Tipo</th><th class="num">Canjes</th></tr></thead><tbody>' +
      hs.map(function (x) { var w = cjWho(x); return '<tr><td><b>' + esc(w.n) + '</b>' + (w.code && w.k !== 'sticker' ? '<div class="xs mut mono">termina en ' + esc(String(w.code).slice(-4)) + '</div>' : '') + (w.k === 'unico' && note(w.c.h) && note(w.c.h).n ? '<div class="xs mut">' + esc(note(w.c.h).n) + '</div>' : '') + '</td><td>' + chipN({ sticker: 'Sticker', unico: 'Único', maestro: 'Maestro', '?': '—' }[w.k], w.k === 'maestro' ? 'warn' : 'line') + '</td><td class="num"><b>' + nf(Ag.h[x]) + '</b></td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="card"><div class="ch">' + ic('gift') + '<h3>Por premio</h3></div><div class="cb">' + (cids.length ? hbars(cids.map(function (c) { return { l: cthumb(c, 'xs').replace('class="th', 'style="display:inline-grid;vertical-align:middle;margin-right:6px" class="th') + esc(cname(c)), v: Ag.cid[c] }; })) : '<p class="mut">Sin datos todavía.</p>') + '</div></div></div>';
  }
  var R = rows('codigos'), ru = R.reduce(function (a, c) { return a + (c.usos || 0); }, 0);
  if (R.length) {
    var top = R.filter(function (c) { return c.usos; }).sort(function (a, b) { return b.usos - a.usos; }).slice(0, 8);
    h += '<div class="card sec"><div class="ch">' + ic('zap') + '<h3>Rotativos</h3><span class="sub">' + plural(ru, 'canje') + ' · Android ' + nf(R.reduce(function (a, c) { return a + (+c.android || 0); }, 0)) + ' · iOS ' + nf(R.reduce(function (a, c) { return a + (+c.ios || 0); }, 0)) + '</span></div><div class="cb">' +
      (top.length ? hbars(top.map(function (c) { return { l: '<span class="mono">' + esc(c.mostrar) + '</span> <span class="mut">' + esc((c.cosmeticos || []).map(cname).join(' + ')) + '</span>', v: c.usos }; })) : '<p class="mut">Ningún rotativo se ha canjeado todavía.</p>') + '</div></div>';
  }
  return h;
}
A.cjReload = function () { rload('canjes'); rload('codigos'); };
A.cjRng = function (el) { S.f.cjr = Number(el.dataset.v); paintPage(); };

VIEWS['codigos/rotativos'] = vRotativos; VIEWS['codigos/unicos'] = vUnicos; VIEWS['codigos/stickers'] = vStickers; VIEWS['codigos/canjes'] = vCanjes;
