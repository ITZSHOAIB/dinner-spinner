// Canonical tag vocabulary.
//
// Tags answer "what mood, method, context?" — they should NOT duplicate info
// that lives in typed fields (cuisine, style, proteinBase, mealTypes, dietary,
// totalTimeMinutes). That's why you won't see `bengali`, `chicken`, `curry`,
// `vegetarian`, `breakfast`, or `quick` in here.

export type TagFacet =
  | 'occasion'
  | 'mood'
  | 'taste'
  | 'technique'
  | 'context'
  | 'health'
  | 'seasonal'
  | 'texture'

export const canonicalTags = {
  occasion: [
    'weeknight',
    'weekend',
    'festive',
    'party',
    'everyday',
    'celebration',
    'special-occasion',
  ],
  mood: [
    'comfort-food',
    'kid-friendly',
    'crowd-pleaser',
    'indulgent',
    'elegant',
    'fun',
  ],
  taste: [
    'spicy',
    'mild',
    'tangy',
    'rich',
    'smoky',
    'aromatic',
    'sweet',
    'buttery',
  ],
  technique: [
    'grilled',
    'baked',
    'fried',
    'steamed',
    'fermented',
    'slow-cooked',
    'no-cook',
    'one-pot',
  ],
  context: [
    'street-food',
    'restaurant-style',
    'home-style',
    'traditional',
    'fusion',
    'classic',
    'iconic',
  ],
  health: [
    'healthy',
    'high-protein',
    'hearty',
    'light',
    'meal-prep',
  ],
  seasonal: [
    'monsoon',
    'winter',
    'summer',
  ],
  texture: [
    'crispy',
    'creamy',
  ],
} as const satisfies Record<TagFacet, readonly string[]>

export type CanonicalTag =
  (typeof canonicalTags)[keyof typeof canonicalTags][number]

const allTags: string[] = Object.values(canonicalTags).flat()
export const CANONICAL_TAG_SET: ReadonlySet<string> = new Set(allTags)

export function facetOf(tag: string): TagFacet | null {
  for (const [facet, list] of Object.entries(canonicalTags)) {
    if ((list as readonly string[]).includes(tag)) return facet as TagFacet
  }
  return null
}
