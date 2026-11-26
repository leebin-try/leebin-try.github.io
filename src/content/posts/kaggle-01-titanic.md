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

Titanic 给我的核心判断是：**一条强特征，总带着一个关于使用场景的假设。** 家人、票友的生存信息很有用，但“已知部分同行者的结局”与“遇到完全陌生的一组乘客”，并不是同一道预测题。

## 问题定义：一行乘客，还是一组共同经历的人

输入是乘客属性，输出是二分类生存标签，指标是测试集 accuracy。只有 891 行标签意味着，一个小组或少数乘客的变化就能改变内部排序。把乘客当作独立行，是建模时的便利假设，不是已经证明的事实：家庭决策、同行关系和舱位分布会让他们的结局相关。

这种相关性有两个不同用途。票号、姓氏等无标签属性可用于构造关系；组内生存比例则必须由标签学习。前者回答“谁可能同行”，后者回答“已知同行者的结局能否帮助预测”。如果这两层写在同一个全表聚合里，很容易在做验证切分之前已经泄漏标签。

因此，首先应明确测试情境：是补全同一批关系网络中的未知乘客，还是预测一批完全没有已知同行者的新乘客？前一种可以利用已有关系，后一种需要模型在关系信号缺失时仍然工作。一个协议未必同时估准两种情境。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/01/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · Titanic"><img src="/kaggle/01/method.svg" alt="原创流程与验证边界示意。Titanic 轮船与同行关系网络，突出关系组验证的任务结构；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · Titanic</strong> 原创流程与验证边界示意。Titanic 轮船与同行关系网络，突出关系组验证的任务结构；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/01/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-01-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 方法：先建关系，再决定怎样使用标签

这组实验把姓氏、舱位、归并后的票号、票价和登船港组合成女性／儿童关系组。女性与 `Master` 称谓的男童可共享组内证据；成年男性的标签不进入这个结局映射，歧义关联也不强行补全。其余乘客再交给按人群划分的 CUDA XGBoost 专家。

结构关系使用全部 1,309 人的无标签属性，这是明确的传导式预处理选择。**结局映射却只能读取当前拟合集的标签**，每一折都要重建。允许观察一个人的船票，不等于允许观察他的答案。

关系组设计参考了 cdeotte、mviola 等作者的公开 WCG 工作；当前专家组合与验证属于项目里的改编，不是对公开标题成绩的完整复现。

## 实现展开：把关系图和结局映射分成两个对象

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

## 证据：分数之间的落差本身值得保留

| 观察口径 | 选中方案的 accuracy |
| --- | ---: |
| 普通分层重复五折均值 | 0.847737 |
| 整个关系组留出的压力验证 | 0.821549 |
| 官方 Public | 0.80861 |

官方成绩从前一版 0.79665 到 0.80861，提高 1.196 个百分点，在 418 个测试样本上约对应净增五个正确预测。这里的两种内部验证不能替代官方分数，也不能用普通交叉验证的高分掩盖陌生关系组上的回落。

## 如何解读对照图，而不替结果补因果


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/01/validation.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · Titanic"><img src="/kaggle/01/validation.svg" alt="四个内部方案在普通重复交叉验证与整组压力协议下的 accuracy。两个协议回答不同泛化问题；不是四个官方得分。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · Titanic</strong> 四个内部方案在普通重复交叉验证与整组压力协议下的 accuracy。两个协议回答不同泛化问题；不是四个官方得分。<br /><a href="/kaggle/01/validation.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/01/validation.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-01-validation">图表出处与口径</a></figcaption>
</figure>


下图把四个内部方案放在相同的两种协议下。普通重复验证中，加入关系规则后只出现小幅增益；关系组压力验证中，纯规则和专家组合的平均值相同。后一个现象意味着，当前压力协议没有单独建立专家路线的增量，不能将官方组合提升全部归到 XGBoost。

两个协议的均值之间也不是一条可以相减后称为“泄漏比例”的刻度：验证样本的分组、训练可用关系和估计目标都不同。更合理的后续诊断，是分开统计已知关系组、完全新组、歧义匹配和无匹配乘客，并同时报告每组支持数。

一个能推翻当前解释的实验是：固定规则、训练行和阈值，只替换票价表示；若跨多次分组验证仍没有稳定增益，就撤回“人均票价是主要原因”的假设。只有保持其他部件不变，才开始接近对单个机制的识别。对 418 个测试样本的官方结果，尤其不适合用一次微小变动推断精确的普遍收益。

## 观点：验证协议应写出“你准备遇见谁”

关系组切分更严，却不自动意味着它永远更合适。如果真实任务允许观察同一家庭的部分成员，完全隔离家庭是在测试更难的外推能力；如果目标是服务新家庭，随机拆散家庭又会过于乐观。合理的做法是把两种能力分开报告。

这次只有最终组合有新的官方评分，不能把全部收益分别归因于票价处理、关系规则、分段模型或 GPU。下一次更有解释力的实验，应固定关系定义与切分，只替换其中一个部件，并对未匹配、歧义匹配、新关系组分别看误差。

这条经验可以迁移到客户、设备、医院、商户等带实体关系的数据：先画出样本之间的联系，再决定哪些联系能够跨过验证边界。

## 进一步辨析：同一个提升，可能来自不同人群

普通验证中，专家组合比纯 WCG 规则高约 0.000749，而整组压力协议中的均值相同。这让“所有收益都来自更复杂树模型”的解释站不住脚。反过来，也不能因为压力协议打成平手，就认为专家对实际测试关系结构完全无用。

下一轮可以固定最终规则与普通折，把错误按是否有已知同行者、关系组大小与歧义匹配分层。每层同时保留支持数和相对控制组的净纠正数，再按真实部署总体加权。分层只用无标签条件定义，不能事后按预测对错挑一批容易样本。

这是一个尚未执行的实验设计：若专家只在小部分有关系样本上改善，而新组没有变化，就将结论限定在那里；若改变匹配键后新组反而更差，就优先检查错误传播，而不是继续增加树深。一次官方净增五人的结果，更需要这种范围明确的解释。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/titanic)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/docs/wcg-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-01)列出了本文的结果口径、记录日期与可核对范围。
