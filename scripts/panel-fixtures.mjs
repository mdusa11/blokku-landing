import { readFileSync } from 'node:fs';
// Datos falsos para scripts/shot-panel.mjs (nada real).

const cfg = (grupo, clave, valor, def, lo, hi, nota) => ({ grupo, clave, valor, def, lo, hi, nota });
const isoIn = (d) => new Date(Date.now() + d * 864e5).toISOString();
const SOLO = {
  ahora: isoIn(0), activa: true,
  config: [
    cfg('general', 'gemas_activo', 1, 1, 0, 1, 'Gemas encendidas'),
    cfg('gastos', 'casillas_activo', 0, 0, 0, 1, 'Ofertas premium del día'),
    cfg('gastos', 'cambio_bloques_activo', 1, 1, 0, 1, 'Cambiar gemas por Bloques'),
    cfg('precios', 'paquete_mitico', 120, 150, 10, 10000, 'Paquete mítico con gemas'),
    cfg('precios', 'casilla_chica', 40, 40, 10, 10000, 'Casilla chica'),
    cfg('pase', 'pase_precio', 500, 500, 10, 10000, 'Precio del pase'),
    cfg('precios', 'pase_nivel', 30, 30, 10, 10000, 'Nivel del pase'),
    cfg('precios', 'protector', 60, 60, 10, 10000, 'Protector de racha'),
    cfg('cambio', 'bloques_por_gema', 40, 40, 1, 1000, 'Bloques por cada gema'),
    cfg('cambio', 'bloques_min', 10, 10, 1, 1000, 'Mínimo de gemas por cambio'),
    cfg('cambio', 'bloques_max', 500, 500, 1, 10000, 'Máximo de gemas por cambio'),
    cfg('topes', 'tope_hora', 2000, 2000, 10, 100000, 'Gastos por hora'),
  ],
  tienda: [{ clave: 'precio_comun', valor: 3000, lo: 10, hi: 100000, nota: 'Precio común' }, { clave: 'precio_raro', valor: 9000, lo: 10, hi: 200000, nota: 'Precio raro' }],
  paquetes: [
    { producto: 'blokku_gemas_300', gemas: 300, bonus: 0, a_la_venta: true, orden: 10, extra: 0, total: 300, ventas: 12 },
    { producto: 'blokku_gemas_1200', gemas: 1200, bonus: 200, a_la_venta: true, orden: 20, extra: 100, total: 1500, ventas: 5 },
  ],
  ofertas: [{ id: 1, producto: 'blokku_gemas_1200', extra: 100, desde: isoIn(-1), hasta: isoIn(2), vigente: true }],
  articulos: [{ id: 'frame_dorado', gemas: 500, activo: true, orden: 100 }],
  catalogo: [
    { id: 'theme_forest', rareza: 'raro', precio: null, efectivo: 9000, vendible: true },
    { id: 'frame_neon', rareza: 'comun', precio: 2500, efectivo: 2500, vendible: false },
    { id: 'frame_dorado', rareza: 'epico', precio: null, efectivo: 24000, vendible: false },
  ],
  temporadas: [{ id: 't1', inicio: '2026-12-15T06:00:00Z', fin: '2027-02-01T06:00:00Z', niveles: 30, plus_niveles: 10, activa: true, gemas: { 5: 40, 10: 60, 15: 80, 20: 100, 25: 120, 30: 200 }, compradores: 0, total_gemas: 600 },
    { id: 't2', inicio: '2027-02-01T06:00:00Z', fin: '2027-04-01T06:00:00Z', niveles: 30, plus_niveles: 10, activa: true, gemas: { 5: 50, 10: 80, 15: 100, 20: 120, 25: 150, 30: 250 }, compradores: 0, total_gemas: 750 }],
  cambios: [{ id: 1, creado: isoIn(-1), accion: 'paquete', datos: { producto: 'blokku_gemas_300', gemas: 300 }, antes: { gemas: 250 } }],
};
const TIENDA = {
  hoy: new Date().toISOString().slice(0, 10),
  config: [
    cfg('precios', 'precio_comun', 3000, 3000, 1, 100000, 'Precio común'), cfg('precios', 'precio_raro', 9000, 9000, 1, 200000, 'Precio raro'),
    cfg('protectores', 'protector_precio', 8000, 8000, 1, 200000, 'Precio del protector'),
    cfg('ganar', 'ganar_linea', 10, 10, 0, 100, 'Bloques por línea'), cfg('ganar', 'ganar_cofre_min', 200, 200, 0, 10000, 'Cofre mínimo'), cfg('ganar', 'ganar_cofre_max', 600, 600, 0, 20000, 'Cofre máximo'),
    cfg('semanal', 'semanal_1', 10000, 10000, 0, 20000, 'Premio del 1.º'),
    cfg('topes', 'max_lineas', 20, 20, 1, 200, 'Líneas por partida'), cfg('topes', 'max_lineas_extra', 40, 40, 1, 400, 'Líneas extra que pagan'),
    cfg('general', 'tienda_activa', 1, 1, 0, 1, 'Tienda'),
  ],
  ofertas: [], ocultos: [], ofertas_calc: {},
  catalogo: [{ id: 'theme_forest', rareza: 'raro', precio: null, lista: 9000, vendible: true }, { id: 'frame_neon', rareza: 'comun', precio: 2500, lista: 3000, vendible: false }],
  stats: { emitidos: 1200000, emitidos_24h: 8000, emitidos_7d: 90000, gastados: 400000, gastados_24h: 3000, gastados_7d: 40000, saldo_total: 800000, carteras: 340, compras: 120, compras_7d: 14, compradores: 60, protectores_comprados: 20, protectores_guardados: 12, protectores_usados: 8, protectores_usados_7d: 2, rachas_vivas: 30,
    por_tipo: { partida: 600000, mision: 200000, cofre: 150000, ajuste: 250000, compra: -300000, cumple_x2: 5000 }, top_compras: [{ item: 'theme_forest', n: 30 }] },
};
// Pase: Bloques y protectores del servidor = lo del JSON de la app, salvo una casilla corregida (t2 nivel 7 premium).
const PB = (() => {
  const d = JSON.parse(readFileSync(new URL('../admin/panel/11-datos-temporadas.js', import.meta.url), 'utf8').replace(/^[\s\S]*?var TPD = /, '').replace(/;\s*$/, ''));
  const caja = (it) => ({ bloques: it.filter((i) => i.t === 'b' || i.t === 'f').reduce((a, i) => a + i.n, 0), protectores: it.filter((i) => i.t === 'p').reduce((a, i) => a + i.n, 0), repetidos: {} });
  return { ahora: isoIn(0), activo: true, tope: 40000, protector_max: 10, temporadas: d.temporadas.map((t) => {
    const cajas = {}; t.niveles.forEach((l) => { cajas[l.n] = { gratis: caja(l.g), premium: caja(l.p) }; });
    if (t.id === 't2') cajas[7].premium.bloques += 500;
    return { id: t.id, niveles: 30, cajas, total_bloques: 27500, total_protectores: 6, jugadores: 0, reclamos: 0, bloques_pagados: 0, protectores_dados: 0 };
  }) };
})();

