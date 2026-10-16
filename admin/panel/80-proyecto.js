/* ================= PROYECTO: pendientes, versiones, ideas ================= */
var COLD = [['ahora', 'Para ahora', '#5b4cf0'], ['espera', 'En espera', '#d97706'], ['hecho', 'Hecho', '#16a34a']];
function kCol(k) { return k.col === 'hecho' ? 'hecho' : k.bloqueo ? 'espera' : 'ahora'; }
function isPhone() { return window.matchMedia && matchMedia('(max-width:760px)').matches; }
function tkCard(k, compact) {
  var done = k.col === 'hecho';
  return '<div class="tk' + (done ? ' done' : '') + '" data-a="tkOpen" data-id="' + esc(k.id) + '"><input type="checkbox" class="cbx" data-c="tkDone" data-id="' + esc(k.id) + '"' + (done ? ' checked' : '') + ' aria-label="Marcar como hecho: ' + esc(k.titulo) + '"><div class="t"><b>' + esc(k.titulo) + '</b>' + (k.notas && !compact ? '<p>' + esc(k.notas) + '</p>' : '') +
    (compact && !(k.bloqueo && !done) && k.col !== 'curso' ? '' : '<div class="meta">' + (compact ? '' : '<span class="av ' + (k.quien === 'Claude' ? 'c' : 'm') + '" title="' + esc(k.quien) + '">' + esc((k.quien || '?').charAt(0)) + '</span>') + (k.bloqueo && !done ? chip('Espera: ' + k.bloqueo.replace(/^espera\s*(de\s*)?/i, ''), 'warn', 'clock') : '') + (k.col === 'curso' && !done ? chipN('En curso', 'ac') : '') + '</div>') + '</div></div>';
}
function vPendientes() {
  var f = S.f.pd = S.f.pd || { q: 'Todos', s: '', v: 'tablero', c: 'ahora', who: 'Manuel' };
  var L = items('pendientes').filter(function (k) { return (f.q === 'Todos' || k.quien === f.q) && match(k.titulo + ' ' + (k.notas || '') + ' ' + (k.bloqueo || ''), f.s); });
  var G = { ahora: [], espera: [], hecho: [] }; L.forEach(function (k) { G[kCol(k)].push(k); });
  G.ahora.sort(function (a, b) { return (b.col === 'curso') - (a.col === 'curso'); });
  var h = pageHead('Pendientes', 'Lo que falta hacer, de ti y de Claude. Marca la casilla cuando algo quede listo.', '<button class="btn pri" data-a="pendNew">' + ic('plus') + 'Pendiente</button>',
    ['<b>Para ahora</b>: se puede hacer hoy. <b>En espera</b>: depende de algo externo (escribe de qué en «En espera de…»). <b>Hecho</b>: ya quedó.', 'Toca un pendiente para editarlo, cambiar quién lo hace o borrarlo.', 'Se guarda solo en Supabase y lo ves igual en tu teléfono.']);
  h += '<div class="card pad mb16"><div class="qadd" style="margin:0"><input class="in" id="qa_t" placeholder="Escribe un pendiente nuevo y presiona Enter…" maxlength="160" autocomplete="off">' + seg('qaWho', f.who, [['Manuel', 'Manuel'], ['Claude', 'Claude']]) + '<button class="btn pri" data-a="qaAdd">' + ic('plus') + '<span class="hide-sm">Agregar</span></button></div></div>';
  h += '<div class="row mb16">' + seg('pdV', f.v, [['tablero', 'Tablero', 'board'], ['lista', 'Lista', 'list']]) + fchips('pdQ', f.q, [['Todos', 'Todos'], ['Manuel', 'Manuel'], ['Claude', 'Claude']]) + searchBox('pd_s', f.s, 'Buscar…', 'pdS') + '</div>';
  if (f.v === 'lista') {
    return h + COLD.map(function (c) { var l = G[c[0]]; if (c[0] === 'hecho' && !S.open.pdDone) return '<div class="sech sec"><h2>' + c[1] + ' <span class="mut" style="font-weight:600">' + l.length + '</span></h2><span class="grow"></span><button class="btn sm" data-a="pdDoneT">Mostrar</button></div>'; return '<div class="sech sec"><h2>' + c[1] + ' <span class="mut" style="font-weight:600">' + l.length + '</span></h2>' + (c[0] === 'hecho' ? '<span class="grow"></span><button class="btn sm" data-a="pdDoneT">Ocultar</button>' : '') + '</div><div class="list">' + (l.map(function (k) { return tkCard(k); }).join('') || '<div class="empty" style="padding:18px">Nada aquí.</div>') + '</div>'; }).join('');
  }
  var ph = isPhone();
  if (ph) h += '<div class="mb12">' + seg('pdC', f.c, COLD.map(function (c) { return [c[0], c[1] + ' · ' + G[c[0]].length]; }), ' full') + '</div>';
  h += '<div class="board">' + COLD.filter(function (c) { return !ph || c[0] === f.c; }).map(function (c) {
    var l = G[c[0]], lim = c[0] === 'hecho' && !S.open.pdDone ? 6 : 999;
    return '<div class="bcol"><div class="bch"><i style="--gc:' + c[2] + '"></i><b>' + c[1] + '</b><span class="ct">' + l.length + '</span></div>' + (l.slice(0, lim).map(function (k) { return tkCard(k); }).join('') || '<div class="empty" style="padding:18px 8px;font-size:13px">' + (c[0] === 'ahora' ? 'Nada para hoy. ¡Bien!' : c[0] === 'espera' ? 'Nada en espera.' : 'Aún nada hecho.') + '</div>') + (l.length > lim ? '<button class="btn sm ghost blk mt8" data-a="pdDoneT">Ver los ' + l.length + '</button>' : '') + '</div>';
  }).join('') + '</div>';
  return h;
}
PAGEMOUNT['proyecto/pendientes'] = function (pg) { var i = pg.querySelector('#qa_t'); if (i) i.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); A.qaAdd(); } }; };
A.qaWho = function (el) { S.f.pd.who = el.dataset.v; paintPage(); };
A.qaAdd = function () {
  var i = $('#qa_t'), t = i && i.value.trim(); if (!t) { if (i) i.focus(); return; }
  putItem('pendientes', { id: uid('k'), titulo: t, quien: S.f.pd.who || 'Manuel', col: 'todo', bloqueo: '', notas: '' }, 'top'); i.value = '';
  paintPage(); toast('Pendiente agregado'); var n = $('#qa_t'); if (n) n.focus();
};
A.pdV = function (el) { S.f.pd.v = el.dataset.v; paintPage(); };
A.pdQ = function (el) { S.f.pd.q = el.dataset.v; paintPage(); };
A.pdC = function (el) { S.f.pd.c = el.dataset.v; paintPage(); };
I.pdS = debounce(function (el) { S.f.pd.s = el.value; paintPage(); }, 120);
A.pdDoneT = function () { S.open.pdDone = !S.open.pdDone; paintPage(); };
A.tkOpen = function (el, ev) { if (ev.target.closest('input')) return; pendForm(item('pendientes', el.dataset.id)); };
C.tkDone = function (el) { var k = item('pendientes', el.dataset.id); if (!k) return; patchItem('pendientes', k.id, { col: el.checked ? 'hecho' : 'todo' }); toast(el.checked ? '¡Hecho!' : 'Regresó a pendientes'); repaint(); };
A.pendNew = function () { pendForm(null); };
function pendForm(k) {
  var isNew = !k, v = k || { id: uid('k'), titulo: '', quien: (S.f.pd && S.f.pd.who) || 'Manuel', col: 'todo', bloqueo: '', notas: '' };
  formDrawer({
    title: isNew ? 'Nuevo pendiente' : 'Editar pendiente',
    body: function () {
      return field('pe_t', 'Qué hay que hacer', area('pe_t', v.titulo, { rows: 2 })) + '<div class="f"><span class="fl">Quién lo hace</span>' + radios('pe_w', v.quien, [['Manuel', 'Manuel'], ['Claude', 'Claude']]) + '</div>' +
        '<div class="f"><span class="fl">Estado</span>' + radios('pe_c', v.col, [['todo', 'Por hacer'], ['curso', 'En curso'], ['hecho', 'Hecho']]) + '</div>' +
        field('pe_b', 'En espera de…', inp('pe_b', v.bloqueo, { ph: 'Vacío si no depende de nada. Ej. aprobación de AdMob' }), 'Si escribes algo aquí, pasa a la columna «En espera».') + field('pe_n', 'Notas', area('pe_n', v.notas, { rows: 4 }));
    },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="pendDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="pendSave" data-id="' + esc(v.id) + '" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + 'Guardar</button>'; },
    onMount: function (el) { if (isNew) { var t = el.querySelector('#pe_t'); if (t) setTimeout(function () { t.focus(); }, 40); } }
  });
}
A.pendSave = function (el) {
  var t = drawerVal('pe_t').trim(); if (!showErrs(t ? {} : { pe_t: 'Escribe el pendiente' })) return;
  var old = item('pendientes', el.dataset.id) || {};
  putItem('pendientes', Object.assign({}, old, { id: el.dataset.id, titulo: t, quien: radioVal('pe_w') || 'Manuel', col: radioVal('pe_c') || 'todo', bloqueo: drawerVal('pe_b').trim(), notas: drawerVal('pe_n').trim() }), el.dataset.new ? 'top' : false);
  drawerKill(); repaint(); toast('Pendiente guardado');
};
A.pendDel = function (el) { drawerKill(); delItem('pendientes', el.dataset.id); };

