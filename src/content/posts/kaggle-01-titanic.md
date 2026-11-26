---
title: "Titanic：关系特征的价值，取决于你怎样切分人群"
description: "同一张船票、同一个家庭可以提供信号，也会改变验证题目。比换模型更重要的，是说明这些关系何时可用。"
date: "2026-11-26"
category: "Kaggle"
tags: ["表格学习", "Titanic", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 1, "topic": "表格学习", "status": "已出分", "result": "Public accuracy 0.80861", "evidenceDate": "2026-11-19", "source": "https://leebin-try.github.io/kaggle/sources/#case-01", "competitionUrl": "https://www.kaggle.com/competitions/titanic", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/docs/wcg-results.md", "submission": "58538264"}
coverImage: "/kaggle/01/cover.svg"
coverAlt: "Titanic 轮船与同行关系网络，突出关系组验证的任务结构"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

**核心判断：关系特征的价值，取决于预测时能否看到同行者的信息。Titanic 当前组合的官方 accuracy 为 0.80861，但整组留出验证没有建立专家模型相对纯关系规则的额外收益；结论应限定到已验证的场景。**

## 问题定位：一行乘客，还是一组共同经历的人

输入是乘客属性，输出是二分类生存标签，指标是测试集 accuracy。只有 891 行标签意味着，一个小组或少数乘客的变化就能改变内部排序。把乘客当作独立行，是建模时的便利假设，不是已经证明的事实：家庭决策、同行关系和舱位分布会让他们的结局相关。

这种相关性有两个不同用途。票号、姓氏等无标签属性可用于构造关系；组内生存比例则必须由标签学习。前者回答“谁可能同行”，后者回答“已知同行者的结局能否帮助预测”。如果这两层写在同一个全表聚合里，很容易在做验证切分之前已经泄漏标签。

因此，首先应明确测试情境：是补全同一批关系网络中的未知乘客，还是预测一批完全没有已知同行者的新乘客？前一种可以利用已有关系，后一种需要模型在关系信号缺失时仍然工作。一个协议未必同时估准两种情境。

## 技术思路与路线

**路线概览：**无标签属性建立同行关系 → 在每个拟合折内学习结局映射 → 按人群路由至规则或 XGBoost → 比较普通与整组验证 → 完整生成测试标签。

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/01/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Titanic"><img src="/kaggle/01/method.svg" alt="原创流程与验证边界示意。Titanic 轮船与同行关系网络，突出关系组验证的任务结构；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Titanic</strong> 原创流程与验证边界示意。Titanic 轮船与同行关系网络，突出关系组验证的任务结构；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/01/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-01-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

### 方法：先建关系，再决定怎样使用标签

这组实验把姓氏、舱位、归并后的票号、票价和登船港组合成女性／儿童关系组。女性与 `Master` 称谓的男童可共享组内证据；成年男性的标签不进入这个结局映射，歧义关联也不强行补全。其余乘客再交给按人群划分的 CUDA XGBoost 专家。

结构关系使用全部 1,309 人的无标签属性，这是明确的传导式预处理选择。**结局映射却只能读取当前拟合集的标签**，每一折都要重建。允许观察一个人的船票，不等于允许观察他的答案。

关系组设计参考了 cdeotte、mviola 等作者的公开 WCG 工作；当前专家组合与验证属于项目里的改编，不是对公开标题成绩的完整复现。

### 实现展开：把关系图和结局映射分成两个对象

下面的伪代码解释边界，省略了具体键规则与专家参数，不是重新运行训练：

```python
membership = build_groups(all_unlabeled_covariates)
for fit_ids, held_ids in split_protocol:
    outcome_map = fit_group_outcomes(membership, labels[fit_ids])
    features_fit = cross_fit_outcomes(fit_ids, membership, labels)
    features_held = apply_outcomes(held_ids, outcome_map)
    evaluate_role_experts(features_fit, features_held)
```

`membership` 可以在许可的传导式设置下由全体无标签属性产生；`outcome_map` 每一折必须重新拟合。用于训练自身的目标统计也需要交叉拟合，不能让一个人的标签直接变成自己的特征。女性与男童的规则和成年男性的专家路线分开，是当前方案的领域假设；不是所有具有相同票价的人都应被强制合并。

一个合成例子可以说明差别：假设同行组 A 的两个有标签成员都生存，第三人的标签待预测。普通行切分可能让这项关系证据可用；整组留出则完全移走 A 的结局。两者的差距不是某个切分“算错了”，而是考题改变了。歧义键或弱连接还可能错误传播结局，所以“未匹配”和“多重候选”应该保留为状态，不是用猜测填满。

## 评价方式

Accuracy 是预测正确的乘客数占全部被评分乘客的比例，越高越好。普通重复五折检验“可能有已知同行者”的情况，整组留出检验“整组结局都未知”的情况；它们回答不同问题，不能混成一个平均分。

每折重建标签映射后才计算验证结果。官方测试集上的分数单列，用于判断比赛改进；内部协议用于定位改进发生在哪类乘客。当前没有通过逐项消融分离关系规则、票价处理和专家模型的贡献。

## 结果与证据

### 证据：分数之间的落差本身值得保留

| 观察口径 | 选中方案的 accuracy |
| --- | ---: |
| 普通分层重复五折均值 | 0.847737 |
| 整个关系组留出的压力验证 | 0.821549 |
| 官方 Public | 0.80861 |

官方成绩从前一版 0.79665 到 0.80861，提高 1.196 个百分点，在 418 个测试样本上约对应净增五个正确预测。这里的两种内部验证不能替代官方分数，也不能用普通交叉验证的高分掩盖陌生关系组上的回落。

### 如何解读对照图，而不替结果补因果

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/01/validation.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Titanic"><img src="/kaggle/01/validation.svg" alt="四个内部方案在普通重复交叉验证与整组压力协议下的 accuracy。两个协议回答不同泛化问题；不是四个官方得分。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Titanic</strong> 四个内部方案在普通重复交叉验证与整组压力协议下的 accuracy。两个协议回答不同泛化问题；不是四个官方得分。<br /><a href="/kaggle/01/validation.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/01/validation.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-01-validation">图表出处与口径</a></figcaption>
</figure>

下图把四个内部方案放在相同的两种协议下。普通重复验证中，加入关系规则后只出现小幅增益；关系组压力验证中，纯规则和专家组合的平均值相同。后一个现象意味着，当前压力协议没有单独建立专家路线的增量，不能将官方组合提升全部归到 XGBoost。

两个协议的均值之间也不是一条可以相减后称为“泄漏比例”的刻度：验证样本的分组、训练可用关系和估计目标都不同。更合理的后续诊断，是分开统计已知关系组、完全新组、歧义匹配和无匹配乘客，并同时报告每组支持数。

一个能推翻当前解释的实验是：固定规则、训练行和阈值，只替换票价表示；若跨多次分组验证仍没有稳定增益，就撤回“人均票价是主要原因”的假设。只有保持其他部件不变，才开始接近对单个机制的识别。对 418 个测试样本的官方结果，尤其不适合用一次微小变动推断精确的普遍收益。

## 思考与结论

**结论：**当前值得保留的是关系结构和验证边界共同设计的做法。证据支持最终组合优于前一版官方提交；它不足以支持“树更复杂，所以所有乘客都预测得更好”。

### 观点：验证协议应写出“你准备遇见谁”

关系组切分更严，却不自动意味着它永远更合适。如果真实任务允许观察同一家庭的部分成员，完全隔离家庭是在测试更难的外推能力；如果目标是服务新家庭，随机拆散家庭又会过于乐观。合理的做法是把两种能力分开报告。

这次只有最终组合有新的官方评分，不能把全部收益分别归因于票价处理、关系规则、分段模型或 GPU。下一次更有解释力的实验，应固定关系定义与切分，只替换其中一个部件，并对未匹配、歧义匹配、新关系组分别看误差。

这条经验可以迁移到客户、设备、医院、商户等带实体关系的数据：先画出样本之间的联系，再决定哪些联系能够跨过验证边界。

## 下一步

以下是按优先级排列的后续实验设计，尚未执行；通过条件与比较口径应在运行前固定。

1. 固定分组与规则，只替换票价表示。比较各折净纠正数；若增益随分组改变而消失，就不把它保留为稳定改进。
2. 按已知同行者、新关系组和歧义匹配分层报告支持数与错误。优先处理错误传播，而非统一加深模型。
3. 候选通过内部比较后，再核对同口径官方结果；一次测试集净增少数乘客，不能代替新的独立确认。

### 进一步辨析：同一个提升，可能来自不同人群

普通验证中，专家组合比纯 WCG 规则高约 0.000749，而整组压力协议中的均值相同。这让“所有收益都来自更复杂树模型”的解释站不住脚。反过来，也不能因为压力协议打成平手，就认为专家对实际测试关系结构完全无用。

下一轮可以固定最终规则与普通折，把错误按是否有已知同行者、关系组大小与歧义匹配分层。每层同时保留支持数和相对控制组的净纠正数，再按真实部署总体加权。分层只用无标签条件定义，不能事后按预测对错挑一批容易样本。

这是一个尚未执行的实验设计：若专家只在小部分有关系样本上改善，而新组没有变化，就将结论限定在那里；若改变匹配键后新组反而更差，就优先检查错误传播，而不是继续增加树深。一次官方净增五人的结果，更需要这种范围明确的解释。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/titanic)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/docs/wcg-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-01)列出了本文的结果口径、记录日期与可核对范围。
