---
title: "Compute budgets are part of the experimental method"
description: "Memory, throughput and the complete delivery path constrain which hypotheses can actually be tested."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Compute budgets", "Reproducibility"]
cover: "terminal"
sample: false
draft: false
featured: false
kaggle: {"kind": "method", "source": "https://leebin-try.github.io/kaggle/sources/#protocol", "evidenceDate": "2026-11-25", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md"}
coverImage: "/kaggle/compute/cover.svg"
coverAlt: "Original subject illustration: Compute budgets are part of the experimental method"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

A model that loads may still be too slow to learn usefully, and a trained model may not finish test inference. **Admit experiments against the complete chain so local successes can become genuinely scored results.**

## Three budgets: capacity, execution time and informative comparisons

Capacity asks whether each device can hold weights, activations and temporary state. Time asks whether the workflow can finish. The comparison budget asks how many informative experiments fit those resources. They are related costs, not interchangeable measures.

Quantization and parameter splitting helped the 27B route fit, without making an external epoch take minutes. Small models can instead be dominated by resolution, test volume or feature engineering.

Separate program time, user waiting and billed allocation. Queues, downloads or hosted replay may lie outside internal timers. Without platform receipts, an internal duration cannot be converted into an exact bill or quota consumption.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/compute/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Compute budgets are part of the experimental method"><img src="/kaggle/compute/method.svg" alt="Original method diagram for Compute budgets are part of the experimental method. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Compute budgets are part of the experimental method</strong> Original method diagram for Compute budgets are part of the experimental method. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/compute/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-compute-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

## Define the unit of work before projecting

[Name That LLM](/posts/kaggle-02-name-that-llm/) passed a limited 27B mechanism probe but projected 17–19 hours for an external epoch. Capacity relief did not solve throughput.

[Carvana](/posts/kaggle-17-carvana/) has far more test than training images, making native restoration and encoding worth timing early. Multiplying a few short forward passes by test rows omits essential work.

Budget loading, preprocessing, selection, validation, checkpoints, refits, inference, file creation and hosted replay. Take a parallel stage’s critical path and add serial stages, retaining startup and I/O.

## Use dependencies, not a sum of every worker’s seconds

Two independent parallel seeds contribute approximately the slower worker’s wall time, not their sum. Serial calibration, audit and merging still add. CPU, storage and decoding contention also prevent a guaranteed twofold speedup.

```text
selection: max(seed_0, seed_1)
 + calibration and frozen audit
 + refit: max(refit_0, refit_1)
 + prediction: max(shard_0, shard_1)
 + merge, validate and write
```

This is a dependency model, not invented timings. Representative probes need actual input lengths, resolutions, model branches, TTA, checkpoint loading and encoding. A single-model pilot does not cover a two-model branch through a safety factor alone.

Compare identical input and output semantics for a speedup claim. Added models or changed precision create a different workload.

## Two GPUs can mean different kinds of parallelism

CIFAR, GI and CMI use independent seeds or folds. Preference inference shards one model across devices and stages. The former increases task throughput; the latter solves capacity and pipeline constraints. Neither should be casually labelled distributed training.

Budget memory per device. Two 15 GB cards are not one shared 30 GB pool: activations, temporary tensors, reservations and transfers remain local. Verify requested hardware against actual runtime evidence.

## More compute can improve quality without improving speed

[OTTO](/posts/kaggle-06-otto/) improved the score while growing from about 25 to 39 minutes because it performed more work. That is a quality result, not a same-workload speedup.

Conversely, Store Sales ridge was faster and weaker. Fix task, precision, coverage and metric before discussing the quality/cost exchange. One operator’s acceleration does not replace pipeline timing.

## Treat failures as interface evidence

Timeout, OOM, long fields, missing inputs and network failures occur at different boundaries. A smaller batch may address capacity without making a full run faster. A larger CSV limit permits parsing without validating mask runs.

Recovery first reads accepted versions and submission intent. Missing logs do not automatically justify retraining; a lost submission response does not justify another submission. Distinguish failed observation from failed mutation.

Checkpoint reload equivalence, shard coverage, row order and numeric ranges determine whether the delivered score came from the declared model and input. They belong in the account of a working system.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener" aria-label="Enlarge: Compute budgets are part of the experimental method"><img src="/kaggle/17/pilot-timing.svg" alt="Remote pilot report / one positive-weight model / includes startup. Observed speedup is about 1.58, not a full-workflow or two-model ensemble guarantee. Local artifact validation stopped at the CSV field-size limit; no official score is implied." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Compute budgets are part of the experimental method</strong> Remote pilot report / one positive-weight model / includes startup. Observed speedup is about 1.58, not a full-workflow or two-model ensemble guarantee. Local artifact validation stopped at the CSV field-size limit; no official score is implied.<br /><a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/17/pilot-timing.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-17-pilot-timing">Provenance and scope</a></figcaption>
</figure>

## Run status should be an evidence chain

| State | Establishes | Does not yet establish |
| --- | --- | --- |
| Upload accepted | Version exists remotely | Started or correct device |
| Execution complete | Process and logs available | Valid coverage or quality |
| Artifact validation passes | IDs, values and checkpoints agree | Hidden evaluator acceptance |
| Official COMPLETE with score | Submission was scored | Component causality or historical rank |

[Titanic](/posts/kaggle-01-titanic/) recovered observation of the same remote version after local DNS failure instead of retraining or resubmitting. A clear submission intent and receipt make recovery less wasteful and more reliable.

## Reproducibility includes the selection process

Immutable code, actual devices, raw curves, complete validation and official receipts identify which version produced a score. Local package revisions and remote notebook versions are different identifiers; checkpoint count is not algorithm count.

Write admission criteria before the next run: representative timing, serial reserves, retained failure artifacts and mutations that must not be blindly retried. Update the plan explicitly after measurement rather than silently cutting training and calling completion sufficient learning.

## Sources and evidence

- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md)
- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/docs/gpu-results.md)
- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/overnight-t4-results.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#protocol)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
