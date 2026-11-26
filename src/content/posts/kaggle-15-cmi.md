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
coverImage: "/kaggle/15/cover.svg"
coverAlt: "序数等级零到三与有序阈值决策"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

**核心判断：总体 QWK 有表现，不代表每个严重程度都被识别。CMI 官方为 0.438／0.391，但冻结 audit（独立检查集） 的七个最高等级参与者全部漏判；下一轮应把少数类失败纳入选型依据。**

## 问题定位：回归连续严重度，再做四级决策

标签 0—3 有序，误差跨越两个等级通常比相邻等级更严重。首轮把问题建成连续回归，再通过三个递增阈值转成整数类别。这既利用了顺序，也引入一个假设：连续输出有足够好的排序与尺度，能够被一组全局阈值合理切分。

QWK 可概括为 `1 - 加权观测分歧 / 加权期望分歧`，常见权重随等级距离的平方增长。它受预测类别分布影响，不等于 RMSE 的简单变换。回归误差更低的检查点，未必在阈值后得到更高 QWK。

开发参与者与独立 audit 分开，ID 和由目标生成的 PCIAT 字段被剔除。活动记录没有进入这一轮，因此目前的质量缺口不能被直接解释成“活动特征没有用”，也不能假设加上它就一定追上强方案。

## 技术思路与路线

**路线概览：**排除 ID 与目标衍生字段 → 参与者级五折序数回归 → 开发 OOF（折外预测） 选择模型及三个有序阈值 → 冻结后检查独立 audit → 以 108 轮全量拟合 XGBoost。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/15/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · CMI"><img src="/kaggle/15/method.svg" alt="原创流程与验证边界示意。序数等级零到三与有序阈值决策；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · CMI</strong> 原创流程与验证边界示意。序数等级零到三与有序阈值决策；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/15/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-15-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

### 方法：连续预测，再学习有序阈值

首轮使用 58 个表格输入及缺失计数，对比 CatBoost 与 XGBoost 序数回归器，排除 ID 和 PCIAT 衍生字段。先在开发参与者上生成五折 OOF，再选择混合权重和三个有序阈值，冻结后看独立的 548 人 audit。

最终选 XGBoost，CatBoost 权重为零。固定阈值 0.55／1.10／1.45，使用开发选择出的 108 轮在全部 2,736 个有标签参与者上重训。方案没有加入活动记录、伪标签或外部预训练权重。

### 实现展开：三个阈值是一个联合的决策部件

阈值不是逐行单独选择，而是在开发 OOF 预测上联合比较，保持有序；拟合后的阈值与模型权重在看 audit 前冻结。当前最终权重只保留 XGBoost，阈值为 0.55、1.10、1.45，它们是这份模型输出尺度下的比赛决策边界，不是通用严重度划分。

```python
score = ordinal_regressor(features)
label = count(score >= boundary for boundary in frozen_thresholds)
```

检查点在各折按停止 RMSE 选择，阈值又在这些 OOF 输出上调优，因此开发指标包含选择。全量重训继承 108 轮，没有新独立停止集；只读它的训练损失，无法得到验证 QWK。

对稀有等级，采样、损失权重或阈值都可能改变混淆矩阵。判断这些改变时，应先明确希望减少哪一类错误，以及准备在哪一组未用于选择的参与者上确认，而不是直接针对七个 audit 样本把阈值推到能猜中的位置。

## 评价方式

QWK 衡量有序类别预测相对随机一致性的改善，等级差得越远通常惩罚越大，越高越好。它依赖类别分布，并非 RMSE 的单调变换；连续回归更准，也不保证阈值后的 QWK 更高。

本轮检查点按停止 RMSE 选择，混合与阈值按开发 OOF QWK 选择，548 人 audit 在冻结后观察，最终由官方评分确认。三个阶段承担不同职责。少数类还必须保留支持数、精度和召回；当前七例的零召回是实际观察，不能当作稳定总体估计。

## 结果与证据

### 三种指标，不承担同一个职责

检查点按停止 RMSE 选择，阈值与权重按开发 OOF QWK 选择，最终质量由官方 QWK 报告。开发 QWK 约 0.4685，冻结 audit 约 0.4280；官方为 **0.438 Public / 0.391 Private**。

RMSE 的最佳模型前缀不一定是 QWK 最佳前缀。训练损失继续下降，也不能证明再加树会提高最终 QWK。这个差别适合用真实曲线复查，而不是用“模型已经收敛”一句话跳过去。

### 平均分掩盖了什么

类别 3 在全部标签里只有 34 人，audit 中有 7 人，**7 人都没有判对**。这既是明显的观察弱点，也伴随很大的小样本不确定性，不能据此宣称已经测出了稳定的该类召回率。

