---
title: "Read the scored object before comparing the numbers"
description: "Ranking, probabilities, thresholded decisions and geometry require different diagnostics and different claims."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Metrics", "Model evaluation"]
cover: "terminal"
sample: false
draft: false
featured: false
kaggle: {"kind": "method", "source": "https://leebin-try.github.io/kaggle/sources/#protocol", "evidenceDate": "2026-11-25", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md"}
coverImage: "/kaggle/metrics/cover.svg"
coverAlt: "Original subject illustration: Read the scored object before comparing the numbers"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

AUC 0.9999, log loss 0.82657 and MCRMSE 0.59760 do not share a scale for ranking model strength; they even optimize in different directions. **First ask whether the score measures order, confidence, a decision or geometry.**

## Identify the object the metric measures

Accuracy uses final labels, log loss uses probabilities, AUC uses ranking, MCC/QWK use thresholded confusion structure, and Dice depends on geometry. Sharing a range or optimization direction does not make them comparable.

Aggregation also matters: calculating once over all rows can weight populations differently from averaging classes, prompts or organs. A metric name without its aggregation order is insufficient for independent reconstruction.

Improved ranking need not improve a fixed threshold; better average overlap need not improve 3D boundaries; lower regression error can still worsen a rare ordinal class.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/metrics/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Read the scored object before comparing the numbers"><img src="/kaggle/metrics/method.svg" alt="Original method diagram for Read the scored object before comparing the numbers. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Read the scored object before comparing the numbers</strong> Original method diagram for Read the scored object before comparing the numbers. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/metrics/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-metrics-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

## Correct ranking can coexist with imperfect probabilities

[Aerial Cactus](/posts/kaggle-14-aerial-cactus/) reached stopping AUC 1.0 while BCE kept falling. Confidence can change without altering any positive/negative ordering.

Log loss penalizes excessive confidence in wrong answers. [Preference prediction](/posts/kaggle-09-llm-preference/) requires aligned three-way probabilities, normalization and declared fusion temperature. Replacing them with argmax accuracy removes part of the scored task.

## A synthetic example: why not average fold RMSE?

Suppose folds of 90 and 10 examples have RMSE 1 and 3. This is arithmetic, not an observed competition result. Their unweighted mean is 2; pooled RMSE is `sqrt((90*1² + 10*3²)/100) = sqrt(1.8)`, about 1.342.

CommonLit adds another level: pool each target’s OOF residuals, compute its RMSE, then average the two targets. Averaging prompt scores first changes the population weighting.

```python
per_target = sqrt(mean((all_oof_targets - all_oof_predictions) ** 2, axis=0))
mcrmse = mean(per_target)
```

Likewise, recommendation ceilings need official session caps, empty-mask scores need an explicit convention, and ordinal disagreement needs declared weights and expected distributions. Hand-checkable examples test meaning rather than only matching another library’s metric name.

## A continuous model may deliver a discrete metric

[CMI](/posts/kaggle-15-cmi/) regresses a continuous score but uses ordered thresholds before QWK. [Mushrooms](/posts/kaggle-12-mushrooms/) evaluates MCC after binary decisions. The best stopping RMSE or log loss need not yield the best thresholded score.

Choose thresholds on declared development predictions, separate from final confirmation. They are fitted components, not decorations to change after an official result.

## An average can hide a rare class or a second target

CMI missed all seven highest-severity audit participants despite a nonzero overall QWK. [CommonLit](/posts/kaggle-16-commonlit/) wording error exceeds content error, less visibly after averaging.

Retain support, confusion matrices or per-target scores. An absent class is unestimable rather than zero-recall; a class with a handful of observations cannot support a precise stable claim.

## Geometry adds another identity check

Mask overlap, 3D organ boundaries and image classification measure different objects. GI native-pixel Dice is not official Dice3DHausdorff. Resizing, thresholding and RLE order also change the actual geometry delivered.

[Carvana](/posts/kaggle-17-carvana/) label replay shows why serialization semantics come before quality claims. An integer string in range can still describe a transposed mask.

## Turn a learning curve into a declared decision

State whether the horizontal axis counts batches, examples, optimizer updates or epochs. Mixed-precision skipped updates make these different. Explain augmentation, smoothing, changing crop resolution and evaluation mode on the vertical axis.

The figures connect real logged observations without smoothing or invented values. Severstal validates every two epochs, GI has three points per worker, and CMI fixed-threshold QWK differs from calibrated QWK.

Declare stopping metric, minimum improvement, patience and refit-length transfer before the run. A timeout establishes a boundary, not an optimum. The next comparison should address a concrete contradiction in the curves, rather than select the most attractive trajectory after the fact.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/14/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: Read the scored object before comparing the numbers"><img src="/kaggle/14/learning.svg" alt="v1 small CNN / 37 observed epochs. Train and stopping losses have different augmentation contexts. Logarithmic loss axis; no smoothing; reused stopping split." width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Read the scored object before comparing the numbers</strong> v1 small CNN / 37 observed epochs. Train and stopping losses have different augmentation contexts. Logarithmic loss axis; no smoothing; reused stopping split.<br /><a href="/kaggle/14/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/14/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-14-learning">Provenance and scope</a></figcaption>
</figure>

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/16/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: Read the scored object before comparing the numbers"><img src="/kaggle/16/learning.svg" alt="v3 / two complete prompt-held-out selection histories. Targets can move in opposite directions. Fold 1 reaches its six-epoch cap; these are reused selection observations, not official scores." width="792" height="504" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Read the scored object before comparing the numbers</strong> v3 / two complete prompt-held-out selection histories. Targets can move in opposite directions. Fold 1 reaches its six-epoch cap; these are reused selection observations, not official scores.<br /><a href="/kaggle/16/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/16/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-16-learning">Provenance and scope</a></figcaption>
</figure>

## Read curves without exceeding their evidence

Training loss is measured with augmentation and continuously changing weights; validation usually freezes evaluation state. MixUp, smoothing and resolution change their comparability further.

A best point at the cap or incomplete patience leaves convergence unresolved. All-data refits have no independent validation curve to invent. Count successful optimizer updates separately from processed mixed-precision batches.

Record which metric stops training, which selects the candidate and which comes from official scoring. This explains why lower loss may not yield a better decision without using “overfitting” as an explanation for every discrepancy.

## Sources and evidence

- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md#learning-curves-and-training-sufficiency)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#protocol)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
