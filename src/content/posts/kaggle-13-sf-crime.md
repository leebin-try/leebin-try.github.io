---
title: "SF Crime：目标编码最重要的部分，是阻止答案绕回来"
description: "地址与时间有价值，标签统计也有价值，但每条统计必须排除当前验证边界。一个可审计的增益比技巧名称更重要。"
date: "2026-11-26"
category: "Kaggle"
tags: ["表格学习", "San Francisco Crime Classification", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 13, "topic": "表格学习", "status": "已出分", "result": "Public / private log loss 2.20261 / 2.20261", "evidenceDate": "2026-11-24", "source": "https://leebin-try.github.io/kaggle/sources/#case-13", "competitionUrl": "https://www.kaggle.com/competitions/sf-crime", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/docs/results.md", "submission": "58814002"}
---

犯罪类别预测里，同一地址、地区和时间段有相近分布。把这些分布编码成特征很自然，也很危险：**一旦当前样本或同一保留周的答案进入统计，模型学到的就不再只是规律。**

## 方法：把地址表示与标签统计分开管

实验同时比较地址感知 CatBoost、基础 XGBoost 与加入目标统计的 XGBoost。选择数据按完整 Monday-week 分成拟合、停止、调优与独立审计区间，目标统计还使用五个内部周分组折。

预处理与标签统计只能在相应拟合集里学习，当前保留周不能通过另一张聚合表把标签带回来。整周分组减少相关样本穿透边界，但这不是自动建立了严格未来时间外推；目前仍是一组固定的分组切分。

## 哪些收益有同配置对照

| 观察 | 内部调优 log loss |
| --- | ---: |
| 基础 XGBoost | 2.300585 |
| 加目标特征的 XGBoost | 2.293129 |
| 地址感知 CatBoost | 2.224720 |
| 冻结的 80%／20% 混合 | 2.218815 |

目标特征相对同分组基础 XGBoost 降低约 **0.007456**，这是当前配置下相对清楚的特征对照。CatBoost 仍是最强单模型；不能因为最终混合含有 XGBoost，就忽略主模型已经覆盖了大量类别信号。

## 官方评分与因果解释各自到哪里

最终 80% CatBoost、20% 目标特征 XGBoost 在全部标签上重训，官方 Public / Private log loss 都为 **2.20261**。完整主流程约 74 分钟，覆盖 884,262 个测试 ID 和 39 类概率。

混合的调优收益和按周 bootstrap 都重复使用了选混合的数据，仍是诊断。冻结以后另看 audit，损失为 2.21344，优于拟合类先验参考 2.68081；这也不把一次切分变成了多次独立重复。

## 我的观点：把“防泄漏”做成可以回放的计算

只写一句“使用了 OOF 编码”不够。应能回答哪几周贡献了统计、当前样本是否被排除、低频地址怎样回退、最终全量重训时怎样生成测试特征。再从保存的预测与统计重算结果，才能让审计摆脱对训练代码的信任。

下一次可以在固定周协议下检验新的地址层级或时间边界，而不是先铺开更大的调参网格。官方 2.20261 达到了最初参考，但离 2.20 仍差 0.00261；记录没有必要把“很接近”写成“已达到”。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/sf-crime)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-13)列出了本文的结果口径、记录日期与可核对范围。
