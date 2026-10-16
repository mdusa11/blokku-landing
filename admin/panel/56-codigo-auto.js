/* ================= códigos automáticos de los avisos =================
   Un botón «Canjear código» puede llevar codigo_auto {premios, usos, texto}: el panel crea el código
   (caduca = fin del aviso) y lo vuelve a crear o extender si al encender o mover fechas ya no sirve. */
var CA_USOS = 100;
function caNorm(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function caFind(m) { var n = caNorm(m); return n ? rows('codigos').find(function (c) { return caNorm(c.mostrar) === n; }) || null : null; }
function caGone(c) { return c.usos_max != null && c.usos >= c.usos_max; }
/* null = sirve; si no: inactivo | agotado | caducado | corto (caduca antes del fin del aviso) | falta */
function caIssue(c, fin) {
  if (!c) return 'falta';
  if (!c.activo) return 'inactivo';
  if (caGone(c)) return 'agotado';
  if (c.caduca) {
    var k = new Date(c.caduca).getTime(), f = fin ? new Date(fin).getTime() : 0;
    if (k <= Date.now()) return 'caducado';
    if (f && k < f - 1000) return 'corto';
  }
  return null;
}
function caDiff(c, au) {
  var a = (c.cosmeticos || []).slice().sort().join(','), b = (au.premios || []).slice().sort().join(',');
  if (a !== b) return true;
  if ((c.usos_max == null ? null : c.usos_max) !== (au.usos == null ? null : au.usos)) return true;
  return !!au.texto && caNorm(c.mostrar) !== caNorm(au.texto);
}
function caAutoOf(b, c) { return b.codigo_auto || (c ? { premios: (c.cosmeticos || []).slice(), usos: c.usos_max == null ? null : c.usos_max, texto: '' } : null); }
function caFixable(c) { return !!c && !caGone(c); }
function caTitle(o) { return ml(o.titulo) || (ml(o.texto) ? ml(o.texto).slice(0, 40) : '¡Salió un código!'); }
function caSyncLegacy(o) {
  var m = (o.botones || []).filter(function (b) { return b.accion === 'evento' || b.accion === 'canjear' || b.accion === 'url' || b.accion === 'tienda'; })[0];
  o.accion = m ? m.accion : null; o.destino = m ? m.destino : '';
}
function caBtAuto(b, premios, usos, texto) { b.codigo_auto = { premios: premios.slice(), usos: usos == null ? null : usos, texto: texto || '' }; return b; }

/* texto propio libre: si ya existe (código viejo agotado), PROMO → PROMO2, PROMO3… */
function caFreeText(base) {
  var n = caNorm(base), used = {}; rows('codigos').forEach(function (c) { used[caNorm(c.mostrar)] = 1; });
  if (!used[n]) return base.trim();
  for (var i = 2; i < 100; i++) { var s = String(i), cand = n.slice(0, 20 - s.length) + s; if (!used[cand]) return cand; }
  return base.trim();
}
async function caFresh() {
  var o = RM.codigos; if (o && o.loading) await o.p;
  await rload('codigos', true);
  o = RM.codigos; if (!o || o.err || !Array.isArray(o.rows)) throw new Error('No pude leer tus códigos de Supabase. Reintenta en un momento.');
}
async function caCrear(au, fin, titulo) {
  var r = await rpc('admin_crear_codigos', { p_cosmeticos: au.premios, p_cantidad: 1, p_usos_max: au.usos == null ? null : au.usos, p_caduca: fin, p_etiqueta: 'Aviso: ' + titulo, p_texto: au.texto ? caFreeText(au.texto) : null });
  var c = r && r[0]; if (!c) throw new Error('No se creó el código');
  if (RM.codigos && Array.isArray(RM.codigos.rows)) RM.codigos.rows.unshift(c);
  return c;
}
async function caExtender(c, fin) {
  await rpc('admin_editar_codigo', { p_id: c.id, p_cambios: { caduca: fin, activo: true } });
  c.caduca = fin; c.activo = true;
}

/* qué hay que hacer con un botón: ok · ext (extender) · new (código nuevo) · bad (manual roto) */
function caPlanBtn(b, fin, vig) {
  var c = caFind(b.destino), au = b.codigo_auto, iss = !b.destino ? 'falta' : caIssue(c, fin);
  if (au) {
    if (b.destino && !vig) return { t: 'ok', c: c };
    var dif = !!c && caDiff(c, au);
    if (!iss && !dif) return { t: 'ok', c: c };
    var ext = !!c && !dif && caFixable(c) && (iss === 'corto' || ((iss === 'inactivo' || iss === 'caducado') && !!au.texto));
    return { t: ext ? 'ext' : 'new', issue: dif ? 'config' : iss, c: c };
  }
  if (b.destino && vig && iss && iss !== 'falta') return { t: 'bad', issue: iss, c: c };
  return { t: 'ok', c: c };
}
function caVig(o) { return o.activo !== false && !!o.fin && new Date(o.fin).getTime() > Date.now(); }
function caCanj(o) { return (o.botones || []).map(function (b, k) { return b.accion === 'canjear' ? k : -1; }).filter(function (k) { return k >= 0; }); }

var CA_WHY = {
  inactivo: 'está desactivado', agotado: 'ya se agotó', caducado: 'ya caducó', corto: 'caduca antes de que termine el aviso',
  falta: 'no existe', config: 'ya no coincide con los premios o usos elegidos'
};
function caWhyTxt(c, iss, fin) {
  if (iss === 'agotado') return 'ya se agotó (' + c.usos + ' de ' + c.usos_max + ' usos)';
  if (iss === 'caducado') return 'caducó ' + fdt(c.caduca);
  if (iss === 'corto') return 'caduca ' + fdt(c.caduca) + ', antes de que termine el aviso (' + fdt(fin) + ')';
  return CA_WHY[iss] || iss;
}

/* Revisa el aviso y, si hace falta, lo arregla (códigos automáticos) antes de guardarlo o encenderlo.
   ask(item) decide los códigos manuales rotos: 'ext' | 'new' | 'any' | null (cancelar).
   Devuelve false si se canceló (no se creó nada). Modifica o.botones, o.accion y o.destino. */
async function caGate(o, ask) {
  var ks = caCanj(o); if (!ks.length) return true;
  await caFresh();
  var vig = caVig(o), plan = ks.map(function (k) { var p = caPlanBtn(o.botones[k], o.fin, vig); p.k = k; p.fin = o.fin; return p; });
  for (var i = 0; i < plan.length; i++) {
    var p = plan[i]; if (p.t !== 'bad') continue;
    var d = await ask(p, o.botones[p.k]); if (!d) return false;
    p.t = d === 'ext' && caFixable(p.c) ? 'ext' : d === 'new' ? 'new' : 'ok';
    if (p.t === 'new') o.botones[p.k].codigo_auto = caAutoOf(o.botones[p.k], p.c);
  }
  var changed = false;
  for (var j = 0; j < plan.length; j++) {
    var q = plan[j], b = o.botones[q.k];
    if (q.t === 'new') { var c = await caCrear(b.codigo_auto, o.fin, caTitle(o)); b.destino = c.mostrar; changed = true; toast('Se generó un código nuevo: ' + c.mostrar); }
    else if (q.t === 'ext') { await caExtender(q.c, o.fin); toast('Se extendió el código ' + q.c.mostrar + ' hasta el fin del aviso'); }
  }
  if (changed) caSyncLegacy(o);
  return true;
}

/* ---------- estado del código: chips y arreglos ---------- */
function caChips(c, fin) {
  if (!c) return chipN('Código no encontrado', 'bad');
  var e = cEst(c), h = '';
  if (e === 'activo') h += chipN('vigente', 'ok');
  else if (e === 'agotado') h += chipN('agotado ' + c.usos + '/' + c.usos_max, 'bad');
  else h += chipN(e, e === 'caducado' ? 'bad' : 'warn');
  if (e === 'activo' && c.caduca) h += chipN('caduca ' + relT(c.caduca), caIssue(c, fin) === 'corto' ? 'warn' : 'line');
  if (e === 'activo' && !c.caduca) h += chipN('no caduca', 'line');
  if (e === 'activo' && c.usos_max != null) h += chipN(c.usos + '/' + c.usos_max + ' usos', 'line');
  if (e !== 'agotado' && e !== 'activo' && c.usos_max != null) h += chipN(c.usos + '/' + c.usos_max + ' usos', 'line');
  if (caIssue(c, fin) === 'corto') h += chipN('caduca antes del fin del aviso', 'warn');
  return h;
}
function caFixHtml(c, iss, fin, act, data) {
  var h = '<div class="acts">';
  if (caFixable(c) && iss !== 'falta' && iss !== 'agotado') h += '<button type="button" class="btn sm" data-a="' + act + 'Ext" ' + data + '>' + ic('clock') + 'Extender código hasta el fin del aviso</button>';
  if (c) h += '<button type="button" class="btn sm" data-a="' + act + 'New" ' + data + '>' + ic('refresh') + 'Generar código nuevo</button>';
  return h + '</div>';
}

/* ---------- lista de avisos ---------- */
function caListHtml(a) {
  var bs = avBtns(a).map(function (b, k) { return { b: b, k: k }; }).filter(function (x) { return x.b.accion === 'canjear' && x.b.destino; });
  if (!bs.length) return '';
  var live = avEst(a) === 'activo' || avEst(a) === 'proximo';
  return '<div class="calist">' + bs.map(function (x) {
    var c = caFind(x.b.destino), iss = caIssue(c, a.fin), loaded = RM.codigos && Array.isArray(RM.codigos.rows);
    var head = '<div class="row sm"><span class="mut">Código</span><span class="code">' + esc(x.b.destino) + '</span>' + (x.b.codigo_auto ? chipN('automático', 'ac') : '') + (loaded ? caChips(c, a.fin) : '<span class="chip line">revisando…</span>') + '</div>';
    if (!loaded || !iss || !live) return head;
    return '<div class="ban bad" style="margin-top:0">' + ic('warn') + '<div class="tx"><b>' + (live && avEst(a) === 'activo' ? 'Este aviso se ve en la app, pero ' : 'Este aviso saldrá con un código que no sirve: ') + (iss === 'falta' ? 'el código ya no existe' : 'el código ' + caWhyTxt(c, iss, a.fin)) + '</b>' +
      (x.b.codigo_auto ? 'Se generó con este aviso: puedes crear otro igual en un toque.' : 'Quien toque «Canjear» verá el error «caducado».') +
      caFixHtml(c, iss, a.fin, 'caL', 'data-id="' + esc(a.id) + '" data-k="' + x.k + '"')+ '</div></div>';
  }).join('') + '</div>';
}
function caAvOf(el) { var a = rows('avisos').find(function (x) { return x.id === el.dataset.id; }); return a ? { a: a, k: Number(el.dataset.k) } : null; }
A.caLExt = async function (el) {
  var r = caAvOf(el); if (!r) return; var b = avBtns(r.a)[r.k], c = caFind(b.destino); if (!c) return;
  busy(el, true, 'Extendiendo…');
  try { await caExtender(c, r.a.fin); toast('Código extendido hasta ' + fdt(r.a.fin)); rload('codigos'); rload('config'); paintPage(); } catch (e) { busy(el, false); toast(e.message, 'bad'); }
};
A.caLNew = async function (el) {
  var r = caAvOf(el); if (!r) return; var o = clone(r.a); o.botones = avBtns(o); var b = o.botones[r.k], c = caFind(b.destino), au = caAutoOf(b, c);
  if (!au || !au.premios.length) { toast('No sé qué premios dar: edita el aviso y elige el código', 'bad'); return; }
  busy(el, true, 'Generando…');
  try {
    var n = await caCrear(au, o.fin, caTitle(o)); b.destino = n.mostrar; b.codigo_auto = au; caSyncLegacy(o);
    delete o.vistos; delete o.clics; delete o.actualizado; await rpc('admin_guardar_aviso', { p_aviso: o });
    toast('Se generó un código nuevo: ' + n.mostrar); rload('avisos'); rload('codigos'); rload('config');
  } catch (e) { busy(el, false); toast(e.message, 'bad'); rload('codigos'); }
};
/* encender desde la lista: pregunta qué hacer con un código manual roto */
function caAskList(p, b) {
  var c = p.c, can = caFixable(c) && p.issue !== 'agotado';
  return modal('<div class="mb"><div class="mi bad">' + ic('warn') + '</div><h3>El código de este aviso no sirve</h3><p>' + esc(c.mostrar) + ' ' + esc(caWhyTxt(c, p.issue, p.fin)) + '. Si lo enciendes así, quien toque «Canjear» verá un error.</p>' +
    '<div style="display:flex;flex-direction:column;gap:8px;margin-top:18px">' + '<button class="btn pri" data-m="new" style="justify-content:center">Generar código nuevo y encender</button>' +
    (can ? '<button class="btn" data-m="ext" style="justify-content:center">Extender código y encender</button>' : '') +
    '<button class="btn dng" data-m="any" style="justify-content:center">Encender de todos modos</button><button class="btn ghost" data-m="no" style="justify-content:center">Cancelar</button></div></div>');
}

/* ---------- editor: botón «Canjear código» ---------- */
function caModo(b) { return b.modo || (b.codigo_auto ? 'auto' : b.destino ? 'existente' : 'auto'); }
function caBtnHtml(i, b) {
  var id = 'av_b' + i, modo = caModo(b), au = b.codigo_auto || { premios: [], usos: CA_USOS, texto: '' }, val = b.destino || '';
  var h = field(id + '_m', 'Código', '<span class="segr col" role="radiogroup" aria-label="De dónde sale el código del botón ' + (i + 1) + '">' +
    '<label><input type="radio" name="' + id + '_m" value="auto" data-c="avBtnRe"' + (modo === 'auto' ? ' checked' : '') + '><span>Generar código automáticamente</span></label>' +
    '<label><input type="radio" name="' + id + '_m" value="existente" data-c="avBtnRe"' + (modo === 'existente' ? ' checked' : '') + '><span>Usar un código existente</span></label></span>');
  if (modo === 'auto') {
    h += '<input type="hidden" id="' + id + '_d" value="' + esc(val) + '"' + (b.codigo_auto ? ' data-own="1"' : '') + '>' +
      field(id + '_cp', 'Premios que da el código', picker('cab' + i, au.premios, { onChange: caChanged }), 'Puedes elegir varios. El código da todos.') +
      '<div class="fg">' + field(id + '_u', 'Usos', inp(id + '_u', au.usos == null ? CA_USOS : au.usos, { type: 'number', min: 1, mode: 'numeric', di: 'avPrev' }) + '<div class="mt8">' + tog(id + '_sl', au.usos == null && !!b.codigo_auto, 'Sin límite', { dc: 'avPrevC' }) + '</div>', 'Cuántas personas pueden canjearlo.') +
      field(id + '_x', 'Texto propio (opcional)', inp(id + '_x', au.texto || '', { ph: 'Ej. BLOKKU-OCT · vacío = al azar', max: 20, di: 'avPrev' }), '4 a 20 letras o números.') + '</div>' +
      '<div class="xs mut" style="margin:-2px 0 6px">Al guardar, el panel crea el código y lo hace caducar cuando termina el aviso. Si lo vuelves a encender o mueves las fechas y ya no sirve, genera otro solo.</div>' +
      '<div id="' + id + '_w">' + caWarnHtml(i) + '</div>';
  } else {
    var codes = rows('codigos').filter(function (c) { return cEst(c) === 'activo'; });
    h += field(id + '_d', 'Código que se canjea', inp(id + '_d', val, { ph: 'Ej. BK-ABCD-EFGH-JKLM', di: 'avPrev', max: 40 }) + (codes.length ? '<div class="presets">' + codes.slice(0, 6).map(function (c) { return '<button type="button" class="btn xs" data-a="avPick" data-t="' + id + '_d" data-v="' + esc(c.mostrar) + '"><span class="mono">' + esc(c.mostrar) + '</span></button>'; }).join('') + '</div>' : ''), 'Escríbelo o toca uno de tus códigos activos. Debe existir en Códigos › Rotativos.') +
      '<div id="' + id + '_w">' + caWarnHtml(i) + '</div>';
  }
  return h;
}
function caChanged() { avPrevNow(); }
/* aviso en vivo bajo el botón, con los arreglos de un toque */
function caWarnHtml(i) {
  var id = 'av_b' + i, el = document.getElementById(id + '_d'), loaded = RM.codigos && Array.isArray(RM.codigos.rows);
  if (!el || !loaded) return '';
  var d = String(el.value || '').trim(), fin = fromLocalInput(drawerVal('av_fin')), auto = !!document.getElementById('pk_cab' + i);
  if (!d) return '';
  var c = caFind(d), iss = caIssue(c, fin);
  if (auto) {
    var au = { premios: pkSel('cab' + i), usos: drawerVal(id + '_sl') ? null : Math.floor(Number(drawerVal(id + '_u')) || 0), texto: String(drawerVal(id + '_x') || '').trim() };
    var dif = !!c && au.premios.length && caDiff(c, au);
    return '<div class="row sm" style="margin:4px 0 8px"><span class="mut">Código actual</span><span class="code">' + esc(d) + '</span>' + caChips(c, fin) + '</div>' +
      (iss || dif ? '<div class="xs mut" style="margin:0 0 8px">' + (dif ? 'Cambiaste los premios o los usos: al guardar se genera un código nuevo.' : 'Ya no sirve (' + esc(CA_WHY[iss] || iss) + '): al guardar se arregla solo.') + '</div>' : '');
  }
  if (!c) return '';
  if (!iss) return '<div class="row sm" style="margin:-4px 0 8px">' + caChips(c, fin) + '</div>';
  return '<div class="ban bad" style="margin:0 0 12px">' + ic('warn') + '<div class="tx"><b>Este código ' + esc(caWhyTxt(c, iss, fin)) + '</b>Quien toque «Canjear» verá un error. Arréglalo aquí o guarda de todos modos.' + caFixHtml(c, iss, fin, 'caE', 'data-i="' + i + '"') + '</div></div>';
}
function caRefresh() {
  for (var i = 0; i < 2; i++) { var w = document.getElementById('av_b' + i + '_w'); if (w) { var h = caWarnHtml(i); if (w.innerHTML !== h) w.innerHTML = h; } }
}
A.caEExt = async function (el) {
  var i = Number(el.dataset.i), c = caFind(drawerVal('av_b' + i + '_d')), fin = fromLocalInput(drawerVal('av_fin'));
  if (!c || !fin) { toast('Elige primero cuándo termina el aviso', 'bad'); return; }
  busy(el, true, 'Extendiendo…');
  try { await caExtender(c, fin); toast('Código extendido hasta ' + fdt(fin)); rload('codigos'); caRefresh(); } catch (e) { busy(el, false); toast(e.message, 'bad'); }
};
A.caENew = async function (el) {
  var i = Number(el.dataset.i), c = caFind(drawerVal('av_b' + i + '_d')), fin = fromLocalInput(drawerVal('av_fin'));
  if (!c || !fin) { toast('Elige primero cuándo termina el aviso', 'bad'); return; }
  busy(el, true, 'Generando…');
  try {
    var au = caAutoOf({}, c), n = await caCrear(au, fin, caTitle({ titulo: { es: drawerVal('av_tes').trim() } }));
    AV.bt = readBtns(); AV.bt[i].modo = 'auto'; AV.bt[i].codigo_auto = au; AV.bt[i].destino = n.mostrar;
    var w = $('#av_btw'); w.innerHTML = btnsHtml(); avPrevNow(); toast('Se generó un código nuevo: ' + n.mostrar); rload('codigos');
  } catch (e) { busy(el, false); toast(e.message, 'bad'); }
};
A.avSaveAny = function () { AV.force = true; var b = document.querySelector('[data-a="avSave"]'); if (b) b.click(); };
