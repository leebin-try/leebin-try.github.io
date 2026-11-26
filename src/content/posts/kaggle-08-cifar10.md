---
title: "CIFAR-10：两个种子都训练了，不代表必须把它们平均"
description: "迁移学习建立高分基线以后，候选选择比继续增加模型更值得解释。融合也应通过预先设定的收益门槛。"
date: "2026-11-26"
category: "Kaggle"
tags: ["图像分类", "CIFAR-10", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 8, "topic": "图像分类", "status": "已出分", "result": "Public / private accuracy 0.98170 / 0.98170", "evidenceDate": "2026-11-23", "source": "https://leebin-try.github.io/kaggle/sources/#case-08", "competitionUrl": "https://www.kaggle.com/competitions/cifar-10", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/docs/results.md", "submission": "58730945"}
---

这场实验让我更在意一条常被忽略的规则：**训练了几个模型，与最终应该保留几个模型，是两回事。** 并行训练可以增加比较机会，却没有要求我们把所有候选都装进最终推断。

## 方法：用成熟表示，建立可以交付的分类器

方案使用 ImageNet 初始化的 ConvNeXt-Tiny，把输入调整到 96 像素，配合 AdamW、余弦学习率、分类头预热、MixUp、RandAugment、标签平滑、混合精度和 EMA。两个种子在两张 T4 上独立训练。

这些是一个整体配方。没有相应逐项消融，就不能根据最终高分认定其中每个技巧都带来了独立收益，也不能将其称作新的算法。

## 一次应该尊重的“不融合”

45,000／5,000 的分层切分用于选训练轮次和候选。种子 42、2026 的最佳验证 accuracy 分别为 0.98440、0.98500；二者概率平均为 0.98440。平均没有比最佳单模型高出预设的 0.001 门槛，所以最终选了种子 2026。

两组完整模型仍按各自选出的轮次，从 ImageNet 初始化重新拟合全部 50,000 张训练图像。最终官方 Public / Private accuracy 都是 **0.98170**。整个准备、选型、重训及 300,000 张测试图像预测的主流程约 **62 分钟**，不是十二小时上限那么久。

## 为什么内部验证还要保留边界

同一组 5,000 张图像反复承担轮次和候选选择，存在选择偏差。最佳轮次为 27 和 25，不代表训练充分性已经得到证明；训练时带增强的损失也不应直接与评估损失逐点比较。

测试集合含有干扰图片，仍须完整预测所有官方 ID。试图识别原始 CIFAR 测试答案或跳过看起来不评分的样本，都会破坏这个实验的合法输入与交付边界。

## 可以迁移的取舍

融合需要为新增推断、存储和维护成本提供理由。对于下一场分类任务，我会先固定好验证与候选收益门槛，再决定是增加随机种子、换一种表示，还是保留一个已经足够好的单模型。

这次的单模型选择是当前切分与配方下的结果，不是“集成无用”的一般结论。最有价值的复盘，是把拒绝复杂度的理由也一起留下。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/cifar-10)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/)
- [模型与训练配方](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/README.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-08)列出了本文的结果口径、记录日期与可核对范围。
