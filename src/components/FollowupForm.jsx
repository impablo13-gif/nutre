import { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import * as storage from '../storage'

const SLIDERS = [
  { key: 'adherencia', label: '¿Cómo de bien has seguido el plan?', lo: 'Nada', hi: 'Perfecto' },
  { key: 'hambre', label: 'Sensación de hambre/saciedad', lo: 'Mucha hambre', hi: 'Muy saciado' },
  { key: 'energia', label: 'Nivel de energía general', lo: 'Bajo', hi: 'Alto' },
  { key: 'digestion', label: 'Digestión', lo: 'Mala', hi: 'Muy buena' },
]

export default function FollowupForm({ onDone, embedded }) {
  const [vals, setVals] = useState({ adherencia: 3, hambre: 3, energia: 3, digestion: 3 })
  const [pesoKg, setPesoKg] = useState('')
  const [observaciones, setObservaciones] = useState('')

  function submit(e) {
    e.preventDefault()
    storage.addFollowupEntry({ ...vals, pesoKg: pesoKg ? Number(pesoKg) : null, observaciones })
    onDone?.()
  }

  return (
    <form onSubmit={submit} className={embedded ? '' : 'card'}>
      {!embedded && (
        <div className="row gap" style={{ marginBottom: 12 }}>
          <ClipboardCheck size={17} color="var(--accent-dark)" />
          <h3 style={{ fontSize: 15, fontWeight: 800 }}>Cuestionario semanal</h3>
        </div>
      )}
      {SLIDERS.map((s) => (
        <div className="slider-row" key={s.key}>
          <div className="row spread" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent-2)' }}>{vals[s.key]}/5</span>
          </div>
          <input
            type="range"
            min="1"
            max="5"
            value={vals[s.key]}
            onChange={(e) => setVals((v) => ({ ...v, [s.key]: Number(e.target.value) }))}
          />
          <div className="slider-labels"><span>{s.lo}</span><span>{s.hi}</span></div>
        </div>
      ))}
      <div className="field">
        <label className="field-label">Peso actual (kg, opcional)</label>
        <input type="number" step="0.1" min="30" value={pesoKg} onChange={(e) => setPesoKg(e.target.value)} />
      </div>
      <div className="field" style={{ marginBottom: 14 }}>
        <label className="field-label">Observaciones</label>
        <textarea placeholder="¿Algo que quieras anotar sobre esta semana?" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>
      <button className="btn btn-accent2" type="submit">Guardar seguimiento</button>
    </form>
  )
}
