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
---

工业缺陷分割常有大量空白区域。模型不仅要回答“轮廓在哪里”，还要回答“这一类缺陷是否存在”。**阈值和小区域过滤会参与这两个判断，应该被当成需要校准的模型部件。**

## 方法：分割与存在性共同学习

基线采用 ImageNet 初始化的 ResNet34 U-Net，输出四类缺陷掩码，并增加辅助的存在性分支。训练裁剪保持原始高度与像素尺度，逐步使用更宽的裁剪；验证回到完整 256×1600 图像。

存在性标签必须跟着裁剪变化。原图含有缺陷，不代表任意裁剪都含该缺陷。如果直接把整图标签贴给每个裁剪，辅助任务会得到错误监督。

## 校准为什么要独立说清楚

两个种子在同一拟合集训练并用 fold 0 选择检查点；后处理从种子 0 的 fold-0 统计中拟合，在种子 1 的独立 fold-1 图像上看诊断。fold-1 标签没有进入模型训练和轮次选择。

最终两个模型重训全部标签后取概率平均，没有使用 TTA。但单模型上拟合的阈值，移到集成概率后未必保持相同意义。这是一项明确的基线限制，不能把单模型诊断称作最终集成的完整 OOF 验证。

## 证据：分数与格式，都有自己的边界

官方得到 **0.88698 Public / 0.88027 Private Dice**，与历史 private 第十名参考 0.90619 仍有距离。这次晚提交没有产生历史排名。

输入样例格式与旧评估说明还存在不一致。最终采用四类缺陷行的明确评估格式，真实 COMPLETE 评分才为这一提交提供接收证据。不能只因一个近期 Notebook 这样写，就认定它一定会被官方接受。

## 可迁移的判断

对于空白很多的分割任务，应分别看类别存在性、像素轮廓与后处理误杀，而不是只调一个平均 Dice。精确重复图像分组也不能自动替代钢卷或近重复分组；当前实验没有证明这些更强的隔离。

后续更值得做的是：固定模型，重新检验集成概率的校准转移，并审查不同缺陷、空白图和小连通区域的错误。先定位失败机制，再考虑是否需要更大编码器。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/severstal-steel-defect-detection)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/)
- [分组、裁剪与校准协议](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-campaign.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-10)列出了本文的结果口径、记录日期与可核对范围。