阈值校准比同一 audit 上的固定阈值参考更好，但这不代表罕见类别得到解决。audit 观察后没有再修改当前候选，避免把它变成另一个调优集。

### 两张真实图共同说明什么

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/15/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · CMI"><img src="/kaggle/15/learning.svg" alt="XGBoost fold 1 的日志采样点。右侧固定阈值 QWK 不等于最终校准 QWK，108 轮按 RMSE 选择。" width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · CMI</strong> XGBoost fold 1 的日志采样点。右侧固定阈值 QWK 不等于最终校准 QWK，108 轮按 RMSE 选择。<br /><a href="/kaggle/15/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/15/learning.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-15-learning">图表出处与口径</a></figcaption>
</figure>

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/15/confusion.svg" target="_blank" rel="noopener" aria-label="放大：实测图 2 · CMI"><img src="/kaggle/15/confusion.svg" alt="冻结 audit 的真实混淆矩阵，纵轴真值、横轴预测；类别 3 共 7 人，正确数为 0。只有聚合数量，无参与者记录。" width="540" height="360" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 2 · CMI</strong> 冻结 audit 的真实混淆矩阵，纵轴真值、横轴预测；类别 3 共 7 人，正确数为 0。只有聚合数量，无参与者记录。<br /><a href="/kaggle/15/confusion.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/15/confusion.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-15-confusion">图表出处与口径</a></figcaption>
</figure>

第一张图来自 XGBoost fold 1：RMSE 的最佳前缀是 108 轮，之后固定阈值 QWK 仍可能上升或波动。注意图中 QWK 使用固定阈值，不是已校准开发 QWK，更不是官方分数；把它们混在一起会制造不存在的“模型持续提高”。

第二张图是冻结 audit 的真实混淆矩阵。类别 3 的七个人分别落入类别 1 与 2，没有一人被判为 3；同时，其他真实类别中还出现了两个预测 3。问题并不只是“把所有高等级阈值再降低一点”那么简单，阈值变化会同时改变误报和漏报。

这提示下一轮至少保留分等级支持数、连续分数分布与新确认。若要改为 QWK 更一致的检查点规则，就把它作为与旧 RMSE 规则的固定协议对照，另外付出选择成本。当前 audit 可以提出失败假设，但已经被观察过，不适合继续被称为全新的确认集。

## 思考与结论

**结论：**当前基线完成了评分交付，尚未达到强质量目标。技术瓶颈既可能在排序与表示，也可能在停止规则和阈值；仅对七个已看过的样本降低阈值，无法建立可信改进。

### 观点与下一次实验

序数任务应该同时保留混淆矩阵、各类支持数、阈值来源与连续预测误差。只看一个总体 Kappa，会误把“中间两类分得更好”理解成“所有严重程度都被识别”。

下一步可检验指标更一致的检查点选择、罕见类别验证稳定性，以及官方活动数据是否提供新的信息。但这些是新实验，不应回到同一个 audit 反复选择。当前官方分数距离历史 public 参考 0.497 仍有差距；这场基线完成了交付，没有完成强质量目标。

## 下一步

以下是按优先级排列的后续实验设计，尚未执行；通过条件与比较口径应在运行前固定。

1. 在开发折内预先比较 RMSE 选点与目标更一致的选点规则，并保持阈值搜索预算相同，识别检查点规则的作用。
2. 逐等级报告混淆矩阵、支持数和连续输出分布；若比较采样或损失权重，只改一项并另留参与者确认。
3. 再检验活动记录是否提供新的信息，严格按参与者聚合与切分；不能把新增数据类型本身视为预期涨分。

### 进一步辨析：预测出少数类，不等于识别了少数类

audit 中模型确实输出了两次类别 3，但它们都来自真实类别 2；七个真实类别 3 又全部落在较低等级。因此，当前这个小样本切面里，类别 3 的召回和精度都为零。这里讨论的是已观察计数，不是稳定的总体估计。

降低最高阈值，可能让一些真实 3 被找回，也会把更多其他类推成 3。只针对这七个人调整边界，就把 audit 变成了训练信号；即使分数上升，也失去了新的确认含义。

下一轮应在开发折内预先声明少数类诊断与指标选择规则，再用另外的参与者确认。必要时比较不同采样或目标一致的停止规则，但每种规则都承担额外选择成本。把混淆矩阵画出来的意义，就是让平均 Kappa 以外的代价不能被忽略。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/child-mind-institute-problematic-internet-use)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-15)列出了本文的结果口径、记录日期与可核对范围。
