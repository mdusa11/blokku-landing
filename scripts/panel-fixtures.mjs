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
  const d = JSON.parse(readFileSync(new URL('../admin/panel/datos-temporadas.js', import.meta.url), 'utf8').replace(/^[\s\S]*?var TPD = /, '').replace(/;\s*$/, ''));
  const caja = (it) => ({ bloques: it.filter((i) => i.t === 'b' || i.t === 'f').reduce((a, i) => a + i.n, 0), protectores: it.filter((i) => i.t === 'p').reduce((a, i) => a + i.n, 0), repetidos: {} });
  return { ahora: isoIn(0), activo: true, tope: 40000, protector_max: 10, temporadas: d.temporadas.map((t) => {
    const cajas = {}; t.niveles.forEach((l) => { cajas[l.n] = { gratis: caja(l.g), premium: caja(l.p) }; });
    if (t.id === 't2') cajas[7].premium.bloques += 500;
    return { id: t.id, niveles: 30, cajas, total_bloques: 27500, total_protectores: 6, jugadores: 0, reclamos: 0, bloques_pagados: 0, protectores_dados: 0 };
  }) };
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
export const FIX = {
  routes: ['juego/pases', 'juego/solo-gemas', 'juego/gemas', 'juego/escaparate', 'juego/desafios', 'juego/duelos', 'juego/wrapped', 'juego/premios-semana', 'juego/anuncio-poderes', 'codigos/canjes', 'juego/cumple', 'juego/tienda', 'juego/pagos'],
  rpc(fn, body) {
    if (fn === 'admin_panel') return { secciones: { meta: { rev: 1, datos: { origen: 'x', decidido: true } } } };
    if (fn === 'admin_anuncio_poderes') return { config: { activo: true, por_poder: 1 }, hoy: { vistos: 12, dados: 10, vacios: 2 }, d7: { vistos: 80, dados: 70, vacios: 10 }, total: { vistos: 900, dados: 800, vacios: 100 }, por_poder: [{ poder: 'bomb', vistos: 5, dados: 4, vacios: 1 }, { poder: 'lightning', vistos: 7, dados: 6, vacios: 1 }] };
    if (fn === 'admin_solo_gemas') return SOLO;
    if (fn === 'admin_pase_bloques') return PB;
    if (fn === 'admin_tienda') return TIENDA;
    if (fn === 'admin_desafios') return DESAF;
    return [];
  },
};
