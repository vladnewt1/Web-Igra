import { createContext, useContext, useReducer, useEffect } from 'react'
import { db, saveGame, getSave } from '../db/database'

const GameContext = createContext()

const initialState = {
  credits: 0,
  duiktcoins: 0,
  clickValue: 1,
  autoClicker: 0,
  passiveIncome: 0,
  multiplier: 1,
  criticalClickChance: 0,
  upgrades: {
    clickValue: 0,
    autoClicker: 0,
    multiplier: 0,
    criticalClick: 0,
    passiveIncome: 0
  },
  activeBonuses: [],
  activeAntiBonuses: [],
  unlockedSkins: ['default'],
  activeSkin: 'default',
  prestigeLevel: 0,
  lastTick: Date.now(),
  clickReduction: 1
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'CLICK':
      const baseClickValue = state.clickValue * state.multiplier * state.clickReduction
      const isCritical = Math.random() < state.criticalClickChance
      const clickValue = isCritical ? baseClickValue * 2 : baseClickValue
      
      return {
        ...state,
        credits: Math.floor(state.credits + clickValue)
      }
    case 'ADD_CREDITS':
      const baseValue = action.payload
      let totalValue
      
      if (action.source === 'autoClicker') {
        totalValue = baseValue
      } else {
        totalValue = Math.floor(baseValue * state.multiplier)
      }
      
      console.log('Adding credits:', {
        baseValue,
        multiplier: state.multiplier,
        totalValue,
        source: action.source,
        autoClickerLevel: state.upgrades.autoClicker
      })
      
      if (totalValue > 0) {
        return {
          ...state,
          credits: Math.floor(state.credits + totalValue)
        }
      }
      return state
    case 'PURCHASE_UPGRADE':
      const { type, cost, effect } = action.payload
      const newLevel = (state.upgrades[type] || 0) + 1
      
      if (state.credits < cost) {
        return state
      }
      
      let updatedStateWithUpgrade = {
        ...state,
        credits: Math.floor(state.credits - cost),
        upgrades: {
          ...state.upgrades,
          [type]: newLevel
        }
      }
      
      switch (type) {
        case 'clickValue':
          updatedStateWithUpgrade.clickValue = Math.floor(1 + (effect * newLevel))
          break
        case 'autoClicker':
          updatedStateWithUpgrade.autoClicker = newLevel
          console.log('Auto-clicker upgraded:', {
            newLevel,
            newValue: updatedStateWithUpgrade.autoClicker
          })
          break
        case 'multiplier':
          updatedStateWithUpgrade.multiplier = 1 + (effect * newLevel)
          break
        case 'criticalClick':
          updatedStateWithUpgrade.criticalClickChance = effect * newLevel
          break
        case 'passiveIncome':
          updatedStateWithUpgrade.passiveIncome = Math.floor(effect * newLevel)
          break
      }
      
      return updatedStateWithUpgrade
    case 'ADD_BONUS':
      return {
        ...state,
        activeBonuses: [...state.activeBonuses, action.payload]
      }
    case 'REMOVE_BONUS':
      return {
        ...state,
        activeBonuses: state.activeBonuses.filter(b => b.id !== action.payload)
      }
    case 'ADD_ANTIBONUS':
      const newAntiBonus = action.payload
      let stateWithAntiBonus = {
        ...state,
        activeAntiBonuses: [...state.activeAntiBonuses, newAntiBonus]
      }
      
      if (newAntiBonus.type === 'reduceClick') {
        stateWithAntiBonus.clickReduction = 0.5
      }
      
      return stateWithAntiBonus
    case 'REMOVE_ANTIBONUS':
      const removedAntiBonus = state.activeAntiBonuses.find(b => b.id === action.payload)
      let updatedState = {
        ...state,
        activeAntiBonuses: state.activeAntiBonuses.filter(b => b.id !== action.payload)
      }
      
      if (removedAntiBonus?.type === 'reduceClick') {
        updatedState.clickReduction = 1
      }
      
      return updatedState
    case 'PRESTIGE':
      return {
        ...state,
        duiktcoins: state.duiktcoins + action.payload,
        prestigeLevel: state.prestigeLevel + 1,
        credits: 0
      }
    case 'UNLOCK_SKIN':
      return {
        ...state,
        duiktcoins: state.duiktcoins - action.payload.cost,
        unlockedSkins: [...state.unlockedSkins, action.payload.skin]
      }
    case 'ACTIVATE_SKIN':
      return {
        ...state,
        activeSkin: action.payload
      }
    case 'LOAD_SAVE':
      return {
        ...state,
        ...action.payload
      }
    case 'RESET_PROGRESS':
      return {
        ...initialState,
        unlockedSkins: ['default'],
        activeSkin: 'default'
      }
    default:
      return state
  }
}

