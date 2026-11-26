---
title: "Aerial Cactus: a flat AUC does not mean probability training has stopped"
description: "A small CNN reached the ranking target quickly. Its confidence, difficult examples and geographic independence remain separate questions."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 14, "topic": "图像分类", "status": "已出分", "result": "Public / private ROC AUC 0.9999 / 0.9999", "evidenceDate": "2026-11-24", "source": "https://leebin-try.github.io/kaggle/sources/#case-14", "competitionUrl": "https://www.kaggle.com/competitions/aerial-cactus-identification", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/docs/results.md", "submission": "58805153"}
coverImage: "/kaggle/14/cover.svg"
coverAlt: "Original subject illustration: Aerial Cactus: a flat AUC does not mean probability training has stopped"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: a ranking plateau can coexist with changing probability quality. The small CNN scored 0.9999 official AUC while later stopping BCE kept decreasing. Decide whether to continue using a predeclared purpose and metric.**

## Problem: ranking can hit its apparent ceiling early

Small aerial images are classified for cactus presence. AUC measures relative positive/negative ordering, not the quality of a fixed threshold or probability calibration. An easy selection partition can reach AUC 1.0 early.

That does not mean optimization stopped. Confidence, thresholded errors and new-region performance can still change. Declaring convergence from a flat ranking metric would collapse different questions.

Exact and D4-transformation duplicate checks reduce identifiable overlap, but there is no verified geographic grouping. Different images may still come from neighbouring areas.

## Technical approach and pipeline

**Pipeline:** exact/D4 duplicate checks; fixed fit/stop/audit roles; compare a compact CNN and residual control; select on AUC and reject an unhelpful average; infer with the selected model.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/14/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Aerial Cactus"><img src="/kaggle/14/method.svg" alt="Original method diagram for Aerial Cactus. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Aerial Cactus</strong> Original method diagram for Aerial Cactus. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/14/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-14-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Give the small model a fair comparison

The two CNN routes share a fixed fitting, stopping and audit protocol. The stopping set selects checkpoints and a limited averaging comparison; audit follows selection freeze. The small CNN was retained because equal averaging did not improve stopping AUC.

There was no all-label refit in this competition. Final scoring used the selected fitted model, unlike cases that explicitly retrained on every label.

### A monotone transformation separates ranking from confidence

A strictly increasing transformation preserves score ordering and therefore AUC, while changing BCE. Temperature scaling supplies a concrete example: the relative ranking may stay identical as probabilities become more or less extreme.

This explains why a flat AUC and decreasing probability loss can coexist. It does not establish that temperature is a free improvement: fitting it would require its own declared data role and independent evaluation.

## Evaluation

ROC AUC is higher-is-better for ranking; BCE is lower-is-better for assigned probability confidence. They need not select the same checkpoint.

The stopping set selects candidates and audit evaluates the freeze. Duplicate detection has a narrower role than geographic isolation. Official high ranking performance does not by itself establish probability calibration or new-location transfer.

### The metric disagreement is visible in the curve

The small CNN’s selected stopping AUC reached 1.0 at epoch 27. Its stopping BCE was about 0.00185 then and about 0.000476 at epoch 37.

The AUC rule is an explainable selection decision, not evidence that loss had stopped decreasing. Training augmentation and clean evaluation also mean their losses are not measured in identical conditions.

## Results and evidence



### What the high score does and does not cover

Official public/private ROC AUC were both **0.9999**. The complete two-T4 workflow took approximately **83 seconds**. Frozen audit AUC was near one under a separate internal definition.

The initial ≥0.999 goal was reached, without matching the higher 1.0000 reference. Exact/D4 checks did not establish geographic independence or real-world cross-location ability.

### What happened after epoch 27

The recorded 37-epoch history shows BCE continuing to improve after the ranking-based selected point. This suggests examining the downstream purpose rather than changing the stopping metric retrospectively to obtain a better-looking number.

A fresh experiment can predeclare calibration or threshold costs if probabilities are the product requirement. For a ranking-only competition, the existing rule remains coherent. Neither curve alone establishes the optimum in a new region.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/14/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: Aerial Cactus"><img src="/kaggle/14/learning.svg" alt="v1 small CNN / 37 observed epochs. Train and stopping losses have different augmentation contexts. Logarithmic loss axis; no smoothing; reused stopping split." width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Aerial Cactus</strong> v1 small CNN / 37 observed epochs. Train and stopping losses have different augmentation contexts. Logarithmic loss axis; no smoothing; reused stopping split.<br /><a href="/kaggle/14/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/14/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-14-learning">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** this small model met the original competition goal, so scaling it has no automatic priority. New acquisition conditions, difficult populations and probability uses remain the more informative questions.

### Stopping rules should serve the intended result

If only order matters, an AUC checkpoint has a clear rationale. If decisions depend on confidence or asymmetric costs, retain probability loss, calibration and thresholded outcomes too.

Choose that purpose before the experiment. Moving between metrics after observing one familiar stopping set adds selection rather than independent evidence.

## Next experiments

These designs are unexecuted.

1. Define confirmation groups from available acquisition conditions, retaining support counts and any missing-location limitation.
2. If changing to probability decisions, predeclare BCE, calibration and decision-cost rules before checkpoint comparison.
3. Keep sample and cost definitions fixed for larger networks or averages; require new confirmation before accepting the extra work.

### Near-ceiling averages still need difficult examples

The audit contains 1,971 positives and 655 negatives. Class proportions influence threshold accuracy, while AUC does not itself remove source correlations.

Define difficult subsets using known acquisition conditions, not by collecting mistakes after seeing the answers and calling them representative. Error-selected examples diagnose mechanisms but cannot re-estimate population quality.

The aerial cover is synthetic art and the curve is recorded aggregate evidence. Publishing real annotated overlays would first require a clear redistribution basis and an example-selection rule that retains failures as well as successes.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/aerial-cactus-identification)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/14_aerial_cactus_identification/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-14)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
