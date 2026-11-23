// Copia al diccionario de cada idioma de la landing (src/i18n/<lang>.js) los
// textos que ya existen en los ARB de la app, para que nombres de modos,
// poderes, combos, rarezas y el tutorial coincidan EXACTO con el juego.
// Solo reescribe el bloque entre /* app:start */ y /* app:end */.
//   node scripts/gen-i18n-glossary.mjs [ruta/a/blocktetris/lib/l10n]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const DIR = process.argv[2] || join(homedir(), 'StudioProjects/blocktetris/lib/l10n')
const OUT = new URL('../src/i18n/', import.meta.url).pathname
const LANGS = ['es', 'en', 'pt', 'fr', 'de', 'it', 'ru', 'tr', 'ar', 'hi', 'id', 'ja', 'ko', 'vi', 'zh']

// clave de la landing → clave del ARB
const MAP = {
  'mode.classic': 'classic', 'mode.timed': 'timeAttack', 'mode.zen': 'zen', 'mode.daily': 'dailyChallenge', 'mode.weekend': 'weekendEvent',
  'tutmode.classic': 'endlessCountsTowardYour', 'tutmode.timed': 's90SecondsMaxScore', 'tutmode.zen': 'noGameOverJust',
  'tutmode.daily': 'tutModeDaily', 'tutmode.weekend': 'tutModeWeekend',
  'pow.bomb': 'powerBomb', 'pow.lightning': 'powerLightning', 'pow.undo': 'powerUndo', 'pow.shuffle': 'powerShuffle', 'pow.color': 'powerColor',
  'tutpow.bomb': 'tutPowBomb', 'tutpow.lightning': 'tutPowLightning', 'tutpow.undo': 'tutPowUndo', 'tutpow.shuffle': 'tutPowShuffle', 'tutpow.color': 'tutPowColor',
  'tut.p1t': 'tutDragTitle', 'tut.p1b': 'tutDragBody', 'tut.p2t': 'tutLinesTitle', 'tut.p2b': 'tutLinesBody',
  'tut.p3t': 'tutHoldTitle', 'tut.p3b': 'tutHoldBody', 'tut.p4t': 'tutPowersTitle', 'tut.p4b': 'tutPowersBody',
  'tut.p5t': 'tutModesTitle', 'tut.p5b': 'tutModesBody', 'tut.p6t': 'tutProgressTitle', 'tut.p6b': 'tutProgressBody',
  'tut.p7t': 'tutCompeteTitle', 'tut.p7b': 'tutCompeteBody',
  'tut.rotate': 'tutTapRotate', 'tut.holdPress': 'tutHoldPress', 'tut.holdTap': 'tutHoldTap', 'tut.rescue': 'tutRescue',
  'tut.level': 'tutLevelOf', 'tut.chipRoute': 'routeTitle', 'tut.chipAch': 'tutChipAchievements', 'tut.chipChests': 'tutChipChests',
  'tut.custom': 'tutCustomize', 'tut.secret': 'tutSecret', 'tut.country': 'tutCountry', 'tut.you': 'tutYou',
  'tut.chipBadges': 'tutChipBadges', 'tut.chipSeason': 'tutChipSeason', 'tut.chipCodes': 'tutChipCodes', 'tut.go': 'tutLetsPlay',
  'tut.world': 'rankingWorld', 'tut.score': 'score', 'tut.hold': 'hold', 'tut.combo': 'comboShort',
  'comboNice': 'comboNice', 'comboGreat': 'comboGreat', 'comboAmazing': 'comboAmazing', 'comboInsane': 'comboInsane', 'comboLegendary': 'comboLegendary',
  'rar.common': 'rarityCommon', 'rar.rare': 'rarityRare', 'rar.epic': 'rarityEpic', 'rar.legendary': 'rarityLegendary', 'rar.mythic': 'rarityMythic',
  'sx.i1': 'blokkuTheme', 'sx.i2': 'blokkuStyle', 'sx.i3': 'blokkuEffect', 'sx.i4': 'blokkuFrame', 'sx.i5': 'blokkuBadge',
  'dg.newRecord': 'newRecord', 'dg.best': 'best', 'dg.th.clasico': 'cosClassic', 'dg.th.neon': 'styleNeon', 'dg.tag.soon': 'soonLabel',
  'sc.title': 'customizeTitle',
}
// Solo de consulta: se escriben como comentario (no viajan al bundle) para que
// quien traduzca use los mismos nombres de la app dentro de las frases.
const REF = {
  'galaxy': 'galaxy', 'forest': 'forest', 'bubblegum': 'bubblegum', 'candy': 'styleCandy', 'ice': 'styleIce',
  'fireworks': 'cosFireworks', 'shatter': 'cosShatter', 'confetti': 'cosConfetti', 'witchesNight': 'cosNocheBrujas',
  'tierBronze': 'tierBronze', 'tierSilver': 'tierSilver', 'tierGold': 'tierGold', 'tierDiamond': 'tierDiamond', 'tierImpossible': 'tierImpossible',
  'noAds': 'noAds', 'adfree': 'adfree', 'achievements': 'achievements', 'redeemCode': 'redeemCode', 'settings': 'settings',
  'customizeTabThemes': 'customizeTabThemes', 'customizeTabPieces': 'customizeTabPieces', 'customizeTabEffects': 'customizeTabEffects',
  'customizeTabFrames': 'customizeTabFrames', 'customizeTabBadges': 'customizeTabBadges', 'customizeUse': 'customizeUse',
  'ranking': 'ranking', 'rankingWeek': 'rankingWeek', 'rankingAllTime': 'rankingAllTime', 'rankingToday': 'rankingToday',
  'levelsRoute': 'routeTitle', 'xp': 'xp', 'play': 'play', 'howToPlay': 'howToPlay',
}
// Una sola variable por texto: en la landing siempre se llama {n}.
const norm = (s) => s.replace(/\{\w+\}/g, '{n}')

const q = (s) => JSON.stringify(s)
for (const lang of LANGS) {
  const arb = JSON.parse(readFileSync(join(DIR, `app_${lang}.arb`), 'utf8'))
  const lines = Object.entries(MAP).map(([k, a]) => {
    if (typeof arb[a] !== 'string') throw new Error(`${lang}: falta ${a} en el ARB`)
    return `  ${q(k)}: ${q(norm(arb[a]))},`
  })
  const ref = Object.entries(REF).filter(([, a]) => typeof arb[a] === 'string').map(([k, a]) => `  // ref ${k}: ${arb[a].replace(/\n/g, ' ')}`)
  const block = `/* app:start (generado por scripts/gen-i18n-glossary.mjs desde los ARB de la app) */\n${lines.join('\n')}\n${ref.join('\n')}\n  /* app:end */`
  const file = OUT + `${lang}.js`
  let src = existsSync(file) ? readFileSync(file, 'utf8') : 'export default {\n  /* app:start */\n  /* app:end */\n}\n'
  if (!/\/\* app:start[\s\S]*\/\* app:end \*\//.test(src)) src = src.replace(/\n}\s*$/, '\n  /* app:start */\n  /* app:end */\n}\n')
  src = src.replace(/\/\* app:start[\s\S]*?\/\* app:end \*\//, block)
  writeFileSync(file, src)
}
console.log('ok')
