import { jsonrepair } from 'jsonrepair'

export const JSON_SCHEMA_HINT = `Responde ÚNICAMENTE con un objeto JSON válido (sin texto antes ni después, sin bloque de código \`\`\`), con esta forma exacta:

{
  "semana": {
    "objetivoKcal": número,
    "macros": { "proteina": número, "carbo": número, "grasa": número },
    "dias": [
      {
        "dia": "Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo",
        "contextoEntreno": "string (ej. día de esfuerzo/competición, entreno intenso, descanso)",
        "comidas": [
          {
            "tipo": "Desayuno|Comida|Merienda|Cena|Snack",
            "nombre": "string",
            "ingredientes": [ { "nombre": "string", "cantidad": "string (ej. '150 g')" } ],
            "kcal": número,
            "macros": { "proteina": número, "carbo": número, "grasa": número },
            "preparacion": "string, pasos breves",
            "variantes": ["string", "string"]
          }
        ]
      }
    ],
    "listaCompra": [ { "categoria": "string", "items": ["string"] } ]
  }
}`

const OBJETIVO_LABEL = {
  deficit: 'Déficit / perder grasa',
  superavit: 'Superávit / ganar músculo',
  mantenimiento: 'Mantenimiento',
  rendimiento: 'Rendimiento en días de esfuerzo/competición',
}

const MEAL_LABELS = { desayuno: 'Desayuno', comida: 'Comida', merienda: 'Merienda', cena: 'Cena' }
// Si el perfil guardado es de antes de que existiera este campo, o si el
// usuario no ha marcado ninguna, asumimos que solo cocina la cena en casa
// (caso real más habitual: fuera de casa el resto del día).
const DEFAULT_COMIDAS_EN_CASA = { desayuno: false, comida: false, merienda: false, cena: true }

function comidasEnCasaDe(profile) {
  const merged = { ...DEFAULT_COMIDAS_EN_CASA, ...(profile?.comidasEnCasa || {}) }
  if (!Object.values(merged).some(Boolean)) return DEFAULT_COMIDAS_EN_CASA
  return merged
}

function resumenFollowup(entries) {
  if (!entries || !entries.length) return 'Todavía no hay respuestas del cuestionario de seguimiento.'
  return entries
    .slice(0, 3)
    .map((e) => {
      const fecha = e.dateIso
      return `- ${fecha}: adherencia ${e.adherencia}/5, hambre/saciedad ${e.hambre}/5, energía ${e.energia}/5, digestión ${e.digestion}/5, peso ${e.pesoKg ?? '—'} kg${e.observaciones ? `, notas: "${e.observaciones}"` : ''}`
    })
    .join('\n')
}

