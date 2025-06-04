import { useGame } from '../context/GameContext'
import styles from './AntiBonuses.module.scss'

export default function AntiBonuses() {
  const { state } = useGame()
  const { activeAntiBonuses } = state

  if (activeAntiBonuses.length === 0) return null

  return (
    <div className={styles.antiBonuses}>
      {activeAntiBonuses.map(bonus => (
        <div key={bonus.id} className={styles.antiBonus}>
          {bonus.name}
        </div>
      ))}
    </div>
  )
} 