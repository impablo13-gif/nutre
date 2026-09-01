// Cálculo de gasto energético y objetivos nutricionales.
// Fórmula de Mifflin-St Jeor para el metabolismo basal (BMR), un multiplicador
// de actividad para el gasto total (TDEE), y un ajuste según el objetivo.

const ACTIVITY_MULTIPLIERS = {
  sedentario: 1.2,
  ligero: 1.375,
  moderado: 1.55,
  alto: 1.725,
  muy_alto: 1.9,
}

export const ACTIVITY_LEVELS = [
  { value: 'sedentario', label: 'Sedentario (poco o ningún ejercicio)' },
  { value: 'ligero', label: 'Ligero (ejercicio 1-3 días/semana)' },
  { value: 'moderado', label: 'Moderado (ejercicio 3-5 días/semana)' },
  { value: 'alto', label: 'Alto (ejercicio intenso 6-7 días/semana)' },
  { value: 'muy_alto', label: 'Muy alto (entreno + partido, doble sesión)' },
]

export const OBJETIVOS = [
  { value: 'deficit', label: 'Déficit / perder grasa' },
  { value: 'superavit', label: 'Superávit / ganar músculo' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'rendimiento', label: 'Rendimiento en días de partido' },
]

function round(n) {
  return Math.round(n)
}

/**
 * Calcula BMR, TDEE, objetivo de kcal y reparto de macros.
 * @param {{weightKg:number, heightCm:number, age:number, sex:'m'|'f', activityLevel:string, objetivo:string}} params
 */
export function computeTDEE({ weightKg, heightCm, age, sex, activityLevel, objetivo }) {
  const w = Number(weightKg) || 0
  const h = Number(heightCm) || 0
  const a = Number(age) || 0

  const bmr = sex === 'm' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderado
  const tdee = bmr * multiplier

  let targetKcal = tdee
  let nota = ''
  if (objetivo === 'deficit') {
    targetKcal = tdee * 0.8
    nota = 'Déficit moderado (~20%) para perder grasa preservando rendimiento.'
  } else if (objetivo === 'superavit') {
    targetKcal = tdee * 1.1
    nota = 'Superávit moderado (~10%) para ganar músculo sin acumular grasa en exceso.'
  } else if (objetivo === 'rendimiento') {
    targetKcal = tdee * 1.0
    nota = 'Mantenimiento con más carbohidrato en días de partido/entreno intenso para maximizar el rendimiento.'
  } else {
    targetKcal = tdee * 1.0
    nota = 'Mantenimiento: cubrir el gasto para sostener el nivel de entrenamiento.'
  }

  // Reparto de macros: proteína en g/kg (rango deportista 1.8-2.2), grasa ~25% de las kcal,
  // el resto en carbohidrato.
  const proteinaGkg = objetivo === 'deficit' ? 2.2 : objetivo === 'superavit' ? 2.0 : 1.9
  const proteina_g = round(w * proteinaGkg)
  const proteina_kcal = proteina_g * 4
  const grasa_kcal = targetKcal * 0.25
  const grasa_g = round(grasa_kcal / 9)
  const carbo_kcal = Math.max(targetKcal - proteina_kcal - grasa_kcal, 0)
  const carbo_g = round(carbo_kcal / 4)

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    targetKcal: round(targetKcal),
    nota,
    macros: { proteina_g, carbo_g, grasa_g },
  }
}
