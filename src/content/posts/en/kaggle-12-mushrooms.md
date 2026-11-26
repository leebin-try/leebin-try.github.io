---
title: "Mushroom classification: more decimal places do not establish a better ensemble"
description: "Representation, thresholds and uncertainty must be separated when official MCC differences are extremely small."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 12, "topic": "表格学习", "status": "已出分", "result": "Public / private MCC 0.98497 / 0.98472 (single model)", "evidenceDate": "2026-11-21", "source": "https://leebin-try.github.io/kaggle/sources/#case-12", "competitionUrl": "https://www.kaggle.com/competitions/playground-series-s4e8", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/docs/results.md", "submission": "58646630"}
coverImage: "/kaggle/12/cover.svg"
coverAlt: "Original subject illustration: Mushroom classification: more decimal places do not establish a better ensemble"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: a stable ensemble advantage was not established. Official differences are on the order of one hundred-thousandth and the paired audit interval crosses zero. Added complexity should follow confirmable value.**

## Problem: a probability is not a decision, and accuracy is not MCC

The output is edible/poisonous classification scored by Matthews correlation coefficient. MCC depends jointly on true/false positives and negatives, so neither class proportions nor the total correct count alone explains it.

A threshold converts probabilities into the scored confusion matrix. Fitting, early stopping, threshold selection and final assessment therefore need separate roles. The fixed 70/10/10/10 split supplies them, while one split still has sampling uncertainty.

Feature representation is another real variable: continuous values permit ordered splits; treating everything as categorical requires learning discrete relations. No representation wins by definition.

## Technical approach and pipeline

**Pipeline:** fixed fit/stop/tune/audit groups; compare numeric and categorical representations; select XGBoost/CatBoost candidates; choose weights and thresholds only on tune; freeze, audit and submit.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/12/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Mushroom classification"><img src="/kaggle/12/method.svg" alt="Original method diagram for Mushroom classification. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Mushroom classification</strong> Original method diagram for Mushroom classification. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/12/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-12-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Compare representations instead of assuming one treatment

The experiment compares raw and rare-pooled XGBoost categories, plus mixed and all-categorical CatBoost. Data roles are 70% fitting and three 10% groups for stopping, mixture/threshold tuning and frozen audit.

Final candidates include the raw-category XGBoost alone and a 75% XGBoost/25% CatBoost mixture. Their selected thresholds differ: 0.5 for the single model and 0.551 for the mixture. Thresholding is part of the fitted system, not a negligible formatting step.

### Separate representation choices from decision choices

First compare input representations under the same data roles, then compare probability combinations and thresholds without moving the audit boundary.

```text
fit: model parameters and category rules
stop: training rounds
tune: probability weights and threshold
audit: evaluate the frozen choice, without tuning back
```

Rare pooling changes which distinctions the learner can retain. Converting numeric columns to categories changes the meaning of neighbourhood. A useful ablation changes one of these decisions at a time.

## Evaluation

MCC measures correlation between binary decisions and labels; higher is better. Threshold changes affect it, and multiplying an MCC difference by row count does not yield an additional-correct count.

The paired audit bootstrap difference spans zero. That means the present evidence does not establish a stable winner, not that the systems are equivalent in every population. Keep full official decimals when judging a target and report public/private separately.

## Results and evidence



### No unconditional winner emerged

| Candidate | Public MCC | Private MCC |
| --- | ---: | ---: |
| Single model | 0.98497 | 0.98472 |
| Mixture | 0.98494 | 0.98473 |

The mixture loses 0.00003 public and gains 0.00001 private. Its audit difference is likewise small with an interval crossing zero. The weaker all-categorical CatBoost was excluded. Neither rare pooling nor making every feature categorical established a strong benefit in these fixed configurations.

### Show small effects without exaggerating them

The representation chart starts bars at zero and prints exact values, rather than using a narrow axis to make tiny MCC differences look dramatic.

Consider inference cost, implementation risk and threshold sensitivity alongside these results. The original public 0.98500 target and historical 0.98528 reference were not strictly reached. Rounding to “about 0.985” is acceptable exposition, but not proof of target completion.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/12/audit-ablation.svg" target="_blank" rel="noopener" aria-label="Enlarge: Mushroom classification"><img src="/kaggle/12/audit-ablation.svg" alt="Independent audit; four representation arms. Small differences should be read numerically, not exaggerated by a truncated axis. Mixture-minus-single bootstrap spans zero." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Mushroom classification</strong> Independent audit; four representation arms. Small differences should be read numerically, not exaggerated by a truncated axis. Mixture-minus-single bootstrap spans zero.<br /><a href="/kaggle/12/audit-ablation.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/12/audit-ablation.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-12-audit-ablation">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** retain an understandable, lower-cost baseline and both actual score receipts. Continue blending only when new evidence justifies its maintenance and inference cost.

### Complexity needs evidence, not extra decimals

A tiny selected difference can reflect the threshold, sample or search process. Conversely, one inconclusive comparison does not prove a model family is useless.

Freeze the current split and configuration when testing new information, then seek separate confirmation. Reusing the audit until another attractive decimal appears destroys its original role.

## Next experiments

These designs remain unexecuted.

1. Freeze model and rows; change either representation or threshold rule, not both together.
2. In a new confirmation protocol, retain confusion matrices and paired differences, checking for a benefit limited to one selected threshold.
3. Compare complete inference cost. If quality remains indistinguishable, choose maintainability without claiming universal algorithmic superiority.

### An MCC difference cannot be converted to corrected examples

MCC is nonlinear in all four confusion counts. Two systems with a similar MCC may make different errors, and the same net number of corrections can produce different MCC changes under different class distributions.

Retain paired decisions and class supports to investigate the mechanism. The bootstrap describes the frozen comparison under its sampling assumptions; it cannot erase the earlier model and threshold selection.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/playground-series-s4e8)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/12_playground_series_s4e8/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-12)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
