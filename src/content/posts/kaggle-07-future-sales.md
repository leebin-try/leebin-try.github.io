---
title: "Predict Future Sales：没有卖出，也是一条需要被建模的记录"
description: "从交易流水到预测样本，补齐零需求会改变问题本身。销量特征必须沿时间方向生成。"
date: "2026-11-26"
category: "Kaggle"
tags: ["时序与推荐", "Predict Future Sales", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 7, "topic": "时序与推荐", "status": "已出分", "result": "Public / private RMSE 0.87709 / 0.88182", "evidenceDate": "2026-11-18", "source": "https://leebin-try.github.io/kaggle/sources/#case-07", "competitionUrl": "https://www.kaggle.com/competitions/competitive-data-science-predict-future-sales", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/docs/results.md", "submission": "58475342"}
---

交易表天然只记录发生过的销售。如果直接拿这些行训练，模型看到的是“已经卖出的商品会卖多少”，而测试要求回答的往往是“这些店铺与商品组合，下个月是否会卖、会卖多少”。**样本构造已经在替你选择问题。**

## 从流水补成月度需求网格

这组实现按每个月活跃店铺与商品的组合建立网格，把没有交易的组合补成零需求，再接上官方测试配对。它不是对整个历史所有商品无限做笛卡尔积；活跃范围与每个月可观察的信息仍然要明确。

模型使用 LightGBM，输入包含月度销量滞后、店铺／商品／类别的层级统计、月份与安全的历史价格等。标签与最终输出按比赛要求裁到 0—20。重复店铺映射、退货与极端值处理，都是样本定义的一部分。

## 最容易偷看的，是“首次出现”

某个商品将来第一次售出的月份，看似只是一个年龄特征，却可能把未来信息带回过去。滞后值必须严格来自更早月份；在某个预测时点尚未出现的商品，不能因为完整表里知道它后来会出现，就给它额外信息。

同理，零销量不一定等于真实缺乏需求，可能与停售、供给或观察范围有关。比赛里的补零策略有效，也不能直接被解释成真实业务中的需求识别。

## 证据与确认

月份 32 用于选模型，月份 33 用于另外的确认。该确认期 RMSE 为 **0.87444**；同期间上月值参考约 1.13582，滞后均值参考约 1.02094。最终官方 Public / Private RMSE 为 **0.87709 / 0.88182**。

最终模型在全部可用训练行上使用固定 612 轮拟合，输出覆盖 214,200 个测试 ID。内部月份与官方分区不是同一群样本，分数接近也不能当作统计等价。

## 我的取舍：先审样本，再审模型

这类问题值得先问三件事：哪些组合应该存在；零值代表什么；每个统计在当时是否已知。否则，换一个更强的回归器，只会更擅长拟合错误的样本分布。

下一次更有价值的检验，是分别观察新品、长期不活跃品与不同店铺的误差，并滚动到更多月份确认。最终分数提供了完成证据，不能证明一次月份确认就覆盖了全部季节与经营变化。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/competitive-data-science-predict-future-sales)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-07)列出了本文的结果口径、记录日期与可核对范围。
