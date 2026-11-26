---
title: "Physical engineering agents: model access is not a graded task"
description: "A CUDA probe ran, but the full Docker task environment remains unavailable. Environment readiness needs its own acceptance criteria."
date: "2026-11-26"
category: "Kaggle"
tags: ["Kaggle", "Experiment review"]
cover: "workflow"
featured: false
draft: false
sample: false
kaggle: {"kind": "case", "number": 4, "topic": "智能体", "status": "验证受阻", "result": "No official score; full Docker evaluation environment not established", "evidenceDate": "2026-11-25", "source": "https://leebin-try.github.io/kaggle/sources/#case-04", "competitionUrl": "https://www.kaggle.com/competitions/physical-engineerings-last-exam", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/04_physical_engineerings_last_exam/docs/solution.md"}
coverImage: "/kaggle/04/cover.svg"
coverAlt: "Original subject illustration: Physical engineering agents: model access is not a graded task"
coverCaption: "Original task and method illustration; not an official logo, competition sample or model prediction."

lang: "en"
---

**Core judgment: establish an executable scoring environment before comparing engineering capability. CUDA inference was checked, but the full Docker task chain was not available and no official score exists. Prompt edits cannot replace that missing boundary.**

## Problem: the scored object includes an executable world

An engineering agent may deliver code, design files or another readable artifact. A task-specific grader determines quality. Model replies are intermediate events; files, tools, dependencies and delivery locations define completion.

Separate four layers: whether the model responds, whether the agent calls tools correctly, whether the host provides the task environment, and whether the grader can read the final deliverable. Success at one layer does not establish the rest.

The missing layer here is the full Docker task environment. That does not show weak model quality or an observed zero score. Useful evidence is a precise system boundary and a falsifiable readiness test.

## Technical approach and pipeline

**Intended pipeline:** fixed task inputs; Docker host and tool bridge; agent edits deliverables; grader reads the same artifacts; retain task outcome and environment evidence. The complete environment has not passed admission.

<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/04/method.svg" target="_blank" rel="noopener" aria-label="Enlarge: Physical engineering agents"><img src="/kaggle/04/method.svg" alt="Original method diagram for Physical engineering agents. Arrows show protocol dependencies, not proof that every stage has executed." width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>Method diagram · Physical engineering agents</strong> Original method diagram for Physical engineering agents. Arrows show protocol dependencies, not proof that every stage has executed.<br /><a href="/kaggle/04/method.svg" target="_blank" rel="noopener">Open full figure</a> · <a href="/kaggle/sources/#fig-04-original_method_diagram">Provenance and scope</a></figcaption>
</figure>

### Separate model, tools and task host

The official template bridges into Docker tasks, with model and tools coordinated through the Pi harness. Files, containers, execution permissions, delivery paths and graders jointly constitute the evaluated system. Replacing a model or prompt does not supply those conditions.

A remote T4 probe ran a small Qwen model and verified CUDA inference on one GPU. It was neither a complete engineering task nor a dual-GPU engineering-capability test.

### Treat one task as an auditable transaction

A minimal transaction freezes inputs and versions, creates an isolated workspace, starts a tool-accessible container, executes the agent, checks delivery paths and invokes the grader in the declared context. Record starts, ends, failure categories and artifact locations.

```text
Input snapshot -> host/container ready -> agent executes
                                             |
Score record <- grader reads output <- delivery-path check
```

A successful tool response still requires checking the actual output file in the location the grader reads. A plausible text answer can coexist with no deliverable. Environment smoke tests validate the chain before ability comparisons.

## Evaluation

Task deliverables are evaluated under official grader rules. Fluent conversation or CUDA availability is not a substitute. A valid evaluation requires fixed task inputs, a working environment, an identifiable artifact and a terminal grader result.

No full-task record currently satisfies that contract, so there is no quality score to compare. Environment checks report dependencies, permissions and bridging. Capability evaluation follows environment acceptance. A failure of readiness is not a measured zero on capability; the following acceptance protocol is proposed.

### Make the next pass/fail decision explicit

First run a fixed tiny task through the container, tool bridge, file delivery and grader. Check versioned inputs, expected paths and a readable scoring receipt. Then change one item intentionally and ensure the failure is attributed to the correct layer.

This can identify a missing file, a tool permission issue or an unreachable grader before an expensive model run. Passing the checks only authorizes a meaningful task experiment; it does not establish engineering skill.

## Results and evidence



### Why a partial probe was not called a completed task

The Kaggle runtime lacked a Docker executable, usable daemon socket and required capabilities. Unprivileged namespace attempts did not create an adequate alternative. Under the zero-paid-spend constraint, a suitable full Docker host was not established.

There is consequently no complete public development-task score, official submission or hosted result. The retained CUDA probe establishes only the device/inference boundary actually tested.

## Reflection and conclusion

**Conclusion:** the work located an infrastructure blocker, rather than model superiority. Report the missing full evaluation directly instead of treating model responses, GPU allocation or planned task counts as competition completion.

### Evaluation infrastructure needs acceptance criteria

Agent evaluation depends on more than a model and CSV. The execution world is part of the contract. A probe should identify exactly which layers it verified, with observable outputs and failures, before quality comparisons begin.

### A transferable systems lesson

The same separation is useful in robotics, browser automation and code agents: tool reachability, state isolation and scoring access are independent responsibilities. A failure record that identifies the boundary is more useful than an optimistic “partially running” label.

## Next experiments

These are proposed steps, not completed runs.

1. Send a known-correct prepared deliverable through host, tools and grader; require replayable paths and the expected outcome. This tests the environment only.
2. Send a deliberately wrong deliverable and confirm rejection, ruling out an indiscriminate success path.
3. Only after both checks, run a fixed model on a small task set and separate model, tool and environment failures.

### Use different examples for readiness and ability

An environment check should use an artifact with a known outcome, rather than require the model to discover a difficult solution. Otherwise a failed run confounds setup with capability.

After readiness is established, new tasks can test the model under a frozen environment. Keep input versions, permissions, output locations and grader receipts. Neither a correct prepared artifact nor a successful smoke task can stand in for broad engineering evaluation.

## Sources and evidence

- [Official competition](https://www.kaggle.com/competitions/physical-engineerings-last-exam)
- [Original experiment record (private; access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/04_physical_engineerings_last_exam/docs/solution.md)
- [Code and version (access required)](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/04_physical_engineerings_last_exam/)
- [Public evidence summary](https://leebin-try.github.io/kaggle/sources/#case-04)

Original code and experiment records remain private. The public evidence summary states the score definitions, evidence dates and limits of verification.
