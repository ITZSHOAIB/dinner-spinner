// Recipe records currently store ingredients and steps as separate prose lists.
// This intentionally conservative matcher surfaces only quantities whose
// ingredient names are confidently mentioned in a step; it never guesses.

const QUANTITY_PREFIX = /^(?:\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?|\d+-\d+)\s*/
const IGNORED_WORDS = new Set([
  'and', 'with', 'the', 'for', 'from', 'into', 'until', 'taste', 'optional',
  'fresh', 'dried', 'chopped', 'sliced', 'grated', 'cleaned', 'cooked',
  'small', 'medium', 'large', 'cups', 'cup', 'tbsp', 'tsp', 'grams', 'gram',
  'oil', 'water', 'salt', 'leaves', 'pieces', 'paste',
])

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !IGNORED_WORDS.has(word))
}

function ingredientWords(ingredient: string): string[] {
  // Keep the named ingredient before preparation notes such as ", chopped".
  const name = ingredient.replace(QUANTITY_PREFIX, '').split(',')[0]
  return words(name)
}

/** Returns scaled ingredient lines that are explicitly named by a step. */
export function ingredientsForStep(step: string, scaledIngredients: string[]): string[] {
  const stepWords = new Set(words(step))
  if (stepWords.size === 0) return []

  return scaledIngredients.filter((ingredient) =>
    ingredientWords(ingredient).some((word) => stepWords.has(word)),
  )
}
