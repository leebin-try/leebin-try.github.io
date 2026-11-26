# Kaggle 专栏编辑约定

专栏把比赛执行记录提炼成可阅读、可追溯的技术文章。首批内容于 2026-11-26 整理，依据 `kaggle_try` 提交 `b3ddf87ddb3383e77ea7055702ff08b2c137f548` 的文档；Carvana 的预检状态另于 2026-11-26 02:07 UTC 只读核对。

## 文章结构

每个比赛保留一篇主要复盘：提出一个具体判断，解释方法为什么适合当前数据，列出支持它的观察，再说明失效条件和下一次有信息量的实验。无需机械套用同一组小标题，也不按运行日志顺序重述所有操作。

跨比赛文章围绕验证、指标、误差、预算等共同问题组织，链接具体案例。观点可以有明确立场，但未做消融时，不把合理解释写成已经建立的因果关系。

使用 `sample: false`，不虚构作者亲自完成训练、独立掌握技能或获得奖牌的经历。原始实验可能由工具和代理协助完成；项目证据与个人能力是不同问题。

## 新增一篇比赛复盘

文件放入 `src/content/posts/`，以 `kaggle-NN-slug.md` 命名。日期是文章发布日期，`evidenceDate` 是所引用实验／状态的记录日期。

```yaml
---
title: 比赛名称：一条有适用条件的判断
description: 用一两句话说明这篇文章值得阅读的具体问题。
date: 2026-11-26
category: Kaggle
tags: [表格学习, 验证设计]
cover: workflow
sample: false
featured: false
draft: false
kaggle:
  kind: case
  number: 18
  topic: 表格学习
  status: 尚未出分
  result: 已实现验证协议，尚无官方评分
  evidenceDate: '2026-11-26'
  source: https://leebin-try.github.io/kaggle/sources/#case-18
  recordSource: https://github.com/OWNER/REPO/blob/COMMIT/TASK/docs/run.md
  competitionUrl: https://www.kaggle.com/competitions/COMPETITION
---
```

`topic` 支持 `src/config.ts` 中的六类；新增题型时同步类型校验与浏览器测试。`status` 只用“已出分”“验证受阻”“尚未出分”。已评分项目增加 `submission` 字段，并在正文准确说明指标方向、Public／Private 及来源。不得用 0 填充未知分数。

方法论文章将 `kaggle.kind` 设为 `method`，保留 `source`、`recordSource`、`evidenceDate`，无需比赛编号与评分。专栏页面、公开证据摘要、归档、RSS、搜索会从内容集合生成。

## 证据与权限

公开结果摘要是作者根据项目记录整理的说明，不是第三方独立认证。已评分应有终态回执记录；上传、开始执行、预检完成、完整产物验证与正式评分分别表述。实时补记应写明观察时间与查询范围。

原始仓库为私有时，注明访问权限，公开足以理解结论的摘要；不把私有原记录标成人人可访问的公开资料。使用精确提交链接，避免可变分支让旧结论失去出处。

不加入比赛原始数据、预测、检查点、凭据和下载的运行日志。示例与推导使用合成数据或纯文字。公开图片与曲线如需后续加入，先确认可公开内容和轴、指标、样本、日期口径，保留真实观测，不能补造验证值。

## 发布检查

运行 `npm run typecheck`、`npm run build` 与 `npm run test:e2e`。浏览器检查包含桌面／手机分类、分享链接、状态标注、搜索、RSS 与主题。构建产物还要检查专栏内部链接、证据锚点、内容数量以及旧页面是否保留。

推送 `main` 后由现有 GitHub Actions 发布，确认工作流终态及线上 URL。推送成功与部署成功分别报告，不把本地预览称作已经上线。
