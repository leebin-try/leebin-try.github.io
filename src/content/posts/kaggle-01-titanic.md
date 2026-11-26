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
---

Titanic 给我的核心判断是：**一条强特征，总带着一个关于使用场景的假设。** 家人、票友的生存信息很有用，但“已知部分同行者的结局”与“遇到完全陌生的一组乘客”，并不是同一道预测题。

## 方法：先建关系，再决定怎样使用标签

这组实验把姓氏、舱位、归并后的票号、票价和登船港组合成女性／儿童关系组。女性与 `Master` 称谓的男童可共享组内证据；成年男性的标签不进入这个结局映射，歧义关联也不强行补全。其余乘客再交给按人群划分的 CUDA XGBoost 专家。

结构关系使用全部 1,309 人的无标签属性，这是明确的传导式预处理选择。**结局映射却只能读取当前拟合集的标签**，每一折都要重建。允许观察一个人的船票，不等于允许观察他的答案。

关系组设计参考了 cdeotte、mviola 等作者的公开 WCG 工作；当前专家组合与验证属于项目里的改编，不是对公开标题成绩的完整复现。

## 证据：分数之间的落差本身值得保留

| 观察口径 | 选中方案的 accuracy |
| --- | ---: |
| 普通分层重复五折均值 | 0.847737 |
| 整个关系组留出的压力验证 | 0.821549 |
| 官方 Public | 0.80861 |

官方成绩从前一版 0.79665 到 0.80861，提高 1.196 个百分点，在 418 个测试样本上约对应净增五个正确预测。这里的两种内部验证不能替代官方分数，也不能用普通交叉验证的高分掩盖陌生关系组上的回落。

## 观点：验证协议应写出“你准备遇见谁”

关系组切分更严，却不自动意味着它永远更合适。如果真实任务允许观察同一家庭的部分成员，完全隔离家庭是在测试更难的外推能力；如果目标是服务新家庭，随机拆散家庭又会过于乐观。合理的做法是把两种能力分开报告。

这次只有最终组合有新的官方评分，不能把全部收益分别归因于票价处理、关系规则、分段模型或 GPU。下一次更有解释力的实验，应固定关系定义与切分，只替换其中一个部件，并对未匹配、歧义匹配、新关系组分别看误差。

这条经验可以迁移到客户、设备、医院、商户等带实体关系的数据：先画出样本之间的联系，再决定哪些联系能够跨过验证边界。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/titanic)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/docs/wcg-results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-01)列出了本文的结果口径、记录日期与可核对范围。
