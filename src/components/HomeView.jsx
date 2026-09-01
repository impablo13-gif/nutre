import { useMemo, useState } from 'react'
import { ClipboardCheck, Flame, Apple, ChefHat, Sparkles, RefreshCw, CookingPot, Check, PlusCircle } from 'lucide-react'
import * as storage from '../storage'
import { dayOfYear, todayIso } from '../dateUtils'
import TIPS, { dailyTipIndex, tipAt } from '../tips'
import FollowupForm from './FollowupForm'
import RecipeCardWithDetail from './RecipeCard'

const TIP_ICON = { nutricion: Apple, cocina: ChefHat, motivacion: Sparkles }
const DIA_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

// Un plato de hoy se considera "registrado" si ya hay una entrada del diario
// de hoy con el mismo nombre venida del plan (no de una búsqueda manual
// distinta) — así evitamos duplicar al pulsar dos veces por error.
function isMealRegistered(entriesToday, meal) {
  return entriesToday.some((e) => e.source === 'plan' && e.foodName === meal.nombre)
}

function registerMeal(meal) {
  const macros = meal.macros || {}
  storage.addDiaryEntry({
    dateIso: todayIso(),
    foodName: meal.nombre,
    brand: '',
    store: '',
    quantityGrams: null,
    kcal: Number(meal.kcal) || 0,
    macros: { proteina: Number(macros.proteina) || 0, carbo: Number(macros.carbo) || 0, grasa: Number(macros.grasa) || 0 },
    source: 'plan',
  })
}

function TodayMeals({ refresh }) {
  const [tick, setTick] = useState(0)
  const latest = storage.getLatestWeekPlan()
  const diaName = DIA_NAMES[new Date().getDay()]
  const dia = latest?.plan?.dias?.find((d) => d.dia === diaName)
  const comidas = dia?.comidas || []
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const entriesToday = useMemo(() => storage.getDiaryEntriesForDate(todayIso()), [tick])

  function handleRegister(meal) {
    registerMeal(meal)
    setTick((t) => t + 1)
    refresh && refresh()
  }

  return (
    <div>
      <div className="row gap-sm section-title" style={{ marginTop: 0, alignItems: 'center' }}>
        <CookingPot size={13} /> Hoy toca preparar
      </div>
      {!latest ? (
        <div className="card">
          <p className="empty-state" style={{ padding: '16px 4px' }}>
            Todavía no tienes un plan semanal. Ve a "Generar" para crear uno — a partir de ahí verás aquí, cada día, exactamente lo que te toca cocinar.
          </p>
        </div>
      ) : !comidas.length ? (
        <div className="card">
          <p className="empty-state" style={{ padding: '16px 4px' }}>
            Hoy no hay comidas planificadas en casa según tu plan actual.
          </p>
        </div>
      ) : (
        <div className="col gap">
          {comidas.map((m, i) => {
            const registrada = isMealRegistered(entriesToday, m)
            return (
              <div key={i}>
                <RecipeCardWithDetail meal={m} dia={dia.dia} />
                <button
                  className={'btn btn-sm' + (registrada ? ' btn-outline' : ' btn-accent2')}
                  style={{ marginTop: 6, width: 'auto' }}
                  disabled={registrada}
                  onClick={() => handleRegister(m)}
                >
                  {registrada ? <Check size={14} /> : <PlusCircle size={14} />}
                  {registrada ? 'Registrada en el diario' : 'Registrar'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

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

      <TodayMeals refresh={refresh} />

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
    </div>
  )
}
