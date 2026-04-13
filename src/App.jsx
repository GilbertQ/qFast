import { useState } from 'react'
import Home from './pages/Home'
import Stats from './pages/Stats'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div className="app">
      <div className="page">
        {tab === 'home' ? <Home /> : <Stats />}
      </div>
      <nav className="tabs">
        <button
          className={tab === 'home' ? 'active' : ''}
          onClick={() => setTab('home')}
        >
          <span className="tab-icon">📅</span>
          <span>Inicio</span>
        </button>
        <button
          className={tab === 'stats' ? 'active' : ''}
          onClick={() => setTab('stats')}
        >
          <span className="tab-icon">📊</span>
          <span>Stats</span>
        </button>
      </nav>
    </div>
  )
}
