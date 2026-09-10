import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import {
  CONTENT_SRC,
  collectDigests,
  buildNav,
  buildRewrites,
  buildSidebar,
} from '../scripts/content.mjs'
import { syncContent } from '../scripts/sync-content.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

syncContent()

const bots = collectDigests()

const base =
  process.env.VITEPRESS_BASE ||
  (process.env.GITHUB_ACTIONS ? '/agent-daily/' : '/')

export default defineConfig({
  lang: 'zh-CN',
  title: 'agent-daily',
  description: 'Bot 日刊看板 — 热点早报、热点晚报、招聘雷达',
  base,
  srcDir: '.',
  srcExclude: ['README.md', 'scripts/**', '**/node_modules/**'],
  lastUpdated: false,
  cleanUrls: false,
  rewrites: buildRewrites(bots),
  head: [
    ['meta', { name: 'theme-color', content: '#1a1a1a' }],
    ['meta', { property: 'og:title', content: 'agent-daily · Bot 日刊看板' }],
    [
      'meta',
      {
        property: 'og:description',
        content: '按机器人分类浏览热点早报、热点晚报与招聘雷达。',
      },
    ],
  ],
  themeConfig: {
    siteTitle: 'agent-daily',
    nav: buildNav(bots),
    sidebar: buildSidebar(bots),
    outline: { label: '本页目录', level: [2, 3] },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '日刊目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索', buttonAriaLabel: '搜索日刊' },
          modal: {
            displayDetails: '显示详细列表',
            resetButtonTitle: '清除查询',
            backButtonTitle: '关闭搜索',
            noResultsText: '没有找到结果',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭',
            },
          },
        },
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/skyiimaple/agent-daily' },
    ],
    footer: {
      message: '内容由 Grok Bot 直写至 <code>content/</code>，本站只负责渲染。',
      copyright: 'MIT · agent-daily',
    },
  },
  vite: {
    server: {
      fs: { allow: [path.resolve(__dirname, '../..')] },
    },
    plugins: [
      {
        name: 'agent-daily-sync-content',
        configureServer(server) {
          server.watcher.add(CONTENT_SRC)
          let timer: ReturnType<typeof setTimeout> | undefined
          const resync = (file: string) => {
            if (!file.startsWith(CONTENT_SRC)) return
            clearTimeout(timer)
            timer = setTimeout(() => {
              syncContent()
              server.hot.send({ type: 'full-reload' })
            }, 150)
          }
          server.watcher.on('add', resync)
          server.watcher.on('change', resync)
          server.watcher.on('unlink', resync)
        },
      },
    ],
  },
})
