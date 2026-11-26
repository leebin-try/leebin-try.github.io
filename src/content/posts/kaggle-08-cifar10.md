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
coverImage: "/kaggle/08/cover.svg"
coverAlt: "小图像网格经过 ConvNeXt 分层表示得到十类输出"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

这场实验让我更在意一条常被忽略的规则：**训练了几个模型，与最终应该保留几个模型，是两回事。** 并行训练可以增加比较机会，却没有要求我们把所有候选都装进最终推断。

## 问题定义：小图像分类，还有一个大测试集

标签覆盖十类图像，训练数据为 50,000 张，官方测试交付包含 300,000 张图像，其中有不参与评分的干扰样本。无论哪些行最后计分，模型都必须按官方 ID 完整生成标签；交付覆盖不能由模型或人工猜测来缩减。

输入调整到 96 像素，是适配预训练视觉表示的一项设计，而不是增加图像信息。把原图放大，会改变网络里的空间尺度和计算量，却不会创造新的细节。它是否值得，应连同迁移效果和完整预测成本一起验证。

此次采用普通分层 45,000／5,000 切分，适合建立分类基线，但没有为新的采集域或图像来源差异设计额外留出。达到高比赛 accuracy，不等于已经解决任意自然图像的十分类迁移。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/08/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · CIFAR-10"><img src="/kaggle/08/method.svg" alt="原创流程与验证边界示意。小图像网格经过 ConvNeXt 分层表示得到十类输出；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · CIFAR-10</strong> 原创流程与验证边界示意。小图像网格经过 ConvNeXt 分层表示得到十类输出；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/08/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-08-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 方法：用成熟表示，建立可以交付的分类器

方案使用 ImageNet 初始化的 ConvNeXt-Tiny，把输入调整到 96 像素，配合 AdamW、余弦学习率、分类头预热、MixUp、RandAugment、标签平滑、混合精度和 EMA。两个种子在两张 T4 上独立训练。

这些是一个整体配方。没有相应逐项消融，就不能根据最终高分认定其中每个技巧都带来了独立收益，也不能将其称作新的算法。

## 实现展开：为什么训练损失与验证损失不必相等

ConvNeXt 提供预训练特征，分类头先预热，随后按既定优化配方更新。训练增强、MixUp、标签平滑和 EMA 都会改变参数学习或评估状态。它们共同组成当前方案，不能只因单个技巧常见就假设其贡献已被证实。

以一个合成二分类例子说明：两张不同类别图片按 0.5／0.5 混合，目标也是软标签。即便预测恰好等于软目标，交叉熵也不会降到硬标签可达到的零。因此，“训练损失高于干净验证损失”不一定是计算错误，更不能在没对齐损失定义前诊断欠拟合。

EMA 的状态也应与原始模型状态区别保存。检查点被选择后，要确认最终推断实际读取的是声明的参数版本；只保存最后一轮的默认 `state_dict`，可能与验证时选中的 EMA 模型不同。当前独立产物校验的价值，在于把选择、保存与重放连接起来。

全量重训则从相同 ImageNet 初始化重新开始，采用所选轮次覆盖全部标签。它不继承一条新的验证曲线，也不能把原 5,000 张选择数据上的分数继续当作重训模型的独立验证。

## 一次应该尊重的“不融合”

45,000／5,000 的分层切分用于选训练轮次和候选。种子 42、2026 的最佳验证 accuracy 分别为 0.98440、0.98500；二者概率平均为 0.98440。平均没有比最佳单模型高出预设的 0.001 门槛，所以最终选了种子 2026。

两组完整模型仍按各自选出的轮次，从 ImageNet 初始化重新拟合全部 50,000 张训练图像。最终官方 Public / Private accuracy 都是 **0.98170**。整个准备、选型、重训及 300,000 张测试图像预测的主流程约 **62 分钟**，不是十二小时上限那么久。

## 为什么内部验证还要保留边界

同一组 5,000 张图像反复承担轮次和候选选择，存在选择偏差。最佳轮次为 27 和 25，不代表训练充分性已经得到证明；训练时带增强的损失也不应直接与评估损失逐点比较。

测试集合含有干扰图片，仍须完整预测所有官方 ID。试图识别原始 CIFAR 测试答案或跳过看起来不评分的样本，都会破坏这个实验的合法输入与交付边界。

## 从两条真实曲线读出候选选择的限制


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/08/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · CIFAR-10"><img src="/kaggle/08/learning.svg" alt="v5 两个种子的真实验证历史，每轮一个点，虚线分别标记第 27／25 轮；该停止集同时承担候选选择。" width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · CIFAR-10</strong> v5 两个种子的真实验证历史，每轮一个点，虚线分别标记第 27／25 轮；该停止集同时承担候选选择。<br /><a href="/kaggle/08/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/08/learning.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-08-learning">图表出处与口径</a></figcaption>
</figure>


两种子的验证曲线都在前期明显改善，后期出现小幅波动；最优点分别是 27 与 25 轮。后期微小差异既可能来自模型，也可能来自同一验证集上的随机波动。仅比较峰值，没有给出新的独立确认。

这正是为什么需要预先规定融合门槛。平均两个概率分布增加计算，却没有在当前选择集上超过最佳单模型。这个拒绝决定针对当前两个模型，不是对一切集成的否定；换成误差更不同的编码器、分辨率或训练分布，仍需另做同协议对照。

更好的下一步不是继续挑一个随机种子直到碰到峰值，而是检查错误是否集中在相似类别、背景或图像质量条件，必要时建立新的确认集。然后再决定新增计算该用于不同表示、概率校准，还是更稳健的样本覆盖。

## 可以迁移的取舍

融合需要为新增推断、存储和维护成本提供理由。对于下一场分类任务，我会先固定好验证与候选收益门槛，再决定是增加随机种子、换一种表示，还是保留一个已经足够好的单模型。

这次的单模型选择是当前切分与配方下的结果，不是“集成无用”的一般结论。最有价值的复盘，是把拒绝复杂度的理由也一起留下。

## 进一步辨析：0.0006 在当前验证里只隔着三张图

5,000 张选择图像上，0.98500 与 0.98440 相差三次正确预测；预设 0.001 的融合门槛相当于净增五张。这是对当前 accuracy 样本数的直接换算，不适用于 MCC 或 log loss，也不包含选择造成的不确定性。

这解释了为什么不应围绕同一个验证集继续试大量种子，直到碰到一个漂亮峰值。更好的实验是先保存两种模型的分歧样本，再按无标签可定义的质量、背景或类别条件归组，最后在新确认数据上检验差异是否重现。原始竞赛图片不在本站重新分发。

若业务目标后来变为概率或代价决策，当前 accuracy 门槛也需要重新设计。两个模型同样分类正确时，概率校准可能仍然不同；但那将是另一个有独立选择成本的实验，不能在看到官方分数以后直接改写这次预先声明的标准。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/cifar-10)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/)
- [模型与训练配方](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/README.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-08)列出了本文的结果口径、记录日期与可核对范围。
