import Dexie from 'dexie'

class GameDatabase extends Dexie {
  constructor() {
    super('ClickerGame')
    this.version(1).stores({
      gameState: 'id'
    })
  }
}

const db = new GameDatabase()

export const saveGame = async (state) => {
  try {
    await db.gameState.clear()
    await db.gameState.put({
      id: 1,
      state: state,
      timestamp: Date.now()
    })
  } catch (error) {
    console.error('Помилка збереження:', error)
  }
}

export const getSave = async () => {
  try {
    const save = await db.gameState.get(1)
    return save?.state || null
  } catch (error) {
    console.error('Помилка завантаження:', error)
    return null
  }
}

export { db } 