---
title: "CMI: overall Kappa can look useful while the rarest class is never identified"
description: "Ordinal regression, checkpoint loss and threshold decisions require separate evaluation, including the most severe class."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 15, "topic": "表格学习", "status": "已出分", "result": "Public / private QWK 0.438 / 0.391", "evidenceDate": "2026-11-25", "source": "https://leebin-try.github.io/kaggle/sources/#case-15", "competitionUrl": "https://www.kaggle.com/competitions/child-mind-institute-problematic-internet-use", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/docs/results.md", "submission": "58872372"}
coverImage: "/kaggle/15/cover.svg"
coverAlt: "Original subject illustration: CMI: overall Kappa can look useful while the rarest class is never identified"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: an overall QWK does not establish recognition of every severity level. Official CMI scores are 0.438/0.391, but all seven highest-level audit participants were missed. The next selection protocol should include that failure explicitly.**

## Problem: regress severity, then make four ordered decisions

Labels 0–3 are ordered: a two-level error is usually worse than an adjacent one. The baseline predicts a continuous severity score, then applies three increasing thresholds. This assumes the score’s ordering and scale admit a useful global partition.

Quadratic weighted Kappa can be summarized as one minus weighted observed disagreement divided by weighted chance disagreement. It depends on the predicted class distribution and is not a simple transform of RMSE.

Development participants and a frozen independent audit are separate. IDs and PCIAT-derived target fields are excluded. Activity records were not used in this round, so the result neither rejects nor proves their value.

## Technical approach and pipeline

**Pipeline:** exclude identifiers and target derivatives; participant-level fivefold ordinal regression; select model and ordered thresholds on development OOF; freeze and inspect audit; refit XGBoost for 108 rounds on all labels.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/15/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: CMI"><img src="/kaggle/15/method.svg" alt="Original method diagram for CMI. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · CMI</strong> Original method diagram for CMI. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/15/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-15-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Continuous predictions with learned ordered boundaries

The comparison used 58 tabular inputs plus missing-count information, with CatBoost and XGBoost regressors. Fivefold development OOF selected weights and thresholds before inspecting 548 audit participants.

The final CatBoost weight was zero. XGBoost was refitted on all 2,736 labelled participants for 108 rounds, using fixed boundaries **0.55/1.10/1.45**. This round used no activity records, pseudo-labels or external pretrained weights.

### Treat three thresholds as one fitted decision component

Thresholds are compared jointly on development OOF while remaining ordered, then frozen with weights before audit. They are boundaries for this model’s output scale, not universal severity definitions.

```python
score = ordinal_regressor(features)
label = count(score >= boundary for boundary in frozen_thresholds)
```

Fold checkpoints follow stopping RMSE. Threshold selection follows the resulting OOF predictions, so development quality includes selection. The full-label refit has no new independent stopping set or validation QWK.

Sampling, loss weighting and thresholds can all change rare-class errors. Define which failure should improve and where it will be confirmed before moving a threshold to fit seven observed people.

## Evaluation

Higher QWK rewards agreement beyond chance with distance-sensitive ordinal penalties. It is not monotonic in continuous RMSE, so better regression need not improve thresholded QWK.

This round uses RMSE for checkpoint stopping, development OOF QWK for mixture/boundary selection, frozen audit for diagnosis and official scoring for competition quality. Keep these roles and rare-class supports, precision and recall separate. Seven observed misses are real, but a noisy population estimate.

## Results and evidence



### Three metrics have three responsibilities

Development calibrated QWK was approximately **0.4685**, frozen audit approximately **0.4280**, and official results **0.438 public/0.391 private**.

A lower-RMSE model prefix need not maximize thresholded QWK. Falling training loss does not establish that adding trees improves the scored decision.

### What the average conceals

Class 3 contains only 34 labelled participants overall and seven in audit. All seven were missed. The audit also produced two class-3 predictions, both for true class 2.

Calibrated thresholds improved the aggregate audit comparison over a fixed-threshold reference, without solving rare-class recognition. The candidate was not altered after audit observation.

### Read the learning curve with the confusion matrix

The learning plot records XGBoost fold 1. RMSE selects round 108, while QWK under fixed diagnostic thresholds can move differently later. That QWK is neither the calibrated development score nor an official result.

The matrix shows true class 3 falling into predicted 1 or 2, with two false class-3 alarms elsewhere. Lowering the highest threshold trades false alarms against misses; it is not automatically a repair.

A new checkpoint rule aligned more closely with QWK should be a frozen comparison against RMSE, with a separate confirmation budget. The inspected audit now generates hypotheses; it is no longer untouched evidence for future tuning.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/15/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: CMI"><img src="/kaggle/15/learning.svg" alt="v2 / XGBoost fold 1 / sampled observations. QWK is evaluated with fixed thresholds here; it is not the calibrated OOF or official QWK. No unlogged elapsed values are filled." width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · CMI</strong> v2 / XGBoost fold 1 / sampled observations. QWK is evaluated with fixed thresholds here; it is not the calibrated OOF or official QWK. No unlogged elapsed values are filled.<br /><a href="/kaggle/15/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/15/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-15-learning">Provenance and scope</a></figcaption>
</figure>

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/15/confusion.svg" target="_blank" rel="noopener" aria-label="Enlarge: CMI"><img src="/kaggle/15/confusion.svg" alt="Counts only / no participant rows or identifiers. No class-3 participant was correctly predicted in this audit. Small support limits stable class-specific inference." width="540" height="360" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · CMI</strong> Counts only / no participant rows or identifiers. No class-3 participant was correctly predicted in this audit. Small support limits stable class-specific inference.<br /><a href="/kaggle/15/confusion.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/15/confusion.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-15-confusion">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** the baseline completed official delivery but did not meet the stronger quality goal. Representation, score ordering, checkpoint choice and thresholds are distinct levers; tuning on seven inspected examples cannot establish a reliable improvement.

### Keep the severe-class failure visible

Retain the confusion matrix, supports, threshold provenance and continuous error. Better middle-class discrimination can improve the overall metric without recognizing every level.

The historical public reference 0.497 remains higher. Activity inputs and alternative stopping criteria are plausible next experiments, not completed improvements.

## Next experiments

The following designs have not run.

1. Compare RMSE-based and target-aligned checkpoint rules within development folds, with the same threshold-search budget.
2. Predeclare per-level confusion/support diagnostics; change sampling or loss weighting one at a time and confirm on other participants.
3. Test activity-derived information using participant-safe aggregation and splitting. Adding a data type is not evidence of a gain.

### Predicting the rare label is not recognizing it

Here the two predicted class-3 participants were false positives and the seven actual class-3 participants were missed. Observed precision and recall for that audit slice were therefore both zero, without establishing a stable population rate.

Moving the boundary after inspecting these people turns audit into a training signal. Even an improved number would lose new-confirmation meaning. The matrix’s value is to make costs beyond average Kappa unavoidable, while keeping the next experiment’s boundary intact.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/child-mind-institute-problematic-internet-use)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/15_child_mind_institute_problematic_internet_use/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-15)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
