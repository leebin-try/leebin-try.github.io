# Competition case-study template

Use the [bilingual editing guide](../bilingual-editing.md) and retain the six main sections below, followed by sources. Each English article has a Chinese counterpart with the same key and heading structure.

Open with a **core judgment**: a concrete conclusion, the evidence supporting it and where it applies. Prefer “retain the single model because the fixed comparison did not justify averaging” to a generic claim about ensemble strength.

## Problem: state the actual difficulty

Define the input, output and prediction unit. Explain which data structure or constraint matters: entity relationships, timing, class imbalance, geometry or full-test cost. Give a task-specific counterexample to the most tempting wrong assumption.

## Technical approach and pipeline

Start with the complete route: data and split → representation/features → model → selection/calibration → inference and delivery.

Explain what each material choice solves, how it works and what it costs. Distinguish reused checkpoints from fresh training, baselines from selected candidates and single models from mixtures. Explain code and formulas rather than leaving them to speak for themselves.

## Evaluation

Define the metric, its direction, prediction unit and aggregation order. Explain fitting, stopping, tuning, frozen confirmation and official-test roles. State how checkpoints and thresholds were selected and what data has already participated in selection.

Keep artifact validity, elapsed time and predictive quality separate.

## Results and evidence

Lead with the actual state: official score, internal result only, or a blocked workflow. Compare baseline and candidate under the same definitions. Preserve exact values, dates, provenance and failures.

After each figure, explain the observation, the claim it supports and the alternatives it does not exclude. Do not assign a combined package’s gain independently to every component. Public and private partitions are not successive model versions.

## Reflection and conclusion

Answer the opening question directly: what should be retained, rejected or investigated first, and why? Explain the conditions under which the conclusion could fail. Make a clear decision without pretending an untested mechanism has been established.

## Next experiments

List one to three unexecuted experiments, prioritized by the observed bottleneck:

1. State the hypothesis and single intended change, with the other conditions frozen.
2. Define the metric, diagnostics and confirmation population.
3. State what would justify continuing or reject the hypothesis and extra cost.

## Sources and evidence

Link the official task, exact source/code version, public methods and upstream assets. Label private access requirements. Figures retain their aggregate data and scope. Update prose, structured results and evidence summaries together in both languages.
