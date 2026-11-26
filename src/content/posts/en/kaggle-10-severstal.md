---
title: "Severstal: a strong mean Dice can hide defects that are never found"
description: "Crop-aligned presence supervision and class-specific diagnostics expose what an aggregate segmentation score conceals."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 10, "topic": "图像分割", "status": "已出分", "result": "Public / private Dice 0.88698 / 0.88027", "evidenceDate": "2026-11-20", "source": "https://leebin-try.github.io/kaggle/sources/#case-10", "competitionUrl": "https://www.kaggle.com/competitions/severstal-steel-defect-detection", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-results.md", "submission": "58619644"}
coverImage: "/kaggle/10/cover.svg"
coverAlt: "Original subject illustration: Severstal: a strong mean Dice can hide defects that are never found"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: do not judge steel-defect segmentation by mean Dice alone. Two classes still had zero positive-case Dice when the aggregate was near 0.86. Foreground misses and postprocessing transfer deserve attention before declaring all classes learned.**

## Problem: empty masks can raise the average

A 256×1600 steel image can contain four defect classes, with many empty image–class pairs. Correctly predicting emptiness contributes strongly to the mean, while finding an actual thin defect is a different ability.

The always-empty reference makes that imbalance visible. A high aggregate can coexist with zero overlap on positive examples of a rare class. Retain support counts and positive-only class Dice rather than infer detection ability from one mean.

Long strips also make cropping consequential. A positive full frame can produce a crop with no defect; auxiliary labels must follow the sampled geometry.

## Technical approach and pipeline

**Pipeline:** native strips and four masks; paired progressive crops with recomputed presence targets; ResNet34 U-Net and auxiliary head; native-width validation and calibration; average two model probabilities; encode and score masks.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/10/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Severstal"><img src="/kaggle/10/method.svg" alt="Original method diagram for Severstal. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Severstal</strong> Original method diagram for Severstal. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/10/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-10-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Learn masks and presence together

The baseline uses an ImageNet-initialized ResNet34 U-Net with four segmentation outputs and an auxiliary presence branch. Training preserves native height and pixel scale while increasing crop width; validation returns to the complete strip.

Presence targets must be recomputed after cropping. Copying full-image labels to every crop supplies incorrect supervision whenever a defect lies outside the selected region.

### Recompute targets, then check calibration on other images

Progressive crop width lowers memory requirements but shifts foreground prevalence relative to full-width validation. Final thresholds cannot simply be read from training loss.

```python
image_crop, mask_crop = paired_crop(image, mask)
presence_target = mask_crop.any(axis=(height_axis, width_axis))
loss = mask_loss(mask_logits, mask_crop) + auxiliary_presence_loss(...)
```

Augment images and masks together, using label-preserving mask interpolation. A crop that excludes a defect is a valid negative example.

Postprocessing includes thresholds and region filtering. Calibration fitted from one model’s stopping-fold statistics was diagnosed on another model’s independent images. The final average of all-label refits has another probability distribution, so transfer remains an explicit limitation.

## Evaluation

Dice measures foreground overlap; higher is better. Empty-pair handling affects the aggregate, so preserve the always-empty baseline, per-class positive Dice and support. Correctly declaring an empty image is not evidence of localizing a defect.

Checkpoint and postprocessing choices use the stopping fold. Another image fold supplies single-model diagnostics. That does not become a complete independent evaluation of the final two-model average. Official terminal scoring confirms format acceptance separately from quality interpretation.

### Why calibration needs its own boundary

Two seeds fit the same fitting population and select checkpoints on fold 0. Postprocessing is fitted on seed 0/fold 0 statistics and diagnosed on seed 1/fold 1 images, whose labels did not enter training or checkpoint choice.

The final all-label refits average probabilities without TTA. Thresholds fitted for one model need not retain the same meaning after averaging. Calling the single-model diagnostic a complete ensemble OOF score would overstate the evidence.

## Results and evidence



### Score quality and format acceptance are separate

Official results were **0.88698 public/0.88027 private Dice**, below the historical private tenth-place reference of 0.90619. The late submission did not establish a historical rank.

Sample formatting and older evaluation descriptions differed. The final four-class-row format has a genuine COMPLETE scoring receipt; a recent notebook using a format would not alone establish acceptance.

### What the recorded curve reveals beyond the mean

At epoch 2, mean validation Dice was approximately 0.86167 versus an always-empty 0.85660. Positive-only Dice for the first two classes was still zero, with supports 183 and 62. That early mean mostly fails to demonstrate localization for those classes.

Training loss is recorded each epoch, with validation every two epochs; missing validation values are not invented. Crop width changes over training also affect the loss context.

The curve should drive class-specific error checks and independent calibration comparisons, rather than a blanket claim that the model is adequately trained.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/10/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: Severstal"><img src="/kaggle/10/learning.svg" alt="Selection worker 0 / reused stopping fold. Validation is logged every two epochs; no values are invented for missing epochs. Positive-only class Dice is provided in the CSV." width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Severstal</strong> Selection worker 0 / reused stopping fold. Validation is logged every two epochs; no values are invented for missing epochs. Positive-only class Dice is provided in the CSV.<br /><a href="/kaggle/10/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/10/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-10-learning">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** official delivery succeeded, while foreground detection and calibration transfer remain concrete quality questions. Align supervision and diagnose errors before adding more techniques.

### A transferable diagnostic

In sparse segmentation, retain empty/positive splits and per-class support. Mean overlap alone can reward the dominant absence pattern.

Likewise, postprocessing is part of the fitted decision system. Its fitting population and transfer to an ensemble should be documented with the same care as model training.

## Next experiments

These designs are not completed.

1. Freeze model and thresholds; report each class’s positive Dice, missed positives and false positives on empty frames.
2. Fit ensemble-specific calibration inside development data, then compare it with the old thresholds on another held-out image group.
3. Change crop policy or loss weights one at a time only after locating the bottleneck, preserving class-level improvements and regressions.

### Calibration transfer is a distribution question

Averaging can smooth extreme probabilities, while full-width images change foreground prevalence relative to crops. A threshold selected for one context is not intrinsically correct for another.

A controlled transfer comparison must freeze model outputs, fit thresholds on the intended probability distribution and retain a separate confirmation. Otherwise a better calibration score can simply reflect more choices on familiar labels.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/severstal-steel-defect-detection)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/)
- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/10_severstal_steel_defect_detection/docs/baseline-campaign.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-10)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
