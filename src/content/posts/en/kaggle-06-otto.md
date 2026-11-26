---
title: "OTTO: a stronger ranker cannot recover an item that was never retrieved"
description: "Retrieval coverage bounds ranking quality. GPU acceleration and whole-workflow speed also require separate evidence."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 6, "topic": "时序与推荐", "status": "已出分", "result": "Public / private weighted Recall@20 0.57455 / 0.57352", "evidenceDate": "2026-11-17", "source": "https://leebin-try.github.io/kaggle/sources/#case-06", "competitionUrl": "https://www.kaggle.com/competitions/otto-recommender-system", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/docs/gpu-results.md", "submission": "58449500"}
coverImage: "/kaggle/06/cover.svg"
coverAlt: "Original subject illustration: OTTO: a stronger ranker cannot recover an item that was never retrieved"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: retrieval establishes the ceiling, then ranking determines how much is reached. The current pipeline scores 0.57352 private weighted Recall@20; orders sit closer to their candidate ceiling, making missing candidates a priority before uniformly deeper rankers.**

## Problem: one session, three different future targets

The input is an observed session prefix. The output is a separate Top-20 product list for clicks, carts and orders. Official scoring applies target weights, per-session truncation and aggregation; it is not merely whether one recommended item is correct.

Clicks are more frequent and orders sparser, but importance is not determined by frequency alone. Substituting click performance for all behaviours changes the objective.

The two-stage system makes two errors distinguishable: the relevant item was absent from the candidate set, or it was present but ranked below 20. Both become missed recommendations, but need different interventions.

## Technical approach and pipeline

**Pipeline:** observed prefixes; CUDA co-visitation retrieval; target-specific features; independent click, cart and order XGBoost rankers; 20 unique products per target.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/06/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: OTTO"><img src="/kaggle/06/method.svg" alt="Original method diagram for OTTO. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · OTTO</strong> Original method diagram for OTTO. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/06/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-06-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Retrieve by co-occurrence, then rank by target

Three CUDA co-visitation graphs produce candidates. Separate XGBoost models score clicks, carts and orders, rather than hiding their distinct signal and frequency behind one objective.

Temporal validation separates graph history, ranking training and future labels. Final graphs may use observed test prefixes under the declared rules, but no future actions or post-event labels. Candidate provenance deserves the same attention as the fitting data.

### What retrieval and ranking each control

A ranker cannot output a missing relevant product if it only sorts its candidate pool. An oracle ordering within that pool therefore bounds attainable Recall@20, subject to official per-session caps.

Different targets may have different gaps to their ceilings. Measure both the candidate pool and selected ranking on the same sessions. A pool-level recall that ignores the Top-20 cap can suggest an impossible improvement target.

## Evaluation

Official weighted Recall@20 is higher-is-better, with click/cart/order weights 0.1/0.3/0.6. Calculate each target using the official session caps and aggregation before weighting; a simple three-way average is another metric.

Temporal separation protects graph construction, fitting and future labels. Candidate ceilings are diagnostic bounds, not achieved model scores. Report whole-workflow wall time with quality so that acceleration of one graph operator is not confused with end-to-end speed.

### Ceiling diagnostics point to different interventions

The selected internal click/cart/order recall values are 0.50244598, 0.40087623 and 0.61468722. Corresponding candidate ceilings are 0.58881981, 0.47582538 and 0.65880931.

Orders have the smallest remaining ranking gap within the current pool. This suggests inspecting order retrieval first; it does not prove ranking can no longer help. Early stopping and mixture selection also reuse this temporal holdout, and final graph distributions differ.

## Results and evidence



### Higher quality did not mean a faster workflow

Official public weighted Recall@20 increased from 0.48866 to **0.57455**; private increased from 0.49036 to **0.57352**. The full pipeline grew from about 25.11 to **39.11 minutes**, because the newer system did more graph and modelling work.

The actual devices were two T4s, regardless of requested hardware or older “L4” labels. They ran independent tasks; a single tree model was not distributed across both GPUs.

### Use the ceiling gap to allocate the next budget

The chart separates achieved recall from attainable candidate coverage. A larger ceiling gap suggests ranking headroom; a small gap points toward retrieval, while both remain hypotheses to test.

Adding a candidate source also changes pool size, negative examples and feature distributions. A fair follow-up needs comparisons on the same new pool, rather than attributing every change to retrieval alone.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/06/candidate-ceiling.svg" target="_blank" rel="noopener" aria-label="Enlarge: OTTO"><img src="/kaggle/06/candidate-ceiling.svg" alt="Internal temporal diagnostic; candidate pool fixed. Ceilings apply the metric-specific per-session cap; they are not achieved model scores." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · OTTO</strong> Internal temporal diagnostic; candidate pool fixed. Ceilings apply the metric-specific per-session cap; they are not achieved model scores.<br /><a href="/kaggle/06/candidate-ceiling.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/06/candidate-ceiling.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-06-candidate-ceiling">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** the two-stage route produced an official gain at a higher complete cost. Optimize by target and by bottleneck; extra complexity everywhere is not a targeted experiment.

### A practical decision rule

First locate whether relevant products are missing or misranked. Then compare one retrieval addition or ranking change under a frozen time boundary. Preserve simple controls and the budget spent to reach the score.

The record supports the GPU candidate as the current verified best, not an industry-leading claim. Historical strong references are around 0.60, whereas this result is around 0.574.

## Next experiments

These steps are proposed.

1. Freeze the orders ranker and add one retrieval source; measure new relevant-item coverage, pool size and cost.
2. On that identical new pool, compare old and revised rankers to detect distribution changes.
3. Compare weighted recall and end-to-end time on the same sessions and horizon. Remove sources without confirmable value.

### A larger pool also changes the ranking problem

A candidate source can improve coverage while making ranking harder through additional negatives or stale popular items. Pool expansion is therefore not a guaranteed final gain.

Inspect target-specific corrections and losses in the Top-20 lists, then check a new temporal confirmation. A useful diagnosis identifies a likely lever; it does not substitute for executing that lever under controlled conditions.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/otto-recommender-system)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/docs/gpu-results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-06)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
