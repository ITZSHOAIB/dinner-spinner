// Quick-commerce search URLs for the ingredients section. Each builder takes
// a pre-joined query string (usually `keyIngredients.join(' ')`) and returns a
// search URL that works on web and deep-links to the respective app on mobile.

export interface QuickCommercePlatform {
  id: string
  label: string
  buildUrl: (query: string) => string
}

export const QUICK_COMMERCE_PLATFORMS: QuickCommercePlatform[] = [
  {
    id: 'blinkit',
    label: 'Blinkit',
    buildUrl: (q) => `https://blinkit.com/s/?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'zepto',
    label: 'Zepto',
    buildUrl: (q) => `https://www.zeptonow.com/search?query=${encodeURIComponent(q)}`,
  },
  {
    id: 'bigbasket',
    label: 'BigBasket',
    buildUrl: (q) => `https://www.bigbasket.com/ps/?q=${encodeURIComponent(q)}`,
  },
  {
    id: 'instamart',
    label: 'Instamart',
    buildUrl: (q) => `https://www.swiggy.com/instamart/search?query=${encodeURIComponent(q)}`,
  },
]
