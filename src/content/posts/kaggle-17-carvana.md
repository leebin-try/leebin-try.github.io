---
title: "Carvana：在训练之前，先把全量预测算进预算"
description: "十万张高分辨率图片让推断成为主要约束。这个尚未出分的案例，记录了分组验证、编码核验和可复用检查点的设计。"
date: "2026-11-26"
category: "Kaggle"
tags: ["图像分割", "Carvana Image Masking Challenge", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 17, "topic": "图像分割", "status": "尚未出分", "result": "预检 v1 COMPLETE；正式提交历史为空，尚无官方得分", "evidenceDate": "2026-11-26", "source": "https://leebin-try.github.io/kaggle/sources/#case-17", "competitionUrl": "https://www.kaggle.com/competitions/carvana-image-masking-challenge", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/docs/run.md"}
---

Carvana 与其他分割题有一个很实际的区别：5,088 张训练图片对应 **100,064 张测试图片**。一个模型即使可以训练完成，也可能来不及为所有图片生成合规预测。**预算应该覆盖整条提交链路，而不只覆盖优化器。**

**2026-11-26 补记：** 02:07 UTC 的只读官方查询显示，训练 Notebook 的预检 v1 状态为 COMPLETE，比赛提交历史为空。原始方案记录保留在 11 月 25 日的代码快照；这次状态核对没有建立完整训练或官方评分的完成证据。以下是设计判断与待检验假设，不是已经验证的高分经验；0.995 只是目标。

## 为什么按整辆车分组

每辆车有 16 个固定视角。同车图片散落到拟合与验证两侧，会让验证更像在辨认熟悉车辆。计划将 318 辆有标签车辆分成 254 辆拟合、32 辆检查点／校准、32 辆独立 audit，保持每辆车的全部视角在一起。

拟比较两个 ResNet34 U-Net 种子，采用渐进分辨率、边缘加权 BCE／Dice 与水平翻转 TTA。这些选择有公开方法依据，但在当前代码与预算下是否有效，要等真实测时、曲线和审计。

## 一个值得在训练前发现的格式问题

官方评估页面的像素顺序文字，与实际 GIF／CSV 掩码不一致。抽查 11 对原生 1280×1918 标签，按行展开的 C-order 全部一致，F-order 则不一致。

这类问题不能靠“其他分割比赛一直这么写”决定。非方形掩码和首尾连通段的独立测试，比仅检查输出字符串长得像 RLE 更有用。模型质量再好，几何或编码语义错误也会让提交失去意义。

## 把训练和提交预测拆开

拟采用独立的训练与禁网预测 Notebook，用训练输出的原生检查点及 SHA-256 校验复用模型。预测时先还原连续概率到原始分辨率，再阈值化与编码；不把二值缩略图直接放大来替代这个过程。

测试图片从 ZIP 分批读取，两张 T4 分担无重叠的 ID 区间，边预测边输出压缩 RLE。避免保存十万张稠密概率图，减少磁盘与传输成本。

## 观点：准入检查比乐观估时更有价值

预检应同时测两个种子的选择／重训路径、真实 JPEG 读取、TTA、原生尺寸转换和压缩输出，再对完整训练与全部测试图外推。单卡与双卡也应在相同输入上比较，而不是根据分配数量宣称加速。

只有预检、质量检查和剩余额度都允许，才值得进入完整流程。收到 Notebook 上传回执只证明版本存在；没有模型、完整输出和官方评分回执时，就把结论停在当前证据处。后续结果应另行补写，而不是提前用计划覆盖未知。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/carvana-image-masking-challenge)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/docs/run.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/)


[预检 Notebook](https://www.kaggle.com/code/godlovebinlee/carvana-segmentation-train) 为私有运行；状态快照不等同于产物校验或评分。

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-17)列出了本文的结果口径、记录日期与可核对范围。
