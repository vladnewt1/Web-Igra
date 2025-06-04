import { motion } from 'framer-motion'
import { useGame } from '../context/GameContext'
import styles from './Clicker.module.scss'

export default function Clicker() {
  const { state, dispatch } = useGame()
  const { credits, clickValue, activeSkin, activeAntiBonuses } = state
  
  const isClickBlocked = activeAntiBonuses.some(b => b.type === 'blockClick')
  
  const handleClick = () => {
    if (!isClickBlocked) {
      dispatch({ type: 'CLICK' })
    }
  }
  
  return (
    <div className={styles.clicker}>
      <div className={styles.stats}>
        <h2>Кредити: {Math.floor(credits)}</h2>
        <p>За клік: {clickValue.toFixed(1)}</p>
      </div>
      
      <motion.button
        className={`${styles.clickButton} ${activeSkin ? styles[activeSkin] : ''}`}
        onClick={handleClick}
        disabled={isClickBlocked}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isClickBlocked ? 0.9 : 1,
          opacity: isClickBlocked ? 0.5 : 1
        }}
      >
        {isClickBlocked ? 'Заблоковано!' : 'Клік!'}
      </motion.button>
    </div>
  )
} 