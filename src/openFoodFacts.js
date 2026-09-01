// Búsqueda de alimentos contra la API pública de Open Food Facts (sin API key).

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const FIELDS = 'product_name,brands,stores,nutriments,quantity'

// Marcas blancas españolas que en la práctica identifican el supermercado,
// para cuando el campo "stores" de Open Food Facts viene vacío.
const PRIVATE_LABEL_STORE = {
  hacendado: 'Mercadona',
  carrefour: 'Carrefour',
  'carrefour bio': 'Carrefour',
  'carrefour selección': 'Carrefour',
  'carrefour classic': 'Carrefour',
  dia: 'Dia',
  'dia %': 'Dia',
  'la cesta de la abuela': 'Dia',
  auchan: 'Alcampo',
  alcampo: 'Alcampo',
  'auchan mmm!': 'Alcampo',
  eroski: 'Eroski',
  'eroski basic': 'Eroski',
  'eroski seleqtia': 'Eroski',
  lidl: 'Lidl',
  deluxe: 'Lidl',
  'freeway': 'Lidl',
  'el corte inglés': 'El Corte Inglés',
  aliada: 'El Corte Inglés',
  bonpreu: 'Bonpreu',
  consum: 'Consum',
}

function firstValue(csv) {
  if (!csv) return ''
  return csv.split(',')[0].trim()
}

function inferStoreFromBrand(brands) {
  const brand = firstValue(brands).toLowerCase()
  if (!brand) return ''
  return PRIVATE_LABEL_STORE[brand] || ''
}

/**
 * Busca alimentos por texto libre.
 * @returns {Promise<{ok:true, results:Array}|{ok:false, error:string}>}
 */
export async function searchFoods(query) {
  const q = query.trim()
  if (!q) return { ok: true, results: [] }
  const url = `${SEARCH_URL}?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=15&fields=${FIELDS}`
  try {
    const res = await fetch(url)
    if (!res.ok) return { ok: false, error: 'No se pudo conectar con la base de datos de alimentos.' }
    const data = await res.json()
    const products = Array.isArray(data.products) ? data.products : []
    const results = products
      .filter((p) => p.product_name)
      .map((p) => {
        const brand = firstValue(p.brands)
        const store = firstValue(p.stores) || inferStoreFromBrand(p.brands)
        return {
          name: p.product_name,
          brand,
          store,
          quantity: p.quantity || '',
          kcal100g: numOrNull(p.nutriments?.['energy-kcal_100g']),
          proteina100g: numOrNull(p.nutriments?.proteins_100g),
          carbo100g: numOrNull(p.nutriments?.carbohydrates_100g),
          grasa100g: numOrNull(p.nutriments?.fat_100g),
        }
      })
    return { ok: true, results }
  } catch {
    return { ok: false, error: 'No se pudo buscar el alimento. Comprueba tu conexión a internet.' }
  }
}

function numOrNull(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

/** Escala los valores por 100g a la cantidad en gramos indicada. */
export function scaleFood(food, grams) {
  const factor = (Number(grams) || 0) / 100
  const round1 = (n) => Math.round(n * 10) / 10
  return {
    kcal: food.kcal100g != null ? round1(food.kcal100g * factor) : 0,
    proteina: food.proteina100g != null ? round1(food.proteina100g * factor) : 0,
    carbo: food.carbo100g != null ? round1(food.carbo100g * factor) : 0,
    grasa: food.grasa100g != null ? round1(food.grasa100g * factor) : 0,
  }
}
