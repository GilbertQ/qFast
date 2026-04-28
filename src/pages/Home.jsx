import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         getDay, isSameMonth, isToday, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useLog } from '../hooks/useLog'
import DayModal from '../components/DayModal'
import WeightModal from '../components/WeightModal'
import './Home.css'

export default function Home() {
  const { log, setDay, addWeight, getFirstDate, fastingHours } = useLog()
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState(null)
  const [weightDate, setWeightDate] = useState(null)

  const monthStart = startOfMonth(cursor)
  const monthEnd = endOfMonth(cursor)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)

  function dayStatus(dateStr) {
    const d = log.days[dateStr]
    if (!d) return 'empty'
    if (d.firstMeal && d.lastMeal) return 'complete'
    return 'partial'
  }

  function needsWeight(dateStr) {
    const first = getFirstDate()
    if (!first) return false
    const d1 = parseISO(first)
    const d2 = parseISO(dateStr)
    const diff = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
    return diff > 0 && diff % 15 === 0 // && !log.weights.find(w => w.date === dateStr)
    
  }

/*
  function handleDayClick(date) {
    const dateStr = format(date, 'yyyy-MM-dd')
    if (needsWeight(dateStr)) {
      setWeightDate(dateStr)
    } else {
      setSelected(dateStr)
    }
  }
  */
  function handleDayClick(date) {
  const dateStr = format(date, 'yyyy-MM-dd')

  const isWeightCheckDay = (() => {
    const first = getFirstDate()
    if (!first) return false
    const diff = Math.floor((parseISO(dateStr) - parseISO(first)) / (1000*60*60*24))
    return diff > 0 && diff % 15 === 0
  })()

  if (isWeightCheckDay) {
    setWeightDate(dateStr)
  } else {
    setSelected(dateStr)
  }
}

  function prevMonth() { setCursor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setCursor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  return (
    <div className="home">
      <header className="home-header">
        <h1 className="brand">qFast</h1>
        <div className="month-nav">
          <button onClick={prevMonth}>‹</button>
          <span>{format(cursor, 'MMMM yyyy', { locale: es })}</span>
          <button onClick={nextMonth}>›</button>
        </div>
      </header>

      <div className="calendar">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="cal-label">{d}</div>
        ))}
        {Array.from({ length: startPad }).map((_, i) => <div key={'p'+i} />)}
        {days.map(date => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const status = dayStatus(dateStr)
          const hours = fastingHours(dateStr)
          return (
            <button
              key={dateStr}
              className={`cal-day ${status} ${isToday(date) ? 'today' : ''}`}
              onClick={() => handleDayClick(date)}
            >
              <span className="day-num">{format(date, 'd')}</span>
              {hours && <span className="day-hours">{Math.floor(hours)}h</span>}
              {needsWeight(dateStr) && <span className="weight-dot">⚖️</span>}
            </button>
          )
        })}
      </div>

      {selected && (
        <DayModal
          dateStr={selected}
          dayData={log.days[selected]}
          fastingHours={fastingHours(selected)}
          onSave={(fields) => { setDay(selected, fields); setSelected(null) }}
          onClose={() => setSelected(null)}
        />
      )}

      {weightDate && (
<WeightModal
  dateStr={weightDate}
  existingWeight={log.weights.find(w => w.date === weightDate)?.lbs}
  onSave={(lbs) => {
    addWeight(weightDate, lbs)
    setWeightDate(null)
    setSelected(weightDate)
  }}
  onClose={() => {
    setWeightDate(null)
    setSelected(weightDate)
  }}
/>
      )}
    </div>
  )
}
