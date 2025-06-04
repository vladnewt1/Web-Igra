import { useGame } from '../context/GameContext'
import styles from './Prestige.module.scss'

export default function Prestige() {
  const { state, dispatch } = useGame()
  const { credits, duiktcoins, prestigeLevel, upgrades } = state
  
  const calculatePrestigeReward = () => {
    // Нагорода за престиж дорівнює кредитам на балансі, поділеним на 1000
    return Math.floor(credits / 1000)
  }
  
  const handlePrestige = () => {
    const reward = calculatePrestigeReward()
    dispatch({ type: 'PRESTIGE', payload: reward })
  }
  
  const handleReset = () => {
    if (window.confirm('Ви впевнені, що хочете скинути весь прогрес? Це незворотня дія!')) {
      dispatch({ type: 'RESET_PROGRESS' })
    }
  }
  
  const canPrestige = credits >= 1000 // Мінімум 1000 кредитів для престижу
  
  return (
    <div className={styles.prestige}>
      <h2>Престиж</h2>
      <div className={styles.prestigeInfo}>
        <p>Рівень престижу: {prestigeLevel}</p>
        <p>Duiktcoins: {duiktcoins}</p>
        <p className={styles.reward}>
          Нагорода за престиж: {calculatePrestigeReward()} Duiktcoins
        </p>
      </div>
      
      <button
        onClick={handlePrestige}
        disabled={!canPrestige}
        className={styles.prestigeButton}
      >
        {canPrestige
          ? 'Престиж!'
          : `Потрібно ${1000} кредитів`}
      </button>
      
      <button
        onClick={handleReset}
        className={styles.resetButton}
      >
        Скинути прогрес
      </button>
      
      <div className={styles.prestigeDescription}>
        <p>
          Престиж скидає ваш прогрес, але дає Duiktcoins,
          які можна використовувати для покупки скінів та спеціальних бонусів.
        </p>
        <p>
          Чим більше у вас апгрейдів, тим більше Duiktcoins ви отримаєте!
        </p>
      </div>
    </div>
  )
} 