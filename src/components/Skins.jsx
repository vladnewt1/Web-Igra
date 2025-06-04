import { useGame } from '../context/GameContext'
import styles from './Skins.module.scss'

const SKINS = [
  {
    id: 'default',
    name: 'Стандартний',
    description: 'Класичний вигляд кнопки',
    cost: 0,
    preview: '🔵'
  },
  {
    id: 'golden',
    name: 'Золотий',
    description: 'Блискуча золота кнопка',
    cost: 5,
    preview: '🌟'
  },
  {
    id: 'neon',
    name: 'Неоновий',
    description: 'Яскравий неоновий стиль',
    cost: 10,
    preview: '💫'
  },
  {
    id: 'rainbow',
    name: 'Веселка',
    description: 'Кольорова веселка',
    cost: 15,
    preview: '🌈'
  }
]

export default function Skins() {
  const { state, dispatch } = useGame()
  const { duiktcoins, unlockedSkins, activeSkin } = state
  
  const isUnlocked = (skinId) => {
    return skinId === 'default' || unlockedSkins.includes(skinId)
  }
  
  const handlePurchase = (skin) => {
    if (duiktcoins >= skin.cost && !isUnlocked(skin.id)) {
      dispatch({
        type: 'UNLOCK_SKIN',
        payload: {
          skin: skin.id,
          cost: skin.cost
        }
      })
    }
  }
  
  const handleActivate = (skinId) => {
    if (isUnlocked(skinId)) {
      dispatch({
        type: 'ACTIVATE_SKIN',
        payload: skinId
      })
    }
  }
  
  return (
    <div className={styles.skins}>
      <h2>Скіни</h2>
      <div className={styles.skinList}>
        {SKINS.map(skin => {
          const unlocked = isUnlocked(skin.id)
          const isActive = activeSkin === skin.id
          
          return (
            <div
              key={skin.id}
              className={`${styles.skin} ${isActive ? styles.active : ''}`}
            >
              <div className={styles.skinPreview}>
                {skin.preview}
              </div>
              <div className={styles.skinInfo}>
                <h3>{skin.name}</h3>
                <p>{skin.description}</p>
                {!unlocked && (
                  <p className={styles.cost}>
                    Вартість: {skin.cost} Duiktcoins
                  </p>
                )}
              </div>
              {unlocked ? (
                <button
                  onClick={() => handleActivate(skin.id)}
                  className={`${styles.activateButton} ${isActive ? styles.active : ''}`}
                >
                  {isActive ? 'Активний' : 'Активувати'}
                </button>
              ) : (
                <button
                  onClick={() => handlePurchase(skin)}
                  disabled={duiktcoins < skin.cost}
                  className={styles.purchaseButton}
                >
                  Купити
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
} 