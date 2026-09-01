import { useMemo, useState } from 'react'
import { ClipboardCheck, Flame, Apple, ChefHat, Sparkles, RefreshCw } from 'lucide-react'
import * as storage from '../storage'
import { dayOfYear } from '../dateUtils'
import TIPS, { dailyTipIndex, tipAt } from '../tips'
import FollowupForm from './FollowupForm'
import FoodDiary from './FoodDiary'

const TIP_ICON = { nutricion: Apple, cocina: ChefHat, motivacion: Sparkles }

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buenos días'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

// Resuelve el tip a mostrar para un índice dado: si el texto usa el
// marcador {racha} pero todavía no hay racha (0 días), salta al siguiente
// tip en vez de mostrar una frase de ánimo vacía de contenido.
function resolveTip(index, streak) {
  let i = index
  for (let tries = 0; tries < TIPS.length; tries++) {
    const tip = tipAt(i)
    if (!tip.texto.includes('{racha}') || streak > 0) {
      return { tip: { ...tip, texto: tip.texto.replace('{racha}', streak) }, index: i }
    }
    i += 1
  }
  return { tip: tipAt(index), index }
}

function TipCard() {
  const streak = storage.streak()
  const baseIndex = useMemo(() => dailyTipIndex(dayOfYear()), [])
  const [index, setIndex] = useState(baseIndex)
  const { tip, index: shownIndex } = resolveTip(index, streak)
  const Icon = TIP_ICON[tip.tipo] || Sparkles

  function otroTip() {
    setIndex(shownIndex + 1)
  }

  return (
    <div className="card tip-card" style={{ marginBottom: 14 }}>
      <div className="tip-card-head">
        <div className="tip-card-badge"><Icon size={16} color="var(--accent-2-dark)" /></div>
        <span className="tip-card-label">Tip del día</span>
      </div>
      <p className="tip-card-text">{tip.texto}</p>
      <button className="tip-card-more" onClick={otroTip}>
        <RefreshCw size={13} /> Otro tip
      </button>
    </div>
  )
}

export default function HomeView({ refresh }) {
  const [showFollowup, setShowFollowup] = useState(false)
  const daysSince = storage.daysSinceLastFollowup()
  const shouldPrompt = daysSince >= 7
  const streak = storage.streak()

  return (
    <div>
      <div className="card home-hero">
        <div className="home-hero-top">
          <div>
            <div className="home-hero-greeting">{greeting()}</div>
            <div className="home-hero-sub">{streak > 0 ? 'Sigue así, vas construyendo el hábito.' : 'Registra tu primera comida de hoy para empezar la racha.'}</div>
          </div>
          {streak > 0 && (
            <div className="home-hero-streak">
              <span className="n"><Flame size={16} style={{ verticalAlign: -2 }} /> {streak}</span>
              <span className="l">{streak === 1 ? 'día' : 'días'}</span>
            </div>
          )}
        </div>
      </div>

      <TipCard />

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
