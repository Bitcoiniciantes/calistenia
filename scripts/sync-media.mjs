/**
 * Sync de mídia em tempo de build. O build NÃO depende de rede quando os
 * arquivos já estão em _inbox/ (modo local).
 * Baixa/copia SOMENTE arquivos com approved:true em media-allowlist.json
 * para public/media. Arquivos bloqueados NÃO entram no build.
 * Produção nunca faz hotlink: a mídia vem de /public/media local.
 *
 * Uso: npm run sync-media          (modo URL, futuro)
 *      npm run sync-media:local    (modo _inbox/, verifica SHA-256)
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const LOCAL_MODE = process.argv.includes('--local')

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const allowlistPath = path.join(root, 'media-allowlist.json')
const inboxDir = path.join(root, '_inbox')
const outDir = path.join(root, 'public', 'media')

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex')
}

/** Tipo real pelos magic bytes (não só pela extensão). */
function detectKind(buf, name) {
  const head = buf.subarray(0, 12).toString('latin1')
  if (head.startsWith('GIF87a') || head.startsWith('GIF89a')) return 'gif'
  if (buf[0] === 0x89 && head.includes('PNG')) return 'png'
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'jpg'
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return 'webm'
  if (head.includes('ftyp')) return 'mp4'
  const text = buf.subarray(0, 200).toString('utf8').trimStart()
  if (text.startsWith('<svg')) return 'svg'
  const ext = String(name).split('.').pop()?.toLowerCase()
  if (ext === 'svg' && buf.includes('<svg')) return 'svg'
  return 'unknown'
}

const IMAGE_KINDS = new Set(['png', 'jpg', 'svg'])
const VIDEO_KINDS = new Set(['gif', 'webm', 'mp4'])

const raw = await readFile(allowlistPath, 'utf-8')
const allowlist = JSON.parse(raw)
const base = allowlist.upstream
const files = allowlist.files ?? []

await mkdir(outDir, { recursive: true })

let ok = 0
let blocked = 0
for (const entry of files) {
  const localName = entry.local ?? path.basename(String(entry.path).replaceAll('/', '__'))
  const dest = path.join(outDir, localName)
  const label = entry.path ?? localName
  if (entry.approved !== true) {
    blocked += 1
    console.log(`BLOQUEADO (${entry.reason ?? 'sem motivo'}): ${label}`)
    continue
  }
  let buf
  if (LOCAL_MODE) {
    // Lê de _inbox/ (campo `inbox`) ou _inbox/own/; grava com o nome local.
    // Bytes copiados sem modificação.
    const src = path.join(inboxDir, entry.inbox ?? path.basename(String(entry.path)))
    try {
      await stat(src)
    } catch {
      console.error(`AUSENTE em _inbox/: ${entry.path}`)
      process.exitCode = 1
      continue
    }
    buf = await readFile(src)
    console.log(`LIDO de _inbox/ (${buf.length} bytes): ${entry.path}`)
  } else {
    const url = entry.url ?? base + entry.path
    const res = await fetch(url)
    if (!res.ok) {
      console.error(`FALHA HTTP ${res.status}: ${url}`)
      process.exitCode = 1
      continue
    }
    buf = Buffer.from(await res.arrayBuffer())
  }
  if (entry.sha256) {
    const hash = sha256(buf)
    if (hash !== entry.sha256.toLowerCase()) {
      console.error(`HASH DIFERE (esperado ${entry.sha256}, obtido ${hash}): ${label}`)
      process.exitCode = 1
      continue
    }
    console.log(`SHA-256 OK: ${localName}`)
  } else {
    console.log(`SEM sha256 na allowlist (registrado como não verificado): ${label}`)
  }
  const kind = detectKind(buf, localName)
  const expectVideo = entry.kind === 'video'
  const kindOk = expectVideo ? VIDEO_KINDS.has(kind) : IMAGE_KINDS.has(kind)
  if (!kindOk) {
    console.error(`TIPO REAL INCOMPATÍVEL (detectado ${kind}, esperado ${expectVideo ? 'vídeo gif/webm/mp4' : 'imagem png/jpg/svg'}): ${label}`)
    process.exitCode = 1
    continue
  }
  console.log(`TIPO OK (${kind}): ${localName}`)
  await writeFile(dest, buf)
  ok += 1
  console.log(`OK (${buf.length} bytes): ${label} -> ${dest}`)
}

console.log(`sync-media${LOCAL_MODE ? ' (local)' : ''}: ${ok} incluídos, ${blocked} bloqueados.`)
