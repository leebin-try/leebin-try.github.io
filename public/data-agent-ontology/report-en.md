<a id="overview"></a>

TECHNOLOGY TRENDS · EVIDENCE REVIEW

# Data agents and ontologies

Technical approaches, findings and primary evidence

Evidence frozen November 13, 2026 | Recent window November 13, 2025–November 13, 2026 | 16 primary sources, 17 evidence items | Research findings and enterprise designs interpreted separately

Data agents increasingly connect business meaning, execution feedback and process verification. Explicit concepts, relations and mappings help locate and combine data. Recent work connects that knowledge to task constraints and acceptance of updates, but these mechanisms do not replace state management or methodological review.

[Data-agent problems](#agent)[Ontology mechanisms](#ontology)[Concept boundaries](#concepts)[Technical approaches](#routes)[Key ablations](#results)[Technical evolution](#progress)[Open questions](#frontiers)[Deployment](#application)[Worked example](#example)[Minimum evaluation](#validation)[Full evidence](#references)Print / save as PDF

<a id="agent"></a>

## Data agents face four problems that need different mechanisms

<a id="c1"></a>

A1 · Meaning and source selection

### Establish business meaning before selecting data operations

**Evidence:** Snowflake semantic views represent metrics, dimensions, joins and example queries. Databricks Genie distinguishes modelled definitions from learned knowledge, including authority and conflict resolution. See [E1](#e1) and [E2](#e2).

**Sources:** [Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst); [Genie Ontology](https://docs.databricks.com/aws/en/genie/genie-ontology/).

Official design descriptions support explicit semantics, not measured independent gains or a requirement to build a full ontology in every setting.

<a id="state"></a>

A2 · Orchestration and state

### Longer analyses make plan revision and state recovery independent problems

**Evidence:** The LongDS-Bench author abstract reports 68 tasks and 2,225 turns; the highest mean accuracy among five models is 48.45%, and more steps do not necessarily help. A workflow review organizes perception, planning, execution, verification and repair. See [E9](#e9) and [E11](#e11).

**Sources:** [LongDS-Bench: On the Failure of Long-Horizon Agentic Data Analysis](https://aclanthology.org/2026.emnlp-main.584/); [Towards Reliable AI Data Scientists: Data Agents with Workflow Harnesses](https://arxiv.org/html/2609.35255).

48.45% is benchmark mean accuracy, not whole-project success. Longer context and more steps cannot stand in for state management.

<a id="c4"></a>

A3 · Methodology and silent failures

### An ontology alone cannot guarantee correct state or valid analysis

**Evidence:** An analysis including 220 tasks found at least one methodological error in most evaluated solutions and a positive association between leakage and predictive performance. OWL and SHACL also distinguish representation from checking. See [E10](#e10), [E4](#e4) and [E5](#e5).

**Sources:** [The Silent Failures in Agentic Data Science](https://arxiv.org/html/2610.14115); [OWL 2 Web Ontology Language Primer, Second Edition](https://www.w3.org/TR/owl2-primer/); [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/).

Domain rules can support some checks, without detecting every leakage, split or causal error. This evidence also does not prove ontologies never help.

<a id="execution"></a>

A4 · Execution and learned behaviour

### Training, experience reuse and execution optimization can complement ontologies

**Evidence:** DeepAnalyze explores interaction-trajectory training; DS-Agent reuses past cases; LOTUS optimizes batch semantic operations. They address behaviour, experience and computation respectively. See [E14](#e14), [E17](#e17) and [E13](#e13).

**Sources:** [DeepAnalyze: Agentic Large Language Models for Autonomous Data Science](https://arxiv.org/abs/2510.16872); [DS-Agent: Automated Data Science by Empowering Large Language Models with Case-Based Reasoning](https://proceedings.mlr.press/v235/guo24b.html); [Semantic Operators and Their Optimization: Enabling LLM-Based Data Processing with Accuracy Guarantees in LOTUS](https://www.vldb.org/pvldb/vol18/p4171-patel.pdf).

These are not mutually exclusive alternatives at the same architectural layer. Guarantees relative to a reference algorithm do not guarantee a business or causal conclusion.

**Synthesis:** inputs are a natural-language task and authorized data; outputs should include reviewable queries, code, results and conclusions. The following is this report's decomposition, not a universal industry standard. Ontology has its most direct role in aligning meaning and relations; other layers still need state, method and execution systems.

| Problem | Typical failure | Ontology contribution | Other requirements |
| --- | --- | --- | --- |
| Meaning and sources | Ambiguous names, metrics or joins | Align concepts across sources | Definitions, mappings and clarification |
| Plans and state | Reuse stale results after a condition changes | Constrain the meaning of dependencies | Versions, checkpoints, invalidation and rollback |
| Methods and conclusions | Executable code with leakage or invalid inference | Expose some checkable domain rules | Statistical review, provenance and human judgment |
| Execution and budget | Excessive exploration or model calls | Narrow relevant data and candidate paths | SQL/code runtime, optimization and budget control |

<a id="ontology"></a>

## Three threads: mappings, execution constraints and controlled evolution

<a id="mapping"></a>

O1 · Concepts to real data

### Executable mappings matter more than concept descriptions alone

**Evidence:** Ontop rewrites conceptual queries to SQL through relational-to-RDF mappings while data remains at the source. EvoOntology v2 Table 7 reports 89.5% full, 76.1% without Mappings, 87.4% without Relations. See [E3](#e3) and [E8](#e8).

**Sources:** [Key concepts](https://ontop-vkg.org/guide/concepts.html); [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2).

A virtual knowledge graph implementation and a downstream agent benchmark support attention to mappings. One benchmark cannot establish that relations are generally unimportant.

<a id="c2"></a>

O2 · From reference to control

### Test how semantics participates in access and operation selection

**Evidence:** OGDA's matched KramaBench ablation reports 73.00% answer score for the full system and 60.94% with read-only ontology and a replaced agent: 12.06 percentage points. Removing the cross-source semantic layer gives 68.30%. See [E6](#e6).

**Sources:** [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114).

Compare background text, a queryable interface and execution constraints. Replacing the agent also changes orchestration, so the whole difference cannot be assigned to one constraint switch. Different papers' metrics cannot be ranked against one another.

<a id="c3"></a>

O3 · Construction and update acceptance

### Automatically proposed knowledge still needs verification and a gate

**Evidence:** EvoOntology v2 Table 5 reports 89.5% for the full evolution loop and 78.3% without the gate on DDR-Bench. Genie privileges governed definitions; the BURR author abstract finds simple rules can remain competitive. See [E7](#e7), [E2](#e2) and [E16](#e16).

**Sources:** [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2); [Genie Ontology](https://docs.databricks.com/aws/en/genie/genie-ontology/); [Burr: A Benchmark for Ontology Learning from Relational Databases](https://dl.acm.org/doi/10.1145/3769770).

Extraction proposes candidates, data probes test values and mappings, and authoritative business definitions still require confirmation. A more elaborate evolution structure is not itself a progress metric.

<a id="concepts"></a>

## Concept boundaries: ontology, graph, semantic layer and validator

Formal ontology, such as OWL, is narrower than many commercial “Ontology” products. The latter can bundle mappings, metrics, actions and governance; gains cannot all be assigned to the representation language.

| Component | Responsibility | Example |
| --- | --- | --- |
| Ontology | Concepts, types, relations and expressible axioms | Orders, payments and refunds; a refund relates to a payment |
| Knowledge graph | Entities and facts in graph form, often organized by an ontology | Order O17 has payment P9 |
| Metric semantic layer | Aggregation, time, dimensions and business definitions | What net revenue subtracts and which date applies |
| Mapping | Connect business concepts to real fields and queries | Which field implements Payment.id |
| Validation and actions | Actually check conditions or invoke authorized operations | Join cardinality checks, SQL execution and permissions |

**Concept sources:** [Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst); [Key concepts](https://ontop-vkg.org/guide/concepts.html); [OWL 2 Web Ontology Language Primer, Second Edition](https://www.w3.org/TR/owl2-primer/); [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/); [Ontology building / Ontology overview](https://www.palantir.com/docs/foundry/ontology/overview/). See [E1](#e1), [E3](#e3), [E4](#e4), [E5](#e5) and [E12](#e12).

**Implementation boundary:** OWL's open-world semantics does not treat missing facts as automatically false or execute database integrity checks. “Every refund must link to a payment” needs an actual validator in the target data environment, followed by a defined repair, refusal or escalation path.

<a id="routes"></a>

## Compare mechanisms, rather than treating research questions as architectural alternatives

A route describes implementation. R1–R4 can be combined; training, experience and semantic operators complement them. Open questions are listed separately.

| Route | Mechanism | Conditions and cost | Evidence |
| --- | --- | --- | --- |
| R1 · Context and metric semantics | Retrieve metadata, definitions and query examples, then generate SQL | Start with stable metrics; maintain definitions and conflicts | [E1](#e1), [E2](#e2) |
| R2 · Ontology-based access | Concepts, mappings and query rewriting; source data stays in place | Cross-source reuse; governed mapping engineering and query expressivity | [E3](#e3) |
| R3 · Ontology and task constraints | Locate relevant semantics and restrict data-operation scope | Complex lakes; construction checks, runtime integration and regression | [E6](#e6), [E8](#e8) |
| R4 · Objects and actions | Expose business objects, links and permitted actions | Commercial scope can be broader than formal ontology | [E12](#e12) |
| Specialized agent training | Learn planning, execution and feedback | Does not supply absent enterprise definitions | [E14](#e14) |
| Case and experience retrieval | Reuse past solutions | Complements concepts and mappings rather than replacing them | [E17](#e17) |
| Semantic operators and optimization | Batch unstructured processing and invocation optimization | Execution layer can consume semantically located data | [E13](#e13) |

These are not an inevitable low-to-high maturity ladder. Choose against actual failure types, scale and maintenance costs. Graphs, multiple agents, specialized models and ontologies are not mutually exclusive choices at one layer.

<a id="results"></a>

## Key ablations: having an ontology is different from using it to control execution

Compare only within the same paper and setting. Answer score, Traj-Wise and mean accuracy do not form a common ranking.

| Study and location | Control and result | Setting | What follows, and what does not |
| --- | --- | --- | --- |
| OGDA Figure 5 | Full 73.00%; read-only ontology/replaced agent 60.94%; gap 12.06 points | KramaBench; DeepSeek-V4.1-Flash; answer score; [E6](#e6) | Runtime use matters; changed orchestration prevents a single-switch causal attribution |
| OGDA §5.3 | Without cross-source semantics 68.30%; full 73.00% | Same setting; [E6](#e6) | Within-setting contribution, not proof that formal ontology universally beats semantic layers |
| EvoOntology v2 Table 5 | Full 89.5%; no gate 78.3% | DDR-Bench; four-backbone mean Traj-Wise; [E7](#e7) | Supports controlled acceptance, not immunity to production drift |
| EvoOntology v2 Table 7 | Full 89.5%; no Mappings 76.1%; no Relations 87.4% | DDR-Bench; four-backbone average; separate removals; [E8](#e8) | Mappings matter here; differences are not additive and relations are not generally irrelevant |

**Original experiments:** [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114); [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2). Both are author preprint experiments, not independently reproduced for this report. “Using ontology” combines knowledge, representation, interfaces and control unless those are separately isolated.

<a id="progress"></a>

## Technical evolution: experience reuse, enterprise workflows and runtime semantics

This is a problem-oriented account of parallel, combinable approaches. Product documentation demonstrates a design, not convergence on one research architecture.

| Date and type | Material | Change | Evidence role |
| --- | --- | --- | --- |
| 2024 · ICML | DS-Agent | Case reasoning and iterative feedback | Experience route, [E17](#e17) |
| 2024 draft / ICLR 2025 | Spider 2.0 | Large schemas, dialect documents and project environments in workflow evaluation | Problem definition, not an ontology effect, [E15](#e15) |
| 2025 · PVLDB | LOTUS | Semantic operators and execution optimization | Execution mechanism, [E13](#e13) |
| 2025-12-05 · publication | BURR | Database-to-ontology mapping benchmark; simple-rule reminder | Author abstract only, [E16](#e16) |
| 2026-09-14 draft / 11-02 v2 | EvoOntology | Runtime semantic access and paired acceptance of candidate updates | Specified v2 ablations; revision is not a new original release, [E7](#e7)/[E8](#e8) |
| 2026-11-09 · draft | OGDA | Verified semantic construction and task-graph constrained operations | Research-stage, mainly record-structured data, [E6](#e6) |

Dynamic product documents retain access dates separately. A documentation update is not necessarily a feature launch, and chronology does not establish a necessary line of inheritance.

<a id="frontiers"></a>

## Open questions: test the reliability of construction, updates and verification

F1 · R1/R2

### How are proposed concepts confirmed as business meaning?

**Evidence:** Data probes test values and mappings, but cannot independently establish organizational intent. Ambiguity detection, authority and minimal clarification remain research questions. See [E2](#e2) and [E16](#e16).

**Sources:** [Genie Ontology](https://docs.databricks.com/aws/en/genie/genie-ontology/); [Burr: A Benchmark for Ontology Learning from Relational Databases](https://dl.acm.org/doi/10.1145/3769770).

A proposed research direction, not a delivered product capability.

F2 · R3

### How can updates avoid breaking established behaviour?

**Evidence:** Versioning, controlled patches, retained regression sets and drift checks need measured benefits and continuing cost. See [E7](#e7).

**Sources:** [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2).

An acceptance gate has conditional evidence, not a guarantee against every regression.

F3 · R2/R3

### How much comes from relations, mappings and constraints?

**Evidence:** Control knowledge amount and interfaces to distinguish semantic content, structure and orchestration. Module ablations do not settle all tasks. See [E6](#e6) and [E8](#e8).

**Sources:** [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114); [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2).

The controlled comparison is the research task; an ontology label is not the explanation.

F4 · Across routes

### How should combined state and methodological errors be verified?

**Evidence:** Semantic alignment, state, statistical checks and execution interact. Evaluate the process as well as the final score. See [E9](#e9), [E10](#e10) and [E13](#e13).

**Sources:** [LongDS-Bench: On the Failure of Long-Horizon Agentic Data Analysis](https://aclanthology.org/2026.emnlp-main.584/); [The Silent Failures in Agentic Data Science](https://arxiv.org/html/2610.14115); [Semantic Operators and Their Optimization: Enabling LLM-Based Data Processing with Accuracy Guarantees in LOTUS](https://www.vldb.org/pvldb/vol18/p4171-patel.pdf).

An open question, not a claim that one system has already solved end-to-end reliability.

“Frontier” means questions the reviewed evidence does not adequately resolve. Multimodal ontology and cross-organization reuse are also potential directions, without unverified claims of mature capability.

<a id="application"></a>

## Deployment: start with an auditable narrow loop before expanding ontology work

Start with a narrow semantic layer

### Few tables, stable metrics and a one-shot question

**Evidence:** Establish definitions, examples, legal joins and reconciliation against real tasks. Do not add a complex stack merely because ontology is a fashionable term. See [E1](#e1) and [E3](#e3).

**Sources:** [Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst); [Key concepts](https://ontop-vkg.org/guide/concepts.html).

Engineering advice, not a user-data experiment or a universal product rating.

<a id="c5"></a>

Worth testing a broader ontology system

### Cross-system ambiguity and repeated source/join errors

**Evidence:** Build one business subdomain with real mappings, then test access interfaces or execution constraints against construction and maintenance cost. See [E6](#e6), [E8](#e8) and [E16](#e16).

**Sources:** [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114); [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2); [Burr: A Benchmark for Ontology Learning from Relational Databases](https://dl.acm.org/doi/10.1145/3769770).

Include initial work, updates, runtime, human intervention and regression costs.

| Task shape | Technical prerequisite | Maturity and human responsibility |
| --- | --- | --- |
| Fixed metric questions | Clear definitions, mappings, templates and reconciliation | Establish a production baseline; maintain definitions and regressions |
| Bounded-domain multistep analysis | Known semantics but changing samples and state | Supervised use; inspect stale state and conclusion evidence |
| Heterogeneous cross-source analysis | Unified concepts, fields and relation paths | Test interfaces and constraints; measure maintenance against gains |
| Open-ended attribution or modelling | Changing goals, methods and correctness criteria | Domain and methodology review; executable code is insufficient |

**Reference flow:** clarify metric, time and object → query concepts, mappings and definitions → plan relevant operations → execute SQL, Python or semantic operators → reconcile results, review methods and deliver evidence.

Retain task meaning, data/code versions, queries, tool traces and validation outcomes. The execution system enforces permissions and budgets; an ontology description does not perform authorization. Synthesis draws on [Key concepts](https://ontop-vkg.org/guide/concepts.html), [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114), [LongDS-Bench: On the Failure of Long-Horizon Agentic Data Analysis](https://aclanthology.org/2026.emnlp-main.584/) and [Towards Reliable AI Data Scientists: Data Agents with Workflow Harnesses](https://arxiv.org/html/2609.35255).

<a id="example"></a>

## Worked mechanism: locate refunds, then separately review the explanation for revenue decline

**Illustration, not a measured case:** a user asks why quarterly net revenue fell. The system must handle meaning, mappings, metric definition, computation and interpretation.

| Stage | What must be explicit | Division of responsibility |
| --- | --- | --- |
| Concepts and mappings | Systems and fields for orders, payments and refunds | Ontology defines relations; mappings connect actual data, [E3](#e3) |
| Metrics and joins | Refund date versus payment date; one-to-many aggregation | Metric semantics and execution rules prevent double counting, [E1](#e1) |
| Changed conditions | Which results must be recomputed after time-definition changes | Versioning, dependencies and invalidation, [E9](#e9) |
| Interpretation | Channel contribution versus a causal claim | Separate descriptive decomposition from causal inference, [E10](#e10) |

A correct concept graph, executable SQL and fluent charts do not independently prove the business explanation. Source-data errors can propagate into both ontology and calculation.

<a id="validation"></a>

## Minimum evaluation: isolate knowledge, structure and execution controls

Control information amount and interfaces before attributing a benefit. The following protocol is proposed; this report did not run training, scoring or reproduction experiments.

| Arm | Held constant | Changed | Question |
| --- | --- | --- | --- |
| A · Metadata/retrieval baseline | Model, tasks, tool permissions and budget | Ordinary metadata and document retrieval | Where does the current system fail? |
| B · Governed semantic text | Same reviewed facts, metrics and mappings as C | Express equivalent knowledge in text | Is additional business knowledge sufficient? |
| C · Structured ontology interface | Facts/mappings match B; interface budget matched | Explicit relations and queryable structure | What does structure/interface add? |
| D · Execution constraints | Same semantic content as C; orchestration as fixed as possible | Pre-operation checks and task scope | What extra value comes from control? |

If B→C changes both organization and interface, it still does not isolate graph structure. Add an equal-interface text-tool arm if needed. Keep construction/update data separate from the final holdout rather than repeatedly tailoring an ontology to test answers.

Evaluation dimensions

### Measure source selection, computation, methods and cost

**Evidence:** Source accuracy, incorrect joins, final-result correctness, methodological-error detection, false refusals, intervention and per-task cost, including ontology construction/update labour. See [E6](#e6), [E9](#e9), [E10](#e10) and [E16](#e16).

**Sources:** [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114); [LongDS-Bench: On the Failure of Long-Horizon Agentic Data Analysis](https://aclanthology.org/2026.emnlp-main.584/); [The Silent Failures in Agentic Data Science](https://arxiv.org/html/2610.14115); [Burr: A Benchmark for Ontology Learning from Relational Databases](https://dl.acm.org/doi/10.1145/3769770).

Use the same task budget and inspect failures, rather than publishing only one average.

Rejection conditions

### Do not expand construction without a robust gain

**Evidence:** If B and C are comparable, added structured work is not yet supported. If D's false refusals or regressions offset gains, roll back constraints. If semantic repair leaves errors, investigate state and methods.

**Sources:** .

Predeclare thresholds against business consequences; do not invent a universal passing line.

Cover ambiguity, synonyms across sources, many-to-many joins, changed time definitions, unknown concepts and source errors. Audit failure categories under a common budget.

<a id="references"></a>

## Full primary sources and claim-level evidence

Sixteen sources support seventeen evidence items. Publication type, exact locations, reading scope and inference limits travel with each claim.

Browse all sources and evidence

<a id="s1"></a>

### S1 · [Cortex Analyst](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)

Snowflake | Dynamic official product documentation, accessed 2026-11-13.

**Original location and reading scope:** Key features; Understanding Semantic Views. Relevant body sections read.

<a id="e1"></a>

**E1 · Schema alone does not supply business meaning:** Semantic views include metrics, dimensions, joins and example queries for business-question-to-SQL conversion.

**Conditions and limits:** Official design, without a uniform ontology-toggle control. Supports explicit semantics, not a requirement for OWL or a full ontology.

Related discussion: [C1](#c1).

<a id="s2"></a>

### S2 · [Genie Ontology](https://docs.databricks.com/aws/en/genie/genie-ontology/)

Databricks | Page updated 2026-11-09; accessed 2026-11-13. Official product documentation.

**Original location and reading scope:** Modeled knowledge; Learned knowledge; How Genie resolves conflicts. Relevant body sections read.

<a id="e2"></a>

**E2 · Governed and learned knowledge need distinct authority:** Genie Ontology combines modelled and learned knowledge; governed/certified definitions generally have greater authority.

**Conditions and limits:** Product design, not an independent effect measurement. Supports provenance and authority levels, not infallible conflict resolution.

Related discussion: [C1](#c1), [C3](#c3).

<a id="s3"></a>

### S3 · [Key concepts](https://ontop-vkg.org/guide/concepts.html)

Ontop project | Dynamic official open-source documentation, accessed 2026-11-13.

**Original location and reading scope:** Mappings; Ontology; SPARQL query; VKG specification. Relevant body read.

<a id="e3"></a>

**E3 · Ontology, mappings and execution have distinct jobs:** Ontop rewrites conceptual queries to SQL through relational/RDF mappings while data may remain at its sources.

**Conditions and limits:** Virtual knowledge graph capability. Supports executable mappings, not a requirement that all agents use SPARQL.

Related discussion: [C1](#c1), [C2](#c2).

<a id="s4"></a>

### S4 · [OWL 2 Web Ontology Language Primer, Second Edition](https://www.w3.org/TR/owl2-primer/)

W3C; edited by Pascal Hitzler and others | Recommendation, 2012-12-11.

**Original location and reading scope:** §2 What is OWL 2?; §3 Basic Notions. Relevant body read.

<a id="e4"></a>

**E4 · Logical representation does not execute data acceptance:** The Primer distinguishes knowledge representation, database constraints and program execution. Open-world semantics does not automatically make missing facts false.

**Conditions and limits:** OWL 2 semantics, not the semantics of every commercial Ontology product. Limits equating axioms with SQL integrity checks.

Related discussion: [C4](#c4).

<a id="s5"></a>

### S5 · [Shapes Constraint Language (SHACL)](https://www.w3.org/TR/shacl/)

W3C RDF Data Shapes Working Group | 2017 Recommendation; accessed 2026-11-13.

**Original location and reading scope:** Abstract; Shapes and Constraints; Validation and Graphs. Relevant body read.

<a id="e5"></a>

**E5 · Constraints require a validation mechanism:** SHACL shapes specify conditions and validate whether an RDF data graph satisfies them.

**Conditions and limits:** A validation standard. Separates reasoning and checking; passing RDF constraints does not prove statistical validity.

Related discussion: [C4](#c4).

<a id="s6"></a>

### S6 · [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114)

Boyi Zhang and others | arXiv:2611.12114 v1, 2026-11-09. Research preprint.

**Original location and reading scope:** §3 Method; §5.3 Ablation Study, Figure 5; Appendix F; Limitations. Read, not independently reproduced.

<a id="e6"></a>

**E6 · Compare how ontology enters execution:** On the same KramaBench ablation, full answer score is 73.00%, read-only ontology with a replaced agent 60.94%, and no cross-source semantic layer 68.30%. The first gap is 12.06 percentage points.

**Conditions and limits:** DeepSeek-V4.1-Flash, answer score rather than enterprise accuracy. Agent replacement also changes orchestration. Mainly record-structured data; source errors can propagate. This is conditional within-study evidence.

Related discussion: [C2](#c2).

<a id="s7"></a>

### S7 · [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2)

Meiduo Chong, Shaolei Zhang, Ju Fan and Xiaoyong Du | First draft 2026-09-14; reviewed v2 revision 2026-11-02. Research preprint.

**Original location and reading scope:** Evolution-loop ablation Table 5 and ontology-structure ablation Table 7. Relevant v2 body read, not independently reproduced.

<a id="e7"></a>

**E7 · Automatic updates need an acceptance gate:** Table 5 reports full-loop 89.5% versus no-gate 78.3% on DDR-Bench.

**Conditions and limits:** Four-backbone mean Traj-Wise, not BIRD EX. Supports acceptance under this setting, not freedom from production-distribution regressions.

Related discussion: [C3](#c3).

<a id="e8"></a>

**E8 · Mappings connect semantics to execution:** Table 7 reports full 89.5%, no Mappings 76.1%, and no Relations 87.4%.

**Conditions and limits:** DDR-Bench, four-backbone average, separately removed modules. Differences are not additive. Relations are not thereby unimportant in all tasks.

Related discussion: [C2](#c2), [C3](#c3).

<a id="s11"></a>

### S11 · [Ontology building / Ontology overview](https://www.palantir.com/docs/foundry/ontology/overview/)

Palantir | Dynamic official architecture documentation, accessed 2026-11-13.

**Original location and reading scope:** Object and link types; action types and functions. Relevant body read.

<a id="e12"></a>

**E12 · Enterprise Ontology can include a governed action layer:** Objects, properties and links map data, while action types and functions express business operations.

**Conditions and limits:** Commercial platform architecture is broader than formal ontology. It supports an implementation route, not a general agent success guarantee.

Related discussion: [C2](#c2).

<a id="s15"></a>

### S15 · [Burr: A Benchmark for Ontology Learning from Relational Databases](https://dl.acm.org/doi/10.1145/3769770)

Lukas Laskowski, Michael Hladik, Jan Portisch, Fabian Panse and Felix Naumann | 2025-12-05, PACMMOD 3(6), Article 305.

**Original location and reading scope:** Author-provided abstract only; not the page’s AI-generated summary. Full experiments not verified in this review.

<a id="e16"></a>

**E16 · Automatic ontology learning does not automatically beat rules:** The BURR author abstract describes 54 database–ontology mapping scenarios and notes advantages of simple rule methods relative to LLM approaches.

**Conditions and limits:** Author abstract only; no detailed body ranking or delta adopted. A reminder against assuming automatic construction wins; mapping learning differs from downstream agent analysis.

Related discussion: [C3](#c3), [C5](#c5).

<a id="s8"></a>

### S8 · [LongDS-Bench: On the Failure of Long-Horizon Agentic Data Analysis](https://aclanthology.org/2026.emnlp-main.584/)

Kewei Xu and others | EMNLP 2026. Conference benchmark.

**Original location and reading scope:** ACL Anthology author abstract and benchmark definition; appendix not comprehensively rechecked.

<a id="e9"></a>

**E9 · Long workflows still have state-management gaps:** The author abstract reports 68 tasks and 2,225 turns; highest mean accuracy among five models 48.45%; more steps need not help.

**Conditions and limits:** Specialized multiturn state-update, recovery and composition benchmark, not whole-project success. Does not independently test whether adding ontology removes these failures.

Related discussion: [C4](#c4).

<a id="s9"></a>

### S9 · [The Silent Failures in Agentic Data Science](https://arxiv.org/html/2610.14115)

Xue Li, Hongqian Xia, Daniel Gomm, Aécio Santos, Cornelius Wolff and Madelon Hulsebos | arXiv:2610.14115 v1, 2026-10-09.

**Original location and reading scope:** Abstract; §1; §3.1 Large-scale Failure Mode Analysis. Relevant setting/failure body read, not reproduced.

<a id="e10"></a>

**E10 · Predictive scores and valid methods can diverge:** An analysis including 220 tasks found at least one methodological error in most evaluated solutions and a positive association between leakage and predictive performance.

**Conditions and limits:** Preprint analysis includes LLM judgments, human checks and task filtering. Finite failures and samples establish risk, not a direct refutation of a specific ontology system.

Related discussion: [C4](#c4).

<a id="s10"></a>

### S10 · [Towards Reliable AI Data Scientists: Data Agents with Workflow Harnesses](https://arxiv.org/html/2609.35255)

Huachi Zhou and others | arXiv:2609.35255 v1, 2026-09-28. Review preprint.

**Original location and reading scope:** Abstract and §1 Introduction’s five-stage framework and reliability discussion. Relevant body read.

<a id="e11"></a>

**E11 · Verification and repair must span the workflow:** The review organizes perception, planning, execution, verification and repair, noting errors can occur without runtime exceptions.

**Conditions and limits:** A synthesis framework, not a unified ablation. Supports layered reasoning without declaring a uniquely best architecture.

Related discussion: [OVERVIEW](#overview), [C4](#c4).

<a id="s12"></a>

### S12 · [Semantic Operators and Their Optimization: Enabling LLM-Based Data Processing with Accuracy Guarantees in LOTUS](https://www.vldb.org/pvldb/vol18/p4171-patel.pdf)

Liana Patel and others | PVLDB 18(11), 2025, pp. 4171–4184. Database systems paper.

**Original location and reading scope:** Abstract and §1 Introduction’s operators/reference algorithms. Relevant body read.

<a id="e13"></a>

**E13 · Design semantic correctness and execution efficiency separately:** LOTUS expresses batch work with semantic operators and optimizes execution, discussing statistical guarantees relative to reference algorithms.

**Conditions and limits:** Guarantees depend on assumptions and the reference. Supports execution optimization, not correctness of every downstream business or causal conclusion.

Related discussion: [OVERVIEW](#overview), [C4](#c4).

<a id="s13"></a>

### S13 · [DeepAnalyze: Agentic Large Language Models for Autonomous Data Science](https://arxiv.org/abs/2510.16872)

Shaolei Zhang and others | arXiv:2510.16872, 2025-10-19. Training-route preprint.

**Original location and reading scope:** Abstract, Introduction and agentic-training overview; no generalized ranking adopted.

<a id="e14"></a>

**E14 · Training can learn planning and execution behaviour:** DeepAnalyze explores curriculum-based agent training and synthetic data-interaction trajectories from processing through reporting.

**Conditions and limits:** Author model/experiment account, without cross-system ranking here. Learned behaviour does not supply absent enterprise definitions; it can complement ontology.

Related discussion: [OVERVIEW](#overview).

<a id="s14"></a>

### S14 · [Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows](https://arxiv.org/abs/2411.07763)

Fangyu Lei and others | First draft 2024-11-12; ICLR 2025; arXiv v2 2025-03-17.

**Original location and reading scope:** Abstract and §1 enterprise environment/workflow definition. Relevant body read; no live leaderboard claims.

<a id="e15"></a>

**E15 · Enterprise work extends beyond one SQL statement:** Spider 2.0 evaluates large schemas, dialect documentation, project environments and multistep workflows.

**Conditions and limits:** ICLR task definition supports system-level problem framing, not an isolated ontology-superiority claim.

Related discussion: [OVERVIEW](#overview).

<a id="s16"></a>

### S16 · [DS-Agent: Automated Data Science by Empowering Large Language Models with Case-Based Reasoning](https://proceedings.mlr.press/v235/guo24b.html)

Siyuan Guo and others | ICML 2024. Experience-reuse route.

**Original location and reading scope:** Author abstract on case-based reasoning and iterative feedback; mechanism scope only.

<a id="e17"></a>

**E17 · Reusing experience is another automation mechanism:** DS-Agent combines case reasoning with iterative feedback to support modelling using existing solutions.

**Conditions and limits:** Author abstract as mechanism background. Experience reuse is not cross-source concept modelling and can complement it.

Related discussion: [OVERVIEW](#overview).

<a id="limitations"></a>

## Scope and limitations

This review covers ontology-grounded agents, ontology learning, ontology-based data access, enterprise semantics, long workflows and methodological verification through primary papers, official documentation and standards. It is not exhaustive. The recent window is 2025-11-13 through 2026-11-13, with foundational work retained separately.

OGDA and EvoOntology are recent preprints without independently verified reproduction in this review. Their single-benchmark ablations are not industry-wide results. EvoOntology uses the specified v2 Tables 5 and 7, labelled four-backbone averages; differing backbone descriptions elsewhere are not mixed into the conclusions. LongDS and BURR rely on the author abstracts within the stated scope, not generated page summaries.

Enterprise documents support descriptions of architectures and features, not independent benefit or maturity ratings. No user-data experiment was run. The deployment suggestions and proposed evaluation remain hypotheses. The English edition preserves the original November 13 evidence snapshot rather than claiming a fresh literature review.

**Suggested sequence:** [Key concepts](https://ontop-vkg.org/guide/concepts.html), [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes](https://arxiv.org/html/2611.12114) and [EvoOntology: A Self-Evolving Ontology Layer for Data Agents](https://arxiv.org/html/2609.15779v2), followed by the representation boundary in [OWL 2 Web Ontology Language Primer, Second Edition](https://www.w3.org/TR/owl2-primer/) and method risks in [The Silent Failures in Agentic Data Science](https://arxiv.org/html/2610.14115).

Purpose: algorithm research and technical-route decisions. Preprint findings were not independently reproduced; product design is not a business-outcome guarantee. [Complete companion Markdown report](/data-agent-ontology/report-en.md). Evidence as of 2026-11-13.
