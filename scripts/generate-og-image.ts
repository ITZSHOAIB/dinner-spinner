// Rasterise public/og-image.svg → public/og-image.png at 1200x630.
// Twitter Cards and Facebook/LinkedIn OG previews need a real raster image.
// We keep the SVG as the source of truth and check the PNG into the repo so
// CI doesn't need to install platform-specific resvg binaries to deploy.
//
// Run with: yarn generate-og-image

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Resvg } from '@resvg/resvg-js'

const root = resolve(import.meta.dirname, '..')
const svgPath = resolve(root, 'public/og-image.svg')
const pngPath = resolve(root, 'public/og-image.png')

const svg = readFileSync(svgPath, 'utf8')

const resvg = new Resvg(svg, {
  background: '#0c0a09',
  fitTo: { mode: 'width', value: 1200 },
  font: {
    loadSystemFonts: true,
    defaultFontFamily: 'Georgia',
  },
})

const png = resvg.render().asPng()
writeFileSync(pngPath, png)
console.log(`Wrote ${pngPath} (${png.byteLength.toLocaleString()} bytes)`)
