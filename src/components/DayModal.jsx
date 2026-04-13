import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import './DayModal.css'

export default function DayModal({ dateStr, dayData, fastingHours, onSave, onClose }) {
  const [editing, setEditing] = useState(null)
  const [timeVal, setTimeVal] = useState('')

  const date = parseISO(dateStr)
  const label = format(date, "EEEE d 'de' MMMM", { locale: es })

  function handleBtn(field) {
    if (dayData?.[field]) {
      if (confirm(`¿Modificar ${field === 'firstMeal' ? 'primera comida' : 'última comida'}?`)) {
        setEditing(field)
        setTimeVal(dayData[field])
      }
    } else {
      const now = new Date()
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`
      onSave({ [field]: time })
    }
  }

  function saveEdit() {
    if (timeVal) { onSave({ [editing]: timeVal }); setEditing(null) }
  }

  const fh = fastingHours
  const fastLabel = fh ? `${Math.floor(fh)}:${String(Math.round((fh % 1) * 60)).padStart(2,'0')}` : null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p className="modal-date">{label}</p>

        {fastLabel && (
          <div className="fast-summary">
            <span className="fast-hours">{fastLabel}</span>
            <span className="fast-label">horas de ayuno</span>
          </div>
        )}

        <div className="modal-row">
          <button
            className={`meal-btn ${dayData?.firstMeal ? 'recorded' : ''}`}
            onClick={() => handleBtn('firstMeal')}
          >
            <span className="meal-icon">🌅</span>
            <span className="meal-name">Primera comida</span>
            <span className="meal-time">{dayData?.firstMeal || 'Registrar'}</span>
          </button>

          <button
            className={`meal-btn ${dayData?.lastMeal ? 'recorded' : ''}`}
            onClick={() => handleBtn('lastMeal')}
          >
            <span className="meal-icon">🌙</span>
            <span className="meal-name">Última comida</span>
            <span className="meal-time">{dayData?.lastMeal || 'Registrar'}</span>
          </button>
        </div>

        {editing && (
          <div className="edit-row">
            <input
              type="time"
              value={timeVal}
              onChange={e => setTimeVal(e.target.value)}
              className="time-input"
            />
            <button className="btn-save" onClick={saveEdit}>Guardar</button>
            <button className="btn-cancel" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        )}

        <button className="btn-close" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}
