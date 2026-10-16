/* ================= JUEGO: premios, progresión, temporadas ================= */
function soloCod(p) {
  if (p.plan === 'codigo') return true; if (p.plan === 'dormido') return false; if (p.gana === 'código') return true;
  var f = p.formas || []; return f.length > 0 && f.every(function (x) { return /^(\d+ )?c[oó]digos? (únicos|maestros|de sticker)/i.test(x); });
}
function pFilt() {
  var f = S.f.pr = S.f.pr || { t: '', r: '', g: '', pl: '', q: '' };
  return items('premios').filter(function (p) {
    if (f.t && grp(p.tipo) !== f.t) return false; if (f.r && p.rareza !== f.r) return false; if (f.g && p.gana !== f.g) return false;
    if (f.pl === 'codigo' && !soloCod(p)) return false; if (f.pl === 'dormido' && p.plan !== 'dormido') return false; if (f.pl === 'idea' && p.estado !== 'idea') return false;
    return match(p.nombre + ' ' + p.tipo + ' ' + (p.detalle || '') + ' ' + (p.cid || '') + ' ' + (p.formas || []).join(' '), f.q);
  }).sort(function (a, b) { return RAR.indexOf(b.rareza) - RAR.indexOf(a.rareza) || (a.nombre < b.nombre ? -1 : 1); });
}
function pCard(p) {
  var flag = p.plan === 'dormido' ? chipN('Dormido', 'warn') : soloCod(p) ? chipN('Solo código', 'ac') : p.estado === 'idea' ? chipN('Idea', 'line') : '';
  var gl = GANA[p.gana] || p.gana;
  return '<button class="pc" data-a="premOpen" data-id="' + esc(p.id) + '"><div class="pw">' + thumb(p, 'pimg') + '<span class="rb" style="--rc:var(' + (RVAR[p.rareza] || '--r-comun') + ')"></span>' + (flag ? '<span class="flag">' + flag + '</span>' : '') + '</div><div class="pb"><b>' + esc(p.nombre) + '</b><div class="row" style="gap:6px">' + rr(p.rareza) + '<span class="xs mut ell">' + esc(p.tipo) + '</span></div><span class="dsc">' + esc(gl) + '</span></div></button>';
}
function vPremios() {
  var f = S.f.pr = S.f.pr || { t: '', r: '', g: '', pl: '', q: '' }, L = pFilt(), P = items('premios');
  var h = pageHead('Premios', 'Todo lo que se puede ganar en Blokku: temas, estilos de pieza, marcos, efectos e insignias. Toca uno para ver cómo se gana.', '<button class="btn" data-a="premNew">' + ic('plus') + 'Premio futuro</button>',
    ['El catálogo viene del código de la app: nombre, rareza y formas de ganarlo se actualizan solos cuando Claude regenera los datos.', 'Lo tuyo se guarda aparte y no se pisa: <b>plan</b> (normal, solo código, dormido), <b>notas</b> e <b>imágenes</b>.', '<b>Solo código</b>: hoy solo se consigue con un código. <b>Dormido</b>: existe pero no se ofrece por ahora.']);
  var cnt = function (t) { return P.filter(function (p) { return grp(p.tipo) === t; }).length; };
  h += '<div class="col gap12 mb16">' + fchips('prT', f.t, [['', 'Todos', P.length]].concat(TIPOS.map(function (t) { return [t[0], t[1], cnt(t[0])]; }))) +
    '<div class="row">' + searchBox('pr_q', f.q, 'Buscar premio, meta o id…', 'prQ') +
    '<select class="sel" style="flex:0 1 180px" data-c="prR" aria-label="Rareza">' + opts([['', 'Todas las rarezas']].concat(RAR.map(function (r) { return [r, r]; })), f.r) + '</select>' +
    '<select class="sel" style="flex:0 1 220px" data-c="prG" aria-label="Cómo se gana">' + opts([['', 'Cualquier forma de ganar']].concat(Object.keys(GANA).map(function (k) { return [k, GANA[k]]; })), f.g) + '</select>' +
    '<select class="sel" style="flex:0 1 180px" data-c="prPl" aria-label="Plan">' + opts([['', 'Cualquier plan'], ['codigo', 'Solo código'], ['dormido', 'Dormidos'], ['idea', 'Ideas (futuros)']], f.pl) + '</select></div></div>';
  h += '<p class="xs mut mb12">' + L.length + ' de ' + P.length + ' premios</p>';
  h += L.length ? '<div class="pgrid">' + L.map(pCard).join('') + '</div>' : '<div class="card">' + emptyBox('gift', 'Ningún premio con esos filtros', 'Quita algún filtro.') + '</div>';
  return h;
}
A.prT = function (el) { S.f.pr.t = el.dataset.v; paintPage(); };
I.prQ = debounce(function (el) { S.f.pr.q = el.value; paintPage(); }, 120);
C.prR = function (el) { S.f.pr.r = el.value; paintPage(); };
C.prG = function (el) { S.f.pr.g = el.value; paintPage(); };
C.prPl = function (el) { S.f.pr.pl = el.value; paintPage(); };
A.premOpen = function (el) { premDrawer(el.dataset.id); };
OPENERS.prem = function (id) { premDrawer(id); };
function ways(p) {
  var w = [], cid = p.cid;
  var hasU = cid && (typeof CODES !== 'undefined' ? CODES : []).some(function (c) { return c.i === cid; });
  (p.formas && p.formas.length ? p.formas : [p.detalle || GANA[p.gana]]).forEach(function (f) { if (f && !(hasU && /c[oó]digos únicos/i.test(f)) && !/^C[oó]digo de sticker/i.test(f)) w.push([/maestro/i.test(f) ? 'key' : 'star', esc(f)]); });
  if (cid) {
    var uc = (typeof CODES !== 'undefined' ? CODES : []).filter(function (c) { return c.i === cid; });
    if (uc.length) { var d = uc.filter(function (c) { return cst(c.h) === 'disponible'; }).length; w.push(['key', '<b>' + uc.length + ' códigos únicos</b> · ' + d + ' disponibles · <a href="#/codigos/unicos" data-a="ucGo" data-c="' + esc(cid) + '" data-n="' + esc(p.nombre) + '">ver</a>']); }
    var rc = rows('codigos').filter(function (c) { return (c.cosmeticos || []).indexOf(cid) >= 0; });
    if (rc.length) w.push(['zap', '<b>' + rc.length + ' código' + (rc.length > 1 ? 's' : '') + ' rotativo' + (rc.length > 1 ? 's' : '') + '</b>: ' + rc.slice(0, 4).map(function (c) { return '<a href="#/codigos/rotativos?open=code:' + esc(c.id) + '" class="mono">' + esc(c.mostrar) + '</a> (' + EST_L[cEst(c)].toLowerCase() + ')'; }).join(', ') + (rc.length > 4 ? '…' : '')]);
    rows('eventos').filter(function (e) { return (e.premios || []).indexOf(cid) >= 0; }).forEach(function (e) { w.push(['cal', 'Evento remoto <a href="#/vivo/eventos?open=ev:' + esc(e.id) + '">' + esc(ml(e.nombre) || e.id) + '</a> · ' + fdt(e.inicio, 1) + ' → ' + fdt(e.fin, 1) + ' (' + EST_L[evEst(e)].toLowerCase() + ')']); });
  }
  items('cupones').filter(function (c) { return (c.premios || []).indexOf(p.id) >= 0; }).forEach(function (c) { w.push(['sticker', 'Sticker <span class="code">' + esc(c.codigo) + '</span>']); });
  items('timeline').filter(function (x) { return (x.premios || []).indexOf(p.id) >= 0; }).forEach(function (x) { w.push(['spark', 'Calendario: <a href="#/juego/temporadas?open=tl:' + esc(x.id) + '">' + esc(x.titulo) + '</a> · ' + fdr(x.inicio, x.fin)]); });
  (SEED_DOC.rutaNivel || []).filter(function (r) { return r.premio === p.id; }).forEach(function (r) { w.push(['trend', 'Ruta de nivel: <b>nivel ' + r.nivel + '</b>']); });
  (SEED_DOC.marcosNivel || []).filter(function (r) { return r.premio === p.id; }).forEach(function (r) { w.push(['trend', 'Marco por nivel: <b>nivel ' + r.nivel + '</b>']); });
  (SEED_DOC.rutaReto || []).filter(function (r) { return r.premio === p.id; }).forEach(function (r) { w.push(['flag', 'Racha de retos: <b>' + r.dias + ' días</b>']); });
  return w;
}
A.ucGo = function (el, ev) { ev.preventDefault(); S.f.uq = el.dataset.n; S.open['u_' + el.dataset.c] = true; go('codigos/unicos'); };
function premDrawer(id) {
  if (!prem(id)) return;
  drawer({
    live: true,
    title: function () { var p = prem(id); return p ? esc(p.nombre) : ''; },
    sub: function () { var p = prem(id); return p ? esc(p.tipo) + (p.cid ? ' · <span class="mono">' + esc(p.cid) + '</span>' : '') : ''; },
    body: function () {
      var p = prem(id); if (!p) return emptyBox('gift', 'Este premio ya no existe', '');
      var big = pimg(p, true), m = MAPA[p.id];
      var h = big ? '<img class="bigimg" alt="" src="' + esc(big) + '" data-a="lb" data-src="' + esc(big) + '" data-cap="' + esc(p.nombre) + '">' : '<div class="th" style="width:100%;height:200px;border-radius:14px;font-size:64px;--tc:' + (RHEX[p.rareza] || '#9ca3af') + (p.pal ? ';background:linear-gradient(140deg,' + col(p.pal[0]) + ',' + col(p.pal[1]) + ')' : '') + '">' + esc(p.nombre.charAt(0)) + '</div>';
      h += '<div class="row mt12">' + rr(p.rareza) + chipN(GANA[p.gana] || p.gana, 'ac') + chipN(p.estado || '', p.estado === 'en la app' ? 'ok' : 'line') + (p.coleccion ? chipN('Colección ' + p.coleccion, 'line') : '') + (p.estreno ? chipN('Versión ' + p.estreno, 'line') : '') + '</div>';
      h += '<div class="dsec"><h4>Plan</h4>' + seg('premPlan" data-id="' + esc(p.id), p.plan || '', [['', 'Normal'], ['codigo', 'Solo código'], ['dormido', 'Dormido']], ' full') + '<p class="xs mut mt8">' + ({ '': 'Se ofrece como dice el catálogo.', codigo: 'Decidiste que solo se consiga con código.', dormido: 'Existe en el juego, pero no lo ofreces por ahora.' }[p.plan || '']) + '</p></div>';
      h += '<div class="dsec"><h4>Todas las formas de ganarlo</h4><div class="ways">' + ways(p).map(function (w) { return '<div class="way"><span class="wi">' + ic(w[0]) + '</span><div>' + w[1] + '</div></div>'; }).join('') + '</div></div>';
      h += '<div class="dsec"><h4>Notas</h4><textarea class="ta" id="pr_nota" data-c="premNota" data-id="' + esc(p.id) + '" placeholder="Ideas, pendientes, a quién se lo diste…">' + esc(p.nota || '') + '</textarea><p class="xs mut mt4">Se guarda sola al salir del campo.</p></div>';
      h += '<div class="dsec"><h4>Imágenes</h4><div class="uimgs">' + uimgs('premios', p) + (m && m.big && IMGS[m.big] ? '<div class="uimg"><img alt="" src="' + IMGS[m.big] + '" data-a="lbi" data-k="' + m.big + '" data-cap="' + esc(p.nombre) + ' en partida"></div>' : '') + '</div></div>';
      return h;
    },
    foot: function () { var p = prem(id); return p ? '<button class="btn" data-a="premEdit" data-id="' + esc(p.id) + '">' + ic('edit') + 'Editar datos</button><span class="sp"></span><button class="btn pri" data-a="drClose">Listo</button>' : ''; }
  });
}
A.premPlan = function (el) { var id = el.closest('[data-id]').dataset.id; patchItem('premios', id, { plan: el.dataset.v }); repaint(); drawerRefresh(); toast('Plan: ' + PLAN_L[el.dataset.v]); };
C.premNota = function (el) { patchItem('premios', el.dataset.id, { nota: el.value.trim() }); toast('Nota guardada'); };
A.premNew = function () { premForm(null); };
A.premEdit = function (el) { premForm(prem(el.dataset.id)); };
function premForm(p) {
  var isNew = !p, v = p || { id: uid('p-'), nombre: '', tipo: 'Por definir', rareza: 'Mítico', gana: 'evento', detalle: '', estado: 'idea', estreno: '', plan: '' };
  formDrawer({
    title: isNew ? 'Premio futuro' : 'Editar ' + esc(v.nombre),
    sub: v.cid ? 'Ojo: nombre, tipo, rareza y forma de ganarlo vienen del código de la app y se vuelven a poner solos cuando Claude actualiza el catálogo.' : 'Un premio que todavía no existe en la app.',
    body: function () {
      return field('pf_n', 'Nombre', inp('pf_n', v.nombre, { auto: isNew, max: 60 })) + '<div class="fg">' + field('pf_t', 'Tipo', inp('pf_t', v.tipo, { ph: 'Tema, Estilo de pieza, Marco…' })) + field('pf_r', 'Rareza', sel('pf_r', v.rareza, RAR)) + '</div>' +
        '<div class="fg">' + field('pf_g', 'Cómo se gana', sel('pf_g', v.gana, Object.keys(GANA).map(function (k) { return [k, GANA[k]]; }))) + field('pf_e', 'Estado', sel('pf_e', v.estado, ['en la app', 'estreno programado', 'idea'])) + '</div>' +
        field('pf_d', 'Meta o detalle', area('pf_d', v.detalle, { rows: 2 })) + field('pf_v', 'Versión de estreno', inp('pf_v', v.estreno, { ph: 'Ej. 1.0.6' }));
    },
    foot: function () { return (isNew || v.cid ? '' : '<button class="btn ghost dng" data-a="premDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="premSave" data-id="' + esc(v.id) + '" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + 'Guardar</button>'; }
  });
}
A.premSave = function (el) {
  var n = drawerVal('pf_n').trim(); if (!showErrs(n ? {} : { pf_n: 'Escribe el nombre' })) return;
  var old = prem(el.dataset.id) || {};
  putItem('premios', Object.assign({}, old, { id: el.dataset.id, nombre: n, tipo: drawerVal('pf_t').trim(), rareza: drawerVal('pf_r'), gana: drawerVal('pf_g'), estado: drawerVal('pf_e'), detalle: drawerVal('pf_d').trim(), estreno: drawerVal('pf_v').trim() }), !!el.dataset.new);
  drawerKill(); repaint(); toast('Premio guardado'); if (!el.dataset.new) premDrawer(el.dataset.id);
};
A.premDel = async function (el) { if (await confirmDlg({ title: '¿Borrar este premio?', text: 'Solo se quita del panel.', ok: 'Borrar', danger: true })) { drawerKill(); delItem('premios', el.dataset.id); } };

/* ---------- PROGRESIÓN ---------- */
var TIER = ['Bronce', 'Plata', 'Oro', 'Diamante', 'Imposible'], TIERC = ['#b45309', '#64748b', '#d97706', '#0891b2', '#db2777'];
function xpL(L) { return 125 * (L - 1) * (L - 1); }
function sc(p, sub) { return '<div class="sc" data-a="premOpen" data-id="' + esc(p.id) + '" role="link" tabindex="0">' + thumb(p, 'sm') + '<div class="t"><b>' + esc(p.nombre) + '</b><span>' + esc(sub) + '</span></div>' + rr(p.rareza) + '</div>'; }
function vProgresion() {
  var v = S.f.pg || 'niveles';
  var h = pageHead('Progresión', 'Cómo avanza un jugador: niveles del 1 al 100, logros por escalones, metas especiales y la racha de retos diarios. Así está en el juego.', '',
    ['XP para llegar al nivel L: <b>125 · (L − 1)²</b>. Cada partida da 20 XP base más líneas (tope 3.000).', 'Los logros tienen 5 escalones: Bronce, Plata, Oro, Diamante e Imposible (200 · 500 · 1.500 · 5.000 · 15.000 XP).', 'Toca cualquier premio para ver todas sus formas de ganarlo.']);
  h += '<div class="mb16">' + seg('pgV', v, [['niveles', 'Niveles', 'trend'], ['logros', 'Logros', 'trophy'], ['metas', 'Metas especiales', 'star'], ['racha', 'Racha y marcos', 'flag']]) + '</div>';
  if (v === 'logros') return h + pgLogros();
  if (v === 'metas') return h + pgMetas();
  if (v === 'racha') return h + pgRacha();
  var m = {}, ini = items('premios').filter(function (p) { return p.gana === 'inicio'; });
  (SEED_DOC.rutaNivel || []).forEach(function (r) { (m[r.nivel] = m[r.nivel] || []).push({ k: 'Ruta de nivel', p: prem(r.premio) }); });
  (SEED_DOC.marcosNivel || []).forEach(function (r) { (m[r.nivel] = m[r.nivel] || []).push({ k: 'Marco por nivel', p: prem(r.premio) }); });
  var lv = Object.keys(m).map(Number).sort(function (a, b) { return a - b; });
  function node(cls, l, xp, body) { return '<div class="lvl ' + cls + '"><div class="lv"><b>' + l + '</b><span>' + xp + '</span></div><div class="rail"><i></i></div><div class="cds">' + body + '</div></div>'; }
  var prev = 1, tl = node('ini', 'Nivel 1', '0 XP', ini.map(function (p) { return sc(p, 'Gratis desde el inicio'); }).join(''));
  lv.forEach(function (n) {
    var its = m[n].filter(function (x) { return x.p; });
    if (n - prev > 1) tl += '<div class="lvl gp"><div class="lv"></div><div class="rail"></div><div class="gx">+' + (n - prev) + ' niveles · +' + nf(xpL(n) - xpL(prev)) + ' XP</div></div>';
    tl += node(n === 100 ? 'fin' : '', 'Nivel ' + n, nf(xpL(n)) + ' XP', its.map(function (x) { return sc(x.p, x.k + ' · ' + x.p.tipo); }).join('') + (n === 100 ? '<div class="sc pl0"><div class="t"><b>MÁX</b><span>Fin de la ruta</span></div></div>' : '')); prev = n;
  });
  if (100 - prev > 1) tl += '<div class="lvl gp"><div class="lv"></div><div class="rail"></div><div class="gx">+' + (100 - prev) + ' niveles · +' + nf(xpL(100) - xpL(prev)) + ' XP</div></div>';
  if (prev !== 100) tl += node('fin', 'Nivel 100', nf(xpL(100)) + ' XP', '<div class="sc pl0"><div class="t"><b>MÁX</b><span>Fin de la ruta</span></div></div>');
  return h + '<div class="card pad">' + tl + '</div>';
}
function pgLogros() {
  return (SEED_DOC.logros || []).map(function (l) {
    return '<div class="card pad mb12"><h3 style="font-size:16px;font-weight:700;margin-bottom:12px">' + esc(l.familia) + '</h3><div class="tiers">' + l.niveles.map(function (n, i) {
      var pp = ((l.premios && l.premios[i]) || []).map(prem).filter(Boolean);
      return '<div class="tier" style="--tc:' + TIERC[i] + '"><h5>' + TIER[i] + (l.xp ? ' · ' + nf(l.xp[i]) + ' XP' : '') + '</h5><p>' + esc(n) + '</p>' + (pp.length ? pp.map(function (p) { return '<div class="g" data-a="premOpen" data-id="' + esc(p.id) + '">' + thumb(p, 'xs') + '<span>' + esc(p.nombre) + '</span></div>'; }).join('') : '<span class="chip line">Solo XP</span>') + '</div>';
    }).join('') + '</div></div>';
  }).join('');
}
function pgMetas() {
  var M = SEED_DOC.metas || [], G = [];
  M.forEach(function (m) { if (G.indexOf(m.grupo) < 0) G.push(m.grupo); });
  return G.map(function (g) {
    return '<div class="sech mt16"><h2>' + esc(g) + '</h2></div><div class="list mb16">' + M.filter(function (m) { return m.grupo === g; }).map(function (m) {
      var ps = (m.premios || []).map(prem).filter(Boolean);
      return '<div class="li' + (ps.length ? ' clk" data-a="premOpen" data-id="' + esc(ps[0].id) : '') + '">' + (ps[0] ? thumb(ps[0]) : '<div class="th">?</div>') + '<div class="t"><b>' + esc(m.nombre) + '</b><span>' + esc(m.meta) + (ps.length ? ' → ' + esc(ps.map(function (p) { return p.nombre; }).join(' + ')) : '') + '</span></div><div class="r">' + (m.xp ? '<span class="xs mut nowrap">' + nf(m.xp) + ' XP</span>' : '') + (ps[0] ? rr(ps[0].rareza) : '') + '</div></div>';
    }).join('') + '</div>';
  }).join('');
}
function pgRacha() {
  var h = '<div class="sech"><h2>Racha de retos diarios</h2><span class="sub">Días seguidos completando el reto del día.</span></div><div class="route mb16">' + (SEED_DOC.rutaReto || []).map(function (r) { var p = prem(r.premio); return '<div class="rs"' + (p ? ' data-a="premOpen" data-id="' + esc(p.id) + '"' : '') + '>' + (p ? thumb(p, 'lg') : '<div class="th lg">?</div>') + '<b>' + r.dias + ' días</b><span>' + esc(p ? p.nombre : 'por definir') + '</span></div>'; }).join('') + '</div>';
  h += '<div class="sech sec"><h2>Marcos por nivel</h2><span class="sub">Se desbloquean solos al llegar al nivel.</span></div><div class="route">' + (SEED_DOC.marcosNivel || []).map(function (r) { var p = prem(r.premio); return '<div class="rs"' + (p ? ' data-a="premOpen" data-id="' + esc(p.id) + '"' : '') + '>' + (p ? thumb(p, 'lg') : '<div class="th lg">?</div>') + '<b>Nivel ' + r.nivel + '</b><span>' + esc(p ? p.nombre : '—') + '</span></div>'; }).join('') + '</div>';
  return h;
}
A.pgV = function (el) { S.f.pg = el.dataset.v; paintPage(); };

/* ---------- TEMPORADAS (calendario) ---------- */
var TT = { version: 'Versión', evento: 'Evento', temporada: 'Temporada', estreno: 'Estreno de premios', hito: 'Hito' };
var TTC = { version: '#0ea5e9', evento: '#5b4cf0', temporada: '#e64aa0', estreno: '#94a3b8', hito: '#16a34a', remoto: '#7c3aed', idea: '#94a3b8' };
function calItems() {
  var out = [], remote = {};
  rows('eventos').forEach(function (e) { if (REPLACES[e.id]) remote[REPLACES[e.id]] = e.id; out.push({ id: 'ev:' + e.id, t: ml(e.nombre) || e.id, a: ymd(new Date(e.inicio)), b: ymd(new Date(new Date(e.fin).getTime() - 1)), c: e.activo ? TTC.remoto : '#94a3b8', src: e.activo ? 'Remoto (en la app)' : 'Remoto (apagado)', o: 'ev:' + e.id, r: 'vivo/eventos', off: !e.activo }); });
  items('timeline').forEach(function (x) { if (remote[x.id]) return; out.push({ id: x.id, t: x.titulo, a: x.inicio, b: x.fin || x.inicio, c: x.estado === 'idea' ? TTC.idea : TTC[x.tipo] || '#5b4cf0', src: (TT[x.tipo] || x.tipo) + (x.estado === 'idea' ? ' · idea' : ''), o: 'tl:' + x.id, r: 'juego/temporadas', estreno: x.tipo === 'estreno', idea: x.estado === 'idea' }); });
  return out;
}
function onDay(L, s) { var n = dn(s), dow = (new Date(n * 864e5).getUTCDay() + 6) % 7; return L.filter(function (x) { if (n < dn(x.a) || n > dn(x.b)) return false; return x.estreno ? dow === 0 : true; }); }
function vTemporadas() {
  rm('eventos');
  var C = S.f.cal = S.f.cal || { y: new Date().getFullYear(), m: new Date().getMonth(), sel: todayS(), v: 'mes' };
  var h = pageHead('Temporadas', 'El calendario completo: versiones, eventos, temporadas e hitos que planeas, junto con los eventos remotos que ya están en la app.', '<button class="btn pri" data-a="tlNew">' + ic('plus') + 'Agregar al calendario</button>',
    ['Lo <b>morado oscuro</b> es un evento remoto: ya está en Supabase y la app lo usa.', 'Lo demás es tu plan. Para que un evento planeado llegue a la app, créalo en En vivo › Eventos.', 'Las ideas se ven en gris.']);
  h += '<div class="row mb16">' + seg('calV', C.v, [['mes', 'Mes', 'cal'], ['linea', 'Línea de tiempo', 'trend'], ['lista', 'Lista', 'list']]) + '</div>';
  var L = calItems();
  if (C.v === 'linea') {
    var from = Date.now() - 14 * 864e5, to = Date.now() + 200 * 864e5;
    var R = L.filter(function (x) { return !x.estreno; }).map(function (x) { return { grp: x.src.indexOf('Remoto') === 0 ? 'En la app' : x.idea ? 'Ideas' : 'Planeado', label: x.t, sub: fdr(x.a, x.b), a: dayMs(x.a), b: dayMs(x.b, 1), c: x.c, ghost: x.idea, off: x.off, tip: x.src, r: x.r, o: x.o }; }).filter(function (r) { return r.b >= from && r.a <= to; });
    var o = { 'En la app': 0, 'Planeado': 1, 'Ideas': 2 }; R.sort(function (a, b) { return o[a.grp] - o[b.grp] || a.a - b.a; });
    return h + '<div class="card pad">' + gantt(R, from, to) + '</div>';
  }
  if (C.v === 'lista') {
    var t = dn(todayS()), F = L.filter(function (x) { return dn(x.b) >= t - 30; }).sort(function (a, b) { return dn(a.a) - dn(b.a); });
    return h + '<div class="list">' + (F.map(function (x) { var p = x.a.split('-'); return '<div class="li clk" data-a="openx" data-r="' + x.r + '" data-o="' + esc(x.o) + '"><div class="dbox" style="border-left:3px solid ' + x.c + '"><b>' + (+p[2]) + '</b><span>' + MES[+p[1] - 1].slice(0, 3) + '</span></div><div class="t"><b>' + esc(x.t) + '</b><span>' + esc(x.src) + ' · ' + fdr(x.a, x.b) + '</span></div><span class="xs mut nowrap">' + (dn(x.a) <= t && dn(x.b) >= t ? 'en curso' : dn(x.b) < t ? 'terminó' : relDay(x.a)) + '</span></div>'; }).join('') || emptyBox('cal', 'Nada en el calendario', '')) + '</div>';
  }
  var first = Date.UTC(C.y, C.m, 1) / 864e5, off = (new Date(first * 864e5).getUTCDay() + 6) % 7, dim = new Date(Date.UTC(C.y, C.m + 1, 0)).getUTCDate(), weeks = Math.ceil((off + dim) / 7), td = todayS();
  var cal = '<div class="row mb12"><h2 style="font-size:20px;font-weight:800;text-transform:capitalize;flex:1">' + MES[C.m] + ' ' + C.y + '</h2><button class="btn sm" data-a="calMv" data-d="0">Hoy</button><button class="btn sm ic" data-a="calMv" data-d="-1" aria-label="Mes anterior">' + ic('chl') + '</button><button class="btn sm ic" data-a="calMv" data-d="1" aria-label="Mes siguiente">' + ic('chr') + '</button></div><div class="cal">' + ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(function (d) { return '<div class="dw">' + d + '</div>'; }).join('');
  for (var i = 0; i < weeks * 7; i++) {
    var n = first - off + i, s = iso(n), dd = new Date(n * 864e5), its = onDay(L, s);
    cal += '<button class="cell' + (dd.getUTCMonth() !== C.m ? ' out' : '') + (s === td ? ' today' : '') + (s === C.sel ? ' sel' : '') + '" data-a="calDay" data-d="' + s + '" aria-label="' + fd(s, 1) + (its.length ? ', ' + its.length + ' cosas' : '') + '"><span class="dn">' + dd.getUTCDate() + '</span>' + its.slice(0, 2).map(function (x) { return '<span class="ev" style="--gc:' + x.c + '">' + esc(x.t) + '</span>'; }).join('') + (its.length > 2 ? '<span class="more">+' + (its.length - 2) + ' más</span>' : '') + '<span class="dots">' + its.slice(0, 4).map(function (x) { return '<i style="--gc:' + x.c + '"></i>'; }).join('') + '</span></button>';
  }
  cal += '</div>';
  var sel2 = onDay(L, C.sel);
  var side = '<div class="card"><div class="ch">' + ic('cal') + '<h3>' + fd(C.sel, 1) + '</h3><span class="sub">' + relDay(C.sel) + '</span></div>' + (sel2.length ? sel2.map(function (x) { return '<div class="li clk" data-a="openx" data-r="' + x.r + '" data-o="' + esc(x.o) + '"><span style="width:4px;align-self:stretch;border-radius:4px;background:' + x.c + '"></span><div class="t"><b>' + esc(x.t) + '</b><span>' + esc(x.src) + ' · ' + fdr(x.a, x.b) + '</span></div>' + ic('chr', 'faint') + '</div>'; }).join('') : '<div class="cb mut">Nada este día.</div>') + '<div class="cb" style="border-top:1px solid var(--border)"><button class="btn sm" data-a="tlNew" data-d="' + C.sel + '">' + ic('plus') + 'Agregar este día</button></div></div>';
  side += '<div class="legend mt12">' + [['remoto', 'Evento remoto'], ['evento', 'Evento planeado'], ['temporada', 'Temporada'], ['version', 'Versión'], ['hito', 'Hito'], ['idea', 'Idea']].map(function (x) { return '<span><i style="--gc:' + TTC[x[0]] + '"></i>' + x[1] + '</span>'; }).join('') + '</div>';
  return h + '<div class="calw"><div class="card pad">' + cal + '</div><div>' + side + '</div></div>';
}
A.calV = function (el) { S.f.cal.v = el.dataset.v; paintPage(); };
A.calMv = function (el) { var C = S.f.cal, n = Number(el.dataset.d); if (!n) { var t = new Date(); C.y = t.getFullYear(); C.m = t.getMonth(); C.sel = todayS(); } else { C.m += n; if (C.m < 0) { C.m = 11; C.y--; } if (C.m > 11) { C.m = 0; C.y++; } } paintPage(); };
A.calDay = function (el) { var C = S.f.cal, d = new Date(dn(el.dataset.d) * 864e5); C.sel = el.dataset.d; C.y = d.getUTCFullYear(); C.m = d.getUTCMonth(); paintPage(); };
A.tlNew = function (el) { tlForm(null, el.dataset.d); };
OPENERS.tl = function (id) { tlDrawer(id); };
function tlDrawer(id) {
  if (!item('timeline', id)) return;
  drawer({
    live: true, title: function () { var x = item('timeline', id); return x ? esc(x.titulo) : ''; },
    sub: function () { var x = item('timeline', id); return x ? esc(TT[x.tipo] || x.tipo) + ' · ' + fdr(x.inicio, x.fin) + ' · ' + relDay(x.inicio) : ''; },
    body: function () {
      var x = item('timeline', id); if (!x) return emptyBox('cal', 'Ya no existe', '');
      var ev = items('eventos_plan').find(function (e) { return e.nombre === x.titulo || (x.titulo.indexOf(e.nombre) === 0 && e.nombre.length > 6); });
      var h = '<div class="row">' + chipN(x.estado, x.estado === 'idea' ? 'line' : x.estado === 'publicada' ? 'ok' : 'ac') + '</div>' + (x.notas ? '<p class="mt12">' + esc(x.notas) + '</p>' : '');
      if (ev) h += '<div class="dsec"><h4>Plan del evento</h4><dl class="dkv"><dt>Meta</dt><dd>' + esc(ev.meta) + '</dd><dt>Premio</dt><dd>' + esc(ev.premio) + (ev.noVuelve ? ' · no vuelve' : '') + '</dd>' + (ev.notas ? '<dt>Notas</dt><dd>' + esc(ev.notas) + '</dd>' : '') + '</dl></div>';
      var rid = Object.keys(REPLACES).find(function (k) { return REPLACES[k] === x.id; }), re = rid && rows('eventos').find(function (e) { return e.id === rid; });
      if (re) h += '<div class="ban info">' + ic('live') + '<div class="tx"><b>Ya está en la app como evento remoto</b>' + esc(fdt(re.inicio)) + ' → ' + esc(fdt(re.fin)) + ' · ' + esc(goalTxt(re.meta, re.objetivo)) + '<div class="acts"><a class="btn sm" href="#/vivo/eventos?open=ev:' + esc(re.id) + '">Abrir evento</a></div></div></div>';
      else if ((x.tipo === 'evento' || x.tipo === 'temporada') && x.estado !== 'idea') h += '<div class="ban">' + ic('info') + '<div class="tx"><b>Todavía no es un evento remoto</b>Para que la app lo muestre sin versión nueva, créalo en En vivo › Eventos.<div class="acts"><button class="btn sm" data-a="tlToEv" data-id="' + esc(x.id) + '">' + ic('plus') + 'Crear evento remoto con estas fechas</button></div></div></div>';
      var ps = (x.premios || []).map(prem).filter(Boolean);
      if (ps.length) h += '<div class="dsec"><h4>Premios</h4><div class="col">' + ps.map(function (p) { return sc(p, p.tipo + ' · ' + (GANA[p.gana] || '')); }).join('') + '</div></div>';
      h += '<div class="dsec"><h4>Imágenes</h4><div class="uimgs">' + uimgs('timeline', x) + '</div></div>';
      return h;
    },
    foot: function () { return '<button class="btn" data-a="tlEdit" data-id="' + esc(id) + '">' + ic('edit') + 'Editar</button><span class="sp"></span><button class="btn pri" data-a="drClose">Listo</button>'; }
  });
}
A.tlEdit = function (el) { tlForm(item('timeline', el.dataset.id)); };
A.tlToEv = function (el) {
  var x = item('timeline', el.dataset.id); if (!x) return;
  var cids = (x.premios || []).map(function (id) { var p = prem(id); return p && p.cid; }).filter(Boolean);
  evForm(null, { id: norm(x.titulo).replace(/[^a-z0-9]+/g, '').slice(0, 30), nombre: { es: x.titulo.replace(/\s*\(.*\)$/, '') }, descripcion: { es: x.notas || '' }, inicio: new Date(dayMs(x.inicio)).toISOString(), fin: new Date(dayMs(x.fin || x.inicio, 1) + 1000).toISOString(), premios: cids });
};
function tlForm(x, day) {
  var isNew = !x, v = x || { id: uid('t-'), titulo: '', tipo: 'evento', inicio: day || todayS(), fin: '', estado: 'programado', notas: '', premios: [] };
  formDrawer({
    title: isNew ? 'Agregar al calendario' : 'Editar ' + esc(v.titulo),
    body: function () {
      return field('tl_t', 'Título', inp('tl_t', v.titulo, { auto: isNew, max: 80 })) + '<div class="fg">' + field('tl_ty', 'Tipo', sel('tl_ty', v.tipo, Object.keys(TT).map(function (k) { return [k, TT[k]]; }))) + field('tl_e', 'Estado', sel('tl_e', v.estado, ['publicada', 'en revisión', 'lista', 'programado', 'en desarrollo', 'idea'])) + '</div>' +
        '<div class="fg">' + field('tl_a', 'Empieza', inp('tl_a', v.inicio, { type: 'date' })) + field('tl_b', 'Termina (opcional)', inp('tl_b', v.fin, { type: 'date' })) + '</div>' + field('tl_n', 'Notas', area('tl_n', v.notas)) + field('tl_p', 'Premios que da', picker('tlp', v.premios || [], { by: 'id' }));
    },
    foot: function () { return (isNew ? '' : '<button class="btn ghost dng" data-a="tlDel" data-id="' + esc(v.id) + '">' + ic('trash') + 'Borrar</button>') + '<span class="sp"></span><button class="btn" data-a="drClose">Cancelar</button><button class="btn pri" data-a="tlSave" data-id="' + esc(v.id) + '" data-new="' + (isNew ? 1 : '') + '">' + ic('check') + 'Guardar</button>'; }
  });
}
A.tlSave = function (el) {
  var t = drawerVal('tl_t').trim(), a = drawerVal('tl_a'), b = drawerVal('tl_b'), e = {};
  if (!t) e.tl_t = 'Escribe un título'; if (!a) e.tl_a = 'Elige la fecha'; if (a && b && b < a) e.tl_b = 'Debe ser después del inicio';
  if (!showErrs(e)) return;
  var old = item('timeline', el.dataset.id) || {};
  putItem('timeline', Object.assign({}, old, { id: el.dataset.id, titulo: t, tipo: drawerVal('tl_ty'), estado: drawerVal('tl_e'), inicio: a, fin: b, notas: drawerVal('tl_n').trim(), premios: pkSel('tlp') }), !!el.dataset.new);
  drawerKill(); repaint(); toast('Guardado en el calendario');
};
A.tlDel = async function (el) { if (await confirmDlg({ title: '¿Borrar del calendario?', ok: 'Borrar', danger: true })) { drawerKill(); delItem('timeline', el.dataset.id); } };

VIEWS['juego/premios'] = vPremios; VIEWS['juego/progresion'] = vProgresion; VIEWS['juego/temporadas'] = vTemporadas;
