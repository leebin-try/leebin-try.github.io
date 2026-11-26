---
title: "CommonLit: evaluate new prompts and keep content separate from wording"
description: "Summary-only pooling, exact tokenization and two-target diagnostics make the technical choices and remaining gaps explicit."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 16, "topic": "语言模型", "status": "已出分", "result": "Public / private MCRMSE 0.59760 / 0.54871", "evidenceDate": "2026-11-25", "source": "https://leebin-try.github.io/kaggle/sources/#case-16", "competitionUrl": "https://www.kaggle.com/competitions/commonlit-evaluate-student-summaries", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/docs/results.md", "submission": "58876423"}
coverImage: "/kaggle/16/cover.svg"
coverAlt: "Original subject illustration: CommonLit: evaluate new prompts and keep content separate from wording"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: prioritize unseen-prompt generalization and unequal target difficulty. Wording error is substantially higher than content error, and only four prompts limit validation. Context allocation and target diagnostics are better-supported next steps than simply a larger model.**

## Problem: two assessment targets on unfamiliar prompts

The 7,165 summaries come from four prompts, with continuous content and wording targets. Covering source information and evaluating expression are related but unequal abilities; one aggregate can hide that imbalance.

Whole-prompt holdout keeps the question, passage context and all corresponding summaries on one side. Fold sizes differ, so fold RMSE values cannot simply be averaged. Global OOF MCRMSE pools each target’s residuals before computing its root, then averages the two target RMSEs.

A very difficult small fold should not accidentally receive equal row weight through a different aggregation formula.

## Technical approach and pipeline

**Pipeline:** four whole-prompt holdouts; question/passage/summary sequence; native tokenization and summary-position mask; DeBERTa-v3-small with summary-only pooling; fold checkpoint choice; fixed four-epoch full-label refit; two output scores.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/16/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: CommonLit"><img src="/kaggle/16/method.svg" alt="Original method diagram for CommonLit. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · CommonLit</strong> Original method diagram for CommonLit. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/16/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-16-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Let the summary attend to the passage, then pool only the summary

DeBERTa-v3-small reads length-limited question, passage and student summary. The regression head averages only summary token states and outputs content and wording. Original word embeddings are frozen while the remaining trainable parameters fit on remote T4s.

IDs and labels are excluded from the text. Each held-out prompt also selects its fold checkpoint, so OOF still contains selection. Four prompts cannot establish broad new-domain scoring ability.

### Why summary pooling differs from pooling the entire input

Attention lets the summary consult earlier context, while masked mean pooling stops a long passage from dominating the final representation and diluting differences between students.

```text
[question fragment][passage fragment][student summary]
                 -> shared attention context
summary positions only -> masked mean -> two regression scores
```

The native SentencePiece vocabulary, special tokens and summary mask must agree. A token conversion that changes IDs can invalidate a loaded model despite matching tensor shapes. Freezing embeddings is a declared parameter choice, not evidence that every other weight stayed unchanged.

## Evaluation

MCRMSE averages content and wording RMSE; lower is better. Pool all OOF residuals for each target before taking its root. Unequal folds and nonlinear square roots make an unweighted mean of fold RMSEs another quantity.

Whole-prompt splits approximate an unfamiliar question. Checkpoint choice on each held-out prompt adds selection optimism. Selected epochs were 1, 5, 5 and 2; the all-data length is their rounded-up median, four epochs. That frozen rule is not an independently validated full-data optimum.

## Results and evidence



### Which target is harder?

Aligned global OOF MCRMSE was **0.577645**, with content RMSE about **0.512731** and wording about **0.642559**. One prompt’s wording RMSE reached **0.730655**.

The disparity directs error analysis toward expression and prompt structure. It does not prove a specific feature intervention will work, and must retain the same global aggregation when compared.

### Selected epochs and the observed loss trajectory

The four selected epochs were 1/5/5/2 and the full refit used four. Fold 0’s training loss fell while validation content worsened; wording could move in the opposite direction.

Two folds reached the six-epoch ceiling without completing the preset patience observation. Approximately 47 minutes of main workflow under a much larger budget does not establish sufficient training.

### Separate a compatibility failure from a model-quality claim

An initial pretraining probe failed when a newer loading diagnostic included a set that JSON could not serialize. The fix also retained the native SentencePiece vocabulary rather than a conversion path. This was an execution issue, not evidence against DeBERTa.

Official **0.59760 public/0.54871 private MCRMSE** met the initial public ≤0.60 goal, while remaining far from the historical public reference 0.44378. The public/private gap is not a version improvement.

### Use the two-fold curves to formulate a test

Fold 0’s falling training MSE coincides with worsening content error; the aggregate chooses epoch 1 even though wording later improves. Fold 1 selects epoch 5 of six without a full patience observation.

“Train longer” therefore has no prompt-independent guarantee. Freeze truncation, grouping and aggregation before changing learning strategy. The four-epoch refit rule transfers selected lengths; it does not derive a new optimum from all-data training loss.

New prompt evidence matters more than repeatedly lowering the mean on four familiar prompts.

<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/16/learning.svg" target="_blank" rel="noopener" aria-label="Enlarge: CommonLit"><img src="/kaggle/16/learning.svg" alt="v3 / two complete prompt-held-out selection histories. Targets can move in opposite directions. Fold 1 reaches its six-epoch cap; these are reused selection observations, not official scores." width="792" height="504" loading="lazy" decoding="async" /></a>
<figcaption><strong>Recorded evidence · CommonLit</strong> v3 / two complete prompt-held-out selection histories. Targets can move in opposite directions. Fold 1 reaches its six-epoch cap; these are reused selection observations, not official scores.<br /><a href="/kaggle/16/learning.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/16/learning.csv" download>Download aggregate metric CSV</a> · <a href="/kaggle/sources/#fig-16-learning">Provenance and scope</a></figcaption>
</figure>

## Reflection and conclusion

**Conclusion:** the baseline reached its first public target but is still far from the strong reference. Wording, truncation and prompt differences deserve targeted study; fast completion does not resolve capped training.

### A lesson beyond summary scoring

The grouping unit in a language task may be a prompt, author, document or customer. Define it before choosing the backbone.

More independent prompts would strengthen the conclusion more than another decimal obtained through repeated selection on the same four. Keep target-specific errors so aggregate changes remain interpretable.

## Next experiments

These designs are unexecuted.

1. Freeze backbone, total token length and prompt folds; change passage/summary allocation and report truncation rates plus both global target RMSEs.
2. Diagnose wording by input length and prompt structure, checking that easier content gains do not hide expression failures.
3. Admit longer training only for capped folds under a measured budget, and seek additional prompt confirmation for any broader claim.

### More summary context uses passage context too

Question, passage and summary share a finite token budget. Allocating more to the student does not only expose more student text; it can shorten the evidence passage.

A controlled comparison fixes total length and changes only allocation. Report both targets and actual truncation, not the most favourable prompt. With only four prompts, a rule tuned to familiar length distributions may fail on a new long passage. Independent prompt evidence is necessary before generalizing the judgment.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/commonlit-evaluate-student-summaries)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/docs/results.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/16_commonlit_evaluate_student_summaries/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-16)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
