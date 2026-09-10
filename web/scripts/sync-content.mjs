import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  CONTENT_DEST,
  collectDigests,
  renderBotIndex,
} from './content.mjs'

export function syncContent() {
  fs.rmSync(CONTENT_DEST, { recursive: true, force: true })
  fs.mkdirSync(CONTENT_DEST, { recursive: true })

  const bots = collectDigests()
  for (const bot of bots) {
    const destDir = path.join(CONTENT_DEST, bot.botId)
    fs.mkdirSync(destDir, { recursive: true })
    for (const item of bot.items) {
      fs.copyFileSync(item.absPath, path.join(destDir, `${item.slug}.md`))
    }
    fs.writeFileSync(path.join(destDir, 'index.md'), renderBotIndex(bot), 'utf8')
  }

  return bots
}

const isDirectRun =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isDirectRun) {
  const bots = syncContent()
  const count = bots.reduce((n, bot) => n + bot.items.length, 0)
  console.log(
    `synced ${count} digest(s) across ${bots.length} bot(s) -> ${path.relative(process.cwd(), CONTENT_DEST) || '.'}`,
  )
}
