/* ================= diseñador de avisos: formato, botones, imagen, acento, plantillas ================= */
var AV = { fmt: 'tarjeta', bt: [], imid: '', fresh: {}, orig: '', meta: null, saved: false };
var FMT_INFO = { tarjeta: ['Tarjeta', 'En el menú, debajo de «Jugar»'], ventana: ['Ventana', 'Emergente al abrir la app'], imagen: ['Imagen', 'Emergente con foto grande'], banner: ['Banner', 'Franja delgada arriba del menú'] };
var IMG_HINT = {
  imagen: 'Es la protagonista: se ve grande y completa, con esquinas redondeadas. Cualquier proporción; funciona muy bien 4:5 o 1:1.',
  tarjeta: 'Va como franja arriba de la tarjeta, en proporción 2.4:1 (por ejemplo 1080×450). Se recorta al centro. Sin imagen se ve el arte chico de siempre.',
  ventana: 'Es el arte cuadrado (1:1) de la ventana; se recorta al centro. Sin imagen se ve el premio o una gema.',
  banner: 'Es la miniatura cuadrada (1:1) a la izquierda de la franja; se recorta al centro.'
};
var IMG_RATIO = { tarjeta: [2.4, '2.4 : 1'], ventana: [1, '1 : 1'], banner: [1, '1 : 1'] };

/* ---------- maquetas pequeñas (selector de formato y galería) ---------- */
function fmtMock(f, tint) {
  var h = '<i class="hd"></i>';
  if (f === 'tarjeta') h += '<i class="pl"></i><i class="cd" style="top:33px;height:28px"></i><i class="tb" style="left:10px;top:38px"></i><i class="ln" style="left:25px;top:39px;width:22px"></i><i class="ln m" style="left:25px;top:45px;width:16px"></i><i class="bt" style="left:25px;top:51px;width:18px;height:6px"></i><i class="cd" style="top:66px;height:14px;opacity:.35"></i>';
  else if (f === 'ventana') h += '<i class="pl"></i><i class="dim"></i><i class="pn"></i><i class="tt" style="left:13px;top:28px;width:32px"></i><i class="ar" style="left:18px;top:36px"></i><i class="ln" style="left:14px;top:62px;width:30px"></i><i class="ln m" style="left:17px;top:68px;width:24px"></i><i class="bt" style="left:16px;top:73px;width:26px"></i>';
  else if (f === 'imagen') h += '<i class="pl"></i><i class="dim"></i><i class="im"></i><i class="xx"></i><i class="bt" style="left:14px;top:80px;width:30px;height:8px"></i>';
  else h = '<i class="bn"></i><i class="tb" style="left:9px;top:15px;width:8px;height:8px"></i><i class="ln" style="left:21px;top:17.5px;width:22px"></i><i class="ln" style="right:9px;top:17.5px;width:5px"></i><i class="hd" style="top:34px"></i><i class="pl" style="top:44px"></i><i class="cd" style="top:58px;height:20px;opacity:.5"></i>';
  return '<div class="mk" style="--mt:' + (tint || '#ffc93c') + '">' + h + '</div>';
}
function fmtTiles(cur) {
  return '<div class="fmts" role="radiogroup" aria-label="Formato del aviso">' + ['tarjeta', 'ventana', 'imagen', 'banner'].map(function (f) {
    return '<label class="fmt"><input type="radio" name="av_fmt" value="' + f + '" data-c="avFmtC"' + (cur === f ? ' checked' : '') + '>' + fmtMock(f, '#ffc93c') + '<b>' + FMT_INFO[f][0] + '</b><span>' + FMT_INFO[f][1] + '</span></label>';
  }).join('') + '</div>';
}

