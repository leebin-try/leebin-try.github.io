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
---

文本归因不只是在辨认语义。标点、惯用词、大小写与句子形状，也可能留下生成模型的风格痕迹。因此，我更关心**第二个模型是否补上了第一种表示缺少的信息**，而不是它单独能排多高。

## 两条路径，保留不同的信号

最终提交组合了已有的五折 Qwen3-Embedding-8B 专家，以及这组实验自行训练的词法专家。后者使用字符、词、词形、功能词和标点等 TF-IDF 视图，先在公开外部语料拟合，再在官方拟合折上适配。词表只在外部拟合行学习，验证与测试文本不参与词表拟合。

验证按完整提示词分组，避免同一题目的不同回答散落在训练与验证两边。推断时使用无标签的全局文本上下文分组，不能强制假设每个分组刚好包含所有类别。

原生专家、分组思路与多视图词法方案分别有 CHEN Han／concyclics、lightningv08、Nishant Dahal 等公开工作的基础，原记录保留了具体来源。本篇讨论组合、训练、验证与预算取舍，不宣称首创这些方法。

## 为什么没有继续追逐更大的模型

27B 路径完成了小规模机制验证，但实测批次为 8 时，外部阶段约每秒处理 0.73 条。45,000 条外部语料跑一轮仍需约 17—19 小时；能够装进显存，并不代表能在本次预算里完成有意义的训练。批次 16 的一次尝试还出现了 OOM。

最终上线的是 **8B 原生专家 + 自训词法专家**，没有把只做过资格测试的 27B 模型写进最终方案。

## 证据与解释

词法专家独立 OOF balanced accuracy 约 0.458，低于原生路径；固定 40% 词法概率的混合，在开发 OOF 上达到约 0.6683。官方最终是 **0.638**，相对前一版 0.628 增加 0.010。开发分数与官方分数保留各自口径。

这支持互补性值得测试，不能推出所有弱模型都值得融合。外部语料的上游选择用过官方标签，混合比例也经过开发集比较，所以这里没有完全未经选择的独立测试证据。借鉴的公开方法和资产来源仍需沿原记录保留归属。

## 可以复用的判断

先明确第二条路径准备捕捉什么，再检查分组级别的增益、最差折退化和稀疏样本表现。只有平均分变好，可能只是少数重复主题在拉动结果。

对大模型，先测真实的吞吐、加载成本和检查点复现，再外推完整训练；对融合，先测不同错误是否被纠正。前者回答“做不做得完”，后者回答“值不值得做”。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/name-that-llm)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/overnight-t4-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/)
- [来源归属与资产说明](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/reproduction-credits.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-02)列出了本文的结果口径、记录日期与可核对范围。
