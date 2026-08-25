import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { normalizeSiteUrl } from '../src/lib/seo'

const root = resolve(import.meta.dirname, '..')
const distDir = resolve(root, 'dist')
const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL)

const checks: Array<[string, RegExp]> = [
  ['title', /<title>[^<]+<\/title>/i],
  ['description', /<meta\s+name="description"\s+content="[^"]+"/i],
  ['robots', /<meta\s+name="robots"\s+content="[^"]+"/i],
  ['googlebot', /<meta\s+name="googlebot"\s+content="[^"]+"/i],
  ['canonical', /<link\s+rel="canonical"\s+href="[^"]+"/i],
  ['og:title', /<meta\s+property="og:title"\s+content="[^"]+"/i],
  ['og:description', /<meta\s+property="og:description"\s+content="[^"]+"/i],
  ['og:url', /<meta\s+property="og:url"\s+content="[^"]+"/i],
  ['og:image', /<meta\s+property="og:image"\s+content="[^"]+"/i],
  ['twitter:title', /<meta\s+name="twitter:title"\s+content="[^"]+"/i],
  ['twitter:description', /<meta\s+name="twitter:description"\s+content="[^"]+"/i],
  ['twitter:image', /<meta\s+name="twitter:image"\s+content="[^"]+"/i],
  ['json-ld', /<script[^>]+type="application\/ld\+json"[^>]*>[\s\S]+?<\/script>/i],
  ['semantic h1', /<h1[\s>][\s\S]*?<\/h1>/i],
]

function collectIndexFiles(dir: string): string[] {
  const files: string[] = []

  for (const entry of readdirSync(dir)) {
    const abs = resolve(dir, entry)
    const stats = statSync(abs)
    if (stats.isDirectory()) {
      files.push(...collectIndexFiles(abs))
    } else if (entry === 'index.html') {
      files.push(abs)
    }
  }

  return files
}

function canonicalHostLooksRight(html: string): boolean {
  const match = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)
  return Boolean(match?.[1]?.startsWith(siteUrl))
}

function auditFile(file: string) {
  const html = readFileSync(file, 'utf8')
  const missing = checks
    .filter(([, pattern]) => !pattern.test(html))
    .map(([label]) => label)

  if (!canonicalHostLooksRight(html)) {
    missing.push(`canonical-host(${siteUrl})`)
  }

  return { file, missing }
}

const files = [
  resolve(distDir, 'index.html'),
  ...collectIndexFiles(resolve(distDir, 'recipes')),
]

const staticSeoFiles = [
  ['robots.txt', resolve(distDir, 'robots.txt')],
  ['sitemap.xml', resolve(distDir, 'sitemap.xml')],
] as const

const staticFailures = staticSeoFiles.flatMap(([label, file]) => {
  try {
    const content = readFileSync(file, 'utf8')
    if (label === 'robots.txt' && !content.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
      return [`${label}: missing sitemap directive`]
    }
    if (label === 'sitemap.xml' && !content.includes(`<loc>${siteUrl}/`)) {
      return [`${label}: missing canonical site URLs`]
    }
    return []
  } catch {
    return [`${label}: missing from dist`]
  }
})

const failures = files
  .map(auditFile)
  .filter((result) => result.missing.length > 0)

if (failures.length > 0 || staticFailures.length > 0) {
  console.error(`SEO audit failed for ${failures.length + staticFailures.length} check(s):`)
  for (const failure of staticFailures) {
    console.error(`- ${failure}`)
  }
  for (const failure of failures.slice(0, 12)) {
    console.error(`- ${failure.file.replace(`${root}/`, '')}: ${failure.missing.join(', ')}`)
  }
  if (failures.length > 12) {
    console.error(`- ...and ${failures.length - 12} more`)
  }
  process.exit(1)
}

console.log(`SEO audit passed for ${files.length} prerendered page(s)`)
