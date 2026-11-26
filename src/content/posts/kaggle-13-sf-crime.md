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
coverImage: "/kaggle/13/cover.svg"
coverAlt: "合成城市地址网格与整周统计，点位不是真实犯罪位置"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

**核心判断：SF Crime 的关键是让地址统计可用，同时不让当前周的答案回流。当前 80% CatBoost／20% XGBoost 的官方 log loss 为 2.20261；平滑统计仍必须在正确的数据边界内拟合。**

## 问题定位：预测 39 类概率，而不是猜一个最常见类别

输入包含时间、区域、地址与坐标等结构信息，输出是每个事件的 39 类概率。log loss 会惩罚给真实类别过低的概率；稀有类即使不常成为 argmax，也不应该在概率向量里被忽略。

时间和地址有不同相关尺度：同一周可能共享时间环境，相同或相近地址可能共享用途与活动模式。把事件逐行随机拆分，会比整周留出更容易接触熟悉局部统计；不过整周随机分组仍不等于严格使用过去预测未来。当前结论应停留在声明的周协议内。

878,049 个标签让复杂聚合有机会工作，但也让全表操作更容易消耗内存。某个看似简单的宽表特征，乘上类别数、候选数和并行副本后，会变成实际执行约束。

## 技术思路与路线

**路线概览：**整周划分数据角色 → 拟合集内建立地址表示及交叉拟合目标统计 → 比较 CatBoost 与 XGBoost → 调优并冻结 80／20 概率混合 → 全量拟合、覆盖 39 类输出。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/13/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · SF Crime"><img src="/kaggle/13/method.svg" alt="原创流程与验证边界示意。合成城市地址网格与整周统计，点位不是真实犯罪位置；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · SF Crime</strong> 原创流程与验证边界示意。合成城市地址网格与整周统计，点位不是真实犯罪位置；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/13/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-13-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

### 方法：把地址表示与标签统计分开管

实验同时比较地址感知 CatBoost、基础 XGBoost 与加入目标统计的 XGBoost。选择数据按完整 Monday-week 分成拟合、停止、调优与独立审计区间，目标统计还使用五个内部周分组折。

预处理与标签统计只能在相应拟合集里学习，当前保留周不能通过另一张聚合表把标签带回来。整周分组减少相关样本穿透边界，但这不是自动建立了严格未来时间外推；目前仍是一组固定的分组切分。

### 实现展开：带平滑的统计，也不能替当前样本透露答案

目标统计可以抽象为某个地址下的类别条件分布。在一个合成表达中，平滑估计可写成 `p(c|a) = (count(a,c) + alpha * prior(c)) / (count(a) + alpha)`。平滑降低低频地址的波动，却不能修复读取验证标签的错误边界。

```text
外部 fit 周
  → 内部周折交叉拟合 → fit 行的目标特征
  → 用全部外部 fit 周重建统计 → stop / tune / audit 行
```

对未见地址，需要有拟合期声明的回退，如更粗地址层级或全局类先验。回退应使所有类别保持合法概率，而不是把稀有类静默变成零。这里的关键不是某一种平滑公式，而是每个计数到底读了哪些周。

CatBoost 自身处理类别结构，与人为目标统计的 XGBoost 是两种不同表示。前者仍是最强单体，后者的价值需要在同协议下单独比较基础 XGBoost。新特征进入弱一些的模型，并不意味着它一定为最终混合提供了同样大小的独立信息。

## 评价方式

39 类 log loss 越低越好：给真实犯罪类别很低概率会受到较强惩罚。它评价整条概率向量，不只看最高概率类别有没有猜中。频数少的类别也需要合理概率，不能直接填零。

外层按完整 Monday-week 分为拟合、停止、调优与 audit（独立检查集）；目标统计还有内部周折，当前验证周不能通过聚合特征回流自己的标签。整周分组减少相关样本穿透，但仍不是严格的过去预测未来。调优上的 bootstrap 是诊断，冻结 audit 和官方评分分别提供其他证据。

## 结果与证据

### 哪些收益有同配置对照

| 观察 | 内部调优 log loss |
| --- | ---: |
| 基础 XGBoost | 2.300585 |
| 加目标特征的 XGBoost | 2.293129 |
| 地址感知 CatBoost | 2.224720 |
| 冻结的 80%／20% 混合 | 2.218815 |

