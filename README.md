# BIN / JOURNAL

[访问博客](https://leebin-try.github.io/) · [GitHub 仓库](https://github.com/leebin-try/leebin-try.github.io)

采用暖白、墨黑和荧光绿配色的中文个人博客。现有 [Kaggle 竞赛笔记专栏](https://leebin-try.github.io/kaggle/)，以及研究报告和个人文章。

当前使用 Astro 与严格 TypeScript 配置，实现独立定制主题；内容组织参考 AstroPaper 的 Markdown 博客思路。Kaggle 专栏是有来源的实验复盘；其余保留的示例文章在正文单独标注。手记和个人介绍仍沿用初始示例。

[桌面首页预览](docs/previews/home-desktop.png) · [手机预览](docs/previews/home-mobile.png) · [深色主题](docs/previews/home-dark.png) · [手机文章页](docs/previews/article-mobile.png)

## 环境

- Node.js：`24.17.0`，记录在 `.node-version`。
- 包管理器：npm，使用 `package-lock.json` 固定依赖。
- 下载设置：项目内 `.npmrc` 使用国内 npm 镜像并直连，不修改全局代理或 npm 配置。
- 框架：Astro，静态站点输出。
- 内容：Markdown + Astro Content Collections + Zod 校验。
- 浏览器检查：Playwright，使用本机 Google Chrome。

## 开始使用

```bash
cd ~/projects/leebin-try.github.io
nvm use
npm ci
npm run dev
```

浏览器打开 `http://127.0.0.1:4321`。

```bash
npm run typecheck
npm run build
npm run preview
npm run test:e2e
```

`typecheck` 执行 Astro 和 TypeScript 检查，`build` 生成 `dist/`，`preview` 预览构建产物。开发服务与预览服务使用同一端口，请先关闭其中一个再启动另一个。

浏览器测试覆盖桌面和手机布局、页面跳转、文章阅读、分类筛选、搜索和主题持久化。`playwright.config.ts` 默认使用本机 `/Applications/Google Chrome.app`，其他平台可改为对应的浏览器路径。

开发服务运行时，可执行 `node scripts/capture-preview.mjs` 更新 `docs/previews/` 中的实际浏览器截图。

## 目录结构

```text
demo_personal_blog/
├── public/art/             # 本地原创 SVG 封面
├── public/kaggle/          # 逐题封面、方法图、实测图及聚合指标 CSV
├── src/
│   ├── components/         # 导航、页脚、文章卡片和搜索框
│   ├── content/posts/      # Markdown 文章
│   ├── layouts/            # 页面骨架与元信息
│   ├── pages/              # 首页、文章、手记、关于、RSS 与搜索索引
│   ├── scripts/            # 浏览器交互
│   ├── styles/             # 主题变量、排版和响应式样式
│   ├── utils/              # 内容读取、日期与阅读时长
│   ├── config.ts           # 站点名称、介绍、作者和 GitHub 地址
│   └── content.config.ts   # 文章字段校验
├── tests/e2e/              # 真实浏览器行为检查
├── astro.config.mjs
├── playwright.config.ts
├── tsconfig.json
└── package-lock.json
```

## 写文章

在 `src/content/posts/` 新建 Markdown 文件，例如 `my-first-post.md`：

```yaml
---
title: 我的第一篇文章
description: 一句话介绍这篇文章。
date: 2026-11-13
category: 技术
tags: [Astro, 随笔]
cover: garden
featured: false
draft: false
sample: false
---
```

在文件头之后写 Markdown 正文。`category` 支持 `技术`、`设计`、`生活`、`Kaggle`；`cover` 支持 `garden`、`terminal`、`design`、`coffee`、`workflow`、`slow`。草稿设置 `draft: true` 后不会出现在文章列表、RSS 或搜索索引中。

## Kaggle 专栏

- 入口：`/kaggle/`，导航、首页及页脚均有链接。
- 内容：17 篇逐赛复盘，按表格学习、时序与推荐、图像分类、图像分割、语言模型、智能体分类；另有验证设计、评价指标、计算预算三篇方法论。
- 深度：每篇补充具体实现、计算或合成例子、实测解读、适用边界与可证伪的下一步实验；未执行的方案明确标注。
- 图像：20 幅赛题／方法主题封面、20 幅流程图，均为原创 SVG；另有 16 幅依据真实记录重绘的曲线、对照图与混淆矩阵。封面同步提供 PNG 分享预览，正文支持放大原图与下载指标 CSV。
- 阅读：分类筛选可通过 URL 的 `topic` 参数分享；文章也进入全站归档、搜索、RSS 与 sitemap。
- 证据：`/kaggle/sources/` 提供公开结果摘要。源代码仓库当前为私有，原记录链接标注访问权限；本文不改变源仓库权限或发布原始数据、预测和模型。
- 状态：15 个项目有文档核实过的官方评分；PLE 环境受阻；Carvana 远程预检 COMPLETE，本地产物校验在 CSV 字段上限处停止、无正式提交。分数按各篇记录日期引用，不是全量实时榜单同步。
- 维护：[专栏编辑约定](docs/kaggle-editorial-guide.md)。成绩、事实与归纳观点分别记录，新增项目不必更改页面里的固定列表。

[专栏桌面预览](docs/previews/kaggle-desktop.png) · [专栏手机预览](docs/previews/kaggle-mobile.png) · [手机复盘阅读](docs/previews/kaggle-article-mobile.png) · [真实图表阅读](docs/previews/kaggle-figures-desktop.png)

本次本地验证：Astro／TypeScript 0 错误、0 警告、0 提示；35 个静态页面构建成功；16 项桌面／手机浏览器测试通过；1,473 个站内链接、图片及锚点检查通过。另核对 56 幅 SVG、16 份指标 CSV 和源记录的 SHA-256，以及 20 张 PNG 封面尺寸。发布结果以 GitHub Pages 工作流为准。

图表由 `scripts/build-kaggle-assets.py` 从私有工程的白名单聚合指标生成；不读取训练样本、不运行模型、不发布完整运行日志。复绘需要 Python + Matplotlib 和源记录；静态完整性检查仅需要 Python 标准库：

```bash
python scripts/build-kaggle-assets.py --source-root /path/to/kaggle_try
node scripts/render-kaggle-covers.mjs
npm run build
python scripts/check-kaggle-assets.py --source-root /path/to/kaggle_try
node scripts/capture-kaggle-preview.mjs
```

没有私有源仓库时，省略检查命令的 `--source-root`，仍可检查公开图像／CSV 指纹、尺寸和构建后的链接。浏览器预览截图前须先启动开发或预览服务；可用 `PREVIEW_URL` 指定地址。

## 自定义与发布

- 修改站点名称和介绍：`src/config.ts`。
- 修改配色、字号和布局：`src/styles/global.css`。
- 修改首页：`src/pages/index.astro`。
- 修改个人介绍：`src/pages/about.astro`。
- 修改手记：`src/pages/notes.astro`。

正式站点地址为 `https://leebin-try.github.io/`，可通过 `SITE_URL` 环境变量覆盖。RSS、sitemap、robots.txt 和页面 canonical 使用该站点地址。

远程仓库为 `leebin-try/leebin-try.github.io`。GitHub Pages 使用 GitHub Actions 发布，配置位于 `.github/workflows/deploy.yml`：推送到 `main` 后，自动安装锁定依赖、执行类型检查、构建并部署。也可在仓库 Actions 页面手动运行该工作流。

本机下载保持国内源直连；GitHub 托管的构建机器使用 npm 官方源，并通过 npm 的 `replace-registry-host` 设置解析锁文件中的镜像地址。工作流使用 GitHub 自动提供的令牌，不需要添加个人 Token。

当前页面使用根路径链接，适用于个人主页根域名。如果未来部署到 `/blog/` 等子路径，应先统一增加 base 路径支持。

本地验证后的发布方式：

```bash
npm run typecheck
npm run build
git add .
git commit -m "更新博客内容"
git push origin main
```