// Pase: progreso reportado (44-pase-progreso.sql), datos falsos. t1 con datos y "va lento"; t2 sin el SQL (404).
const PASE_JUG = (() => {
  const nom = ['Luna_MX', 'Pixel', 'Ximena', 'Toño', 'Dani Blocks', 'Rafa', 'Cacahuate', 'Mari', 'Nico', 'Sofi', 'Memo', 'Lupita', 'Beto', 'Karla', 'Chuy', 'Ana', 'Iván', 'Vale'];
  const pais = ['MX', 'MX', 'CO', 'AR', 'MX', 'ES', 'MX', 'PE', 'CL', 'MX', 'MX', 'US', 'MX', 'CO', 'MX', 'MX', 'EC', 'MX'];
  return nom.map((n, i) => {
    const nivel = [30, 27, 22, 19, 17, 15, 14, 12, 11, 10, 8, 7, 6, 5, 4, 3, 2, null][i];
    return { id: `0000000${i.toString(16)}-aaaa-4bbb-8ccc-00000000000${i % 10}`, nombre: n, pais: pais[i], premium: i % 3 === 0, plus: i === 0, nivel, xp: nivel == null ? null : nivel * 100 + (i * 37) % 100,
      reporte: nivel == null ? null : isoIn(-(i % 9) / 2 - 0.1), comprado: i % 3 === 0 ? isoIn(-10 + i / 3) : null, casillas: nivel == null ? 0 : Math.max(0, nivel - 1) + (i % 3 === 0 ? 3 : 0), completo: nivel === 30 };
  });
})();
const PASE_ST = (() => {
  const dist = []; const pesos = [0, 0, 6, 9, 12, 11, 10, 9, 8, 7, 6, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 2];
  for (let n = 0; n <= 30; n++) dist.push({ nivel: n, gratis: Math.round(pesos[n] * 1.6), premium: Math.round(pesos[n] * (n > 8 ? 0.7 : 0.25)) });
  const rep = dist.reduce((a, d) => a + d.gratis + d.premium, 0);
  const emb = [5, 10, 15, 20, 25, 30].map((k) => ({ nivel: k, jugadores: dist.filter((d) => d.nivel >= k).reduce((a, d) => a + d.gratis + d.premium, 0) }));
  return { ok: true, temporada: { id: 't1', inicio: '2026-12-15T06:00:00Z', fin: '2027-02-01T06:00:00Z', niveles: 30, plus_niveles: 10, activa: true, dias_total: 47, dias_transcurridos: 22.4 },
    compradores: { total: 41, plus: 9, gemas: 20500, lista: [] }, reportan: rep, activos: Math.round(rep * 0.62), completaron: { total: 2, pct: Math.round(1000 * 2 / rep) / 10 },
    distribucion: dist, embudo: emb, medianas_dias: { n10: 11.5, n20: 19.0, n30: 21.5 },
    ritmo: { esperado: 14.3, mediana: 8, mediana_gratis: 7, mediana_premium: 11, a_tiempo: Math.round(rep * 0.28), atrasados: Math.round(rep * 0.72) } };
})();
const RT = [{ id: 'f_lineas', metrica: 'lineas', dif: 'facil', meta: 100, bloques: 500, xp: 100 }, { id: 'm_combos', metrica: 'combos', dif: 'media', meta: 40, bloques: 1200, xp: 250 }, { id: 'd_zen', metrica: 'partidas_zen', dif: 'dificil', meta: 30, bloques: 3000, xp: 500 }];
const DESAF = {
  ahora: isoIn(0), semana: '2026-10-26', activo: true, tienda_activa: true,
  config: [cfg('x', 'bonus_bloques', 1500, 1500, 0, 50000, 'Bonus de bloques'), cfg('x', 'bonus_xp', 300, 300, 0, 10000, 'Bonus de XP'), cfg('x', 'cosmetico_cada', 4, 4, 0, 52, 'Cada cuántas semanas'), cfg('x', 'cosmetico_repetido', 3000, 3000, 0, 50000, 'Si ya lo tenía')],
  catalogo: [
    { id: 'f_lineas', metrica: 'lineas', dif: 'facil', meta: 100, bloques: 500, xp: 100, activo: true },
    { id: 'm_combos', metrica: 'combos', dif: 'media', meta: 40, bloques: 1200, xp: 250, activo: true },
    { id: 'd_zen', metrica: 'partidas_zen', dif: 'dificil', meta: 30, bloques: 3000, xp: 500, activo: false },
  ],
  cosmeticos: ['badge_desafiante', 'frame_oro'],
  semanas: [{ semana: '2026-10-26', inicia: isoIn(-3), termina: isoIn(4), actual: true, programada: false, retos: [RT[0], RT[1], RT[2]], cosmetico: null }, { semana: '2026-11-02', inicia: isoIn(4), termina: isoIn(11), actual: false, programada: true, retos: [RT[0]], cosmetico: 'frame_borrado' }],
  stats: [{ semana: '2026-10-19', retos: 3, activos: 300, jugadores: 280, bonus: 90, bloques: 120000, retos: RT, por_reto: { f_lineas: 200, m_combos: 120 } }],
};
// Jugadores y economía + Sin anuncios (45): datos falsos. Ids con el mismo formato que los reales.
const uid = (n) => `0000000${n}-aaaa-4bbb-8ccc-00000000000${n}`;
const JE_J = [['Luna_MX', 'MX', 1], ['Pixel', 'MX', 0], ['Ximena', 'CO', 1], ['Toño', 'AR', 0], ['Dani Blocks', 'US', 0]].map(([nombre, pais, pase], i) => ({
  id: uid(i + 1), nombre, pais, visto: isoIn(-i), bloques: 20000 - i * 3000, ganado: 40000 - i * 4000, gastado: 20000 - i * 1000, gemas: 300 - i * 50, gemas_compradas: 600, gemas_gastadas: 300 + i * 50,
  dinero_usd: i === 0 ? 9.99 : 0, pase_premium: !!pase, compras: 5 - i, actividad: isoIn(-i / 3) }));
