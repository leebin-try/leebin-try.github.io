---
title: "GI Tract：切片不是独立样本，医学分割先守住病人边界"
description: "2.5D 输入让邻近切片提供上下文，也让样本关联更强。内部像素 Dice 与官方三维复合指标必须分别报告。"
date: "2026-11-26"
category: "Kaggle"
tags: ["图像分割", "UW-Madison GI Tract Image Segmentation", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 11, "topic": "图像分割", "status": "已出分", "result": "Public / private Dice3DHausdorff 0.87024 / 0.85837", "evidenceDate": "2026-11-23", "source": "https://leebin-try.github.io/kaggle/sources/#case-11", "competitionUrl": "https://www.kaggle.com/competitions/uw-madison-gi-tract-image-segmentation", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/docs/results.md", "submission": "58731174"}
coverImage: "/kaggle/11/cover.svg"
coverAlt: "三张合成 MRI 邻片与三器官预测，非真实病例影像"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。MRI 采用合成几何，不包含病例影像。"
---

**核心判断：GI 分割当前最明确的缺口是训练长度证据。两个种子都在三轮上限结束，验证还在改善；官方 private 从 0.84902 到 0.85837，但这不足以说明训练充分或编码器单独造成提升。**

## 问题定位：二维输入，三维结构，病人级泛化

同一病人包含多个天次与连续切片。把每张切片当独立样本，会让训练和验证共享解剖结构、采集条件甚至相邻图像。模型看似能识别新切片，却可能只是在熟悉病人的局部变化上工作。

2.5D 方案是一个折中：二维卷积仍然处理三通道输入，但每个通道是一张邻近 MRI 切片，不是自然图像的 RGB。它提供有限轴向上下文，又不承担完整三维网络的激活开销。这个折中是否最优，当前记录没有与同预算完整三维模型做过对照。

目标为中间切片的三个器官掩码。标签映射、邻片索引、切片缺失或序列边界处理，都必须保持一致；否则模型的三个输入通道可能来自错误的空间位置，训练仍能运行，任务含义却已经改变。

## 技术思路与路线

**路线概览：**病人级分组 → 相邻 −2／0／+2 切片组成 2.5D 输入 → EfficientNet-B4 U-Net → 恢复原生概率和器官掩码 → 固定轮次全量重训 → 官方复合指标评分。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/11/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · GI Tract"><img src="/kaggle/11/method.svg" alt="原创流程与验证边界示意。三张合成 MRI 邻片与三器官预测，非真实病例影像；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · GI Tract</strong> 原创流程与验证边界示意。三张合成 MRI 邻片与三器官预测，非真实病例影像；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/11/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/zh/kaggle/sources/#fig-11-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

### 方法：让二维模型看到一点三维上下文

这组实现用偏移 -2、0、+2 的三张 MRI 切片组成 2.5D 输入，预测中间切片的大肠、小肠和胃。所有天次按病人留在同一验证组。原始 16 位强度在缩放前处理，输出概率再恢复到原始几何。

早期编码器为 ResNet34，后续保留的候选使用 EfficientNet-B4。邻片信息可以帮助识别结构，但它也进一步说明，切片间并非独立采样，验证边界不能只停留在文件名不同。

### 实现展开：几何链路与模型同样重要

原始 16 位图像先处理强度，再按模型输入尺寸缩放；掩码使用保留离散标签的变换。输出在阈值前恢复到原始高度和宽度，随后才形成最终二值掩码与 RLE。把已经阈值化的小图再放大，会得到不同的边界，尤其影响细长结构。

```text
病人／天／切片索引
    → 取邻片 −2、0、+2 → 一致的强度与尺寸处理
    → 二维编码器／解码器 → 原生尺寸概率
    → 器官阈值／存在性处理 → 掩码编码
```

每一步都需要一个小的几何重放检查：非方形图像、空器官、序列边缘、恰好接触边界的掩码。单独通过模型张量尺寸测试，不保证空间坐标与提交编码方向正确。本文封面的三张“切片”是原创几何示意，未使用任何病例图像。

选择指标也有边界。当前内部诊断是原生像素 Dice，官方则为 Dice3DHausdorff。前者可以帮助选择检查点，却没有完整测量后者关心的三维边界行为。把两种指标放在同一条曲线上比较，会让数值变化失去明确对象。

## 评价方式

同一患者的天次与相邻切片必须留在同一组，否则模型会在验证时见到高度相关的人体结构。内部原生像素 Dice 用于观察分割重叠，越高越好；官方 Dice3DHausdorff 还包含三维边界评价，两者不能数值互换。

选择曲线要逐器官保留，并标出三轮预算上限。全量训练没有独立验证，不能从其训练损失推断官方质量。可见的 96 行预览仅检查几何和接口，隐藏测试表现仍以官方评分回执为准。

## 结果与证据

### 官方指标与内部指标不画等号

内部选择使用原生分辨率的像素 Dice；官方 Dice3DHausdorff 同时考虑重叠与三维边界质量。内部 Dice 上升，是候选比较的诊断，不能直接换算成官方复合指标涨多少。

| 候选 | 官方 Public | 官方 Private |
| --- | ---: | ---: |
| ResNet34 父版本 | 0.86209 | 0.84902 |
| EfficientNet-B4 新版本 | 0.87024 | 0.85837 |

官方 private 增加 **0.00935**，因此保留新候选。但整个候选包含实现与数值处理的变化，不应只凭一组新旧提交，就把收益全部归因于编码器名称。

### 训练跑完，不等于已经收敛

两个种子都只完成三轮选择，最佳点也都在第三轮，验证仍在改善。即便十二小时上限允许更长运行，实际主流程约四小时八分钟，也不能因此说训练“充分”。轮次数、时间上限与收敛证据是三件事。

随后全部 38,496 张有标签切片的重训没有独立验证曲线。96 行可见预览只验证了几何和输出接口；真正 hidden-test 质量来自官方评分回执，不能把预览文件的哈希写成隐藏预测文件的哈希。

### 三个观察点，应怎样影响下一份实验计划

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/11/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · GI Tract"><img src="/kaggle/11/learning.svg" alt="v10 两个 worker 各三轮患者留出历史。像素 Dice 不是官方 Dice3DHausdorff；三个点不足以证明收敛。" width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · GI Tract</strong> v10 两个 worker 各三轮患者留出历史。像素 Dice 不是官方 Dice3DHausdorff；三个点不足以证明收敛。<br /><a href="/kaggle/11/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/11/learning.csv" download>下载聚合指标 CSV</a> · <a href="/zh/kaggle/sources/#fig-11-learning">图表出处与口径</a></figcaption>
</figure>

真实曲线只有三轮。两个 worker 的最佳点都在第三轮，内部验证仍在改善；这支持“需要继续验证训练长度”的判断，不支持“已经收敛，也不支持更长训练必定更好”。延长之后仍可能过拟合，尤其患者留出集已经被反复观察。

更值得补齐的是器官级、病人级与空切片诊断。整体平均可能由一种易识别器官拉高，小器官边界与无器官切片的误报却未同步改善。配套数据保留每个器官的原生 Dice，读者可以把它与均值分开看。

要识别 EfficientNet-B4 本身的作用，应固定病人分组、训练预算、输入分辨率、损失、数值策略和后处理，再与 ResNet34 对照。当前官方提升来自完整候选包，不能把参数更多或编码器不同本身当成已确认的唯一原因。

## 思考与结论

**结论：**2.5D 是利用邻片结构的可行路线，当前新候选也取得官方提升；下一步应优先补充患者级训练与停止证据。没有这些证据，继续换编码器仍难定位误差来源。

### 观点：下一次先补证据，再追新架构

更长且有预算准入的训练、按器官与病人查看误差、边界质量诊断，都比简单换一个编码器更能解释剩余问题。这个案例可迁移到视频、遥感序列与设备连续观测：只要样本来自同一个连续实体，就应先讨论实体边界，再讨论模型分数。

## 下一步

以下是按优先级排列的后续实验设计，尚未执行；通过条件与比较口径应在运行前固定。

1. 在相同患者划分、架构和输入下，仅延长选择训练预算，记录是否真正观察到停止耐心，以及最佳点是否仍顶在上限。
2. 同时检查每个器官的原生 Dice、空切片误报与边界诊断，确认总均值改善没有以某器官退化为代价。
3. 在新的患者确认中复查候选；完整几何链与编码保持一致后，再使用官方复合指标判断正式收益。

### 进一步辨析：器官平均会隐藏改善幅度

worker 0 的三轮记录提供了一个具体切面：大肠原生 Dice 约从 0.77365 到 0.79424，小肠从 0.66889 到 0.70956，胃从 0.79617 到 0.83751。它们都改善，但起点与幅度不同；这些数值只针对该 worker 的患者留出诊断，不是三项官方得分。

因此，后续训练长度试验应同时保留每个器官的轨迹和空切片误报，而不是只检查总均值是否继续上涨。如果延长只改善容易器官而伤害更困难的器官，就需要重新讨论选择规则或损失权重。

数据较少时，患者级重复比切片级重复更能检验这种变化，但也更昂贵。可以先预先固定一个额外患者确认协议，再只改变训练长度，检查新结论是否超出了熟悉患者上的偶然性。当前三轮记录能够提出这个问题，却不能提前给出答案。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/uw-madison-gi-tract-image-segmentation)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/)
- [2.5D 输入与原生几何](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/README.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/zh/kaggle/sources/#case-11)列出了本文的结果口径、记录日期与可核对范围。
