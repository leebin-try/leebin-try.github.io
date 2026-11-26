---
title: "Predict Future Sales: define the prediction population before choosing the model"
description: "Explicit zero-demand rows and strictly historical features are central to a credible monthly forecasting system."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 7, "topic": "时序与推荐", "status": "已出分", "result": "Public / private RMSE 0.87709 / 0.88182", "evidenceDate": "2026-11-18", "source": "https://leebin-try.github.io/kaggle/sources/#case-07", "competitionUrl": "https://www.kaggle.com/competitions/competitive-data-science-predict-future-sales", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/docs/results.md", "submission": "58475342"}
coverImage: "/kaggle/07/cover.svg"
coverAlt: "Original subject illustration: Predict Future Sales: define the prediction population before choosing the model"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: transaction-only learning omits much of the population that must be predicted. A monthly grid with historical features and LightGBM scored 0.87709/0.88182 official RMSE; the meaning and availability of that grid remain part of the model.**

## Problem: positive transaction logs are not the prediction population

Transactions appear when a sale occurs, but the output is next-month clipped demand for specified shop–item pairs. Aggregating only observed sales teaches something closer to demand conditional on an observed transaction.

An active shop–item grid with explicit zeros redefines the fitting population. Output clipping to 0–20 belongs to the competition contract; it does not show that real demand never exceeds 20.

If a backtest uses the complete active-item set of the forecast month, but deployment cannot know that set at the month’s start, another history-known population check is needed. Competition scores do not settle that deployment assumption.

## Technical approach and pipeline

**Pipeline:** clean sales and shop mappings; form monthly active shop–item grids and fill absent demand with zero; compute past-only lags and hierarchical statistics; select and confirm LightGBM by month; clip final forecasts to 0–20.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/07/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Predict Future Sales"><img src="/kaggle/07/method.svg" alt="Original method diagram for Predict Future Sales. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Predict Future Sales</strong> Original method diagram for Predict Future Sales. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/07/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-07-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### From transactions to a monthly demand grid

The implementation builds each month’s active shop/item combinations, rather than the unlimited Cartesian product of every historical shop and item. Unobserved combinations become zero-demand rows; official test pairs are then joined in their required order.

Features include monthly lags, shop/item/category aggregates, month indicators and safe historical prices. Duplicate-shop mapping, returns and extreme-value treatment also affect what each training example means.

### Aggregation keys, time keys and missingness

Every statistic needs a declared aggregation unit and availability date. Joining an item’s current-month total back into its rows can expose the target, even when the column has an innocuous feature name.

Zeros and absent history differ: no recorded transaction in an eligible pair can mean zero demand, while a genuinely new item has no previous opportunity to sell. Preserve these states so that a model can distinguish low demand from cold start.

```python
past = aggregate_by_month_shop_item(observed_transactions)
features_for_t = join_on_month_offset(past, offset=-1)
assert all_source_months_are_before_t()
```

## Evaluation

RMSE averages squared errors before taking a root; lower is better and large mistakes receive more weight. Here the target is competition-clipped monthly sales, not unconstrained business demand.

Month 32 selected the model; month 33 provided later confirmation against last-month and lag-mean controls on the same population. Features precede each forecast month. Public and private are separate official partitions, not successive model versions.

### First appearance can silently reveal the future

A full-history first-sale month can disclose whether an item is about to appear. Compute it from history available before each forecasting month instead. Similarly, price and group statistics need safe lags, and duplicated shop identifiers should be reconciled consistently across fitting and prediction.

These are data-boundary controls, not stylistic preferences. A feature can look historical in the final table while still being generated with future information.

## Results and evidence



### A later month provides a separate comparison

Month-33 confirmation RMSE was **0.87444**, versus about 1.13582 for last-month demand and 1.02094 for the lag mean. Final official public/private RMSE was **0.87709/0.88182**.

The final model used fixed 612 rounds on all available fitting rows and covered all 214,200 test IDs. The confirmation and official populations differ; close scores are not statistical equivalence.

### Read the confirmation against failure conditions

The chart compares three predictions on the same month, supporting the selected tree system over simple controls there. It does not isolate the causal contribution of zeros, hierarchical statistics or price features.

Break down errors for cold-start items, zero-demand pairs and high-sales pairs. A single RMSE can improve while one population becomes worse. A later month also changes the active assortment, so sample construction needs to travel with the model.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/07/month-confirmation.svg" target="_blank" rel="noopener" aria-label="Enlarge: Predict Future Sales"><img src="/kaggle/07/month-confirmation.svg" alt="Same month 33 confirmation population. Month 32 selected the candidate; month 33 is a separate temporal confirmation. This is not the official test population." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Predict Future Sales</strong> Same month 33 confirmation population. Month 32 selected the candidate; month 33 is a separate temporal confirmation. This is not the official test population.<br /><a href="/kaggle/07/month-confirmation.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/07/month-confirmation.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-07-month-confirmation">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** audit the sample universe before replacing the learner. The current result supports a historical-feature tree pipeline, subject to the declared active-grid availability assumption.

### A representation decision precedes an algorithm decision

Correctly defining eligible zero rows can matter more than adding another model family. The learner should see the population it will be asked to predict, with the same time boundary.

Simple month-level controls are essential: they expose whether an elaborate feature table actually adds information beyond last demand. Preserve their population, clipping and metric definition in every comparison.

## Next experiments

The following checks have not run.

1. Hold learner and months fixed; compare the active grid with a universe knowable only from earlier history.
2. Report support and errors for new items, zeros and high-demand pairs, looking for hidden cold-start failures.
3. Add new months before selecting a new learner. Reused confirmation months become development evidence.

### A clipped target is not original demand

Clipping changes both learning and evaluation. A value of 20 can stand for many larger observed demands, so a model optimized for that target cannot reconstruct their uncensored magnitudes.

A deployment discussion should therefore distinguish the scored output from business demand, clarify eligibility at prediction time and examine whether the competition’s clipping is still appropriate. This is an applicability boundary, not a defect in reporting the official metric.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/competitive-data-science-predict-future-sales)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/07_competitive_data_science_predict_future_sales/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-07)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