const JE_RES = { bloques_circulacion: 1200000, gemas_circulacion: 8000, con_bloques: 340, con_gemas: 120, bloques_ganados: 3000000, bloques_gastados: 1800000, gemas_compradas: 20000, gemas_gastadas: 12000, gemas_deuda: 0, pase_premium: 41, jugadores: 350,
  top_bloques: [{ item: 'theme_forest', compras: 30 }], top_gemas: [{ que: 'paquete', id: 'mitico', compras: 12 }], ingresos: { usd: 249.5, compras: 40, compradores: 25, reembolsos: 2, por_producto: [{ producto: 'blokku_gemas_300', usd: 120, compras: 30 }] } };
const SA_C = (r) => ({ pais: 'MX', fuente: 'rc', tienda: 'PLAY_STORE', pais_tienda: 'MX', comprado: isoIn(-5), precio_usd: 2.99, precio: 59, moneda: 'MXN', reembolsado: null, entorno: 'PRODUCTION', ...r });
const SA_LISTA = [
  { jugador: uid(1), nombre: 'Luna_MX', visto: isoIn(0), cuentas: [uid(1), uid(4)], ...SA_C({ comprado: isoIn(-2) }) },
  { jugador: uid(2), nombre: 'Pixel', visto: isoIn(-1), cuentas: [uid(2)], ...SA_C({ pais: 'MX', fuente: 'app', tienda: 'APP_STORE', pais_tienda: null, comprado: isoIn(-30), precio_usd: null, precio: null, moneda: null }) },
  { jugador: uid(3), nombre: 'Ximena', visto: isoIn(-2), cuentas: [uid(3)], ...SA_C({ pais: 'CO', pais_tienda: 'CO', precio_usd: 2.99, precio: 11900, moneda: 'COP', reembolsado: isoIn(-1), comprado: isoIn(-9) }) },
  { jugador: uid(5), nombre: 'Dani Blocks', visto: isoIn(-3), cuentas: [uid(5)], ...SA_C({ pais: 'US', pais_tienda: 'US', precio_usd: 2.99, precio: 2.99, moneda: 'USD', entorno: 'SANDBOX', comprado: isoIn(-12) }) },
];
const SA_RES = { compradores: 2, compras: 3, reembolsos: 1, usd: 2.99, solo_app: 1, sin_jugador: 1, pruebas: 1,
  por_tienda: [{ tienda: 'PLAY_STORE', compras: 2, usd: 2.99 }, { tienda: 'APP_STORE', compras: 1, usd: 0 }], lista: SA_LISTA,
  anonimos: [{ rc_id: '$RCAnonymousID:0a1b2c3d4e5f…', tienda: 'PLAY_STORE', pais_tienda: 'BR', comprado: isoIn(-40), precio_usd: 1.8, precio: 9.9, moneda: 'BRL', reembolsado: null, entorno: 'PRODUCTION' }] };
