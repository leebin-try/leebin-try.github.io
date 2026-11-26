---
title: "把一个分数拆开：排序、概率、阈值与训练曲线分别说明什么"
description: "AUC、log loss、MCC、QWK、Dice 和 MCRMSE 衡量不同对象。指标的名字，应该决定我们怎样解释提升与停止。"
date: "2026-11-26"
category: "Kaggle"
tags: ["通用方法", "评价指标", "学习曲线"]
cover: "terminal"
sample: false
draft: false
featured: false
kaggle: {"kind": "method", "source": "https://leebin-try.github.io/kaggle/sources/#protocol", "evidenceDate": "2026-11-25", "recordSource": "https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md"}
coverImage: "/kaggle/metrics/cover.svg"
coverAlt: "排序、概率与硬决策三种评价对象示意"
coverCaption: "原创赛题／方法插图，依据本文协议绘制；不是官方标志、比赛样本或模型预测。"
---

0.9999 的 AUC、0.82657 的 log loss、0.59760 的 MCRMSE，看起来大小差很多，却没有一条共同刻度能把这些模型排成强弱。它们甚至有不同优化方向。

我更愿意先问：**这个分数在评价排序、概率、硬决策，还是几何误差？** 答案会影响阈值、校准、检查点选择，以及我们能向读者说什么。

## 先识别指标在度量哪一种对象

分类 accuracy 只依赖最终标签，log loss 依赖完整概率，AUC 依赖排序，MCC／QWK 依赖阈值后的混淆结构，Dice 还依赖空间几何。指标方向相同不等于含义相同，数值范围都在零与一之间也不意味着可横向比较。

还应区分微观聚合和分组聚合。按所有样本汇总后计算，与先对每个类别、题目、器官计算再平均，可能给大组和小组完全不同的权重。一个指标名字没有交代聚合顺序，就还不足以让读者复算它。

模型能力的讨论必须落在这个对象上：提高排序不必提高固定阈值决策，提高平均器官重叠不必改善三维边界，降低整体回归误差也可能使稀有序数类别更难被分出。


<figure class="research-figure" data-figure-kind="original_method_diagram">
<a href="/kaggle/metrics/method.svg" target="_blank" rel="noopener" aria-label="放大：方法图 · 把一个分数拆开"><img src="/kaggle/metrics/method.svg" alt="原创流程与验证边界示意。排序、概率与硬决策三种评价对象示意；箭头说明协议依赖，不代表每个阶段都已经完成。" width="1200" height="675" loading="lazy" decoding="async" /></a>
<figcaption><strong>方法图 · 把一个分数拆开</strong> 原创流程与验证边界示意。排序、概率与硬决策三种评价对象示意；箭头说明协议依赖，不代表每个阶段都已经完成。<br /><a href="/kaggle/metrics/method.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/sources/#fig-metrics-original_method_diagram">图表出处与口径</a></figcaption>
</figure>

## 排序正确，概率仍可能不够好

[Aerial Cactus](/posts/kaggle-14-aerial-cactus/) 的停止 AUC 已到 1.0，BCE 还继续降低。只要正负排序不变，模型可以从不太确定变得更确定，AUC 却不变。因此，AUC 平台不能直接解释为概率损失平台。

log loss 会惩罚对错误答案的过高置信度。[LLM 偏好预测](/posts/kaggle-09-llm-preference/) 输出三类概率，列顺序、归一化、融合温度都影响最终含义。把最大的概率转成标签后再只看 accuracy，会丢掉比赛正在考查的一部分能力。

## 一个合成演算：为什么不能平均折 RMSE

假设两折分别有 90 和 10 个样本，RMSE 为 1 和 3。这只是算例，不是任何比赛结果。直接平均折分数得到 2；把全部残差按正确样本权重合并，整体 RMSE 却是 `sqrt((90×1² + 10×3²)/100) = sqrt(1.8)`，约 1.342。

差异来自平方、求均值与开平方的顺序。CommonLit 又多一层：每个目标先合并 OOF 残差计算 RMSE，然后再跨两个目标平均。不同题目大小不一致时，先平均题目分数会改变被评价的总体。

```python
per_target = sqrt(mean((all_oof_targets - all_oof_predictions) ** 2, axis=0))
mcrmse = mean(per_target)
```

类似地，推荐的候选上限需要套用官方每会话截断，分割的空白项要使用明确约定，序数分歧的权重和期望分布也不能省略。指标实现应有小的手工可计算例子，用来检验聚合含义，而非仅与另一个库名字相同就接受。

## 连续模型，未必用连续指标交付

[CMI](/posts/kaggle-15-cmi/) 用回归输出连续数值，却要通过有序阈值得到四类，再计算 QWK；[毒蘑菇](/posts/kaggle-12-mushrooms/) 的 MCC 也依赖硬标签。停止 RMSE 或 log loss 的最优点，不必然等于阈值后比赛指标的最优点。

