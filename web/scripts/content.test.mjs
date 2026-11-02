import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  slugFromFilename,
  isPublishableMarkdown,
  dateSortKey,
  CONTENT_SRC,
  CONTENT_DEST,
} from './content.mjs'
import { syncContent, copyBotAssets } from './sync-content.mjs'

test('slug: spaces and time in filename', () => {
  assert.equal(slugFromFilename('2026-09-10 08:30.md'), '2026-09-10-08-30')
  assert.equal(slugFromFilename('2026-09-09 20:30.md'), '2026-09-09-20-30')
  assert.equal(slugFromFilename('2026-09-10.md'), '2026-09-10')
  assert.equal(slugFromFilename('2026-10-10 daily.md'), '2026-10-10-daily')
  assert.equal(slugFromFilename('2026-10-13 weekly.md'), '2026-10-13-weekly')
})

test('skip unpublished files', () => {
  assert.equal(isPublishableMarkdown('_example.md'), false)
  assert.equal(isPublishableMarkdown('.gitkeep'), false)
  assert.equal(isPublishableMarkdown('README.md'), false)
  assert.equal(isPublishableMarkdown('2026-09-10.md'), true)
  assert.equal(isPublishableMarkdown('2026-09-10 08:30.md'), true)
  assert.equal(isPublishableMarkdown('2026-10-10 daily.md'), true)
})

test('newer timed digest sorts after same-day file', () => {
  const morning = dateSortKey('2026-09-10', '2026-09-10.md')
  const timed = dateSortKey('2026-09-10 08:30', '2026-09-10 08:30.md')
  assert.ok(timed > morning)
})

test('sync copies bot assets next to digests', () => {
  // Real content/github has assets; sync into digests and assert a known file.
  const bots = syncContent()
  const github = bots.find((b) => b.botId === 'github')
  assert.ok(github, 'github bot present')
  const daily = github.items.find((i) => i.slug === '2026-10-10-daily')
  assert.ok(daily, '2026-10-10 daily slug maps to 2026-10-10-daily')
  assert.ok(
    fs.existsSync(path.join(CONTENT_DEST, 'github', '2026-10-10-daily.md')),
    'digest md copied under slug name',
  )
  const asset = path.join(
    CONTENT_DEST,
    'github',
    'assets',
    '2026-10-10',
    'adk-python-multiagent.png',
  )
  assert.ok(fs.existsSync(asset), `expected asset at ${asset}`)
  assert.equal(copyBotAssets('github'), true)
  assert.equal(copyBotAssets('__no_such_bot__'), false)
})

/** Mask fenced and inline code so placeholders inside spans are ignored. */
function maskCode(text) {
  const mask = (chunk) => chunk.replace(/[^\n]/g, ' ')
  return text
    .replace(/```[\s\S]*?```/g, mask)
    .replace(/~~~[\s\S]*?~~~/g, mask)
    .replace(/`[^`\n]*`/g, mask)
}

function rawOpenTags(text) {
  const hits = []
  const lines = maskCode(text).split('\n')
  const tagRe = /<([A-Za-z][\w:-]*)\b[^>\n]*?>/g
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].replace(/<(?:https?:\/\/|mailto:)[^>\n]+>/gi, ' ')
    for (const match of line.matchAll(tagRe)) {
      if (match[0].endsWith('/>')) continue
      hits.push(`${i + 1}:${match.index + 1} ${match[0]}`)
    }
  }
  return hits
}

test('publishable digests have no raw HTML tags outside code', () => {
  const hits = []
  for (const bot of fs.readdirSync(CONTENT_SRC, { withFileTypes: true })) {
    if (!bot.isDirectory()) continue
    const botDir = path.join(CONTENT_SRC, bot.name)
    for (const name of fs.readdirSync(botDir)) {
      if (!isPublishableMarkdown(name)) continue
      const file = path.join(botDir, name)
      for (const hit of rawOpenTags(fs.readFileSync(file, 'utf8'))) {
        hits.push(`${path.relative(CONTENT_SRC, file)}:${hit}`)
      }
    }
  }
  assert.deepEqual(
    hits,
    [],
    'Wrap placeholders like <project> in a code span so VitePress does not parse them as tags:\n' +
      hits.join('\n'),
  )
})
