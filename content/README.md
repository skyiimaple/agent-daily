# Bot 直写约定

Grok Bot 把当日摘要写成 Markdown，直接提交到本目录。站点之后按这些文件渲染，无需额外入库格式。

## 路径

```
content/<bot-id>/YYYY-MM-DD.md
```

每个 bot 每天一份。同一天多次运行时，覆盖当天文件即可。只有需要保留同日多次版本时，才用 `YYYY-MM-DD-HHmm.md`。

## Bot id

| bot-id | 名称 |
|--------|------|
| `hotspot-morning` | 热点早报 |
| `job-radar` | 招聘雷达 |

## Frontmatter

必填字段：

```yaml
---
bot: hotspot-morning  # 或 job-radar
title: 热点早报 · 2026-09-09
date: 2026-09-09
source: grok-bot
---
```

- `bot`：上表中的 id
- `title`：字符串，展示标题
- `date`：`YYYY-MM-DD`
- `source`：固定为 `grok-bot`

正文就是 bot 已经发给 maple 的 digest Markdown，无需再包一层。

示例见各目录下的 `_example.md`（带 EXAMPLE 标记，不是真实数据）。

## 提交

提交信息：

```
content(<bot-id>): YYYY-MM-DD
```

例如：`content(hotspot-morning): 2026-09-09`

Bot 摘要属于小而频繁的自动化提交，优先直接 commit 到 `main`。若之后改为审阅流程，再走 PR。
