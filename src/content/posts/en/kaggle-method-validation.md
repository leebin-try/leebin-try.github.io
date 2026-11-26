---
title: "Validation across 17 projects: define what will be unfamiliar"
description: "A split is a deployment assumption. Follow entities, time and every learned transformation before interpreting the score."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Validation design", "Generalization"]
cover: "terminal"
sample: false
draft: false
featured: true
kaggle: {"kind": "method", "source": "https://leebin-try.github.io/kaggle/sources/#protocol", "evidenceDate": "2026-11-25", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md"}
coverImage: "/kaggle/validation/cover.svg"
coverAlt: "Original subject illustration: Validation across 17 projects: define what will be unfamiliar"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

Every validation score implies a statement about how future examples differ from today’s examples. Without that statement, arguing over random folds versus time splits often goes nowhere. **Validation first defines unfamiliarity, then estimates error.**

## Turn validation into an executable contract

A complete protocol specifies the prediction unit, observable information, selection process and final population. “Group by patient” is incomplete until all days, preprocessing statistics and checkpoint choices are accounted for. “Temporal split” also needs the actual delivery horizon.

Before running, list every transform’s inputs, fitting population, output users and freeze time. Include vocabularies, category fallbacks, target means, thresholds and ensemble weights. An audit beginning at the final learner’s fit call misses earlier learned information.

Distinguish a permitted transductive task with visible unlabelled covariates from strict historical forecasting. Access to a sample’s attributes and access to its answer are different permissions.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/validation/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Validation across 17 projects"><img src="/kaggle/validation/method.svg" alt="Original method diagram for Validation across 17 projects. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Validation across 17 projects</strong> Original method diagram for Validation across 17 projects. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/validation/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-validation-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

## First: identify the unit that should stay together

| Structure | Possible holdout unit | Ability being tested |
| --- | --- | --- |
| Ticket/family passengers | Whole relationship group | Unfamiliar parties |
| Repeated MRI slices | Patient and all days | New patients |
| Student summaries | Complete prompt | New questions/passages |
| Sales and sessions | Origin and future window | Future prediction with then-available data |
| Multiple car views | Complete vehicle | Unseen cars |

Bigger groups are not automatically better; match the task. [Titanic](/posts/kaggle-01-titanic/) group stress is harder than a scenario with known companions. [GI tract](/posts/kaggle-11-gi-tract/) new-patient claims cannot rely on random slices from familiar anatomy.

## Trace one prediction backwards instead of relying on the name OOF

For a held-out group G, trace the encoder, vocabulary, statistics, initialization, checkpoint, calibration and mixture weights. If any reads G’s labels, that row has participated in learning or selection at that layer.

```text
Labels -> fitted parameters                 declare fitting population
Labels -> feature statistics -> learner     keep statistics inside folds
Labels -> checkpoint/threshold/weight        selection, not independent testing
Unlabelled attributes -> relations/groups   state availability and transduction
```

OOF prevents direct fitting of a row but does not automatically block these other paths. Upstream corpus filtering in Name That LLM and checkpoint choice in CommonLit travel with their OOF claims.

Also check group disjointness, exactly one required prediction per holdout, unseen-category fallback and accidental repeated entities. Scores cannot certify those logic boundaries.

## Second: carry the boundary through every transformation

Dropping the target column is insufficient. Target encoding, imputation means, category dictionaries, vocabularies, thresholds and feature selection can all learn from disallowed examples.

[SF Crime](/posts/kaggle-13-sf-crime/) excludes the held-out week from target statistics. [Name That LLM](/posts/kaggle-02-name-that-llm/) has a separate external vocabulary boundary. [Future sales](/posts/kaggle-07-future-sales/) cannot use a first-sale date discovered in the future. Every learned component needs its own fitting population.

Unlabelled global structure is not automatically label leakage, but its transductive scope and availability must be explicit.

## Third: separate fitting, selection and judgment

Fit learns parameters, stop selects rounds, tune selects thresholds/mixtures, and audit supplies another observation after freezing. This vocabulary clarifies roles without prescribing four subsets for every small dataset.

Too much partitioning can destabilize small groups; grouped cross-fitting or nested selection has its own cost. More important is honest reuse. [CommonLit](/posts/kaggle-16-commonlit/) prompt OOF also chose checkpoints and involves only four prompts, so it is not an untouched external test.

OOF describes direct row fitting, not complete independence of every hyperparameter and upstream decision.

## Rows are not the number of independent observations

CommonLit has 7,165 summaries but four prompts. Resampling rows can understate uncertainty about new prompts, and seed repetition creates no new prompts. GI slices and Titanic relatives raise the same unit-of-evidence question.

Repeated folds also share training rows. Their count is not the number of independent experiments. Bootstrap units should reflect correlation where possible; few groups still limit precision.

This does not require unlimited evaluation. State what current evidence supports, then spend the next budget on new entities, origins or conditions. Once an audit repeatedly selects thresholds, rename it development data.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/01/validation.svg" target="_blank" rel="noopener" aria-label="Enlarge: Validation across 17 projects"><img src="/kaggle/01/validation.svg" alt="Internal validation; not official scores. Three ordinary fivefold repeats versus one grouped fivefold stress protocol. Different generalization questions; no independent feature attribution." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Validation across 17 projects</strong> Internal validation; not official scores. Three ordinary fivefold repeats versus one grouped fivefold stress protocol. Different generalization questions; no independent feature attribution.<br /><a href="/kaggle/01/validation.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/01/validation.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-01-validation">Provenance and scope</a></figcaption>
</figure>

## Fourth: give the conclusion an applicability boundary

Keep groups, information sources and metrics fixed where possible. An official improvement of a combined package supports that package, not the separate causal contribution of every component.

Before a new experiment, write five things: who will be unfamiliar, what is available then, which sets select, which results are diagnostic, and what observation would reject the current hypothesis. That turns score changes into usable judgments.

## Sources and evidence

- [Supporting source (see access requirements)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#protocol)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
