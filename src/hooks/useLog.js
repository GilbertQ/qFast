import { useState } from 'react'

const KEY = 'qfast_log'

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { days: {}, weights: [] }
  } catch {
    return { days: {}, weights: [] }
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function useLog() {
  const [log, setLog] = useState(load)

  function setDay(dateStr, fields) {
    const next = { ...log, days: { ...log.days, [dateStr]: { ...log.days[dateStr], ...fields } } }
    save(next)
    setLog(next)
  }

  function addWeight(dateStr, lbs) {
    const weights = log.weights.filter(w => w.date !== dateStr)
    weights.push({ date: dateStr, lbs })
    weights.sort((a, b) => a.date.localeCompare(b.date))
    const next = { ...log, weights }
    save(next)
    setLog(next)
  }

  function getFirstDate() {
    const dates = Object.keys(log.days).sort()
    return dates[0] || null
  }

  function fastingHours(dateStr) {
    const d = log.days[dateStr]
    if (!d?.firstMeal || !d?.lastMeal) return null
    const [fh, fm] = d.firstMeal.split(':').map(Number)
    const [lh, lm] = d.lastMeal.split(':').map(Number)
    const windowMins = (lh * 60 + lm) - (fh * 60 + fm)
    if (windowMins <= 0) return null
    const fastMins = 1440 - windowMins
    return fastMins / 60
  }

  return { log, setDay, addWeight, getFirstDate, fastingHours }
}
