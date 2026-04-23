export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type SpiceLevel = 1 | 2 | 3 | 4 | 5

export interface DietaryInfo {
  isVegetarian: boolean
  isVegan: boolean
  isNonVeg: boolean
  isEgg: boolean
  isGlutenFree: boolean
  isDairyFree: boolean
}

export interface Recipe {
  id: string
  name: string
  nameLocal?: string
  description: string
  cuisine: string
  style: string
  proteinBase: string
  mealTypes: MealType[]
  dietary: DietaryInfo
  prepTimeMinutes: number
  cookTimeMinutes: number
  totalTimeMinutes: number
  difficulty: Difficulty
  servings: number
  spiceLevel: SpiceLevel
  ingredients: string[]
  keyIngredients: string[]
  steps: string[]
  tips?: string[]
  youtubeUrl?: string
  articleUrl?: string
  tags: string[]
  region?: string
}

export interface ReelOption {
  value: string
  label: string
  emoji?: string
}

export interface ReelConfig {
  id: 'cuisine' | 'style' | 'protein'
  label: string
  options: Record<MealType, ReelOption[]>
}

export interface SpinResult {
  cuisine: string
  style: string
  protein: string
  mealType: MealType
  timestamp: number
}
