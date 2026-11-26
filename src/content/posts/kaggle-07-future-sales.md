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
coverImage: "/kaggle/07/cover.svg"
coverAlt: "月度店铺商品网格中的零需求与未来月份预测"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

**核心判断：未来销量建模先要补齐预测总体。仅从有交易的流水学习，会漏掉大量零需求；当前月度网格与严格历史特征的 LightGBM 得到官方 RMSE 0.87709／0.88182。**

## 问题定位：正样本流水不能代表预测总体

原始日交易记录只在发生交易时出现，目标却是指定店铺与商品在下一月的裁剪销量。直接对流水聚合后训练，会系统性地少看没有交易的配对。模型学到的条件分布便接近“已有交易条件下卖多少”，而不是官方指定配对上的整体分布。

构造月度活跃店铺与商品网格、补零，再接上官方测试配对，是重新定义样本总体的步骤。它和选择回归损失一样重要。预测输出的 0—20 裁剪来自比赛契约，不能被解释成业务需求天然不会超过 20 件。

还有一个需要明确的部署条件：如果回测宇宙利用了当月完整活跃商品列表，而真实部署在月初不知道这个列表，就要用历史可知的商品宇宙另做确认。当前比赛分数并未单独验证这种实际经营场景。

## 技术思路与路线

**路线概览：**清理交易与店铺映射 → 构造当月活跃店铺—商品网格并补零 → 生成严格历史滞后与层级统计 → 按月选择及确认 LightGBM → 输出裁剪到 0—20 的月销量。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/07/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Predict Future Sales"><img src="/kaggle/07/method.svg" alt="原创流程与验证边界示意。月度店铺商品网格中的零需求与未来月份预测；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Predict Future Sales</strong> 原创流程与验证边界示意。月度店铺商品网格中的零需求与未来月份预测；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/07/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-07-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

### 从流水补成月度需求网格

这组实现按每个月活跃店铺与商品的组合建立网格，把没有交易的组合补成零需求，再接上官方测试配对。它不是对整个历史所有商品无限做笛卡尔积；活跃范围与每个月可观察的信息仍然要明确。

模型使用 LightGBM，输入包含月度销量滞后、店铺／商品／类别的层级统计、月份与安全的历史价格等。标签与最终输出按比赛要求裁到 0—20。重复店铺映射、退货与极端值处理，都是样本定义的一部分。

### 实现展开：聚合键、时间键与缺失含义

月度标签由店铺、商品、月份聚合得到；店铺别名合并、退货保留、价格与销量极端值过滤发生在前面。映射以后需要重新检查测试配对是否重复，否则一次正确的清洗可能意外改变交付行数。

滞后特征可以抽象为一次严格向过去的键连接：

```python
past = aggregate_by_month_shop_item(observed_transactions)
features_for_t = join_on_month_offset(past, offset=-1)
assert all_source_months_are_before_t()
```

不仅销量均值需要这个条件，商品年龄、历史价格、门店类别均值也需要。元数据中固定的类别可以用于编码；由未来售出行为推导的“首次出现月份”则不能提前知道。即便没有直接连接目标列，这类特征仍会跨过可用时间边界。

零值也有多重含义。无交易、没有上架、缺货、缺少观察，可能在比赛表里都表现成同一零行。补零帮助匹配评估总体，却没有识别这些业务机制。迁移到实际补货时，库存与在售状态需要额外数据和新的验证，不应从这张交易表里直接推断。

## 评价方式

RMSE 是平方误差平均后开方，越低越好；较大的预测偏差受到更强惩罚。这里评价的是按比赛要求裁剪后的月销量，不能用它估计未经裁剪的真实需求上限。

月份 32 负责选择，月份 33 作为后续时间确认；同月比较上月值、滞后均值与选中模型。特征必须在每个预测月以前构造，尤其不能用全历史“首次销售月份”提前得知未来。官方 public/private 是不同分区，不是两个升级版本。

### 最容易偷看的，是“首次出现”

某个商品将来第一次售出的月份，看似只是一个年龄特征，却可能把未来信息带回过去。滞后值必须严格来自更早月份；在某个预测时点尚未出现的商品，不能因为完整表里知道它后来会出现，就给它额外信息。