/* ---------- plantillas ---------- */
var TPLS = [
  ['tplDrop', 'ventana', 'Drop relámpago', 'Un código con pocos lugares y prisa por canjearlo.', '#FF5D8F'],
  ['tplUpd', 'ventana', 'Aviso de actualización', 'Manda a la tienda a quien tenga una versión vieja.', '#4EA1FF'],
  ['tplPromo', 'imagen', 'Promo de Fakturo', 'Imagen grande con botón que abre fakturo.cloud.', '#9C6BFF', 'fakturo'],
  ['tplPromo', 'imagen', 'Promo de Cumplegratis', 'Imagen grande con botón que abre cumplegratis.fun.', '#FFC93C', 'cumple'],
  ['tplSeason', 'ventana', 'Cupón de temporada', 'Código nuevo con fecha de fin y una ventana para canjearlo.', '#43D9A3'],
  ['tplEvento', 'banner', 'Anuncio de evento', 'Franja arriba del menú que abre el evento.', '#FF5D8F'],
  ['tplNews', 'tarjeta', 'Novedades o noticia', 'Tarjeta con imagen y botón «Ver más».', '#4EA1FF'],
  ['tplPers', 'tarjeta', 'Invitación a personalizar', 'Tarjeta que lleva directo a Personalizar.', '#9C6BFF'],
  ['tplLink', 'ventana', 'Encuesta o link externo', 'Ventana con un botón que abre cualquier página.', '#43D9A3']
];
function tplTiles() {
  return '<div class="grid tpls tplg" data-keep="tpls">' + TPLS.map(function (t) {
    return '<button class="card pad hov tpl" data-a="' + t[0] + '"' + (t[5] ? ' data-v="' + t[5] + '"' : '') + '><div class="tm">' + fmtMock(t[1], t[4]) + '<span class="chip line">' + FMT_INFO[t[1]][0] + '</span></div><b>' + t[2] + '</b><span class="xs mut">' + t[3] + '</span></button>';
  }).join('') + '</div>';
}
function inDays(d) { return addMs(d * 864e5).toISOString(); }
function bt(acc, estilo, dest, es, en) { var d = BT_DEF[acc]; return { texto: { es: es || d[0], en: en || (es ? es : d[1]) }, accion: acc, destino: dest || '', estilo: estilo || 'primario' }; }
A.tplDrop = function () { openDrop(); };
A.tplUpd = async function () {
  var V = items('versiones').map(function (v) { return v.version; }).sort(cmpVer);
  var guess = (items('versiones').filter(function (v) { return v.android === 'publicada'; }).map(function (v) { return v.version; }).sort(cmpVer).pop()) || V[V.length - 1] || '1.0.6';
  var v = await promptDlg({ title: 'Aviso de actualización', text: 'Lo verá quien tenga una versión MÁS VIEJA que esta. Dura 30 días y sale una vez al día como ventana.', label: 'Versión nueva', value: guess, ph: '1.0.6', ok: 'Siguiente' });
  if (v == null) return;
  if (!/^\d+(\.\d+){1,2}$/.test(v)) { toast('Versión: números separados por punto, como 1.0.6', 'bad'); return; }
  avForm(null, { formato: 'ventana', titulo: { es: '¡Nueva versión de Blokku!', en: 'New Blokku version!' }, texto: { es: 'Ya está disponible la versión ' + v + ' con premios y mejoras nuevas. Actualiza para disfrutarlas.', en: 'Version ' + v + ' is out with new rewards and improvements. Update to enjoy them.' }, botones: [bt('tienda'), bt('cerrar', 'secundario')], version_menor: v, repetir: 'diaria', fin: inDays(30), acento: '#4EA1FF' });
};
A.tplPromo = function (el) {
  var p = PROMOS[el.dataset.v || 'fakturo'];
  avForm(null, { formato: 'imagen', titulo: { es: p.tes, en: p.ten }, texto: { es: p.xes, en: p.xen }, botones: [bt('url', 'primario', p.url, 'Conocer más', 'Learn more'), bt('cerrar', 'secundario', '', 'Ahora no', 'Not now')], repetir: 'una', fin: inDays(30) });
};
A.tplEvento = function () {
  var E = rows('eventos').filter(function (e) { return evEst(e) !== 'terminado' && evEst(e) !== 'inactivo'; }).sort(function (a, b) { return new Date(a.inicio) - new Date(b.inicio); })[0];
  avForm(null, { formato: 'banner', titulo: E ? { es: '¡' + ml(E.nombre) + ' ya está en Blokku!', en: '' } : { es: '¡Nuevo evento en Blokku!', en: 'New event in Blokku!' }, botones: [bt('evento', 'primario', E ? E.id : '')], repetir: 'siempre', fin: E ? E.fin : inDays(14), acento: '#FF5D8F' });
};
A.tplNews = function () {
  avForm(null, { formato: 'tarjeta', titulo: { es: 'Novedades de Blokku', en: 'What\'s new in Blokku' }, texto: { es: 'Cuéntale a tu gente qué hay de nuevo. Sube una imagen para que la tarjeta destaque.', en: 'Tell players what\'s new. Add an image to make the card stand out.' }, botones: [bt('url', 'primario', 'https://')], repetir: 'siempre', fin: inDays(14) });
};
A.tplPers = function () {
  avForm(null, { formato: 'tarjeta', titulo: { es: 'Estrena un look nuevo', en: 'Try a fresh look' }, texto: { es: 'Cambia tu tema, tus piezas y tus efectos en Personalizar.', en: 'Change your theme, pieces and effects in Customize.' }, botones: [bt('personalizar', 'primario', 'temas')], repetir: 'siempre', fin: inDays(14), acento: '#9C6BFF' });
};
A.tplLink = function () {
  avForm(null, { formato: 'ventana', titulo: { es: 'Cuéntanos qué piensas', en: 'Tell us what you think' }, texto: { es: 'Contesta una encuesta corta y ayúdanos a mejorar Blokku.', en: 'Take a short survey and help us improve Blokku.' }, botones: [bt('url', 'primario', 'https://', 'Responder', 'Answer'), bt('cerrar', 'secundario', '', 'Ahora no', 'Not now')], repetir: 'una', fin: inDays(14) });
};
function cmpVer(a, b) { var x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (var i = 0; i < 3; i++) { var d = (x[i] || 0) - (y[i] || 0); if (d) return d; } return 0; }