const jeFicha = (id) => { const j = JE_J.find((x) => x.id === id) || JE_J[0]; return { id: j.id, nombre: j.nombre, pais: j.pais, visto: j.visto, creado: isoIn(-60), plataforma: 'android', modelo: 'SM-A175M', version_app: '2.0.0',
  bloques: { saldo: j.bloques, ganado: j.ganado, gastado: j.gastado, protectores: 1, racha: 4, mejor_racha: 9 }, gemas: { saldo: j.gemas, compradas: j.gemas_compradas, gastadas: j.gemas_gastadas, deuda: 0 }, dinero_usd: j.dinero_usd,
  compras_tienda: [{ item: 'theme_forest', creado: isoIn(-3), rareza: 'raro', precio: 9000 }], gastos_gemas: [], compras_dinero: [], entregas_paquetes: [], pase: [], canjes: [], movs_bloques: [], movs_gemas: [] }; };
const saFicha = (id) => id === uid(1) ? { jugador: uid(1), cuentas: [uid(1), uid(4)], identidades: 1, compras: [{ fuente: 'rc', cuenta: uid(4), tienda: 'PLAY_STORE', pais_tienda: 'MX', comprado: isoIn(-2), precio_usd: 2.99, precio: 59, moneda: 'MXN', reembolsado: null, entorno: 'PRODUCTION', transaccion: 'GPA.1' }],
    transfers: [{ recibido: isoIn(-1), tienda: 'PLAY_STORE', entorno: 'PRODUCTION', llego: true, salio: false }], app: { jugador_id: uid(1), comprado: isoIn(-2), tienda: 'PLAY_STORE', primero: isoIn(-1), visto: isoIn(0) } }
  : id === uid(2) ? { jugador: uid(2), cuentas: [uid(2)], identidades: 0, compras: [{ fuente: 'app', cuenta: uid(2), tienda: 'APP_STORE', pais_tienda: null, comprado: isoIn(-30), precio_usd: null, precio: null, moneda: null, reembolsado: null, entorno: 'PRODUCTION', transaccion: null }], transfers: [], app: { jugador_id: uid(2), comprado: isoIn(-30), tienda: 'APP_STORE', primero: isoIn(-3), visto: isoIn(-1) } }
  : { jugador: id, cuentas: [id], identidades: 0, compras: [], transfers: [], app: null };
