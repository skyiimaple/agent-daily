# Bot 直写约定

Grok Bot 把当日摘要写成 Markdown，直接提交到本目录。站点之后按这些文件渲染，无需额外入库格式。

## 路径

热点早报 / 晚报 / 招聘雷达：

```
content/<bot-id>/YYYY-MM-DD.md
content/<bot-id>/YYYY-MM-DD HH:mm.md   # 同日多次版本
```

GitHub / Hugging Face / Skills（日期在前、空格分隔）：

```
content/github/YYYY-MM-DD daily.md
content/github/YYYY-MM-DD weekly.md
content/huggingface/YYYY-MM-DD daily.md
content/huggingface/YYYY-MM-DD weekly.md
content/skills/YYYY-MM-DD daily.md
content/skills/YYYY-MM-DD weekly.md
```

以后生成必须用上述格式，不要写成 `daily-YYYY-MM-DD.md` 或 `YYYY-MM-DD-daily.md`。站点渲染时会跳过 `_example.md` 与 `.gitkeep`，并把空格文件名转成安全 URL；Bot 仍按本目录原路径提交，不要写到 `web/`。

## Bot id

| bot-id | 名称 |
|--------|------|
| `github` | GitHub |
| `huggingface` | Hugging Face |
| `skills` | Skills |
| `hotspot-morning` | 热点早报 |
| `hotspot-evening` | 热点晚报 |
| `job-radar` | 招聘雷达 |

## Frontmatter

必填字段：

```yaml
---
bot: hotspot-morning  # 或 github / huggingface / skills 等
title: 2026-09-09 热点早报
date: 2026-09-09
source: grok-bot
---
```

GitHub / Hugging Face / Skills 示例：

```yaml
---
bot: github
title: 2026-10-10 GitHub 日报
date: 2026-10-10
source: grok-bot
---
```

- `bot`：上表中的 id（目录名）
- `title`：日期在前，如 `2026-10-10 GitHub 日报` / `2026-10-13 Skills 周报`（不要写成 `GitHub 日报 · 2026-10-10`）
- `date`：`YYYY-MM-DD`
- `source`：固定为 `grok-bot`

正文就是 bot 已经发给 maple 的 digest Markdown，无需再包一层。

示例见各目录下的 `_example.md`（带 EXAMPLE 标记，不是真实数据）。

## 提交

提交信息：

```
content(<bot-id>): YYYY-MM-DD
```

例如：`content(hotspot-morning): 2026-09-09`、`content(github): 2026-10-10 daily`

Bot 摘要属于小而频繁的自动化提交，优先直接 commit 到 `main`。若之后改为审阅流程，再走 PR。
