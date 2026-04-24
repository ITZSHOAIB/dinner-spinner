import type { MealType, ReelOption } from './types'

export const cuisineOptions: Record<MealType, ReelOption[]> = {
  breakfast: [
    { value: 'Bengali', label: 'Bengali', emoji: '🐟' },
    { value: 'North Indian', label: 'North Indian', emoji: '🫓' },
    { value: 'South Indian', label: 'South Indian', emoji: '🥥' },
    { value: 'Gujarati', label: 'Gujarati', emoji: '🌯' },
    { value: 'Continental', label: 'Continental', emoji: '🍳' },
    { value: 'Chinese', label: 'Indo-Chinese', emoji: '🥡' },
  ],
  lunch: [
    { value: 'Bengali', label: 'Bengali', emoji: '🐟' },
    { value: 'North Indian', label: 'North Indian', emoji: '🫓' },
    { value: 'South Indian', label: 'South Indian', emoji: '🥥' },
    { value: 'Gujarati', label: 'Gujarati', emoji: '🌯' },
    { value: 'Chinese', label: 'Indo-Chinese', emoji: '🥡' },
    { value: 'Continental', label: 'Continental', emoji: '🍝' },
    { value: 'Asian', label: 'East Asian', emoji: '🍜' },
    { value: 'Mexican', label: 'Mexican', emoji: '🌮' },
  ],
  dinner: [
    { value: 'Bengali', label: 'Bengali', emoji: '🐟' },
    { value: 'North Indian', label: 'North Indian', emoji: '🫓' },
    { value: 'South Indian', label: 'South Indian', emoji: '🥥' },
    { value: 'Gujarati', label: 'Gujarati', emoji: '🌯' },
    { value: 'Chinese', label: 'Indo-Chinese', emoji: '🥡' },
    { value: 'Continental', label: 'Continental', emoji: '🍝' },
    { value: 'Asian', label: 'East Asian', emoji: '🍜' },
    { value: 'Mediterranean', label: 'Mediterranean', emoji: '🫒' },
    { value: 'Mexican', label: 'Mexican', emoji: '🌮' },
  ],
  snacks: [
    { value: 'Bengali', label: 'Bengali', emoji: '🐟' },
    { value: 'North Indian', label: 'North Indian', emoji: '🫓' },
    { value: 'South Indian', label: 'South Indian', emoji: '🥥' },
    { value: 'Gujarati', label: 'Gujarati', emoji: '🌯' },
    { value: 'Chinese', label: 'Indo-Chinese', emoji: '🥡' },
    { value: 'Continental', label: 'Continental', emoji: '🍕' },
  ],
}

export const styleOptions: Record<MealType, ReelOption[]> = {
  breakfast: [
    { value: 'Light', label: 'Light', emoji: '🌿' },
    { value: 'Hearty', label: 'Hearty', emoji: '💪' },
    { value: 'Sweet', label: 'Sweet', emoji: '🍯' },
    { value: 'Savory', label: 'Savory', emoji: '🧂' },
  ],
  lunch: [
    { value: 'Curry', label: 'Curry', emoji: '🍛' },
    { value: 'Dry', label: 'Dry/Fry', emoji: '🍳' },
    { value: 'Rice Bowl', label: 'Rice Bowl', emoji: '🍚' },
    { value: 'Bread Meal', label: 'Bread Meal', emoji: '🫓' },
    { value: 'One Pot', label: 'One Pot', emoji: '🥘' },
    { value: 'Light', label: 'Light', emoji: '🥗' },
  ],
  dinner: [
    { value: 'Curry', label: 'Curry', emoji: '🍛' },
    { value: 'Dry', label: 'Dry/Fry', emoji: '🍳' },
    { value: 'Rice Bowl', label: 'Rice Bowl', emoji: '🍚' },
    { value: 'Bread Meal', label: 'Bread Meal', emoji: '🫓' },
    { value: 'One Pot', label: 'One Pot', emoji: '🥘' },
    { value: 'Grilled', label: 'Grilled', emoji: '🔥' },
    { value: 'Soup', label: 'Soup/Stew', emoji: '🍲' },
  ],
  snacks: [
    { value: 'Fried', label: 'Fried', emoji: '🍟' },
    { value: 'Baked', label: 'Baked', emoji: '🧁' },
    { value: 'Chaat', label: 'Chaat', emoji: '🫙' },
    { value: 'Sweet', label: 'Sweet', emoji: '🍬' },
    { value: 'Light', label: 'Light', emoji: '🌿' },
  ],
}

export const proteinOptions: Record<MealType, ReelOption[]> = {
  breakfast: [
    { value: 'Egg', label: 'Egg', emoji: '🥚' },
    { value: 'Paneer', label: 'Paneer', emoji: '🧀' },
    { value: 'Lentils', label: 'Lentils', emoji: '🫘' },
    { value: 'Veggies', label: 'Veggies', emoji: '🥬' },
  ],
  lunch: [
    { value: 'Chicken', label: 'Chicken', emoji: '🍗' },
    { value: 'Fish', label: 'Fish', emoji: '🐟' },
    { value: 'Mutton', label: 'Mutton', emoji: '🥩' },
    { value: 'Egg', label: 'Egg', emoji: '🥚' },
    { value: 'Paneer', label: 'Paneer', emoji: '🧀' },
    { value: 'Lentils', label: 'Lentils', emoji: '🫘' },
    { value: 'Veggies', label: 'Veggies', emoji: '🥬' },
    { value: 'Prawn', label: 'Prawn', emoji: '🦐' },
  ],
  dinner: [
    { value: 'Chicken', label: 'Chicken', emoji: '🍗' },
    { value: 'Fish', label: 'Fish', emoji: '🐟' },
    { value: 'Mutton', label: 'Mutton', emoji: '🥩' },
    { value: 'Egg', label: 'Egg', emoji: '🥚' },
    { value: 'Paneer', label: 'Paneer', emoji: '🧀' },
    { value: 'Lentils', label: 'Lentils', emoji: '🫘' },
    { value: 'Veggies', label: 'Veggies', emoji: '🥬' },
    { value: 'Prawn', label: 'Prawn', emoji: '🦐' },
  ],
  snacks: [
    { value: 'Chicken', label: 'Chicken', emoji: '🍗' },
    { value: 'Egg', label: 'Egg', emoji: '🥚' },
    { value: 'Paneer', label: 'Paneer', emoji: '🧀' },
    { value: 'Veggies', label: 'Veggies', emoji: '🥬' },
    { value: 'Lentils', label: 'Lentils', emoji: '🫘' },
  ],
}
