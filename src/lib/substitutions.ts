// Curated ingredient-substitution suggestions, keyed by a normalized canonical
// name. Scoped to common keyIngredients so curation cost stays bounded — we
// surface suggestions only for ingredients in this map, and render plain
// (non-interactive) chips for everything else.
//
// Framing is deliberate: these are "common swaps", not guaranteed
// replacements. The popover footer reinforces this.

export interface Substitution {
  name: string
  ratio?: string  // quantity hint, e.g. "1:1", "use ¾ the amount"
  note?: string   // caveat — when the swap is context-sensitive
}

// Map is keyed by the singular lowercase form of the canonical ingredient.
// Plurals and close variants are mapped to the canonical form via ALIASES
// below.
export const SUBSTITUTIONS: Record<string, Substitution[]> = {
  paneer: [
    { name: 'Firm tofu', note: 'Press out water first; absorbs flavor similarly' },
    { name: 'Halloumi', note: 'Saltier — reduce salt in the dish' },
    { name: 'Ricotta salata', note: 'Crumblier; good in stuffings' },
  ],
  ghee: [
    { name: 'Butter', ratio: '1:1', note: 'Loses the nutty aroma; richness stays' },
    { name: 'Coconut oil', note: 'Adds its own flavor — best in veg curries' },
    { name: 'Neutral oil', note: 'Works for tempering; flavor is simpler' },
  ],
  yogurt: [
    { name: 'Sour cream', note: 'Richer; consider reducing other fats' },
    { name: 'Buttermilk', note: 'Thinner; thicken with 1 tsp cornstarch per cup' },
    { name: 'Greek yogurt thinned with milk', note: 'Closest texture match' },
  ],
  'mustard oil': [
    { name: 'Neutral oil + ½ tsp mustard powder', note: 'Approximates the pungency' },
    { name: 'Rapeseed oil', note: 'Closest flavor cousin' },
    { name: 'Sesame oil', note: 'Different but pungent; good in East Indian dishes' },
  ],
  'soy sauce': [
    { name: 'Tamari', ratio: '1:1', note: 'Gluten-free; slightly richer' },
    { name: 'Coconut aminos', note: 'Sweeter; reduce sugar in the dish' },
    { name: 'Worcestershire + pinch of salt', note: 'Backup — different flavor profile' },
  ],
  cumin: [
    { name: 'Ground coriander', ratio: 'Use 1.5× the amount', note: 'Milder; loses the smoky depth' },
    { name: 'Caraway seeds', ratio: '1:1', note: 'Closer in aroma' },
  ],
  'curry leaves': [
    { name: 'Bay leaf + lime zest', note: 'Aromatic alternative; use sparingly' },
    { name: 'Basil', note: 'Weak substitute — only if nothing else is on hand' },
  ],
  'green chilli': [
    { name: 'Serrano or jalapeño', ratio: '1:1', note: 'Milder; add a pinch of cayenne' },
    { name: 'Red chilli flakes', ratio: '¼ tsp per chilli', note: 'No fresh crunch' },
    { name: 'Cayenne pepper', ratio: 'Pinch per chilli', note: 'Heat without flavor' },
  ],
  garlic: [
    { name: 'Garlic powder', ratio: '¼ tsp per clove', note: 'Add later in cooking' },
    { name: 'Asafoetida (hing)', ratio: 'Pinch', note: 'Works in Jain/no-garlic cooking' },
  ],
  ginger: [
    { name: 'Ground ginger', ratio: '¼ tsp per 1 tbsp fresh' },
    { name: 'Galangal', note: 'Sharper, more citrussy' },
  ],
  coconut: [
    { name: 'Desiccated coconut', ratio: 'Use ⅔ the amount', note: 'Rehydrate in water first' },
    { name: 'Coconut cream', note: 'For curry bases only' },
  ],
  'coconut milk': [
    { name: 'Cream + ¼ tsp coconut extract', note: 'Closest richness' },
    { name: 'Cashew cream', note: 'Blend 1 cup cashews with 1 cup water' },
    { name: 'Whole milk + a little oil', note: 'Lean approximation; missing the sweetness' },
  ],
  tomato: [
    { name: 'Canned tomatoes', ratio: '1 cup per 2 fresh', note: 'Thicker; reduce liquid elsewhere' },
    { name: 'Tomato paste + water', ratio: '1 tbsp paste + ¼ cup water per tomato' },
    { name: 'Tamarind pulp (for tartness only)', note: 'Use ¼ the amount; no body' },
  ],
  onion: [
    { name: 'Shallots', ratio: '2 shallots per onion', note: 'Sweeter, more delicate' },
    { name: 'Leeks (white parts)', note: 'Milder; good in sautés' },
    { name: 'Onion powder', ratio: '1 tbsp per medium onion', note: 'Backup for gravies only' },
  ],
  cardamom: [
    { name: 'Cinnamon + clove', ratio: 'Equal parts, use ½ the amount', note: 'Different but warm and aromatic' },
    { name: 'Mace', note: 'Closer in floral notes' },
  ],
  tamarind: [
    { name: 'Lime juice + brown sugar', ratio: '2 tbsp lime + 1 tsp sugar per 1 tbsp tamarind' },
    { name: 'Worcestershire sauce', ratio: '1:1', note: 'Different notes — adds soy/anchovy' },
    { name: 'Lemon juice + date paste', note: 'Closest overall match' },
  ],
  'nigella seeds': [
    { name: 'Black sesame seeds', ratio: '1:1', note: 'Missing the peppery bite' },
    { name: 'Cumin seeds + pinch of pepper', note: 'Different aroma; tempering still works' },
  ],
  butter: [
    { name: 'Ghee', ratio: '1:1', note: 'Richer, nutty aroma' },
    { name: 'Margarine', ratio: '1:1', note: 'For baking; skip for tadka' },
    { name: 'Oil', ratio: 'Use ¾ the amount', note: 'Loses the creaminess' },
  ],
  besan: [
    { name: 'Chickpea flour', ratio: '1:1', note: 'Same thing, different name' },
    { name: 'Rice flour + tsp cornstarch', note: 'Lighter; batters only' },
  ],
  peanuts: [
    { name: 'Cashews', ratio: '1:1', note: 'Milder, buttery' },
    { name: 'Almonds', note: 'Drier; soak first if grinding to a paste' },
    { name: 'Sunflower seeds', note: 'Good allergen-free option' },
  ],
  maida: [
    { name: 'All-purpose flour', ratio: '1:1', note: 'Same thing, different name' },
    { name: 'Cake flour', note: 'Finer; best in soft breads' },
  ],
  jaggery: [
    { name: 'Brown sugar', ratio: '1:1', note: 'Missing some molasses depth' },
    { name: 'Muscovado sugar', note: 'Closest match' },
    { name: 'Maple syrup', ratio: 'Use ¾ the amount', note: 'Different, but warm sweetness' },
  ],
  cream: [
    { name: 'Full-fat coconut milk', note: 'Adds coconut flavor' },
    { name: 'Greek yogurt + milk', note: 'Blend to cream consistency' },
    { name: 'Cashew cream', note: 'Dairy-free and neutral' },
  ],
  'chana dal': [
    { name: 'Yellow split peas', ratio: '1:1', note: 'Softer; reduce cook time' },
    { name: 'Toor dal (arhar)', note: 'Different but works in most dals' },
  ],
  sugar: [
    { name: 'Jaggery', ratio: '1:1', note: 'Adds caramel warmth' },
    { name: 'Honey', ratio: 'Use ¾ the amount', note: 'Liquid — reduce other liquids' },
    { name: 'Maple syrup', ratio: 'Use ¾ the amount' },
  ],
  rava: [
    { name: 'Semolina', ratio: '1:1', note: 'Same thing, different name' },
    { name: 'Cream of wheat', note: 'Finer; works in idli/upma' },
  ],
  lemon: [
    { name: 'Lime', ratio: '1:1', note: 'Slightly sharper' },
    { name: 'White vinegar', ratio: 'Use ½ the amount', note: 'Acid only — no citrus notes' },
  ],
}

// Plurals, common variants, and regional alternate names that should route to
// a canonical entry above. Keys are already lowercase/trimmed.
const ALIASES: Record<string, string> = {
  tomatoes: 'tomato',
  potatoes: 'potato',
  onions: 'onion',
  'green chillies': 'green chilli',
  chilli: 'green chilli',
  chillies: 'green chilli',
  chillis: 'green chilli',
  'red chilli': 'green chilli',
  'chickpea flour': 'besan',
  'all-purpose flour': 'maida',
  semolina: 'rava',
  arhar: 'chana dal',
  'toor dal': 'chana dal',
  chhana: 'paneer',
  'cottage cheese': 'paneer',
  curd: 'yogurt',
  dahi: 'yogurt',
}

export function findSubstitutions(ingredient: string): Substitution[] | null {
  const normalized = ingredient
    .toLowerCase()
    .trim()
    // Strip parenthetical clarifications: "Rava (semolina)" -> "rava"
    .replace(/\s*\([^)]*\)\s*/g, '')
    .trim()
  const key = ALIASES[normalized] ?? normalized
  return SUBSTITUTIONS[key] ?? null
}
