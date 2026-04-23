import type { Recipe } from '../data/types'

export interface ResourceLinks {
  youtube: { url: string; curated: boolean; videoId: string | null }
  article: { url: string; curated: boolean }
  moreVariations: { url: string }
}

// Extracts a YouTube video id from common URL shapes.
export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1) || null
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      // shorts / embed
      const parts = u.pathname.split('/').filter(Boolean)
      const marker = parts.findIndex((p) => p === 'shorts' || p === 'embed')
      if (marker >= 0 && parts[marker + 1]) return parts[marker + 1]
    }
  } catch {
    return null
  }
  return null
}

export function thumbnailFor(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function ytSearch(q: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
}

function gSearch(q: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}

export function resourcesFor(recipe: Recipe): ResourceLinks {
  const nameQuery = [recipe.name, recipe.cuisine, 'recipe'].filter(Boolean).join(' ')
  const variationQuery = [recipe.name, 'variations', recipe.cuisine].filter(Boolean).join(' ')

  const youtubeCurated = !!recipe.youtubeUrl
  const youtubeUrl = recipe.youtubeUrl ?? ytSearch(nameQuery)
  const videoId = recipe.youtubeUrl ? extractYoutubeId(recipe.youtubeUrl) : null

  const articleCurated = !!recipe.articleUrl
  const articleUrl = recipe.articleUrl ?? gSearch(nameQuery)

  return {
    youtube: { url: youtubeUrl, curated: youtubeCurated, videoId },
    article: { url: articleUrl, curated: articleCurated },
    moreVariations: { url: gSearch(variationQuery) },
  }
}
