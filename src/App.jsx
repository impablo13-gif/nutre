import { useState } from 'react'
import { Utensils, Calendar, Salad, TrendingUp, Sparkles, Settings, Flame, Leaf } from 'lucide-react'
import HomeView from './components/HomeView'
import MealCalendar from './components/MealCalendar'
import RecipesGallery from './components/RecipesGallery'
import ProgressView from './components/ProgressView'
import PlanGenerator from './components/PlanGenerator'
import SettingsView from './components/SettingsView'
import ProfileView from './components/ProfileView'
import * as storage from './storage'

const TABS = [
  { key: 'hoy', label: 'Hoy', icon: Utensils },
  { key: 'calendario', label: 'Calendario', icon: Calendar },
  { key: 'recetas', label: 'Recetas', icon: Salad },
  { key: 'progreso', label: 'Progreso', icon: TrendingUp },
  { key: 'plan', label: 'Generar', icon: Sparkles },
  { key: 'ajustes', label: 'Ajustes', icon: Settings },
]

export default function App() {
  const hasProfile = !!storage.getProfile()
  const [tab, setTab] = useState(hasProfile ? 'hoy' : 'perfil')
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const streak = storage.streak()

  return (
    <div className="app-shell">
      <div className="app-header">
        <div className="row spread">
          <div className="app-brand">
            <span className="brand-mark"><Leaf size={16} /></span>
            Nutre
          </div>
          {streak > 0 && <span className="streak-pill"><Flame size={13} /> {streak}</span>}
        </div>
      </div>
      <div className="view-main">
        {tab === 'hoy' && <HomeView refresh={refresh} />}
        {tab === 'calendario' && <MealCalendar refresh={refresh} />}
        {tab === 'recetas' && <RecipesGallery refresh={refresh} />}
        {tab === 'progreso' && <ProgressView refresh={refresh} />}
        {tab === 'plan' && <PlanGenerator refresh={refresh} />}
        {tab === 'ajustes' && <SettingsView refresh={refresh} onEditProfile={() => setTab('perfil')} />}
        {tab === 'perfil' && (
          <ProfileView
            refresh={() => {
              refresh()
              setTab('hoy')
            }}
          />
        )}
      </div>
      <div className="bottom-nav">
        {TABS.map((t) => {
          const Icon = t.icon
          const active = tab === t.key || (tab === 'perfil' && t.key === 'ajustes')
          return (
            <button key={t.key} className={'nav-btn' + (active ? ' active' : '')} onClick={() => setTab(t.key)}>
              <Icon size={19} />
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
