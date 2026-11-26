---
title: "Carvana: budget for the entire submission chain, not only training"
description: "The remote pilot has timing evidence, while CSV validation remains blocked. Full-resolution masks and complete delivery need their own gates."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 17, "topic": "图像分割", "status": "尚未出分", "result": "Pilot v1 COMPLETE; no formal submission or official score", "evidenceDate": "2026-11-26", "source": "https://leebin-try.github.io/kaggle/sources/#case-17", "competitionUrl": "https://www.kaggle.com/competitions/carvana-image-masking-challenge", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/docs/run.md"}
coverImage: "/kaggle/17/cover.svg"
coverAlt: "Original subject illustration: Carvana: budget for the entire submission chain, not only training"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: delivery validation is the current priority. A remote pilot produced timings, but local CSV parsing stopped at a field-size limit and there is no official score. Validate artifact semantics and full-test cost before drawing model-quality conclusions.**

**Status note, November 26, 2026:** a read-only official query at 02:07 UTC showed training pilot v1 COMPLETE and empty competition submission history. The plan’s 0.995 Dice is a target, not an observed result.

## Problem: training, inference and parsing all belong to delivery

There are 318 labelled cars with 16 views each: 5,088 images. Test delivery has 6,254 cars and 100,064 images, at native 1280×1918 resolution. Saving every dense probability map could make disk and transfer costs dominate weights.

The plan keeps complete vehicles in fit, stopping/calibration and independent audit groups. Two seeds would refit all labels, with scoring reusing their native checkpoints instead of retraining.

Remote COMPLETE and artifact validation are distinct: the local review encountered the CSV parser’s default field-size limit. A zero process exit cannot skip that failure.

## Technical approach and pipeline

**Planned pipeline:** whole-car groups; representative pilot and admission; select/audit/refit U-Nets; stream test ZIPs and restore native probabilities; RLE encoding, validation and submission. This complete chain has not finished.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/17/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Carvana"><img src="/kaggle/17/method.svg" alt="Original method diagram for Carvana. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Carvana</strong> Original method diagram for Carvana. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/17/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-17-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Why split by whole car

The 16 views of a car are strongly related. The plan allocates 254 cars for fitting, 32 for stopping/calibration and 32 for independent audit, preserving every view within its vehicle.

Two ResNet34 U-Net seeds, progressive resolution, edge-weighted BCE/Dice and horizontal-flip TTA are planned choices informed by public methods. Their effectiveness in this implementation and budget remains to be established.

### Restore probabilities before deciding geometry and serialization

Thresholding is nonlinear: `resize(probability) >= threshold` generally differs from resizing an already binary mask. Synthetic pairs 0.1/0.6 and 0.4/0.9 both threshold to 0/1, yet their continuous 0.5 crossings differ. Early thresholding loses boundary information.

Use actual labels to verify RLE order. A synthetic non-square example is:

```text
1 1 0
0 1 1

Row-major: 1 1 0 0 1 1
One-based RLE: 1 2 5 2
```

Non-square shapes expose transposition and foreground at the ends exposes missing runs. Fields still require integer pairs, positivity, ordering, no overlap and pixel bounds. Deleting complex masks is not a transparent fix for parsing failures.

### Separate training from submission inference

The design uses independent training and offline prediction notebooks. Native checkpoints and SHA-256 verification connect them. Restore continuous predictions to original dimensions before final thresholding and encoding.

Read JPEGs in batches from ZIPs, assign nonoverlapping ID ranges to two T4s and stream compressed RLE outputs. Avoid retaining one dense probability map per test image. These are pipeline choices, not evidence that the complete run has succeeded.

## Evaluation

Higher vehicle-mask Dice is the quality goal, with whole-car internal holdout. Separately validate all 100,064 IDs, native geometry and RLE meaning so the intended predictions reach the grader.

The observed pilot compares single/dual-card wall time on the same 512 images, with only one positive-weight model. Local validation remains incomplete, so timings are neither quality confirmation nor a full two-model/TTA budget. The proposed 0.995 target is not a measured score.

## Results and evidence



### A format issue worth finding before training

The evaluation page’s stated pixel ordering disagreed with actual GIF/CSV masks. Eleven native label pairs matched row-major C-order and not F-order.

Non-square and boundary-run replay tests are more informative than relying on conventions from another segmentation task. Geometry or encoding errors can invalidate an otherwise good model.

### What the pilot timings can and cannot project

The remote report records approximately **95.04 seconds** on one GPU and **60.06 seconds** on two for the same 512 images: an observed ratio about **1.58**, including worker/model startup.

Only one model had positive weight. This is not complete two-model TTA throughput. The critical path must add parallel selection’s slower worker, serial calibration/audit, the slower parallel refit, then full inference, merge and validation.

The chart redraws aggregate remote timings without claiming local validation or official scoring. Fix and validate field parsing, then recheck a conservative budget for every allowed model branch.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener" aria-label="Enlarge: Carvana"><img src="/kaggle/17/pilot-timing.svg" alt="Remote pilot report / one positive-weight model / includes startup. Observed speedup is about 1.58, not a full-workflow or two-model ensemble guarantee. Local artifact validation stopped at the CSV field-size limit; no official score is implied." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Carvana</strong> Remote pilot report / one positive-weight model / includes startup. Observed speedup is about 1.58, not a full-workflow or two-model ensemble guarantee. Local artifact validation stopped at the CSV field-size limit; no official score is implied.<br /><a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/17/pilot-timing.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-17-pilot-timing">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** no official Carvana result exists yet. Useful current findings concern encoding semantics and cost decomposition. After parsing is repaired, all independent checks still need to pass; pilot COMPLETE is not the full quality evidence chain.

### Admission checks are more useful than optimistic timing

Measure the actual image reading, TTA, native restoration, encoding and compression path. Compare one versus two devices on identical input, rather than inferring speed from allocated cards.

Proceed only when quality, artifact validity and remaining resources admit the complete workflow. Upload establishes a version exists. Full artifacts and a scoring receipt establish different later stages.

## Next experiments

These steps have not completed.

1. Re-read the original pilot output with a bounded larger CSV field capacity, retaining all ID, integer, run-order, overlap and pixel-range checks. Do not truncate or drop masks.
2. Re-admit every allowed model/TTA/native-restoration/compression branch with a conservative complete-test budget.
3. Only after both gates, complete training, whole-car audit and official scoring, retaining separate receipts for each stage.

### A parser limit is not a quality threshold

Python’s default 131,072-character CSV limit caused the local stop. It is a parser boundary, not a published competition RLE constraint. Early masks can be complex and produce long text.

A proposed bounded repair is `csv.field_size_limit(32 * 1024 * 1024)`, followed by every semantic and coverage check. Increasing capacity only admits parsing; it does not validate the rows.

Recheck the unmodified predictions first. The proposed repair is not a completed validation record, and pilot speed does not predict final Dice.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/carvana-image-masking-challenge)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/docs/run.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/17_carvana_image_masking_challenge/)
- [Pilot notebook (private)](https://www.kaggle.com/code/godlovebinlee/carvana-segmentation-train)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-17)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
