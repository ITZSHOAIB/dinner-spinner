import type { Recipe } from '../data/types'

export const DEFAULT_SITE_URL = 'https://dinner-spinner.sohab.dev'
export const DEFAULT_OG_IMAGE_PATH = '/og-image.png'
export const DEFAULT_OG_IMAGE_ALT = 'Dinner Spinner meal picker and recipe collection'
export const INDEX_ROBOTS = 'index, follow'
export const INDEX_GOOGLEBOT =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
export const NOINDEX_ROBOTS = 'noindex, nofollow'

export function normalizeSiteUrl(siteUrl?: string): string {
  return (siteUrl ?? DEFAULT_SITE_URL).replace(/\/$/, '')
}

export function absoluteUrl(siteUrl: string, path = ''): string {
  const normalized = normalizeSiteUrl(siteUrl)
  const trimmed = path.replace(/^\/+/, '')
  return trimmed ? `${normalized}/${trimmed}` : `${normalized}/`
}

export function isoDuration(mins: number): string {
  if (mins <= 0) return 'PT0M'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}`
}

export function homeJsonLd(siteUrl: string) {
  const rootUrl = absoluteUrl(siteUrl)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        name: 'Dinner Spinner',
        url: rootUrl,
        inLanguage: 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: absoluteUrl(siteUrl, 'recipes/?q={search_term_string}'),
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        name: 'Dinner Spinner',
        url: rootUrl,
        description:
          'A meal picker that helps couples and families find recipes by cuisine, style, protein, cooking time, and dietary needs.',
        applicationCategory: 'LifestyleApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
    ],
  }
}

export function browseJsonLd(siteUrl: string, recipes: Recipe[]) {
  const browseUrl = absoluteUrl(siteUrl, 'recipes/')

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Browse Recipes',
      url: browseUrl,
      description: `Browse ${recipes.length}+ recipes across Bengali, Indian, Chinese, Asian, Continental, Mexican and Mediterranean cuisines.`,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Dinner Spinner',
        url: absoluteUrl(siteUrl),
      },
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(siteUrl) },
        { '@type': 'ListItem', position: 2, name: 'Recipes', item: browseUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Recipe collection',
      itemListElement: recipes.slice(0, 24).map((recipe, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(siteUrl, `recipes/${recipe.id}/`),
        name: recipe.name,
      })),
      numberOfItems: recipes.length,
    },
  ]
}

export function recipeJsonLd(siteUrl: string, recipe: Recipe): object[] {
  const url = absoluteUrl(siteUrl, `recipes/${recipe.id}/`)
  const imageUrl = absoluteUrl(siteUrl, DEFAULT_OG_IMAGE_PATH)

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: recipe.name,
      description: recipe.description,
      recipeCuisine: recipe.cuisine,
      recipeCategory: recipe.mealTypes.join(', '),
      keywords: recipe.tags.join(', '),
      prepTime: isoDuration(recipe.prepTimeMinutes),
      cookTime: isoDuration(recipe.cookTimeMinutes),
      totalTime: isoDuration(recipe.totalTimeMinutes),
      recipeYield: `${recipe.servings} servings`,
      recipeIngredient: recipe.ingredients,
      recipeInstructions: recipe.steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step,
      })),
      suitableForDiet: [
        recipe.dietary.isVegetarian ? 'https://schema.org/VegetarianDiet' : null,
        recipe.dietary.isVegan ? 'https://schema.org/VeganDiet' : null,
        recipe.dietary.isGlutenFree ? 'https://schema.org/GlutenFreeDiet' : null,
      ].filter(Boolean),
      image: [imageUrl],
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      inLanguage: 'en',
      isAccessibleForFree: true,
      author: { '@type': 'Organization', name: 'Dinner Spinner' },
      publisher: { '@type': 'Organization', name: 'Dinner Spinner' },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl(siteUrl) },
        { '@type': 'ListItem', position: 2, name: 'Recipes', item: absoluteUrl(siteUrl, 'recipes/') },
        { '@type': 'ListItem', position: 3, name: recipe.name, item: url },
      ],
    },
  ]
}
