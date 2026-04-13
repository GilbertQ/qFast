import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import './WeightModal.css'

export default function WeightModal({ dateStr, onSave, onClose }) {
  const [lbs, setLbs] = useState('')
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
        <input
          type="number"
          inputMode="decimal"
          placeholder="lbs"
          value={lbs}
          onChange={e => setLbs(e.target.value)}
          className="weight-input"
          autoFocus
        />
        <div className="weight-actions">
          <button className="btn-save" onClick={handleSave} disabled={!lbs}>Guardar</button>
          <button className="btn-cancel" onClick={onClose}>Después</button>
        </div>
      </div>
    </div>
  )
}
