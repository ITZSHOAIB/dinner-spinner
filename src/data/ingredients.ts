// Canonical ingredient catalog for Pantry mode.
//
// Synonyms map regional names + plurals + sub-types onto a canonical id, so
// adding "Chicken" to your pantry covers recipes that need "Chicken thigh",
// "Chicken breast", or "Chicken mince". Built from the union of every
// recipe's keyIngredients (see scripts/extract-ingredients-tokens snippet).
//
// Anything classified as a 'staple' or 'spice' is implicitly assumed to be
// available — these never count as "missing" in pantry-mode scoring unless
// the user explicitly toggles them off.

export type IngredientCategory =
  | 'protein'
  | 'vegetable'
  | 'legume'
  | 'grain'
  | 'dairy'
  | 'nut-seed'
  | 'herb'
  | 'fruit'
  | 'spice'
  | 'staple'

export interface CanonicalIngredient {
  id: string
  label: string
  synonyms: string[]
  category: IngredientCategory
  emoji?: string
  /** Implicit staple — assumed available unless user toggles off. */
  isStapleByDefault?: boolean
  /** Quick-add ordering hint; populated from recipe-frequency. */
  popularity?: number
}

export const canonicalIngredients: CanonicalIngredient[] = [
  // ── Proteins ─────────────────────────────────────────────
  { id: 'chicken', label: 'Chicken', emoji: '🍗', category: 'protein', popularity: 17,
    synonyms: ['chicken breast', 'chicken thigh', 'chicken mince'] },
  { id: 'mutton', label: 'Mutton', emoji: '🥩', category: 'protein', popularity: 8,
    synonyms: ['lamb', 'goat meat', 'mutton mince'] },
  { id: 'fish', label: 'Fish', emoji: '🐟', category: 'protein', popularity: 5,
    synonyms: ['rohu', 'rohu fish', 'hilsa', 'hilsa fish', 'bhetki', 'bhetki fish', 'fish head', 'fried fish', 'salmon', 'pomfret', 'rui'] },
  { id: 'prawns', label: 'Prawns', emoji: '🦐', category: 'protein', popularity: 4,
    synonyms: ['prawn', 'shrimp', 'chingri'] },
  { id: 'eggs', label: 'Eggs', emoji: '🥚', category: 'protein', popularity: 5,
    synonyms: ['egg', 'soft-boiled egg', 'fried egg', 'boiled egg'] },
  { id: 'paneer', label: 'Paneer', emoji: '🧀', category: 'protein', popularity: 6,
    synonyms: ['cottage cheese'] },
  { id: 'chenna', label: 'Chenna', emoji: '🥛', category: 'protein', popularity: 2,
    synonyms: ['chenna (cottage cheese)', 'fresh chenna'] },
  { id: 'tofu', label: 'Tofu', emoji: '⬜', category: 'protein',
    synonyms: ['bean curd'] },

  // ── Dairy ────────────────────────────────────────────────
  { id: 'yogurt', label: 'Yogurt', emoji: '🥛', category: 'dairy', popularity: 17,
    synonyms: ['curd', 'dahi', 'yogurt starter', 'greek yogurt'] },
  { id: 'milk', label: 'Milk', emoji: '🥛', category: 'dairy', popularity: 4,
    synonyms: [] },
  { id: 'cream', label: 'Cream', emoji: '🥛', category: 'dairy', popularity: 5,
    synonyms: ['heavy cream', 'fresh cream'] },
  { id: 'butter', label: 'Butter', emoji: '🧈', category: 'dairy', popularity: 6,
    synonyms: ['garlic butter', 'unsalted butter'] },
  { id: 'cheese', label: 'Cheese', emoji: '🧀', category: 'dairy', popularity: 6,
    synonyms: ['parmesan', 'mozzarella', 'fresh mozzarella', 'cheddar', 'cheddar cheese', 'feta'] },
  { id: 'coconut-milk', label: 'Coconut milk', emoji: '🥥', category: 'dairy', popularity: 6,
    synonyms: ['coconut cream'] },

  // ── Vegetables ───────────────────────────────────────────
  { id: 'potato', label: 'Potato', emoji: '🥔', category: 'vegetable', popularity: 10,
    synonyms: ['potatoes', 'baby potatoes', 'new potatoes'] },
  { id: 'tomato', label: 'Tomato', emoji: '🍅', category: 'vegetable', popularity: 13,
    synonyms: ['tomatoes', 'cherry tomatoes', 'san marzano tomatoes', 'tinned tomatoes'] },
  { id: 'onion', label: 'Onion', emoji: '🧅', category: 'vegetable', popularity: 9,
    synonyms: ['onions', 'fried onions', 'red onion', 'shallot'] },
  { id: 'spring-onion', label: 'Spring onion', emoji: '🌱', category: 'vegetable',
    synonyms: ['spring onions', 'scallion', 'scallions', 'green onion'] },
  { id: 'bell-pepper', label: 'Bell pepper', emoji: '🫑', category: 'vegetable', popularity: 4,
    synonyms: ['capsicum', 'red pepper', 'green pepper'] },
  { id: 'eggplant', label: 'Eggplant', emoji: '🍆', category: 'vegetable', popularity: 4,
    synonyms: ['aubergine', 'brinjal', 'baby brinjals', 'baingan'] },
  { id: 'cauliflower', label: 'Cauliflower', emoji: '🥦', category: 'vegetable', popularity: 2,
    synonyms: ['gobi', 'phulkopi'] },
  { id: 'spinach', label: 'Spinach', emoji: '🥬', category: 'vegetable',
    synonyms: ['palak', 'baby spinach'] },
  { id: 'cabbage', label: 'Cabbage', emoji: '🥬', category: 'vegetable',
    synonyms: ['patta gobi'] },
  { id: 'mushrooms', label: 'Mushrooms', emoji: '🍄', category: 'vegetable', popularity: 2,
    synonyms: ['mushroom', 'button mushrooms', 'shiitake'] },
  { id: 'mixed-veg', label: 'Mixed vegetables', emoji: '🥗', category: 'vegetable', popularity: 4,
    synonyms: ['vegetables', 'mixed vegetables', 'mixed greens', 'peas', 'carrots'] },
  { id: 'bottle-gourd', label: 'Bottle gourd', emoji: '🥒', category: 'vegetable',
    synonyms: ['lauki', 'doodhi'] },
  { id: 'ridge-gourd', label: 'Ridge gourd', emoji: '🥒', category: 'vegetable',
    synonyms: ['turai'] },
  { id: 'avocado', label: 'Avocado', emoji: '🥑', category: 'vegetable',
    synonyms: [] },
  { id: 'lettuce', label: 'Lettuce', emoji: '🥬', category: 'vegetable',
    synonyms: ['romaine lettuce', 'iceberg'] },
  { id: 'green-chilli', label: 'Green chilli', emoji: '🌶️', category: 'vegetable', popularity: 6,
    synonyms: ['green chillies', 'green chilies', 'kacha lonka'] },
  { id: 'banana-blossom', label: 'Banana blossom', category: 'vegetable',
    synonyms: ['mocha'] },

  // ── Legumes & Pulses ─────────────────────────────────────
  { id: 'chickpeas', label: 'Chickpeas', emoji: '🫘', category: 'legume', popularity: 4,
    synonyms: ['chana', 'chole', 'kabuli chana', 'dried chickpeas', 'garbanzo'] },
  { id: 'kidney-beans', label: 'Kidney beans', emoji: '🫘', category: 'legume',
    synonyms: ['rajma'] },
  { id: 'black-beans', label: 'Black beans', emoji: '🫘', category: 'legume',
    synonyms: [] },
  { id: 'chana-dal', label: 'Chana dal', emoji: '🟡', category: 'legume', popularity: 4,
    synonyms: ['split chickpea'] },
  { id: 'toor-dal', label: 'Toor dal', emoji: '🟡', category: 'legume', popularity: 3,
    synonyms: ['arhar dal', 'pigeon pea'] },
  { id: 'urad-dal', label: 'Urad dal', emoji: '⚫', category: 'legume',
    synonyms: ['black urad dal', 'black gram'] },
  { id: 'moong-dal', label: 'Moong dal', emoji: '🟢', category: 'legume',
    synonyms: ['green moong dal', 'mung'] },
  { id: 'mixed-dal', label: 'Mixed dal', emoji: '🟡', category: 'legume',
    synonyms: ['five dals', 'mixed dals', 'panchratan dal'] },
  { id: 'besan', label: 'Besan', emoji: '🟡', category: 'legume', popularity: 6,
    synonyms: ['gram flour', 'chickpea flour'] },
  { id: 'sprouts', label: 'Sprouts', emoji: '🌱', category: 'legume',
    synonyms: ['sprouted moth beans', 'bean sprouts', 'moth bean'] },

  // ── Grains, Flour, Bread ─────────────────────────────────
  { id: 'rice', label: 'Rice', emoji: '🍚', category: 'grain', popularity: 6,
    synonyms: ['cooked rice', 'leftover rice', 'basmati rice', 'gobindobhog rice', 'short-grain rice', 'arborio rice', 'jasmine rice'] },
  { id: 'flour', label: 'Plain flour', emoji: '🌾', category: 'grain', popularity: 5,
    synonyms: ['flour', 'maida', 'all-purpose flour', 'cornflour', 'corn flour', 'puttu flour', 'gram flour'] },
  { id: 'wheat-flour', label: 'Wheat flour', emoji: '🌾', category: 'grain', popularity: 2,
    synonyms: ['whole wheat flour', 'atta', 'cracked wheat', 'bulgur'] },
  { id: 'semolina', label: 'Semolina', emoji: '🌾', category: 'grain',
    synonyms: ['suji', 'rava'] },
  { id: 'noodles', label: 'Noodles', emoji: '🍜', category: 'grain', popularity: 4,
    synonyms: ['hakka noodles', 'ramen noodles', 'rice noodles', 'egg noodles'] },
  { id: 'pasta', label: 'Pasta', emoji: '🍝', category: 'grain',
    synonyms: ['spaghetti', 'penne', 'macaroni', 'linguine'] },
  { id: 'bread', label: 'Bread', emoji: '🍞', category: 'grain', popularity: 6,
    synonyms: ['pav', 'pav buns', 'naan', 'pita', 'taco shells', 'tortilla', 'pizza dough', 'croutons', 'breadcrumbs', 'panko'] },

  // ── Nuts & Seeds ─────────────────────────────────────────
  { id: 'coconut', label: 'Coconut', emoji: '🥥', category: 'nut-seed', popularity: 11,
    synonyms: ['fresh coconut', 'roasted coconut', 'desiccated coconut', 'grated coconut'] },
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜', category: 'nut-seed', popularity: 6,
    synonyms: ['peanut', 'groundnut'] },
  { id: 'cashew', label: 'Cashew', emoji: '🥜', category: 'nut-seed',
    synonyms: ['cashew paste', 'cashews', 'kaju'] },
  { id: 'sesame-seeds', label: 'Sesame seeds', emoji: '⚪', category: 'nut-seed',
    synonyms: ['sesame', 'til', 'tahini'] },
  { id: 'poppy-seeds', label: 'Poppy seeds', emoji: '⚫', category: 'nut-seed',
    synonyms: ['posto', 'khus khus'] },
  { id: 'raisins', label: 'Raisins', emoji: '🍇', category: 'nut-seed',
    synonyms: ['kishmish', 'sultanas'] },

  // ── Fresh herbs & citrus ─────────────────────────────────
  { id: 'coriander', label: 'Coriander leaves', emoji: '🌿', category: 'herb',
    synonyms: ['coriander', 'cilantro', 'fresh coriander', 'fresh herbs', 'dhone pata', 'dhania'] },
  { id: 'parsley', label: 'Parsley', emoji: '🌿', category: 'herb',
    synonyms: ['flat-leaf parsley'] },
  { id: 'basil', label: 'Basil', emoji: '🌿', category: 'herb',
    synonyms: ['fresh basil', 'thai basil', 'tulsi'] },
  { id: 'mint', label: 'Mint', emoji: '🌿', category: 'herb',
    synonyms: ['fresh mint', 'pudina'] },
  { id: 'curry-leaves', label: 'Curry leaves', emoji: '🌿', category: 'herb', popularity: 10,
    synonyms: ['kari patta', 'meetha neem'] },
  { id: 'methi', label: 'Fenugreek leaves', emoji: '🌿', category: 'herb',
    synonyms: ['methi', 'kasuri methi'] },
  { id: 'lemon', label: 'Lemon', emoji: '🍋', category: 'fruit',
    synonyms: ['lemon juice', 'lime', 'kaffir lime', 'lebu'] },
  { id: 'lemongrass', label: 'Lemongrass', emoji: '🌿', category: 'herb',
    synonyms: [] },

  // ── Sweet/sour pantry items (not implicit staples) ──────
  { id: 'jaggery', label: 'Jaggery', emoji: '🟫', category: 'staple',
    synonyms: ['gur'] },
  { id: 'tamarind', label: 'Tamarind', emoji: '🟫', category: 'staple',
    synonyms: ['imli', 'tamarind paste', 'tamarind pulp'] },
  { id: 'mustard-paste', label: 'Mustard paste', emoji: '🟡', category: 'staple',
    synonyms: ['kasundi', 'shorsher tel paste'] },

  // ── Implicit staples (assumed unless toggled off) ───────
  { id: 'salt', label: 'Salt', category: 'staple', isStapleByDefault: true,
    synonyms: ['sea salt', 'rock salt'] },
  { id: 'oil', label: 'Cooking oil', category: 'staple', isStapleByDefault: true,
    synonyms: ['vegetable oil', 'sunflower oil', 'olive oil', 'rapeseed oil'] },
  { id: 'water', label: 'Water', category: 'staple', isStapleByDefault: true,
    synonyms: ['hot water', 'cold water'] },
  { id: 'sugar', label: 'Sugar', category: 'staple', isStapleByDefault: true,
    synonyms: ['caster sugar', 'brown sugar', 'maple syrup'] },
  { id: 'black-pepper', label: 'Black pepper', category: 'staple', isStapleByDefault: true,
    synonyms: ['pepper', 'peppercorns'] },
  { id: 'garlic', label: 'Garlic', emoji: '🧄', category: 'staple', isStapleByDefault: true,
    synonyms: ['garlic clove', 'garlic paste', 'ginger-garlic', 'garlic toum', 'minced garlic'] },
  { id: 'ginger', label: 'Ginger', category: 'staple', isStapleByDefault: true,
    synonyms: ['fresh ginger', 'ginger paste', 'ginger-chilli paste'] },
  { id: 'mustard-oil', label: 'Mustard oil', category: 'staple', isStapleByDefault: true,
    synonyms: ['shorsher tel'] },
  { id: 'ghee', label: 'Ghee', category: 'staple', isStapleByDefault: true,
    synonyms: ['clarified butter', 'smoked ghee', 'ghee tempering'] },
  { id: 'vinegar', label: 'Vinegar', category: 'staple', isStapleByDefault: true,
    synonyms: ['palm vinegar', 'rice vinegar', 'white vinegar'] },
  { id: 'soy-sauce', label: 'Soy sauce', category: 'staple', isStapleByDefault: true,
    synonyms: ['light soy sauce', 'dark soy sauce', 'soy tare'] },

  // ── Spices (treated as staples — always assumed) ─────────
  { id: 'turmeric', label: 'Turmeric', category: 'spice', isStapleByDefault: true,
    synonyms: ['haldi', 'turmeric powder'] },
  { id: 'cumin', label: 'Cumin', category: 'spice', isStapleByDefault: true,
    synonyms: ['jeera', 'cumin seeds', 'cumin powder'] },
  { id: 'coriander-powder', label: 'Coriander powder', category: 'spice', isStapleByDefault: true,
    synonyms: ['dhania powder', 'coriander seeds'] },
  { id: 'cardamom', label: 'Cardamom', category: 'spice', isStapleByDefault: true,
    synonyms: ['elaichi', 'green cardamom', 'black cardamom'] },
  { id: 'cinnamon', label: 'Cinnamon', category: 'spice', isStapleByDefault: true,
    synonyms: ['dalchini'] },
  { id: 'mustard-seeds', label: 'Mustard seeds', category: 'spice', isStapleByDefault: true,
    synonyms: ['rai', 'sarson'] },
  { id: 'nigella', label: 'Nigella seeds', category: 'spice', isStapleByDefault: true,
    synonyms: ['kalonji'] },
  { id: 'fennel', label: 'Fennel', category: 'spice', isStapleByDefault: true,
    synonyms: ['saunf', 'fennel seeds'] },
  { id: 'ajwain', label: 'Ajwain', category: 'spice', isStapleByDefault: true,
    synonyms: ['carom seeds'] },
  { id: 'asafoetida', label: 'Asafoetida', category: 'spice', isStapleByDefault: true,
    synonyms: ['hing'] },
  { id: 'amchur', label: 'Amchur', category: 'spice', isStapleByDefault: true,
    synonyms: ['dried mango powder'] },
  { id: 'chilli-powder', label: 'Chilli powder', category: 'spice', isStapleByDefault: true,
    synonyms: ['kashmiri chilli', 'kashmiri chillies', 'red chilli powder', 'dried red chillies', 'chilli flakes', 'mathania chillies'] },
  { id: 'garam-masala', label: 'Garam masala', category: 'spice', isStapleByDefault: true,
    synonyms: ['whole spices', 'spices', 'mixed spices'] },
  { id: 'panch-phoron', label: 'Panch phoron', category: 'spice', isStapleByDefault: true,
    synonyms: ['five-spice mix'] },
  { id: 'saffron', label: 'Saffron', category: 'spice', isStapleByDefault: true,
    synonyms: ['kesar'] },
  { id: 'sumac', label: 'Sumac', category: 'spice', isStapleByDefault: true,
    synonyms: [] },
]

