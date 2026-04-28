import { useLog } from '../hooks/useLog'
import { parseISO, format } from 'date-fns'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell
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

  // Soft color palette
  const SOFT_ORANGE = '#f4a261'
  const SOFT_BLUE = '#6ca0d4'
  const PIE_COLORS = ['#f4a261', '#6ca0d4', '#e9c46a', '#8ec4d6', '#f4a261', '#6ca0d4']

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={tooltipStyle}>
          <p style={{ margin: 0, padding: '4px 8px' }}>
            {payload[0].name}: {payload[0].value} days
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="stats">
      <div className="stats-header">
        <h2 className="stats-title">Stats</h2>
        <button className="btn-export" onClick={() => exportCSV(log, fastingHours)}>
          ⬇ CSV
        </button>
      </div>

      <section className="chart-section">
        <h3>Fasting hours / day</h3>
        {hoursData.length === 0
          ? <p className="empty">No data yet</p>
          : <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hoursData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis 
                  tick={{ fill: '#888', fontSize: 10 }} 
                  domain={[12, 24]} 
                  ticks={[12, 14, 16, 18, 20, 22, 24]}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="hours" fill={SOFT_BLUE} radius={[4,4,0,0]} name="hours" />
              </BarChart>
            </ResponsiveContainer>
        }
      </section>

      <section className="chart-section">
        <h3>Fasting distribution</h3>
        {bucketData.length === 0
          ? <p className="empty">No data yet</p>
          : <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={bucketData}
                  dataKey="days"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#888', strokeWidth: 1 }}
                >
                  {bucketData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
        }
      </section>

      <section className="chart-section">
        <h3>Weight Variation (lbs)</h3>
        {weightData.length < 2
          ? <p className="empty">{weightData.length === 0 ? 'No records' : 'At least 2 records are required'}</p>
          : <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                <XAxis dataKey="day" tick={{ fill: '#888', fontSize: 10 }} />
                <YAxis tick={{ fill: '#888', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="lbs" stroke={SOFT_ORANGE} strokeWidth={2} dot={{ fill: SOFT_ORANGE }} name="lbs" />
              </LineChart>
            </ResponsiveContainer>
        }
      </section>
    </div>
  )
  
  function exportCSV(log, fastingHours) {
    const days = Object.keys(log.days).sort()
    const rows = [['Date', 'FMeal', 'LMeal', 'Lbs']]

    days.forEach(d => {
      const day = log.days[d]
      const weight = log.weights.find(w => w.date === d)
      rows.push([
        d,
        day?.firstMeal || '',
        day?.lastMeal  || '',
        weight?.lbs    || ''
      ])
    })

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qfast_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
}
