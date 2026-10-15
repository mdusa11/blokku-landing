// Mapa de imágenes del panel: qué archivo local alimenta a cada cosmético,
// versión y logo. Las rutas son de la Mac de Manuel; si un archivo no existe se
// omite y el panel muestra un placeholder con la paleta del cosmético.
import { homedir } from 'node:os';
const H = homedir();
const QA = `${H}/StudioProjects/blocktetris/docs/qa-1.0.5`;
const DB = `${H}/Desktop/Blokku`;
const PL = `${DB}/01-Versiones/v1.0.4/ficha-play/capturas`;
const AS = `${DB}/01-Versiones/v1.0.4/ficha-app-store/iphone-6.9`;
const LOGO = `${DB}/02-Documentos/Logo-2026-10`;

const BOARD = [0, 490, 823, 1290];       // tablero de las partidas
const CARD = [0, 640, 822, 1500];        // tarjeta «premio» de 822x1520
const tile = (c, r) => { const x = 4.2 + 112.35 * c, y = 4.2 + 112.35 * r; return [Math.round(x), Math.round(y), Math.round(x + 104), Math.round(y + 104)]; };

// premioId -> { file, crop, big: archivo de pantalla completa opcional }
const partida = (n) => ({ file: `${QA}/premios/partida_${n}.png`, crop: BOARD, big: true });
export const COSM = {
  'p-oro': { file: `${QA}/premio_oro_vivo_oceano.png`, crop: CARD },
  'p-eclipse': { file: `${QA}/premio_eclipse_oceano.png`, crop: CARD },
  'p-super': { file: `${QA}/premios/catalogo_completo.png`, crop: tile(5, 2) },
  'p-agujero': { file: `${QA}/premios/catalogo_completo.png`, crop: tile(0, 5) },
  'p-pixeles': { file: `${QA}/premios/catalogo_completo.png`, crop: tile(2, 7) },
  'p-papel': { file: `${QA}/premios/catalogo_completo.png`, crop: tile(6, 5) },
  'p-medusas': { file: `${QA}/medusa/efecto_medusas_2_304ms.png` },
  'p-portal': { file: `${QA}/portal/efecto_portal_3_640ms.png` },
  'p-rel': partida('estilo_lightning'), 'p-obs': partida('estilo_obsidian'), 'p-diam': partida('estilo_diamond'),
  'p-prisma': partida('estilo_prism'), 'p-8bit': partida('estilo_bits8'), 'p-bloque': partida('estilo_block'),
  'p-dusa': partida('estilo_dusa'), 'p-aur': partida('tema_aurora'), 'p-fenix': partida('tema_phoenix'),
  'p-arcade': partida('tema_arcade'), 'p-pradera': partida('tema_prairie'), 'p-fakturo': partida('tema_fakturo'),
  'p-fiesta': partida('tema_cumplegratis'), 'p-mue26': partida('tema_muertos'), 'p-leyenda': partida('marco_legend'),
  'p-corona': partida('marco_crown'), 'p-cartucho': partida('marco_cartridge'), 'p-mx': partida('marco_mx'),
  'p-top1': partida('marco_top'),
};

const cap = (dir, n, l) => ({ file: `${dir}/${n}.png`, l });
const NOMS = ['01-Cada-bloque-cuenta', '02-Combos', '03-Cinco-poderes', '04-Cuatro-modos', '05-Misiones-y-niveles', '06-Reto-diario', '07-Temas-y-estilos', '08-Sin-conexion'];
// versionId -> [{file, crop?, l (etiqueta), g (grupo)}]
export const VERS = {
  'v-104': [
    ...NOMS.map((n) => ({ ...cap(PL, n, n.slice(3).replace(/-/g, ' ')), g: 'Ficha de Google Play' })),
    ...NOMS.map((n) => ({ ...cap(AS, n, n.slice(3).replace(/-/g, ' ')), g: 'Ficha de App Store (iPhone 6.9")' })),
  ],
  'v-105': [
    { file: `${QA}/vitrina_oceano.png`, crop: [0, 0, 822, 1520], l: 'Vitrina de logros', g: 'Capturas de la 1.0.5' },
    { file: `${QA}/cofre_cerrado_oceano.png`, l: 'Cofre cerrado', g: 'Capturas de la 1.0.5' },
    { file: `${QA}/cofre_abierto_oceano.png`, l: 'Cofre abierto', g: 'Capturas de la 1.0.5' },
    { file: `${QA}/nuevo_oceano.png`, l: '¡NUEVO!', g: 'Capturas de la 1.0.5' },
    { file: `${QA}/premio_oro_vivo_oceano.png`, crop: CARD, l: 'Premio Oro Vivo', g: 'Capturas de la 1.0.5' },
    { file: `${QA}/bandeja/z_l_punto_telefono.png`, l: 'Bandeja en teléfono', g: 'Capturas de la 1.0.5' },
    { file: `${QA}/bandeja/z_l_punto_tablet.png`, l: 'Bandeja en tablet', g: 'Capturas de la 1.0.5', w: 480 },
    { file: `${QA}/medusa/catalogo_dusa.png`, l: 'Colección Dusa', g: 'Capturas de la 1.0.5', w: 480 },
  ],
};
export const LOGOS = { logo: { file: `${LOGO}/logo-gemas-transparente-1024.png`, w: 160, q: 80 }, icono: { file: `${LOGO}/icono-1024.png`, w: 96, q: 80 } };