/* ---------- VERSIONES ---------- */
var VST = ['publicada', 'en revisión', 'lista', 'en desarrollo', 'idea'];
function verChip(s) { return chipN(s, s === 'publicada' ? 'ok' : s === 'en revisión' ? 'warn' : s === 'lista' ? 'ac' : 'line'); }
function vVersiones() {
  var V = items('versiones').slice().sort(function (a, b) { var ia = a.android === 'idea' && a.ios === 'idea' ? 1 : 0, ib = b.android === 'idea' && b.ios === 'idea' ? 1 : 0; return ia - ib || cmpVer(b.version, a.version); });
  var h = pageHead('Versiones', 'Qué trae cada versión, cómo va en cada tienda, qué falta para publicarla y cómo se ve.', '<button class="btn pri" data-a="verNew">' + ic('plus') + 'Versión</button>',
    ['Cambia el estado de Android o iOS directo en la tarjeta.', 'La checklist muestra el avance; toca un punto para marcarlo.', 'Las capturas vienen de las fichas de las tiendas; también puedes subir las tuyas.']);
  h += '<div class="col gap16">' + V.map(function (v) {
    var ck = v.checklist || [], d = ck.filter(function (c) { return c.d; }).length, caps = CAPS[v.id] || [], gs = {}, go2 = [];
    caps.forEach(function (c) { if (!gs[c.g]) { gs[c.g] = []; go2.push(c.g); } gs[c.g].push(c); });
    var x = '<div class="card ver"><div class="verh"><span class="vnum">' + esc(v.version) + '</span><div class="plat">' +
      ['android', 'ios'].map(function (pl) { return '<label class="pl"><b>' + (pl === 'ios' ? 'iOS' : 'Android') + '</b><select class="sel" data-c="verSt" data-id="' + esc(v.id) + '" data-p="' + pl + '" aria-label="Estado en ' + pl + '">' + opts(VST, v[pl]) + '</select></label>'; }).join('') + '</div><span class="grow"></span>' + (ck.length ? ring(d / ck.length) : '') + '<button class="btn sm" data-a="verEdit" data-id="' + esc(v.id) + '">' + ic('edit') + 'Editar</button></div>';
    if (v.espera || v.rama) x += '<div class="row mt8 sm mut">' + (v.espera ? chip('En espera de ' + v.espera, 'warn', 'clock') : '') + (v.rama ? '<span>Rama: <span class="mono">' + esc(v.rama) + '</span></span>' : '') + '</div>';
    x += '<div class="vb"><div><h4>Qué trae</h4><ul class="cn">' + String(v.contenido || '').split('\n').filter(Boolean).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>' +
      '<div><h4>Checklist · ' + d + ' de ' + ck.length + '</h4>' + (ck.length ? '<div class="bar ok mb8"><i style="width:' + Math.round(d * 100 / ck.length) + '%"></i></div>' : '') +
      ck.map(function (c, i) { return '<label class="ck' + (c.d ? ' d' : '') + '"><input type="checkbox" class="cbx" data-c="ckTog" data-id="' + esc(v.id) + '" data-i="' + i + '"' + (c.d ? ' checked' : '') + '><span>' + esc(c.t) + '</span><button class="btn xs ic ghost x" data-a="ckDel" data-id="' + esc(v.id) + '" data-i="' + i + '" aria-label="Quitar punto">' + ic('x') + '</button></label>'; }).join('') +
      '<div class="row mt8 nw"><input class="in sm" id="cka_' + esc(v.id) + '" data-ck="' + esc(v.id) + '" placeholder="Agregar un punto…" maxlength="160"><button class="btn sm" data-a="ckAdd" data-id="' + esc(v.id) + '">' + ic('plus') + '</button></div></div></div>';
    go2.forEach(function (g) { x += '<div class="dsec"><h4>' + esc(g) + '</h4><div class="shots" data-keep="sh_' + esc(v.id + g) + '">' + gs[g].map(function (c) { return '<figure><img loading="lazy" alt="' + esc(c.l) + '" src="' + IMGS[c.k] + '" data-a="lbi" data-k="' + c.k + '" data-cap="' + esc(c.l) + '"><figcaption>' + esc(c.l) + '</figcaption></figure>'; }).join('') + '</div></div>'; });
    x += '<div class="dsec"><h4>Mis imágenes</h4><div class="uimgs">' + uimgs('versiones', v) + '</div></div>';
    return x + '</div>';
  }).join('') + '</div>';
  return h;
}
PAGEMOUNT['proyecto/versiones'] = function (pg) { $$('[data-ck]', pg).forEach(function (i) { i.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); ckAdd(i.dataset.ck); } }; }); };
C.verSt = function (el) { var p = {}; p[el.dataset.p] = el.value; patchItem('versiones', el.dataset.id, p); toast((el.dataset.p === 'ios' ? 'iOS' : 'Android') + ': ' + el.value); repaint(); };
C.ckTog = function (el) { var v = item('versiones', el.dataset.id); if (!v) return; var ck = clone(v.checklist || []); ck[+el.dataset.i].d = el.checked; patchItem('versiones', v.id, { checklist: ck }); repaint(); };
A.ckDel = async function (el, ev) { ev.preventDefault(); var v = item('versiones', el.dataset.id); if (!v) return; var ck = clone(v.checklist || []), it = ck[+el.dataset.i]; if (!await confirmDlg({ title: '¿Quitar este punto?', text: it.t, ok: 'Quitar', danger: true })) return; ck.splice(+el.dataset.i, 1); patchItem('versiones', v.id, { checklist: ck }); repaint(); };
A.ckAdd = function (el) { ckAdd(el.dataset.id); };
function ckAdd(id) { var i = document.getElementById('cka_' + id), t = i && i.value.trim(); if (!t) return; var v = item('versiones', id); patchItem('versiones', id, { checklist: (v.checklist || []).concat([{ t: t, d: false }]) }); i.value = ''; repaint(); setTimeout(function () { var n = document.getElementById('cka_' + id); if (n) n.focus(); }, 30); }
A.verNew = function () { verForm(null); };
A.verEdit = function (el) { verForm(item('versiones', el.dataset.id)); };
function verForm(v0) {
  var isNew = !v0, v = v0 || { id: uid('v-'), version: '', android: 'idea', ios: 'idea', espera: '', rama: '', contenido: '', checklist: [] };
  formDrawer({
    title: isNew ? 'Nueva versión' : 'Editar versión ' + esc(v.version),
    body: function () {
      return field('ve_v', 'Versión', inp('ve_v', v.version, { ph: 'Ej. 1.0.7', auto: isNew })) + '<div class="fg">' + field('ve_a', 'Android', sel('ve_a', v.android, VST)) + field('ve_i', 'iOS', sel('ve_i', v.ios, VST)) + '</div>' +
        field('ve_e', 'En espera de…', inp('ve_e', v.espera, { ph: 'Ej. AdMob y Apple' })) + field('ve_r', 'Rama o commit', inp('ve_r', v.rama)) + field('ve_c', 'Qué trae (una línea por cosa)', area('ve_c', v.contenido, { rows: 8 }));
    },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="verDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="verSave" data-id="' + esc(v.id) + '" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + 'Guardar</button>'; }
  });
}
A.verSave = function (el) {
  var n = drawerVal('ve_v').trim(); if (!showErrs(n ? {} : { ve_v: 'Escribe el número de versión' })) return;
  var old = item('versiones', el.dataset.id) || { checklist: [] };
  putItem('versiones', Object.assign({}, old, { id: el.dataset.id, version: n, android: drawerVal('ve_a'), ios: drawerVal('ve_i'), espera: drawerVal('ve_e').trim(), rama: drawerVal('ve_r').trim(), contenido: drawerVal('ve_c').trim() }), !!el.dataset.new);
  drawerKill(); repaint(); toast('Versión guardada');
};
A.verDel = async function (el) { if (await confirmDlg({ title: '¿Borrar esta versión?', text: 'Se quita con su checklist e imágenes.', ok: 'Borrar', danger: true })) { drawerKill(); delItem('versiones', el.dataset.id); } };

