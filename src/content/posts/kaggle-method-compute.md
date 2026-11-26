---
title: "计算预算也是建模变量：从试运行到真正出分"
description: "能装进显存、能跑完训练、能生成全部预测、能被官方评分，是四道不同的门。把成本和证据沿整条链路记录。"
date: "2026-11-26"
category: "Kaggle"
tags: ["通用方法", "远程实验", "计算预算"]
cover: "terminal"
sample: false
draft: false
featured: false
kaggle: {"kind": "method", "source": "https://leebin-try.github.io/kaggle/sources/#protocol", "evidenceDate": "2026-11-25", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md"}
coverImage: "/kaggle/compute/cover.svg"
coverAlt: "两张独立 GPU 与加载、训练、重训、预测和校验的关键路径"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

一个模型能加载，并不意味着它值得训练；训练完成，也不意味着它能在剩余时间里生成全部预测。预算不是实验表格最后一列，它会改变能够验证的假设。

这组项目留下的共同判断是：**把预算准入放在完整链路上，才可能把局部成功变成可评分的结果。**

## 三种预算：容量、执行时间、有效比较

容量预算问每张卡是否能放下权重、激活和临时状态；时间预算问完整工作流能否结束；有效比较预算问在这些资源里能够完成多少次有信息量的实验。三者都叫成本，但不能相互替代。

27B 的量化与参数拆分改善容量，批次调优改善吞吐，但没有把一轮外部数据训练变成几分钟。反过来，小模型也可能因为高分辨率、海量测试或昂贵特征工程耗尽时间。用参数量推断全部成本，常常会漏掉真正的瓶颈。

还需要分清主程序计时、用户等待时间与计费时间。排队、下载和官方重放可以在程序计时之外，实际 GPU 分配也可能包含空闲阶段；没有对应平台回执，就不要把一个内部秒数直接换成精确账单或预算消耗。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/compute/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · 计算预算也是建模变量"><img src="/kaggle/compute/method.svg" alt="原创流程与验证边界示意。两张独立 GPU 与加载、训练、重训、预测和校验的关键路径；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · 计算预算也是建模变量</strong> 原创流程与验证边界示意。两张独立 GPU 与加载、训练、重训、预测和校验的关键路径；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/compute/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-compute-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 先定义成本单位，再外推

[Name That LLM](/posts/kaggle-02-name-that-llm/) 的 27B 路径通过了小规模机制验证，但一轮外部数据训练仍外推到约 17—19 小时。节省显存解决了容量问题，没有消除吞吐问题。

[Carvana](/posts/kaggle-17-carvana/) 则提醒我们：测试图像远多于训练图像时，推断、原生尺寸转换与编码可能比训练更值得先测。不能只用几十个短样本的前向时间，乘一个测试行数就宣布整个工作流能完成。

一个更完整的估时，应区分加载、数据处理、模型选择、验证、检查点、全量重训、预测、文件生成与评分重放。并行阶段取关键路径，独立串行阶段再相加，保留真实的启动与 I/O 开销。

## 用依赖图计算关键路径，而不是把所有秒数相加

两个独立种子并行完成时，该阶段墙钟近似较慢 worker 的时间，而不是二者之和。接下来串行的校准、audit 和合并却必须继续相加。不同阶段还会争用 CPU、磁盘和输入解码，双卡不一定带来两倍速度。

```text
选择阶段：max(seed_0, seed_1)
    + 校准与冻结 audit
    + 重训阶段：max(refit_0, refit_1)
    + 预测阶段：max(shard_0, shard_1)
    + 合并、校验、输出
```

这只是依赖结构，不是一个可凭空填数字的估时表。代表性预检要覆盖真实输入长度／图像尺寸、实际模型分支数、TTA、检查点读取与最终编码。若预检只选中单模型，而正式允许两个模型混合，就要显式覆盖新增分支，安全系数不能替代工作量的缺失。

并行收益也要用相同输入和相同输出语义比较。增加了额外模型或改变了精度，即使单个算子变快，都不再是同工作量下的完整加速比。

## 两张 GPU，至少有两种完全不同的含义

CIFAR-10、GI、CMI 等项目使用独立种子或折的任务并行；偏好预测把同一个模型分成两段跨卡推断。前者增加独立比较的吞吐，后者解决模型容量与管线执行问题，不能混称为分布式训练。

每张卡的内存预算也要独立计算。把两张 15 GB 卡叫作一个 30 GB 池，会忽略激活、临时张量、框架预留与设备间复制。请求的硬件类型，还必须与实际设备日志对照。

## 更多计算带来质量收益，不等于加速收益

[OTTO](/posts/kaggle-06-otto/) 的 GPU 新管线得分提高，整体却从约 25 分钟到 39 分钟，因为做了更多工作。它支持质量改进，不能提供同工作量下的加速比。局部算子的倍数也不能直接替代完整流水线测量。

反过来，Store Sales 的快速 ridge 更弱，也不因它快就自动成为更好的模型。公平比较应保持任务、精度、数据覆盖和评价口径一致，再讨论收益与成本的交换。

## 把失败当作接口测试，而不是只当作障碍


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · 计算预算也是建模变量"><img src="/kaggle/17/pilot-timing.svg" alt="远程预检报告的同一批 512 图像墙钟时间，约 95.04／60.06 秒，含启动；仅一个正权重模型。本地产物校验尚未完成，不是正式评分。" width="720" height="324" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · 计算预算也是建模变量</strong> 远程预检报告的同一批 512 图像墙钟时间，约 95.04／60.06 秒，含启动；仅一个正权重模型。本地产物校验尚未完成，不是正式评分。<br /><a href="/kaggle/17/pilot-timing.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/17/pilot-timing.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-17-pilot-timing">图表出处与口径</a></figcaption>
</figure>


超时、OOM、字段过长、输入缺失和网络中断分别来自不同边界。减小批次可能缓解容量，却不一定改善时间；增大 CSV 字段上限只修复解析能力，并不验证该 RLE 是否有序、完整或描述了正确掩码。

恢复流程应先读取已接受的版本和提交意图。日志取不到不应自动重跑训练，提交响应丢失也不应自动再提交。只有分清观察失败与写操作失败，才有机会既继续工作，又避免重复消耗。

同样，完整 checkpoint 重载的一致性、每个分片的 ID 覆盖、输出行顺序和数值范围，都是交付的一部分。它们不提高理论模型分数，却决定当前分数是否真来自声明的模型和输入。好的工程复盘应该展示这些接口以及失败如何被识别，而不只是晒一个“运行成功”的截图。

## 运行状态应该是一条证据链

| 状态 | 可以确认什么 | 还不能确认什么 |
| --- | --- | --- |
| 上传已接受 | 远程存在这个版本 | 已启动、设备正确 |
| 实际执行并完成 | 进程走完，日志可检查 | 输出覆盖完整、质量有效 |
| 产物校验通过 | ID、数值、检查点与文件一致 | 官方隐藏输入一定接受 |
| 官方 COMPLETE 并有分数 | 此次提交已被评分 | 因果贡献、历史排名或普遍领先 |

[Titanic](/posts/kaggle-01-titanic/) 曾在本地 DNS 中断后恢复读取同一远程版本，没有因日志暂时不可读而重开训练或重复提交。网络观察失败与任务执行失败应分开处理；一份明确的提交意图和回执，能避免重试造成额外评分请求。

## 观点：可复现意味着保留选择过程

不变的源代码快照、实际设备、原始曲线、完整预测校验与官方回执，共同帮助回答“这个分数来自哪个版本”。本地包的第几个修订与 Kaggle 的第几个版本不是同一个编号，模型检查点数量也不是算法种类数量。

下一次实验值得先写出准入门槛：需要多少真实样本测时，预留哪些串行阶段，失败时保留什么，哪一次写操作绝不盲目重试。然后根据测量明确修改计划，而不是在后台悄悄削减轮次，再把跑完当成训练充分。

## 资料与证据

- [远程 GPU、预算与版本标准](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md)
- [OTTO 完整时间对照](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/06_otto_recommender_system/docs/gpu-results.md)
- [27B 测时及淘汰决定](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/02_name_that_llm/docs/overnight-t4-results.md)

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#protocol)列出了本文的结果口径、记录日期与可核对范围。
