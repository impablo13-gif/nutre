import { useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import * as storage from '../storage'
import FollowupForm from './FollowupForm'
import FoodDiary from './FoodDiary'

export default function HomeView({ refresh }) {
  const [showFollowup, setShowFollowup] = useState(false)
  const daysSince = storage.daysSinceLastFollowup()
  const shouldPrompt = daysSince >= 7

  return (
    <div>
      {shouldPrompt && !showFollowup && (
        <div className="followup-banner">
          <div className="row gap" style={{ marginBottom: 6 }}>
            <ClipboardCheck size={16} color="var(--accent-2-dark)" />
            <strong style={{ fontSize: 13.5 }}>¿Cómo va la semana?</strong>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginBottom: 10 }}>
            {daysSince === Infinity ? 'Todavía no has rellenado el cuestionario de seguimiento.' : `Han pasado ${daysSince} días desde tu último seguimiento.`}
          </p>
          <button className="btn btn-accent2 btn-sm" onClick={() => setShowFollowup(true)}>Rellenar cuestionario</button>
        </div>
      )}

      {showFollowup && (
        <div className="card" style={{ marginBottom: 14 }}>
          <FollowupForm embedded={false} onDone={() => { setShowFollowup(false); refresh() }} />
          <button className="btn btn-ghost" style={{ marginTop: 10 }} onClick={() => setShowFollowup(false)}>Cerrar</button>
        </div>
      )}

      <FoodDiary refresh={refresh} />
    </div>
  )
}
