import { Fragment, useEffect, useState } from 'react'
import { Calendar, ShoppingCart, Check, Search, X, Loader2, AlertCircle, Tag } from 'lucide-react'
import * as storage from '../storage'
import { searchFoods } from '../openFoodFacts'
import MealIcon from './MealIcon'
import { RecipeDetailSheet } from './RecipeCard'

const TIPOS_ORDEN = ['Desayuno', 'Comida', 'Merienda', 'Cena', 'Snack']

export default function MealCalendar({ refresh }) {
  const [tab, setTab] = useState('semana')
  const [openMeal, setOpenMeal] = useState(null)
  const [tick, setTick] = useState(0)
  const [searchingItem, setSearchingItem] = useState(null) // { key, item }

  const latest = storage.getLatestWeekPlan()

  if (!latest) {
    return (
      <div>
        <div className="row gap" style={{ marginBottom: 6 }}>
          <Calendar size={18} color="var(--accent-dark)" />
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Calendario</h2>
        </div>
        <div className="empty-state">
          Todavía no tienes un plan semanal generado.<br />Ve a "Generar plan" para crear uno.
        </div>
      </div>
    )
  }

  const { weekStartIso, plan } = latest
  const dias = plan.dias || []
  const checks = storage.getShoppingChecks(weekStartIso)
  const shoppingProducts = storage.getShoppingProducts(weekStartIso)

  function toggleCheck(key) {
    storage.setShoppingCheck(weekStartIso, key, !checks[key])
    setTick((t) => t + 1)
    refresh?.()
  }

  function pickProduct(key, producto) {
    storage.setShoppingProduct(weekStartIso, key, producto)
    setSearchingItem(null)
    setTick((t) => t + 1)
  }

  return (
    <div>
      <div className="row spread" style={{ marginBottom: 10 }}>
        <div className="row gap">
          <Calendar size={18} color="var(--accent-dark)" />
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Calendario</h2>
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--text-dim)', fontWeight: 600 }}>Semana del {weekStartIso}</span>
      </div>

      <div className="chip-row" style={{ marginBottom: 12 }}>
        <div className={'chip' + (tab === 'semana' ? ' selected' : '')} onClick={() => setTab('semana')}>Semana</div>
        <div className={'chip' + (tab === 'compra' ? ' selected' : '')} onClick={() => setTab('compra')}>
          <ShoppingCart size={12} /> Lista de la compra
        </div>
      </div>

      {tab === 'semana' && (
        <div style={{ overflowX: 'auto' }}>
          <div className="calendar-grid">
            <div className="calendar-cell-head" />
            {dias.map((d) => (
              <div key={d.dia} className="calendar-cell-head">
                {d.dia}
                {d.contextoEntreno && <div style={{ fontWeight: 500, fontSize: 9.5, color: 'var(--accent-2)', marginTop: 1 }}>{d.contextoEntreno}</div>}
              </div>
            ))}
            {TIPOS_ORDEN.map((tipo) => (
              <Fragment key={tipo}>
                <div className="calendar-row-head">{tipo}</div>
                {dias.map((d) => {
                  const meal = d.comidas?.find((c) => c.tipo === tipo)
                  return (
                    <div
                      key={d.dia + tipo}
                      className={'meal-cell' + (meal ? '' : ' empty')}
                      onClick={() => meal && setOpenMeal({ meal, dia: d.dia })}
                    >
                      {meal ? (
                        <>
                          <div className="row gap-sm" style={{ marginBottom: 2 }}>
                            <MealIcon ingredientes={meal.ingredientes} tipo={meal.tipo} size={16} />
                          </div>
                          <div className="mname">{meal.nombre}</div>
                          <div className="mkcal">{meal.kcal} kcal</div>
                        </>
                      ) : (
                        <div className="mkcal">—</div>
                      )}
                    </div>
                  )
                })}
              </Fragment>
            ))}
          </div>
        </div>
      )}

      {tab === 'compra' && (
        <div>
          {(plan.listaCompra || []).length === 0 && <div className="empty-state">El plan no incluye lista de la compra.</div>}
          {(plan.listaCompra || []).map((cat, ci) => (
            <div key={ci} className="card" style={{ marginBottom: 12 }}>
              <div className="section-title" style={{ margin: '0 0 8px' }}>{cat.categoria}</div>
              {(cat.items || []).map((item, ii) => {
                const key = `${ci}:${ii}:${item}`
                const checked = !!checks[key]
                const producto = shoppingProducts[key]
                return (
                  <div key={key} style={{ padding: '7px 0' }}>
                    <div className="row gap" style={{ cursor: 'pointer' }} onClick={() => toggleCheck(key)}>
                      <div
                        style={{
                          width: 20, height: 20, borderRadius: 6, border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: checked ? 'var(--accent)' : 'var(--surface)', borderColor: checked ? 'var(--accent)' : 'var(--border)', flexShrink: 0,
                        }}
                      >
                        {checked && <Check size={13} color="#fff" />}
                      </div>
                      <span style={{ fontSize: 14, textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--text-dim)' : 'var(--text)' }}>{item}</span>
                    </div>
                    <div style={{ paddingLeft: 30, marginTop: 5 }}>
                      {producto ? (
                        <div
                          className="chip chip-fav"
                          style={{ fontSize: 11.5, padding: '4px 10px' }}
                          onClick={() => setSearchingItem({ key, item })}
                        >
                          <Tag size={11} /> {[producto.brand, producto.store].filter(Boolean).join(' · ') || producto.name}
                        </div>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: 11.5, padding: '5px 10px' }}
                          onClick={() => setSearchingItem({ key, item })}
                        >
                          <Search size={12} /> Buscar producto real
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}

      {openMeal && <RecipeDetailSheet meal={openMeal.meal} dia={openMeal.dia} onClose={() => setOpenMeal(null)} />}
      {searchingItem && (
        <ProductSearchSheet
          item={searchingItem.item}
          onPick={(producto) => pickProduct(searchingItem.key, producto)}
          onClose={() => setSearchingItem(null)}
        />
      )}
    </div>
  )
}

// Busca en Open Food Facts un producto real que corresponda a un ítem de la
// lista de la compra (ej. "200 g de pechuga de pollo") y deja elegir uno.
function ProductSearchSheet({ item, onPick, onClose }) {
  const [query, setQuery] = useState(item)
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setError('')
      return
    }
    setSearching(true)
    setError('')
    const handle = setTimeout(async () => {
      const res = await searchFoods(query)
      setSearching(false)
      if (res.ok) setResults(res.results)
      else {
        setResults([])
        setError(res.error)
      }
    }, 400)
    return () => clearTimeout(handle)
  }, [query])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row spread" style={{ marginBottom: 10 }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Buscar producto real</div>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <p className="field-hint" style={{ marginBottom: 10 }}>Ítem de la lista: "{item}"</p>
        <div className="search-bar" style={{ marginBottom: 10 }}>
          <Search size={16} color="var(--text-dim)" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar alimento..." />
          {searching && <Loader2 size={15} className="spin" color="var(--text-dim)" />}
        </div>
        {error && (
          <div className="row gap" style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {results.map((r, i) => (
          <div
            key={i}
            className="list-item"
            onClick={() => onPick({ name: r.name, brand: r.brand, store: r.store })}
          >
            <div className="list-item-title">{r.name}</div>
            <div className="list-item-sub">
              {[r.brand, r.store].filter(Boolean).join(' · ') || (r.kcal100g != null ? `${r.kcal100g} kcal/100g` : 'sin marca')}
            </div>
          </div>
        ))}
        {!searching && !error && query.trim() && results.length === 0 && (
          <div className="empty-state">Sin resultados para "{query}".</div>
        )}
      </div>
    </div>
  )
}
