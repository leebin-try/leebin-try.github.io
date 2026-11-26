---
title: "OTTO：排序模型再强，也找不回没召回的商品"
description: "候选池决定排序的可达上限。GPU 版本得分更高却耗时更长，质量收益与加速收益需要分别衡量。"
date: "2026-11-26"
category: "Kaggle"
tags: ["时序与推荐", "OTTO", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 6, "topic": "时序与推荐", "status": "已出分", "result": "Public / private weighted Recall@20 0.57455 / 0.57352", "evidenceDate": "2026-11-17", "source": "https://leebin-try.github.io/kaggle/sources/#case-06", "competitionUrl": "https://www.kaggle.com/competitions/otto-recommender-system", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/docs/gpu-results.md", "submission": "58449500"}
---

推荐系统的一条直觉在这场比赛里很具体：**如果目标商品根本没进入候选池，后面的排序器就没有机会选中它。** 因此，分析排序分数之前，先看候选召回覆盖多少目标。

## 两阶段方法：共现召回，再分别排序

方案建立三类 CUDA 共现图，从会话中产生候选商品，再为 clicks、carts、orders 训练各自的 XGBoost 模型。三个目标的行为强度和频率不同，使用同一个排序器会掩盖这种差异。

时间验证把历史图、排序训练与验证标签的时间边界分开。最终图可以按允许的规则使用已观测测试前缀，但不能读取未来行为或赛后标签。候选池来自哪里，应该和模型训练集一样可追溯。

## 上限诊断比继续堆特征更有指向性

| 目标 | 已选验证 Recall@20 | 既定候选池的可达上限 |
| --- | ---: | ---: |
| clicks | 0.50245 | 0.58882 |
| carts | 0.40088 | 0.47583 |
| orders | 0.61469 | 0.65881 |

右列按该指标的截断与聚合方式计算，是候选覆盖所允许的上限，不是已达到的模型分数。它能帮助区分“候选没找全”和“找到了却排不好”两类问题。两者的改进手段不同。

## 证据：更高分，未必更快

官方 Public weighted Recall@20 从 0.48866 到 **0.57455**，Private 从 0.49036 到 **0.57352**。但整体流水线从约 25.11 分钟增加到 **39.11 分钟**，因为新版做了更多建图与建模工作。

实际分配是两张 T4，即使请求或历史版本标签里写过 L4，也不能据此把结果称为 L4 测量。两个 GPU 执行独立任务，不是把一个树模型拆成分布式训练。

## 观点与下一步

这次支持“更丰富的管线带来了更好的实际比赛结果”，不支持“整个系统被 GPU 加速了若干倍”。局部算子的加速比，也不能移植成端到端收益。

下一步应先增加或改变召回来源，尤其检查 carts 的候选覆盖，再在固定候选池上比较排序特征。向量召回、更多共现邻域都只是待验证选项。先把瓶颈定位到具体阶段，才知道新增计算花在了哪里。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/otto-recommender-system)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/docs/gpu-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-06)列出了本文的结果口径、记录日期与可核对范围。