/* ---------- ¿Supabase ya tiene lo nuevo? ---------- */
function avSqlOld() {
  if (S.newSql.remoto || S.newSql.panel) return true;
  var r = rows('avisos'); if (r.length) return r[0].formato === undefined;
  var c = RM.config && RM.config.rows; if (c && (c.avisos || []).length) return c.avisos[0].formato === undefined;
  return false;
}
function avProbe() {
  if (S.newSql.probed) return; S.newSql.probed = 1;
  rpc('imagen_aviso', { p_id: 'pub_probe' }, { anon: true, nomiss: true }).then(function () { }, function (e) { if (e.code === 'sin_sql') { S.newSql.panel = true; paintBanners(); } });
}
A.sqlretry2 = function () { S.newSql = {}; paintBanners(); avProbe(); rloadAll(); toast('Revisando…', 'info'); };

/* ---------- botones ---------- */
function btEvs() {
  var evs = rows('eventos').map(function (e) { return [e.id, (ml(e.nombre) || e.id) + ' (' + e.id + ')']; });
  ['muertos26', 'pionero'].forEach(function (id) { if (!evs.some(function (x) { return x[0] === id; })) evs.push([id, id + ' (viene en la app)']); });
  return evs;
}
function btDest(i, b) {
  var id = 'av_b' + i + '_d', acc = b.accion, val = b.destino || '';
  if (acc === 'url') return field(id, 'Link (https)', inp(id, val, { ph: 'https://…', di: 'avPrev' }), 'Se abre en el navegador del teléfono.');
  if (acc === 'tienda') return field(id, 'Link de la tienda (opcional)', inp(id, val, { ph: 'Vacío = Play Store o App Store según el teléfono', di: 'avPrev' }), 'Déjalo vacío: la app abre su ficha en la tienda correcta.');
  if (acc === 'evento') return field(id, 'Evento', '<select class="sel" id="' + id + '" data-c="avPrevC">' + opts([['', 'Elige un evento…']].concat(btEvs()), val) + '</select>', 'Al tocar el botón se abre la hoja del evento.');
  if (acc === 'canjear') {
    var codes = rows('codigos').filter(function (c) { return cEst(c) === 'activo'; });
    return field(id, 'Código que se canjea', inp(id, val, { ph: 'Ej. BK-ABCD-EFGH-JKLM', di: 'avPrev', max: 40 }) + (codes.length ? '<div class="presets">' + codes.slice(0, 6).map(function (c) { return '<button type="button" class="btn xs" data-a="avPick" data-t="' + id + '" data-v="' + esc(c.mostrar) + '"><span class="mono">' + esc(c.mostrar) + '</span></button>'; }).join('') + '</div>' : ''), 'Escríbelo o toca uno de tus códigos activos. Debe existir en Códigos › Rotativos.');
  }
  if (acc === 'personalizar') {
    var isTab = PERS_TABS.some(function (t) { return t[0] === val; }), mode = b._p || (val && !isTab) ? '__p' : (val || 'temas');
    return field(id, 'Qué abre en Personalizar', '<select class="sel" id="' + id + '" data-c="avBtnRe">' + opts(PERS_TABS.map(function (t) { return [t[0], 'Pestaña: ' + t[1]]; }).concat([['__p', 'Un premio concreto…']]), mode) + '</select>') +
      (mode === '__p' ? field('av_b' + i + '_pk', 'Premio', picker('avb' + i, val && !isTab ? [val] : [], { single: true, onChange: avPrevNow })) : '');
  }
  return '<p class="xs mut" style="margin:-2px 0 12px">' + ({ jugar: 'Empieza una partida.', diario: 'Abre el reto diario.', cerrar: 'Solo cierra el aviso, no hace nada más.' }[acc] || '') + '</p>';
}
function btnsHtml() {
  var max = AV.fmt === 'banner' ? 1 : 2, L = AV.bt.slice(0, max), ban = AV.fmt === 'banner';
  var h = L.map(function (b, i) {
    var p = 'av_b' + i;
    return '<div class="bte"><div class="bth"><b>Botón ' + (i + 1) + '</b><span class="sp"></span>' + (ban ? '' : '<span class="segr" role="radiogroup" aria-label="Estilo del botón ' + (i + 1) + '"><label><input type="radio" name="' + p + '_s" value="primario" data-c="avPrevC"' + (b.estilo !== 'secundario' ? ' checked' : '') + '><span>Principal</span></label><label><input type="radio" name="' + p + '_s" value="secundario" data-c="avPrevC"' + (b.estilo === 'secundario' ? ' checked' : '') + '><span>Secundario</span></label></span>') +
      '<button type="button" class="btn sm ghost dng" data-a="avBtnDel" data-i="' + i + '" aria-label="Quitar botón ' + (i + 1) + '">' + ic('trash') + 'Quitar</button></div>' +
      (ban ? '' : '<div class="fg">' + field(p + '_t', 'Texto del botón', inp(p + '_t', (b.texto || {}).es, { ph: BT_DEF[b.accion] ? BT_DEF[b.accion][0] : '', max: 24, di: 'avPrev' })) + field(p + '_te', 'En inglés (opcional)', inp(p + '_te', (b.texto || {}).en, { ph: 'Vacío = se usa el español', max: 24 })) + '</div>') +
      field(p + '_a', '¿Qué hace?', sel(p + '_a', b.accion, BT_ACC, { dc: 'avBtnAcc' })) + btDest(i, b) + '</div>';
  }).join('');
  if (!L.length) h += '<p class="sm mut" style="margin:0 0 10px">Sin botones: el aviso solo informa' + (AV.fmt === 'ventana' || AV.fmt === 'imagen' ? ' y se cierra con «¡Genial!»' : '') + '.</p>';
  if (ban) h += '<p class="xs mut" style="margin:0 0 10px">En un banner toda la franja funciona como botón. Se usa la primera acción.</p>';
  if (L.length < max) h += '<button type="button" class="btn sm" data-a="avBtnAdd">' + ic('plus') + 'Agregar botón</button>';
  return h;
}
function readBtns() {
  var out = [];
  for (var i = 0; i < 2; i++) {
    if (!document.getElementById('av_b' + i + '_a')) continue;
    var acc = drawerVal('av_b' + i + '_a'), d = '', pm = false;
    if (acc === 'personalizar') { var sv = drawerVal('av_b' + i + '_d'); pm = sv === '__p'; d = pm ? (pkSel('avb' + i)[0] || '') : sv; }
    else if (document.getElementById('av_b' + i + '_d')) d = String(drawerVal('av_b' + i + '_d')).trim();
    out.push({ texto: { es: String(drawerVal('av_b' + i + '_t') || '').trim(), en: String(drawerVal('av_b' + i + '_te') || '').trim() }, accion: acc, destino: d, estilo: radioVal('av_b' + i + '_s') || 'primario', _p: pm });
  }
  return out;
}
function btRender() { AV.bt = readBtns(); var w = $('#av_btw'); if (w) w.innerHTML = btnsHtml(); avPrevNow(); }
A.avBtnAdd = function () { AV.bt = readBtns(); AV.bt.push({ texto: { es: '', en: '' }, accion: AV.bt.length ? 'cerrar' : 'url', destino: '', estilo: AV.bt.length ? 'secundario' : 'primario' }); var b = AV.bt[AV.bt.length - 1]; b.texto = { es: BT_DEF[b.accion][0], en: BT_DEF[b.accion][1] }; var w = $('#av_btw'); w.innerHTML = btnsHtml(); avPrevNow(); };
A.avBtnDel = function (el) { AV.bt = readBtns(); AV.bt.splice(Number(el.dataset.i), 1); var w = $('#av_btw'); w.innerHTML = btnsHtml(); avPrevNow(); };
C.avBtnRe = btRender;
C.avBtnAcc = function (el) {
  var i = Number(el.id.replace(/\D/g, '').charAt(0)), old = AV.bt[i] ? AV.bt[i].accion : '', cur = readBtns();
  var b = cur[i]; if (b) {
    var od = BT_DEF[old] || ['', ''];
    if (!b.texto.es || b.texto.es === od[0]) b.texto.es = BT_DEF[b.accion][0];
    if (!b.texto.en || b.texto.en === od[1]) b.texto.en = BT_DEF[b.accion][1];
    b.destino = ''; b._p = false;
  }
  AV.bt = cur; var w = $('#av_btw'); w.innerHTML = btnsHtml(); avPrevNow();
};
A.avPick = function (el) { var i = document.getElementById(el.dataset.t); if (i) { i.value = el.dataset.v; avPrevNow(); } };

