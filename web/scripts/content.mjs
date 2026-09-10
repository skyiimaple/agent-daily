import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const WEB_ROOT = path.resolve(__dirname, '..')
export const REPO_ROOT = path.resolve(WEB_ROOT, '..')
export const CONTENT_SRC = path.join(REPO_ROOT, 'content')
export const CONTENT_DEST = path.join(WEB_ROOT, 'digests')

/** Known bot-ids. Unknown directories under content/ still get listed. */
export const BOT_META = {
  'hotspot-morning': {
    name: '热点早报',
    desc: '工作日早晨热点摘要',
  },
  'hotspot-evening': {
    name: '热点晚报',
    desc: '晚间热点摘要',
  },
  'job-radar': {
    name: '招聘雷达',
    desc: '广州 / 深圳前端与 Agent 社招',
  },
}

const BOT_ORDER = ['hotspot-morning', 'hotspot-evening', 'job-radar']

const SKIP_NAMES = new Set(['.gitkeep', 'README.md'])

export function isPublishableMarkdown(filename) {
  if (!filename.endsWith('.md')) return false
  if (filename.startsWith('.') || filename.startsWith('_')) return false
  if (SKIP_NAMES.has(filename)) return false
  return true
}

/** Turn "2026-09-10 08:30.md" into a URL-safe slug. */
export function slugFromFilename(filename) {
  const stem = filename.replace(/\.md$/i, '')
  const slug = stem
    .trim()
    .replace(/\s+/g, '-')
    .replace(/:/g, '-')
    .replace(/[<>"/\\|?*#]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return slug || 'untitled'
}

export function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { data: {}, body: text }
  const data = {}
  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    data[key] = value
  }
  return { data, body: text.slice(match[0].length) }
}

export function dateSortKey(dateStr, fallbackName = '') {
  if (dateStr) {
    const normalized = String(dateStr).trim().replace(' ', 'T')
    const parsed = Date.parse(normalized)
    if (!Number.isNaN(parsed)) return parsed
  }
  const fromName = fallbackName.match(/\d{4}-\d{2}-\d{2}(?:[ T-]\d{2}[:.]?\d{2})?/)
  if (fromName) {
    const parsed = Date.parse(fromName[0].replace(' ', 'T').replace(/[.]/g, ':'))
    if (!Number.isNaN(parsed)) return parsed
  }
  return 0
}

function listBotDirs() {
  if (!fs.existsSync(CONTENT_SRC)) return []
  return fs
    .readdirSync(CONTENT_SRC, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name)
}

function sortBotIds(ids) {
  return [...ids].sort((a, b) => {
    const ai = BOT_ORDER.indexOf(a)
    const bi = BOT_ORDER.indexOf(b)
    if (ai !== -1 || bi !== -1) {
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    }
    return a.localeCompare(b)
  })
}

function uniqueSlug(slug, used) {
  if (!used.has(slug)) {
    used.add(slug)
    return slug
  }
  let i = 2
  while (used.has(`${slug}-${i}`)) i += 1
  const next = `${slug}-${i}`
  used.add(next)
  return next
}

export function collectDigests() {
  const bots = []
  for (const botId of sortBotIds(listBotDirs())) {
    const dir = path.join(CONTENT_SRC, botId)
    const usedSlugs = new Set()
    const items = []
    for (const filename of fs.readdirSync(dir)) {
      if (!isPublishableMarkdown(filename)) continue
      const absPath = path.join(dir, filename)
      if (!fs.statSync(absPath).isFile()) continue
      const raw = fs.readFileSync(absPath, 'utf8')
      const { data } = parseFrontmatter(raw)
      const slug = uniqueSlug(slugFromFilename(filename), usedSlugs)
      const title = data.title || slug
      const date = data.date || ''
      items.push({
        botId,
        filename,
        absPath,
        slug,
        title,
        date,
        source: data.source || '',
        sortKey: dateSortKey(date, filename),
      })
    }
    items.sort((a, b) => b.sortKey - a.sortKey || b.filename.localeCompare(a.filename))
    const meta = BOT_META[botId] || { name: botId, desc: '' }
    bots.push({
      botId,
      name: meta.name,
      desc: meta.desc,
      items,
    })
  }
  return bots
}

export function buildRewrites(bots) {
  const rewrites = {}
  for (const bot of bots) {
    rewrites[`digests/${bot.botId}/index.md`] = `${bot.botId}/index.md`
    for (const item of bot.items) {
      rewrites[`digests/${bot.botId}/${item.slug}.md`] = `${bot.botId}/${item.slug}.md`
    }
  }
  return rewrites
}

export function buildNav(bots) {
  return [
    { text: '首页', link: '/' },
    ...bots.map((bot) => ({
      text: bot.name,
      link: `/${bot.botId}/`,
    })),
  ]
}

export function buildSidebar(bots) {
  const sidebar = {}
  for (const bot of bots) {
    sidebar[`/${bot.botId}/`] = [
      {
        text: bot.name,
        items: [
          { text: '全部日刊', link: `/${bot.botId}/` },
          ...bot.items.map((item) => ({
            text: item.title,
            link: `/${bot.botId}/${item.slug}`,
          })),
        ],
      },
    ]
  }
  return sidebar
}

export function renderBotIndex(bot) {
  const lines = [
    '---',
    `title: ${bot.name}`,
    `description: ${bot.desc || bot.name}`,
    'outline: false',
    '---',
    '',
    `# ${bot.name}`,
    '',
  ]
  if (bot.desc) {
    lines.push(bot.desc, '')
  }
  if (!bot.items.length) {
    lines.push('暂无已发布日刊。', '')
    return lines.join('\n')
  }
  lines.push('| 日期 | 标题 |', '| --- | --- |')
  for (const item of bot.items) {
    const dateLabel = item.date || item.slug
    const title = item.title.replace(/\|/g, '\\|')
    lines.push(`| ${dateLabel} | [${title}](./${item.slug}) |`)
  }
  lines.push('')
  return lines.join('\n')
}
