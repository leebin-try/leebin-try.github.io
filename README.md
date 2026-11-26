# BIN / JOURNAL

[访问博客](https://leebin-try.github.io/) · [GitHub 仓库](https://github.com/leebin-try/leebin-try.github.io)

采用暖白、墨黑和荧光绿配色的中英文个人博客，默认英文，可在页头自由切换中文。现有 [Kaggle 竞赛笔记专栏](https://leebin-try.github.io/kaggle/)，以及研究报告和个人文章。

当前使用 Astro 与严格 TypeScript 配置，实现独立定制主题；内容组织参考 AstroPaper 的 Markdown 博客思路。Kaggle 专栏是有来源的实验复盘；其余保留的示例文章在正文单独标注。手记和个人介绍仍沿用初始示例。

中英文首页提供轻量动效：首屏分层渐入、荧光下划线展开、滚动内容进入及桌面悬停反馈。使用原生 CSS、IntersectionObserver 和 Web Animations，无额外依赖；尊重“减少动态效果”偏好，并在偏好变化时取消正在播放的动画。内容默认可读，不依赖滚动动画才能显示。

[桌面首页预览](docs/previews/home-desktop.png) · [手机预览](docs/previews/home-mobile.png) · [深色主题](docs/previews/home-dark.png) · [手机文章页](docs/previews/article-mobile.png)

## 环境

- Node.js：`24.17.0`，记录在 `.node-version`。
- 包管理器：npm，使用 `package-lock.json` 固定依赖。
- 下载设置：项目内 `.npmrc` 使用国内 npm 镜像并直连，不修改全局代理或 npm 配置。
- 框架：Astro，静态站点输出。
- 内容：Markdown + Astro Content Collections + Zod 校验。
- 浏览器检查：Playwright；macOS 优先使用本机 Google Chrome，其他环境使用安装的 Playwright Chromium。

## 开始使用

```bash
cd ~/projects/leebin-try.github.io
nvm use
npm ci
npm run dev
```

浏览器打开 `http://127.0.0.1:4321`。

```bash
npm run check
npm run check:design
```

`check` 一次执行类型检查、生产构建、双语／素材审计、交互与设计检查；`check:design` 重新构建并只检查设计。浏览器测试自动启动并回收 4329 端口的独立生产预览，不复用开发服务。手动预览仍可运行 `npm run preview`，与开发服务共用 4321 端口。

浏览器测试覆盖桌面和手机布局、页面跳转、文章阅读、分类筛选、搜索和主题持久化。没有本机 Chrome 时，首次执行 `npx playwright install chromium`；也可用 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定浏览器。

开发服务运行时，可执行 `node scripts/capture-preview.mjs` 更新 `docs/previews/` 中的实际浏览器截图。

## 设计规范与自动检查

[网页设计标准](DESIGN_STANDARD.md)说明视觉层级、图片尺寸、信息密度、阅读排版、响应式、中英文、动效和人工审阅原则；[AGENTS.md](AGENTS.md)要求后续维护先读规范并完成检查。

核心规则是“同类组件一致，不同职责保留层级”：普通文章卡片和 Kaggle 案例封面统一 16:9，但可以分别采用三列、两列；首页精选可以更突出；正文图表保留原始比例和完整信息。

[design-contract.json](design-contract.json)记录可测量的尺寸边界、代表页面、两种语言和 5 种屏宽。真实浏览器检查封面比例与对齐、图片加载及替代文字、图表完整展示、整行文章封面、阅读字号及间距、目录布局及断点边界、页面横向溢出、双主题和减少动态效果；并注入旧版比例混用、图表裁切、过大段落间距、页面溢出，验证检查器能识别这些缺陷。

推送到 `main`、提交面向 `main` 的 PR 或手动运行 Actions 时自动检查；失败会阻止部署，并保留浏览器报告、失败截图和 trace。PR 只检查，不发布。新增页面模板时，应同时扩充规则和代表路由。内容深度、图中文字是否清楚、视觉层级与颜色质量仍需人工审阅。

## 目录结构

```text
leebin-try.github.io/
├── AGENTS.md              # 后续维护必须遵循的仓库指引
├── DESIGN_STANDARD.md     # 设计原则、组件规范和验收边界
├── design-contract.json   # 浏览器检查使用的页面矩阵和尺寸约束
├── public/art/             # 本地原创 SVG 封面
├── public/kaggle/          # 逐题封面、方法图、实测图及聚合指标 CSV
├── src/
│   ├── views/              # 默认英文／中文路由共用的页面视图
│   ├── components/         # 导航、页脚、文章卡片和搜索框
│   ├── content/posts/      # 中文 Markdown 与 en/ 下的英文对应文章
│   ├── layouts/            # 页面骨架与元信息
│   ├── pages/              # 默认英文与 zh/ 路由、RSS 与搜索索引
│   ├── scripts/            # 浏览器交互
│   ├── styles/             # 主题变量、排版和响应式样式
│   ├── utils/              # 内容读取、日期与阅读时长
│   ├── config.ts           # 站点名称、介绍、作者和 GitHub 地址
│   └── content.config.ts   # 文章字段校验
├── tests/e2e/              # 真实浏览器行为检查
├── tests/design/           # 设计规范与响应式检查
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
lang: zh
---
```

在文件头之后写 Markdown 正文。默认发布要求同名英文版本放在 `src/content/posts/en/`，声明 `lang: en`；中英文标题、说明和正文分别维护，数据事实及章节顺序保持对应。见[双语维护说明](docs/bilingual-editing.md)。`category` 支持 `技术`、`设计`、`生活`、`Kaggle`；`cover` 支持 `garden`、`terminal`、`design`、`coffee`、`workflow`、`slow`。草稿设置 `draft: true` 后不会出现在文章列表、RSS 或搜索索引中。

## Kaggle 专栏

- 入口：`/kaggle/`，导航、首页及页脚均有链接。
- 内容：17 篇逐赛复盘，按表格学习、时序与推荐、图像分类、图像分割、语言模型、智能体分类；另有验证设计、评价指标、计算预算三篇方法论。
- 深度：17 篇逐赛文章采用[六章写作模板](docs/templates/kaggle-case-study.md)：问题定位、技术思路与路线、评价方式、结果与证据、思考与结论、下一步。开头给核心判断，解释指标与验证职责，保留具体实现、实测分析和可证伪的下一步设计；未执行的方案明确标注。
- 排版：正文 16px、约 1.8 行高，收紧段落、标题和模块间距；按最新要求恢复整行大封面（桌面最高约 480px），列表封面也占据卡片整行。实测图完整保留坐标与文字，可放大查看。此前缩略图版的页面缩短比例不再描述当前版本；[测量记录](docs/previews/layout-density.json)使用相同中文内容进行历史对照，并明确记录封面、字号与导航变化。
- 图像：20 幅赛题／方法主题封面、20 幅流程图，均为原创 SVG；另有 16 幅依据真实记录重绘的曲线、对照图与混淆矩阵。封面同步提供 PNG 分享预览，正文支持放大原图与下载指标 CSV。
- 阅读：默认英文，中文位于 `/zh/`；27 篇文章均有对应语言版本，研究报告、导航、搜索、证据页和 RSS 也支持双语。切换语言保留当前文章、分类参数和对应章节；归档与搜索每种语言显示 27 篇文章，避免重复。桌面文章目录固定在左侧并高亮当前章节，窄屏可展开目录。
- 证据：`/kaggle/sources/` 提供公开结果摘要。源代码仓库当前为私有，原记录链接标注访问权限；本文不改变源仓库权限或发布原始数据、预测和模型。
- 状态：15 个项目有文档核实过的官方评分；PLE 环境受阻；Carvana 远程预检 COMPLETE，本地产物校验在 CSV 字段上限处停止、无正式提交。分数按各篇记录日期引用，不是全量实时榜单同步。
- 维护：[双语维护说明](docs/bilingual-editing.md)、[英文写作模板](docs/templates/kaggle-case-study.en.md)与[专栏编辑约定](docs/kaggle-editorial-guide.md)与[完整写作模板](docs/templates/kaggle-case-study.md)。成绩、事实与归纳观点分别记录，新增项目不必更改页面里的固定列表。

[专栏桌面预览](docs/previews/kaggle-desktop.png) · [专栏手机预览](docs/previews/kaggle-mobile.png) · [手机复盘阅读](docs/previews/kaggle-article-mobile.png) · [真实图表阅读](docs/previews/kaggle-figures-desktop.png)

[英文文章首屏](docs/previews/kaggle-article-desktop.png) · [中文文章首屏](docs/previews/kaggle-article-zh-desktop.png) · [左侧章节目录](docs/previews/kaggle-outline-desktop.png) · [文章手机首屏](docs/previews/kaggle-article-first-screen.png)

设计规范接入时的本地验证：Astro／TypeScript 0 错误、0 警告、0 提示；69 个静态页面构建成功；123 项浏览器测试通过（16 项交互、107 项设计），覆盖 9 类页面 × 2 种语言 × 5 种屏宽的 90 个布局组合，以及目录断点两侧、双主题、动效、无 JavaScript 阅读和四类故障注入。静态检查核对 27 对文章的章节／图片对应、分数元信息、54 个文章 canonical／hreflang、研究报告 54 个锚点，以及 3,793 个站内链接、图片和锚点。56 幅 SVG、16 份指标 CSV 与 20 张分享封面的完整性检查保留。后续验证以 `npm run check` 和对应提交的 GitHub Actions 记录为准。

图表由 `scripts/build-kaggle-assets.py` 从私有工程的白名单聚合指标生成；不读取训练样本、不运行模型、不发布完整运行日志。复绘需要 Python + Matplotlib 和源记录；静态完整性检查仅需要 Python 标准库：

```bash
python scripts/build-kaggle-assets.py --source-root /path/to/kaggle_try
node scripts/render-kaggle-covers.mjs
npm run build
python scripts/check-kaggle-assets.py --source-root /path/to/kaggle_try
python scripts/check-translations.py
node scripts/capture-kaggle-preview.mjs
node scripts/measure-reading-layout.mjs
```

没有私有源仓库时，省略检查命令的 `--source-root`，仍可检查公开图像／CSV 指纹、尺寸和构建后的链接。浏览器预览截图前须先启动开发或预览服务；可用 `PREVIEW_URL` 指定地址。

## 自定义与发布

- 修改站点名称和介绍：`src/config.ts`。
- 修改配色、字号和布局：`src/styles/global.css`。
- 修改首页：`src/pages/index.astro`。
- 修改个人介绍：`src/pages/about.astro`。
- 修改手记：`src/pages/notes.astro`。

正式站点地址为 `https://leebin-try.github.io/`，可通过 `SITE_URL` 环境变量覆盖。RSS、sitemap、robots.txt 和页面 canonical 使用该站点地址。

远程仓库为 `leebin-try/leebin-try.github.io`。GitHub Pages 使用 GitHub Actions 发布，配置位于 `.github/workflows/deploy.yml`：推送到 `main` 后，自动安装锁定依赖、执行类型检查、构建、内容审计及浏览器交互／设计检查，全部通过后部署。PR 执行相同验证但不部署，也可在仓库 Actions 页面手动运行该工作流。

本机下载保持国内源直连；GitHub 托管的构建机器使用 npm 官方源，并通过 npm 的 `replace-registry-host` 设置解析锁文件中的镜像地址。工作流使用 GitHub 自动提供的令牌，不需要添加个人 Token。

当前页面使用根路径链接，适用于个人主页根域名。如果未来部署到 `/blog/` 等子路径，应先统一增加 base 路径支持。

本地验证后的发布方式：

```bash
npm run check
git add .
git commit -m "更新博客内容"
git push origin main
```
