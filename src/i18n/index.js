import { createElement, Fragment, useSyncExternalStore } from 'react'
import es from './es.js'
import en from './en.js'

// [código, nombre en su propio idioma]. Los mismos 15 idiomas de la app.
export const LANGS = [
  ['es', 'Español'], ['en', 'English'], ['pt', 'Português'], ['fr', 'Français'], ['de', 'Deutsch'],
  ['it', 'Italiano'], ['ru', 'Русский'], ['tr', 'Türkçe'], ['ar', 'العربية'], ['hi', 'हिन्दी'],
  ['id', 'Bahasa Indonesia'], ['ja', '日本語'], ['ko', '한국어'], ['vi', 'Tiếng Việt'], ['zh', '中文'],
]
const CODES = LANGS.map(([c]) => c)
const RTL = new Set(['ar'])
const OG_LOCALE = {
  es: 'es_MX', en: 'en_US', pt: 'pt_BR', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', ru: 'ru_RU', tr: 'tr_TR',
  ar: 'ar_AR', hi: 'hi_IN', id: 'id_ID', ja: 'ja_JP', ko: 'ko_KR', vi: 'vi_VN', zh: 'zh_CN',
}
// Locale para formatear números (dígitos latinos también en árabe e hindi).
const NUM_LOCALE = {
  es: 'es-MX', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR', de: 'de-DE', it: 'it-IT', ru: 'ru-RU', tr: 'tr-TR',
  ar: 'ar-u-nu-latn', hi: 'hi-IN-u-nu-latn', id: 'id-ID', ja: 'ja-JP', ko: 'ko-KR', vi: 'vi-VN', zh: 'zh-CN',
}

// es y en viajan en el bundle principal (en es además el respaldo de claves
// que falten); los demás son chunks que se bajan solo si hacen falta.
const loaders = {
  pt: () => import('./pt.js'), fr: () => import('./fr.js'), de: () => import('./de.js'),
  it: () => import('./it.js'), ru: () => import('./ru.js'), tr: () => import('./tr.js'),
  ar: () => import('./ar.js'), hi: () => import('./hi.js'), id: () => import('./id.js'),
  ja: () => import('./ja.js'), ko: () => import('./ko.js'), vi: () => import('./vi.js'),
  zh: () => import('./zh.js'),
}
const loadDict = async (lang) => {
  if (lang === 'es') return es
  if (lang === 'en') return en
  try { return (await loaders[lang]()).default } catch { return en }
}

const KEY = 'blokku_lang'
const store = {
  get() { try { return localStorage.getItem(KEY) } catch { return null } },
  set(v) { try { localStorage.setItem(KEY, v) } catch { /* sin almacenamiento */ } },
}
const norm = (tag) => {
  const base = String(tag || '').toLowerCase().split(/[-_]/)[0]
  const code = base === 'in' ? 'id' : base
  return CODES.includes(code) ? code : null
}

/* ?lang=xx > elección guardada > navigator.languages > inglés. */
export function detectLang() {
  let forced = null
  try { forced = norm(new URLSearchParams(location.search).get('lang')) } catch { /* sin URL */ }
  if (forced) return forced
  const saved = norm(store.get())
  if (saved) return saved
  const list = (typeof navigator !== 'undefined' && (navigator.languages?.length ? navigator.languages : [navigator.language])) || []
  for (const l of list) { const c = norm(l); if (c) return c }
  return 'en'
}

let state = { lang: 'es', dict: es }
const subs = new Set()
const getSnapshot = () => state
const subscribe = (f) => { subs.add(f); return () => subs.delete(f) }

const interp = (s, vars) => (vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : s)
const tr = (dict) => (key, vars) => interp(dict[key] ?? en[key] ?? es[key] ?? key, vars)

/* Texto con **negritas** y {marcadores} que se sustituyen por nodos de React. */
const rich = (raw, nodes = {}) => {
  const out = []
  raw.split('**').forEach((chunk, i) => {
    const parts = chunk.split(/\{(\w+)\}/)
    const inner = parts.map((p, j) => (j % 2 ? createElement(Fragment, { key: j }, nodes[p]) : p))
    out.push(i % 2 ? createElement('strong', { key: i }, inner) : createElement(Fragment, { key: i }, inner))
  })
  return out
}

const make = (s) => {
  const base = tr(s.dict)
  const t = (key, vars) => base(key, vars)
  t.rich = (key, nodes) => rich(base(key), nodes)
  t.up = (key, vars) => base(key, vars).toLocaleUpperCase(s.lang)
  t.n = (num) => Number(num).toLocaleString(NUM_LOCALE[s.lang])
  t.lang = s.lang
  return t
}
let cached = { s: state, t: make(state) }
export const getT = () => {
  if (cached.s !== state) cached = { s: state, t: make(state) }
  return cached.t
}
export const useT = () => { useSyncExternalStore(subscribe, getSnapshot); return getT() }
export const useLang = () => useSyncExternalStore(subscribe, getSnapshot).lang

function applyDocument(lang, t) {
  const d = document.documentElement
  d.lang = lang
  d.dir = RTL.has(lang) ? 'rtl' : 'ltr'
  document.title = t('meta.title')
  const set = (sel, v) => document.querySelector(sel)?.setAttribute('content', v)
  set('meta[name="description"]', t('meta.desc'))
  set('meta[property="og:title"]', t('meta.title'))
  set('meta[property="og:description"]', t('meta.ogDesc'))
  set('meta[property="og:image:alt"]', t('meta.ogAlt'))
  set('meta[property="og:locale"]', OG_LOCALE[lang])
  set('meta[name="twitter:title"]', t('meta.title'))
  set('meta[name="twitter:description"]', t('meta.twDesc'))
}

/* Se llama antes del primer render: deja listo el diccionario y <html>. */
export async function initI18n() {
  const lang = detectLang()
  state = { lang, dict: await loadDict(lang) }
  applyDocument(lang, getT())
}

/* Elección del visitante: se recuerda y reemplaza cualquier ?lang= de la URL. */
export async function setLang(lang) {
  if (!CODES.includes(lang) || lang === state.lang) return
  const dict = await loadDict(lang)
  state = { lang, dict }
  store.set(lang)
  try {
    const u = new URL(location.href)
    if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); history.replaceState(null, '', u) }
  } catch { /* sin history */ }
  applyDocument(lang, getT())
  subs.forEach((f) => f())
}
