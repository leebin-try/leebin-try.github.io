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
---

编程智能体的输出很容易让人产生“这次明显聪明了”的印象：补丁更完整、解释更像工程师，或者恰好修好两个熟悉任务。但真正值得问的是：**它是否在相同任务、相同预算下，稳定超过已评分控制组？**

## 已建立的结果与不能归因的变化

当前保留的官方成绩是 **0.13**，来自 31B QAT 候选；早期 12B 方案的官方成绩为 0.06。31B 的开发探针实际使用四张 L4，12B 早期使用双 T4。模型、硬件和候选设置并未只改变一个变量，所以不能把这两个数字的差异单独归因于参数量。

31B 在两个复用的开发任务上曾解决 1 个。这是运行诊断，而不是“成功率约 50%”的泛化估计，更不能替代官方 0.13。

## 一次应该留下来的否决

后续刷新候选完成了更大的 24 任务确认。相同已评分控制组解决 **6 个**，新候选解决 **4 个**，另有一项环境错误记录。候选没有通过提升门槛，没有继续正式提交，保留原官方成绩。

这项结果的价值，在于阻止了把开发小样本上的感觉当成升级证据。另一次 patch-first 六任务筛选，两组都没有解决任务，也没有把“提示词已经更新”写成“能力已经提升”。

## 观点：对智能体，过程质量与结果质量要同时记录

在隐蔽测试驱动的代码任务里，一个看起来合理的补丁可能漏掉兼容性、边界输入或交付要求。日志应该帮助解释错误，但最终判断仍然依赖真实评测结果。环境错误也必须单独记录，不能悄悄删除不利样本或直接算成模型失败。

这并不意味着 24 个任务足以完成稳定估计。它只是比两个熟悉样本提供更多约束；任务覆盖、预算分配和环境稳定性仍值得继续扩大验证。

## 下一次怎样试才更有信息量

固定模型与硬件，先只改变一种工具策略或上下文管理方式；使用相同任务做配对比较，单列环境错误，保留补丁与测试产物。只有预先定义的确认门槛通过，再考虑新的官方提交。

我的取舍是：宁可保留一个解释清楚的 0.13，也不因为新模型或新提示词的叙事更好听，就把未经确认的版本称为进步。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/gemma-4-developer-agent)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/docs/refresh31b-results-20261120.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/)
- [当前与历史版本说明](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/README.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-05)列出了本文的结果口径、记录日期与可核对范围。
