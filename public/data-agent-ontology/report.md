<a id="overview"></a>

TECHNOLOGY TRENDS · EVIDENCE REVIEW

# Data Agent 与本体 技术主线、关键证据与支撑材料

证据核验截至 2026-11-13｜近期窗口 2025-11-13 至 2026-11-13｜16 项原始来源、17 项证据｜研究结论与企业设计分开解释

> Data Agent 正在把业务语义、执行反馈与过程验证连接起来。本体通过显式概念关系和真实数据映射，为定位与组合数据提供依据；近期研究进一步把它接入任务约束和更新验收，但这些机制不能替代状态管理与分析方法审查。

<a id="agent"></a>

## Data Agent：四类技术问题，分别需要不同机制

<a id="c1"></a>

A1 · 业务语义与选源

### 在跨源企业分析中，应先明确业务语义，再让 Agent 选择数据操作

**关键证据：**Snowflake 以语义视图提供指标、维度、关联和示例查询；Databricks Genie 区分人工治理的定义与自动学习知识，处理来源权威和定义冲突。

**支撑材料：**[Snowflake 语义视图 ↗](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)；[Databricks Genie Ontology ↗](https://docs.databricks.com/aws/en/genie/genie-ontology/)。详见 [E1](#e1)、[E2](#e2)。

支持显式业务语义的实践价值；官方设计说明不等于收益实测，也不能证明所有场景都必须建设完整本体。

<a id="state"></a>

A2 · 多步编排与状态

### 分析链条变长后，计划调整与状态恢复成为独立技术问题。

**关键证据：**作者摘要报告，68 个任务共 2,225 轮；五模型中最高平均准确率为 48.45%，增加步骤未必改善结果。 工作流综述将感知、规划、执行、验证和修复作为迭代过程。

**支撑材料：**[LongDS-Bench · EMNLP 2026 ↗](https://aclanthology.org/2026.emnlp-main.584/)；[Workflow Harnesses · 2026-09-28 ↗](https://arxiv.org/html/2609.35255)。详见 [E9](#e9)、[E11](#e11)。

48.45% 是特定多轮基准的平均准确率，不是完整项目成功率；更长上下文与更多步骤都不能替代状态管理。

<a id="c4"></a>

A3 · 方法验证与静默错误

### 本体不能单独保证长流程状态正确，也不能保证分析方法有效

**关键证据：**对 220 个任务等进行的分析发现，多数被测方案至少存在一种方法错误，并观察到泄漏与预测表现正相关。 OWL 知识表示与 SHACL 数据验证也体现出描述和检查职责的差异。

**支撑材料：**[Silent Failures · 2026-10-09 ↗](https://arxiv.org/html/2610.14115)；[W3C OWL 2 ↗](https://www.w3.org/TR/owl2-primer/)；[W3C SHACL ↗](https://www.w3.org/TR/shacl/)。详见 [E10](#e10)、[E4](#e4)、[E5](#e5)。

本体能支持部分规则检查，但不会自动发现所有泄漏、错误切分和因果误判；这些材料也没有直接证明本体完全无帮助。

<a id="execution"></a>

A4 · 规模化执行与行为学习

### 训练、经验复用和执行优化可与本体组合，贡献应分别评估。

**关键证据：**DeepAnalyze 探索 Agent 交互轨迹训练；DS-Agent 复用历史案例；LOTUS 用语义算子优化批量处理。这些机制分别作用于行为、经验与计算。

**支撑材料：**[DeepAnalyze · 2025-10-19 ↗](https://arxiv.org/abs/2510.16872)；[DS-Agent · ICML 2024 ↗](https://proceedings.mlr.press/v235/guo24b.html)；[LOTUS · PVLDB 2025 ↗](https://www.vldb.org/pvldb/vol18/p4171-patel.pdf)。详见 [E14](#e14)、[E17](#e17)、[E13](#e13)。

它们不是本体的同层替代方案。相对参考算法的执行保证，也不等于最终业务结论或因果解释正确。

**综合判断：**输入是自然语言任务及获授权的数据；输出应是可复查的查询、代码、结果和结论。下表为本报告分层，不是统一行业标准。 本体的直接作用主要在语义与关系对齐，其他层次仍需要状态、方法和执行系统配套。

| 技术问题 | 典型失败 | 本体的作用 | 仍需配套 |
| --- | --- | --- | --- |
| 语义与选源 | 同名异义、指标口径混淆、错误关联 | 直接帮助概念与跨源关系对齐 | 指标定义、数据映射、主动澄清 |
| 计划与状态 | 上游条件改变后仍引用旧结果 | 可约束候选操作和依赖含义 | 版本、检查点、失效传播与回滚 |
| 方法与结论 | 代码运行但泄漏、切分或推断错误 | 提供部分可检查的领域规则 | 统计方法检查、证据追踪、人工判断 |
| 执行与预算 | 探索过多文件、模型调用量失控 | 缩小相关数据与候选路径 | SQL/代码执行、优化器、预算控制 |

<a id="ontology"></a>

## 本体与 Data Agent：映射、执行约束与受控演化三条主线

<a id="mapping"></a>

O1 · 从业务概念到真实数据

### 本体系统的落点是可用映射，而不只是概念与关系描述。

**关键证据：**Ontop 将概念查询转换为 SQL，映射连接关系数据与 RDF 表示，数据可留在源系统。 v2 Table 7 中，完整系统 89.5%，屏蔽 Mappings 为 76.1%，屏蔽 Relations 为 87.4%。

**支撑材料：**[Ontop 概念与映射 ↗](https://ontop-vkg.org/guide/concepts.html)；[EvoOntology · v2 2026-11-02 ↗](https://arxiv.org/html/2609.15779v2)。详见 [E3](#e3)、[E8](#e8)。

Ontop 是虚拟知识图谱实现；EvoOntology 是下游 Agent 实验。二者共同支持重视映射，但不能用单一基准断言所有关系建模都不重要。

<a id="c2"></a>

O2 · 从语义参考到执行控制

### 本体的可检验价值，在于如何参与数据访问和操作选择

**关键证据：**作者的同一 KramaBench 消融中，完整系统答案分数为 73.00%，保留只读本体但替换受约束 Agent 后为 60.94%；差 12.06 个百分点。移除跨源语义层为 68.30%。

**支撑材料：**[OGDA · 2026-11-09 ↗](https://arxiv.org/html/2611.12114)。详见 [E6](#e6)。

推理：应比较本体作为背景、可查询接口和执行约束三种用法。OGDA 的 Agent 替换也改变编排，差值不能隔离归因为单个约束开关；两篇论文指标不同，不能横向排名。

<a id="c3"></a>

O3 · 自动构建与更新验收

### 本体可以自动扩展，但候选知识必须经过验证和更新验收

**关键证据：**v2 Table 5 在 DDR-Bench 上报告：完整演化循环 89.5%，去掉 gate 为 78.3%。 Genie 为人工定义保留较高权威；BURR 作者摘要提醒，简单规则学习本体仍有优势。

**支撑材料：**[EvoOntology · v2 2026-11-02 ↗](https://arxiv.org/html/2609.15779v2)；[Databricks Genie Ontology ↗](https://docs.databricks.com/aws/en/genie/genie-ontology/)；[BURR · 2025-12-05 ↗](https://dl.acm.org/doi/10.1145/3769770)。详见 [E7](#e7)、[E2](#e2)、[E16](#e16)。

自动抽取提出候选，数据探测检查映射，关键业务口径仍需权威确认。更复杂的演化结构本身不是进步指标。

<a id="concepts"></a>

## 概念边界：本体、知识图谱、语义层和验证器各自负责什么

形式本体（如 OWL）与企业的 Ontology 产品不是同一范围。后者常把映射、指标、操作和治理一起提供，效果不能全部归给本体语言。

| 组件 | 主要职责 | 在分析中的例子 |
| --- | --- | --- |
| 本体 Ontology | 定义概念、类型、关系和可表达的公理 | 订单、支付、退款；退款关联支付 |
| 知识图谱 KG | 以图形式表达实体及事实；常使用本体组织语义 | 订单 O17 对应支付 P9 |
| 指标语义层 | 规定聚合、时间、维度和业务口径 | 净收入扣什么、按哪个时间归属 |
| 数据映射 | 把业务概念连接到真实字段和查询 | Payment.id 对应哪个系统字段 |
| 验证与行动机制 | 真正检查约束，或调用获准的操作 | 关联基数检测、SQL 执行、操作权限 |

**概念依据：**[Snowflake 语义视图 ↗](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)；[Ontop 概念与映射 ↗](https://ontop-vkg.org/guide/concepts.html)；[W3C OWL 2 ↗](https://www.w3.org/TR/owl2-primer/)；[W3C SHACL ↗](https://www.w3.org/TR/shacl/)；[Palantir Ontology ↗](https://www.palantir.com/docs/foundry/ontology/overview/)。详见 [E1](#e1)、[E3](#e3)、[E4](#e4)、[E5](#e5)、[E12](#e12)。

**实现边界：**OWL 的开放世界语义不把缺失事实自动判为假，也不自动执行数据库完整性检查。要求“退款必须关联支付”时，应把要求落实为适合目标数据环境的验证程序，再定义失败后的修复、拒答或人工升级。

<a id="routes"></a>

## 技术路线对照：比较实现机制，不把前沿问题当作平级路线

路线回答“如何实现”。R1—R4 可以组合；训练、经验与语义算子属于互补机制。前沿领域另列在后文，回答“什么还没有解决”。

| 路线 | 主要机制 | 适用条件与代价 | 证据 |
| --- | --- | --- | --- |
| R1 · 上下文与指标语义层 | 检索元数据、口径、示例查询后生成 SQL | 固定业务指标可先采用；需要定义维护与冲突处理 | [E1](#e1),[E2](#e2) |
| R2 · 本体驱动的数据访问 | 概念、映射、查询重写，数据保留在源端 | 适合跨源概念复用；映射工程与查询表达需治理 | [E3](#e3) |
| R3 · 本体与任务图约束 | 先定位相关语义，再约束数据操作范围 | 适合复杂数据湖；需要构建验证、执行集成及回归 | [E6](#e6),[E8](#e8) |

| 路线或层次 | 解决什么 | 与本体的关系 | 证据 |
| --- | --- | --- | --- |
| R4 · 业务对象与操作层 | 把对象、关系与获准行动统一暴露 | 商业 Ontology 系统可包含此层，范围比纯形式本体更广 | [E12](#e12) |
| 专门训练 Agent | 学习规划、执行和反馈行为 | 不能自动补齐未提供的企业定义 | [E14](#e14) |
| 案例与经验检索 | 复用历史解决方案 | 可补充本体难以表达的经验；不替代概念与数据映射 | [E17](#e17) |
| 语义算子与执行优化 | 处理批量非结构化数据，优化调用开销 | 执行层可与本体定位的数据和任务配合 | [E13](#e13) |

R1–R3 可以组合，不是从低到高的必然成熟度阶梯。选择依据是实际错误类型、数据规模和可维护成本。 不应将“用图、用多智能体、用专门模型、用本体”列为同层互斥选项；需要分别评估语义、控制与计算机制。

<a id="results"></a>

## 关键消融：有本体、可查询本体与受约束执行，效果不是同一回事

下表只在同一论文、同一设置内比较。不把不同任务的“答案分数”“Traj-Wise”或平均准确率混为统一能力排名。

| 研究与位置 | 对照及结果 | 条件 | 能支持什么／不能推出什么 |
| --- | --- | --- | --- |
| OGDA · Figure 5 | 完整系统 73.00%；只读本体＋替换 Agent 60.94%；差 12.06 个百分点。 | KramaBench；DeepSeek-V4.1-Flash；答案分数；[E6](#e6) | 语义如何参与执行很重要；Agent 替换也改变编排，不能把全部差值隔离归因于单一约束。 |
| OGDA · §5.3 | 移除跨源语义层后 68.30%，完整系统 73.00%。 | 与上一行相同设置；[E6](#e6) | 跨源含义有条件内贡献；不是形式本体普遍优于其他语义层的证明。 |
| EvoOntology v2 · Table 5 | 完整循环 89.5%；无 gate 78.3%。 | DDR-Bench；四骨干 Traj-Wise 平均；[E7](#e7) | 支持更新验收；不保证生产分布变化时没有回归。 |
| EvoOntology v2 · Table 7 | 完整 89.5%；无 Mappings 76.1%；无 Relations 87.4%。 | DDR-Bench；四骨干平均；各项分别移除；[E8](#e8) | 该设置中映射影响明显；不能把差值相加，也不能断言关系不重要。 |

**原始实验：**[OGDA · 2026-11-09 ↗](https://arxiv.org/html/2611.12114)；[EvoOntology · v2 2026-11-02 ↗](https://arxiv.org/html/2609.15779v2)。

两项工作均为作者预印本实验，本文未独立复现。把整个本体系统的提升归因为“用了本体”，会混淆知识量、表示、工具接口与执行控制的贡献。

<a id="progress"></a>

## 技术演进：从经验复用与企业工作流，到运行时语义接口

这是围绕技术问题归纳的演进线；各路线并行且可组合。企业产品文档证明已有设计，不证明研究路线已经统一收敛。

| 时间及性质 | 代表材料 | 具体变化 | 证据角色 |
| --- | --- | --- | --- |
| 2024 · ICML | DS-Agent | 案例推理与迭代反馈支持分析自动化。 | 经验复用路线背景；[E17](#e17) |
| 2024 首稿／2025 ICLR | Spider 2.0 | 大型 schema、文档、方言和项目环境进入企业工作流评估。 | 问题与评测背景，不是本体效果实验；[E15](#e15) |
| 2025 · PVLDB | LOTUS | 以语义算子和优化机制组织批量非结构化处理。 | 执行路线背景；[E13](#e13) |
| 2025-12-05 · 论文发表 | BURR | 对数据库到本体的映射学习建立评测，提醒规则方法仍有优势。 | 本体构建的反向证据；本轮仅作者摘要；[E16](#e16) |
| 2026-09-14 首稿／11-02 v2 | EvoOntology | 语义知识通过工具运行时访问，候选更新接受配对验收。 | 采用 v2 指定消融，不把修订当作新方案首发；[E7](#e7)、[E8](#e8) |
| 2026-11-09 · 首稿 | OGDA | 验证语义构建，并以任务图约束数据操作。 | 研究阶段、记录结构数据为主；[E6](#e6) |

动态企业文档另行标注访问日期；不把文档更新日等同于功能首发日。时间先后不表示方法之间存在必然继承。

<a id="frontiers"></a>

## 前沿领域：让语义构建、更新和验证获得可检验的可靠性

F1 · 关联 R1/R2

### 候选概念如何得到业务确认？

**关键证据：**数据探测能检查值与映射，却不能独自确认企业意图。需研究歧义检测、来源权威及最小澄清。

**支撑材料：**[Databricks Genie Ontology ↗](https://docs.databricks.com/aws/en/genie/genie-ontology/)；[BURR · 2025-12-05 ↗](https://dl.acm.org/doi/10.1145/3769770)。详见 [E2](#e2)、[E16](#e16)。

这是开放问题和候选研究方向，不是已兑现的产品能力。

F2 · 关联 R3

### 如何更新而不破坏已有能力？

**关键证据：**需要版本、受控补丁、保留集回归和漂移检测；验收的收益与持续成本都需测量。

**支撑材料：**[EvoOntology · v2 2026-11-02 ↗](https://arxiv.org/html/2609.15779v2)。详见 [E7](#e7)。

这是开放问题和候选研究方向，不是已兑现的产品能力。

F3 · 关联 R2/R3

### 关系、映射与约束各贡献多少？

**关键证据：**要控制信息量与接口差异，区分语义内容收益、结构收益和编排收益。模块消融不能外推到所有任务。

**支撑材料：**[OGDA · 2026-11-09 ↗](https://arxiv.org/html/2611.12114)；[EvoOntology · v2 2026-11-02 ↗](https://arxiv.org/html/2609.15779v2)。详见 [E6](#e6)、[E8](#e8)。

这是开放问题和候选研究方向，不是已兑现的产品能力。

F4 · 跨路线

### 如何验证方法与组合后的错误？

**关键证据：**语义对齐、状态管理、统计验证与执行误差相互作用，需要覆盖过程的评估，而不只看最终分数。

**支撑材料：**[LongDS-Bench · EMNLP 2026 ↗](https://aclanthology.org/2026.emnlp-main.584/)；[Silent Failures · 2026-10-09 ↗](https://arxiv.org/html/2610.14115)；[LOTUS · PVLDB 2025 ↗](https://www.vldb.org/pvldb/vol18/p4171-patel.pdf)。详见 [E9](#e9)、[E10](#e10)、[E13](#e13)。

这是开放问题和候选研究方向，不是已兑现的产品能力。

以上为本报告研究机会，不是现成解决方案；“前沿”指现有证据仍不能充分回答的问题。 多模态本体、跨组织复用等也值得探索，但本文不把尚未核实的结果写成成熟能力。

<a id="application"></a>

## 落地与成熟度：先建可审计的小范围闭环，再判断是否扩大本体建设

<a id="c5"></a>

适合先做小范围语义层

### 少量表、固定指标、单次问数

**关键证据：**优先补齐定义、示例、合法关联及结果对账，建立真实任务基线；不因“本体”术语额外引入复杂堆栈。

**支撑材料：**[Snowflake 语义视图 ↗](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)；[Ontop 概念与映射 ↗](https://ontop-vkg.org/guide/concepts.html)。详见 [E1](#e1)、[E3](#e3)。

这是工程建议；未在用户数据上验证，不能视为统一产品评级。

值得验证本体系统

### 跨系统、多义概念、重复选源与关联错误

**关键证据：**先构建一个有真实映射的业务子域，再接入候选访问或执行约束；检查错误减少是否超过建设和维护代价。

**支撑材料：**[OGDA · 2026-11-09 ↗](https://arxiv.org/html/2611.12114)；[EvoOntology · v2 2026-11-02 ↗](https://arxiv.org/html/2609.15779v2)；[BURR · 2025-12-05 ↗](https://dl.acm.org/doi/10.1145/3769770)。详见 [E6](#e6)、[E8](#e8)、[E16](#e16)。

需要同时计入初建、更新、运行、人工介入和回归成本。

| 任务形态 | 技术前提 | 成熟度与人工职责 |
| --- | --- | --- |
| 固定指标问数 | 口径、映射、模板和对账清楚 | 可优先建立生产基线；维护定义与回归检查。 |
| 限定领域多步分析 | 语义已知，但样本与中间状态会变化 | 适合有监督使用；检查状态失效与结论依据。 |
| 跨源异构分析 | 概念、字段和关联路径需要统一 | 值得验证本体接口和执行约束；维护成本与增益需实测。 |
| 开放式归因／建模 | 目标、方法与正确性标准可能变化 | 需要领域与方法审查；代码可运行不足以完成验收。 |

**参考架构：****明确任务**（澄清指标、时间与对象） → **查询语义**（选择概念、映射与定义） → **形成计划**（把操作落实到相关数据） → **执行计算**（SQL、Python 或语义算子） → **检查与交付**（对账、方法审查、证据输出）。

运行时记录：任务语义、数据与代码版本、查询/工具轨迹、验证结果。权限与预算由执行系统落实；本体说明不替代授权检查。

**归纳依据：**[Ontop 概念与映射 ↗](https://ontop-vkg.org/guide/concepts.html)；[OGDA · 2026-11-09 ↗](https://arxiv.org/html/2611.12114)；[LongDS-Bench · EMNLP 2026 ↗](https://aclanthology.org/2026.emnlp-main.584/)；[Workflow Harnesses · 2026-09-28 ↗](https://arxiv.org/html/2609.35255)。详见 [E3](#e3)、[E6](#e6)、[E9](#e9)、[E11](#e11)。

<a id="example"></a>

## 具体用途：本体帮助定位退款数据，收入下降的解释仍需独立审查

**以下为机制说明，不是实测案例：**用户问“本季度净收入为什么下降”，系统需要同时处理业务含义、数据映射、指标口径、计算与解释。

| 分析环节 | 应明确什么 | 本体及配套机制的分工 |
| --- | --- | --- |
| 概念与映射 | 订单、支付、退款对应的系统和字段 | 本体定义概念关系，映射连接真实数据；[E3](#e3) |
| 指标与关联 | 退款按支付日还是退款日归属，一对多关联如何汇总 | 指标语义和执行规则控制口径及重复计算；[E1](#e1) |
| 条件变更 | 用户改变时间口径后，哪些结果必须重算 | 需要版本、依赖和失效传播；本体说明不自动完成；[E9](#e9) |
| 结论解释 | 哪个渠道贡献降幅，是否能断言因果 | 描述性分解与因果判断分开，方法审查独立进行；[E10](#e10) |

概念图正确、SQL 可运行、图表流畅，都不足以单独证明业务解释正确。实际数据的错误也可能进入本体和最终计算。

<a id="validation"></a>

## 最小验证：控制业务信息量，区分知识、结构和执行约束的增益

只有控制信息量与执行接口，才能判断本体带来了什么收益。以下为待执行方案，本文没有启动训练、跑分或复现。

| 实验组 | 保持一致的内容 | 有意改变的因素 | 回答的问题 |
| --- | --- | --- | --- |
| A · 元数据与检索基线 | 同一模型、任务、工具权限和预算 | 仅提供常规元数据与文档检索 | 原有系统错在哪里 |
| B · 受治理语义说明 | 与 C 使用同一组已审定事实、指标与映射 | 将同等知识写成文本说明 | 更多业务知识本身是否足够 |
| C · 结构化本体接口 | 事实和映射与 B 一致，接口预算匹配 | 显式概念关系；可查询结构 | 结构或可查询接口的增益 |
| D · 接入执行约束 | 语义内容与 C 一致，尽量保持编排一致 | 操作前检查与任务范围约束 | 控制机制的附加效果 |

B→C 若同时改变信息组织与接口，仍不能隔离“图结构”单因素。需要时再加等接口文本工具组。构建/更新集与最终保留集分离，避免按测试答案反复调本体。

验证指标

### 同时测定位、计算、方法和代价

选源正确率、错误关联率、最终结果正确率、方法错误检出率、误拒绝率、人工介入与单任务成本；记录本体初建和更新工时。

[OGDA · 2026-11-09 ↗](https://arxiv.org/html/2611.12114)；[LongDS-Bench · EMNLP 2026 ↗](https://aclanthology.org/2026.emnlp-main.584/)；[Silent Failures · 2026-10-09 ↗](https://arxiv.org/html/2610.14115)；[BURR · 2025-12-05 ↗](https://dl.acm.org/doi/10.1145/3769770)。详见 [E6](#e6)、[E9](#e9)、[E10](#e10)、[E16](#e16)。

推翻条件

### 没有稳健增益，就不扩大建设

若 B 与 C 相当，则暂不支持结构化本体的额外投入；若 D 误拒绝或回归抵消收益，则回退约束；若修复语义后仍错，应转查状态与方法。

阈值按业务错误后果预先确定，不虚构通用达标线。

任务建议覆盖歧义、跨源同义字段、多对多关联、时间口径变更、未知概念与源数据错误。统一预算，按失败类型做人工审计，避免只汇总一个平均分。

<a id="references"></a>

## 完整支撑材料：日期、原文位置与证据边界

正文的观点是本报告综合判断；原始事实、作者实验和产品设计分别记录。E 指证据，S 指来源；同一论文的多项消融不是多个独立复现。

**本体、企业语义与构建验证**

<a id="s1"></a>

### S1 · [Cortex Analyst ↗](https://docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst)

Snowflake｜动态官方文档；访问于 2026-11-13｜官方产品文档。

**原文位置：**Key features；Understanding Semantic Views。**阅读范围：**相关正文已阅读。

<a id="e1"></a>

**E1 · 只有 schema 会缺少业务含义：**文档明确把指标、维度、关联和示例查询纳入语义视图，用于业务问题到 SQL 的转换。

**条件：**官方设计说明，无统一本体开关对照。 **边界：**支持显式业务语义；不能证明必须采用 OWL 或完整本体。

支持；关联 [C1](#c1)。

<a id="s2"></a>

### S2 · [Genie Ontology ↗](https://docs.databricks.com/aws/en/genie/genie-ontology/)

Databricks｜页面更新 2026-11-09；访问于 2026-11-13｜官方产品文档。

**原文位置：**Modeled knowledge；Learned knowledge；How Genie resolves conflicts。**阅读范围：**相关正文已阅读。

<a id="e2"></a>

**E2 · 人工定义与自动学习知识需要区分权威：**Genie Ontology 组合 modeled 与 learned knowledge；人工治理与认证的定义一般具有更高权威性。

**条件：**产品文档，不是独立效果实测。 **边界：**支持定义治理与来源分级；不证明其冲突处理总是正确。

支持；关联 [C1](#c1)、[C3](#c3)。

<a id="s3"></a>

### S3 · [Key concepts ↗](https://ontop-vkg.org/guide/concepts.html)

Ontop 项目｜动态文档；访问于 2026-11-13｜开源系统官方文档。

**原文位置：**Mappings；Ontology；SPARQL query；VKG specification。**阅读范围：**相关正文已阅读。

<a id="e3"></a>

**E3 · 本体、映射和查询执行是不同职责：**Ontop 将概念查询转换为 SQL，映射连接关系数据与 RDF 表示，数据可留在源系统。

**条件：**面向虚拟知识图谱的系统能力说明。 **边界：**支持概念到数据的可执行映射；不等同于所有 Agent 都需 SPARQL。

定义与实现依据；关联 [C1](#c1)、[C2](#c2)。

<a id="s4"></a>

### S4 · [OWL 2 Web Ontology Language Primer, Second Edition ↗](https://www.w3.org/TR/owl2-primer/)

W3C；Pascal Hitzler 等编｜2012-12-11 Recommendation｜知识表示标准说明。

**原文位置：**§2 What is OWL 2?；§3 Basic Notions。**阅读范围：**相关正文已阅读。

<a id="e4"></a>

**E4 · OWL 描述逻辑含义，不自动执行数据验收：**OWL 2 Primer 明确区分知识表示、数据库约束与程序执行；开放世界语义下，缺失信息不自动视为假。

**条件：**W3C 对 OWL 2 的说明；并非所有商业 Ontology 的统一语义。 **边界：**限制将本体公理等同于 SQL 数据完整性检查的说法。

限制；关联 [C4](#c4)。

<a id="s5"></a>

### S5 · [Shapes Constraint Language (SHACL) ↗](https://www.w3.org/TR/shacl/)

W3C RDF Data Shapes Working Group｜2017 Recommendation；访问于 2026-11-13｜数据验证标准。

**原文位置：**Abstract；Shapes and Constraints；Validation and Graphs。**阅读范围：**相关正文已阅读。

<a id="e5"></a>

**E5 · 数据约束需要验证机制：**SHACL 用 shapes 定义条件并验证 RDF data graph 是否满足这些条件。

**条件：**标准说明验证对象与机制。 **边界：**支持推理与验证职责分开；RDF 约束通过也不证明统计方法有效。

支持与限制；关联 [C4](#c4)。

<a id="s6"></a>

### S6 · [OGDA: Ontology-Grounded Data Agents for Reliable Analysis over Heterogeneous Data Lakes ↗](https://arxiv.org/html/2611.12114)

Boyi Zhang 等｜2026-11-09，arXiv:2611.12114 v1｜研究预印本。

**原文位置：**§3 Method；§5.3 Ablation Study、Figure 5；Appendix F；Limitations。**阅读范围：**方法、消融与局限已阅读；未独立复现。

<a id="e6"></a>

**E6 · 本体怎样参与执行，比“是否提供本体”更值得比较：**作者的同一 KramaBench 消融中，完整系统答案分数为 73.00%，保留只读本体但替换受约束 Agent 后为 60.94%；差 12.06 个百分点。移除跨源语义层为 68.30%。

**条件：**Figure 5、§5.3、Appendix F；DeepSeek-V4.1-Flash；答案分数，不是企业准确率。 **边界：**Agent 替换同时改变编排，不能把全部差值隔离归因为一个约束开关；记录结构数据为主，源数据错误仍会传播。

条件内实证；关联 [C2](#c2)。

<a id="s7"></a>

### S7 · [EvoOntology: A Self-Evolving Ontology Layer for Data Agents ↗](https://arxiv.org/html/2609.15779v2)

Meiduo Chong、Shaolei Zhang、Ju Fan、Xiaoyong Du｜初稿 2026-09-14；采用 2026-11-02 修订的 v2｜研究预印本。

**原文位置：**Ablation Study on Evolution Loop，Table 5；Ablation Study on Ontology Structure，Table 7。**阅读范围：**v2 相关正文已阅读；未独立复现。

<a id="e7"></a>

**E7 · 自动更新需要验收闸门：**v2 Table 5 在 DDR-Bench 上报告：完整演化循环 89.5%，去掉 gate 为 78.3%。

**条件：**四个骨干模型的 Traj-Wise 平均；同表内比较；不是 BIRD EX。 **边界：**支持更新验收的条件内价值；不保证生产分布变化时不会回归。

条件内实证；关联 [C3](#c3)。

<a id="e8"></a>

**E8 · 数据映射比单纯增加关系描述更接近执行落点：**v2 Table 7 中，完整系统 89.5%，屏蔽 Mappings 为 76.1%，屏蔽 Relations 为 87.4%。

**条件：**DDR-Bench、四骨干平均；分别移除模块，不能把差值相加。 **边界：**支持在该设置中重视映射；不证明关系本身在所有任务都不重要。

条件内实证；关联 [C2](#c2)、[C3](#c3)。

<a id="s11"></a>

### S11 · [Ontology building / Ontology overview ↗](https://www.palantir.com/docs/foundry/ontology/overview/)

Palantir｜动态官方文档；访问于 2026-11-13｜官方产品架构说明。

**原文位置：**Object and link types；Action types and functions。**阅读范围：**相关正文已阅读。

<a id="e12"></a>

**E12 · 企业 Ontology 也可能包含受治理的行动层：**Palantir 把数据映射为对象、属性和链接，并以 action types、functions 等表达业务操作。

**条件：**官方平台架构说明；商业术语的范围比纯形式本体更宽。 **边界：**支持从语义到行动的实现路线；不提供通用 Agent 成功率保证。

实现依据；关联 [C2](#c2)。

<a id="s15"></a>

### S15 · [Burr: A Benchmark for Ontology Learning from Relational Databases ↗](https://dl.acm.org/doi/10.1145/3769770)

Lukas Laskowski、Michael Hladik、Jan Portisch、Fabian Panse、Felix Naumann｜2025-12-05，PACMMOD 3(6)，Article 305｜期刊论文／本体学习基准。

**原文位置：**作者提供的 Abstract；不采用页面 AI-generated summary。**阅读范围：**仅作者摘要用于结论；完整实验未核验。

<a id="e16"></a>

**E16 · 自动本体学习并非天然优于规则方法：**BURR 作者摘要介绍 54 个数据库—本体映射场景，并指出简单规则方法相对 LLM 方法仍有优势。

**条件：**仅核对作者摘要；未使用正文中的具体排序或差值。 **边界：**限制“全自动构建一定更好”的推断；任务与下游 Agent 分析不同。

反向提醒；关联 [C3](#c3)、[C5](#c5)。

**Data Agent、可靠性与执行背景**

<a id="s8"></a>

### S8 · [LongDS-Bench: On the Failure of Long-Horizon Agentic Data Analysis ↗](https://aclanthology.org/2026.emnlp-main.584/)

Kewei Xu 等｜EMNLP 2026｜会议论文／基准。

**原文位置：**ACL Anthology 作者摘要与基准定义。**阅读范围：**本轮核对作者摘要，未全面复核实验附录。

<a id="e9"></a>

**E9 · 长流程仍存在状态管理缺口：**作者摘要报告，68 个任务共 2,225 轮；五模型中最高平均准确率为 48.45%，增加步骤未必改善结果。

**条件：**作者摘要；多轮状态更新、恢复和组合任务。 **边界：**这是专门基准，不是整项项目成功率，也未单独测试“加本体是否消除错误”。

问题证据；关联 [C4](#c4)。

<a id="s9"></a>

### S9 · [The Silent Failures in Agentic Data Science ↗](https://arxiv.org/html/2610.14115)

Xue Li、Hongqian Xia、Daniel Gomm、Aécio Santos、Cornelius Wolff、Madelon Hulsebos｜2026-10-09，arXiv:2610.14115 v1｜研究预印本。

**原文位置：**Abstract；§1；§3.1 Large-scale Failure Mode Analysis。**阅读范围：**研究设置与失败类型相关正文已阅读；未复现。

<a id="e10"></a>

**E10 · 分析高分与方法有效性可能背离：**对 220 个任务等进行的分析发现，多数被测方案至少存在一种方法错误，并观察到泄漏与预测表现正相关。

**条件：**预印本；大规模分析包含 LLM 判定、人工校验与任务条件过滤。 **边界：**失败类型和样本有限；证明存在方法风险，不是针对某个本体系统的直接反证。

问题证据；关联 [C4](#c4)。

<a id="s10"></a>

### S10 · [Towards Reliable AI Data Scientists: Data Agents with Workflow Harnesses ↗](https://arxiv.org/html/2609.35255)

Huachi Zhou 等｜2026-09-28，arXiv:2609.35255 v1｜研究综述预印本。

**原文位置：**Abstract；§1 Introduction 的五阶段框架与可靠性问题。**阅读范围：**框架与问题定义相关正文已阅读。

<a id="e11"></a>

**E11 · 可靠分析需要贯穿流程的验证与修复：**综述以感知、规划、执行、验证、修复组织工作流，强调分析错误可能没有运行异常。

**条件：**综述框架，不是统一消融实验。 **边界：**支持分层理解 Data Agent；不能以综述框架判定唯一最佳架构。

框架依据；关联 [C0](#overview)、[C4](#c4)。

<a id="s12"></a>

### S12 · [Semantic Operators and Their Optimization: Enabling LLM-Based Data Processing with Accuracy Guarantees in LOTUS ↗](https://www.vldb.org/pvldb/vol18/p4171-patel.pdf)

Liana Patel 等｜PVLDB 18(11)，2025，4171–4184｜数据库系统论文。

**原文位置：**Abstract；§1 Introduction 的算子与参考算法说明。**阅读范围：**相关正文已阅读。

<a id="e13"></a>

**E13 · 语义正确性与大规模执行效率要分别设计：**LOTUS 用语义算子表达批量处理，并优化执行，相对参考算法讨论统计保证。

**条件：**数据库执行系统论文；保证受参考算法与假设约束。 **边界：**支持独立考虑执行优化；不能直接保证最终业务结论或因果解释正确。

系统依据；关联 [C0](#overview)、[C4](#c4)。

<a id="s13"></a>

### S13 · [DeepAnalyze: Agentic Large Language Models for Autonomous Data Science ↗](https://arxiv.org/abs/2510.16872)

Shaolei Zhang 等｜2025-10-19，arXiv:2510.16872｜研究预印本／训练路线背景。

**原文位置：**Abstract；Introduction；agentic training 概述。**阅读范围：**摘要与返回的正文相关段落已阅读；不采用泛化排名。

<a id="e14"></a>

**E14 · 专门训练可学习规划与执行行为：**DeepAnalyze 探索课程式 Agent 训练与数据交互轨迹合成，覆盖从处理到报告的工作。

**条件：**作者模型与实验路线介绍；此处不作跨系统数值排名。 **边界：**训练行为不能自动补足企业未提供的定义；与本体可组合。

路线背景；关联 [C0](#overview)。

<a id="s14"></a>

### S14 · [Spider 2.0: Evaluating Language Models on Real-World Enterprise Text-to-SQL Workflows ↗](https://arxiv.org/abs/2411.07763)

Fangyu Lei 等｜初稿 2024-11-12；ICLR 2025；arXiv v2 2025-03-17｜会议论文／基准。

**原文位置：**Abstract；§1 的企业环境与工作流定义。**阅读范围：**任务定义相关正文已阅读；不使用动态榜单排名。

<a id="e15"></a>

**E15 · 企业任务超出单条 SQL 生成：**Spider 2.0 将大型 schema、方言文档、项目环境与多步工作流纳入评测。

**条件：**ICLR 2025 任务定义；不引用当前动态子榜成绩。 **边界：**支持系统级问题定位，不单独证明本体优越性。

问题与评估背景；关联 [C0](#overview)。

<a id="s16"></a>

### S16 · [DS-Agent: Automated Data Science by Empowering Large Language Models with Case-Based Reasoning ↗](https://proceedings.mlr.press/v235/guo24b.html)

Siyuan Guo 等｜ICML 2024｜会议论文／经验复用路线背景。

**原文位置：**作者摘要中的案例推理与迭代反馈。**阅读范围：**作者摘要已阅读；只支持机制定位。

<a id="e17"></a>

**E17 · 复用经验是另一条分析自动化路线：**DS-Agent 将案例推理与迭代反馈结合，用已有方案支持建模。

**条件：**ICML 2024 作者摘要；机制背景。 **边界：**经验复用不等于跨源概念建模，二者可以互补。

路线背景；关联 [C0](#overview)。

<a id="limitations"></a>

## 调研范围与局限

本报告围绕 Data Agent 与本体的技术关系，检索覆盖 ontology-grounded data agents、ontology learning、ontology-based data access、企业语义层、长流程分析及方法验证。使用论文、官方文档与标准原文；未声称穷尽所有工作。正式近期窗口为 2025-11-13 至 2026-11-13，基础工作单列保留。OGDA 与 EvoOntology 为近期预印本，未找到本轮可核实的独立复现，不把其单基准消融外推为统一行业结论。EvoOntology 使用 v2 的具体消融表；摘要与正文对实验骨干数量描述不同，此处只采用标明四骨干平均的 Table 5、7，不以其他数量做结论。LongDS 本轮只核对作者摘要，BURR 只采用作者摘要，不采用其页面自动生成摘要。企业文档支持架构和功能选择，不能代替独立收益与成熟度评估。未实施用户数据实验，因此 C5 与实验方案是待验证建议。

**推荐阅读：**先读 [Ontop 概念与映射 ↗](https://ontop-vkg.org/guide/concepts.html)、[OGDA · 2026-11-09 ↗](https://arxiv.org/html/2611.12114) 与 [EvoOntology · v2 2026-11-02 ↗](https://arxiv.org/html/2609.15779v2)，再看 [W3C OWL 2 ↗](https://www.w3.org/TR/owl2-primer/)、[Silent Failures · 2026-10-09 ↗](https://arxiv.org/html/2610.14115) 的职责及可靠性边界。
