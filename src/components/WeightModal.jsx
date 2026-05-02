import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import './WeightModal.css'

export default function WeightModal({ dateStr, existingWeight, onSave, onClose }) {
  const [lbs, setLbs] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (existingWeight) {
      setLbs(String(existingWeight))
      setIsEditing(false) // si ya existe, entra en modo lectura
    } else {
      setLbs('')
      setIsEditing(true) // si no existe, entra editable
    }
  }, [existingWeight, dateStr])

  const date = parseISO(dateStr)
  const label = format(date, "d 'de' MMMM", { locale: es })

  function handleSave() {
    const val = parseFloat(lbs)
    if (!isNaN(val) && val > 0) onSave(val)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="weight-icon">⚖️</div>
        <p className="weight-title">Registro de peso</p>
        <p className="weight-sub">Han pasado 15 días — {label}</p>

        {!isEditing ? (
          <div
            className="saved-weight-display"
            onClick={() => setIsEditing(true)}
            role="button"
          >
            {lbs} lbs ✏️
          </div>
        ) : (
          <input
            type="number"
            inputMode="decimal"
            placeholder="lbs"
            value={lbs}
            onChange={e => setLbs(e.target.value)}
            className="weight-input"
            autoFocus
          />
        )}

        <div className="weight-actions">
          {isEditing ? (
            <button
              className="btn-save"
              onClick={handleSave}
              disabled={!lbs}
            >
              Guardar
            </button>
          ) : (
            <button
              className="btn-save"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </button>
          )}

          <button className="btn-cancel" onClick={onClose}>
            Después
          </button>
        </div>
      </div>
    </div>
  )
}