阈值应该在声明过的开发预测上选择，并与最后的独立检查隔开。它是模型的一部分，不是得到官方成绩之后可以随意修改的装饰。

## 平均分会隐藏少数类或第二个目标

CMI 的 audit 中，最高严重度七个人全没判对，总体 QWK 仍不为零。[CommonLit](/posts/kaggle-16-commonlit/) 的措辞误差高于内容误差，但两个目标平均后，弱点变得不那么显眼。

这类复盘至少应该带上支持数、混淆矩阵或分目标指标。某一类缺席时，结果是“无法估计”，不是召回率为零；某一类只有几个样本时，也不能把很小的差异当成稳定能力。

## 几何问题还多一层：度量对象是否一致

图像掩码重叠、器官三维边界与图片分类准确率不同。GI 的内部原生像素 Dice 不能直接冒充官方 Dice3DHausdorff。缩放、阈值与 RLE 编码顺序也会决定最终被度量的几何对象。

[Carvana](/posts/kaggle-17-carvana/) 的静态标签核对，提示我们应该先确认序列化语义。一个数值范围合法的字符串，并不代表它描述了正确方向的掩码。

## 训练曲线应怎样转成一项决定


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/14/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 1 · 把一个分数拆开"><img src="/kaggle/14/learning.svg" alt="小 CNN 的 37 轮真实记录：左侧为对数 BCE 轴，右侧为停止 AUC；虚线是第 27 轮所选检查点，不是 BCE 最小点。" width="792" height="317" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 1 · 把一个分数拆开</strong> 小 CNN 的 37 轮真实记录：左侧为对数 BCE 轴，右侧为停止 AUC；虚线是第 27 轮所选检查点，不是 BCE 最小点。<br /><a href="/kaggle/14/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/14/learning.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-14-learning">图表出处与口径</a></figcaption>
</figure>


<figure class="research-figure" data-figure-kind="recorded_aggregate_metrics">
<a href="/kaggle/16/learning.svg" target="_blank" rel="noopener" aria-label="放大：实测图 2 · 把一个分数拆开"><img src="/kaggle/16/learning.svg" alt="v3 两个题目折的真实训练／验证及分目标曲线。fold 0 最佳在第 1 轮，fold 1 到六轮上限后仍未完成停止耐心。" width="792" height="504" loading="lazy" decoding="async" /></a>
<figcaption><strong>实测图 2 · 把一个分数拆开</strong> v3 两个题目折的真实训练／验证及分目标曲线。fold 0 最佳在第 1 轮，fold 1 到六轮上限后仍未完成停止耐心。<br /><a href="/kaggle/16/learning.svg" target="_blank" rel="noopener">放大原图</a> · <a href="/kaggle/16/learning.csv" download>下载聚合指标 CSV</a> · <a href="/kaggle/sources/#fig-16-learning">图表出处与口径</a></figcaption>
</figure>


一条可解释的曲线需要说明横轴是批次、处理样本、优化器更新还是 epoch；混合精度跳过更新时，这些计数并不相同。纵轴则要说明增强、标签平滑、训练中模型持续更新与验证评估模式之间的差异。

本次新补的图把真实日志采样点直接绘出，不平滑，也不补未观测验证值。Severstal 不是每轮验证，GI 只有三轮，CMI 的固定阈值 QWK 不是最终校准后的 QWK。只有把这些口径放在图旁边，图才比一句“模型过拟合”提供更多信息。

决定也应提前声明：哪条指标负责停止、最低改善多少、耐心多长、全量重训如何继承轮次。达到一个时间上限只说明运行边界，不能证明最优点已经被找到。真正的下一步，是针对曲线里具体矛盾提出新的对照，而不是在事后从多条曲线里挑出最漂亮的一条。

## 怎样读训练曲线才不越界

训练损失是在带增强、不断更新的模型上测得；验证损失通常在固定的评估状态上测得，二者不一定是同一种测量。MixUp、标签平滑和分辨率变化还会进一步改变上下文。

最佳轮次落在上限，或 patience 尚未完整观察，都应保留“收敛未解决”。全量重训没有独立验证，不能根据它的训练曲线补造一条验证轨迹。混合精度处理过多少批次，也不等于成功更新了多少次参数；跳过的更新要单列。

最后，把分数、曲线与决定放在一起记录：哪一条指标用来停，哪一条用来选，哪一条来自官方。这样才能解释为什么某次更低的损失没有带来更好的决策，而不必用“过拟合”三个字包办所有原因。

## 资料与证据

- [训练日志、曲线与充分性标准](https://github.com/leebin-try/kaggle_try/blob/b3ddf87ddb3383e77ea7055702ff08b2c137f548/PROJECT_STANDARD.md#learning-curves-and-training-sufficiency)
- 各案例的原始曲线口径与分数出处见对应复盘中的资料链接。

原始代码与实验记录位于私有仓库；[公开证据摘要](https://leebin-try.github.io/kaggle/sources/#protocol)列出了本文的结果口径、记录日期与可核对范围。
