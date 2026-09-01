import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Star, Trash2, X, Loader2, AlertCircle, PenLine, ClipboardList } from 'lucide-react'
import * as storage from '../storage'
import { searchFoods, scaleFood } from '../openFoodFacts'
import { computeTDEE } from '../tdee'
import { todayIso } from '../dateUtils'

const DIA_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Combina marca y supermercado en una etiqueta corta, p.ej. "Hacendado · Mercadona".
function brandStore(brand, store) {
  const parts = []
  if (brand) parts.push(brand)
  if (store && store !== brand) parts.push(store)
  return parts.join(' · ')
}

function todayTarget() {
  const profile = storage.getProfile()
  const latest = storage.getLatestWeekPlan()
  if (latest?.plan) {
    const diaName = DIA_NAMES[new Date().getDay()]
    const dia = latest.plan.dias?.find((d) => d.dia === diaName)
    if (dia) {
      const kcal = dia.comidas?.reduce((s, m) => s + (Number(m.kcal) || 0), 0) || latest.plan.objetivoKcal
      const macros = dia.comidas?.reduce(
        (acc, m) => ({
          proteina: acc.proteina + (Number(m.macros?.proteina) || 0),
          carbo: acc.carbo + (Number(m.macros?.carbo) || 0),
          grasa: acc.grasa + (Number(m.macros?.grasa) || 0),
        }),
        { proteina: 0, carbo: 0, grasa: 0 }
      )
      return { kcal: kcal || latest.plan.objetivoKcal, macros: macros || latest.plan.macros, source: 'plan' }
    }
    return { kcal: latest.plan.objetivoKcal, macros: latest.plan.macros, source: 'plan' }
  }
  if (profile && profile.weightKg && profile.heightCm && profile.age) {
    const t = computeTDEE(profile)
    return { kcal: t.targetKcal, macros: { proteina: t.macros.proteina_g, carbo: t.macros.carbo_g, grasa: t.macros.grasa_g }, source: 'perfil' }
  }
  return null
}

