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
---

同一个病人的相邻切片相似，同一病人不同天的图像也有关联。随机切片级切分很容易把识别这位病人的能力，当成识别新病人的能力。**医学分割首先要确定独立的验证单位。**

## 方法：让二维模型看到一点三维上下文

这组实现用偏移 -2、0、+2 的三张 MRI 切片组成 2.5D 输入，预测中间切片的大肠、小肠和胃。所有天次按病人留在同一验证组。原始 16 位强度在缩放前处理，输出概率再恢复到原始几何。

早期编码器为 ResNet34，后续保留的候选使用 EfficientNet-B4。邻片信息可以帮助识别结构，但它也进一步说明，切片间并非独立采样，验证边界不能只停留在文件名不同。

## 官方指标与内部指标不画等号

内部选择使用原生分辨率的像素 Dice；官方 Dice3DHausdorff 同时考虑重叠与三维边界质量。内部 Dice 上升，是候选比较的诊断，不能直接换算成官方复合指标涨多少。

| 候选 | 官方 Public | 官方 Private |
| --- | ---: | ---: |
| ResNet34 父版本 | 0.86209 | 0.84902 |
| EfficientNet-B4 新版本 | 0.87024 | 0.85837 |

官方 private 增加 **0.00935**，因此保留新候选。但整个候选包含实现与数值处理的变化，不应只凭一组新旧提交，就把收益全部归因于编码器名称。

## 训练跑完，不等于已经收敛

两个种子都只完成三轮选择，最佳点也都在第三轮，验证仍在改善。即便十二小时上限允许更长运行，实际主流程约四小时八分钟，也不能因此说训练“充分”。轮次数、时间上限与收敛证据是三件事。

随后全部 38,496 张有标签切片的重训没有独立验证曲线。96 行可见预览只验证了几何和输出接口；真正 hidden-test 质量来自官方评分回执，不能把预览文件的哈希写成隐藏预测文件的哈希。

## 观点：下一次先补证据，再追新架构

更长且有预算准入的训练、按器官与病人查看误差、边界质量诊断，都比简单换一个编码器更能解释剩余问题。这个案例可迁移到视频、遥感序列与设备连续观测：只要样本来自同一个连续实体，就应先讨论实体边界，再讨论模型分数。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/uw-madison-gi-tract-image-segmentation)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/)
- [2.5D 输入与原生几何](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/README.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-11)列出了本文的结果口径、记录日期与可核对范围。
