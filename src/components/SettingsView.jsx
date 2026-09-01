import { useRef, useState } from 'react'
import { Download, Upload, Trash2, Settings as SettingsIcon, User } from 'lucide-react'
import * as storage from '../storage'
import { todayIso } from '../dateUtils'

export default function SettingsView({ refresh, onEditProfile }) {
  const fileRef = useRef(null)
  const [msg, setMsg] = useState('')
  const profile = storage.getProfile()

  function exportBackup() {
    const data = storage.buildBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `nutre-backup-${todayIso()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importBackup(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        storage.restoreBackup(data)
        refresh()
        setMsg('Copia de seguridad restaurada.')
      } catch {
        setMsg('No se pudo leer el archivo.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function resetAll() {
    if (!window.confirm('¿Borrar todos tus datos (perfil, planes, diario, favoritos, progreso)? Esta acción no se puede deshacer.')) return
    storage.clearAll()
    refresh()
    setMsg('Todos los datos han sido borrados.')
  }

  return (
    <div>
      <div className="row gap" style={{ marginBottom: 10 }}>
        <SettingsIcon size={18} color="var(--accent-dark)" />
        <h2 style={{ fontSize: 17, fontWeight: 800 }}>Ajustes</h2>
      </div>

      <div className="section-title">Perfil</div>
      <div className="card" style={{ marginBottom: 14 }}>
        {profile ? (
          <div className="row spread">
            <div style={{ fontSize: 13.5 }}>
              {profile.weightKg} kg · {profile.heightCm} cm · {profile.age} años
            </div>
            <button className="btn btn-outline btn-sm" onClick={onEditProfile}><User size={14} /> Editar</button>
          </div>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={onEditProfile}><User size={14} /> Completar perfil</button>
        )}
      </div>

      <div className="section-title">Datos</div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <button className="btn btn-outline" onClick={exportBackup}><Download size={16} /> Exportar copia de seguridad</button>
        <button className="btn btn-outline" onClick={() => fileRef.current.click()}><Upload size={16} /> Restaurar copia de seguridad</button>
        <input ref={fileRef} type="file" accept="application/json" hidden onChange={importBackup} />
        {msg && <p style={{ fontSize: 12.5, color: 'var(--text-dim)', margin: 0 }}>{msg}</p>}
        <button className="btn btn-danger" onClick={resetAll}><Trash2 size={16} /> Borrar todos los datos</button>
      </div>
    </div>
  )
}
