// Utilidades de fecha en horario LOCAL (no UTC). `Date#toISOString()` convierte
// a UTC, lo que desplaza la fecha un día para husos horarios por delante de UTC
// (p.ej. España en verano, UTC+2) cuando se usa cerca de medianoche. Estas
// funciones siempre devuelven la fecha tal y como la ve el usuario en su reloj.

export function toLocalIso(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayIso() {
  return toLocalIso(new Date())
}
