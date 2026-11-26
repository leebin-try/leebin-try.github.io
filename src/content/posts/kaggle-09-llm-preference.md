---
title: "LLM 偏好预测：复用检查点，也必须审计分类头与答案顺序"
description: "已经微调好的模型，仍可能因为加载错头、长文本截断或 A/B 反转而失效。推断正确性本身是一项实验。"
date: "2026-11-26"
category: "Kaggle"
tags: ["语言模型", "LLM Classification Finetuning", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 9, "topic": "语言模型", "status": "已出分", "result": "Public log loss 0.82657；无已发布 private 值", "evidenceDate": "2026-11-19", "source": "https://leebin-try.github.io/kaggle/sources/#case-09", "competitionUrl": "https://www.kaggle.com/competitions/llm-classification-finetuning", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/docs/results.md", "submission": "58544030"}
---

这场任务预测回答 A 获胜、回答 B 获胜或平局。最值得留下的经验是：**拿到一个优秀检查点，还没有拿到一个正确工作的判别系统。** 分类头、输入模板与列顺序，都会改变它实际输出的含义。

## 实际做了什么

方案复用公开的 Gemma-2 9B 与 Llama-3 8B 偏好分类检查点，实施了加载、推断与融合，没有重新完成一次模型微调。把复用方案写成“自行训练出了偏好模型”，会误解这次工作的贡献。

检查点由 tascj0 发布，参考推断方案来自 andyuuzou 的公开 Notebook，并沿用其对 snaykey、gloriachen0816 等管线工作的归属。项目贡献集中在适配、加载审计、完整覆盖与独立重建，而非将参考方案重新命名为原创算法。

原检查点的分类头是两层 MLP，不是框架默认的线性分类头。加载器需要还原四个头部张量，以及各层融合的 gate/up 投影。检查架构、配置与模型名称相同，仍不足以证明这些权重真的被加载。

## 答案顺序与长输入，是两类高风险边界

交换 A/B 做推断后，必须把前两列映射回原来的答案顺序。否则一个看似平滑的融合，会把赢家标签混在一起。长对话使用平衡的头尾截断，尽量同时保留两个回答，而不是先让一边占满窗口。

两个模型分别跨两张 T4 做阶段化推断，模型之间顺序执行；不能把这种管线称为分布式训练。每个方向的输出都保留，随后独立重建模型内平均、几何融合和温度，检查最终 CSV 是否一致。

## 证据：运行探针不承担干净验证的职责

16 条长度覆盖探针验证了真实设备、完整方向覆盖、加载头部及概率重建，融合重建的最大误差为零。但这些公开检查点见过比赛训练数据，不能把训练文本子集上的结果包装成干净交叉验证。

真实质量证据来自官方 **0.82657 Public log loss**。截至 2026-11-19 16:26 UTC 的榜单记录为 **6／327 个有正排名的队伍**；这是当时快照，分母排除了 rank-zero 示例项，不是当前实时名次。未发布的 private 分数不作推断。

## 观点：推断系统也需要自己的验收

一份可用的验收应说明：每个样本是否经过必要方向、截断是否保持双方对齐、概率列能否独立复算、异常是否被显式报告。不能用默认分类头、静默先验补救或丢弃超长行，把失败藏成成功。

下一步若优化吞吐，应在保持相同预测语义与完整覆盖的前提下测量；仅看 tokens/s，无法证明整个评分流程更快。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/llm-classification-finetuning)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/)
- [加载与融合设计、来源归属](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/docs/solution.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-09)列出了本文的结果口径、记录日期与可核对范围。
