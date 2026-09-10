# agent-daily 站点（VitePress）

仓库根目录的 `content/` 仍是 Bot 直写入口。本目录只负责把那些 Markdown 渲染成公开看板。

## 内容如何进来

构建 / 开发启动时，`.vitepress/config.mts` 会运行 `scripts/sync-content.mjs`：

1. 扫描仓库根目录 `../content/<bot-id>/*.md`
2. 跳过 `_example.md`、`.gitkeep`、`README.md` 以及点开头文件
3. 把文件复制到 `web/digests/<bot-id>/`，并把文件名里的空格、冒号等转成 URL 安全 slug  
   例：`2026-09-10 08:30.md` → `/hotspot-morning/2026-09-10-08-30.html`
4. 为每个 bot 生成索引页；VitePress `rewrites` 把 `digests/` 映射成 `/:bot-id/` 路由

`web/digests/` 是生成物，不要手改，也不要让 Bot 写到这里。源文件永远在仓库根 `content/`。

开发时若 `content/` 有新增或修改，dev server 会重新同步并刷新。

## 本地预览

在仓库根目录：

```bash
cd web
npm i
npm run docs:dev
```

默认打开 [http://localhost:5173/](http://localhost:5173/)。若设置了 `VITEPRESS_BASE=/agent-daily/`，则访问 `/agent-daily/`。

```bash
npm run docs:build    # 输出 web/.vitepress/dist
npm run docs:preview  # 预览生产构建
```

## 部署

### GitHub Pages（首选）

- 工作流：[`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml)
- 构建环境变量：`VITEPRESS_BASE=/agent-daily/`（项目主页路径）
- 仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**
- 发布地址：<https://skyiimaple.github.io/agent-daily/>

推送到 `main` 后自动构建部署。首次需要打开上述 Pages 开关，否则 workflow 的 deploy job 会失败。

### Vercel（备选）

若不想开 GitHub Pages，可用 Vercel：

| 项 | 值 |
| --- | --- |
| Root Directory | `web` |
| Build Command | `npm run docs:build` |
| Output Directory | `.vitepress/dist` |
| Environment | `VITEPRESS_BASE=/`（Vercel 挂在域名根路径时） |

不要开启 HTML minify，以免弄坏 Vue 水合注释。

## 已知栏目

| 路径 | bot-id | 说明 |
| --- | --- | --- |
| `/hotspot-morning/` | `hotspot-morning` | 热点早报 |
| `/hotspot-evening/` | `hotspot-evening` | 热点晚报 |
| `/job-radar/` | `job-radar` | 招聘雷达 |

`content/` 下新增的 bot 目录会自动出现在导航里（有可发布 `.md` 才会生成条目）。
