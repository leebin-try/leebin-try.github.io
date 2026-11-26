---
title: "Titanic: relational features change the question that validation asks"
description: "Passenger groups provide signal, but also define which outcomes are available. The split matters as much as the classifier."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 1, "topic": "表格学习", "status": "已出分", "result": "Public accuracy 0.80861", "evidenceDate": "2026-11-19", "source": "https://leebin-try.github.io/kaggle/sources/#case-01", "competitionUrl": "https://www.kaggle.com/competitions/titanic", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/docs/wcg-results.md", "submission": "58538264"}
coverImage: "/kaggle/01/cover.svg"
coverAlt: "Original subject illustration: Titanic: relational features change the question that validation asks"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: the value of relationship features depends on what is known about fellow passengers at prediction time. The submitted combination scored 0.80861 accuracy; group-held-out validation did not establish an extra contribution from the expert models over the relationship rule alone.**

## Problem: individual rows or people travelling together?

The input describes passengers and the output is a binary survival label. With only 891 labelled rows, a few people or one family can change the internal ordering of candidates. Treating rows as independent is a convenient modelling assumption; family decisions, shared tickets and class make their outcomes related.

Two uses of that relationship must be separated. Unlabelled attributes establish who might belong together. Survival proportions learn from outcomes. Aggregating both over the full table before splitting can expose a held-out answer through a feature.

The intended prediction scenario therefore comes first: complete unknown outcomes in a partly observed network, or predict an entirely unfamiliar party? A protocol that estimates the first ability need not estimate the second.

## Technical approach and pipeline

**Pipeline:** construct relationships from unlabelled attributes; learn outcomes inside each fitting fold; route passengers to rules or role-specific XGBoost experts; compare ordinary and group-held-out validation; generate all test labels.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/01/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Titanic"><img src="/kaggle/01/method.svg" alt="Original method diagram for Titanic. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Titanic</strong> Original method diagram for Titanic. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/01/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-01-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Build relationships before deciding which labels may cross them

Surname, class, normalized ticket, fare and embarkation information define women/children groups. Women and boys with the Master title may share outcome evidence; adult male labels do not enter that mapping. Ambiguous relationships are not forcibly completed, and remaining passengers use role-specific CUDA XGBoost experts.

The group structure uses unlabelled attributes from all 1,309 passengers: an explicit transductive choice. Outcome maps, however, may read only the current fitting fold. Observing a ticket is not observing its answer. The group design adapts public WCG work by cdeotte, mviola and others; it is not a complete reproduction of their headline scores.

### Keep membership and outcome maps as separate objects

The pseudocode makes the boundary explicit. Membership may use all unlabelled covariates under the declared setting, but the outcome map is rebuilt in every fold. Target statistics for fitting rows also need cross-fitting so that a passenger’s own label cannot become its feature.

```python
membership = build_groups(all_unlabeled_covariates)
for fit_ids, held_ids in split_protocol:
    outcome_map = fit_group_outcomes(membership, labels[fit_ids])
    features_fit = cross_fit_outcomes(fit_ids, membership, labels)
    features_held = apply_outcomes(held_ids, outcome_map)
    evaluate_role_experts(features_fit, features_held)
```

Consider a synthetic group whose two labelled members survived. A random row split can make that evidence available for a third passenger. Holding out the whole group removes it. Neither protocol is inherently wrong; they represent different deployment questions. Weak or ambiguous matches can also propagate incorrect outcomes, so unmatched and multiply matched states should remain explicit.

## Evaluation

Accuracy is the fraction of scored passengers classified correctly; higher is better. Repeated stratified fivefold validation estimates performance when some relations can be familiar. Holding out complete groups tests parties without known group outcomes. Averaging the two would obscure their different estimands.

Validation follows fold-local reconstruction of every label map. The official score judges competition improvement; internal protocols locate where an improvement might apply. No component-by-component ablation has separated the contributions of relationships, fare handling and expert routing.

## Results and evidence



### Preserve the gap between the evaluation settings

| Evaluation | Selected accuracy |
| --- | ---: |
| Ordinary repeated fivefold mean | 0.847737 |
| Entire relationship-group holdout | 0.821549 |
| Official public | 0.80861 |

The official result increased from 0.79665 to 0.80861: 1.196 percentage points, approximately five net additional correct predictions among 418 test passengers. The internal scores cannot replace this result or conceal the drop on unfamiliar groups.

### Read the control comparison without inventing attribution

The figure compares four candidates under both protocols. Relationship features brought small ordinary-validation gains. Under group stress, the pure WCG rule and expert combination had the same mean, so this protocol did not identify an independent expert-model increment.

The gap between protocols is not a measurable “leakage percentage”: grouping, available relationships and the target population all changed. A better diagnostic separates familiar groups, new groups, ambiguous matches and unmatched passengers, with support counts.

To test a mechanism, freeze the rules, training rows and thresholds, then change only the fare representation. If gains disappear across group resamples, withdraw the claim that per-person fare drove the improvement. One small official change cannot establish a precise universal effect.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/01/validation.svg" target="_blank" rel="noopener" aria-label="Enlarge: Titanic"><img src="/kaggle/01/validation.svg" alt="Internal validation; not official scores. Three ordinary fivefold repeats versus one grouped fivefold stress protocol. Different generalization questions; no independent feature attribution." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Titanic</strong> Internal validation; not official scores. Three ordinary fivefold repeats versus one grouped fivefold stress protocol. Different generalization questions; no independent feature attribution.<br /><a href="/kaggle/01/validation.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/01/validation.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-01-validation">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** retain the joint design of relational features and validation boundaries. The evidence supports the final combination over the previous official submission; it does not support the claim that a more complex tree improves every population.

### Write down whom the model is expected to meet

Group splitting is stricter, but not automatically more appropriate. If partially observed families are available in the real task, isolating every family measures a harder extrapolation problem. For new families, scattering members across folds is optimistic. Report these capabilities separately.

Only the final combination has the new official score, so its gain cannot be assigned independently to fare engineering, rules, routing or GPU use. The same reasoning applies to customers, hospitals, devices and merchants: draw their relationships before deciding which can cross the validation boundary.

## Next experiments

These are proposed experiments, in priority order, rather than completed runs.

1. Freeze grouping and rules; change only fare representation. Compare paired net corrections across folds, rejecting gains that disappear when groups change.
2. Report support and errors for familiar, new and ambiguous groups. Fix incorrect propagation before increasing tree depth.
3. After the internal comparison, reconcile the candidate with official evidence under the same scoring definition. A few corrected test passengers are not a replacement for fresh confirmation.

### The same total gain can come from different passengers

The expert combination exceeds pure WCG by about 0.000749 under ordinary validation, but ties it under group stress. This rules out assigning every gain to complex trees; it does not establish that experts are useless for the actual test relationship structure.

A follow-up can stratify paired corrections by known companions, group size and ambiguity, using only unlabelled conditions to define strata. Weight the strata for the deployment population. Do not select an easy subgroup after observing which predictions were correct. If experts help only familiar parties, limit the conclusion to them.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/titanic)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/docs/wcg-results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/01_titanic/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-01)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
