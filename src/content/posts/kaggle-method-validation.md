---
title: "从 17 个项目抽象验证设计：先定义模型将遇见的陌生"
description: "把乘客关系、病人、题目和时间放在一起看：验证首先是一份关于部署场景的假设，其次才是切分代码。"
date: "2026-11-26"
category: "Kaggle"
tags: ["通用方法", "验证设计", "数据泄漏"]
cover: "terminal"
sample: false
draft: false
featured: true
kaggle: {"kind": "method", "source": "https://leebin-try.github.io/kaggle/sources/#protocol", "evidenceDate": "2026-11-25", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md"}
coverImage: "/kaggle/validation/cover.svg"
coverAlt: "按完整相关组留出的交叉验证矩阵示意"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

一份验证分数，隐含着一句话：“未来样本与现在这些样本，主要以这种方式不同。” 如果这句话没有写清楚，争论随机五折还是时间切分往往没有结论。

这组项目给出的共同线索是：**验证协议首先定义陌生，随后才估计误差。** 它不能保证未来，但能让我们知道正在考验哪一种泛化。

## 把验证设计写成一份可执行契约

一个完整协议至少包含四个对象：预测单位、允许观察的信息、模型选择过程和最终评价总体。它们应该一起出现在实验记录中。例如“按病人分组”还没有说明是否也隔离该病人的所有天次、预处理统计和检查点选择；“时间切分”也没有说明回测跨度是否等于实际交付跨度。

可以在实验前写一张表：每个转换读什么输入、在哪个集合拟合、输出给谁使用、什么时候冻结。词表、类别回退、目标均值、阈值和集成权重都要占一行。一个仅在树模型 `.fit()` 前才开始检查边界的审计，往往漏掉已经从数据学到的转换。

这张表还有助于区分两种情境：全量无标签协变量可见的传导式任务，与只能读取历史数据的严格前瞻任务。是否允许读到一个样本的属性、是否允许读到它的答案，不能用一个“泄漏”标签简单概括。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/validation/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · 从 17 个项目抽象验证设计"><img src="/kaggle/validation/method.svg" alt="原创流程与验证边界示意。按完整相关组留出的交叉验证矩阵示意；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · 从 17 个项目抽象验证设计</strong> 原创流程与验证边界示意。按完整相关组留出的交叉验证矩阵示意；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/validation/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/zh/kaggle/sources/#fig-validation-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 第一层：找到不能轻易拆散的单位

| 问题结构 | 可以考虑的保留单位 | 正在追问的能力 |
| --- | --- | --- |
| 同船票、同家庭乘客 | 完整关系组 | 遇到未知关系组时能否工作 |
| 同病人的连续 MRI | 病人及其全部天次 | 能否迁移到新病人 |
| 同题目的学生摘要 | 完整题目 | 能否评估新原文与题目 |
| 月度销量与会话行为 | 时间原点、完整未来窗口 | 只用当时信息能否预测之后 |
| 同一辆车的多个视角 | 完整车辆 | 能否分割没见过的车辆 |

这些单位不是越大越好，而要与任务对应。[Titanic](/zh/posts/kaggle-01-titanic/) 的普通验证与关系组压力验证有明显差距；如果部署允许观察同行者信息，组外压力题比实际任务更严。相反，[GI Tract](/zh/posts/kaggle-11-gi-tract/) 讨论新病人时，就不能把同一病人的切片随机拆开。

## 用一条数据血缘检查，比背诵 OOF 更有效

设某行属于保留组 G。沿着它最终预测的全部依赖反向追踪：编码器或词表、统计特征、模型初始化、检查点选择、校准参数、融合权重。只要其中任何一个部件读过 G 的标签，这行就不是在所有层面都未被选择使用。

```text
标签 → 参数拟合                 明确允许的拟合集
标签 → 特征统计 → 模型           统计也要在折内
标签 → 检查点／阈值／权重        属于选择，不是独立测试
无标签属性 → 关系或分组          说明传导式与可用时间条件
```

OOF 能阻止模型直接拟合当前行，却不自动阻止这些旁路。Name That LLM 的外部语料筛选、CommonLit 的折内停止、多个项目的混合选择，都需要连同 OOF 一起说明。验证不是一个函数名，而是完整的学习过程。

工程上还应检查边界本身：组 ID 是否重复、每个保留样本是否恰好有一份预测、未知类别是否有回退、整个组是否穿透到另一个集合。模型分数没有机会替这些逻辑错误作证。

## 第二层：数据边界也要穿过每一个转换

不泄漏标签，不只是不把标签列放进特征。目标编码、均值填补、类别字典、词表、阈值和特征选择，都可能读到不该读的样本。

[SF Crime](/zh/posts/kaggle-13-sf-crime/) 的目标统计要排除当前保留周；[Name That LLM](/zh/posts/kaggle-02-name-that-llm/) 的词表拟合有自己的外部数据边界；[销量预测](/zh/posts/kaggle-07-future-sales/) 的首次售出月份不能读取未来。共同点是：**每个从数据学出的部件，都需要一个明确的拟合集。**

反过来，无标签的全量结构信息不应被笼统称为标签泄漏，但必须说明传导式使用的范围与许可。是否可用、是否跨过标签边界，是两个问题。

## 第三层：把拟合、选择与判断分开

fit 用来学习参数，stop 用来选择轮次，tune 可以选择阈值和混合，audit 用来在选择冻结后提供另一次检查。这个四段结构帮助解释数据用途，却不是所有数据集必须照抄的配方。

数据少时，过度切分会让每部分都不稳定；可以考虑分组交叉拟合或嵌套选择，但计算成本也会上升。更重要的是诚实记录复用：[CommonLit](/zh/posts/kaggle-16-commonlit/) 按题留出的 OOF 同时参与检查点选择，只有四个题目，不能改名为“完全未触碰测试集”。

OOF 只说明每一行的预测来自没直接拟合该行的模型，不自动说明超参数、外部数据筛选、停止与混合也完全没用过它。

## 有多少行，不等于有多少独立证据


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/01/validation.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · 从 17 个项目抽象验证设计"><img src="/kaggle/01/validation.svg" alt="四个内部方案在普通重复交叉验证与整组压力协议下的 accuracy。两个协议回答不同泛化问题；不是四个官方得分。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · 从 17 个项目抽象验证设计</strong> 四个内部方案在普通重复交叉验证与整组压力协议下的 accuracy。两个协议回答不同泛化问题；不是四个官方得分。<br /><a href="/kaggle/01/validation.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/01/validation.csv" download>下载聚合指标 CSV</a> · <a href="/zh/kaggle/sources/#fig-01-validation">图表出处与口径</a></figcaption>
</figure>


CommonLit 有 7,165 行摘要，但只有四个题目。若关心的是换题目泛化，重采样摘要行会低估题目层级的不确定性；重复随机种子也不会创造新的题目。GI 的很多切片、Titanic 的很多关系成员，同样提醒我们区分行数和独立单位。

不同重复验证之间还共享大量训练样本，所以重复次数不应该直接被当作独立实验数来缩窄区间。bootstrap 的单位应尽可能对应问题里的相关结构，但分组很少时，任何精确数字都需要谨慎解释。

这并不要求每个项目都无限增加验证。实际取舍是：先把当前能够支持的结论说清楚，再把下一份预算花在新的独立单位、不同时间原点或外部条件上。若只是反复用同一 audit 挑阈值，就把它重新归类为开发数据，不必维护一个形式上漂亮、事实已经失去独立性的名字。

## 第四层：给结论一个适用范围

比较新旧模型时，应尽量固定分组、特征来源和评估口径。一次组合包官方提升可以证明组合结果更好，但无法拆出每个部件的因果贡献。反复看同一 audit 后再改方案，也会逐渐消耗它的独立性。

我会在开始一场新比赛前写下五句话：未来最可能陌生的是谁；哪些信息在当时可得；哪些集合用于选择；哪些结果只作诊断；哪一个观察会让当前假设被否决。这样，分数变化才能被翻译成判断，而不只是排行榜上的一个数字。

## 资料与证据

- [项目验证与实验标准](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md)
- 上述各比赛复盘均链接其原始实验记录；这些归纳不代表对其他数据分布已经完成了验证。

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/zh/kaggle/sources/#protocol)列出了本文的结果口径、记录日期与可核对范围。
