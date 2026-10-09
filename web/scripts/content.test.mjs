import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  slugFromFilename,
  isPublishableMarkdown,
  dateSortKey,
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
