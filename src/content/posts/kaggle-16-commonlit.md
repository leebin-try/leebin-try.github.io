---
title: "CommonLit：文本模型的泛化，先问它有没有见过这道题"
description: "按题目留出揭示了措辞评分的弱点。多目标平均、训练轮次与 tokenizer 兼容性，都需要独立证据。"
date: "2026-11-26"
category: "Kaggle"
tags: ["语言模型", "CommonLit", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 16, "topic": "语言模型", "status": "已出分", "result": "Public / private MCRMSE 0.59760 / 0.54871", "evidenceDate": "2026-11-25", "source": "https://leebin-try.github.io/kaggle/sources/#case-16", "competitionUrl": "https://www.kaggle.com/competitions/commonlit-evaluate-student-summaries", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/docs/results.md", "submission": "58876423"}
---

给学生摘要打分时，如果同一原文与题目的其他摘要已经出现在训练里，模型可能学会的是这道题的常见表达。**想讨论新题目泛化，就应把整道题留出去。**

## 方法：让摘要注意原文，只对摘要做池化

模型为 DeBERTa-v3-small，读取受长度约束的题目、原文与学生摘要，只对摘要 token 做均值池化，输出 content 与 wording 两个连续分数。原始词嵌入冻结，其他可训练部分在远程 T4 上拟合。

全部 7,165 行来自四个题目，采用四次整题留出。ID 和标签不进入文本序列。每个题目仍用作该折检查点选择，因此 OOF 不是完全未参与选择的外部测试；四个题目也限制了我们能对新领域作出的推断。

## 平均指标下面，哪个目标更难

全体对齐 OOF 的 MCRMSE 为 **0.577645**，其中 content RMSE 约 0.512731，wording 约 0.642559。某一题的 wording 达到 0.730655，明显更弱。

MCRMSE 先对每个目标的全部 OOF 样本计算 RMSE，再平均两个目标；不能简单平均四折数字来替代。不同题目的样本量不一致时，这个口径差别尤其重要。

## 最佳轮次和损失走势提供了什么

四折选择轮次为 1、5、5、2，全量重训采用向上取整的中位数，即四轮。第 0 折训练损失仍降，content 误差却恶化；wording 又可能朝另一方向变化。两个目标必须分开保留。

另外两折到了六轮上限，尚未完整观察到预设 patience。它们的收敛状态仍未解决；不能仅因主流程约 47 分钟、小于时间上限，就说训练已经充分。

## 工程问题也不能冒充模型结论

最初探针在训练前因新版本加载诊断包含集合而不能 JSON 序列化。修复同时沿用原生 SentencePiece 词表，避免新转换路径产生另一种 tokenization。失败属于运行兼容性，不是“DeBERTa 不适合任务”。

最终官方 **0.59760 Public / 0.54871 Private MCRMSE**，达到初始 public <=0.60 目标，离历史 public 参考 0.44378 仍远。两个官方分区的差异不是一次模型改进。

## 可迁移的观点

文本任务的分组单位可能是题目、作者、文档或客户。先确定它，再选择骨干模型。下一步更值得检验措辞相关特征、上下文截取与学习率策略，并寻找更多独立题目证据，而不是只对总体均值再优化几个小数。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/commonlit-evaluate-student-summaries)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-16)列出了本文的结果口径、记录日期与可核对范围。
