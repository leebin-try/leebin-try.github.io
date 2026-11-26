---
title: "Aerial Cactus：AUC 已经到顶，损失为什么还在下降"
description: "一个小 CNN 足以取得高分，但停止 AUC 的平台期并不等于概率已校准，也不代表地理泛化已经验证。"
date: "2026-11-26"
category: "Kaggle"
tags: ["图像分类", "Aerial Cactus Identification", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 14, "topic": "图像分类", "status": "已出分", "result": "Public / private ROC AUC 0.9999 / 0.9999", "evidenceDate": "2026-11-24", "source": "https://leebin-try.github.io/kaggle/sources/#case-14", "competitionUrl": "https://www.kaggle.com/competitions/aerial-cactus-identification", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/docs/results.md", "submission": "58805153"}
---

这组实验提供了一个非常直观的分歧：**排序指标不再变化时，概率质量仍可能继续变化。** 因此，看到 AUC 平台，不能直接宣告整个学习过程都已收敛。

## 方法：先给小模型一次公平机会

实验比较小 CNN 与小残差 CNN，使用固定 fit、stop、audit 分区。停止集负责选检查点和有限的平均比较；独立 audit 在选择冻结后评估。最终保留小 CNN，因为等权平均没有改善停止 AUC。

这里没有在全部标签上再训一个模型；最终评分使用已选模型。将这场与其他有全量重训的比赛混为一谈，会误报训练流程。

## 指标分歧在曲线上怎样出现

小 CNN 最佳停止 AUC 在第 27 轮达到 1.0，但停止 BCE 仍继续下降：所选轮约 0.00185，第 37 轮降到约 0.000476。排序已经正确，并不要求概率距离 0／1 已经相同。

模型按预设 AUC 规则停止是可以解释的选择，却不意味着“训练损失不降了”或“概率校准已经最佳”。训练时有增强，评估时没有，二者损失也不处于完全相同的测量条件。

## 结果，以及高分未覆盖的问题

官方 Public / Private ROC AUC 均为 **0.9999**。整个双 T4 主流程约 **83 秒**；独立 audit AUC 接近 1，是另外一组内部诊断。达到最初 >=0.999 目标，仍没有达到显示为 1.0000 的更高参考。

精确与 D4 变换重复检查减少了明显重复样本带来的乐观，但没有证明不同地理区域独立，也没有建立真实应用中的跨地点迁移能力。高分描述的是比赛分区上的排序表现。

## 观点：停止规则应服务于真正关心的结果

如果目标只关心排序，AUC 选点有其理由；如果后续要按概率制定代价决策，还应该看 log loss、校准和阈值下的代价。这不是在同一停止集上不断换指标挑最好，而是实验开始前就确定评价目标。

下一步我会优先检验新的地理或采集分组，以及概率是否稳定，而不是仅因网络更大就再训练一个。小问题上的简单成功，最有价值的部分往往是帮我们辨认尚未被考验的边界。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/aerial-cactus-identification)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-14)列出了本文的结果口径、记录日期与可核对范围。
