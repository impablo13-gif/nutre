import { jsonrepair } from 'jsonrepair'

export const JSON_SCHEMA_HINT = `Responde ÚNICAMENTE con un objeto JSON válido (sin texto antes ni después, sin bloque de código \`\`\`), con esta forma exacta:

{
  "semana": {
    "objetivoKcal": número,
    "macros": { "proteina": número, "carbo": número, "grasa": número },
    "dias": [
      {
        "dia": "Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo",
        "contextoEntreno": "string (ej. día de partido, entreno intenso, descanso)",
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
  rendimiento: 'Rendimiento en días de partido',
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

  const contextoFutsal = p.contextoFutsalActivo
    ? `Sí. Contexto de fútbol sala: ${p.contextoFutsalNotas || 'entrena y juega partidos de fútbol sala; adapta el carbohidrato al día (más en días de partido/entreno intenso, menos en descanso).'}`
    : 'No especialmente, alimentación general.'

  return `Eres un nutricionista deportivo experto en fútbol sala. Diseña un plan de comidas semanal (lunes a domingo) para un jugador/entrenador de fútbol sala, realista y de cocina casera española, sin ingredientes exóticos ni fantasiosos.

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
- Contexto de fútbol sala: ${contextoFutsal}

Últimas respuestas del cuestionario de seguimiento semanal (úsalas para ajustar el plan si hace falta, p.ej. si la adherencia fue baja simplifica recetas, si el hambre es alta sube saciedad, si la energía es baja revisa el carbohidrato):
${resumenFollowup(recentFollowup)}

Notas libres del usuario:
${freeNotes?.trim() || 'sin notas adicionales'}

Instrucciones importantes:
- Usa el objetivo de kcal y macros diarios ya calculados como referencia fija a respetar cada día (permite un margen razonable, no hace falta que cuadre al gramo).
- Refleja el contexto de fútbol sala por día en "contextoEntreno" (ej. "día de partido", "entreno intenso", "descanso") y ajusta el carbohidrato de las comidas de ese día en consecuencia (más carbohidrato de fácil digestión en días de partido/entreno intenso).
- Recetas realistas de cocina casera española, ingredientes fáciles de encontrar en cualquier supermercado, sin inventar productos exóticos.
- Cuando tenga sentido, ten en cuenta productos y marcas típicos de supermercados españoles (p.ej. Mercadona/Hacendado, Lidl, Carrefour, Dia) al sugerir ingredientes, para que sean fáciles de reconocer y comprar tal cual en la lista de la compra.
- Los kcal/macros de cada comida deben sumar aproximadamente el objetivo diario del día.
- Incluye una lista de la compra agrupada por categorías (verdura/fruta, proteína, carbohidrato, lácteos, despensa, etc.) que cubra toda la semana.

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