/* ---------- IDEAS Y DECISIONES ---------- */
var PRI = { alta: 'bad', media: 'warn', baja: 'line' };
function vIdeas() {
  var I2 = items('ideas').slice().sort(function (a, b) { return (b.votos || 0) - (a.votos || 0); }), D = items('decisiones').slice().sort(function (a, b) { return a.fecha < b.fecha ? 1 : -1; });
  var h = pageHead('Ideas y decisiones', 'Lo que podría venir después (vota para priorizar) y lo que ya decidiste, para no volver a discutirlo.', '<button class="btn" data-a="decNew">' + ic('flag') + 'Decisión</button><button class="btn pri" data-a="ideaNew">' + ic('plus') + 'Idea</button>');
  h += '<div class="grid g2" style="align-items:start"><div><div class="sech"><h2>Ideas</h2><span class="sub">' + I2.length + ' en la lista</span></div><div class="list">' + (I2.map(function (i) {
    return '<div class="li clk" data-a="ideaOpen" data-id="' + esc(i.id) + '"><div class="col gap4" style="align-items:center;flex:none"><button class="btn xs ic" data-a="vote" data-stop="1" data-id="' + esc(i.id) + '" data-d="1" aria-label="Votar a favor">' + ic('chu') + '</button><b style="font-size:15px">' + (i.votos || 0) + '</b><button class="btn xs ic" data-a="vote" data-stop="1" data-id="' + esc(i.id) + '" data-d="-1" aria-label="Votar en contra">' + ic('chd') + '</button></div><div class="t"><b>' + esc(i.texto) + '</b><span>' + chipN('Prioridad ' + i.prioridad, PRI[i.prioridad] || 'line') + '</span></div></div>';
  }).join('') || emptyBox('bulb', 'Sin ideas', 'Anota la primera.')) + '</div></div>';
  h += '<div><div class="sech"><h2>Decisiones tomadas</h2><span class="sub">De la más nueva a la más vieja</span></div><div class="list">' + (D.map(function (d) { var p = String(d.fecha || '').split('-'); return '<div class="li clk" data-a="decOpen" data-id="' + esc(d.id) + '">' + (d.fecha ? '<div class="dbox"><b>' + (+p[2]) + '</b><span>' + MES[+p[1] - 1].slice(0, 3) + '</span></div>' : '') + '<div class="t"><b style="font-weight:500">' + esc(d.texto) + '</b></div></div>'; }).join('') || emptyBox('flag', 'Sin decisiones', '')) + '</div></div></div>';
  return h;
}
A.vote = function (el) { var i = item('ideas', el.dataset.id); if (!i) return; patchItem('ideas', i.id, { votos: Math.max(0, (i.votos || 0) + Number(el.dataset.d)) }); repaint(); };
A.ideaNew = function () { ideaForm(null); };
A.ideaOpen = function (el) { ideaForm(item('ideas', el.dataset.id)); };
function ideaForm(i) {
  var isNew = !i, v = i || { id: uid('i'), texto: '', prioridad: 'media', votos: 0 };
  formDrawer({
    title: isNew ? 'Nueva idea' : 'Editar idea',
    body: function () { return field('id_t', 'Idea', area('id_t', v.texto, { rows: 3 })) + '<div class="f"><span class="fl">Prioridad</span>' + radios('id_p', v.prioridad, [['alta', 'Alta'], ['media', 'Media'], ['baja', 'Baja']]) + '</div>'; },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="ideaDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="ideaSave" data-id="' + esc(v.id) + '" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + 'Guardar</button>'; },
    onMount: function (el) { var t = el.querySelector('#id_t'); if (t && isNew) setTimeout(function () { t.focus(); }, 40); }
  });
}
A.ideaSave = function (el) {
  var t = drawerVal('id_t').trim(); if (!showErrs(t ? {} : { id_t: 'Escribe la idea' })) return;
  var old = item('ideas', el.dataset.id) || { votos: 0 };
  putItem('ideas', Object.assign({}, old, { id: el.dataset.id, texto: t, prioridad: radioVal('id_p') || 'media' }), !!el.dataset.new); drawerKill(); repaint(); toast('Idea guardada');
};
A.ideaDel = function (el) { drawerKill(); delItem('ideas', el.dataset.id); };
A.decNew = function () { decForm(null); };
A.decOpen = function (el) { decForm(item('decisiones', el.dataset.id)); };
function decForm(d) {
  var isNew = !d, v = d || { id: uid('d'), fecha: todayS(), texto: '' };
  formDrawer({
    title: isNew ? 'Nueva decisión' : 'Editar decisión',
    body: function () { return field('de_f', 'Fecha', inp('de_f', v.fecha, { type: 'date' })) + field('de_t', 'Qué se decidió', area('de_t', v.texto, { rows: 4 })); },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="decDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="decSave" data-id="' + esc(v.id) + '" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + 'Guardar</button>'; }
  });
}
A.decSave = function (el) {
  var t = drawerVal('de_t').trim(); if (!showErrs(t ? {} : { de_t: 'Escribe la decisión' })) return;
  putItem('decisiones', Object.assign({}, item('decisiones', el.dataset.id) || {}, { id: el.dataset.id, fecha: drawerVal('de_f'), texto: t }), !!el.dataset.new); drawerKill(); repaint(); toast('Decisión guardada');
};
A.decDel = function (el) { drawerKill(); delItem('decisiones', el.dataset.id); };

VIEWS['proyecto/pendientes'] = vPendientes; VIEWS['proyecto/versiones'] = vVersiones; VIEWS['proyecto/ideas'] = vIdeas;
window.addEventListener('resize', debounce(function () { if (S.route === 'proyecto/pendientes') paintPage(); }, 200));
