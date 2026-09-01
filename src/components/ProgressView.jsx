import { TrendingUp, Flame } from 'lucide-react'
import * as storage from '../storage'
import { computeTDEE } from '../tdee'
import { toLocalIso } from '../dateUtils'
import LineChart from './LineChart'

function last7Dates() {
  const out = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const dd = new Date(d)
    dd.setDate(d.getDate() - i)
    out.push(toLocalIso(dd))
  }
  return out
}

export default function ProgressView() {
  const streak = storage.streak()
  const weightLog = storage.getWeightLog()
  const followups = storage.getFollowupEntries()
  const profile = storage.getProfile()
  const diary = storage.getDiaryEntries()

  const weightPoints = weightLog.slice(-10).map((w) => ({ value: w.weightKg, label: w.dateIso.slice(5) }))
  const adherencePoints = [...followups].reverse().slice(-8).map((f) => ({ value: f.adherencia, label: f.dateIso.slice(5) }))

  const dates = last7Dates()
  const daily = dates.map((dateIso) => {
    const entries = diary.filter((e) => e.dateIso === dateIso)
    const kcal = entries.reduce((s, e) => s + (Number(e.kcal) || 0), 0)
    const proteina = entries.reduce((s, e) => s + (Number(e.macros?.proteina) || 0), 0)
    const carbo = entries.reduce((s, e) => s + (Number(e.macros?.carbo) || 0), 0)
    const grasa = entries.reduce((s, e) => s + (Number(e.macros?.grasa) || 0), 0)
    return { dateIso, kcal, proteina, carbo, grasa, logged: entries.length > 0 }
  })
  const loggedDays = daily.filter((d) => d.logged)
  const avg = (key) => (loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d[key], 0) / loggedDays.length) : 0)

  let target = null
  if (profile && profile.weightKg && profile.heightCm && profile.age) {
    const t = computeTDEE(profile)
    target = { kcal: t.targetKcal, proteina: t.macros.proteina_g, carbo: t.macros.carbo_g, grasa: t.macros.grasa_g }
  }

  return (
    <div>
      <div className="row gap" style={{ marginBottom: 10 }}>
        <TrendingUp size={18} color="var(--accent-dark)" />
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>Progreso</h2>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="streak-hero">
          <div className="num"><Flame size={34} style={{ verticalAlign: -6 }} /> {streak}</div>
          <div className="label">{streak === 1 ? 'día seguido registrando' : 'días seguidos registrando'}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ margin: '0 0 10px' }}>Peso</div>
        <LineChart points={weightPoints} color="var(--accent)" unit="kg" />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ margin: '0 0 10px' }}>Adherencia semanal (1-5)</div>
        <LineChart points={adherencePoints} color="var(--accent-2)" />
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="section-title" style={{ margin: '0 0 10px' }}>Resumen de la semana (últimos 7 días)</div>
        {loggedDays.length === 0 ? (
          <div className="empty-state" style={{ padding: '10px 0' }}>Todavía no has registrado comidas esta semana.</div>
        ) : (
          <div className="macro-bars">
            <MacroBarRow label="Kcal/día" value={avg('kcal')} target={target?.kcal} color="var(--accent)" suffix="" />
            <MacroBarRow label="Proteína" value={avg('proteina')} target={target?.proteina} color="var(--accent-2)" suffix="g" />
            <MacroBarRow label="Carbo" value={avg('carbo')} target={target?.carbo} color="var(--carbo)" suffix="g" />
            <MacroBarRow label="Grasa" value={avg('grasa')} target={target?.grasa} color="var(--accent)" suffix="g" />
          </div>
        )}
        <p className="field-hint" style={{ marginTop: 10 }}>Promedio diario registrado (solo días con al menos una comida anotada) frente a tu objetivo.</p>
      </div>
    </div>
  )
}

function MacroBarRow({ label, value, target, color, suffix }) {
  const pct = target ? Math.min(100, Math.round((value / target) * 100)) : Math.min(100, value / 20)
  return (
    <div className="macro-bar-row">
      <span className="mb-label">{label}</span>
      <span className="mb-track"><span className="mb-fill" style={{ width: `${pct}%`, background: color }} /></span>
      <span className="mb-val">{value}{suffix}{target ? ` / ${Math.round(target)}${suffix}` : ''}</span>
    </div>
  )
}
