import { uid } from './idGen'
import { todayIso, toLocalIso } from './dateUtils'

const KEYS = {
  profile: 'nt:profile',
  weekPlans: 'nt:weekPlans',
  diaryEntries: 'nt:diaryEntries',
  favorites: 'nt:favorites',
  followupEntries: 'nt:followupEntries',
  weightLog: 'nt:weightLog',
  shoppingChecks: 'nt:shoppingChecks',
  shoppingProducts: 'nt:shoppingProducts',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Perfil ---------------------------------------------------------------

export function getProfile() {
  return read(KEYS.profile, null)
}
export function saveProfile(profile) {
  write(KEYS.profile, profile)
  return profile
}

// --- Plan semanal (generado por IA) ---------------------------------------
// Se guardan varias semanas, indexadas por la fecha ISO del lunes de esa semana.

export function getWeekPlans() {
  return read(KEYS.weekPlans, {})
}
export function getWeekPlan(weekStartIso) {
  const plans = getWeekPlans()
  return plans[weekStartIso] || null
}
export function getLatestWeekPlan() {
  const plans = getWeekPlans()
  const keys = Object.keys(plans).sort()
  if (!keys.length) return null
  const key = keys[keys.length - 1]
  return { weekStartIso: key, plan: plans[key] }
}
export function saveWeekPlan(weekStartIso, plan) {
  const plans = getWeekPlans()
  plans[weekStartIso] = plan
  write(KEYS.weekPlans, plans)
  return plan
}

// Lunes ISO de la semana que contiene la fecha dada (o hoy).
export function weekStartFor(dateIso = todayIso()) {
  const d = new Date(dateIso + 'T00:00:00')
  const day = d.getDay() // 0=domingo..6=sábado
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return toLocalIso(d)
}

// --- Diario de comidas ------------------------------------------------------

export function getDiaryEntries() {
  return read(KEYS.diaryEntries, [])
}
export function getDiaryEntriesForDate(dateIso) {
  return getDiaryEntries().filter((e) => e.dateIso === dateIso)
}
export function addDiaryEntry(entry) {
  const entries = getDiaryEntries()
  const full = { id: uid(), createdAt: Date.now(), dateIso: todayIso(), ...entry }
  entries.unshift(full)
  write(KEYS.diaryEntries, entries)
  return full
}
export function removeDiaryEntry(id) {
  write(KEYS.diaryEntries, getDiaryEntries().filter((e) => e.id !== id))
}

// --- Favoritos (comidas de acceso rápido) ----------------------------------

export function getFavorites() {
  return read(KEYS.favorites, [])
}
export function addFavorite(food) {
  const favs = getFavorites()
  if (favs.some((f) => f.foodName === food.foodName && f.brand === food.brand)) return favs
  const full = { id: uid(), ...food }
  favs.unshift(full)
  write(KEYS.favorites, favs)
  return favs
}
export function removeFavorite(id) {
  write(KEYS.favorites, getFavorites().filter((f) => f.id !== id))
}

// --- Cuestionario de seguimiento semanal ------------------------------------

export function getFollowupEntries() {
  return read(KEYS.followupEntries, [])
}
export function addFollowupEntry(entry) {
  const entries = getFollowupEntries()
  const full = { id: uid(), dateIso: todayIso(), createdAt: Date.now(), ...entry }
  entries.unshift(full)
  write(KEYS.followupEntries, entries)
  if (entry.pesoKg) addWeightEntry({ dateIso: full.dateIso, weightKg: entry.pesoKg })
  return full
}
export function lastFollowupEntry() {
  const entries = getFollowupEntries()
  return entries[0] || null
}
export function daysSinceLastFollowup() {
  const last = lastFollowupEntry()
  if (!last) return Infinity
  const diffMs = Date.now() - new Date(last.dateIso + 'T00:00:00').getTime()
  return Math.floor(diffMs / 86400000)
}

// --- Registro de peso --------------------------------------------------------

export function getWeightLog() {
  return read(KEYS.weightLog, [])
}
export function addWeightEntry(entry) {
  const log = getWeightLog()
  const full = { id: uid(), dateIso: todayIso(), ...entry }
  log.push(full)
  log.sort((a, b) => a.dateIso.localeCompare(b.dateIso))
  write(KEYS.weightLog, log)
  return full
}

// --- Lista de la compra: checks persistidos por semana ----------------------

export function getShoppingChecks(weekStartIso) {
  const all = read(KEYS.shoppingChecks, {})
  return all[weekStartIso] || {}
}
export function setShoppingCheck(weekStartIso, itemKey, checked) {
  const all = read(KEYS.shoppingChecks, {})
  all[weekStartIso] = { ...(all[weekStartIso] || {}), [itemKey]: checked }
  write(KEYS.shoppingChecks, all)
}

// --- Lista de la compra: producto real (OFF) elegido por ítem, por semana --
// Los ítems de listaCompra son strings sueltos (ver esquema del prompt), así
// que el "productoReal" { name, brand, store } se guarda aparte, indexado con
// la misma clave que shoppingChecks (`${categoriaIndex}:${itemIndex}:${texto}`).

export function getShoppingProducts(weekStartIso) {
  const all = read(KEYS.shoppingProducts, {})
  return all[weekStartIso] || {}
}
export function setShoppingProduct(weekStartIso, itemKey, producto) {
  const all = read(KEYS.shoppingProducts, {})
  const forWeek = { ...(all[weekStartIso] || {}) }
  if (producto) forWeek[itemKey] = producto
  else delete forWeek[itemKey]
  all[weekStartIso] = forWeek
  write(KEYS.shoppingProducts, all)
}

// --- Racha: días consecutivos con al menos una entrada en el diario --------

export function streak() {
  const entries = getDiaryEntries()
  const loggedDates = new Set(entries.map((e) => e.dateIso))
  let s = 0
  const d = new Date()
  for (;;) {
    const iso = toLocalIso(d)
    if (loggedDates.has(iso)) {
      s++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return s
}

// --- Copia de seguridad -------------------------------------------------------

export function buildBackup() {
  return {
    formato: 'nutre-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: getProfile(),
    weekPlans: getWeekPlans(),
    diaryEntries: getDiaryEntries(),
    favorites: getFavorites(),
    followupEntries: getFollowupEntries(),
    weightLog: getWeightLog(),
    shoppingChecks: read(KEYS.shoppingChecks, {}),
    shoppingProducts: read(KEYS.shoppingProducts, {}),
  }
}
export function restoreBackup(data) {
  if (data.profile) write(KEYS.profile, data.profile)
  if (data.weekPlans) write(KEYS.weekPlans, data.weekPlans)
  if (data.diaryEntries) write(KEYS.diaryEntries, data.diaryEntries)
  if (data.favorites) write(KEYS.favorites, data.favorites)
  if (data.followupEntries) write(KEYS.followupEntries, data.followupEntries)
  if (data.weightLog) write(KEYS.weightLog, data.weightLog)
  if (data.shoppingChecks) write(KEYS.shoppingChecks, data.shoppingChecks)
  if (data.shoppingProducts) write(KEYS.shoppingProducts, data.shoppingProducts)
}
export function clearAll() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
}