同理，零销量不一定等于真实缺乏需求，可能与停售、供给或观察范围有关。比赛里的补零策略有效，也不能直接被解释成真实业务中的需求识别。

## 结果与证据

### 证据与确认

月份 32 用于选模型，月份 33 用于另外的确认。该确认期 RMSE 为 **0.87444**；同期间上月值参考约 1.13582，滞后均值参考约 1.02094。最终官方 Public / Private RMSE 为 **0.87709 / 0.88182**。

最终模型在全部可用训练行上使用固定 612 轮拟合，输出覆盖 214,200 个测试 ID。内部月份与官方分区不是同一群样本，分数接近也不能当作统计等价。

### 从确认图回到模型失效条件

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/07/month-confirmation.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Predict Future Sales"><img src="/kaggle/07/month-confirmation.svg" alt="月 33 同一确认总体中的参考与模型 RMSE；不是官方测试分区。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Predict Future Sales</strong> 月 33 同一确认总体中的参考与模型 RMSE；不是官方测试分区。<br /><a href="/kaggle/07/month-confirmation.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/07/month-confirmation.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-07-month-confirmation">图表出处与口径</a></figcaption>
</figure>

同一月份的三个参考提供了有用对照：如果只复制上月销量或取历史滞后均值，误差都高于选中的 LightGBM。但这不能指出收益来自哪一组特征，也不能保证下一个月份保持同样比例。

可以优先做四种误差切面：新品与旧品、短期不活跃与持续活跃、不同店铺，以及高频与低频商品。每组保留样本数与相同裁剪口径，再看模型是否只是对主流商品有效。训练总体与测试配对总体不一致时，平均确认 RMSE 还可能掩盖覆盖差异。

下一次如果引入新的层级统计，应固定网格和确认月份，只改变这一类特征；若换成新的补零宇宙，则把它独立作为样本构造实验。把这两件事混在一起，就无法判断分数变化来自更好的估计器，还是来自更容易的评估行。

## 思考与结论

**结论：**这组证据支持先修正样本总体、再使用树模型学习历史结构。比赛中的活跃网格可用性仍是一项部署假设；若真实月初不知道当月活跃商品，就应另做历史可知总体的确认。

### 我的取舍：先审样本，再审模型

这类问题值得先问三件事：哪些组合应该存在；零值代表什么；每个统计在当时是否已知。否则，换一个更强的回归器，只会更擅长拟合错误的样本分布。

下一次更有价值的检验，是分别观察新品、长期不活跃品与不同店铺的误差，并滚动到更多月份确认。最终分数提供了完成证据，不能证明一次月份确认就覆盖了全部季节与经营变化。

## 下一步

以下是按优先级排列的后续实验设计，尚未执行；通过条件与比较口径应在运行前固定。

1. 保持模型和月份不变，比较当前活跃网格与仅用过去可知商品建立的网格，明确总体改变付出的误差代价。
2. 分别报告新商品、零需求和高销量配对的支持数及误差，避免整体 RMSE 隐藏冷启动问题。
3. 增加新的月份回测，再判断是否需要替换模型；同一确认月被反复用于改方案后，就不能继续称为新确认。

### 进一步辨析：裁剪标签不是原始需求

训练和评分目标都限制在 0—20，原始月销量高于 20 的配对在目标空间不再被继续区分。优化这个比赛标签，并不能恢复它究竟卖了 30 件还是 200 件；把最终 RMSE 直接解释成补货需求误差，会改变被度量的问题。

退货与极端值又带来另一层取舍。保留合理退货是对流水真实性的尊重，最终非负裁剪则是评价契约。两者不矛盾，但应明确清洗发生在哪里、月度聚合以前还是以后、哪个数值是特征统计的来源。

更具体的下一次验证，可固定清洗和模型，只替换样本宇宙：当月活跃组合与历史可知组合分别回测同一确认月，再把官方给定配对的覆盖单列。若分数变化主要来自评估行改变，就将它报告为总体构造效应，而不是新回归器变强。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/competitive-data-science-predict-future-sales)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-07)列出了本文的结果口径、记录日期与可核对范围。
