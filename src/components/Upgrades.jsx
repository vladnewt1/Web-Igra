import { useGame } from '../context/GameContext'
import styles from './Upgrades.module.scss'

const UPGRADES = [
  {
    id: 'clickValue',
    name: 'Кращий клік',
    description: 'Збільшує значення кліку на 1',
    baseCost: 50,
    effect: 1,
    maxLevel: Infinity,
    costMultiplier: 1.15
  },
  {
    id: 'autoClicker',
    name: 'Автоклікер',
    description: 'Автоматично клікає кожну секунду',
    baseCost: 200,
    effect: 1,
    maxLevel: Infinity,
    costMultiplier: 1.3
  },
  {
    id: 'multiplier',
    name: 'Множник',
    description: 'Збільшує всі доходи на 50%',
    baseCost: 500,
    effect: 0.5,
    maxLevel: 1,
    costMultiplier: 1.5
  },
  {
    id: 'criticalClick',
    name: 'Критичний клік',
    description: '5% шанс подвоїти кількість кредитів за клік',
    baseCost: 100,
    effect: 0.05,
    maxLevel: 20,
    costMultiplier: 1.2
  },
  {
    id: 'passiveIncome',
    name: 'Пасивний дохід',
    description: 'Кожні 30 секунд дає +5 кредитів за кожен рівень',
    baseCost: 1000,
    effect: 5,
    maxLevel: Infinity,
    costMultiplier: 1.4
  }
]

export default function Upgrades() {
  const { state, dispatch } = useGame()
  const { credits, upgrades, activeAntiBonuses } = state
  
  const isUpgradesBlocked = activeAntiBonuses.some(b => b.type === 'blockUpgrades')
  
  const calculateCost = (upgrade) => {
    const level = upgrades[upgrade.id] || 0
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, level))
  }
  
  const isMaxed = (upgrade) => {
    const level = upgrades[upgrade.id] || 0
    return level >= upgrade.maxLevel
  }
  
  const handlePurchase = (upgrade) => {
    const cost = calculateCost(upgrade)
    if (credits >= cost && !isUpgradesBlocked && !isMaxed(upgrade)) {
      dispatch({
        type: 'PURCHASE_UPGRADE',
        payload: {
          type: upgrade.id,
          cost,
          effect: upgrade.effect
        }
      })
    }
  }
  
  return (
    <div className={styles.upgrades}>
      <h2>Покращення</h2>
      {isUpgradesBlocked && (
        <div className={styles.blocked}>
          Апгрейди тимчасово заблоковані!
        </div>
      )}
      <div className={styles.upgradeList}>
        {UPGRADES.map(upgrade => {
          const cost = calculateCost(upgrade)
          const level = upgrades[upgrade.id] || 0
          const canAfford = credits >= cost && !isUpgradesBlocked && !isMaxed(upgrade)
          
          return (
            <div key={upgrade.id} className={styles.upgrade}>
              <div className={styles.upgradeInfo}>
                <h3>{upgrade.name}</h3>
                <p>{upgrade.description}</p>
                <p className={styles.level}>
                  Рівень: {level}{upgrade.maxLevel !== Infinity ? `/${upgrade.maxLevel}` : ''}
                </p>
                {isMaxed(upgrade) && (
                  <p className={styles.maxed}>Максимальний рівень!</p>
                )}
              </div>
              <button
                onClick={() => handlePurchase(upgrade)}
                disabled={!canAfford}
                className={styles.purchaseButton}
              >
                Купити за {cost} кредитів
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
} 