export default function FoodDiary({ refresh }) {
  const dateIso = todayIso()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [picked, setPicked] = useState(null) // producto OFF elegido
  const [grams, setGrams] = useState(100)
  const [manualOpen, setManualOpen] = useState(false)
  const [manual, setManual] = useState({ foodName: '', kcal: '', proteina: '', carbo: '', grasa: '' })
  const [tick, setTick] = useState(0)

  const entries = storage.getDiaryEntriesForDate(dateIso)
  const favorites = storage.getFavorites()
  const recentNames = useMemo(() => {
    const all = storage.getDiaryEntries()
    const seen = new Set()
    const out = []
    for (const e of all) {
      const k = e.foodName + '|' + (e.brand || '')
      if (seen.has(k)) continue
      seen.add(k)
      out.push(e)
      if (out.length >= 6) break
    }
    return out
  }, [tick])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setSearchError('')
      return
    }
    setSearching(true)
    setSearchError('')
    const handle = setTimeout(async () => {
      const res = await searchFoods(query)
      setSearching(false)
      if (res.ok) setResults(res.results)
      else {
        setResults([])
        setSearchError(res.error)
      }
    }, 400)
    return () => clearTimeout(handle)
  }, [query])

  function bump() {
    setTick((t) => t + 1)
    refresh()
  }

  function addOffEntry(food, g, saveAsFavorite) {
    const scaled = scaleFood(food, g)
    storage.addDiaryEntry({
      dateIso,
      foodName: food.name,
      brand: food.brand,
      store: food.store || '',
      quantityGrams: Number(g),
      kcal: scaled.kcal,
      macros: { proteina: scaled.proteina, carbo: scaled.carbo, grasa: scaled.grasa },
      source: 'off',
    })
    if (saveAsFavorite) {
      storage.addFavorite({
        foodName: food.name,
        brand: food.brand,
        store: food.store || '',
        kcal100g: food.kcal100g,
        proteina100g: food.proteina100g,
        carbo100g: food.carbo100g,
        grasa100g: food.grasa100g,
      })
    }
    setPicked(null)
    setGrams(100)
    setQuery('')
    setResults([])
    bump()
  }

  function quickAddFavorite(fav) {
    addOffEntry(
      { name: fav.foodName, brand: fav.brand, store: fav.store || '', kcal100g: fav.kcal100g, proteina100g: fav.proteina100g, carbo100g: fav.carbo100g, grasa100g: fav.grasa100g },
      100,
      false
    )
  }
  function quickAddRecent(entry) {
    storage.addDiaryEntry({
      dateIso,
      foodName: entry.foodName,
      brand: entry.brand,
      store: entry.store || '',
      quantityGrams: entry.quantityGrams,
      kcal: entry.kcal,
      macros: entry.macros,
      source: entry.source,
    })
    bump()
  }

  function addManual(e) {
    e.preventDefault()
    if (!manual.foodName.trim()) return
    storage.addDiaryEntry({
      dateIso,
      foodName: manual.foodName.trim(),
      brand: '',
      quantityGrams: null,
      kcal: Number(manual.kcal) || 0,
      macros: { proteina: Number(manual.proteina) || 0, carbo: Number(manual.carbo) || 0, grasa: Number(manual.grasa) || 0 },
      source: 'manual',
    })
    setManual({ foodName: '', kcal: '', proteina: '', carbo: '', grasa: '' })
    setManualOpen(false)
    bump()
  }

  function removeEntry(id) {
    storage.removeDiaryEntry(id)
    bump()
  }

  const totals = entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (Number(e.kcal) || 0),
      proteina: acc.proteina + (Number(e.macros?.proteina) || 0),
      carbo: acc.carbo + (Number(e.macros?.carbo) || 0),
      grasa: acc.grasa + (Number(e.macros?.grasa) || 0),
    }),
    { kcal: 0, proteina: 0, carbo: 0, grasa: 0 }
  )
  const target = todayTarget()
  const kcalPct = target?.kcal ? Math.min(100, Math.round((totals.kcal / target.kcal) * 100)) : null

  return (
    <div>
      <div className="row gap" style={{ marginBottom: 10 }}>
        <ClipboardList size={18} color="var(--accent-dark)" />
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>Diario</h2>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row spread" style={{ marginBottom: 8 }}>
          <div className="section-title" style={{ margin: 0 }}>Hoy</div>
          {target && <span style={{ fontSize: 12, color: 'var(--text-dim)', fontWeight: 600 }}>Objetivo: {target.kcal} kcal ({target.source === 'plan' ? 'plan semanal' : 'perfil'})</span>}
        </div>
        <div className="row spread" style={{ marginBottom: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{Math.round(totals.kcal)}</span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{target ? `de ${target.kcal} kcal` : 'kcal registradas'}</span>
        </div>
        <div className="progress-bar" style={{ marginBottom: 12 }}>
          <div className="progress-bar-fill" style={{ width: `${kcalPct ?? Math.min(100, totals.kcal / 20)}%`, background: kcalPct != null && kcalPct > 100 ? 'var(--accent-2)' : 'var(--accent)' }} />
        </div>
        <div className="macro-bars">
          <MacroBar label="Proteína" value={totals.proteina} target={target?.macros?.proteina} color="var(--accent-2)" />
          <MacroBar label="Carbo" value={totals.carbo} target={target?.macros?.carbo} color="var(--carbo)" />
          <MacroBar label="Grasa" value={totals.grasa} target={target?.macros?.grasa} color="var(--accent)" />
        </div>
      </div>

      {(favorites.length > 0 || recentNames.length > 0) && (
        <div style={{ marginBottom: 12 }}>
          <div className="chip-row">
            {favorites.map((f) => (
              <div key={f.id} className="chip chip-fav" onClick={() => quickAddFavorite(f)}>
                <Star size={12} /> {f.foodName}
              </div>
            ))}
            {recentNames.map((e) => (
              <div key={e.id} className="chip" onClick={() => quickAddRecent(e)}>
                <Plus size={12} /> {e.foodName}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="search-bar" style={{ marginBottom: 10 }}>
        <Search size={16} color="var(--text-dim)" />
        <input
          type="text"
          placeholder="Buscar alimento (ej. pollo, arroz, yogur)..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPicked(null) }}
        />
        {searching && <Loader2 size={15} className="spin" color="var(--text-dim)" />}
      </div>

      {searchError && (
        <div className="row gap" style={{ color: 'var(--danger)', fontSize: 12.5, marginBottom: 10 }}>
          <AlertCircle size={14} /> {searchError}
        </div>
      )}

      {results.length > 0 && !picked && (
        <div style={{ marginBottom: 12 }}>
          {results.map((r, i) => (
            <div key={i} className="list-item" onClick={() => { setPicked(r); setGrams(100) }}>
              <div className="list-item-title">{r.name}</div>
              <div className="list-item-sub">
                {brandStore(r.brand, r.store) ? `${brandStore(r.brand, r.store)} · ` : ''}{r.kcal100g != null ? `${r.kcal100g} kcal/100g` : 'kcal no disponible'}
              </div>
            </div>
          ))}
        </div>
      )}

      {picked && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="row spread" style={{ marginBottom: brandStore(picked.brand, picked.store) ? 2 : 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{picked.name}</div>
            <button className="icon-btn" onClick={() => setPicked(null)}><X size={18} /></button>
          </div>
          {brandStore(picked.brand, picked.store) && (
            <div className="field-hint" style={{ marginBottom: 10 }}>{brandStore(picked.brand, picked.store)}</div>
          )}
          <div className="field">
            <label className="field-label">Cantidad (gramos)</label>
            <input type="number" min="1" value={grams} onChange={(e) => setGrams(e.target.value)} />
          </div>
          {(() => {
            const s = scaleFood(picked, grams)
            return (
              <p className="field-hint" style={{ marginBottom: 12 }}>
                {s.kcal} kcal · P {s.proteina}g · C {s.carbo}g · G {s.grasa}g
              </p>
            )
          })()}
          <div className="row gap">
            <button className="btn" style={{ width: 'auto', flex: 1 }} onClick={() => addOffEntry(picked, grams, false)}>Añadir</button>
            <button className="btn btn-outline" style={{ width: 'auto', flex: 1 }} onClick={() => addOffEntry(picked, grams, true)}>
              <Star size={14} /> Añadir y guardar en favoritos
            </button>
          </div>
        </div>
      )}

      <button className="btn btn-ghost" style={{ marginBottom: 12 }} onClick={() => setManualOpen((o) => !o)}>
        <PenLine size={15} /> {manualOpen ? 'Cancelar entrada manual' : 'Añadir manualmente'}
      </button>

      {manualOpen && (
        <form className="card" style={{ marginBottom: 14 }} onSubmit={addManual}>
          <div className="field">
            <label className="field-label">Nombre del alimento</label>
            <input type="text" value={manual.foodName} onChange={(e) => setManual((m) => ({ ...m, foodName: e.target.value }))} required />
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field-label">Kcal</label>
              <input type="number" value={manual.kcal} onChange={(e) => setManual((m) => ({ ...m, kcal: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Proteína (g)</label>
              <input type="number" value={manual.proteina} onChange={(e) => setManual((m) => ({ ...m, proteina: e.target.value }))} />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field-label">Carbo (g)</label>
              <input type="number" value={manual.carbo} onChange={(e) => setManual((m) => ({ ...m, carbo: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Grasa (g)</label>
              <input type="number" value={manual.grasa} onChange={(e) => setManual((m) => ({ ...m, grasa: e.target.value }))} />
            </div>
          </div>
          <button className="btn" type="submit">Añadir al diario</button>
        </form>
      )}

      <div className="section-title">Registrado hoy</div>
      {entries.length === 0 && (
        <div className="empty-state">
          Todavía no has registrado ninguna comida hoy.<br />Busca un alimento arriba o toca uno de tus favoritos/recientes para empezar.
        </div>
      )}
      {entries.map((e) => (
        <div key={e.id} className="list-item" style={{ cursor: 'default' }}>
          <div className="row spread">
            <div>
              <div className="list-item-title">{e.foodName}</div>
              <div className="list-item-sub">
                {brandStore(e.brand, e.store) ? `${brandStore(e.brand, e.store)} · ` : ''}{e.quantityGrams ? `${e.quantityGrams} g · ` : ''}{Math.round(e.kcal)} kcal · P {e.macros?.proteina}g C {e.macros?.carbo}g G {e.macros?.grasa}g
              </div>
            </div>
            <button className="icon-btn" onClick={() => removeEntry(e.id)}><Trash2 size={16} /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

function MacroBar({ label, value, target, color }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : Math.min(100, value / 2)
  return (
    <div className="macro-bar-row">
      <span className="mb-label">{label}</span>
      <span className="mb-track"><span className="mb-fill" style={{ width: `${pct}%`, background: color }} /></span>
      <span className="mb-val">{Math.round(value)}{target ? ` / ${Math.round(target)}g` : 'g'}</span>
    </div>
  )
}
