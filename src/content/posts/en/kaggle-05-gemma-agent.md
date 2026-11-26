---
title: "Gemma coding agents: a few successful tasks do not justify an upgrade"
description: "The refreshed candidate failed its larger confirmation. Preserve task-level outcomes, environment failures and the scored control."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 5, "topic": "智能体", "status": "已出分", "result": "Official issue-resolution score 0.13", "evidenceDate": "2026-11-20", "source": "https://leebin-try.github.io/kaggle/sources/#case-05", "competitionUrl": "https://www.kaggle.com/competitions/gemma-4-developer-agent", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/docs/refresh31b-results-20261120.md", "submission": "58473700"}
coverImage: "/kaggle/05/cover.svg"
coverAlt: "Original subject illustration: Gemma coding agents: a few successful tasks do not justify an upgrade"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: an agent upgrade must improve fixes on the same tasks. The refreshed candidate resolved four of 24 confirmation tasks, versus six for the control, so the scored version was retained. Editing a prompt is not itself an upgrade.**

## Problem: the patch’s behaviour is the evaluated object

A coding agent receives an issue and repository, then produces changes applied in an isolated task environment. The evaluation unit is the complete task, not one plausible line of code. Locating files, understanding constraints, editing, testing and delivery can each break the chain.

Model size is one variable among context retention, tools, task time, dependency setup and validation cost. The 31B and 12B official results came from different full candidates and hardware, so their difference is not a model-size-only effect.

A more useful comparison runs two frozen candidates on the same task inputs, environment and budget, retaining patches and grader artifacts.

## Technical approach and pipeline

**Pipeline:** issue and repository snapshot; the 31B QAT control locates relevant code; make a minimal patch; run targeted tests and iterate; compare identical tasks; promote only after the quality gate.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/05/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Gemma coding agents"><img src="/kaggle/05/method.svg" alt="Original method diagram for Gemma coding agents. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Gemma coding agents</strong> Original method diagram for Gemma coding agents. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/05/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-05-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Turn prompt instructions into observable actions

“Understand before editing” should be observable as locating the implementation and tests before patching. “Validate the fix” requires actual commands, exit codes, inspected failures and, when time permits, another revision. A final message saying “tested” does not establish those events.

Retain the patch, test commands, before/after errors, environment failures and terminal scoring status. Split time into model generation, tools and testing so that dependency delays are not blamed on inference.

```text
issue -> locate code -> minimal edit -> targeted test -> inspect result
                           ^                              |
                           `----- revise within budget ---'
```

Patching to one assertion can break unmentioned inputs; repeatedly running every test can consume the analysis budget. Compare policies by which execution stages and failure types they change.

## Evaluation

Task resolution under the declared testing and grading environment is the quality unit. The retained official score is 0.13. Internal task counts screen candidates; one success among two familiar probes is not an estimate of a general 50% success rate.

The 24-task comparison used matched inputs, environment and budget. Its task-level table has four shared resolutions, two control-only resolutions and zero candidate-only resolutions. One candidate environment error is recorded separately, with a consistent denominator. The evidence rejects this refresh; it does not precisely estimate universal success rates.

## Results and evidence



### Established scores and confounded changes

The retained official **0.13** came from the 31B QAT candidate; an earlier 12B candidate scored 0.06. The 31B development probe actually used four L4 GPUs, versus two T4s for the earlier 12B work. Model, hardware and candidate settings changed together.

One of two reused development tasks succeeded for 31B. This was an execution diagnostic, not independent generalization evidence or a replacement for the official result.

### A rejection worth keeping

In the larger 24-task confirmation, the scored control resolved **6**, the refresh **4**, with one environment error separately recorded. The refresh failed promotion and was not formally submitted. A separate six-task patch-first screen resolved no tasks in either arm.

The rejection prevented an appealing small-sample impression from being called an upgrade. Artifact correctness and quality gates have different jobs.

### Task-level comparison: no newly resolved tasks

All 48 downloaded task records were independently reconstructed and matched the remote summary.

| Paired outcome | Tasks | Interpretation |
| --- | ---: | --- |
| Both resolve | 4 | Some control behaviour retained |
| Control only | 2 | Observed net regression |
| Candidate only | 0 | No observed new resolution |
| Neither has a resolution | 18 | Many unresolved tasks; includes environment effects |

The candidate had one environment error, so unresolved tasks cannot all be attributed to model behaviour. Archive and artifact integrity passed; the promotion gate did not. No new formal submission followed.

First replay the two lost resolutions and compare repository inspection, patching, test use and budget allocation. More aggregate counts alone cannot identify the regression mechanism. These are development-confirmation outcomes, not another official success-rate measurement.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/05/paired-confirmation.svg" target="_blank" rel="noopener" aria-label="Enlarge: Gemma coding agents"><img src="/kaggle/05/paired-confirmation.svg" alt="24-task confirmation; not an official leaderboard score. One evaluation environment error was recorded separately; counts are not a general success-rate estimate." width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · Gemma coding agents</strong> 24-task confirmation; not an official leaderboard score. One evaluation environment error was recorded separately; counts are not a general success-rate estimate.<br /><a href="/kaggle/05/paired-confirmation.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/05/paired-confirmation.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-05-paired-confirmation">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** rejecting the refresh was an informative result. The current change did not earn promotion; this is not a universal rejection of larger models, prompt improvements or patch-first policies.

### Keep process quality and outcome quality together

A plausible patch can miss compatibility, edge cases or delivery requirements revealed by hidden tests. Execution logs explain failures, but real evaluation determines the outcome. Environment errors must remain visible rather than be removed to favour a candidate.

Twenty-four tasks constrain a claim more than two familiar ones, without providing a broad stable estimate. Coverage, budgets and environment reliability still matter.

## Next experiments

These are unexecuted designs.

1. Replay the two control-only resolutions, separating behavioural regressions from the environment error.
2. Change one policy, such as the timing of targeted tests, while retaining model, context budget and task environment.
3. Confirm on tasks not repeatedly used for prompt editing. Require outcome and complete-cost gates before promotion.

### Make the comparison more informative

Freeze screening and confirmation roles before running. For every task preserve whether a valid grader terminal exists, what failed, and where the budget ended. A new policy that merely changes the wording of a final response has no demonstrated fixing advantage.

Use matched-task outcomes to decide which failure mechanism deserves attention, then pay for new confirmation rather than continually reselecting on the same tasks.

### Complete outcomes do not identify the mechanism

The paired records already show zero new resolutions and two lost ones. They explain rejection but do not isolate the causal effect of one instruction: the refresh changes execution behaviour, and environment and budget effects remain.

The lost tasks are useful debugging material. Once used to tune a policy, they are development examples, not fresh evidence of new-task ability. If a fix only reduces tool waiting, call it improved budget utilization; claim improved capability only when final task outcomes also improve.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/gemma-4-developer-agent)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/docs/refresh31b-results-20261120.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/)
- [Current and historical versions](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/05_gemma_4_developer_agent/README.md)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-05)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
