// Set reutilizable de ~9 iconos planos de comida, dibujados a mano en SVG.
// MealIcon compone 2-3 de ellos según coincidencias de palabras clave en los
// ingredientes (o el tipo) de la comida, en vez de ilustrar cada receta única.

function Plate({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="13" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.5" />
      <circle cx="14" cy="14" r="9" fill="none" stroke="var(--border)" strokeWidth="1" />
    </svg>
  )
}
function Chicken({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M9 11c0-3 2.5-5 5.5-5S20 8 20 11c0 2-1 3.5-2.5 4.5l1.5 6.5-3-2-1.5 2-1.5-2-3 2 1.5-6.5C10 14.5 9 13 9 11z" fill="var(--accent-2)" />
    </svg>
  )
}
function Fish({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M6 14c3-4 8-6 13-4-1 1.5-1 2.5 0 4-5 2-10 0-13-4z" fill="#5c9fd6" transform="translate(0,3)" />
      <path d="M6 17l-3-3 3-3z" fill="#5c9fd6" />
      <circle cx="16" cy="17" r="1" fill="#fff" />
    </svg>
  )
}
function Legume({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M7 17c-2-3-1-8 3-10 4 1 8 1 10-2 2 4 1 10-3 13-4 3-8 2-10-1z" fill="#8a6a3e" />
      <circle cx="11" cy="14" r="1.6" fill="#f0e2c8" />
      <circle cx="15" cy="11" r="1.6" fill="#f0e2c8" />
      <circle cx="14" cy="17" r="1.6" fill="#f0e2c8" />
    </svg>
  )
}
function Egg({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <ellipse cx="14" cy="16" rx="7" ry="8.5" fill="#fff" stroke="#e6dcc8" strokeWidth="1" />
      <circle cx="14" cy="16" r="4" fill="var(--carbo)" />
    </svg>
  )
}
function Rice({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <ellipse cx="14" cy="18" rx="9" ry="4.5" fill="#fdfaf0" stroke="var(--border)" strokeWidth="1" />
      {[...Array(9)].map((_, i) => (
        <ellipse key={i} cx={8 + (i % 3) * 6} cy={14 + Math.floor(i / 3) * 2.5} rx="1.6" ry="0.9" fill="#fff" stroke="var(--border)" strokeWidth="0.6" />
      ))}
    </svg>
  )
}
function Bread({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <path d="M6 18c0-6 3.5-10 8-10s8 4 8 10c0 1.5-1 2.5-2.5 2.5h-11C7 20.5 6 19.5 6 18z" fill="var(--carbo)" />
      <path d="M9 15c1.5-1 3-1 4 0M15 15c1.5-1 3-1 4 0" stroke="#8a6412" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  )
}
function Potato({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <ellipse cx="14" cy="15" rx="8" ry="6.5" fill="#d9a765" transform="rotate(-10 14 15)" />
      <circle cx="11" cy="13" r="0.9" fill="#a97c3f" />
      <circle cx="16" cy="17" r="0.9" fill="#a97c3f" />
      <circle cx="17" cy="12" r="0.9" fill="#a97c3f" />
    </svg>
  )
}
function Veg({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <circle cx="11" cy="11" r="5" fill="var(--accent)" />
      <circle cx="17" cy="10" r="4" fill="var(--accent-dark)" />
      <circle cx="14" cy="15" r="4.5" fill="var(--accent)" />
      <rect x="13" y="16" width="2" height="6" rx="1" fill="#7a5a3a" />
    </svg>
  )
}
function Fruit({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28">
      <circle cx="14" cy="16" r="7" fill="var(--accent-2)" />
      <path d="M14 9c0-2 1.5-3 3-3" stroke="#5a3d20" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M15 8c1.5-1.5 3-1 3.5 0.5" fill="var(--accent)" />
    </svg>
  )
}

const ICONS = { plate: Plate, chicken: Chicken, fish: Fish, legume: Legume, egg: Egg, rice: Rice, bread: Bread, potato: Potato, veg: Veg, fruit: Fruit }

const KEYWORD_MAP = [
  { key: 'fish', words: ['pescado', 'atun', 'atún', 'salmon', 'salmón', 'merluza', 'gamba', 'marisco', 'bacalao', 'sardina'] },
  { key: 'chicken', words: ['pollo', 'pavo', 'ternera', 'carne', 'cerdo', 'lomo', 'jamon', 'jamón', 'solomillo'] },
  { key: 'legume', words: ['lenteja', 'garbanzo', 'alubia', 'legumbre', 'tofu', 'judia', 'judía', 'soja'] },
  { key: 'egg', words: ['huevo', 'tortilla'] },
  { key: 'rice', words: ['arroz', 'quinoa'] },
  { key: 'bread', words: ['pan', 'tostada', 'pasta', 'avena', 'cereales'] },
  { key: 'potato', words: ['patata', 'boniato', 'batata'] },
  { key: 'veg', words: ['verdura', 'ensalada', 'brocoli', 'brócoli', 'espinaca', 'tomate', 'pimiento', 'calabacin', 'calabacín', 'zanahoria', 'lechuga', 'champinon', 'champiñón'] },
  { key: 'fruit', words: ['fruta', 'manzana', 'platano', 'plátano', 'naranja', 'fresa', 'kiwi', 'pera', 'uva', 'mango'] },
]

function detectIconKeys(ingredientNames, tipo) {
  const text = [...(ingredientNames || []), tipo || ''].join(' ').toLowerCase()
  const found = []
  for (const entry of KEYWORD_MAP) {
    if (entry.words.some((w) => text.includes(w))) found.push(entry.key)
    if (found.length >= 3) break
  }
  return found.length ? found : ['plate']
}

/**
 * @param {{ingredientes?: Array<{nombre:string}>, tipo?: string, size?: number}} props
 */
export default function MealIcon({ ingredientes, tipo, size = 26 }) {
  const names = (ingredientes || []).map((i) => i.nombre || '')
  const keys = detectIconKeys(names, tipo)
  return (
    <div className="row" style={{ gap: -8 }}>
      {keys.map((k, i) => {
        const Icon = ICONS[k] || Plate
        return (
          <div key={k + i} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: keys.length - i, background: 'var(--bg)', borderRadius: '50%' }}>
            <Icon size={size} />
          </div>
        )
      })}
    </div>
  )
}
