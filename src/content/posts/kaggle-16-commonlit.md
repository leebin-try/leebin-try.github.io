---
title: "CommonLit：文本模型的泛化，先问它有没有见过这道题"
description: "按题目留出揭示了措辞评分的弱点。多目标平均、训练轮次与 tokenizer 兼容性，都需要独立证据。"
date: "2026-11-26"
category: "Kaggle"
tags: ["语言模型", "CommonLit", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 16, "topic": "语言模型", "status": "已出分", "result": "Public / private MCRMSE 0.59760 / 0.54871", "evidenceDate": "2026-11-25", "source": "https://leebin-try.github.io/kaggle/sources/#case-16", "competitionUrl": "https://www.kaggle.com/competitions/commonlit-evaluate-student-summaries", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/docs/results.md", "submission": "58876423"}
coverImage: "/kaggle/16/cover.svg"
coverAlt: "题目、原文、摘要三种输入与内容和措辞两个输出"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

**核心判断：CommonLit 应先解决新题目泛化与两个目标的不平衡。当前措辞 RMSE 明显高于内容，四个题目又限制了验证范围；优先改进上下文分配和目标诊断，比直接换更大模型更有依据。**

## 问题定位：新题目上的内容与措辞，是两项任务

7,165 份摘要来自四个题目，两个回归目标分别描述内容与措辞。一个模型可能更擅长判断是否覆盖原文信息，却较难判断语言表达质量；把两个误差直接合成一列，会隐藏这种能力不对称。

按题留出意味着验证题的学生摘要、题干与原文结构不与拟合题重叠。四题之间的样本量又不同，所以折分数不能直接不加权平均。整体 MCRMSE 先把每个目标的全部 OOF（折外预测） 残差合并计算 RMSE，再平均两个目标。

对于不同大小折，先开平方再平均与先合并平方误差再开平方不是同一种运算。某个小折很难时，不加权折均值会给它与大折同等权重；哪一种反映目标问题，需要在开始前明确，而不是看哪种结果更好再选。

## 技术思路与路线

**路线概览：**整题留出四折 → 拼接题干、原文与摘要 → 原生分词及摘要位置掩码 → DeBERTa-v3-small 仅池化摘要 → 选择每折检查点 → 固定四轮全量拟合并预测双目标。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/16/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · CommonLit"><img src="/kaggle/16/method.svg" alt="原创流程与验证边界示意。题目、原文、摘要三种输入与内容和措辞两个输出；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · CommonLit</strong> 原创流程与验证边界示意。题目、原文、摘要三种输入与内容和措辞两个输出；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/16/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-16-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

### 方法：让摘要注意原文，只对摘要做池化

模型为 DeBERTa-v3-small，读取受长度约束的题目、原文与学生摘要，只对摘要 token 做均值池化，输出 content 与 wording 两个连续分数。原始词嵌入冻结，其他可训练部分在远程 T4 上拟合。

全部 7,165 行来自四个题目，采用四次整题留出。ID 和标签不进入文本序列。每个题目仍用作该折检查点选择，因此 OOF 不是完全未参与选择的外部测试；四个题目也限制了我们能对新领域作出的推断。

### 实现展开：摘要池化为什么不同于全输入池化

输入包含题目、原文和学生摘要，模型允许摘要通过注意力读取前面的上下文；回归头的均值池化却只对摘要 token 进行。否则，长原文的 token 数可能在最终平均里主导表示，使不同学生的摘要差异被稀释。

```text
[题目片段][原文片段][学生摘要]
             ↓ 共享注意力上下文
只取摘要位置的隐藏状态 → masked mean → 两个回归输出
```

这个边界依赖 tokenizer、特殊 token 与摘要位置掩码一致。原生 SentencePiece 的词表 ID 不能因为新库转换路径变化而重新编号；即便字符串看起来相同，不同 ID 也会读到不同预训练嵌入。

原始词嵌入冻结后，141,305,858 个总参数中约 42,925,058 个可训练。参数总量与本次优化的参数量并不是一回事。FP16 前向配合 FP32 参数与损失，也需要记录 AMP 跳过的更新；已处理批次数不能直接当作已经完成的优化器步数。

## 评价方式

MCRMSE 先分别计算内容与措辞的 RMSE，再取两者平均，越低越好。合并 OOF 时，必须先合并每个目标的全部残差再开方；不能直接平均四折 RMSE，因为折大小不同，开方也不是线性运算。

同一题目的所有摘要一起留出，模拟遇到新题目。留出题同时用于该折检查点选择，所以 OOF 仍包含选择影响。四折最佳轮次为 1、5、5、2，全量采用向上取整中位数四轮；这是一项冻结规则，不是全量训练上的独立最优验证。

## 结果与证据

### 平均指标下面，哪个目标更难

全体对齐 OOF 的 MCRMSE 为 **0.577645**，其中 content RMSE 约 0.512731，wording 约 0.642559。某一题的 wording 达到 0.730655，明显更弱。

MCRMSE 先对每个目标的全部 OOF 样本计算 RMSE，再平均两个目标；不能简单平均四折数字来替代。不同题目的样本量不一致时，这个口径差别尤其重要。

### 最佳轮次和损失走势提供了什么

四折选择轮次为 1、5、5、2，全量重训采用向上取整的中位数，即四轮。第 0 折训练损失仍降，content 误差却恶化；wording 又可能朝另一方向变化。两个目标必须分开保留。

另外两折到了六轮上限，尚未完整观察到预设 patience。它们的收敛状态仍未解决；不能仅因主流程约 47 分钟、小于时间上限，就说训练已经充分。

### 工程问题也不能冒充模型结论

最初探针在训练前因新版本加载诊断包含集合而不能 JSON 序列化。修复同时沿用原生 SentencePiece 词表，避免新转换路径产生另一种 tokenization。失败属于运行兼容性，不是“DeBERTa 不适合任务”。

最终官方 **0.59760 Public / 0.54871 Private MCRMSE**，达到初始 public <=0.60 目标，离历史 public 参考 0.44378 仍远。两个官方分区的差异不是一次模型改进。

### 如何从两折曲线提出可验证假设

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/16/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · CommonLit"><img src="/kaggle/16/learning.svg" alt="v3 两个题目折的真实训练／验证及分目标曲线。fold 0 最佳在第 1 轮，fold 1 到六轮上限后仍未完成停止耐心。" width="792" height="504" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · CommonLit</strong> v3 两个题目折的真实训练／验证及分目标曲线。fold 0 最佳在第 1 轮，fold 1 到六轮上限后仍未完成停止耐心。<br /><a href="/kaggle/16/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/16/learning.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-16-learning">图表出处与口径</a></figcaption>
</figure>

fold 0 的训练 MSE 持续下降，验证 content 误差却恶化；wording 又在最后一轮改善。综合指标最终选择第一轮，正是因为两个目标不是沿同一方向变化。fold 1 训练到六轮，选在第五轮，尚未完整观察到预设停止耐心。

因此，“再训久一点”不是对所有题目通用的解释。可以分别假设：某些题目的内容泛化更早退化，某些题目需要不同学习率或更多有效上下文。但要验证它们，必须固定输入截取与分组，再单独改变训练策略，不能同时换模型、长度和评分方式。

全量重训的四轮来自四个选择轮次的中位数规则，是把分组选择转成最终拟合长度的一种可复现约定，不是从全量训练损失找出的最优轮次。下一轮更需要新的题目证据，而不仅是围绕四个熟悉题继续追更低的均值。

## 思考与结论

**结论：**当前方案达到初始 public ≤0.60 的基线目标，但离历史强方案仍远。证据更支持优先检查措辞、截断与题目差异；两折到达上限，也意味着不能用运行很快来证明训练已充分。

### 可迁移的观点

文本任务的分组单位可能是题目、作者、文档或客户。先确定它，再选择骨干模型。下一步更值得检验措辞相关特征、上下文截取与学习率策略，并寻找更多独立题目证据，而不是只对总体均值再优化几个小数。

## 下一步

以下是按优先级排列的后续实验设计，尚未执行；通过条件与比较口径应在运行前固定。

1. 固定骨干、总 token 长度和题目折，仅改变原文／摘要的分配，记录截断比例以及两目标全局 OOF RMSE。
2. 把措辞错误按输入长度和题目结构诊断，避免只优化内容较容易的部分而让总体均值看起来改善。
3. 为上限受限的折单独设计预算准入；候选仍需更多独立题目证据，不能靠反复熟悉四个题目推断广泛评分能力。

### 进一步辨析：更多摘要上下文，会挤占原文上下文

当前输入长度受限，题目、原文与学生摘要共享 token 预算。给摘要更多空间，不只是“看见更多学生文字”，也可能意味着原文更短；两种变化会同时影响内容与措辞判断。

一个较清楚的下一轮，是固定总长度、骨干与题目折，仅改变摘要／原文预算分配，分别记录两目标 RMSE 和实际截断比例。再用同样的全局 OOF 聚合口径比较，而不是挑一个单独题目最有利的配置。

只有四个题目时，这仍然是有限证据。若某种分配主要照顾熟悉题的文本长度分布，新的长原文可能再次失效。因此还需要新的题目或独立来源确认，才能把“这四题里更好”推向更广的阅读理解与评分能力判断。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/commonlit-evaluate-student-summaries)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-16)列出了本文的结果口径、记录日期与可核对范围。
