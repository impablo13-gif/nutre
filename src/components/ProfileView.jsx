import { useState } from 'react'
import { User, Save, CheckCircle2 } from 'lucide-react'
import * as storage from '../storage'
import { computeTDEE, ACTIVITY_LEVELS, OBJETIVOS } from '../tdee'
import MacroDonut, { MacroLegend } from './MacroDonut'

const DEFAULTS = {
  objetivo: 'mantenimiento',
  weightKg: '',
  heightCm: '',
  age: '',
  sex: 'm',
  activityLevel: 'moderado',
  mealsPerDay: 4,
  alergias: '',
  gustos: '',
  noGustos: '',
  tiempoCocina: 'medio',
  contextoFutsalActivo: true,
  contextoFutsalNotas: '',
}

export default function ProfileView({ refresh }) {
  const saved = storage.getProfile()
  const [form, setForm] = useState({ ...DEFAULTS, ...(saved || {}) })
  const [savedFlash, setSavedFlash] = useState(false)

  function set(patch) {
    setForm((f) => ({ ...f, ...patch }))
  }

  const canCompute = form.weightKg && form.heightCm && form.age
  const tdeeResult = canCompute ? computeTDEE(form) : null

  function handleSave(e) {
    e.preventDefault()
    storage.saveProfile(form)
    setSavedFlash(true)
    refresh()
    setTimeout(() => setSavedFlash(false), 1800)
  }

  return (
    <div>
      <div className="row gap" style={{ marginBottom: 6 }}>
        <User size={18} color="var(--accent-dark)" />
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>Tu perfil</h2>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 14 }}>
        Estos datos se usan para calcular tu gasto energético y para generar planes de comida a tu medida.
      </p>

      {tdeeResult && (
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="section-title" style={{ margin: '0 0 10px' }}>Tu objetivo calculado</div>
          <div className="row" style={{ justifyContent: 'center', marginBottom: 10 }}>
            <MacroDonut
              proteina={tdeeResult.macros.proteina_g}
              carbo={tdeeResult.macros.carbo_g}
              grasa={tdeeResult.macros.grasa_g}
              kcal={tdeeResult.targetKcal}
              size={140}
            />
          </div>
          <MacroLegend proteina={tdeeResult.macros.proteina_g} carbo={tdeeResult.macros.carbo_g} grasa={tdeeResult.macros.grasa_g} />
          <div className="grid-2" style={{ marginTop: 12 }}>
            <div className="stat-box"><div className="val">{tdeeResult.bmr}</div><div className="lbl">BMR kcal</div></div>
            <div className="stat-box"><div className="val">{tdeeResult.tdee}</div><div className="lbl">TDEE kcal</div></div>
          </div>
          <p className="field-hint" style={{ marginTop: 10 }}>{tdeeResult.nota}</p>
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="field">
            <label className="field-label">Objetivo</label>
            <select value={form.objetivo} onChange={(e) => set({ objetivo: e.target.value })}>
              {OBJETIVOS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field-label">Peso (kg)</label>
              <input type="number" step="0.1" min="30" value={form.weightKg} onChange={(e) => set({ weightKg: e.target.value })} required />
            </div>
            <div className="field">
              <label className="field-label">Altura (cm)</label>
              <input type="number" step="1" min="100" value={form.heightCm} onChange={(e) => set({ heightCm: e.target.value })} required />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label className="field-label">Edad</label>
              <input type="number" step="1" min="10" value={form.age} onChange={(e) => set({ age: e.target.value })} required />
            </div>
            <div className="field">
              <label className="field-label">Sexo</label>
              <select value={form.sex} onChange={(e) => set({ sex: e.target.value })}>
                <option value="m">Hombre</option>
                <option value="f">Mujer</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Nivel de actividad</label>
            <select value={form.activityLevel} onChange={(e) => set({ activityLevel: e.target.value })}>
              {ACTIVITY_LEVELS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="field-label">Comidas al día preferidas</label>
            <input type="number" min="3" max="6" value={form.mealsPerDay} onChange={(e) => set({ mealsPerDay: e.target.value })} />
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="field">
            <label className="field-label">Alergias / intolerancias</label>
            <textarea placeholder="Ej. lactosa, frutos secos..." value={form.alergias} onChange={(e) => set({ alergias: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Alimentos que te gustan</label>
            <textarea placeholder="Ej. pollo, arroz, pasta, plátano..." value={form.gustos} onChange={(e) => set({ gustos: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Alimentos que NO te gustan</label>
            <textarea placeholder="Ej. pescado azul, brócoli..." value={form.noGustos} onChange={(e) => set({ noGustos: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Tiempo disponible para cocinar</label>
            <select value={form.tiempoCocina} onChange={(e) => set({ tiempoCocina: e.target.value })}>
              <option value="poco">Poco (recetas rápidas)</option>
              <option value="medio">Medio</option>
              <option value="mucho">Mucho (puedo cocinar con calma)</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 14 }}>
          <div className="row spread" style={{ marginBottom: form.contextoFutsalActivo ? 12 : 0 }}>
            <label className="field-label" style={{ margin: 0 }}>Contexto fútbol sala</label>
            <div className={'switch' + (form.contextoFutsalActivo ? ' on' : '')} onClick={() => set({ contextoFutsalActivo: !form.contextoFutsalActivo })} />
          </div>
          {form.contextoFutsalActivo && (
            <textarea
              placeholder="Ej. entreno martes/jueves, partido los sábados por la tarde..."
              value={form.contextoFutsalNotas}
              onChange={(e) => set({ contextoFutsalNotas: e.target.value })}
            />
          )}
        </div>

        <button className="btn" type="submit">
          {savedFlash ? <CheckCircle2 size={16} /> : <Save size={16} />} {savedFlash ? 'Guardado' : 'Guardar perfil'}
        </button>
      </form>
    </div>
  )
}
