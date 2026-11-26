---
title: "CIFAR-10: retain the single model when averaging does not earn its cost"
description: "ConvNeXt transfer learning delivered a strong result, while explicit selection rules prevented an unsupported ensemble upgrade."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 8, "topic": "图像分类", "status": "已出分", "result": "Public / private accuracy 0.98170 / 0.98170", "evidenceDate": "2026-11-23", "source": "https://leebin-try.github.io/kaggle/sources/#case-08", "competitionUrl": "https://www.kaggle.com/competitions/cifar-10", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/docs/results.md", "submission": "58730945"}
coverImage: "/kaggle/08/cover.svg"
coverAlt: "Original subject illustration: CIFAR-10: retain the single model when averaging does not earn its cost"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: keep the candidate that passes the declared gate. ConvNeXt-Tiny scored 0.98170 official accuracy; averaging the two seeds did not beat the best single model. Additional inference requires new quality evidence.**

## Problem: small labelled images and a large delivery set

There are ten classes, 50,000 labelled images and a 300,000-image test delivery containing unscored distractors. Regardless of which rows count, predictions must cover every official ID; neither the model nor a person may silently remove likely distractors.

Resizing inputs to 96 pixels adapts the scale seen by pretrained representations. It changes computation and spatial behaviour without creating new image detail. Its value needs both quality and full-test cost.

The stratified 45,000/5,000 split establishes a baseline but does not independently test new acquisition domains. Strong competition accuracy alone is not a cross-domain guarantee.

## Technical approach and pipeline

**Pipeline:** stratified label split; ImageNet-initialized ConvNeXt-Tiny; augmentation, mixed precision and EMA for two seeds; gate single versus averaged predictions; refit under the selected rule; cover all 300,000 test IDs.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/08/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: CIFAR-10"><img src="/kaggle/08/method.svg" alt="Original method diagram for CIFAR-10. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · CIFAR-10</strong> Original method diagram for CIFAR-10. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/08/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-08-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Start from a mature representation

The training recipe combines AdamW, cosine learning rate, head warm-up, MixUp, RandAugment, label smoothing, mixed precision and exponential moving average weights. Two independent seed workers use two T4s.

This is a combined recipe. Without component ablations, the final score cannot establish that each technique helped independently, nor should the recipe be presented as a new algorithm.

### Why training and validation loss need not match

MixUp trains against soft combinations of labels, while clean validation uses ordinary targets. Label smoothing and augmentation further change the measurement. A larger training loss is not automatically evidence of a bug or underfitting.

A soft-label loss has the form `-sum(q_c * log p_c)`; a mixed target can place mass on two classes. EMA also defines a different set of weights from the raw optimizer state. Checkpoints must say which weights were evaluated and later refitted or loaded.

These details matter to reproducibility before interpreting tiny validation differences. Training curves and all-data refit losses do not provide an independent final validation score.

## Evaluation

Accuracy is the correct fraction among officially scored images; higher is better. Both seeds reuse the same 5,000-image selection set for checkpoint and mixture decisions, so their maxima include selection optimism.

Use identical validation examples and probability semantics for candidate comparisons. Full-test coverage is a separate artifact check, including distractors. The public/private official result is distinct from the internally selected peak.

### Keep the internal validation boundary visible

Repeatedly observing the same split is useful for comparing a frozen set of candidates, but choosing epochs, seeds and averaging on it makes it a selection set. It is not an untouched external confirmation.

The final all-label refits have no independent validation curve. They inherit a declared training-length rule; declining training loss cannot reveal their hidden-test accuracy.

## Results and evidence



### Respect the decision not to ensemble

Seed 42 selected epoch 27 with 0.98440 internal accuracy; seed 2026 selected epoch 25 with **0.98500**. The two-seed mean reached 0.98440 and failed the predeclared requirement to exceed the best single by 0.001.

Seed 2026 was selected. The official public and private accuracies were both **0.98170**, exceeding the 0.97 study target. The complete remote workflow took 3,723.61 seconds, about 1 hour 2 minutes, including preparation, selection, refits and all test predictions; queues and hosted scoring are excluded.

### What the two learning curves can establish

Both seeds improved strongly early, then fluctuated around late selection peaks at 27 and 25 of 30 epochs. Their exact maxima do not provide a fresh confirmation of small differences.

The averaging rejection applies to these two models, not every ensemble. A different representation or resolution might create more complementary errors, but must earn its place under the same protocol. Investigate errors by class, background and image quality rather than sampling seeds until a lucky peak appears.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/08/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: CIFAR-10"><img src="/kaggle/08/learning.svg" alt="v5; reused 5,000-row selection split. Unsmoothed epoch observations. Dashed lines mark selected checkpoints; two-seed averaging did not pass the improvement gate." width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · CIFAR-10</strong> v5; reused 5,000-row selection split. Unsmoothed epoch observations. Dashed lines mark selected checkpoints; two-seed averaging did not pass the improvement gate.<br /><a href="/kaggle/08/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/08/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-08-learning">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** mature representations, a declared candidate gate and complete delivery form a useful engineering baseline. The official result validates the combination’s performance, without isolating every augmentation or demonstrating new-domain robustness.

### A transferable trade-off

More models impose inference, storage and reconstruction costs even when they do not improve the selected metric. A negative averaging result is worth retaining because it documents an actual decision.

Separate GPU allocation from use: the two devices trained independent seeds, not a single distributed model. The measured full workflow matters more than a timeout ceiling or one operation’s speed.

## Next experiments

These experiments are proposed.

1. Freeze the current model and inspect class-specific errors and seed disagreements before choosing a new representation.
2. Change one resolution or encoder at a time; use an additional confirmation to test whether a small selected gain survives.
3. Record accuracy, complete test inference time and ID coverage together. Accept extra compute only after the quality gate passes.

### A 0.0006 difference is three images here

On a 5,000-image split, 0.0006 corresponds to only three net correct predictions. That arithmetic helps interpret the difference; it is not a confidence interval or proof that the models are equivalent.

Inspect paired corrections, not only the totals. Three net corrections could hide many wins and losses. Reusing the split to find a preferred seed also changes the selection process, so future claims should retain candidate counts and new confirmation evidence.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/cifar-10)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/)
- [Model and training recipe](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/08_cifar_10/README.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-08)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