export const FIX = {
  routes: ['juego/pases', 'juego/pases@tpsT:t2', 'juego/solo-gemas', 'juego/gemas', 'juego/escaparate', 'juego/desafios', 'juego/duelos', 'juego/wrapped', 'juego/premios-semana', 'juego/anuncio-poderes', 'codigos/canjes', 'juego/cumple', 'juego/tienda', 'juego/pagos', 'juego/economia', 'juego/economia@jeVista:sa', 'juego/economia?open=je:' + uid(1), 'juego/economia?open=je:' + uid(2)],
  rpc(fn, body) {
    if (fn === 'admin_panel') return { secciones: { meta: { rev: 1, datos: { origen: 'x', decidido: true } } } };
    if (fn === 'admin_anuncio_poderes') return { config: { activo: true, por_poder: 1 }, hoy: { vistos: 12, dados: 10, vacios: 2 }, d7: { vistos: 80, dados: 70, vacios: 10 }, total: { vistos: 900, dados: 800, vacios: 100 }, por_poder: [{ poder: 'bomb', vistos: 5, dados: 4, vacios: 1 }, { poder: 'lightning', vistos: 7, dados: 6, vacios: 1 }] };
    if (fn === 'admin_solo_gemas') return SOLO;
    if (fn === 'admin_pase_bloques') return PB;
    if (fn === 'admin_pase_stats') return body.p_temporada === 't1' ? PASE_ST : { __status: 404, body: { code: 'PGRST202', message: 'function not found' } };
    if (fn === 'admin_pase_jugadores') {
      const q = (body.p_buscar || '').toLowerCase(); let r = PASE_JUG.filter((j) => !q || j.nombre.toLowerCase().includes(q));
      const k = { nivel: 'nivel', xp: 'xp' }[body.p_orden]; if (k) r = [...r].sort((a, b) => (b[k] ?? -1) - (a[k] ?? -1));
      return { ok: true, jugadores: r };
    }
    if (fn === 'admin_tienda') return TIENDA;
    if (fn === 'admin_desafios') return DESAF;
    if (fn === 'admin_economia_jugadores') return JE_J;
    if (fn === 'admin_economia_resumen') return JE_RES;
    if (fn === 'admin_economia_jugador') return jeFicha(body.p_id);
    if (fn === 'admin_sin_anuncios') return process.env.SA_SINSQL ? { __status: 404, body: { code: 'PGRST202', message: 'function not found' } } : body.p_id ? saFicha(body.p_id) : SA_RES;
    return [];
  },
};
