/* ================= arranque ================= */
window.addEventListener('error', function (e) { if (e.error && e.error.ro) { e.preventDefault(); return; } if (typeof PREVIEW !== 'undefined' && PREVIEW) document.title = 'ERR ' + e.message + ' @' + e.lineno; toast('Algo falló: ' + e.message, 'bad'); });
window.addEventListener('unhandledrejection', function (e) { if (e.reason && e.reason.ro) { e.preventDefault(); return; } var m = e.reason && e.reason.message || String(e.reason); if (typeof PREVIEW !== 'undefined' && PREVIEW) document.title = 'REJ ' + m; });
(function boot() {
  if (IMGS.icono) { var l = document.createElement('link'); l.rel = 'icon'; l.href = IMGS.icono; document.head.appendChild(l); }
  route();
  rloadAll();
  loadPanel().then(function () {
    if (DB.needInit && !legacyDoc()) { runMigration(docToSections(clone(SEED_DOC), false), false, 'Preparando tu panel'); return; }
    repaint();
  });
  setInterval(function () { if (document.visibilityState === 'visible') refreshPanel(); }, 45000);
  setInterval(function () { if (document.visibilityState === 'visible') rloadAll(); }, 120000);
  setInterval(paintSync, 30000);
  dropPoll();
})();
