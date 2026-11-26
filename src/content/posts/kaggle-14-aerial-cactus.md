---
title: "Aerial Cactus：AUC 已经到顶，损失为什么还在下降"
description: "一个小 CNN 足以取得高分，但停止 AUC 的平台期并不等于概率已校准，也不代表地理泛化已经验证。"
date: "2026-11-26"
category: "Kaggle"
tags: ["图像分类", "Aerial Cactus Identification", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 14, "topic": "图像分类", "status": "已出分", "result": "Public / private ROC AUC 0.9999 / 0.9999", "evidenceDate": "2026-11-24", "source": "https://leebin-try.github.io/kaggle/sources/#case-14", "competitionUrl": "https://www.kaggle.com/competitions/aerial-cactus-identification", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/docs/results.md", "submission": "58805153"}
coverImage: "/kaggle/14/cover.svg"
coverAlt: "合成航拍图块中的仙人掌与分类排序示意"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

**核心判断：AUC 提前达到平台，不代表概率训练已经没有变化。小 CNN 官方 AUC 为 0.9999，停止集后期 BCE 仍下降；是否继续训练，应由预先声明的用途和指标决定。**

## 问题定位：排序分数的上限可能很早到来

二分类输入是小幅航拍图像，输出仙人掌存在概率。AUC 评价正负样本的相对排序，不要求概率在某个固定阈值上最好，也不要求它已经有良好校准。在这样一个较容易的比赛分区上，模型可能很早就达到停止集 AUC 1.0。

这不意味着后续优化没有变化，只意味着当前排序指标已经不再区分这些变化。若把停止 AUC 的平台直接写成模型已充分收敛，就会遗漏概率置信度、阈值下错误和新区域泛化这些不同问题。

精确与 D4 变换重复检查减少了一类明显相关样本，但没有真实采集地点分组。照片几何变换不重复，仍可能来自相邻区域；当前证据不能把这两种独立性混为一谈。

## 技术思路与路线

**路线概览：**检查精确与 D4 变换重复 → 固定拟合／停止／审计分区 → 对照小 CNN 与小残差 CNN → 按 AUC 选检查点并拒绝无增益平均 → 用所选模型正式推断。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/14/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Aerial Cactus"><img src="/kaggle/14/method.svg" alt="原创流程与验证边界示意。合成航拍图块中的仙人掌与分类排序示意；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Aerial Cactus</strong> 原创流程与验证边界示意。合成航拍图块中的仙人掌与分类排序示意；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/14/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/zh/kaggle/sources/#fig-14-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

### 方法：先给小模型一次公平机会

实验比较小 CNN 与小残差 CNN，使用固定 fit、stop、audit（独立检查集） 分区。停止集负责选检查点和有限的平均比较；独立 audit 在选择冻结后评估。最终保留小 CNN，因为等权平均没有改善停止 AUC。

这里没有在全部标签上再训一个模型；最终评分使用已选模型。将这场与其他有全量重训的比赛混为一谈，会误报训练流程。

### 实现展开：用单调变换理解 AUC 与 BCE 的分歧

考虑一个合成例子：所有正样本概率都高于负样本，但正样本大多只有 0.6。把它们推向更有把握、且仍然正确的概率，可以降低 BCE，而样本排序没有变化，AUC 仍一样。反过来，过度自信也可能让错误样本的损失增大，所以置信度变化本身并不保证更好。

正温度变换 `sigmoid(logit(p) / T)` 保持单调次序，因而在没有新数值并列等影响时保留排序，却能改变概率损失。这个机制解释了为什么校准与排序需要不同检查；它不是当前候选已做过温度优化的声明。

训练流程则严格把增强留在拟合侧，停止与 audit 用干净图像。两种损失曲线的差距部分来自测量条件，不能直接用“训练损失必须小于验证损失”做判断。选择出的模型也没有再全量重训，不应在复盘里补上一段实际上未发生的训练。

## 评价方式

ROC AUC 评价正样本排在负样本前面的能力，越高越好；BCE 则惩罚不合适的概率置信度，越低越好。严格单调变换保持排序，却可能改变 BCE，因此两种曲线出现分歧并不矛盾。

停止集负责选模型，冻结后再看 audit；当前最终模型没有全量重训。重复检查只减少已识别的图像相关性，未建立采集地点隔离。官方高分用于描述比赛排序表现，不直接证明概率校准或跨地区能力。

### 指标分歧在曲线上怎样出现

小 CNN 最佳停止 AUC 在第 27 轮达到 1.0，但停止 BCE 仍继续下降：所选轮约 0.00185，第 37 轮降到约 0.000476。排序已经正确，并不要求概率距离 0／1 已经相同。

模型按预设 AUC 规则停止是可以解释的选择，却不意味着“训练损失不降了”或“概率校准已经最佳”。训练时有增强，评估时没有，二者损失也不处于完全相同的测量条件。

## 结果与证据

### 结果，以及高分未覆盖的问题

官方 Public / Private ROC AUC 均为 **0.9999**。整个双 T4 主流程约 **83 秒**；独立 audit AUC 接近 1，是另外一组内部诊断。达到最初 >=0.999 目标，仍没有达到显示为 1.0000 的更高参考。

精确与 D4 变换重复检查减少了明显重复样本带来的乐观，但没有证明不同地理区域独立，也没有建立真实应用中的跨地点迁移能力。高分描述的是比赛分区上的排序表现。

### 读图：第 27 轮以后发生了什么

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/14/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Aerial Cactus"><img src="/kaggle/14/learning.svg" alt="小 CNN 的 37 轮真实记录：左侧为对数 BCE 轴，右侧为停止 AUC；虚线是第 27 轮所选检查点，不是 BCE 最小点。" width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Aerial Cactus</strong> 小 CNN 的 37 轮真实记录：左侧为对数 BCE 轴，右侧为停止 AUC；虚线是第 27 轮所选检查点，不是 BCE 最小点。<br /><a href="/kaggle/14/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/14/learning.csv" download>下载聚合指标 CSV</a> · <a href="/zh/kaggle/sources/#fig-14-learning">图表出处与口径</a></figcaption>
</figure>

图中 AUC 在后期维持平台，BCE 的对数轴仍显示下降。红色线标记按既定 AUC 规则选择的第 27 轮，而不是 BCE 最小轮。曲线每个点来自一轮真实记录，没有平滑；它给出了停止规则实际选择了什么，而不是替换成事后更有利的标准。

小 CNN 与残差控制在相同停止集比较，平均没有建立额外收益。要知道简单网络是否真的比更大网络稳定，还需要新的采集域或更多独立切分；当前高分只能支持在这次比赛分区里它已经足够有效。

接下来最值得测的是错误分布和外部条件：新地理区域、不同光照、被遮挡目标，以及固定概率阈值下的代价。只有在这些条件下继续验证，才能把“一个容易分区上的排序成功”逐渐转化为更广泛的使用判断。

## 思考与结论

**结论：**当前小模型已足以达到最初比赛目标，增加模型规模没有先验必要。真正尚未被考验的是新采集条件、困难样本和概率用途；这些问题应通过新的评价设计回答。

### 观点：停止规则应服务于真正关心的结果

如果目标只关心排序，AUC 选点有其理由；如果后续要按概率制定代价决策，还应该看 log loss、校准和阈值下的代价。这不是在同一停止集上不断换指标挑最好，而是实验开始前就确定评价目标。

下一步我会优先检验新的地理或采集分组，以及概率是否稳定，而不是仅因网络更大就再训练一个。小问题上的简单成功，最有价值的部分往往是帮我们辨认尚未被考验的边界。

## 下一步

以下是按优先级排列的后续实验设计，尚未执行；通过条件与比较口径应在运行前固定。

1. 先根据可知的采集条件定义确认分组，记录每组支持数；若没有可靠地点标识，就明确保留这一限制。
2. 如目标转为概率决策，在运行前声明 BCE、校准和阈值代价的选择规则，再比较检查点，而非事后挑最有利指标。
3. 新候选沿用相同样本与成本口径；只有独立确认带来收益，才接受更大网络或额外平均。

### 进一步辨析：平均指标接近上限，仍然需要困难样本

冻结 audit 有 1,971 个正样本和 655 个负样本。这个支持数说明，仅看固定阈值 accuracy 会受到类别比例影响；AUC 虽关注排序，也没有自动解决跨地理来源的相关性。

更有价值的后续验证应按采集条件定义困难子集，再保留支持数、概率损失与阈值下错误。不能先找到所有误判图片，再把它们当作一个有代表性的“困难测试集”；这种错误驱动集合适合诊断，不适合重新估计总体性能。

若需要公开图像示例，也要先确认数据使用和再分发许可。本文采用合成航拍插图与真实聚合曲线，不把插图当作模型输入或预测展示。下一轮如果获得可公开许可，才加入标注与预测叠加，并同时保留正确和失败样例的选择规则。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/aerial-cactus-identification)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/zh/kaggle/sources/#case-14)列出了本文的结果口径、记录日期与可核对范围。
