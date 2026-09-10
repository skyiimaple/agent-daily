import test from 'node:test'
import assert from 'node:assert/strict'
import {
  slugFromFilename,
  isPublishableMarkdown,
  dateSortKey,
} from './content.mjs'

test('slug: spaces and time in filename', () => {
  assert.equal(slugFromFilename('2026-09-10 08:30.md'), '2026-09-10-08-30')
  assert.equal(slugFromFilename('2026-09-09 20:30.md'), '2026-09-09-20-30')
  assert.equal(slugFromFilename('2026-09-10.md'), '2026-09-10')
})

test('skip unpublished files', () => {
  assert.equal(isPublishableMarkdown('_example.md'), false)
  assert.equal(isPublishableMarkdown('.gitkeep'), false)
  assert.equal(isPublishableMarkdown('README.md'), false)
  assert.equal(isPublishableMarkdown('2026-09-10.md'), true)
  assert.equal(isPublishableMarkdown('2026-09-10 08:30.md'), true)
})

test('newer timed digest sorts after same-day file', () => {
  const morning = dateSortKey('2026-09-10', '2026-09-10.md')
  const timed = dateSortKey('2026-09-10 08:30', '2026-09-10 08:30.md')
  assert.ok(timed > morning)
})
