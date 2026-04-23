import { create } from 'zustand'
import type { MealType, SpinResult } from '../data/types'

export type TimeFilter = 'any' | 20 | 45 | 90

interface SpinnerState {
  activeMealType: MealType
  setActiveMealType: (type: MealType) => void

  // Reel values
  reelValues: [string, string, string]
  setReelValue: (index: 0 | 1 | 2, value: string) => void

  // Lock states
  lockedReels: [boolean, boolean, boolean]
  toggleLock: (index: 0 | 1 | 2) => void
  setLocks: (locks: [boolean, boolean, boolean]) => void
  resetLocks: () => void

  // Time filter
  timeFilter: TimeFilter
  setTimeFilter: (tf: TimeFilter) => void

  // Spinning state
  isSpinning: boolean
  setSpinning: (spinning: boolean) => void

  // Spin history
  spinHistory: SpinResult[]
  addSpinResult: (result: SpinResult) => void

  // Result
  lastResult: SpinResult | null
  setLastResult: (result: SpinResult | null) => void
}

export const useSpinnerStore = create<SpinnerState>()((set) => ({
  activeMealType: 'dinner',
  setActiveMealType: (type) => set({ activeMealType: type }),

  reelValues: ['', '', ''],
  setReelValue: (index, value) =>
    set((state) => {
      const newValues = [...state.reelValues] as [string, string, string]
      newValues[index] = value
      return { reelValues: newValues }
    }),

  lockedReels: [false, false, false],
  toggleLock: (index) =>
    set((state) => {
      const newLocked = [...state.lockedReels] as [boolean, boolean, boolean]
      newLocked[index] = !newLocked[index]
      return { lockedReels: newLocked }
    }),
  setLocks: (locks) => set({ lockedReels: locks }),
  resetLocks: () => set({ lockedReels: [false, false, false] }),

  timeFilter: 'any',
  setTimeFilter: (tf) => set({ timeFilter: tf }),

  isSpinning: false,
  setSpinning: (spinning) => set({ isSpinning: spinning }),

  spinHistory: [],
  addSpinResult: (result) =>
    set((state) => ({
      spinHistory: [result, ...state.spinHistory].slice(0, 50),
    })),

  lastResult: null,
  setLastResult: (result) => set({ lastResult: result }),
}))
