---
title: "Name That LLM：弱一些的模型，也可能带来更有用的错误"
description: "文本风格专家单独不强，却与语义模型互补。融合的关键是误差结构与可承受的成本，而非参数规模。"
date: "2026-11-26"
category: "Kaggle"
tags: ["语言模型", "Name That LLM", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 2, "topic": "语言模型", "status": "已出分", "result": "Official balanced accuracy 0.638", "evidenceDate": "2026-11-20", "source": "https://leebin-try.github.io/kaggle/sources/#case-02", "competitionUrl": "https://www.kaggle.com/competitions/name-that-llm", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/overnight-t4-results.md", "submission": "58575974"}
coverImage: "/kaggle/02/cover.svg"
coverAlt: "文本指纹与两种互补表示，展示语义专家和词法专家"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

文本归因不只是在辨认语义。标点、惯用词、大小写与句子形状，也可能留下生成模型的风格痕迹。因此，我更关心**第二个模型是否补上了第一种表示缺少的信息**，而不是它单独能排多高。

## 问题定义：18 类标签背后的两种分布差异

任务是从回答文本识别生成来源，评价采用 balanced accuracy，而不是让数量更多的类别主导总体 accuracy。每个提示词可能对应多个来源的回答，所以“主题相似”与“生成风格相似”是两个相关但不同的信号。随机拆散提示词，会让模型在验证时遇到熟悉题目的另一份表达。

实验据此保留提示词不交叉的折，并固定 18 类的列顺序。公开外部语料带来更多文本，却同时引入来源筛选、题目结构和时间差异。数据量增加不自动意味着独立性增加；上游使用官方标签做过的语料筛选，仍会影响我们怎样解释后续开发分数。

这个问题适合同时保留语义表示和表面风格。前者能解释句子内容与组织方式，后者能保留标点、大小写、常用连接词以及字符组合。把文本清洗得只剩语义，有可能恰好删掉归因需要的线索。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/02/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Name That LLM"><img src="/kaggle/02/method.svg" alt="原创流程与验证边界示意。文本指纹与两种互补表示，展示语义专家和词法专家；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Name That LLM</strong> 原创流程与验证边界示意。文本指纹与两种互补表示，展示语义专家和词法专家；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/02/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-02-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 两条路径，保留不同的信号

最终提交组合了已有的五折 Qwen3-Embedding-8B 专家，以及这组实验自行训练的词法专家。后者使用字符、词、词形、功能词和标点等 TF-IDF 视图，先在公开外部语料拟合，再在官方拟合折上适配。词表只在外部拟合行学习，验证与测试文本不参与词表拟合。

验证按完整提示词分组，避免同一题目的不同回答散落在训练与验证两边。推断时使用无标签的全局文本上下文分组，不能强制假设每个分组刚好包含所有类别。

原生专家、分组思路与多视图词法方案分别有 CHEN Han／concyclics、lightningv08、Nishant Dahal 等公开工作的基础，原记录保留了具体来源。本篇讨论组合、训练、验证与预算取舍，不宣称首创这些方法。

## 实现展开：词法专家怎样保留自己的独立性

词法路径并非把一份 TF-IDF 矩阵交给默认分类器。它包含四个视图：字符 n-gram、词 n-gram、词形以及功能词／标点，各有固定权重，再拼接归一化。词表只在外部拟合数据学习；官方验证文本和测试文本不参与构造。随后先拟合外部 18 类联合分类头，再从同一个外部先验出发，在每个官方拟合折独立适配。

```text
外部拟合集 → 固定四个词表 → 外部分类头
                                  ├→ 官方折 0 的拟合行 → 折 0 验证
                                  ├→ 官方折 1 的拟合行 → 折 1 验证
                                  └→ 全部官方标签 → 最终推断头
```

关键是最后一行不能倒流，成为前面验证折的初始化状态。否则“每折重新拟合”只是表象，已经看过全部官方标签的参数仍会带入信息。

原生专家与词法专家在概率空间混合。父版本保存的是 log-softmax 分数，必须先恢复为概率；直接把负对数分数当概率相加，会得到数值上可运行、语义上错误的融合。全局无标签上下文分组也只是另一条推断规则，不允许强制每组标签平衡，更不能利用隐藏标签来拼组。

## 为什么没有继续追逐更大的模型

27B 路径完成了小规模机制验证，但实测批次为 8 时，外部阶段约每秒处理 0.73 条。45,000 条外部语料跑一轮仍需约 17—19 小时；能够装进显存，并不代表能在本次预算里完成有意义的训练。批次 16 的一次尝试还出现了 OOM。

最终上线的是 **8B 原生专家 + 自训词法专家**，没有把只做过资格测试的 27B 模型写进最终方案。

## 证据与解释

词法专家独立 OOF balanced accuracy 约 0.458，低于原生路径；固定 40% 词法概率的混合，在开发 OOF 上达到约 0.6683。官方最终是 **0.638**，相对前一版 0.628 增加 0.010。开发分数与官方分数保留各自口径。

这支持互补性值得测试，不能推出所有弱模型都值得融合。外部语料的上游选择用过官方标签，混合比例也经过开发集比较，所以这里没有完全未经选择的独立测试证据。借鉴的公开方法和资产来源仍需沿原记录保留归属。

## 可以复用的判断

先明确第二条路径准备捕捉什么，再检查分组级别的增益、最差折退化和稀疏样本表现。只有平均分变好，可能只是少数重复主题在拉动结果。

对大模型，先测真实的吞吐、加载成本和检查点复现，再外推完整训练；对融合，先测不同错误是否被纠正。前者回答“做不做得完”，后者回答“值不值得做”。

## 为什么“弱模型有用”还需要更多检验


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/02/complementarity.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Name That LLM"><img src="/kaggle/02/complementarity.svg" alt="开发 OOF 的词法单体、原生父版本与所选混合。混合和语料筛选复用了开发信息，不能当作未经选择的独立测试。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Name That LLM</strong> 开发 OOF 的词法单体、原生父版本与所选混合。混合和语料筛选复用了开发信息，不能当作未经选择的独立测试。<br /><a href="/kaggle/02/complementarity.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/02/complementarity.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-02-complementarity">图表出处与口径</a></figcaption>
</figure>


图中的单独词法专家明显弱于原生专家，混合却提高了所选开发 OOF。这支持误差互补的解释，但没有单独证明它：多个混合比例经过选择，上游语料选择也使用过官方标签。配对提示词 bootstrap 可以描述当前重采样下的稳定性，不能消除这些选择。

需要进一步看的不是只纠正了多少行，而是纠正发生在哪些提示词、哪些来源、长短文本和稀疏分组。若增益集中在少数主题，换一个提示词分布可能消失；若同一类别的召回下降，balanced accuracy 的均值也可能掩盖它。

计算预算给出另一项约束。27B 的显存和存取验证通过，并不意味着有时间做完整学习。可以将候选价值拆成“单位时间能完成的有效比较”和“每次比较得到的独立信息”。在这次预算中，词法路径训练约五分钟，完整 27B 外部一轮却外推到十几个小时；这不是一般的大小模型优劣结论，而是本次选择空间的真实差别。

## 进一步辨析：适配的是分类头，不是另训一个大语言模型

词法路径约 20 万维、18 类的权重矩阵，仅一组 FP32 系数约为 14.4 MB；这只是按维度计算的参数存储估计，未计词表、稀疏特征和优化状态。它与几十亿参数骨干的资源结构完全不同，也解释了为什么可以在很短预算里完成一条有差异的路径。

官方适配还使用了向外部先验靠拢的正则项，机制可抽象为 `L = CE(official) + lambda * ||W - W_external||²`。它限制小规模官方拟合对先验的偏移，但正则强度仍是需要选择的参数；不能因为“使用先验”就认定不会过拟合。

更具体的下一轮应固定词表和分组，只比较是否使用这个先验约束，再看各提示词、各来源的变化。若均值提高却最差来源明显退化，就讨论代价与适用范围，而不是仅提高混合比例。这个设计目前是后续假设，不是新增官方结果。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/name-that-llm)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/overnight-t4-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/)
- [来源归属与资产说明](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/reproduction-credits.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-02)列出了本文的结果口径、记录日期与可核对范围。
