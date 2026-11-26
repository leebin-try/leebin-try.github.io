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
coverImage: "/kaggle/17/cover.svg"
coverAlt: "原创车辆轮廓、像素网格与原生掩码编码"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

Carvana 与其他分割题有一个很实际的区别：5,088 张训练图片对应 **100,064 张测试图片**。一个模型即使可以训练完成，也可能来不及为所有图片生成合规预测。**预算应该覆盖整条提交链路，而不只覆盖优化器。**

**2026-11-26 补记：** 02:07 UTC 的只读官方查询显示，训练 Notebook 的预检 v1 状态为 COMPLETE，比赛提交历史为空。原始方案记录保留在 11 月 25 日的代码快照；这次状态核对没有建立完整训练或官方评分的完成证据。后续本地校验因 CSV 字段默认长度上限停止，见本文新增的工程分析。以下是设计判断与待检验假设，不是已经验证的高分经验；0.995 只是目标。

## 问题定义：训练、预测和文件解析，都在交付链里

318 辆有标签车辆、每辆 16 个视角，共 5,088 张训练图；测试有 6,254 辆车、100,064 张图。原生分辨率 1280×1918，单张概率图并不小。若把全部测试概率长时间落盘，存储和传输就可能比模型权重更难管理。

同一车辆的视角强相关，所以计划按整车做拟合、停止／校准与独立 audit。停止组同时选检查点与阈值，仍有选择乐观；audit 冻结以后才评估。两份种子模型分别全量重训，最后只复用它们的原生检查点，不在评分时再次训练。

这是一份尚未建立官方得分的方案。远程预检 COMPLETE 与主流程校验通过仍是两个阶段：本地产物复核遇到了 CSV 默认字段长度上限，不能因远程进程退出为零，就跳过这一交付问题。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/17/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Carvana"><img src="/kaggle/17/method.svg" alt="原创流程与验证边界示意。原创车辆轮廓、像素网格与原生掩码编码；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Carvana</strong> 原创流程与验证边界示意。原创车辆轮廓、像素网格与原生掩码编码；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/17/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-17-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 为什么按整辆车分组

每辆车有 16 个固定视角。同车图片散落到拟合与验证两侧，会让验证更像在辨认熟悉车辆。计划将 318 辆有标签车辆分成 254 辆拟合、32 辆检查点／校准、32 辆独立 audit，保持每辆车的全部视角在一起。

拟比较两个 ResNet34 U-Net 种子，采用渐进分辨率、边缘加权 BCE／Dice 与水平翻转 TTA。这些选择有公开方法依据，但在当前代码与预算下是否有效，要等真实测时、曲线和审计。

## 实现展开：先还原概率，再定义几何与序列化

阈值是非线性运算，因此 `resize(probability) >= threshold` 与 `resize(probability >= threshold)` 一般并不相等。一个合成一维例子是两组概率 0.1／0.6 与 0.4／0.9：阈值后都变成 0／1，但连续概率穿过 0.5 的位置不同。先丢掉概率，再放大二值图，会丢掉这项边界信息。

RLE 也要以实际标签为准。下面是合成 2×3 掩码，不是比赛图片：

```text
1 1 0
0 1 1

按行展开：1 1 0 0 1 1
一基 RLE：1 2 5 2
```

非方形例子能揭示转置，首尾为前景的例子能揭示边界漏段；只测试一个居中方块往往不够。公开字段是文本，但它仍有最大长度、整数、排序、重叠和像素范围等具体契约。大字段被 CSV 解析器拒绝，属于真实工程失败，不能用删除复杂掩码来修复。

## 一个值得在训练前发现的格式问题

官方评估页面的像素顺序文字，与实际 GIF／CSV 掩码不一致。抽查 11 对原生 1280×1918 标签，按行展开的 C-order 全部一致，F-order 则不一致。

