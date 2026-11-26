---
title: "Severstal：分割的阈值，不只是最后一行代码"
description: "前景稀疏时，存在性判断与像素分割相互影响。校准的数据边界、原始几何和真实格式接收都需要证据。"
date: "2026-11-26"
category: "Kaggle"
tags: ["图像分割", "Severstal: Steel Defect Detection", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 10, "topic": "图像分割", "status": "已出分", "result": "Public / private Dice 0.88698 / 0.88027", "evidenceDate": "2026-11-20", "source": "https://leebin-try.github.io/kaggle/sources/#case-10", "competitionUrl": "https://www.kaggle.com/competitions/severstal-steel-defect-detection", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-results.md", "submission": "58619644"}
coverImage: "/kaggle/10/cover.svg"
coverAlt: "钢带上四类缺陷的原创示意，突出像素掩码与存在性任务"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

工业缺陷分割常有大量空白区域。模型不仅要回答“轮廓在哪里”，还要回答“这一类缺陷是否存在”。**阈值和小区域过滤会参与这两个判断，应该被当成需要校准的模型部件。**

## 问题定义：空掩码会怎样抬高平均指标

每张钢带图有四类缺陷掩码，很多图像／类别组合没有前景。重叠指标通常把预测和真值都为空的组合视为完全一致，于是一个偏好输出空白的模型也可能拥有很高的平均分。

用一个合成例子说明：若某类在一百张图里只出现在五张上，全空模型在其余九十五张上的空白判断都正确。这个高均值并不说明它学会了那五张图中的任何缺陷。真实比赛还要遵循具体的跨图、跨类别聚合口径，不能把例子的百分比直接套成官方分数。

所以当前实验不仅比较平均 Dice，还保留正样本 Dice、空白特异度、各类支持数和非空预测数量。这些诊断共同回答“有没有找到缺陷”，与“多数空白有没有保持空白”分开。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/10/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Severstal"><img src="/kaggle/10/method.svg" alt="原创流程与验证边界示意。钢带上四类缺陷的原创示意，突出像素掩码与存在性任务；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Severstal</strong> 原创流程与验证边界示意。钢带上四类缺陷的原创示意，突出像素掩码与存在性任务；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/10/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-10-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 方法：分割与存在性共同学习

基线采用 ImageNet 初始化的 ResNet34 U-Net，输出四类缺陷掩码，并增加辅助的存在性分支。训练裁剪保持原始高度与像素尺度，逐步使用更宽的裁剪；验证回到完整 256×1600 图像。

存在性标签必须跟着裁剪变化。原图含有缺陷，不代表任意裁剪都含该缺陷。如果直接把整图标签贴给每个裁剪，辅助任务会得到错误监督。

## 实现展开：裁剪后重算存在性，校准后再看独立图像

训练使用宽度渐进的裁剪，验证回到完整原始宽度。这减少了训练显存需求，也带来了分布变化：局部裁剪里的前景比例与完整图不同，最终阈值不一定能直接从训练损失推出来。

存在性监督必须由裁剪后的掩码计算，而非继承原图标签：

```python
image_crop, mask_crop = paired_crop(image, mask)
presence_target = mask_crop.any(axis=(height_axis, width_axis))
loss = mask_loss(mask_logits, mask_crop) + auxiliary_presence_loss(...)
```

如果缺陷恰好落在被裁掉的区域，局部输入就应该是负例。增强也必须成对作用到图像与掩码；标签边界不能用平滑图像插值造成新的中间类别。

阈值与区域过滤随后参与存在性和形状决策。当前从一个模型的停止折统计拟合后处理，再看另一个模型的独立折诊断；最终双模型全量重训的平均概率却有不同分布。因此，校准迁移是一个需要继续确认的假设，不能用单模型诊断替整个最终集成背书。

## 校准为什么要独立说清楚

两个种子在同一拟合集训练并用 fold 0 选择检查点；后处理从种子 0 的 fold-0 统计中拟合，在种子 1 的独立 fold-1 图像上看诊断。fold-1 标签没有进入模型训练和轮次选择。

最终两个模型重训全部标签后取概率平均，没有使用 TTA。但单模型上拟合的阈值，移到集成概率后未必保持相同意义。这是一项明确的基线限制，不能把单模型诊断称作最终集成的完整 OOF 验证。

## 证据：分数与格式，都有自己的边界

官方得到 **0.88698 Public / 0.88027 Private Dice**，与历史 private 第十名参考 0.90619 仍有距离。这次晚提交没有产生历史排名。

输入样例格式与旧评估说明还存在不一致。最终采用四类缺陷行的明确评估格式，真实 COMPLETE 评分才为这一提交提供接收证据。不能只因一个近期 Notebook 这样写，就认定它一定会被官方接受。

## 真实曲线揭示了平均分以外的进展


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/10/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Severstal"><img src="/kaggle/10/learning.svg" alt="worker 0 的真实训练记录与每两轮验证点。CSV 同时保留裁剪宽度和各类正样本 Dice；缺失轮次没有补值。" width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Severstal</strong> worker 0 的真实训练记录与每两轮验证点。CSV 同时保留裁剪宽度和各类正样本 Dice；缺失轮次没有补值。<br /><a href="/kaggle/10/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/10/learning.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-10-learning">图表出处与口径</a></figcaption>
</figure>


worker 0 的首次验证记录在第 2 轮：平均 Dice 约 0.86167，始终输出空白的参考就有约 0.85660。此时前两类的正样本 Dice 都是零。这个观察针对早期停止折，不能推断最终重训模型也完全不会这两类；但它足够说明，前几轮的高均值不能作为前景已学好的证据。

图表同时保留训练损失与平均 Dice／全空参考，配套 CSV 进一步列出每类正样本 Dice。验证只每两轮记录一次，图中没有替缺失轮次补值。裁剪宽度也保留在 CSV 中，提醒读者不要把跨训练阶段的损失变化全部解释为优化进展。

下一次可固定编码器与采样，先检验前景采样比例和最终集成概率的校准，再比较是否真的改善低频缺陷。仍需更强的近重复或钢卷层级隔离；精确哈希分组解决的是同一文件重复，不是所有物理来源相关性。

## 可迁移的判断

对于空白很多的分割任务，应分别看类别存在性、像素轮廓与后处理误杀，而不是只调一个平均 Dice。精确重复图像分组也不能自动替代钢卷或近重复分组；当前实验没有证明这些更强的隔离。

后续更值得做的是：固定模型，重新检验集成概率的校准转移，并审查不同缺陷、空白图和小连通区域的错误。先定位失败机制，再考虑是否需要更大编码器。

## 进一步辨析：校准是一项分布转移问题

在单模型停止折上选择阈值，再用两个全量重训模型的平均概率推断，包含模型状态与概率分布的变化。平均可能降低方差，却也改变过阈值的区域数量；这正是不能直接把旧校准效果等同于最终集成效果的原因。

下一轮可在严格不进入拟合和停止的图像上，先生成两个模型的联合预测，再一次性选择集成后处理，并保留另外的确认组。对比只改变校准对象，编码器、损失、采样和数据划分保持不变。这个设计尚未执行，不能用来解释当前官方提升。

判断接受与否，也不能只看均值：同时看正样本 Dice、空白误报和小区域被过滤的比例。若平均上升却某个少数缺陷几乎不再输出，就明确报告代价。只有将这些子指标一起保留，才知道后处理是在去噪，还是在利用空白比例获得表面高分。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/severstal-steel-defect-detection)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/)
- [分组、裁剪与校准协议](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-campaign.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-10)列出了本文的结果口径、记录日期与可核对范围。
