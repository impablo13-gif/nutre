import { useState } from 'react'
import { X, ChefHat, Flame } from 'lucide-react'
import MealIcon from './MealIcon'
import MacroDonut, { MacroLegend } from './MacroDonut'

export function RecipeCard({ meal, dia, onOpen }) {
  const macros = meal.macros || {}
  return (
    <div className="card card-tight" style={{ cursor: 'pointer' }} onClick={() => onOpen(meal, dia)}>
      <div className="row spread">
        <div className="row gap">
          <MealIcon ingredientes={meal.ingredientes} tipo={meal.tipo} size={30} />
          <div>
            <div className="tag tag-coral" style={{ marginBottom: 3 }}>{meal.tipo}</div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{meal.nombre}</div>
          </div>
        </div>
        <div className="row gap-sm" style={{ color: 'var(--text-dim)', fontSize: 12.5, fontWeight: 700, flexShrink: 0 }}>
          <Flame size={13} /> {meal.kcal} kcal
        </div>
      </div>
    </div>
  )
}

export function RecipeDetailSheet({ meal, dia, onClose }) {
  if (!meal) return null
  const macros = meal.macros || {}
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row spread" style={{ marginBottom: 10 }}>
          <div className="row gap-sm" style={{ color: 'var(--text-dim)', fontSize: 12, fontWeight: 700 }}>
            {dia ? `${dia} · ` : ''}{meal.tipo}
          </div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 10 }}>{meal.nombre}</h3>

        <div className="row" style={{ justifyContent: 'center', marginBottom: 14 }}>
          <MacroDonut proteina={macros.proteina} carbo={macros.carbo} grasa={macros.grasa} kcal={meal.kcal} size={130} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <MacroLegend proteina={macros.proteina} carbo={macros.carbo} grasa={macros.grasa} />
        </div>

        {meal.ingredientes?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ margin: '0 0 8px' }}>Ingredientes</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.8 }}>
              {meal.ingredientes.map((ing, i) => (
                <li key={i}>{ing.nombre}{ing.cantidad ? ` — ${ing.cantidad}` : ''}</li>
              ))}
            </ul>
          </div>
        )}

        {meal.preparacion && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ margin: '0 0 8px' }}><ChefHat size={13} style={{ verticalAlign: -2 }} /> Preparación</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{meal.preparacion}</p>
          </div>
        )}

        {meal.variantes?.length > 0 && (
          <div>
            <div className="section-title" style={{ margin: '0 0 8px' }}>Variantes</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.8, color: 'var(--text-dim)' }}>
              {meal.variantes.map((v, i) => <li key={i}>{v}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RecipeCardWithDetail({ meal, dia }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RecipeCard meal={meal} dia={dia} onOpen={() => setOpen(true)} />
      {open && <RecipeDetailSheet meal={meal} dia={dia} onClose={() => setOpen(false)} />}
    </>
  )
}
