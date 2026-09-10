import { collectDigests } from '../scripts/content.mjs'

export interface LatestItem {
  url: string
  title: string
  date: string
  bot: string
  botName: string
}

declare const data: LatestItem[]
export { data }

export default {
  watch: ['../../content/**/*.md'],
  load(): LatestItem[] {
    const items: LatestItem[] = []
    for (const bot of collectDigests()) {
      for (const item of bot.items) {
        items.push({
          url: `/${bot.botId}/${item.slug}.html`,
          title: item.title,
          date: item.date,
          bot: bot.botId,
          botName: bot.name,
        })
      }
    }
    return items
      .sort((a, b) => {
        const da = Date.parse(String(a.date).replace(' ', 'T')) || 0
        const db = Date.parse(String(b.date).replace(' ', 'T')) || 0
        return db - da || b.url.localeCompare(a.url)
      })
      .slice(0, 12)
  },
}