function calculateUpgradeValue(type, level) {
  const baseValues = {
    clickValue: 1,
    autoClicker: 0.1,
    passiveIncome: 0.5,
    combo: 1
  }
  
  const multipliers = {
    clickValue: 1.5,
    autoClicker: 1.3,
    passiveIncome: 1.2,
    combo: 1.4
  }
  
  return baseValues[type] * Math.pow(multipliers[type], level - 1)
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  
  useEffect(() => {
    async function loadSave() {
      const save = await getSave()
      if (save) {
        dispatch({ type: 'LOAD_SAVE', payload: save })
      }
    }
    loadSave()
  }, [])
  
  useEffect(() => {
    saveGame(state)
  }, [state])
  
  useEffect(() => {
    let lastTick = Date.now()
    let animationFrameId = null
    
    const tick = () => {
      const now = Date.now()
      const delta = now - lastTick
      
      if (delta >= 1000) {
        if (state.autoClicker > 0 && !state.activeAntiBonuses.some(b => b.type === 'blockAutoClick')) {
          dispatch({ 
            type: 'ADD_CREDITS', 
            payload: state.autoClicker,
            source: 'autoClicker'
          })
        }
        lastTick = now
      }
      
      animationFrameId = requestAnimationFrame(tick)
    }
    
    if (state.autoClicker > 0) {
      animationFrameId = requestAnimationFrame(tick)
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [state.autoClicker, state.activeAntiBonuses])
  
  useEffect(() => {
    let lastTick = Date.now()
    let animationFrameId = null
    
    const tick = () => {
      const now = Date.now()
      const delta = now - lastTick
      
      if (delta >= 30000) {
        if (state.passiveIncome > 0 && !state.activeAntiBonuses.some(b => b.type === 'blockPassive')) {
          dispatch({ type: 'ADD_CREDITS', payload: state.passiveIncome })
        }
        lastTick = now
      }
      
      animationFrameId = requestAnimationFrame(tick)
    }
    
    if (state.passiveIncome > 0) {
      animationFrameId = requestAnimationFrame(tick)
    }
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [state.passiveIncome, state.activeAntiBonuses])
  
  useEffect(() => {
    let lastTick = Date.now()
    let animationFrameId = null
    
    const tick = () => {
      const now = Date.now()
      const delta = now - lastTick
      
      if (delta >= 30000) {
        if (Math.random() < 0.2) {
          const antiBonusTypes = [
            { type: 'blockAutoClick', name: 'Автоклікер заблоковано' },
            { type: 'blockPassive', name: 'Пасивний дохід заблоковано' },
            { type: 'reduceClick', name: 'Дохід за клік зменшено' }
          ]
          const selectedType = antiBonusTypes[Math.floor(Math.random() * antiBonusTypes.length)]
          
          const antiBonus = {
            id: Date.now(),
            type: selectedType.type,
            name: selectedType.name,
            duration: 15000
          }
          
          dispatch({ type: 'ADD_ANTIBONUS', payload: antiBonus })
          
          setTimeout(() => {
            console.log('Attempting to remove anti-bonus with id:', antiBonus.id)
            dispatch({ type: 'REMOVE_ANTIBONUS', payload: antiBonus.id })
          }, antiBonus.duration)
        }
        lastTick = now
      }
      
      animationFrameId = requestAnimationFrame(tick)
    }
    
    animationFrameId = requestAnimationFrame(tick)
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
} 