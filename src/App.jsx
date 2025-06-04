import { useGame } from './context/GameContext'
import Clicker from './components/Clicker'
import Upgrades from './components/Upgrades'
import Prestige from './components/Prestige'
import Skins from './components/Skins'
import AntiBonuses from './components/AntiBonuses'
import './App.css'

function App() {
  const { state } = useGame()
  const { credits, duiktcoins, prestigeLevel } = state

  return (
    <div className="container">
      <AntiBonuses />
      
      <header className="game-header">
        <h1>Clicker Game</h1>
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">Кредити:</span>
            <span className="stat-value credits">{credits.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Duiktcoins:</span>
            <span className="stat-value duiktcoins">{duiktcoins.toLocaleString()}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Рівень престижу:</span>
            <span className="stat-value prestige">{prestigeLevel}</span>
          </div>
        </div>
      </header>

      <div className="game-grid">
        <div className="game-card main-card">
          <Clicker />
        </div>
        
        <div className="game-card">
          <Upgrades />
        </div>
        
        <div className="game-card">
          <Prestige />
        </div>
        
        <div className="game-card">
          <Skins />
        </div>
      </div>
    </div>
  )
}

export default App
