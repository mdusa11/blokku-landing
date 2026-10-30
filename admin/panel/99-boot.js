/* ================= arranque ================= */
window.addEventListener('error', function (e) { if (e.error && e.error.ro) { e.preventDefault(); return; } if (typeof PREVIEW !== 'undefined' && PREVIEW) document.title = 'ERR ' + e.message + ' @' + e.lineno; toast('Algo falló: ' + e.message, 'bad'); });
window.addEventListener('unhandledrejection', function (e) { if (e.reason && e.reason.ro) { e.preventDefault(); return; } var m = e.reason && e.reason.message || String(e.reason); if (typeof PREVIEW !== 'undefined' && PREVIEW) document.title = 'REJ ' + m; });
/* hay algo escrito sin guardar (o el cursor está en un campo): los refrescos automáticos esperan para no borrarlo */
function editando() {
  var pg = document.getElementById('page'); if (!pg) return false;
  var ae = document.activeElement;
  if (ae && pg.contains(ae) && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.type !== 'checkbox' && ae.type !== 'radio' && ae.type !== 'button') return true;
  var f = pg.querySelectorAll('input,textarea,select');
  for (var i = 0; i < f.length; i++) {
    var e = f[i];
    if (e.type === 'checkbox' || e.type === 'radio') { if (e.checked !== e.defaultChecked) return true; }
    else if (e.tagName === 'SELECT') { var d = 0; for (var j = 0; j < e.options.length; j++) if (e.options[j].defaultSelected) { d = j; break; } if (e.selectedIndex !== d) return true; }
    else if (e.type !== 'file' && e.type !== 'button' && e.value !== e.defaultValue) return true;
  }
  return false;
}
(function boot() {
  if (IMGS.icono) { var l = document.createElement('link'); l.rel = 'icon'; l.href = IMGS.icono; document.head.appendChild(l); }
  route();
  rloadAll();
  loadPanel().then(function () {
    if (DB.needInit && !legacyDoc()) { runMigration(docToSections(clone(SEED_DOC), false), false, 'Preparando tu panel'); return; }
    repaint();
  });
  setInterval(function () { if (document.visibilityState === 'visible' && !editando()) refreshPanel(); }, 45000);
  setInterval(function () { if (document.visibilityState === 'visible' && !editando()) rloadAll(); }, 120000);
  setInterval(paintSync, 30000);
  dropPoll();
})();
