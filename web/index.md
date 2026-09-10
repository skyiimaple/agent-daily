---
layout: home
hero:
  name: agent-daily
  text: Bot 日刊看板
  tagline: 按机器人分类浏览「热点早报」「热点晚报」「招聘雷达」等自动归档摘要。
  actions:
    - theme: brand
      text: 热点早报
      link: /hotspot-morning/
    - theme: alt
      text: 热点晚报
      link: /hotspot-evening/
    - theme: alt
      text: 招聘雷达
      link: /job-radar/
features:
  - title: 热点早报
    details: 工作日早晨热点摘要，来源 grok-bot。
    link: /hotspot-morning/
  - title: 热点晚报
    details: 晚间热点摘要，来源 grok-bot。
    link: /hotspot-evening/
  - title: 招聘雷达
    details: 广州 / 深圳前端与 Agent 社招，来源 grok-bot。
    link: /job-radar/
---

<script setup>
import { withBase } from 'vitepress'
import { data as bots } from './.vitepress/bots.data.ts'
import { data as latest } from './.vitepress/latest.data.ts'
</script>

## 栏目

站点从仓库根目录 `content/<bot-id>/` 读取 Markdown 日刊（跳过 `_example.md` 与 `.gitkeep`）。Bot 仍按原约定直写 `content/`，本目录只做展示。

<div class="bot-links">
  <a v-for="bot in bots" :key="bot.id" :href="withBase(bot.url)">
    <strong>{{ bot.name }}</strong>
    <span>{{ bot.id }} · {{ bot.count }} 篇</span>
  </a>
</div>

## 最新日刊

<ul class="latest-list">
  <li v-for="item in latest" :key="item.url">
    <a :href="withBase(item.url)">{{ item.title }}</a>
    <span class="latest-meta">{{ item.botName }} · {{ item.date || '—' }}</span>
  </li>
</ul>

<p v-if="!latest.length">暂无已发布日刊。</p>
