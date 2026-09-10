import { collectDigests } from '../scripts/content.mjs'

export interface BotSection {
  id: string
  name: string
  desc: string
  url: string
  count: number
}

declare const data: BotSection[]
export { data }

export default {
  watch: ['../../content/**/*.md'],
  load(): BotSection[] {
    return collectDigests().map((bot) => ({
      id: bot.botId,
      name: bot.name,
      desc: bot.desc,
      url: `/${bot.botId}/`,
      count: bot.items.length,
    }))
  },
}
