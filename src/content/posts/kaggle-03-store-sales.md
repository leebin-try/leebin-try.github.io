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
coverImage: "/kaggle/03/cover.svg"
coverAlt: "历史日历与预测原点后的多窗口销量轨迹示意"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

销量预测最容易被忽略的问题不是“有没有足够多的滞后”，而是：**在真正发出预测的那一天，这个数值是否已经能够知道？** 一旦这条边界错了，复杂特征只会把错误隐藏得更好。

## 问题定义：16 天预测，不是 16 次事后的一步预测

比赛包含 54 家门店与 33 个产品族，共 1,782 条系列。最终目标是一次性给出未来 16 天的销量。训练日志里看见“预测下一天”，容易把它误读成每天都能接收昨天真实销量的滚动系统；官方提交却不能中途拿到这 16 天的真实值。

RMSLE 评价 `log1p` 空间的误差。预测大销量系列时，绝对差几十不一定比小销量系列差几件更坏；零附近的行为也会影响结果。因此，销量变换、非负约束和近期不活跃的处理都属于目标定义，而不是可以在评分后任意替换的格式层。

完整回测必须从同一个预测原点往前推进 16 天，并将预处理、归一化、历史统计都限制在该原点以前。用真实未来销量填第 2 天以后的滞后，会把递归误差传播从验证里抹掉，得到另一个更容易的问题。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/03/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Store Sales"><img src="/kaggle/03/method.svg" alt="原创流程与验证边界示意。历史日历与预测原点后的多窗口销量轨迹示意；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Store Sales</strong> 原创流程与验证边界示意。历史日历与预测原点后的多窗口销量轨迹示意；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/03/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-03-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 方法：拆分产品族，递归推进未来

最终方案为每个产品族建立 LightGBM，跨门店共享训练样本，使用销量滞后、日历、门店、促销和当地节假日等特征。销量经过 `log1p` 与拟合窗口内的缩放处理，依次预测未来 16 个日历日；进入第二天时，前一天的新历史是预测值，不是未来真实销量。

分别保留 7、56、365、730 日滞后窗口的版本，再对最终销量做固定等权算术平均。这里的窗口差异也伴随着部分有效拟合历史差异，不能把它当成严格隔离了“窗口长度”这一因素的消融。

## 实现展开：递归误差会怎样进入下一天

以下是说明机制的合成例子。假设某门店实际销量连续为 10、10、10，模型第一天预测 12。如果第二天使用滞后 1，那么它接收的是 12，而不是 10；第二天的新误差又可能影响第三天。单步预测的误差分布，因而不足以推断 16 天累计表现。

```python
history = data_available_at_origin.copy()
for day in future_calendar_days:
    features = build_lags_by_calendar_date(history, day)
    forecast = predict_nonnegative_sales(features)
    history = append_predictions(history, day, forecast)
```

其中 `by_calendar_date` 很重要。缺失某个节日的历史记录时，不能简单取前一条行记录来代表前一天。促销计划可以属于已知未来协变量，未来交易量却不是；“未来字段一律删掉”与“有完整表就全部可用”都过于粗糙。

产品族拆分让每个模型在同族门店间共享统计，四种历史窗口则引入不同的近期／长期记忆。最终是销量空间的算术平均，不是日志空间平均。后者会产生不同的回变换偏差，不能把两种融合仅当成实现细节互换。

## 两个细节决定回测是否可信

第一，缺失的圣诞节记录不能让“上一天”变成“上一条存在的记录”。日历对齐与行号对齐会给出不同滞后。第二，未来促销等已提供信息可以使用，尚未产生的交易量与销量必须安全延迟。把这两种未来变量混在一起处理，会误判泄漏。

回测采用完整 16 天的预测块，预处理也只能读取每个预测原点之前的历史。这两个开发区间被重复用于比较，不能称为从未碰过的确认集。

## 证据：开发集最优，并不等于已提交最优

可复现方案的官方 RMSLE 从 0.42323 降到 **0.38420**，相对降低约 **9.22%**。这是误差指标的变化，不是准确率百分点，更不是库存成本下降的测量。

开发集均值最好的另一个跨模型融合没有单独提交，因此不能把它叫作官方最佳方案。账号还存在一个更好的历史成绩 0.38131，但原始来源没有找回；它应作为历史记录保留，不能归入当前可复现代码的成果。

## 官方对照图能支持什么，不能支持什么


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/03/scored-candidates.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Store Sales"><img src="/kaggle/03/scored-candidates.svg" alt="五个有官方评分回执的整体预测包，RMSLE 越低越好。多个部件同时变化，不能从柱子直接分解因果贡献。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Store Sales</strong> 五个有官方评分回执的整体预测包，RMSLE 越低越好。多个部件同时变化，不能从柱子直接分解因果贡献。<br /><a href="/kaggle/03/scored-candidates.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/03/scored-candidates.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-03-scored-candidates">图表出处与口径</a></figcaption>
</figure>


五个已评分配置说明，最终族模型窗口融合在这次官方评价中更好；它没有隔离“分族”“缩放”“历史长度”“递归方式”的单独作用。这些变量同时变化时，即便总收益很大，仍可能存在一个没起作用、甚至拖后腿的部件。

更扎实的下一步是固定两个预测原点，用相同拟合历史比较：全局模型与按族模型、固定窗口与多窗口平均、算术平均与日志平均。每一对都必须覆盖同一批门店、产品和日期，不能因某种方法需要更长预热期就默默删掉困难行。

还应沿预测步长检查误差：第 1—4 天改善而第 13—16 天变差，可能提示递归漂移；只在高销量族改善，可能提示缩放或共享结构的作用。把一个总 RMSLE 拆成这些可解释切面，比继续增加窗口数量更能指导后续决策。

## 观点：先解释预测问题，再讨论模型优劣

产品族拆分、缩放、递归方式和融合同时改变了，单个官方提升无法告诉我们究竟是谁贡献最多。更有价值的下一步是固定回测原点，对这些部件逐项消融，并增加新的时间确认窗口。

这组实验也提醒我保留简单参考。GPU ridge 速度很快却明显更弱，某些 CatBoost 配置更慢也没有清晰优势。模型的价值要连同预测跨度、信息可用性和完整成本一起判断。

## 进一步辨析：窗口长度与有效训练历史相互缠绕

730 日滞后要求更长预热，短历史系列会留下更少可用样本；当前各窗口的拟合历史也并非完全相同。因此，长窗口胜过短窗口时，可能同时包含记忆长度、训练样本和缩放范围的影响。

一个更可解释的消融，应先固定共同可用的日期交集和预测原点，再仅改变可见滞后；另外单列“允许每种窗口使用自己的最大历史”的工程版本。前者便于识别机制，后者更接近实际资源使用，两者都值得记录，但不能互相冒充。

确认表还可以按未来第 1—4、5—8、9—12、13—16 天分段。若长窗口只改善短期，而远期递归误差增大，下一步应研究误差传播或直接多步模型，而不是继续把更长滞后当成唯一方向。所有这些比较都应先固定评估总体，避免窗口预热悄悄删掉困难系列。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/store-sales-time-series-forecasting)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/docs/final-report.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-03)列出了本文的结果口径、记录日期与可核对范围。