这类问题不能靠“其他分割比赛一直这么写”决定。非方形掩码和首尾连通段的独立测试，比仅检查输出字符串长得像 RLE 更有用。模型质量再好，几何或编码语义错误也会让提交失去意义。

## 把训练和提交预测拆开

拟采用独立的训练与禁网预测 Notebook，用训练输出的原生检查点及 SHA-256 校验复用模型。预测时先还原连续概率到原始分辨率，再阈值化与编码；不把二值缩略图直接放大来替代这个过程。

测试图片从 ZIP 分批读取，两张 T4 分担无重叠的 ID 区间，边预测边输出压缩 RLE。避免保存十万张稠密概率图，减少磁盘与传输成本。

## 实测预检告诉了什么，以及还不能外推什么


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Carvana"><img src="/kaggle/17/pilot-timing.svg" alt="远程预检报告的同一批 512 图像墙钟时间，约 95.04／60.06 秒，含启动；仅一个正权重模型。本地产物校验尚未完成，不是正式评分。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Carvana</strong> 远程预检报告的同一批 512 图像墙钟时间，约 95.04／60.06 秒，含启动；仅一个正权重模型。本地产物校验尚未完成，不是正式评分。<br /><a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/17/pilot-timing.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-17-pilot-timing">图表出处与口径</a></figcaption>
</figure>


远程报告记录了同一批 512 张测试图的单卡和双卡墙钟对照：约 95.04 秒与 60.06 秒，观测比值约 1.58；它包含 worker／模型启动成本。该预检选中的是一个正权重模型，不是双模型完整集成，因此不能直接把这项吞吐外推成两模型 TTA 的全部成本。

完整预算应沿关键路径相加：并行种子选择取较慢 worker，接上串行校准与 audit，再取并行全量重训的较慢者，最后加完整预测、合并与校验。图片读取、概率恢复、RLE 和压缩都应进入代表性测量。

这张图只重绘远程报告里的聚合时间，未把它写成已通过本地产物校验或已得到官方分数。下一步先解决并验证大字段解析，再重新核对保守预算是否覆盖所有允许的模型分支。先补齐这条证据链，才值得讨论目标 Dice 是否达到。

## 观点：准入检查比乐观估时更有价值

预检应同时测两个种子的选择／重训路径、真实 JPEG 读取、TTA、原生尺寸转换和压缩输出，再对完整训练与全部测试图外推。单卡与双卡也应在相同输入上比较，而不是根据分配数量宣称加速。

只有预检、质量检查和剩余额度都允许，才值得进入完整流程。收到 Notebook 上传回执只证明版本存在；没有模型、完整输出和官方评分回执时，就把结论停在当前证据处。后续结果应另行补写，而不是提前用计划覆盖未知。

## 进一步辨析：字段长度上限不是掩码质量门槛

本地复核遇到默认 131,072 字符字段上限。这是 Python CSV 解析器的边界，不是比赛公布的 RLE 长度限制。早期模型产生复杂掩码时，文本可能很长；删除该行、截断字符串或输出空白，都会改变预测，不能作为透明的兼容性修复。

一个待验证的解析修复示意，是先设置有界的大字段容量，例如 `csv.field_size_limit(32 * 1024 * 1024)`，随后仍逐行检验整数成对、正值、排序、不重叠、像素范围与 ID 覆盖。增大上限只让解析器读得进来，并不使这些语义检查自动通过。

这也是当前尚未进入完整质量结论的原因。先用原始未改预测完成复核，再确认预算覆盖所有正式允许的分支，才能继续讨论全量方案。本文没有把这段修复示意当成已经通过的执行记录，也没有用预检速度预测最终 Dice。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/carvana-image-masking-challenge)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/docs/run.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/)


[预检 Notebook](https://www.kaggle.com/code/godlovebinlee/carvana-segmentation-train) 为私有运行；状态快照不等同于产物校验或评分。

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-17)列出了本文的结果口径、记录日期与可核对范围。
