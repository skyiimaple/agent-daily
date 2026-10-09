---
layout: home
hero:
  name: agent-daily
  text: Bot 日刊看板
  tagline: 按机器人分类浏览「GitHub」「Hugging Face」「Skills」等自动归档摘要。
  actions:
    - theme: brand
      text: GitHub
      link: /github/
    - theme: alt
      text: Hugging Face
      link: /huggingface/
    - theme: alt
      text: Skills
      link: /skills/
features:
  - title: GitHub
    details: 开源优秀项目日报 / 周报，来源 grok-bot。
    link: /github/
  - title: Hugging Face
    details: 模型 / 数据集 / Space 推荐，来源 grok-bot。
    link: /huggingface/
  - title: Skills
    details: Agent Skill 推荐，来源 grok-bot。
    link: /skills/
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
