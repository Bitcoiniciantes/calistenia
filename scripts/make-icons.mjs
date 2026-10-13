/**
 * Gera os ícones PWA (design original, autoria própria) em public/icons/.
 * Uso: node scripts/make-icons.mjs (requer sharp como devDependency).
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'public', 'icons')
await mkdir(outDir, { recursive: true })

// Marca original: cabeça (círculo) + 3 degraus de progressão, sobre fundo escuro.
function art(size, { radius, pad }) {
  const c = size / 2
  const bar = size * 0.09
  const stepW = size * 0.16
  const x0 = c - stepW * 1.5
  const base = size - pad - bar
  const colors = ['#22c55e', '#c084fc', '#ffffff']
  let steps = ''
  for (let i = 0; i < 3; i += 1) {
    const h = bar * (1 + i * 1.4)
    steps += `<rect x="${x0 + i * stepW}" y="${base - h}" width="${stepW * 0.72}" height="${h}" rx="${bar * 0.25}" fill="${colors[i]}"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`
    + `<rect width="${size}" height="${size}" rx="${radius}" fill="#16171d"/>`
    + `<circle cx="${c}" cy="${pad + size * 0.11}" r="${size * 0.075}" fill="#22c55e"/>`
    + steps
    + `</svg>`
}

const full = art(512, { radius: 112, pad: 64 })
await writeFile(path.join(outDir, 'icon-source.svg'), full)

for (const [name, pngSize, svgSize, opts] of [
  ['icon-192.png', 192, 512, {}],
  ['icon-512.png', 512, 512, {}],
  ['maskable-512.png', 512, 512, {}],
]) {
  void opts
  // maskable usa a mesma arte full-bleed com zona de segurança (pad interno).
  const buf = await sharp(Buffer.from(full)).resize(pngSize, pngSize).png().toBuffer()
  await writeFile(path.join(outDir, String(name)), buf)
  console.log(`OK ${name} (${buf.length} bytes, ${svgSize}px base)`)
}
