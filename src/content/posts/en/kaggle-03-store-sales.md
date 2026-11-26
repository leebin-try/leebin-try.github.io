---
title: "Store Sales: when a feature becomes available matters more than its count"
description: "A recursive LightGBM system improved the official score. Calendar alignment, future information and unsubmitted candidates remain part of the story."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 3, "topic": "时序与推荐", "status": "已出分", "result": "Public RMSLE 0.38420", "evidenceDate": "2026-11-18", "source": "https://leebin-try.github.io/kaggle/sources/#case-03", "competitionUrl": "https://www.kaggle.com/competitions/store-sales-time-series-forecasting", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/docs/final-report.md", "submission": "58331119"}
coverImage: "/kaggle/03/cover.svg"
coverAlt: "Original subject illustration: Store Sales: when a feature becomes available matters more than its count"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: forecasting starts with information availability. The reproducible system rolls forward 16 days and scores 0.38420 RMSLE. An internal advantage that depends on future true sales cannot become a deployable method.**

## Problem: one 16-day forecast, not 16 retrospective one-step forecasts

The data contains 54 stores and 33 product families: 1,782 series. The final task is to forecast all 16 future days at once. A training loop that predicts one next day must not be mistaken for a system that receives yesterday’s actual sales during this horizon.

RMSLE measures error in log1p space. Absolute errors have different effects across sales scales, and behaviour near zero matters. Transformations, nonnegativity and inactive-series handling are part of the predictive target.

Backtesting starts at one origin and advances 16 calendar days. Every historical statistic and normalization uses only information then available. Filling later lags with true future sales removes recursive error propagation and evaluates a different problem.

## Technical approach and pipeline

**Pipeline:** align the store–family calendar; identify origin-available covariates; fit family-specific LightGBM models; roll predicted history forward 16 days; average the four window forecasts in sales space.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/03/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Store Sales"><img src="/kaggle/03/method.svg" alt="Original method diagram for Store Sales. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Store Sales</strong> Original method diagram for Store Sales. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/03/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-03-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Share information within a product family

Each product family has a LightGBM model shared across stores. Inputs include sales lags, calendar, store, promotion and local holidays. Sales use log1p and fitting-window scaling. Each later day consumes previous predictions rather than unavailable actuals.

The final fixed arithmetic mean combines versions using 7, 56, 365 and 730-day lag windows. Some effective fitting histories also differ, so this is not a clean window-length-only ablation.

### How one error becomes another day’s input

In a synthetic series with actual sales 10, 10, 10, a first-day prediction of 12 becomes the lag-1 value for day two. Its next error may feed day three. One-step error alone cannot characterize a 16-day rollout.

```python
history = data_available_at_origin.copy()
for day in future_calendar_days:
    features = build_lags_by_calendar_date(history, day)
    forecast = predict_nonnegative_sales(features)
    history = append_predictions(history, day, forecast)
```

Calendar-date lookup matters: when a holiday row is absent, the preceding observed row is not necessarily yesterday. Provided future promotions may be legitimate known covariates; future transactions are not. Neither removing every future-dated field nor using every populated column is a sufficient availability rule.

Averaging sales differs from averaging logs and transforming back. They have different nonlinear behaviour and are not interchangeable implementation details.

## Evaluation

RMSLE is the root mean squared error between log1p predictions and targets; lower is better. It is neither accuracy nor a measurement of inventory or stockout cost. Every comparison must perform the entire forecast horizon with predicted later history.

Candidates should cover identical dates, stores and families. The two repeatedly used development origins remain development evidence. The reproducible official result is 0.38420; the account’s better historical score with missing source attribution is kept separate.

### Two details determine whether the backtest is credible

Missing Christmas records must not turn “previous day” into “previous existing row.” Provided future promotion plans and unavailable future sales also need distinct treatment.

The full 16-day block and all preprocessing stay behind each origin. Repeatedly selecting on the same two windows does not create an untouched confirmation set.

## Results and evidence



### Development-best is not necessarily submitted-best

The reproducible official RMSLE fell from 0.42323 to **0.38420**, about a **9.22%** relative reduction in this error metric. It is not an accuracy-point increase or a measured reduction in business cost.

Another cross-model mixture had a stronger development mean but was not submitted independently. A historical account score of 0.38131 also lacks recovered source provenance. Neither should be attributed to the current reproducible code.

### What the official comparison can establish

The five scored packages favour the final family/window system in this official comparison. They change family decomposition, scaling, history and recursion together, leaving individual effects unresolved.

A cleaner experiment fixes origins and fitting history, then compares global versus family models, one versus multiple windows, and arithmetic versus log-space averaging one at a time. All methods must cover the same rows rather than quietly discard difficult warm-up cases.

Inspect horizon blocks too: better days 1–4 can coexist with worse days 13–16. A total RMSLE does not reveal whether recursive drift is the remaining bottleneck.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/03/scored-candidates.svg" target="_blank" rel="noopener" aria-label="Enlarge: Store Sales"><img src="/kaggle/03/scored-candidates.svg" alt="Five scored packages; multiple components differ. The packages change more than one component; this is not a causal ablation. Unsubmitted configurations are excluded." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Store Sales</strong> Five scored packages; multiple components differ. The packages change more than one component; this is not a causal ablation. Unsubmitted configurations are excluded.<br /><a href="/kaggle/03/scored-candidates.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/03/scored-candidates.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-03-scored-candidates">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** the entire submitted pipeline improved, but each component has not independently earned credit. Diagnose how errors accumulate over the horizon before adding more windows.

### Define the forecast before ranking algorithms

Family splitting, scaling, recursion and blending changed together, so the official delta cannot identify a principal cause. Fixed-origin component comparisons and an additional temporal confirmation would be more informative.

Keep simple controls. GPU ridge was fast but substantially weaker; slower CatBoost settings also lacked a clear advantage here. Their value depends on the horizon, available information and complete cost.

## Next experiments

The following designs are unexecuted.

1. Fix common fitting dates and compare a single window with a multi-window mean.
2. Report errors in days 1–4, 5–8, 9–12 and 13–16, checking whether near-term gains hide distant regressions.
3. Add an unused origin. Do not promote a claim based on old-window averages if it fails on that new confirmation.

### Window length and effective history are entangled

A 730-day lag needs a longer warm-up and leaves fewer usable rows for short-history series. Different windows currently also use different fitting histories. A gain can therefore combine memory length, training population and scaling range.

One mechanism experiment should use the common date intersection and change only visible lags. A separate engineering comparison may let each configuration use its largest available history. Both are useful, but answer different questions.

If long history helps only the early horizon, the next intervention may concern recursion rather than still more lag columns. That remains a hypothesis, not an unlogged result.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/store-sales-time-series-forecasting)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/docs/final-report.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/03_store_sales_time_series_forecasting/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-03)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