/* ---------- imagen ---------- */
var WEBP_OK = null;
function webpOk() { if (WEBP_OK === null) { try { var c = document.createElement('canvas'); c.width = c.height = 1; WEBP_OK = c.toDataURL('image/webp').indexOf('data:image/webp') === 0; } catch (e) { WEBP_OK = false; } } return WEBP_OK; }
/* ancho máx. 1080 px y menos de 300 KB (WebP; JPEG si el navegador no lo sabe hacer) */
function compressAv(file) {
  return new Promise(function (res, rej) {
    var fr = new FileReader();
    fr.onload = function () {
      var im = new Image();
      im.onload = function () {
        var wp = webpOk(), mime = wp ? 'image/webp' : 'image/jpeg', w = Math.min(1080, im.width), q = .88, u = '', h = 0;
        for (var i = 0; i < 30; i++) {
          h = Math.max(1, Math.round(im.height * w / im.width));
          var c = document.createElement('canvas'); c.width = w; c.height = h;
          var x = c.getContext('2d'); if (!wp) { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); } x.drawImage(im, 0, 0, w, h);
          u = c.toDataURL(mime, q);
          if ((u.length - u.indexOf(',') - 1) * .75 <= 300 * 1024) return res({ url: u, w: w, h: h, kb: Math.round((u.length - u.indexOf(',') - 1) * .75 / 1024) });
          if (q > .56) q -= .08; else { w = Math.round(w * .85); q = .8; }
          if (w < 320) break;
        }
        rej(new Error('No se pudo bajar de 300 KB; prueba con una imagen más simple'));
      };
      im.onerror = function () { rej(new Error('No se pudo leer esa imagen')); };
      im.src = fr.result;
    };
    fr.onerror = function () { rej(new Error('No se pudo leer el archivo')); };
    fr.readAsDataURL(file);
  });
}
function imgSecHtml() {
  var id = AV.imid, f = AV.fmt, r = IMG_RATIO[f];
  var h = '<input type="hidden" id="av_imid" value="' + esc(id) + '">';
  if (id) {
    var u = IMG.c[id] ? safeImg(IMG.c[id]) : ''; if (!u) avImgLoad(id);
    h += '<div class="imgp"><div class="ip' + (u ? '' : ' sk2 sk') + '">' + (u ? '<img alt="Imagen del aviso" src="' + esc(u) + '">' : '') + '</div><div class="meta"><b>Imagen lista</b>' + (u ? Math.round((u.length - u.indexOf(',') - 1) * .75 / 1024) + ' KB' + (AV.meta ? ' · ' + AV.meta.w + '×' + AV.meta.h + ' px' : '') : 'Cargando…') + '<div class="row mt8"><button type="button" class="btn sm" data-a="avImgPick">' + ic('refresh') + 'Reemplazar</button><button type="button" class="btn sm ghost dng" data-a="avImgDel">' + ic('trash') + 'Quitar</button></div></div></div>';
  } else h += '<button type="button" class="dz" data-a="avImgPick"><span class="di">' + ic('image') + '</span><span><b>Sube o arrastra una imagen</b><span>JPG, PNG o WebP. Se ajusta sola a 1080 px de ancho y menos de 300 KB.</span></span></button>';
  h += '<div class="xs mut" style="margin-top:8px">' + esc(IMG_HINT[f]) + '</div>' + (r ? '<div class="crop">Proporción sugerida: <b>' + r[1] + '</b><span class="frame" style="width:' + Math.round(r[0] >= 1.5 ? 120 : 52) + 'px;aspect-ratio:' + r[0] + '"></span></div>' : '');
  return h;
}
function avImgPaint() { var w = $('#av_imw'); if (w) w.innerHTML = imgSecHtml(); }
function avImgLoad(id) {
  if (IMG.c[id] || IMG.miss[id] || AV.loading === id) return; AV.loading = id;
  rpc('admin_imagenes', { p_ids: [id] }).then(function (r) { if (r && r[id]) IMG.c[id] = r[id]; else IMG.miss[id] = 1; }, function () { IMG.miss[id] = 1; }).then(function () { AV.loading = ''; if (LAY.dr) { avImgPaint(); avPrevNow(); } });
}
A.avImgPick = function () {
  var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
  i.onchange = function () { avImgUp(i.files[0]); };
  i.click();
};
async function avImgUp(file) {
  if (!file) return;
  if (!/^image\//.test(file.type)) { toast('Ese archivo no es una imagen', 'bad'); return; }
  toast('Subiendo imagen…', 'info');
  try {
    var d = await compressAv(file), id = 'pub_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    await rpc('admin_guardar_imagen', { p_id: id, p_data: d.url }, { timeout: 60000 });
    IMG.c[id] = d.url;
    if (AV.imid && AV.fresh[AV.imid]) avImgDrop(AV.imid);
    AV.imid = id; AV.fresh[id] = 1; AV.meta = { w: d.w, h: d.h };
    avImgPaint(); avPrevNow(); toast('Imagen subida (' + d.kb + ' KB)');
  } catch (e) { toast('No se pudo subir la imagen: ' + e.message, 'bad'); }
}
function avImgDrop(id) { delete AV.fresh[id]; rpc('admin_borrar_imagen', { p_id: id }).catch(function () { }); }
A.avImgDel = function () { if (AV.imid && AV.fresh[AV.imid]) avImgDrop(AV.imid); AV.imid = ''; AV.meta = null; avImgPaint(); avPrevNow(); };
function avImgUsed(id, exceptId) { return rows('avisos').some(function (x) { return x.imagen_id === id && x.id !== exceptId; }); }

/* ---------- acento ---------- */
function acHtml(cur) {
  var pre = ACENTOS.some(function (a) { return a[0].toLowerCase() === String(cur).toLowerCase(); });
  return '<input type="hidden" id="av_ac" value="' + esc(cur) + '"><div class="sws"><button type="button" class="sw2 none" data-a="avAc" data-v="" aria-pressed="' + (!cur) + '" aria-label="Sin color" title="Sin color">' + ic('check') + '</button>' +
    ACENTOS.map(function (a) { return '<button type="button" class="sw2" style="--c:' + a[0] + '" data-a="avAc" data-v="' + a[0] + '" aria-pressed="' + (String(cur).toLowerCase() === a[0].toLowerCase()) + '" aria-label="' + a[1] + '" title="' + a[1] + '">' + ic('check') + '</button>'; }).join('') +
    '<label class="sw2" style="--c:' + (cur && !pre ? cur : 'conic-gradient(red,yellow,lime,aqua,blue,magenta,red)') + '" aria-pressed="' + (!!cur && !pre) + '" title="Otro color"><input type="color" id="av_acc" value="' + (cur && /^#[0-9a-f]{6}$/i.test(cur) ? cur : '#ffc93c') + '" data-i="avAcC" style="opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer" aria-label="Elegir otro color">' + ic('check') + '</label>' +
    '<span class="hx">' + (cur ? esc(cur.toUpperCase()) : 'Sin color') + '</span></div>';
}
function acSet(v) { var i = $('#av_ac'); if (i) i.value = v; var w = $('#av_acw'); if (w) w.innerHTML = acHtml(v); avPrevNow(); }
A.avAc = function (el) { acSet(el.dataset.v); };
I.avAcC = function (el) { var v = el.value.toUpperCase(), i = $('#av_ac'); if (i) i.value = v; $$('#av_acw .sw2').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); }); var l = el.closest('label'); if (l) { l.style.setProperty('--c', v); l.setAttribute('aria-pressed', 'true'); } var hx = $('#av_acw .hx'); if (hx) hx.textContent = v; avPrevNow(); };