/**
 * Stable lookup: lowercase label / synonym → canonical id.
 * Built once at module load.
 */
export const ingredientLookup: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const ing of canonicalIngredients) {
    map.set(ing.label.toLowerCase(), ing.id)
    for (const s of ing.synonyms) map.set(s.toLowerCase(), ing.id)
  }
  return map
})()

export const ingredientById: Map<string, CanonicalIngredient> = new Map(
  canonicalIngredients.map((i) => [i.id, i]),
)

/** Default staple ids — always-on unless user toggles them off. */
export const defaultStapleIds: string[] = canonicalIngredients
  .filter((i) => i.isStapleByDefault)
  .map((i) => i.id)

/** All staple/spice ids (treated as implicit staples by the matcher). */
export const allStapleIds: Set<string> = new Set(
  canonicalIngredients
    .filter((i) => i.category === 'staple' || i.category === 'spice')
    .map((i) => i.id),
)

/** Categories surfaced in the pantry editor (staples/spices excluded). */
export const userFacingCategories: { id: IngredientCategory; label: string }[] = [
  { id: 'protein', label: 'Proteins' },
  { id: 'vegetable', label: 'Vegetables' },
  { id: 'legume', label: 'Legumes' },
  { id: 'grain', label: 'Grains' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'nut-seed', label: 'Nuts & seeds' },
  { id: 'herb', label: 'Herbs' },
  { id: 'fruit', label: 'Fruit' },
]

/** Quick-add tiles shown on empty pantry — the 12 most useful entry points. */
export const quickAddIds: string[] = [
  'chicken', 'eggs', 'paneer', 'fish',
  'tomato', 'potato', 'onion', 'green-chilli',
  'rice', 'yogurt', 'coconut', 'chickpeas',
]
