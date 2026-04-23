// Migration from legacy free-form tags to the canonical vocabulary.
//
// Each legacy tag maps to 0, 1, or more canonical tags (an empty array drops it).
// This lets us keep the recipe source files untouched — tags are normalised at
// load time via `normalizeTags` below.

import { CANONICAL_TAG_SET, type CanonicalTag } from './tagVocab'

// Legacy tag → canonical tag(s). Empty [] means "drop" (redundant with typed
// fields like cuisine/protein/mealType, or too noisy to be useful).
const migration: Record<string, CanonicalTag[]> = {
  // Already canonical — identity maps
  'weeknight': ['weeknight'],
  'weekend': ['weekend'],
  'festive': ['festive'],
  'party': ['party'],
  'everyday': ['everyday'],
  'celebration': ['celebration'],
  'comfort-food': ['comfort-food'],
  'kid-friendly': ['kid-friendly'],
  'crowd-pleaser': ['crowd-pleaser'],
  'indulgent': ['indulgent'],
  'elegant': ['elegant'],
  'spicy': ['spicy'],
  'mild': ['mild'],
  'tangy': ['tangy'],
  'rich': ['rich'],
  'smoky': ['smoky'],
  'aromatic': ['aromatic'],
  'sweet': ['sweet'],
  'buttery': ['buttery'],
  'grilled': ['grilled'],
  'baked': ['baked'],
  'fried': ['fried'],
  'steamed': ['steamed'],
  'fermented': ['fermented'],
  'slow-cooked': ['slow-cooked'],
  'no-cook': ['no-cook'],
  'street-food': ['street-food'],
  'restaurant-style': ['restaurant-style'],
  'traditional': ['traditional'],
  'classic': ['classic'],
  'iconic': ['iconic'],
  'healthy': ['healthy'],
  'high-protein': ['high-protein'],
  'hearty': ['hearty'],
  'light': ['light'],
  'meal-prep': ['meal-prep'],
  'monsoon': ['monsoon'],
  'winter': ['winter'],
  'crispy': ['crispy'],
  'creamy': ['creamy'],

  // Remaps
  'quick': ['weeknight'],
  'popular': ['crowd-pleaser'],
  'protein-rich': ['high-protein'],
  'kids-friendly': ['kid-friendly'],
  'rainy-day': ['monsoon'],
  'filling': ['hearty'],
  'balanced': ['healthy'],
  'sweet-spiced': ['sweet', 'aromatic'],
  'rustic': ['home-style'],
  'homestyle': ['home-style'],
  'fun': ['fun'],
  'sharing': ['crowd-pleaser'],
  'must-try': ['iconic'],
  'puja': ['festive'],
  'cheesy': ['rich'],
  'monsoon-special': ['monsoon'],
  'luxurious': ['indulgent'],
  'casual': ['everyday'],
  'refined': ['elegant'],
  'gift': ['special-occasion'],
  'no-cook-assembly': ['no-cook'],
  'premium': ['indulgent'],
  'staple': ['everyday'],
  'soothing': ['comfort-food'],
  'warming': ['comfort-food', 'winter'],
  'leftover-friendly': ['meal-prep'],
  'interactive': ['fun'],
  'simple': ['weeknight', 'everyday'],
  'signature': ['iconic'],
  'party-starter': ['party'],
  'indo-chinese': ['fusion'],
  'dessert': ['sweet'],

  // Spelling dupes
  'appetiser': [],
  'appetizer': [],
  'colourful': [],
  'colorful': [],
  'teatime': [],
  'tea-time': [],

  // Dropped — redundant with typed fields (cuisine/protein/mealType/style)
  'bengali': [], 'vegetarian': [], 'breakfast': [], 'snack': [],
  'north-indian': [], 'south-indian': [], 'continental': [], 'vegan': [],
  'chicken': [], 'fish': [], 'mutton': [], 'paneer': [], 'lentils': [],
  'prawn': [], 'rice': [], 'noodles': [], 'bread': [], 'biryani': [],
  'italian': [], 'asian': [], 'thai': [], 'mexican': [], 'mediterranean': [],
  'korean': [], 'japanese': [], 'punjabi': [], 'kashmiri': [], 'chettinad': [],
  'andhra': [], 'kerala': [], 'mumbai': [], 'tamil': [], 'mughlai': [],
  'coastal': [], 'sadya': [], 'keema': [],
  'curry': [], 'soup': [], 'salad': [], 'rice-bowl': [], 'bowl': [],
  'pasta': [], 'pizza': [], 'wrap': [], 'dip': [],
  'side-dish': [], 'starter': [], 'first-course': [], 'dumplings': [],
  'lentil-cakes': [],

  // Dropped — ingredient-specific / niche / too subjective
  'coconut': [], 'yogurt': [], 'poppy-seed': [], 'potato': [],
  'peas': [], 'chickpeas': [], 'spinach': [], 'cheese': [],
  'hilsa': [], 'mustard': [], 'banana-blossom': [],
  'versatile': [], 'unique': [], 'minimal': [], 'nose-to-tail': [],
  'bitter-sweet': [], 'luchi-pair': [], 'stuffed': [], 'customisable': [],
}

export function normalizeTags(raw: string[]): string[] {
  const out = new Set<CanonicalTag>()
  for (const tag of raw) {
    const mapped = migration[tag]
    if (!mapped) {
      // Unmapped legacy tag: if it happens to already be canonical, keep it;
      // otherwise drop silently.
      if (CANONICAL_TAG_SET.has(tag)) out.add(tag as CanonicalTag)
      continue
    }
    for (const c of mapped) out.add(c)
  }
  return [...out]
}
