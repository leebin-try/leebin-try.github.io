---
title: "SF Crime: smooth target statistics still need a real fitting boundary"
description: "Address structure helps, but its label statistics must remain replayable inside week-separated folds."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 13, "topic": "表格学习", "status": "已出分", "result": "Public / private log loss 2.20261 / 2.20261", "evidenceDate": "2026-11-24", "source": "https://leebin-try.github.io/kaggle/sources/#case-13", "competitionUrl": "https://www.kaggle.com/competitions/sf-crime", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/docs/results.md", "submission": "58814002"}
coverImage: "/kaggle/13/cover.svg"
coverAlt: "Original subject illustration: SF Crime: smooth target statistics still need a real fitting boundary"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: use address statistics without allowing the current week’s answers to return as features. The 80% CatBoost/20% XGBoost package scores 2.20261 official log loss; smoothing cannot substitute for a correct data boundary.**

## Problem: predict 39 probabilities, not only the most common class

Inputs include time, district, address and coordinates; output contains probabilities for 39 crime categories. Log loss penalizes assigning too little mass to the true class. A rare class matters even when it seldom becomes the argmax.

Weeks share temporal conditions and nearby addresses share local activity. Row-random splitting can expose familiar local statistics. Whole-week random grouping reduces that overlap, but is not strict past-to-future forecasting.

With 878,049 labels, broad statistics are feasible, while wide tables, class expansion and concurrent model copies become material memory costs.

## Technical approach and pipeline

**Pipeline:** assign complete weeks to data roles; build address representations and cross-fitted label statistics within fit; compare CatBoost/XGBoost; select and freeze an 80/20 probability mixture; refit and cover all 39 columns.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/13/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: SF Crime"><img src="/kaggle/13/method.svg" alt="Original method diagram for SF Crime. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · SF Crime</strong> Original method diagram for SF Crime. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/13/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-13-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Separate address descriptions from learned target statistics

The experiment compares address-aware CatBoost, a basic XGBoost and target-statistic XGBoost. Outer Monday-week groups define fit, stop, tune and audit; five inner week folds construct statistics for fitting rows.

Preprocessing and label aggregates learn only from the relevant fitting population. The held-out week cannot re-enter through a differently named lookup table. This is a fixed group protocol, not evidence of strict future extrapolation.

### Smoothing does not remove self-information

A statistic such as `(class_count + alpha * prior)/(group_count + alpha)` still contains the row’s answer if computed on its own fitting group. Smoothing controls variance, not data access.

```text
Outer fitting weeks
 -> inner week cross-fitting -> target features for fitting rows
 -> rebuild on all outer fit -> features for stop/tune/audit
```

Use fitting-derived priors and explicit fallbacks for sparse or unseen addresses. Every transform should be reproducible under a frozen outer split. Labels should influence fitting parameters and allowed selection, never their own held-out features.

## Evaluation

Lower 39-class log loss is better. The entire probability vector is scored, so reasonable probabilities for rare outcomes matter; filling them with zero is not a harmless shortcut.

Whole-week outer roles and inner cross-fitting control correlated label access. Bootstrap on the same mixture-tuning data remains diagnostic. A frozen audit and official test provide distinct evidence; none turns week-random grouping into past-to-future validation.

## Results and evidence



### Which comparisons hold configuration fixed

The basic and target-feature XGBoost arms supply a more controlled feature comparison than the final cross-model mixture. Address-aware CatBoost and the chosen blend involve other representation and model changes.

Interpret a target-feature gain at that level rather than assign the final official package’s benefit entirely to one statistic. Retain fitting priors and all inner-week boundaries with the result.

### Official score and attribution have different limits

The final 80% CatBoost/20% target-feature XGBoost refit scored **2.20261 public and private log loss**. The main workflow took about **74 minutes** and covered **884,262 test IDs** with 39 probabilities each.

Frozen audit loss was **2.21344**, compared with the fitting-prior reference **2.68081**. Mixture gains and a week bootstrap reused tuning data, while the audit was evaluated after freezing. One fixed split does not become repeated independent evidence.

### Learning curves, ablations and mixtures answer different questions

Target-feature XGBoost selected round 137, while training loss continued downward; CatBoost selected 1,625. Rounds are not a common cost unit across models.

The same-setting feature comparison is closer to an ablation. The selected 80/20 blend is a combination result. Tuning-data resampling cannot wash away mixture selection. Next, change only address hierarchy under fixed weeks and verify it in a new time window.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/13/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: SF Crime"><img src="/kaggle/13/learning.svg" alt="v6 / 25-round log samples plus selected and final observations. Dashed lines show selected rounds. Sampling is disclosed; no unlogged validation values are reconstructed." width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · SF Crime</strong> v6 / 25-round log samples plus selected and final observations. Dashed lines show selected rounds. Sampling is disclosed; no unlogged validation values are reconstructed.<br /><a href="/kaggle/13/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/13/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-13-learning">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** the address/tree pipeline is supported, with its more specific mechanism evidence coming from the fixed-setting feature comparison. Focus next on sparse-address fallback and temporal change before assigning independent credit to all components.

### Make leakage prevention a replayable computation

A reliable boundary should exist in the calculation, not merely in a narrative statement that data was split. Keep the origin of priors, category mappings and target statistics so the features can be rebuilt independently.

A useful new comparison states what changed, which labels were allowed and which dataset selected the mixture. That makes later errors easier to distinguish from interface or memory failures.

## Next experiments

These designs have not executed.

1. Fix models, weeks and smoothing; change address aggregation level and report losses for rare versus familiar addresses.
2. Add a strict future window, with fallback rules if the week-group gain fails to transfer.
3. Retain peak memory for expanded statistics and parallel copies; do not buy an uncontrolled processing cost for an unconfirmed tiny gain.

### A wide table consumes more than its original columns

As a dimensional estimate, 878,049 rows × 39 FP32 columns occupy about 137 MB before indexes, joins, copies, bins and concurrent candidates. It is not a measured peak-memory claim.

Temporary features and library conversions can dominate memory. Measure the complete path under actual concurrency, retaining the distinction between an arithmetic lower bound and observed device/host use.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/sf-crime)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/13_sf_crime/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-13)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
