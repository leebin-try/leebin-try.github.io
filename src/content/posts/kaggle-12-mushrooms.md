---
title: "毒蘑菇分类：接近满分时，微小差异更需要克制"
description: "单模型与融合在 Public、Private 上互有胜负。MCC 阈值、独立审计与不确定性，比多报几位小数更重要。"
date: "2026-11-26"
category: "Kaggle"
tags: ["表格学习", "Binary Prediction of Poisonous Mushrooms", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 12, "topic": "表格学习", "status": "已出分", "result": "Public / private MCC 0.98497 / 0.98472（单模型）", "evidenceDate": "2026-11-21", "source": "https://leebin-try.github.io/kaggle/sources/#case-12", "competitionUrl": "https://www.kaggle.com/competitions/playground-series-s4e8", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/docs/results.md", "submission": "58646630"}
coverImage: "/kaggle/12/cover.svg"
coverAlt: "蘑菇轮廓与类别表示决策树，非赛题照片"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

当分数已经接近 0.985，多加几位小数很容易制造“确定地进步了”的错觉。我的判断是：**差距越小，越应该同时交代选择方式、独立检查与不确定性。**

## 问题定义：概率不是最终决策，accuracy 也不是 MCC

此题输出可食用／有毒类别，以 MCC 评价。MCC 同时涉及 TP、TN、FP、FN，不能仅凭正负样本比例或总正确数解释。连续概率经过阈值后，才形成参与评分的混淆矩阵；同一个概率模型换阈值，就可能得到不同 MCC。

因此，训练、停止、阈值与最终判断需要分别安排数据。当前 70／10／10／10 划分提供了明确角色：拟合参数、选择轮次、选择混合和阈值、最后检查冻结结果。它降低了不同选择相互渗透的风险，但一次固定切分仍然可能有偶然性。

输入表示是另一个实质变量。把数值按连续值处理，允许树利用大小关系；全部转成类别，则要求模型从离散取值学习另一种关系。哪一种更好取决于数据生成方式，不能由“CatBoost 擅长类别”这一句概括替代实验。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/12/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · 毒蘑菇分类"><img src="/kaggle/12/method.svg" alt="原创流程与验证边界示意。蘑菇轮廓与类别表示决策树，非赛题照片；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · 毒蘑菇分类</strong> 原创流程与验证边界示意。蘑菇轮廓与类别表示决策树，非赛题照片；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/12/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-12-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 方法：比较表示，而不是默认所有列都同一种处理

这组实验对照原始类别与稀有类别合并的 XGBoost，以及混合特征表示与全类别表示的 CatBoost。数据划成 70／10／10／10 的 fit、stop、tune、audit：轮次选择、融合阈值选择和最后的独立审计分开。

最终候选包括原始类别 XGBoost 单模型，以及 75% XGBoost、25% CatBoost 的混合。选出的混合阈值为 0.551；单模型使用 0.5。MCC 是硬判定后的相关性指标，阈值会改变它，不是概率训练结束后可忽略的细节。

## 实现展开：先隔离表示，再隔离阈值

第一组 XGBoost 对照只改变稀有类别合并，第二组 CatBoost 对照检查混合表示与全类别表示。这样的设计试图回答局部问题，而不是一次把清洗、深度、学习率和融合都换掉后宣称某个部件有用。

低频类别的合并规则必须由拟合数据学习。验证或测试里未见取值需要明确的回退路径；如果为了“保证编码完整”先在全表统计频次，规则本身就受到拟合边界以外的数据分布影响。

```text
fit：模型、类别规则
stop：轮次
 tune：概率权重、阈值
 audit：冻结后只评估，不回调
```

最终阈值 0.551 属于混合候选，不能无条件移给单模型。两种模型的概率尺度和相关性不同，混合后的相同数值不必有同样的决策含义。所有调优都在 tune 完成，audit 反馈不会用于再次挑一个更好看的阈值。

## 真实结果没有给出一个无条件赢家

| 候选 | 官方 Public MCC | 官方 Private MCC |
| --- | ---: | ---: |
| 单模型 | 0.98497 | 0.98472 |
| 混合 | 0.98494 | 0.98473 |

混合在 public 少 0.00003，在 private 多 0.00001。独立审计上的混合与单模型差异也很小，配对 bootstrap 区间跨过零。这些记录不足以建立“融合稳定更好”的结论。

较弱的全类别 CatBoost 没有进入融合。把数值列全转为类别，或合并稀有值，并没有在这组固定配置下建立强收益；不能因为这些技巧看起来合理，就预设它们有效。

## 微小差异应怎样被展示和检验


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/12/audit-ablation.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · 毒蘑菇分类"><img src="/kaggle/12/audit-ablation.svg" alt="固定 audit 上四种特征表示的 MCC。零起点避免夸大微小差异，精确数字与数据文件一并保留。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · 毒蘑菇分类</strong> 固定 audit 上四种特征表示的 MCC。零起点避免夸大微小差异，精确数字与数据文件一并保留。<br /><a href="/kaggle/12/audit-ablation.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/12/audit-ablation.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-12-audit-ablation">图表出处与口径</a></figcaption>
</figure>


下图使用零起点纵轴，避免把万分之一级差距画成巨大跃升，同时直接保留数字与下载数据。这里最清楚的现象是全类别 CatBoost 在这组设置下更弱；其他接近的候选不能仅凭柱子高低建立稳定优劣。

最终混合减单模型的配对 audit 区间约为 −0.0001403 到 0.0001383，跨过零。这不是证明二者完全等价，而是当前样本和重采样协议没有把差异确定下来。iid bootstrap 还依赖行级独立性近似；若存在未识别的来源分组，区间未必涵盖那种变化。

下一次应固定阈值选择预算，增加独立确认或检验表示变化能否在不同分区重现。反复在同一个 audit 上试更多模型，通常只会让最优小数越来越好看，同时降低它作为独立证据的价值。

## 观点：复杂度要拿出证据，而不是拿出小数位

如果新增模型只改变十万分之一级别的指标，还应考虑推断成本、实现风险、阈值敏感性和再次验证的费用。相反，既不能因小差异断言提升，也不能因一次无显著增益，就断言这类模型永远无用。

这组结果也没有严格达到原定 public 0.98500，更没有达到历史 public 参考 0.98528。四舍五入写成“约 0.985”可以帮助阅读，但判断目标是否完成时仍须看完整数字。

下一次更有信息量的尝试，是保持样本划分与模型配置不变，独立检验新的特征来源或阈值稳定性，而不是拿同一个 audit 继续挑一个看起来更好的小数。

## 进一步辨析：不能把 MCC 差值直接换成正确样本数

accuracy 的差值在固定总体上可以换算净正确数，MCC 却不是。它同时受四格混淆计数和分布影响，所以 0.00003 的差距不能乘测试行数就称为“多猜对了几人”。公开／私有分区的标签和精确计分总体也没有在这里完整公开。

这同样影响目标判断。严格阈值 0.98500 尚未达到，是对预设目标的诚实记录；它不意味着我们已经证明 0.98497 与 0.98500 在统计意义上可区分。目标达成和估计不确定性应并列，而不是用其中一个覆盖另一个。

下一次可以先限制表示与阈值的候选数量，使用新的确认分区比较已选版本，再检查不同缺失模式和稀有取值的错误。如果新增复杂度只带来当前区间内的小数摆动，就把资源留给更有差异的信息来源，而不是继续增加融合成员。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/playground-series-s4e8)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-12)列出了本文的结果口径、记录日期与可核对范围。
