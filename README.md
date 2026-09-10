# agent-daily

自动化归档 Grok Bot 消息的站点：把「热点早报」「热点晚报」「招聘雷达」等机器人推送按来源分类展示。

公开看板由仓库内 VitePress 站点（[`web/`](web/)）渲染，内容仍按 Bot 直写约定落在 [`content/`](content/)。

## 目标

- 按机器人分类浏览历史消息
- 支持定时 / 事件同步入库
- 公开可读的日刊看板

## 来源

| Bot | bot-id | 说明 |
|-----|--------|------|
| 热点早报 | `hotspot-morning` | 工作日早晨热点摘要 |
| 热点晚报 | `hotspot-evening` | 晚间热点摘要 |
| 招聘雷达 | `job-radar` | 广州 / 深圳前端社招 |

## 本地预览站点

```bash
cd web
npm i
npm run docs:dev
```

浏览器打开 [http://localhost:5173/](http://localhost:5173/)。生产构建：`npm run docs:build`（输出 `web/.vitepress/dist`）。

内容来自仓库根目录 `content/`：构建时复制到 `web/digests/`，并把文件名中的空格转成 URL 安全路径（例如 `2026-09-10 08:30.md` → `/hotspot-morning/2026-09-10-08-30.html`）。`_example.md` 与 `.gitkeep` 不会进入导航。不要改 Bot 直写路径。

更完整的站点说明见 [web/README.md](web/README.md)。

## 同步

Bot 按 [content/README.md](content/README.md) 的约定，把当日摘要写成 Markdown 直接提交到 `content/`：

| bot-id | 名称 |
|--------|------|
| `hotspot-morning` | 热点早报 |
| `hotspot-evening` | 热点晚报 |
| `job-radar` | 招聘雷达 |

路径：`content/<bot-id>/YYYY-MM-DD.md`（同日多次版本可用 `YYYY-MM-DD HH:mm.md`）。提交信息：`content(<bot-id>): YYYY-MM-DD`。优先直写 `main`。

## 部署

首选 **GitHub Pages + Actions**：推送 `main` 后由 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) 构建 VitePress，并发布到项目页：

<https://skyiimaple.github.io/agent-daily/>

仓库 **Settings → Pages → Source** 需选 **GitHub Actions**（首次部署前打开一次）。站点 `base` 为 `/agent-daily/`。

备选 **Vercel**：Root Directory = `web`，Build = `npm run docs:build`，Output = `.vitepress/dist`，环境变量 `VITEPRESS_BASE=/`。详见 [web/README.md](web/README.md#vercel备选)。

## 状态

内容目录、写入约定与 VitePress 看板已就绪。GitHub Pages 工作流已接入；仓库打开 Pages（Actions）后即可公开访问。
