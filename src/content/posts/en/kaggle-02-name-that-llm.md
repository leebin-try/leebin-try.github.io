---
title: "Name That LLM: a weaker model can contribute a more useful error pattern"
description: "Lexical fingerprints complement semantic representations. The useful question is what a second model adds per unit of cost."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 2, "topic": "语言模型", "status": "已出分", "result": "Official balanced accuracy 0.638", "evidenceDate": "2026-11-20", "source": "https://leebin-try.github.io/kaggle/sources/#case-02", "competitionUrl": "https://www.kaggle.com/competitions/name-that-llm", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/overnight-t4-results.md", "submission": "58575974"}
coverImage: "/kaggle/02/cover.svg"
coverAlt: "Original subject illustration: Name That LLM: a weaker model can contribute a more useful error pattern"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: pay for complementary information, not simply another model. A weaker lexical expert improved the selected semantic mixture, and official balanced accuracy rose from 0.628 to 0.638. This supports this combination, not a general rule to blend weak models.**

## Problem: two distribution differences behind 18 source labels

The task attributes response text to one of 18 generating sources. Balanced accuracy gives each source’s recall equal weight, rather than allowing common classes to dominate. Several responses can share one prompt, so topic similarity and generation style are related but distinct signals.

Prompt-disjoint folds reduce the chance of validating on another answer to a familiar question. Output columns retain a fixed 18-class order. External corpora supply more text but introduce selection, source and time differences. Upstream filtering that used official labels still matters to the interpretation of later scores.

Semantic representations capture content and organization. Lexical views preserve punctuation, casing, function words and character patterns. Aggressive cleaning can remove exactly the fingerprints needed for attribution.

## Technical approach and pipeline

**Pipeline:** prompt-separated folds; existing fivefold 8B semantic experts plus a separately fitted four-view TF-IDF expert; restore probabilities; apply a fixed mixture; validate class order; obtain the official score.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/02/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Name That LLM"><img src="/kaggle/02/method.svg" alt="Original method diagram for Name That LLM. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Name That LLM</strong> Original method diagram for Name That LLM. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/02/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-02-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Two paths preserve different signals

The final submission combines existing Qwen3-Embedding-8B experts with the project’s lexical expert. The latter uses character, word, word-shape and function-word/punctuation views: fit on public external data, then adapt within official fitting folds. Vocabulary fitting excludes validation and test text.

Unlabelled global text context contributes grouping at inference, without forcing every group to contain all classes. Upstream assets and ideas derive from CHEN Han/concyclics, lightningv08 and Nishant Dahal, among others credited in the records. This case concerns adaptation, combination and evaluation, rather than claiming those methods as original inventions.

### Preserve the lexical expert’s fitting boundary

The four TF-IDF views have fixed weights and are concatenated and normalized. An external 18-class head is fitted first; each official fold then adapts independently from that same external prior. The full-label final head must not flow backwards into fold initialization.

```text
External fitting data -> fixed vocabularies -> external classifier
                                           |-> official fold 0 fit -> fold 0 validation
                                           |-> official fold 1 fit -> fold 1 validation
                                           `-> all official labels -> final inference
```

The parent stores log-softmax scores, so convert them to probabilities before mixing. Adding negative log scores as if they were probabilities is numerically executable but semantically wrong. Unlabelled grouping cannot justify imposing hidden-label balance.

### Why the larger model was not promoted

The 27B path passed a limited mechanism probe, but at batch size 8 its external stage processed about 0.73 examples per second. One pass over 45,000 examples projected to roughly 17–19 hours. Batch size 16 also encountered an out-of-memory failure.

Fitting into memory is not enough to complete useful learning within a budget. The deployed route was the 8B parent plus the trained lexical expert; the qualification-only 27B path was excluded.

## Evaluation

Balanced accuracy averages per-class recall; higher is better. Improving the largest class alone need not improve it. Out-of-fold, or OOF, predictions come from models not fitted on the corresponding rows; here folds keep whole prompts together.

Development OOF also selected the mixture, and upstream external-corpus selection used official labels. It is therefore not untouched confirmation. Preserve the lexical-only, parent-only, chosen mixture and official scores separately. Development 0.6683 is not the hosted result.

## Results and evidence



### Observed complementarity and its limits

The lexical expert alone reached about 0.458 development OOF balanced accuracy, below the native path. A fixed 40% lexical probability contribution reached approximately 0.6683 on selected development OOF. Officially, the final score was **0.638**, up 0.010 from 0.628.

The comparison makes complementarity worth investigating, but does not establish that every weaker model helps. Mixture selection and upstream filtering limit independence, and original asset attribution remains necessary.

### What a weaker expert still needs to demonstrate

The figure shows that the selected mixture exceeds either recorded standalone development result. This is consistent with complementary errors, not independent proof of the mechanism: several weights were compared, and a prompt bootstrap cannot erase upstream selection.

Inspect which prompts, sources, lengths and sparse groups receive corrections. Gains concentrated in a few themes may vanish under a new prompt distribution, and the average can hide a source whose recall deteriorates.

Compute changes the feasible comparisons. A lexical fit took roughly five minutes, while one projected 27B external pass required many hours. This is a constraint on this experiment’s search space, not a universal small-versus-large-model ranking.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/02/complementarity.svg" target="_blank" rel="noopener" aria-label="Enlarge: Name That LLM"><img src="/kaggle/02/complementarity.svg" alt="Selected development OOF; not untouched holdout. The lexical model is weaker alone. Corpus selection and mixture selection reuse development information." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Name That LLM</strong> Selected development OOF; not untouched holdout. The lexical model is weaker alone. Corpus selection and mixture selection reuse development information.<br /><a href="/kaggle/02/complementarity.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/02/complementarity.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-02-complementarity">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** the useful low-cost addition preserved surface style that the semantic path might miss. The official combination improved; identifying each path’s causal contribution requires fixed-condition comparisons.

### Reusable decisions

State what missing signal the second representation is intended to capture, then check prompt-level improvements, worst-fold regressions and sparse populations. A better average can be driven by repeated themes.

For larger models, measure actual loading, throughput and reproducibility before projecting a full fit. For ensembles, inspect disagreements and corrections. Feasibility and usefulness are different gates.

## Next experiments

These experiments have not run.

1. Freeze vocabularies, prompt folds and models; compare external-prior regularization on and off, checking both the mean and worst source.
2. Aggregate shared and complementary errors by prompt. Restrict the conclusion if a small set of topics accounts for the gain.
3. Revisit a larger backbone only after end-to-end timing includes loading, validation, saving and full-test inference.

### Adapting a classifier is not training another language model

A roughly 200,000-feature, 18-class FP32 coefficient matrix occupies approximately 14.4 MB. This dimensional calculation excludes vocabulary, sparse features and optimizer state; its resource structure differs fundamentally from a multi-billion-parameter backbone.

Official adaptation can be summarized as `CE(official) + lambda * ||W - W_external||²`. The prior penalty limits drift, but its strength remains selected and cannot guarantee freedom from overfitting.

A controlled regularization experiment should retain all other choices and inspect each source. Improving the average while sharply damaging the weakest source is a trade-off to explain, not a reason to increase the mixture blindly.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/name-that-llm)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/overnight-t4-results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/)
- [Upstream credits and assets](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/reproduction-credits.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-02)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