/* ---------- formulario ---------- */
function avForm(a, pre) {
  avProbe();
  var isNew = !a || !a.id, v = Object.assign({ tipo: 'tarjeta', titulo: {}, texto: {}, inicio: new Date(Date.now() - 60000).toISOString(), fin: addMs(7 * 864e5).toISOString(), accion: '', destino: '', premio: '', imagen: '', imagen_id: '', acento: '', version_menor: '', plataforma: '', repetir: 'una', activo: true, orden: 0 }, a || {}, pre || {});
  v.formato = avFmt(v);
  var st = AV = { fmt: v.formato, bt: clone(avBtns(v)), imid: v.imagen_id || '', fresh: {}, orig: (a && a.imagen_id) || '', meta: null, saved: false };
  var oldSql = avSqlOld();
  formDrawer({
    wide: true, title: isNew ? 'Nuevo aviso' : 'Editar aviso', sub: isNew ? 'Elige un formato, llena lo necesario y mira cómo queda a la derecha.' : esc(EST_L[avEst(v)]) + ' · ' + nf(v.vistos) + ' vistos · ' + nf(v.clics) + ' clics',
    body: function () {
      var f = oldSql ? '<div class="ban bad" style="margin:0 0 16px">' + ic('warn') + '<div class="tx"><b>Falta actualizar Supabase</b>Vuelve a correr <span class="path">2-remoto.sql</span> y <span class="path">3-panel.sql</span> (Escritorio › Blokku › 02-Documentos › Supabase) para poder guardar avisos con formato, botones, imagen y color.</div></div>' : '';
      f += '<div class="fsec"><h4>Formato</h4>' + fmtTiles(v.formato) + '</div>';
      f += '<div class="fsec"><h4>Textos</h4>' + field('av_tes', 'Título', inp('av_tes', ml({ es: (v.titulo || {}).es }), { ph: 'Ej. Semana Dusa', max: 80, di: 'avPrev' }), '<span id="av_th"></span>') +
        field('av_xes', 'Texto', area('av_xes', (v.texto || {}).es, { ph: 'Una o dos frases cortas.', di: 'avPrev', rows: 3 })) +
        '<details class="help" style="margin:0 0 12px"><summary>' + ic('chr', 'chev') + 'Versión en inglés (opcional)</summary><div style="margin-top:10px">' + field('av_ten', 'Título en inglés', inp('av_ten', (v.titulo || {}).en, { ph: 'Si lo dejas vacío, se usa el español', max: 80 })) + field('av_xen', 'Texto en inglés', area('av_xen', (v.texto || {}).en, { rows: 2 })) + '</div></details></div>';
      f += '<div class="fsec"><h4>Botones <span class="mut" style="text-transform:none;letter-spacing:0;font-weight:500">(hasta 2)</span></h4><div id="av_btw">' + btnsHtml() + '</div></div>';
      f += '<div class="fsec"><h4>Imagen</h4><div class="f" id="f_av_imfield"><div id="av_imw">' + imgSecHtml() + '</div></div>' +
        '<details class="help" style="margin:12px 0"' + (v.premio || (v.imagen && !v.imagen_id) ? ' open' : '') + '><summary>' + ic('chr', 'chev') + 'Más opciones: premio o link de imagen</summary><div style="margin-top:10px">' +
        field('av_pr', 'Premio que se muestra', picker('avp', v.premio ? [v.premio] : [], { single: true, onChange: avPrevNow }), 'Si eliges un premio, se ve el premio como arte (en el formato Imagen, si no subes imagen). Sin nada: una gema, o el logo de Blokku si el botón es «Ir a la tienda».') +
        field('av_img', 'Imagen por link (https, avanzado)', inp('av_img', v.imagen, { ph: 'https://…', di: 'avPrev' }), 'Mejor sube la imagen arriba: así no depende de otra página. La imagen subida tiene prioridad.') + '</div></details></div>';
      f += '<div class="fsec"><h4>Color de acento</h4><div id="av_acw">' + acHtml(avAcc(v)) + '</div><div class="xs mut" style="margin-top:8px">Pinta el borde de la tarjeta, la ventana o la franja. Los botones principales siguen dorados.</div></div>';
      f += '<div class="fsec"><h4>Cuándo</h4><div class="fg">' + field('av_ini', 'Empieza', inp('av_ini', toLocalInput(v.inicio), { type: 'datetime-local', di: 'avPrev' })) + field('av_fin', 'Termina', inp('av_fin', toLocalInput(v.fin), { type: 'datetime-local', di: 'avPrev' })) + '</div>' +
        '<div class="xs mut" style="margin:-6px 0 4px">Atajos (empieza ahora y dura…):</div>' + presetBtns('av_ini,av_fin', [[36e5, '1 hora'], [864e5, '1 día'], [3 * 864e5, '3 días'], [7 * 864e5, '1 semana'], [30 * 864e5, '30 días']]) + '</div>';
      f += '<div class="fsec"><h4>A quién</h4>' + field('av_pl', 'Plataforma', sel('av_pl', v.plataforma || '', [['', 'Android e iOS'], ['android', 'Solo Android'], ['ios', 'Solo iOS']])) +
        field('av_vm', 'Solo a apps con versión menor que…', inp('av_vm', v.version_menor, { ph: 'Vacío = todas. Ej. 1.0.6', max: 12 }), 'Ejemplo: pon 1.0.6 y solo lo verá quien tenga la 1.0.5 o anterior. Perfecto para «actualiza».') + '</div>';
      f += '<div class="fsec"><h4>Frecuencia</h4>' + radios('av_rep', v.repetir || 'una', [['una', 'Una vez', 'Una sola vez por teléfono.'], ['diaria', 'Una vez al día', 'Vuelve a salir cada día mientras esté vigente.'], ['siempre', 'Siempre', 'Cada vez que abre la app, hasta que termine.']]) + '</div>';
      f += '<div class="fsec"><h4>Más</h4><div class="fg">' + field('av_ord', 'Orden', inp('av_ord', v.orden || 0, { type: 'number', mode: 'numeric' }), 'Si hay varios, el número menor va primero.') + '<div class="f"><span class="fl">Estado</span>' + tog('av_act', v.activo !== false, 'Encendido') + '</div></div></div>';
      return '<div class="edl"><div>' + f + '</div><div class="pvs"><div id="av_pv">' + avisoPhone(avRead(v)) + '</div><div class="pvcap" id="av_pc">Así se verá en un teléfono</div></div></div>';
    },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="avDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="avSave" data-id="' + esc(isNew ? '' : v.id) + '">' + ic('check') + (isNew ? 'Crear aviso' : 'Guardar') + '</button>'; },
    onMount: function (el) {
      $$('input[name="av_rep"],#av_pl,#av_vm,#av_ten,#av_xen,#av_ord,#av_act', el).forEach(function (x) { x.addEventListener('change', avPrevNow); });
      var over = function (e) { return e.dataTransfer && e.target.closest && e.target.closest('#av_imw'); };
      el.addEventListener('dragover', function (e) { if (over(e)) { e.preventDefault(); var z = $('.dz', el); if (z) z.classList.add('over'); } });
      el.addEventListener('dragleave', function (e) { var z = $('.dz', el); if (z && !e.relatedTarget || (z && !z.contains(e.relatedTarget))) z.classList.remove('over'); });
      el.addEventListener('drop', function (e) { if (over(e)) { e.preventDefault(); var z = $('.dz', el); if (z) z.classList.remove('over'); avImgUp(e.dataTransfer.files[0]); } });
      avTxtHints();
    },
    onClose: function () { if (!st.saved) Object.keys(st.fresh).forEach(function (id) { rpc('admin_borrar_imagen', { p_id: id }).catch(function () { }); }); }
  });
}
function avTxtHints() {
  var f = AV.fmt, th = $('#av_th'), t = $('#av_tes');
  if (t) t.placeholder = { tarjeta: 'Ej. Semana Dusa', ventana: 'Ej. ¡Salió un código!', imagen: 'Opcional: la imagen puede decirlo todo', banner: 'Una sola línea corta' }[f];
  if (th) th.textContent = { tarjeta: 'Obligatorio. Sale en negritas junto a la imagen.', ventana: 'Sale arriba con letras grandes. Si lo dejas vacío y hay un botón de canjear, dice «¡Salió un código!».', imagen: 'Opcional. Sale debajo de la imagen.', banner: 'Una línea: si es larga se corta con «…». Si lo dejas vacío se usa el texto.' }[f];
  var pc2 = $('#av_pc'); if (pc2) pc2.textContent = 'Así se verá: ' + FMT_INFO[f][0].toLowerCase();
}
C.avFmtC = function (el) {
  AV.bt = readBtns(); AV.fmt = el.value;
  var w = $('#av_btw'); if (w) w.innerHTML = btnsHtml();
  avImgPaint(); avTxtHints(); avPrevNow();
};
C.avPrevC = function () { avPrevNow(); };
function avRead(base) {
  var live = !!$('#av_tes') && !base;
  if (!live) { var b = base || {}; return Object.assign({}, b, { formato: avFmt(b), botones: avBtns(b) }); }
  var fmt = AV.fmt = radioVal('av_fmt') || AV.fmt, tipo = fmt === 'ventana' || fmt === 'imagen' ? 'drop' : 'tarjeta';
  var bs = readBtns().slice(0, fmt === 'banner' ? 1 : 2).map(function (b) {
    var d = BT_DEF[b.accion] || ['', ''], es = b.texto.es || d[0];
    var o = { texto: { es: es, en: b.texto.en || (b.texto.es && b.texto.es !== d[0] ? b.texto.es : d[1]) }, accion: b.accion, destino: b.destino, estilo: fmt === 'banner' ? 'primario' : b.estilo };
    return o;
  });
  var m = bs.filter(function (b) { return b.accion === 'evento' || b.accion === 'canjear' || b.accion === 'url' || b.accion === 'tienda'; })[0];
  var tes = drawerVal('av_tes').trim(), xes = drawerVal('av_xes').trim();
  return {
    tipo: tipo, formato: fmt, titulo: { es: tes, en: drawerVal('av_ten').trim() || tes }, texto: { es: xes, en: drawerVal('av_xen').trim() || xes },
    inicio: fromLocalInput(drawerVal('av_ini')), fin: fromLocalInput(drawerVal('av_fin')),
    accion: m ? m.accion : null, destino: m ? m.destino : '', botones: bs, premio: pkSel('avp')[0] || '', imagen: drawerVal('av_img').trim(), imagen_id: drawerVal('av_imid') || '', acento: drawerVal('av_ac') || '',
    version_menor: drawerVal('av_vm').trim(), plataforma: drawerVal('av_pl'), repetir: radioVal('av_rep') || 'una', activo: !!drawerVal('av_act'), orden: Math.floor(Number(drawerVal('av_ord')) || 0)
  };
}
function avPrevNow() { var b = $('#av_pv'); if (b) b.innerHTML = avisoPhone(avRead()); }
I.avPrev = debounce(avPrevNow, 80);
A.avSave = async function (el) {
  var o = avRead(), e = {}, fmt = o.formato, hasImg = o.imagen_id || isHttps(o.imagen) || o.premio;
  if (avSqlOld()) { toast('Antes de guardar hay que volver a correr 2-remoto.sql y 3-panel.sql en Supabase', 'bad'); return; }
  if (fmt === 'banner' ? !o.titulo.es && !o.texto.es : fmt === 'imagen' ? false : !o.titulo.es && !(fmt === 'ventana' && (o.texto.es || avCode(o)))) e.av_tes = fmt === 'banner' ? 'Escribe el texto de la franja' : 'Escribe un título';
  if (fmt === 'imagen' && !hasImg) e.av_imfield = 'Sube la imagen de la promo';
  if (!o.inicio) e.av_ini = 'Elige cuándo empieza'; if (!o.fin) e.av_fin = 'Elige cuándo termina';
  if (o.inicio && o.fin && new Date(o.fin) <= new Date(o.inicio)) e.av_fin = 'Debe terminar después de empezar';
  var cur = readBtns().slice(0, fmt === 'banner' ? 1 : 2);
  cur.forEach(function (b, i) {
    var p = 'av_b' + i;
    if (fmt !== 'banner' && !b.texto.es) e[p + '_t'] = 'Escribe el texto del botón';
    if (b.accion === 'url' && !isHttps(b.destino)) e[p + '_d'] = b.destino && b.destino !== 'https://' ? 'Debe empezar con https://' : 'Escribe el link';
    else if (b.accion === 'tienda' && b.destino && !isHttps(b.destino)) e[p + '_d'] = 'Debe empezar con https://, o déjalo vacío';
    else if (b.accion === 'evento' && !b.destino) e[p + '_d'] = 'Elige el evento';
    else if (b.accion === 'canjear') {
      if (!b.destino) e[p + '_d'] = 'Escribe el código';
      else if (RM.codigos && RM.codigos.rows) { var n = b.destino.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (!rows('codigos').some(function (c) { return c.mostrar.toUpperCase().replace(/[^A-Z0-9]/g, '') === n; })) e[p + '_d'] = 'Ese código no existe en tus códigos rotativos. Créalo primero.'; }
    } else if (b.accion === 'personalizar' && b._p && !b.destino) e[p + '_pk'] = 'Elige el premio';
  });
  if (o.imagen && !isHttps(o.imagen)) e.av_img = 'Debe ser una dirección https://';
  if (o.version_menor && !/^\d+(\.\d+){1,2}$/.test(o.version_menor)) e.av_vm = 'Números separados por punto, como 1.0.6';
  if (!showErrs(e)) return;
  if (el.dataset.id) o.id = el.dataset.id;
  busy(el, true);
  try {
    await rpc('admin_guardar_aviso', { p_aviso: o });
    AV.saved = true;
    Object.keys(AV.fresh).forEach(function (id) { if (id !== o.imagen_id) avImgDrop(id); });
    if (AV.orig && AV.orig !== o.imagen_id && !avImgUsed(AV.orig, o.id)) rpc('admin_borrar_imagen', { p_id: AV.orig }).catch(function () { });
    toast(o.id ? 'Aviso guardado' : 'Aviso creado'); drawerKill(); rload('config');
    await rload('avisos');
    var R2 = rows('avisos');
    if (R2.length && R2[0].formato === undefined) { S.newSql.remoto = true; paintBanners(); toast('Supabase no guardó el formato ni los botones: falta volver a correr 2-remoto.sql', 'bad'); }
  } catch (er) { busy(el, false); toast(er.message, 'bad'); }
};
