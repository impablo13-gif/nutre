import { useState } from 'react'
import { Copy, Check, Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import * as storage from '../storage'
import { computeTDEE } from '../tdee'
import { buildPrompt, parseModelJson } from '../nutritionPrompt'

export default function PlanGenerator({ refresh }) {
  const profile = storage.getProfile()
  const hasProfile = profile && profile.weightKg && profile.heightCm && profile.age
  const tdeeResult = hasProfile ? computeTDEE(profile) : null
  const recentFollowup = storage.getFollowupEntries().slice(0, 3)

  const [freeNotes, setFreeNotes] = useState('')
  // El prompt final es editable de forma libre: se inicializa con buildPrompt(...)
  // pero, a partir de ahí, vive en su propio estado y solo cambia cuando el
  // usuario pulsa "Generar" o "Regenerar desde el formulario" (o escribe él mismo).
  const [promptText, setPromptText] = useState(() =>
    hasProfile ? buildPrompt({ profile, tdeeResult, recentFollowup, freeNotes: '' }) : ''
  )
  const [pasteText, setPasteText] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!hasProfile) {
    return (
      <div>
        <div className="row gap" style={{ marginBottom: 10 }}>
          <Sparkles size={18} color="var(--accent-dark)" />
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Generar plan</h2>
        </div>
        <div className="empty-state">Completa primero tu perfil (peso, altura, edad) para poder generar un plan.</div>
      </div>
    )
  }

  function regenerateFromForm() {
    setPromptText(buildPrompt({ profile, tdeeResult, recentFollowup, freeNotes }))
    setCopied(false)
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(promptText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('No se pudo copiar automáticamente. Selecciona el texto y cópialo a mano.')
    }
  }

  function processResponse() {
    setError('')
    setSuccess(false)
    try {
      const data = parseModelJson(pasteText)
      const plan = data.semana
      if (!plan || !Array.isArray(plan.dias) || plan.dias.length === 0) throw new Error('faltan campos')
      const weekStartIso = storage.weekStartFor()
      storage.saveWeekPlan(weekStartIso, plan)
      setPasteText('')
      setSuccess(true)
      refresh()
    } catch (e) {
      setError('No se pudo interpretar la respuesta. Comprueba que has pegado el JSON completo tal como lo devolvió el modelo, con la forma { "semana": { ... } }.')
    }
  }

  return (
    <div>
      <div className="row gap" style={{ marginBottom: 10 }}>
        <Sparkles size={18} color="var(--accent-dark)" />
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>Generar plan semanal</h2>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>1. Contexto real de esta semana</h3>
        <p className="field-hint" style={{ marginBottom: 10 }}>
          Escribe aquí cualquier cosa que el plan deba tener en cuenta ahora mismo: molestias o lesiones,
          ingredientes que se te han acabado, viajes, eventos, antojos, lo que sea. Se incluye en el
          prompt generado, que además podrás seguir editando a mano abajo.
        </p>
        <textarea
          className="context-textarea"
          placeholder='Ej: "Esta semana tengo molestia en el isquiotibial", "se me ha acabado el arroz, evita esa receta", "hay un evento el sábado, necesito carga extra de hidratos el viernes"...'
          value={freeNotes}
          onChange={(e) => setFreeNotes(e.target.value)}
        />
        <button className="btn" style={{ marginTop: 12 }} onClick={regenerateFromForm}>
          <Sparkles size={16} /> Generar prompt
        </button>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="row spread" style={{ marginBottom: 4 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>2. Revisa y edita el prompt, luego pégalo en un chat de Claude</h3>
        </div>
        <p className="field-hint" style={{ marginBottom: 10 }}>
          El texto de abajo es totalmente editable: añade, borra o reescribe lo que quieras justo antes de copiarlo.
        </p>
        <textarea
          className="prompt-editable"
          value={promptText}
          onChange={(e) => { setPromptText(e.target.value); setCopied(false) }}
        />
        <div className="row gap" style={{ marginTop: 10 }}>
          <button className="btn btn-outline" style={{ width: 'auto', flex: 1 }} onClick={copyPrompt}>
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copiado' : 'Copiar prompt'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={regenerateFromForm} title="Descarta tus ediciones manuales y vuelve a generar el prompt desde el formulario">
            <RotateCcw size={14} /> Regenerar desde el formulario
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>3. Pega aquí la respuesta</h3>
        <textarea
          className="paste-area"
          placeholder="Pega el JSON que te devolvió el modelo..."
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
        />
        {error && (
          <div className="row gap" style={{ color: 'var(--danger)', fontSize: 12.5, marginTop: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && <p style={{ color: 'var(--accent-dark)', fontSize: 13, marginTop: 8, fontWeight: 600 }}>Plan guardado. Consúltalo en Calendario y Recetas.</p>}
        <button className="btn" style={{ marginTop: 10 }} disabled={!pasteText.trim()} onClick={processResponse}>
          <Sparkles size={16} /> Interpretar respuesta
        </button>
      </div>
    </div>
  )
}