目标特征相对同分组基础 XGBoost 降低约 **0.007456**，这是当前配置下相对清楚的特征对照。CatBoost 仍是最强单模型；不能因为最终混合含有 XGBoost，就忽略主模型已经覆盖了大量类别信号。

### 官方评分与因果解释各自到哪里

最终 80% CatBoost、20% 目标特征 XGBoost 在全部标签上重训，官方 Public / Private log loss 都为 **2.20261**。完整主流程约 74 分钟，覆盖 884,262 个测试 ID 和 39 类概率。

混合的调优收益和按周 bootstrap 都重复使用了选混合的数据，仍是诊断。冻结以后另看 audit，损失为 2.21344，优于拟合类先验参考 2.68081；这也不把一次切分变成了多次独立重复。

### 学习曲线、特征对照和最终混合是三类证据

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/13/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · SF Crime"><img src="/kaggle/13/learning.svg" alt="v6 CatBoost 与目标特征 XGBoost 的训练／停止曲线。仅连接实际记录点，虚线标记 1,625 与 137 轮检查点。" width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · SF Crime</strong> v6 CatBoost 与目标特征 XGBoost 的训练／停止曲线。仅连接实际记录点，虚线标记 1,625 与 137 轮检查点。<br /><a href="/kaggle/13/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/13/learning.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-13-learning">图表出处与口径</a></figcaption>
</figure>

真实曲线中，目标特征 XGBoost 的停止损失在所选 137 轮附近达到低点，训练损失仍继续下降。CatBoost 选择 1,625 轮。两者的轮次不是计算成本的共同单位：模型、每轮工作和数据处理不同，需要单列真实时间。

同设置基础 XGBoost 与目标特征版本的比较，更接近特征消融；80／20 混合的提升则是在调优集选择后得到的组合结果。bootstrap 若仍在这个调优集上完成，只能补充诊断，不能把选择偏差洗掉。

更有解释力的下一步是固定周切分、模型参数和聚合规则，只改变地址层级；再到新时间窗口检查增益。如果低频地址改善、已知地址退步，就要讨论回退策略和分布变化，而不是只看全体均值继续调温度。

## 思考与结论

**结论：**结果支持地址信息和树模型的组合管线；较可信的机制证据来自同设置目标特征对照。整条混合的官方提升不能分摊为各部件独立收益，下一轮应优先检查地址稀疏性和时间变化。

### 我的观点：把“防泄漏”做成可以回放的计算

只写一句“使用了 OOF（折外预测） 编码”不够。应能回答哪几周贡献了统计、当前样本是否被排除、低频地址怎样回退、最终全量重训时怎样生成测试特征。再从保存的预测与统计重算结果，才能让审计摆脱对训练代码的信任。

下一次可以在固定周协议下检验新的地址层级或时间边界，而不是先铺开更大的调参网格。官方 2.20261 达到了最初参考，但离 2.20 仍差 0.00261；记录没有必要把“很接近”写成“已达到”。

## 下一步

以下是按优先级排列的后续实验设计，尚未执行；通过条件与比较口径应在运行前固定。

1. 固定模型、周划分和统计平滑，只改变地址聚合层级，对低频地址和已知地址分别检查损失。
2. 追加严格面向未来的时间窗口，判断当前整周随机分组中的收益能否迁移，退化时优先设计统计回退。
3. 记录目标特征宽表及并行副本的峰值内存，质量相近时避免为很小收益引入不可控的数据处理成本。

### 进一步辨析：大表不是只有原始列占内存

878,049 行、39 类的一个 FP32 概率矩阵，单数组就约 137 MB；这是按形状计算的存储量，不是实测总内存。并行候选、数据框转换、重采样和校准副本还会增加使用量，因此原始 CSV 很小也不代表完整比较便宜。

实现应同时记录训练、预测、特征连接和输出的峰值，避免通过保存过多中间数组让一个本来可训练的方案失去交付空间。某些推断步骤使用远程 CPU，也要如实写清，不能因为训练是 GPU 就称全部计算均在 GPU 上。

下一轮特征试验可以固定候选和周协议，只扩展一个地址层级，按地址频率审查收益。若最稀有地址改善、常见地址退化，就检查平滑和回退，而不是用总体调温度掩盖分布差异。如此才能让算法变化和工程成本保持可解释的对应。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/sf-crime)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-13)列出了本文的结果口径、记录日期与可核对范围。
