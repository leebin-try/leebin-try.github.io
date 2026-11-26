---
title: "CMI：平均 Kappa 看起来不错，最稀有的一类却可能完全没学会"
description: "序数回归与阈值校准能建立基线，但训练停止损失、比赛指标和罕见类别的表现是三个独立问题。"
date: "2026-11-26"
category: "Kaggle"
tags: ["表格学习", "Child Mind Institute — Problematic Internet Use", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 15, "topic": "表格学习", "status": "已出分", "result": "Public / private QWK 0.438 / 0.391", "evidenceDate": "2026-11-25", "source": "https://leebin-try.github.io/kaggle/sources/#case-15", "competitionUrl": "https://www.kaggle.com/competitions/child-mind-institute-problematic-internet-use", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/docs/results.md", "submission": "58872372"}
---

序数标签 0—3 不只是四个无关类别，错误距离也重要。但我更想保留一个不够好看的现象：**平均指标有所表现时，最高风险的罕见类别仍可能一个都没判对。**

## 方法：连续预测，再学习有序阈值

首轮使用 58 个表格输入及缺失计数，对比 CatBoost 与 XGBoost 序数回归器，排除 ID 和 PCIAT 衍生字段。先在开发参与者上生成五折 OOF，再选择混合权重和三个有序阈值，冻结后看独立的 548 人 audit。

最终选 XGBoost，CatBoost 权重为零。固定阈值 0.55／1.10／1.45，使用开发选择出的 108 轮在全部 2,736 个有标签参与者上重训。方案没有加入活动记录、伪标签或外部预训练权重。

## 三种指标，不承担同一个职责

检查点按停止 RMSE 选择，阈值与权重按开发 OOF QWK 选择，最终质量由官方 QWK 报告。开发 QWK 约 0.4685，冻结 audit 约 0.4280；官方为 **0.438 Public / 0.391 Private**。

RMSE 的最佳模型前缀不一定是 QWK 最佳前缀。训练损失继续下降，也不能证明再加树会提高最终 QWK。这个差别适合用真实曲线复查，而不是用“模型已经收敛”一句话跳过去。

## 平均分掩盖了什么

类别 3 在全部标签里只有 34 人，audit 中有 7 人，**7 人都没有判对**。这既是明显的观察弱点，也伴随很大的小样本不确定性，不能据此宣称已经测出了稳定的该类召回率。

阈值校准比同一 audit 上的固定阈值参考更好，但这不代表罕见类别得到解决。audit 观察后没有再修改当前候选，避免把它变成另一个调优集。

## 观点与下一次实验

序数任务应该同时保留混淆矩阵、各类支持数、阈值来源与连续预测误差。只看一个总体 Kappa，会误把“中间两类分得更好”理解成“所有严重程度都被识别”。

下一步可检验指标更一致的检查点选择、罕见类别验证稳定性，以及官方活动数据是否提供新的信息。但这些是新实验，不应回到同一个 audit 反复选择。当前官方分数距离历史 public 参考 0.497 仍有差距；这场基线完成了交付，没有完成强质量目标。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/child-mind-institute-problematic-internet-use)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-15)列出了本文的结果口径、记录日期与可核对范围。
