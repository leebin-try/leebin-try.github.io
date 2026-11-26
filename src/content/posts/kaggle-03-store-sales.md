---
title: "Store Sales：时间序列里，特征的可用时间比特征数量更重要"
description: "递归 LightGBM 的收益值得保留，但更应保留日历滞后、未来信息边界以及回测与线上排序不一致的事实。"
date: "2026-11-26"
category: "Kaggle"
tags: ["时序与推荐", "Store Sales", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 3, "topic": "时序与推荐", "status": "已出分", "result": "Public RMSLE 0.38420", "evidenceDate": "2026-11-18", "source": "https://leebin-try.github.io/kaggle/sources/#case-03", "competitionUrl": "https://www.kaggle.com/competitions/store-sales-time-series-forecasting", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/docs/final-report.md", "submission": "58331119"}
---

销量预测最容易被忽略的问题不是“有没有足够多的滞后”，而是：**在真正发出预测的那一天，这个数值是否已经能够知道？** 一旦这条边界错了，复杂特征只会把错误隐藏得更好。

## 方法：拆分产品族，递归推进未来

最终方案为每个产品族建立 LightGBM，跨门店共享训练样本，使用销量滞后、日历、门店、促销和当地节假日等特征。销量经过 `log1p` 与拟合窗口内的缩放处理，依次预测未来 16 个日历日；进入第二天时，前一天的新历史是预测值，不是未来真实销量。

分别保留 7、56、365、730 日滞后窗口的版本，再对最终销量做固定等权算术平均。这里的窗口差异也伴随着部分有效拟合历史差异，不能把它当成严格隔离了“窗口长度”这一因素的消融。

## 两个细节决定回测是否可信

第一，缺失的圣诞节记录不能让“上一天”变成“上一条存在的记录”。日历对齐与行号对齐会给出不同滞后。第二，未来促销等已提供信息可以使用，尚未产生的交易量与销量必须安全延迟。把这两种未来变量混在一起处理，会误判泄漏。

回测采用完整 16 天的预测块，预处理也只能读取每个预测原点之前的历史。这两个开发区间被重复用于比较，不能称为从未碰过的确认集。

## 证据：开发集最优，并不等于已提交最优

可复现方案的官方 RMSLE 从 0.42323 降到 **0.38420**，相对降低约 **9.22%**。这是误差指标的变化，不是准确率百分点，更不是库存成本下降的测量。

开发集均值最好的另一个跨模型融合没有单独提交，因此不能把它叫作官方最佳方案。账号还存在一个更好的历史成绩 0.38131，但原始来源没有找回；它应作为历史记录保留，不能归入当前可复现代码的成果。

## 观点：先解释预测问题，再讨论模型优劣

产品族拆分、缩放、递归方式和融合同时改变了，单个官方提升无法告诉我们究竟是谁贡献最多。更有价值的下一步是固定回测原点，对这些部件逐项消融，并增加新的时间确认窗口。

这组实验也提醒我保留简单参考。GPU ridge 速度很快却明显更弱，某些 CatBoost 配置更慢也没有清晰优势。模型的价值要连同预测跨度、信息可用性和完整成本一起判断。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/store-sales-time-series-forecasting)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/docs/final-report.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-03)列出了本文的结果口径、记录日期与可核对范围。
