import { useMemo, useState } from 'react'
import { Salad } from 'lucide-react'
import * as storage from '../storage'
import { RecipeCard, RecipeDetailSheet } from './RecipeCard'

const TIPOS = ['Todos', 'Desayuno', 'Comida', 'Merienda', 'Cena', 'Snack']

export default function RecipesGallery() {
  const [filter, setFilter] = useState('Todos')
  const [open, setOpen] = useState(null)

  const allMeals = useMemo(() => {
    const plans = storage.getWeekPlans()
    const out = []
    for (const weekStartIso of Object.keys(plans).sort().reverse()) {
      const plan = plans[weekStartIso]
      for (const dia of plan.dias || []) {
        for (const meal of dia.comidas || []) {
          out.push({ meal, dia: dia.dia, weekStartIso })
        }
      }
    }
    return out
  }, [])

  const filtered = filter === 'Todos' ? allMeals : allMeals.filter((m) => m.meal.tipo === filter)

  return (
    <div>
      <div className="row gap" style={{ marginBottom: 10 }}>
        <Salad size={18} color="var(--accent-dark)" />
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>Recetas</h2>
      </div>

      <div className="chip-row" style={{ marginBottom: 14 }}>
        {TIPOS.map((t) => (
          <div key={t} className={'chip' + (filter === t ? ' selected' : '')} onClick={() => setFilter(t)}>{t}</div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          Todavía no hay recetas. Genera un plan semanal en la pestaña "Generar plan" para llenar tu recetario.
        </div>
      )}

      {filtered.map((item, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <RecipeCard meal={item.meal} dia={item.dia} onOpen={(meal, dia) => setOpen({ meal, dia })} />
        </div>
      ))}

      {open && <RecipeDetailSheet meal={open.meal} dia={open.dia} onClose={() => setOpen(null)} />}
    </div>
  )
}
