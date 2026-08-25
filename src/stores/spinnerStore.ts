import { create } from 'zustand'
import type { MealType, SpinResult } from '../data/types'

export type TimeFilter = 'any' | 20 | 45 | 90
export type SpinnerDietaryFilter = 'veg-only' | 'egg-ok' | 'non-veg' | 'gluten-free' | 'dairy-free'

const mealPreferenceFilters = new Set<SpinnerDietaryFilter>(['veg-only', 'egg-ok', 'non-veg'])

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

  // Temporary constraints for this spin session. These deliberately stay
  // separate from the saved dietary preferences used by Browse and Pantry.
  dietaryFilters: SpinnerDietaryFilter[]
  toggleDietaryFilter: (filter: SpinnerDietaryFilter) => void
  clearDietaryFilters: () => void

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

  dietaryFilters: [],
  toggleDietaryFilter: (filter) =>
    set((state) => {
      if (state.dietaryFilters.includes(filter)) {
        return { dietaryFilters: state.dietaryFilters.filter((value) => value !== filter) }
      }

      if (mealPreferenceFilters.has(filter)) {
        return {
          dietaryFilters: [
            ...state.dietaryFilters.filter((value) => !mealPreferenceFilters.has(value)),
            filter,
          ],
        }
      }

      return { dietaryFilters: [...state.dietaryFilters, filter] }
    }),
  clearDietaryFilters: () => set({ dietaryFilters: [] }),

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
