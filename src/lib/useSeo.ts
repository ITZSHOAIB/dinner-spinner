import { useEffect } from 'react'

interface SeoOptions {
  title: string
  description?: string
  path?: string // Route path relative to the app base, e.g. "/recipes/biryani"
  image?: string // Absolute or relative URL
  type?: 'website' | 'article'
  jsonLd?: object | object[] | null
  noIndex?: boolean
}

const SITE_URL = (import.meta.env.VITE_SITE_URL ?? '').replace(/\/$/, '')
const BASE_URL = import.meta.env.BASE_URL.replace(/\/$/, '')

function fullUrl(path?: string): string {
  if (!SITE_URL) return ''
  const trimmed = (path ?? '').replace(/^\/+/, '')
  return trimmed ? `${SITE_URL}/${trimmed}` : `${SITE_URL}/`
}

function setMetaByName(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setMetaByProperty(property: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Inject a JSON-LD <script> tagged with data-seo="page" so we can clean up the
// previous page's schema on navigation.
function setJsonLd(schema: object | object[] | null | undefined) {
  const prev = document.querySelectorAll('script[data-seo="page"]')
  prev.forEach((n) => n.remove())
  if (!schema) return
  const payload = Array.isArray(schema) ? schema : [schema]
  for (const item of payload) {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.dataset.seo = 'page'
    script.textContent = JSON.stringify(item)
    document.head.appendChild(script)
  }
}

export function useSeo(opts: SeoOptions) {
  useEffect(() => {
    const { title, description, path, image, type = 'website', jsonLd, noIndex } = opts

    document.title = title

    const canonical = fullUrl(path)
    if (canonical) setCanonical(canonical)

    if (description) {
      setMetaByName('description', description)
      setMetaByProperty('og:description', description)
      setMetaByName('twitter:description', description)
    }
    setMetaByProperty('og:title', title)
    setMetaByName('twitter:title', title)
    setMetaByProperty('og:type', type)
    if (canonical) setMetaByProperty('og:url', canonical)

    if (image) {
      const resolved = image.startsWith('http') ? image : fullUrl(image.replace(/^\//, ''))
      setMetaByProperty('og:image', resolved)
      setMetaByName('twitter:image', resolved)
    }

    setMetaByName('robots', noIndex ? 'noindex, nofollow' : 'index, follow')

    setJsonLd(jsonLd)
  }, [
    opts.title,
    opts.description,
    opts.path,
    opts.image,
    opts.type,
    opts.noIndex,
    JSON.stringify(opts.jsonLd ?? null),
  ])
}

export const seoBase = { SITE_URL, BASE_URL }
