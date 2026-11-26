---
title: "LLM preference prediction: align the comparison before calibrating probabilities"
description: "Reliable checkpoint reuse depends on restored classifier heads, balanced inputs, answer-swap semantics and complete output coverage."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 9, "topic": "语言模型", "status": "已出分", "result": "Public log loss 0.82657; private score not published", "evidenceDate": "2026-11-19", "source": "https://leebin-try.github.io/kaggle/sources/#case-09", "competitionUrl": "https://www.kaggle.com/competitions/llm-classification-finetuning", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/docs/results.md", "submission": "58544030"}
coverImage: "/kaggle/09/cover.svg"
coverAlt: "Original subject illustration: LLM preference prediction: align the comparison before calibrating probabilities"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: the three probability columns must refer to the same comparison. Reused preference checkpoints scored 0.82657 public log loss; restoring the classifier head, A/B order and complete coverage is a prerequisite for interpreting that result.**

## Problem: three probabilities for one aligned comparison

Each example contains prompts and responses A/B, possibly across multiple turns, with outcomes A wins, B wins or tie. The prompt and both sides must retain aligned turns; silently filling a missing side creates another comparison.

Long answers compete for context. Truncation that admits all of A before B can create an avoidable asymmetry. Answer swapping adds another coordinate system: its first probability column refers to the other answer until restored.

The target is a calibrated three-way probability vector, not just the winner label. Loading and interface correctness can silently fail even when inference completes.

## Technical approach and pipeline

**Pipeline:** reuse Gemma/Llama preference checkpoints; audit classifier heads and sharded weights; align and balance multi-turn inputs; run original and swapped orientations; restore columns; combine and independently reconstruct the final probabilities.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/09/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: LLM preference prediction"><img src="/kaggle/09/method.svg" alt="Original method diagram for LLM preference prediction. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · LLM preference prediction</strong> Original method diagram for LLM preference prediction. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/09/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-09-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### What was actually implemented

The system reused public Gemma-2 9B and Llama-3 8B preference classifiers for loading, inference and combination. It did not newly fine-tune those models.

Checkpoints were published by tascj0; inference references came from andyuuzou, retaining credits to snaykey, gloriachen0816 and related pipelines. The project’s work concerned adaptation, audits, coverage and reconstruction.

The classifier is a two-layer MLP, not the framework’s default linear head. Four head tensors and fused gate/up projections need restoration. Matching the model name and configuration does not prove those weights loaded.

### Audit symmetric inputs and asymmetric loading

After turn alignment, build each model’s required template. Balanced head/tail truncation uses a 4,096-token conversation budget for both answers and relevant prompts; outer judging instructions lie outside that budget.

```python
p_swapped = infer(prompt, response_b, response_a)
p_restored = p_swapped[:, [1, 0, 2]]
p_model = mean_of_available_valid_orientations(p_original, p_restored)
```

Restoring the first two swapped columns recovers label semantics. It does not require the two orientations to predict identically: position bias is part of what the extra pass measures. Required directions need complete coverage; optional passes must report their coverage explicitly.

Audit actual head tensors, fused projections, original positions and cross-device placement. A successful state-loading call alone is insufficient when a default head could be randomly initialized.

### Answer order and long context are different failure boundaries

Both models use staged inference across two T4s and run sequentially relative to one another. This is not distributed training. Preserve each orientation, then independently reconstruct within-model averaging, geometric combination and temperature.

Balanced truncation protects both answers; probability restoration protects label meaning. These are independent correctness requirements and neither can be repaired by a smoother final mixture.

## Evaluation

Multiclass log loss averages the negative log probability assigned to the true outcome; lower is better. Submitting an argmax cannot replace the three probabilities, and temperature cannot fix swapped output columns.

The 16 length probes test real devices, head loading, orientation coverage and reconstruction. They are not clean quality validation because the public checkpoints saw competition training data. Quality evidence comes from the official score; unavailable private results are not inferred.

## Results and evidence



### Execution probes do not provide independent quality validation

The 16 probes established length coverage, actual GPU execution, restored heads and independent probability replay, with maximum reconstruction error zero. These are engineering checks.

Official public log loss was **0.82657**. A dated snapshot at 2026-11-19 16:26 UTC ranked **6 of 327 positively ranked teams**, excluding rank-zero examples. It is not a current live rank. No private score is invented.

### What changes in the fusion formula

Arithmetic orientation averaging and geometric cross-model fusion have different effects. Geometric fusion emphasizes agreement and can sharply reduce a class probability if one model assigns it little mass; temperature changes confidence again.

Normalization and numeric validity checks are therefore necessary after each declared operation. Retain the parameters and component outputs so an independent replay can reproduce the exact final CSV. Numerical reproducibility is distinct from evidence that the chosen parameters generalize.

## Reflection and conclusion

**Conclusion:** the contribution was reliable inference and checkpoint reuse, rather than a newly trained preference model. Weight semantics, input comparisons and output columns must remain aligned for a score to have a traceable technical meaning.

### Inference systems need acceptance tests too

An output can be finite and normalized while referring to the wrong answers or omitting required examples. Test the semantic contract, not just the array shape.

Checkpoint provenance and upstream attribution also belong in reproducibility. Do not relabel a borrowed expert as a newly trained project contribution.

## Next experiments

These designs have not run.

1. Freeze weights and combination rules; add uneven-turn, long-answer and empty-answer interface cases with explicit handling.
2. Compare truncation policies only against trustworthy labels not used to train the reused checkpoints; otherwise report compatibility alone.
3. Once independent quality evidence exists, compare added directions and temperature one at a time, with coverage and full inference cost.

### Calibration cannot repair the wrong question

A temperature rescales confidence without correcting column order, turn alignment or missing rows. A calibrated vector can still describe another comparison.

Preserve the chain from source example through tokenized orientation to restored class order and delivered ID. Only after it passes should model quality or parameter calibration be compared. This ordering prevents plausible probability plots from concealing interface errors.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/llm-classification-finetuning)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/)
- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/09_llm_classification_finetuning/docs/solution.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-09)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
