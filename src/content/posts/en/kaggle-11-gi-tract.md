---
title: "GI tract segmentation: finish the convergence evidence before changing the encoder again"
description: "Patient-level splits, native geometry and organ-specific curves matter alongside the official composite score."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 11, "topic": "图像分割", "status": "已出分", "result": "Public / private Dice3DHausdorff 0.87024 / 0.85837", "evidenceDate": "2026-11-23", "source": "https://leebin-try.github.io/kaggle/sources/#case-11", "competitionUrl": "https://www.kaggle.com/competitions/uw-madison-gi-tract-image-segmentation", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/docs/results.md", "submission": "58731174"}
coverImage: "/kaggle/11/cover.svg"
coverAlt: "Original subject illustration: GI tract segmentation: finish the convergence evidence before changing the encoder again"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: the clearest unresolved issue is training-length evidence. Both seeds ended at a three-epoch cap while validation improved. Private score rose from 0.84902 to 0.85837, but that does not establish sufficient training or an encoder-only effect.**

## Problem: 2D inputs, 3D structure and new patients

Adjacent MRI slices and repeated days from one patient share anatomy. Splitting them as independent files can make validation partly a test of recognizing a familiar patient.

The task predicts large bowel, small bowel and stomach masks. A 2.5D representation adds nearby context without using a full 3D network, while increasing the importance of patient-level grouping.

Native 16-bit intensity and spatial restoration are also part of the prediction chain. A correct tensor shape can still hide misaligned geometry or encoding.

## Technical approach and pipeline

**Pipeline:** keep complete patients together; stack offsets −2/0/+2; fit an EfficientNet-B4 U-Net; restore native probability geometry and organ masks; apply a frozen refit rule; obtain the hosted composite score.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/11/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: GI tract segmentation"><img src="/kaggle/11/method.svg" alt="Original method diagram for GI tract segmentation. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · GI tract segmentation</strong> Original method diagram for GI tract segmentation. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/11/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-11-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Give a 2D model neighbouring context

Three MRI slices at offsets −2, 0 and +2 form the input for the middle slice. All days from a patient remain in one validation group. Intensity handling precedes resizing, and predicted probabilities return to original dimensions.

The earlier encoder was ResNet34; the retained newer candidate uses EfficientNet-B4. Neighbouring context is useful structure, not permission to treat nearby slices as independent samples.

### Geometry is part of the model contract

Handle original 16-bit intensities before resizing and use transformations that preserve discrete masks. Restore probability maps before thresholding. Enlarging an already binary thumbnail changes boundaries, especially thin structures.

```text
Patient/day/slice index -> neighbours −2/0/+2
 -> consistent intensity and size transforms -> 2D encoder/decoder
 -> native-size probabilities -> organ decisions -> mask encoding
```

Replay non-square shapes, empty organs, sequence ends and masks touching borders. Tensor-size tests alone do not guarantee native coordinates or RLE order. The cover uses synthetic geometry, not patient imagery.

Internal native-pixel Dice diagnoses overlap. It is not the official Dice3DHausdorff measurement of combined overlap and 3D boundary quality.

## Evaluation

Group all days and neighbouring slices by patient before fitting or selection. Otherwise correlated anatomy crosses the boundary. Higher internal native-pixel Dice is useful diagnostically, while the hosted Dice3DHausdorff composite cannot be numerically substituted.

Keep each organ’s learning trajectory and the three-epoch cap visible. All-data training has no independent validation curve. A 96-row visible preview checks geometry and the interface; hidden-test quality comes from the official scoring receipt.

## Results and evidence



### Keep official and internal metrics distinct

| Candidate | Official public | Official private |
| --- | ---: | ---: |
| ResNet34 parent | 0.86209 | 0.84902 |
| EfficientNet-B4 candidate | 0.87024 | 0.85837 |

The private gain of **0.00935** supported retaining the newer package. Implementation and numeric handling changed as well, so the comparison does not isolate the encoder name as the cause.

### A completed run is not convergence

Both seeds completed only three selection epochs, selected the third, and were still improving. The actual workflow was about four hours eight minutes under a twelve-hour ceiling. Neither unused budget nor a terminal run state proves sufficient training.

Refitting all 38,496 labelled slices produced no independent validation curve. Preview hashes also cannot be presented as hashes of hidden predictions.

### How three observations should change the next experiment

The figure contains only three observed validation points per worker. Connecting them is a visualization of those observations, not evidence about an unobserved later optimum.

Freeze patient split, input and architecture, then extend selection within a measured budget to observe whether patience or another genuine stopping condition occurs. If curves keep improving at another cap, retain that unresolved state instead of treating time completion as convergence.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/11/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: GI tract segmentation"><img src="/kaggle/11/learning.svg" alt="v10 / patient-separated selection / only 3 points per worker. Native pixel Dice is not official Dice3DHausdorff. Lines connect observations only; cap-limited convergence remains unresolved." width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · GI tract segmentation</strong> v10 / patient-separated selection / only 3 points per worker. Native pixel Dice is not official Dice3DHausdorff. Lines connect observations only; cap-limited convergence remains unresolved.<br /><a href="/kaggle/11/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/11/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-11-learning">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** 2.5D is a workable route, and the newer package has an official improvement. Patient-level stopping evidence is the next priority; another encoder swap alone would leave the same uncertainty.

### Improve the evidence before broadening the architecture search

Longer admitted training, patient/organ diagnostics and boundary checks give a clearer account of remaining errors than a new model name. The same lesson applies to video, remote-sensing sequences and repeated device observations: establish the entity boundary first.

## Next experiments

These are proposed steps.

1. Extend only the selection budget under the same patient split, architecture and input. Record actual patience and whether the best point remains capped.
2. Track each organ, empty-slice false positives and boundary diagnostics, checking that aggregate gains do not conceal one organ’s regression.
3. Confirm on new patients with an unchanged geometry/encoding chain, then judge the official composite separately.

### An organ average hides unequal improvements

Worker 0’s native Dice moved approximately from 0.77365 to 0.79424 for large bowel, 0.66889 to 0.70956 for small bowel, and 0.79617 to 0.83751 for stomach. These are patient-held-out worker diagnostics, not three official scores.

Preserve their trajectories when changing length or weighting. Patient-level repetition is a more relevant stability check than repeating highly correlated slices, although it costs more. An additional frozen patient confirmation can test whether the explanation extends beyond familiar anatomy.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/uw-madison-gi-tract-image-segmentation)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/)
- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/11_uw_madison_gi_tract_image_segmentation/README.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-11)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