export function buildPrompt({ profile, tdeeResult, recentFollowup, freeNotes }) {
  const p = profile || {}
  const t = tdeeResult || {}
  const macros = t.macros || {}

  const contextoDeportivo = p.contextoDeportivoActivo
    ? `Sí. Contexto deportivo: ${p.contextoDeportivoNotas || 'entrena y compite de forma regular; adapta el carbohidrato al día (más en días de esfuerzo/competición o entreno intenso, menos en descanso).'}`
    : 'No especialmente, alimentación general.'

  const comidasEnCasa = comidasEnCasaDe(p)
  const enCasaKeys = Object.keys(MEAL_LABELS).filter((k) => comidasEnCasa[k])
  const fueraKeys = Object.keys(MEAL_LABELS).filter((k) => !comidasEnCasa[k])
  const enCasaLabels = enCasaKeys.map((k) => MEAL_LABELS[k])
  const fueraLabels = fueraKeys.map((k) => MEAL_LABELS[k])

  const comidasEnCasaTexto = fueraLabels.length
    ? `Solo cocina y come en casa: ${enCasaLabels.join(', ')}. Está fuera de casa en: ${fueraLabels.join(', ')} (no necesita receta completa ni compra para esas comidas).`
    : `Cocina y come en casa todas sus comidas: ${enCasaLabels.join(', ')}.`

  const pisoCompartido = p.pisoCompartidoActivo
    ? `Sí, vive en un piso compartido con cocina y/o nevera compartidas.${p.pisoCompartidoNotas ? ` Notas: ${p.pisoCompartidoNotas}` : ''}`
    : 'No indicado / sin restricciones de cocina compartida.'

  // Motivo concreto de por qué la compra debe ser mínima, para que la
  // instrucción de simplificación quede justificada y no sea una petición
  // vaga (el modelo responde mejor a razones concretas que a "simplifica").
  const motivos = []
  if (p.pisoCompartidoActivo) motivos.push('vive en un piso compartido' + (p.pisoCompartidoNotas ? ` (${p.pisoCompartidoNotas})` : ''))
  if (enCasaLabels.length <= 2) motivos.push(`solo cocina de verdad ${enCasaLabels.join(' y ') || 'la cena'} en casa`)
  const motivoTexto = motivos.length ? motivos.join(' y ') : 'prefiere una compra sencilla y sin complicaciones'

  return `Eres un nutricionista deportivo experto. Diseña un plan de comidas semanal (lunes a domingo) para una persona activa, realista y de cocina casera española, sin ingredientes exóticos ni fantasiosos.

Datos del perfil (fijos, no los recalcules, respétalos tal cual):
- Objetivo: ${OBJETIVO_LABEL[p.objetivo] || p.objetivo || 'mantenimiento'}
- Peso: ${p.weightKg ?? '—'} kg · Altura: ${p.heightCm ?? '—'} cm · Edad: ${p.age ?? '—'} · Sexo (solo para la fórmula): ${p.sex === 'm' ? 'hombre' : 'mujer'}
- Nivel de actividad: ${p.activityLevel ?? '—'}
- TDEE calculado: ${t.tdee ?? '—'} kcal/día
- Objetivo de kcal/día: ${t.targetKcal ?? '—'} kcal
- Objetivo de macros/día: proteína ${macros.proteina_g ?? '—'} g, carbohidrato ${macros.carbo_g ?? '—'} g, grasa ${macros.grasa_g ?? '—'} g

Preferencias:
- Comidas al día preferidas: ${p.mealsPerDay ?? 4}
- Alergias / intolerancias: ${p.alergias || 'ninguna indicada'}
- Alimentos que le gustan: ${p.gustos || 'sin preferencias específicas'}
- Alimentos que NO le gustan: ${p.noGustos || 'ninguno indicado'}
- Tiempo disponible para cocinar: ${p.tiempoCocina || 'medio'}
- Contexto deportivo: ${contextoDeportivo}
- Comidas que realmente cocina y come en casa: ${comidasEnCasaTexto}
- Vivienda / cocina: ${pisoCompartido}

Últimas respuestas del cuestionario de seguimiento semanal (úsalas para ajustar el plan si hace falta, p.ej. si la adherencia fue baja simplifica recetas, si el hambre es alta sube saciedad, si la energía es baja revisa el carbohidrato):
${resumenFollowup(recentFollowup)}

Notas libres del usuario:
${freeNotes?.trim() || 'sin notas adicionales'}

Instrucciones importantes:
- Usa el objetivo de kcal y macros diarios ya calculados como referencia fija a respetar cada día (permite un margen razonable, no hace falta que cuadre al gramo).
- Refleja el contexto deportivo por día en "contextoEntreno" (ej. "día de esfuerzo/competición", "entreno intenso", "descanso") y ajusta el carbohidrato de las comidas de ese día en consecuencia (más carbohidrato de fácil digestión en días de esfuerzo/entreno intenso).
- Recetas realistas de cocina casera española, ingredientes fáciles de encontrar en cualquier supermercado, sin inventar productos exóticos.
- Cuando tenga sentido, ten en cuenta productos y marcas típicos de supermercados españoles (p.ej. Mercadona/Hacendado, Lidl, Carrefour, Dia) al sugerir ingredientes, para que sean fáciles de reconocer y comprar tal cual en la lista de la compra.
- Los kcal/macros de cada comida deben sumar aproximadamente el objetivo diario del día.
- IMPORTANTE — solo planifica comidas reales (con receta, ingredientes y preparación) para las comidas marcadas como "en casa" (${enCasaLabels.join(', ') || 'Cena'}) en cada día de "comidas". Para las comidas marcadas como fuera de casa (${fueraLabels.join(', ') || 'ninguna'}), NO generes una receta completa ni la incluyas en la lista de la compra: o bien omite directamente esa comida del array "comidas" de ese día, o si prefieres dejar constancia, añade solo una sugerencia genérica y ligera en "nombre" (ej. "Fuera de casa — algo ligero: fruta, yogur o un bocadillo sencillo") con "ingredientes": [] y sin "preparacion" detallada.
- El usuario ${motivoTexto}, así que la compra debe ser MÍNIMA: usa pocos ingredientes distintos en total para toda la semana y REPÍTELOS entre días (ej. una misma proteína base + un mismo carbohidrato base repetidos en varias cenas, cambiando solo la verdura, la especia o la salsa) en lugar de un ingrediente distinto y exótico cada día. Limita a 1-2 proteínas y 1-2 bases de carbohidrato distintas para toda la semana salvo que el usuario pida variedad explícitamente. El objetivo es no desperdiciar comida ni complicar la compra semanal.
- Cocina mínima: no des por hecho más equipamiento que vitro/sartén, cazuela/olla y horno (cocina de piso compartido, sin robots de cocina, freidora de aire, batidora potente ni utensilios especiales). Preparaciones con pocos pasos (máximo 4-5 pasos por receta).
- Lista de la compra corta: agrupa cada ingrediente en un único ítem con la cantidad total necesaria para toda la semana (ej. "Pechuga de pollo — 600 g (cena lunes, miércoles y viernes)") en vez de repetirlo varias veces; no añadas productos que solo se usan una vez si se puede evitar comprándolos en su lugar de una versión que ya esté en la lista.
- Incluye una lista de la compra agrupada por categorías (verdura/fruta, proteína, carbohidrato, lácteos, despensa, etc.) que cubra toda la semana, cubriendo únicamente las comidas marcadas como "en casa".

${JSON_SCHEMA_HINT}`
}

export function parseModelJson(text) {
  let cleaned = text.trim()
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) cleaned = fenceMatch[1].trim()
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1) cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  // El modelo a veces devuelve JSON casi válido (comas sobrantes, comillas sin
  // escapar, saltos de línea sin escapar dentro de una cadena...); jsonrepair
  // arregla estos casos antes de intentar el parseo estricto.
  return JSON.parse(jsonrepair(cleaned))
}
