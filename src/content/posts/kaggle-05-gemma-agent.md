---
title: "Gemma 编程智能体：小样本成功，不足以支持一次升级"
description: "31B 方案有真实评分，但后续候选在更大的配对确认中退步。模型规模、提示词与任务覆盖必须分开判断。"
date: "2026-11-26"
category: "Kaggle"
tags: ["智能体", "Google", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 5, "topic": "智能体", "status": "已出分", "result": "Official issue-resolution score 0.13", "evidenceDate": "2026-11-20", "source": "https://leebin-try.github.io/kaggle/sources/#case-05", "competitionUrl": "https://www.kaggle.com/competitions/gemma-4-developer-agent", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/docs/refresh31b-results-20261120.md", "submission": "58473700"}
coverImage: "/kaggle/05/cover.svg"
coverAlt: "代码补丁与配对任务确认的控制组、候选结果"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

编程智能体的输出很容易让人产生“这次明显聪明了”的印象：补丁更完整、解释更像工程师，或者恰好修好两个熟悉任务。但真正值得问的是：**它是否在相同任务、相同预算下，稳定超过已评分控制组？**

## 问题定义：最终被评分的是补丁的行为

编程智能体接收 issue 和代码仓库，输出在隔离任务环境里应用的修改。这里的评估单位是完整任务，不是模型写出的某一行代码；找到文件、理解约束、修改、运行测试和按要求交付，只要任何一环断裂，都可能导致任务未解决。

因此，模型规模不是唯一实验变量。上下文保留方式、工具调用策略、任务时间预算、依赖安装和验证开销，都会影响最终成功。31B 与 12B 两个官方成绩来自不同完整候选，硬件也不同，把它们画成一条“参数量增长带来质量增长”的曲线会误导读者。

更可比较的对象是同一个任务上的两个固定候选：相同输入、相同环境、相同预算，分别执行，再保留补丁和评分产物。这也是后续 24 任务确认比两个熟悉开发样例更值得参考的原因。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/05/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Gemma 编程智能体"><img src="/kaggle/05/method.svg" alt="原创流程与验证边界示意。代码补丁与配对任务确认的控制组、候选结果；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Gemma 编程智能体</strong> 原创流程与验证边界示意。代码补丁与配对任务确认的控制组、候选结果；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/05/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-05-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 已建立的结果与不能归因的变化

当前保留的官方成绩是 **0.13**，来自 31B QAT 候选；早期 12B 方案的官方成绩为 0.06。31B 的开发探针实际使用四张 L4，12B 早期使用双 T4。模型、硬件和候选设置并未只改变一个变量，所以不能把这两个数字的差异单独归因于参数量。

31B 在两个复用的开发任务上曾解决 1 个。这是运行诊断，而不是“成功率约 50%”的泛化估计，更不能替代官方 0.13。

## 实现展开：提示词改变应落到可观察行为

例如，“先理解仓库再修改”可以被观察为：是否在动手前定位到相关实现与测试；“验证修复”可以被观察为：是否执行了相关测试、读取失败输出，并在时间允许时重新修改。仅仅让最终回答包含“已验证”，不能证明这些行为发生。

一个实用的任务记录应同时保留：最终补丁、测试命令与退出码、修改前后的错误、环境异常，以及终态是否有有效评分。执行时间还要拆出模型推理、工具等待和测试，避免把慢在依赖安装的问题误认成模型推理太慢。

```text
issue → 仓库定位 → 最小修改 → 定向测试 → 读取结果
                   ↑                         │
                   └──── 在预算内继续修复 ──┘
```

这个循环也可能失败：只根据一条断言改代码，会破坏没有被显式提到的输入；反复跑全量测试，会耗尽本来用于分析问题的时间。策略比较的重点，应是不同阶段如何分配预算，以及哪些失败真正被减少。

## 一次应该留下来的否决

后续刷新候选完成了更大的 24 任务确认。相同已评分控制组解决 **6 个**，新候选解决 **4 个**，另有一项环境错误记录。候选没有通过提升门槛，没有继续正式提交，保留原官方成绩。

这项结果的价值，在于阻止了把开发小样本上的感觉当成升级证据。另一次 patch-first 六任务筛选，两组都没有解决任务，也没有把“提示词已经更新”写成“能力已经提升”。

## 对照图之后，还缺哪张表


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/05/paired-confirmation.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Gemma 编程智能体"><img src="/kaggle/05/paired-confirmation.svg" alt="24 任务确认的解决数量：控制组 6、候选 4。环境错误另记，图中数量不是新的官方得分或通用成功率。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Gemma 编程智能体</strong> 24 任务确认的解决数量：控制组 6、候选 4。环境错误另记，图中数量不是新的官方得分或通用成功率。<br /><a href="/kaggle/05/paired-confirmation.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/05/paired-confirmation.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-05-paired-confirmation">图表出处与口径</a></figcaption>
</figure>


24 任务确认里，控制组解决六个、候选解决四个，这是保留控制组的直接理由，但这些总数还不足以给出配对显著性。两组到底解决了多少相同任务，决定了有多少真正的分歧样本；没有交叉表，就不应该计算一个看似精确的提升置信区间。

下一次应把结果按“都成功、仅控制成功、仅候选成功、都失败、环境未就绪”组织，再审查任务类型和预算耗尽点。环境错误要保留并说明处理口径，不能为了某个模型显得更好而选不同分母。

最后，筛选集与确认集的角色应在运行前固定。反复修改提示词直到同几个开发任务通过，是学习这些任务的一种方式，却不是新任务泛化的充分证据。真正能够推进判断的结果，是在更广、更少被选择复用的任务上，观察到同一种失败机制被稳定减少。

## 观点：对智能体，过程质量与结果质量要同时记录

在隐蔽测试驱动的代码任务里，一个看起来合理的补丁可能漏掉兼容性、边界输入或交付要求。日志应该帮助解释错误，但最终判断仍然依赖真实评测结果。环境错误也必须单独记录，不能悄悄删除不利样本或直接算成模型失败。

这并不意味着 24 个任务足以完成稳定估计。它只是比两个熟悉样本提供更多约束；任务覆盖、预算分配和环境稳定性仍值得继续扩大验证。

## 下一次怎样试才更有信息量

固定模型与硬件，先只改变一种工具策略或上下文管理方式；使用相同任务做配对比较，单列环境错误，保留补丁与测试产物。只有预先定义的确认门槛通过，再考虑新的官方提交。

我的取舍是：宁可保留一个解释清楚的 0.13，也不因为新模型或新提示词的叙事更好听，就把未经确认的版本称为进步。

## 进一步辨析：六比四不等于已经知道全部分歧

只知道两组分别解决六个和四个任务，成功集合的交集可以从零到四。若候选解决的四个全包含在控制组中，只有两个单侧分歧；若完全不重叠，则有十个分歧。净差都为二，配对结构却不同。这里是集合关系的演算，不是在重建未公开任务结果。

因此，后续报告应公开可分享的聚合交叉表，单列仅候选成功和仅控制成功的数量，检查它们对应的任务类型。环境未就绪或没有有效评分的样本必须有统一处理口径，不能各给一个有利分母。

如果新策略只解决了控制组不会的另一类问题，可能更适合条件路由或补充工具；如果它连原本稳定完成的任务也频繁破坏，就应检查验证策略与修改范围。这样的结论比“更大模型更聪明”更能转化成下次实验。当前记录尚未建立这些分层原因，只支持保留控制组。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/gemma-4-developer-agent)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/docs/refresh31b-results-20261120.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/)
- [当前与历史版本说明](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/README.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-05)列出了本文的结果口径、记录日期与可核对范围。
