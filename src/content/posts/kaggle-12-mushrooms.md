---
title: "毒蘑菇分类：接近满分时，微小差异更需要克制"
description: "单模型与融合在 Public、Private 上互有胜负。MCC 阈值、独立审计与不确定性，比多报几位小数更重要。"
date: "2026-11-26"
category: "Kaggle"
tags: ["表格学习", "Binary Prediction of Poisonous Mushrooms", "竞赛复盘"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 12, "topic": "表格学习", "status": "已出分", "result": "Public / private MCC 0.98497 / 0.98472（单模型）", "evidenceDate": "2026-11-21", "source": "https://leebin-try.github.io/kaggle/sources/#case-12", "competitionUrl": "https://www.kaggle.com/competitions/playground-series-s4e8", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/docs/results.md", "submission": "58646630"}
---

当分数已经接近 0.985，多加几位小数很容易制造“确定地进步了”的错觉。我的判断是：**差距越小，越应该同时交代选择方式、独立检查与不确定性。**

## 方法：比较表示，而不是默认所有列都同一种处理

这组实验对照原始类别与稀有类别合并的 XGBoost，以及混合特征表示与全类别表示的 CatBoost。数据划成 70／10／10／10 的 fit、stop、tune、audit：轮次选择、融合阈值选择和最后的独立审计分开。

最终候选包括原始类别 XGBoost 单模型，以及 75% XGBoost、25% CatBoost 的混合。选出的混合阈值为 0.551；单模型使用 0.5。MCC 是硬判定后的相关性指标，阈值会改变它，不是概率训练结束后可忽略的细节。

## 真实结果没有给出一个无条件赢家

| 候选 | 官方 Public MCC | 官方 Private MCC |
| --- | ---: | ---: |
| 单模型 | 0.98497 | 0.98472 |
| 混合 | 0.98494 | 0.98473 |

混合在 public 少 0.00003，在 private 多 0.00001。独立审计上的混合与单模型差异也很小，配对 bootstrap 区间跨过零。这些记录不足以建立“融合稳定更好”的结论。

较弱的全类别 CatBoost 没有进入融合。把数值列全转为类别，或合并稀有值，并没有在这组固定配置下建立强收益；不能因为这些技巧看起来合理，就预设它们有效。

## 观点：复杂度要拿出证据，而不是拿出小数位

如果新增模型只改变十万分之一级别的指标，还应考虑推断成本、实现风险、阈值敏感性和再次验证的费用。相反，既不能因小差异断言提升，也不能因一次无显著增益，就断言这类模型永远无用。

这组结果也没有严格达到原定 public 0.98500，更没有达到历史 public 参考 0.98528。四舍五入写成“约 0.985”可以帮助阅读，但判断目标是否完成时仍须看完整数字。

下一次更有信息量的尝试，是保持样本划分与模型配置不变，独立检验新的特征来源或阈值稳定性，而不是拿同一个 audit 继续挑一个看起来更好的小数。

## 资料与证据

- [官方比赛页面](https://www.kaggle.com/competitions/playground-series-s4e8)
- [本篇依据的实验记录（私有源仓库，需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/docs/results.md)
- [对应代码与版本（需访问权限）](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#case-12)列出了本文的结果口径、记录日期与可核对范围。
