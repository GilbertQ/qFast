import { useLog } from '../hooks/useLog'
import { parseISO, format } from 'date-fns'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid
} from 'recharts'
import './Stats.css'

export default function Stats() {
  const { log, fastingHours } = useLog()

  const days = Object.keys(log.days).sort()

  const hoursData = days.map(d => {
    const h = fastingHours(d)
    return h ? { day: format(parseISO(d), 'dd/MM'), hours: Math.round(h * 10) / 10 } : null
  }).filter(Boolean)

  const buckets = {}
  days.forEach(d => {
    const h = fastingHours(d)
    if (!h) return
    const key = `${Math.floor(h)}/${24 - Math.floor(h)}`
    buckets[key] = (buckets[key] || 0) + 1
  })
  const bucketData = Object.entries(buckets)
    .map(([name, days]) => ({ name, days }))
    .sort((a, b) => parseInt(b.name) - parseInt(a.name))

  const weightData = log.weights.map(w => ({
    day: format(parseISO(w.date), 'dd/MM'),
    lbs: w.lbs
  }))

  const tooltipStyle = {
    backgroundColor: '#1a1a1a',
    border: '1px solid #2e2e2e',
    borderRadius: 8,
    color: '#f0f0f0',
    fontSize: 13
  }

  return (
    <div className="stats">
      <h2 className="stats-title">Estadísticas</h2>

      <section className="chart-section">
        <h3>Horas de ayuno por día</h3>
        {hoursData.length === 0
          ? <p className="empty">Sin datos aún</p>
          : <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hoursData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} domain={[0, 24]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill="#7c6df0" radius={[4,4,0,0]} name="horas" />
              </BarChart>
            </ResponsiveContainer>
        }
      </section>

      <section className="chart-section">
        <h3>Distribución de ayunos</h3>
        {bucketData.length === 0
          ? <p className="empty">Sin datos aún</p>
          : <ResponsiveContainer width="100%" height={200}>
              <BarChart data={bucketData} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <XAxis type="number" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#f0f0f0', fontSize: 12 }} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="days" fill="#4fc0a0" radius={[0,4,4,0]} name="días" />
              </BarChart>
            </ResponsiveContainer>
        }
      </section>

      <section className="chart-section">
        <h3>Variación de peso (lbs)</h3>
        {weightData.length < 2
          ? <p className="empty">{weightData.length === 0 ? 'Sin registros de peso' : 'Se necesitan al menos 2 registros'}</p>
          : <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="lbs" stroke="#f0a050" strokeWidth={2} dot={{ fill: '#f0a050' }} name="lbs" />
              </LineChart>
            </ResponsiveContainer>
        }
      </section>
    </div>
  )
}
